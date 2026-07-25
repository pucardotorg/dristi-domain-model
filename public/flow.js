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
  Background, Controls, MiniMap, Handle, Position, MarkerType,
  getSmoothStepPath, EdgeLabelRenderer
} from "https://esm.sh/reactflow@11.11.4?external=react,react-dom";

const h = React.createElement;

export const NODE_W = 236;
export const NODE_H = 60;

const CAT_COLOR = { case:"#ec5d5e", national:"#3b9eff", rule:"#0bd8b6", law:"#ffc53d", notification:"#9e8cff" };
const CAT_LABEL = { case:"The offence", national:"National", rule:"State rule", law:"State Act", notification:"Notification" };

let root = null;

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
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, label } = props;
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 16
  });
  const pid = "fp_" + String(id).replace(/[^a-zA-Z0-9]/g, "_");
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
        className: "rf-elabel",
        style: { transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)` }
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
      fitViewOptions: { padding: 0.16 },
      minZoom: 0.12, maxZoom: 2,
      nodesDraggable: true,
      nodesConnectable: false,
      elementsSelectable: true,
      proOptions: { hideAttribution: true },
      onNodeClick: (_e, node) => { if(node.data && typeof node.data.open === "function") node.data.open(); }
    },
      h(Background, { gap: 24, size: 1, color: "rgba(130,130,140,0.24)" }),
      h(Controls, { showInteractive: false }),
      h(MiniMap, {
        pannable: true, zoomable: true,
        nodeColor: (n) => CAT_COLOR[n.data && n.data.cat] || "#777",
        nodeStrokeWidth: 0,
        maskColor: "rgba(0,0,0,0.4)"
      })
    )
  );
}

export function unmountFlow(){
  if(root){ try{ root.unmount(); }catch(e){} root = null; }
}
