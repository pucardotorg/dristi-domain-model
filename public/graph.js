/* graph.js - a self-contained, force-directed relationship graph (Obsidian-style).
   No external libraries: a small velocity-Verlet physics sim rendered to canvas.
   mountGraph(container, {nodes, links}) where
     node = {id, label, cat, open?}      cat in: case|national|rule|law|notification
     link = {source, target, label?}     source/target are node ids
   Interactions: drag nodes, drag background to pan, wheel to zoom, hover to
   highlight a node and its neighbours, click a node to open its text. */

const CAT = {
  case:        { c:"#ec5d5e", r:13 },
  national:    { c:"#3b9eff", r:8 },
  rule:        { c:"#0bd8b6", r:7 },
  law:         { c:"#ffc53d", r:8 },
  notification:{ c:"#9e8cff", r:7 },
};
const CAT_FALLBACK = { c:"#8b8d98", r:7 };

let _raf = null, _cleanup = null;

export function unmountGraph(){ if(_raf) cancelAnimationFrame(_raf); _raf=null; if(_cleanup){ _cleanup(); _cleanup=null; } }

export function mountGraph(container, model){
  unmountGraph();
  container.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.className = "graph-canvas";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // ---- build node/link objects ----
  const byId = {};
  const nodes = (model.nodes||[]).map(n=>{
    const cat = CAT[n.cat] ? n.cat : "national";
    const o = { id:n.id, label:n.label||"", cat, open:n.open, deg:0,
      x:(Math.random()-0.5)*600, y:(Math.random()-0.5)*600, vx:0, vy:0, fx:null, fy:null };
    byId[n.id]=o; return o;
  });
  const links = [];
  (model.links||model.edges||[]).forEach(e=>{
    const s = byId[e.source], t = byId[e.target];
    if(s && t){ links.push({ s, t, label:e.label||"" }); s.deg++; t.deg++; }
  });
  const adj = {};                       // neighbour sets for hover highlight
  nodes.forEach(n=> adj[n.id]=new Set());
  links.forEach(l=>{ adj[l.s.id].add(l.t.id); adj[l.t.id].add(l.s.id); });
  const radius = n => (CAT[n.cat]||CAT_FALLBACK).r + Math.min(6, n.deg*0.7);

  // seed positions on a rough circle so it opens tidily
  nodes.forEach((n,i)=>{ const a=i/nodes.length*Math.PI*2; const R=Math.min(360, 60+nodes.length*3);
    n.x=Math.cos(a)*R; n.y=Math.sin(a)*R; });

  // ---- view transform ----
  let scale=1, tx=0, ty=0, W=0, H=0, DPR=1, userMoved=false, alpha=1;
  function resize(){
    DPR = window.devicePixelRatio||1;
    const rect = container.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = Math.max(1,W*DPR); canvas.height = Math.max(1,H*DPR);
    canvas.style.width = W+"px"; canvas.style.height = H+"px";
    ctx.setTransform(DPR,0,0,DPR,0,0);
    if(!userMoved){ tx = W/2; ty = H/2; reheat(0.4); }   // keep the world centred until the user pans/zooms
  }
  const ro = new ResizeObserver(resize); ro.observe(container);
  resize();
  // catch late layout: re-measure on the next frames and shortly after mount
  requestAnimationFrame(resize);
  const _t1=setTimeout(resize,250), _t2=setTimeout(resize,700);

  // ---- physics ----
  const K_REPEL = 5200, K_SPRING = 0.02, SPRING_LEN = 74, GRAVITY = 0.015, DAMP = 0.86;
  function tick(){
    if(alpha < 0.02){ return; }           // settled - stop integrating (still render on interaction)
    // repulsion (O(n^2); fine for a few hundred nodes)
    for(let i=0;i<nodes.length;i++){
      const a=nodes[i];
      for(let j=i+1;j<nodes.length;j++){
        const b=nodes[j];
        let dx=a.x-b.x, dy=a.y-b.y; let d2=dx*dx+dy*dy || 0.01;
        const f = K_REPEL/d2; const d=Math.sqrt(d2);
        const fx=dx/d*f, fy=dy/d*f;
        a.vx+=fx; a.vy+=fy; b.vx-=fx; b.vy-=fy;
      }
    }
    // springs
    for(const l of links){
      let dx=l.t.x-l.s.x, dy=l.t.y-l.s.y; const d=Math.sqrt(dx*dx+dy*dy)||0.01;
      const f=(d-SPRING_LEN)*K_SPRING;
      const fx=dx/d*f, fy=dy/d*f;
      l.s.vx+=fx; l.s.vy+=fy; l.t.vx-=fx; l.t.vy-=fy;
    }
    // gravity to centre + integrate
    for(const n of nodes){
      n.vx += -n.x*GRAVITY; n.vy += -n.y*GRAVITY;
      n.vx*=DAMP; n.vy*=DAMP;
      if(n.fx!=null){ n.x=n.fx; n.y=n.fy; n.vx=n.vy=0; }
      else { n.x+=n.vx*alpha*1.6; n.y+=n.vy*alpha*1.6; }
    }
    alpha *= 0.985;
  }

  // ---- render ----
  let hover=null;
  function toWorld(px,py){ return { x:(px-tx)/scale, y:(py-ty)/scale }; }
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.save();
    ctx.translate(tx,ty); ctx.scale(scale,scale);
    const focus = hover;
    const near = focus ? adj[focus.id] : null;
    const isLit = n => !focus || n===focus || near.has(n.id);
    // links
    ctx.lineWidth = 1/scale;
    for(const l of links){
      const lit = !focus || l.s===focus || l.t===focus;
      ctx.strokeStyle = lit ? "rgba(150,152,162,0.55)" : "rgba(130,132,140,0.10)";
      ctx.beginPath(); ctx.moveTo(l.s.x,l.s.y); ctx.lineTo(l.t.x,l.t.y); ctx.stroke();
    }
    // link label (only for the hovered node's links)
    if(focus && scale>0.5){
      ctx.font = `${11/scale}px "Helvetica Neue",Arial,sans-serif`;
      ctx.textAlign="center"; ctx.textBaseline="middle";
      for(const l of links){
        if((l.s===focus||l.t===focus) && l.label){
          const mx=(l.s.x+l.t.x)/2, my=(l.s.y+l.t.y)/2;
          ctx.fillStyle="rgba(200,202,210,0.9)";
          ctx.fillText(l.label, mx, my);
        }
      }
    }
    // nodes
    ctx.textAlign="center"; ctx.textBaseline="top";
    for(const n of nodes){
      const col=(CAT[n.cat]||CAT_FALLBACK).c, r=radius(n), lit=isLit(n);
      ctx.globalAlpha = lit ? 1 : 0.22;
      ctx.beginPath(); ctx.arc(n.x,n.y,r,0,Math.PI*2);
      ctx.fillStyle=col; ctx.fill();
      if(focus===n){ ctx.lineWidth=2/scale; ctx.strokeStyle="#fff"; ctx.stroke(); }
      // labels: when zoomed in, or important, or lit under a focus
      const showLabel = lit && (scale>0.85 || n.cat==="case" || n.deg>=4 || focus);
      if(showLabel && n.label){
        ctx.font = `${(n.cat==="case"?12:10.5)/scale}px "Helvetica Neue",Arial,sans-serif`;
        ctx.fillStyle = lit ? "rgba(233,234,240,0.92)" : "rgba(233,234,240,0.3)";
        const t = n.label.length>34 ? n.label.slice(0,33)+"…" : n.label;
        ctx.fillText(t, n.x, n.y+r+2/scale);
      }
      ctx.globalAlpha=1;
    }
    ctx.restore();
  }

  function frame(){ tick(); draw(); _raf=requestAnimationFrame(frame); }
  frame();
  function reheat(a=0.6){ alpha=Math.max(alpha,a); }

  // ---- interactions ----
  let dragNode=null, panning=false, lastX=0, lastY=0, moved=false;
  function nodeAt(px,py){
    const w=toWorld(px,py); let best=null, bd=Infinity;
    for(const n of nodes){ const dx=n.x-w.x, dy=n.y-w.y; const d=dx*dx+dy*dy; const rr=(radius(n)+4); if(d<rr*rr && d<bd){ bd=d; best=n; } }
    return best;
  }
  function relPos(ev){ const r=canvas.getBoundingClientRect(); return [ev.clientX-r.left, ev.clientY-r.top]; }
  function onDown(ev){
    const [px,py]=relPos(ev); moved=false; lastX=px; lastY=py;
    const n=nodeAt(px,py);
    if(n){ dragNode=n; n.fx=n.x; n.fy=n.y; reheat(); } else { panning=true; }
  }
  function onMove(ev){
    const [px,py]=relPos(ev);
    if(dragNode){ const w=toWorld(px,py); dragNode.fx=w.x; dragNode.fy=w.y; moved=true; userMoved=true; reheat(0.3); return; }
    if(panning){ tx+=px-lastX; ty+=py-lastY; lastX=px; lastY=py; moved=true; userMoved=true; return; }
    const n=nodeAt(px,py);
    if(n!==hover){ hover=n; canvas.style.cursor=n?"pointer":"default"; }
  }
  function onUp(ev){
    if(dragNode){ dragNode.fx=dragNode.fy=null; dragNode=null; }
    if(panning){ panning=false; }
  }
  function onClick(ev){
    if(moved) return;
    const [px,py]=relPos(ev); const n=nodeAt(px,py);
    if(n && typeof n.open==="function") n.open();
  }
  function onWheel(ev){
    ev.preventDefault(); userMoved=true;
    const [px,py]=relPos(ev);
    const f = ev.deltaY<0 ? 1.12 : 1/1.12;
    const ns = Math.min(3.2, Math.max(0.18, scale*f));
    // zoom toward cursor
    tx = px-(px-tx)*(ns/scale); ty = py-(py-ty)*(ns/scale); scale=ns;
  }
  canvas.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("wheel", onWheel, {passive:false});

  _cleanup = ()=>{
    ro.disconnect(); clearTimeout(_t1); clearTimeout(_t2);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
  // expose a fit/reset in case the host wants it
  return { reheat };
}
