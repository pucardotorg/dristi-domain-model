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
let PROFILE=null, SOURCES={}, DOMAINS={}, PROVISIONS=[], TERMS={}, EDGES=[], ALIAS_MAP=[];
let CASES=[], CASE_TOPICS={}, CASES_BY_REF={};   // Supreme Court case law + reverse index (provRef -> [caseId])
const caseById2 = id => CASES.find(c=>c.id===id);
const docCache = {};   // actId -> parsed XML Document

/* ============================================================ HELPERS */
const $=(s,el=document)=>el.querySelector(s);
const el=(t,c,h)=>{const e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e;};
const esc=s=>(s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const secNum=ref=>ref.split(":")[1].replace("sec_","§").replace(/_/g," ");
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
/* per-state layer (state amendments / rules / notifications); null if the state
   has no manifest yet. Fetched from data/state/<id>.json. */
let STATE_DATA=null;
async function loadStateData(){
  STATE_DATA=null;
  try{ STATE_DATA=JSON.parse(await fetchText((DATA_BASE||"")+"state/"+activeState+".json")); }
  catch(e){ /* state layer optional / not modelled */ }
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
        const label=[n?cleanText(n):"", h?cleanText(h):""].filter(Boolean).join(" ");
        if(label) blocks.push({t:"chap", label});
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
    <p class="lede">DRISTI is one platform that hosts <strong>many kinds of case</strong>, each modelled as its own domain - but all sitting over the <strong>same shared legal core</strong> and the <strong>same state layer</strong>. Pick a case type to explore its model. The cross-cutting views at the bottom of the sidebar apply to every case type.</p>
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
    <p class="lede">Everything here sits under one case type: <strong>${c.act}</strong>. It's the shared understanding this case is built on - the Acts, the vocabulary, the rules of procedure and evidence, read from the corpus. Read every provision with three lenses at once.</p>
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
    <p class="lede">Every Act this case draws on, and the sections inside it. Open an Act for its provisions; open a provision for the verbatim text. All central law, shared by every state.</p>
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
  const stTerms=((STATE_DATA||{}).vocabulary||{}).terms||[];
  const groupOrder=[]; natRaw.forEach(([w,v])=>{ const g=v.group||"Other"; if(!groupOrder.includes(g)) groupOrder.push(g); });
  const stGroupOrder=[]; stTerms.forEach(t=>{ const g=t.group||"Other"; if(!stGroupOrder.includes(g)) stGroupOrder.push(g); });
  // uniform items across the two scopes, for counting and filtering
  const items=[];
  natRaw.forEach(([w,v])=> items.push({kind:"national", w, v, pos:v.pos||"", role:v.role||"", group:v.group||"Other", hay:(w+" "+(v.gloss||"")+" "+(v.aka||[]).join(" ")+" "+(v.pos||"")+" "+(v.role||"")).toLowerCase()}));
  stTerms.forEach(t=> items.push({kind:"state", t, pos:t.pos||"", role:t.role||"", group:t.group||"Other", hay:((t.word||"")+" "+(t.gloss||"")+" "+(t.aka||[]).join(" ")+" "+(t.source||"")+" "+(t.pos||"")+" "+(t.role||"")).toLowerCase()}));

  const head=el("div");
  head.innerHTML=`<h1 class="page-title">Vocabulary</h1>
    <p class="lede">The words a ${caseById(activeCase).name.toLowerCase()} case is built on - the <strong>shared national vocabulary</strong> and the <strong>${esc(stName)} words</strong> the state layer adds. Filter by <strong>where a word comes from</strong>, its <strong>part of speech</strong>, or its <strong>role</strong> in the case. Tap any word to read the source text.</p>`;
  m.appendChild(head);
  const controls=el("div","controls");
  controls.innerHTML=`<div class="search"><span class="mag">${ic('search')}</span><input id="w-search" placeholder="Search a word - cheque, drawer, summons, Chief Ministerial Officer…"></div>`;
  m.appendChild(controls);
  const facets=el("div","vfacets"); m.appendChild(facets);
  const list=el("div"); list.id="w-list"; list.style.marginTop="10px"; m.appendChild(list);

  const state={q:"", scope:"all", pos:"", role:""};

  function akaRow(aka){
    if(!aka||!aka.length) return "";
    return `<div class="waka"><span class="waka-lbl">also called</span>${aka.map(a=>`<span class="waka-t">${esc(a)}</span>`).join("")}</div>`;
  }
  function wcard(it){
    const clsTags=`${it.pos?`<span class="wtag wtag-pos">${esc(POS_LABEL[it.pos]||it.pos)}</span>`:""}${it.role?`<span class="wtag wtag-role">${esc(ROLE_LABEL[it.role]||it.role)}</span>`:""}`;
    if(it.kind==="national"){
      const w=it.w, v=it.v, p=PROVISIONS.find(x=>x.ref===v.ref), s=actOf(v.ref);
      const def=v.gloss || (p&&p.note) || "The canonical meaning the system uses for this term - fixed by the section below.";
      const c=el("div","word"); c.dataset.word=w.toLowerCase();
      c.innerHTML=`
        <div class="wt"><span class="wname">${esc(w[0].toUpperCase()+w.slice(1))}</span><span class="wtag wtag-national">national</span>${clsTags}<span class="caret">${ic('chevron-right')}</span></div>
        <div class="def">${esc(def)}</div>
        ${akaRow(v.aka)}
        <div class="src">from <code>${esc(secNum(v.ref))}</code> · ${esc(s?s.title.split(",")[0]:v.ref)}</div>
        <div class="wfull"><div class="statute-slot" data-ref="${esc(v.ref)}"></div></div>`;
      c.querySelector(".wt").onclick=()=>{ c.classList.toggle("open"); if(c.classList.contains("open")) fillStatute(c.querySelector(".statute-slot"),true); };
      return c;
    }
    const t=it.t, c=el("div","word"); c.dataset.word=(t.word||"").toLowerCase();
    c.innerHTML=`
      <div class="wt"><span class="wname">${esc(t.word)}</span><span class="wtag wtag-state">${esc(stName)}</span>${clsTags}<span class="caret">${ic('chevron-right')}</span></div>
      <div class="def">${esc(t.gloss||'')}</div>
      ${akaRow(t.aka)}
      <div class="src">from ${esc(t.source||'the state layer')}</div>
      <div class="wfull"><div class="ksec-slot"></div></div>`;
    c.querySelector(".wt").onclick=()=>{ c.classList.toggle("open"); if(c.classList.contains("open") && t.akn && t.eId) fillStateStatute(c.querySelector(".ksec-slot"), t.akn, t.eId, t.source||'the Kerala instrument', ''); };
    return c;
  }
  function pill(fg,fv,label,count,active){
    return `<span class="chip ${active?'on':''}" data-fg="${fg}" data-fv="${esc(fv)}">${esc(label)}${count!=null?` <span class="c">${count}</span>`:""}</span>`;
  }
  function redraw(){
    const bySearch=items.filter(it=> !state.q || it.hay.includes(state.q));
    const base=bySearch.filter(it=> state.scope==="all" || state.scope===it.kind);
    // cross-filtered facet counts: pos counts respect the active role, and vice versa
    const posCounts={}, roleCounts={};
    base.filter(it=> !state.role || it.role===state.role).forEach(it=>{ if(it.pos) posCounts[it.pos]=(posCounts[it.pos]||0)+1; });
    base.filter(it=> !state.pos || it.pos===state.pos).forEach(it=>{ if(it.role) roleCounts[it.role]=(roleCounts[it.role]||0)+1; });
    const scNat=bySearch.filter(i=>i.kind==="national").length, scSt=bySearch.filter(i=>i.kind==="state").length;

    let fh=`<div class="vfacet-row"><span class="vfacet-lbl">Show</span><div class="chips">`
      +pill("scope","all","All",bySearch.length,state.scope==="all")
      +pill("scope","national","National",scNat,state.scope==="national")
      +(scSt?pill("scope","state",stName,scSt,state.scope==="state"):"")
      +`</div></div>`;
    const posVals=POS_ORDER.filter(p=>posCounts[p]);
    if(posVals.length) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">Type</span><div class="chips">`+posVals.map(p=>pill("pos",p,POS_LABEL[p]||p,posCounts[p],state.pos===p)).join("")+`</div></div>`;
    const roleVals=ROLE_ORDER.filter(r=>roleCounts[r]);
    if(roleVals.length) fh+=`<div class="vfacet-row"><span class="vfacet-lbl">Role</span><div class="chips">`+roleVals.map(r=>pill("role",r,ROLE_LABEL[r]||r,roleCounts[r],state.role===r)).join("")+`</div></div>`;
    facets.innerHTML=fh;

    const final=base.filter(it=> (!state.pos||it.pos===state.pos) && (!state.role||it.role===state.role));
    list.innerHTML="";
    const natFinal=final.filter(i=>i.kind==="national"), stFinal=final.filter(i=>i.kind==="state");
    if(natFinal.length){
      list.appendChild(el("div","grouphead",`National vocabulary <span class="gh-status">national · ${natFinal.length}</span>`));
      groupOrder.forEach(g=>{ const rows=natFinal.filter(it=>it.group===g).sort((a,b)=>a.w.localeCompare(b.w)); if(!rows.length) return; list.appendChild(el("div","vsub",esc(g))); rows.forEach(it=> list.appendChild(wcard(it))); });
    }
    if(stFinal.length){
      list.appendChild(el("div","grouphead",`${esc(stName)} vocabulary <span class="gh-status">state layer · ${stFinal.length}</span>`));
      stGroupOrder.forEach(g=>{ const rows=stFinal.filter(it=>it.group===g); if(!rows.length) return; list.appendChild(el("div","vsub",esc(g))); rows.forEach(it=> list.appendChild(wcard(it))); });
    }
    if(!final.length) list.appendChild(el("div","empty","No word matches these filters."));
  }
  facets.addEventListener("click",e=>{
    const p=e.target.closest(".chip"); if(!p) return;
    const fg=p.dataset.fg, fv=p.dataset.fv;
    if(fg==="scope") state.scope=fv;
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
      state.q=""; state.scope="all"; state.pos=""; state.role=""; redraw();
      const card=[...m.querySelectorAll(".word")].find(c=>c.dataset.word===wanted.toLowerCase());
      if(card){
        const y=card.getBoundingClientRect().top+window.scrollY-16;
        window.scrollTo({top:Math.max(0,y), behavior:"smooth"});
        const wt=card.querySelector(".wt"); if(wt && !card.classList.contains("open")) wt.click();
        card.classList.add("word-flash"); setTimeout(()=>card.classList.remove("word-flash"),1500);
      }
    },70);
  }
  return m;
};

V.practice=()=>{
  if(!isModelled()) return notModelled();
  const stName=stateById(activeState).name;
  const m=el("div"); m.appendChild(scopeBar());
  const head=el("div");
  head.innerHTML=`<h1 class="page-title">Local practice</h1>
    <p class="lede">The part of the domain <strong>no Act writes down</strong> - how a ${caseById(activeCase).name.toLowerCase()} case is actually filed, moved and disposed on the ground. These are snippets from conversations with people who run the process; each one names an <strong>informal or local practice</strong> that the shared central law leaves unsaid. It changes by state; the statute does not.</p>
    <div class="pnote-flag">Illustrative - the kind of field note this section will hold. Not a verified transcript.</div>`;
  m.appendChild(head);
  const here=PRACTICE_NOTES.filter(n=>n.place===activeState);
  const rest=PRACTICE_NOTES.filter(n=>n.place!==activeState);
  const render=list=>{
    const wrap=el("div","pnotes");
    list.forEach(n=>{
      const c=el("div","pnote");
      c.innerHTML=`<div class="pn-q">${ic('messages-square')}<span>${esc(n.quote)}</span></div>
        <div class="pn-who">${esc(n.who)} · ${esc(stateById(n.place).name)}</div>
        <div class="pn-est"><span class="pn-lbl">Establishes</span> ${esc(n.establishes)}</div>`;
      wrap.appendChild(c);
    });
    return wrap;
  };
  if(here.length){ m.appendChild(el("h2","sec",`In ${esc(stName)}`)); m.appendChild(render(here)); }
  if(rest.length){ m.appendChild(el("h2","sec",here.length?"Elsewhere":"Notes")); m.appendChild(render(rest)); }
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
   disposal), fees, courts, and a caseload placeholder - each step citing the
   rule/Act that governs it (click a citation to open the verbatim text). */
function stateAliasMap(){
  const map={}; const D=STATE_DATA||{};
  ["amendments","rules","notifications"].forEach(cat=>{
    ((D[cat]||{}).items||[]).forEach(it=>{ if(it.alias) map[it.alias]={akn:it.akn,title:it.title}; });
  });
  return map;
}
function citeChip(c, amap){
  const lbl=esc(c.l||c.n||"");
  if(c.n && SOURCES[(c.n.split(":")[0])]) return `<a class="cite" data-nat="${esc(c.n)}">${lbl}</a>`;
  if(c.s){ const m=amap[c.s]; if(m && m.akn) return `<a class="cite" data-akn="${esc(m.akn)}" data-eid="${esc(c.e||'')}" data-title="${esc(m.title||'')}">${lbl}</a>`; }
  return `<span class="cite cite-plain">${lbl}</span>`;
}
function citeRow(list, amap){
  if(!list || !list.length) return `<span class="cite cite-none">Kerala adds nothing here - uniform central law</span>`;
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
V.story=()=>{
  if(!isModelled()) return notModelled();
  const stName=stateById(activeState).name;
  const S=(STATE_DATA||{}).story;
  const m=el("div"); m.appendChild(scopeBar());
  const head=el("div");
  head.innerHTML=`<h1 class="page-title state-title">How a §138 case runs ${stateInlineSelectHTML()}</h1><p class="lede">${S?esc(S.summary):`The ${esc(stName)} story isn't modelled yet.`}</p>`;
  m.appendChild(head);
  const sel=m.querySelector(".state-inline"); if(sel) sel.onchange=e=>{ activeState=e.target.value; loadStateData().then(()=>{ buildNav(); go(currentView); }); };
  if(!S){ m.appendChild(el("div","empty",`<b>${esc(stName)} - story not modelled yet.</b><br><span class="tiny">The process, fees, courts and caseload for this state are planned - the same shape as ${esc(stName)==='Kerala'?'this':'Kerala'}.</span>`)); return m; }
  const amap=stateAliasMap();
  const secH=(id,t,sub)=>{ const d=el("div","story-sec-h",`<span>${esc(t)}</span>${sub?`<span class="ssh-sub">${esc(sub)}</span>`:''}`); d.id="story-"+id; return d; };

  // 1 - PROCESS (a timeline, viewed through one of three lenses via tabs)
  if(S.process){
    m.appendChild(secH("process","The process - filing to disposal", S.process.summary));
    // lens tabs
    const LENSES=[["prescribed","Prescribed","under the rules"],["regular","Regular court","typical timeline"],["oncourt","ON Court","24×7 special court"]];
    const tabs=el("div","proc-tabs");
    tabs.innerHTML=LENSES.map(([id,label,sub])=>`<button class="proc-tab tab-${id} ${processLens===id?'on':''}" data-lens="${id}"><span class="pt-main">${esc(label)}</span><span class="pt-sub">${esc(sub)}</span></button>`).join("");
    const procSec=el("div","proc-section");
    procSec.appendChild(el("div","proc-sentinel"));   // marks where the tabs start, for stuck-detection
    procSec.appendChild(tabs);
    const tl=el("div","timeline lens-"+processLens);
    (S.process.stages||[]).forEach((st,i)=>{
      const raw=String(st.stage||"");
      const num=(raw.split("·")[0].trim().split(".")[0].trim())||String(i+1);
      const title=raw.replace(/^\s*\d+\s*[·.\-]\s*/,"");
      const item=el("div","tl-item");
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
    if(S.process.timing_note) procSec.appendChild(el("div","story-note story-note-loose",esc(S.process.timing_note)));
    m.appendChild(procSec);
    tabs.querySelectorAll(".proc-tab").forEach(b=>b.onclick=()=>{
      processLens=b.dataset.lens;
      tabs.querySelectorAll(".proc-tab").forEach(x=>x.classList.toggle("on", x.dataset.lens===processLens));
      tl.className="timeline lens-"+processLens;
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
  // 2 - ROLES (who does what, and where each role is drawn from)
  if(S.roles){
    m.appendChild(secH("roles","The roles", S.roles.summary));
    const rb=el("div","role-block");
    (S.roles.items||[]).forEach(r=>{
      const src = (r.cite && r.cite.length) ? citeRow(r.cite,amap)
                : (r.basis?`<span class="role-basis">${esc(r.basis)}</span>`:"");
      const cat=ROLE_CATS[r.cat]||ROLE_CATS.litigant;
      const card=el("div","role-card role-"+(r.cat||"litigant"));
      card.innerHTML=`<div class="role-top"><span class="role-ico">${ic(cat.icon)}</span>
        <div class="role-id"><div class="role-name">${esc(r.role)}</div><div class="role-cat">${esc(cat.label)}</div></div></div>
        <div class="role-who">${esc(r.who)}</div>
        ${src?`<div class="role-src"><span class="role-src-l">From</span> ${src}</div>`:""}`;
      rb.appendChild(card);
    });
    m.appendChild(rb);
  }
  // 3 - FEES
  if(S.fees){
    m.appendChild(secH("fees","The fees", S.fees.summary));
    const fb=el("div","fee-block");
    if(S.fees.cite) fb.appendChild(el("div","fee-cite",`Source: ${citeChip(S.fees.cite,amap)}`));
    (S.fees.items||[]).forEach(it=>{
      fb.appendChild(el("div","fee-row",`<span class="fee-stage">${esc(it.stage)}</span><span class="fee-amt">${esc(it.fee)}</span>`));
    });
    if(S.fees.note) fb.appendChild(el("div","story-note",esc(S.fees.note)));
    m.appendChild(fb);
  }
  // 4 - COURTS
  if(S.courts){
    m.appendChild(secH("courts","The courts", S.courts.summary));
    const cb=el("div","court-block");
    (S.courts.designated||[]).forEach(ct=>{
      const card=el("div","court-card");
      card.innerHTML=`<div class="court-name">${esc(ct.name)}</div>
        <div class="court-loc">${ic('map-pin')} ${esc(ct.location||'')}</div>
        ${ct.basis?`<div class="court-basis">${esc(ct.basis)}</div>`:''}
        ${ct.cite?`<div class="court-cite">${citeChip(ct.cite,amap)}</div>`:''}`;
      cb.appendChild(card);
    });
    m.appendChild(cb);
  }
  // 5 - CASELOAD (placeholder)
  if(S.caseload){
    m.appendChild(secH("caseload","Caseload - by court", S.caseload.summary));
    const cols=S.caseload.columns||["Court","Location","Pending","Disposed"];
    let html=`<table class="caseload"><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>`;
    (S.caseload.rows||[]).forEach(r=>{
      html+=`<tr><td>${esc(r.court||'')}</td><td>${esc(r.location||'')}</td><td class="ph">${r.pending==null?'-':esc(String(r.pending))}</td><td class="ph">${r.disposed==null?'-':esc(String(r.disposed))}</td></tr>`;
    });
    html+=`</tbody></table>`;
    const cw=el("div","caseload-wrap"); cw.innerHTML=html; m.appendChild(cw);
    if(S.caseload.note) m.appendChild(el("div","story-note",`${esc(S.caseload.note)}`));
  }
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
const VOCAB_SKIP_CLASS=/(^|\s)(cite|cchip|stedge|vocab-term|statute|st-num|st-h|st-src|badge|wtag|chip|tl-marker|proc-tab|caret|mag|role-name|court-name|tl-stage-title|fee-stage|clabel|page-title|grouphead|vsub|vp-word|vp-gloss)($|\s)/;
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
  vocabScrollTo=word;
  go("words");
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
    <p class="lede"><span class="badge b-crosscase" style="vertical-align:middle">across every case type</span> &nbsp;Keep three things apart - the <strong>rules</strong> you must obey, the <strong>systems</strong> you plug into, and the <strong>context</strong> you adapt to - and remember they all move through <strong>time</strong>. This shape holds for any case type; only the top substantive Act swaps out.</p>`;
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
    <p class="lede"><span class="badge b-crosscase" style="vertical-align:middle">across every case type</span> &nbsp;The idea DRISTI 2.0 is organised around. The <strong>national core</strong> is central law - identical in every state. The <strong>state layer</strong> is everything a state owns, sequences and advances on its own. <strong>Build for the state, over the national core</strong> - not one all-India instance. (Examples below are drawn from the cheque-bounce case type.)</p>`;
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
    <p class="lede"><span class="badge b-crosscase" style="vertical-align:middle">across every case type</span> &nbsp;On <strong>1 July 2024</strong>, three foundational codes were replaced. They sit under every criminal case type, so this switch is platform-wide. Which set is live depends on <strong>when the cause of action arose</strong>.</p>
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
function stateKeyRow(it,k){
  const row=el("div","prov");
  row.innerHTML=`
    <div class="prov-head">
      <span class="ref">${esc(stEidNum(k.eId))}</span>
      <span class="rt">${esc(k.label||'')}</span>
      <span class="hbadges"><span class="badge b-state">Kerala layer</span> ${eraBadge(k.applies||'always')}</span>
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
function stateRuleGroup(it){
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
    it.key.forEach(k=> body.appendChild(stateKeyRow(it,k)));
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
function stateTreeView(catKey, title){ return function(){
  if(!isModelled()) return notModelled();
  const stName=stateById(activeState).name;
  const m=el("div"); m.appendChild(scopeBar());
  const data=STATE_DATA && STATE_DATA[catKey];
  const lede=(data&&data.summary) || "These sit on top of the shared national core and change from state to state, so pick the jurisdiction above.";
  const head=el("div");
  head.innerHTML=`<h1 class="page-title state-title">${esc(title)} ${stateInlineSelectHTML()}</h1><p class="lede">${lede}</p>`;
  m.appendChild(head);
  const sel=m.querySelector(".state-inline");
  if(sel) sel.onchange=e=>{ activeState=e.target.value; loadStateData().then(()=>{ buildNav(); go(currentView); }); };
  const items=(data&&data.items)||[];
  if(!items.length){ m.appendChild(el("div","empty", (data&&data.summary)?`Nothing separate to list here for ${esc(stName)} - the summary above is the whole story.`:`<b>${esc(stName)} - ${esc(title.toLowerCase())} not modelled yet.</b><br><span class="tiny">This state-layer object is planned.</span>`)); return m; }
  m.appendChild(el("div","legend",`<span>Each opens to its sections; each section opens to the verbatim text - the same shape as the national <b>Acts &amp; provisions</b>, for the ${esc(stName)} layer.</span>`));
  const list=el("div"); list.style.marginTop="14px";
  items.forEach(it=>list.appendChild(stateRuleGroup(it)));
  m.appendChild(list);
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
/* story nav badge: nothing when modelled, "soon" when this state has no story block */
function storyBadge(){ return ((STATE_DATA||{}).story) ? '' : `<span class="count soon">soon</span>`; }
/* the section headings the story page renders, in order - drives the nav accordion */
function storySections(){
  const S=(STATE_DATA||{}).story; if(!S) return [];
  return [["process","The process"],["roles","The roles"],["fees","The fees"],["courts","The courts"],["caseload","Caseload"]]
    .filter(([id])=>S[id]).map(([id,label])=>({id,label}));
}
function goStorySection(id){
  const scroll=()=>{ const t=document.getElementById("story-"+id); if(t){ const y=t.getBoundingClientRect().top+window.scrollY-16; window.scrollTo({top:Math.max(0,y), behavior:"smooth"}); t.classList.add("sec-flash"); setTimeout(()=>t.classList.remove("sec-flash"),1100); } };
  if(currentView!=="story"){ go("story"); setTimeout(scroll,110); }   // render first, then scroll
  else { const sw=$("#storyWrap"); if(sw) sw.classList.remove("ov-collapsed"); scroll(); }  // already here: just scroll
}
function buildNav(){
  const c=caseById(activeCase);
  const nav=$("#nav");
  const st=stateById(activeState);
  nav.innerHTML=`
    <div class="casedd" id="casedd">
      <button class="casedd-btn" id="caseddBtn">
        <div class="ac-eyebrow">Active case type</div>
        <div class="ac-name">${c.name} <span>· ${c.act.split('·').pop().trim()}</span></div>
        <span class="casedd-chev">${ic('chevron-down')}</span>
      </button>
      <div class="casedd-menu" id="caseddMenu">
        ${CASE_TYPES.map(ct=>{const on=ct.id===activeCase, planned=ct.status!=="active"; return `<div class="casedd-item ${on?'on':''} ${planned?'planned':''}" data-id="${ct.id}"><span>${ct.name} <span class="ci-sub">· ${ct.act.split('·').pop().trim()}</span></span>${on?'<span class="ci-check">✓ active</span>':(planned?'<span class="ci-check" style="color:var(--ink-3)">soon</span>':'')}</div>`;}).join("")}
      </div>
    </div>
    <div class="nav-group">National objects</div>
    <div class="nav-scoped">
      <a data-view="law"><span class="ico">${ic('library')}</span> Acts &amp; provisions <span class="count">${isModelled()?PROVISIONS.length:'-'}</span></a>
      <a data-view="caselaw"><span class="ico">${ic('scale')}</span> Case law <span class="count">${isModelled()?(CASES.length||'-'):'-'}</span></a>
    </div>
    <div class="nav-divider"></div>
    <div class="state-layer nav-scroll">
      <div class="statedd-wrap nav-group">${stateInlineSelectHTML()}</div>
      <div class="nav-scoped">
        <div class="scoped-wrap ov-collapsed" id="storyWrap">
          <a class="ov-toggle" data-view="story"><span class="ico">${ic('book-open')}</span> The story ${storyBadge()} <span class="nav-chev">${ic('chevron-down')}</span></a>
          <div class="nav-sub"><div class="nav-sub-inner">
            ${storySections().map(s=>`<a class="subnav" data-story-sec="${s.id}"><span class="ico">${ic('chevron-right')}</span> ${esc(s.label)}</a>`).join("")}
          </div></div>
        </div>
        <a data-view="amendments"><span class="ico">${ic('file-pen')}</span> Acts &amp; Provisions ${stateBadge('amendments')}</a>
        <a data-view="staterules"><span class="ico">${ic('clipboard')}</span> State rules ${stateBadge('rules')}</a>
        <a data-view="notifications"><span class="ico">${ic('bell')}</span> Notifications ${stateBadge('notifications')}</a>
      </div>
      <div class="nav-group scoped">Domain &amp; culture</div>
      <div class="nav-scoped">
        <a data-view="practice"><span class="ico">${ic('messages-square')}</span> Local practice <span class="count">${isModelled()?PRACTICE_NOTES.length:'-'}</span></a>
        <a data-view="words"><span class="ico">${ic('type')}</span> Vocabulary <span class="count">${isModelled()?(Object.keys(TERMS).length+(((STATE_DATA||{}).vocabulary||{}).terms||[]).length):'-'}</span></a>
      </div>
    </div>`;
  // Overview lives subtly in the sidebar footer, not at the top
  const ov=$("#ovNav");
  if(ov) ov.innerHTML=`
    <div class="ov-menu" id="ovMenu">
      <div class="ov-pop">
        <a data-view="overview" class="ov-pop-item"><span class="ico">${ic('compass')}</span> Overview</a>
        <div class="ov-pop-sep"></div>
        <a data-view="structure" class="ov-pop-item"><span class="ico">${ic('layers')}</span> The structure</a>
        <a data-view="split" class="ov-pop-item"><span class="ico">${ic('arrow-left-right')}</span> National vs State</a>
        <a data-view="time" class="ov-pop-item"><span class="ico">${ic('history')}</span> The 2024 code switch</a>
      </div>
      <button class="ov-trigger" id="ovTrigger"><span class="ico">${ic('compass')}</span> Overview <span class="nav-chev">${ic('chevron-down')}</span></button>
    </div>`;
  const tb=$("#tbCase"); if(tb) tb.textContent=`${c.name} · ${c.act.split('·').pop().trim()}`;
  document.querySelectorAll("#nav a[data-view], #ovNav a[data-view]").forEach(a=>a.onclick=()=>{
    const ovm=$("#ovMenu"); if(ovm) ovm.classList.remove("open");
    const sw=$("#storyWrap"); if(sw) sw.classList.toggle("ov-collapsed", a.dataset.view!=="story"); // open only when The story itself is clicked
    go(a.dataset.view);
    setDrawer(false);
  });
  // story accordion: the chevron toggles it in place; the section links scroll to a heading
  const schev=nav.querySelector("#storyWrap .ov-toggle .nav-chev");
  if(schev) schev.onclick=e=>{ e.stopPropagation(); e.preventDefault(); $("#storyWrap").classList.toggle("ov-collapsed"); };
  nav.querySelectorAll("#storyWrap .subnav[data-story-sec]").forEach(a=>a.onclick=e=>{ e.stopPropagation(); goStorySection(a.dataset.storySec); setDrawer(false); });
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
function go(view){
  if(view==="parts"||view==="provisions") view="law"; // Acts + Provisions merged
  if(!V[view]) view="overview";
  currentView=view;
  document.querySelectorAll("#nav a[data-view], #ovNav a[data-view]").forEach(a=>a.classList.toggle("active", a.dataset.view===view));
  setMain(V[view]());
  if(view!=="words") try{ linkifyVocab($("#main")); }catch(e){}   // turn vocabulary words in the prose into links
  if(history.replaceState) history.replaceState(null,"","#"+view);
}
window.go=go;

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
  const pv=e.target.closest(".pdf-orig");
  if(pv && pv.dataset.pdf){ if(window.openPdfModal) openPdfModal(pv.dataset.pdf, pv.dataset.pdftitle||"Original document"); else window.open(pv.dataset.pdf,"_blank"); return; }
  const sd=e.target.closest(".stdoc");
  if(sd && sd.dataset.akn){ openStateDocModal(sd.dataset.akn, sd.dataset.title, sd.dataset.sub, sd.dataset.pdf||"", sd.dataset.eid||""); return; }
  const ci=e.target.closest(".cite");
  if(ci){ e.stopPropagation();
    if(ci.dataset.nat){ const [a,eid]=ci.dataset.nat.split(":"); if(SOURCES[a]) openActModal(a,eid); }
    else if(ci.dataset.akn){ openStateCiteModal(ci.dataset.akn, ci.dataset.eid, ci.dataset.title); }
    return; }
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
    await loadStateData();
    buildNav();
    // the Map ("graph") is hidden for now; keep V.graph defined but never land on it
    const start=(location.hash||"#law").slice(1);
    go(V[start] && start!=="graph" ? start : "law");
  }catch(err){ showLoadError(err); }
})();
