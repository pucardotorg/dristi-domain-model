# DRISTI data dictionary

Generated from the data - the field meanings and the **enumerations are derived from what the data actually uses**, so this cannot drift. Structural detail (which fields are required) lives in the JSON Schemas under `data/schema/`.

## Files

| file | what |
|---|---|
| `data/profiles/cheque-dishonour-s138.profile.json` | national relevance profile: `sources` (Acts), `provisions` (pinned sections), `terms` (vocabulary) |
| `data/state/<state>.json` | a state layer: `vocabulary.terms`, `story.roles`, `story.process` |
| `data/config/app.config.json` | `case_types`, `jurisdictions`, `practice_notes` (field notes), `domain_labels` |
| `data/caselaw/cheque-dishonour-s138.caselaw.json` | the case-law dataset |
| `data/requirements/national.json` | the normative layer, central: what a system MUST do, binding every state |
| `data/requirements/<state>.json` | the normative layer, per state: only what that state's own instruments add, or tighten |
| `data/acts/akn/*.akn.xml` | the statutory text (Akoma Ntoso 3.0), addressed by `eId` |
| `domain/cheque-dishonour-s138.json` / `.md` | the denormalized join of all of the above |

## Reference grammars

- **Provision / national term ref**: `<alias>:<eId>` (e.g. `ni:sec_138`). `alias` is a key in the profile `sources`; `eId` exists in that Act's AKN file. '<alias>:<eId>'. Resolve to the file at sources[alias].file, element eId; the logical AKN id is sources[alias].uri + '/eng@#' + eId (which equals the <FRBRuri> inside that file).
- **State cite**: `{l, s, e}` where `s` is a state-instrument alias and `e` an eId; or `{l, n}` where `n` is a national `<alias>:<eId>`.
- **Field-note impact ref**: `<state>:<unit>:<id>` (unit = term|role|process); the created unit carries the same trailing `id`.
- **App deep link**: `#<view>?state=<s>&sec=<anchor>&lens=<l>&term=<w>&note=<id>&act=<a>&eid=<e>` - append to the site root.

## Requirements - the normative layer

**493 requirements** across 4 files: 172 in `national.json`, 127 in `gujarat.json`, 84 in `haryana.json`, 110 in `kerala.json`. Every field is described in `data/requirements/README.md`; the structure is fixed by `data/schema/requirement.schema.json`; all of them, with each `authority` cite resolved to its section number and heading, are joined into `domain/cheque-dishonour-s138.json` under `requirements`.

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
- `provisions[].tier` - `operative`, `definition`, `supporting`, `procedure`, `evidence`, `notice`, `limitation`, `sentencing`, `constitutional`
- `terms[].pos` - `noun`, `verb`
- `terms[].role` - `document`, `actor`, `procedure`, `doctrine`, `remedy`, `forum`
- `story.roles.items[].cat` - `litigant`, `bank`, `witness`, `advocate`, `advclerk`, `judge`, `staff`, `police`
- `verification.claims[].status` - `corroborated`, `contradicted`, `reported-allegation`, `needs-check`, `reported-practice`
- `compare[].relation` - `similar`, `diverges`
- national vocab `group` - `The cheque & the instrument`, `Parties & liability`, `The offence (§138)`, `Presumptions & evidence`, `Procedure & process`, `Notice, limitation & disposal`, `Constitutional & powers`
- `sources[].domain` / `domain_labels` - `substantive`, `procedure`, `representation`, `policing`, `penal`, `evidence`, `interpretation`, `limitation`, `sentencing`, `electronic`, `banking`, `constitutional`, `authentication`, `settlement`, `access`
- requirements `category` - `LIM`, `NOT`, `FIL`, `SRV`, `EVI`, `PRE`, `JUR`, `TRL`, `CMP`, `SEN`, `APL`, `REC`, `CPY`
- requirements `level` - `MUST`, `MUST NOT`, `MAY`, `SHOULD`
- requirements `status` - `firm`, `contested`, `inferred`
- requirements `derivedFrom` - `act`, `caselaw`, `practice-note`, `rule`
- requirements `binds.artifact` - `validation-rule`, `workflow-step`, `schema-field`, `screen`, `output-document`, `access-control`
