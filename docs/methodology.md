# Methodology — how the corpus is built

This is the working "how-to" behind the DRISTI domain model: the conventions,
the Akoma Ntoso shapes, and the conversion pipelines. It's meant to be enough
for a person (or an AI agent) to reproduce or extend the corpus. For *what* the
model is, see the top-level `README.md`; this doc is the *how*.

## 1. Naming conventions

- **Everything is a canonical, lowercase, hyphenated slug.**
- **Acts:** `<canonical-act-slug>.akn.xml` (e.g. `negotiable-instruments-act-1881.akn.xml`,
  `constitution-of-india.akn.xml`). The source PDF is the same slug + `.pdf`.
- **Judgments:** `<appellant>-v-<respondent>-<year>.akn.xml`
  (e.g. `rangappa-v-sri-mohan-2010.akn.xml`). The source PDF is the same slug + `.pdf`.
- **Dataset case id:** a short form used inside `*.caselaw.json` and as `construes` targets,
  e.g. `rangappa-2010`. The `IDMAP` at the top of `scripts/convert_judgments.py` maps each
  PDF slug to its dataset id (this is where year-collisions are resolved by hand).
- **Provision ref (in the profile / case law):** `<alias>:<eId>`, e.g. `ni:sec_139`, `const:art_21`.

## 2. Folder layout (standardised)

```
public/data/
├── acts/
│   ├── akn/        <act> XML — canonical statutory text
│   └── sources/    the Act PDFs the AKN was converted from
├── caselaw/
│   ├── cheque-dishonour-s138.caselaw.json   the dataset
│   ├── akn/        <judgment> XML
│   └── sources/    the judgment PDFs
└── profiles/       per-case-type relevance profiles (the manifest/index)
```

`acts/` and `caselaw/` share the same `akn/` + `sources/` shape: every `.akn.xml`
has its source PDF one folder over. The app only ever reads `public/data/`.

## 3. Akoma Ntoso shapes

**Standard:** OASIS / LegalDocML **Akoma Ntoso 3.0**. Namespace
`http://docs.oasis-open.org/legaldocml/ns/akn/3.0`.

**Acts** use `<akomaNtoso><act>` with a `<meta>` FRBR block, `<preface>`, and a
`<body>` of `<section eId="sec_138">` (statutes) or `<article eId="art_21">`
(the Constitution), each `<num>` + optional `<heading>` + `<content>`. Clause
lists are `<blockList><item>…`; nested lists go **inside** the parent `<item>`
(a `<blockList>` may not directly contain another `<blockList>`).

**Judgments** use `<akomaNtoso><judgment name="judgment">` — a *different*
document type — with:

- `<meta>` — FRBR identity `/akn/in/judgment/<year>/<case-id>`, case name, decided
  date, `#sc-india` as author, neutral citation as `FRBRnumber`, and a
  `<proprietary>` block of PUCAR fields (`caseId`, `status`, `benchSize`, `reportable`).
- `<header>` — the caption: court, docket number, parties, neutral + reporter citations,
  date, author judge, bench.
- `<judgmentBody>` — the opinion, as a sequence of `<introduction>` / `<motivation>` /
  `<decision>` (the schema's choice list), each holding `<paragraph>` (`<num>` +
  `<content><p>`).

**Validation** (both types), using the AKN 3.0 XSD from
[laws-africa/cobalt](https://github.com/laws-africa/cobalt/tree/master/cobalt/xsd):

```bash
xmllint --noout --schema akn.xsd public/data/**/akn/*.akn.xml
```

## 4. Judgment conversion (`scripts/convert_judgments.py`)

Run: `python3 scripts/convert_judgments.py` (needs `pip install pdfplumber`).
It reads every PDF named in `IDMAP` from `caselaw/sources/`, writes AKN to
`caselaw/akn/`, and updates the dataset JSON in place.

Pipeline per judgment:

1. **Extract** text with `pdfplumber`; **strip** Indian Kanoon footers, running
   headers, and stray page numbers.
2. **Classify** — is this actually the Supreme Court judgment it claims to be?
   A genuine SC judgment has an `IN THE SUPREME COURT OF INDIA` caption, an SCR
   report citation (`[YYYY] N SCR`), or the old Indian Kanoon SC template. If it
   fails (e.g. a Magistrate order or High Court judgment that merely *cites* the
   case), no AKN is written and the case is marked `source_status: "wrong-document"`.
3. **Extract metadata** by pattern — neutral citation (`YYYY INSC N`, tolerating
   the spaceless `YYYYINSCN` form; present only for 2023+), decided date, author,
   bench, docket number, reportable flag.
4. **Find the opinion boundary** across templates — modern `JUDGMENT` / `ORDER`
   markers, the older `JUDGMENT:` / `PETITIONER:`–`RESPONDENT:` layout, the SCR
   "The Judgment of the Court was delivered by…", and the official-copy
   "`<Judge Name>, J.`" signature line.
5. **Reconstruct paragraph numbering** with a gap-tolerant sequencer that follows
   the real `1, 2, 3 …` run and ignores stray inline numbers (quoted paragraph
   numbers, years, sums). Older unnumbered judgments are **reflowed** into
   paragraphs on sentence-closing short lines.
6. **Segment** into introduction / motivation / decision (the operative order is
   detected from closing phrases like "the appeal is allowed / dismissed / disposed of").

**Adding a judgment:** drop the PDF into `caselaw/sources/` using the naming
convention, add a `cases[]` entry to the dataset (with `construes`), add the
`slug → id` line to `IDMAP`, and re-run the script.

**Source formats handled:** Indian Kanoon text export, the official Supreme
Court PDF copy, and the SCR reporter format.

**Caveat:** the introduction/motivation/decision split is heuristic and the
paragraph text follows the reported version, not the certified record. Verify
against the official judgment before relying on exact wording.

## 5. Constitution conversion (`scripts/convert_constitution.py`)

A one-off provenance pipeline (the Constitution's first AKN was garbled). It
separates the PDF's text streams by **font size** — body ~10pt, marginal
side-notes ~8pt (which become article headings), Part/Chapter heads ≥11pt — and
handles amendment-inserted articles (21A), repealed-article gaps (379–391 don't
exist), and line-boundary clause parsing. Produces 456 articles that validate
against the XSD. Best-effort; verify against the official source.

## 6. The relevance profile & dataset

- **Profile** (`profiles/<case-type>.profile.json`) is the manifest the app loads
  first. `sources` maps each alias to its Act AKN (`acts/akn/…`); `provisions`
  pins the relevant sections with `tier` / `role` / `applies`; `act_alias_map`
  encodes the 2024 old→new code switch; `caselaw` points at the dataset.
- **Dataset** (`caselaw/<case-type>.caselaw.json`) holds the case law: each case's
  `holding`, `topics`, `construes` refs, `status`, and — filled in by the
  converter — `akn`, `source_pdf`, `decided`, `neutral_citation`, `source_status`.
  The `corpus` block summarises counts and any `needs_recollection` ids.

All paths inside the profile and dataset are **relative to `public/data/`**.
