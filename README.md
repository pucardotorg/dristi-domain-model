# DRISTI 2.0 - Domain Model

> A browsable, data-driven reference of the legal domain that a single court **case type** is built on.
> First (and currently only) modelled case type: **Cheque bounce - Section 138 of the Negotiable Instruments Act, 1881**.

DRISTI 2.0 is [PUCAR](https://pucar.org/)'s (Pukar) lightweight, modular **court-technology platform**. This repository is the **domain model** for it: the legal substrate - the Acts, provisions, vocabulary, constitutional layer, Supreme Court case law, and the 2024 code transition - that a case type sits on top of.

The deliverable is a **single-file static viewer** (`index.html`) that reads a corpus of legal source files **at runtime** (nothing is hard-coded/baked into the HTML) and lets you navigate that domain.

---

## Table of contents

1. [What this is (and isn't)](#1-what-this-is-and-isnt)
2. [Quick start](#2-quick-start)
3. [Core concepts](#3-core-concepts)
   - [Case type](#31-case-type)
   - [The three lenses: WHAT / WHERE / WHEN](#32-the-three-lenses-what--where--when)
   - [Shared core vs state layer](#33-shared-core-vs-state-layer)
   - [Point-in-time and the 2024 code switch](#34-point-in-time-and-the-2024-code-switch)
   - [Akoma Ntoso (AKN)](#35-akoma-ntoso-akn)
   - [The relevance profile](#36-the-relevance-profile)
   - [The case-law dataset](#37-the-case-law-dataset)
4. [Folder structure](#4-folder-structure)
5. [Naming conventions](#5-naming-conventions)
6. [The Acts in the corpus](#6-the-acts-in-the-corpus)
7. [The viewer app](#7-the-viewer-app)
   - [Architecture](#71-architecture)
   - [Views](#72-views)
   - [Design system](#73-design-system)
8. [Engineering notes](#8-engineering-notes)
   - [The Constitution conversion](#81-the-constitution-conversion)
   - [The judgment conversion](#82-the-judgment-conversion-engineering-note)
   - [The rules / State-Act conversion](#83-the-rules--state-act-conversion-engineering-note)
9. [Data model reference](#9-data-model-reference)
   - [Profile JSON](#91-profile-json)
   - [Case-law JSON](#92-case-law-json)
   - [Enumerations](#93-enumerations)
10. [What lives outside the corpus](#10-what-lives-outside-the-corpus)
11. [How to extend](#11-how-to-extend)
12. [Provenance & caveats](#12-provenance--caveats)
13. [Glossary](#13-glossary)
14. [Deployment](#14-deployment)

---

## 1. What this is (and isn't)

**It is:**
- A **reference model** of the *shared core* legal domain behind one court case type.
- A **data-driven** artifact: the legal content lives in files under `public/data/`, and the viewer reads them live.
- A **navigation tool** for humans (lawyers, product, engineers) and a **structured corpus** for AI agents.

**It is not:**
- A case-management or filing system. It stores no case data.
- A legal-advice engine. It surfaces statute and precedent; it does not opine.
- A complete picture of any one state's practice. The **state layer** (High Court rules, e-filing, practice directions, local practice) is deliberately *not* in the corpus - it is configured per state.

The one modelled case type - **s.138 cheque dishonour** - is roughly **15%** of a typical Indian court's caseload, which is why it was chosen first. The platform is designed to host many case types; the app already has a case-type dropdown even though only one is populated today.

---

## 2. Quick start

The viewer uses `fetch()` to load its data at runtime. Browsers **block `fetch()` on `file://`**, so you must serve the folder over HTTP:

```bash
cd dristi-domain-model/public
python3 -m http.server 8000
# then open http://localhost:8000/
```

The deployable site is the **`public/`** folder (`index.html` + `data/`); serve from there.
Opening `index.html` directly from disk (`file://`) shows a friendly **"serve over http"** page instead of the app - this is expected, not a bug.

No build step, no dependencies, no package manager. It is a single static HTML file plus a folder of data. See [§14 Deployment](#14-deployment) for hosting.

---

## 3. Core concepts

### 3.1 Case type

A **case type** is a kind of court case - e.g. *cheque bounce*, *cheque bounce* being a criminal complaint under s.138 of the Negotiable Instruments Act. The platform is architected to host **many** case types; each is modelled by its own **relevance profile** (see §3.6). The app exposes a **case-type dropdown** at the top. Today it contains exactly one entry: **Cheque bounce · §138**.

Adding a case type does not require touching the app - it means authoring a new profile (and, if the new type needs statutes not already present, new AKN Act files). See [How to extend](#11-how-to-extend).

### 3.2 The three lenses: WHAT / WHERE / WHEN

Every provision in the model is read through three lenses:

| Lens | Question | What it captures |
|------|----------|------------------|
| **WHAT** | What is the rule? | The verbatim statutory text of the provision and its operative role. |
| **WHERE** | Where does it apply? | Whether it is **shared core** (identical across India) or **state layer** (configured per state). |
| **WHEN** | When is it live? | Point-in-time applicability - which set of codes governs, given when the cause of action arose. |

These three lenses are the organising idea of the whole model and are surfaced directly in the app's **The structure** view (rules / systems / context / time).

### 3.3 Shared core vs state layer

Indian **central law is identical across the whole country** - the same Negotiable Instruments Act, the same BNSS, the same Constitution. That body of identical central law is the **shared core**, and it is what this domain model captures.

On top of the shared core, **each state layers its own:**
- High Court rules
- e-filing rules
- practice directions
- local practice / conventions
- filer mix (who typically files)
- court language

That **state layer is separate from the uniform central core.** It is configured per state, so a state can adopt the shared core wholesale and only supply its own layer.

It lives under **`public/data/state/<state>/`** and the viewer reads it through the **State objects** pages (The story, Acts & Provisions, State rules, Notifications & orders). **Kerala** is the first state modelled.

**The story.** Each state also has a **Story** view - *"How a §138 case runs"* - a cited, end-to-end narrative built from a `story` block in `<state>.json`. It has four sections: **Process** (filing → cognizance → service → warrants → summary trial → judgment → compounding → appeal/revision), where every step carries citations that open the exact provision (national refs like `ni:sec_142` open the Act modal; state refs like `crp`/`rule_14` open the Kerala instrument); **Fees** (the Article 21 schedule); **Courts** (the rules-designated §138 court - the Kollam ON Court - plus a note that ordinary JFCM courts hear §138 elsewhere); and a **Caseload** placeholder table (pending/disposed per court, no data yet). The process is deliberately the *de jure*, rules-based flow; where Kerala adds nothing, the step is marked "uniform central law". Other states show a "story not modelled yet" placeholder.
 For a s.138 case this overlay is *procedural*, not substantive: there is no state amendment to s.138 itself, so Kerala's **Acts & Provisions** page carries the State Acts that bear on a cheque case - the **Kerala Police Act** (warrant execution) and the **Court Fees Act** (the Article 21 fee schedule for a §138 complaint/appeal/revision) - its **State rules** page carries the **rules of practice, High Court rules and e-filing rules**, and its **Notifications & orders** page carries the **G.O. establishing the Kollam 24×7 ON Court** (the dedicated §138 special court) and the **DCMS e-filing SOP**. Each Act/rule/order is analysed at section level with `made_under` links to its enabling law and `edges` to the national provisions it operationalises - the same section-level treatment the national objects get. The Kerala instruments are converted to Akoma Ntoso the same way the central Acts are (see [§8.3](#83-the-rules--state-act-conversion-engineering-note)), and a plain-language write-up lives at [`public/data/state/kerala/kerala-s138-state-layer.md`](public/data/state/kerala/kerala-s138-state-layer.md). Other states show a "not modelled yet" placeholder until their manifest is added.

### 3.4 Point-in-time and the 2024 code switch

On **1 July 2024**, India replaced three colonial-era codes with three 2023 Sanhitas:

| Domain | Old code (repealed 2024-07-01) | New Sanhita (in force 2024-07-01) |
|--------|--------------------------------|-----------------------------------|
| Procedure | Code of Criminal Procedure, 1973 (CrPC) | Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) |
| Penal | Indian Penal Code, 1860 (IPC) | Bharatiya Nyaya Sanhita, 2023 (BNS) |
| Evidence | Indian Evidence Act, 1872 (IEA) | Bharatiya Sakshya Adhiniyam, 2023 (BSA) |

**Which set is live for a given case depends on when the cause of action arose**, not on today's date. A cheque dishonoured before the switch is generally governed by the old codes; one after by the new. The model is therefore **point-in-time aware**: it keeps both the old and new provisions in the corpus, marks each with an `applies` window, and maps **old → new topic by topic** via `act_alias_map` in the profile. The app has a dedicated **The 2024 code switch** view built on this mapping.

### 3.5 Akoma Ntoso (AKN)

**Akoma Ntoso** (AKN) is the international XML standard for legislation - **OASIS / LegalDocML, v3.0**. Every Act in the corpus is stored as an `.akn.xml` file, which is the canonical legal text the app renders.

Structural shape (simplified):

```xml
<!-- Statutes use <section>; the Constitution uses <article> -->
<section eId="sec_138">
  <num>138.</num>
  <heading>Dishonour of cheque for insufficiency, etc., of funds in the account</heading>
  <content>
    <p>Where any cheque drawn by a person on an account maintained by him ...</p>
    <blockList>
      <item><p>(a) the cheque has been presented to the bank ...</p></item>
      <item><p>(b) the payee ... makes a demand ...</p></item>
    </blockList>
  </content>
</section>
```

- Statute sections: `<section eId="sec_138">`
- Constitution articles: `<article eId="art_21">`
- Each carries `<num>`, `<heading>`, and `<content>` with `<p>` and nested `<blockList><item>` for clauses.

The `eId` (element ID) is the stable within-document anchor the model references (see [ref format](#36-the-relevance-profile)).

### 3.6 The relevance profile

`cheque-dishonour-s138.profile.json` is the **cross-act index** and the **entry point / manifest** for the case type.

Crucially, **it does not copy statutory text.** It **points into** the AKN files. It declares, via relative paths under `public/data/`, where the Acts and the case-law file live, and it lists:

- `sources` - the Acts, each with alias, title, domain, status, file, era.
- `provisions` - each with a `ref` (`<alias>:<eId>`), tier, role, applies-window, note.
- `terms` - vocabulary word → provision ref (the defining section).
- `edges` - relationships between provisions.
- `act_alias_map` - the old → new 2024 switch, topic by topic.
- `link_integrity` and `caveats` - self-check metadata and disclaimers.

The **ref format is `'<alias>:<eId>'`** - e.g. `ni:sec_138`, `constitution:art_21`.

### 3.7 The case-law dataset

`cheque-dishonour-s138.caselaw.json` holds **Supreme Court precedent**. Each case links to the provisions it **`construes`** (interprets) - e.g. *Rangappa v. Sri Mohan* → `ni:sec_139`. This linkage is what lets the app show, **on each provision**, the judgments that interpret it, and power a dedicated **Case law** view.

Each case now also carries the **judgment itself as Akoma Ntoso** - the same standard as the Acts. The full text of all **43 Supreme Court judgments** lives under `public/data/caselaw/akn/` as `<judgment>` XML, converted from the source PDFs in `public/data/caselaw/sources/`. The dataset points at both (`akn`, `source_pdf`), so the viewer can open and render the judgment paragraph-by-paragraph, and each case shows its **neutral citation** and **decided date** where known. See [§8.2](#82-the-judgment-conversion-engineering-note) for how the conversion works.

Case law is the one part of the model that used to live entirely *outside* the corpus and is now **modelled the same way as legislation** - dataset + AKN.

---

## 4. Folder structure

This is the **canonical, cleaned-up layout**. The deployable site lives under `public/`; everything else is repo meta (docs, scripts, research).

```
dristi-domain-model/
├── public/               # THE DEPLOYABLE SITE (Netlify publish dir)
│   ├── index.html        #   the single-file viewer app (reads data/ at runtime)
│   └── data/             #   everything the viewer reads
│       ├── acts/         #   statutes (the shared core)
│       │   ├── akn/      #     19 Acts as Akoma Ntoso <act> XML (*.akn.xml)
│       │   └── sources/  #     19 original Act PDFs the AKN was converted from
│       ├── caselaw/      #   Supreme Court precedent
│       │   ├── cheque-dishonour-s138.caselaw.json   # the dataset
│       │   ├── akn/      #     43 judgments as Akoma Ntoso <judgment> XML (*.akn.xml)
│       │   └── sources/  #     43 original judgment PDFs the AKN was converted from
│       ├── profiles/     #   per-case-type relevance profiles (*.profile.json), the manifest
│       └── state/        #   per-state overlay, read by the State objects pages
│           ├── kerala.json               # Kerala manifest (amendments / rules / notifications)
│           └── kerala/
│               ├── kerala-s138-state-layer.md   # the Kerala write-up
│               ├── akn/     #     Kerala Acts / rules / orders as Akoma Ntoso <act> XML
│               └── sources/ #     original Kerala Act/rule/order PDFs (+ clean-text extract)
├── scripts/              # conversion pipeline (PDF -> Akoma Ntoso)
│   ├── convert_judgments.py     # SC judgments → <judgment>
│   ├── convert_constitution.py  # Constitution PDF → <act>
│   └── convert_rules.py         # state rules / State Acts → <act>
├── docs/
│   └── methodology.md    # conventions, AKN shapes, how the pipelines work
├── context/              # project research: meeting notes/recording - GITIGNORED, not deployed
├── README.md             # this file
├── netlify.toml          # Netlify config (publish = public/, no build)
└── .gitignore            # ignores context/, _to_delete/, OS cruft
```

- **`public/data/` is the only directory the app reads.** Serve the site from `public/`.
- `context/` is human research and is **gitignored** - it is never committed or deployed.
- **`acts/`, `caselaw/` and each `state/<state>/` share the same standardised shape:** an `akn/` folder holding the Akoma Ntoso XML and a `sources/` folder holding the original PDFs. Acts and rules use `<act>`; judgments use `<judgment>`.
- Every `.akn.xml` therefore has its source PDF one folder over (`…/akn/x.akn.xml` to `…/sources/x.pdf`), kept for provenance and re-conversion.
- **`public/data/state/` is the per-state overlay** (see [§3.3](#33-shared-core-vs-state-layer)): a `<state>.json` manifest per state plus the state's own AKN + source PDFs. The viewer reads it through the **State objects** pages; **Kerala** is modelled, other states show a placeholder.
- The conversion pipeline lives in `scripts/`; its methodology is documented in [`docs/methodology.md`](docs/methodology.md).

---

## 5. Naming conventions

Data files are named:

```
<case-type-slug>.<kind>.json
```

Examples:

| File | Meaning |
|------|---------|
| `cheque-dishonour-s138.profile.json` | The relevance profile (manifest) for the s.138 case type. |
| `cheque-dishonour-s138.caselaw.json` | The Supreme Court case-law dataset for the s.138 case type. |

Acts keep their **canonical slug + `.akn.xml`**:

```
negotiable-instruments-act-1881.akn.xml
constitution-of-india.akn.xml
```

**The profile is the entry point / manifest.** It declares - via relative paths under `public/data/` - where the Acts (`sources[*].file`) and the case-law file (`caselaw`) live. To load a case type, the app loads its profile first and follows those paths.

---

## 6. The Acts in the corpus

Fourteen Acts are modelled. Grouped by domain and shown with alias / title / status:

| Alias | Title | Domain | Status |
|-------|-------|--------|--------|
| `ni` | Negotiable Instruments Act, 1881 | substantive | in force |
| `bnss` | Bharatiya Nagarik Suraksha Sanhita, 2023 | procedure | in force from 2024-07-01 (replaces `crpc`) |
| `crpc` | Code of Criminal Procedure, 1973 | procedure | repealed 2024-07-01 |
| `bns` | Bharatiya Nyaya Sanhita, 2023 | penal | in force from 2024-07-01 (replaces `ipc`) |
| `ipc` | Indian Penal Code, 1860 | penal | repealed 2024-07-01 |
| `bsa` | Bharatiya Sakshya Adhiniyam, 2023 | evidence | in force from 2024-07-01 (replaces `iea`) |
| `iea` | Indian Evidence Act, 1872 | evidence | repealed 2024-07-01 |
| `bbea` | Bankers' Books Evidence Act, 1891 | evidence | in force |
| `genclauses` | General Clauses Act, 1897 | interpretation | in force |
| `limitation` | Limitation Act, 1963 | limitation | in force |
| `probation` | Probation of Offenders Act, 1958 | sentencing | in force |
| `itact` | Information Technology Act, 2000 | electronic | in force |
| `pss` | Payment and Settlement Systems Act, 2007 | banking | in force |
| `constitution` | Constitution of India | constitutional | in force |

Notes:
- The three old/new pairs (`crpc`/`bnss`, `ipc`/`bns`, `iea`/`bsa`) are both present so the model can serve either side of the [2024 switch](#34-point-in-time-and-the-2024-code-switch).
- Domains are the grouping the **Acts** view uses.

---

## 7. The viewer app

### 7.1 Architecture

- A **single self-contained `index.html`**. No framework, no build, no external JS/CSS at runtime beyond the file itself.
- It is a **dynamic viewer**. On load it `fetch()`es the **profile JSON**, then **lazily, on demand**, fetches the **AKN XML** files, parsing them **in-browser with `DOMParser`**.
- **Nothing legal is embedded in the HTML.** All statute text, provisions, vocabulary, and case law come from `public/data/` at runtime.
- Because of the `fetch()` + `file://` restriction, it must be **served over HTTP** (see [Quick start](#2-quick-start)). Opened directly, it renders a friendly "serve over http" fallback page.

Load sequence:

```
1. Load index.html over http
2. Read selected case type from the dropdown
3. fetch() the profile JSON for that case type
4. Render Overview / Acts / Provisions / etc. from the profile
5. On demand, fetch() + DOMParser each AKN Act file to show verbatim text
6. On demand, fetch() the caselaw JSON to show precedent
```

### 7.2 Views

**Case-type dropdown** at the top selects the active profile (only *Cheque bounce · §138* today).

Scoped views (about the selected case type):

| View | What it shows |
|------|---------------|
| **Overview** | Summary of the case type and the model. |
| **Acts** | The 14 Acts grouped by domain. Click an Act to see the provisions it contributes, and open the **whole Act** in a modal. |
| **Provisions** | Every provision, with **verbatim text pulled from the AKN**. Filter by domain / role / era. Each provision also lists the **Supreme Court cases that construe it**. |
| **Vocabulary** | Terms pinned to their **defining sections**. |

| **Case law** | The Supreme Court precedent, filterable by topic. Each case shows its **neutral citation** and **decided date** where known, links to the provisions it **construes**, and - for the 43 with an AKN judgment - a **Read judgment** button (see below). |

Cross-cutting views (about the domain as a whole) - grouped **under Overview** in the sidebar:

| View | What it shows |
|------|---------------|
| **The structure** | The rules / systems / context / time diagram (the three-lens framing). |
| **Shared vs State** | The [shared core vs state layer](#33-shared-core-vs-state-layer) split. |
| **The 2024 code switch** | The old → new mapping from `act_alias_map`. |

**Full-Act modal:** renders any complete Act and **jumps to the section you came from**.

**Judgment reader:** the **Read judgment** button on a case opens the full **Akoma Ntoso judgment** in the same modal, rendered from `caselaw/akn/` - caption (court, docket, bench, citations, date) plus the opinion split into **Introduction / Reasoning / Decision** with numbered paragraphs. Like the Acts, the judgment text is fetched and parsed in-browser, nothing is embedded.

**Statutory annotations** - *Explanation*, *Proviso*, *Illustration* - are detected and **styled distinctly** from enacting text so readers can tell interpretive scaffolding from the operative rule.

### 7.3 Design system

The app mirrors the **pucar-ui design system** (https://github.com/abhiramrajilandesign/pucar-ui):

- **Teal brand:** `#0eb39e` (dark) / `#007E7E` (light).
- **Typography:** Helvetica Neue.
- **Colour:** Radix-based neutral + semantic colour scales.
- **Radius:** 10px.
- **Themes:** Dark + light, toggle-able; **defaults to dark**.
- All theming is driven by **CSS variables**, so the palette can be re-skinned centrally.

---

## 8. Engineering notes

### 8.1 The Constitution conversion

The Constitution's AKN file was originally **garbled** - only **14 articles**, with left-margin **side-notes interleaved into the body text**. It was **re-converted** from `public/public/data/acts/sources/constitution-of-india.pdf` using a **Python + `pdfplumber`** pipeline.

What the pipeline does:

- **Separates marginal headings from body text by font size** - body **10pt**, side-notes **8pt**, Part/Chapter headers **12pt**. This is robust regardless of which margin the notes sit in, because the notes **alternate margin by page**.
- Handles **amendment-inserted articles** (e.g. `*[21A.`).
- Handles **repealed-article gaps** (e.g. Articles **379–391 don't exist**).
- Handles **bracketed clause markers**.
- **Parses clauses by line boundaries**, so inline cross-references like *"sub-clause (a) of clause (1)"* don't get fragmented into false clause breaks.

**Result:** **456 articles** with correct headings and nested clause structure, **validating against the official Akoma Ntoso 3.0 XSD**.

It is **best-effort**: a few lettered articles and deep clause nesting are approximate. **Verify against the official source** before relying on exact text.

### 8.2 The judgment conversion (engineering note)

The 43 Supreme Court authorities in the dataset were collected as **Indian Kanoon text-export PDFs**. Each was converted to an Akoma Ntoso **`<judgment>`** file (a different AKN document type from the Acts' `<act>`) using a **Python + `pdfplumber`** pipeline, so precedent is stored in the same open standard as legislation.

**AKN judgment shape.** Root `<akomaNtoso>` → `<judgment name="judgment">` with three parts:

- **`<meta>`** - FRBR identity (`/akn/in/judgment/<year>/<case-id>`), the case name, the decided date, `#sc-india` as author, the neutral citation as `FRBRnumber`, and a `<proprietary>` block carrying PUCAR fields (`caseId`, `status`, `benchSize`, `reportable`).
- **`<header>`** - the caption: court, docket number, parties, neutral citation, reporter citation, date, author judge, and bench.
- **`<judgmentBody>`** - the opinion, segmented into `<introduction>`, `<motivation>` (the numbered reasoning), and `<decision>` (the operative order), each holding `<paragraph>` elements with `<num>` + `<content><p>`.

What the pipeline does:

- **Strips Indian Kanoon furniture** - running page headers, `Indian Kanoon - …` footers, stray page numbers.
- **Extracts metadata by pattern** - neutral citation (`YYYY INSC N`, present only for 2023+ judgments), decided date, author, bench, docket number, reportable flag.
- **Finds the opinion boundary** across the different IK templates (modern `JUDGMENT` / `ORDER` markers, and the older `JUDGMENT:` / `PETITIONER:`–`RESPONDENT:` layout).
- **Reconstructs paragraph numbering** with a gap-tolerant sequencer that follows the true `1, 2, 3 …` run and **ignores stray inline numbers** (quoted paragraph numbers, years, sums) that would otherwise truncate or fragment the body.
- **Reflows unnumbered older judgments** (pre-2003 running prose) into paragraphs on sentence-closing short lines.
- **Segments** the numbered body into introduction / reasoning / decision heuristically (the operative order is detected from closing phrases like *"the appeal is allowed / dismissed / disposed of"*).

**Source verification.** The pipeline also **classifies whether each PDF is actually the Supreme Court judgment it claims to be** - a genuine SC judgment has an `IN THE SUPREME COURT OF INDIA` caption, an SCR report citation, or the old IK SC template. This caught **3 wrong downloads** on the first pass (two Delhi Magistrate orders and a High Court judgment that merely *cited* the SC cases); those were **re-collected from the correct source and converted**, so the corpus is now complete. The converter also handles multiple source layouts - Indian Kanoon exports, the official Supreme Court PDF copy, and the SCR reporter format.

**Result:** all **43 judgments** as `<judgment>` XML, **validating against the official Akoma Ntoso 3.0 XSD**. It is **best-effort**: the introduction/reasoning/decision split is heuristic and paragraph boundaries follow the reported text, not the certified record. **Verify against the official judgment** before relying on exact wording.

### 8.3 The rules / State-Act conversion (engineering note)

`scripts/convert_rules.py` converts the **state-layer** instruments (and any State
Act/rules with a clean structure) to Akoma Ntoso `<act>` XML. Rules/sections become
`<section>` (eId `rule_N` or `sec_N`), grouped under `<chapter>` where the source has
chapters; sub-rules `(1)/(2)/(a)` become a nested `<blockList>` inside `<content>` -
the same schema-valid nesting the Constitution converter uses. It supports four
structural modes, one per source shape:

- **`chapter-rule`** - `CHAPTER <roman> <title>` then `Rule - N. Heading.` (Criminal Rules of Practice, 1982).
- **`flat-rule`** - flat `N. Heading:- …` (Electronic Filing Rules, 2021).
- **`chapter-flatrule`** - `CHAPTER <roman>` with the title on the next line, plus continuous `N. Heading.-` numbering, and a leading table of contents that is cut away (Rules of the High Court, 1971).
- **`flat-section`** - `N Heading -(1)…` where the number may lack a period; a gap-tolerant sequencer walks `1 … N` past any missed heading (Kerala Police Act, 2011).

**Police Act - now on clean text.** The Police Act was originally OCR'd from a scanned
gazette (~86% of sections). It has since been **re-converted from the official clean-text
PDF** (`keralapolice.gov.in` / India Code, Act 8 of 2011), reading a `…/sources/kerala-police-act-2011.txt`
layout extract - **120 of 131 sections**, no OCR noise. The old scan and its `.ocr.txt`
sidecar are retired.

**Two hand-authored instruments.** The **Kollam special-court G.O.** and the **s.138
court-fee schedule** are short, table-shaped documents that don't fit the section parser,
so their AKN (`<section>` / `<article eId="art_21">` with a nested `<blockList>`) is authored
directly to the same FRBR/`<meta>` template the converter emits.

**Result / coverage** (all **XSD-valid**):

| Instrument | Units | Coverage | Quality |
|---|---|---|---|
| Criminal Rules of Practice, 1982 | 30 chapters, 274 rules | complete | clean |
| Electronic Filing Rules, 2021 | 17 rules | complete | clean |
| Rules of the High Court, 1971 | 246 rules / 18 chapters | ~96% | clean |
| Kerala Police Act, 2011 | 120 of 131 sections | ~92% | clean text |
| Court Fees Act - Art. 21 (§138 fees) | 1 article | complete | hand-authored |
| Kollam §138 Special Court G.O. 241/2024 | 2 clauses + schedule | complete | hand-authored |

Best-effort: tables are flattened to text; a handful of Police Act sections with unusual
heading lines are absorbed into the preceding section rather than lost.
**Verify against the official text** before authoritative use.

---

## 9. Data model reference

### 9.1 Profile JSON

`public/data/profiles/cheque-dishonour-s138.profile.json`. Compact shape:

```jsonc
{
  "profile": "cheque-dishonour-s138",
  "title": "Cheque bounce - s.138 NI Act",
  "description": "Relevance profile for the s.138 cheque dishonour case type",
  "as_of": "2026-07-25",
  "maintained_by": "PUCAR / DRISTI",
  "transition_date": "2024-07-01",
  "ref_format": "<alias>:<eId>",
  "caveats": [ "AKN converted best-effort from India Code reprints; verify against official sources" ],
  "link_integrity": { /* self-check metadata: refs resolve, files exist, etc. */ },

  "sources": {
    "ni": {
      "uri": "...",
      "title": "Negotiable Instruments Act, 1881",
      "domain": "substantive",
      "status": "in force",
      "file": "acts/akn/negotiable-instruments-act-1881.akn.xml",
      "era": "current"
    }
    /* ... one entry per Act alias ... */
  },

  "act_alias_map": [
    {
      "topic": "procedure",
      "before": "crpc",
      "on_or_after": "bnss",
      "switch_date": "2024-07-01",
      "note": "CrPC replaced by BNSS"
    }
    /* ... penal (ipc→bns), evidence (iea→bsa) ... */
  ],

  "provisions": [
    {
      "ref": "ni:sec_138",
      "act": "ni",
      "eId": "sec_138",
      "file": "acts/akn/negotiable-instruments-act-1881.akn.xml",
      "tier": "operative",
      "role": "Creates the offence of cheque dishonour",
      "applies": "always",
      "note": "..."
    }
    /* ... */
  ],

  "terms": {
    "cheque": "ni:sec_6",
    "holder in due course": "ni:sec_9"
    /* word -> defining provision ref */
  },

  "edges": [
    { "from": "ni:sec_138", "rel": "requires", "to": "ni:sec_138_proviso_b", "note": "notice within 30 days" }
    /* relationships between provisions */
  ],

  "caselaw": "caselaw/cheque-dishonour-s138.caselaw.json"
}
```

Key points:
- `sources` is keyed by **alias**; each value carries `uri`, `title`, `domain`, `status`, `file` (relative path under `public/data/`), and `era`.
- `provisions[*].ref` is the `<alias>:<eId>` handle used everywhere else.
- `caselaw` is a **relative path string**, not an embedded array.
- The profile **points into** AKN; it never copies statutory text.

### 9.2 Case-law JSON

`public/data/caselaw/cheque-dishonour-s138.caselaw.json`. Compact shape:

```jsonc
{
  "profile": "cheque-dishonour-s138",
  "title": "Supreme Court precedent - s.138 cheque dishonour",
  "court": "Supreme Court of India",
  "as_of": "2026-07-25",

  "topics": {
    "presumption": "Presumption in favour of the holder",
    "notice": "Notice of demand"
  },

  "cases": [
    {
      "id": "rangappa-2010",
      "name": "Rangappa v. Sri Mohan",
      "citation": "(2010) 11 SCC 441",
      "year": 2010,
      "court": "Supreme Court of India",
      "bench": 3,
      "topics": ["presumption"],
      "construes": ["ni:sec_139"],
      "holding": "The presumption under s.139 includes the existence of a legally enforceable debt ...",
      "status": "good law",
      "relations": [
        { "rel": "affirms", "to": "kumar-2008", "note": "resolves the earlier doubt" }
      ],
      "note": "...",

      "source_pdf": "caselaw/sources/rangappa-v-sri-mohan-2010.pdf",
      "akn": "caselaw/akn/rangappa-v-sri-mohan-2010.akn.xml",
      "decided": "2010-05-07",
      "source_status": "ok"
      /* 2023+ judgments also carry "neutral_citation": "2023 INSC 692" */
    }
    /* ... */
  ],
  "corpus": {
    "akn_dir": "caselaw/akn/",
    "sources_dir": "caselaw/sources/",
    "akn_count": 43,
    "needs_recollection": []
  }
}
```

Key points:
- `construes` is an array of **provision refs** (`<alias>:<eId>`) - this is the link the app follows to show precedent on a provision.
- `topics` is a key→label map used for filtering in the **Case law** view.
- `relations` captures inter-case relationships (affirms, distinguishes, overrules, etc.).
- `bench` is the bench strength (number of judges).
- `akn` / `source_pdf` - paths (relative to `public/data/`) to the judgment's Akoma Ntoso file and its source PDF. `akn` is `null` when the source doc is wrong (see below).
- `neutral_citation` - the `YYYY INSC N` citation, present for 2023+ judgments where the export carried it; `decided` - the actual decided date parsed from the judgment.
- `source_status` - `"ok"` when the AKN was produced, or `"wrong-document"` with a `source_issue` string when the collected PDF is **not** the Supreme Court judgment claimed.
- `corpus` - a top-level summary: where the AKN and source folders are, how many AKN files exist (43), and `needs_recollection` (now empty - every case has an AKN judgment).

### 9.3 Enumerations

**Provision `tier`** (the kind of rule a provision is):

| Value | Meaning |
|-------|---------|
| `operative` | Creates or governs the offence/right directly. |
| `definition` | Defines a term. |
| `supporting` | Backs an operative rule. |
| `procedure` | Procedural rule. |
| `evidence` | Rule of evidence. |
| `notice` | Notice / demand requirement. |
| `limitation` | Time-bar / limitation. |
| `sentencing` | Sentencing / penalty. |
| `constitutional` | Constitutional provision. |

**Provision `applies`** (the point-in-time window):

| Value | Meaning |
|-------|---------|
| `always` | Live regardless of date. |
| `pre-2024-07-01` | Old codes - cause of action before the switch. |
| `post-2024-07-01` | New Sanhitas - cause of action on/after the switch. |

---

## 10. What lives outside the corpus

Two things sit outside the modelled shared core:

1. **The state layer** - a state's rules of practice, High Court rules, e-filing rules, court-fee schedule, special-court and other Government orders, the police act (warrant execution), local practice, filer mix, and court language. This is **configured per state** under `public/data/state/<state>/`, kept separate from the uniform central core. **Kerala** is modelled - **six instruments as AKN** (Police Act, Court Fees Act Art. 21, Criminal Rules of Practice, High Court Rules, E-Filing Rules, and the Kollam §138 Special Court G.O.) plus the DCMS e-filing SOP - each analysed at section level with `made_under`/`edges` links into the national core, and the viewer reads it through the **State objects** pages (see [§3.3](#33-shared-core-vs-state-layer) and [§8.3](#83-the-rules--state-act-conversion-engineering-note)); for s.138 it is *procedural overlay*, not a change to the offence, so there is no state amendment to model.

2. **Case law** - historically outside the corpus, now **modelled** via `public/data/caselaw/` (dataset + 43 AKN judgments). Only Supreme Court precedent for the s.138 case type is captured today; it is not exhaustive.

Everything else the model needs (statutes, the Constitution, vocabulary, the 2024 mapping) is **inside** the corpus as the shared core.

---

## 11. How to extend

**Add a new case type:**
1. Author a new `<case-type-slug>.profile.json` under `public/data/profiles/`.
2. Point its `sources` at existing AKN Acts, and add **new AKN Acts** only if the new type needs statutes not already present.
3. The case-type dropdown picks it up; no app code changes.

**Add a new Act:**
1. Drop the `<canonical-slug>.akn.xml` into `public/data/acts/akn/` (and its source PDF into `public/data/acts/sources/`).
2. Reference it from a profile's `sources` (with alias, title, domain, status, `file`, era).

**Add case law:**
1. Append a case object to the relevant `*.caselaw.json` `cases[]` array.
2. Populate its `construes` with the provision refs (`<alias>:<eId>`) it interprets - that's what wires it into the Provisions and Case-law views.
3. Drop the judgment PDF into `public/data/caselaw/sources/`, convert it to a `<judgment>` `.akn.xml` under `public/data/caselaw/akn/` (see §8.2), and set the case's `akn`, `source_pdf`, `decided`, and `neutral_citation` fields - that's what lights up the **Read judgment** button.

**Add a state-layer instrument (e.g. a new state, or another Kerala rule):**
1. Drop the source PDF into `public/data/state/<state>/sources/` (lowercase-hyphenated slug).
2. For a section/rule-structured document, add an entry to `DOCS` in `scripts/convert_rules.py`: its title, FRBR work URI, date, and the matching parse mode (`chapter-rule` / `flat-rule` / `chapter-flatrule` / `flat-section`); if the embedded text is poor, extract a clean `.txt` layout dump and point `text_file` at it. Short, table-shaped documents (a G.O., a fee schedule) are hand-authored to the same `<meta>` template instead.
3. Run `python3 scripts/convert_rules.py` and validate against the XSD.
4. Add the instrument to `<state>.json` under `amendments` (State Acts), `rules`, or `notifications`, with `made_under` (its enabling law) and per-provision `key[]` entries carrying `edges` to the national provisions it operationalises - that's what gives it the national-style section-level treatment.

Because the app is a pure runtime reader of `data/`, **extending the *app* model is a data task, not a code task** (adding a *new source shape* to the rules converter is the one place code changes).

---

## 12. Provenance & caveats

- **AKN Acts** were converted from **India Code reprint PDFs**. Conversion is **best-effort** - verify against official sources before relying on exact text.
- **The Constitution** was re-converted by a `pdfplumber` pipeline to 456 articles validating against the AKN 3.0 XSD; a few lettered articles and deep clause nesting are approximate (see §8.1).
- **AKN judgments** (all 43) were converted from Indian Kanoon / official Supreme Court / SCR-reporter PDFs and validate against the AKN 3.0 XSD; the introduction/reasoning/decision split is heuristic and paragraph text follows the reported version, not the certified record (see §8.2).
- **3 PDFs were wrong on the first collection pass** - two Delhi Magistrate orders and a High Court judgment that only *cited* the SC cases (Basalingappa, Dashrathbhai, Rajesh Jain). These were **re-collected from the correct source and converted**; the superseded PDFs were moved to `_to_delete/superseded-caselaw-pdfs/`.
- **Citations** in the case-law dataset are **best-effort**.
- **State-layer instruments** (Kerala) are **reference material outside the app corpus**. All six converted to AKN validate against the XSD but are **best-effort**: the **Kerala Police Act, 2011** is now from **clean official text** (120 of 131 sections; the earlier OCR version is retired), the **court-fee schedule** and **Kollam G.O.** are hand-authored from the gazette, and tables are flattened to text. The court-fee slabs were revised again by the **Finance Act 2025** - verify the current figure. Verify against the official text before authoritative use.
- The model captures the **shared core** plus the full s.138 Supreme Court case-law layer and the Kerala state-layer reference; it is not a complete legal encyclopaedia for any state.

When accuracy matters, treat this model as a **map**, not the territory - cross-check against the official gazette / India Code / SCC.

---

## 13. Glossary

| Term | Meaning |
|------|---------|
| **AKN (Akoma Ntoso)** | OASIS/LegalDocML XML standard (v3.0) for legal documents. Every Act here is an `<act>` `.akn.xml` file; every Supreme Court judgment is a `<judgment>` `.akn.xml` file. |
| **Neutral citation** | Court-assigned, reporter-independent citation (`YYYY INSC N` for the Supreme Court, introduced 2023). Stored as `neutral_citation` where known. |
| **eId** | Element ID - the stable within-document anchor for a provision, e.g. `sec_138`, `art_21`. |
| **FRBR** | Functional Requirements for Bibliographic Records - the identity model AKN uses to name a legal work across its expressions/manifestations. |
| **Bounded context** | A self-contained slice of a domain with its own model and vocabulary; here, one case type is one bounded context. |
| **Shared core** | The central law identical across all of India - what this model captures. |
| **State layer** | Per-state additions (High Court rules, e-filing, practice directions, local practice, filer mix, court language) - configured per state, not in the corpus. |
| **Cause of action** | The event giving rise to a claim; for s.138, the dishonour + unpaid demand. Its **date** decides whether old codes or 2023 Sanhitas apply. |
| **Sanhita** | A 2023 replacement code - BNSS (procedure), BNS (penal), BSA (evidence) - in force from 2024-07-01. |
| **Bench strength** | The number of Supreme Court judges deciding a case; larger benches bind smaller ones. Stored as `bench` in the case-law data. |

---

## 14. Deployment

The site is **static, no build**. Netlify config (`netlify.toml`) sets the
publish directory to `public/`; there is no build command.

**GitHub → Netlify (continuous deploy):**

```bash
# from the repo root, first time only
git init
git add .
git commit -m "DRISTI 2.0 domain model"

# create the GitHub repo and push (GitHub CLI)
gh repo create dristi-domain-model --private --source=. --push
#   …or create the repo in the GitHub UI and:
#   git remote add origin git@github.com:<you>/dristi-domain-model.git
#   git branch -M main && git push -u origin main
```

Then in Netlify: **Add new site → Import from Git → pick the repo**. Netlify
reads `netlify.toml`, publishes `public/`, and redeploys on every push. Nothing
else to configure.

**No-GitHub option (Netlify Drop):** drag the **`public/`** folder onto
[app.netlify.com/drop](https://app.netlify.com/drop) for an instant one-off deploy.

`context/` is gitignored, so research notes are never pushed or published.

---

*Maintained by PUCAR / DRISTI. Case type modelled: Cheque bounce - s.138 Negotiable Instruments Act, 1881.*

---

<!-- AUTO-DATA-MODEL:START (generated by scripts/generate_agent_artifacts.py - do not edit) -->

### Machine-readable data model (generated)

The domain is data. For agents and tools, generated artifacts join and describe it:

| artifact | what |
|---|---|
| `public/domain/cheque-dishonour-s138.json` | denormalized bundle - profile + state layers + field notes + resolved AKN text, with deep links |
| `public/domain/cheque-dishonour-s138.md` | the same as a readable digest |
| `public/domain/data-dictionary.md` | field meanings + enumerations (derived from the data) |
| `public/data/schema/*.schema.json` | JSON Schemas (profile, state, field note) |
| `public/llms.txt` | site-root map for agents |

Regenerate with `python3 scripts/generate_agent_artifacts.py` (also run in the Netlify build, so deploys never drift).

**Enumerations in use** (data-derived):

- `provision_tier`: operative, definition, supporting, procedure, evidence, notice, limitation, sentencing, constitutional
- `vocab_pos`: noun, verb
- `vocab_role`: document, actor, procedure, doctrine, remedy, forum
- `story_role_cat`: litigant, bank, witness, advocate, advclerk, judge, staff, police
- `verification_status`: corroborated, contradicted, reported-allegation, needs-check, reported-practice
- `compare_relation`: similar
- `vocab_group_national`: The cheque & the instrument, Parties & liability, The offence (§138), Presumptions & evidence, Procedure & process, Notice, limitation & disposal, Constitutional & powers
- `domain`: substantive, procedure, representation, policing, penal, evidence, interpretation, limitation, sentencing, electronic, banking, constitutional, authentication, settlement, access

**Counts:** 21 Acts, 108 provisions, 91 national terms; states: Gujarat (40 terms), Haryana (36 terms), Kerala (33 terms); 2 field notes.

<!-- AUTO-DATA-MODEL:END -->
