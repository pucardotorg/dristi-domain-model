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
const scopeBadge=()=>`<span class="badge b-shared">shared core</span>`;
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
  b.innerHTML=`<span class="lab">Case type</span> <span class="ct">${c.name}</span> <span class="tiny">${c.act}</span>`;
  return b;
}
const isModelled=()=>caseById(activeCase).status==="active";
function notModelled(){
  const c=caseById(activeCase); const m=el("div"); m.appendChild(scopeBar());
  m.appendChild(el("div","empty",`<b>${c.name}</b> isn't modelled yet.<br><span class="tiny">This case type is planned. Its domain model will be built over the same shared core.</span><br><br><a class="backlink" onclick="go('cases')">← back to case types</a>`));
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
      <div class="lens where"><div class="k">Lens 2 · Where</div><h3>Shared core vs state</h3><p>The central law is the same everywhere in India. Each <em>state</em> layers its own rules, practice and filer reality on top.</p></div>
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
  controls.innerHTML=`<div class="search"><span class="mag">⌕</span><input id="l-search" placeholder="Search Act, section, role, note - cheque, cognizance, presumption…"></div>`;
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
      <span class="caret">›</span>
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

V.words=()=>{
  if(!isModelled()) return notModelled();
  const m=el("div"); m.appendChild(scopeBar());
  const head=el("div");
  head.innerHTML=`<h1 class="page-title">Vocabulary</h1>
    <p class="lede">The shared vocabulary a ${caseById(activeCase).name.toLowerCase()} case is built on - drawn from the <strong>laws</strong>, the <strong>rules</strong>, and the <strong>things people actually say</strong>. A word that is wrong quietly bends everything built on it. Each term is pinned to where it's defined; tap to read the definition from the Act.</p>`;
  m.appendChild(head);
  const controls=el("div","controls");
  controls.innerHTML=`<div class="search"><span class="mag">⌕</span><input id="w-search" placeholder="Search a word - cheque, drawer, holder…"></div>`;
  m.appendChild(controls);
  const list=el("div"); list.id="w-list"; m.appendChild(list);
  const entries=Object.entries(TERMS).sort((a,b)=>a[0].localeCompare(b[0]));
  function draw(q=""){
    list.innerHTML="";
    const rows=entries.filter(([w])=>w.includes(q));
    if(!rows.length){list.appendChild(el("div","empty","No word matches."));return;}
    rows.forEach(([w,ref])=>{
      const p=PROVISIONS.find(x=>x.ref===ref), s=actOf(ref);
      const c=el("div","word");
      c.innerHTML=`
        <div class="wt">${w[0].toUpperCase()+w.slice(1)} ${scopeBadge()} <span class="caret">›</span></div>
        <div class="def">${p&&p.note?p.note:"The canonical meaning the system uses for this term - fixed by the section below."}</div>
        <div class="src">defined in <code>${secNum(ref)}</code> · ${s?s.title.split(",")[0]:ref}</div>
        <div class="wfull"><div class="statute-slot" data-ref="${esc(ref)}"></div></div>`;
      c.querySelector(".wt").onclick=()=>{ c.classList.toggle("open"); if(c.classList.contains("open")) fillStatute(c.querySelector(".statute-slot"),true); };
      list.appendChild(c);
    });
  }
  setTimeout(()=>{const inp=$("#w-search"); if(inp)inp.oninput=e=>draw(e.target.value.toLowerCase().trim());},0);
  draw();
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
      m.appendChild(el("div","empty",`<b>${esc(st)} - ${esc(title.toLowerCase())} not modelled yet.</b><br><span class="tiny">This state-layer object is planned. It will carry ${esc(st)}'s own ${esc(title.toLowerCase())} over the same shared core, the way the national objects already do.</span>`));
    }
    return m;
  };
}
V.amendments   = stateObjectView("amendments","State amendments","State-level changes to the central Acts, where a legislature has amended or added to the shared statute for this case type.");
V.staterules   = stateObjectView("rules","State rules","The rules of practice and procedure a High Court or state makes for its own courts.");
V.notifications= stateObjectView("notifications","Notifications","Government orders and court notifications that shape how a case runs locally.");

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

V.caselaw=()=>{
  if(!isModelled()) return notModelled();
  const m=el("div"); m.appendChild(scopeBar());
  const head=el("div");
  head.innerHTML=`<h1 class="page-title">Case law</h1>
    <p class="lede">The leading <strong>Supreme Court</strong> authority a ${caseById(activeCase).name.toLowerCase()} case is decided on - ${CASES.length} judgments, each pinned to the <strong>provisions it construes</strong> (by <strong>Article&nbsp;141</strong>, these bind every court). Filter by what they settle. Tap a section chip to jump to that provision.</p>`;
  m.appendChild(head);
  if(!CASES.length){ m.appendChild(el("div","empty","No case-law dataset is linked from this profile.")); return m; }
  const controls=el("div","controls");
  controls.innerHTML=`<div class="search"><span class="mag">⌕</span><input id="c-search" placeholder="Search a case, holding or citation - Rangappa, jurisdiction, s.141…"></div>`;
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
  rules.appendChild(el("div","divider blue",`<span class="rule"></span> Same everywhere in India - the shared core <span class="rule"></span>`));
  [["Constitution","the foundation - what powers the courts have"],["The case-type's core Act + shared codes","e.g. NI Act §138 · procedure · evidence · limitation"],["Court judgments (Supreme & High Courts)","can change what a law means - without changing its words"]].forEach(([t,d])=>{const l=el("div","layer core");l.innerHTML=`<div class="lt">${t}</div><div class="ld">${d}</div>`;rules.appendChild(l);});
  rules.appendChild(el("div","divider green",`<span class="rule"></span> Differs by state - each state adds its own <span class="rule"></span>`));
  [["State High Court rules of practice","e-filing rules · rules of practice"],["Practice directions & circulars","a court's written instructions on how to do a thing"],["Local, unwritten practice","how one particular court actually runs, day to day"]].forEach(([t,d])=>{const l=el("div","layer state");l.innerHTML=`<div class="lt">${t}</div><div class="ld">${d}</div>`;rules.appendChild(l);});
  rules.appendChild(el("div","tiny","Top = broad authority, rarely changes. Bottom = very specific, changes most often."));
  const sys=el("div","stack");
  sys.appendChild(el("div","col-h sys","2 · THE SYSTEMS - you plug into"));
  SYSTEMS.forEach(s=>{const l=el("div","layer sysrow"+(s.you?" you":""));l.innerHTML=`<div class="lt">${s.name}${s.you?' <span class="badge b-post" style="margin-left:6px">your platform</span>':''}</div><div class="ld">${s.desc}</div>`;sys.appendChild(l);});
  const how=el("div","ctx"); how.style.marginTop="14px";
  how.innerHTML=`<div class="ct">HOW TO READ THIS</div><p>1 · Obey the <b style="color:var(--blue)">rules</b> - shared core first, then your state's layer.</p><p>2 · Plug into the <b style="color:var(--amber)">systems</b> - DRISTI hosts each state's copy over that core.</p><p>3 · Adapt to the <b style="color:var(--red)">context</b> - language, customs, culture.</p>`;
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
  m.innerHTML=`<h1 class="page-title">Shared core vs State</h1>
    <p class="lede"><span class="badge b-crosscase" style="vertical-align:middle">across every case type</span> &nbsp;The idea DRISTI 2.0 is organised around. The <strong>shared core</strong> is central law - identical in every state. The <strong>state layer</strong> is everything a state owns, sequences and advances on its own. <strong>Build for the state, over the shared core</strong> - not one all-India instance. (Examples below are drawn from the cheque-bounce case type.)</p>`;
  const split=el("div","split");
  const core=el("div","col core");
  core.innerHTML=`<div class="col-top"><h3>Shared core <span class="badge b-shared">same everywhere</span></h3><p>Central statutes & binding judgments - reused across case types. Modelled here as ${PROVISIONS.length} provisions across ${Object.keys(SOURCES).length} Acts.</p></div>`;
  [["The offence & presumptions","NI Act §§138–147 - specific to this case type."],["Criminal procedure","Cognizance, process, summary trial, compounding, appeal - CrPC → BNSS. Shared by all criminal case types."],["Evidence","Burden of proof, electronic records, bankers' books - IEA → BSA + BBEA."],["Limitation, notice, sentencing","One-month bar & condonation, deemed service, probation & compensation."],["Binding case law","Supreme Court precedent (Rangappa, Aneeta Hada, Expeditious Trial…) - modelled under Case law, binding nationally via Art. 141."]].forEach(([b,s])=>{const r=el("div","row");r.innerHTML=`<b>${b}</b><span>${s}</span>`;core.appendChild(r);});
  const st=el("div","col state");
  st.innerHTML=`<div class="col-top"><h3>State layer <span class="badge b-state">a state owns it</span></h3><p>Not in the central corpus. What a DRISTI instance configures and a court advances on its own - the same for every case type.</p></div>`;
  STATE_CATEGORIES.forEach(c=>{const r=el("div","row");r.innerHTML=`<b>${c.name}${c.ill?' <span class="tiny" style="color:var(--amber)">· operational</span>':''}</b><span>${c.desc}</span>`;st.appendChild(r);});
  split.appendChild(core); split.appendChild(st); m.appendChild(split);
  m.appendChild(el("div","callout green","<b>Same law, different shape.</b> The statute is identical, but who files and at what scale reshapes the whole workflow. That difference lives entirely in the state layer - the shared core never moves."));
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
  wrap.appendChild(el("div","actdoc-h",
    `<div class="ad-title">${esc(src.title)}</div>
     <div class="ad-sub">${nsec} ${unit} · verbatim Akoma Ntoso (${esc(src.file)})${focusEid?` · jumped to ${esc(focusLabel)}`:''}</div>
     <button class="pdf-orig" data-pdf="${esc(pdfUrl)}" data-pdftitle="${esc(src.title)}">${ic('file')} Original PDF</button>`));
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
function closeModal(){ $("#modal").classList.remove("show"); document.body.style.overflow=""; }

/* render + open an arbitrary Akoma Ntoso <act> document (used for state instruments) */
function renderStateDoc(title, subtitle, blocks, pdfUrl){
  const nsec=blocks.filter(b=>b.t==="sec").length;
  const unit=blocks.some(b=>b.unit==="article")?"articles":(blocks.some(b=>b.t==="sec"&&/^rule_/.test(b.eId||""))?"rules":"sections");
  const wrap=el("div");
  wrap.appendChild(el("div","actdoc-h",
    `<div class="ad-title">${esc(title)}</div>
     <div class="ad-sub">${nsec} ${unit}${subtitle?` · ${esc(subtitle)}`:''} · verbatim Akoma Ntoso</div>
     ${pdfUrl?`<button class="pdf-orig" data-pdf="${esc(pdfUrl)}" data-pdftitle="${esc(title)}">${ic('file')} Original PDF</button>`:''}`));
  const bodyEl=el("div","actdoc-body");
  if(!nsec) bodyEl.appendChild(el("div","callout amber",`This document's full text isn't in the corpus yet.`));
  blocks.forEach(b=>{
    if(b.t==="chap"){ bodyEl.appendChild(el("div","ad-chap",esc(b.label))); return; }
    const secEl=el("div","ad-sec");
    let h=`<div class="ad-sec-h"><span class="ad-num">${esc(b.num||'')}</span>${esc(b.heading||'')}</div>`;
    h+=renderBody(b.body,"ad");
    secEl.innerHTML=h; bodyEl.appendChild(secEl);
  });
  wrap.appendChild(bodyEl);
  return wrap;
}
const stateDocCache={};
async function openStateDocModal(aknPath, title, subtitle, pdfUrl){
  const modal=$("#modal"), body=$("#modal-body");
  body.innerHTML=`<div class="ad-loading"><div class="spinner"></div>Loading the document...</div>`;
  modal.classList.add("show"); document.body.style.overflow="hidden";
  try{
    let doc=stateDocCache[aknPath];
    if(!doc){ const xml=await fetchText((DATA_BASE||"")+aknPath); doc=new DOMParser().parseFromString(xml,"application/xml"); if(doc.getElementsByTagName("parsererror").length) throw new Error("parse error"); stateDocCache[aknPath]=doc; }
    body.innerHTML=""; body.appendChild(renderStateDoc(title, subtitle, actBlocks(doc), pdfUrl)); body.scrollTop=0;
  }catch(e){
    body.innerHTML=`<div class="ad-loading">Couldn't load this document.<br><br>The viewer reads the <code>.akn.xml</code> files live, so it must be served over http.</div>`;
  }
}

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
    `<div class="ad-title">${esc(c.name)}</div>
     <div class="ad-sub">${esc(sub.join(" · "))} · verbatim Akoma Ntoso (${esc((c.akn||"").split("/").pop())})</div>
     ${jpdf?`<button class="pdf-orig" data-pdf="${esc(jpdf)}" data-pdftitle="${esc(c.name)}">${ic('file')} Original PDF</button>`:''}`));
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
    <div class="state-layer">
      <div class="statedd-wrap">${stateInlineSelectHTML()}</div>
      <div class="state-layer-note">Everything below is specific to ${st.name}.</div>
      <div class="nav-group scoped">State objects</div>
      <div class="nav-scoped">
        <a data-view="amendments"><span class="ico">${ic('file-pen')}</span> State amendments ${stateBadge('amendments')}</a>
        <a data-view="staterules"><span class="ico">${ic('clipboard')}</span> State rules ${stateBadge('rules')}</a>
        <a data-view="notifications"><span class="ico">${ic('bell')}</span> Notifications ${stateBadge('notifications')}</a>
      </div>
      <div class="nav-group scoped">Domain &amp; culture</div>
      <div class="nav-scoped">
        <a data-view="practice"><span class="ico">${ic('messages-square')}</span> Local practice <span class="count">${isModelled()?PRACTICE_NOTES.length:'-'}</span></a>
        <a data-view="words"><span class="ico">${ic('type')}</span> Vocabulary <span class="count">${isModelled()?Object.keys(TERMS).length:'-'}</span></a>
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
        <a data-view="split" class="ov-pop-item"><span class="ico">${ic('arrow-left-right')}</span> Shared vs State</a>
        <a data-view="time" class="ov-pop-item"><span class="ico">${ic('history')}</span> The 2024 code switch</a>
      </div>
      <button class="ov-trigger" id="ovTrigger"><span class="ico">${ic('compass')}</span> Overview <span class="nav-chev">${ic('chevron-down')}</span></button>
    </div>`;
  const tb=$("#tbCase"); if(tb) tb.textContent=`${c.name} · ${c.act.split('·').pop().trim()}`;
  document.querySelectorAll("#nav a[data-view], #ovNav a[data-view]").forEach(a=>a.onclick=()=>{
    const ovm=$("#ovMenu"); if(ovm) ovm.classList.remove("open");
    go(a.dataset.view);
    setDrawer(false);
  });
  const dd=$("#casedd",nav), btn=$("#caseddBtn",nav);
  const ovt=$("#ovTrigger");
  if(btn) btn.onclick=e=>{ e.stopPropagation(); dd.classList.toggle("open"); };
  if(ovt) ovt.onclick=e=>{ e.stopPropagation(); $("#ovMenu").classList.toggle("open"); };
  nav.querySelectorAll(".casedd-item[data-id]").forEach(it=>it.onclick=()=>{
    const ct=caseById(it.dataset.id);
    if(ct && ct.status==="active"){ activeCase=ct.id; buildNav(); go("overview"); }
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
  if(history.replaceState) history.replaceState(null,"","#"+view);
}
window.go=go;

/* theme toggle */
function setTheme(t){document.documentElement.classList.toggle("dark",t==="dark"); document.querySelectorAll(".tt-opt").forEach(o=>o.classList.toggle("on",o.dataset.t===t));}
document.querySelectorAll(".tt-opt").forEach(o=>o.onclick=()=>setTheme(o.dataset.t));
setTheme("dark");
$("#brand").onclick=()=>go("overview");

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
  if(sd && sd.dataset.akn){ openStateDocModal(sd.dataset.akn, sd.dataset.title, sd.dataset.sub, sd.dataset.pdf||""); return; }
  const b=e.target.closest(".view-full");
  if(b){ if(b.dataset.ref){const [a,eid]=b.dataset.ref.split(":"); openActModal(a,eid);} else if(b.dataset.act){ openActModal(b.dataset.act);} return; }
  if(e.target.closest("[data-close]")){ closeModal(); return; }
  const chip=e.target.closest(".cchip"); if(chip && chip.dataset.ref){ jumpToProvision(chip.dataset.ref); return; }
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
    const start=(location.hash||"#overview").slice(1);
    go(V[start]?start:"overview");
  }catch(err){ showLoadError(err); }
})();
