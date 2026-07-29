# Requirements - the normative layer

The rest of this corpus is **descriptive**: it says what the law provides. Nothing in
it can be checked against a screen, a schema or a workflow, because a description
validates nothing.

This folder holds the **normative** layer: statements that bind a system, are derived
from a provision, and can be tested.

```
REQ-LIM-004  The system MUST record the date the drawer RECEIVED the demand notice,
             separately from the date it was dispatched.
why          The 15-day window runs from receipt (NI Act s.138 proviso (c)). A system
             storing only dispatch cannot compute the cause-of-action date and will
             mis-state limitation whenever service was delayed.
authority    NI Act s.138 proviso (c); NI Act s.142(1)(b)
binds        schema field - the demand notice record
test         Two distinct date fields exist and are separately populated; the
             cause-of-action date is computed from receipt, never from dispatch.
```

That is checkable. It cites its authority. It binds a specific artifact. It has a test.

## Layering

Requirements are layered the way the rest of the model is, so a rule that comes from
central law is stated **once**:

| File | Holds |
|---|---|
| `national.json` | Derived from the central Acts and from Supreme Court case law. **Binds every state.** |
| `<state>.json` | Only what that state's own instruments add, or where a state tightens a national requirement. |

A state file never restates a national requirement. Where a state instrument makes a
national requirement stricter, the state requirement names it in `tightens`.

## Serial numbers

Stable and never renumbered. A requirement that is withdrawn is marked
`status: "withdrawn"` and keeps its number.

- National: `REQ-<CAT>-<NNN>` - e.g. `REQ-LIM-004`
- State: `REQ-<STATE>-<CAT>-<NNN>` - e.g. `REQ-HR-FIL-001`

State codes: `KL` Kerala, `HR` Haryana, `GJ` Gujarat.

Categories:

| Code | Covers |
|---|---|
| `LIM` | limitation, cause of action, computation of time |
| `NOT` | the statutory demand notice |
| `FIL` | filing, court fee, scrutiny, numbering |
| `SRV` | service of summons and process |
| `EVI` | evidence, affidavits, documents |
| `PRE` | presumptions and the burden of proof |
| `JUR` | jurisdiction, cognizance, the competent court |
| `TRL` | trial conduct, plea, attendance |
| `CMP` | compounding, settlement, mediation |
| `SEN` | sentence, fine, compensation |
| `APL` | appeal, revision, deposit |
| `REC` | the court record, registers, retention |
| `CPY` | copies and their supply |

## The shape of a requirement

```json
{
  "id": "REQ-LIM-004",
  "category": "LIM",
  "level": "MUST",
  "statement": "The system MUST record the date the drawer received the demand notice, separately from the date it was dispatched.",
  "why": "The 15-day window runs from receipt. A system storing only dispatch cannot compute the cause-of-action date and will mis-state limitation whenever service was delayed.",
  "authority": [ {"l": "NI Act §138 proviso (c)", "n": "ni:sec_138"} ],
  "binds": { "artifact": "schema-field", "target": "demand notice - date of receipt" },
  "how": null,
  "test": "Two distinct date fields exist and are separately populated; the cause-of-action date is computed from receipt, never from dispatch.",
  "derivedFrom": "act",
  "status": "firm",
  "statusReason": "Proviso (c) fixes the fifteen days from the date of receipt of the notice, so the receipt date is the one the statute computes from. The requirement restates what the provision says.",
  "cases": [],
  "notes": [],
  "tightens": null,
  "relatedTo": []
}
```

Field notes:

- **`level`** is RFC-2119. `MUST` where the law leaves no choice, `SHOULD` where it
  directs but admits exceptions, `MAY` where it permits. One obligation per
  requirement - if the statement needs an "and", it is two requirements.
- **`why`** states the **failure mode**, not the provision's summary. What goes wrong
  in a real case if the system does not do this.
- **`authority[]`** uses the same cite shapes as everywhere else - `{l,n}` for a
  national provision, `{l,s,e}` for a state instrument - so each one resolves and
  opens. A requirement with no resolvable authority is not a requirement.
- **`how`** is populated **only where the law prescribes the method**. Where the law
  states an obligation but leaves the means open, it is `null`, and that is
  deliberate signal: it marks where a designer is free.
- **`test`** is the acceptance criterion - how you would check a screen, a schema or a
  workflow against this requirement.
- **`status`**: `firm` the instrument says so explicitly · `inferred` a reasonable
  reading, reasoning given in `why` · `contested` the authorities divide, and the
  division is stated. Without this, a requirement inferred from one judgment would
  read as firmly as one lifted from the section itself.
- **`statusReason`** carries the status's justification, and is **written after
  reading the provision, not after reading the citation label**. For `firm`, say what
  the text does and quote a few words of it. For `inferred`, name the gap exactly:
  what the provision commands, and the step of reasoning that reaches the
  requirement. For `contested`, name both sides. A status without a reason is an
  assertion, so the validator requires the field.

  The label has to survive the reading. The commonest defect found in practice is a
  `firm` whose provision creates the duty on **someone other than the actor the
  requirement binds** - a Government told to equip registries, a later civil court, a
  witness told to swear an oath at the hearing. That is an `inferred`, however
  squarely the provision is on the subject.
- **`cases[]`** and **`notes[]`** link a requirement to the judgment or field note it
  actually rests on, by id, so the reader reaches the source rather than a citation
  label naming it. Ids are checked against the corpus: a dangling one fails
  validation, because a dead chip is worse than no link. Add them only where the
  source genuinely underpins the requirement.
- **`derivedFrom`**: `act` · `rule` · `caselaw` · `practice-note`.

## Validation

`python3 scripts/validate_requirements.py` checks every file: the schema, unique and
well-formed ids, that every `authority` cite resolves in the AKN corpus, that
`tightens` points at a real national requirement, and that no state file restates a
national one. It is wired into the artifact self-check, so the build fails on a
requirement whose authority has gone stale.
