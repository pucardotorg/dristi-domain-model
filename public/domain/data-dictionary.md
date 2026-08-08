# DRISTI data dictionary

Generated from the data - the field meanings and the **enumerations are derived from what the data actually uses**, so this cannot drift. Structural detail (which fields are required) lives in the JSON Schemas under `data/schema/`.

## Case types

Two case types are modelled. A profile, a bundle and a digest are per case type; the Akoma Ntoso corpus, the schemas, the standards, the policy layer and the model rules are corpus-wide and are shared by all of them.

| case type | id | provisions | Acts | terms | judgments | requirements |
|---|---|---|---|---|---|---|
| Cheque bounce (NI Act, 1881 · §138) | `cheque-dishonour-s138` | 108 | 21 | 91 | 43 | 493 |
| Transfer dishonour (PSS Act, 2007 · §25) | `eft-dishonour-s25` | 96 | 18 | 64 | none - see `scope` | none - see `scope` |

Where a cell says *none*, the case type's profile declares in its `scope` block which layer it does not model and why - the reason is prose written for a reader, and it is carried into that case type's bundle (`scope`) and digest verbatim. An unmodelled layer is `null` in the bundle, never an empty list, so it cannot be read as a measurement.

**Transfer dishonour** does not model state layers, case law, normative requirements and state vocabulary.

## Files

| file | what |
|---|---|
| `data/profiles/<case-type>.profile.json` | national relevance profile, one per case type: `sources` (Acts), `provisions` (pinned sections), `terms` (vocabulary), `edges` |
| `data/state/<state>.json` | a state layer: `vocabulary.terms`, `story.roles`, `story.process` |
| `data/config/app.config.json` | `case_types` (each naming its profile), `jurisdictions`, `practice_notes` (field notes), `domain_labels` |
| `data/caselaw/<case-type>.caselaw.json` | the case-law dataset for a case type, where there is authority to assemble one. The profile names the file in `caselaw`; a profile with no such key has none |
| `data/requirements/national.json` | the normative layer, central: what a system MUST do, binding every state. Derived against one case type (Cheque bounce) |
| `data/requirements/<state>.json` | the normative layer, per state: only what that state's own instruments add, or tighten |
| `data/standards/standards-adherence.md` | the standards layer: the non-legal obligations a build is measured against, each with its test. Markdown, not JSON, and not joined into the bundle |
| `data/policy/policy.json` | the policy manifest: each document's issuer, status, unit of numbering, Akoma Ntoso, transcription, source PDF and source URL |
| `data/policy/akn/*.akn.xml` | the policy documents as Akoma Ntoso `<doc>`, `@name` carrying the kind (policy, procedure, regulations, rules), addressed by `eId` in the stem each document declares - `reg_43_3` is regulation 43(3), `rule_10_3` is rule 10.3. This is what the Policy page reads |
| `data/policy/md/*.md` | the checked transcription each Akoma Ntoso file is converted from, by `scripts/convert_policy_akn.py` |
| `data/standards/ai-policy-compliance.md` | the operational obligations drawn out of those documents, one `##` group per document, each record citing a clause of it. The document's half and DRISTI's suggested build are separate fields and must stay so |
| `data/modelrules/modelrules.json` | the model-rules manifest: one entry per tab of the draft, in reading order, plus the source document, its status and its URL. The app builds its tab strip from this and nothing else |
| `data/modelrules/*.md` | a draft rule set, one file per tab, transcribed under the source's own numbering - `##` a Part, `###` a rule group with the source's Roman label, and the rule numbers carried through as printed. Markdown, not Akoma Ntoso, because a draft out for public inputs is not an instrument in force |
| `data/acts/akn/*.akn.xml` | the statutory text (Akoma Ntoso 3.0), addressed by `eId`. Shared: one Act serves every case type that pins it |
| `domain/<case-type>.json` / `.md` | the denormalized join of all of the above, one pair per case type: `cheque-dishonour-s138`, `eft-dishonour-s25` |

## Reference grammars

- **Provision / national term ref**: `<alias>:<eId>` (e.g. `ni:sec_138`). `alias` is a key in the profile `sources`; `eId` exists in that Act's AKN file. '<alias>:<eId>'. Resolve to the file at sources[alias].file, element eId; the logical AKN id is sources[alias].uri + '/eng@#' + eId (which equals the <FRBRuri> inside that file).
- **State cite**: `{l, s, e}` where `s` is a state-instrument alias and `e` an eId; or `{l, n}` where `n` is a national `<alias>:<eId>`.
- **Field-note impact ref**: `<state>:<unit>:<id>` (unit = term|role|process); the created unit carries the same trailing `id`.
- **App deep link**: `#<view>?state=<s>&sec=<anchor>&lens=<l>&term=<w>&note=<id>&req=<id>&std=<id>&act=<a>&eid=<e>` - append to the site root.

## Requirements - the normative layer

**493 requirements** across 4 files: 172 in `national.json`, 127 in `gujarat.json`, 84 in `haryana.json`, 110 in `kerala.json`. They are written against **Cheque bounce** (`cheque-dishonour-s138`) and have not been re-derived for any other case type, so they are joined into that bundle and no other. Every field is described in `data/requirements/README.md`; the structure is fixed by `data/schema/requirement.schema.json`; all of them, with each `authority` cite resolved to its section number and heading, are joined into `domain/cheque-dishonour-s138.json` under `requirements`.

| field | meaning |
|---|---|
| `id` | `REQ-<CAT>-<NNN>` national, `REQ-<STATE>-<CAT>-<NNN>` state. Stable, never renumbered. |
| `level` | RFC 2119 force of the obligation. One obligation per requirement. |
| `statement` | what the system must do, in one sentence. |
| `why` | the failure mode: what goes wrong in a real case if the system does not do this. |
| `authority` | the provision it is derived from: `{l,n}` national, `{l,s,e}` state instrument. A requirement with no resolvable authority is not a requirement. |
| `binds` | `{artifact, target}` - the thing in a system this constrains. |
| `how` | populated only where the law prescribes the method; `null` marks where a designer is free. |
| `test` | the acceptance criterion - how you would check a screen, a schema or a workflow. |
| `derivedFrom` | the kind of source it came from. |
| `status` | how firmly it is asserted. |
| `tightens` | for a state requirement, the national requirement it makes stricter. |
| `relatedTo` | other requirement ids that bear on the same point. |

Categories in use:

| code | covers | count |
|---|---|---|
| `LIM` | limitation, cause of action, computation of time | 31 |
| `NOT` | the statutory demand notice | 11 |
| `FIL` | filing, court fee, scrutiny, numbering | 90 |
| `SRV` | service of summons and process | 43 |
| `EVI` | evidence, affidavits, documents | 66 |
| `PRE` | presumptions and the burden of proof | 15 |
| `JUR` | jurisdiction, cognizance, the competent court | 22 |
| `TRL` | trial conduct, plea, attendance | 54 |
| `CMP` | compounding, settlement, mediation | 18 |
| `SEN` | sentence, fine, compensation | 32 |
| `APL` | appeal, revision, deposit | 39 |
| `REC` | the court record, registers, retention | 45 |
| `CPY` | copies and their supply | 27 |

Status: `firm` the instrument says so explicitly · `contested` the authorities divide, and the division is stated · `inferred` a reasonable reading; the reasoning is in `why`.

## Enumerations (as used in the data)

Corpus-wide: the union of what every case type's data uses, because one schema validates every profile and every state layer. Each bundle carries the same set under `enumerations`.

- `provisions[].tier` - `operative`, `definition`, `supporting`, `procedure`, `evidence`, `notice`, `limitation`, `sentencing`, `constitutional`
- `terms[].pos` - `noun`, `verb`
- `terms[].role` - `document`, `actor`, `procedure`, `doctrine`, `remedy`, `forum`
- `story.roles.items[].cat` - `litigant`, `bank`, `witness`, `advocate`, `advclerk`, `judge`, `staff`, `police`
- `verification.claims[].status` - `corroborated`, `contradicted`, `reported-allegation`, `needs-check`, `reported-practice`
- `compare[].relation` - `similar`, `diverges`
- national vocab `group` - `The cheque & the instrument`, `Parties & liability`, `The offence (§138)`, `Presumptions & evidence`, `Procedure & process`, `Notice, limitation & disposal`, `Constitutional & powers`, `The transfer & the payment system`, `The offence (§25)`
- `sources[].domain` / `domain_labels` - `substantive`, `procedure`, `representation`, `policing`, `penal`, `evidence`, `interpretation`, `limitation`, `sentencing`, `electronic`, `banking`, `constitutional`, `authentication`, `settlement`, `access`
- requirements `category` - `LIM`, `NOT`, `FIL`, `SRV`, `EVI`, `PRE`, `JUR`, `TRL`, `CMP`, `SEN`, `APL`, `REC`, `CPY`
- requirements `level` - `MUST`, `MUST NOT`, `MAY`, `SHOULD`
- requirements `status` - `firm`, `contested`, `inferred`
- requirements `derivedFrom` - `act`, `caselaw`, `practice-note`, `rule`
- requirements `binds.artifact` - `validation-rule`, `workflow-step`, `schema-field`, `screen`, `output-document`, `access-control`
