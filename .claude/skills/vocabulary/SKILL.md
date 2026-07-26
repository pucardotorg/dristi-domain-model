---
name: vocabulary
description: Add or extend terms in the DRISTI legal vocabulary. Use whenever asked to add, define, or expand vocabulary words, roles, forums, court staff, or synonyms (e.g. "is X in the vocab?", "add affidavit / notary / oath", "add synonyms"). Covers identifying the right word, finding its statutory origin, setting its attributes (group, part of speech, role, also-called names), pinning it to a resolvable Act or rule anchor, validating, and verifying in the app.
---

# Adding to the vocabulary

The Vocabulary view (`V.words` in `public/app.js`) shows the words a case type is
built on, in two scopes: a **national** vocabulary shared across India, and a
**state** layer (currently Kerala) that adds local words. Every word is pinned to
the exact section or rule it comes from, and clicking a word opens that text.

This skill is the end-to-end procedure for adding a word correctly. Follow the
steps in order. Do not skip the "confirm the anchor resolves" and "validate"
steps: a term whose anchor does not resolve renders a broken card.

## Where terms live

| Scope | File | Shape |
|---|---|---|
| National | `public/data/profiles/<case-type>.profile.json` → `terms` (object, **keyed by the lowercase word**) | `{ "ref", "gloss", "group", "pos", "role", "aka"? }` - or a practice term: `{ "source", "gloss", "group", "pos", "role", "aka"? }` with no `ref` |
| State | `public/data/state/<state>.json` → `vocabulary.terms` (array) | `{ "word", "gloss", "source", "akn"?, "eId"?, "group", "pos", "role", "aka"? }` |

Active profile today: `public/data/profiles/cheque-dishonour-s138.profile.json`.
Active state: `public/data/state/kerala.json`.

- **National `ref`** is `<alias>:<eId>` - `alias` is a source id declared in the
  profile's `sources` (e.g. `ni`, `bnss`, `crpc`, `bns`, `ipc`, `bsa`, `iea`,
  `bbea`, `genclauses`, `limitation`, `probation`, `itact`, `pss`, `constitution`,
  `advocates`, `police1861`); `eId` is a section id (`sec_143`) or article
  (`art_141`) that exists in that Act's AKN file.
- **State** points at an AKN file by path (`akn`) plus its `eId`
  (`rule_50`). A state term with no clean statutory home may omit `akn`/`eId` and
  carry a free-text `source` only (e.g. "High Court registry practice") - the card
  then shows the gloss and source with no openable text.
- **`sourceNotes` (either scope).** A term that came from a field note carries
  `"sourceNotes": ["<note-id>"]` - the card then renders a clickable **"field note"**
  backlink next to the source that opens that note in Local practice (just as a
  provision link opens its statute). Add it to every term a field note creates, so
  the term-to-note link is bidirectional in the data, not just the note-to-term
  half. This is the `field-interview` / `local-practice` path.
- **National practice term (no statute).** A concept that is genuinely pan-India
  but is court-administration practice, not a rule of any one Act (e.g. the Central
  Filing Centre), belongs in the *national* `terms` but has no `ref` to resolve.
  Give it a free-text `source` and omit `ref`; `wcard` renders `from <source>` and
  no statute slot, exactly like a source-only state term. **Do not force it into
  the state layer** just because it lacks an anchor - that would falsely imply it is
  specific to that state. Scope is about where the concept lives (all-India vs one
  state), not about whether a statute happens to define it.

## The workflow

### 1. Identify the right word(s)

- Pick the concept a reader would actually look up (the noun/idea), not a whole
  phrase from a section. "affidavit", "notary", "oath" - not "evidence given on
  affidavit before an officer".
- **Check it is not already there.** Search both files for the word *and* for it
  as an existing `aka` (also-called name). If the meaning is already covered by a
  near-synonym, add the new word as an `aka` on that term instead of a new card.
- **Decide the scope.** National = flows from a central Act or the Constitution and
  is the same across India. State = created or shaped by Kerala instruments
  (Criminal Rules of Practice, a Government Order, the Kerala Court Fees Act) or by
  local court-precinct practice.

```bash
# is the word (or a close form) already present?
python3 -c "import json;d=json.load(open('public/data/profiles/cheque-dishonour-s138.profile.json'));import sys;w='affidavit';print([k for k in d['terms'] if w in k]+[k for k,v in d['terms'].items() if w in ' '.join(v.get('aka',[])).lower()])"
python3 -c "import json;d=json.load(open('public/data/state/kerala.json'));w='oath';print([t['word'] for t in d['vocabulary']['terms'] if w in (t['word']+' '+' '.join(t.get('aka',[]))).lower()])"
```

### 2. Find its origin in law

This is the core of the skill. Every term must be pinned to the provision that is
genuinely its home in the context of this case type.

- Grep the AKN corpus by **heading and by content** - the home is often a section
  whose heading does not contain the obvious word. Search the national Acts under
  `public/data/acts/akn/` and the state rules under `public/data/state/<state>/akn/`.

```bash
# by section heading
grep -inoE '<section eId="[^"]*"><num>[^<]*</num><heading>[^<]*NEEDLE[^<]*</heading>' public/data/acts/akn/*.akn.xml
# by content, printing the owning section's eId + heading (use for concepts named only in the body)
python3 - 'public/data/acts/akn/indian-evidence-act-1872.akn.xml' 'notar' <<'PY'
import sys,re
xml=open(sys.argv[1]).read(); needle=sys.argv[2].lower()
for m in re.finditer(r'<section eId="([^"]+)">\s*<num>([^<]*)</num>\s*<heading>([^<]*)</heading>(.*?)</section>', xml, re.S):
    eid,num,head,body=m.groups()
    if needle in (head+body).lower(): print(eid,'| §'+num.strip(),'|',head.strip()[:70])
PY
```

- **Prefer the provision that actually operates in a §138 case.** Example: a
  *notary* is appointed under the Notaries Act, 1952 (not in the corpus), but the
  provision that *matters here* is the presumption that a notarised power-of-attorney
  is genuine (BSA s.84 / Evidence Act s.85), because §138 complaints are often filed
  by POA holders. Pin to that, and name the Notaries Act in the gloss.
- **Code-switch pairs.** For anything with a 2024 successor (IPC→BNS, CrPC→BNSS,
  IEA→BSA), pin the `ref` to the **current** Act (BNS/BNSS/BSA) and mention the
  predecessor section in the gloss. If the term genuinely needs to show both, model
  it the way the profile's `act_alias_map` / `applies` pairs already do.
- If nothing in the corpus fits and the concept is Kerala practice, make it a
  **state** term (CRP rule, GO, or free-text `source`).

### 3. Confirm the anchor resolves

A term whose `ref`/`eId` does not resolve renders a broken card (empty statute
slot, raw ref in the source line). Always confirm before adding:

```bash
# national: the eId exists in that Act's AKN, and the alias is a declared source
grep -c 'eId="sec_84"' public/data/acts/akn/bharatiya-sakshya-adhiniyam-2023.akn.xml
# state: the eId exists in the referenced AKN
grep -c 'eId="rule_50"' public/data/state/kerala/akn/criminal-rules-of-practice-kerala-1982.akn.xml
```

### 4. Set the attributes

- **`group`** - reuse an **existing** group heading so the word slots into the
  right section (a new string creates a new subsection). Current groups:
  - National: `The cheque & the instrument`, `Parties & liability`,
    `The offence (§138)`, `Presumptions & evidence`, `Procedure & process`,
    `Notice, limitation & disposal`, `Constitutional & powers`.
  - State (Kerala): `Court process & records`, `Police & execution`,
    `Filing & language`.
- **`pos`** (part of speech) - one of `noun`, `verb`, `adjective`.
- **`role`** (what it is in the case) - one of `actor`, `document`, `procedure`,
  `doctrine`, `forum`, `remedy`. A person = `actor`; a court = `forum`; a filed
  paper = `document`; a step = `procedure`; a rule/principle = `doctrine`; relief =
  `remedy`. (`pos`/`role` drive the filter facets; keep them from `POS_ORDER` /
  `ROLE_ORDER` in `app.js`.)
- **`aka`** (also-called names) - see the synonyms section below.

### 5. Write the gloss

One plain paragraph. Cover three things: **what it is**, **why it matters to a
case of this type**, and **where it comes from** (name the section/rule, and any
governing Act not in the corpus). Reuse a role's "who" text where one exists.
**No em-dashes anywhere** - use a spaced hyphen " - ". Write for a reader, not a
statute; do not quote long passages (the section text is one click away).

### 6. Add and validate

Add with a small script, then validate in the same run. Do not hand-edit large
JSON by eye.

```bash
python3 - <<'PY'
import json
pf="public/data/profiles/cheque-dishonour-s138.profile.json"
d=json.load(open(pf))
d["terms"]["notary"]={"ref":"bsa:sec_84","gloss":"...","group":"Presumptions & evidence","pos":"noun","role":"actor","aka":["notary public","notarised"]}
json.dump(d,open(pf,"w"),indent=2,ensure_ascii=False); open(pf,"a").write("\n")

# --- validate ---
raw=open(pf).read(); json.loads(raw)                      # parses
assert "\u2014" not in raw, "em-dash present"   # house rule: no em-dashes
prov={p["ref"] for p in d["provisions"]}                  # (optional) known refs
for w,v in d["terms"].items():
    assert v["ref"].split(":")[0] in json.loads(raw)["sources"], w   # alias is a source
print("ok, terms:", len(d["terms"]))
PY
```

State terms append to the `vocabulary.terms` array with the state shape; validate
the same way (`json.loads`, no em-dash, `eId` resolves in the referenced `akn`).

### 7. Verify in the app

The preview browser caches `app.js`/JSON aggressively - always confirm against a
fresh load (append a cache-bust query, e.g. `?cb=9#words`) or `curl` the served
files. Check: the card renders under the right group; the source line reads
`from <section> · <Act>`; the `aka` chips show; typing a synonym in search finds
the term; and a synonym written in prose auto-links to the canonical word.

### 8. Commit

House rule: commit messages end with the `Co-Authored-By` trailer. Push only when
asked. Keep the subject about the vocabulary change and list what was pinned to
what.

## Synonyms (`aka` / also-called names)

`aka` is an array of alternative names. One field, wired through three places:
**search** (typing a synonym finds the term), **auto-linking** (a synonym in prose
links to and hovers as the canonical term, original wording preserved), and the
**card** ("also called" row). Rules:

- **Only distinctive names.** Multi-word or clearly-legal aliases only
  ("cheque bounce", "statutory notice", "paying banker"). Never bare common words
  ("bank", "check", "draft", "settlement") - they would over-link ordinary prose.
- **Never equal to a canonical term**, and **no duplicate alias across terms** (the
  matcher's map would collide). Canonicals always win over aliases, so an alias can
  never shadow a real word - but keep them distinct anyway.
- The auto-linker skips headings/code/chips and links only the first hit per text
  node; it needs 3+ characters, so 2-letter aliases ("NI", "SC") help search only.

```bash
# collision check before committing new aliases
python3 - <<'PY'
import json
from collections import Counter
d=json.load(open('public/data/profiles/cheque-dishonour-s138.profile.json'))
k=json.load(open('public/data/state/kerala.json'))
canon={w.lower() for w in d['terms']}|{t['word'].lower() for t in k['vocabulary']['terms']}
aka=[a.lower() for v in d['terms'].values() for a in v.get('aka',[])]+[a.lower() for t in k['vocabulary']['terms'] for a in t.get('aka',[])]
print("alias==canonical:",[a for a in aka if a in canon])
print("duplicate aliases:",[a for a,c in Counter(aka).items() if c>1])
PY
```

## Checklist

- [ ] Not already present (as a word or an existing `aka`).
- [ ] Scope chosen (national vs state) for the right reason.
- [ ] Pinned to the provision that actually governs it in this case type; code-switch
      handled (current Act in `ref`, predecessor in gloss).
- [ ] Anchor resolves: `eId` exists in the AKN; national alias is a declared source.
- [ ] `group` reuses an existing heading; `pos` and `role` from the allowed sets.
- [ ] Gloss says what / why-it-matters / where-from; **no em-dashes**.
- [ ] `aka` distinctive; no alias==canonical, no duplicate alias.
- [ ] JSON parses; verified in a fresh (cache-busted) app load.
- [ ] Regenerated the agent artifacts (`python3 scripts/generate_agent_artifacts.py`) so the bundle / digest / schemas / `llms.txt` stay in sync (the Netlify build also runs it).
