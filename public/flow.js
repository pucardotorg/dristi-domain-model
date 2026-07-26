/* flow.js - the interactive Section 138 relationship map.
   Loaded on demand (dynamic import) only when the Map tab is opened.

   React and React Flow load from esm.sh (pinned to one shared React instance by
   the import map in index.html). React Flow cannot be vendored as a single UMD
   file like pdf.js, so this one view needs network access; app.js shows a
   graceful fallback if the import fails.

   Design: boxed category-chip nodes (no border accents), and custom edges with
   dots that flow along the line to show direction. Nodes paint above the edges,
   so line work never sits on top of the labels. */

import React from "react";
import { createRoot } from "react-dom/client";
import ReactFlow, {
  Background, Controls, ControlButton, Handle, Position, MarkerType,
  getBezierPath, EdgeLabelRenderer, Panel, ReactFlowProvider
} from "https://esm.sh/reactflow@11.11.4?external=react,react-dom";

const h = React.createElement;

export const NODE_W = 236;
export const NODE_H = 60;

const CAT_LABEL = { case:"The offence", national:"National", rule:"State rule", law:"State Act", notification:"Notification" };

let root = null;

/* lucide "maximize" glyph for the fullscreen control button */
function fullscreenIcon(){
  return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
    h("path", { d: "M8 3H5a2 2 0 0 0-2 2v3" }),
    h("path", { d: "M21 8V5a2 2 0 0 0-2-2h-3" }),
    h("path", { d: "M3 16v3a2 2 0 0 0 2 2h3" }),
    h("path", { d: "M16 21h3a2 2 0 0 0 2-2v-3" })
  );
}

/* boxed node: a category chip (coloured dot + label) over a bold, clamped title */
function CardNode({ data }){
  const cat = data.cat || "national";
  return h("div", { className: "rf-node rf-" + cat, title: data.open ? "Click to open" : "" },
    h(Handle, { type: "target", position: Position.Left, isConnectable: false }),
    h("div", { className: "rf-node-cat" }, h("span", { className: "rf-node-dot" }), CAT_LABEL[cat] || cat),
    h("div", { className: "rf-node-title" }, data.label),
    h(Handle, { type: "source", position: Position.Right, isConnectable: false })
  );
}
const nodeTypes = { card: CardNode };

/* custom edge: a subtle base line, two dots flowing along it, and a pill label */
function FlowEdge(props){
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, label, data } = props;
  const [path, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, curvature: 0.32
  });
  const pid = "fp_" + String(id).replace(/[^a-zA-Z0-9]/g, "_");
  const clickable = data && typeof data.open === "function";
  return h(React.Fragment, null,
    h("path", { id: pid, d: path, className: "rf-edge-line", markerEnd }),
    h("circle", { className: "rf-flow-dot", r: 2.7 },
      h("animateMotion", { dur: "2.8s", repeatCount: "indefinite", keyPoints: "0;1", keyTimes: "0;1", calcMode: "linear" },
        h("mpath", { href: "#" + pid }))),
    h("circle", { className: "rf-flow-dot rf-flow-dot-2", r: 2.7 },
      h("animateMotion", { dur: "2.8s", begin: "1.4s", repeatCount: "indefinite", keyPoints: "0;1", keyTimes: "0;1", calcMode: "linear" },
        h("mpath", { href: "#" + pid }))),
    label ? h(EdgeLabelRenderer, null,
      h("div", {
        className: "rf-elabel" + (clickable ? " rf-elabel-click" : ""),
        title: clickable ? "Open the linked provision" : "",
        onClick: clickable ? (ev) => { ev.stopPropagation(); data.open(); } : undefined,
        style: {
          transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
          pointerEvents: clickable ? "all" : "none"
        }
      }, label)
    ) : null
  );
}
const edgeTypes = { flow: FlowEdge };

export function mountFlow(container, model){
  if(!container) return;
  unmountFlow();
  const nodes = (model.nodes || []).map(n => {
    const w = n.width || NODE_W, hh = n.height || NODE_H;
    return { ...n, type: "card", width: w, height: hh, style: { ...(n.style||{}), width: w, height: hh } };
  });
  const edges = (model.edges || []).map(e => ({
    ...e,
    type: "flow",
    label: e.label,
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: "#727888" }
  }));

  // React Flow runs UNCONTROLLED so it owns node measurement internally.
  root = createRoot(container);
  root.render(
    h(ReactFlow, {
      defaultNodes: nodes,
      defaultEdges: edges,
      nodeTypes, edgeTypes,
      fitView: true,
      // clamp the initial fit so it starts zoomed in a little (draggable), while
      // still letting the user zoom right out to 0.12 by hand.
      fitViewOptions: { padding: 0.1, minZoom: 0.62, maxZoom: 0.82 },
      minZoom: 0.12, maxZoom: 2,
      nodesDraggable: true,
      nodesConnectable: false,
      elementsSelectable: true,
      proOptions: { hideAttribution: true },
      onNodeClick: (_e, node) => { if(node.data && typeof node.data.open === "function") node.data.open(); }
    },
      h(Background, { gap: 24, size: 1, color: "rgba(130,130,140,0.24)" }),
      // zoom in/out are the defaults; the fit-view button is replaced by a
      // fullscreen toggle that expands the map to fill the whole screen.
      h(Controls, { showInteractive: false, showFitView: false },
        h(ControlButton, {
          title: "Full screen",
          onClick: () => {
            if (document.fullscreenElement) { document.exitFullscreen(); }
            else if (container.requestFullscreen) { container.requestFullscreen(); }
          }
        }, fullscreenIcon())
      )
    )
  );
}

export function unmountFlow(){
  if(root){ try{ root.unmount(); }catch(e){} root = null; }
}

/* =========================================================================
   Institution hierarchy diagrams (Police / Courts pages). Reuses the same
   React Flow setup. Every node carries the full unit metadata in node.data;
   clicking a node opens a detail panel. Exported as mountInstitution().
   ========================================================================= */
const citesOf = it => ((it && it.cite) || []).map(c => c && (c.l || c.n)).filter(Boolean);
const ISTEP = 104;

function buildPolice(P){
  const nodes = [], edges = [];
  const ranks = (P && P.ranks) || [], units = (P && P.units) || [], oversight = (P && P.oversight) || [];
  const RANK_X = 0, UNIT_X = 430, OV_X = 880;
  ranks.forEach((r, i) => {
    nodes.push({ id:"r-"+r.id, type:"inst", position:{ x:RANK_X, y:i*ISTEP },
      data:{ group:"rank", name:r.name, sub:r.service||"", badge:r.service||"", aka:r.aka, who:r.who, entry:r.entry, cites:citesOf(r) } });
    if(i>0) edges.push({ id:"re"+i, source:"r-"+ranks[i-1].id, target:"r-"+r.id, type:"smoothstep" });
  });
  const byId = {}; units.forEach(u => byId[u.id] = u);
  const chain = ["state","zone","range","district","subdiv","circle","station","outpost"].filter(id => byId[id]);
  let prev = null;
  chain.forEach((id, i) => {
    const u = byId[id];
    nodes.push({ id:"u-"+id, type:"inst", position:{ x:UNIT_X, y:i*ISTEP },
      data:{ group:"unit", name:u.name, sub:u.head?("Headed by "+u.head):"", who:u.who, head:u.head, cites:citesOf(u) } });
    if(prev) edges.push({ id:"ue"+id, source:"u-"+prev, target:"u-"+id, type:"smoothstep" });
    prev = id;
  });
  if(byId["commissionerate"]){
    const u = byId["commissionerate"];
    nodes.push({ id:"u-commissionerate", type:"inst", position:{ x:UNIT_X+250, y:2.6*ISTEP },
      data:{ group:"unit", name:u.name, sub:u.head?("Headed by "+u.head):"", who:u.who, head:u.head, cites:citesOf(u) } });
    edges.push({ id:"uecomm", source:"u-state", target:"u-commissionerate", type:"smoothstep", label:"metro", style:{ strokeDasharray:"5 4" } });
  }
  oversight.forEach((o, i) => {
    nodes.push({ id:"o-"+o.id, type:"inst", position:{ x:OV_X, y:i*ISTEP*1.1 },
      data:{ group:"oversight", name:o.name, sub:"oversight body", who:o.who, cites:citesOf(o) } });
    if(ranks[0]) edges.push({ id:"oe"+i, source:"o-"+o.id, target:"r-"+ranks[0].id, type:"smoothstep", label:"oversees", style:{ strokeDasharray:"3 4" } });
  });
  [{x:RANK_X,l:"Chain of command - ranks"},{x:UNIT_X,l:"Territorial organisation"},{x:OV_X,l:"Oversight bodies"}]
    .forEach((c,i)=> nodes.push({ id:"lbl"+i, type:"inst", position:{x:c.x,y:-84}, draggable:false, selectable:false, data:{group:"label", name:c.l} }));
  return { nodes, edges };
}

function buildCourts(J){
  const nodes = [], edges = [];
  const tiers = (J && J.tiers) || [], roles = (J && J.roles) || [];
  const cjm = tiers.find(t => t.id === "cjm");
  const chain = tiers.filter(t => t.id !== "cjm");
  const TIER_X = 0, ROLE_X = 470;
  chain.forEach((t, i) => {
    const trial = /trial court/i.test(t.role || "") || i === chain.length - 1;
    nodes.push({ id:"t-"+t.id, type:"inst", position:{ x:TIER_X, y:i*ISTEP },
      data:{ group:"tier", trial:trial, name:t.name, sub:t.role||"", badge: trial?"s.138 trial court":"", aka:t.aka, who:t.who, cites:citesOf(t) } });
    if(i>0) edges.push({ id:"te"+i, source:"t-"+chain[i].id, target:"t-"+chain[i-1].id, type:"smoothstep", label: i===chain.length-1?"appeal":"" });
  });
  if(cjm){
    const ti = chain.length - 1;
    nodes.push({ id:"t-cjm", type:"inst", position:{ x:TIER_X+290, y:ti*ISTEP },
      data:{ group:"tier-admin", name:cjm.name, sub:cjm.role||"", aka:cjm.aka, who:cjm.who, cites:citesOf(cjm) } });
    edges.push({ id:"tecjm", source:"t-cjm", target:"t-"+chain[ti].id, type:"smoothstep", label:"administers", style:{ strokeDasharray:"5 4" } });
  }
  roles.forEach((r, i) => {
    nodes.push({ id:"role-"+(r.id||i), type:"inst", position:{ x:ROLE_X + (i%2)*250, y:Math.floor(i/2)*90 },
      data:{ group:(r.cat==="judge"?"judge":"staff"), name:r.name, sub:(r.cat==="judge"?"judge":"court staff"), aka:r.aka, who:r.who, entry:r.entry, cites:citesOf(r) } });
  });
  [{x:TIER_X,l:"Court hierarchy - apex to trial court"},{x:ROLE_X,l:"The people in the courts"}]
    .forEach((c,i)=> nodes.push({ id:"clbl"+i, type:"inst", position:{x:c.x,y:-84}, draggable:false, selectable:false, data:{group:"label", name:c.l} }));
  return { nodes, edges };
}

function InstNode({ data }){
  if(data.group==="label") return h("div", { className:"rfn-collabel" }, data.name || "");
  return h("div", { className:"rfn rfn-"+(data.group||"")+(data.trial?" rfn-trial":"") },
    h(Handle, { type:"target", position:Position.Top, isConnectable:false, className:"rfn-h" }),
    data.badge ? h("div", { className:"rfn-badge" }, data.badge) : null,
    h("div", { className:"rfn-name" }, data.name || ""),
    data.sub ? h("div", { className:"rfn-sub" }, data.sub) : null,
    h(Handle, { type:"source", position:Position.Bottom, isConnectable:false, className:"rfn-h" })
  );
}
const instNodeTypes = { inst: InstNode };

function InstDetail({ data, onClose }){
  if(!data) return null;
  const line = (k, v) => v ? h("div", { className:"rfp-line" }, h("span", { className:"rfp-k" }, k), " " + v) : null;
  return h("div", { className:"rfp" },
    h("button", { className:"rfp-x", onClick:onClose, "aria-label":"Close" }, "×"),
    h("div", { className:"rfp-name" }, data.name || ""),
    (data.aka && data.aka.length) ? h("div", { className:"rfp-aka" }, "also " + data.aka.join("  ·  ")) : null,
    data.who ? h("div", { className:"rfp-who" }, data.who) : null,
    line("Service", data.badge && data.group==="rank" ? data.badge : ""),
    line("Head", data.head),
    line("Entry", data.entry),
    (data.cites && data.cites.length) ? h("div", { className:"rfp-line" }, h("span", { className:"rfp-k" }, "From"), " " + data.cites.join(",  ")) : null
  );
}

function InstFlow({ kind, data }){
  const [sel, setSel] = React.useState(null);
  const g = React.useMemo(() => kind==="police" ? buildPolice(data) : buildCourts(data), [kind, data]);
  return h(ReactFlow, {
      defaultNodes:g.nodes, defaultEdges:g.edges, nodeTypes:instNodeTypes,
      fitView:true, fitViewOptions:{ padding:0.16 }, minZoom:0.2, maxZoom:1.8,
      nodesDraggable:true, nodesConnectable:false, elementsSelectable:true,
      proOptions:{ hideAttribution:true }, defaultEdgeOptions:{ type:"smoothstep" },
      onNodeClick:(_e,n)=>{ if(n.data && n.data.group!=="label") setSel(n.data); }, onPaneClick:()=>setSel(null) },
    h(Background, { gap:22, size:1, color:"rgba(130,130,140,0.22)" }),
    h(Controls, { showInteractive:false }),
    sel ? h(Panel, { position:"top-right" }, h(InstDetail, { data:sel, onClose:()=>setSel(null) })) : null
  );
}

let instRoot = null;
export function mountInstitution(container, kind, data){
  if(!container) return () => {};
  if(instRoot){ try{ instRoot.unmount(); }catch(e){} instRoot = null; }
  instRoot = createRoot(container);
  instRoot.render(h(ReactFlowProvider, null, h(InstFlow, { kind, data })));
  return () => { if(instRoot){ try{ instRoot.unmount(); }catch(e){} instRoot = null; } };
}
