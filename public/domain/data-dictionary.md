# DRISTI data dictionary

Generated from the data - the field meanings and the **enumerations are derived from what the data actually uses**, so this cannot drift. Structural detail (which fields are required) lives in the JSON Schemas under `data/schema/`.

## Files

| file | what |
|---|---|
| `data/profiles/cheque-dishonour-s138.profile.json` | national relevance profile: `sources` (Acts), `provisions` (pinned sections), `terms` (vocabulary) |
| `data/state/<state>.json` | a state layer: `vocabulary.terms`, `story.roles`, `story.process` |
| `data/config/app.config.json` | `case_types`, `jurisdictions`, `practice_notes` (field notes), `domain_labels` |
| `data/caselaw/cheque-dishonour-s138.caselaw.json` | the case-law dataset |
| `data/acts/akn/*.akn.xml` | the statutory text (Akoma Ntoso 3.0), addressed by `eId` |
| `domain/cheque-dishonour-s138.json` / `.md` | the denormalized join of all of the above |

## Reference grammars

- **Provision / national term ref**: `<alias>:<eId>` (e.g. `ni:sec_138`). `alias` is a key in the profile `sources`; `eId` exists in that Act's AKN file. '<alias>:<eId>'. Resolve to the file at sources[alias].file, element eId; the logical AKN id is sources[alias].uri + '/eng@#' + eId (which equals the <FRBRuri> inside that file).
- **State cite**: `{l, s, e}` where `s` is a state-instrument alias and `e` an eId; or `{l, n}` where `n` is a national `<alias>:<eId>`.
- **Field-note impact ref**: `<state>:<unit>:<id>` (unit = term|role|process); the created unit carries the same trailing `id`.
- **App deep link**: `#<view>?state=<s>&sec=<anchor>&lens=<l>&term=<w>&note=<id>&act=<a>&eid=<e>` - append to the site root.

## Enumerations (as used in the data)
- `provisions[].tier` - `operative`, `definition`, `supporting`, `procedure`, `evidence`, `notice`, `limitation`, `sentencing`, `constitutional`
- `terms[].pos` - `noun`, `verb`
- `terms[].role` - `document`, `actor`, `procedure`, `doctrine`, `remedy`, `forum`
- `story.roles.items[].cat` - `staff`, `litigant`, `bank`, `witness`, `advocate`, `advclerk`, `judge`, `police`
- `verification.claims[].status` - `corroborated`, `contradicted`, `reported-allegation`, `needs-check`, `reported-practice`
- `compare[].relation` - `similar`
- national vocab `group` - `The cheque & the instrument`, `Parties & liability`, `The offence (§138)`, `Presumptions & evidence`, `Procedure & process`, `Notice, limitation & disposal`, `Constitutional & powers`
- `sources[].domain` / `domain_labels` - `substantive`, `procedure`, `representation`, `policing`, `penal`, `evidence`, `interpretation`, `limitation`, `sentencing`, `electronic`, `banking`, `constitutional`, `authentication`, `settlement`, `access`
