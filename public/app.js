/* ============================================================================
   DRISTI 2.0 domain-model viewer - DYNAMIC.
   Nothing legal is hardcoded. On load it fetches:
     • the relevance profile   (…/cheque-dishonour-s138.profile.json)
     • each Act's Akoma Ntoso   (…/<file>.akn.xml)  - lazily, on demand
   and builds the whole UI from them. Editing those files updates the app.
   Requires being served over http(s) (fetch is blocked on file://).
   ============================================================================ */

/* ---- resolve where the corpus lives (overridable via ?base= / ?profile=) ---- */
const qs = new URLSearchParams(location.search);
const PROFILE_NAME = qs.get('profile') || 'profiles/cheque-dishonour-s138.profile.json';
const BASE_CANDIDATES = qs.get('base') ? [qs.get('base')] : ['data/','','../data/'];
let DATA_BASE = null;

/* ---- icon set + editorial data: loaded from data/config/app.config.json ---- */
let ICONS = {};
function ic(name){return `<svg class="lu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||""}</svg>`;}

let CASE_TYPES = [];
let activeCase = "active";
let overviewOpen = false;
let currentView = "overview";
let processLens = "prescribed";   // which lens the story "process" is viewed through
let vocabScrollTo = null;         // a vocab word to scroll to when the Vocabulary view next renders
let practiceScrollTo = null;      // a field-note id to scroll to when the Local practice view next renders
let reqScrollTo = null;           // a requirement id to land on when the Requirements view next renders
let stdScrollTo = null;           // a standard id to land on when the Standards view next renders
let aipScrollTo = null;           // an AI-policy compliance id to land on when that sub-tab renders
let _extra = {};                  // deep-link query params for the current position (sec/term/note/act/eid)
let pendingAnchor = null;         // a DOM id to scroll to after the next view renders (from a deep link)
let _lastHash = null;             // the hash we last wrote, so our own writes don't re-trigger the router
const OV_SUBVIEWS = ["structure","split","time"];

let JURISDICTIONS = [];
let activeState = "kerala";
const stateById = id => JURISDICTIONS.find(s=>s.id===id) || JURISDICTIONS[0];

let PRACTICE_NOTES = [];
const caseById = id => CASE_TYPES.find(c=>c.id===id);

let DOMAIN_LABELS = {};
let DOMAIN_ORDER = [];
let TIER_ORDER = [];
let STATE_CATEGORIES = [];
let STATES = [];
let SYSTEMS = [];

async function loadConfig(){
  let txt=null, err=null;
  for(const b of BASE_CANDIDATES){
    try{ txt=await fetchText(b+'config/app.config.json'); DATA_BASE=b; break; }catch(e){ err=e; }
  }
  if(txt==null) throw err||new Error("app config not found");
  const cfg=JSON.parse(txt);
  ICONS=cfg.icons||{};
  CASE_TYPES=cfg.case_types||[];
  JURISDICTIONS=cfg.jurisdictions||[];
  PRACTICE_NOTES=cfg.practice_notes||[];
  DOMAIN_LABELS=cfg.domain_labels||{};
  DOMAIN_ORDER=Object.keys(DOMAIN_LABELS);
  TIER_ORDER=cfg.tier_order||[];
  STATE_CATEGORIES=cfg.state_categories||[];
  STATES=cfg.rollout_states||[];
  SYSTEMS=cfg.systems||[];
}

/* ---- data built from the profile at runtime -------------------------------- */
let PROFILE=null, SOURCES={}, DOMAINS={}, PROVISIONS=[], TERMS={}, EDGES=[], ALIAS_MAP=[], NATIONAL_PROCESS=null, NATIONAL_INSTITUTIONS=null;
let CASES=[], CASE_TOPICS={}, CASES_BY_REF={};   // Supreme Court case law + reverse index (provRef -> [caseId])
const caseById2 = id => CASES.find(c=>c.id===id);
const docCache = {};   // actId -> parsed XML Document

/* ============================================================ HELPERS */
const $=(s,el=document)=>el.querySelector(s);
const el=(t,c,h)=>{const e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e;};
const esc=s=>(s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const ROMAN=[[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
const toRoman=n=>{let r="";for(const [v,s] of ROMAN){while(n>=v){r+=s;n-=v;}}return r;};
const secNum=ref=>{
  const e=ref.split(":")[1]||"";
  const m=e.match(/^ord_(\d+)_r_(\w+)$/);           // CPC First Schedule: ord_6_r_1 -> Order VI r.1
  if(m) return "Order "+toRoman(+m[1])+" r."+m[2];
  return e.replace("sec_","§").replace("art_","Art. ").replace(/_/g," ");
};
const actOf=ref=>SOURCES[ref.split(":")[0]];
const eraOf=a=>a==="always"?"always":(a.indexOf("pre")===0?"pre":"post");
function eraFromStatus(s){ s=s||""; if(/from\s*2024/i.test(s))return"post"; if(/repealed/i.test(s))return"pre"; return"always"; }
function eraBadge(a){const e=eraOf(a);return e==="always"?`<span class="badge b-always">any time</span>`:e==="pre"?`<span class="badge b-pre">pre-2024 code</span>`:`<span class="badge b-post">2023 Sanhita</span>`;}
const scopeBadge=()=>`<span class="badge b-shared">national</span>`;
function refLabel(ref){const a=SOURCES[ref.split(":")[0]];return `${secNum(ref)} · ${a?a.title.split(",")[0]:ref.split(":")[0]}`;}

/* ---- fetch + parse ---- */
async function fetchText(url){ const r=await fetch(url,{cache:"no-cache"}); if(!r.ok) throw new Error(r.status+" "+url); return r.text(); }
async function loadProfile(){
  let txt=null, err=null;
  for(const b of BASE_CANDIDATES){
    try{ txt=await fetchText(b+PROFILE_NAME); DATA_BASE=b; break; }catch(e){ err=e; }
  }
  if(txt==null) throw err||new Error("profile not found");
  const p=JSON.parse(txt); PROFILE=p;
  SOURCES={}; DOMAINS={};
  for(const [id,s] of Object.entries(p.sources)){
    SOURCES[id]={...s, era:eraFromStatus(s.status), casescoped:s.domain==="substantive"};
  }
  // domains present, in preferred order then any extras
  const present=new Set(Object.values(SOURCES).map(s=>s.domain));
  const ordered=[...DOMAIN_ORDER.filter(d=>present.has(d)), ...[...present].filter(d=>!DOMAIN_ORDER.includes(d))];
  ordered.forEach(d=>{ DOMAINS[d]=DOMAIN_LABELS[d]||{label:d.charAt(0).toUpperCase()+d.slice(1),blurb:""}; });
  PROVISIONS=p.provisions.map(x=>({ref:x.ref, act:x.act, eId:x.eId, tier:x.tier, role:x.role, applies:x.applies, note:x.note||""}));
  TERMS=p.terms||{};
  NATIONAL_PROCESS=p.national_process||null;   // prescribed central-law process, shared by every state's story
  NATIONAL_INSTITUTIONS=p.national_institutions||null;   // police + courts baseline, shared by every state
  EDGES=p.edges||[];
  ALIAS_MAP=(p.act_alias_map||[]).map(a=>({topic:a.topic, before:a.before, after:a.on_or_after, note:a.note}));
  const note=$("#src-note"); if(note) note.textContent=`profile: ${p.profile} · as of ${p.as_of||''} · maintained by ${p.maintained_by||'PUCAR'}`;
  await loadCaselaw(p);
}
async function loadCaselaw(p){
  CASES=[]; CASE_TOPICS={}; CASES_BY_REF={};
  if(!p.caselaw) return;
  try{
    const cl=JSON.parse(await fetchText(DATA_BASE+p.caselaw));
    CASE_TOPICS=cl.topics||{};
    CASES=(cl.cases||[]).slice();
    CASES.forEach(c=>{ (c.construes||[]).forEach(ref=>{ (CASES_BY_REF[ref]=CASES_BY_REF[ref]||[]).push(c.id); }); });
  }catch(e){ /* case law optional */ }
}
/* per-state layers (state amendments / rules / notifications / vocabulary / story).
   Every jurisdiction's file is fetched once at boot, in parallel, so a page can
   filter across states instead of switching the whole app. A state with no file
   yet simply has no entry. STATE_DATA stays a pointer to the active state's layer,
   so every single-state view keeps reading it exactly as before. */
let STATES_DATA={};
let STATE_DATA=null;
let _aliasCache={};
const stateLayer = id => STATES_DATA[id] || null;
const stateVocabTerms = id => ((stateLayer(id)||{}).vocabulary||{}).terms || [];
async function loadAllStates(){
  const ids=(JURISDICTIONS||[]).map(s=>s.id);
  const loaded=await Promise.all(ids.map(id=>
    fetchText((DATA_BASE||"")+"state/"+id+".json").then(t=>JSON.parse(t)).catch(()=>null)));
  STATES_DATA={}; ids.forEach((id,i)=>{ if(loaded[i]) STATES_DATA[id]=loaded[i]; });
  _aliasCache={};
  STATE_DATA=STATES_DATA[activeState]||null;
}
/* the normative layer: one file of requirements for the centre and one per state.
   Fetched once at boot, in parallel with the state layers, and tagged with the scope
   the requirement came from - a state cite carries an alias that only resolves against
   its own state's instruments, so the scope has to travel with the requirement. A file
   that is missing is simply a scope that is not there. */
let REQS=[];
async function loadRequirements(){
  const scopes=["national", ...(JURISDICTIONS||[]).map(s=>s.id)];
  const loaded=await Promise.all(scopes.map(id=>
    fetchText((DATA_BASE||"")+"requirements/"+id+".json").then(t=>JSON.parse(t)).catch(()=>null)));
  REQS=[];
  scopes.forEach((id,i)=>{
    const d=loaded[i]; if(!d) return;
    (d.requirements||[]).forEach(r=>{ r.scope=id; REQS.push(r); });
  });
}
const reqById = id => REQS.find(r=>r.id===id);

/* the standards layer: the non-legal obligations a build is measured against. Unlike
   the requirements these are not derived from any Act, so they are neither case-typed
   nor state-scoped - one file, written as markdown because the thing being said is
   prose and a person outside the team has to be able to edit it without touching a
   schema. The file states its own shape in a comment at the top; the parser below is
   the only thing that reads it, and it reads exactly that shape:
     > lede · ## group (+ gloss) · ### standard (+ gloss) · **How to test.** ·
     **Pass when.** · **Note.**
   Adding a group or a standard is an edit to the markdown, never a change here. */
let STANDARDS={lede:[], groups:[]};
const STD_FILE="standards/standards-adherence.md";
/* The label map is the only thing that differs between the two prose files this parser
   reads - the standards, and the AI policy compliances that hang off the same page - so
   it is a parameter rather than a second parser. A label the map does not know stays in
   the gloss, which is the honest failure: an editor's typo shows up as prose, not as a
   silently dropped field. */
const STD_LABELS={"spec":"spec","anchor":"anchor","how to test":"test","pass when":"pass",
                  "check":"check","note":"note"};
function parseLabelledMd(md, LABEL){
  const out={lede:[], groups:[]};
  const lede=[[]];   // the lede keeps its paragraphs: a bare ">" line starts a new one
  let g=null, s=null;
  // the shape comment, and any other HTML comment, is authoring instruction and not content
  const lines=String(md||"").replace(/<!--[\s\S]*?-->/g,"").split(/\r?\n/);
  // a labelled paragraph: "**How to test.** …" - the label decides the field it fills
  const flush=(buf,target)=>{
    const txt=buf.join(" ").replace(/\s+/g," ").trim(); buf.length=0;
    if(!txt||!target) return;
    const m=txt.match(/^\*\*([^*]+?)[.:]?\*\*\s*(.*)$/);
    if(m && LABEL[m[1].trim().toLowerCase()]){ target[LABEL[m[1].trim().toLowerCase()]]=m[2].trim(); return; }
    target.gloss = target.gloss ? target.gloss+" "+txt : txt;
  };
  const buf=[];
  const target=()=> s || g || null;
  lines.forEach(raw=>{
    const line=raw.trim();
    if(!line){ flush(buf,target()); return; }
    if(/^>/.test(line)){ const t=line.replace(/^>\s?/,"").trim();
      if(t) lede[lede.length-1].push(t); else if(lede[lede.length-1].length) lede.push([]);
      return; }
    if(/^#\s/.test(line)) return;                       // the file's own H1; the view titles itself
    if(/^##\s/.test(line)){ flush(buf,target()); s=null;
      g={name:line.replace(/^##\s*/,"").trim(), gloss:"", items:[]}; out.groups.push(g); return; }
    if(/^###\s/.test(line)){ flush(buf,target());
      if(!g){ g={name:"", gloss:"", items:[]}; out.groups.push(g); }
      s={name:line.replace(/^###\s*/,"").trim(), gloss:"", group:g.name};
      Object.values(LABEL).forEach(k=>{ s[k]=""; });
      s.id=stdSlug(s.name); g.items.push(s); return; }
    buf.push(line);
  });
  flush(buf,target());
  out.lede=lede.filter(p=>p.length).map(p=>p.join(" "));
  return out;
}
/* The one piece of markdown a card renders: [text](url). Everything is escaped first,
   so the only markup that survives is the anchor this builds, and only for an http(s)
   target - the file is ours, but a citation layer that can be made to emit anything is
   not one worth having. */
const stdInline = txt => esc(String(txt||"")).replace(
  /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
  (m,label,url)=>`<a class="std-link" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`)
  // and emphasis, which the compliance lede needs to say which half of a card is whose
  .replace(/\*\*([^*]+)\*\*/g,(m,t)=>`<strong>${t}</strong>`);
/* "Anchor" is the standard's footing in law that this corpus already holds - the RPwD
   accessibility sections, s.70B for CERT-In, Article 348 for the language of a High
   Court. Written as the corpus's own `<alias>:<eId>` ref, so it opens the provision
   through the same route every other citation in the app uses. */
const stdAnchors = raw => String(raw||"").split("·").map(x=>x.trim()).filter(Boolean).map(ref=>{
  const src=SOURCES[ref.split(":")[0]];
  if(!src) return `<span class="rq-plain">${esc(ref)}</span>`;
  return `<a class="cite" data-nat="${esc(ref)}">${esc(secNum(ref))} <span class="std-anc-act">`
    +`${esc(src.title.split(",")[0])}</span></a>`;
}).join("");
/* a list, one hosted checker per line: what it is, and what it wants from you */
const stdChecks = raw => String(raw||"").split(" · ").map(x=>x.trim()).filter(Boolean)
  .map(x=>`<li>${stdInline(x)}</li>`).join("");

const stdSlug = n => String(n||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);
const stdItems = () => STANDARDS.groups.reduce((a,g)=>a.concat(g.items),[]);
async function loadStandards(){
  try{ STANDARDS=parseLabelledMd(await fetchText((DATA_BASE||"")+STD_FILE), STD_LABELS); }
  catch(e){ STANDARDS={lede:[], groups:[]}; }
}

/* ---------------------------------------------------------------- THE POLICY LAYER
   A policy is the third kind of instrument this corpus holds. An Act is Akoma Ntoso
   because it is legislation; a judgment is Akoma Ntoso because it is a judgment; a
   policy - a draft regulation circulated for comment, a court's own guidance - is
   neither, and forcing it into <act> would assert a status it does not have. So it is
   kept as markdown under data/policy/md/ with its source PDF one folder over, which is
   the same pairing acts/ and caselaw/ use, and policy.json is the manifest over it.

   Everything on the Policy page comes from that manifest: the documents, their status,
   how each one numbers itself. A second policy is a file plus an entry, never code. */
let POLICY={documents:[]};
const POLICY_FILE="policy/policy.json";
const policyDoc = id => (POLICY.documents||[]).find(d=>d.id===id) || null;
async function loadPolicy(){
  try{ POLICY=JSON.parse(await fetchText((DATA_BASE||"")+POLICY_FILE)); }
  catch(e){ POLICY={documents:[]}; }
}
/* One policy document, parsed into blocks the page renders and, more importantly, into
   anchors a citation can land on. The document numbers its own units (regulation 43)
   and its own clauses ((3), then (a)), so the anchor is derived from the markers as
   printed rather than from anything we add to the file: `reg-43-3` is regulation 43,
   clause (3), because that paragraph starts "(3)" inside "### 43.".

   The marker stack is what makes the nesting work. A marker that continues the sequence
   at an open level replaces it; a marker that opens a sequence - (1), (a), (i) - pushes
   a level. That is why (a) under (3) becomes 43-3-a and the next (4) pops back to 43-4. */
const POLICY_MD_CACHE={};
const ROMAN_SEQ=["i","ii","iii","iv","v","vi","vii","viii","ix","x","xi","xii"];
function markKind(m){ return /^\d+$/.test(m) ? "num" : "alpha"; }
const nextLetter = a => a.slice(0,-1)+String.fromCharCode(a.charCodeAt(a.length-1)+1);
function markFollows(m,prev){
  if(!prev) return false;
  if(markKind(m)!==markKind(prev)) return false;
  if(markKind(m)==="num") return +m===+prev+1;
  // letters run a..z then za, zb …; roman numerals run their own sequence
  if(m.length===prev.length+1 && m.indexOf(prev)===0) return true;              // z -> za
  if(m.length===prev.length && m.length<=2 && m===nextLetter(prev)) return true;
  // an amendment inserts (na) after (n); (o) still follows, it just does not follow (na)
  if(prev.length===2 && m.length===1 && m===nextLetter(prev.charAt(0))) return true;
  const i=ROMAN_SEQ.indexOf(m);
  return i>0 && ROMAN_SEQ[i-1]===prev;
}
function parsePolicyMd(md){
  const blocks=[]; const anchors=[];
  let unit=null, stack=[], note=[];
  const flushNote=()=>{ if(note.length){ blocks.push({t:"note", text:note.join(" ")}); note=[]; } };
  String(md||"").replace(/<!--[\s\S]*?-->/g,"").split(/\r?\n/).forEach(raw=>{
    const line=raw.trim();
    if(!line) return;
    if(/^>/.test(line)){ note.push(line.replace(/^>\s?/,"").trim()); return; }
    flushNote();
    if(/^#\s/.test(line)) return;                        // the document's own title; policy.json holds it
    if(/^##\s/.test(line)){ unit=null; stack=[];
      const label=line.replace(/^##\s*/,"").trim();
      blocks.push({t:"part", label, id:"part-"+stdSlug(label)}); return; }
    if(/^###\s/.test(line)){
      const body=line.replace(/^###\s*/,"").trim();
      const m=body.match(/^(\d+)\.\s*(.*)$/);
      unit=m?m[1]:null; stack=[];
      const id=unit?("reg-"+unit):("u-"+stdSlug(body));
      blocks.push({t:"unit", num:m?m[1]+".":"", heading:m?m[2]:body, id});
      anchors.push(id); return; }
    const mk=line.match(/^\(([0-9]{1,2}|[a-z]{1,4})\)\s*/);
    let id="", depth=0;
    if(mk && unit){
      const mark=mk[1];
      const at=stack.findIndex(x=>markFollows(mark,x));
      if(at>=0) stack=stack.slice(0,at).concat([mark]);   // continues that level
      // a numbered clause past (1) with no numbered level open means the (1) was never
      // printed - regulation 37 opens straight at (2) - so it belongs at the top of the
      // unit, not nested under whatever lettered item happened to precede it
      else if(markKind(mark)==="num" && +mark>1 && !stack.some(x=>markKind(x)==="num")) stack=[mark];
      else stack=stack.concat([mark]);                    // opens a new one
      depth=stack.length-1;
      id="reg-"+unit+"-"+stack.join("-");
      anchors.push(id);
    } else if(unit && stack.length){
      depth=stack.length-1;                               // a proviso keeps its clause's indent
    }
    blocks.push({t:"p", text:line, id, depth, mark:mk?mk[1]:""});
  });
  flushNote();
  return {blocks, anchors};
}
async function getPolicyMd(doc){
  if(!doc || !doc.md) return null;
  if(POLICY_MD_CACHE[doc.id]) return POLICY_MD_CACHE[doc.id];
  const parsed=parsePolicyMd(await fetchText((DATA_BASE||"")+doc.md));
  POLICY_MD_CACHE[doc.id]=parsed; return parsed;
}

/* the AI policy compliances - the other half of the Standards page. Same parser, same
   philosophy, different labels: what the document obliges, and separately what we say
   a system should do about it. The two halves are kept apart in the data because the
   page keeps them apart on the card, and a reader must never take our advice for the
   Court's requirement. */
let AIPOLICY={lede:[], groups:[]};
const AIPOL_FILE="standards/ai-policy-compliance.md";
const AIPOL_LABELS={"document":"document","binds":"binds","citation":"citation",
                    "timing":"timing","compliant when":"compliant","artifact":"artifact",
                    "build":"build","automate":"automate","test":"test","note":"note"};
const aipolItems = () => AIPOLICY.groups.reduce((a,g)=>a.concat(g.items.map(i=>({...i, document:i.document||g.document}))),[]);
async function loadAiPolicy(){
  try{ AIPOLICY=parseLabelledMd(await fetchText((DATA_BASE||"")+AIPOL_FILE), AIPOL_LABELS); }
  catch(e){ AIPOLICY={lede:[], groups:[]}; }
}

/* re-point STATE_DATA at the active state. Kept async, and kept as the name every
   state-selector calls, so switching state is now just a pointer move. */
async function loadStateData(){
  if(!Object.keys(STATES_DATA).length) await loadAllStates();
  STATE_DATA=STATES_DATA[activeState]||null;
}
async function getDoc(actId){
  if(docCache[actId]) return docCache[actId];
  const src=SOURCES[actId]; if(!src||!src.file) throw new Error("no file for "+actId);
  const xml=await fetchText(DATA_BASE+src.file);
  const doc=new DOMParser().parseFromString(xml,"application/xml");
  if(doc.getElementsByTagName("parsererror").length) throw new Error("XML parse error: "+src.file);
  docCache[actId]=doc; return doc;
}

/* ---- Akoma Ntoso element -> structured text ---- */
function childByLocal(node,ln){ for(const c of node.children) if(c.localName===ln) return c; return null; }
function cleanText(node){ return (node.textContent||"").replace(/\s+/g," ").trim(); }
function sectionData(sec){
  const numEl=childByLocal(sec,"num"), headEl=childByLocal(sec,"heading");
  const body=[];
  const STRUCT=["item","point","clause","subsection","paragraph","subparagraph"];
  function walk(node,depth){
    for(const c of node.children){
      const ln=c.localName;
      if(ln==="p"){ const t=cleanText(c); if(t) body.push(["p",depth,t]); }
      else if(ln==="blockList"||ln==="list"){ walk(c,depth); }
      else if(STRUCT.includes(ln)){
        const cn=childByLocal(c,"num"); const cnt=cn?cleanText(cn):"";
        const content=childByLocal(c,"content"); const target=content||c;
        let first=true;
        for(const cc of target.children){
          const l2=cc.localName;
          if(l2==="p"){ const t=cleanText(cc); if(t){ body.push(["li",depth, first?((cnt?cnt+" ":"")+t):t]); first=false; } }
          else if(l2==="blockList"||l2==="list"){ walk(cc,depth+1); }
          else if(STRUCT.includes(l2)){ walk(c,depth+1); break; }
        }
        if(first && cnt) body.push(["li",depth,cnt]);
      }
      else if(ln==="content"){ walk(c,depth); }
      else if(ln==="num"||ln==="heading"||ln==="authorialNote"){ /* skip */ }
      else { walk(c,depth); }
    }
  }
  walk(sec,0);
  return {num:numEl?cleanText(numEl):"", heading:headEl?cleanText(headEl):"", body};
}
async function sectionByRef(ref){
  const [a,eid]=ref.split(":");
  const doc=await getDoc(a);
  const node=doc.querySelector(`[eId="${eid}"]`);
  return node?sectionData(node):null;
}
function actBlocks(doc){
  const blocks=[]; const SEP=["chapter","part","title"];
  (function walk(node){
    for(const c of node.children){
      const ln=c.localName;
      if((ln==="section"||ln==="article") && c.getAttribute("eId")){
        const d=sectionData(c); blocks.push({t:"sec", unit:ln, eId:c.getAttribute("eId"), ...d});
      } else if(SEP.includes(ln)){
        const n=childByLocal(c,"num"), h=childByLocal(c,"heading");
        const num=n?cleanText(n):"", head=h?cleanText(h):"";
        const label=[num,head].filter(Boolean).join(" ");
        // Some source conversions mistook a mid-sentence "Chapter X" / "Part Y" for a heading and
        // split a section. A real chapter/part title is capitalised and does not trail in ",;"; a
        // fragment starts lowercase or is punctuation. Keep genuine headings; fold a real
        // sentence-continuation back into the section it was split from; drop punctuation-only junk.
        const fragment = head && (/^[a-z]/.test(head) || /^[;,.\s]*$/.test(head) || /[,;]\s*$/.test(head));
        if(label && !fragment){ blocks.push({t:"chap", label}); }
        else if(head && /^[a-z]/.test(head) && head.length>3 && blocks.length && blocks[blocks.length-1].t==="sec"){
          (blocks[blocks.length-1].body||[]).push(["p",0,label]);
        }
        walk(c);
      } else walk(c);
    }
  })(doc.documentElement);
  return blocks;
}

/* ---- render a flat [type,depth,text] body as nested clause lists ---- */
function liRow(txt){
  const m=txt.match(/^(\([^)]{1,6}\))\s*([\s\S]*)$/);
  if(m) return `<div class="litem"><span class="lmark">${esc(m[1])}</span><span class="ltext">${esc(m[2])}</span></div>`;
  return `<div class="litem"><span class="lmark"></span><span class="ltext">${esc(txt)}</span></div>`;
}
/* detect statutory annotations (Explanation / Proviso / Illustration / Exception)
   so they don't read like the bare enacting text */
function legNote(txt){
  let m;
  if(m=txt.match(/^(Explanations?(?:\s+[IVXLC]+)?)\s*\.?\s*[-–-]+\s*([\s\S]*)$/i)) return {label:m[1],text:m[2]};
  if(m=txt.match(/^(Illustrations?)\s*\.?\s*[-–:-]+\s*([\s\S]*)$/i)) return {label:m[1],text:m[2]};
  if(m=txt.match(/^(Exception(?:\s+\d+)?)\s*\.?\s*[-–-]+\s*([\s\S]*)$/i)) return {label:m[1],text:m[2]};
  if(/^Provided\b/i.test(txt)) return {label:"Proviso",text:txt};
  return null;
}
function noteHTML(n){ return `<div class="legnote"><span class="lnl">${esc(n.label)}</span><span class="lnt">${esc(n.text)}</span></div>`; }
function renderBody(body,pfx){
  let html=""; const stack=[];
  const openTo=n=>{ while(stack.length<n){html+='<div class="lgroup">';stack.push(1);} while(stack.length>n){html+='</div>';stack.pop();} };
  (body||[]).forEach(([t,d,txt])=>{
    const n=legNote(txt);
    if(n){ openTo(t==="p"?0:d+1); html+=noteHTML(n); }
    else if(t==="p"){ openTo(0); html+=`<p class="${pfx}-p">${esc(txt)}</p>`; }
    else { openTo(d+1); html+=liRow(txt); }
  });
  openTo(0);
  return html;
}

/* ---- statute markup (from parsed data) ---- */
function statuteMarkup(ref,d,mini){
  if(!d) return `<div class="statute"><div class="st-src">section not found in the Act file</div></div>`;
  let h=`<div class="statute${mini?' statute-mini':''}"><div class="st-src">${ic('book-open')} from ${esc(actOf(ref).title)} &middot; ${esc(actOf(ref).file)}</div>`;
  if(d.num||d.heading) h+=`<div class="st-h"><span class="st-num">${esc(d.num||'')}</span>${esc(d.heading||'')}</div>`;
  h+=renderBody(d.body,"st");
  h+=`<button class="view-full" data-ref="${esc(ref)}">${ic('maximize-2')}&nbsp; Read this section inside the whole Act</button>`;
  return h+"</div>";
}
async function fillStatute(slot,mini){
  if(slot.dataset.loaded) return; slot.dataset.loaded="1";
  const ref=slot.dataset.ref;
  slot.innerHTML=`<div class="statute"><div class="st-src"><span class="spinner" style="width:14px;height:14px;border-width:2px;margin:0"></span> loading the section from the Act…</div></div>`;
  try{ const d=await sectionByRef(ref); slot.innerHTML=statuteMarkup(ref,d,mini); }
  catch(e){ slot.innerHTML=`<div class="statute"><div class="st-src">couldn't load - the Act files load over http (see the note under the sidebar)</div></div>`; }
}

/* ============================================================ VIEWS */
const V={};

V.cases=()=>{
  const m=el("div");
  m.innerHTML=`
    <h1 class="page-title">Case types</h1>
    <p class="lede">Each case type is modelled as its own domain over the same shared legal core and state layer. Pick one to explore its model; the views at the bottom of the sidebar apply to every case type.</p>
    <div class="ctgrid" id="ctgrid"></div>
    <div class="callout teal" style="margin-top:22px"><b>Why structure it this way?</b> The substantive law changes with the case type - cheque bounce leans on the NI Act, a motor claim on the Motor Vehicles Act. But the procedure, evidence, limitation and sentencing machinery underneath is largely shared, and the state layer works the same way for all of them. Model each case type once; reuse the core.</div>`;
  const g=$("#ctgrid",m);
  CASE_TYPES.forEach(c=>{
    const active=c.status==="active";
    const card=el("div","ctcard "+(active?"active":"planned"));
    card.innerHTML=`
      <div class="cth"><h3>${c.name}</h3>${active?'<span class="badge b-active">● modelled</span>':'<span class="badge b-planned">planned</span>'}</div>
      <div class="act">${c.act}</div>
      <p>${c.blurb}</p>
      <div class="stat"><span><b>${active?Object.keys(SOURCES).length:'-'}</b> Acts</span><span><b>${active?PROVISIONS.length:'-'}</b> provisions</span><span><b>${active?Object.keys(TERMS).length:'-'}</b> words</span></div>
      ${active?'<div class="enter">Open this case type →</div>':''}`;
    if(active) card.onclick=()=>{ activeCase=c.id; buildNav(); go("law"); };
    g.appendChild(card);
  });
  return m;
};

function scopeBar(){
  const c=caseById(activeCase);
  const b=el("div","scopebar");
  const opts=JURISDICTIONS.map(s=>`<option value="${s.id}"${s.id===activeState?' selected':''}>${esc(s.name)}</option>`).join("");
  b.innerHTML=`<span class="lab">Case type</span> <span class="ct">${c.name}</span> <span class="tiny">${c.act}</span>`
    +`<span class="sb-state" title="Switch state">${ic('map-pin')}<span class="sb-state-name">${esc(stateById(activeState).name)}</span><span class="sb-state-chev">${ic('chevron-down')}</span>`
    +`<select class="sb-state-sel" aria-label="Switch state">${opts}</select></span>`;
  const sel=b.querySelector(".sb-state-sel");
  if(sel) sel.onchange=e=>{ activeState=e.target.value; loadStateData().then(()=>{ buildNav(); go(currentView); }); };
  return b;
}
const isModelled=()=>caseById(activeCase).status==="active";
function notModelled(){
  const c=caseById(activeCase); const m=el("div"); m.appendChild(scopeBar());
  m.appendChild(el("div","empty",`<b>${c.name}</b> isn't modelled yet.<br><span class="tiny">This case type is planned. Its domain model will be built over the same national core.</span><br><br><a class="backlink" onclick="go('cases')">← back to case types</a>`));
  return m;
}

V.overview=()=>{
  if(!isModelled()) return notModelled();
  const c=caseById(activeCase); const m=el("div"); m.appendChild(scopeBar());
  const head=el("div");
  head.innerHTML=`
    <h1 class="page-title">${c.name} - the domain, one screen at a time</h1>
    <p class="lede">Everything here sits under one case type, ${c.act}: the Acts, vocabulary, procedure and evidence this case is built on, read from the corpus.</p>
    <div class="lenses">
      <div class="lens what"><div class="k">Lens 1 · What</div><h3>The rules</h3><p>The offence, the presumptions, procedure, evidence, limitation, sentencing - ${PROVISIONS.length} provisions across ${Object.keys(SOURCES).length} Acts, each with its verbatim text.</p></div>
      <div class="lens where"><div class="k">Lens 2 · Where</div><h3>National vs state</h3><p>The central law is the same everywhere in India. Each <em>state</em> layers its own rules, practice and filer reality on top.</p></div>
      <div class="lens when"><div class="k">Lens 3 · When</div><h3>Point in time</h3><p>On 1 July 2024 the old codes gave way to the 2023 Sanhitas. Which one is live depends on <em>when the cheque bounced</em>.</p></div>
    </div>`;
  m.appendChild(head);
  m.appendChild(el("h2","sec","Explore this case type"));
  const grid=el("div","grid");
  [["law","Acts & provisions","The "+Object.keys(SOURCES).length+" Acts and the "+PROVISIONS.length+" sections this case leans on - one tree, each opening to the text from the Act."],
   ["caselaw","Case law","How the Supreme Court has read these provisions - "+(CASES.length||'the')+" judgments, with their holdings."],
   ["words","Vocabulary","The shared language of the case - built on the laws, the rules, and the things people say."]
  ].forEach(([v,t,d])=>{const card=el("div","part"); card.innerHTML=`<div class="pt">${t}</div><div class="role" style="margin-bottom:0">${d}</div>`; card.onclick=()=>go(v); grid.appendChild(card);});
  m.appendChild(grid);
  return m;
};

/* Acts & provisions - one collapsible tree: Domain → Act → § provision → text.
   Provisions are extracts of the Acts, so they live inside the Act, not apart. */
V.law=()=>{
  if(!isModelled()) return notModelled();
  const m=el("div"); m.appendChild(scopeBar());
  const head=el("div");
  head.innerHTML=`<h1 class="page-title">Acts &amp; provisions</h1>
    <p class="lede">Every Act this case draws on and the sections inside it. Open an Act for its provisions, or a provision for its verbatim text.</p>
    <div class="legend"><span><span class="dot" style="background:var(--blue)"></span> in force</span><span><span class="dot" style="background:var(--amber)"></span> 2023 Sanhita (from 2024-07-01)</span><span><span class="dot" style="background:var(--ink-3)"></span> repealed - pre-2024 cases only</span></div>`;
  m.appendChild(head);
  const controls=el("div","controls");
  controls.innerHTML=`<div class="search"><span class="mag">${ic('search')}</span><input id="l-search" placeholder="Search Act, section, role, note - cheque, cognizance, presumption…"></div>`;
  m.appendChild(controls);
  const eraChips=el("div","chips");
  eraChips.innerHTML=`<span class="chip on" data-era="all">All eras</span><span class="chip" data-era="always">Any time</span><span class="chip" data-era="pre">Pre-2024 code</span><span class="chip" data-era="post">2023 Sanhita</span>`;
  m.appendChild(eraChips);
  const tierChips=el("div","chips"); tierChips.style.marginTop="8px";
  const tiers=TIER_ORDER.filter(t=>PROVISIONS.some(p=>p.tier===t));
  tierChips.innerHTML=`<span class="chip on" data-tier="all">All roles</span>`+tiers.map(t=>`<span class="chip" data-tier="${t}">${t[0].toUpperCase()+t.slice(1)} <span class="c">${PROVISIONS.filter(p=>p.tier===t).length}</span></span>`).join("");
  m.appendChild(tierChips);
  const list=el("div"); list.id="l-list"; list.style.marginTop="16px"; m.appendChild(list);
  const st={q:"",era:"all",tier:"all"};
  const firstDomain=Object.keys(DOMAINS)[0];
  const match=p=>{
    if(st.era!=="all"&&eraOf(p.applies)!==st.era)return false;
    if(st.tier!=="all"&&p.tier!==st.tier)return false;
    if(st.q){const hay=(p.ref+" "+p.role+" "+(p.note||"")+" "+actOf(p.ref).title).toLowerCase(); if(!hay.includes(st.q))return false;}
    return true;
  };
  function draw(){
    list.innerHTML="";
    const filtering = !!(st.q||st.era!=="all"||st.tier!=="all");
    let any=false;
    Object.entries(DOMAINS).forEach(([dk,d])=>{
      const actsWith=Object.entries(SOURCES).filter(([id,s])=>s.domain===dk)
        .map(([id,s])=>[id,s,PROVISIONS.filter(p=>p.act===id&&match(p))]).filter(a=>a[2].length);
      if(!actsWith.length) return;
      any=true;
      list.appendChild(el("h2","sec",`${d.label} <span style="color:var(--ink-3);font-weight:400;text-transform:none;letter-spacing:0">- ${d.blurb}</span>`));
      actsWith.forEach(([id,s,ps])=>{
        const repealed=/^repealed/i.test(s.status);
        const dotc=repealed?"var(--ink-3)":(s.era==="post"?"var(--amber)":"var(--blue)");
        const open = filtering || dk===firstDomain;
        const grp=el("div","actgrp"+(open?" open":""));
        grp.innerHTML=`
          <div class="actgrp-head">
            <span class="ag-chev">${ic('chevron-down')}</span>
            <span class="dot" style="background:${dotc}"></span>
            <span class="ag-title">${s.title.replace(/, \d{4}$/,'')} <span class="ag-year">${(s.title.match(/\d{4}/)||[''])[0]}</span></span>
            <span class="ag-status">${repealed?'repealed - pre-2024':s.status}${s.casescoped?'':' · cross-case'}</span>
            <span class="ag-count">${ps.length}</span>
          </div>
          <div class="actgrp-body"></div>`;
        const body=grp.querySelector(".actgrp-body");
        const openBtn=el("button","view-full ag-openfull"); openBtn.dataset.act=id; openBtn.innerHTML=`${ic('book-open')}&nbsp; Open the whole Act`;
        body.appendChild(openBtn);
        ps.forEach(p=>body.appendChild(provRow(p)));
        grp.querySelector(".actgrp-head").onclick=()=>grp.classList.toggle("open");
        list.appendChild(grp);
      });
    });
    if(!any) list.appendChild(el("div","empty","Nothing matches those filters."));
  }
  eraChips.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{eraChips.querySelectorAll(".chip").forEach(x=>x.classList.remove("on"));c.classList.add("on");st.era=c.dataset.era;draw();});
  tierChips.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{tierChips.querySelectorAll(".chip").forEach(x=>x.classList.remove("on"));c.classList.add("on");st.tier=c.dataset.tier;draw();});
  setTimeout(()=>{const inp=$("#l-search"); if(inp)inp.oninput=e=>{st.q=e.target.value.toLowerCase().trim();draw();};},0);
  draw();
  return m;
};
V.parts=V.law; V.provisions=V.law;   // old routes/hashes fold into the unified tree
function provRow(p){
  const s=actOf(p.ref);
  const row=el("div","prov"); row.id="prov-"+p.ref.replace(/:/g,"_");
  const eo=EDGES.filter(e=>e.from===p.ref), ei=EDGES.filter(e=>e.to===p.ref);
  row.innerHTML=`
    <div class="prov-head">
      <span class="ref">${p.ref.split(":")[0]}:${secNum(p.ref)}</span>
      <span class="rt">${p.role} <span class="act">- ${s.title.split(",")[0]}</span></span>
      <span class="hbadges">${scopeBadge()} ${eraBadge(p.applies)}</span>
      <span class="caret">${ic('chevron-right')}</span>
    </div>
    <div class="prov-body">
      ${p.note?`<div class="brief"><span class="bl">In brief · PUCAR summary</span>${p.note}</div>`:''}
      <div class="statute-slot" data-ref="${esc(p.ref)}"></div>
      <div class="kv" style="margin-top:12px"><b>Governs</b> ${DOMAINS[s.domain].label.toLowerCase()} · role: ${p.tier}</div>
      <div class="kv"><b>Applies</b> ${p.applies==="always"?"at any time":("to causes of action "+p.applies.replace("pre-2024-07-01","before 1 July 2024").replace("post-2024-07-01","on or after 1 July 2024"))}</div>
      ${(eo.length||ei.length)?`<div class="rels">${eo.map(e=>`<div class="rel"><span class="r">${e.rel}</span> → <span class="to">${refLabel(e.to)}</span>${e.note?` <span class="tiny">(${e.note})</span>`:''}</div>`).join("")+ei.map(e=>`<div class="rel"><span class="to">${refLabel(e.from)}</span> <span class="r">${e.rel}</span> → this</div>`).join("")}</div>`:''}
      ${casesFor(p.ref)}
    </div>`;
  row.querySelector(".prov-head").onclick=()=>{ row.classList.toggle("open"); if(row.classList.contains("open")) fillStatute(row.querySelector(".statute-slot")); };
  return row;
}

async function fillStateStatute(slot, akn, eId, title, sub){
  if(!slot || slot.dataset.loaded) return; slot.dataset.loaded="1";
  slot.innerHTML=`<div class="statute statute-mini"><div class="st-src"><span class="spinner" style="width:13px;height:13px;border-width:2px;margin:0"></span> loading the source…</div></div>`;
  try{ const d=await getStateSection(akn,eId);
    slot.innerHTML = d ? `<div class="statute statute-mini"><div class="st-src">${ic('book-open')} from ${esc(title||'the Kerala instrument')}</div>${(d.num||d.heading)?`<div class="st-h"><span class="st-num">${esc(d.num||'')}</span>${esc(d.heading||'')}</div>`:''}${renderBody(d.body,"st")}<div class="st-inpar"><button class="stdoc" data-akn="${esc(akn)}" data-title="${esc(title||'')}" data-sub="${esc(sub||'')}" data-eid="${esc(eId)}">${ic('maximize-2')}&nbsp; Read this inside the full document</button></div></div>` : `<div class="statute"><div class="st-src">source text not found</div></div>`;
  }catch(e){ slot.innerHTML=`<div class="statute"><div class="st-src">couldn't load the source - served over http?</div></div>`; }
}
const POS_LABEL={noun:"Noun",verb:"Verb",adjective:"Adjective"};
const ROLE_LABEL={actor:"Actor",document:"Document",procedure:"Procedure",doctrine:"Doctrine",forum:"Forum",remedy:"Remedy"};
const POS_ORDER=["noun","verb","adjective"], ROLE_ORDER=["actor","document","procedure","doctrine","forum","remedy"];
V.words=()=>{
  if(!isModelled()) return notModelled();
  const stName=stateById(activeState).name;
  const m=el("div"); m.appendChild(scopeBar());
  const natRaw=Object.entries(TERMS).map(([w,v])=>[w,(typeof v==="string"?{ref:v}:v)]);
  // every jurisdiction that carries vocabulary, in configured order. Each keeps its own
  // name and group order, so a card always names the state the word actually belongs to.
  const vStates=(JURISDICTIONS||[]).map(s=>({id:s.id,name:s.name,terms:stateVocabTerms(s.id)})).filter(s=>s.terms.length);
  const groupOrder=[]; natRaw.forEach(([w,v])=>{ const g=v.group||"Other"; if(!groupOrder.includes(g)) groupOrder.push(g); });
  const stGroupOrder={};
  vStates.forEach(s=>{ const o=[]; s.terms.forEach(t=>{ const g=t.group||"Other"; if(!o.includes(g)) o.push(g); }); stGroupOrder[s.id]=o; });
  // uniform items across every scope, for counting and filtering
  const items=[];
  natRaw.forEach(([w,v])=> items.push({kind:"national", scope:"national", w, v, pos:v.pos||"", role:v.role||"", group:v.group||"Other", hay:(w+" "+(v.gloss||"")+" "+(v.aka||[]).join(" ")+" "+(v.pos||"")+" "+(v.role||"")).toLowerCase()}));
  vStates.forEach(s=> s.terms.forEach(t=> items.push({kind:"state", scope:s.id, st:s.id, stName:s.name, t, pos:t.pos||"", role:t.role||"", group:t.group||"Other", hay:((t.word||"")+" "+(t.gloss||"")+" "+(t.aka||[]).join(" ")+" "+(t.source||"")+" "+(t.pos||"")+" "+(t.role||"")+" "+s.name).toLowerCase()})));
  const scopes=["national", ...vStates.map(s=>s.id)];
  const scopeName=k=> k==="national" ? "National" : ((vStates.find(s=>s.id===k)||{}).name||k);

  const head=el("div");
  head.innerHTML=`<h1 class="page-title">Vocabulary</h1>
    <p class="lede">The words a ${caseById(activeCase).name.toLowerCase()} case is built on - the shared national vocabulary plus the words each state layer adds. It opens on National and ${esc(stName)}; use Show to see All, or any other state.</p>`;
  m.appendChild(head);
  const controls=el("div","controls");
  controls.innerHTML=`<div class="search"><span class="mag">${ic('search')}</span><input id="w-search" placeholder="Search a word - cheque, drawer, summons, Chief Ministerial Officer…"></div>`;
  m.appendChild(controls);
  const facets=el("div","vfacets"); m.appendChild(facets);
  const list=el("div"); list.id="w-list"; list.style.marginTop="10px"; m.appendChild(list);

  // scope is a multi-select set: it opens on the national layer plus the state the app
  // is set to - today's effective view - and every other state is one chip away.
  const state={q:"", sel:new Set(["national"]), pos:"", role:""};
  if(vStates.some(s=>s.id===activeState)) state.sel.add(activeState);
  const allScopes=()=>scopes.every(k=>state.sel.has(k));

  function akaRow(aka){
    if(!aka||!aka.length) return "";
    return `<div class="waka"><span class="waka-lbl">also called</span>${aka.map(a=>`<span class="waka-t">${esc(a)}</span>`).join("")}</div>`;
  }
  // a term drawn from a field note carries sourceNotes - render a backlink to that note
  const noteLink=sn=>(sn&&sn.length)?` <a class="src-note" data-note="${esc(sn[0])}">${ic('messages-square')} field note</a>`:"";
  function wcard(it){
    const clsTags=`${it.pos?`<span class="wtag wtag-pos">${esc(POS_LABEL[it.pos]||it.pos)}</span>`:""}${it.role?`<span class="wtag wtag-role">${esc(ROLE_LABEL[it.role]||it.role)}</span>`:""}`;
    if(it.kind==="national"){
      const w=it.w, v=it.v, p=v.ref?PROVISIONS.find(x=>x.ref===v.ref):null, s=v.ref?actOf(v.ref):null;
      const def=v.gloss || (p&&p.note) || "The canonical meaning the system uses for this term - fixed by the section below.";
      // Most national terms pin to a statute (v.ref); a few are administrative practice
      // with no single statutory home (e.g. a central filing arrangement) - those carry a
      // free-text v.source and open to nothing, like the state layer.
      // the citation reads as one reference - section and Act together open the provision.
      // Only link it when the Act actually resolves; otherwise it stays plain text.
      const srcLine = (v.ref && s)
        ? `from <a class="src-ref" data-nat="${esc(v.ref)}"><span class="sr-sec">${esc(secNum(v.ref))}</span> · ${esc(s.title.split(",")[0])}</a>`
        : v.ref
          ? `from <span class="sr-sec">${esc(secNum(v.ref))}</span> · ${esc(v.ref.split(":")[0])}`
          : `from ${esc(v.source||'court practice')}`;
      const c=el("div","word"); c.dataset.word=w.toLowerCase();
      c.innerHTML=`
        <div class="wt"><span class="wname">${esc(w[0].toUpperCase()+w.slice(1))}</span><span class="wtag wtag-national">national</span>${clsTags}<span class="caret">${ic('chevron-right')}</span></div>
        <div class="def">${esc(def)}</div>
        ${akaRow(v.aka)}
        <div class="src">${srcLine}${noteLink(v.sourceNotes)}</div>
        ${v.ref?`<div class="wfull"><div class="statute-slot" data-ref="${esc(v.ref)}"></div></div>`:""}`;
      c.querySelector(".wt").onclick=()=>{ c.classList.toggle("open"); if(c.classList.contains("open") && v.ref) fillStatute(c.querySelector(".statute-slot"),true); };
      return c;
    }
    const t=it.t, c=el("div","word"); c.dataset.word=(t.word||"").toLowerCase();
    // same treatment on the state layer: where the term is pinned to an instrument the
    // citation itself is the link. A state source often carries a trailing attribution
    // after a semicolon ("…; named by the filing assistants") - that part stays plain.
    const stRaw=t.source||'the state layer';
    let stSrc;
    if(t.akn && t.eId){
      const i=stRaw.indexOf(";");
      const cite=(i>0?stRaw.slice(0,i):stRaw).trim(), rest=(i>0?stRaw.slice(i):"");
      stSrc=`from <a class="src-ref" data-akn="${esc(t.akn)}" data-eid="${esc(t.eId)}" data-title="${esc(cite)}">${esc(cite)}</a>${esc(rest)}`;
    } else stSrc=`from ${esc(stRaw)}`;
    c.innerHTML=`
      <div class="wt"><span class="wname">${esc(t.word)}</span><span class="wtag wtag-state">${esc(it.stName||stName)}</span>${clsTags}<span class="caret">${ic('chevron-right')}</span></div>
      <div class="def">${esc(t.gloss||'')}</div>
      ${akaRow(t.aka)}
      <div class="src">${stSrc}${noteLink(t.sourceNotes)}</div>
      <div class="wfull"><div class="ksec-slot"></div></div>`;
    c.querySelector(".wt").onclick=()=>{ c.classList.toggle("open"); if(c.classList.contains("open") && t.akn && t.eId) fillStateStatute(c.querySelector(".ksec-slot"), t.akn, t.eId, t.source||'the state instrument', ''); };
    return c;
  }
  function pill(fg,fv,label,count,active){
    return `<span class="chip ${active?'on':''}" data-fg="${fg}" data-fv="${esc(fv)}">${esc(label)}${count!=null?` <span class="c">${count}</span>`:""}</span>`;
  }
  function redraw(){
    const bySearch=items.filter(it=> !state.q || it.hay.includes(state.q));
    const base=bySearch.filter(it=> state.sel.has(it.scope));
    // cross-filtered facet counts: pos counts respect the active role, and vice versa
    const posCounts={}, roleCounts={};
    base.filter(it=> !state.role || it.role===state.role).forEach(it=>{ if(it.pos) posCounts[it.pos]=(posCounts[it.pos]||0)+1; });
    base.filter(it=> !state.pos || it.pos===state.pos).forEach(it=>{ if(it.role) roleCounts[it.role]=(roleCounts[it.role]||0)+1; });
    const scopeCount={}; scopes.forEach(k=>{ scopeCount[k]=bySearch.filter(i=>i.scope===k).length; });

    let fh=`<div class="vfacet-row"><span class="vfacet-lbl">Show</span><div class="chips">`
      +pill("scope","all","All",bySearch.length,allScopes())
      +scopes.map(k=>pill("scope",k,scopeName(k),scopeCount[k],state.sel.has(k))).join("")
      +`</div></div>`;
    const posVals=POS_ORDER.filter(p=>posCounts[p]);
    if(posVals.length) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">Type</span><div class="chips">`+posVals.map(p=>pill("pos",p,POS_LABEL[p]||p,posCounts[p],state.pos===p)).join("")+`</div></div>`;
    const roleVals=ROLE_ORDER.filter(r=>roleCounts[r]);
    if(roleVals.length) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">Role</span><div class="chips">`+roleVals.map(r=>pill("role",r,ROLE_LABEL[r]||r,roleCounts[r],state.role===r)).join("")+`</div></div>`;
    facets.innerHTML=fh;

    const final=base.filter(it=> (!state.pos||it.pos===state.pos) && (!state.role||it.role===state.role));
    list.innerHTML="";
    const natFinal=final.filter(i=>i.kind==="national");
    if(natFinal.length){
      list.appendChild(el("div","grouphead",`National vocabulary <span class="gh-status">national · ${natFinal.length}</span>`));
      groupOrder.forEach(g=>{ const rows=natFinal.filter(it=>it.group===g).sort((a,b)=>a.w.localeCompare(b.w)); if(!rows.length) return; list.appendChild(el("div","vsub",esc(g))); rows.forEach(it=> list.appendChild(wcard(it))); });
    }
    // one heading per state, so an "All" view reads as national then state by state
    vStates.forEach(s=>{
      const rows=final.filter(i=>i.st===s.id); if(!rows.length) return;
      list.appendChild(el("div","grouphead",`${esc(s.name)} vocabulary <span class="gh-status">state layer · ${rows.length}</span>`));
      (stGroupOrder[s.id]||[]).forEach(g=>{ const gr=rows.filter(it=>it.group===g); if(!gr.length) return; list.appendChild(el("div","vsub",esc(g))); gr.forEach(it=> list.appendChild(wcard(it))); });
    });
    if(!final.length) list.appendChild(el("div","empty","No word matches these filters."));
  }
  facets.addEventListener("click",e=>{
    const p=e.target.closest(".chip"); if(!p) return;
    const fg=p.dataset.fg, fv=p.dataset.fv;
    if(fg==="scope"){
      // All selects every scope; from All a click narrows to just that scope, otherwise
      // a click adds or removes one. Emptying the selection falls back to All.
      if(fv==="all") state.sel=new Set(scopes);
      else if(allScopes()) state.sel=new Set([fv]);
      else if(state.sel.has(fv)){ state.sel.delete(fv); if(!state.sel.size) state.sel=new Set(scopes); }
      else state.sel.add(fv);
    }
    else if(fg==="pos") state.pos=(state.pos===fv?"":fv);
    else if(fg==="role") state.role=(state.role===fv?"":fv);
    redraw();
  });
  setTimeout(()=>{const inp=$("#w-search"); if(inp)inp.oninput=e=>{ state.q=e.target.value.toLowerCase().trim(); redraw(); };},0);
  redraw();
  // arrived here from a vocab-term link: clear any filters, then scroll to and open that word
  if(vocabScrollTo){
    const wanted=vocabScrollTo; vocabScrollTo=null;
    setTimeout(()=>{
      state.q=""; state.sel=new Set(scopes); state.pos=""; state.role=""; redraw();
      const card=[...m.querySelectorAll(".word")].find(c=>c.dataset.word===wanted.toLowerCase());
      if(card){
        const y=card.getBoundingClientRect().top+window.scrollY-16;
        window.scrollTo({top:Math.max(0,y), behavior:"auto"});
        const wt=card.querySelector(".wt"); if(wt && !card.classList.contains("open")) wt.click();
        card.classList.add("word-flash"); setTimeout(()=>card.classList.remove("word-flash"),1500);
      }
    },70);
  }
  return m;
};

/* ============================================================ REQUIREMENTS
   The normative layer. Everything else in the corpus describes the law; these
   statements bind a system, cite the provision they come from and carry a test.
   Same shape as Vocabulary: state is a filter, not a switch - the view opens on
   the national layer plus the state the app is set to, and every other state is
   one chip away. Colour carries exactly one signal here: status - and a dot carries
   it. The status is never a bare word: its plain-English meaning sits beside it on
   every card, and the same line opens the grounds - the reasoning, the provisions,
   the judgments and the field notes the statement stands on. */
const REQ_CAT_LABEL={LIM:"Limitation and time",NOT:"The demand notice",FIL:"Filing, fee and scrutiny",SRV:"Service of process",EVI:"Evidence and documents",PRE:"Presumptions and burden",JUR:"Jurisdiction and cognizance",TRL:"Trial conduct",CMP:"Compounding and settlement",SEN:"Sentence and compensation",APL:"Appeal and revision",REC:"The court record",CPY:"Copies"};
const REQ_CAT_ORDER=["LIM","NOT","FIL","SRV","EVI","PRE","JUR","TRL","CMP","SEN","APL","REC","CPY"];
const REQ_LEVEL_ORDER=["MUST","MUST NOT","SHOULD","MAY"];
const REQ_STATUS_ORDER=["firm","inferred","contested"];
/* the two ends of the layering relation, as a facet: a national statement a state has
   narrowed, and a state statement that narrows one. Nothing is both. */
const REQ_TIE_ORDER=["tightened","tightens"];
const REQ_TIE_LABEL={tightened:"Tightened by a state", tightens:"Tightens a national rule"};
const REQ_STATUS_NOTE={firm:"the instrument says so in terms",inferred:"a reading, reasoned in the why",contested:"the authorities divide"};
const REQ_ARTIFACT_LABEL={"schema-field":"Schema field","validation-rule":"Validation rule","workflow-step":"Workflow step","output-document":"Output document","access-control":"Access control","screen":"Screen"};
const reqCatLabel = c => REQ_CAT_LABEL[c] || c;
const reqArtifact = a => REQ_ARTIFACT_LABEL[a] || String(a||"").replace(/-/g," ");
const reqScopeName = k => k==="national" ? "National" : ((stateById(k)||{}).name || k);
/* what the sidebar counts: the layer actually in force for this reader - national plus
   the state the app is set to. */
const reqNavCount = () => REQS.filter(r=>r.scope==="national"||r.scope===activeState).length;
V.requirements=()=>{
  if(!isModelled()) return notModelled();
  const stName=stateById(activeState).name;
  /* view-req caps the whole column at the card's measure - see styles.css */
  const m=el("div","view-req"); m.appendChild(scopeBar());
  const head=el("div");
  head.innerHTML=`<h1 class="page-title">Requirements</h1>
    <p class="lede">What a system must do to run a ${caseById(activeCase).name.toLowerCase()} case lawfully - each statement derived from a provision that opens, and each one testable. It opens on National and ${esc(stName)}; use Show to see All, or any other state.</p>`;
  m.appendChild(head);
  if(!REQS.length){ m.appendChild(el("div","empty","No requirements dataset is linked from this profile.")); return m; }
  const controls=el("div","controls");
  controls.innerHTML=`<div class="search"><span class="mag">${ic('search')}</span><input id="r-search" placeholder="Search a requirement - receipt, summons, compounding, REQ-LIM-004…"></div>`;
  m.appendChild(controls);
  const facets=el("div","vfacets"); m.appendChild(facets);
  const list=el("div"); list.id="r-list"; list.style.marginTop="10px"; m.appendChild(list);

  /* The layering, read from the other end. A state requirement names the national one it
     narrows in `tightens`; nothing pointed the other way, so a national statement read on
     its own understated what a system in Kerala or Gujarat actually has to do. This index
     inverts the field once, and both ends of the relation render off it. */
  const tightenedBy={};
  REQS.forEach(r=>{ if(r.tightens){ (tightenedBy[r.tightens]=tightenedBy[r.tightens]||[]).push(r); } });
  const scopeRank=k=>{ const i=["national", ...(JURISDICTIONS||[]).map(s=>s.id)].indexOf(k); return i<0?99:i; };
  Object.keys(tightenedBy).forEach(k=>tightenedBy[k].sort((a,b)=>scopeRank(a.scope)-scopeRank(b.scope)||String(a.id).localeCompare(b.id)));

  const items=REQS.map(r=>({r, scope:r.scope, cat:r.category||"", level:r.level||"", status:r.status||"",
    tie: r.tightens ? "tightens" : ((tightenedBy[r.id]||[]).length ? "tightened" : ""),
    hay:((r.id||"")+" "+(r.statement||"")+" "+(r.why||"")+" "+(r.test||"")).toLowerCase()}));
  const scopes=["national", ...(JURISDICTIONS||[]).map(s=>s.id)].filter(k=>items.some(i=>i.scope===k));
  const state={q:"", sel:new Set(["national"]), cat:"", level:"", status:"", tie:""};
  if(scopes.includes(activeState)) state.sel.add(activeState);
  const allScopes=()=>scopes.every(k=>state.sel.has(k));

  const trim=(s,n)=>{ s=String(s||""); return s.length>n ? s.slice(0,n).replace(/\s+\S*$/,"")+"…" : s; };
  const reqLink=id=>{ const t=reqById(id); if(!t) return `<span class="rq-plain">${esc(id)}</span>`;
    return `<a class="rq-jump" data-req="${esc(id)}"><span class="rq-jid">${esc(id)}</span> ${esc(trim(t.statement,96))}</a>`; };
  /* a judgment the requirement rests on. Opens the judgment itself where the corpus
     has the text; where it does not, it lands on the case in Case law. */
  const reqCaseLink=id=>{
    const c=caseById2(id);
    if(!c) return `<span class="rq-plain">${esc(id)}</span>`;
    const sub=[c.citation, c.bench?benchShort(c.bench):""].filter(Boolean).join(" · ");
    return `<a class="rq-src" data-caseid="${esc(c.id)}"><span class="rq-src-n">${esc(c.name)}</span>${sub?`<span class="rq-src-sub">${esc(sub)}</span>`:""}</a>`;
  };
  /* a field note the requirement rests on - the same note the Local practice view holds */
  const reqNoteLink=id=>{
    const n=(PRACTICE_NOTES||[]).find(x=>x.id===id);
    if(!n) return `<span class="rq-plain">${esc(id)}</span>`;
    const nm=n.serial ? "Field note "+n.serial : "Field note";
    const sub=[n.place?reqScopeName(n.place):"", (n.attribution||{}).heardFrom?"heard from "+n.attribution.heardFrom:""].filter(Boolean).join(" · ");
    return `<a class="rq-src" data-note="${esc(n.id)}"><span class="rq-src-n">${esc(nm)}</span>${sub?`<span class="rq-src-sub">${esc(sub)}</span>`:""}</a>`;
  };
  /* The tighteners, grouped by the layer they come from: the state is the thing a reader
     scans for and it is said once, the ids after it are what they cite and each one opens.
     The statement rides along as the title, so the row stays a row. */
  const reqTightenerRow=list=>{
    const by=[]; list.forEach(r=>{ const g=by.find(x=>x.k===r.scope); (g||by[by.push({k:r.scope,rs:[]})-1]).rs.push(r); });
    return `<div class="rq-ties-row">`+by.map(g=>`<span class="rq-tie-g"><span class="rq-tie-st">${esc(reqScopeName(g.k))}</span>`
      +g.rs.map(r=>`<a class="rq-jump rq-jid" data-req="${esc(r.id)}" title="${esc(trim(r.statement,180))}">${esc(r.id)}</a>`).join("")
      +`</span>`).join("")+`</div>`;
  };
  const reqBlock=(l,v,cls)=>`<div class="rq-block"><span class="rq-l">${esc(l)}</span><div class="rq-v${cls?" "+cls:""}">${v}</div></div>`;
  /* One card, one left edge, one measure, read top to bottom: the id a reader cites,
     the statement, the failure it prevents, what it binds, and last a footer that
     says how firm the statement is and opens the grounds it stands on. Every field
     below the statement is optional - a scope still filling in its evidence simply
     renders fewer blocks. */
  function reqCardHTML(it){
    const r=it.r;
    // a state cite resolves only against its own state's alias map; a national one needs none
    const amap = r.scope==="national" ? {} : stateAliasMap(r.scope);
    const cites=(r.authority||[]).map(c=>citeChip(c,amap)).join("");
    const caseIds=(r.cases||[]).filter(Boolean);
    const noteIds=(r.notes||[]).filter(Boolean);
    const reason=String(r.statusReason||"").trim();
    const status=r.status||"firm";
    const gloss=REQ_STATUS_NOTE[status]||"";
    // the grounds: why the status is what it is, and every source it rests on
    const grounds=[];
    if(reason) grounds.push(`<p class="rq-reason">${esc(reason)}</p>`);
    if(cites) grounds.push(reqBlock("Authority",`<span class="cites">${cites}</span>`));
    if(caseIds.length) grounds.push(reqBlock(caseIds.length>1?"Judgments":"Judgment",`<div class="rq-srcs">${caseIds.map(reqCaseLink).join("")}</div>`));
    if(noteIds.length) grounds.push(reqBlock("Local practice",`<div class="rq-srcs">${noteIds.map(reqNoteLink).join("")}</div>`));
    const hasG=grounds.length>0;
    // the detail behind the caret: what a builder needs once the statement is accepted
    const rows=[];
    rows.push(reqBlock("How", r.how?esc(r.how):"The law fixes the obligation and leaves the method open.", r.how?"":"rq-open"));
    if(r.test) rows.push(reqBlock("Test",esc(r.test)));
    if(r.relatedTo && r.relatedTo.length) rows.push(reqBlock("Related",`<div class="rq-rel">${r.relatedTo.map(reqLink).join("")}</div>`));
    /* The layering stays out of both disclosures. The caret holds what a builder needs
       once the statement is accepted; the status line holds how firm it is. Neither is
       true of a tightening: it changes what the statement means for a reader in that
       state, so a national rule that is narrowed somewhere must say so unopened, and the
       state rule that narrows it must say what it narrows. Most cards carry neither. */
    const ties=[];
    if(r.tightens) ties.push(reqBlock("Tightens",reqLink(r.tightens)));
    const tby=tightenedBy[r.id]||[];
    if(tby.length) ties.push(reqBlock("Tightened by", reqTightenerRow(tby)));
    const b=r.binds||{};
    const binds=[reqArtifact(b.artifact), b.target].filter(Boolean).join(" · ");
    return `<div class="req" id="req-${esc(r.id)}" data-req="${esc(r.id)}">
      <div class="rq-h">
        <div class="rq-eyebrow"><span class="rq-id">${esc(r.id)}</span>${r.level?`<span class="rq-lvl">${esc(r.level)}</span>`:""}<span class="caret">${ic('chevron-right')}</span></div>
        <div class="rq-stmt">${esc(r.statement||"")}</div>
      </div>
      ${r.why?`<div class="rq-why">${esc(r.why)}</div>`:""}
      ${binds?`<div class="rq-meta">${esc(binds)}</div>`:""}
      ${ties.length?`<div class="rq-ties">${ties.join("")}</div>`:""}
      <div class="rq-full">${rows.join("")}</div>
      <div class="rq-basis-bar${hasG?" has":""}">
        <span class="rq-status s-${esc(status)}"><span class="rq-dot"></span>${esc(status)}</span>
        ${gloss?`<span class="rq-status-gloss">- ${esc(gloss)}</span>`:""}
        ${hasG?`<span class="rq-more">Grounds ${ic('chevron-down')}</span>`:""}
      </div>
      ${hasG?`<div class="rq-basis">${grounds.join("")}</div>`:""}
    </div>`;
  }
  const pill=(fg,fv,label,count,active)=>`<span class="chip ${active?'on':''}" data-fg="${fg}" data-fv="${esc(fv)}">${esc(label)}${count!=null?` <span class="c">${count}</span>`:""}</span>`;
  function redraw(){
    const bySearch=items.filter(it=> !state.q || it.hay.includes(state.q));
    const base=bySearch.filter(it=> state.sel.has(it.scope));
    // cross-filtered counts: each facet counts what the others would leave standing
    const count=(arr,key)=>{ const o={}; arr.forEach(it=>{ if(it[key]) o[it[key]]=(o[it[key]]||0)+1; }); return o; };
    const ok=(it,skip)=>(skip==="cat"||!state.cat||it.cat===state.cat)
      && (skip==="level"||!state.level||it.level===state.level)
      && (skip==="status"||!state.status||it.status===state.status)
      && (skip==="tie"||!state.tie||it.tie===state.tie);
    const catC=count(base.filter(it=>ok(it,"cat")),"cat");
    const lvlC=count(base.filter(it=>ok(it,"level")),"level");
    const stC =count(base.filter(it=>ok(it,"status")),"status");
    const tieC=count(base.filter(it=>ok(it,"tie")),"tie");
    const scopeCount={}; scopes.forEach(k=>{ scopeCount[k]=bySearch.filter(i=>i.scope===k).length; });

    let fh=`<div class="vfacet-row"><span class="vfacet-lbl">Show</span><div class="chips">`
      +pill("scope","all","All",bySearch.length,allScopes())
      +scopes.map(k=>pill("scope",k,reqScopeName(k),scopeCount[k],state.sel.has(k))).join("")
      +`</div></div>`;
    /* the one relation in this dataset that crosses the layers, and the one a reader
       cannot get at any other way: the Show chips separate the layers, this joins them. */
    const ties=REQ_TIE_ORDER.filter(t=>tieC[t]);
    if(ties.length) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">Layering</span><div class="chips">`+ties.map(t=>pill("tie",t,REQ_TIE_LABEL[t],tieC[t],state.tie===t)).join("")+`</div></div>`;
    const cats=REQ_CAT_ORDER.filter(c=>catC[c]);
    if(cats.length) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">Area</span><div class="chips">`+cats.map(c=>pill("cat",c,reqCatLabel(c),catC[c],state.cat===c)).join("")+`</div></div>`;
    const lvls=REQ_LEVEL_ORDER.filter(l=>lvlC[l]);
    if(lvls.length) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">Level</span><div class="chips">`+lvls.map(l=>pill("level",l,l,lvlC[l],state.level===l)).join("")+`</div></div>`;
    const sts=REQ_STATUS_ORDER.filter(s=>stC[s]);
    if(sts.length) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">Status</span><div class="chips">`+sts.map(s=>pill("status",s,s,stC[s],state.status===s)).join("")+`</div></div>`;
    facets.innerHTML=fh;

    const final=base.filter(it=>ok(it,""));
    if(!final.length){ list.innerHTML=""; list.appendChild(el("div","empty","No requirement matches these filters.")); return; }
    // national first, then state by state; inside each, the README's category order
    let html="";
    scopes.forEach(k=>{
      const rows=final.filter(i=>i.scope===k); if(!rows.length) return;
      const sub=k==="national" ? `binds every state · ${rows.length}` : `state layer · ${rows.length}`;
      html+=`<div class="grouphead">${esc(reqScopeName(k))} requirements <span class="gh-status">${esc(sub)}</span></div>`;
      const cats2=[...REQ_CAT_ORDER, ...new Set(rows.map(i=>i.cat))].filter((c,i,a)=>a.indexOf(c)===i);
      cats2.forEach(c=>{
        const gr=rows.filter(i=>i.cat===c); if(!gr.length) return;
        html+=`<div class="vsub">${esc(reqCatLabel(c))} · ${gr.length}</div>`;
        gr.forEach(it=>{ html+=reqCardHTML(it); });
      });
    });
    list.innerHTML=html;
    // the cards are rebuilt on every filter change, so they are re-linked here rather
    // than relying on the single pass go() makes over the page
    try{ linkifyVocab(list); }catch(e){}
  }
  facets.addEventListener("click",e=>{
    const p=e.target.closest(".chip"); if(!p) return;
    const fg=p.dataset.fg, fv=p.dataset.fv;
    if(fg==="scope"){
      // same interaction as Vocabulary: All selects everything, a click from All narrows
      // to one scope, otherwise a click adds or removes one; emptying falls back to All.
      if(fv==="all") state.sel=new Set(scopes);
      else if(allScopes()) state.sel=new Set([fv]);
      else if(state.sel.has(fv)){ state.sel.delete(fv); if(!state.sel.size) state.sel=new Set(scopes); }
      else state.sel.add(fv);
    }
    else if(fg==="cat") state.cat=(state.cat===fv?"":fv);
    else if(fg==="level") state.level=(state.level===fv?"":fv);
    else if(fg==="status") state.status=(state.status===fv?"":fv);
    else if(fg==="tie"){
      state.tie=(state.tie===fv?"":fv);
      // both ends of the relation live in different files, so the layering facet is
      // useless against a single layer: asking for it opens every scope.
      if(state.tie) state.sel=new Set(scopes);
    }
    redraw();
  });
  // the grounds panel is the bar's next sibling, so the bar carries the open state for both
  function openBasis(bar, on){
    bar.classList.toggle("open", on);
    const p=bar.nextElementSibling;
    if(p && p.classList.contains("rq-basis")) p.classList.toggle("open", on);
  }
  // land on one requirement: clear the filters, make sure its scope is showing, open it
  function jumpTo(id, push){
    const t=reqById(id); if(!t) return;
    state.q=""; state.cat=""; state.level=""; state.status=""; state.tie="";
    if(!state.sel.has(t.scope)) state.sel.add(t.scope);
    const inp=$("#r-search"); if(inp) inp.value="";
    redraw();
    _extra={req:id}; if(push!==false) writeHash(true);
    // two passes, like scrollToId: a fresh boot can still be settling when the first
    // scroll lands, and the second pass puts the card where it belongs
    const land=()=>{
      const card=list.querySelector('.req[data-req="'+id+'"]'); if(!card) return null;
      card.classList.add("open");
      // a reader who came for this one requirement gets its grounds open too
      const bar=card.querySelector(".rq-basis-bar.has"); if(bar) openBasis(bar,true);
      const y=card.getBoundingClientRect().top+window.scrollY-70;
      window.scrollTo({top:Math.max(0,y), behavior:"auto"});
      return card;
    };
    setTimeout(()=>{
      if(!land()) return;
      setTimeout(()=>{ const card=land(); if(!card) return;
        card.classList.add("word-flash"); setTimeout(()=>card.classList.remove("word-flash"),1500); },340);
    },40);
  }
  list.addEventListener("click",e=>{
    const j=e.target.closest(".rq-jump");
    if(j && j.dataset.req){ e.stopPropagation(); jumpTo(j.dataset.req); return; }
    // a source in the grounds hands off to the route that already exists for it
    const src=e.target.closest(".rq-src");
    if(src){ e.stopPropagation();
      if(src.dataset.caseid){ const c=caseById2(src.dataset.caseid);
        if(c && c.akn) openJudgmentModal(c.id); else jumpToCase(src.dataset.caseid); }
      else if(src.dataset.note) goPracticeNote(src.dataset.note);
      return; }
    const bb=e.target.closest(".rq-basis-bar");
    if(bb){ e.stopPropagation(); if(bb.classList.contains("has")) openBasis(bb, !bb.classList.contains("open")); return; }
    if(e.target.closest(".cite")) return;                       // a citation opens the provision
    const h=e.target.closest(".rq-h"); if(!h) return;
    h.closest(".req").classList.toggle("open");
  });
  setTimeout(()=>{const inp=$("#r-search"); if(inp)inp.oninput=e=>{ state.q=e.target.value.toLowerCase().trim(); redraw(); };},0);
  redraw();
  if(reqScrollTo){ const wanted=reqScrollTo; reqScrollTo=null; setTimeout(()=>jumpTo(wanted,false),60); }
  return m;
};

/* Standards adherence - the other half of the normative picture. Requirements say what
   the law compels; this says what any public digital service owes the person using it,
   and a court-facing one owes more heavily. Neither is case-typed nor state-scoped, so
   there is no scope bar and no state filter here: one list, grouped as the markdown
   groups it, every entry carrying the test and the threshold that decides it.
   The page is generic over the file - groups, counts and facets are whatever the
   markdown holds, so a new group needs no code. */
V.standards=()=>{
  const m=el("div","view-req view-std");
  const head=el("div");
  const lede=(STANDARDS.lede||[]).length ? STANDARDS.lede
    : ["The non-legal standards a build is measured against, and how each one is tested."];
  head.innerHTML=`<h1 class="page-title">Standards adherence</h1>`+subTabsHTML("standards","standards")
    +lede.map(t=>`<p class="lede">${esc(t)}</p>`).join("");
  m.appendChild(head);
  const all=stdItems();
  if(!all.length){ m.appendChild(el("div","empty","No standards file is linked from this corpus.")); return m; }

  const controls=el("div","controls");
  controls.innerHTML=`<div class="search"><span class="mag">${ic('search')}</span><input id="s-search" placeholder="Search a standard - contrast, audit log, timeout, WCAG, DPDP…"></div>`;
  m.appendChild(controls);
  const facets=el("div","vfacets"); m.appendChild(facets);
  const list=el("div"); list.id="s-list"; list.style.marginTop="10px"; m.appendChild(list);

  /* a Check line that names no link is the honest "nothing hosted reaches this one",
     so the facet counts links rather than the field - it would otherwise offer a
     reader a hosted checker and hand them a card saying there isn't one */
  const items=all.map(s=>({s, grp:s.group||"", spec:!!s.spec, check:/\]\(https?:/.test(s.check||""),
    hay:((s.name||"")+" "+(s.gloss||"")+" "+(s.spec||"")+" "+(s.anchor||"")+" "+(s.test||"")
        +" "+(s.pass||"")+" "+(s.check||"")+" "+(s.note||"")).toLowerCase()}));
  const state={q:"", grp:"", has:"", openAll:false};
  const pill=(fg,fv,label,count,active)=>`<span class="chip ${active?'on':''}" data-fg="${fg}" data-fv="${esc(fv)}">${esc(label)}${count!=null?` <span class="c">${count}</span>`:""}</span>`;

  const block=(l,v,cls)=>`<div class="rq-block${cls?" "+cls:""}"><span class="rq-l">${l}</span><div class="rq-v">${v}</div></div>`;
  function stdCardHTML(it){
    const s=it.s;
    /* the disclosure: the method, the threshold it is judged against, and last the
       checkers that will do part of it for you. The first two pair off into the two
       columns; the checkers run underneath, because a list wants its own line. */
    const rows=[];
    if(s.test) rows.push(block("How to test", stdInline(s.test)));
    if(s.pass) rows.push(block("Pass when", stdInline(s.pass)));
    if(s.check) rows.push(block("Check it online", `<ul class="std-checks">${stdChecks(s.check)}</ul>`, "std-wide"));
    return `<div class="req std" id="std-${esc(s.id)}" data-std="${esc(s.id)}">
      <div class="rq-h">
        <div class="rq-stmt std-name">${esc(s.name)}<span class="caret">${ic('chevron-right')}</span></div>
      </div>
      ${s.gloss?`<div class="rq-why">${stdInline(s.gloss)}</div>`:""}
      ${s.spec?`<div class="std-spec"><span class="std-l">Spec</span> ${stdInline(s.spec)}</div>`:""}
      ${s.anchor?`<div class="std-anchor"><span class="std-l">In this corpus</span><span class="cites">${stdAnchors(s.anchor)}</span></div>`:""}
      ${s.note?`<div class="std-note"><span class="std-l">Note</span> ${stdInline(s.note)}</div>`:""}
      ${rows.length?`<div class="rq-full">${rows.join("")}</div>`:""}
    </div>`;
  }
  function redraw(){
    const bySearch=items.filter(it=> !state.q || it.hay.includes(state.q));
    const grpC={}; bySearch.forEach(it=>{ if(it.grp) grpC[it.grp]=(grpC[it.grp]||0)+1; });
    const groups=STANDARDS.groups.map(g=>g.name).filter(n=>grpC[n]);
    let fh=`<div class="vfacet-row"><span class="vfacet-lbl">Area</span><div class="chips">`
      +pill("grp","","All",bySearch.length,!state.grp)
      +groups.map(n=>pill("grp",n,n,grpC[n],state.grp===n)).join("")
      +`</div></div>`;
    /* the two questions a reader actually arrives with: which of these rest on a
       published standard, and which can I check right now against a running site */
    const inGrp=bySearch.filter(it=> !state.grp || it.grp===state.grp);
    const nSpec=inGrp.filter(i=>i.spec).length, nCheck=inGrp.filter(i=>i.check).length;
    if(nSpec||nCheck) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">Has</span><div class="chips">`
      +(nSpec?pill("has","spec","A published spec",nSpec,state.has==="spec"):"")
      +(nCheck?pill("has","check","A hosted checker",nCheck,state.has==="check"):"")
      +`</div></div>`;
    facets.innerHTML=fh;

    const final=bySearch.filter(it=> (!state.grp || it.grp===state.grp)
      && (!state.has || (state.has==="spec" ? it.spec : it.check)));
    if(!final.length){ list.innerHTML=""; list.appendChild(el("div","empty","No standard matches this search.")); return; }
    let html=`<div class="std-bar"><span class="std-count">${final.length} of ${items.length} standards</span>`
      +`<span class="std-toggle" data-all="${state.openAll?"1":"0"}">${state.openAll?"Close all":"Open all"}</span></div>`;
    STANDARDS.groups.forEach(g=>{
      const rows=final.filter(i=>i.grp===g.name); if(!rows.length) return;
      html+=`<div class="grouphead">${esc(g.name)} <span class="gh-status">${rows.length}</span></div>`;
      if(g.gloss) html+=`<p class="std-gloss">${esc(g.gloss)}</p>`;
      rows.forEach(it=>{ html+=stdCardHTML(it); });
    });
    list.innerHTML=html;
    if(state.openAll) list.querySelectorAll(".req.std").forEach(c=>c.classList.add("open"));
  }
  facets.addEventListener("click",e=>{
    const p=e.target.closest(".chip"); if(!p) return;
    if(p.dataset.fg==="has") state.has = (state.has===p.dataset.fv ? "" : p.dataset.fv);
    else state.grp = (p.dataset.fv && state.grp===p.dataset.fv) ? "" : (p.dataset.fv||"");
    redraw();
  });
  list.addEventListener("click",e=>{
    const t=e.target.closest(".std-toggle");
    if(t){ state.openAll=!state.openAll; redraw(); return; }
    const h=e.target.closest(".rq-h"); if(!h) return;
    h.closest(".req").classList.toggle("open");
  });
  setTimeout(()=>{const inp=$("#s-search"); if(inp)inp.oninput=e=>{ state.q=e.target.value.toLowerCase().trim(); redraw(); };},0);
  redraw();
  if(stdScrollTo){ const wanted=stdScrollTo; stdScrollTo=null;
    setTimeout(()=>{ const c=document.getElementById("std-"+wanted); if(c) c.classList.add("open"); scrollToId("std-"+wanted,70,true); },60); }
  return m;
};

/* ============================================================ POLICY
   The national policy instruments: not Acts, not judgments, so not Akoma Ntoso (see
   the loader above). The page is generic over data/policy/policy.json - it renders
   whatever documents that manifest names, in whatever way each of them numbers itself.
   Nothing about the AI regulations is written into this code. */
let policyDocId=null;        // the document the page is showing
let policyScrollTo=null;     // a clause ref to land on when the page next renders
const polUnitShort = doc => ((doc&&doc.unit)||{}).short || "Reg.";
/* "reg_43_3" in the document's own language: Reg. 43(3). The first token is the unit
   prefix the document declares, everything after it is the path down the clause tree. */
function polCiteLabel(ref, doc){
  const p=String(ref||"").split("_"); p.shift();
  const n=p.shift()||"";
  return polUnitShort(doc)+" "+n+p.map(x=>"("+x+")").join("");
}
const polCite = (ref, docId) => `<a class="pcite" data-doc="${esc(docId||"")}" data-clause="${esc(ref)}">`
  +`${esc(polCiteLabel(ref, policyDoc(docId)))}</a>`;
/* Land a citation on the clause it names. The exact anchor is tried first. Failing
   that, the shortest anchor that contains the cited path in order: the draft prints two
   lists a level deeper than it numbers them - 33(3)(i) sits inside item (e), so its
   anchor is reg-33-3-e-i - and a citation should follow the document's numbering, not
   ours. Failing both, the unit itself, so a citation always arrives somewhere true
   rather than nowhere. */
function policyAnchorId(parsed, clause){
  const id=String(clause||"").replace(/_/g,"-");
  if(!parsed) return id;
  if(parsed.anchors.indexOf(id)>=0) return id;
  const want=id.split("-");
  const fits=a=>{ let i=0; a.split("-").forEach(x=>{ if(x===want[i]) i++; }); return i===want.length; };
  const near=parsed.anchors.filter(fits).sort((a,b)=>a.length-b.length)[0];
  return near || want.slice(0,2).join("-");
}
function goPolicyClause(docId, clause){
  policyDocId=docId||policyDocId; policyScrollTo=clause||null;
  _extra={}; if(policyDocId) _extra.doc=policyDocId; if(clause) _extra.clause=clause;
  go("policy", true);
}
function policyDocHTML(d, parsed){
  const meta=[d.issuer, d.made_by && d.made_by!==d.issuer ? d.made_by : "",
              d.dated ? "dated "+d.dated : ""].filter(Boolean).join(" · ");
  let h=`<div class="pol-doc-h">
    <div class="pol-doc-t">${esc(d.title)}</div>
    ${meta?`<div class="pol-doc-m">${esc(meta)}</div>`:""}
    ${d.status?`<div class="pol-status"><span class="pol-dot s-${esc(d.status)}"></span>${esc(d.status)}${d.status_note?` <span class="pol-status-n">${esc(d.status_note)}</span>`:""}</div>`:""}
  </div>`;
  if(d.summary) h+=`<p class="pol-sum">${esc(d.summary)}</p>`;
  if(d.why_it_matters) h+=`<p class="pol-why">${esc(d.why_it_matters)}</p>`;
  const acts=[];
  if(d.source_pdf) acts.push(`<button class="pdf-orig" data-pdf="${esc(DATA_BASE+d.source_pdf)}" data-pdftitle="${esc(d.title)}">${ic('file')}&nbsp; Read the original PDF</button>`);
  if(d.source_url) acts.push(`<a class="pol-src" href="${esc(d.source_url)}" target="_blank" rel="noopener noreferrer">Where it was published</a>`);
  if(acts.length) h+=`<div class="pol-acts">${acts.join("")}</div>`;
  const parts=(parsed.blocks||[]).filter(b=>b.t==="part");
  if(parts.length>1) h+=`<div class="pol-toc"><span class="std-l">Contents</span>`
    +parts.map(p=>`<a class="pol-toc-i" data-jump="${esc(p.id)}">${esc(p.label)}</a>`).join("")+`</div>`;
  h+=`<div class="pol-body">`;
  (parsed.blocks||[]).forEach(b=>{
    if(b.t==="note") h+=`<div class="pol-note"><span class="std-l">Note from this corpus</span>${stdInline(b.text)}</div>`;
    else if(b.t==="part") h+=`<h2 class="pol-part" id="${esc(b.id)}">${esc(b.label)}</h2>`;
    else if(b.t==="unit") h+=`<div class="pol-unit" id="${esc(b.id)}"><span class="pol-num">${esc(b.num)}</span>${esc(b.heading)}</div>`;
    else h+=`<p class="pol-p d${Math.min(b.depth||0,3)}"${b.id?` id="${esc(b.id)}"`:""}>${esc(b.text)}</p>`;
  });
  return h+`</div>`;
}
V.policy=()=>{
  const m=el("div","view-pol");
  const docs=POLICY.documents||[];
  const head=el("div");
  const lede=(POLICY.lede||[]).length ? POLICY.lede
    : ["Instruments that govern how a court runs, rather than how a case is decided."];
  head.innerHTML=`<h1 class="page-title">${esc(POLICY.title||"Policy")}</h1>`
    +lede.map(t=>`<p class="lede">${esc(t)}</p>`).join("");
  m.appendChild(head);
  if(!docs.length){ m.appendChild(el("div","empty","No policy documents are linked from this corpus.")); return m; }
  if(!policyDocId || !policyDoc(policyDocId)) policyDocId=docs[0].id;
  // more than one document: name them all and let the reader pick. With one, the page
  // is the document and a picker of one is furniture.
  if(docs.length>1){
    const pick=el("div","pol-pick");
    pick.innerHTML=docs.map(d=>`<button class="pol-pick-i${d.id===policyDocId?" on":""}" data-doc="${esc(d.id)}">${esc(d.short||d.title)}</button>`).join("");
    pick.onclick=e=>{ const b=e.target.closest(".pol-pick-i"); if(!b) return;
      policyDocId=b.dataset.doc; policyScrollTo=null; _extra={doc:policyDocId}; go("policy", true); };
    m.appendChild(pick);
  }
  const host=el("div","pol-host");
  host.innerHTML=`<div class="ad-loading"><div class="spinner"></div>Loading the document…</div>`;
  m.appendChild(host);
  const d=policyDoc(policyDocId);
  getPolicyMd(d).then(parsed=>{
    if(!parsed){ host.innerHTML=""; host.appendChild(el("div","empty","This document has no text file.")); return; }
    host.innerHTML=policyDocHTML(d, parsed);
    host.querySelectorAll(".pol-toc-i").forEach(a=>a.onclick=()=>scrollToId(a.dataset.jump,70,true));
    if(policyScrollTo){ const want=policyScrollTo; policyScrollTo=null;
      scrollToId(policyAnchorId(parsed, want), 80, true); }
  }).catch(()=>{ host.innerHTML=`<div class="empty">Couldn't load the document. The viewer reads it live, so it must be served over http.</div>`; });
  return m;
};

/* ---- AI policy compliance: a sub-tab of Standards adherence, not a page of its own.
   It answers the same question the standards answer - what is this build measured
   against - but from an instrument rather than from a published standard, so it sits
   inside that page and shares its card, its search and its facets.

   The card's one job beyond the content is provenance. What the document obliges and
   what we suggest building are separated in the data and separated again here, under
   two labels, because a reader who takes our "Automate" line for the Supreme Court's
   requirement has been misled by the design. */
const AIP_BINDS={court:"The court", vendor:"The vendor", both:"Both"};
const aipBinds = b => AIP_BINDS[String(b||"").toLowerCase().trim()] || (b||"");
V.aipolicy=()=>{
  const m=el("div","view-req view-std view-aip");
  const head=el("div");
  head.innerHTML=`<h1 class="page-title">Standards adherence</h1>`+subTabsHTML("standards","aipolicy");
  m.appendChild(head);
  const lede=(AIPOLICY.lede||[]).length ? AIPOLICY.lede : [];
  if(lede.length) m.appendChild(el("div","",lede.map(t=>`<p class="lede">${stdInline(t)}</p>`).join("")));
  const all=aipolItems();
  if(!all.length){ m.appendChild(el("div","empty","No AI policy compliance file is linked from this corpus.")); return m; }

  const controls=el("div","controls");
  controls.innerHTML=`<div class="search"><span class="mag">${ic('search')}</span><input id="a-search" placeholder="Search a compliance - register, audit, incident, disclosure, vendor…"></div>`;
  m.appendChild(controls);
  const facets=el("div","vfacets"); m.appendChild(facets);
  const list=el("div"); list.id="a-list"; list.style.marginTop="10px"; m.appendChild(list);

  const items=all.map(s=>({s, grp:s.group||"", binds:String(s.binds||"").toLowerCase().trim(),
    art:s.artifact||"",
    hay:((s.name||"")+" "+(s.gloss||"")+" "+(s.citation||"")+" "+(s.timing||"")+" "+(s.compliant||"")
        +" "+(s.build||"")+" "+(s.automate||"")+" "+(s.test||"")+" "+(s.note||"")).toLowerCase()}));
  const state={q:"", grp:"", binds:"", art:"", openAll:false};
  const pill=(fg,fv,label,count,active)=>`<span class="chip ${active?'on':''}" data-fg="${fg}" data-fv="${esc(fv)}">${esc(label)}${count!=null?` <span class="c">${count}</span>`:""}</span>`;
  const block=(l,v)=>`<div class="rq-block"><span class="rq-l">${l}</span><div class="rq-v">${v}</div></div>`;

  function aipCardHTML(it){
    const s=it.s;
    const cites=String(s.citation||"").split("·").map(x=>x.trim()).filter(Boolean)
      .map(c=>polCite(c, s.document)).join("");
    const said=[];                                   // the document's half
    if(s.compliant) said.push(block("To be compliant", stdInline(s.compliant)));
    const ours=[];                                   // ours
    if(s.build) ours.push(block("To be built", (s.artifact?`<span class="aip-art">${esc(reqArtifact(s.artifact))}</span>`:"")+stdInline(s.build)));
    if(s.automate) ours.push(block("Automate", stdInline(s.automate)));
    if(s.test) ours.push(block("Test", stdInline(s.test)));
    return `<div class="req std aip" id="aip-${esc(s.id)}" data-aip="${esc(s.id)}">
      <div class="rq-h">
        <div class="rq-stmt std-name">${esc(s.name)}<span class="caret">${ic('chevron-right')}</span></div>
      </div>
      ${s.gloss?`<div class="rq-why">${stdInline(s.gloss)}</div>`:""}
      <div class="aip-facts">
        ${s.binds?`<span class="aip-f"><span class="std-l">Binds</span>${esc(aipBinds(s.binds))}</span>`:""}
        ${s.timing?`<span class="aip-f"><span class="std-l">When</span>${stdInline(s.timing)}</span>`:""}
      </div>
      ${cites?`<div class="aip-cites"><span class="std-l">Citation</span><span class="cites">${cites}</span></div>`:""}
      <div class="rq-full">
        ${said.length?`<div class="aip-band">What the document requires</div><div class="aip-sec">${said.join("")}</div>`:""}
        ${ours.length?`<div class="aip-band aip-ours">What we suggest building <span>our reading, not the Court's</span></div><div class="aip-sec">${ours.join("")}</div>`:""}
        ${s.note?`<div class="rq-block aip-note"><span class="rq-l">Note</span><div class="rq-v">${stdInline(s.note)}</div></div>`:""}
      </div>
    </div>`;
  }
  function redraw(){
    const bySearch=items.filter(it=> !state.q || it.hay.includes(state.q));
    const cnt=(arr,k)=>{ const o={}; arr.forEach(i=>{ if(i[k]) o[i[k]]=(o[i[k]]||0)+1; }); return o; };
    const grpC=cnt(bySearch,"grp");
    const groups=AIPOLICY.groups.map(g=>g.name).filter(n=>grpC[n]);
    let fh="";
    // one jurisdiction is the normal case today, and a facet offering a single choice
    // teaches nothing - it appears when a second jurisdiction does
    if(groups.length>1) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">Jurisdiction</span><div class="chips">`
      +pill("grp","","All",bySearch.length,!state.grp)
      +groups.map(n=>pill("grp",n,n,grpC[n],state.grp===n)).join("")+`</div></div>`;
    const inGrp=bySearch.filter(it=> !state.grp || it.grp===state.grp);
    const bC=cnt(inGrp.filter(i=>!state.art||i.art===state.art),"binds");
    const bOrder=["court","vendor","both"].filter(b=>bC[b]);
    if(bOrder.length) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">Binds</span><div class="chips">`
      +bOrder.map(b=>pill("binds",b,aipBinds(b),bC[b],state.binds===b)).join("")+`</div></div>`;
    const aC=cnt(inGrp.filter(i=>!state.binds||i.binds===state.binds),"art");
    const aOrder=Object.keys(aC).sort((x,y)=>aC[y]-aC[x]||x.localeCompare(y));
    if(aOrder.length) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">To be built</span><div class="chips">`
      +aOrder.map(a=>pill("art",a,reqArtifact(a),aC[a],state.art===a)).join("")+`</div></div>`;
    facets.innerHTML=fh;

    const final=bySearch.filter(it=> (!state.grp||it.grp===state.grp) && (!state.binds||it.binds===state.binds)
      && (!state.art||it.art===state.art));
    if(!final.length){ list.innerHTML=""; list.appendChild(el("div","empty","No compliance matches this search.")); return; }
    let html=`<div class="std-bar"><span class="std-count">${final.length} of ${items.length} compliances</span>`
      +`<span class="std-toggle" data-all="${state.openAll?"1":"0"}">${state.openAll?"Close all":"Open all"}</span></div>`;
    AIPOLICY.groups.forEach(g=>{
      const rows=final.filter(i=>i.grp===g.name); if(!rows.length) return;
      const d=policyDoc(g.document);
      const sub=[rows.length+"", d?d.title:""].filter(Boolean).join(" · ");
      html+=`<div class="grouphead">${esc(g.name)} <span class="gh-status">${esc(sub)}</span></div>`;
      if(g.gloss) html+=`<p class="std-gloss">${esc(g.gloss)}</p>`;
      rows.forEach(it=>{ html+=aipCardHTML(it); });
    });
    list.innerHTML=html;
    if(state.openAll) list.querySelectorAll(".req.aip").forEach(c=>c.classList.add("open"));
  }
  facets.addEventListener("click",e=>{
    const p=e.target.closest(".chip"); if(!p) return;
    const fg=p.dataset.fg, fv=p.dataset.fv;
    if(fg==="grp") state.grp=(fv && state.grp===fv) ? "" : (fv||"");
    else state[fg]=(state[fg]===fv?"":fv);
    redraw();
  });
  list.addEventListener("click",e=>{
    const t=e.target.closest(".std-toggle");
    if(t){ state.openAll=!state.openAll; redraw(); return; }
    if(e.target.closest(".pcite")) return;             // a citation opens the policy page
    const h=e.target.closest(".rq-h"); if(!h) return;
    h.closest(".req").classList.toggle("open");
  });
  setTimeout(()=>{const inp=$("#a-search"); if(inp)inp.oninput=e=>{ state.q=e.target.value.toLowerCase().trim(); redraw(); };},0);
  redraw();
  if(aipScrollTo){ const wanted=aipScrollTo; aipScrollTo=null;
    setTimeout(()=>{ const c=document.getElementById("aip-"+wanted); if(c) c.classList.add("open"); scrollToId("aip-"+wanted,70,true); },60); }
  return m;
};

V.practice=()=>{
  if(!isModelled()) return notModelled();
  const m=el("div"); m.appendChild(scopeBar());
  const head=el("div");
  head.innerHTML=`<h1 class="page-title">Local practice</h1>
    <p class="lede">The part of the domain no Act writes down - how a ${caseById(activeCase).name.toLowerCase()} case is actually filed, moved and disposed on the ground. Field notes from people who run the process, each attributed and cross-checked against the rules; it changes by state.</p>`;
  m.appendChild(head);
  const notes=(PRACTICE_NOTES||[]).slice();
  if(!notes.length){ m.appendChild(el("div","empty","No field notes recorded yet for this case type.")); return m; }
  const statesPresent=[...new Set(notes.map(n=>n.place))];
  const tagsPresent=[...new Set(notes.flatMap(n=>n.tags||[]))].sort();
  const fstate={place:(statesPresent.includes(activeState)?activeState:"all"), tags:new Set()};
  const facets=el("div","vfacets"); m.appendChild(facets);
  const list=el("div","pnotes"); list.style.marginTop="12px"; m.appendChild(list);
  const pill=(fg,fv,label,count,active)=>`<span class="chip ${active?'on':''}" data-fg="${fg}" data-fv="${esc(fv)}">${esc(label)}${count!=null?` <span class="c">${count}</span>`:""}</span>`;

  // status severity (drives the tally order + the card's left accent) and the short tally label
  const SEV={contradicted:3,"reported-allegation":2,"needs-check":2,unverified:1,corroborated:0,verified:0,similar:0};
  const TALLY={contradicted:"contradicted",corroborated:"corroborated","reported-allegation":"reported","needs-check":"to verify",unverified:"unverified",verified:"verified",similar:"similar"};
  const accordion=(title,count,peekHTML,bodyHTML)=>{
    const isTally=/pn-tstat/.test(peekHTML||"");
    return `<div class="pn-acc${isTally?" pn-acc-verif":""}"><button class="pn-acc-head" aria-expanded="false"><span class="pn-acc-title">${esc(title)}${count!=null?`<span class="pn-acc-n">${count}</span>`:""}</span><span class="${isTally?"pn-tally":"pn-acc-peek"}">${peekHTML||""}</span><span class="pn-acc-chev">${ic("chevron-down")}</span></button><div class="pn-acc-body"><div class="pn-acc-inner">${bodyHTML}</div></div></div>`;
  };
  // one card - scan layer always visible, detail behind accordions. Generic over the note schema.
  function pnote(n){
    const c=el("div","pnote");
    // this list is cross-state, so a note's cites must resolve against the aliases of
    // the state the note came from - never against whichever state happens to be active.
    const cchip=x=>citeChip(x, stateAliasMap(n.place));
    if(n.id) c.id="pnote-"+n.id;   // target for "field note" backlinks from vocab terms / roles
    const A=n.attribution||{};
    const heard=A.heardFrom?`${esc(A.heardFrom)}${A.affiliation?` (${esc(A.affiliation)})`:""}`:(n.who?esc(n.who):"");
    const secondhand=A.secondhand?`<span class="pn-2nd" title="${esc(A.originalSource||'relayed; may be secondhand')}">relayed · may be secondhand</span>`:"";
    const statement=n.statement||n.quote||"";
    const place=esc((stateById(n.place)||{}).name||n.place);
    const tags=(n.tags||[]).map(t=>`<span class="pn-tag">${esc(String(t).replace(/-/g,' '))}</span>`).join("");
    const claims=(n.verification&&n.verification.claims)||[];
    const counts={}; claims.forEach(cl=>{const s=String(cl.status||"unverified"); counts[s]=(counts[s]||0)+1;});
    const tally=Object.keys(counts).sort((a,b)=>(SEV[b]??1)-(SEV[a]??1)).map(s=>`<span class="pn-tstat pn-tstat-${esc(s)}"><i class="pn-dot"></i>${counts[s]} ${esc(TALLY[s]||s.replace(/-/g,' '))}</span>`).join("");
    const maxSev=claims.reduce((mx,cl)=>Math.max(mx,SEV[String(cl.status)]??1),-1);
    c.dataset.verdict = maxSev<0?"none":maxSev>=3?"contradicted":maxSev>=1?"caution":"clear";
    const verBody=`<ul class="pn-claims">`+claims.map(cl=>{
      const st=String(cl.status||"unverified");
      const stLabel=TALLY[st]||st.replace(/-/g,' ');
      const ev=(cl.evidence||[]).map(cchip).join(", ");
      const meta=[cl.method,cl.by,cl.on].filter(Boolean).join(" · ");
      let subs="";
      if(meta) subs+=`<div class="pn-claim-sub">${esc(meta)}</div>`;
      if(cl.note) subs+=`<div class="pn-claim-sub">${esc(cl.note)}</div>`;
      if(cl.toCheck) subs+=`<div class="pn-claim-sub">To check: ${esc(cl.toCheck)}</div>`;
      if(ev) subs+=`<div class="pn-claim-sub">Evidence: ${ev}</div>`;
      return `<li class="pn-claim pn-st-${esc(st)}"><i class="pn-dot"></i><div class="pn-claim-body"><div class="pn-claim-hd"><span class="pn-claim-st">${esc(stLabel)}</span> ${esc(cl.claim||"")}</div>${subs}</div></li>`;
    }).join("")+`</ul>`;
    const verAcc=claims.length?accordion("Verification",claims.length,tally,verBody):"";
    const I=n.impact||{};
    let impAcc="";
    if(I.changed===false){ impAcc=accordion("What it changed",null,"changed nothing",`<div class="pn-sub">Changed nothing in the model.${I.reason?` ${esc(I.reason)}`:""}</div>`); }
    else {
      const ch=(I.changes||[]).map(x=>`<li><a class="pn-change" data-unit="${esc(x.unit||'')}" data-ref="${esc(x.ref||'')}" data-label="${esc(x.label||'')}">${esc(x.op||"changed")} ${esc(x.unit||"")} · ${esc(x.label||x.ref||"")}</a></li>`).join("");
      const law=(I.relatesToLaw||[]).map(cchip).join(", ");
      const units=[...new Set((I.changes||[]).map(x=>x.unit).filter(Boolean))].join(" · ");
      const body=`${ch?`<ul class="pn-bullets">${ch}</ul>`:""}${law?`<div class="pn-claim-sub">Relates to law: ${law}</div>`:""}`;
      if(body) impAcc=accordion("What it changed",(I.changes||[]).length,units,body);
    }
    const cmpBody=`<ul class="pn-claims">`+(n.compare||[]).map(x=>`<li class="pn-claim pn-st-${esc(x.relation||'')}"><i class="pn-dot"></i><div class="pn-claim-body"><div class="pn-claim-hd"><span class="pn-claim-st">${esc(x.relation||'')}</span> ${esc((stateById(x.place)||{}).name||x.place)}: ${esc(x.note||'')}</div></div></li>`).join("")+`</ul>`;
    const cmpAcc=(n.compare||[]).length?accordion("Across states",n.compare.length,"",cmpBody):"";
    c.innerHTML=`
      <div class="pn-top">${n.serial?`<span class="pn-serial">${esc(n.serial)}</span>`:""}${tags?`<div class="pn-tags">${tags}</div>`:""}</div>
      <blockquote class="pn-q"><span class="pn-q-ico">${ic("messages-square")}</span><span class="pn-q-t">${esc(statement)}</span></blockquote>
      <button class="pn-more" hidden>more</button>
      <div class="pn-who">${heard}${heard?" · ":""}${place}${n.date?` · ${esc(n.date)}`:""} ${secondhand}</div>
      ${verAcc}${impAcc}${cmpAcc}`;
    c.querySelectorAll(".pn-acc-head").forEach(h=>h.onclick=()=>{ const open=h.parentElement.classList.toggle("open"); h.setAttribute("aria-expanded",open?"true":"false"); });
    const qt=c.querySelector(".pn-q-t"), more=c.querySelector(".pn-more");
    qt.classList.add("is-clamped");
    requestAnimationFrame(()=>{ if(qt.scrollHeight-qt.clientHeight>2){ more.hidden=false; more.onclick=()=>{ const clamped=qt.classList.toggle("is-clamped"); more.textContent=clamped?"more":"less"; }; } });
    return c;
  }
  function redraw(){
    const filtered=notes.filter(n=>(fstate.place==="all"||n.place===fstate.place)&&(!fstate.tags.size||(n.tags||[]).some(t=>fstate.tags.has(t))));
    let fh=`<div class="vfacet-row"><span class="vfacet-lbl">State</span><div class="chips">`
      +pill("place","all","All states",notes.length,fstate.place==="all")
      +statesPresent.map(s=>pill("place",s,(stateById(s)||{}).name||s,notes.filter(n=>n.place===s).length,fstate.place===s)).join("")
      +`</div></div>`;
    if(tagsPresent.length) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">Tags</span><div class="chips">`+tagsPresent.map(t=>pill("tag",t,String(t).replace(/-/g,' '),notes.filter(n=>(n.tags||[]).includes(t)).length,fstate.tags.has(t))).join("")+`</div></div>`;
    facets.innerHTML=fh;
    list.innerHTML="";
    if(!filtered.length){ list.appendChild(el("div","empty","No field notes match these filters.")); return; }
    const byState={}; filtered.forEach(n=>{(byState[n.place]=byState[n.place]||[]).push(n);});
    Object.keys(byState).forEach(pl=>{
      list.appendChild(el("div","grouphead",`${esc((stateById(pl)||{}).name||pl)} <span class="gh-status">${byState[pl].length} note${byState[pl].length>1?'s':''}</span>`));
      byState[pl].forEach(n=>list.appendChild(pnote(n)));
    });
  }
  facets.addEventListener("click",e=>{ const p=e.target.closest(".chip"); if(!p) return; const fg=p.dataset.fg, fv=p.dataset.fv; if(fg==="place") fstate.place=fv; else if(fg==="tag"){ if(fstate.tags.has(fv)) fstate.tags.delete(fv); else fstate.tags.add(fv); } redraw(); });
  redraw();
  // arrived here from a "field note" backlink: make sure that note is visible, then scroll to and open it
  if(practiceScrollTo){
    const wanted=practiceScrollTo; practiceScrollTo=null;
    const target=notes.find(n=>n.id===wanted);
    if(target){ fstate.place=(target.place && statesPresent.includes(target.place))?target.place:"all"; fstate.tags.clear(); redraw(); }
    setTimeout(()=>{
      const card=document.getElementById("pnote-"+wanted);
      if(card){
        card.querySelectorAll(".pn-acc-head").forEach(h=>{ if(h.getAttribute("aria-expanded")!=="true") h.click(); });
        card.classList.add("word-flash"); setTimeout(()=>card.classList.remove("word-flash"),1600);
        scrollToId("pnote-"+wanted, 16, false);
      }
    },40);
  }
  return m;
};

/* State objects - the state layer on top of the shared national core.
   Not in the corpus yet; each is a planned placeholder that names the state. */
function stateInlineSelectHTML(){
  return `<span class="state-inline-wrap">${ic('map-pin')}<select class="state-inline" aria-label="Choose state">${JURISDICTIONS.map(s=>`<option value="${s.id}"${s.id===activeState?' selected':''}>${esc(s.name)}</option>`).join("")}</select></span>`;
}
function instrumentCard(it){
  const c=el("div","instrument");
  const acts=[];
  if(it.akn) acts.push(`<button class="stdoc" data-akn="${esc(it.akn)}" data-title="${esc(it.title)}" data-sub="${esc(it.cite||'')}"${it.pdf?` data-pdf="${esc(DATA_BASE+it.pdf)}"`:''}>${ic('book-open')} Read full text</button>`);
  if(it.pdf) acts.push(`<button class="pdf-orig" data-pdf="${esc(DATA_BASE+it.pdf)}" data-pdftitle="${esc(it.title)}">${ic('file')} Original PDF</button>`);
  c.innerHTML=`<div class="inst-title">${esc(it.title)}</div>${it.cite?`<div class="inst-cite">${esc(it.cite)}</div>`:''}${it.note?`<div class="inst-note">${it.note}</div>`:''}<div class="inst-actions">${acts.join("")}</div>`;
  return c;
}
function stateObjectView(catKey, title, fallbackBlurb){
  return ()=>{
    if(!isModelled()) return notModelled();
    const st=stateById(activeState).name;
    const data = STATE_DATA && STATE_DATA[catKey];
    const m=el("div"); m.appendChild(scopeBar());
    const head=el("div");
    const lede = data && data.summary ? data.summary : `${fallbackBlurb} These sit on top of the shared national core and change from state to state, so pick the jurisdiction above.`;
    head.innerHTML=`<h1 class="page-title state-title">${esc(title)} ${stateInlineSelectHTML()}</h1>
      <p class="lede">${lede}</p>`;
    m.appendChild(head);
    const sel=m.querySelector(".state-inline");
    if(sel) sel.onchange=e=>{ activeState=e.target.value; loadStateData().then(()=>{ buildNav(); go(currentView); }); };
    const items = (data && data.items) || [];
    if(items.length){
      const list=el("div","instruments");
      items.forEach(it=>list.appendChild(instrumentCard(it)));
      m.appendChild(list);
    } else if(data && data.summary){
      m.appendChild(el("div","empty",`Nothing separate to list here for ${esc(st)} - the point above is the whole story.`));
    } else {
      m.appendChild(el("div","empty",`<b>${esc(st)} - ${esc(title.toLowerCase())} not modelled yet.</b><br><span class="tiny">This state-layer object is planned. It will carry ${esc(st)}'s own ${esc(title.toLowerCase())} over the same national core, the way the national objects already do.</span>`));
    }
    return m;
  };
}
V.amendments   = stateTreeView("amendments","Acts & Provisions");   // state Acts, organised like National objects
V.staterules   = stateTreeView("rules","State rules");             // state rules, same browsable tree
V.notifications= stateTreeView("notifications","Notifications & orders");   // G.O.s / SOPs, same browsable tree (rich items carry akn+key+edges)

/* ============================================================ STATE STORY
   A per-state narrative of how a §138 case actually runs - process (filing to
   disposal), the roles and the fees - each step citing the rule/Act that governs
   it (click a citation to open the verbatim text). The court-specific blocks
   (the designated s138 courts and the per-court caseload) live on the Courts
   page, which the story links out to. */
/* Alias -> instrument, for ONE state. A cite carries a short alias ("kcf", "gcf")
   that only means anything inside its own state's layer, and aliases are not
   guaranteed unique across states - so every caller must pass the state the cited
   item belongs to. Defaults to the active state for the single-state views.
   Memoised per state; the cache is cleared whenever the layers are reloaded. */
function stateAliasMap(stId){
  const id=stId||activeState;
  if(_aliasCache[id]) return _aliasCache[id];
  const map={}; const D=STATES_DATA[id]||{};
  ["amendments","rules","notifications"].forEach(cat=>{
    ((D[cat]||{}).items||[]).forEach(it=>{ if(it.alias) map[it.alias]={akn:it.akn,title:it.title}; });
  });
  _aliasCache[id]=map; return map;
}
function citeChip(c, amap){
  const lbl=esc(c.l||c.n||"");
  if(c.n && SOURCES[(c.n.split(":")[0])]) return `<a class="cite" data-nat="${esc(c.n)}">${lbl}</a>`;
  if(c.s){ const m=amap[c.s]; if(m && m.akn) return `<a class="cite" data-akn="${esc(m.akn)}" data-eid="${esc(c.e||'')}" data-title="${esc(m.title||'')}">${lbl}</a>`; }
  return `<span class="cite cite-plain">${lbl}</span>`;
}
function citeRow(list, amap){
  // state-agnostic: a step/role with no state cite either runs on uniform central law
  // or is local practice with no statute pinned - either way, no state-specific citation.
  if(!list || !list.length) return `<span class="cite cite-none">no state-specific citation</span>`;
  return `<span class="cites">${list.map(c=>citeChip(c,amap)).join("")}</span>`;
}
const ROLE_CATS={
  litigant:{label:"Litigant", icon:"user"},
  advocate:{label:"Advocate", icon:"briefcase"},
  advclerk:{label:"Advocate clerk", icon:"user"},
  judge:{label:"Judge", icon:"gavel"},
  staff:{label:"Court staff", icon:"users"},
  police:{label:"Police", icon:"shield"},
  bank:{label:"Bank", icon:"landmark"},
  witness:{label:"Witness", icon:"user-check"},
};
/* Institutions (police & courts): hierarchy ladders + role cards, each grounded in a
   provision. Data-driven from INST.police / INST.judiciary; state's own or the national
   baseline. Design: clean rows, a seniority index instead of a left accent, cite chips. */
function instRow(it, amap, idx){
  const aka=(it.aka&&it.aka.length)?`<span class="inst-aka">also ${it.aka.map(esc).join(" · ")}</span>`:"";
  const svc=it.service?`<span class="inst-svc">${esc(it.service)}</span>`:"";
  const cites=(it.cite&&it.cite.length)?`<span class="cites">${it.cite.map(c=>citeChip(c,amap)).join("")}</span>`
             :(it.basis?`<span class="role-basis">${esc(it.basis)}</span>`:"");
  const prov=(it.sourceNotes&&it.sourceNotes.length)?`<a class="src-note" data-note="${esc(it.sourceNotes[0])}">${ic('messages-square')} field note</a>`:"";
  const lines=[];
  if(it.head) lines.push(`<div class="inst-line"><span class="inst-l">Head</span> ${esc(it.head)}</div>`);
  if(it.who) lines.push(`<div class="inst-who">${esc(it.who)}</div>`);
  if(it.entry) lines.push(`<div class="inst-line"><span class="inst-l">Entry</span> ${esc(it.entry)}</div>`);
  if(it.role) lines.push(`<div class="inst-line"><span class="inst-l">In §138</span> ${esc(it.role)}</div>`);
  return `<div class="inst-row"${it.id?` id="inst-${esc(it.id)}"`:""}>
    ${idx!=null?`<span class="inst-idx">${idx}</span>`:`<span class="inst-dot"></span>`}
    <div class="inst-body">
      <div class="inst-hd"><span class="inst-name">${esc(it.name)}</span>${svc}${aka}</div>
      ${lines.join("")}
      ${(cites||prov)?`<div class="inst-cite">${cites}${prov}</div>`:""}
    </div></div>`;
}
/* the List view for one institution (police or courts) - the grounded ladders */
function instListInner(kind, data, amap){
  const sub=(label,items,ranked)=> (items&&items.length)
    ? `<div class="inst-group"><div class="inst-sub-label">${esc(label)}</div><div class="inst-ladder">${items.map((it,i)=>instRow(it,amap,ranked?i+1:null)).join("")}</div></div>` : "";
  if(kind==="police") return sub("Ranks - senior to junior",data.ranks,true)+sub("How the force is organised",data.units,false)+sub("Oversight bodies",data.oversight,false);
  return sub("The court hierarchy - apex to trial court",data.tiers,true)+sub("The people in the courts",data.roles,false);
}
/* a section heading, shared by the story page and the institution pages. The id
   stays "story-<id>" so existing deep links and goStorySection() still resolve. */
function secHead(id,t,sub){
  const d=el("div","story-sec-h",`<span>${esc(t)}</span>${sub?`<span class="ssh-sub">${esc(sub)}</span>`:''}`);
  d.id="story-"+id; return d;
}
/* the state's designated §138 courts and its per-court caseload table. Both are
   court content, so they render on the Courts page. Returns [] for a state that
   models neither (e.g. Haryana), so the page simply ends after the detail list. */
function courtsStoryBlocks(amap){
  const S=(STATE_DATA||{}).story || {};
  const out=[];
  if(S.courts){
    out.push(secHead("courts","The designated courts", S.courts.summary));
    const cb=el("div","court-block");
    (S.courts.designated||[]).forEach(ct=>{
      const card=el("div","court-card");
      card.innerHTML=`<div class="court-name">${esc(ct.name)}</div>
        <div class="court-loc">${ic('map-pin')} ${esc(ct.location||'')}</div>
        ${ct.basis?`<div class="court-basis">${esc(ct.basis)}</div>`:''}
        ${ct.cite?`<div class="court-cite">${citeChip(ct.cite,amap)}</div>`:''}`;
      cb.appendChild(card);
    });
    out.push(cb);
  }
  if(S.caseload){
    out.push(secHead("caseload","Caseload - by court", S.caseload.summary));
    const cols=S.caseload.columns||["Court","Location","Pending","Disposed"];
    let html=`<table class="caseload"><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>`;
    (S.caseload.rows||[]).forEach(r=>{
      html+=`<tr><td>${esc(r.court||'')}</td><td>${esc(r.location||'')}</td><td class="ph">${r.pending==null?'-':esc(String(r.pending))}</td><td class="ph">${r.disposed==null?'-':esc(String(r.disposed))}</td></tr>`;
    });
    html+=`</tbody></table>`;
    const cw=el("div","caseload-wrap"); cw.innerHTML=html; out.push(cw);
    if(S.caseload.note) out.push(el("div","story-note",`${esc(S.caseload.note)}`));
  }
  return out;
}
/* a card on the story page that links out to a Police / Courts page */
function instLinkCard(view, title, icon, summary){
  const c=el("a","inst-link");
  c.innerHTML=`<div class="inst-link-hd"><span class="inst-link-ico">${ic(icon)}</span><span class="inst-link-t">${esc(title)}</span><span class="inst-link-arrow">${ic('chevron-right')}</span></div>
    <div class="inst-link-sub">${esc((summary||"").replace(/\s+/g," ").slice(0,140))}${(summary||"").length>140?"…":""}</div>`;
  c.onclick=()=>{ _extra={}; go(view, true); };
  return c;
}
/* Police / Courts are their own pages. Each renders the heading and summary,
   then the full cited detail for every role and unit. */
function institutionPage(kind, title){
  if(!isModelled()) return notModelled();
  const stName=stateById(activeState).name;
  const INST=((STATE_DATA||{}).institutions) || NATIONAL_INSTITUTIONS;
  const data = kind==="police" ? (INST&&INST.police) : (INST&&INST.judiciary);
  const m=el("div"); m.appendChild(scopeBar());
  const head=el("div");
  head.innerHTML=`<a class="backlink">&larr; Back to the story</a>
    <h1 class="page-title state-title">${esc(title)} ${stateInlineSelectHTML()}</h1>
    <p class="lede">${data?esc(data.summary):`Not modelled for ${esc(stName)} yet.`}</p>`;
  m.appendChild(head);
  const sel=head.querySelector(".state-inline"); if(sel) sel.onchange=e=>{ activeState=e.target.value; loadStateData().then(()=>{ buildNav(); go(currentView); }); };
  const bl=head.querySelector(".backlink"); if(bl) bl.onclick=()=>{ _extra={sec:"story-roles"}; go("story", true); };
  if(!data){ m.appendChild(el("div","empty",`Not modelled for ${esc(stName)} yet.`)); return m; }
  const amap=stateAliasMap();
  const det=el("div","inst"); det.style.marginTop="26px";
  det.innerHTML=`<div class="inst-sub-label" style="margin-bottom:12px">Full detail - every role and unit, with its source</div>`+instListInner(kind,data,amap);
  m.appendChild(det);
  // the court-specific story blocks (designated §138 courts, caseload) belong here,
  // after the full detail. Empty for a state that has neither.
  if(kind==="courts") courtsStoryBlocks(amap).forEach(n=>m.appendChild(n));
  return m;
}
V.police=()=>institutionPage("police","Police");
V.courts=()=>institutionPage("courts","The courts");

V.story=()=>{
  if(!isModelled()) return notModelled();
  const stName=stateById(activeState).name;
  const S=(STATE_DATA||{}).story;
  const proc=(S&&S.process)||NATIONAL_PROCESS;         // state's own process, else the shared central one
  const usingNat=!(S&&S.process)&&!!proc;              // showing only the central-law baseline
  const m=el("div"); m.appendChild(scopeBar());
  const head=el("div");
  const lede = S ? esc(S.summary)
             : proc ? `The prescribed procedure under central law. ${esc(stName)}'s own rules of practice, roles and timings are not modelled yet - only the shared national process is shown.`
             : `The ${esc(stName)} story isn't modelled yet.`;
  head.innerHTML=`<h1 class="page-title state-title">How a §138 case runs ${stateInlineSelectHTML()}</h1><p class="lede">${lede}</p>`;
  m.appendChild(head);
  const sel=m.querySelector(".state-inline"); if(sel) sel.onchange=e=>{ activeState=e.target.value; loadStateData().then(()=>{ buildNav(); go(currentView); }); };
  if(!S && !proc){ m.appendChild(el("div","empty",`<b>${esc(stName)} - story not modelled yet.</b><br><span class="tiny">The process, fees, courts and caseload for this state are planned - the same shape as Kerala.</span>`)); return m; }
  const amap=stateAliasMap();
  const secH=secHead;

  // 1 - PROCESS (a timeline, viewed through one of three lenses via tabs)
  if(proc){
    m.appendChild(secH("process","The process - filing to disposal", proc.summary));
    if(usingNat) m.appendChild(el("div","story-note story-note-loose",`This is the prescribed central-law process, shared by every state. ${esc(stName)}'s own rules, timings and roles are layered on as they are processed.`));
    // lens tabs - only where the stages actually carry per-lens timing (the Kerala
    // prescribed/regular/ON-Court model). A state that documents just one flow (e.g.
    // a filing-stage layer) has no timing, so the tabs are suppressed.
    const ALL_LENSES=[["prescribed","Prescribed","under the rules"],["regular","Regular court","typical timeline"],["oncourt","ON Court","24×7 special court"]];
    // show a lens only where the data actually has values for it: a state that records
    // statutory deadlines but no observed durations (Haryana) gets no empty tabs, and a
    // state with a single documented flow gets no tab bar at all.
    const LENSES=ALL_LENSES.filter(([id])=>(proc.stages||[]).some(st=>st.timing && st.timing[id]));
    const hasTiming=LENSES.length>1;
    if(LENSES.length && !LENSES.some(([id])=>id===processLens)) processLens=LENSES[0][0];
    const tabs=el("div","proc-tabs");
    tabs.innerHTML=LENSES.map(([id,label,sub])=>`<button class="proc-tab tab-${id} ${processLens===id?'on':''}" data-lens="${id}"><span class="pt-main">${esc(label)}</span><span class="pt-sub">${esc(sub)}</span></button>`).join("");
    const procSec=el("div","proc-section");
    procSec.appendChild(el("div","proc-sentinel"));   // marks where the tabs start, for stuck-detection
    if(hasTiming) procSec.appendChild(tabs);
    const tl=el("div","timeline lens-"+processLens);
    (proc.stages||[]).forEach((st,i)=>{
      const raw=String(st.stage||"");
      const num=(raw.split("·")[0].trim().split(".")[0].trim())||String(i+1);
      const title=raw.replace(/^\s*\d+\s*[·.\-]\s*/,"");
      const item=el("div","tl-item");
      if(st.id) item.id="procstage-"+st.id;   // target for "what it changed" links from field notes
      let html=`<div class="tl-marker">${esc(num)}</div><div class="tl-content"><div class="tl-stage-title">${esc(title)}</div>`;
      const t=st.timing;
      if(t){
        const tv=(cls,val)=>`<span class="tl-t ${cls}"><span class="tl-tclock">${ic('clock')}</span><span class="tl-tval">${val}</span></span>`;
        html+=`<div class="tl-timing">`
          +tv("tl-presc", t.prescribed?esc(t.prescribed):"No fixed limit")
          +tv("tl-reg", esc(t.regular||"-"))
          +tv("tl-on", esc(t.oncourt||"-"))
          +`</div>`;
      }
      html+=`<div class="tl-steps">`;
      (st.steps||[]).forEach(sp=>{ html+=`<div class="pstep"><div class="pstep-t">${esc(sp.t)}</div>${citeRow(sp.c,amap)}</div>`; });
      html+=`</div></div>`;
      item.innerHTML=html;
      tl.appendChild(item);
    });
    procSec.appendChild(tl);
    if(proc.timing_note) procSec.appendChild(el("div","story-note story-note-loose",esc(proc.timing_note)));
    m.appendChild(procSec);
    if(hasTiming){
    tabs.querySelectorAll(".proc-tab").forEach(b=>b.onclick=()=>{
      processLens=b.dataset.lens;
      tabs.querySelectorAll(".proc-tab").forEach(x=>x.classList.toggle("on", x.dataset.lens===processLens));
      tl.className="timeline lens-"+processLens;
      writeHash(false);   // reflect the lens in the URL
    });
    // pin the lens tabs while scrolling the process, slide them to the right when stuck, release at the section end
    if("IntersectionObserver" in window){
      const io=new IntersectionObserver(([e])=>{
        const stuck = !e.isIntersecting;
        tabs.classList.toggle("is-stuck", stuck);
        // slide to the right edge of the section when stuck (skip when the bar is full-width on mobile)
        const avail = procSec.clientWidth - tabs.offsetWidth;
        tabs.style.transform = (stuck && avail>4) ? "translateX("+avail+"px)" : "";
      }, {rootMargin:"-14px 0px 0px 0px", threshold:0});
      io.observe(procSec.querySelector(".proc-sentinel"));
    }
    }
  }
  // 2 - FEES
  if(S && S.fees){
    m.appendChild(secH("fees","The fees", S.fees.summary));
    const fb=el("div","fee-block");
    if(S.fees.cite) fb.appendChild(el("div","fee-cite",`Source: ${citeChip(S.fees.cite,amap)}`));
    (S.fees.items||[]).forEach(it=>{
      fb.appendChild(el("div","fee-row",`<span class="fee-stage">${esc(it.stage)}</span><span class="fee-amt">${esc(it.fee)}</span>`));
    });
    if(S.fees.note) fb.appendChild(el("div","story-note",esc(S.fees.note)));
    m.appendChild(fb);
  }
  // 3 - ROLES (a collapsible accordion) + links out to the Police and Courts pages.
  // Last on the page, so the order matches the sidebar sub-nav, where Police and
  // Courts hang off The roles.
  if(S && S.roles){
    const items=S.roles.items||[];
    const accH=el("div","story-sec-h story-acc open"); accH.id="story-roles";
    accH.innerHTML=`<span>The roles <span class="story-acc-n">${items.length}</span></span>${S.roles.summary?`<span class="ssh-sub">${esc(S.roles.summary)}</span>`:""}<span class="story-acc-chev">${ic('chevron-down')}</span>`;
    const body=el("div","story-acc-body open");
    const rb=el("div","role-block"); body.appendChild(rb);
    items.forEach(r=>{
      const src = (r.cite && r.cite.length) ? citeRow(r.cite,amap)
                : (r.basis?`<span class="role-basis">${esc(r.basis)}</span>`:"");
      const cat=ROLE_CATS[r.cat]||ROLE_CATS.litigant;
      const flag = r.informal ? `<span class="role-flag" title="Some aspects are informal - see the field note">informal aspects</span>` : "";
      const prov = (r.sourceNotes&&r.sourceNotes.length) ? `<a class="role-prov src-note" data-note="${esc(r.sourceNotes[0])}">${ic('messages-square')} field note</a>` : "";
      const card=el("div","role-card role-"+(r.cat||"litigant"));
      if(r.id) card.id="role-"+r.id;
      card.innerHTML=`<div class="role-top"><span class="role-ico">${ic(cat.icon)}</span>
        <div class="role-id"><div class="role-name">${esc(r.role)}</div><div class="role-cat">${esc(cat.label)}</div></div></div>
        <div class="role-who">${esc(r.who)}</div>
        ${(src||flag||prov)?`<div class="role-src">${src?`<span class="role-src-l">From</span> ${src}`:""}${flag}${prov}</div>`:""}`;
      rb.appendChild(card);
    });
    accH.onclick=()=>{ const open=accH.classList.toggle("open"); body.classList.toggle("open",open); };
    m.appendChild(accH); m.appendChild(body);
  }
  // 2b - Police & the Courts now live on their own pages; link out from the story
  const INST=((STATE_DATA||{}).institutions) || NATIONAL_INSTITUTIONS;
  if(INST && (INST.police || INST.judiciary)){
    const links=el("div","inst-links");
    if(INST.police) links.appendChild(instLinkCard("police","Police","shield", INST.police.summary));
    if(INST.judiciary) links.appendChild(instLinkCard("courts","The courts","gavel", INST.judiciary.summary));
    m.appendChild(links);
  }
  // the designated courts and the caseload table now live on the Courts page,
  // reached from the link card above.
  return m;
};
async function openStateCiteModal(akn,eId,title){
  const modal=$("#modal"), body=$("#modal-body");
  body.innerHTML=`<div class="ad-loading"><div class="spinner"></div>Loading the provision…</div>`;
  modal.classList.add("show"); document.body.style.overflow="hidden";
  try{
    const d=await getStateSection(akn,eId);
    body.innerHTML="";
    const wrap=el("div");
    wrap.appendChild(el("div","actdoc-h",`<div class="ad-title">${esc(title||'Provision')}</div>`));
    setModalPdf(null);
    const bodyEl=el("div","actdoc-body");
    if(d){ const sec=el("div","ad-sec"); sec.innerHTML=`<div class="ad-sec-h"><span class="ad-num">${esc(d.num||'')}</span>${esc(d.heading||'')}</div>`+renderBody(d.body,"ad"); bodyEl.appendChild(sec); }
    else bodyEl.appendChild(el("div","callout amber",`Text not found for ${esc(eId)}.`));
    wrap.appendChild(bodyEl); body.appendChild(wrap); body.scrollTop=0;
  }catch(e){ body.innerHTML=`<div class="ad-loading">Couldn't load this provision.<br><br>The viewer reads the <code>.akn.xml</code> files live, so it must be served over http.</div>`; }
}

/* ============================================================ THE 138 MAP (React Flow)
   Build a {nodes, edges} model of what shapes a s138 case: the national core
   provisions, and the active state's Acts / rules / notifications wired to the
   national provisions they operationalise (using the made_under + edges already
   in the data). Rendered by flow.js. */
function gLabelNat(ref){
  const a=SOURCES[ref.split(":")[0]];
  if(a) return refLabel(ref);
  const [al,eid]=ref.split(":");
  return (eid||"").replace("sec_","§").replace("art_","Art. ").replace(/_/g," ")+" · "+al;
}
function openNat(ref){ const [act,eid]=ref.split(":"); if(SOURCES[act]) openActModal(act,eid); }
function openPdf(url,title){ if(window.openPdfModal) window.openPdfModal(url,title); else window.open(url,"_blank"); }
function buildGraphModel(){
  const nodes=[], edges=[]; const nat={};
  const COLX={inst:0, key:520, nat:1080};
  const KROW=94, GAP=40;
  function natNode(ref){
    if(nat[ref]) return "nat:"+ref;
    nat[ref]={id:"nat:"+ref, type:"card", position:{x:COLX.nat,y:0},
      data:{label:gLabelNat(ref), sub:"national", cat:"national", open:SOURCES[ref.split(":")[0]]?()=>openNat(ref):null}};
    return "nat:"+ref;
  }
  // the offence, at the heart
  natNode("ni:sec_138");
  nat["ni:sec_138"].data.cat="case";
  nat["ni:sec_138"].data.sub="the offence";
  // core national provisions of a s138 case, hung off the offence
  [["ni:sec_139","presumption"],["ni:sec_142","cognizance & jurisdiction"],["ni:sec_143","summary trial"],
   ["ni:sec_144","service of summons"],["ni:sec_145","evidence on affidavit"],["ni:sec_147","compounding"]]
    .forEach(([ref,rel])=>{ if(SOURCES[ref.split(":")[0]] && PROVISIONS.some(p=>p.ref===ref)){ const nid=natNode(ref); edges.push({id:"core:"+nid, source:"nat:ni:sec_138", target:nid, label:rel}); } });

  const D=STATE_DATA||{};
  const insts=[...(((D.amendments||{}).items)||[]).map(x=>({...x,cat:"law"})),
               ...(((D.rules||{}).items)||[]).map(x=>({...x,cat:"rule"}))];
  let ky=20;
  insts.forEach((it,ii)=>{
    const keys=it.key||[]; const startY=ky;
    keys.forEach(k=>{
      const kid="key:"+ii+":"+k.eId;
      nodes.push({id:kid, type:"card", position:{x:COLX.key,y:ky},
        data:{label:stEidNum(k.eId)+" "+(k.label||""), sub:it.cite||"", cat:"rule",
          open:it.akn?()=>openStateDocModal(it.akn,it.title,it.cite||"",it.pdf?(DATA_BASE+it.pdf):"",k.eId):null}});
      edges.push({id:"in"+ii+">"+kid, source:"inst:"+ii, target:kid});
      (k.edges||[]).forEach(e=>{ const nid=natNode(e.to); edges.push({id:kid+">"+nid, source:kid, target:nid, label:e.rel}); });
      ky+=KROW;
    });
    const instY = keys.length ? (startY+(keys.length-1)*KROW/2) : ky;
    if(!keys.length) ky+=KROW;
    nodes.push({id:"inst:"+ii, type:"card", position:{x:COLX.inst,y:instY},
      data:{label:it.title, sub:it.cite||(it.cat==="law"?"state Act":"state rules"), cat:it.cat,
        open:it.akn?()=>openStateDocModal(it.akn,it.title,it.cite||"",it.pdf?(DATA_BASE+it.pdf):""):(it.pdf?()=>openPdf(DATA_BASE+it.pdf,it.title):null)}});
    (it.made_under||[]).forEach(e=>{ const nid=natNode(e.to); edges.push({id:"in"+ii+"mu"+nid, source:"inst:"+ii, target:nid, label:e.rel||"made under"}); });
    ky+=GAP;
  });
  // notifications: link to the e-filing rules instrument if present (short edge), else to the offence
  const efiling = nodes.find(n=>/^inst:/.test(n.id) && /electronic filing/i.test(n.data.label));
  (((D.notifications||{}).items)||[]).forEach((it,ni)=>{
    const id="notif:"+ni;
    const ipos = efiling ? efiling.position.y+52 : ky;
    nodes.push({id, type:"card", position:{x:COLX.inst,y:ipos},
      data:{label:it.title, sub:it.cite||"notification", cat:"notification", open:it.pdf?()=>openPdf(DATA_BASE+it.pdf,it.title):null}});
    edges.push({id:id+">t", source:id, target:efiling?efiling.id:"nat:ni:sec_138", label:efiling?"operates under":"governs filing"});
    ky+=KROW+GAP;
  });
  // lay the national column out to follow the flow: each provision sits at the average
  // height of the rules that point to it (barycentric ordering), which cuts crossings.
  const posY={}; nodes.forEach(n=>{ posY[n.id]=n.position.y; });
  posY["nat:ni:sec_138"]=0; // pin the offence to the top
  const natList=Object.values(nat);
  natList.forEach(n=>{
    if(n.id==="nat:ni:sec_138"){ n._by=-1e9; return; }
    const ins=edges.filter(e=>e.target===n.id).map(e=>posY[e.source]).filter(y=>y!=null);
    n._by = ins.length ? ins.reduce((a,b)=>a+b,0)/ins.length : 1e9;
  });
  natList.sort((a,b)=>a._by-b._by);
  const NROW=88;
  natList.forEach((n,i)=>{ n.position={x:COLX.nat, y:20+i*NROW}; nodes.push(n); });
  // clicking an edge (its label) opens whatever the edge points at
  const openById={}; nodes.forEach(n=>{ if(n.data && n.data.open) openById[n.id]=n.data.open; });
  edges.forEach(e=>{ const open=openById[e.target]; if(open) e.data={...(e.data||{}), open}; });
  return {nodes, edges};
}
function graphLegendInline(){
  const items=[["case","Offence"],["national","National"],["law","State Act"],["rule","State rule"],["notification","Notification"]];
  return `<div class="flow-legend">${items.map(([c,l])=>`<span class="fl-item"><span class="fl-dot fl-${c}"></span>${esc(l)}</span>`).join("")}</div>`;
}
V.graph=()=>{
  if(!isModelled()) return notModelled();
  const m=el("div","view-graph");
  const bar=el("div","flow-bar");
  bar.innerHTML=`<div class="flow-bar-l">${stateInlineSelectHTML()}${graphLegendInline()}</div>
    <div class="flow-bar-hint">Drag to move · scroll to zoom · click a node or a link to open its text</div>`;
  m.appendChild(bar);
  const host=el("div","flow-host"); host.id="flow-root"; m.appendChild(host);
  const sel=m.querySelector(".state-inline");
  if(sel) sel.onchange=e=>{ activeState=e.target.value; loadStateData().then(()=>{ buildNav(); go(currentView); }); };
  setTimeout(()=>{
    const host2=document.getElementById("flow-root"); if(!host2) return;
    host2.innerHTML=`<div class="flow-loading"><div class="spinner"></div><p>Loading the interactive map…</p></div>`;
    import("./flow.js")
      .then(mod=>{ host2.innerHTML=""; mod.mountFlow(host2, buildGraphModel()); })
      .catch(err=>{ host2.innerHTML=`<div class="empty">Couldn't load the interactive map.<br><span class="tiny">It renders with the React Flow library loaded over the network, so it needs an internet connection. ${esc(String(err&&err.message||err))}</span></div>`; });
  },40);
  return m;
};

/* ---- case law helpers ---- */
function provRefShort(ref){
  const [a,eid]=ref.split(":"); const s=SOURCES[a];
  const n=eid.indexOf("art_")===0 ? ("Art. "+eid.slice(4)) : ("§"+eid.replace("sec_",""));
  const t=s?s.title.split(",")[0].replace(/^Bharatiya /,"").replace(/^The /,""):a;
  return n+" · "+t;
}
function benchShort(b){ return b>=5?("Constitution Bench · "+b):(b+"-judge"); }
function caseStatusBadge(st){
  if(st==="good-law") return `<span class="badge b-good">good law</span>`;
  if(st==="partly-overruled") return `<span class="badge b-partly">partly overruled</span>`;
  if(st==="overruled") return `<span class="badge b-overruled">overruled</span>`;
  if(st==="legislatively-superseded") return `<span class="badge b-super">superseded by statute</span>`;
  return "";
}
function caseCard(c){
  const rels=(c.relations||[]).map(r=>{
    const tgt=caseById2(r.to); const nm=tgt?tgt.name:r.to;
    return `<div class="rels-c">↳ <b>${r.rel.replace(/-/g," ")}</b> ${esc(nm)}${r.note?` - ${esc(r.note)}`:""}</div>`;
  }).join("");
  const chips=(c.construes||[]).map(ref=>`<span class="cchip" data-ref="${esc(ref)}">${esc(provRefShort(ref))}</span>`).join("");
  const topics=(c.topics||[]).map(t=>`<span class="badge b-topic">${esc(CASE_TOPICS[t]||t)}</span>`).join("");
  const neutral=c.neutral_citation?`<span class="cite neutral">${esc(c.neutral_citation)}</span>`:"";
  const actions = c.akn
    ? `<a class="readjmt" data-caseid="${esc(c.id)}">Read judgment</a>${c.decided?`<span class="jdec">decided ${esc(c.decided)}</span>`:""}`
    : `<span class="jwarn" title="${esc(c.source_issue||'source document is not the Supreme Court judgment')}">⚠ SC judgment not yet linked${c.source_issue?` - ${esc(c.source_issue)}`:""}</span>`;
  return `<div class="case" id="case-${esc(c.id)}">
    <div class="cn">${esc(c.name)}</div>
    <div class="cmeta"><span class="cite">${esc(c.citation)}</span>${neutral}<span class="badge b-bench">${esc(benchShort(c.bench))}</span>${caseStatusBadge(c.status)}${topics}</div>
    <div class="hold">${esc(c.holding)}</div>
    ${chips?`<div class="construes"><span class="clabel">Construes</span>${chips}</div>`:""}
    ${rels}
    <div class="cactions">${actions}</div>
  </div>`;
}
function casesFor(ref){
  const ids=CASES_BY_REF[ref]||[]; if(!ids.length) return "";
  const items=ids.map(id=>{const c=caseById2(id); if(!c)return ""; return `<div class="ic" data-caseid="${esc(id)}"><span class="icn">${esc(c.name)}</span> <span class="icy">${esc(c.citation)} · ${esc(benchShort(c.bench))}</span></div>`;}).join("");
  return `<div class="interp"><div class="il">Interpreted by ${ids.length} Supreme Court case${ids.length>1?"s":""}</div>${items}</div>`;
}
function jumpToProvision(ref){
  go("law");
  setTimeout(()=>{ const r=document.getElementById("prov-"+ref.replace(/:/g,"_")); if(r){ const grp=r.closest(".actgrp"); if(grp) grp.classList.add("open"); if(!r.classList.contains("open")){ r.classList.add("open"); const slot=r.querySelector(".statute-slot"); if(slot) fillStatute(slot);} r.scrollIntoView({block:"center"}); r.style.outline="2px solid var(--brand)"; r.style.outlineOffset="-1px"; setTimeout(()=>{r.style.outline="";},1800);} },70);
}
function jumpToCase(id){
  go("caselaw");
  setTimeout(()=>{ const c=document.getElementById("case-"+id); if(c){ c.scrollIntoView({block:"center"}); c.style.outline="2px solid var(--brand)"; c.style.outlineOffset="-1px"; setTimeout(()=>{c.style.outline="";},1800);} },70);
}

/* ---- reference hover-preview: peek a cited provision in place, wherever it points
   to a source on another page. Click still opens the full modal (handled elsewhere). ---- */
const HOVER_SEL=".cchip[data-ref], .stedge[data-ref], .cite[data-nat], .cite[data-akn]";
let _pp=null, _ppTimer=null, _ppKey=null, _ppAnchor=null, _ppHover=false; const _ppCache={};
/* describe what a hovered element points at, or null if it isn't loadable */
function provDesc(el){
  const d=el.dataset;
  const natRef=d.ref||d.nat;
  if(natRef){ const a=natRef.split(":")[0]; return SOURCES[a] ? {key:"n:"+natRef, type:"nat", ref:natRef} : null; }
  if(d.akn && d.eid) return {key:"s:"+d.akn+"#"+d.eid, type:"state", akn:d.akn, eid:d.eid, title:d.title||""};
  return null;
}
function stateMiniMarkup(d,title,akn,eid){
  if(!d) return `<div class="statute statute-mini"><div class="st-src">source text not found</div></div>`;
  return `<div class="statute statute-mini"><div class="st-src">${ic('book-open')} from ${esc(title||'the state instrument')}</div>`
    +((d.num||d.heading)?`<div class="st-h"><span class="st-num">${esc(d.num||'')}</span>${esc(d.heading||'')}</div>`:'')
    +renderBody(d.body,"st")
    +`<div class="st-inpar"><button class="stdoc" data-akn="${esc(akn)}" data-title="${esc(title||'')}" data-sub="" data-eid="${esc(eid)}">${ic('maximize-2')}&nbsp; Read this inside the full document</button></div></div>`;
}
function ppEl(){
  if(!_pp){
    _pp=document.createElement("div"); _pp.className="provpop";
    _pp.addEventListener("mouseenter",()=>{ _ppHover=true; clearTimeout(_ppTimer); });
    _pp.addEventListener("mouseleave",()=>{ _ppHover=false; hideProvPop(); });
    document.body.appendChild(_pp);
  }
  return _pp;
}
function positionProvPop(el){
  const pop=_pp, r=el.getBoundingClientRect();
  const pw=Math.min(430, window.innerWidth-24); pop.style.width=pw+"px";
  const ph=pop.offsetHeight;
  let left=Math.min(r.left, window.innerWidth-12-pw); if(left<12) left=12;
  let top=r.bottom+8; if(top+ph>window.innerHeight-12){ const up=r.top-8-ph; top=up>12?up:Math.max(12, window.innerHeight-12-ph); }
  pop.style.left=left+"px"; pop.style.top=top+"px";
}
async function showProvPop(el){
  const desc=provDesc(el); if(!desc) return;
  const pop=ppEl(); clearTimeout(_ppTimer); _ppKey=desc.key; _ppAnchor=el;
  pop.classList.add("show");
  if(_ppCache[desc.key]){ pop.innerHTML=_ppCache[desc.key]; positionProvPop(el); return; }
  pop.innerHTML=`<div class="statute statute-mini"><div class="st-src"><span class="spinner" style="width:13px;height:13px;border-width:2px;margin:0"></span> loading the section…</div></div>`;
  positionProvPop(el);
  try{
    let html;
    if(desc.type==="nat"){ const d=await sectionByRef(desc.ref); html=statuteMarkup(desc.ref,d,true); }
    else { const d=await getStateSection(desc.akn,desc.eid); html=stateMiniMarkup(d,desc.title,desc.akn,desc.eid); }
    _ppCache[desc.key]=html;
    if(_ppKey===desc.key){ pop.innerHTML=html; positionProvPop(el); }
  }catch(e){ if(_ppKey===desc.key) pop.innerHTML=`<div class="statute statute-mini"><div class="st-src">couldn't load the section</div></div>`; }
}
function hideProvPop(){ clearTimeout(_ppTimer); _ppTimer=setTimeout(()=>{ if(_pp) _pp.classList.remove("show"); _ppKey=null; _ppAnchor=null; },160); }
/* only on pointers that actually hover (skips touch, where the tap opens the modal) */
if(window.matchMedia && window.matchMedia("(hover: hover)").matches){
  document.addEventListener("mouseover",e=>{
    const el=e.target.closest && e.target.closest(HOVER_SEL); if(!el) return;
    if(el===_ppAnchor && _pp && _pp.classList.contains("show")){ clearTimeout(_ppTimer); return; } // already open for this one
    clearTimeout(_ppTimer); _ppTimer=setTimeout(()=>showProvPop(el),160);
  });
  document.addEventListener("mouseout",e=>{
    const el=e.target.closest && e.target.closest(HOVER_SEL); if(!el) return;
    if(e.relatedTarget && el.contains(e.relatedTarget)) return; // still inside the same chip
    hideProvPop();
  });
  // hide when the PAGE scrolls (the popover would detach), but never when scrolling inside it
  window.addEventListener("scroll",e=>{
    if(!_pp || !_pp.classList.contains("show")) return;
    if(_ppHover || (e.target && e.target.nodeType===1 && _pp.contains(e.target))) return;
    hideProvPop();
  }, true);
}

/* ============================================================ VOCABULARY AUTO-LINKING
   Highlight any word that is in the vocabulary wherever it appears in prose; hover shows
   its gloss; click opens that word in the Vocabulary tab. */
let _vocabM=null, _vocabMState=null;
function vocabMatcher(){
  const key = activeState + "|" + Object.keys(TERMS||{}).length;
  if(_vocabM && _vocabMState===key) return _vocabM;
  const map={};
  // canonical terms first, then their aliases - an alias never overwrites a canonical entry
  Object.entries(TERMS||{}).forEach(([w,v])=>{ const o=(typeof v==="string"?{ref:v}:v); map[w.toLowerCase()]={word:w, gloss:o.gloss||"", scope:"national"}; });
  (((STATE_DATA||{}).vocabulary||{}).terms||[]).forEach(t=>{ if(t.word) map[t.word.toLowerCase()]={word:t.word, gloss:t.gloss||"", scope:"state"}; });
  Object.entries(TERMS||{}).forEach(([w,v])=>{ const o=(typeof v==="string"?{ref:v}:v); (o.aka||[]).forEach(a=>{ const k=a.toLowerCase(); if(!map[k]) map[k]={word:w, gloss:o.gloss||"", scope:"national", alias:true}; }); });
  (((STATE_DATA||{}).vocabulary||{}).terms||[]).forEach(t=>{ if(t.word)(t.aka||[]).forEach(a=>{ const k=a.toLowerCase(); if(!map[k]) map[k]={word:t.word, gloss:t.gloss||"", scope:"state", alias:true}; }); });
  const words=Object.keys(map).filter(w=>w.length>2).sort((a,b)=>b.length-a.length);
  const pat=words.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|");
  let re=null;
  if(pat){ try{ re=new RegExp("(?<![\\w-])("+pat+")(?![\\w-])","gi"); }
    catch(e){ try{ re=new RegExp("\\b("+pat+")\\b","gi"); }catch(e2){ re=null; } } }  // lookbehind fallback for old browsers
  _vocabM={ map, re };
  _vocabMState=key; return _vocabM;
}
const VOCAB_SKIP_TAGS=new Set(["A","CODE","INPUT","TEXTAREA","SCRIPT","STYLE","BUTTON","SELECT","H1"]);
/* the reading surface of a requirement card - the statement, the failure it prevents,
   what it binds and the reasoning behind its status - stays plain prose. Auto-linking
   every vocabulary word there turned most of a dense sentence into links and the
   reader lost the sentence; the term links belong in the detail rows below. */
const VOCAB_SKIP_CLASS=/(^|\s)(cite|cchip|stedge|vocab-term|statute|st-num|st-h|st-src|badge|wtag|chip|tl-marker|proc-tab|caret|mag|role-name|court-name|tl-stage-title|fee-stage|clabel|page-title|grouphead|vsub|rq-stmt|rq-why|rq-meta|rq-basis|rq-basis-bar|vp-word|vp-gloss)($|\s)/;
function linkifyVocab(root){
  if(!root) return;
  const M=vocabMatcher(); if(!M.re) return; const {map,re}=M;
  const walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(node){
    if(!node.nodeValue || node.nodeValue.trim().length<3) return NodeFilter.FILTER_REJECT;
    let p=node.parentElement;
    while(p && p!==root.parentElement){
      if(VOCAB_SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
      const cn=p.getAttribute && p.getAttribute("class");
      if(cn && VOCAB_SKIP_CLASS.test(cn)) return NodeFilter.FILTER_REJECT;
      p=p.parentElement;
    }
    return NodeFilter.FILTER_ACCEPT;
  }});
  const nodes=[]; let nd; while(nd=walker.nextNode()) nodes.push(nd);
  nodes.forEach(node=>{
    const text=node.nodeValue; re.lastIndex=0;
    if(!re.test(text)) return; re.lastIndex=0;
    const frag=document.createDocumentFragment(); let last=0, m; const seen=new Set(); let any=false;
    while((m=re.exec(text))){
      const lc=m[0].toLowerCase(); if(!map[lc] || seen.has(lc)) continue; seen.add(lc);
      if(m.index>last) frag.appendChild(document.createTextNode(text.slice(last,m.index)));
      const span=document.createElement("span"); span.className="vocab-term"; span.dataset.term=map[lc].word; span.textContent=m[0];
      frag.appendChild(span); last=m.index+m[0].length; any=true;
    }
    if(any){ if(last<text.length) frag.appendChild(document.createTextNode(text.slice(last))); node.parentNode.replaceChild(frag, node); }
  });
}
/* vocab hover popover (gloss is already in memory - no fetch) */
let _vp=null, _vpTimer=null, _vpHover=false, _vpAnchor=null;
function vpEl(){
  if(!_vp){ _vp=document.createElement("div"); _vp.className="vocabpop";
    _vp.addEventListener("mouseenter",()=>{ _vpHover=true; clearTimeout(_vpTimer); });
    _vp.addEventListener("mouseleave",()=>{ _vpHover=false; hideVocabPop(); });
    _vp.addEventListener("click",()=>{ if(_vpAnchor) goVocabWord(_vpAnchor.dataset.term); });
    document.body.appendChild(_vp);
  }
  return _vp;
}
function positionVocabPop(el){
  const pop=_vp, r=el.getBoundingClientRect(); const pw=pop.offsetWidth, ph=pop.offsetHeight;
  let left=Math.min(r.left, window.innerWidth-12-pw); if(left<12) left=12;
  let top=r.bottom+7; if(top+ph>window.innerHeight-12){ const up=r.top-7-ph; top=up>12?up:Math.max(12, window.innerHeight-12-ph); }
  pop.style.left=left+"px"; pop.style.top=top+"px";
}
function showVocabPop(el){
  const word=el.dataset.term; if(!word) return;
  const t=vocabMatcher().map[word.toLowerCase()]; if(!t) return;
  const pop=vpEl(); clearTimeout(_vpTimer); _vpAnchor=el;
  const scope = t.scope==="state" ? `<span class="vp-scope">${esc(stateById(activeState).name)}</span>` : `<span class="vp-scope vp-nat">national</span>`;
  pop.innerHTML=`<div class="vp-word">${esc(t.word)} ${scope}</div>${t.gloss?`<div class="vp-gloss">${esc(t.gloss)}</div>`:""}<div class="vp-go">${ic('type')} Open in Vocabulary</div>`;
  pop.classList.add("show"); positionVocabPop(el);
}
function hideVocabPop(){ clearTimeout(_vpTimer); _vpTimer=setTimeout(()=>{ if(!_vpHover && _vp) _vp.classList.remove("show"); _vpAnchor=null; },140); }
function goVocabWord(word){
  if(_vp) _vp.classList.remove("show");
  vocabScrollTo=word; _extra={term:word};
  go("words", true);
}
/* a unit (vocab term, role, process step) carries sourceNotes back to the field note
   it came from - open the Local practice view and scroll to that note. */
function goPracticeNote(id){
  if(_vp) _vp.classList.remove("show");
  practiceScrollTo=id; _extra={note:id};
  go("practice", true);
}
/* hover + scroll wiring for vocab terms (hover-capable pointers only) */
if(window.matchMedia && window.matchMedia("(hover: hover)").matches){
  document.addEventListener("mouseover",e=>{
    const el=e.target.closest && e.target.closest(".vocab-term"); if(!el) return;
    if(el===_vpAnchor && _vp && _vp.classList.contains("show")){ clearTimeout(_vpTimer); return; }
    clearTimeout(_vpTimer); _vpTimer=setTimeout(()=>showVocabPop(el),150);
  });
  document.addEventListener("mouseout",e=>{
    const el=e.target.closest && e.target.closest(".vocab-term"); if(!el) return;
    if(e.relatedTarget && el.contains(e.relatedTarget)) return;
    hideVocabPop();
  });
  window.addEventListener("scroll",e=>{
    if(!_vp || !_vp.classList.contains("show")) return;
    if(_vpHover || (e.target && e.target.nodeType===1 && _vp.contains(e.target))) return;
    hideVocabPop();
  }, true);
}

V.caselaw=()=>{
  if(!isModelled()) return notModelled();
  const m=el("div"); m.appendChild(scopeBar());
  const head=el("div");
  head.innerHTML=`<h1 class="page-title">Case law</h1>`;
  m.appendChild(head);
  if(!CASES.length){ m.appendChild(el("div","empty","No case-law dataset is linked from this profile.")); return m; }
  const controls=el("div","controls");
  controls.innerHTML=`<div class="search"><span class="mag">${ic('search')}</span><input id="c-search" placeholder="Search a case, holding or citation - Rangappa, jurisdiction, s.141…"></div>`;
  m.appendChild(controls);
  const chips=el("div","chips");
  const topicsPresent=Object.keys(CASE_TOPICS).filter(t=>CASES.some(c=>(c.topics||[]).includes(t)));
  chips.innerHTML=`<span class="chip on" data-topic="all">All topics</span>`+topicsPresent.map(t=>`<span class="chip" data-topic="${t}">${esc((CASE_TOPICS[t]||t).replace(/\s*\(.*\)/,''))} <span class="c">${CASES.filter(c=>(c.topics||[]).includes(t)).length}</span></span>`).join("");
  m.appendChild(chips);
  const list=el("div"); list.id="c-list"; list.style.marginTop="16px"; m.appendChild(list);
  const state={q:"",topic:"all"};
  function draw(){
    list.innerHTML="";
    let rows=CASES.filter(c=>{
      if(state.topic!=="all" && !(c.topics||[]).includes(state.topic)) return false;
      if(state.q){const hay=(c.name+" "+c.holding+" "+c.citation+" "+(c.construes||[]).join(" ")).toLowerCase(); if(!hay.includes(state.q))return false;}
      return true;
    });
    rows.sort((a,b)=>(a.year||0)-(b.year||0));
    if(!rows.length){list.appendChild(el("div","empty","No case matches."));return;}
    if(state.topic==="all" && !state.q){
      // group by topic in taxonomy order
      topicsPresent.forEach(t=>{
        const g=rows.filter(c=>(c.topics||[])[0]===t);
        if(!g.length) return;
        list.appendChild(el("div","grouphead",`${esc(CASE_TOPICS[t]||t)} <span class="gh-status">${g.length} case${g.length>1?'s':''}</span>`));
        g.forEach(c=>{const d=el("div");d.innerHTML=caseCard(c);list.appendChild(d.firstElementChild);});
      });
    } else {
      rows.forEach(c=>{const d=el("div");d.innerHTML=caseCard(c);list.appendChild(d.firstElementChild);});
    }
  }
  chips.querySelectorAll(".chip").forEach(ch=>ch.onclick=()=>{chips.querySelectorAll(".chip").forEach(x=>x.classList.remove("on"));ch.classList.add("on");state.topic=ch.dataset.topic;draw();});
  setTimeout(()=>{const inp=$("#c-search"); if(inp)inp.oninput=e=>{state.q=e.target.value.toLowerCase().trim();draw();};},0);
  draw();
  return m;
};

V.structure=()=>{
  const m=el("div");
  m.innerHTML=`<h1 class="page-title">The structure</h1>
    <p class="lede"><span class="badge b-crosscase" style="vertical-align:middle">across every case type</span> &nbsp;Keep three things apart - the rules you obey, the systems you plug into, and the context you adapt to - all moving through time. This shape holds for any case type.</p>`;
  const wrap=el("div","struct-wrap");
  const rules=el("div","stack");
  rules.appendChild(el("div","col-h rules","1 · THE RULES - what you must obey"));
  rules.appendChild(el("div","divider blue",`<span class="rule"></span> Same everywhere in India - the national core <span class="rule"></span>`));
  [["Constitution","the foundation - what powers the courts have"],["The case-type's core Act + shared codes","e.g. NI Act §138 · procedure · evidence · limitation"],["Court judgments (Supreme & High Courts)","can change what a law means - without changing its words"]].forEach(([t,d])=>{const l=el("div","layer core");l.innerHTML=`<div class="lt">${t}</div><div class="ld">${d}</div>`;rules.appendChild(l);});
  rules.appendChild(el("div","divider green",`<span class="rule"></span> Differs by state - each state adds its own <span class="rule"></span>`));
  [["State High Court rules of practice","e-filing rules · rules of practice"],["Practice directions & circulars","a court's written instructions on how to do a thing"],["Local, unwritten practice","how one particular court actually runs, day to day"]].forEach(([t,d])=>{const l=el("div","layer state");l.innerHTML=`<div class="lt">${t}</div><div class="ld">${d}</div>`;rules.appendChild(l);});
  rules.appendChild(el("div","tiny","Top = broad authority, rarely changes. Bottom = very specific, changes most often."));
  const sys=el("div","stack");
  sys.appendChild(el("div","col-h sys","2 · THE SYSTEMS - you plug into"));
  SYSTEMS.forEach(s=>{const l=el("div","layer sysrow"+(s.you?" you":""));l.innerHTML=`<div class="lt">${s.name}${s.you?' <span class="badge b-post" style="margin-left:6px">your platform</span>':''}</div><div class="ld">${s.desc}</div>`;sys.appendChild(l);});
  const how=el("div","ctx"); how.style.marginTop="14px";
  how.innerHTML=`<div class="ct">HOW TO READ THIS</div><p>1 · Obey the <b style="color:var(--blue)">rules</b> - national first, then your state's layer.</p><p>2 · Plug into the <b style="color:var(--amber)">systems</b> - DRISTI hosts each state's copy over that core.</p><p>3 · Adapt to the <b style="color:var(--red)">context</b> - language, customs, culture.</p>`;
  sys.appendChild(how);
  wrap.appendChild(rules); wrap.appendChild(sys); m.appendChild(wrap);
  const ctx=el("div","ctx");
  ctx.innerHTML=`<div class="ct">3 · THE CONTEXT - shapes how the rules are applied where you are</div><p><b>Language</b> - the court's language (Malayalam, Gujarati…): notices, forms, orders, UI. <span class="tiny">(also partly a formal rule)</span></p><p><b>Customs</b> - local habits: how adjournments, registry work and filing actually happen.</p><p><b>Culture</b> - digital literacy, trust, access needs.</p>`;
  m.appendChild(ctx);
  const tl=el("div","timeline");
  tl.innerHTML=`<div class="col-h" style="color:var(--purple)">TIME - which rule was live depends on WHEN the cause of action arose</div>`;
  const track=el("div","tl-track");
  [{p:2,yr:"1881",lb:"NI Act"},{p:34,yr:"2015",lb:"jurisdiction rule changed"},{p:70,yr:"2024",lb:"new criminal & evidence codes",hot:true},{p:96,yr:"2026",lb:"today"}].forEach(n=>{const nd=el("div","tl-node"+(n.hot?" hot":""));nd.style.left=n.p+"%";nd.innerHTML=`<div class="pt"></div><div class="yr">${n.yr}</div><div class="lb">${n.lb}</div>`;track.appendChild(nd);});
  tl.appendChild(track);
  tl.appendChild(el("div","tiny","On 1 July 2024 the CrPC, IPC and Evidence Act were replaced by the BNSS, BNS and BSA. A case whose cause of action predates that date still runs on the old codes - true for every criminal case type."));
  m.appendChild(tl);
  return m;
};

V.split=()=>{
  const m=el("div");
  m.innerHTML=`<h1 class="page-title">National vs State</h1>
    <p class="lede"><span class="badge b-crosscase" style="vertical-align:middle">across every case type</span> &nbsp;The national core is central law, identical in every state; the state layer is everything a state owns and advances on its own. Build for the state, over the national core.</p>`;
  const split=el("div","split");
  const core=el("div","col core");
  core.innerHTML=`<div class="col-top"><h3>National <span class="badge b-shared">same everywhere</span></h3><p>Central statutes & binding judgments - reused across case types. Modelled here as ${PROVISIONS.length} provisions across ${Object.keys(SOURCES).length} Acts.</p></div>`;
  [["The offence & presumptions","NI Act §§138–147 - specific to this case type."],["Criminal procedure","Cognizance, process, summary trial, compounding, appeal - CrPC → BNSS. Shared by all criminal case types."],["Evidence","Burden of proof, electronic records, bankers' books - IEA → BSA + BBEA."],["Limitation, notice, sentencing","One-month bar & condonation, deemed service, probation & compensation."],["Binding case law","Supreme Court precedent (Rangappa, Aneeta Hada, Expeditious Trial…) - modelled under Case law, binding nationally via Art. 141."]].forEach(([b,s])=>{const r=el("div","row");r.innerHTML=`<b>${b}</b><span>${s}</span>`;core.appendChild(r);});
  const st=el("div","col state");
  st.innerHTML=`<div class="col-top"><h3>State layer <span class="badge b-state">a state owns it</span></h3><p>Not in the central corpus. What a DRISTI instance configures and a court advances on its own - the same for every case type.</p></div>`;
  STATE_CATEGORIES.forEach(c=>{const r=el("div","row");r.innerHTML=`<b>${c.name}${c.ill?' <span class="tiny" style="color:var(--amber)">· operational</span>':''}</b><span>${c.desc}</span>`;st.appendChild(r);});
  split.appendChild(core); split.appendChild(st); m.appendChild(split);
  m.appendChild(el("div","callout green","<b>Same law, different shape.</b> The statute is identical, but who files and at what scale reshapes the whole workflow. That difference lives entirely in the state layer - the national core never moves."));
  m.appendChild(el("h2","sec","States, and what makes each one different"));
  const sc=el("div","statecards");
  STATES.forEach(s=>{const c=el("div","sc");c.innerHTML=`<h4>${s.flag} ${s.name}</h4><div class="st">${s.tag}</div><p>${s.note}</p>`;sc.appendChild(c);});
  m.appendChild(sc);
  m.appendChild(el("div","callout amber","<span class='tiny'>State-layer details are seeded from DRISTI 2.0 field context (Kerala, Gujarat, Punjab, Sikkim), not from the central statute corpus - illustrative, and meant to be filled in per state and per case type.</span>"));
  return m;
};

V.time=()=>{
  const m=el("div");
  m.innerHTML=`<h1 class="page-title">The 2024 code switch</h1>
    <p class="lede"><span class="badge b-crosscase" style="vertical-align:middle">across every case type</span> &nbsp;On 1 July 2024, three foundational codes were replaced. They sit under every criminal case type; which set is live depends on when the cause of action arose.</p>
    <div class="callout amber"><b>The rule of thumb.</b> Cause of action <b>before</b> 1 July 2024 → the old codes (CrPC / IPC / Evidence Act). <b>On or after</b> → the 2023 Sanhitas (BNSS / BNS / BSA).</div>`;
  const table=el("div"); table.style.marginTop="8px";
  ALIAS_MAP.forEach(a=>{
    const label=ref=>ref.indexOf(":")<0?(SOURCES[ref]?SOURCES[ref].title.split(",")[0]:ref):refLabel(ref);
    const c=el("div","prov"); c.style.marginBottom="8px";
    c.innerHTML=`<div class="prov-head" style="cursor:default">
      <span class="rt" style="flex:1.1; font-size:15px">${a.topic[0].toUpperCase()+a.topic.slice(1)}</span>
      <span style="flex:2; display:flex; gap:10px; align-items:center; flex-wrap:wrap; justify-content:flex-end">
        <span class="badge b-pre">${label(a.before)}</span><span style="color:var(--ink-3)">→</span><span class="badge b-post">${label(a.after)}</span>
      </span></div>
      ${a.note?`<div class="prov-body" style="display:block; padding:0 16px 12px 16px; border-top:1px solid var(--line)"><div class="tiny" style="margin:10px 0 0">${a.note}</div></div>`:''}`;
    table.appendChild(c);
  });
  m.appendChild(table);
  return m;
};

/* ============================================================ FULL-ACT MODAL */
function renderFullAct(actId, blocks, focusEid){
  const src=SOURCES[actId];
  const nsec=blocks.filter(b=>b.t==="sec").length;
  const unit=blocks.some(b=>b.unit==="article")?"articles":"sections";
  const wrap=el("div");
  const focusLabel = focusEid ? secNum(actId+":"+focusEid) : "";
  const pdfUrl = (DATA_BASE||"") + src.file.replace('/akn/','/sources/').replace(/\.akn\.xml$/,'.pdf');
  wrap.appendChild(el("div","actdoc-h",`<div class="ad-title">${esc(src.title)}</div>`));
  setModalPdf(pdfUrl, src.title);
  const body=el("div","actdoc-body");
  if(!nsec) body.appendChild(el("div","callout amber",`This Act's full text isn't in the corpus yet - its Akoma&nbsp;Ntoso conversion is incomplete, so only structural headings are present.`));
  blocks.forEach(b=>{
    if(b.t==="chap"){ body.appendChild(el("div","ad-chap",esc(b.label))); return; }
    const secEl=el("div","ad-sec"+(b.eId===focusEid?" focus":""));
    if(b.eId) secEl.id="adsec-"+b.eId;
    let h=`<div class="ad-sec-h"><span class="ad-num">${esc(b.num||'')}</span>${esc(b.heading||'')}${b.eId===focusEid?'<span class="ad-focus-tag">the section you came from</span>':''}</div>`;
    h+=renderBody(b.body,"ad");
    secEl.innerHTML=h; body.appendChild(secEl);
  });
  wrap.appendChild(body);
  return wrap;
}
async function openActModal(actId, focusEid){
  const modal=$("#modal"), body=$("#modal-body");
  body.innerHTML=`<div class="ad-loading"><div class="spinner"></div>Loading the full Act…</div>`;
  modal.classList.add("show"); document.body.style.overflow="hidden";
  try{
    const doc=await getDoc(actId);
    const blocks=actBlocks(doc);
    body.innerHTML=""; body.appendChild(renderFullAct(actId,blocks,focusEid));
    if(focusEid){ const t=document.getElementById("adsec-"+focusEid); if(t) setTimeout(()=>t.scrollIntoView({block:"center"}),60); }
    else body.scrollTop=0;
  }catch(e){
    body.innerHTML=`<div class="ad-loading">Couldn't load this Act.<br><br>The viewer reads the <code>.akn.xml</code> files live, so it must be served over http - see the note under the sidebar.</div>`;
  }
}
/* the modal's Original-PDF control lives in the chrome, beside Close - one place
   for every modal. Each opener declares its PDF (or clears it) via this. */
function setModalPdf(url, title){
  const b=$("#modal-pdf"); if(!b) return;
  if(url){ b.dataset.pdf=url; b.dataset.pdftitle=title||"Original document"; b.title=`Open the original PDF${title?` - ${title}`:""}`; b.innerHTML=`${ic('file')} PDF`; b.hidden=false; }
  else { b.hidden=true; b.removeAttribute("data-pdf"); }
}
function closeModal(){ $("#modal").classList.remove("show"); document.body.style.overflow=""; setModalPdf(null); }

/* render + open an arbitrary Akoma Ntoso <act> document (used for state instruments) */
function renderStateDoc(title, subtitle, blocks, pdfUrl, focusEid){
  const nsec=blocks.filter(b=>b.t==="sec").length;
  const unit=blocks.some(b=>b.unit==="article")?"articles":(blocks.some(b=>b.t==="sec"&&/^rule_/.test(b.eId||""))?"rules":"sections");
  const wrap=el("div");
  wrap.appendChild(el("div","actdoc-h",
    `<div class="ad-title">${esc(title)}</div>${subtitle?`<div class="ad-sub">${esc(subtitle)}</div>`:''}`));
  setModalPdf(pdfUrl||null, title);
  const bodyEl=el("div","actdoc-body");
  if(!nsec) bodyEl.appendChild(el("div","callout amber",`This document's full text isn't in the corpus yet.`));
  blocks.forEach(b=>{
    if(b.t==="chap"){ bodyEl.appendChild(el("div","ad-chap",esc(b.label))); return; }
    const secEl=el("div","ad-sec"+(b.eId&&b.eId===focusEid?" focus":""));
    if(b.eId) secEl.id="stsec-"+b.eId;
    let h=`<div class="ad-sec-h"><span class="ad-num">${esc(b.num||'')}</span>${esc(b.heading||'')}${b.eId===focusEid?'<span class="ad-focus-tag">the rule you came from</span>':''}</div>`;
    h+=renderBody(b.body,"ad");
    secEl.innerHTML=h; bodyEl.appendChild(secEl);
  });
  wrap.appendChild(bodyEl);
  return wrap;
}
const stateDocCache={};
async function openStateDocModal(aknPath, title, subtitle, pdfUrl, focusEid){
  const modal=$("#modal"), body=$("#modal-body");
  body.innerHTML=`<div class="ad-loading"><div class="spinner"></div>Loading the document...</div>`;
  modal.classList.add("show"); document.body.style.overflow="hidden";
  try{
    let doc=stateDocCache[aknPath];
    if(!doc){ const xml=await fetchText((DATA_BASE||"")+aknPath); doc=new DOMParser().parseFromString(xml,"application/xml"); if(doc.getElementsByTagName("parsererror").length) throw new Error("parse error"); stateDocCache[aknPath]=doc; }
    body.innerHTML=""; body.appendChild(renderStateDoc(title, subtitle, actBlocks(doc), pdfUrl, focusEid));
    if(focusEid){ const t=document.getElementById("stsec-"+focusEid); if(t) setTimeout(()=>t.scrollIntoView({block:"center"}),60); } else body.scrollTop=0;
  }catch(e){
    body.innerHTML=`<div class="ad-loading">Couldn't load this document.<br><br>The viewer reads the <code>.akn.xml</code> files live, so it must be served over http.</div>`;
  }
}

/* ============================================================ STATE RULES TREE
   The State rules view, organised exactly like National objects: each instrument
   is a collapsible group; inside, its rules/sections list by chapter, and each
   row expands to the verbatim text - the state analogue of Act → provision. */
function getStateDoc(aknPath){
  if(stateDocCache[aknPath]) return Promise.resolve(stateDocCache[aknPath]);
  return fetchText((DATA_BASE||"")+aknPath).then(xml=>{
    const doc=new DOMParser().parseFromString(xml,"application/xml");
    if(doc.getElementsByTagName("parsererror").length) throw new Error("parse error");
    stateDocCache[aknPath]=doc; return doc;
  });
}
function stateChapHead(label){
  const d=el("div"); d.textContent=label;
  d.style.cssText="font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-3);font-weight:700;margin:16px 0 4px;padding-left:2px";
  return d;
}
function stateRuleRow(b){
  const row=el("div","prov");
  row.innerHTML=`
    <div class="prov-head">
      <span class="ref">${esc(b.num||'')}</span>
      <span class="rt">${esc(b.heading||'(untitled)')}</span>
      <span class="caret">${ic('chevron-right')}</span>
    </div>
    <div class="prov-body"></div>`;
  const pbody=row.querySelector(".prov-body"); let filled=false;
  row.querySelector(".prov-head").onclick=()=>{
    row.classList.toggle("open");
    if(row.classList.contains("open") && !filled){ filled=true;
      const st=el("div","statute"); st.innerHTML=renderBody(b.body,"st")||`<div class="st-src">no text captured for this ${esc(b.num||'entry')}</div>`; pbody.appendChild(st);
    }
  };
  return row;
}
/* one curated s.138-relevant rule/section: role, applies, note, verbatim text,
   and typed edges that link this state rule into the national core it operationalises. */
function getStateSection(aknPath, eId){
  return getStateDoc(aknPath).then(doc=>{ const n=doc.querySelector('[eId="'+eId+'"]'); return n?sectionData(n):null; });
}
function stEidNum(eId){ return String(eId||'').replace(/^rule_/,'').replace(/^sec_/,'').replace(/^art_/,'Art. ')+'.'; }
function stApplies(a){ a=a||'always'; return a==='always'?"at any time":("to causes of action "+a.replace("pre-2024-07-01","before 1 July 2024").replace("post-2024-07-01","on or after 1 July 2024")); }
function stEdgeRow(rel,to){
  const lbl=(to && SOURCES[to.split(":")[0]])?refLabel(to):esc(to);
  return `<div class="rel"><span class="r">${esc(rel)}</span> → <a class="stedge" data-ref="${esc(to)}">${lbl}</a></div>`;
}
function stEdgesBlock(list,label){
  if(!list||!list.length) return "";
  return `<div class="rels">${label?`<div class="rel-lbl">${esc(label)}</div>`:""}${list.map(e=>stEdgeRow(e.rel||"related",e.to)).join("")}</div>`;
}
function stateKeyRow(it,k,stId){
  const row=el("div","prov");
  row.innerHTML=`
    <div class="prov-head">
      <span class="ref">${esc(stEidNum(k.eId))}</span>
      <span class="rt">${esc(k.label||'')}</span>
      <span class="hbadges"><span class="badge b-state">${esc(stateById(stId||activeState).name)} layer</span> ${eraBadge(k.applies||'always')}</span>
      <span class="caret">${ic('chevron-right')}</span>
    </div>
    <div class="prov-body">
      ${k.note?`<div class="brief"><span class="bl">In brief · PUCAR summary</span>${esc(k.note)}</div>`:''}
      <div class="ksec"></div>
      <div class="kv" style="margin-top:12px"><b>Governs</b> ${esc(it.cite||'state procedure')} · role: ${esc(k.tier||'procedure')}</div>
      <div class="kv"><b>Applies</b> ${stApplies(k.applies)}</div>
      ${stEdgesBlock(k.edges,"Connects to the national core")}
    </div>`;
  const ks=row.querySelector(".ksec"); let filled=false;
  row.querySelector(".prov-head").onclick=()=>{
    row.classList.toggle("open");
    if(row.classList.contains("open") && !filled && it.akn){ filled=true;
      ks.innerHTML=`<div class="statute"><div class="st-src"><span class="spinner" style="width:13px;height:13px;border-width:2px;margin:0"></span> loading the text…</div></div>`;
      getStateSection(it.akn,k.eId).then(d=>{
        ks.innerHTML = d ? `<div class="statute">${(d.num||d.heading)?`<div class="st-h"><span class="st-num">${esc(d.num||'')}</span>${esc(d.heading||'')}</div>`:''}${renderBody(d.body,"st")}<div class="st-inpar"><button class="stdoc" data-akn="${esc(it.akn)}" data-title="${esc(it.title)}" data-sub="${esc(it.cite||'')}" data-eid="${esc(k.eId)}">${ic('maximize-2')}&nbsp; Read this rule inside the full document</button></div></div>` : `<div class="statute"><div class="st-src">text not found for ${esc(k.eId)}</div></div>`;
      }).catch(()=>{ ks.innerHTML=`<div class="statute"><div class="st-src">couldn't load the text - served over http?</div></div>`; });
    }
  };
  return row;
}
function stateRuleGroup(it,stId){
  const grp=el("div","actgrp");
  const yr=(it.title.match(/\d{4}/)||[''])[0];
  const titleClean=it.title.replace(/,?\s*\d{4}\s*$/,'').replace(/\s*\(.*?\)\s*$/,'').trim();
  grp.innerHTML=`
    <div class="actgrp-head">
      <span class="ag-chev">${ic('chevron-down')}</span>
      <span class="dot" style="background:var(--brand)"></span>
      <span class="ag-title">${esc(titleClean)} <span class="ag-year">${esc(yr)}</span></span>
      <span class="ag-status">${esc(it.cite||'')}</span>
      <span class="ag-count">${it.akn?'…':'PDF'}</span>
    </div>
    <div class="actgrp-body"></div>`;
  const body=grp.querySelector(".actgrp-body"), countEl=grp.querySelector(".ag-count");
  if(it.akn) getStateDoc(it.akn).then(doc=>{ countEl.textContent=actBlocks(doc).filter(b=>b.t==="sec").length; }).catch(()=>{ countEl.textContent='?'; });
  const actions=el("div"); actions.style.cssText="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:2px";
  if(it.akn){ const ob=el("button","view-full ag-openfull"); ob.innerHTML=`${ic('book-open')}&nbsp; Open the whole document`; ob.onclick=e=>{ e.stopPropagation(); openStateDocModal(it.akn,it.title,it.cite||'',it.pdf?(DATA_BASE+it.pdf):''); }; actions.appendChild(ob); }
  if(it.pdf){ const pb=el("button","pdf-orig"); pb.dataset.pdf=DATA_BASE+it.pdf; pb.dataset.pdftitle=it.title; pb.innerHTML=`${ic('file')} Original PDF`; actions.appendChild(pb); }
  body.appendChild(actions);
  if(it.note) body.appendChild(el("div","brief",`<span class="bl">In brief · PUCAR summary</span>${it.note}`));
  if(it.made_under && it.made_under.length){ const mu=el("div","rels"); mu.style.marginTop="10px"; mu.innerHTML=`<div class="rel-lbl">Made under</div>`+it.made_under.map(e=>stEdgeRow(e.rel||"made under",e.to)).join(""); body.appendChild(mu); }
  if(it.key && it.key.length){
    const kh=el("div"); kh.textContent=`Key provisions for §138`; kh.style.cssText="font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--brand);font-weight:700;margin:18px 0 8px";
    body.appendChild(kh);
    it.key.forEach(k=> body.appendChild(stateKeyRow(it,k,stId)));
  }
  if(it.akn){
    const bw=el("div"); bw.style.marginTop="14px";
    const bb=el("button","view-full"); bb.innerHTML=`${ic('library')}&nbsp; Browse the full text`;
    const tree=el("div"); tree.style.cssText="display:none;margin-top:8px"; let tl=false;
    bb.onclick=e=>{ e.stopPropagation();
      const showing=tree.style.display!=="none"; tree.style.display=showing?"none":"block"; bb.classList.toggle("on",!showing);
      if(!showing && !tl){ tl=true;
        const slot=el("div","st-src"); slot.style.padding="8px 2px"; slot.innerHTML=`<span class="spinner" style="width:14px;height:14px;border-width:2px;margin:0"></span> loading all rules…`; tree.appendChild(slot);
        getStateDoc(it.akn).then(doc=>{ slot.remove(); actBlocks(doc).forEach(b=> tree.appendChild(b.t==="chap"?stateChapHead(b.label):stateRuleRow(b))); }).catch(()=>{ slot.innerHTML=`<span class="tiny">couldn't load - served over http?</span>`; });
      }
    };
    bw.appendChild(bb); bw.appendChild(tree); body.appendChild(bw);
  }
  grp.querySelector(".actgrp-head").onclick=()=>grp.classList.toggle("open");
  return grp;
}
/* An instrument tree, filtered by state. The state the app is set to is only the
   default - "All states" and every other state are one chip away, exactly like the
   State facet on Local practice. Each group is rendered for its own state, so its
   badges and its cites resolve against that state's layer. */
function stateTreeView(catKey, title){ return function(){
  if(!isModelled()) return notModelled();
  const m=el("div"); m.appendChild(scopeBar());
  // every state with a layer, plus the active one even if it has none yet - so the
  // default selection is always represented by a chip
  const present=(JURISDICTIONS||[]).filter(s=>STATES_DATA[s.id] || s.id===activeState);
  const itemsOf=id=>(((stateLayer(id)||{})[catKey])||{}).items||[];
  const summaryOf=id=>(((stateLayer(id)||{})[catKey])||{}).summary||"";
  const head=el("div");
  head.innerHTML=`<h1 class="page-title">${esc(title)}</h1><p class="lede"></p>`;
  m.appendChild(head);
  const lede=head.querySelector(".lede");
  const facets=el("div","vfacets"); m.appendChild(facets);
  const body=el("div"); body.style.marginTop="6px"; m.appendChild(body);
  const fstate={place:activeState};
  const pill=(fg,fv,label,count,active)=>`<span class="chip ${active?'on':''}" data-fg="${fg}" data-fv="${esc(fv)}">${esc(label)}${count!=null?` <span class="c">${count}</span>`:""}</span>`;
  const GENERIC="These sit on top of the shared national core and change from state to state.";

  function redraw(){
    const sel=fstate.place;
    const total=present.reduce((n,s)=>n+itemsOf(s.id).length,0);
    facets.innerHTML=`<div class="vfacet-row"><span class="vfacet-lbl">State</span><div class="chips">`
      +pill("place","all","All states",total,sel==="all")
      +present.map(s=>pill("place",s.id,s.name,itemsOf(s.id).length,sel===s.id)).join("")
      +`</div></div>`;
    lede.textContent = sel==="all" ? `${title} from every modelled state layer. ${GENERIC}` : (summaryOf(sel)||GENERIC);
    body.innerHTML="";
    const chosen = sel==="all" ? present.map(s=>s.id) : [sel];
    if(!chosen.reduce((n,id)=>n+itemsOf(id).length,0)){
      const nm=(stateById(sel)||{}).name||sel;
      body.appendChild(el("div","empty", summaryOf(sel)
        ? `Nothing separate to list here for ${esc(nm)} - the summary above is the whole story.`
        : `<b>${esc(nm)} - ${esc(title.toLowerCase())} not modelled yet.</b><br><span class="tiny">This state-layer object is planned.</span>`));
      return;
    }
    body.appendChild(el("div","legend",`<span>Each opens to its sections; each section opens to the verbatim text - the same shape as the national <b>Acts &amp; provisions</b></span>`));
    const list=el("div"); list.style.marginTop="14px"; body.appendChild(list);
    chosen.forEach(id=>{
      const items=itemsOf(id); if(!items.length) return;
      if(sel==="all") list.appendChild(el("div","grouphead",`${esc((stateById(id)||{}).name||id)} <span class="gh-status">${items.length} instrument${items.length>1?'s':''}</span>`));
      items.forEach(it=>list.appendChild(stateRuleGroup(it,id)));
    });
  }
  facets.addEventListener("click",e=>{ const p=e.target.closest(".chip"); if(!p) return; if(p.dataset.fg==="place"){ fstate.place=p.dataset.fv; redraw(); } });
  redraw();
  return m;
}; }

/* ============================================================ JUDGMENT MODAL */
let jmtCache={};
async function getJudgment(caseId, aknPath){
  if(jmtCache[caseId]) return jmtCache[caseId];
  const xml=await fetchText(DATA_BASE+aknPath);
  const doc=new DOMParser().parseFromString(xml,"application/xml");
  if(doc.getElementsByTagName("parsererror").length) throw new Error("XML parse error: "+aknPath);
  jmtCache[caseId]=doc; return doc;
}
function judgmentHeader(doc){
  const h=doc.getElementsByTagName("header")[0]; const out={};
  if(h) for(const p of h.children){ const cl=p.getAttribute("class"); if(cl) out[cl]=cleanText(p); }
  return out;
}
function renderJudgment(c, doc){
  const H=judgmentHeader(doc);
  const wrap=el("div");
  const sub=[H.court||"Supreme Court of India"];
  if(H.judgmentDate) sub.push(H.judgmentDate);
  if(c.neutral_citation||H.neutralCitation) sub.push(c.neutral_citation||H.neutralCitation);
  const jpdf = c.source_pdf ? ((DATA_BASE||"") + c.source_pdf) : "";
  wrap.appendChild(el("div","actdoc-h",
    `<div class="ad-title">${esc(c.name)}</div><div class="ad-sub">${esc(sub.join(" · "))}</div>`));
  setModalPdf(jpdf||null, c.name);
  const body=el("div","actdoc-body");
  const cap=el("div","jcap");
  cap.innerHTML=`${H.docketNumber?`<div class="jrow strong">${esc(H.docketNumber)}</div>`:''}
    <div class="jrow">${esc(H.reportCitation||c.citation||'')}${H.neutralCitation?` &nbsp;·&nbsp; ${esc(H.neutralCitation)}`:''}</div>
    ${H.bench?`<div class="jrow">${esc(H.bench)}</div>`:''}
    ${H.author?`<div class="jrow">${esc(H.author)}</div>`:''}`;
  body.appendChild(cap);
  const jb=doc.getElementsByTagName("judgmentBody")[0];
  const LAB={introduction:"Introduction",background:"Background",arguments:"Arguments",motivation:"The Court's reasoning",remedies:"Remedies",decision:"Decision"};
  if(jb) for(const sec of jb.children){
    const ln=sec.localName;
    body.appendChild(el("div","ad-chap",LAB[ln]||ln));
    for(const ch of sec.children){
      if(ch.localName==="p"){ body.appendChild(el("div","jpara",`<div class="jp">${esc(cleanText(ch))}</div>`)); }
      else if(ch.localName==="paragraph"){
        const num=childByLocal(ch,"num"), content=childByLocal(ch,"content");
        const pn=num?cleanText(num):"";
        let txt=""; if(content) for(const cc of content.children){ if(cc.localName==="p"){ const t=cleanText(cc); if(t) txt+=(txt?" ":"")+t; } }
        body.appendChild(el("div","jpara",`<div class="jp"><span class="jnum">${esc(pn)}</span>${esc(txt)}</div>`));
      }
    }
  }
  wrap.appendChild(body);
  return wrap;
}
async function openJudgmentModal(caseId){
  const c=caseById2(caseId); if(!c||!c.akn) return;
  const modal=$("#modal"), body=$("#modal-body");
  body.innerHTML=`<div class="ad-loading"><div class="spinner"></div>Loading the judgment…</div>`;
  modal.classList.add("show"); document.body.style.overflow="hidden";
  try{
    const doc=await getJudgment(caseId,c.akn);
    body.innerHTML=""; body.appendChild(renderJudgment(c,doc)); body.scrollTop=0;
  }catch(e){
    body.innerHTML=`<div class="ad-loading">Couldn't load this judgment.<br><br>The viewer reads the <code>.akn.xml</code> files live, so it must be served over http - see the note under the sidebar.</div>`;
  }
}

/* ============================================================ ROUTER + BOOT */
/* nav badge for a state-object category: a count when items exist, "none" when the
   state is modelled but has no discrete items (e.g. no amendments), else "soon". */
function stateBadge(cat){
  const d = STATE_DATA && STATE_DATA[cat];
  if(!d) return `<span class="count soon">soon</span>`;
  const n = (d.items||[]).length;
  if(n>0) return `<span class="count">${n}</span>`;
  return `<span class="count" style="opacity:.55">none</span>`;
}
/* the section headings the story page renders, in the order it renders them -
   drives the nav accordion. The roles comes last and owns the two institution
   pages as children, so Police and Courts sit a level in under it. */
const STORY_SEC_LABELS={process:"The process", fees:"The fees"};
function storySections(){
  const S=(STATE_DATA||{}).story;
  const proc=(S&&S.process)||NATIONAL_PROCESS;
  const INST=((STATE_DATA||{}).institutions)||NATIONAL_INSTITUTIONS;
  const out=[];
  if(proc) out.push({id:"process",label:STORY_SEC_LABELS.process});
  Object.keys(STORY_SEC_LABELS).forEach(id=>{ if(id!=="process" && S && S[id]) out.push({id,label:STORY_SEC_LABELS[id]}); });
  // Police & the Courts are their own pages, nested under The roles
  const kids=[];
  if(INST&&INST.police) kids.push({id:"page-police",label:"Police",view:"police"});
  if(INST&&INST.judiciary) kids.push({id:"page-courts",label:"Courts",view:"courts"});
  if(S&&S.roles) out.push({id:"roles",label:"The roles",children:kids});
  else out.push(...kids);   // no roles section for this state: the pages stand on their own
  return out;
}
/* the sub-nav markup for one story section, and its children if it has any */
function storyNavHTML(){
  const lead=`<span class="ico">${ic('chevron-right')}</span>`;
  const link=s=> s.view
    ? `<a class="subnav" data-view="${s.view}">${lead} ${esc(s.label)}</a>`
    : `<a class="subnav" data-story-sec="${s.id}">${lead} ${esc(s.label)}</a>`;
  return storySections().map(s=>{
    if(!(s.children&&s.children.length)) return link(s);
    return `<div class="subnav-wrap ov-collapsed">
        <a class="subnav subnav-toggle" data-story-sec="${s.id}">${lead} ${esc(s.label)} <span class="nav-chev">${ic('chevron-down')}</span></a>
        <div class="nav-sub2"><div class="nav-sub-inner">
          ${s.children.map(k=>`<a class="subnav subnav-nested" data-view="${k.view}">${lead} ${esc(k.label)}</a>`).join("")}
        </div></div>
      </div>`;
  }).join("");
}
/* keep the sidebar disclosure in step with the view: the Police and Courts pages
   live under The roles inside The story, so landing on one (in-app or by deep
   link) opens both groups and marks the parent. Only ever opens, never collapses. */
function syncNavGroups(){
  const nav=$("#nav"); if(!nav) return;
  let inGroup=false;
  nav.querySelectorAll(".subnav-wrap").forEach(w=>{
    const on=!!w.querySelector("a.subnav[data-view].active");
    const tog=w.querySelector("a.subnav-toggle");
    if(on){ w.classList.remove("ov-collapsed"); inGroup=true; }
    if(tog) tog.classList.toggle("parent-active", on);
  });
  const sw=$("#storyWrap");
  if(sw && (inGroup || currentView==="story" || sw.querySelector("a[data-view].active"))) sw.classList.remove("ov-collapsed");
}
function goStorySection(id){
  _extra={sec:"story-"+id};
  const scroll=()=>{ const t=document.getElementById("story-"+id); if(t){ const y=t.getBoundingClientRect().top+window.scrollY-16; window.scrollTo({top:Math.max(0,y), behavior:"smooth"}); t.classList.add("sec-flash"); setTimeout(()=>t.classList.remove("sec-flash"),1100); } };
  if(currentView!=="story"){ go("story", true); setTimeout(scroll,110); }   // render first, then scroll
  else { const sw=$("#storyWrap"); if(sw) sw.classList.remove("ov-collapsed"); writeHash(true); scroll(); }  // already here: just scroll
}
/* jump to a specific role or process stage on the story page (target of a field-note "what it changed" link) */
function goStoryUnit(unit, id){
  const domId = unit==="role" ? "role-"+id : unit==="process" ? "procstage-"+id : null;
  if(!domId) return;
  _extra={sec:domId};
  const scroll=()=>{ const t=document.getElementById(domId); if(t){ const y=t.getBoundingClientRect().top+window.scrollY-70; window.scrollTo({top:Math.max(0,y), behavior:"smooth"}); t.classList.add("sec-flash"); setTimeout(()=>t.classList.remove("sec-flash"),1300); } };
  if(currentView!=="story"){ go("story", true); setTimeout(scroll,140); } else { writeHash(true); scroll(); }
}
/* resolve a note's impact ref ("<state>:<unit>:<id>") to the right navigation */
function goPracticeChange(unit, ref, label){
  const id=String(ref||"").split(":").pop();
  if(unit==="term"){ if(label) goVocabWord(label); return; }
  if(unit==="role"||unit==="process"){ goStoryUnit(unit, id); return; }
}

/* ---- the pages the app offers, declared once ----------------------------
   buildNav renders these and the universal search indexes them, so the labels,
   the sections and the set of pages can never drift apart.
     section  the sidebar group the page sits in - also the context line in search
     scoped   the page reads the active state layer
     special  buildNav renders this one itself (The story carries its accordion)
     under    the story sub-nav renders the link; the label comes from storySections()
     alias    extra words a person may reasonably type for the page
     tag      the trailing count or badge in the sidebar */
const NAV_PAGES=[
  {view:"law", label:"Acts & provisions", icon:"library", section:"National objects",
   desc:"Every national Act in the corpus, with the provisions pinned to this case type.",
   alias:["acts","provisions","sections","bare act","statute","central act","national acts"],
   tag:()=>`<span class="count">${isModelled()?PROVISIONS.length:'-'}</span>`},
  {view:"caselaw", label:"Case law", icon:"scale", section:"National objects",
   desc:"The judgments that fix how the provisions are read.",
   alias:["judgments","judgements","cases","precedent","rulings","citations"],
   tag:()=>`<span class="count">${isModelled()?(CASES.length||'-'):'-'}</span>`},
  /* Policy sits with the other national objects because that is what it is: an
     instrument that binds every court in the country. It is not case-typed - a
     regulation on how a court may use AI is as true of a motor claim as of a §138
     complaint - so, like Standards, it carries no state scope and no case scope. */
  {view:"policy", label:"Policy", icon:"landmark", section:"National objects",
   desc:"Policy instruments that govern how a court runs, rather than how a case is decided.",
   alias:["policy","policies","regulations","ai","artificial intelligence","guidance","circular","draft regulations"],
   tag:()=>`<span class="count">${(POLICY.documents||[]).length||'-'}</span>`},
  {view:"story", label:"The story", icon:"book-open", section:"", scoped:true, special:true,
   desc:"How a case actually moves, stage by stage, and the roles around it.",
   alias:["process","stages","journey","the story","roles","lifecycle"]},
  {view:"police", label:"Police", section:"The story", scoped:true, under:"story",
   desc:"The police ladder - ranks, units and oversight - in this state.",
   alias:["thana","police station","ranks","investigating officer"]},
  {view:"courts", label:"Courts", section:"The story", scoped:true, under:"story",
   desc:"The court tiers and the people who staff them, in this state.",
   alias:["judiciary","judges","bench","forum","court staff"]},
  {view:"amendments", label:"Acts & Provisions", icon:"file-pen", section:"", scoped:true,
   desc:"State Acts and amendments, with the provisions pinned from them.",
   alias:["state acts","state amendments","amendments","state law","state provisions"],
   tag:()=>stateBadge('amendments')},
  {view:"staterules", label:"State rules", icon:"clipboard", section:"", scoped:true,
   desc:"Rules made by the state and its High Court.",
   alias:["rules","high court rules","criminal rules of practice","subordinate legislation"],
   tag:()=>stateBadge('rules')},
  {view:"notifications", label:"Notifications", icon:"bell", section:"", scoped:true,
   desc:"Government orders, SOPs and circulars in force in this state.",
   alias:["orders","government orders","g.o.","sop","circulars","notification"],
   tag:()=>stateBadge('notifications')},
  {view:"practice", label:"Local practice", icon:"messages-square", section:"Domain & culture", scoped:true,
   desc:"Field notes on how the process really runs on the ground.",
   alias:["field notes","practice","ground reality","interviews","informal"],
   tag:()=>`<span class="count">${isModelled()?PRACTICE_NOTES.length:'-'}</span>`},
  {view:"words", label:"Vocabulary", icon:"type", section:"Domain & culture", scoped:true,
   desc:"The words the system uses, national and local, and what each one means.",
   alias:["vocab","words","terms","glossary","dictionary","terminology"],
   tag:()=>`<span class="count">${isModelled()?(Object.keys(TERMS).length+(((STATE_DATA||{}).vocabulary||{}).terms||[]).length):'-'}</span>`},
  {view:"requirements", label:"Requirements", icon:"file-text", section:"Design", scoped:true,
   desc:"The normative layer - what a system must do, each statement drawn from a provision.",
   alias:["reqs","req","normative","design requirements","must"],
   tag:()=>`<span class="count">${isModelled()?(reqNavCount()||'-'):'-'}</span>`},
  /* not scoped: a standard binds the build, not a case type or a state layer, so this
     page reads the same on every state and stays available on an unmodelled case type */
  {view:"standards", label:"Standards adherence", tab:"Standards", icon:"shield-check", section:"Design",
   desc:"The non-legal standards a build is measured against, and how each one is tested.",
   alias:["standards","standard","adherence","compliance","wcag","accessibility","a11y","security","owasp","dpdp","performance","interoperability","usability","testing","conformance"],
   count:()=>stdItems().length,
   tag:()=>`<span class="count">${stdItems().length||'-'}</span>`},
  /* A sub-tab of the page above, not a sibling of it: same question - what is this
     build measured against - asked of an instrument instead of a published standard.
     `under` keeps it out of the sidebar and puts it in that page's tab strip; it is
     still declared here so search finds it and its deep link is a page like any other. */
  {view:"aipolicy", label:"AI policy compliance", tab:"AI policy compliance",
   section:"Design", under:"standards",
   desc:"What the Supreme Court's draft AI regulations would require of a court and its vendor, clause by clause.",
   alias:["ai policy","ai compliance","ai regulations","artificial intelligence","ai register","ai incident","apex body","ai committee","genai","vendor"],
   count:()=>aipolItems().length},
  {view:"overview", label:"Overview", icon:"compass", section:"Overview",
   desc:"Where the model starts: what is modelled, and how to read it.",
   alias:["home","start","summary","introduction"]},
  {view:"structure", label:"The structure", icon:"layers", section:"Overview",
   desc:"How the model is put together - the rules, the systems and the context.",
   alias:["structure","layers","architecture","shape"]},
  {view:"split", label:"National vs State", icon:"arrow-left-right", section:"Overview",
   desc:"What is national and identical everywhere, and what each state adds on top.",
   alias:["national vs state","state vs national","split","division of law"]},
  {view:"time", label:"The 2024 code switch", icon:"history", section:"Overview",
   desc:"The 2023 Sanhitas replacing the old codes, and which set is live for a case.",
   alias:["code switch","bns","bnss","bsa","sanhita","crpc","ipc","new codes","transition"]}
];
const navLink=(p,cls)=>`<a data-view="${p.view}"${cls?` class="${cls}"`:""}><span class="ico">${ic(p.icon)}</span> ${esc(p.label)}${p.tag?" "+p.tag():""}</a>`;
const navPagesIn=sec=>NAV_PAGES.filter(p=>p.section===sec && !p.under && !p.special);
/* A sub-tab is a page that lives inside another page rather than beside it. The pages
   nested under The story get their own sidebar links because they are about different
   subjects; these are about the same subject read from a different instrument, so they
   belong in a tab strip on the parent page and nowhere else. `under` is what says so:
   navPagesIn already drops them from the sidebar, and this builds the strip from the
   same declaration, so a second sub-tab is an entry in NAV_PAGES and no new code. */
function subTabsHTML(parent, active){
  const tabs=[NAV_PAGES.find(p=>p.view===parent), ...NAV_PAGES.filter(p=>p.under===parent)].filter(Boolean);
  if(tabs.length<2) return "";
  return `<div class="subtabs" role="tablist">`+tabs.map(t=>{
    const n=t.count?t.count():0;
    return `<button class="subtab${t.view===active?" on":""}" role="tab" aria-selected="${t.view===active}" `
      +`data-view="${esc(t.view)}">${esc(t.tab||t.label)}${n?`<span class="subtab-n">${n}</span>`:""}</button>`;
  }).join("")+`</div>`;
}
/* the page whose tab strip this view appears in - the sidebar marks that one active */
const parentView = view => (NAV_PAGES.find(p=>p.view===view)||{}).under || null;
const navLinks=(sec,cls)=>navPagesIn(sec).map(p=>navLink(p,cls)).join("");
/* the same list as the sidebar offers right now: the pages nested under The story
   only exist where this state's layer carries that institution, so they are taken
   from storySections() - label included - exactly as the sub-nav takes them. */
function navPages(){
  const kids={};
  storySections().forEach(s=>{ if(s.view) kids[s.view]=s.label;
    (s.children||[]).forEach(k=>{ if(k.view) kids[k.view]=k.label; }); });
  return NAV_PAGES.filter(p=>p.under!=="story" || kids[p.view])
    .map(p=> kids[p.view] ? Object.assign({},p,{label:kids[p.view]}) : p);
}
function buildNav(){
  const c=caseById(activeCase);
  const nav=$("#nav");
  const st=stateById(activeState);
  nav.innerHTML=`
    <div class="casedd" id="casedd">
      <button class="casedd-btn" id="caseddBtn" title="Change the active case type">
        <span class="ac-label">Case</span>
        <span class="ac-name">${c.name} <span>· ${c.act.split('·').pop().trim()}</span></span>
        <span class="casedd-chev">${ic('chevron-down')}</span>
      </button>
      <div class="casedd-menu" id="caseddMenu">
        ${CASE_TYPES.map(ct=>{const on=ct.id===activeCase, planned=ct.status!=="active"; return `<div class="casedd-item ${on?'on':''} ${planned?'planned':''}" data-id="${ct.id}"><span>${ct.name} <span class="ci-sub">· ${ct.act.split('·').pop().trim()}</span></span>${on?'<span class="ci-check">✓ active</span>':(planned?'<span class="ci-check" style="color:var(--ink-3)">soon</span>':'')}</div>`;}).join("")}
      </div>
    </div>
    <div class="nav-group">National objects</div>
    <div class="nav-scoped">${navLinks("National objects")}</div>
    <div class="nav-divider"></div>
    <div class="state-layer nav-scroll">
      <div class="statedd-wrap nav-group">${stateInlineSelectHTML()}</div>
      <div class="nav-scoped">
        <div class="scoped-wrap ov-collapsed" id="storyWrap">
          <a class="ov-toggle" data-view="story"><span class="ico">${ic('book-open')}</span> The story <span class="nav-chev">${ic('chevron-down')}</span></a>
          <div class="nav-sub"><div class="nav-sub-inner">${storyNavHTML()}</div></div>
        </div>
        ${navLinks("")}
      </div>
      <div class="nav-group scoped">Domain &amp; culture</div>
      <div class="nav-scoped">${navLinks("Domain & culture")}</div>
      <div class="nav-group scoped">Design</div>
      <div class="nav-scoped">${navLinks("Design")}</div>
    </div>`;
  // Overview lives subtly in the sidebar footer, not at the top
  const ov=$("#ovNav");
  if(ov) ov.innerHTML=`
    <div class="ov-menu" id="ovMenu">
      <div class="ov-pop">
        ${navPagesIn("Overview").map((p,i)=>(i===1?`<div class="ov-pop-sep"></div>`:"")+navLink(p,"ov-pop-item")).join("")}
      </div>
      <button class="ov-trigger" id="ovTrigger"><span class="ico">${ic('compass')}</span> Overview <span class="nav-chev">${ic('chevron-down')}</span></button>
    </div>`;
  const tb=$("#tbCase"); if(tb) tb.textContent=`${c.name} · ${c.act.split('·').pop().trim()}`;
  gsMountTrigger();   // the icon set is loaded by now, so the search affordance can render
  document.querySelectorAll("#nav a[data-view], #ovNav a[data-view]").forEach(a=>a.onclick=()=>{
    const ovm=$("#ovMenu"); if(ovm) ovm.classList.remove("open");
    // keep The story open when it, or anything under it (Police / Courts), is clicked
    const sw=$("#storyWrap"); if(sw) sw.classList.toggle("ov-collapsed", !(a.dataset.view==="story" || sw.contains(a)));
    _extra={}; go(a.dataset.view, true);   // fresh top-level nav: clear any deep anchor, new history entry
    setDrawer(false);
  });
  // story accordion: the chevron toggles it in place; the section links scroll to a heading
  const schev=nav.querySelector("#storyWrap .ov-toggle .nav-chev");
  if(schev) schev.onclick=e=>{ e.stopPropagation(); e.preventDefault(); $("#storyWrap").classList.toggle("ov-collapsed"); };
  nav.querySelectorAll("#storyWrap .subnav[data-story-sec]").forEach(a=>a.onclick=e=>{
    e.stopPropagation();
    const w=a.closest(".subnav-wrap"); if(w) w.classList.remove("ov-collapsed");   // the label also opens its children
    goStorySection(a.dataset.storySec); setDrawer(false);
  });
  // a nested group (The roles): its own chevron only toggles, it does not navigate
  nav.querySelectorAll("#storyWrap .subnav-wrap").forEach(w=>{
    const ch=w.querySelector("a.subnav-toggle .nav-chev");
    if(ch) ch.onclick=e=>{ e.stopPropagation(); e.preventDefault(); w.classList.toggle("ov-collapsed"); };
  });
  const dd=$("#casedd",nav), btn=$("#caseddBtn",nav);
  const ovt=$("#ovTrigger");
  if(btn) btn.onclick=e=>{ e.stopPropagation(); dd.classList.toggle("open"); };
  if(ovt) ovt.onclick=e=>{ e.stopPropagation(); $("#ovMenu").classList.toggle("open"); };
  nav.querySelectorAll(".casedd-item[data-id]").forEach(it=>it.onclick=()=>{
    const ct=caseById(it.dataset.id);
    if(ct && ct.status==="active"){ activeCase=ct.id; buildNav(); go("law"); }
    else dd.classList.remove("open");
  });
  const ssel=nav.querySelector(".state-inline");
  if(ssel) ssel.onchange=e=>{ activeState=e.target.value; loadStateData().then(()=>{ buildNav(); go(currentView); }); };
}
function setMain(node){const main=$("#main"); main.innerHTML=""; main.appendChild(node); window.scrollTo(0,0);}
function go(view, push){
  if(view==="parts"||view==="provisions") view="law"; // Acts + Provisions merged
  if(!V[view]) view="overview";
  currentView=view;
  /* which sidebar link lights up. A sub-tab has no link of its own - the reader is on
     the parent page, on one of its tabs - so the parent's link carries the state. Every
     other page, including the ones nested under The story, has its own link and keeps it. */
  const inNav = v => !!document.querySelector('#nav a[data-view="'+v+'"], #ovNav a[data-view="'+v+'"]');
  const navView = inNav(view) ? view : (parentView(view)||view);
  document.querySelectorAll("#nav a[data-view], #ovNav a[data-view]").forEach(a=>a.classList.toggle("active", a.dataset.view===navView));
  syncNavGroups();   // open the groups that contain the active page, mark the parent
  setMain(V[view]());
  if(view!=="words") try{ linkifyVocab($("#main")); }catch(e){}   // turn vocabulary words in the prose into links
  writeHash(!!push);
  // a deep link may name a section/role/stage to scroll to once the view is on screen
  if(pendingAnchor){ const id=pendingAnchor; pendingAnchor=null; scrollToId(id, 70, true); }
}
window.go=go;

/* robustly scroll a just-rendered element into view - two passes, because a
   state switch or async fill can shift layout after the first scroll. Accepts a
   DOM id (or the "story-"+id fallback). */
function scrollToId(id, offset, flash){
  const doit=()=>{ const t=document.getElementById(id)||document.getElementById("story-"+id);
    if(!t) return false;
    const y=t.getBoundingClientRect().top+window.scrollY-(offset||70);
    window.scrollTo({top:Math.max(0,y), behavior:"auto"});
    if(flash){ t.classList.add("sec-flash"); setTimeout(()=>t.classList.remove("sec-flash"),1400); }
    return true; };
  setTimeout(()=>{ if(doit()) setTimeout(()=>{ const t=document.getElementById(id)||document.getElementById("story-"+id); if(t){ const y=t.getBoundingClientRect().top+window.scrollY-(offset||70); window.scrollTo({top:Math.max(0,y),behavior:"auto"}); } },320); },120);
}

/* ---- deep-link router: the URL hash carries view + state + position ----
   #<view>?state=<s>&sec=<anchor>&lens=<l>&term=<w>&note=<id>&req=<id>&std=<id>&act=<a>&eid=<e>
   &aip=<id>&doc=<policy doc>&clause=<clause ref> */
function buildHash(){
  const p=new URLSearchParams();
  if(activeState) p.set("state",activeState);
  if(currentView==="story" && processLens && processLens!=="prescribed") p.set("lens",processLens);
  Object.entries(_extra||{}).forEach(([k,v])=>{ if(v) p.set(k,v); });
  const q=p.toString();
  return currentView+(q?"?"+q:"");
}
function writeHash(push){
  const h=buildHash(); if(h===_lastHash) return; _lastHash=h;
  try{ history[push?"pushState":"replaceState"](null,"","#"+h); }catch(e){}
  // remember the last position (state + view + section + lens) forever - restored on
  // the next visit. localStorage never expires and never leaves the browser.
  try{ localStorage.setItem("dristi:pos", h); }catch(e){}
}
function applyHash(raw, push){
  const [view0,qs]=String(raw||"law").split("?");
  const view=view0||"law";
  const p=new URLSearchParams(qs||"");
  const st=p.get("state");
  const run=()=>{
    if(p.get("lens")) processLens=p.get("lens");
    _extra={}; pendingAnchor=null;
    const term=p.get("term"), note=p.get("note"), sec=p.get("sec"), act=p.get("act"), eid=p.get("eid"), req=p.get("req"), std=p.get("std");
    const aip=p.get("aip"), pdoc=p.get("doc"), clause=p.get("clause");
    if(term){ vocabScrollTo=term; _extra.term=term; }
    if(note){ practiceScrollTo=note; _extra.note=note; }
    if(req){ reqScrollTo=req; _extra.req=req; }
    if(std){ stdScrollTo=std; _extra.std=std; }
    if(aip){ aipScrollTo=aip; _extra.aip=aip; }
    // a policy deep link names the document, and may name the clause inside it
    if(pdoc && policyDoc(pdoc)){ policyDocId=pdoc; _extra.doc=pdoc; }
    if(clause){ policyScrollTo=clause; _extra.clause=clause; }
    if(sec){ pendingAnchor=sec; _extra.sec=sec; }
    if(act){ _extra.act=act; if(eid) _extra.eid=eid; }
    go(view, !!push);
    if(act && typeof SOURCES!=="undefined" && SOURCES[act]) setTimeout(()=>{ try{ openActModal(act, eid||undefined); }catch(e){} },120);
  };
  if(st && st!==activeState && (JURISDICTIONS||[]).some(j=>j.id===st)){
    activeState=st; loadStateData().then(()=>{ buildNav(); run(); }).catch(run);
  } else run();
}
window.addEventListener("hashchange",()=>{
  const h=(location.hash||"").slice(1);
  if(h===_lastHash) return;   // our own write
  _lastHash=h; applyHash(h, false);
});

/* theme toggle */
function setTheme(t){document.documentElement.classList.toggle("dark",t==="dark"); document.querySelectorAll(".tt-opt").forEach(o=>o.classList.toggle("on",o.dataset.t===t));}
document.querySelectorAll(".tt-opt").forEach(o=>o.onclick=()=>setTheme(o.dataset.t));
setTheme("dark");
$("#brand").onclick=()=>go("law");

/* mobile off-canvas sidebar */
function setDrawer(open){
  const sb=$("#sidebar"), bd=$("#backdrop");
  if(sb) sb.classList.toggle("open",open);
  if(bd) bd.classList.toggle("show",open);
}
(function(){
  const hb=$("#hamburger"), bd=$("#backdrop");
  if(hb) hb.onclick=()=>setDrawer(!$("#sidebar").classList.contains("open"));
  if(bd) bd.onclick=()=>setDrawer(false);
  const tbCase=$("#tbCase"); if(tbCase) tbCase.onclick=()=>setDrawer(true);
})();

/* delegated: open the full-Act modal from any "view-full" button */
document.addEventListener("click",e=>{
  // a sub-tab is a page, so it navigates through the same route as a sidebar link
  const tb=e.target.closest(".subtab");
  if(tb && tb.dataset.view){ _extra={}; go(tb.dataset.view, true); return; }
  // a compliance citation opens the policy document, landing on the clause it names
  const pc2=e.target.closest(".pcite");
  if(pc2 && pc2.dataset.clause){ e.stopPropagation(); goPolicyClause(pc2.dataset.doc, pc2.dataset.clause); return; }
  const pv=e.target.closest(".pdf-orig");
  if(pv && pv.dataset.pdf){ if(window.openPdfModal) openPdfModal(pv.dataset.pdf, pv.dataset.pdftitle||"Original document"); else window.open(pv.dataset.pdf,"_blank"); return; }
  const sd=e.target.closest(".stdoc");
  if(sd && sd.dataset.akn){ openStateDocModal(sd.dataset.akn, sd.dataset.title, sd.dataset.sub, sd.dataset.pdf||"", sd.dataset.eid||""); return; }
  const ci=e.target.closest(".cite");
  if(ci){ e.stopPropagation();
    if(ci.dataset.nat){ const [a,eid]=ci.dataset.nat.split(":"); if(SOURCES[a]) openActModal(a,eid); }
    else if(ci.dataset.akn){ openStateCiteModal(ci.dataset.akn, ci.dataset.eid, ci.dataset.title); }
    return; }
  const sr=e.target.closest(".src-ref");
  if(sr){ e.stopPropagation();
    if(sr.dataset.nat){ const [a,eid]=sr.dataset.nat.split(":"); if(SOURCES[a]) openActModal(a,eid); }
    else if(sr.dataset.akn){ openStateCiteModal(sr.dataset.akn, sr.dataset.eid, sr.dataset.title); }
    return; }
  const sn=e.target.closest(".src-note");
  if(sn && sn.dataset.note){ e.stopPropagation(); goPracticeNote(sn.dataset.note); return; }
  const pc=e.target.closest(".pn-change");
  if(pc && pc.dataset.ref){ e.stopPropagation(); goPracticeChange(pc.dataset.unit, pc.dataset.ref, pc.dataset.label); return; }
  const vt=e.target.closest(".vocab-term");
  if(vt && vt.dataset.term){ e.stopPropagation(); goVocabWord(vt.dataset.term); return; }
  const se=e.target.closest(".stedge");
  if(se && se.dataset.ref){ e.stopPropagation(); const [a,eid]=se.dataset.ref.split(":"); if(SOURCES[a]) openActModal(a,eid); return; }
  const b=e.target.closest(".view-full");
  if(b){ if(b.dataset.ref){const [a,eid]=b.dataset.ref.split(":"); openActModal(a,eid);} else if(b.dataset.act){ openActModal(b.dataset.act);} return; }
  if(e.target.closest("[data-close]")){ closeModal(); return; }
  const chip=e.target.closest(".cchip"); if(chip && chip.dataset.ref){ hideProvPop(); const [a,eid]=chip.dataset.ref.split(":"); if(SOURCES[a]) openActModal(a,eid); else jumpToProvision(chip.dataset.ref); return; }
  const ic=e.target.closest(".ic"); if(ic && ic.dataset.caseid){ jumpToCase(ic.dataset.caseid); return; }
  const rj=e.target.closest(".readjmt"); if(rj && rj.dataset.caseid){ openJudgmentModal(rj.dataset.caseid); return; }
  const dd=$("#casedd"); if(dd && !e.target.closest("#casedd")) dd.classList.remove("open");
  const sdd=$("#statedd"); if(sdd && !e.target.closest("#statedd")) sdd.classList.remove("open");
  const ovm=$("#ovMenu"); if(ovm && !e.target.closest("#ovMenu")) ovm.classList.remove("open");
});
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ closeModal(); const ovm=$("#ovMenu"); if(ovm) ovm.classList.remove("open"); } });

/* ============================================================ UNIVERSAL SEARCH
   One overlay over everything the app already holds in memory - provisions,
   vocabulary, requirements, judgments, field notes, story stages and roles,
   the institution ladders and the Acts. Nothing is fetched: the index is built
   once from the same arrays the views read, so typing is pure filtering.
   Every result hands off to the navigation that already exists (openActModal,
   goVocabWord, goPracticeNote, the #requirements?req= deep link, …) - the
   overlay never invents a route of its own. */
const GS_TYPES=[["page","Pages"],
                ["provision","Provisions"],["vocab","Vocabulary"],["req","Requirements"],["std","Standards"],
                ["policy","Policy"],["case","Case law"],
                ["note","Local practice"],["story","Story"],["inst","Institutions"],["act","Acts"]];
const GS_LABEL={}; GS_TYPES.forEach(([k,v])=>{GS_LABEL[k]=v;});
const GS_CAP=6;                     // rows shown per group; the total is always stated
const gsStrip=s=>String(s==null?"":s).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
const gsTrim=(s,n)=>{ s=gsStrip(s); return s.length>n ? s.slice(0,n).replace(/\s+\S*$/,"")+"…" : s; };
/* which shortcut to advertise. navigator.platform is deprecated, so ask the UA-data
   API first and fall back to the user-agent string; when neither says Mac - including
   when neither exists - advertise the Ctrl form, which is the safer default because a
   Mac reader recognises Ctrl+K as "not mine" faster than a PC reader decodes ⌘. */
const gsIsMac=()=>{
  const p=(navigator.userAgentData && navigator.userAgentData.platform) || "";
  if(p) return /mac/i.test(p);
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent||"");
};
/* the same shortcut in the two forms it is written in: on the button, and out loud */
const gsHintKeys=()=>gsIsMac() ? "⌘K" : "Ctrl K";
const gsHintSaid=()=>gsIsMac() ? "Command K" : "Control K";

/* ---- the index ---------------------------------------------------------- */
let GS_INDEX=null, _gsKey="";
function gsKey(){ return [PROVISIONS.length,Object.keys(TERMS).length,REQS.length,stdItems().length,CASES.length,
  PRACTICE_NOTES.length,Object.keys(STATES_DATA).length,Object.keys(SOURCES).length,
  (POLICY.documents||[]).length,aipolItems().length,
  activeState].join("|"); }   // activeState: the page rows carry the state layer they open on
/* one entry: display strings, the weighted fields it is matched on, and how to open it.
   f is [text, weight] - the weight says how identifying that field is, so a hit on a
   term's word outranks a hit buried in some requirement's why. */
function gsPush(L,e){
  const f=(e.f||[]).filter(x=>x&&x[0]!=null&&String(x[0]).trim()!=="");
  e.f=f.map(x=>[gsStrip(x[0]).toLowerCase(),x[1]]);
  e.hay=e.f.map(x=>x[0]).join("  ");
  e.title=gsStrip(e.title); e.sub=gsStrip(e.sub); e.snip=gsStrip(e.snip||"");
  if(e.title) L.push(e);
}
/* navigate through the existing deep-link router: it switches state when the target
   layer differs from the active one, exactly as a shared link does. */
function gsGo(view, stId, anchor){
  const p=new URLSearchParams();
  p.set("state", (stId && (JURISDICTIONS||[]).some(j=>j.id===stId)) ? stId : activeState);
  if(anchor) p.set("sec", anchor);
  applyHash(view+"?"+p.toString(), true);
}
function gsGoReq(r){
  const p=new URLSearchParams();
  p.set("state", r.scope==="national" ? activeState : r.scope);
  p.set("req", r.id);
  applyHash("requirements?"+p.toString(), true);
}
/* a standard binds no state, so its link carries only the id - the router keeps
   whatever layer the reader was already on */
function gsGoStd(s){ applyHash("standards?std="+encodeURIComponent(s.id), true); }
function gsBuildIndex(){
  const L=[];

  /* The pages themselves - taken from the sidebar's own list, so every tab the app
     offers is findable by name. A state-scoped page opens on the active state layer,
     exactly as clicking its nav link does; the state is named on the row. */
  const stNow=(stateById(activeState)||{}).name||"";
  navPages().forEach(p=>{
    const ctx=p.section||"";
    gsPush(L,{type:"page", state:p.scoped?activeState:null, title:p.label,
      view:p.view, scoped:!!p.scoped,
      sub:"Page"+(ctx?" · "+ctx:""), snip:p.desc||"",
      f:[[p.label,1], ...((p.alias||[]).map(a=>[a,.92])), [ctx,.35], [p.scoped?stNow:"",.3]],
      open:()=>gsGo(p.view, p.scoped?activeState:null, null)});
  });

  /* Acts - the national sources, then every state instrument (Act, rules, notification) */
  Object.entries(SOURCES).forEach(([id,s])=>{
    gsPush(L,{type:"act", title:s.title, sub:"Act · "+((DOMAINS[s.domain]||{}).label||s.domain), snip:s.status||"",
      f:[[s.title,1],[id,.9],[s.status,.4]], open:()=>openActModal(id)});
  });
  const CATV={amendments:"amendments", rules:"staterules", notifications:"notifications"};
  const CATL={amendments:"State Act", rules:"State rules", notifications:"Notification"};
  (JURISDICTIONS||[]).forEach(j=>{
    Object.keys(CATV).forEach(cat=>{
      (((stateLayer(j.id)||{})[cat]||{}).items||[]).forEach(it=>{
        const openDoc = it.akn ? ()=>openStateDocModal(it.akn,it.title,it.cite||"", it.pdf?(DATA_BASE+it.pdf):"")
                       : it.pdf ? ()=>openPdf(DATA_BASE+it.pdf,it.title)
                       : ()=>gsGo(CATV[cat], j.id, null);
        gsPush(L,{type:"act", state:j.id, title:it.title, sub:CATL[cat]+(it.cite?" · "+it.cite:""), snip:it.note||"",
          f:[[it.title,1],[it.cite,.7],[it.alias,.6],[it.note,.4]], open:openDoc});
        /* the state's own pinned provisions read as provisions, like the national ones */
        (it.key||[]).forEach(k=>{
          const num=String(k.eId||"").replace(/^(sec|rule|art)_/,"").replace(/_/g," ");
          gsPush(L,{type:"provision", state:j.id, title:stEidNum(k.eId)+" "+(k.label||""), sub:"Provision · "+it.title, snip:k.note||"",
            f:[[num,1],["r."+num,1],["rule "+num,.95],[k.label,.85],[it.title,.6],[it.alias,.5],[k.note,.4]],
            open: it.akn ? ()=>openStateDocModal(it.akn,it.title,it.cite||"", it.pdf?(DATA_BASE+it.pdf):"", k.eId)
                         : ()=>gsGo(CATV[cat], j.id, null)});
        });
      });
    });
  });

  /* Provisions - the national pins. A section number typed bare must land here. */
  PROVISIONS.forEach(p=>{
    const s=actOf(p.ref)||{title:p.act};
    const num=String(p.eId||"").replace(/^(sec|art)_/,"").replace(/_/g," ");
    const lbl=secNum(p.ref);
    gsPush(L,{type:"provision", title:lbl+" · "+s.title.split(",")[0], sub:"Provision · "+s.title+" · "+p.role, snip:p.note||p.role,
      f:[[num,1],["s."+num,1],["s "+num,1],[lbl,1],["section "+num,.9],[p.act+" "+num,.95],
         [s.title,.8],[p.act,.7],[p.role,.7],[p.note,.45]],
      rank:Math.max(0,TIER_ORDER.indexOf(p.tier)), open:()=>openActModal(p.act,p.eId)});
  });

  /* Vocabulary - national, then every state layer (all of them, not just the active one) */
  Object.entries(TERMS).forEach(([w,v0])=>{
    const v=(typeof v0==="string"?{ref:v0}:v0);
    gsPush(L,{type:"vocab", title:w.charAt(0).toUpperCase()+w.slice(1), sub:"Vocabulary · national"+(v.group?" · "+v.group:""), snip:v.gloss||"",
      f:[[w,1], ...((v.aka||[]).map(a=>[a,.85])), [v.group,.5],[v.role,.45],[v.gloss,.42]],
      open:()=>goVocabWord(w)});
  });
  (JURISDICTIONS||[]).forEach(j=> stateVocabTerms(j.id).forEach(t=>{
    if(!t.word) return;
    gsPush(L,{type:"vocab", state:j.id, title:t.word, sub:"Vocabulary"+(t.group?" · "+t.group:""), snip:t.gloss||"",
      f:[[t.word,1], ...((t.aka||[]).map(a=>[a,.85])), [t.group,.5],[t.role,.45],[t.gloss,.42],[t.source,.3]],
      open:()=>goVocabWord(t.word)});
  }));

  /* Requirements - the id is the most identifying thing about one */
  REQS.forEach(r=>{
    gsPush(L,{type:"req", state:(r.scope&&r.scope!=="national")?r.scope:null,
      title:gsTrim(r.statement,110), sub:"Requirement · "+r.id+" · "+reqCatLabel(r.category)+" · "+(r.level||""), snip:r.why||r.test||"",
      f:[[r.id,1],[r.statement,.8],[(r.binds||{}).target,.55],[reqCatLabel(r.category),.5],[r.category,.6],
         [r.level,.35],[r.why,.4],[r.test,.35]],
      open:()=>gsGoReq(r)});
  });

  /* Standards - not state-scoped, so no state rides on the row */
  stdItems().forEach(s=>{
    gsPush(L,{type:"std", state:null,
      title:s.name, sub:"Standard · "+(s.group||""), snip:s.gloss||s.test||"",
      f:[[s.name,1],[s.group,.5],[s.gloss,.45],[s.test,.35],[s.pass,.35]],
      open:()=>gsGoStd(s)});
  });

  /* The policy layer: each document, and each compliance drawn from one. A reader who
     types "AI register" wants the obligation, so the compliance is indexed on its
     citation too - "reg 37" finds it. */
  (POLICY.documents||[]).forEach(d=>{
    gsPush(L,{type:"policy", state:null, title:d.title, sub:"Policy · "+(d.issuer||"")+(d.status?" · "+d.status:""),
      snip:d.summary||"",
      f:[[d.title,1],[d.short,.9],[d.id,.8],[d.kind,.5],[d.issuer,.5],[d.summary,.4]],
      open:()=>goPolicyClause(d.id, null)});
  });
  aipolItems().forEach(s=>{
    const doc=policyDoc(s.document);
    const cites=String(s.citation||"").split("·").map(x=>polCiteLabel(x.trim(), doc)).join(" ");
    gsPush(L,{type:"policy", state:null, title:s.name,
      sub:"AI policy compliance · "+aipBinds(s.binds)+(cites?" · "+cites:""), snip:s.gloss||"",
      f:[[s.name,1],[cites,.85],[s.gloss,.5],[reqArtifact(s.artifact),.45],[s.build,.35],[s.test,.3]],
      open:()=>applyHash("aipolicy?aip="+encodeURIComponent(s.id), true)});
  });

  /* Case law */
  CASES.forEach(c=>{
    gsPush(L,{type:"case", title:c.name, sub:"Judgment · "+c.citation+(c.year?" · "+c.year:""), snip:c.holding||"",
      f:[[c.name,1],[c.citation,.95],[c.neutral_citation,.9],[String(c.year||""),.45],
         [(c.topics||[]).map(t=>CASE_TOPICS[t]||t).join(" · "),.5],[c.holding,.42]],
      open:()=>jumpToCase(c.id)});
  });

  /* Local practice field notes */
  (PRACTICE_NOTES||[]).forEach(n=>{
    const stmt=n.statement||n.quote||"";
    gsPush(L,{type:"note", state:n.place, title:(n.serial?n.serial+" · ":"")+gsTrim(stmt,100), sub:"Field note", snip:stmt,
      f:[[n.serial,1],[n.id,.9],[(n.tags||[]).join(" · "),.55],[(n.themes||[]).join(" · "),.5],
         [(n.attribution||{}).heardFrom,.5],[stmt,.45]],
      open:()=>goPracticeNote(n.id)});
  });

  /* The story and the institutions, per state - each state gets whatever its own page
     would render, which is its own layer or the national baseline it falls back to. */
  (JURISDICTIONS||[]).forEach(j=>{
    const D=stateLayer(j.id)||{};
    const S=D.story||{};
    const proc=S.process||NATIONAL_PROCESS;
    (((proc||{}).stages)||[]).forEach(st=>{
      const raw=String(st.stage||""); const title=raw.replace(/^\s*\d+\s*[·.\-]\s*/,"");
      const text=(st.steps||[]).map(x=>x.t).join(" ");
      gsPush(L,{type:"story", state:j.id, title:title, sub:"Process stage", snip:text,
        f:[[title,1],[raw,.9],[text,.4]],
        open:()=>gsGo("story", j.id, st.id?("procstage-"+st.id):"story-process")});
    });
    ((S.roles||{}).items||[]).forEach(r=>{
      gsPush(L,{type:"story", state:j.id, title:r.role, sub:"Role", snip:r.who||"",
        f:[[r.role,1],[(ROLE_CATS[r.cat]||{}).label,.5],[r.who,.42],[r.basis,.32]],
        open:()=>gsGo("story", j.id, r.id?("role-"+r.id):"story-roles")});
    });
    const INST=D.institutions||NATIONAL_INSTITUTIONS||{};
    [["police",(INST.police||{}).ranks,"Police rank"],["police",(INST.police||{}).units,"Police unit"],
     ["police",(INST.police||{}).oversight,"Oversight body"],
     ["courts",(INST.judiciary||{}).tiers,"Court"],["courts",(INST.judiciary||{}).roles,"Court role"]
    ].forEach(([view,arr,lab])=>{
      (arr||[]).forEach(it=>{
        gsPush(L,{type:"inst", state:j.id, title:it.name, sub:lab, snip:it.who||it.role||it.head||"",
          f:[[it.name,1], ...((it.aka||[]).map(a=>[a,.85])), [it.service,.5],[it.role,.45],[it.head,.45],[it.who,.38],[it.entry,.28]],
          open:()=>gsGo(view, j.id, it.id?("inst-"+it.id):null)});
      });
    });
  });
  return L;
}
function gsIndex(){
  const k=gsKey();
  if(!GS_INDEX || _gsKey!==k){ const t0=performance.now(); GS_INDEX=gsBuildIndex(); _gsKey=k;
    window.__gsPerf={entries:GS_INDEX.length, buildMs:+(performance.now()-t0).toFixed(2)}; }
  return GS_INDEX;
}

/* ---- scopes -------------------------------------------------------------
   A leading "<scope>: " narrows the search before anything is scored, so the
   ranking below is untouched - a scope removes candidates, it never reorders
   them. Two kinds, and they compose: a state ("kerala:") and a kind of thing
   ("pages:", "laws:"). A prefix is only honoured when the word before the
   colon is a scope we know; anything else - "foo: bar", "held that: x" - is
   searched literally as typed, because a colon is ordinary punctuation. */
const GS_TYPE_SCOPES=[
  {id:"pages",        label:"Pages",         types:["page"],
   alias:["page","pages","tab","tabs","view","views","screen","screens"]},
  {id:"provisions",   label:"Provisions",    types:["provision"],
   alias:["provision","provisions","section","sections","sec"]},
  {id:"vocabulary",   label:"Vocabulary",    types:["vocab"],
   alias:["vocab","vocabulary","word","words","term","terms","glossary"]},
  {id:"requirements", label:"Requirements",  types:["req"],
   alias:["req","reqs","requirement","requirements"]},
  {id:"standards",    label:"Standards",     types:["std"],
   alias:["standard","standards","adherence","compliance","conformance","wcag","accessibility","a11y"]},
  {id:"cases",        label:"Case law",      types:["case"],
   alias:["case","cases","case law","caselaw","judgment","judgments","judgement","judgements","ruling","rulings","precedent","precedents"]},
  {id:"practice",     label:"Local practice",types:["note"],
   alias:["note","notes","practice","local practice","field note","field notes","fieldnote","fieldnotes","ground"]},
  {id:"story",        label:"Story",         types:["story"],
   alias:["story","stories","process","stage","stages","role","roles","journey"]},
  {id:"institutions", label:"Institutions",  types:["inst"],
   alias:["inst","institution","institutions","court","courts","police","body","bodies"]},
  {id:"acts",         label:"Acts",          types:["act"],
   alias:["act","acts","statute","statutes","instrument","instruments","legislation"]},
  /* "the law" is not a group name: to a lawyer it means the instrument and the
     section indifferently, so it takes both. The exact group names stay exact. */
  {id:"law",          label:"Acts and provisions", short:"Law", types:["act","provision"],
   alias:["law","laws","rule","rules"]}
];
let _gsScopes=null, _gsScopesK="";
function gsScopes(){
  const k=(JURISDICTIONS||[]).map(j=>j.id).join(",");
  if(_gsScopes && _gsScopesK===k) return _gsScopes;
  const all=[], by={};
  GS_TYPE_SCOPES.forEach(s=>all.push(Object.assign({kind:"type"},s)));
  (JURISDICTIONS||[]).forEach(j=>all.push({kind:"state", id:j.id, label:j.name||j.id, states:[j.id],
    alias:[String(j.id||"").toLowerCase(), String(j.name||"").toLowerCase()]}));
  /* the layer that binds every state - the national provisions, Acts, vocabulary and judgments */
  all.push({kind:"state", id:"national", label:"National", states:["national"],
    alias:["national","india","central","centre","union"]});
  all.forEach(s=>s.alias.forEach(a=>{ if(a && !by[a]) by[a]=s; }));
  _gsScopes={all, by}; _gsScopesK=k;
  return _gsScopes;
}
/* eat leading "<word>: " runs while each word names a scope. Case-insensitive,
   the space after the colon is optional, and repeats collapse. */
function gsParseScope(raw){
  const by=gsScopes().by;
  let s=String(raw==null?"":raw), tokens=[];
  for(;;){
    const m=s.match(/^\s*([A-Za-z][A-Za-z .&'-]*?)\s*:\s*/);
    if(!m) break;
    const sc=by[m[1].toLowerCase().replace(/\s+/g," ").trim()];
    if(!sc) break;
    if(!tokens.some(t=>t.id===sc.id)) tokens.push(sc);
    s=s.slice(m[0].length);
  }
  const states=new Set(), types=new Set();
  tokens.forEach(sc=>{ (sc.kind==="state"?sc.states:sc.types).forEach(x=>(sc.kind==="state"?states:types).add(x)); });
  const real=[...states].filter(x=>x!=="national");
  return {q:s, tokens, states, types, one: (states.size===1 && real.length===1) ? real[0] : null};
}
/* the filter itself. Returns the entry to score, or null to drop it. */
function gsScopeKeep(e,sc){
  if(sc.types.size && !sc.types.has(e.type)) return null;
  if(sc.states.size){
    /* a state-scoped page belongs to whichever layer you open it on, so under a
       single state scope it retargets to that state instead of being dropped -
       "kerala: state rules" opens the State rules page on Kerala. */
    if(e.type==="page" && e.scoped && sc.one)
      return Object.assign({},e,{state:sc.one, open:()=>gsGo(e.view, sc.one, null)});
    if(!sc.states.has(e.state||"national")) return null;
  }
  return e;
}
const gsScopeNames=sc=>sc.tokens.map(t=>t.label);
/* scopes whose name the typed word begins, offered as the user types */
function gsScopeSuggest(q){
  const t=String(q||"").toLowerCase().trim();
  if(t.length<2 || /[\s:]/.test(t)) return [];
  const out=[], seen={};
  (_gsToks||[]).forEach(t=>{ seen[t.id]=1; });     // never offer a scope already on
  gsScopes().all.forEach(s=>{
    if(seen[s.id]) return;
    const a=s.alias.find(x=>x && x.indexOf(t)===0);
    if(a){ seen[s.id]=1; out.push({id:s.id, label:s.label, alias:a}); }
  });
  return out.slice(0,4);
}

/* ---- ranking ------------------------------------------------------------
   exact > prefix > word-boundary > substring, each scaled by how identifying the
   field is. A multi-word query that no single field carries whole still matches if
   every token appears somewhere, but scores below any real field hit. */
function gsFieldScore(v,q){
  if(!v) return 0;
  if(v===q) return 1000;
  const i=v.indexOf(q); if(i<0) return 0;
  if(i===0) return v.length<=q.length+2 ? 820 : 700;
  const c=v.charCodeAt(i-1);
  const word=!((c>=48&&c<=57)||(c>=97&&c<=122));   // preceded by a non-alphanumeric
  return word?450:200;
}
function gsScoreEntry(e,alts,toks){
  let best=0;
  for(let i=0;i<e.f.length;i++){
    const f=e.f[i];
    for(let a=0;a<alts.length;a++){
      const s=gsFieldScore(f[0],alts[a])*f[1]*(a?0.98:1);
      if(s>best) best=s;
    }
  }
  if(best) return best;
  if(toks.length>1 && toks.every(t=>e.hay.indexOf(t)>=0)) return 140;
  return 0;
}
function gsSearch(raw){
  const sc=gsParseScope(raw);
  const q=String(sc.q||"").toLowerCase().replace(/\s+/g," ").trim();
  if(!q && !sc.tokens.length) return null;
  const alts=[q];
  const m=q.match(/^(?:s\.?|sec\.?|section|§|r\.?|rule)\s*([0-9].*)$/);   // "s.138" / "§138" / "rule 7"
  if(m && m[1]!==q) alts.push(m[1]);
  const toks=q.split(" ").filter(Boolean);
  const idx=gsIndex();
  const hits=[];
  const scoped=sc.tokens.length>0;
  for(let i=0;i<idx.length;i++){
    let e=idx[i];
    if(scoped){ e=gsScopeKeep(e,sc); if(!e) continue; }
    const s=q ? gsScoreEntry(e,alts,toks) : 1;   // a bare scope lists everything it holds
    if(s>0) hits.push({e, s});
  }
  hits.sort((a,b)=> b.s-a.s || (a.e.rank||0)-(b.e.rank||0) || a.e.title.length-b.e.title.length
                 || a.e.title.localeCompare(b.e.title));
  const byType={};
  hits.forEach(h=>{ (byType[h.e.type]=byType[h.e.type]||[]).push(h); });
  /* groups lead with whichever type holds the strongest hit, so an exact id or
     section number puts its own type at the top of the list. Pages get one step of
     priority on top of that: when the query names a page - an exact, prefix or
     word-start hit on its label or an alias, the word-boundary class or better - the
     Pages group is pinned first, because a person typing a page name wants the page.
     Two brakes keep that honest. A page that only matches mid-word, or only on its
     section or its state name, never pins - it sorts on score like any other group.
     And an exact-class hit elsewhere (a section number, a requirement id, a whole
     vocabulary word) that scores above the page's own match still leads. */
  const groups=GS_TYPES.filter(([k])=>byType[k]&&byType[k].length)
    .map(([k,label])=>({key:k, label, rows:byType[k], total:byType[k].length, best:byType[k][0].s}));
  const pg=groups.find(g=>g.key==="page");
  const other=groups.reduce((m,g)=>g.key==="page"?m:Math.max(m,g.best),0);
  const pin=!!(pg && pg.best>=400 && !(other>=900 && other>pg.best));
  const pagePin=g=>(pin && g.key==="page") ? 1 : 0;
  groups.sort((a,b)=> pagePin(b)-pagePin(a) || b.best-a.best);
  return {q, scope:sc, groups, total:hits.length};
}

/* ---- the overlay -------------------------------------------------------- */
let _gsEl=null, _gsRows=[], _gsActive=-1, _gsOpener=null, _gsTimer=null, _gsLastQ=null;
const gsOpen=()=>!!(_gsEl && _gsEl.classList.contains("show"));
function gsHi(text,q){
  const t=String(text||""); if(!t) return "";
  const i=q?t.toLowerCase().indexOf(q):-1;
  if(i<0) return esc(t);
  return esc(t.slice(0,i))+"<mark>"+esc(t.slice(i,i+q.length))+"</mark>"+esc(t.slice(i+q.length));
}
/* a snippet window around the match, so the matched text is always visible */
function gsSnippet(text,q){
  const t=String(text||""); if(!t) return "";
  const i=q?t.toLowerCase().indexOf(q):-1;
  if(i<0) return esc(gsTrim(t,150));
  const start=Math.max(0, i-56);
  const cut=t.slice(start, start+180);
  const lead=start>0?"…":"";
  const tail=(start+180<t.length)?"…":"";
  return lead+gsHi(cut,q)+tail;
}
function gsIdle(){
  const nStates=(JURISDICTIONS||[]).length;
  const stFirst=String((((JURISDICTIONS||[])[0])||{}).id||"national");
  const nVocab=Object.keys(TERMS).length+(JURISDICTIONS||[]).reduce((n,j)=>n+stateVocabTerms(j.id).length,0);
  const bits=[[PROVISIONS.length,"provisions"],[nVocab,"vocabulary words"],[REQS.length,"requirements"],
              [CASES.length,"judgments"],[(PRACTICE_NOTES||[]).length,"field notes"]]
    .filter(b=>b[0]).map(b=>`<b>${b[0]}</b> ${b[1]}`).join(", ");
  return `<div class="gs-idle">
    <p>Search everything at once - ${bits}, plus the story, the roles, the police and court ladders and the Acts, across all ${nStates} state layers.</p>
    <p class="gs-idle-eg">Try a section number (<b>138</b>), a requirement id (<b>REQ-LIM-004</b>), a word (<b>roznama</b>), a case (<b>Rangappa</b>), or a page (<b>vocabulary</b>).</p>
    <p class="gs-idle-eg">Narrow it with a prefix - <b>${esc(stFirst)}:</b> for one state, <b>pages:</b> <b>laws:</b> <b>words:</b> <b>cases:</b> for one kind. They combine:
      <button class="gsc-eg" type="button" data-gsc-set="${esc(stFirst)}: pages: ">${esc(stFirst)}: pages:</button></p>
  </div>`;
}
/* ---- the scope as a token ------------------------------------------------
   A recognised scope leaves the text field and becomes a box sitting in the
   field, in front of the caret: the input then holds nothing but the residual
   query. It is a flex sibling of the input inside .gs-in, not an overlay with
   a measured padding, so a long scope name can never sit under the text. */
let _gsToks=[], _gsCycle=null;
const GS_PH="Search a section, a word, a requirement, a judgment…";
const gsTokLabel=t=>t.short||t.label;
const gsScopePrefix=()=>_gsToks.map(t=>t.id+": ").join("");
function gsAndList(a){
  return a.length<2 ? (a[0]||"") : a.slice(0,-1).join(", ")+" and "+a[a.length-1];
}
/* text the user typed that names a scope moves out of the field and becomes a token */
function gsAbsorb(){
  const input=$("#gsInput"); if(!input) return false;
  const p=gsParseScope(input.value);
  if(!p.tokens.length) return false;
  p.tokens.forEach(t=>{ if(!_gsToks.some(x=>x.id===t.id)) _gsToks.push(t); });
  input.value=p.q;
  return true;
}
function gsToksRender(){
  const box=_gsEl&&_gsEl.querySelector("#gscToks"), input=$("#gsInput");
  if(!box) return;
  box.innerHTML=_gsToks.map((t,i)=>`<button class="gsc-tok" type="button" data-gsc-drop="${i}"
    title="Remove this filter (backspace)" aria-label="Remove the ${esc(gsTokLabel(t))} filter"><span class="gsc-tl">${esc(gsTokLabel(t))}</span><span class="gsc-tx" aria-hidden="true">×</span></button>`).join("");
  box.hidden=!_gsToks.length;
  if(input) input.placeholder=_gsToks.length ? "Search within "+gsAndList(_gsToks.map(gsTokLabel))+"…" : GS_PH;
}
function gsToksSet(list,keepCycle){
  _gsToks=list; if(!keepCycle) _gsCycle=null;
  gsToksRender(); _gsLastQ=null; gsRun();
  const input=$("#gsInput");
  if(input){ input.focus(); const n=input.value.length; try{ input.setSelectionRange(n,n); }catch(err){} }
}
function gsTokAdd(id,keepCycle){
  const sc=gsScopes().by[id]; if(!sc) return;
  const input=$("#gsInput");
  if(input && gsScopeSuggest(input.value).some(s=>s.id===sc.id)) input.value="";   // the partial word became the token
  gsToksSet(_gsToks.some(x=>x.id===sc.id)?_gsToks:_gsToks.concat([sc]), keepCycle);
}
function gsTokDrop(i){ gsToksSet(_gsToks.filter((t,n)=>n!==i)); }
/* Tab completes the scope the residual text is starting to spell. It is only
   taken when the whole residual text is that partial word - which is exactly
   when the strip below the field is offering it - so Tab keeps trapping focus
   at every other moment. A second Tab swaps the token for the next candidate
   rather than adding one, which is how an ambiguous prefix gets resolved. */
function gsTabComplete(){
  const input=$("#gsInput"); if(!input || document.activeElement!==input) return false;
  const cands=gsScopeSuggest(input.value);
  if(cands.length){
    _gsCycle={list:cands, i:0, id:cands[0].id};
    gsTokAdd(cands[0].id,true);
    return true;
  }
  const c=_gsCycle;
  if(c && c.list.length>1 && !input.value && _gsToks.length && _gsToks[_gsToks.length-1].id===c.id){
    c.i=(c.i+1)%c.list.length; c.id=c.list[c.i].id;
    const sc=gsScopes().by[c.list[c.i].alias];
    gsToksSet(_gsToks.slice(0,-1).concat([sc]),true);
    return true;
  }
  return false;
}
/* Backspace with the caret at the very start, nothing selected, takes the whole
   token off in one press. Anywhere else it is an ordinary backspace. */
function gsTokBackspace(){
  const input=$("#gsInput");
  if(!input || document.activeElement!==input || !_gsToks.length) return false;
  if(input.selectionStart!==0 || input.selectionEnd!==0) return false;
  gsTokDrop(_gsToks.length-1);
  return true;
}
/* the strip under the field: what the query is restricted to, or the scopes the
   half-typed word could still become */
function gsScopeStrip(tail){
  const bar=_gsEl&&_gsEl.querySelector("#gscBar"); if(!bar) return;
  const sug=gsScopeSuggest(tail);
  let h="";
  if(sug.length){
    h=`<span class="gsc-lab">Narrow to</span>`
      +sug.map(s=>`<button class="gsc-sug" type="button" data-gsc-add="${esc(s.id)}">${esc(s.alias)}:</button>`).join("")
      +`<span class="gsc-tab"><kbd>tab</kbd></span>`;
  }else if(_gsToks.length){
    h=`<span class="gsc-note">Searching ${esc(gsAndList(_gsToks.map(gsTokLabel)))} only - backspace or × to clear.</span>`;
  }
  bar.innerHTML=h; bar.hidden=!h;
}
function gsBuildOverlay(){
  if(_gsEl) return _gsEl;
  const o=el("div","gs");
  o.innerHTML=`<div class="gs-scrim" data-gs-close></div>
    <div class="gs-panel" role="dialog" aria-modal="true" aria-label="Search the corpus">
      <div class="gs-in">
        <span class="gs-mag">${ic('search')}</span>
        <span class="gsc-toks" id="gscToks" hidden></span>
        <input id="gsInput" class="gs-input" type="text" autocomplete="off" autocorrect="off" spellcheck="false"
          aria-label="Search the corpus" role="combobox" aria-expanded="true" aria-controls="gsList" aria-autocomplete="list"
          placeholder="Search a section, a word, a requirement, a judgment…">
        <button class="gs-x" type="button" data-gs-close aria-label="Close search">Esc</button>
      </div>
      <div class="gsc-bar" id="gscBar" hidden></div>
      <div class="gs-list" id="gsList" role="listbox" aria-label="Search results"></div>
      <div class="gs-foot">
        <span class="gs-keys"><kbd>↑</kbd><kbd>↓</kbd> move &nbsp; <kbd>↵</kbd> open &nbsp; <kbd>esc</kbd> close</span>
        <span class="gs-tally" aria-live="polite"></span>
      </div>
    </div>`;
  document.body.appendChild(o);
  _gsEl=o;
  const list=o.querySelector("#gsList"), input=o.querySelector("#gsInput");
  o.addEventListener("click",e=>{
    const drop=e.target.closest("[data-gsc-drop]");
    if(drop){ gsTokDrop(+drop.dataset.gscDrop); return; }
    const add=e.target.closest("[data-gsc-add]");
    if(add){ gsTokAdd(add.dataset.gscAdd); return; }
    const set=e.target.closest("[data-gsc-set]");
    if(set){ const inp=$("#gsInput"); inp.value=set.dataset.gscSet; gsAbsorb(); gsToksSet(_gsToks); return; }
    if(e.target.closest("[data-gs-close]")){ gsClose(); return; }
    const row=e.target.closest(".gs-row");
    if(row){ gsSetActive(+row.dataset.i); gsOpenActive(); }
  });
  list.addEventListener("mousemove",e=>{
    const row=e.target.closest(".gs-row"); if(!row) return;
    const i=+row.dataset.i; if(i!==_gsActive) gsSetActive(i,true);
  });
  input.addEventListener("input",()=>{
    _gsCycle=null;
    if(gsAbsorb()) gsToksRender();   // "kerala:" becomes a token the moment it is typed
    clearTimeout(_gsTimer);
    _gsTimer=setTimeout(gsRun, input.value.trim()?90:0);   // debounce typing; clearing is instant
  });
  return o;
}
function gsRun(){
  const input=$("#gsInput"), list=$("#gsList"), tally=_gsEl.querySelector(".gs-tally");
  if(gsAbsorb()) gsToksRender();
  const q=gsScopePrefix()+input.value;      // the tokens are part of the query
  if(q===_gsLastQ) return; _gsLastQ=q;
  const t0=performance.now();
  const res=gsSearch(q);
  _gsRows=[];
  gsScopeStrip(res?res.q:input.value);
  if(!res){
    list.innerHTML=gsIdle(); tally.textContent="";
    input.removeAttribute("aria-activedescendant"); _gsActive=-1;
    window.__gsPerf=Object.assign(window.__gsPerf||{},{lastQuery:"",queryMs:+(performance.now()-t0).toFixed(2)});
    return;
  }
  if(!res.total){
    const inWhat=_gsToks.length?" in "+esc(gsAndList(_gsToks.map(gsTokLabel))):"";
    list.innerHTML=`<div class="gs-none">${res.q?`Nothing${inWhat} matches “${esc(res.q)}”.`:`Nothing${inWhat} to show.`}
      ${_gsToks.length?`<div class="gsc-alt"><button class="gsc-sug" type="button" data-gsc-drop="${_gsToks.length-1}">Drop the ${esc(gsTokLabel(_gsToks[_gsToks.length-1]))} filter</button></div>`:""}</div>`;
    tally.textContent="no matches";
    input.removeAttribute("aria-activedescendant"); _gsActive=-1;
    window.__gsPerf=Object.assign(window.__gsPerf||{},{lastQuery:res.q,hits:0,queryMs:+(performance.now()-t0).toFixed(2)});
    return;
  }
  let html="", i=0;
  res.groups.forEach(g=>{
    const shown=g.rows.slice(0,GS_CAP);
    html+=`<div class="gs-grp" role="group" aria-label="${esc(g.label)}">
      <div class="gs-grp-h"><span class="gs-grp-l">${esc(g.label)}</span><span class="gs-grp-n">${g.total}</span></div>`;
    shown.forEach(h=>{
      const e=h.e; _gsRows.push(e);
      const badge=e.state?`<span class="gs-st">${esc((stateById(e.state)||{}).name||e.state)}</span>`:"";
      html+=`<div class="gs-row" role="option" id="gsR${i}" data-i="${i}" aria-selected="false">
        <div class="gs-r-t">${gsHi(e.title,res.q)}</div>
        <div class="gs-r-m">${gsHi(e.sub,res.q)}${badge}</div>
        ${e.snip?`<div class="gs-r-s">${gsSnippet(e.snip,res.q)}</div>`:""}
      </div>`;
      i++;
    });
    if(g.total>shown.length) html+=`<div class="gs-more">${g.total-shown.length} more - keep typing to narrow</div>`;
    html+=`</div>`;
  });
  list.innerHTML=html; list.scrollTop=0;
  tally.textContent=res.total+" result"+(res.total>1?"s":"")+" in "+res.groups.length+" group"+(res.groups.length>1?"s":"");
  gsSetActive(0);
  window.__gsPerf=Object.assign(window.__gsPerf||{},{lastQuery:res.q,hits:res.total,queryMs:+(performance.now()-t0).toFixed(2)});
}
function gsSetActive(i,quiet){
  const list=$("#gsList"), input=$("#gsInput"); if(!list) return;
  const rows=list.querySelectorAll(".gs-row"); if(!rows.length){ _gsActive=-1; return; }
  if(i<0) i=rows.length-1; if(i>=rows.length) i=0;
  rows.forEach(r=>{ r.classList.remove("on"); r.setAttribute("aria-selected","false"); });
  const r=rows[i]; r.classList.add("on"); r.setAttribute("aria-selected","true");
  input.setAttribute("aria-activedescendant", r.id);
  _gsActive=i;
  if(!quiet) r.scrollIntoView({block:"nearest"});
}
function gsMove(d){ if(_gsRows.length) gsSetActive(_gsActive+d); }
function gsOpenActive(){
  const e=_gsRows[_gsActive]; if(!e||!e.open) return;
  gsClose();
  try{ e.open(); }catch(err){}
}
/* focus trap - only the input and the close button are focusable inside the panel */
function gsTrapTab(ev){
  const f=[..._gsEl.querySelectorAll("input, button")].filter(x=>!x.disabled && x.offsetParent!==null);
  if(!f.length) return;
  const i=f.indexOf(document.activeElement);
  const n=ev.shiftKey ? (i<=0?f.length-1:i-1) : (i<0||i>=f.length-1?0:i+1);
  f[n].focus();
}
function gsShow(){
  gsBuildOverlay();
  _gsOpener=(document.activeElement && document.activeElement!==document.body) ? document.activeElement : $("#gsTrigger");
  setDrawer(false);
  _gsEl.classList.add("show");
  document.body.style.overflow="hidden";
  const input=$("#gsInput");
  input.value=""; _gsLastQ=null; _gsActive=-1; _gsRows=[];
  _gsToks=[]; _gsCycle=null; gsToksRender();
  gsIndex();          // warm the index while the panel is appearing
  gsRun();
  input.focus();
}
function gsClose(){
  if(!gsOpen()) return;
  _gsEl.classList.remove("show");
  clearTimeout(_gsTimer);
  // a full-Act modal may be open underneath - leave its scroll lock alone
  document.body.style.overflow = ($("#modal")&&$("#modal").classList.contains("show")) ? "hidden" : "";
  const o=_gsOpener; _gsOpener=null;
  if(o && document.contains(o)) { try{ o.focus(); }catch(e){} }
}
function gsToggle(){ gsOpen()?gsClose():gsShow(); }
window.gsShow=gsShow;

/* the visible affordance: an icon button in the sidebar brand row. It sits inside
   #brand, which itself navigates, so its click must not bubble. */
function gsMountTrigger(){
  const b=$("#gsTrigger"); if(!b || b.dataset.ready) return;
  b.dataset.ready="1";
  /* the shortcut is spelled out on the button itself. The brand row is 24px tall and
     stays 24px tall: the hint grows the button sideways into space the row already
     had, never downwards. The glyphs are decoration for a screen reader - the label
     says the same thing in words. */
  /* The ⌘ character renders thin and undersized next to the K at this size, so on a
     Mac the glyph comes from the icon set and is drawn on the same stroke grid as the
     magnifier beside it. Elsewhere "Ctrl" is a word and stays one. */
  b.innerHTML=ic('search')+'<span class="gs-kbd" aria-hidden="true">'
    +(gsIsMac() ? ic('command')+'<span class="gs-kbd-k">K</span>' : gsHintKeys())+'</span>';
  b.title="Search the corpus ("+gsHintKeys()+")";
  b.setAttribute("aria-label","Search the corpus, "+gsHintSaid());
  b.onclick=e=>{ e.stopPropagation(); e.preventDefault(); gsToggle(); };
}

/* keyboard, in the capture phase: while the overlay is open it consumes Escape
   before the document-level handler that closes the provision modal, so closing
   search never closes a modal underneath. With search closed nothing is consumed
   and the existing behaviour is exactly as it was. */
const GS_FIELD=/^(INPUT|TEXTAREA|SELECT)$/;
document.addEventListener("keydown",e=>{
  if(gsOpen()){
    if(e.key==="Escape"){ e.preventDefault(); e.stopPropagation(); gsClose(); return; }
    if(e.key==="ArrowDown"){ e.preventDefault(); e.stopPropagation(); gsMove(1); return; }
    if(e.key==="ArrowUp"){ e.preventDefault(); e.stopPropagation(); gsMove(-1); return; }
    if(e.key==="Enter"){ e.preventDefault(); e.stopPropagation(); gsOpenActive(); return; }
    /* a whole scope token comes off in one press, and only from the very start
       of an unselected field, so an ordinary backspace mid-word is untouched */
    if(e.key==="Backspace" && !e.metaKey && !e.ctrlKey && !e.altKey && gsTokBackspace()){
      e.preventDefault(); e.stopPropagation(); return; }
    if(e.key==="Tab"){
      /* completion first, but only when one is genuinely on offer; otherwise Tab
         keeps trapping focus inside the panel exactly as before */
      if(!e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey && gsTabComplete()){
        e.preventDefault(); e.stopPropagation(); return; }
      e.preventDefault(); e.stopPropagation(); gsTrapTab(e); return;
    }
    return;
  }
  if((e.metaKey||e.ctrlKey) && !e.altKey && (e.key==="k"||e.key==="K")){ e.preventDefault(); e.stopPropagation(); gsShow(); return; }
  if(e.key==="/" && !e.metaKey && !e.ctrlKey && !e.altKey){
    const t=e.target;
    if(t && (GS_FIELD.test(t.tagName)||t.isContentEditable)) return;
    e.preventDefault(); gsShow();
  }
}, true);

/* boot: load the profile, then render */
function showLoadError(err){
  const served = location.protocol!=="file:";
  $("#main").innerHTML=`<div class="loadbox">
    <h2>${served?"Couldn't load the corpus":"Open this over a local server"}</h2>
    <p>This viewer reads the profile and the Akoma&nbsp;Ntoso Act files <b>live from disk</b> - nothing is baked in. Browsers block that when a page is opened straight from a file, so it needs to be served over http.</p>
    <div class="cmd"># from the dristi-domain-model folder:<br>python3 -m http.server 8000<br><br># then open:<br>http://localhost:8000/</div>
    <p class="tiny">Looked for <code>${esc(PROFILE_NAME)}</code> under: ${BASE_CANDIDATES.map(b=>`<code>${esc(b||'./')}</code>`).join(" ")}${served?`<br>Last error: ${esc(String(err&&err.message||err))}`:""}</p>
  </div>`;
}
(async()=>{
  $("#main").innerHTML=`<div class="loadbox"><div class="spinner"></div><p>Loading the domain model from the corpus…</p></div>`;
  try{
    await loadConfig();
    await loadProfile();
    // every state layer and the whole normative layer, in parallel - state is a filter, not a switch
    await Promise.all([loadAllStates(), loadRequirements(), loadStandards(),
                       loadPolicy(), loadAiPolicy()]);
    buildNav();
    // the Map ("graph") is hidden for now; keep V.graph defined but never land on it.
    // Restore where the user last was: an explicit URL hash (a shared deep link) wins;
    // otherwise fall back to the saved position; otherwise the default law view.
    let saved=""; try{ saved=localStorage.getItem("dristi:pos")||""; }catch(e){}
    const raw=(location.hash||"").slice(1) || saved || "law";
    const startView=(raw.split("?")[0])||"law";
    applyHash((V[startView] && startView!=="graph") ? raw : "law", false);
  }catch(err){ showLoadError(err); }
})();
