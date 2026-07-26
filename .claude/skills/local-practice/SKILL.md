---
name: local-practice
description: Turn something a person said (a quote, a relayed remark, or a transcript) about how a case actually runs on the ground into structured, attributed, cross-checked local-practice data. Use whenever the user shares field input - "X told me...", "here's a transcript", "someone at the court said..." - or asks to record/process a practice note. Records the note with attribution and verification, decomposes it by unit (role / rule / process / procedure / vocabulary / forum / integrity), checks each against the corpus, inserts new or enhanced units and links them back to the note, marks only the informal parts, flags anything verifiably false, and links similar or diverging practice across states. Everything is data; the UI renders it generically - never hardcode.
---

# Processing local practice

The **Local practice** view holds field notes - what people who run a case type say
about how it actually works, beyond what any Act writes down. This skill converts
one spoken input into structured data that also **enriches the model**: a remark
can add a role, a vocabulary word, a process step, or nothing at all - and whatever
it touches must be linked back to the note it came from, in the data.

**If the input is a recorded interview** (a YouTube/video/audio link or a raw
transcript), or the first note from a state that is not modelled yet, start with the
**`field-interview`** skill - it pulls the transcript and stands up a new state
layer, then hands back here for the note itself.

Guiding rules (from the user):
- **Attribute everything to the person.** Note who said it; if it may be secondhand,
  say so (said by X, but the ultimate source may be court staff or observation).
- **Cross-check against the corpus.** If a claim is already covered by law/rules,
  say so and link it. If a claim is **verifiably false**, mark it `contradicted`
  with the evidence. If it can't be checked, mark it `needs-check` / `unverified`.
- **Verified means say how and by whom.** Record `method`, `evidence`, `by`, `on`.
- **Say whether it changed anything.** If it changes nothing, record that explicitly;
  if it does, record exactly what it changed, as resolvable links.
- **Mark only the informal parts.** If a role/step is governed by a rule, add it as
  formal with its governing cites; flag just the parts outside the rules.
- **Link across states.** Where another state has a comparable practice, link them and
  say `similar` or `diverges` with a one-line description.
- **No hardcoding.** All of the above lives in the data. The views render whatever the
  fields say - adding a note or a field must need zero code change.

## Where the data lives

| Thing | File |
|---|---|
| Field notes | `public/data/config/app.config.json` → `practice_notes[]` (rendered by `V.practice`) |
| Roles | `public/data/state/<state>.json` → `story.roles.items[]` |
| Process stages | `public/data/state/<state>.json` → `story.process.stages[]` |
| Vocabulary (the source-of-truth for term/role sources) | `public/data/state/<state>.json` → `vocabulary.terms[]` (state) or the profile `terms` (national) - use the **`vocabulary`** skill |

State cites use `{ "l": "E-Filing Rules r.17", "s": "kefr", "e": "rule_17" }` where `s`
is a state-instrument alias (`crp`, `kefr`, `kpa`, resolved by `stateAliasMap()`) and
`e` the eId; national cites use `{ "l": "...", "n": "ni:sec_142" }`. These resolve to
clickable, hoverable source links, so use them for every piece of evidence.

## The field-note schema

```json
{
  "id": "ke-scrutiny-officer-2026-07",
  "serial": "KL-01",                 // human serial, state-prefixed (KL=Kerala, HR=Haryana...); shown as a badge
  "place": "kerala",
  "date": "2026-07-26",
  "attribution": { "heardFrom": "Mehul", "affiliation": "PUCAR Team",
                   "secondhand": true, "originalSource": "as relayed; ultimate source likely court staff" },
  "statement": "verbatim or close paraphrase of what was said",
  "themes": ["pre-cognizance-scrutiny", "gatekeeping-rent-seeking"],   // cross-state comparison join keys
  "tags": ["corruption", "informal-practice", "gatekeeping", "delay"], // categorical facets - drive the filter bar

  "verification": { "claims": [
    { "claim": "a defect-scrutiny step happens before cognizance",
      "status": "corroborated", "method": "cross-checked against the corpus",
      "evidence": [ {"l":"E-Filing Rules r.17","s":"kefr","e":"rule_17"}, {"l":"CRP r.68","s":"crp","e":"rule_68"} ],
      "by": "DRISTI (Claude)", "on": "2026-07-26" },
    { "claim": "the role is informal and not in the rules",
      "status": "contradicted", "method": "cross-checked against the corpus",
      "evidence": [ ...same refs... ], "by": "...", "on": "...",
      "note": "why it is false: scrutiny is a formal Registry function; only the title and the payment are outside the rules" },
    { "claim": "files are held so the advocate pays",
      "status": "reported-allegation", "toCheck": "not established; needs field corroboration" }
  ]},

  "impact": {
    "changed": true,
    "changes": [
      { "unit": "term",    "op": "created",  "ref": "kerala:term:scrutiny-officer",       "label": "Scrutiny officer" },
      { "unit": "role",    "op": "created",  "ref": "kerala:role:scrutiny-officer",       "label": "Scrutiny officer" },
      { "unit": "process", "op": "created",  "ref": "kerala:process:scrutiny-defect-check","label": "1b · Scrutiny & defect check" }
    ],
    "relatesToLaw": [
      { "l":"E-Filing Rules r.17","s":"kefr","e":"rule_17","relation":"governs","note":"the Registry scrutinises and notes objections" },
      { "l":"CRP r.68","s":"crp","e":"rule_68","relation":"governs","note":"defective petitions returned for representation" }
    ]
  },

  "compare": []   // fills when another state has a note under a shared theme
}
```

- `verification.claims[].status` is a free slug; the UI colours the chip from it
  (`.verif-<status>`), so new statuses need no code. Established set:
  `corroborated` · `contradicted` · `reported-allegation` · `reported-practice` ·
  `needs-check` · `unverified` (and `similar`/`diverges` for `compare`).
  `reported-practice` = a firsthand informal practice that is real but governed by
  no rule (distinct from `reported-allegation`, an unproven accusation, and
  `needs-check`, a factual claim still to reconcile with the corpus).
- If the note changes nothing: `"impact": { "changed": false, "reason": "already covered by crp:rule_68" }`.

## The other half of the link (units point back)

Every role / term / process step the note creates or enhances carries its own
provenance, so the link is bidirectional and lives in data, not the UI:

```json
// story.roles.items[] - a FORMAL role, only its informal parts flagged
{ "id": "scrutiny-officer", "role": "Scrutiny officer", "cat": "staff", "term": "scrutiny-officer",
  "who": "...the formal function...",
  "cite": [ {"l":"E-Filing Rules r.17","s":"kefr","e":"rule_17"}, {"l":"CRP r.68","s":"crp","e":"rule_68"} ],
  "informal": { "title": "the title is functional, not in the rules",
                "practice": "reported holding of files for payment (Mehul, PUCAR; unverified)" },
  "sourceNotes": ["ke-scrutiny-officer-2026-07"], "themes": ["pre-cognizance-scrutiny"] }
```

Same `sourceNotes` + `relatesToLaw` + `informal` + `themes` (+ `id`) on the vocab
term and the process step/stage. The UI renders these generically: a role or a
**vocabulary term** that carries `sourceNotes` shows a clickable **"field note"**
backlink (`goPracticeNote`) that opens the note in Local practice - the same way a
provision link opens its statute. So always put `sourceNotes` on every unit the note
creates (roles, process stages, **and vocab terms**), not just on the note's
`impact.changes`; that is what makes the term-to-note link live, not only
note-to-term. `V.practice` also renders an `informal aspects` chip on any role.

**The links must resolve (do not leave dead chips).** An `impact.changes[]` entry is
`{ unit, ref, label }` where `ref` is `<state>:<unit>:<id>` and the created/enhanced
unit carries that same trailing `id`. The card renders each change as a clickable
chip (`<a class="pn-change" data-unit data-ref data-label>`); `goPracticeChange`
routes it: `term` -> the Vocabulary word (`goVocabWord(label)`), `role` -> the story
role card (`#role-<id>`), `process` -> the story stage (`#procstage-<id>`). So give
the role `id: "scrutiny-officer"` (rendered `id="role-scrutiny-officer"`), the stage
`id: "scrutiny-defect-check"` (`id="procstage-..."`), and match the term by its
`word`. A new unit kind needs a DOM id + a branch in `goStoryUnit`/`goPracticeChange`.

## The workflow

1. **Attribute.** Capture `heardFrom`, `affiliation`, `secondhand` + `originalSource`,
   `place`, `date`. Write the `statement` faithfully.
2. **Decompose by unit.** Split the statement into candidates: role, rule, process,
   procedure, vocabulary/term, forum, and any **integrity observation** (rent-seeking,
   delay-for-payment, etc.).
3. **Check each against the corpus.** Search the acts, the state instruments, and the
   existing vocab/roles/process (grep the AKN + the profile/state JSON). For each unit
   decide: **Known** (link to the provision) · **New** (insert) · **Renamed** (same
   thing, another name → add as an `aka` via the `vocabulary` skill) · **Enhances**
   (annotate an existing role/step) · **Contradicted** (the claim is false - the rule
   says otherwise).
4. **Verify per claim.** Set `status`; when corroborated/contradicted, record
   `method` + `evidence` (cite refs) + `by` + `on`. Never assert an allegation as fact -
   `reported-allegation` + `toCheck`.
5. **Formal vs informal.** If a rule governs the function, add the unit as **formal**
   with governing `cite`s, and put ONLY the out-of-rules parts under `informal`.
6. **Insert & cross-link.** Create/enhance the units with `id` + `sourceNotes` +
   `relatesToLaw` + `themes`; mirror them in the note's `impact.changes` (with `label`)
   and `impact.relatesToLaw`. Terms go through the `vocabulary` skill so the source is
   mapped there.
7. **Nothing changed?** Record `impact.changed: false` with a `reason`.
8. **Link across states.** For each `theme`, scan every state's notes/roles/process for
   the same slug; where found, write reciprocal `compare` entries
   (`{ place, noteId, relation: "similar"|"diverges", note }`) on both. Keep theme
   slugs a small controlled list so they actually join.
9. **Validate & commit.** JSON parses; anchors resolve; **no em-dashes in app-authored
   copy** (statements, glosses, notes) - but verbatim law keeps its em-dashes; commit
   with the `Co-Authored-By` trailer.

## Rendering (already generic - do not hardcode)

`V.practice` reads the whole schema. The list has a **filter bar** (State + Tags)
derived from the notes, and cards are **grouped by state** and carry their `serial`
badge. Each card is scannable at a glance - statement (clamped, with a "more"
toggle), attribution + `relayed · may be secondhand` badge, `tags`, and a
compact **verification tally** (severity-ordered, a contradiction shown in red even
while collapsed - no left accent, per the `design` skill). Detail sits behind
**accordions** (Verification / What it changed / Across states), collapsed by
default, and is a **clean bullet list** (a small status dot + plain status word +
muted sub-lines + plain underlined citations - no pills). The dot/tally colour is
derived from the status slug and the severity/label from small lookup maps that
default unknown statuses to caution - so a new status needs no code.
`impact.changes[]` render as plain clickable links that navigate (term/role/process). Add a note, a tag, or a new field and it
flows through with no code change. If you find yourself editing `app.js` to show a
specific note, stop - put it in the data instead.

## Checklist

- [ ] Attributed (who + affiliation + secondhand chain + date); statement faithful.
- [ ] Decomposed by unit; each classified Known/New/Renamed/Enhances/Contradicted.
- [ ] Every claim has a `status`; verified ones say how/evidence/by/on; false ones `contradicted` with evidence; allegations `reported-allegation`, never asserted.
- [ ] Formal units added with governing cites; only out-of-rules parts under `informal`.
- [ ] Units carry `id` + `sourceNotes` + `relatesToLaw` + `themes`; note mirrors them in `impact` (bidirectional). New terms via the `vocabulary` skill.
- [ ] `impact.changes[]` refs resolve: each unit has the matching `id`, so the "what it changed" chip navigates (term/role/process) - no dead links.
- [ ] `impact.changed` set true (with changes) or false (with reason).
- [ ] Note has a `serial` (state-prefixed) and `tags` (categorical facets); `themes` for cross-state joins; `compare` links written where a shared theme exists.
- [ ] JSON valid; anchors resolve; app copy em-dash-free; nothing hardcoded in the UI; committed.
