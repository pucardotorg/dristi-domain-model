/* flow.js - the interactive Section 138 relationship map.
   Loaded on demand (dynamic import) only when the Map tab is opened.

   React and React Flow are pulled from esm.sh as ES modules (pinned to one shared
   React instance via the import map in index.html). Unlike the rest of the corpus
   and pdf.js, React Flow cannot be vendored without a build step, so this one view
   needs network access; app.js shows a graceful fallback if the import fails.

   The module takes a plain {nodes, edges} model built by app.js from the domain
   data. Node click handlers (open the Act / instrument / PDF) ride on node.data.open.
   React Flow runs UNCONTROLLED (defaultNodes/defaultEdges) so it owns node
   measurement internally - the controlled form needs an onNodesChange handler to
   write measured sizes back, and without it edges never render. */

import React from "react";
import { createRoot } from "react-dom/client";
import ReactFlow, {
  Background, Controls, MiniMap, Handle, Position, MarkerType
} from "https://esm.sh/reactflow@11.11.4?external=react,react-dom";

const h = React.createElement;

export const NODE_W = 224;
export const NODE_H = 58;

const CAT_COLOR = {
  case:         "#ec5d5e",
  national:     "#3b9eff",
  rule:         "#0bd8b6",
  law:          "#ffc53d",
  notification: "#9e8cff"
};
const EDGE = "#8a8f99";

let root = null;

/* a small themeable card node */
function CardNode({ data }){
  return h("div", { className: "rf-card rf-" + (data.cat || "national"), title: data.open ? "Click to open" : "" },
    h(Handle, { type: "target", position: Position.Left, isConnectable: false }),
    h("div", { className: "rf-card-t" }, data.label),
    data.sub ? h("div", { className: "rf-card-s" }, data.sub) : null,
    h(Handle, { type: "source", position: Position.Right, isConnectable: false })
  );
}
const nodeTypes = { card: CardNode };

export function mountFlow(container, model){
  if(!container) return;
  unmountFlow();
  const nodes = (model.nodes || []).map(n => {
    const w = n.width || NODE_W, hh = n.height || NODE_H;
    return { ...n, type: "card", width: w, height: hh, style: { ...(n.style||{}), width: w, height: hh } };
  });
  const edges = (model.edges || []).map(e => ({
    ...e,
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: EDGE },
    style: { stroke: EDGE, strokeWidth: 1.4 },
    labelShowBg: true,
    labelStyle: { fontSize: 10, fill: "#b0b4ba" },
    labelBgStyle: { fill: "#18191b", fillOpacity: 0.94 },
    labelBgPadding: [5, 3],
    labelBgBorderRadius: 4
  }));

  root = createRoot(container);
  root.render(
    h(ReactFlow, {
      defaultNodes: nodes,
      defaultEdges: edges,
      nodeTypes,
      fitView: true,
      fitViewOptions: { padding: 0.16 },
      minZoom: 0.12, maxZoom: 2,
      nodesDraggable: true,
      nodesConnectable: false,
      elementsSelectable: true,
      proOptions: { hideAttribution: true },
      onNodeClick: (_e, node) => { if(node.data && typeof node.data.open === "function") node.data.open(); }
    },
      h(Background, { gap: 22, size: 1, color: "rgba(130,130,140,0.28)" }),
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
