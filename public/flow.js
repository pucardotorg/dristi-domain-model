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
  getBezierPath, EdgeLabelRenderer
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
