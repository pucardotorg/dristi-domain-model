---
name: design
description: Design guidelines and hard rules for any UI work on DRISTI - styling components, laying out a view, or briefing a design subagent. Consult this before writing CSS/markup or spawning a design agent, and pass its hard rules into any design brief. Records the user's standing visual preferences so we do not reintroduce things they have already rejected.
---

# DRISTI design guidelines

Clean, modern, restrained. This is a serious legal tool, not a dashboard. Prefer
**typography, spacing and whitespace** over borders, fills and colour. When in
doubt, remove the decoration.

## Hard rules (the user has stated these - do not violate, and do not let a design subagent reintroduce them)

1. **No left-border accent stripes. Anywhere.** No coloured vertical edge on a
   card/row/callout to signal status or category - not via `border-left`, not via
   `box-shadow: inset Npx 0 0 …`. The user has rejected this twice. If a status
   signal is needed, use a small inline dot or a single word of colour, never a
   left edge. (This also means: no `border-left` used decoratively - a plain
   `padding-left` indent is the clean alternative.)

2. **No "random pills and colouring."** Do not wrap every label, status, tag or
   citation in a filled/bordered pill. Avoid gratuitous colour. Specifically:
   - Statuses/labels: plain text (small-caps muted is fine), not filled coloured
     chips. A small coloured **dot** may carry the status; the text stays neutral.
   - Citations/links inside detail: plain **underlined** links, not boxed mono
     pills. (Boxed `.cite` pills are acceptable in dense law-view contexts, but not
     stacked inside a note's detail.)
   - Reserve colour for **one** meaningful signal per view, used sparingly (e.g. a
     *contradicted* claim in red). Everything else stays in `--ink` / `--ink-2` /
     `--ink-3`.

3. **Documentation reads as a list, not a wall of chips.** Prefer simple **bullet
   lists** (a small dot marker + text, muted sub-lines) over rows of coloured
   badges. Progressive disclosure (accordions collapsed by default) over showing
   everything at once.

## Positive style

- **Tokens only, theme-aware.** Use the CSS variables (`--bg --panel --panel-2
  --line --line-2 --ink --ink-2 --ink-3 --brand/-hi/-dim/-border --amber
  --red/-dim/-border`, `--font-mono`). Never hardcode a hex - it breaks light/dark.
- **Restraint.** 1px hairlines, ~11-14px radii, generous whitespace, small
  uppercase `10px/.09em/700/--ink-3` section labels (the app's established eyebrow).
- **Motion** subtle and reduced-motion-aware.
- **Data-driven, not hardcoded** - derive facets/labels/colours from the data
  (e.g. a status chip class from the status slug), so new data needs no new code.

## When briefing a design subagent

Paste rules 1-3 above into the brief verbatim as constraints, and say "clean,
modern, restrained - typography and spacing over colour and borders." The left
-accent regression happened because a subagent's spec reintroduced it; the brief
must forbid it up front.

## If the user rejects a treatment

Add it to the Hard rules list here (and note it in memory as feedback) in the same
turn, so it is never reintroduced.
