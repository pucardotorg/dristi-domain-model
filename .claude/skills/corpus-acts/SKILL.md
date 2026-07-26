---
name: corpus-acts
description: Bring a missing law into the DRISTI corpus end to end. Use when a referenced Act, rule set, or judgment is not yet in the corpus, or when asked to "find/download/process/convert" a law, "add an act", or "what's cited but missing". Covers finding what is missing, downloading the official source, OCR if it is a scan, identifying the document type, converting to Akoma Ntoso, placing and naming the files, validating, wiring it into the profile so it shows in the app, and committing.
---

# Adding a law to the corpus

The corpus is Akoma Ntoso (AKN) XML under `public/data/`. Each source law is one
`.akn.xml` plus the PDF it was converted from. This skill takes a law from "cited
but missing" to "converted, integrated, validated, pushed".

Naming is fixed (see `docs/methodology.md`): every file is a **canonical,
lowercase, hyphenated slug** (`notaries-act-1952`), the source PDF is the same
slug + `.pdf`, and the AKN is the same slug + `.akn.xml`.

```
public/data/
  acts/akn/<slug>.akn.xml          national statute text (AKN)
  acts/sources/<slug>.pdf          the PDF it came from
  state/<state>/akn/<slug>.akn.xml state instrument (AKN)
  state/<state>/sources/<slug>.pdf
  caselaw/akn/<slug>.akn.xml        judgment (AKN)
  caselaw/sources/<slug>.pdf
```

## Step 1 - Find what is actually missing

Diff the Acts referenced in the data against the AKN files present. Do not trust a
name match alone; the corpus is broader than it looks (CPC, Commercial Courts,
Court Fees, Mediation, six Kerala instruments, etc.).

```bash
# every "X Act, YYYY" mentioned in the profile + state data
python3 - <<'PY'
import json,re
blob="".join(open(f).read() for f in
  ["public/data/profiles/cheque-dishonour-s138.profile.json","public/data/state/kerala.json"])
for m in sorted(set(re.findall(r'([A-Z][A-Za-z&\'\- ]+?(?:Act|Sanhita|Adhiniyam|Code|Rules)),?\s*(\d{4})', blob))):
    print(m[0].strip(), m[1])
PY
# what AKN files already exist
ls public/data/acts/akn public/data/state/*/akn | sed 's/.akn.xml//'
```

A reference is only worth adding if the law genuinely operates in this case type.
Omnibus taxing statutes cited only for a fee-slab change (e.g. a state Finance
Act) are **not** worth a full conversion - note them and move on.

## Step 2 - Get the official source PDF

Prefer the **India Code** consolidated text (`indiacode.nic.in`). The site is JS
-rendered and its REST API and WebFetch are blocked, so use `WebSearch` to find
the bitstream URL, then `curl` it.

```bash
# find the URL (look for a /bitstream/.../A<year>-<no>.pdf or /<year><no>.pdf)
# WebSearch: "<Act name> <year> indiacode.nic.in bitstream PDF"
curl -sS -L -m 60 -A "Mozilla/5.0" -o public/data/acts/sources/<slug>.pdf "<URL>" \
     -w "HTTP:%{http_code} size:%{size_download} type:%{content_type}\n"
file public/data/acts/sources/<slug>.pdf            # must say "PDF document, N pages"
```

- Choose the **bare consolidated Act**, not a compilation. If a candidate is
  100+ pages for a short Act, it bundles state rules/amendments - find the clean
  `A<year>-<no>.pdf` / `<year><no>.pdf` version (usually ~1 page per 2-3 sections).
- A `302`/HTML response means a wrong bitstream id - search again.
- Official fallbacks: `lawmin.gov.in`, `legislative.gov.in`, `cdnbbsr.s3waas.gov.in`.

## Step 3 - OCR only if it is a scan

Check extracted text density. A digital-text PDF needs no OCR.

```bash
pages=$(pdfinfo public/data/acts/sources/<slug>.pdf 2>/dev/null | awk '/Pages/{print $2}')
chars=$(pdftotext public/data/acts/sources/<slug>.pdf - | wc -c)
echo "chars/page = $((chars / pages))"     # >800 fine; <150 => scanned, OCR it
```

If it is a scan (near-zero text), rasterise and OCR (no `ocrmypdf` here; use
`pdftoppm` + `tesseract`, both installed):

```bash
d=$(mktemp -d); pdftoppm -r 300 -png public/data/acts/sources/<slug>.pdf "$d/pg"
for f in "$d"/pg-*.png; do tesseract "$f" - --psm 6 -l eng; printf '\f'; done > "$d/text.txt"
# then convert from $d/text.txt (adapt the converter to read a text file input)
```

## Step 4 - Identify the document type, pick the AKN standard

AKN 3.0, namespace `http://docs.oasis-open.org/legaldocml/ns/akn/3.0`. The root
element and converter depend on what the document *is*:

| Document | AKN root | Converter |
|---|---|---|
| Central Act (India Code A-format) | `<act>` | **`scripts/convert_indiacode_act.py`** |
| State Act / Rules / Regulations | `<act>` | `scripts/convert_rules.py` (adapt) |
| The Constitution | `<act>` (articles as `<article>`/`<section>`) | `scripts/convert_constitution.py` |
| Court judgment | `<judgment>` | `scripts/convert_judgments.py` |

Common shape for statutes: `<act><meta>(FRBRWork/Expression/Manifestation,
references, notes)</meta><preface><longTitle/></preface><body> [<chapter>] <section
eId="sec_N"><num/><heading/><content><p/> and/or <blockList><item><num/><p/> …>`.
Sections are addressed by `eId` (`sec_143`, `art_141`, `rule_50`) - the app finds
them with a global `[eId="…"]` lookup, so chapter nesting is optional but preferred
where the Act has chapters.

**Schedules with Orders/Rules (e.g. the CPC First Schedule).** The India Code
converter does not recognise a First Schedule and sweeps the whole thing into the
*last* section as one giant blob (the CPC had all 51 Orders inside `sec_158`). Fix
it: strip the blob out of that section (restore the section to its own text), then
structure the schedule as `<part><num>THE FIRST SCHEDULE</num>` → one `<chapter>`
per Order (`<num>ORDER VI</num><heading>Pleadings generally</heading>`) → one
`<section eId="ord_<n>_r_<m>">` per Rule. `actBlocks` renders part/chapter as
separators and each rule as an addressable, openable row. Parse Orders by walking
the monotonic roman sequence I..whatever (so cross-references like "in Order XXI"
are skipped), split rules on `(\[?\d+[A-Z]?)\.\s+(heading up to the em-dash)—`, and
**validate character-conservation** (sum of rule texts ≈ blob length) before
writing - a 100% match means nothing was dropped or mis-grouped. Then the app's
`secNum()` needs to know the eId shape: `ord_6_r_1` -> "Order VI r.1" (a roman
helper), else the source line shows the raw "ord 6 r 1".

## Step 5 - Convert

For an India Code central Act, the general converter auto-detects title, number,
year, date and long title, splits chapters/sections/sub-clauses, and strips the
arrangement-of-sections table, page furniture and footnote apparatus:

```bash
python3 scripts/convert_indiacode_act.py <slug>
# pass flags only if auto-detect misses one (title wrapped across lines etc.):
python3 scripts/convert_indiacode_act.py <slug> --title "X Act, YYYY" --number N --year Y --date YYYY-MM-DD
```

It writes `public/data/acts/akn/<slug>.akn.xml`. For a state instrument, write to
`public/data/state/<state>/akn/` instead. If the source is not India Code A-format,
adapt the nearest converter rather than hand-writing XML.

## Step 6 - Validate

```bash
xmllint --noout public/data/acts/akn/<slug>.akn.xml && echo well-formed   # 1. XML valid
grep -c '<section eId' public/data/acts/akn/<slug>.akn.xml                 # 2. count vs the TOC
# 3. spot-check the sections you will actually cite - read heading + body,
#    confirm no OCR noise, dropped clauses, or a footnote merged into the text
```

**Leave the statutory text verbatim.** The AKN is the bare Act - keep its
em-dashes, smart punctuation and archaic spelling exactly as enacted. Do NOT
"correct" em-dashes here: the no-em-dash house rule applies only to app-authored
copy (vocabulary glosses, provision `note`s, UI strings), never to original text.
So there is deliberately no em-dash check on the AKN. (The converter reflects
this - `clean()` strips the India Code footnote/OCR apparatus but leaves dashes
intact.)

Repealed/spent sections with no operative text may be dropped; note it. If a count
is well short of the TOC, the section regex missed a format variant - fix the
converter, do not paper over it by hand.

## Step 7 - Wire it into the app

An AKN file on disk is invisible until the profile points at it. Two edits in
`public/data/profiles/<case-type>.profile.json`:

1. **`sources`** - register the Act (its `<alias>` is the key vocab/provision refs use):
   ```json
   "notaries": {"uri":"/akn/in/act/1952/53","title":"Notaries Act, 1952",
                "domain":"authentication","status":"in force","file":"acts/akn/notaries-act-1952.akn.xml"}
   ```
2. **`provisions`** - one entry per relevant section (also required for the Act to
   appear at all: the Acts & provisions tree filters to acts that have a matching
   provision):
   ```json
   {"ref":"notaries:sec_8","act":"notaries","eId":"sec_8","file":"notaries-act-1952.akn.xml",
    "tier":"supporting","role":"functions of a notary","applies":"always","note":"…why it matters to this case…"}
   ```
   `tier` in {operative, definition, supporting, procedure, evidence, notice,
   limitation, sentencing, constitutional}.

   **Do a provision-by-provision relevance pass - do not stop at the two or three
   obvious sections.** Enumerate every section of the new Act and decide, for each,
   whether it bears on this case type; pin the relevant ones with a `tier` and a
   one-line `note` naming the connection. A section is usually *not* relevant if it
   is housekeeping (short title, extent, savings, repeal), pure institutional
   machinery (constituting bodies, funds, registers, rule-making), or discipline of
   the profession itself. It usually *is* relevant if it defines a term the case
   uses, empowers or binds an actor in the case, governs evidence or procedure the
   case runs on, or creates a right/relief a party can invoke.

   ```bash
   # enumerate every section, mark which are already pinned - work down the list
   python3 - <<'PY'
   import json,re
   d=json.load(open('public/data/profiles/cheque-dishonour-s138.profile.json'))
   pinned={p['ref'] for p in d['provisions']}
   alias,f="notaries","notaries-act-1952.akn.xml"
   for m in re.finditer(r'<section eId="(sec_[0-9A-Za-z]+)">\s*<num>([^<]*)</num>\s*<heading>([^<]*)</heading>',
                        open("public/data/acts/akn/"+f).read()):
       eid,num,head=m.groups()
       print(("PINNED " if f"{alias}:{eid}" in pinned else "       ")+f"{num:6s} {head.strip()}")
   PY
   ```

   Read the body of any borderline section before deciding - a heading undersells
   it (e.g. Oaths s.7 "irregularity does not invalidate" forecloses a technical
   attack on a s.138 deponent). **Record considered exclusions**, so the review is
   auditable: note *why* whole blocks are left out (e.g. the Permanent Lok Adalat
   sections are excluded because a private cheque dispute is not a "public utility
   service", so a s.138 matter never goes there). State a non-obvious exclusion in
   the commit message.

If the Act introduces a new `domain`, add its label in
`public/data/config/app.config.json` under `domain_labels`
(`{"label":"…","blurb":"…"}`) so the law view has a heading for it.

Then anchor any vocabulary terms to the now-available sections - that is the
**`vocabulary`** skill; re-point a term's `ref` from a stand-in to the real Act
(e.g. notary: `bsa:sec_84` -> `notaries:sec_8`).

## Step 8 - Verify in the app, then commit

Serve `public/` and confirm on a cache-busted load (`?cb=N`): the Act appears in
the law tree, and `sectionByRef('<alias>:<eId>')` returns `{num, heading, body}`
for the sections you added. Then commit the AKN + PDF + profile edits together;
the commit message ends with the `Co-Authored-By` trailer. Push only when asked.

## Checklist

- [ ] Confirmed missing (not already in `acts/akn` or `state/*/akn` under any name).
- [ ] Worth adding (operates in this case type; not an omnibus fee amendment).
- [ ] Official source, bare consolidated version, saved as `<slug>.pdf` in the right `sources/`.
- [ ] OCR done only if scanned; text density checked.
- [ ] Document type identified; correct AKN root + converter used.
- [ ] `xmllint` clean; section count matches TOC; content spot-checked. AKN keeps
      verbatim em-dashes - do NOT strip them; only app-authored `note`s/glosses avoid them.
- [ ] `sources` added; **provision-by-provision relevance pass done** (every section
      judged, relevant ones pinned with tier + note, considered exclusions recorded)
      - not just the obvious two or three; new `domain` labelled if needed.
- [ ] Verified in the app (law tree + `sectionByRef`); PDF and AKN both committed.
