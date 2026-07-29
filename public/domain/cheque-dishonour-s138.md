# DRISTI domain digest - Cheque bounce

> Dishonour of a cheque for insufficiency of funds - a criminal complaint. Around 15% of a typical court's caseload; high volume, relatively standard.

Case type `cheque-dishonour-s138` (NI Act, 1881 · §138). As of 2026-07-24; code transition 2024-07-01. Maintained by PUCAR.

This digest is generated from the data - it joins the relevance profile, the state layers, the field notes and the Akoma Ntoso corpus. Each item carries a **deep link** (a URL fragment for the viewer) and a `ref` into the machine-readable bundle `cheque-dishonour-s138.json`. Do not edit by hand.

## Normative requirements - what a system MUST do

Everything else here is descriptive: it says what the law provides, and a description validates nothing. This section is normative. Each requirement binds a system, names the provision it comes from, and carries a test you can run against a screen, a schema or a workflow. Full records, with the authority resolved to its section number and heading, are in `cheque-dishonour-s138.json` under `requirements`; the source files are `data/requirements/*.json`.

**493 requirements**: 172 national (binding every state), plus 127 Gujarat, 84 Haryana, 110 Kerala. A state file never restates a national requirement - it adds only what its own instruments require, or where it makes a national one stricter, and then it names that requirement in `tightens`.

By level: MUST 399 · MUST NOT 73 · MAY 8 · SHOULD 13. By status: firm 395 · contested 6 · inferred 92. Derived from: act 129 · caselaw 58 · practice-note 10 · rule 296.

### National - binds every state (172)

Binds every state. A state file adds only what its own instruments require, or tightens one of these. Derived from the central Acts and from Supreme Court case law.

#### LIM - limitation, cause of action, computation of time (15)

**REQ-LIM-001** · MUST NOT · firm · from act

The system MUST NOT treat a dishonour as actionable under section 138 unless the cheque was presented to the bank within six months of the date it bears, or within its validity period, whichever expires earlier.

- *why* - Presentment inside the validity window is the first condition of the offence. A system that accepts a dishonour memo without testing the presentment date against the cheque date lets a stale cheque found in a drawer become a criminal complaint, and the defect surfaces only at trial after summons has issued against the drawer.
- *authority* - NI Act §138 proviso (a) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - validation-rule: cheque record - presentment date against cheque date and validity period
- *how* - The earlier of six months from the date the cheque bears, or the expiry of the validity period stated on the instrument.
- *test* - Enter a cheque dated more than six months before the presentment date: the build refuses to create a section 138 cause of action and states the reason. Enter a cheque marked valid for three months and presented on day 100: the build refuses on the validity period, not on the six-month rule.

**REQ-LIM-002** · MUST · firm · from act

The system MUST record the date on which the payee or holder in due course received information from the bank that the cheque had been returned unpaid, as a field distinct from the date on the dishonour memo.

- *why* - The thirty days for the demand notice run from the payee's receipt of the bank's information, not from the date the bank wrote the memo. A system that stores only the memo date will declare a notice time-barred when the memo reached the payee a week late, and will accept a notice as timely when the payee sat on the information.
- *authority* - NI Act §138 proviso (b) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: dishonour record - date the payee received the bank's return information
- *test* - The dishonour record carries a memo date and a payee-informed date as separate populated fields; the thirty-day notice deadline is computed from the payee-informed date.
- *related* - REQ-LIM-003

**REQ-LIM-003** · MUST · firm · from act

The system MUST refuse to accept a demand notice as a statutory notice under section 138 where it was given more than thirty days after the payee received the bank's information of return.

- *why* - A notice outside the thirty-day window is not a statutory notice at all, so no cause of action ever arises from it. If the system numbers the complaint anyway, the defect is not discoverable from the case file and is usually found only when the accused takes the point after months of hearings.
- *authority* - NI Act §138 proviso (b) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - validation-rule: demand notice - issue date against the payee-informed date
- *test* - Set the payee-informed date and a notice date thirty-one days later: the build refuses to record the document as the statutory notice and names the proviso.
- *related* - REQ-LIM-002

**REQ-LIM-004** · MUST · firm · from act

The system MUST record the date the drawer received the demand notice, separately from the date it was dispatched.

- *why* - The 15-day window runs from receipt, not dispatch. A system storing only the dispatch date cannot compute the cause-of-action date, and will mis-state limitation whenever service was delayed - filing early makes the complaint premature, filing late makes it time-barred.
- *authority* - NI Act §138 proviso (c) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §142(1)(b) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - schema-field: demand notice - date of receipt by the drawer
- *test* - Two distinct date fields exist on the notice record and are separately populated; the cause-of-action date is computed from the receipt date, never from the dispatch date.

**REQ-LIM-005** · MUST NOT · firm · from act

The system MUST NOT permit a section 138 complaint to be presented before the fifteen days allowed to the drawer from receipt of the demand notice have expired.

- *why* - A complaint filed on day fifteen or earlier is premature and is liable to be dismissed outright, because the offence is not complete until the drawer has failed to pay within the full fifteen days. A portal that accepts the filing on the day the payee is angry rather than the day the law permits produces a complaint that must be filed again from scratch, by which time the one-month period may have run.
- *authority* - NI Act §138 proviso (c) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §142(1)(b) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: complaint filing - earliest permissible presentation date
- *test* - With a notice receipt date of 1 March, the filing screen rejects presentation on any date up to and including 16 March and permits it from 17 March.
- *related* - REQ-LIM-006

**REQ-LIM-006** · MUST · firm · from act

The system MUST hold the cause-of-action date as a field derived from the drawer's receipt of the demand notice, being the day following the expiry of fifteen days from that receipt.

- *why* - Every downstream period in a section 138 case hangs off this single date. If it is entered by hand, or computed from the notice dispatch date, the limitation calculation, the condonation question and the court's own delay reporting are all wrong together and in the same direction.
- *authority* - NI Act §138 proviso (c) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §142(1)(b) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - schema-field: case - cause-of-action date, derived and not editable
- *test* - The cause-of-action date is not directly editable; changing the notice receipt date changes it; it is always exactly sixteen days after the receipt date.
- *related* - REQ-LIM-005, REQ-LIM-007

**REQ-LIM-007** · MUST · firm · from act

The system MUST compute the limitation for taking cognizance as one month from the cause-of-action date under clause (c) of the proviso to section 138.

- *why* - Counting the month from the date of dishonour, from the notice, or from the expiry of the notice period itself each shifts the deadline by days or weeks. A complaint that the register shows as in time but is in fact out of time reaches cognizance without the condonation application it needed, and the conviction is vulnerable years later.
- *authority* - NI Act §142(1)(b) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - NI Act §138 proviso (c) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - validation-rule: complaint - limitation for cognizance
- *test* - For a cause-of-action date of 17 March, the system treats 17 April as the last day for a complaint without condonation, and flags 18 April as out of time.
- *related* - REQ-LIM-006, REQ-LIM-008

**REQ-LIM-008** · MUST NOT · firm · from act

The system MUST NOT allow cognizance of a complaint presented after the one-month period until an application showing sufficient cause and the court's order on it are both on the record.

- *why* - The proviso to section 142(1)(b) permits cognizance out of time only if the complainant satisfies the court of sufficient cause; it is a self-contained power and does not borrow from the Limitation Act. Without a recorded application and a recorded order, the file shows a late complaint taken on file with no explanation, and neither the appellate court nor the magistrate's own successor can tell whether the delay was ever considered.
- *authority* - NI Act §142(1)(b) proviso (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - workflow-step: cognizance - condonation of delay before taking a late complaint on file
- *test* - A complaint presented one day beyond the month cannot reach the cognizance step until a condonation application is attached and an order allowing or refusing it is recorded.
- *related* - REQ-LIM-007

**REQ-LIM-009** · MUST · firm · from act

The system MUST apply the one-month period under section 142(1)(b) as the limitation for cognizance of a section 138 offence, in place of the general limitation periods that govern offences punishable with imprisonment.

- *why* - Section 142 opens with a non obstante clause, so the general limitation scheme of the criminal procedure code does not govern. A system that computes limitation from the general table would give a section 138 complaint one year or three years instead of one month and would let plainly time-barred complaints through unflagged.
- *authority* - NI Act §142(1)(b) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - BNSS §514 (`bnss:sec_514` - 514. Bar to taking cognizance after lapse of period of limitation) [open](#law?act=bnss&eid=sec_514)
- *binds* - validation-rule: limitation engine - the period applied to a section 138 offence
- *test* - Inspect the limitation rule the engine applies to offence type section 138: it resolves to one month from the cause of action, not to the general period for an offence punishable with imprisonment up to two years.
- *related* - REQ-LIM-007

**REQ-LIM-010** · MUST · inferred · from act

The system MUST record each presentation and return of the same cheque as a distinct dated event rather than as a single overwritable presentment.

- *why* - A cheque is commonly presented more than once. A schema with a single presentment field forces the user to overwrite earlier attempts, which destroys the link between a particular return, the notice that followed it and the cause of action it generated. This is a reading of the proviso rather than an express direction: the proviso speaks of the return and the notice in the singular, so the pairing must be preserved even though the section does not say how.
- *authority* - NI Act §138 proviso (a) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §138 proviso (b) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §138 proviso (c) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: cheque record - repeatable presentation and return events, each linkable to a notice
- *test* - Record two presentations of the same cheque with different return dates: both survive on the record with their own dates and outcomes.
- *related* - REQ-LIM-011

**REQ-LIM-011** · MUST · inferred · from act

The system MUST anchor the cause of action on the return of the cheque in respect of which the statutory demand notice was given.

- *why* - Where a cheque has been returned more than once, only one of those returns carries a notice that satisfies the proviso, and the fifteen days run from that notice. A system that anchors on the latest return, or on the first, computes limitation from a dishonour that generated no cause of action. The proviso speaks of the return and the notice in the singular, so the pairing is a reading of it rather than an express direction.
- *authority* - NI Act §138 proviso (b) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §138 proviso (c) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §142(1)(b) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: cause of action - the return event the notice attaches to
- *test* - Record two returns, issue the notice on the second: the cause-of-action date is computed from the notice tied to the second return, not from the first return.
- *related* - REQ-LIM-010, REQ-LIM-006

**REQ-LIM-012** · MUST · firm · from caselaw

The system MUST prevent cognizance being taken before the fifteen day period from receipt or deemed receipt of the demand notice has expired.

- *why* - Yogendra Pratap Singh holds that a complaint filed before the fifteen days expire is not maintainable and cognizance cannot be taken on it. Because the defect is jurisdictional and incurable, a system that lets a magistrate take cognizance a day early destroys the whole prosecution; the payee must start again and rely on condonation of delay.
- *authority* - NI Act §138 proviso (c) as read in Yogendra Pratap Singh v. Savitri Pandey (2014) 10 SCC 713 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §142(1)(b) as read in Yogendra Pratap Singh v. Savitri Pandey (2014) 10 SCC 713 (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: cognizance step - earliest permissible date
- *test* - With a recorded notice receipt date, the cognizance action is unavailable until the sixteenth day, and the screen states the earliest permissible date.
- *related* - REQ-LIM-013, REQ-NOT-011

**REQ-LIM-013** · MUST · firm · from caselaw

Where a complaint is found to have been filed prematurely, the system MUST require a fresh complaint to be instituted and numbered, and MUST NOT allow the same complaint to be revived or re-presented.

- *why* - Yogendra Pratap Singh holds that the very same complaint cannot be presented at any later stage; the only remedy is a fresh complaint. A registry that reuses the original case number on a re-presentation carries the incurable defect forward, and the accused will succeed on the same objection at the end of a full trial.
- *authority* - NI Act §142(1)(b) as read in Yogendra Pratap Singh v. Savitri Pandey (2014) 10 SCC 713 (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - NI Act §138 proviso (c) as read in Gajanand Burange v. Laxmi Chand Goyal (2022 SCC OnLine SC 1711) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - workflow-step: registry - disposal of a premature complaint and institution of a fresh one
- *test* - The premature-filing disposal path offers only file fresh complaint, links the new number to the old, and no re-present action exists on the closed record.
- *related* - REQ-LIM-012, REQ-LIM-014

**REQ-LIM-014** · MUST · firm · from caselaw

The system MUST support condonation of delay under the proviso to section 142(1)(b) as a recorded order with stated sufficient cause, and MUST treat a fresh complaint filed within one month of a premature-filing dismissal as carrying condoned delay.

- *why* - Yogendra Pratap Singh directs that where a complaint fails for prematurity, a fresh complaint filed within one month of the decision is to be treated as one where delay stands condoned. A registry that computes limitation only from the cause-of-action date will reject that fresh complaint as time-barred and leave a payee who did nothing wrong without a remedy.
- *authority* - NI Act §142(1)(b) proviso as read in Yogendra Pratap Singh v. Savitri Pandey (2014) 10 SCC 713 (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - NI Act §142(1)(b) proviso as read in Gajanand Burange v. Laxmi Chand Goyal (2022 SCC OnLine SC 1711) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - workflow-step: filing - condonation of delay under the section 142(1)(b) proviso
- *test* - A fresh complaint linked to a premature-filing dismissal within one month of that order is accepted without a separate condonation application; every other late filing requires a recorded condonation order with reasons.
- *related* - REQ-LIM-013

**REQ-LIM-015** · MUST · firm · from caselaw

The system MUST record any part payment made after the cheque was drawn and before it was presented, together with whether that payment was endorsed on the cheque under section 56.

- *why* - Dashrathbhai holds that the cheque must represent a legally enforceable debt at maturity, that a part payment made in the interval must be endorsed on the instrument, and that dishonour of the unendorsed cheque does not attract section 138. A record that carries only the cheque face value cannot tell a good complaint from one that is bound to fail, and the defect surfaces only at judgment after a full trial.
- *authority* - NI Act §56 as read in Dashrathbhai Trikambhai Patel v. Hitesh Mahendrabhai Patel (2022 SCC OnLine SC 1376) (`ni:sec_56` - 56. Indorsement for part of sum due) [open](#law?act=ni&eid=sec_56)
- *authority* - NI Act §138 as read in Dashrathbhai Trikambhai Patel v. Hitesh Mahendrabhai Patel (2022 SCC OnLine SC 1376) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: cheque record - interim part payments and the section 56 endorsement
- *test* - Part payments between drawing and presentment can be entered with dates and an endorsed yes/no; where an unendorsed part payment is recorded, the case view shows the enforceable sum at maturity as different from the cheque amount.
- *related* - REQ-PRE-015

#### NOT - the statutory demand notice (11)

**REQ-NOT-001** · MUST · firm · from act

The system MUST store the demand notice as a document on the case record, not merely a flag or a date that a notice was sent.

- *why* - The proviso requires a demand in writing. Whether a document is a valid statutory notice turns on what it says, and that question is litigated in most contested cases. A record that carries only a tick box cannot answer it, and the notice then has to be produced from the advocate's own file, if it survives.
- *authority* - NI Act §138 proviso (b) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: demand notice - the notice document itself
- *test* - The notice record cannot be saved without an attached document; opening the case shows the notice text or image, not only its date.

**REQ-NOT-002** · MUST · firm · from act

The system MUST flag any case in which the person who gave the demand notice is not the same payee or holder in due course who is named as complainant.

- *why* - The demand must come from the payee or the holder in due course, and the complaint must come from the same person. Where the notice went out from a sister concern, an agent or an assignee, the prosecution fails on a point that is visible on the face of the papers. A system that does not compare the two lets that case run to evidence.
- *authority* - NI Act §138 proviso (b) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §142(1)(a) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - NI Act §9 (`ni:sec_9` - 9. “Holder in due course”) [open](#law?act=ni&eid=sec_9)
- *authority* - NI Act §8 (`ni:sec_8` - 8. “Holder”) [open](#law?act=ni&eid=sec_8)
- *binds* - validation-rule: demand notice - identity of the demandant against the complainant
- *test* - Enter a notice issued by a party other than the complainant: the build raises a blocking flag naming the mismatch before the complaint can be numbered.
- *related* - REQ-FIL-002

**REQ-NOT-003** · MUST · inferred · from act

The system MUST record the amount demanded in the notice as a field separate from the amount of the cheque.

- *why* - The proviso requires a demand for the said amount of money, meaning the amount of the dishonoured cheque. Notices that bundle in interest, legal costs and damages as a single undivided demand are a standing defence. This is a reading of the words the said amount rather than an express prohibition, so the system flags rather than blocks, but a schema with one shared amount field cannot even surface the issue.
- *authority* - NI Act §138 proviso (b) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: demand notice - amount demanded, distinct from the cheque amount
- *test* - Enter a cheque of 100000 and a notice demanding 118000: the notice record holds both numbers independently.
- *related* - REQ-NOT-004

**REQ-NOT-004** · MUST · contested · from act

The system MUST flag any case in which the amount demanded by the notice exceeds the amount of the cheque.

- *why* - A notice that rolls interest, legal charges and damages into one undivided demand is met with the argument that no valid demand for the said amount was ever made. The authorities divide on it: Dashrathbhai expressly declined to decide the point, and the High Court decisions it discusses go both ways, the Delhi view in Alliance Infrastructure being that a demand for the whole face value after a part payment cannot be a valid notice under proviso (b), while other courts treat the excess as surplusage so long as the cheque amount is demanded. So the system flags rather than blocks: a build that silently equates the two figures conceals a live defence, and one that rejects the mismatch decides a question the Supreme Court left open.
- *authority* - NI Act §138 proviso (b) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §138 proviso (b) as read in Dashrathbhai Trikambhai Patel v. Hitesh Mahendrabhai Patel (2022 SCC OnLine SC 1376) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - validation-rule: demand notice - amount demanded against the cheque amount
- *test* - Enter a notice demanding more than the cheque amount: the case shows a non-blocking flag naming the excess and the proviso, the filing is not refused, and the difference is displayed on the case view rather than silently overwritten.
- *related* - REQ-NOT-003, REQ-LIM-015

**REQ-NOT-005** · MUST · firm · from act

Where the demand notice was sent by post, the system MUST record that it was properly addressed, pre-paid and posted by registered post, as the conditions on which service is deemed effected.

- *why* - The presumption of service under the General Clauses Act attaches only if all three conditions are met. A record showing only that something was posted cannot support the presumption, so the complainant is thrown back on proving actual receipt, which is exactly what the presumption exists to avoid when the drawer avoids the postman.
- *authority* - General Clauses Act §27 (`genclauses:sec_27` - 27. Meaning of service by post) [open](#law?act=genclauses&eid=sec_27)
- *authority* - NI Act §138 proviso (b) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: demand notice - despatch particulars supporting deemed service
- *how* - By properly addressing, pre-paying and posting by registered post a letter containing the notice.
- *test* - The despatch record captures the address used, the mode as registered post, and the pre-payment or receipt reference; a despatch recorded as ordinary post does not raise the deemed-service presumption in the case view.
- *related* - REQ-NOT-011

**REQ-NOT-007** · MUST · inferred · from act

The system MUST treat a demand notice recorded as refused, uncollected or returned undelivered as served, subject to rebuttal by the drawer.

- *why* - Refusal and non-collection are the ordinary way a drawer meets a section 138 notice. A system that reads those outcomes as failure of service closes the case or sends a fresh notice when the law already deems the notice served unless the contrary is proved, and the cause of action is lost while the payee re-notices. The rebuttability is express in the General Clauses Act; the mapping of the specific postal endorsements onto it is a reading of that section.
- *authority* - General Clauses Act §27 (`genclauses:sec_27` - 27. Meaning of service by post) [open](#law?act=genclauses&eid=sec_27)
- *authority* - NI Act §138 proviso (b) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - workflow-step: demand notice - deemed service on refusal or non-collection, with a rebuttal finding
- *test* - Record the outcome as refused: a cause-of-action date is computed from deemed receipt, and fields exist for the drawer's rebuttal and the court's finding on it.
- *related* - REQ-NOT-011

**REQ-NOT-008** · MUST · firm · from act

The system MUST record any payment made by the drawer within the fifteen days after receipt of the notice, with its date and its amount.

- *why* - The offence is complete only when the drawer fails to pay the amount of the cheque within fifteen days. Part payment inside the window neither completes nor defeats the offence, and it changes what is left to be compensated. A system that treats any payment as satisfaction will wrongly close live cases; one that records no payment at all leaves the court to compute the balance from oral submissions.
- *authority* - NI Act §138 proviso (c) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: drawer payments within the notice period, with date and amount
- *test* - A payment inside the notice period can be recorded with a date and an amount, and appears on the case record against the notice.
- *related* - REQ-NOT-009

**REQ-NOT-009** · MUST NOT · firm · from act

The system MUST NOT treat the cause of action as extinguished by a payment within the notice period that is less than the amount of the cheque.

- *why* - The offence is complete unless the drawer pays the said amount of money, which is the amount of the cheque. A build that closes the case on any payment inside the window shuts down live prosecutions on a part payment made precisely to buy time, and the payee has no route back because the one-month period runs on regardless.
- *authority* - NI Act §138 proviso (c) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - validation-rule: cause of action - effect of a part payment within the notice period
- *test* - Record a payment of half the cheque amount on day ten: the cause of action still arises on day sixteen and the recorded balance is the cheque amount less the payment.
- *related* - REQ-NOT-008

**REQ-NOT-010** · MUST · firm · from caselaw

The system MUST record the address to which the demand notice was sent, the mode of despatch and the tracking number, separately from any proof of delivery.

- *why* - Deemed service under section 27 of the General Clauses Act turns on the notice having been correctly addressed and properly despatched, not on delivery. Where the record holds only a delivery receipt, a notice that came back undelivered looks like a failed notice, and the complaint is dismissed for want of a cause of action even though the payee did everything the proviso required.
- *authority* - General Clauses Act §27 as read in C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555 (`genclauses:sec_27` - 27. Meaning of service by post) [open](#law?act=genclauses&eid=sec_27)
- *authority* - NI Act §138 proviso (b) as read in K. Bhaskaran v. Sankaran Vaidhyan Balan (1999) 7 SCC 510 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: demand notice record - address used, mode of despatch, tracking number
- *test* - The notice record can be completed and the complaint filed where despatch particulars are present and proof of delivery is absent; the four fields are separately queryable.
- *related* - REQ-NOT-011, REQ-FIL-009

**REQ-NOT-011** · MUST · firm · from caselaw

The system MUST record the outcome of the demand notice as an enumerated value distinguishing delivery, refusal, non-collection and return undelivered.

- *why* - C.C. Alavi Haji holds that a notice correctly addressed and sent by registered post is deemed served, and it is then for the drawer to rebut that presumption. Refusal and non-collection are the ordinary way a drawer meets a section 138 notice. A system whose service status has only served and not served records the commonest real-world outcome, an unclaimed return, as a failure, and cognizance is refused on a complaint the law treats as complete.
- *authority* - General Clauses Act §27 as read in C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555 (`genclauses:sec_27` - 27. Meaning of service by post) [open](#law?act=genclauses&eid=sec_27)
- *authority* - Indian Evidence Act §114 as read in C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555 (`iea:sec_114` - 114. Court may presume existence of certain facts. –– The Court may presume the existence of any) [open](#law?act=iea&eid=sec_114)
- *binds* - schema-field: demand notice record - service outcome, including deemed service
- *test* - The outcome field offers delivered, refused, uncollected and returned undelivered as distinct values; no binary served or not served control appears, and a complaint carrying any of the last three passes the cause-of-action check.
- *related* - REQ-NOT-005, REQ-NOT-007, REQ-NOT-010, REQ-LIM-012, REQ-SRV-001

**REQ-NOT-012** · MUST · firm · from caselaw

The system MUST permit more than one presentment of the same cheque and a fresh demand notice on each dishonour, each carrying its own cause of action.

- *why* - MSR Leathers overruled Sadanandan Bhadran and held that a prosecution may be founded on any subsequent dishonour. A schema that binds one presentment and one notice to a cheque forces the payee to prosecute on the first default, destroys the space in which parties negotiate, and blocks the valid complaint that follows a later dishonour.
- *authority* - NI Act §138 proviso as read in MSR Leathers v. S. Palaniappan (2013) 1 SCC 177 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §142 as read in MSR Leathers v. S. Palaniappan (2013) 1 SCC 177 (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: cause of action - prosecution founded on a subsequent dishonour
- *test* - A complaint founded on the second or a later dishonour of the same cheque passes the cause-of-action check; no rule refuses it on the ground that an earlier dishonour of that cheque was already recorded or already noticed.
- *related* - REQ-LIM-010, REQ-LIM-011, REQ-LIM-012

#### FIL - filing, court fee, scrutiny, numbering (17)

**REQ-FIL-001** · MUST · firm · from act

The system MUST require the section 138 complaint to exist as a written complaint document before it can be numbered.

- *why* - Section 142 permits cognizance only upon a complaint in writing. A filing flow that captures structured fields and generates nothing signed leaves the court with no complaint to take cognizance of, and the defect goes to jurisdiction rather than to form.
- *authority* - NI Act §142(1)(a) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: complaint filing - a written complaint document as a precondition to numbering
- *test* - Attempt to number a case from form fields alone with no complaint document attached: the build refuses and names section 142(1)(a).

**REQ-FIL-002** · MUST · firm · from act

The system MUST record the capacity in which the complainant sues, as payee or as holder in due course, as a distinct field on the complaint.

- *why* - Only the payee or the holder in due course can set a section 138 prosecution going. Where the complainant is an indorsee or an assignee, the capacity determines whether the complaint is competent at all, and it determines which presumptions the complainant can call on. A free-text party record cannot be queried for it and cannot be validated.
- *authority* - NI Act §142(1)(a) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - NI Act §9 (`ni:sec_9` - 9. “Holder in due course”) [open](#law?act=ni&eid=sec_9)
- *authority* - NI Act §8 (`ni:sec_8` - 8. “Holder”) [open](#law?act=ni&eid=sec_8)
- *binds* - schema-field: complainant - capacity as payee or holder in due course
- *test* - The complainant record carries an enumerated capacity field; it is mandatory; the complaint cannot be numbered without it.
- *related* - REQ-NOT-002, REQ-PRE-008

**REQ-FIL-004** · MUST · firm · from act

The system MUST record the payment of process fees before any summons or warrant can be issued in the case.

- *why* - Process cannot issue until the fees payable are paid, and if they are not paid within a reasonable time the complaint may be dismissed. A workflow that issues summons on the magistrate's order without checking the fee produces process the court had no power to issue, and a workflow with no fee clock cannot tell the magistrate which files are ripe for dismissal.
- *authority* - BNSS §227(4) (`bnss:sec_227` - 227. Issue of process) [open](#law?act=bnss&eid=sec_227)
- *authority* - CrPC §204(4) (`crpc:sec_204` - 204. Issue of process) [open](#law?act=crpc&eid=sec_204)
- *binds* - workflow-step: issue of process - fee payment as a precondition
- *test* - With process fee unpaid, the issue-summons action is unavailable and the case appears in a list of complaints awaiting process fee with the elapsed time shown.

**REQ-FIL-005** · MUST · firm · from act

The system MUST allow either party to claim free legal services on one of the statutory criteria, at any stage of a section 138 case.

- *why* - Entitlement to legal services turns on categories the court sees at filing, such as a woman, a member of a Scheduled Caste or Tribe, a person with disability, or income below the prescribed limit. If the filing flow has nowhere to record the claim, an entitled accused in a section 138 case appears unrepresented and the entitlement is discovered, if at all, at the stage of sentence.
- *authority* - Legal Services Authorities Act §12 (`lsa:sec_12` - 12. Criteria for giving legal services.) [open](#law?act=lsa&eid=sec_12)
- *authority* - Legal Services Authorities Act §13(2) (`lsa:sec_13` - 13. Entitlement of legal services.) [open](#law?act=lsa&eid=sec_13)
- *binds* - screen: filing and appearance - claim to free legal services
- *test* - A claim can be attached to either party from the filing screen and from any later hearing screen; the ground is chosen from an enumerated list drawn from section 12, free text is not accepted as a ground, and the claim is visible on the case record to the court and to the legal services authority.
- *related* - REQ-FIL-006

**REQ-FIL-006** · MUST · firm · from act

Where the claim to free legal services rests on income, the system MUST accept an affidavit of income as sufficient proof of means.

- *why* - The Act says an affidavit as to income may be regarded as sufficient unless the authority has reason to disbelieve it. A build that demands an income certificate from a revenue authority substitutes a document the statute does not require, and the indigent accused in a section 138 case goes unrepresented for the weeks it takes to obtain one.
- *authority* - Legal Services Authorities Act §13(2) (`lsa:sec_13` - 13. Entitlement of legal services.) [open](#law?act=lsa&eid=sec_13)
- *authority* - Legal Services Authorities Act §12(h) (`lsa:sec_12` - 12. Criteria for giving legal services.) [open](#law?act=lsa&eid=sec_12)
- *binds* - validation-rule: claim to legal services - proof of means
- *how* - An affidavit made by the person as to income may be regarded as sufficient unless the concerned authority has reason to disbelieve it.
- *test* - An income-based claim can be completed with an affidavit alone; no revenue-issued certificate is required as a precondition.
- *related* - REQ-FIL-005

**REQ-FIL-007** · MUST · inferred · from act

The system MUST make the filing registry able to accept and store documents in accessible formats where a party is a person with disability.

- *why* - The access-to-justice duty requires filing departments and registries to be equipped to file, store and refer to documents and evidence in accessible formats. A portal that accepts only scanned image PDFs makes the record unreadable to a blind complainant or accused, and the barrier is created by the system rather than removed by it.
- *authority* - RPwD Act §12(4)(b) (`rpwd:sec_12` - 12. Access to justice.) [open](#law?act=rpwd&eid=sec_12)
- *authority* - RPwD Act §12(1) (`rpwd:sec_12` - 12. Access to justice.) [open](#law?act=rpwd&eid=sec_12)
- *binds* - screen: filing registry - acceptance and storage of documents in accessible formats
- *test* - A text-layer PDF or tagged document can be filed and is retrievable in that form; the registry does not flatten filings into images without a text layer.

**REQ-FIL-008** · MUST · firm · from caselaw

The system MUST require a sworn affidavit with the complaint disclosing whether any other complaint on the same transaction is pending in any other court.

- *why* - Damodar S. Prabhu made this disclosure mandatory to stop the same transaction being litigated across several jurisdictions. Where the affidavit is optional or is collected as free text, the registry has nothing to match on, multiplicity is discovered only when an accused raises it, and the cost order the Court contemplated cannot be made.
- *authority* - NI Act §142 as read in Damodar S. Prabhu v. Sayed Babalal H (2010) 5 SCC 663 (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: filing - mandatory no-other-complaint affidavit
- *test* - A complaint cannot be accepted without the affidavit; the answer is stored as a structured yes/no with court and case particulars where yes, not as prose.
- *related* - REQ-JUR-013, REQ-FIL-009

**REQ-FIL-009** · MUST · firm · from caselaw

Every complaint under section 138 MUST carry the prescribed synopsis, placed immediately after the index and before the complaint itself.

- *why* - Sanjabij Tari prescribes the exact synopsis format and directs High Courts and District Courts to implement it. Its whole purpose is that the magistrate can verify the ingredients and limitation from one page instead of reconstructing them from the body of the complaint. A system that generates a complaint without it produces a document courts are directed to expect and do not get, and scrutiny stays as slow as it was.
- *authority* - NI Act §142 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - NI Act §138 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - output-document: complaint - prescribed synopsis sheet
- *how* - The synopsis carries seven heads in order: particulars of the parties (for a company or firm accused, the registered address, the managing director or partner, the signatory and the persons vicariously liable); cheque details (number, date, amount, drawee bank and branch, account number); dishonour (date of presentation, date of return memo, branch where dishonoured, reason); statutory notice (date, mode of service, date of despatch and tracking number, proof and date of delivery, whether served and if not the reasons, reply if any); cause of action (date of accrual, jurisdiction invoked under section 142(2), whether any other section 138 complaint is pending between the same parties and if so the court, date and year); relief sought (summoning and trial, and whether interim compensation under section 143A is sought); and filed through complainant or authorised representative.
- *test* - The generated complaint bundle opens with a synopsis containing all seven heads; every field is populated from structured data, not typed prose, and any field left blank is reported at scrutiny.
- *related* - REQ-FIL-008, REQ-NOT-010, REQ-JUR-011, REQ-SEN-021

**REQ-FIL-010** · MUST · firm · from caselaw

The system MUST present a complaint for scrutiny to the magistrate on the day it is filed, and MUST allow cognizance and issue of summons in that same step where the affidavit and documents are in order.

- *why* - The first direction in Indian Bank Association is that on the day the complaint is presented the magistrate scrutinises it and, if the affidavit and documents are in order, takes cognizance and directs summons. Where a system routes filing to a registry queue that reaches the magistrate weeks later, the six month endeavour under section 143(3) is lost before the case has begun.
- *authority* - NI Act §143 as read in Indian Bank Association v. Union of India (2014) 5 SCC 590 (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *authority* - NI Act §145 as read in Indian Bank Association v. Union of India (2014) 5 SCC 590 (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *binds* - workflow-step: filing to cognizance - same-day scrutiny
- *how* - Scrutiny, cognizance and the direction to issue summons are a single magistrate action on the filing date; the complainant's affidavit and documents are the material examined, with no separate preliminary evidence step.
- *test* - The interval between the filing timestamp and the scrutiny listing is zero days by default, and the cognizance action offers issue summons without an intervening step.
- *related* - REQ-EVI-014, REQ-SRV-015

**REQ-FIL-011** · MUST · firm · from caselaw

Where the payee is a company, firm or other juristic person, the system MUST record that entity as the complainant and separately identify the authorised natural person who presents and prosecutes the complaint.

- *why* - Section 142 requires the complaint to be made by the payee, and a juristic payee can act only through a person. TRL Krosaki holds that the company is the de jure complainant and its authorised employee the de facto complainant, and that the latter may change over the life of the case. A schema with a single complainant field forces the drafter to choose, and either the complaint is not in the name of the payee, which is the only eligibility condition section 142 imposes, or the human being who must be examined is nowhere on the record.
- *authority* - NI Act §142(1)(a) as read in TRL Krosaki Refractories Ltd v. SMS Asia Pvt Ltd (2022) 7 SCC 612 (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - NI Act §141 Explanation (`ni:sec_141` - 141. Offences by companies) [open](#law?act=ni&eid=sec_141)
- *binds* - schema-field: complaint - complainant entity and its authorised representative as distinct parties
- *test* - Selecting a juristic complainant makes the representative record mandatory, with name, designation and the authorisation document; replacing the representative does not alter the complainant of record.
- *related* - REQ-FIL-012, REQ-FIL-013, REQ-FIL-014

**REQ-FIL-012** · MUST · firm · from caselaw

Where the complaint is filed through a power-of-attorney holder or an authorised representative, it MUST carry an explicit averment of that person's personal knowledge of the transaction.

- *why* - A.C. Narayanan requires the assertion of the attorney holder's knowledge to be made explicitly in the complaint, and holds that an attorney holder without knowledge cannot be examined as a witness. If the complaint form does not compel that averment, the complainant's own evidence becomes inadmissible mid-trial and the prosecution collapses on a defect that could have been cured at filing.
- *authority* - NI Act §142 as read in A.C. Narayanan v. State of Maharashtra (2014) 11 SCC 790 (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - NI Act §145 as read in A.C. Narayanan v. State of Maharashtra (2014) 11 SCC 790 (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *binds* - validation-rule: complaint - knowledge averment where filed through a representative
- *test* - Selecting filed through representative makes the knowledge averment a required field, and the averment appears verbatim in the generated complaint.
- *related* - REQ-FIL-011, REQ-FIL-013

**REQ-FIL-013** · MUST · firm · from caselaw

The system MUST hold the instrument of authority relied on by a representative complainant, and MUST record whether it expressly permits sub-delegation.

- *why* - A.C. Narayanan holds that a power of attorney holder can further delegate only where the instrument expressly says so, and that sub-delegation otherwise is invalid in law. Where the record holds only the name of the person signing, an invalid sub-delegation is invisible until the accused produces the deed at trial and the complaint is found to have been instituted by someone with no authority.
- *authority* - NI Act §142 as read in A.C. Narayanan v. State of Maharashtra (2014) 11 SCC 790 (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - schema-field: complaint - instrument of authority and its sub-delegation clause
- *test* - The representative record links to an uploaded authority document with a sub-delegation permitted yes/no; a representative appointed by sub-delegation cannot be recorded where the answer is no.
- *related* - REQ-FIL-012

**REQ-FIL-014** · MUST NOT · firm · from caselaw

The system MUST NOT block filing or cognizance for want of proof of the representative's authorisation or knowledge.

- *why* - TRL Krosaki holds that an averment of authorisation and knowledge with prima facie material is enough for cognizance, that dismissal at the threshold on the authorisation question is not justified, and that a genuine dispute about it is an issue for trial. A scrutiny rule that demands documentary proof at the counter converts a triable issue into a filing bar and sends the complainant to the High Court.
- *authority* - NI Act §142 as read in TRL Krosaki Refractories Ltd v. SMS Asia Pvt Ltd (2022) 7 SCC 612 (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: scrutiny - authorisation of the representative complainant
- *test* - A complaint carrying the averment but no supporting resolution is accepted and numbered; the absence is recorded as an issue for trial, not as a scrutiny defect.
- *related* - REQ-FIL-011, REQ-FIL-012

**REQ-FIL-015** · MUST · firm · from caselaw

Where the drawer of the cheque is a company or a firm, the system MUST require that entity to be arraigned as an accused before any director, partner or signatory can be arraigned.

- *why* - Aneeta Hada holds that for vicarious liability under section 141 the company must be an accused, and Dilip Hariramani applies the same rule to a firm, setting aside a partner's conviction because the firm was not prosecuted. A complaint form that permits a director to be named alone produces a prosecution that is void from the outset, and the defect is discovered on appeal after a conviction.
- *authority* - NI Act §141 as read in Aneeta Hada v. Godfather Travels & Tours Pvt Ltd (2012) 5 SCC 661 (`ni:sec_141` - 141. Offences by companies) [open](#law?act=ni&eid=sec_141)
- *authority* - NI Act §141 as read in Dilip Hariramani v. Bank of Baroda (2022 SCC OnLine SC 579) (`ni:sec_141` - 141. Offences by companies) [open](#law?act=ni&eid=sec_141)
- *binds* - validation-rule: complaint - arraignment of the company or firm as accused
- *test* - Adding an accused whose liability is stated to arise under section 141 is blocked unless the company or firm is already on the array of accused; removing the entity flags every dependent accused.
- *related* - REQ-FIL-016, REQ-FIL-017

**REQ-FIL-016** · MUST · firm · from caselaw

For each director or partner arraigned under section 141, the complaint MUST carry a specific averment of how that person was in charge of, and responsible to, the company or firm for the conduct of its business at the time of the offence.

- *why* - S.M.S. Pharmaceuticals holds the averment to be an essential requirement of section 141, and Siby Thomas holds that a bare reproduction of the statutory words is not enough. Where a template auto-fills the same statutory sentence against every accused, the complaint is quashed against each of them and the payee is left with a prosecution only against the company.
- *authority* - NI Act §141(1) as read in S.M.S. Pharmaceuticals Ltd v. Neeta Bhalla (2005) 8 SCC 89 (`ni:sec_141` - 141. Offences by companies) [open](#law?act=ni&eid=sec_141)
- *authority* - NI Act §141(1) as read in Siby Thomas v. M/s Somany Ceramics Ltd (2023 INSC 890) (`ni:sec_141` - 141. Offences by companies) [open](#law?act=ni&eid=sec_141)
- *authority* - NI Act §141(1) as read in S.P. Mani & Mohan Dairy v. Snehalatha Elangovan (2022 SCC OnLine SC 1238) (`ni:sec_141` - 141. Offences by companies) [open](#law?act=ni&eid=sec_141)
- *binds* - schema-field: complaint - per-accused role averment under section 141
- *test* - The role averment is a per-accused field; two accused cannot be saved with byte-identical averment text, and the field is not pre-filled with the statutory wording.
- *related* - REQ-FIL-015, REQ-FIL-017, REQ-FIL-018

**REQ-FIL-017** · MUST · firm · from caselaw

The system MUST record the basis of each accused's liability as one of signatory of the cheque, holder of an office that carries charge of the business, or averred charge and responsibility.

- *why* - S.M.S. Pharmaceuticals and National Small Industries Corporation distinguish these: the signatory is covered by section 141(2) for the incriminating act, a managing or joint managing director is in charge by virtue of the office, and every other person must be brought in by averment. A record that treats all three alike either demands an unnecessary averment against the signatory or lets an ordinary director in without one.
- *authority* - NI Act §141(2) as read in S.M.S. Pharmaceuticals Ltd v. Neeta Bhalla (2005) 8 SCC 89 (`ni:sec_141` - 141. Offences by companies) [open](#law?act=ni&eid=sec_141)
- *authority* - NI Act §141 as read in National Small Industries Corp Ltd v. Harmeet Singh Paintal (2010) 3 SCC 330 (`ni:sec_141` - 141. Offences by companies) [open](#law?act=ni&eid=sec_141)
- *binds* - schema-field: complaint - basis of vicarious liability per accused
- *test* - Each section 141 accused carries a liability-basis value; the role averment is required only where the basis is averred charge and responsibility.
- *related* - REQ-FIL-016

**REQ-FIL-018** · MUST · firm · from caselaw

Where an accused is described as a non-executive or independent director, the complaint MUST record the material relied on to show that person's part in the conduct of the business.

- *why* - Sunita Palita holds that non-executive and independent directors cannot be roped in without specific averments and supporting material. Without a field that forces the material to be named, such directors are added routinely, appear on bail, and are discharged years later at High Court cost, which is precisely the abuse the Court described.
- *authority* - NI Act §141 as read in Sunita Palita v. Panchami Stone Quarry (2022) 10 SCC 152 (`ni:sec_141` - 141. Offences by companies) [open](#law?act=ni&eid=sec_141)
- *authority* - NI Act §141 as read in Gunmala Sales Pvt Ltd v. Anu Mehta (2015) 1 SCC 103 (`ni:sec_141` - 141. Offences by companies) [open](#law?act=ni&eid=sec_141)
- *binds* - validation-rule: complaint - non-executive or independent director accused
- *test* - Marking an accused as non-executive or independent makes a supporting-material field mandatory; the field is reproduced in the complaint against that accused.
- *related* - REQ-FIL-016

#### SRV - service of summons and process (16)

**REQ-SRV-001** · MUST · firm · from act

The system MUST attach a copy of the complaint to every summons or warrant issued in a section 138 case.

- *why* - The requirement is absolute in a proceeding instituted on a written complaint, and C.C. Alavi Haji makes the drawer's escape route depend on it: a drawer who says he never received the demand notice may still avoid liability by paying the cheque amount within fifteen days of receiving the summons along with a copy of the complaint. If the summons goes out alone, the drawer cannot know the amount demanded, that fifteen-day window is meaningless, and the safeguard that justifies deemed service of the notice disappears.
- *authority* - BNSS §227(3) (`bnss:sec_227` - 227. Issue of process) [open](#law?act=bnss&eid=sec_227)
- *authority* - CrPC §204(3) (`crpc:sec_204` - 204. Issue of process) [open](#law?act=crpc&eid=sec_204)
- *authority* - NI Act §144 as read in C.C. Alavi Haji v. Palapetty Muhammed (2007) 6 SCC 555 (`ni:sec_144` - 144. Mode of service of summons) [open](#law?act=ni&eid=sec_144)
- *binds* - output-document: summons - complaint copy as an inseparable enclosure
- *test* - Generate a summons: the produced packet contains the complaint copy, there is no path that produces a summons without it, and the service record notes that the complaint copy accompanied it.
- *related* - REQ-NOT-011, REQ-CMP-008

**REQ-SRV-002** · MUST NOT · firm · from act

The system MUST NOT issue a summons or warrant in a section 138 case until the list of prosecution witnesses has been filed.

- *why* - The bar is expressed as a prohibition on issuing process. A workflow that lets the magistrate issue summons on the day of cognizance and collects the witness list later produces process issued in breach of an express bar, and the point is available to the accused on the first date.
- *authority* - BNSS §227(2) (`bnss:sec_227` - 227. Issue of process) [open](#law?act=bnss&eid=sec_227)
- *authority* - CrPC §204(2) (`crpc:sec_204` - 204. Issue of process) [open](#law?act=crpc&eid=sec_204)
- *binds* - workflow-step: issue of process - witness list as a precondition
- *test* - With no witness list on the file, the issue-summons action is unavailable and the reason names section 227(2).
- *related* - REQ-FIL-004

**REQ-SRV-003** · MUST · firm · from act

The system MUST produce a summons in the statutory form, signed by the presiding officer or an officer the High Court directs by rule and bearing the seal of the court, or in an electronic form bearing the image of the seal or a digital signature.

- *why* - A summons without seal and signature is not a summons, and service of it proves nothing. Where a court moves to electronic issue without carrying the seal image or a digital signature across, every service in the interim is open to attack and the cases have to be re-served.
- *authority* - BNSS §63 (`bnss:sec_63` - 63. Form of summons) [open](#law?act=bnss&eid=sec_63)
- *binds* - output-document: summons - form, signature and seal
- *how* - In writing, in duplicate, signed by the presiding officer of the court or by such other officer as the High Court by rule directs, bearing the seal of the court; or in an encrypted or other form of electronic communication bearing the image of the seal of the court or a digital signature.
- *test* - The generated summons carries a visible seal and a signature or digital signature; a summons generated with an unconfigured seal or an absent signing credential is refused rather than produced unsealed.

**REQ-SRV-004** · MUST · firm · from act

The system MUST support service of the summons by speed post or by a courier service approved by a Court of Session, at the place where the accused or witness ordinarily resides, carries on business or personally works for gain.

- *why* - Section 144 gives the section 138 court a mode of service the general code does not, and it is the mode that actually works against a drawer who evades the process server. A system that offers only police service and personal tender leaves the court with the slowest route in the very cases the special provision was written for.
- *authority* - NI Act §144(1) (`ni:sec_144` - 144. Mode of service of summons) [open](#law?act=ni&eid=sec_144)
- *binds* - workflow-step: service of summons - speed post and approved courier as available modes
- *how* - By speed post, or by such courier services as are approved by a Court of Session, directed to the place where the accused or witness ordinarily resides or carries on business or personally works for gain.
- *test* - The service mode list on a section 138 case includes speed post and approved courier; selecting courier requires a courier drawn from a list of services approved by the Court of Session.
- *related* - REQ-SRV-005

**REQ-SRV-005** · MUST · firm · from act

Where service is by an approved courier, the system MUST record which Court of Session approved that courier service.

- *why* - The special mode works only through a courier a Court of Session has approved. Service through an unapproved courier is not service under section 144, so the deemed-service declaration that follows it is unsupported, and the accused's absence cannot be treated as wilful.
- *authority* - NI Act §144(1) (`ni:sec_144` - 144. Mode of service of summons) [open](#law?act=ni&eid=sec_144)
- *binds* - schema-field: service record - the approving Court of Session for a courier service
- *test* - A courier cannot be selected as a service mode unless it is on the approved list, and the service record shows the approving Court of Session.
- *related* - REQ-SRV-004

**REQ-SRV-006** · MUST NOT · firm · from act

The system MUST NOT allow the court to declare a summons duly served under section 144 unless an acknowledgment purporting to be signed by the accused or witness, or an endorsement of refusal by the postal or courier service, is on the record.

- *why* - The declaration of due service is what lets the case proceed in the drawer's absence and is the foundation for coercive process against him. Section 144(2) makes one of those two documents the condition for it. A declaration made on a tracking status or a returned envelope with no endorsement puts the whole subsequent proceeding at risk.
- *authority* - NI Act §144(2) (`ni:sec_144` - 144. Mode of service of summons) [open](#law?act=ni&eid=sec_144)
- *binds* - workflow-step: declaration of due service - required proof
- *how* - Either an acknowledgment purporting to be signed by the accused or the witness, or an endorsement purporting to be made by a person authorised by the postal department or the courier service that the accused or witness refused to take delivery.
- *test* - With only a delivery status and no acknowledgment or refusal endorsement, the declare-duly-served action is unavailable; attaching either document enables it.
- *related* - REQ-SRV-004

**REQ-SRV-007** · MUST · firm · from act

The system MUST record the address, email address and telephone number of the person summoned in the court's process register.

- *why* - The Sanhita makes the register with these particulars a duty of the registrar in the court and of the police station. Without it there is no persistent record of the contact details actually used for a service attempt, so a failed service cannot be distinguished from a service sent to a stale address.
- *authority* - BNSS §64(1) proviso (`bnss:sec_64` - 64. Summons how served) [open](#law?act=bnss&eid=sec_64)
- *binds* - schema-field: process register - address, email and telephone of the person summoned
- *test* - Every process entry carries the address, email and telephone used for that attempt, and later attempts show their own values rather than overwriting the earlier ones.

**REQ-SRV-008** · MUST · firm · from act

Where a summons is served personally, the system MUST capture the receipt signed by the person summoned on the reverse of the duplicate.

- *why* - Personal service is proved by the signed duplicate. Where the serving officer's report is recorded but the signed duplicate is not, service is provable only by calling the officer, which in practice means an adjournment for each contested service.
- *authority* - BNSS §64(2) (`bnss:sec_64` - 64. Summons how served) [open](#law?act=bnss&eid=sec_64)
- *authority* - BNSS §64(3) (`bnss:sec_64` - 64. Summons how served) [open](#law?act=bnss&eid=sec_64)
- *binds* - schema-field: service record - signed duplicate for personal service
- *test* - Recording personal service requires the signed duplicate to be attached; the serving officer's narrative alone does not complete the record.

**REQ-SRV-009** · MUST · firm · from act

Where service is effected by electronic communication, the system MUST record the State rule under which that form and manner of electronic service is provided.

- *why* - Electronic service is permitted only in such form and in such manner as the State Government provides by rules. A court that emails summons before its State has made the rules has not served the accused, and the case is later re-set from the stage of process. Recording the enabling rule makes the gap visible at the point of service rather than at the point of challenge.
- *authority* - BNSS §64(2) proviso (`bnss:sec_64` - 64. Summons how served) [open](#law?act=bnss&eid=sec_64)
- *authority* - BNSS §63(ii) (`bnss:sec_63` - 63. Form of summons) [open](#law?act=bnss&eid=sec_63)
- *binds* - schema-field: service record - the State rule authorising electronic service
- *test* - Selecting electronic service requires a rule reference; in a State with no such rule configured, electronic service is not offered as a mode.

**REQ-SRV-010** · MUST · inferred · from act

The system MUST record, against every warrant sent for execution, the officer to whom it was entrusted and the date it was returned executed or unexecuted.

- *why* - The duty to obey and execute the court's warrants promptly is a statutory duty of the police officer, and neglect of it is itself punishable. Without the entrustment and return recorded, a warrant that is simply never executed is indistinguishable from one that could not be executed, and the court has no way to fix responsibility. The duty is express; the recording of entrustment and return is the reading of it that makes the duty checkable.
- *authority* - Police Act 1861 §23 (`police1861:sec_23` - 23. Duties of police-officers.) [open](#law?act=police1861&eid=sec_23)
- *authority* - Police Act 1861 §29 (`police1861:sec_29` - 29. Penalties for neglect of duty, etc.) [open](#law?act=police1861&eid=sec_29)
- *binds* - schema-field: warrant record - officer entrusted and date of return
- *test* - Every issued warrant shows an entrusted officer and either a return date with an outcome or an ageing counter since entrustment.

**REQ-SRV-011** · MUST · firm · from caselaw

The system MUST capture the accused's email address, mobile number and messaging application details at the time of filing, verified by the complainant's affidavit.

- *why* - Sanjabij Tari directs the complainant to provide these particulars on affidavit so that electronic service under the BNSS rules is possible. Service failure is the single largest cause of delay in these cases: the Court recorded that a large share of criminal cases stagnating on service are section 138 matters. A complaint form that captures only a postal address guarantees the case joins that pile.
- *authority* - NI Act §144 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_144` - 144. Mode of service of summons) [open](#law?act=ni&eid=sec_144)
- *authority* - BNSS §64 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`bnss:sec_64` - 64. Summons how served) [open](#law?act=bnss&eid=sec_64)
- *binds* - schema-field: accused party record - electronic contact particulars with verifying affidavit
- *test* - Filing requires at least one electronic contact particular for each accused and an affidavit verifying that it belongs to that accused; the particulars flow into the summons issue step.
- *related* - REQ-SRV-012, REQ-SRV-013

**REQ-SRV-012** · MUST · firm · from caselaw

The system MUST issue summons by post and by electronic means in addition to any other prescribed mode, and MUST record each mode attempted with its outcome.

- *why* - Indian Bank Association directs that summons be properly addressed and sent by post as well as to the email address obtained from the complainant, and Sanjabij Tari directs recourse to electronic service under the applicable BNSS rules. A service record with a single mode and a single outcome cannot show the court what has been tried, so the case is adjourned for fresh summons on a mode that already failed.
- *authority* - NI Act §144 as read in Indian Bank Association v. Union of India (2014) 5 SCC 590 (`ni:sec_144` - 144. Mode of service of summons) [open](#law?act=ni&eid=sec_144)
- *authority* - BNSS §530 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`bnss:sec_530` - 530. Trial and proceedings to be held in electronic mode) [open](#law?act=bnss&eid=sec_530)
- *binds* - schema-field: summons record - one row per mode attempted, with outcome and date
- *test* - One summons issue produces separate service attempts for post and electronic mode; each carries its own status and date, and the case view shows them together.
- *related* - REQ-SRV-011

**REQ-SRV-013** · MUST · firm · from caselaw

The system MUST additionally issue summons dasti to the complainant for service on the accused.

- *why* - Sanjabij Tari directs that service shall not be confined to the usual modes but shall also be issued dasti, because financial institutions file in metropolitan courts under section 142(2) against accused who often do not live within that court's territory. Where the workflow has no dasti issue, the court's only lever is the process server of a distant jurisdiction and the case waits years on service.
- *authority* - NI Act §144 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_144` - 144. Mode of service of summons) [open](#law?act=ni&eid=sec_144)
- *authority* - NI Act §142(2) as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - workflow-step: summons issue - dasti copy to the complainant
- *test* - Every summons issue generates a dasti copy addressed to the complainant alongside the court-issued copies, without the court having to order it separately.
- *related* - REQ-SRV-014

**REQ-SRV-014** · MUST · firm · from caselaw

The system MUST require the complainant to file an affidavit of service where summons was served dasti, and MUST retain it on the record.

- *why* - Sanjabij Tari directs the complainant to file an affidavit of service and reserves liberty to act against a complainant whose affidavit is false. If dasti service is recorded as a bare status set by the complainant, there is no deponent and no document, so a false claim of service leads to an ex parte trial with nothing on the record to act on.
- *authority* - NI Act §144 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_144` - 144. Mode of service of summons) [open](#law?act=ni&eid=sec_144)
- *binds* - validation-rule: service record - affidavit of service for dasti service
- *test* - Dasti service cannot be marked effected without an uploaded affidavit of service; the affidavit is retrievable from the service record and named in the order sheet.
- *related* - REQ-SRV-013

**REQ-SRV-015** · MUST NOT · firm · from caselaw

In a section 138 complaint the system MUST NOT make a pre-cognizance notice or summons to the accused under section 223 BNSS a precondition to taking cognizance.

- *why* - The first proviso to section 223(1) of the Sanhita bars cognizance without giving the accused an opportunity of being heard, and nothing equivalent existed under the Code. For section 138 complaints that proviso has been displaced: Sanjabij Tari agrees with the Karnataka High Court in Ashok v. Fayaz Aahmad that the NI Act is a special enactment and directs that there shall be no requirement to issue summons to the accused in terms of section 223 BNSS at the pre-cognizance stage. A build that reads the proviso literally inserts an entire service cycle before cognizance, doubling the service problem the same judgment sets out to solve; a build that ignores the proviso without recording why leaves the point unanswerable on appeal.
- *authority* - BNSS §223(1) first proviso as displaced for section 138 complaints in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`bnss:sec_223` - 223. Examination of complainant) [open](#law?act=bnss&eid=sec_223)
- *authority* - NI Act §142 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - workflow-step: cognizance - pre-cognizance notice to the accused
- *test* - On a BNSS-governed section 138 complaint the cognizance step follows scrutiny directly: no pre-cognizance notice task is generated, none is required to close the step, and the cognizance order records the section 223 proviso as displaced for these complaints.
- *related* - REQ-FIL-010, REQ-JUR-007

**REQ-SRV-016** · MUST NOT · firm · from act

The system MUST NOT issue a warrant in place of or in addition to a summons in a section 138 case without recorded reasons and one of the two statutory grounds.

- *why* - A section 138 case is a summons case and the drawer is not an absconder merely because a postal article came back. The power to issue a warrant is conditioned on reasons in writing and on either a belief that the person has absconded or will not obey the summons, or a failure to appear on a summons proved to have been duly served in time. A build that offers a warrant as the next escalation after any failed service produces arrest warrants against drawers who were never served, and the order is unsustainable on the face of the record.
- *authority* - BNSS §90 (`bnss:sec_90` - 90. Issue of warrant in lieu of, or in addition to, summons) [open](#law?act=bnss&eid=sec_90)
- *authority* - CrPC §87 (`crpc:sec_87` - 87. Issue of warrant in lieu of, or in addition to, summons) [open](#law?act=crpc&eid=sec_87)
- *authority* - NI Act §144(2) (`ni:sec_144` - 144. Mode of service of summons) [open](#law?act=ni&eid=sec_144)
- *binds* - validation-rule: process - issue of a warrant in lieu of or in addition to a summons
- *how* - After recording reasons in writing, and on one of two grounds: that the court sees reason to believe the person has absconded or will not obey the summons; or that he has failed to appear on a summons proved to have been duly served in time to admit of his appearing.
- *test* - The warrant action requires a ground selected from the two and free-text reasons; the ground of failure to appear is unavailable unless a declaration of due service under section 144(2) is on the record.
- *related* - REQ-SRV-006, REQ-SRV-010, REQ-TRL-015

#### EVI - evidence, affidavits, documents (17)

**REQ-EVI-001** · MUST · firm · from act

The system MUST allow the complainant's evidence to be filed as an affidavit and to be read in evidence in the enquiry or trial without a separate examination-in-chief.

- *why* - Section 145 is what makes a section 138 trial capable of being finished in a handful of hearings. Where the system models evidence only as deposition recorded in court, every complainant must attend and be examined, and the six-month target in section 143(3) becomes unreachable in any court with a normal docket.
- *authority* - NI Act §145(1) (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *binds* - schema-field: evidence - complainant's affidavit as examination-in-chief
- *test* - An affidavit filed by the complainant appears in the evidence record as examination-in-chief and the case can move to cross-examination without a deposition being recorded.
- *related* - REQ-EVI-002

**REQ-EVI-002** · MUST · firm · from act

The system MUST issue a summons to a person who has given evidence on affidavit on the application of the prosecution or the accused, without offering the court a decision to allow or refuse that application.

- *why* - Section 145(2) says the court may summon on its own view but shall summon on the application of a party. If the workflow models the summoning of the deponent as a discretionary judicial action, an accused who applies for cross-examination can be refused, and the conviction that follows rests on untested affidavit evidence.
- *authority* - NI Act §145(2) (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *binds* - workflow-step: evidence - application to cross-examine a deponent on affidavit
- *test* - An application by the accused to summon the affidavit deponent produces a summons; the workflow offers no allow or refuse decision on a party's application, only on the court's own motion.
- *related* - REQ-EVI-001

**REQ-EVI-003** · MUST · firm · from act

The system MUST store the bank's slip or memo of dishonour as an image or document showing the official mark, not only the reason for return as a coded value.

- *why* - The statutory presumption of dishonour attaches to production of the slip or memo having the official mark on it. A record holding only a return reason code has nothing to produce, so the complainant must call a bank officer to prove a fact the statute presumes.
- *authority* - NI Act §146 (`ni:sec_146` - 146. Bank’s slip prima facie evidence of certain facts) [open](#law?act=ni&eid=sec_146)
- *binds* - schema-field: dishonour record - the bank memo document bearing the official mark
- *test* - The dishonour record cannot be saved on a reason code alone; the memo document is required and is retrievable as an exhibit.
- *related* - REQ-PRE-001

**REQ-EVI-004** · MUST · firm · from act

Where an entry in a banker's book is relied on, the system MUST hold the certificate that accompanies the certified copy, in the form the Bankers' Books Evidence Act prescribes.

- *why* - A copy of a bank statement is not evidence; a certified copy with the statutory certificate is. Where the certificate is missing or is signed by someone other than the principal accountant or branch manager, the entry is inadmissible, and the complainant discovers this when the account statement is tendered.
- *authority* - Bankers' Books Evidence Act §4 (`bbea:sec_4` - 4. Mode of proof of entries in bankers’ books) [open](#law?act=bbea&eid=sec_4)
- *authority* - Bankers' Books Evidence Act §2(8) (`bbea:sec_2` - 2. Definitions) [open](#law?act=bbea&eid=sec_2)
- *binds* - schema-field: bank statement exhibit - the accompanying statutory certificate
- *how* - A certificate at the foot of the copy that it is a true copy of the entry, that the entry is in one of the ordinary books of the bank and was made in the usual and ordinary course of business, and that the book is still in the bank's custody, dated and subscribed by the principal accountant or manager with name and official title; for a printout, the further certificates required for computer-held records.
- *test* - A banker's book entry cannot be marked as an exhibit without the certificate attached, and the certificate capture records the name and official title of the signatory.
- *related* - REQ-EVI-005

**REQ-EVI-005** · MUST · firm · from act

Where an electronic record such as a cheque truncation image or an electronic bank record is tendered, the system MUST require the statutory certificate to accompany it on each occasion it is submitted for admission.

- *why* - The certificate is the condition of admissibility of the computer output, and the Adhiniyam requires it at each instance the record is submitted. Where the system attaches the certificate once at upload and never again, later tenders of the same image go in uncertified, and the entire electronic proof of dishonour is open to challenge.
- *authority* - BSA §63(4) (`bsa:sec_63` - 63. Admissibility of electronic records) [open](#law?act=bsa&eid=sec_63)
- *authority* - IEA §65B(4) (`iea:sec_65B` - 65B. Admissibility of electronic records. –– (1) Notwithstanding anything contained in this Act,) [open](#law?act=iea&eid=sec_65B)
- *authority* - NI Act §6 Explanation I (`ni:sec_6` - 6. “Cheque.”) [open](#law?act=ni&eid=sec_6)
- *binds* - validation-rule: electronic exhibit - certificate required at each submission for admission
- *how* - A certificate identifying the electronic record and the manner of its production, giving particulars of the device, and dealing with the conditions in section 63(2), signed by the person in charge of the computer or communication device or of the management of the relevant activities and by an expert, in the form set out in the Schedule.
- *test* - Tender the same truncated cheque image at two hearings: the system requires a certificate at each tender and records both.
- *related* - REQ-EVI-004, REQ-REC-001

**REQ-EVI-006** · MUST · firm · from act

The system MUST record, for every witness, whether an oath or a solemn affirmation was administered before the witness deposed.

- *why* - Oath or affirmation is required of every witness, and a witness who objects to being sworn is entitled to affirm instead. Recording only that the witness was sworn erases the choice, which matters to the witness, and leaves the record unable to show what was in fact administered.
- *authority* - Oaths Act §4(1)(a) (`oaths:sec_4` - 4. Oaths or affirmations to be made by witnesses, interpreters and jurors.) [open](#law?act=oaths&eid=sec_4)
- *authority* - Oaths Act §5 (`oaths:sec_5` - 5. Affirmation by persons desiring to affirm.) [open](#law?act=oaths&eid=sec_5)
- *authority* - Oaths Act §3(1)(a) (`oaths:sec_3` - 3. Power to administer oaths.) [open](#law?act=oaths&eid=sec_3)
- *binds* - schema-field: deposition - oath or affirmation, as an explicit value
- *test* - The deposition header carries an enumerated value of oath or affirmation; there is no single sworn checkbox.
- *related* - REQ-EVI-008

**REQ-EVI-007** · MUST · firm · from act

Where a witness deposes through an interpreter, the system MUST record the interpreter's identity and that the interpreter was sworn or affirmed.

- *why* - The Oaths Act puts the interpreter of a witness's evidence under the same obligation as the witness. In a section 138 trial the interpreter is often arranged on the day and never named in the record, so a later dispute about what the witness actually said has no one to answer it.
- *authority* - Oaths Act §4(1)(b) (`oaths:sec_4` - 4. Oaths or affirmations to be made by witnesses, interpreters and jurors.) [open](#law?act=oaths&eid=sec_4)
- *binds* - schema-field: deposition - interpreter identity and oath
- *test* - Marking a deposition as interpreted requires the interpreter's name and the oath or affirmation record before the deposition can be closed.

**REQ-EVI-008** · MUST NOT · firm · from act

The system MUST NOT treat a missing or irregular oath entry as invalidating a deposition or as a ground to reject it from the record.

- *why* - The Oaths Act says in terms that no omission to take an oath and no irregularity in administering it invalidates the proceeding or renders the evidence inadmissible. A validation rule that voids or blocks a deposition for a missing oath field creates a defect the law expressly refuses to create, and does so silently in every court that uses the build.
- *authority* - Oaths Act §7 (`oaths:sec_7` - 7. Proceedings and evidence not invalidated by omission of oath or irregularity.) [open](#law?act=oaths&eid=sec_7)
- *binds* - validation-rule: deposition - handling of a missing oath entry
- *test* - Save a deposition with the oath field empty: the record is retained with the gap visible as a warning, and the deposition is neither voided nor excluded from the evidence list.
- *related* - REQ-EVI-006

**REQ-EVI-009** · MUST NOT · firm · from act

The system MUST NOT put the accused in a section 138 case on oath unless the accused is being examined as a witness for the defence.

- *why* - The Oaths Act forbids administering an oath to the accused in a criminal proceeding except where he offers himself as a defence witness. A generic hearing screen that swears everyone who speaks turns the accused's statement into sworn testimony and touches the protection against self-incrimination.
- *authority* - Oaths Act §4(2) (`oaths:sec_4` - 4. Oaths or affirmations to be made by witnesses, interpreters and jurors.) [open](#law?act=oaths&eid=sec_4)
- *authority* - Constitution art.20(3) (`constitution:art_20` - 20. Protection in respect of conviction for offences.) [open](#law?act=constitution&eid=art_20)
- *binds* - screen: hearing - oath administration for the accused
- *test* - The oath action is unavailable against a person recorded as the accused unless that person has been entered as a defence witness.

**REQ-EVI-010** · MUST · inferred · from act

The system MUST require an affidavit tendered in a judicial proceeding to be sworn before a court, judge, magistrate or other person empowered by the High Court to administer oaths for that purpose.

- *why* - The Oaths Act empowers different classes of persons for judicial-proceeding affidavits and for other affidavits. An affidavit under section 145 sworn before someone empowered only for general affidavits is defective, and the complainant's entire examination-in-chief goes with it.
- *authority* - Oaths Act §3(2)(a) (`oaths:sec_3` - 3. Power to administer oaths.) [open](#law?act=oaths&eid=sec_3)
- *authority* - NI Act §145(1) (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *binds* - schema-field: affidavit - the attesting authority and the power under which it was sworn
- *test* - An affidavit record captures the attesting authority and the class of empowerment, and an affidavit attested by an authority empowered only for non-judicial affidavits is flagged.
- *related* - REQ-EVI-001

**REQ-EVI-011** · MUST · inferred · from act

The system MUST allow the defence that the cheque was delivered blank or incomplete to be recorded as a distinct issue on the case, with the extent said to have been filled in later.

- *why* - A signed blank cheque carries a prima facie authority to complete it, but only up to the amount the stamp covers and only in favour of a holder in due course to the full extent. Where the case record cannot distinguish this defence from a bare denial of the debt, the finding does not address it and the judgment is silent on the point actually argued. Section 20 states the substantive rule; treating it as a recordable issue is the reading that makes it checkable.
- *authority* - NI Act §20 (`ni:sec_20` - 20. Inchoate stamped instruments) [open](#law?act=ni&eid=sec_20)
- *authority* - NI Act §118(g) (`ni:sec_118` - 118. Presumptions as to negotiable instruments) [open](#law?act=ni&eid=sec_118)
- *binds* - schema-field: defence - inchoate instrument as an enumerated ground
- *test* - The defence grounds list includes delivery of a blank or incomplete instrument, and selecting it opens fields for what is alleged to have been filled in and by whom.
- *related* - REQ-EVI-012

**REQ-EVI-012** · MUST · inferred · from act

The system MUST allow an alleged material alteration of the cheque to be recorded as a distinct issue, with a field for whether the party alleged to be bound consented to it.

- *why* - Material alteration renders the instrument void against a party who did not consent, unless the alteration carried out the common intention. That turns on consent, which is a fact someone has to plead and the court has to find. A record with no place for it produces judgments that deal with the alteration and never with the consent. Section 87 states the rule; recording consent as a distinct fact is the reading of it.
- *authority* - NI Act §87 (`ni:sec_87` - 87. Effect of material alteration) [open](#law?act=ni&eid=sec_87)
- *binds* - schema-field: defence - material alteration and consent to it
- *test* - Selecting material alteration as a defence opens a consent field, and the judgment template requires a finding on both the alteration and the consent.
- *related* - REQ-EVI-011

**REQ-EVI-013** · MUST · inferred · from act

Where the cheque is one in the electronic form, the system MUST record whether it was signed with a digital signature or an electronic signature in a secure system.

- *why* - The presumption that a secure electronic signature was affixed with intent, and that a secure record has not been altered, applies only to secure records and signatures. A system that stores an electronic cheque without recording its signature type cannot tell the court whether the presumption is available, and the complainant must prove by evidence what he could have had presumed.
- *authority* - NI Act §6 Explanation I(a) (`ni:sec_6` - 6. “Cheque.”) [open](#law?act=ni&eid=sec_6)
- *authority* - BSA §86 (`bsa:sec_86` - 86. Presumption as to electronic records and electronic signatures) [open](#law?act=bsa&eid=sec_86)
- *authority* - IT Act §3A (`itact:sec_3A` - 3A. Electronic signature) [open](#law?act=itact&eid=sec_3A)
- *binds* - schema-field: electronic cheque - signature type and secure status
- *test* - An electronic cheque record carries an enumerated signature type; the case view states whether the section 86 presumption is available and why.
- *related* - REQ-EVI-005

**REQ-EVI-014** · MUST · firm · from caselaw

The system MUST allow the complainant's affidavit filed with the complaint to be read as evidence at both the pre-summoning and the post-summoning stages, without a second examination.

- *why* - Indian Bank Association holds that the affidavit and documents filed with the complaint are good enough at both stages and that there is no necessity to recall and re-examine the complainant after summoning unless the magistrate passes a specific order. A workflow that requires a fresh examination-in-chief after appearance adds a hearing to every case for no evidentiary gain and defeats the six month endeavour.
- *authority* - NI Act §145(1) as read in Indian Bank Association v. Union of India (2014) 5 SCC 590 (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *authority* - NI Act §145 as read in A.C. Narayanan v. State of Maharashtra (2014) 11 SCC 790 (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *binds* - workflow-step: trial - complainant's evidence after appearance of the accused
- *test* - After the accused appears, the complainant's affidavit already on record is marked as evidence without a new filing; a recall step exists but is not on the default path.
- *related* - REQ-EVI-016, REQ-FIL-010

**REQ-EVI-015** · MUST NOT · firm · from caselaw

The system MUST NOT offer the accused evidence on affidavit as a matter of right.

- *why* - Mandvi Cooperative Bank holds that section 145(1) provides for the complainant's evidence on affidavit and that the court cannot read the accused into it, and it set aside a High Court direction that allowed the accused to tender evidence on affidavit on request. A defence-evidence screen that offers file affidavit alongside lead oral evidence puts the court in breach of that holding, and the resulting evidence is liable to be excluded.
- *authority* - NI Act §145(1) as read in Mandvi Cooperative Bank Ltd v. Nimesh B. Thakore (2010) 3 SCC 83 (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *binds* - validation-rule: defence evidence - mode of recording
- *test* - The defence evidence step offers oral examination as the mode; affidavit evidence for the accused is available only under a recorded order of the court, not as a self-service option.
- *related* - REQ-EVI-014

**REQ-EVI-016** · MUST · firm · from caselaw

The system MUST record recall of a deponent for cross-examination as an order made on an application under section 145(2) or on the court's own recorded reasons.

- *why* - Indian Bank Association holds that a complainant is recalled only where the magistrate passes a specific order saying why, on an application by the accused or suo motu under section 145(2). Where recall is a routine listing action with no application and no reasons, the summary trial reverts in practice to a full trial, which is exactly the drift the direction was issued to stop.
- *authority* - NI Act §145(2) as read in Indian Bank Association v. Union of India (2014) 5 SCC 590 (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *authority* - NI Act §145(2) as read in Mandvi Cooperative Bank Ltd v. Nimesh B. Thakore (2010) 3 SCC 83 (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *binds* - workflow-step: trial - recall of a deponent for cross-examination
- *test* - Recall cannot be scheduled without either a linked section 145(2) application or a recorded reason; both appear in the order sheet.
- *related* - REQ-EVI-014

**REQ-EVI-017** · MUST · inferred · from act

The system MUST record the custody of the original cheque and the original return memo, distinctly from any scanned or e-filed image of them.

- *why* - The cheque is the instrument on which the offence rests and the document itself produced for the inspection of the court is the primary evidence of it; a scan is secondary evidence and admissible only on the conditions the Adhiniyam imposes. Electronic filing makes it easy for the original never to reach the court at all, and the point is taken at the stage of marking exhibits, after the complainant's evidence is closed. A record that holds only the image cannot tell the court whether the original exists, where it is, or who holds it.
- *authority* - BSA §57 (`bsa:sec_57` - 57. Primary evidence) [open](#law?act=bsa&eid=sec_57)
- *authority* - BSA §58 (`bsa:sec_58` - 58. Secondary evidence) [open](#law?act=bsa&eid=sec_58)
- *authority* - IEA §62 (`iea:sec_62` - 62. Primary evidence. –– Primary evidence means the document itself produced for the inspection of) [open](#law?act=iea&eid=sec_62)
- *authority* - NI Act §138 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: exhibit - custody of the original instrument, distinct from its image
- *test* - The cheque record carries a custody value naming who holds the original and where, populated independently of the uploaded image; marking the cheque as an exhibit is blocked while custody is unrecorded.
- *related* - REQ-EVI-003, REQ-EVI-005

#### PRE - presumptions and the burden of proof (15)

**REQ-PRE-001** · MUST NOT · firm · from act

Once the bank's slip or memo bearing the official mark is on the record, the system MUST NOT require proof of the fact of dishonour as a precondition to any step in the case.

- *why* - The court shall presume dishonour on production of the memo. A workflow that lists proof of dishonour as an outstanding item until a bank witness is examined creates a step the statute removed, and every case waits on a bank officer who need never have been summoned.
- *authority* - NI Act §146 (`ni:sec_146` - 146. Bank’s slip prima facie evidence of certain facts) [open](#law?act=ni&eid=sec_146)
- *binds* - workflow-step: evidence checklist - proof of dishonour once the memo is on record
- *test* - With the memo on record, the evidence checklist shows dishonour as presumed and no step is blocked for want of proof of it.
- *related* - REQ-EVI-003, REQ-PRE-007

**REQ-PRE-002** · MUST · firm · from act

The system MUST place the burden of rebutting the presumption that the cheque was received for the discharge of a debt or other liability on the accused.

- *why* - Section 139 is what makes a section 138 trial short. A workflow that asks the complainant to prove the underlying debt before the accused has said anything reverses the statutory burden, lengthens every trial, and produces acquittals where the complainant simply had no documents for an old cash loan.
- *authority* - NI Act §139 (`ni:sec_139` - 139. Presumption in favour of holder) [open](#law?act=ni&eid=sec_139)
- *authority* - NI Act §138 Explanation (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - workflow-step: issues and burden - existence of the debt or liability
- *test* - The issue of debt or liability appears against the accused as a rebuttal, not against the complainant as a matter to be proved in the first instance.
- *related* - REQ-PRE-003, REQ-PRE-007

**REQ-PRE-003** · MUST · firm · from act

The system MUST treat the cheque as presumed to have been drawn for consideration.

- *why* - The presumption of consideration under section 118(a) is separate from the presumption under section 139 and survives independently of it. A build that models only section 139 loses the presumption in cases where the debt is admitted but the consideration is disputed, which is where section 118(a) does the work.
- *authority* - NI Act §118(a) (`ni:sec_118` - 118. Presumptions as to negotiable instruments) [open](#law?act=ni&eid=sec_118)
- *binds* - workflow-step: issues and burden - consideration
- *test* - Consideration appears in the issues list as presumed, separately from the section 139 presumption, and each can be recorded as rebutted independently.
- *related* - REQ-PRE-002

**REQ-PRE-004** · MUST NOT · firm · from act

The system MUST NOT offer, as an available defence ground, that the drawer had no reason to believe when he issued the cheque that it might be dishonoured.

- *why* - Section 140 shuts this defence out in terms. Where the defence-grounds list carries it as a selectable option, a defence is pleaded that cannot succeed, evidence is led on it, and the judgment has to deal with a plea Parliament has already refused.
- *authority* - NI Act §140 (`ni:sec_140` - 140. Defence which may not be allowed in any prosecution under section 138) [open](#law?act=ni&eid=sec_140)
- *binds* - screen: defence grounds - excluded grounds for a section 138 case
- *test* - The defence grounds list on a section 138 case does not contain absence of reason to believe the cheque would be dishonoured, and free-text pleading of it produces a notice citing section 140.

**REQ-PRE-005** · MUST · firm · from act

The system MUST treat the date borne on the cheque, held as a field distinct from the date of its delivery, as the presumed date of drawing.

- *why* - Section 118(b) presumes that an instrument bearing a date was drawn on that date. It is the date on the instrument that starts the six-month presentment window. A system that stores a single cheque date without saying which it is cannot compute the window when the two differ, which is the ordinary case for a post-dated cheque.
- *authority* - NI Act §118(b) (`ni:sec_118` - 118. Presumptions as to negotiable instruments) [open](#law?act=ni&eid=sec_118)
- *authority* - NI Act §138 proviso (a) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: cheque record - date on the instrument, distinct from the date of delivery
- *test* - The cheque record holds an instrument date and, where known, a delivery date; the presentment window is computed from the instrument date.
- *related* - REQ-LIM-001

**REQ-PRE-006** · MUST · firm · from act

The system MUST treat the holder of the cheque as presumed to be a holder in due course, except where it is alleged that the instrument was obtained by an offence, by fraud or for unlawful consideration, in which case the burden of proving holding in due course is on the holder.

- *why* - Section 118(g) and its proviso shift the burden in exactly one situation, and that situation is the stolen or fraudulently obtained cheque. A build that applies the presumption unconditionally puts the burden on the wrong party in the one class of case where the section takes it away.
- *authority* - NI Act §118(g) (`ni:sec_118` - 118. Presumptions as to negotiable instruments) [open](#law?act=ni&eid=sec_118)
- *authority* - NI Act §9 (`ni:sec_9` - 9. “Holder in due course”) [open](#law?act=ni&eid=sec_9)
- *binds* - workflow-step: issues and burden - holding in due course
- *test* - Recording an allegation that the cheque was obtained by fraud or by an offence moves the holder-in-due-course issue from presumed to be proved by the complainant.
- *related* - REQ-FIL-002

**REQ-PRE-007** · MUST · inferred · from act

The system MUST require a recorded judicial finding of rebutted or not rebutted on every statutory presumption it has applied, before the case can be disposed of.

- *why* - Each of these presumptions operates unless the contrary is proved. A record that shows the presumption as applied and never as tested reads as though the court decided nothing, and the appellate court cannot tell whether the accused's rebuttal evidence was considered at all. The rebuttability is express in each section; requiring the finding to be recorded is the reading that makes it visible.
- *authority* - NI Act §139 (`ni:sec_139` - 139. Presumption in favour of holder) [open](#law?act=ni&eid=sec_139)
- *authority* - NI Act §118 (`ni:sec_118` - 118. Presumptions as to negotiable instruments) [open](#law?act=ni&eid=sec_118)
- *authority* - NI Act §146 (`ni:sec_146` - 146. Bank’s slip prima facie evidence of certain facts) [open](#law?act=ni&eid=sec_146)
- *binds* - workflow-step: judgment - findings on each presumption relied on
- *test* - The disposal step lists every presumption in play and cannot be completed until each carries a finding of rebutted or not rebutted.
- *related* - REQ-PRE-001, REQ-PRE-002, REQ-PRE-003

**REQ-PRE-008** · MUST · inferred · from act

The system MUST allocate to the complainant the burden of proving the facts that are not presumed, namely the drawing of the cheque on the drawer's account, its presentment, its return unpaid, the demand notice and the failure to pay.

- *why* - The presumptions cover the debt, the consideration and the fact of dishonour. They do not cover the ingredients of the section itself. A build that treats the presumptions as covering the whole case leaves nothing for the complainant to prove and produces convictions with no findings on the elements. This is a reading of the general burden rule against the specific presumptions, since no single section lists which facts remain to be proved.
- *authority* - BSA §104 (`bsa:sec_104` - 104. Burden of proof) [open](#law?act=bsa&eid=sec_104)
- *authority* - IEA §101 (`iea:sec_101` - 101. Burden of proof. –– Whoever desires any Court to give judgment as to any legal right or) [open](#law?act=iea&eid=sec_101)
- *authority* - NI Act §138 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - workflow-step: issues and burden - the ingredients the complainant must prove
- *test* - The issues list on a section 138 case shows the five ingredients against the complainant and the presumed matters against the accused, and the disposal step requires a finding on each ingredient.
- *related* - REQ-PRE-002, REQ-PRE-007

**REQ-PRE-009** · MUST · firm · from caselaw

The system MUST record, as a distinct fact on the case, whether the accused admits or denies the signature on the cheque.

- *why* - The signature admission is the fact that activates the section 139 presumption. Where a system captures only a generic plea of not guilty, the court has no recorded trigger and the trial proceeds as an open contest in which the complainant is asked to prove the debt from scratch. That is the exact error the Supreme Court corrected in Rajesh Jain, where both the trial court and the High Court acquitted after the signature had been admitted.
- *authority* - NI Act §139 as read in Rajesh Jain v. Ajay Singh (2023 INSC 888) (`ni:sec_139` - 139. Presumption in favour of holder) [open](#law?act=ni&eid=sec_139)
- *authority* - NI Act §118 as read in Rajesh Jain v. Ajay Singh (2023 INSC 888) (`ni:sec_118` - 118. Presumptions as to negotiable instruments) [open](#law?act=ni&eid=sec_118)
- *binds* - schema-field: plea record - admission or denial of the signature on the cheque
- *test* - The plea record carries a signature-admission field separate from the plea to the charge, and the case view shows whether the presumption stands triggered.
- *related* - REQ-PRE-010, REQ-PRE-011, REQ-TRL-011

**REQ-PRE-010** · MUST · firm · from caselaw

Once the presumption under section 139 is triggered, the trial workflow MUST place the next evidentiary step on the accused and MUST NOT require the complainant to prove the debt before the accused has attempted rebuttal.

- *why* - A workflow that lists the complainant's proof of the debt as an open step after the presumption has arisen invites the court to frame the wrong issue. In Rajesh Jain the trial court framed the question as whether a legally enforceable debt existed qua the complainant, fixed the onus on the complainant, and acquitted; the Supreme Court held the framing itself perverse and convicted. A system that reproduces that issue order will reproduce that outcome.
- *authority* - NI Act §139 as read in Rajesh Jain v. Ajay Singh (2023 INSC 888) (`ni:sec_139` - 139. Presumption in favour of holder) [open](#law?act=ni&eid=sec_139)
- *authority* - NI Act §139 as read in Rangappa v. Sri Mohan (2010) 11 SCC 441 (`ni:sec_139` - 139. Presumption in favour of holder) [open](#law?act=ni&eid=sec_139)
- *authority* - NI Act §118 as read in Kumar Exports v. Sharma Carpets (2009) 2 SCC 513 (`ni:sec_118` - 118. Presumptions as to negotiable instruments) [open](#law?act=ni&eid=sec_118)
- *authority* - NI Act §139 as read in Kalamani Tex v. P. Balasubramanian (2021) 10 SCC 549 (`ni:sec_139` - 139. Presumption in favour of holder) [open](#law?act=ni&eid=sec_139)
- *authority* - NI Act §139 as read in Oriental Bank of Commerce v. Prabodh Kumar Tewari (2022 SCC OnLine SC 1089) (`ni:sec_139` - 139. Presumption in favour of holder) [open](#law?act=ni&eid=sec_139)
- *binds* - workflow-step: issue framing after plea - order of the evidentiary burden
- *test* - After a recorded signature admission, the next actionable step offered to the court is the accused's rebuttal, and any step asking the complainant to prove the debt is available only after a recorded finding that the presumption stands rebutted.
- *related* - REQ-PRE-009

**REQ-PRE-011** · MUST NOT · firm · from caselaw

The system MUST NOT treat a recorded fact that the cheque was signed blank, or was completed in another hand, as defeating the section 139 presumption.

- *why* - Bir Singh holds that a signed but incomplete cheque voluntarily handed over still attracts the presumption even if filled in by another person. If a validation rule or a decision aid flags such a cheque as outside section 138, the case is screened out at filing or the court is nudged to acquit on a defence the Supreme Court has already rejected.
- *authority* - NI Act §139 as read in Bir Singh v. Mukesh Kumar (2019) 4 SCC 197 (`ni:sec_139` - 139. Presumption in favour of holder) [open](#law?act=ni&eid=sec_139)
- *authority* - NI Act §20 as read in Bir Singh v. Mukesh Kumar (2019) 4 SCC 197 (`ni:sec_20` - 20. Inchoate stamped instruments) [open](#law?act=ni&eid=sec_20)
- *binds* - validation-rule: cheque record - blank or third-party-completed cheque
- *test* - Recording that the cheque was blank when signed produces no blocking error and no adverse eligibility flag; it is stored only as a defence pleaded, for the court to evaluate.
- *related* - REQ-PRE-009

**REQ-PRE-012** · MUST · firm · from caselaw

The system MUST record whether the drawer replied to the statutory demand notice, and the date of any reply.

- *why* - Failure to reply to the demand notice supports an inference against the drawer, and a defence first raised at trial that was not raised in a reply is treated as an afterthought. A record that holds only the notice and not the reply, or absence of reply, loses the single cheapest piece of evidence in the case and forces the court to reconstruct it from oral testimony years later.
- *authority* - NI Act §138 proviso (b) as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §139 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_139` - 139. Presumption in favour of holder) [open](#law?act=ni&eid=sec_139)
- *binds* - schema-field: demand notice record - reply to the legal demand notice
- *test* - The notice record carries a reply field with a tri-state value (replied with date, no reply, not known) and it appears in the complaint synopsis.
- *related* - REQ-FIL-009, REQ-NOT-010

**REQ-PRE-013** · SHOULD · contested · from caselaw

The system SHOULD allow the complainant to record the source of the funds advanced, and SHOULD surface whether financial capacity was put in issue by the accused and at what stage.

- *why* - The authorities divide on when the complainant must prove capacity to advance the sum. Basalingappa holds that once financial capacity is questioned on evidence it becomes incumbent on the complainant to explain it, and restored an acquittal on that footing. Tedhi Singh, approved in Sanjabij Tari, holds that unless the want of capacity is set up in the reply to the statutory notice the complainant need not lead capacity evidence at the outset. The practical difference is entirely about the stage at which the point was raised, so a record that does not capture that stage cannot tell the two lines apart.
- *authority* - NI Act §139 as read in Basalingappa v. Mudibasappa (2019) 5 SCC 418 (`ni:sec_139` - 139. Presumption in favour of holder) [open](#law?act=ni&eid=sec_139)
- *authority* - NI Act §139 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_139` - 139. Presumption in favour of holder) [open](#law?act=ni&eid=sec_139)
- *binds* - schema-field: complainant evidence - source of funds and the stage at which capacity was put in issue
- *test* - The case record can answer, without reading the depositions, whether financial capacity was disputed in the reply notice, in cross-examination, or only in argument.
- *related* - REQ-PRE-012

**REQ-PRE-014** · MUST NOT · firm · from caselaw

The system MUST NOT treat a cash loan exceeding the Income Tax Act threshold for cash transactions as, by itself, an unenforceable debt.

- *why* - Sanjabij Tari expressly set aside the contrary view that a cash transaction above twenty thousand rupees is not a legally enforceable debt, holding that a breach of section 269SS attracts only a penalty and does not make the transaction void. A scrutiny rule that rejects or flags such complaints would screen out valid prosecutions at the counter on a proposition the Supreme Court has overturned.
- *authority* - NI Act §138 Explanation as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §139 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_139` - 139. Presumption in favour of holder) [open](#law?act=ni&eid=sec_139)
- *binds* - validation-rule: scrutiny - cash consideration above the income tax threshold
- *test* - A complaint recording a cash loan above the threshold passes scrutiny with no error and no warning about enforceability.
- *related* - REQ-PRE-015

**REQ-PRE-015** · MUST NOT · firm · from caselaw

The system MUST NOT reject or adversely flag a complaint on the ground that the cheque was issued towards a future instalment, as security, or for a liability that had not yet crystallised when the cheque was given.

- *why* - Sampelly holds that cheques issued towards future instalments or as security can still represent a subsisting debt or liability, and Sunil Todi reads debt or other liability broadly enough to cover a liability that crystallises after the cheque is handed over. These are the commonest commercial arrangements in the docket. A scrutiny rule that requires the debt to have been due on the date of the cheque screens out a large class of valid complaints at the counter, and the complainant has no appeal against a registry refusal.
- *authority* - NI Act §138 Explanation as read in Sampelly Satyanarayana Rao v. Indian Renewable Energy Development Agency (2016) 10 SCC 458 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §138 as read in Sunil Todi v. State of Gujarat (2021) 16 SCC 762 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - validation-rule: scrutiny - purpose for which the cheque was issued
- *test* - Recording the cheque purpose as security or as a future instalment produces no scrutiny defect and no eligibility warning; the purpose is stored for the court to evaluate against the position at maturity.
- *related* - REQ-PRE-014, REQ-LIM-015

#### JUR - jurisdiction, cognizance, the competent court (12)

**REQ-JUR-001** · MUST · firm · from act

Where the cheque was delivered for collection through an account, the system MUST derive territorial jurisdiction from the branch of the bank where the payee or holder in due course maintains that account.

- *why* - Territorial jurisdiction in a section 138 case is fixed by statute, not by where the parties live or where the cheque was drawn. A system that routes the complaint by the complainant's address or the drawer's address sends files to courts that have no jurisdiction, and the transfer that follows costs months.
- *authority* - NI Act §142(2) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: case allocation - competent court derived from the collecting branch
- *how* - The branch of the bank where the payee or holder in due course maintains the account into which the cheque was delivered for collection.
- *test* - Enter a collecting branch in one district and a complainant address in another: the system proposes the court for the collecting branch and states the basis.
- *related* - REQ-JUR-002, REQ-JUR-003

**REQ-JUR-002** · MUST · firm · from act

Where the cheque was presented for payment otherwise than through an account, the system MUST derive territorial jurisdiction from the branch of the drawee bank where the drawer maintains the account.

- *why* - This is the second and different limb of the statutory rule, and it applies to over-the-counter presentation, which is common in small transactions. A system that knows only the collecting-branch rule has no answer for these cases and defaults to the wrong court.
- *authority* - NI Act §142(2) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: case allocation - competent court where presentation was not through an account
- *how* - The branch of the drawee bank where the drawer maintains the account.
- *test* - Mark a cheque as presented at the counter: the jurisdiction proposal switches to the drawee branch and cites clause (b).
- *related* - REQ-JUR-001

**REQ-JUR-003** · MUST · firm · from act

Where a cheque is delivered for collection at a branch other than the one where the payee maintains the account, the system MUST treat it as delivered to the branch at which the account is maintained.

- *why* - Core banking means a cheque is routinely deposited wherever the customer happens to be. Without the deeming rule, the jurisdiction proposal follows the counter where the deposit slip was stamped, which can be anywhere in the country and is not the court the statute intends.
- *authority* - NI Act §142(2) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: case allocation - deemed branch of delivery
- *how* - The cheque is deemed delivered to the branch of the bank at which the payee or holder in due course maintains the account.
- *test* - Enter a deposit branch different from the account branch: the jurisdiction proposal follows the account branch.
- *related* - REQ-JUR-001

**REQ-JUR-004** · MUST NOT · firm · from act

The system MUST NOT allot a section 138 case to any court inferior to a Judicial Magistrate of the first class or a Metropolitan Magistrate.

- *why* - The statute forbids trial by a court inferior to a first class magistrate. An allocation engine that balances load across all magistrate courts will occasionally place a section 138 file before a second class magistrate, and everything done in that court is without jurisdiction.
- *authority* - NI Act §142(1)(c) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - NI Act §143(1) (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - validation-rule: case allocation - eligible court types for section 138
- *test* - Attempt to allot a section 138 case to a second class magistrate: the allocation is refused and the reason names section 142(1)(c).

**REQ-JUR-005** · MUST NOT · firm · from act

The system MUST NOT permit cognizance of a section 138 offence to be taken on a police report, on information from a person other than the payee, or on the court's own knowledge.

- *why* - The general power of a magistrate to take cognizance offers three routes. Section 138 closes two of them: cognizance can only be on the complaint of the payee or holder in due course. A generic cognizance screen that offers all three routes for every offence invites a magistrate to take cognizance on a police report, which no court can do here.
- *authority* - NI Act §142(1)(a) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - BNSS §210(1) (`bnss:sec_210` - 210. Cognizance of offences by Magistrate) [open](#law?act=bnss&eid=sec_210)
- *authority* - CrPC §190(1) (`crpc:sec_190` - 190. Cognizance of offences by Magistrates) [open](#law?act=crpc&eid=sec_190)
- *binds* - screen: cognizance - available routes for a section 138 offence
- *test* - Open the cognizance screen on a section 138 case: only the complaint route is offered, and the police report and information routes are absent rather than merely disabled.

**REQ-JUR-006** · MUST · inferred · from act

The system MUST record the taking of cognizance as a dated judicial event distinct from the presentation of the complaint.

- *why* - Limitation runs to cognizance, not to filing, and the condonation question arises at cognizance. Where the system carries only a filing date, a complaint presented in time but taken on file weeks later cannot be distinguished from one taken up the same day, and the record cannot show when the court applied its mind. This follows from the statutory language, which bars the court from taking cognizance after the period, rather than from an express direction to record the date.
- *authority* - NI Act §142(1)(b) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - BNSS §210 (`bnss:sec_210` - 210. Cognizance of offences by Magistrate) [open](#law?act=bnss&eid=sec_210)
- *authority* - CrPC §190 (`crpc:sec_190` - 190. Cognizance of offences by Magistrates) [open](#law?act=crpc&eid=sec_190)
- *binds* - schema-field: case - date of cognizance, separate from date of presentation
- *test* - The case record shows a presentation date and a cognizance date as separate fields, and the limitation computation reads the cognizance date.
- *related* - REQ-LIM-007, REQ-LIM-008

**REQ-JUR-007** · MUST · inferred · from act

The system MUST hold, at cognizance, the sworn material on which the complainant was examined under section 223(1), being in a section 138 case the complainant's affidavit under section 145.

- *why* - The examination of the complainant is the only judicial testing of the complaint before process issues against the drawer. In a section 138 case it is not a separate oral step: Indian Bank Association holds that the affidavit and documents filed with the complaint are the material the magistrate scrutinises, and section 145(1) makes the complainant's evidence on affidavit readable in any enquiry. A build that stages a separate oral examination adds a hearing to every case; a build that records neither the affidavit nor an examination leaves the accused's challenge to the issue of process with nothing to answer.
- *authority* - BNSS §223(1) (`bnss:sec_223` - 223. Examination of complainant) [open](#law?act=bnss&eid=sec_223)
- *authority* - CrPC §200 (`crpc:sec_200` - 200. Examination of complainant) [open](#law?act=crpc&eid=sec_200)
- *authority* - NI Act §145(1) (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *authority* - Oaths Act §3(2)(a) (`oaths:sec_3` - 3. Power to administer oaths.) [open](#law?act=oaths&eid=sec_3)
- *binds* - workflow-step: cognizance - examination of the complainant on oath
- *how* - The complainant's affidavit under section 145(1), sworn before an authority the High Court has empowered for affidavits in judicial proceedings, stands as the substance of the examination; where the magistrate does examine the complainant or a witness orally instead, the substance is reduced to writing and signed by the complainant, the witnesses and the magistrate.
- *test* - The cognizance step cannot be completed unless either the complainant's section 145 affidavit or a signed record of oral examination is on the file; it does not require both, and it does not generate an oral examination task by default.
- *related* - REQ-EVI-010, REQ-EVI-014, REQ-FIL-010, REQ-SRV-015

**REQ-JUR-009** · MUST · firm · from act

Where a complaint by the same payee against the same drawer is already pending in a court having jurisdiction under section 142(2), the system MUST direct every subsequent section 138 complaint between them to that same court, irrespective of where the later cheques were collected or presented.

- *why* - Section 142A displaces the ordinary jurisdiction rule once one complaint is pending. A routing engine that applies only the collecting-branch rule scatters a series of cheques from one transaction across several courts, and the accused faces parallel trials on the same running account.
- *authority* - NI Act §142A(2) (`ni:sec_142A` - 142A. Validation for transfer of pending cases) [open](#law?act=ni&eid=sec_142A)
- *authority* - NI Act §142(2) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: case allocation - consolidation of later complaints between the same parties
- *test* - File a second complaint by the same payee against the same drawer with a different collecting branch: the system proposes the court where the first complaint is pending and states section 142A(2) as the basis.
- *related* - REQ-JUR-001, REQ-JUR-010

**REQ-JUR-010** · MUST · inferred · from act

The system MUST surface, when a section 138 complaint is presented, every pending prosecution between the same payee and the same drawer across all courts.

- *why* - The consolidation rule can only be applied if the multiplicity is visible. A court that cannot see the other pending complaints cannot transfer them to the court where the first was filed, and the duty in section 142A(3) is triggered only upon the fact being brought to the court's notice, which in practice means the system must bring it.
- *authority* - NI Act §142A(3) (`ni:sec_142A` - 142A. Validation for transfer of pending cases) [open](#law?act=ni&eid=sec_142A)
- *binds* - screen: filing - pending complaints between the same payee and drawer
- *test* - Presenting a complaint where two others between the same parties are pending in different courts shows both, with their court, number and filing date, on the filing screen.
- *related* - REQ-JUR-009

**REQ-JUR-011** · MUST · firm · from caselaw

The system MUST record the branch of the payee's or holder's bank at which the cheque was delivered for collection as the fact anchoring territorial jurisdiction.

- *why* - Since the 2015 amendment, upheld in Bridgestone, jurisdiction lies where the payee's bank branch is situated, not where the drawee bank is. A record that stores only the drawee bank cannot support the jurisdiction averment, and the complaint is returned or transferred after months in the wrong court.
- *authority* - NI Act §142(2) as read in Bridgestone India Pvt Ltd v. Inderpal Singh (2016) 2 SCC 521 (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - schema-field: complaint - payee's collecting bank branch, distinct from the drawee bank branch
- *test* - The complaint holds both bank branches as distinct fields, and the jurisdiction check is computed from the payee's collecting branch.
- *related* - REQ-JUR-012, REQ-FIL-009

**REQ-JUR-012** · MUST · firm · from caselaw

The system MUST support transfer of a pending complaint to the court having jurisdiction under section 142(2) where jurisdiction was previously fixed on the drawee-bank rule.

- *why* - Dashrath Rupsingh fixed jurisdiction at the drawee bank and was legislatively superseded; section 142A gives section 142(2) effect as if it had been in force at all material times, and Bridgestone applied it to a complaint of 2006. A system that treats the seat of a case as immutable cannot execute those transfers, and the older stock of cases stays stranded in courts that no longer have jurisdiction.
- *authority* - NI Act §142A as read in Bridgestone India Pvt Ltd v. Inderpal Singh (2016) 2 SCC 521 (`ni:sec_142A` - 142A. Validation for transfer of pending cases) [open](#law?act=ni&eid=sec_142A)
- *authority* - NI Act §142 as construed in Dashrath Rupsingh Rathod v. State of Maharashtra (2014) 9 SCC 129, since superseded (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - workflow-step: transfer of a pending complaint under section 142A
- *test* - A pending complaint can be transferred to another court with the record, history and cause-of-action dates preserved and the transfer order on file; the receiving court does not restart the case.
- *related* - REQ-JUR-011

**REQ-JUR-013** · MUST · firm · from caselaw

The system MUST be able to identify all complaints between the same parties arising out of the same transaction and support their consolidation before the court first seised.

- *why* - Damodar S. Prabhu directs that where several cheques arise from one transaction and complaints are filed in multiple jurisdictions, the complaints be transferred to the first court, and the Constitution Bench in the expeditious-trial reference addressed a single inquiry for multiple complaints against the same accused. Without a link between related complaints, a single instalment default becomes a dozen separate trials in a dozen courts, which is the specific harassment the Court identified.
- *authority* - NI Act §142 as read in Damodar S. Prabhu v. Sayed Babalal H (2010) 5 SCC 663 (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *authority* - NI Act §143 as read in In re Expeditious Trial of Cases under Section 138 of NI Act (2021) 16 SCC 116 (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - workflow-step: registry - linking and consolidation of related complaints
- *test* - Given a drawer and a transaction reference, the registry returns all linked complaints across courts, with the first-instituted one marked, and offers a consolidation action.
- *related* - REQ-FIL-008

#### TRL - trial conduct, plea, attendance (19)

**REQ-TRL-001** · MUST · firm · from act

The system MUST record the mode of trial of a section 138 case as summary unless an order converting it to a summons trial has been passed.

- *why* - Section 143 puts every section 138 case into a summary trial by default. A build that requires the magistrate to elect summary trial case by case turns the default around, and courts that never make the election end up conducting full summons trials the statute did not intend.
- *authority* - NI Act §143(1) (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *authority* - BNSS §285(1) (`bnss:sec_285` - 285. Procedure for summary trials) [open](#law?act=bnss&eid=sec_285)
- *authority* - CrPC §262(1) (`crpc:sec_262` - 262. Procedure for summary trials) [open](#law?act=crpc&eid=sec_262)
- *binds* - schema-field: case - mode of trial, defaulting to summary
- *test* - A newly numbered section 138 case shows mode of trial as summary without any user action, and the value can change only through a recorded conversion order.
- *related* - REQ-TRL-002

**REQ-TRL-002** · MUST NOT · firm · from act

The system MUST NOT allow a section 138 case to be converted from summary trial to the ordinary procedure without an order recording the reason, made after hearing the parties.

- *why* - Conversion is what turns a six-month case into a three-year one. The second proviso to section 143 allows it only on a recorded order after hearing the parties. Where the system lets the mode be switched as a field edit, conversion happens for docket reasons and the record shows no reason at all.
- *authority* - NI Act §143(1) second proviso (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - workflow-step: conversion from summary trial - recorded order after hearing
- *how* - The magistrate shall, after hearing the parties, record an order to that effect.
- *test* - Changing the mode of trial is available only through an order step that captures the hearing and a written reason; the field is not directly editable.
- *related* - REQ-TRL-001, REQ-TRL-003

**REQ-TRL-003** · MUST · firm · from act

Where a section 138 case is converted out of summary trial, the system MUST place every witness already examined on a recall list.

- *why* - The proviso requires the magistrate to recall any witness already examined and to hear or rehear the case under the ordinary procedure. A build that keeps the earlier depositions on the evidence list as though nothing changed produces a judgment resting partly on evidence recorded in a procedure the court has abandoned.
- *authority* - NI Act §143(1) second proviso (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - workflow-step: conversion from summary trial - recall of witnesses already examined
- *test* - After conversion, every witness examined before the order appears on a recall list on the case record.
- *related* - REQ-TRL-002, REQ-TRL-004

**REQ-TRL-004** · MUST NOT · inferred · from act

Where a section 138 case is converted out of summary trial, the system MUST NOT carry forward the depositions recorded in the summary trial as evidence in the converted trial.

- *why* - The second proviso to section 143(1) requires the magistrate to recall any witness already examined and to hear or rehear the case in the manner provided by the Code. It does not say in terms that the earlier depositions cease to be evidence; that follows from the direction to rehear, and is recorded here as a reading. A build that leaves those depositions on the evidence list as though nothing had changed produces a judgment resting partly on evidence recorded under a procedure the court has abandoned, and the defect is invisible because the evidence list looks complete.
- *authority* - NI Act §143(1) second proviso (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - validation-rule: converted trial - status of depositions recorded in the summary trial
- *test* - After conversion, the summary-trial depositions are marked as not evidence in the converted trial and the judgment template will not cite them.
- *related* - REQ-TRL-003

**REQ-TRL-005** · MUST NOT · firm · from act

The system MUST NOT permit an adjournment of a section 138 trial beyond the following day without a written reason recorded on the order.

- *why* - Section 143(2) requires the trial to continue from day to day so far as practicable, and permits a longer adjournment only for reasons recorded in writing. A cause-list tool that offers a next-date picker with no reason field makes the statutory condition invisible, and the six-week adjournment becomes the norm because nothing in the screen asks why.
- *authority* - NI Act §143(2) (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - screen: adjournment - written reason where the next date is beyond the following day
- *test* - Select a next date more than one day ahead: the reason field becomes mandatory and the recorded reason appears on the order sheet.
- *related* - REQ-TRL-006

**REQ-TRL-006** · MUST · inferred · from act

The system MUST compute and display, on every pending section 138 case, the time elapsed since the date the complaint was filed against the six-month period within which the trial is to be concluded.

- *why* - The endeavour to conclude within six months of filing is directed at the court, and the constitutional interest in a speedy trial sits behind it. A court that cannot see which of its section 138 files have crossed six months cannot act on the direction, and the target exists only in the statute book.
- *authority* - NI Act §143(3) (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *authority* - Constitution art.21 (`constitution:art_21` - 21. Protection of life and personal liberty.) [open](#law?act=constitution&eid=art_21)
- *binds* - screen: case list - age of a section 138 case against the six-month period
- *test* - The pending section 138 list shows, per case, days since filing and whether the six-month period has been crossed, and can be sorted on it.
- *related* - REQ-TRL-005

**REQ-TRL-007** · MUST · firm · from act

The system MUST record the accused's plea as a distinct dated entry on the case record rather than as text within the order sheet.

- *why* - The plea is a prescribed particular of the summary-trial record, and it is also the event that opens the power to order interim compensation. Where the plea is buried in the order sheet as free text, neither the register nor the interim compensation gate can read it.
- *authority* - BNSS §286(g) (`bnss:sec_286` - 286. Record in summary trials) [open](#law?act=bnss&eid=sec_286)
- *authority* - CrPC §263(g) (`crpc:sec_263` - 263. Record in summary trials) [open](#law?act=crpc&eid=sec_263)
- *authority* - NI Act §143A(1)(a) (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *binds* - schema-field: case - plea of the accused and the accused's examination
- *test* - The plea is stored as an enumerated value with its date; the interim compensation action and the summary trial register both read that field rather than the order text.
- *related* - REQ-SEN-010, REQ-REC-003

**REQ-TRL-008** · MAY · firm · from act

The system MAY permit a person not enrolled as an advocate to appear in a particular section 138 case, on the court's permission recorded as an order.

- *why* - The Advocates Act allows the court to permit a non-advocate to appear in a particular case, and section 138 matters commonly involve a party in person or an authorised representative of a small firm. A build that hard-codes representation to enrolled advocates shuts out an appearance the law allows; one that allows it without recording the permission leaves an unexplained non-advocate on the record.
- *authority* - Advocates Act §32 (`advocates:sec_32` - 32. Power of court to permit appearances in particular cases.―Notwithstanding anything contained in) [open](#law?act=advocates&eid=sec_32)
- *authority* - Advocates Act §30 (`advocates:sec_30` - 30. Right of advocates to practise.―Subject to the provisions of this Act, every advocate whose name is) [open](#law?act=advocates&eid=sec_30)
- *binds* - workflow-step: appearance - permission for a non-advocate in a particular case
- *test* - A non-advocate cannot be attached as a representative without an order granting permission, and the order is visible on the case record.

**REQ-TRL-009** · MUST · inferred · from act

The system MUST allow the testimony, arguments or opinion of a party or witness with a disability to be recorded in that person's preferred language and means of communication.

- *why* - The access-to-justice duty extends to making the facilities and equipment available for recording testimony in the person's preferred means. A hearing record that offers only spoken deposition in the court's language forces a deaf or non-speaking witness through an ad hoc arrangement that the record never describes, and the reliability of the deposition is unanswerable afterwards.
- *authority* - RPwD Act §12(4)(c) (`rpwd:sec_12` - 12. Access to justice.) [open](#law?act=rpwd&eid=sec_12)
- *authority* - RPwD Act §12(2) (`rpwd:sec_12` - 12. Access to justice.) [open](#law?act=rpwd&eid=sec_12)
- *authority* - RPwD Act §2(s) (`rpwd:sec_2` - 2. Definitions.) [open](#law?act=rpwd&eid=sec_2)
- *binds* - schema-field: deposition - language and means of communication used
- *test* - A deposition record carries the language and the means of communication, and a support measure such as an interpreter or assistive equipment can be recorded against the hearing.
- *related* - REQ-EVI-007, REQ-FIL-007

**REQ-TRL-010** · MUST · firm · from caselaw

The system MUST require a cogent and sufficient reason, recorded in the order, before a section 138 case is converted from summary trial to a summons trial.

- *why* - Section 143(1) already requires an order after hearing the parties. What the Constitution Bench added, and Sanjabij Tari reiterates, is that the reasons must be cogent and sufficient and must be recorded before conversion, so that the conversion is reviewable. Where the reason field accepts docket convenience, conversion happens quietly and the entire speed advantage that sections 143 to 145 were enacted to create is lost case by case with nothing on the record to review.
- *authority* - NI Act §143(1) as read in In re Expeditious Trial of Cases under Section 138 of NI Act (2021) 16 SCC 116 (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *authority* - NI Act §143(1) as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - validation-rule: trial mode - conversion from summary to summons trial
- *test* - A conversion order cannot be saved with an empty or boilerplate reason; the reason text is reproduced in the order sheet and the conversion with its reason is reportable at district level.
- *related* - REQ-TRL-002, REQ-TRL-011, REQ-REC-005

**REQ-TRL-011** · MUST · firm · from caselaw

The system MUST put the prescribed structured questions to the accused at the notice-of-accusation stage and record the answers in the order sheet in the presence of the accused and counsel.

- *why* - Sanjabij Tari sets out the questions the trial court is at liberty to ask under section 251 CrPC or section 274 BNSS and directs that the responses be recorded in the order sheet and used to decide whether the case is fit for summary trial. Where the plea is captured only as guilty or not guilty, the court reaches the end of the trial without ever knowing which ingredient is actually disputed, and every case is tried as though everything were in issue.
- *authority* - BNSS §274 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`bnss:sec_274` - 274. Substance of accusation to be stated) [open](#law?act=bnss&eid=sec_274)
- *authority* - Code of Criminal Procedure §251 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`crpc:sec_251` - 251. Substance of accusation to be stated) [open](#law?act=crpc&eid=sec_251)
- *binds* - screen: notice of accusation - structured questions to the accused
- *how* - Six questions, each recorded against the accused: whether the cheque belongs to his account; whether the signature is his; whether he issued or delivered the cheque to the complainant; whether he owed a liability to the complainant at issuance; if liability is denied, the defence stated as security cheque only, loan already repaid, cheque altered or misused, or other with particulars; and whether he wishes to compound the case at this stage.
- *test* - The notice-of-accusation screen presents all six questions, stores each answer against the accused, writes them into the order sheet, and feeds the summary-trial fitness decision and the compounding path.
- *related* - REQ-TRL-010, REQ-PRE-009, REQ-CMP-008

**REQ-TRL-012** · MUST · firm · from caselaw

The system MUST track the examination-in-chief, cross-examination and re-examination of the complainant against a three month clock running from assignment of the case.

- *why* - Indian Bank Association directs the court to ensure the complainant's evidence is concluded within three months of the case being assigned. A case list that shows only the next date cannot tell a magistrate which files are past that mark, so the direction has no operational effect and the case drifts into the years of pendency the Court has repeatedly recorded.
- *authority* - NI Act §143(3) as read in Indian Bank Association v. Union of India (2014) 5 SCC 590 (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *authority* - NI Act §145 as read in Indian Bank Association v. Union of India (2014) 5 SCC 590 (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *binds* - screen: cause list - cases where complainant's evidence is past three months from assignment
- *test* - The court's working list can be filtered to cases where the complainant's evidence is incomplete more than three months after assignment, and the count is on the district dashboard.
- *related* - REQ-REC-005

**REQ-TRL-013** · MUST NOT · firm · from caselaw

The system MUST NOT offer closure of the proceedings and discharge of the accused under section 258 of the Code or section 281 of the Sanhita in a section 138 complaint case.

- *why* - Both provisions apply in terms only to a summons-case instituted otherwise than upon complaint, and the Constitution Bench held that section 258 has no application to a complaint case under section 138, disapproving Meters and Instruments on that point. Section 281 of the Sanhita reproduces section 258 word for word, so a build that gates the exclusion on the Code alone reopens the same defect for every case now filed. A disposal list that still carries closed on payment invites an order that is without jurisdiction, and the complainant's remedy is extinguished by an order liable to be set aside.
- *authority* - Code of Criminal Procedure §258 as read in In re Expeditious Trial of Cases under Section 138 of NI Act (2021) 16 SCC 116 (`crpc:sec_258` - 258. Power to stop proceedings in certain cases) [open](#law?act=crpc&eid=sec_258)
- *authority* - BNSS §281 (`bnss:sec_281` - 281. Power to stop proceedings in certain cases) [open](#law?act=bnss&eid=sec_281)
- *authority* - NI Act §143 as read in In re Expeditious Trial of Cases under Section 138 of NI Act (2021) 16 SCC 116 (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - validation-rule: disposal - closure of proceedings under section 258 of the Code or section 281 of the Sanhita
- *test* - On a section 138 case under either governing code, no disposal mode based on stopping proceedings exists; where payment is made, the available modes are compounding, acquittal on composition, or the plea-and-sentence route.
- *related* - REQ-CMP-011

**REQ-TRL-014** · MUST · firm · from caselaw

The system MUST list a section 138 case before a physical court once summons has been served on the accused.

- *why* - Sanjabij Tari directs that after service of summons matters be placed before physical courts because direct interaction encourages early resolution, and that exemptions from personal appearance be granted only when the facts warrant. Listing before a digital court remains available until service is complete. Where a listing engine assigns a virtual court by default, the settlement conversation that ends most of these cases never happens and the matter runs to judgment.
- *authority* - NI Act §143 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - workflow-step: listing - physical or digital court by service status
- *test* - Completing service flips the default listing mode to physical; a digital listing after service requires a recorded exemption order.
- *related* - REQ-SRV-012

**REQ-TRL-015** · MAY · firm · from act

The system MAY record an order dispensing with the personal attendance of the accused and permitting appearance by advocate, and MUST hold that order as a dated state on the case.

- *why* - Exemption from personal attendance is the normal condition of a section 138 case, where the drawer often lives outside the territory of the court seised under section 142(2). The power is discretionary and reversible: the magistrate may direct personal attendance again at any stage. Where the exemption is a narrative line in the order sheet rather than a state on the case, the attendance register cannot tell an exempted accused from an absconding one, and coercive process issues against a drawer whose absence the court has itself permitted.
- *authority* - BNSS §228 (`bnss:sec_228` - 228. Magistrate may dispense with personal attendance of accused) [open](#law?act=bnss&eid=sec_228)
- *authority* - CrPC §205 (`crpc:sec_205` - 205. Magistrate may dispense with personal attendance of accused) [open](#law?act=crpc&eid=sec_205)
- *authority* - BNSS §355(1) (`bnss:sec_355` - 355. Provision for inquiries and trial being held in absence of accused in certain cases) [open](#law?act=bnss&eid=sec_355)
- *binds* - schema-field: accused - exemption from personal attendance as a dated, revocable state
- *test* - An exemption order sets a state on the accused record with its date; the attendance list distinguishes exempted from absent; and a later order directing personal attendance clears the state rather than being recorded only as text.
- *related* - REQ-TRL-014, REQ-SRV-016

**REQ-TRL-016** · MUST NOT · firm · from act

Where the complainant does not appear on a day fixed for the hearing of a section 138 case governed by the Sanhita, the system MUST NOT allow an acquittal for non-appearance until thirty days have been given to the complainant to be present.

- *why* - The Sanhita added the thirty-day grace that the Code did not have. A build carried over from the Code will acquit the drawer on the day the complainant misses a hearing, and because composition and acquittal both end the case, the payee's only route back is an appeal against acquittal. The difference between the two codes is decisive and turns on which code governs the case.
- *authority* - BNSS §279(1) (`bnss:sec_279` - 279. Non-appearance or death of complainant) [open](#law?act=bnss&eid=sec_279)
- *authority* - CrPC §256(1) (`crpc:sec_256` - 256. Non-appearance or death of complainant) [open](#law?act=crpc&eid=sec_256)
- *binds* - validation-rule: disposal - acquittal on non-appearance of the complainant
- *how* - Thirty days' time is given to the complainant to be present before the acquittal may be recorded; the attendance of the complainant may instead be dispensed with where he is represented by an advocate or by the officer conducting the prosecution, or where the Magistrate is of opinion that his personal attendance is not necessary.
- *test* - On a Sanhita-governed case, recording the complainant's absence offers dispensing with attendance and adjournment but not acquittal; acquittal for non-appearance becomes available only thirty days after the recorded absence. On a Code-governed case it is available at once.
- *related* - REQ-REC-001, REQ-CMP-002

**REQ-TRL-017** · MUST · firm · from act

The system MUST record the pronouncement of judgment in a section 138 case as an event in open court with a date, and MUST NOT permit that date to fall more than forty-five days after the termination of the trial in a case governed by the Sanhita.

- *why* - The Sanhita puts an outer limit of forty-five days on the interval between the close of the trial and pronouncement, where the Code fixed none. A listing tool that treats judgment as an ordinary next date will breach that limit silently, and the six-month endeavour under section 143(3) is lost at the last step, after the evidence is complete.
- *authority* - BNSS §392(1) (`bnss:sec_392` - 392. Judgment) [open](#law?act=bnss&eid=sec_392)
- *authority* - CrPC §353(1) (`crpc:sec_353` - 353. Judgment) [open](#law?act=crpc&eid=sec_353)
- *binds* - validation-rule: judgment - date of pronouncement against the termination of the trial
- *how* - Pronounced in open court by the presiding officer immediately after the termination of the trial or at some subsequent time not later than forty-five days, of which notice is given to the parties or their advocates.
- *test* - Closing the evidence sets a judgment-due date; on a Sanhita-governed case a pronouncement date beyond forty-five days from that event is refused, and the notice to the parties is generated from the fixed date.
- *related* - REQ-REC-004, REQ-TRL-006

**REQ-TRL-018** · MUST NOT · firm · from act

The system MUST NOT record the pronouncement of judgment in the absence of the accused unless his personal attendance during the trial had been dispensed with and the sentence is one of fine only, or he is acquitted.

- *why* - Both limbs of the exception are cumulative, and both are ordinary in a section 138 case: the drawer is usually permitted to appear through counsel and the sentence is usually fine and compensation. A build that treats the dispensation alone as enough will pronounce a sentence of imprisonment on a drawer who is not there, and the judgment is bad on the face of the record. Where there are several accused and one does not attend, the presiding officer may still pronounce to avoid delay, so a rule that simply blocks pronouncement on any absence is wrong in the other direction.
- *authority* - BNSS §392(6) (`bnss:sec_392` - 392. Judgment) [open](#law?act=bnss&eid=sec_392)
- *authority* - CrPC §353(6) (`crpc:sec_353` - 353. Judgment) [open](#law?act=crpc&eid=sec_353)
- *authority* - BNSS §392(5) (`bnss:sec_392` - 392. Judgment) [open](#law?act=bnss&eid=sec_392)
- *binds* - validation-rule: judgment - pronouncement in the absence of the accused
- *test* - Pronouncement with a sole accused marked absent is permitted only where a dispensation order is on the case and the sentence is fine only, or the finding is acquittal; adding imprisonment blocks it. With more than one accused, the absence of one does not block pronouncement.
- *related* - REQ-TRL-015, REQ-TRL-017, REQ-CPY-004

**REQ-TRL-019** · MUST · firm · from act

The system MUST allow a release order in a section 138 case to be completed on the accused's own bond with no surety recorded, where the court finds him indigent and unable to furnish surety.

- *why* - The offence is bailable, and the proviso to section 478(1) makes discharge on a personal bond compulsory, not merely permissible, once the court finds the person indigent and unable to furnish surety; the Explanation presumes indigence where he cannot give a bail bond within a week. If the bond screen makes at least one surety record a precondition to generating the release order, the software converts a right into a bar, and the one class of accused the proviso protects is the one it holds in custody.
- *authority* - BNSS §478(1) proviso and Explanation (`bnss:sec_478` - 478. In what cases bail to be taken) [open](#law?act=bnss&eid=sec_478)
- *binds* - validation-rule: bail - surety not a precondition where the accused is indigent
- *how* - Instead of taking a bail bond, the court discharges the person on his executing a bond for his appearance; indigence is presumed where he is unable to give a bail bond within a week of the date of arrest.
- *test* - A release order generates in a section 138 case with zero surety records where an indigence finding is recorded, and the order names the personal bond and the finding.
- *related* - REQ-TRL-015

#### CMP - compounding, settlement, mediation (13)

**REQ-CMP-001** · MUST · firm · from act

The system MUST treat an offence under section 138 as compoundable at any stage, without reference to the table of compoundable offences in the criminal procedure code.

- *why* - Section 147 makes every offence under the Negotiable Instruments Act compoundable, notwithstanding the code. Section 138 does not appear in the code's table, so a compounding workflow that reads only the table will refuse compounding in the one class of case where settlement is the normal outcome, and cases that both sides have settled stay on the board.
- *authority* - NI Act §147 (`ni:sec_147` - 147. Offences to be compoundable) [open](#law?act=ni&eid=sec_147)
- *authority* - BNSS §359 (`bnss:sec_359` - 359. Compounding of offences) [open](#law?act=bnss&eid=sec_359)
- *authority* - CrPC §320 (`crpc:sec_320` - 320. Compounding of offences) [open](#law?act=crpc&eid=sec_320)
- *binds* - validation-rule: compounding - eligibility of a section 138 offence
- *test* - Open compounding on a section 138 case at any stage from cognizance to appeal: it is offered, and no message refers to the offence being absent from the table.
- *related* - REQ-CMP-002

**REQ-CMP-002** · MUST · firm · from act

The system MUST record the composition of a section 138 offence as having the effect of an acquittal of the accused, not as a withdrawal or a dismissal.

- *why* - The code says composition has the effect of an acquittal. Recording it as a withdrawal or a dismissal for non-prosecution changes what the disposal means for the accused, and it changes what a later court or employer reads off the record.
- *authority* - BNSS §359(8) (`bnss:sec_359` - 359. Compounding of offences) [open](#law?act=bnss&eid=sec_359)
- *authority* - CrPC §320(8) (`crpc:sec_320` - 320. Compounding of offences) [open](#law?act=crpc&eid=sec_320)
- *authority* - NI Act §147 (`ni:sec_147` - 147. Offences to be compoundable) [open](#law?act=ni&eid=sec_147)
- *binds* - schema-field: disposal - composition recorded as an acquittal
- *test* - Completing a compounding produces a disposal of acquittal on composition; the disposal list offers no withdrawal outcome for a compounded case.
- *related* - REQ-CMP-001

**REQ-CMP-003** · MUST NOT · firm · from act

Where the accused has been convicted and an appeal is pending, the system MUST NOT allow the composition to be completed without the leave of the court before which the appeal is to be heard.

- *why* - Composition after conviction requires leave of the appellate court. A build that treats compounding as a purely bilateral act lets a settled matter be closed by the trial court while an appeal is live, leaving a conviction on the record and an appeal with no respondent.
- *authority* - BNSS §359(5) (`bnss:sec_359` - 359. Compounding of offences) [open](#law?act=bnss&eid=sec_359)
- *authority* - CrPC §320(5) (`crpc:sec_320` - 320. Compounding of offences) [open](#law?act=crpc&eid=sec_320)
- *binds* - workflow-step: compounding after conviction - leave of the appellate court
- *test* - On a case with a pending appeal, compounding requires an order granting leave to be attached before it can be completed.
- *related* - REQ-CMP-001

**REQ-CMP-004** · MUST NOT · firm · from act

The system MUST NOT refer a section 138 case to a Lok Adalat without recording either the agreement of both parties, or an application by one party with the court's prima facie satisfaction that there are chances of settlement, or the court's own satisfaction that the matter is appropriate.

- *why* - The Act permits reference only on one of these bases, and in every case except mutual agreement only after a reasonable opportunity of being heard. Bulk referral of section 138 files to a Lok Adalat date without any of this recorded produces references that a party can undo, and the settlement drive loses the very cases it lists.
- *authority* - Legal Services Authorities Act §20(1) (`lsa:sec_20` - 20. Cognizance of cases by Lok Adalats.) [open](#law?act=lsa&eid=sec_20)
- *authority* - Legal Services Authorities Act §19(5) (`lsa:sec_19` - 19. Organisation of Lok Adalats.) [open](#law?act=lsa&eid=sec_19)
- *binds* - workflow-step: Lok Adalat reference - the recorded basis and the hearing
- *how* - On the parties' agreement; or on one party's application where the court is prima facie satisfied there are chances of settlement; or on the court's own satisfaction that the matter is appropriate; in the latter two, after giving the parties a reasonable opportunity of being heard.
- *test* - A reference cannot be created without one of the three bases selected, and selecting either of the last two requires a hearing record.
- *related* - REQ-CMP-005

**REQ-CMP-005** · MUST NOT · firm · from act

The system MUST NOT offer an appeal against an award of a Lok Adalat in a section 138 case.

- *why* - Every award of a Lok Adalat is deemed a decree and no appeal lies against it. A disposal screen that offers the ordinary appeal route after a Lok Adalat award invites an appeal that no court can entertain, and the parties spend the limitation period discovering it.
- *authority* - Legal Services Authorities Act §21(2) (`lsa:sec_21` - 21. Award of Lok Adalat.) [open](#law?act=lsa&eid=sec_21)
- *authority* - Legal Services Authorities Act §21(1) (`lsa:sec_21` - 21. Award of Lok Adalat.) [open](#law?act=lsa&eid=sec_21)
- *binds* - screen: disposal by Lok Adalat award - available post-disposal actions
- *test* - After a Lok Adalat award, no appeal action is offered on the case, and the disposal states that the award is final and binding.
- *related* - REQ-CMP-004, REQ-CMP-006

**REQ-CMP-006** · MUST · firm · from act

Where a Lok Adalat makes no award because no settlement was reached, the system MUST return the case to the referring court at the stage it had reached before the reference.

- *why* - The Act says the record goes back and the court proceeds from the stage reached before the reference. A build that resets the case, or that leaves it parked in a referred state, costs the parties the evidence already recorded and the dates already used, and the case restarts for no reason connected to the merits.
- *authority* - Legal Services Authorities Act §20(5) (`lsa:sec_20` - 20. Cognizance of cases by Lok Adalats.) [open](#law?act=lsa&eid=sec_20)
- *authority* - Legal Services Authorities Act §20(7) (`lsa:sec_20` - 20. Cognizance of cases by Lok Adalats.) [open](#law?act=lsa&eid=sec_20)
- *binds* - workflow-step: Lok Adalat reference - return of an unsettled case
- *test* - Mark a referred case as unsettled: it returns to the referring court showing the same stage, next step and recorded evidence as before the reference.
- *related* - REQ-CMP-004

**REQ-CMP-007** · MUST · firm · from act

Where a section 138 case is settled by a Lok Adalat, the system MUST produce a refund entry for the court fee paid, naming the person entitled to it.

- *why* - The Act directs that the court fee paid in a case settled by a Lok Adalat be refunded. Where the disposal carries no refund entry, the refund depends on the party knowing to ask and on the office finding the original receipt, which is a discouragement to settlement built into the record.
- *authority* - Legal Services Authorities Act §21(1) (`lsa:sec_21` - 21. Award of Lok Adalat.) [open](#law?act=lsa&eid=sec_21)
- *binds* - output-document: Lok Adalat award - court fee refund entitlement
- *test* - A settled case produces a refund entry naming the amount and the entitled party, retrievable from the disposal.
- *related* - REQ-CMP-005

**REQ-CMP-008** · MUST · firm · from caselaw

The summons issued to the accused MUST state that he may apply to compound the offence at the first or second hearing and that compounding at that stage carries no costs.

- *why* - Damodar S. Prabhu directs that the writ of summons be modified to say exactly this, and Indian Bank Association repeats it. The graded costs scheme only works as an incentive if the accused learns of it at the point where the cheap option is still open; a standard criminal summons tells him nothing, and he discovers compounding years later when it costs him a percentage of the cheque.
- *authority* - NI Act §147 as read in Damodar S. Prabhu v. Sayed Babalal H (2010) 5 SCC 663 (`ni:sec_147` - 147. Offences to be compoundable) [open](#law?act=ni&eid=sec_147)
- *authority* - NI Act §144 as read in Indian Bank Association v. Union of India (2014) 5 SCC 590 (`ni:sec_144` - 144. Mode of service of summons) [open](#law?act=ni&eid=sec_144)
- *authority* - NI Act §147 as read in New Win Export v. A. Subramaniam (2024 INSC 535) (`ni:sec_147` - 147. Offences to be compoundable) [open](#law?act=ni&eid=sec_147)
- *binds* - output-document: summons - compounding notice to the accused
- *test* - Every generated section 138 summons carries the compounding paragraph; it cannot be suppressed by the issuing officer.
- *related* - REQ-CMP-009, REQ-CMP-012

**REQ-CMP-009** · MUST · contested · from caselaw

The system MUST compute compounding costs from the stage of the proceedings at which the cheque amount is paid, on the scale currently in force.

- *why* - Two scales exist and they differ in both trigger and rate. Damodar S. Prabhu keyed costs to the stage at which the compounding application was made, at ten, fifteen and twenty per cent. Sanjabij Tari revisited and modified those guidelines, keying them to the stage at which the cheque amount is paid, at nil before defence evidence, five per cent after defence evidence but before judgment, seven and a half per cent before the Sessions Court or High Court, and ten per cent before the Supreme Court, with implementation directed by 1 November 2025. The judgment does not say which scale governs an application already pending on that date, so the transition is unsettled. A hardcoded percentage table will be wrong on one side of the change or the other, and the error falls on a party in money.
- *authority* - NI Act §147 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_147` - 147. Offences to be compoundable) [open](#law?act=ni&eid=sec_147)
- *authority* - NI Act §147 as read in Damodar S. Prabhu v. Sayed Babalal H (2010) 5 SCC 663 (`ni:sec_147` - 147. Offences to be compoundable) [open](#law?act=ni&eid=sec_147)
- *authority* - Constitution of India Article 142 as invoked in Damodar S. Prabhu v. Sayed Babalal H (2010) 5 SCC 663 (`constitution:art_142` - 142. Enforcement of decrees and orders of Supreme Court and orders as to discovery, etc.) [open](#law?act=constitution&eid=art_142)
- *binds* - schema-field: compounding order - cost scale, effective-dated
- *how* - Damodar S. Prabhu keyed the costs to the stage at which the compounding application was made, at ten, fifteen and twenty per cent of the cheque amount. Sanjabij Tari modified that scale and keys it to the stage at which the cheque amount is paid: nil before defence evidence; five per cent after defence evidence but before judgment; seven and a half per cent before the Sessions Court or the High Court; ten per cent before the Supreme Court. Whichever scale is applied, the costs are computed on the amount of the cheque.
- *test* - The scale in force is held as effective-dated data with its source judgment, so changing it is a data change and not a release; a compounding order names the scale version applied, and an order made across the transition date records on its face which scale was chosen and why.
- *related* - REQ-CMP-008, REQ-CMP-010

**REQ-CMP-010** · MUST · firm · from caselaw

Compounding costs MUST be routed to the Legal Services Authority operating at the level of the court before which compounding takes place.

- *why* - Damodar S. Prabhu is explicit that costs go to the District Legal Services Authority for a Magistrate or Sessions Court, the State Authority for the High Court and the National Authority for the Supreme Court, and Sanjabij Tari keeps the same destination. A payment step that treats the costs as a court fee or as money payable to the complainant sends the deposit to the wrong account and the compounding order cannot be complied with.
- *authority* - NI Act §147 as read in Damodar S. Prabhu v. Sayed Babalal H (2010) 5 SCC 663 (`ni:sec_147` - 147. Offences to be compoundable) [open](#law?act=ni&eid=sec_147)
- *authority* - Legal Services Authorities Act §19 as read in Damodar S. Prabhu v. Sayed Babalal H (2010) 5 SCC 663 (`lsa:sec_19` - 19. Organisation of Lok Adalats.) [open](#law?act=lsa&eid=sec_19)
- *binds* - workflow-step: compounding - deposit of costs with the Legal Services Authority at the level of the court
- *test* - The payee of the compounding costs is derived from the court's level and cannot be edited to the complainant or to the court's own fee head.
- *related* - REQ-CMP-009

**REQ-CMP-011** · MUST · contested · from caselaw

The system MUST record the complainant's consent as a condition of any compounding order made by a trial or appellate court.

- *why* - JIK Industries holds that section 147 makes the offence compoundable but does not displace the requirement of the aggrieved party's consent. The authorities beyond that point divide. Meters and Instruments held that a court could close proceedings without consent once the complainant was compensated, and was disapproved by the Constitution Bench on the section 258 route it used. Raj Reddy Kallem allows a conviction to be set aside on compensation without consent, but expressly as a quashing under Article 142 rather than a compounding, and that power is not available to a trial court. A workflow that lets a magistrate compound without recorded consent is relying on the one line of authority that has been cut back.
- *authority* - NI Act §147 as read in JIK Industries Ltd v. Amarlal V. Jumani (2012) 3 SCC 255 (`ni:sec_147` - 147. Offences to be compoundable) [open](#law?act=ni&eid=sec_147)
- *authority* - Constitution of India Article 142 as applied in Raj Reddy Kallem v. State of Haryana (2024 SCC OnLine SC 3223) (`constitution:art_142` - 142. Enforcement of decrees and orders of Supreme Court and orders as to discovery, etc.) [open](#law?act=constitution&eid=art_142)
- *authority* - BNSS §359 as read in Damodar S. Prabhu v. Sayed Babalal H (2010) 5 SCC 663 (`bnss:sec_359` - 359. Compounding of offences) [open](#law?act=bnss&eid=sec_359)
- *binds* - validation-rule: compounding order - recorded consent of the complainant
- *test* - A compounding order cannot be made without a recorded consent from the complainant or the complainant's authorised representative; a disposal on payment without consent is available only as a distinct mode marked as an Article 142 order of the Supreme Court.
- *related* - REQ-TRL-013, REQ-CMP-013

**REQ-CMP-012** · MUST · firm · from caselaw

The system MUST provide a court-operated online payment channel for the cheque amount at the district level, and the summons MUST carry the link or code for it.

- *why* - Sanjabij Tari directs each Principal District and Sessions Judge to create and operationalise dedicated secure QR or UPI payment facilities, and directs that the summons expressly mention the accused's option to pay the cheque amount at the initial stage through that link. Where the accused who is willing to pay has no channel except a bank draft tendered in court on a hearing date, the payment happens at the pace of the cause list and the case is not settled at the threshold.
- *authority* - NI Act §147 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_147` - 147. Offences to be compoundable) [open](#law?act=ni&eid=sec_147)
- *authority* - NI Act §144 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_144` - 144. Mode of service of summons) [open](#law?act=ni&eid=sec_144)
- *binds* - workflow-step: early payment - district online payment channel referenced in the summons
- *test* - The summons carries a working payment reference; a payment against it is attributed to the case, notified to the complainant, and raises the compounding or closure decision before the court.
- *related* - REQ-CMP-008, REQ-CMP-011

**REQ-CMP-013** · MAY · inferred · from caselaw

Where the accused tenders the cheque amount but the complainant demands more, the system MAY offer the court a plea-of-guilty and sentencing route in place of compounding.

- *why* - Sanjabij Tari directs that if the complainant asks for payment beyond the cheque amount or settlement of the entire loan, the magistrate may suggest that the accused plead guilty and may exercise the powers under section 255(2) or 255(3) CrPC or section 278 BNSS, or extend the benefit of the Probation of Offenders Act. Without that branch the case has nowhere to go: consent is withheld, compounding fails, and a matter in which the money is on the table is set down for full trial.
- *authority* - Code of Criminal Procedure §255 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`crpc:sec_255` - 255. Acquittal or conviction) [open](#law?act=crpc&eid=sec_255)
- *authority* - BNSS §278 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`bnss:sec_278` - 278. Acquittal or conviction) [open](#law?act=bnss&eid=sec_278)
- *binds* - workflow-step: settlement failure - plea of guilty and sentencing branch
- *test* - Where a tender of the cheque amount is recorded and consent is refused, the court is offered the plea-and-sentence branch alongside continue trial, and the tender remains on the record.
- *related* - REQ-CMP-011, REQ-SEN-019

#### SEN - sentence, fine, compensation (20)

**REQ-SEN-001** · MUST NOT · firm · from act

The system MUST NOT permit a fine under section 138 that exceeds twice the amount of the cheque.

- *why* - The section caps the fine at twice the cheque amount. Fines are commonly set to cover the cheque plus interest and costs, and in a large-interest case that arithmetic can cross the cap without anyone noticing, producing a sentence the trial court had no power to pass.
- *authority* - NI Act §138 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - validation-rule: sentence - fine cap under section 138
- *test* - Enter a fine of more than twice the cheque amount: the sentence step refuses and states the cap and the cheque amount.
- *related* - REQ-SEN-003

**REQ-SEN-002** · MUST · firm · from act

Where a section 138 case has been tried summarily, the system MUST apply a ceiling of one year on imprisonment, in place of the three-month ceiling that governs summary trials generally.

- *why* - Section 143 raises the summary-trial sentencing power for these cases from three months to one year, and lifts the fine ceiling. A build that applies the general summary-trial cap under-sentences in serious cases; one that applies the general two-year maximum for section 138 without noticing the summary trial passes a sentence beyond the court's power.
- *authority* - NI Act §143(1) first proviso (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *authority* - BNSS §285(2) (`bnss:sec_285` - 285. Procedure for summary trials) [open](#law?act=bnss&eid=sec_285)
- *authority* - CrPC §262(2) (`crpc:sec_262` - 262. Procedure for summary trials) [open](#law?act=crpc&eid=sec_262)
- *authority* - NI Act §138 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - validation-rule: sentence - imprisonment cap in a summarily tried section 138 case
- *test* - On a case marked summary, the sentence step accepts up to one year and refuses more; it does not refuse at three months.
- *related* - REQ-TRL-001

**REQ-SEN-003** · MUST · firm · from act

The system MUST record compensation to the complainant as a field distinct from the fine imposed.

- *why* - The two powers are different. Compensation out of the fine can only be paid from what is recovered as fine; compensation where no fine is imposed is a free-standing order. A record that merges them cannot tell the recovery clerk what to collect or the complainant what he is entitled to.
- *authority* - BNSS §395(1)(b) (`bnss:sec_395` - 395. Order to pay compensation) [open](#law?act=bnss&eid=sec_395)
- *authority* - BNSS §395(3) (`bnss:sec_395` - 395. Order to pay compensation) [open](#law?act=bnss&eid=sec_395)
- *authority* - CrPC §357 (`crpc:sec_357` - 357. Order to pay compensation) [open](#law?act=crpc&eid=sec_357)
- *binds* - schema-field: sentence - compensation, distinct from fine and identified as to source
- *test* - The sentence record carries fine and compensation as separate populated amounts, and neither is derived from the other.
- *related* - REQ-SEN-001, REQ-SEN-004

**REQ-SEN-004** · MUST · firm · from act

The system MUST record whether an order of compensation is payable out of the fine recovered or is a free-standing order made where fine forms no part of the sentence.

- *why* - These are two different powers with different consequences. Compensation out of the fine can be paid only from what is actually recovered as fine and only after the appeal period; a free-standing order under the separate power is not tied to any recovery. A record that does not say which was made leaves the recovery clerk with no instruction and the complainant with no way to know what he is owed and when.
- *authority* - BNSS §395(1)(b) (`bnss:sec_395` - 395. Order to pay compensation) [open](#law?act=bnss&eid=sec_395)
- *authority* - BNSS §395(3) (`bnss:sec_395` - 395. Order to pay compensation) [open](#law?act=bnss&eid=sec_395)
- *authority* - CrPC §357(1) (`crpc:sec_357` - 357. Order to pay compensation) [open](#law?act=crpc&eid=sec_357)
- *authority* - CrPC §357(3) (`crpc:sec_357` - 357. Order to pay compensation) [open](#law?act=crpc&eid=sec_357)
- *binds* - schema-field: compensation order - source, as out of fine or free-standing
- *test* - Every compensation order carries an enumerated source value, and a free-standing order cannot be created on a sentence that also imposes a fine intended to fund it.
- *related* - REQ-SEN-003, REQ-SEN-006

**REQ-SEN-005** · MUST · firm · from act

The system MUST compute the fine or compensation payable under the sentence net of any amount already paid or recovered as interim compensation.

- *why* - Section 143A(6) requires the set-off. Where the sentence is entered without it, the drawer pays the same money twice, and the excess is recovered as a fine with the coercive machinery that follows a fine. This is the most common arithmetic error in a section 138 sentence.
- *authority* - NI Act §143A(6) (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *authority* - BNSS §395 (`bnss:sec_395` - 395. Order to pay compensation) [open](#law?act=bnss&eid=sec_395)
- *binds* - validation-rule: sentence - set-off of interim compensation already paid
- *test* - With interim compensation of 20000 paid, entering a fine of 100000 produces a net payable of 80000 on the sentence record, with the set-off shown.
- *related* - REQ-SEN-011, REQ-APL-003

**REQ-SEN-006** · MUST NOT · firm · from act

The system MUST NOT release any part of a fine to the complainant before the appeal period has elapsed, or, where an appeal is filed, before it is decided.

- *why* - The bar is express. A disbursement flow that pays out on the day the fine is deposited defeats the appeal, because the money is gone before the appellate court can consider whether the conviction stands.
- *authority* - BNSS §395(2) (`bnss:sec_395` - 395. Order to pay compensation) [open](#law?act=bnss&eid=sec_395)
- *authority* - CrPC §357(2) (`crpc:sec_357` - 357. Order to pay compensation) [open](#law?act=crpc&eid=sec_357)
- *binds* - workflow-step: disbursement of fine - hold until the appeal period expires or the appeal is decided
- *test* - Disbursement of a fine-sourced compensation is unavailable until the appeal period has run with no appeal filed, or until a decided appeal is recorded.
- *related* - REQ-SEN-003, REQ-APL-001

**REQ-SEN-008** · MUST · firm · from act

Where the court proposes to release an offender on probation of good conduct, the system MUST hold the probation officer's report, if one exists, on the case record before the order is made.

- *why* - The court is required to take the probation officer's report into consideration before making the order. Where the report is filed to the officer's own file and never reaches the case record, the order is made without the material the statute directs the court to consider.
- *authority* - Probation of Offenders Act §4(2) (`probation:sec_4` - 4. Power of court to release certain offenders on probation of good conduct) [open](#law?act=probation&eid=sec_4)
- *binds* - workflow-step: release on probation - probation officer's report on the record
- *test* - The probation release order step shows whether a probation officer's report exists and, where one does, requires it to be on the record before the order can be made.
- *related* - REQ-SEN-019, REQ-SEN-009

**REQ-SEN-009** · MUST · firm · from act

Where an offender is released after admonition or on probation, the system MUST allow an order for compensation for the loss caused and for the costs of the proceedings to be made at the same time.

- *why* - Release under the Probation Act without a compensation order leaves the complainant in a section 138 case with a conviction, no money and no fine to be paid out of. The Act expressly permits the compensation order to be made at the same time, and if the workflow does not offer it at that step it cannot be made later in the same order.
- *authority* - Probation of Offenders Act §5(1) (`probation:sec_5` - 5. Power of court to require released offenders to pay compensation and costs) [open](#law?act=probation&eid=sec_5)
- *binds* - workflow-step: release under the Probation Act - concurrent compensation and costs order
- *test* - The probation or admonition release step offers compensation and costs fields in the same order, not as a separate later application.
- *related* - REQ-SEN-008

**REQ-SEN-010** · MUST NOT · firm · from act

The system MUST NOT allow an order of interim compensation before the accused has pleaded not guilty, in a summary trial or summons case, or before charge has been framed in any other case.

- *why* - The power arises only at that point. An order made at the first appearance, before the accused has pleaded, is passed without jurisdiction, and it is enforced as a fine against a person the court has not yet put to plea.
- *authority* - NI Act §143A(1) (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *binds* - workflow-step: interim compensation - the stage at which the order may be made
- *how* - In a summary trial or a summons case, upon the accused pleading not guilty; in any other case, upon framing of charge.
- *test* - The interim compensation action is unavailable until a plea of not guilty is recorded on a summary or summons case, and until charge is framed in any other case.
- *related* - REQ-TRL-007, REQ-SEN-011, REQ-SEN-020

**REQ-SEN-011** · MUST NOT · firm · from act

The system MUST NOT permit an order of interim compensation exceeding twenty per cent of the amount of the cheque.

- *why* - The cap is absolute. An order above it is void to the extent of the excess and is recoverable as a fine in the meantime, so the drawer pays money the court could not order before anyone tests the figure.
- *authority* - NI Act §143A(2) (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *binds* - validation-rule: interim compensation - twenty per cent cap
- *test* - On a cheque of 500000, an interim compensation figure above 100000 is refused with the cap and the cheque amount shown.
- *related* - REQ-SEN-010, REQ-SEN-005

**REQ-SEN-012** · MUST · firm · from act

The system MUST compute the due date for payment of interim compensation as sixty days from the date of the order, extendable only by a recorded order granting not more than thirty further days on sufficient cause.

- *why* - The two periods are different and the second requires a judicial act. A build with a single ninety-day clock lets the drawer take the extension without asking for it, and a build with a bare sixty-day clock treats a lawfully extended payment as a default and triggers recovery.
- *authority* - NI Act §143A(3) (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *binds* - validation-rule: interim compensation - payment due date and its extension
- *how* - Sixty days from the date of the order, or such further period not exceeding thirty days as the court directs on sufficient cause being shown by the drawer.
- *test* - The due date is sixty days from the order; an extension can be recorded only through an order capturing the cause, and cannot exceed thirty days.
- *related* - REQ-SEN-010, REQ-SEN-013

**REQ-SEN-013** · MUST · firm · from act

Where the drawer is acquitted, the system MUST raise an order for the complainant to repay the interim compensation with interest at the Reserve Bank of India bank rate prevalent at the beginning of the relevant financial year.

- *why* - The repayment direction is mandatory on acquittal and carries a specified rate. Where the acquittal disposal does not raise it, an acquitted drawer has to move a fresh application for money the statute says he gets back, and the interest computation is argued from scratch every time.
- *authority* - NI Act §143A(4) (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *binds* - workflow-step: acquittal - repayment of interim compensation with interest
- *how* - With interest at the bank rate published by the Reserve Bank of India prevalent at the beginning of the relevant financial year, within sixty days of the order or such further period not exceeding thirty days as the court directs on sufficient cause shown by the complainant.
- *test* - Recording an acquittal on a case with interim compensation paid produces a repayment order with the principal, the applicable bank rate, the financial year used and the due date.
- *related* - REQ-SEN-012, REQ-APL-005

**REQ-SEN-014** · MUST · inferred · from act

The system MUST link every recovery entry to the specific order it enforces and to that order's type as interim compensation, fine or compensation.

- *why* - Interim compensation is recoverable as if it were a fine, which brings the coercive recovery machinery to bear before any conviction, and section 143A(6) requires what is recovered as interim compensation to be set off against the fine or compensation finally awarded. Neither sub-section directs how recovery is to be recorded; the requirement is the reading that makes the set-off computable. Where the recovery record does not name the order it enforces, an interim order and a sentence of fine become indistinguishable in the recovery register, and money recovered against one is set off against the other.
- *authority* - NI Act §143A(5) (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *authority* - NI Act §143A(6) (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *binds* - schema-field: recovery record - the order under which the amount is recovered
- *test* - Every recovery entry names the order it enforces and its type as interim compensation, fine or compensation.
- *related* - REQ-SEN-005

**REQ-SEN-016** · MUST · inferred · from act

The system MUST make any compensation paid or recovered in a section 138 case retrievable in a form a civil court can rely on when awarding damages on the same matter.

- *why* - Both the criminal procedure code and the Probation Act require a civil court to take into account what has already been paid as compensation. If the criminal record cannot produce that figure on demand, the same loss is compensated twice, once as compensation and once as damages.
- *authority* - BNSS §395(5) (`bnss:sec_395` - 395. Order to pay compensation) [open](#law?act=bnss&eid=sec_395)
- *authority* - Probation of Offenders Act §5(3) (`probation:sec_5` - 5. Power of court to require released offenders to pay compensation and costs) [open](#law?act=probation&eid=sec_5)
- *binds* - output-document: certificate of compensation paid or recovered in the case
- *test* - A disposed case can produce a statement of every amount paid or recovered as compensation, with dates and the orders they were paid under.
- *related* - REQ-SEN-003, REQ-SEN-009

**REQ-SEN-017** · SHOULD · firm · from caselaw

On conviction, the system SHOULD compute a default compensation figure of the cheque amount together with simple interest at nine per cent per annum from the date of the cheque.

- *why* - R. Vijayan holds that courts should, unless there are special circumstances, uniformly levy a fine up to twice the cheque amount taking the cheque amount and simple interest at nine per cent as the reasonable measure of loss, and direct payment of that sum as compensation. The Court identified the failure mode itself: where compensation is not ordered, the complainant is left without a remedy because by the time the criminal case ends the limitation for a civil suit has expired.
- *authority* - Code of Criminal Procedure §357 as read in R. Vijayan v. Baby (2012) 1 SCC 260 (`crpc:sec_357` - 357. Order to pay compensation) [open](#law?act=crpc&eid=sec_357)
- *authority* - BNSS §395 as the successor provision applied in R. Vijayan v. Baby (2012) 1 SCC 260 (`bnss:sec_395` - 395. Order to pay compensation) [open](#law?act=bnss&eid=sec_395)
- *authority* - NI Act §138 as read in R. Vijayan v. Baby (2012) 1 SCC 260 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - NI Act §138 as read in Kaushalya Devi Massand v. Roopkishore Khore (2011) 4 SCC 593 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: sentencing - computed default compensation figure
- *how* - The default is the cheque amount plus simple interest at nine per cent per annum from the date of the cheque to the date of judgment, capped by the statutory ceiling of twice the cheque amount.
- *test* - The sentencing screen shows the computed figure with its components before the court fixes the amount; the components are visible in the judgment.
- *related* - REQ-SEN-018

**REQ-SEN-018** · MUST · firm · from caselaw

Where the court awards compensation below the computed default, the judgment MUST record the special circumstances relied on.

- *why* - R. Vijayan permits departure only for special circumstances and rests the whole direction on uniformity between courts, and Suganthi Suresh Kumar holds that sentence and compensation should not be lightly reduced below the norm. A free amount field with no reason produces exactly the inconsistency the Court described, where litigants cannot tell whether to file a civil suit alongside.
- *authority* - NI Act §138 as read in Suganthi Suresh Kumar v. Jagdeeshan (2002) 2 SCC 420 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - Code of Criminal Procedure §357 as read in R. Vijayan v. Baby (2012) 1 SCC 260 (`crpc:sec_357` - 357. Order to pay compensation) [open](#law?act=crpc&eid=sec_357)
- *binds* - validation-rule: sentencing - departure below the default compensation
- *test* - An amount below the computed default cannot be saved without recorded special circumstances, and those circumstances print in the judgment.
- *related* - REQ-SEN-017

**REQ-SEN-019** · MUST · firm · from caselaw

The sentencing step MUST require the court to record whether the benefit of the Probation of Offenders Act was considered.

- *why* - A section 138 offence is punishable with imprisonment of not more than two years, so it falls squarely within the power to release after admonition and the power to release on probation of good conduct. Sanjabij Tari holds that an accused under section 138 is entitled to the benefit of the Probation of Offenders Act, sets aside the contrary High Court view, and offers probation as one route where the complainant demands more than the cheque amount. Where the sentencing screen offers only imprisonment, fine and compensation, probation is never considered, an appellate court cannot tell whether the discretion was exercised or forgotten, and appeals are allowed on that omission alone.
- *authority* - Probation of Offenders Act §4 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`probation:sec_4` - 4. Power of court to release certain offenders on probation of good conduct) [open](#law?act=probation&eid=sec_4)
- *authority* - Probation of Offenders Act §3 (`probation:sec_3` - 3. Power of court to release certain offenders after admonition) [open](#law?act=probation&eid=sec_3)
- *authority* - NI Act §138 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - workflow-step: sentencing - consideration of probation
- *test* - The sentencing step cannot be completed without a recorded consideration of probation, whether granted or declined, and the reason appears in the judgment.
- *related* - REQ-CMP-013, REQ-SEN-008

**REQ-SEN-020** · MUST · firm · from caselaw

The system MUST gate interim compensation under section 143A on the offence having been committed on or after 1 September 2018.

- *why* - G.J. Raja holds section 143A to be prospective only, because it imposes a new disability enforceable as arrears of land revenue before any finding of guilt, and article 20(1) forbids subjecting a person to a penalty greater than that which could have been inflicted under the law in force when the offence was committed. A workflow that offers interim compensation on every case will produce orders against accused whose cheques bounced before the amendment, and those orders are set aside with the money refunded with interest, as happened in G.J. Raja itself.
- *authority* - NI Act §143A as read in G.J. Raja v. Tejraj Surana (2019) 21 SCC 41 (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *authority* - Constitution of India Article 20(1) as read in G.J. Raja v. Tejraj Surana (2019) 21 SCC 41 (`constitution:art_20` - 20. Protection in respect of conviction for offences.) [open](#law?act=constitution&eid=art_20)
- *binds* - validation-rule: interim compensation - offence date gate
- *test* - Where the cause-of-action date precedes 1 September 2018, the interim compensation action is unavailable and the screen states why.
- *related* - REQ-SEN-010, REQ-SEN-021, REQ-APL-009

**REQ-SEN-021** · MUST · firm · from caselaw

The complaint MUST record whether interim compensation under section 143A is sought.

- *why* - The synopsis prescribed by Sanjabij Tari makes the relief a declared head. Where the prayer is buried in the body of the complaint, the registry cannot see it, and the compensatory purpose of the provision, which is to put money in the payee's hands during the trial rather than after it, is defeated before the question is ever reached.
- *authority* - NI Act §143A as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *binds* - schema-field: complaint - relief sought, interim compensation under section 143A
- *test* - Relief sought is a structured value in the synopsis with interim compensation as a distinct yes/no head, queryable across the docket.
- *related* - REQ-FIL-009, REQ-SEN-020, REQ-SEN-022

**REQ-SEN-022** · SHOULD · firm · from caselaw

Where interim compensation under section 143A is sought, the system SHOULD raise the decision on it before the court at the earliest hearing at which the power is available.

- *why* - Sanjabij Tari directs that where the trial court deems it appropriate it shall order the interim deposit as early as possible, and the power arises the moment the accused pleads not guilty. Where nothing raises the question, it is taken up on some later date or not at all, and money the statute intends the payee to hold during the trial arrives only with the judgment, if then.
- *authority* - NI Act §143A as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *authority* - NI Act §143A(1) (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *binds* - workflow-step: interim compensation - raising the decision after plea
- *test* - On a case where the relief is sought, recording a plea of not guilty raises an interim compensation decision task on the court's pending list, dated to that hearing.
- *related* - REQ-SEN-010, REQ-SEN-021

#### APL - appeal, revision, deposit (9)

**REQ-APL-001** · MUST · firm · from act

The system MUST route an appeal against a conviction by a Judicial Magistrate of the first class in a section 138 case to the Court of Session.

- *why* - A section 138 conviction is by a first class magistrate and carries at most two years, so the appeal lies to the Court of Session and not to the High Court. An appeal filed in the wrong forum is returned, and the time spent is rarely recovered by condonation.
- *authority* - BNSS §415(3)(a) (`bnss:sec_415` - 415. Appeals from convictions) [open](#law?act=bnss&eid=sec_415)
- *authority* - CrPC §374(3)(a) (`crpc:sec_374` - 374. Appeals from convictions) [open](#law?act=crpc&eid=sec_374)
- *authority* - NI Act §142(1)(c) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: appeal - forum for a conviction by a magistrate of the first class
- *test* - Filing an appeal against a section 138 conviction proposes the Court of Session, and selecting the High Court raises a blocking message naming section 415(3)(a).
- *related* - REQ-JUR-004

**REQ-APL-002** · MUST NOT · firm · from act

The system MUST NOT permit an order under section 148 directing a deposit of less than twenty per cent of the fine or compensation awarded by the trial court.

- *why* - Section 148 sets a floor, not a ceiling. An appellate court that orders ten per cent has passed an order below the statutory minimum, and the complainant is deprived of money Parliament intended to reach him while the appeal runs.
- *authority* - NI Act §148(1) (`ni:sec_148` - 148. Power of Appellate Court to order payment pending appeal against conviction) [open](#law?act=ni&eid=sec_148)
- *binds* - validation-rule: appeal deposit - the twenty per cent floor
- *test* - With a fine of 500000, a deposit order below 100000 is refused and the message names the floor.
- *related* - REQ-APL-003

**REQ-APL-003** · MUST · firm · from act

The system MUST compute the deposit ordered under section 148 on the full fine or compensation awarded by the trial court, without setting off interim compensation already paid.

- *why* - The proviso says the deposit is in addition to interim compensation paid under section 143A. A build that reuses the section 143A set-off logic for the appellate deposit reduces the deposit by money already paid, which is exactly what the proviso forbids, and it does so silently.
- *authority* - NI Act §148(1) proviso (`ni:sec_148` - 148. Power of Appellate Court to order payment pending appeal against conviction) [open](#law?act=ni&eid=sec_148)
- *authority* - NI Act §143A(6) (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *binds* - validation-rule: appeal deposit - no set-off of interim compensation
- *test* - With interim compensation of 100000 paid and a fine of 500000, the section 148 deposit is computed on 500000, not on 400000.
- *related* - REQ-APL-002, REQ-SEN-005

**REQ-APL-004** · MUST · firm · from act

The system MUST compute the due date for the section 148 deposit as sixty days from the order, extendable only by a recorded order granting not more than thirty further days on sufficient cause.

- *why* - The periods mirror section 143A and carry the same risk. A single ninety-day clock gives the appellant an extension he never sought; a bare sixty-day clock reports a lawfully extended deposit as a default, and the appeal is at risk of being taken up as unprosecuted.
- *authority* - NI Act §148(2) (`ni:sec_148` - 148. Power of Appellate Court to order payment pending appeal against conviction) [open](#law?act=ni&eid=sec_148)
- *binds* - validation-rule: appeal deposit - due date and its extension
- *how* - Sixty days from the date of the order, or such further period not exceeding thirty days as the court directs on sufficient cause being shown by the appellant.
- *test* - The deposit due date is sixty days from the order; an extension requires an order capturing the cause and cannot exceed thirty days.
- *related* - REQ-APL-002, REQ-SEN-012

**REQ-APL-005** · MUST · firm · from act

Where a deposit released to the complainant during the appeal has to be repaid because the appellant is acquitted, the system MUST raise the repayment order with interest at the Reserve Bank of India bank rate prevalent at the beginning of the relevant financial year.

- *why* - Release of the deposit during the appeal is discretionary but repayment on acquittal is not. Where the acquittal disposal does not raise the repayment, an acquitted appellant is left to recover from the complainant by fresh proceedings money the statute directs be returned within sixty days.
- *authority* - NI Act §148(3) (`ni:sec_148` - 148. Power of Appellate Court to order payment pending appeal against conviction) [open](#law?act=ni&eid=sec_148)
- *binds* - workflow-step: acquittal on appeal - repayment of a released deposit with interest
- *how* - With interest at the bank rate published by the Reserve Bank of India prevalent at the beginning of the relevant financial year, within sixty days of the order or such further period not exceeding thirty days as the court directs on sufficient cause shown by the complainant.
- *test* - Recording an acquittal on an appeal where the deposit was released produces a repayment order stating the principal released, the rate, the financial year and the due date.
- *related* - REQ-SEN-013

**REQ-APL-006** · MUST · firm · from caselaw

On an appeal against conviction under section 138, the appellate workflow MUST require an express order on the deposit of not less than twenty per cent of the fine or compensation before or with any suspension of sentence.

- *why* - Surinder Singh Deswal holds that the may in section 148 is ordinarily to be read as shall. Where suspension of sentence can be granted with no deposit decision recorded, the appellate stage becomes a free stay and the convicted drawer holds the money for the years the appeal takes, which is the abuse section 148 was inserted to stop.
- *authority* - NI Act §148 as read in Surinder Singh Deswal v. Virender Gandhi (2019) 11 SCC 341 (`ni:sec_148` - 148. Power of Appellate Court to order payment pending appeal against conviction) [open](#law?act=ni&eid=sec_148)
- *authority* - Code of Criminal Procedure §389 as applied in Surinder Singh Deswal v. Virender Gandhi (2019) 11 SCC 341 (`crpc:sec_389` - 389. Suspension of sentence pending the appeal; release of appellant on bail) [open](#law?act=crpc&eid=sec_389)
- *binds* - workflow-step: appeal - order on the section 148 deposit
- *test* - A suspension of sentence order cannot be issued without an accompanying deposit order, whether directing, varying or waiving the deposit.
- *related* - REQ-APL-007, REQ-APL-008

**REQ-APL-007** · MUST · firm · from caselaw

The appellate workflow MUST permit the section 148 deposit to be waived, and MUST require reasons where it is.

- *why* - Jamboo Bhandari holds that the deposit is not an absolute rule and that the appellate court must apply its mind and record reasons where it finds an exceptional case, and further that the court must consider the exception even where the appellant has not asked for it. Both the Sessions Court and the High Court in that case proceeded on the erroneous premise that the deposit admitted of no exception; a system that offers no waiver path builds that same error into every appeal.
- *authority* - NI Act §148 as read in Jamboo Bhandari v. M.P. State Industrial Development Corp Ltd (2023 INSC 822) (`ni:sec_148` - 148. Power of Appellate Court to order payment pending appeal against conviction) [open](#law?act=ni&eid=sec_148)
- *binds* - validation-rule: appeal - waiver of the section 148 deposit
- *test* - The deposit order offers waive as an option; selecting it requires recorded reasons, and the reasons print in the order.
- *related* - REQ-APL-006

**REQ-APL-008** · MUST · firm · from caselaw

The system MUST track compliance with a deposit condition attached to a suspension of sentence and MUST support an order vacating the suspension on non-compliance.

- *why* - Surinder Singh Deswal holds that where suspension was granted on a condition, non-compliance is sufficient for the appellate court to declare the suspension vacated. If the deposit condition is recorded only as narrative in the order and nothing watches the due date, non-payment is invisible, the sentence stays suspended by default, and the condition is worth nothing.
- *authority* - NI Act §148 as read in Surinder Singh Deswal v. Virender Gandhi (2019) 11 SCC 341 (`ni:sec_148` - 148. Power of Appellate Court to order payment pending appeal against conviction) [open](#law?act=ni&eid=sec_148)
- *authority* - Code of Criminal Procedure §389 as applied in Surinder Singh Deswal v. Virender Gandhi (2019) 11 SCC 341 (`crpc:sec_389` - 389. Suspension of sentence pending the appeal; release of appellant on bail) [open](#law?act=crpc&eid=sec_389)
- *binds* - workflow-step: appeal - deposit compliance monitoring and vacation of suspension
- *test* - A deposit condition carries a due date and a paid status; expiry without payment raises a task before the appellate court with vacate suspension available.
- *related* - REQ-APL-006

**REQ-APL-009** · MUST NOT · firm · from caselaw

The system MUST NOT gate the section 148 appeal deposit on the offence date.

- *why* - Section 148 and section 143A were inserted by the same amendment, but the Supreme Court has treated them differently: G.J. Raja holds section 143A prospective while Surinder Singh Deswal applies section 148 to appeals even where the cheque predates the amendment, because section 148 creates no new disability and rests on existing recovery machinery. A designer who applies one date rule to both provisions will either refuse a deposit the law requires or impose interim compensation the law forbids.
- *authority* - NI Act §148 as read in Surinder Singh Deswal v. Virender Gandhi (2019) 11 SCC 341 (`ni:sec_148` - 148. Power of Appellate Court to order payment pending appeal against conviction) [open](#law?act=ni&eid=sec_148)
- *authority* - NI Act §143A as distinguished in G.J. Raja v. Tejraj Surana (2019) 21 SCC 41 (`ni:sec_143A` - 143A. Power to direct interim compensation) [open](#law?act=ni&eid=sec_143A)
- *binds* - validation-rule: appeal - applicability of section 148 to pre-amendment offences
- *test* - An appeal in a case whose cause of action predates 1 September 2018 still requires a section 148 deposit order, while the same case shows interim compensation as unavailable.
- *related* - REQ-SEN-020, REQ-APL-006

#### REC - the court record, registers, retention (5)

**REQ-REC-001** · MUST · firm · from act

The system MUST store, on every case, which procedural code governs it, determined by whether the trial, inquiry, appeal or application was pending immediately before 1 July 2024.

- *why* - The savings provision keys the code to pendency at commencement, not to the date of the cheque or of the offence. A build that switches on the date of the offence will apply the Sanhita to a trial that was already pending and must continue under the Code, and every step it takes in that case is taken under the wrong procedure.
- *authority* - BNSS §531(2)(a) (`bnss:sec_531` - 531. Repeal and savings) [open](#law?act=bnss&eid=sec_531)
- *authority* - BNSS §531(1) (`bnss:sec_531` - 531. Repeal and savings) [open](#law?act=bnss&eid=sec_531)
- *binds* - schema-field: case - governing procedural code, derived from pendency at 1 July 2024
- *how* - A trial, inquiry, appeal or application pending immediately before the commencement of the Sanhita is continued and disposed of under the Code of Criminal Procedure, 1973 as it stood immediately before that date.
- *test* - Create a case with an offence in 2023 and cognizance in 2025: the governing code is the Sanhita. Create a case pending trial in June 2024: the governing code remains the Code, and it does not change when the case is next listed.
- *related* - REQ-REC-002

**REQ-REC-002** · MUST · inferred · from act

Every order and judgment the system generates MUST cite the section number of the procedural code that actually governs the case.

- *why* - The same step has different section numbers in the two codes: issue of process is section 204 in the Code and section 227 in the Sanhita, compensation is section 357 and section 395. Orders carrying the wrong citation are a standing ground of challenge and they mislead every later reader of the file, including the appellate court.
- *authority* - BNSS §531(2)(a) (`bnss:sec_531` - 531. Repeal and savings) [open](#law?act=bnss&eid=sec_531)
- *authority* - BNSS §227 (`bnss:sec_227` - 227. Issue of process) [open](#law?act=bnss&eid=sec_227)
- *authority* - CrPC §204 (`crpc:sec_204` - 204. Issue of process) [open](#law?act=crpc&eid=sec_204)
- *authority* - BNSS §395 (`bnss:sec_395` - 395. Order to pay compensation) [open](#law?act=bnss&eid=sec_395)
- *authority* - CrPC §357 (`crpc:sec_357` - 357. Order to pay compensation) [open](#law?act=crpc&eid=sec_357)
- *binds* - output-document: orders and judgments - procedural section citations
- *test* - Generate the same order type on a Code-governed case and a Sanhita-governed case: the citations differ and each matches its governing code.
- *related* - REQ-REC-001

**REQ-REC-003** · MUST · firm · from act

The system MUST record, for every summarily tried section 138 case, the particulars prescribed for the summary trial record.

- *why* - These particulars are the summary-trial record. Where they live only as scattered fields with no single register view, the court cannot produce the record the code requires, and a case tried summarily has no formal record of its own beyond the order sheet.
- *authority* - BNSS §286 (`bnss:sec_286` - 286. Record in summary trials) [open](#law?act=bnss&eid=sec_286)
- *authority* - CrPC §263 (`crpc:sec_263` - 263. Record in summary trials) [open](#law?act=crpc&eid=sec_263)
- *binds* - output-document: summary trial register entry for the case
- *how* - Serial number of the case; date of the commission of the offence; date of the complaint; name of the complainant; name, parentage and residence of the accused; the offence complained of and the offence proved; the plea of the accused and his examination; the finding; the sentence or other final order; the date on which the proceedings terminated.
- *test* - A disposed summary case produces a register entry containing all ten particulars, each populated from the case record rather than typed afresh.
- *related* - REQ-TRL-007, REQ-REC-004

**REQ-REC-004** · MUST · firm · from act

Where a summarily tried section 138 case ends in a finding after the accused pleaded not guilty, the judgment the system produces MUST contain the substance of the evidence and a brief statement of the reasons for the finding.

- *why* - A summary trial does not dispense with reasons. A judgment template that produces a finding and a sentence with no substance of evidence and no reasons gives the Court of Session nothing to review, and the appeal is allowed on that ground alone.
- *authority* - BNSS §287 (`bnss:sec_287` - 287. Judgment in cases tried summarily) [open](#law?act=bnss&eid=sec_287)
- *authority* - CrPC §264 (`crpc:sec_264` - 264. Judgment in cases tried summarily) [open](#law?act=crpc&eid=sec_264)
- *binds* - output-document: judgment in a summarily tried case
- *how* - The magistrate records the substance of the evidence, and a judgment containing a brief statement of the reasons for the finding.
- *test* - The judgment template for a contested summary case contains a substance-of-evidence section and a reasons section, and neither can be left empty.
- *related* - REQ-REC-003

**REQ-REC-005** · MUST · firm · from caselaw

The system MUST maintain a district-level dashboard of section 138 cases showing total pendency, monthly disposal, the proportion settled or compounded, the average number of adjournments per case and a stage-wise breakup of pending matters.

- *why* - Sanjabij Tari specifies exactly these fields and directs monthly review by the District and Sessions Judge. The Court set out the reason: despite directions in Indian Bank Association, Damodar S. Prabhu and the Constitution Bench reference, pendency continued to rise, and in Delhi these cases are near half the trial court docket. Without the numbers being derivable from the record itself, compliance is reported from manual returns and cannot be checked.
- *authority* - NI Act §143 as read in Sanjabij Tari v. Kishore S. Borcar (2025 INSC 1158) (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - screen: district dashboard - section 138 pendency and progress
- *test* - The dashboard renders all five measures from case data with no manual entry, and each figure drills through to the underlying case list.
- *related* - REQ-TRL-012

#### CPY - copies and their supply (3)

**REQ-CPY-001** · MUST · firm · from act

Where a supervision order is made on releasing an offender on probation, the system MUST furnish a copy to the offender, to each surety and to the probation officer named in the order.

- *why* - The Act names all three recipients and requires the copy to be furnished forthwith, because the order imposes conditions each of them has to observe or enforce. A supervision order that exists only on the court file cannot be complied with by a surety who has never seen its conditions.
- *authority* - Probation of Offenders Act §4(5) (`probation:sec_4` - 4. Power of court to release certain offenders on probation of good conduct) [open](#law?act=probation&eid=sec_4)
- *authority* - Probation of Offenders Act §4(3) (`probation:sec_4` - 4. Power of court to release certain offenders on probation of good conduct) [open](#law?act=probation&eid=sec_4)
- *binds* - output-document: supervision order - copies to offender, sureties and probation officer
- *how* - One copy of the supervision order to each of the offender, the sureties, if any, and the probation officer concerned.
- *test* - Making a supervision order generates three addressed copies and records their delivery; the order cannot be closed with a recipient unserved.
- *related* - REQ-SEN-008

**REQ-CPY-002** · MUST · inferred · from act

The system MUST supply public documents of the court in accessible formats.

- *why* - Section 12(4)(a) directs the appropriate Government to take steps to ensure that its public documents are in accessible formats; it does not in terms bind the court's copying channel, so applying it to the copies a court supplies is a reading of the access-to-justice duty in section 12(1). The failure it prevents is concrete: a judgment or order supplied only as a scanned image is unreadable to a blind party in a section 138 case, so the copy the court supplies does not in fact tell that party what was decided.
- *authority* - RPwD Act §12(4)(a) (`rpwd:sec_12` - 12. Access to justice.) [open](#law?act=rpwd&eid=sec_12)
- *authority* - RPwD Act §12(1) (`rpwd:sec_12` - 12. Access to justice.) [open](#law?act=rpwd&eid=sec_12)
- *binds* - output-document: copies of orders and judgments - accessible format
- *test* - A copy supplied through the portal carries a text layer or a structured text alternative, and a screen reader can read the operative part.
- *related* - REQ-FIL-007

**REQ-CPY-004** · MUST · firm · from act

The system MUST supply a copy of the judgment to the convicted accused free of cost, immediately on pronouncement where the sentence includes imprisonment and on his application in every case in which the judgment is appealable by him.

- *why* - The commonest section 138 outcome is fine and compensation with no imprisonment, so the automatic copy is not engaged and the copy comes instead on application. A drawer who does not know he must ask holds no copy of the judgment his appeal has to be accompanied by, and the appeal period runs while he waits. A build that issues the copy only where imprisonment was awarded follows the letter of one sub-section and defeats the appeal right the next sub-section protects.
- *authority* - BNSS §404(1) (`bnss:sec_404` - 404. Copy of judgment to be given to accused and other persons) [open](#law?act=bnss&eid=sec_404)
- *authority* - BNSS §404(2) (`bnss:sec_404` - 404. Copy of judgment to be given to accused and other persons) [open](#law?act=bnss&eid=sec_404)
- *authority* - CrPC §363 (`crpc:sec_363` - 363. Copy of judgment to be given to the accused and other persons) [open](#law?act=crpc&eid=sec_363)
- *binds* - output-document: judgment - copy to the convicted accused
- *how* - On a sentence of imprisonment, a copy immediately after pronouncement, free of cost and without application. Otherwise, on the application of the accused, a certified copy without delay and free of cost wherever the judgment is appealable by him, with a translation in his own language if practicable or in the language of the court where he so desires.
- *test* - A conviction with imprisonment issues the copy with no application recorded; a fine-only conviction raises a prompt to the accused or his advocate to apply, and the copy issues free of cost with no fee entry.
- *related* - REQ-CPY-002, REQ-TRL-018, REQ-APL-001

### Gujarat - added by its own instruments (127)

Holds only what Gujarat's own instruments require of a system running a cheque case, or where a Gujarat instrument tightens a national obligation. Nothing here restates central law. The SARAS Courts Rules, 2026 are the deepest source, because they are written for cheque cases alone: the electronic record on the designated portal is the primary and authoritative judicial record, the original cheque is retained through trial and returned only on an endorsement, chief examination is tendered by e-filed affidavit while cross-examination stays physical, and the whole regime sits on the 2024 e-Filing SOP and the 2025 video conferencing rules. Where a requirement tightens a national one, tightens is left null and tightens_hint describes the national obligation for resolution once the national file is merged. Two caveats on sources: the Criminal Manual, 1977 AKN is OCR'd from a scan of the first edition and is rough in places, so requirements drawn from it stay with passages that read cleanly, and its process-fee and search-fee figures are the 1977 table and are flagged as such; and the SARAS press release is a record of two notifications that are not themselves in the corpus, so requirements resting on it are marked derivedFrom practice-note.

#### LIM - limitation, cause of action, computation of time (4)

**REQ-GJ-LIM-001** · MUST · firm · from rule

The system MUST stamp an e-filed complaint with the date and time at which it was electronically received in the Registry, expressed in Indian Standard Time.

- *why* - The date of e-filing, not the date the advocate assembled the papers or the date of the payment gateway receipt, is what the Gujarat SOP treats as the date of filing. A system that records only a client-side or gateway timestamp cannot show, on a limitation objection, that the complaint reached the Registry inside the period the NI Act allows, and the complaint is liable to be thrown out as time-barred on a record the filer cannot contradict.
- *authority* - Gujarat e-Filing SOP 2024, cl.14.1 (`gefr:rule_14` - 14. Computation of Time)
- *binds* - schema-field: filing record - receipt timestamp in the Registry
- *how* - The timestamp is taken when the Action is electronically received in the Registry and is expressed in IST.
- *test* - The filing record carries a Registry-receipt timestamp in IST that is distinct from any client-side or payment timestamp, and the limitation computation uses only that timestamp.
- *tightens* - REQ-LIM-007
- *related* - REQ-GJ-LIM-002, REQ-GJ-LIM-003

**REQ-GJ-LIM-002** · MUST · firm · from rule

The system MUST treat an online e-filing carried out after 1600 hours as filed on the next court working day.

- *why* - This is the sharpest limitation trap in Gujarat. The portal accepts filings twenty-four hours a day, so a bulk filer uploading a batch at 1830 hours on the last day of the NI Act period believes it is filed in time; the SOP moves that filing to the following working day, which is outside the period. A system that shows the upload date as the filing date will report a whole batch as timely and each of them will be met with a limitation objection.
- *authority* - Gujarat e-Filing SOP 2024, cl.14.2 (`gefr:rule_14` - 14. Computation of Time)
- *authority* - Gujarat e-Filing SOP 2024, cl.14.3 (`gefr:rule_14` - 14. Computation of Time)
- *binds* - validation-rule: filing record - effective date of filing for limitation
- *how* - Filing at a Designated Counter is permissible up to 1600 hours on a court working day; an online filing after 1600 hours takes the date which follows, provided that is a court working day.
- *test* - A complaint uploaded at 1601 hours reports an effective filing date of the next court working day, and the limitation display warns before submission when the cut-off has passed.
- *tightens* - REQ-LIM-007
- *related* - REQ-GJ-LIM-001

**REQ-GJ-LIM-003** · MUST · firm · from rule

The system MUST treat a filing made on a gazetted holiday or on a day the court is closed as filed on the next working day.

- *why* - A bank filing a batch over a long weekend gets an acknowledgement immediately but no filing date until the court reopens. If the system dates the complaint to the upload day, its own limitation arithmetic is a day or more optimistic than the court's, and the error is invisible until the objection is taken.
- *authority* - Gujarat e-Filing SOP 2024, cl.14.2 (`gefr:rule_14` - 14. Computation of Time)
- *binds* - validation-rule: filing record - effective date of filing on a non-working day
- *test* - A complaint uploaded on a declared holiday reports an effective filing date equal to the next court working day, drawn from the court calendar rather than a generic weekday rule.
- *related* - REQ-GJ-LIM-002

**REQ-GJ-LIM-004** · MUST NOT · firm · from rule

The system MUST NOT offer or record an extension of limitation on the ground that the e-filing portal was unavailable.

- *why* - The SOP is explicit that no exemption from limitation is permitted for a failure of the web-based e-filing facility; the filer is expected to move to a Designated Counter or to physical filing. A system that presents 'portal down' as a condonation reason teaches bulk filers to rely on a defence that does not exist and delays the fallback to counter filing until the period has run out.
- *authority* - Gujarat e-Filing SOP 2024, cl.14.3 (`gefr:rule_14` - 14. Computation of Time)
- *binds* - screen: limitation screen - reasons available for delay
- *test* - Portal unavailability is not an available reason for delay anywhere in the limitation workflow; the unavailability path instead surfaces the Designated Counter and physical-filing options.

#### FIL - filing, court fee, scrutiny, numbering (21)

**REQ-GJ-FIL-001** · MUST · firm · from act

The system MUST compute the court fee on a complaint presented to a criminal court in Gujarat as the fixed amount under Schedule II Article 1(c), independent of the cheque amount.

- *why* - Gujarat prices a criminal complaint at three rupees whatever the instrument is worth. A system carrying an ad valorem fee model from another state will demand a fee proportionate to the cheque, and a bank filing several thousand cheque cases a year will either over-collect from its own customers or have every filing stopped at scrutiny for a fee that does not match the Schedule.
- *authority* - Gujarat Court-Fees Act 2004, Sch.II Art.1(c) (`gcf:art_1` - Article 1. Application or petition (a) When Presented to any officer of Three rup)
- *authority* - Gujarat Court-Fees Act 2004, s.4 (`gcf:sec_4` - 4. Fees on documents filed, etc. in courts or in public offices)
- *binds* - validation-rule: court fee calculation - complaint to a criminal court
- *how* - Schedule II Article 1(c): three rupees on a writing containing a complaint or charge of any offence presented to any criminal court.
- *test* - The fee computed for a complaint is the fixed Schedule II Article 1(c) amount and does not vary with the cheque amount across a sample of cases from a few thousand to several crore rupees.

**REQ-GJ-FIL-002** · MUST NOT · firm · from act

The system MUST NOT allow a chargeable document to be filed, exhibited or recorded until the proper fee has been paid.

- *why* - Section 4 is the gate the registry applies before it numbers a cheque complaint. A system that registers a complaint and only later reconciles the fee produces numbered cases whose filing was void at the outset, and the defect surfaces at the worst moment, when limitation has already run.
- *authority* - Gujarat Court-Fees Act 2004, s.4 (`gcf:sec_4` - 4. Fees on documents filed, etc. in courts or in public offices)
- *binds* - validation-rule: registration workflow - court fee gate before numbering
- *test* - Registration of a complaint is blocked until a fee payment of at least the Schedule amount is recorded against it.
- *related* - REQ-GJ-FIL-003

**REQ-GJ-FIL-003** · MUST NOT · firm · from act

The system MUST NOT prevent a criminal court from filing or exhibiting a document on which the proper fee has not been paid where the presiding judge is of opinion that admission is necessary to prevent a failure of justice.

- *why* - Section 44 is the safety valve on the criminal side: where the presiding judge is of opinion that filing or exhibition is necessary to prevent a failure of justice, section 4 does not prohibit it. If the fee gate is absolute in software, a short-paid vakalatnama or list of documents can shut out the cheque, the return memo or the demand notice themselves, and the complainant loses the case on an accounting defect rather than on the merits. The section fixes who may open the gate and on what ground; it prescribes no form for doing so, which is why how is left null.
- *authority* - Gujarat Court-Fees Act 2004, s.44 (`gcf:sec_44` - 44. Admission in criminal cases of documents for which proper fee)
- *binds* - workflow-step: exhibit workflow - judicial override of the court fee gate
- *test* - A presiding-officer role can admit and exhibit a document on which the proper fee has not been paid; the fee gate yields only to that role, and the admission is visible on the case record and in the rojnama.
- *related* - REQ-GJ-FIL-002

**REQ-GJ-FIL-004** · MUST · firm · from act

The system MUST raise the fixed fee under section 19 when the complainant's first or only examination is reduced to writing and no fee has already been levied on a petition presented by that complainant.

- *why* - Section 19 attaches a further ten-rupee fee when the examination of a complainant is reduced to writing at the cognizance stage, but it does so on two conditions: the offence must be one for which a police officer may not arrest without a warrant, which a section 138 offence is, and the complainant must not already have presented a petition on which a fee has been levied under the Act. In a cheque case the complaint itself normally bears the Schedule II Article 1(c) fee, so the section 19 fee usually does not attach. A system that raises the fee unconditionally over-collects on every complaint in a bulk batch, and one that never raises it under-collects wherever the complaint carried no fee. The condition, not the amount, is what has to be held on the case.
- *authority* - Gujarat Court-Fees Act 2004, s.19 (`gcf:sec_19` - 19. Written examinations of complainants)
- *authority* - Criminal Manual 1977, r.74 (`gcrm:rule_74` - 74.)
- *binds* - workflow-step: fee ledger - fee raised when the complainant's examination is reduced to writing
- *how* - Ten rupees under section 19, unless the court thinks fit to remit the payment.
- *test* - Recording the complainant's examination raises a section 19 fee entry only where no earlier fee-bearing petition by that complainant is on the case; a complaint on which the Article 1(c) fee was levied raises none. The entry can be remitted by the court with the remission recorded.

**REQ-GJ-FIL-005** · MUST · firm · from rule

The system MUST require a vakalatnama on record for every pleader appearing for a party, subject to the exceptions the Criminal Manual states.

- *why* - Bulk cheque filings are run by panel advocates who change between hearings. Without a vakalatnama check at appearance, the record shows submissions and cross-examination conducted by an advocate with no authority on file, and the accused can attack the whole proceeding on that ground at the revision stage.
- *authority* - Criminal Manual 1977, r.135 (`gcrm:rule_135` - 135. Vatalatnamas shall be filed by all Pleaders, as defined in the Code of)
- *binds* - validation-rule: appearance record - vakalatnama required before a pleader is recorded
- *how* - Rule 135 excepts the Public Prosecutor appearing for Government, a pleader appointed by the court for an accused without means, a pleader appearing as amicus curiae, and a pleader engaged by another duly appointed pleader.
- *test* - An advocate cannot be attached to a case without a vakalatnama document on record, except under one of the four recorded exceptions.
- *related* - REQ-GJ-FIL-006

**REQ-GJ-FIL-006** · MUST · firm · from act

The system MUST levy the fixed vakalatnama fee for the level of court to which the vakalatnama is presented.

- *why* - The fee differs by court: two rupees to a criminal court other than a Sessions Court or the High Court, three rupees to a District or Sessions Court, five rupees to the High Court. A system charging one flat figure across a bulk filer's magistrate, sessions and High Court appearances will short-pay or over-pay every vakalatnama it files at the wrong level.
- *authority* - Gujarat Court-Fees Act 2004, Sch.II Art.12 (`gcf:art_12` - Article 12. Mukhtarnama or When presented for the conduct of)
- *binds* - validation-rule: court fee calculation - vakalatnama
- *how* - Schedule II Article 12: two rupees to a criminal court other than a District Court, Court of Session or the High Court; three rupees to a District or Sessions Court; five rupees to the High Court.
- *test* - The vakalatnama fee produced for a magistrate's court, a Sessions Court and the High Court differ and match the three Article 12 rates.
- *related* - REQ-GJ-FIL-005

**REQ-GJ-FIL-007** · MUST · firm · from act

The system MUST accept payment of court fees by e-payment.

- *why* - Gujarat amended the Court-Fees Act in 2015 to allow fees to be collected by e-payment, and that is the precondition for e-filing at all. A system that can only record a physical stamp forces a bank filing thousands of complaints on the portal to send a clerk to a treasury for each one, which defeats the whole SARAS design.
- *authority* - Gujarat Court-Fees Act 2004, s.37(1) (`gcf:sec_37` - 37. Collection of fees [**])
- *authority* - Gujarat Court-Fees Act 2004, s.2(bb) (`gcf:sec_2` - 2. Definitions)
- *authority* - Gujarat e-Filing SOP 2024, cl.9 (`gefr:rule_9` - 9. Payment of Court Fees/Other Charges)
- *binds* - workflow-step: fee payment - electronic mode
- *test* - A complaint can be filed end to end with the court fee paid electronically, and the payment reference is stored on the filing record.

**REQ-GJ-FIL-008** · MUST · firm · from rule

The system MUST route all complaints, interlocutory applications, affidavits and pleadings in a SARAS case through the designated e-filing portal.

- *why* - Rule 4.1 names the portal, and the SARAS rules make reference to the e-Filing SOP mandatory for avoiding objections and defects. A parallel intake path, such as email to the registry or a counter deposit of paper, produces a document that is not on the portal and therefore is not part of the primary judicial record at all.
- *authority* - SARAS Courts Rules 2026, r.4.1 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *authority* - SARAS Courts Rules 2026, r.4.2 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *authority* - Gujarat e-Filing SOP 2024, cl.3.1 (`gefr:rule_3` - 3. General Instructions)
- *binds* - workflow-step: filing intake - the designated e-filing portal
- *how* - Rule 4.1 names https://filing.ecourts.gov.in/pdedev/ as the designated portal; a person unable to access it may use a designated e-filing counter.
- *test* - No path exists to create a case document in a SARAS case other than through the portal, a designated e-filing counter, or a Bench exemption recorded under the e-filing exemption requirement; every document on the record carries a portal filing reference or an exemption reference.
- *related* - REQ-GJ-FIL-021

**REQ-GJ-FIL-009** · MUST · firm · from rule

The system MUST present a newly e-filed complaint to the Registry for scrutiny on the next working day after filing.

- *why* - Rule 4.11 fixes a next-working-day scrutiny. Where a bank uploads a batch of several hundred complaints, a queue without that deadline lets the batch sit unscrutinised while the accused remains unserved and the six-month track clock runs from institution.
- *authority* - SARAS Courts Rules 2026, r.4.11 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *binds* - workflow-step: registry queue - scrutiny due date on a new complaint
- *test* - Every newly e-filed complaint appears in the Registry scrutiny queue with a due date of the next working day, and the queue reports items past that date.
- *related* - REQ-GJ-FIL-010, REQ-GJ-FIL-012

**REQ-GJ-FIL-010** · MUST · firm · from rule

The system MUST record Registry objections to an e-filed complaint in writing against the filing and communicate them to the e-filer.

- *why* - An objection conveyed by a phone call or a counter conversation leaves no record of what was wrong or when it was raised. In a bulk filing, the filer cannot tell which of three hundred complaints was objected to, and the rectification cycle stretches until the complaint is out of time on re-presentation.
- *authority* - SARAS Courts Rules 2026, r.4.11 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *authority* - Gujarat e-Filing SOP 2024, cl.18.3 (`gefr:rule_18` - 18. Residuary provisions)
- *authority* - Gujarat e-Filing SOP 2024, cl.2.12 (`gefr:rule_2` - 2. Definitions)
- *binds* - workflow-step: objection record - written objections against an e-filed complaint
- *how* - The Registry communicates objections by email, SMS or web hosting to the concerned advocate or litigant in person.
- *test* - Each objection is stored as text against the filing with its date, and the filer receives it on at least one of email, SMS or the portal; the objection history survives after clearance.
- *related* - REQ-GJ-FIL-009, REQ-GJ-FIL-012

**REQ-GJ-FIL-011** · MUST NOT · firm · from rule

The system MUST NOT register a complaint under a case type until all Registry objections against it have been cleared.

- *why* - Rule 4.11 registers the matter only if the filing is found in order or after clearance of all objections. Registration with objections outstanding produces a numbered cheque case whose papers are defective, and the defect resurfaces when the accused takes the point at the framing or plea stage, by which time the complaint cannot be refiled within time.
- *authority* - SARAS Courts Rules 2026, r.4.11 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *binds* - validation-rule: registration workflow - objection clearance gate
- *test* - Registration is blocked while any objection against the filing is open; clearing the last objection makes registration available.
- *related* - REQ-GJ-FIL-010

**REQ-GJ-FIL-012** · MUST · firm · from rule

The system MUST restrict scrutiny of e-filed complaints and documents for technical compliance to users holding a Registry role.

- *why* - Rule 3.10 keeps technical scrutiny within the exclusive domain of the Registry. If a bench clerk or the presiding officer's own staff can clear defects, the separation between the ministerial gate and the judicial record breaks down, and a case can reach the presiding officer having never been checked by the office answerable for it.
- *authority* - SARAS Courts Rules 2026, r.3.10 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *binds* - access-control: scrutiny function - restricted to the Registry role
- *test* - A user without the Registry role cannot record, clear or waive a technical-compliance objection; the attempt is refused and logged.
- *related* - REQ-GJ-FIL-009

**REQ-GJ-FIL-013** · SHOULD · firm · from rule

The system SHOULD reject an online e-file whose size exceeds twenty megabytes and direct the filer to a Designated Counter.

- *why* - The Gujarat SOP says the size of an e-file should not exceed twenty megabytes and that a filer whose file is larger should visit a Designated Counter; it directs rather than commands, which is why this is a SHOULD. Cheque-case bundles carrying scanned statements of account and a long series of return memos routinely exceed that. A system that lets the upload begin and fails at the end wastes the filer's cut-off window, and on the last day of the NI Act period that is the difference between a filed and a time-barred complaint.
- *authority* - Gujarat e-Filing SOP 2024, cl.3.4 (`gefr:rule_3` - 3. General Instructions)
- *binds* - validation-rule: upload control - twenty megabyte ceiling on an online e-file
- *test* - An e-file over twenty megabytes is refused before upload starts, with the Designated Counter route offered in the same message.

**REQ-GJ-FIL-014** · MUST · firm · from rule

The system MUST produce every e-filed document as an OCR-searchable PDF, with OCR enablement for Gujarati text.

- *why* - The record of a Gujarat cheque case is routinely part Gujarati. A scanned image PDF without a Gujarati OCR layer cannot be searched by the presiding officer, cannot be indexed for exhibit assignment, and defeats the purpose of making the electronic record the primary judicial record.
- *authority* - Gujarat e-Filing SOP 2024, cl.6.2 (`gefr:rule_6` - 6. Formatting)
- *authority* - Gujarat e-Filing SOP 2024, cl.6.3 (`gefr:rule_6` - 6. Formatting)
- *authority* - SARAS Courts Rules 2026, r.3.7 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *binds* - validation-rule: document conversion - OCR-searchable PDF, PDF/A preferred
- *how* - PDF/A is the preferred format; a non-text document is scanned at 300 dpi in OCR-searchable mode. Local-language text uses LOHIT Gujarati Unicode font 13.
- *test* - A document uploaded without a text layer is refused; a Gujarati document uploaded through the workflow yields searchable Gujarati text.

**REQ-GJ-FIL-015** · MUST · firm · from rule

The system MUST prepare every e-filed document in A4 size except where the original paper size does not permit it.

- *why* - Both the SOP formatting clause and SARAS rule 4.8 fix A4. A bundle mixing legal and A4 pages breaks pagination in the merged PDF, which in turn breaks the exhibit and bookmark references that the rojnama and the certified copy depend on.
- *authority* - SARAS Courts Rules 2026, r.4.8 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *authority* - Gujarat e-Filing SOP 2024, cl.6.1 (`gefr:rule_6` - 6. Formatting)
- *binds* - validation-rule: document conversion - page size
- *test* - Generated and converted documents are A4; a non-A4 page is flagged at upload with the original-size exception available and recorded.

**REQ-GJ-FIL-016** · MUST · firm · from rule

The system MUST reject a filing whose document file name uses a disallowed character or exceeds forty-five characters including spaces.

- *why* - The SOP lists the characters a document binary file name may not contain and caps the name at forty-five characters. An institutional filer generating names automatically from a loan account reference will produce names with slashes, ampersands and hundreds of characters, and the whole batch is bounced at the counter for a reason nothing on the screen explained.
- *authority* - Gujarat e-Filing SOP 2024, cl.8.6 (`gefr:rule_8` - 8. Dos and Don'ts)
- *binds* - validation-rule: upload control - document file name
- *how* - Disallowed characters: quotation mark, number sign, per cent, ampersand, asterisk, colon, angle brackets, question mark, backslash, forward slash, braces, pipe, tilde, and a period used consecutively or at the start or end of the name.
- *test* - A file named with any listed character, or longer than forty-five characters, is refused at selection with the offending character named.

**REQ-GJ-FIL-017** · MUST NOT · firm · from rule

The system MUST NOT submit an e-filed document that is watermarked, encrypted, or carries markings, track changes or annotations.

- *why* - The SOP forbids all of these on an e-filing. A bank's document management system commonly stamps a confidentiality watermark and password-protects statements as a matter of policy; if that reaches the portal the filing is defective and the defect is invisible to the person uploading it.
- *authority* - Gujarat e-Filing SOP 2024, cl.8.7 (`gefr:rule_8` - 8. Dos and Don'ts)
- *binds* - validation-rule: upload control - document hygiene
- *test* - An encrypted PDF, a PDF with tracked changes, and a PDF with annotation objects are each refused at upload with the reason stated.

**REQ-GJ-FIL-018** · MUST · firm · from rule

The system MUST merge the text and scanned documents of a filing into a single OCR-searchable PDF bookmarked in accordance with the Master Index approved by the Registry.

- *why* - Bookmarking to the Master Index is what lets the Registry, and later the presiding officer, find the cheque, the return memo and the notice inside a hundred-page bundle. A filing uploaded as a heap of separate unbookmarked files is objected to at scrutiny, and in a bulk batch that objection repeats across every case in the batch.
- *authority* - Gujarat e-Filing SOP 2024, cl.8.1 (`gefr:rule_8` - 8. Dos and Don'ts)
- *authority* - Gujarat e-Filing SOP 2024, cl.8.2 (`gefr:rule_8` - 8. Dos and Don'ts)
- *binds* - output-document: filing bundle - merged bookmarked PDF
- *test* - The submitted bundle is one PDF whose bookmark tree matches the Master Index, and each bookmark resolves to the correct first page.

**REQ-GJ-FIL-019** · MUST · firm · from rule

The system MUST upload a document that originates in electronic form directly, without scanning it.

- *why* - Rule 4.5 confines scanning to documents that inherently originate in physical form. A bank that prints an electronically generated statement of account in order to scan it destroys the text layer, produces a larger file that risks the twenty megabyte ceiling, and reduces a natively authentic document to an image whose authenticity can be questioned.
- *authority* - SARAS Courts Rules 2026, r.4.5 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *authority* - SARAS Courts Rules 2026, r.4.6 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *binds* - workflow-step: document intake - native electronic documents
- *test* - The filing workflow distinguishes natively electronic documents from physical originals and offers no scan step for the former.

**REQ-GJ-FIL-020** · MUST · firm · from rule

The system MUST notify the filing or registration number to the e-filer once the e-filing is accepted.

- *why* - Without a number returned to the filer, an institutional filer cannot reconcile a batch of uploads against its own case management records, and a complaint that silently failed to register is indistinguishable from one that succeeded until the limitation period has passed.
- *authority* - Gujarat e-Filing SOP 2024, cl.8.3 (`gefr:rule_8` - 8. Dos and Don'ts)
- *binds* - workflow-step: filing acknowledgement - number returned to the filer
- *test* - Acceptance of an e-filing returns a filing or registration number to the filer's account and by the notification channel on record.

**REQ-GJ-FIL-021** · MAY · firm · from rule

The system MAY record an exemption from e-filing granted by the Bench on an application stating one of the permitted grounds.

- *why* - The SOP permits exemption where e-filing is not feasible, where confidentiality or privacy is in issue, where the document cannot be scanned because of its size, shape or condition, where the portal is unavailable, or for just and sufficient cause. A cheque case can involve an instrument in a condition that will not scan; with no way to record the exemption the document simply never enters the record.
- *authority* - Gujarat e-Filing SOP 2024, cl.12 (`gefr:rule_12` - 12. Exemption from e-filing)
- *binds* - workflow-step: exemption record - Bench order exempting a document from e-filing
- *test* - An exemption can be applied for, granted by a judicial role against one of the five listed grounds, and is visible on the case record against the document it covers.
- *related* - REQ-GJ-FIL-008

#### SRV - service of summons and process (11)

**REQ-GJ-SRV-003** · MUST · inferred · from rule

The system MUST record service as deemed effected where a summons sent by digitally signed electronic communication is acknowledged within five working days.

- *why* - Service is the single biggest cause of delay in a Gujarat cheque case. Rule 5(iv) makes digitally signed electronic communication a preferential mode with deemed service on acknowledgement; the deeming reaches a criminal trial through rule 21(B), which applies the same norms to criminal trials with the changes the Code requires. A system that treats an acknowledged e-summons as merely informal keeps the case in the bailiff queue for months after service was in law complete.
- *authority* - Case Flow Management Rules 2016, r.5(iv) (`gcfm:rule_5` - 5. Summons)
- *authority* - Case Flow Management Rules 2016, r.21(B) (`gcfm:rule_21` - 21. Criminal Trials and Criminal Appeals to Subordinate Courts)
- *binds* - schema-field: service record - deemed service by acknowledged e-communication
- *how* - Service is deemed made on acknowledgement of receipt by the other side, the acknowledgement being within five working days.
- *test* - An acknowledged digitally signed e-summons sets the service status to served with the acknowledgement date stored; the five-working-day window is computed on court working days.
- *tightens* - REQ-SRV-006
- *related* - REQ-GJ-SRV-007

**REQ-GJ-SRV-004** · MUST · inferred · from rule

The system MUST require an affidavit of service on the record where service of summons is effected by the complainant or by a certified or registered courier.

- *why* - Institutional cheque filers serve through their own courier arrangements as a matter of course. Rule 5(v) makes the affidavit of service the proof, and without it on the record the court cannot proceed against an absent accused; the complainant loses the hearing and the case is adjourned for the affidavit that should have accompanied the return.
- *authority* - Case Flow Management Rules 2016, r.5(v) (`gcfm:rule_5` - 5. Summons)
- *authority* - Case Flow Management Rules 2016, r.21(B) (`gcfm:rule_21` - 21. Criminal Trials and Criminal Appeals to Subordinate Courts)
- *binds* - validation-rule: service record - affidavit of service for complainant or courier service
- *test* - A service return entered as complainant service or courier service cannot be accepted without an affidavit-of-service document attached.
- *tightens* - REQ-SRV-014
- *related* - REQ-GJ-SRV-005

**REQ-GJ-SRV-005** · MUST · inferred · from rule

The system MUST require a signed declaration verifying a return of refusal made by the complainant or by a courier agency.

- *why* - Rule 5(vi) requires the return endorsed 'refused' to be accompanied by a declaration signed by the complainant or a responsible person of the courier agency that the endorsement is correct, on pain of perjury. A refusal accepted without it cannot support an ex parte order, and the accused reopens the proceeding years later on the ground that he was never served.
- *authority* - Case Flow Management Rules 2016, r.5(vi) (`gcfm:rule_5` - 5. Summons)
- *authority* - Case Flow Management Rules 2016, r.21(B) (`gcfm:rule_21` - 21. Criminal Trials and Criminal Appeals to Subordinate Courts)
- *binds* - validation-rule: service record - declaration supporting a refusal endorsement
- *how* - The declaration states that the endorsement made is correct and acknowledges that a false endorsement is punishable for perjury or as an abuse of the Code.
- *test* - A return with outcome 'refused' cannot be saved without an attached signed declaration naming the declarant and his capacity.
- *related* - REQ-GJ-SRV-004, REQ-GJ-SRV-006

**REQ-GJ-SRV-006** · SHOULD · inferred · from rule

The system SHOULD prevent a black-listed courier agency from being selected to effect service.

- *why* - Rule 5(vi) allows a courier agency to be black-listed for a false endorsement of refusal. The rule states the consequence but not the machinery; the system consequence is inferred. If the black-list exists only on a circular, a bulk filer with a national courier contract will keep serving through a black-listed agency, and every one of those returns is open to attack.
- *authority* - Case Flow Management Rules 2016, r.5(vi) (`gcfm:rule_5` - 5. Summons)
- *binds* - validation-rule: service record - courier agency selection
- *test* - A courier agency marked black-listed is not selectable on a new service instruction, and existing instructions to it are reported.
- *related* - REQ-GJ-SRV-005

**REQ-GJ-SRV-007** · MUST · inferred · from rule

The system MUST order issue of summons through the bailiff and substituted service simultaneously when a summons sent by post or courier is reported unserved.

- *why* - Rule 5(vii) is emphatic that the two go out together. The common practice of trying bailiff service first and only then applying for substituted service adds a full cycle of six to eight weeks to a cheque case that is meant to conclude in six months, and it is exactly the pattern a workflow that offers the two steps in sequence will produce.
- *authority* - Case Flow Management Rules 2016, r.5(vii) (`gcfm:rule_5` - 5. Summons)
- *authority* - Case Flow Management Rules 2016, r.21(B) (`gcfm:rule_21` - 21. Criminal Trials and Criminal Appeals to Subordinate Courts)
- *binds* - workflow-step: service escalation - simultaneous bailiff and substituted service
- *test* - Recording a postal or courier return of non-service raises a single escalation action that creates both a bailiff process and a substituted service process; neither can be created alone from that trigger.
- *related* - REQ-GJ-SRV-003

**REQ-GJ-SRV-008** · MUST · inferred · from rule

The system MUST list a case for dismissal for non-prosecution where the process fee for service is not paid within three days of the order.

- *why* - Rule 5(iii) attaches a three-day clock to the process fee, and rule 21(B) carries it to the criminal side. A bank filing in bulk pays process fees on a monthly reconciliation cycle; without this clock exposed on the case, the first the filer learns of the default is when its complaint appears on the dismissal list.
- *authority* - Case Flow Management Rules 2016, r.5(iii) (`gcfm:rule_5` - 5. Summons)
- *authority* - Case Flow Management Rules 2016, r.21(B) (`gcfm:rule_21` - 21. Criminal Trials and Criminal Appeals to Subordinate Courts)
- *binds* - workflow-step: process fee - three day clock and dismissal listing
- *test* - An order for process starts a three-day fee clock on the case; on expiry without payment the case appears on the non-prosecution cause list and the filer is notified.
- *related* - REQ-GJ-SRV-009

**REQ-GJ-SRV-009** · MUST · inferred · from act

The system MUST price each process issued in a cheque case according to the current table of process fees published for the court.

- *why* - The process fee is charged per process, and differently for a summons, a warrant of arrest, a proclamation and a warrant of attachment; section 33 requires the table of the fees chargeable for service and execution to be exposed to view in a conspicuous part of every court, which makes the published table and not a figure in code the source of the rate. A system carrying a single hard-coded process fee will under-recover on the warrant stage of every contested cheque case. Two cautions on the rate: the figures in Criminal Manual rule 41 are the 1977 table, made under section 32 of the repealed Bombay Court Fees Act, 1959; and the corresponding rule-making power in section 32 of the Gujarat Court-Fees Act, 2004 was itself deleted by Gujarat 14 of 2016, so the current rates must be taken from the table published for the court and not reconstructed from rule 41.
- *authority* - Gujarat Court-Fees Act 2004, s.33 (`gcf:sec_33` - 33. Tables of process fees)
- *authority* - Criminal Manual 1977, r.41 (`gcrm:rule_41` - 41.)
- *binds* - schema-field: fee ledger - process fee per process type
- *how* - Rule 41 charges a distinct fee for every summons or notice, every warrant of arrest, every proclamation and every warrant of attachment; no fee is levied on a process issued on the complaint of a police officer acting as such, nor on the re-issue of a process; and the court may remit the process fees in whole or in part where the complainant or the accused has not the means to pay them.
- *test* - Issuing a summons, a warrant of arrest, a proclamation and a warrant of attachment each raise a distinct fee entry at the rate held for that process type, and the rate table is editable without a code change.
- *related* - REQ-GJ-SRV-008

**REQ-GJ-SRV-010** · MUST · firm · from rule

The system MUST state on a process issued to a witness who is to be examined by video conferencing the date, time and venue of the designated place, and direct the witness to attend in person with proof of identity.

- *why* - In a cheque case the witness summoned this way is usually the bank officer who proves the dishonour. A summons that gives only a hearing date and no designated place leaves the officer with nowhere to go; he attends his own branch, the deposition does not happen, and the return memo goes unproved for another hearing.
- *authority* - Gujarat VC Rules 2025, r.12 (`gvcr:rule_12` - 12. Service of processes)
- *authority* - Gujarat VC Rules 2025, r.6 (`gvcr:rule_6` - 6. Identification of person appearing through video conferencing or other modes of audio-visual electronic)
- *binds* - output-document: witness summons for video conferencing - designated place and identity direction
- *how* - The process states the date, time and venue of the concerned designated place and directs the witness to attend in person along with proof of identity.
- *test* - A witness summons generated for a video-conferencing examination carries a designated place with its address, the time, and the identity direction; it cannot be generated without a designated place selected.
- *related* - REQ-GJ-SRV-011

**REQ-GJ-SRV-011** · MUST · firm · from rule

The system MUST accompany a process issued to a witness with a copy of any document with reference to which the witness is to be examined.

- *why* - Rule 12 requires the document to travel with the process. A bank officer summoned to prove a return memo he has not seen since it was generated cannot depose to it from memory; the examination collapses and has to be listed again, and the cheque case loses a hearing over a missing enclosure.
- *authority* - Gujarat VC Rules 2025, r.12 (`gvcr:rule_12` - 12. Service of processes)
- *binds* - output-document: witness summons - enclosed copy of the document of examination
- *test* - Where a witness is linked to one or more documents on the case, the generated process packet includes copies of exactly those documents.
- *related* - REQ-GJ-SRV-010

**REQ-GJ-SRV-012** · MUST NOT · firm · from rule

The system MUST NOT treat service by a Registry official's designated e-mail address as a substitute for the prescribed mode of service.

- *why* - Clause 13 makes electronic service by Registry e-mail an addition to the prescribed mode, not a replacement, and publishes the Registry e-mail IDs on the court website only so that a recipient can verify the source. A system that closes the service task when the Registry e-mail is sent will show an accused as served who has not been served in law, and the ex parte order that follows will not survive a challenge. The clause prescribes no method for keeping the two apart, so how is null.
- *authority* - Gujarat e-Filing SOP 2024, cl.13 (`gefr:rule_13` - 13. Service of Electronic Documents)
- *binds* - validation-rule: service record - status of electronic service by the Registry
- *test* - Dispatch by Registry e-mail is recorded as an additional service event and does not by itself move the accused's service status to served.

**REQ-GJ-SRV-013** · MUST · inferred · from act

The system MUST identify on the face of a process served through the police the court that issued it and the authentication under which it was issued.

- *why* - The police officer's duty under section 64(a) is to serve promptly every summons and execute every warrant lawfully issued to him by a competent authority. A digitally issued process that does not show its issuing court and authentication gives the constable no basis to act on it, and in a SARAS case, where the presiding officer sits in another district, that objection is easy to raise and hard to answer. The Act imposes the duty on the officer and the requirement on the document is inferred from what the duty attaches to.
- *authority* - Gujarat Police Act 1951, s.64(a) (`gpa:sec_64` - 64. Duties of a Police officer)
- *authority* - SARAS Courts Rules 2026, r.4.18 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *binds* - output-document: process for police service - issuing court and authentication
- *test* - A printed or transmitted process shows the issuing court, the presiding officer's digital signature and a verifiable reference back to the portal record.
- *tightens* - REQ-SRV-003

#### EVI - evidence, affidavits, documents (16)

**REQ-GJ-EVI-001** · MUST · firm · from rule

The system MUST accept the examination-in-chief of a complainant's witness as an affidavit tendered through electronic filing.

- *why* - Rule 6.1 makes the affidavit through the portal the ordinary mode in a SARAS cheque case. A workflow that can only record oral chief examination in the courtroom forces every bank officer to travel to a physical court, which is precisely the cost the remote-adjudication design exists to remove, and the six-month track limit will not survive it.
- *authority* - SARAS Courts Rules 2026, r.6.1 (`saras:rule_6` - 6. RECORDING OF EVIDENCE AND FURTHER STATEMENT OF ACCUSED)
- *binds* - workflow-step: evidence recording - chief examination tendered by e-filed affidavit
- *test* - A chief-examination affidavit can be e-filed against a named witness, exhibited, and closed as the chief examination without any physical hearing event.
- *tightens* - REQ-EVI-001
- *related* - REQ-GJ-EVI-002, REQ-GJ-EVI-013

**REQ-GJ-EVI-002** · MUST · firm · from rule

The system MUST schedule cross-examination, the examination-in-chief of the accused and the evidence of a defence witness for physical presence before the court, at a notified Formal Witness Deposition Centre, or at a notified Remote Point.

- *why* - Rule 6.2 keeps these physical by default. A system that defaults every evidence event to a video link will list cross-examination remotely without the judicial permission rule 6.3 requires, and the resulting deposition is open to attack on the ground that it was recorded in a mode the rules do not allow as the ordinary course.
- *authority* - SARAS Courts Rules 2026, r.6.2 (`saras:rule_6` - 6. RECORDING OF EVIDENCE AND FURTHER STATEMENT OF ACCUSED)
- *binds* - workflow-step: evidence scheduling - venue for cross-examination and defence evidence
- *how* - The venue is the court, a Formal Witness Deposition Centre notified by the High Court and published on its website, or a Remote Point Location notified by the Government.
- *test* - Scheduling a cross-examination requires a venue chosen from the court, a notified FWDC or a notified Remote Point; a video-conferencing venue requires the permission recorded under the audio-video requirement.
- *tightens* - REQ-EVI-002
- *related* - REQ-GJ-EVI-001, REQ-GJ-EVI-003

**REQ-GJ-EVI-003** · MUST · firm · from rule

The system MUST store on the case record the court's permission before evidence is recorded by audio-video electronic means.

- *why* - Rule 6.3 makes audio-video recording of evidence a matter of judicial discretion exercised under the 2025 rules. If the permission is not on the record, the deposition looks on its face like an ordinary remote hearing, and on appeal there is nothing to show the discretion was exercised at all.
- *authority* - SARAS Courts Rules 2026, r.6.3 (`saras:rule_6` - 6. RECORDING OF EVIDENCE AND FURTHER STATEMENT OF ACCUSED)
- *binds* - schema-field: evidence record - judicial permission for audio-video recording
- *test* - An evidence event with an audio-video venue carries a reference to the order permitting it; without that reference the event cannot be marked complete.
- *related* - REQ-GJ-EVI-002

**REQ-GJ-EVI-004** · MUST · firm · from rule

The system MUST retain the original cheque, return memo and demand notice in physical custody for the duration of the trial notwithstanding that they have been scanned and e-filed.

- *why* - The Gujarat e-Filing SOP lists the documents to be preserved permanently and expressly excludes a cheque from the negotiable instruments in that list. SARAS rule 3.11 closes the gap: the originals are retained during trial for evidentiary purposes. A system that treats the scan as the whole record and releases the physical bundle at registration leaves the complainant unable to produce the instrument when the accused disputes the signature, which is the one issue on which a cheque case is actually fought.
- *authority* - SARAS Courts Rules 2026, r.3.11 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *authority* - Gujarat e-Filing SOP 2024, cl.10.3 (`gefr:rule_10` - 10. Retention of Originals)
- *binds* - schema-field: document record - physical custody status of the original instrument
- *how* - After trial the originals are preserved and dealt with in accordance with final judicial directions, or until the dispute attains finality in appeal or revision.
- *test* - Each of the cheque, return memo and demand notice carries a physical-custody status; the case cannot be marked ready for evidence while any of them is recorded as neither in court custody nor returned on endorsement.
- *tightens* - REQ-EVI-017
- *related* - REQ-GJ-EVI-005, REQ-GJ-EVI-006

**REQ-GJ-EVI-005** · MUST · firm · from rule

The system MUST record an endorsement naming the case number, the exhibit number and the date when an original document is returned to the complainant.

- *why* - Rule 3.9 permits the cheque, return memo, notice, bills and invoices to go back to the complainant on request, on condition of producing them whenever ordered and on that endorsement. Without the endorsement stored against the exhibit, the record shows an exhibit with no document behind it and no trace of who holds it, and the court cannot recall the instrument when the accused finally disputes it.
- *authority* - SARAS Courts Rules 2026, r.3.9 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *binds* - output-document: return of original - endorsement on the returned document
- *how* - The endorsement reads that the document is produced in Case No. ____ at Exhibit No. ____ dated ____, and the return is conditional on the complainant producing the document whenever ordered to do so.
- *test* - Returning an original requires the case number, exhibit number and date; the generated endorsement carries all three and the exhibit shows the document as returned with the holder recorded.
- *related* - REQ-GJ-EVI-004

**REQ-GJ-EVI-006** · MUST · firm · from rule

The system MUST record the sealed cover marking, carrying the case particulars, for every document produced or signed physically in a SARAS case.

- *why* - Rules 3.8 and 3.12 require physically signed originals and physically produced documents to be kept in sealed and appropriately marked covers, marked with the particulars of the case they belong to. In a remote-adjudication court where the presiding officer is in another district, an unmarked cover cannot be matched back to a case at all, and the bundle is found only by opening every envelope in the room.
- *authority* - SARAS Courts Rules 2026, r.3.8 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *authority* - SARAS Courts Rules 2026, r.3.12 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *binds* - schema-field: document record - sealed cover marking
- *how* - The Bench Clerk or other designated ministerial staff places the physically produced documents of each case file in a sealed envelope duly marked with the case particulars.
- *test* - Every physically held document carries a cover marking bearing the case particulars, and a query by case number returns the marking of the cover holding that case's documents.
- *related* - REQ-GJ-EVI-004, REQ-GJ-EVI-016

**REQ-GJ-EVI-007** · MUST · firm · from rule

The system MUST preserve the signed vakalatnama, a notarised or attested affidavit, and any document whose authenticity is likely to be questioned, for at least two years after final disposal including disposal by the superior appellate court.

- *why* - Clause 10.2 of the e-Filing SOP fixes the retention floor, and SARAS rule 13.2 sends retention of originals back to it. A cheque whose signature is disputed is exactly a document whose authenticity is likely to be questioned. A retention clock that starts at trial-court judgment will destroy the original while the appeal is still alive.
- *authority* - Gujarat e-Filing SOP 2024, cl.10.2 (`gefr:rule_10` - 10. Retention of Originals)
- *authority* - SARAS Courts Rules 2026, r.13.2 (`saras:rule_13` - 13. CUSTODY AND RETENTION OF PHYSICAL DOCUMENTS)
- *binds* - schema-field: retention record - two year floor running from final disposal
- *test* - The retention clock for these classes of document starts at final disposal including appellate disposal, not at trial judgment, and no destruction action is available before the floor expires.
- *related* - REQ-GJ-REC-016

**REQ-GJ-EVI-008** · MUST · firm · from rule

The system MUST attribute the responsibility for producing the original and proving its genuineness to the party that electronically filed the scanned copy.

- *why* - Clause 10.4 places that duty on the e-filer. Where a bank's panel advocate uploads the scan and the bank holds the original in a branch strong room, nobody on the record is named as answerable for it. When the court calls for the instrument, the advocate points at the bank and the bank at the advocate, and the case is adjourned while the cheque is traced.
- *authority* - Gujarat e-Filing SOP 2024, cl.10.4 (`gefr:rule_10` - 10. Retention of Originals)
- *binds* - schema-field: document record - party answerable for the original
- *test* - Each scanned document records the filing party, and a call for the original is addressed to that party by name.
- *related* - REQ-GJ-EVI-009

**REQ-GJ-EVI-009** · MUST · inferred · from rule

The system MUST record an undertaking by the person uploading a scanned document that the physical original will be preserved in its original condition until produced before the court or dealt with under judicial directions.

- *why* - The proviso to rule 4.10 makes the scanned document the record of the court notwithstanding that the original stays with the person producing it, and puts on every person uploading a scanned PDF the duty to ensure that the corresponding physical original is preserved in its original condition until produced on demand or dealt with under judicial directions. The proviso states the duty; that the duty be captured as a recorded undertaking at the moment of upload is the reading and not the text, which is why this is inferred. In a bulk filing the originals are warehoused by the filer; without the undertaking captured at upload there is no recorded obligation on any named person to keep them intact, and a cheque returned to a recovery agent for parallel civil action is gone from the criminal case.
- *authority* - SARAS Courts Rules 2026, r.4.10 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *binds* - schema-field: filing record - undertaking to preserve the physical original
- *test* - Uploading a scanned document requires the undertaking to be affirmed, and the affirmation with its actor and timestamp is stored on the document record.
- *related* - REQ-GJ-EVI-008

**REQ-GJ-EVI-010** · MUST · firm · from rule

The system MUST support each of the prescribed modes of showing a document to a person being examined at a remote point.

- *why* - A cheque case is fought over three documents. If the only way to put the cheque to a remote witness is to read it out, the examination is worthless. Rule 14 sets out exactly how the document travels in each direction, and a video platform without a document channel cannot comply.
- *authority* - Gujarat VC Rules 2025, r.14 (`gvcr:rule_14` - 14. Exhibiting or showing documents to witness or accused at a remote point)
- *binds* - workflow-step: remote examination - showing a document to the person examined
- *how* - Where the document is at the Court Point, by document visualizer, or if none is available by transmitting a copy or image through the designated video conferencing software or official e-mail; where the document is at the remote point, by transmitting a copy or image to the Court Point.
- *test* - All three modes are available during a remote examination, and the document transmitted is logged against the examination event.
- *related* - REQ-GJ-EVI-011

**REQ-GJ-EVI-011** · MUST · firm · from rule

The system MUST record the dispatch to the Court Point of the hard copy of a document held at the remote point, countersigned by the witness and by the coordinator at the designated place.

- *why* - Rule 14(c) requires the paper copy to follow the transmitted image. If only the image reaches the record, the document the witness actually looked at and signed is nowhere in the file, and its identity can be disputed on appeal.
- *authority* - Gujarat VC Rules 2025, r.14 (`gvcr:rule_14` - 14. Exhibiting or showing documents to witness or accused at a remote point)
- *binds* - workflow-step: remote examination - dispatch of the countersigned hard copy
- *test* - An examination on a document held at the remote point cannot be closed without a dispatch entry for the countersigned hard copy.
- *related* - REQ-GJ-EVI-010

**REQ-GJ-EVI-012** · MUST · firm · from rule

The system MUST place on the judicial record the transcript of a remotely recorded examination, read over and explained to the person examined and bearing that person's signature.

- *why* - Rule 13(3) makes the signed transcript part of the record, and prescribes both a digital and a print-and-scan route depending on what is available at the remote point. A system that stores only the video recording or an unsigned machine transcript produces evidence the accused can refuse to be bound by, and the bank officer has to be recalled.
- *authority* - Gujarat VC Rules 2025, r.13(3) (`gvcr:rule_13` - 13. Examination of persons and witnesses through video conferencing and other modes of audio-visual)
- *binds* - output-document: deposition transcript from a remote examination
- *how* - Where digital signatures exist at both points, the transcript digitally signed by the presiding officer goes to the remote coordinator, is printed and signed by the person examined, and the scanned copy digitally signed by the coordinator returns to the Court Point. Where they do not, the printout signed by the presiding judge is sent in non-editable scanned form, signed by the person examined and countersigned by the coordinator, and returned to the Court Point where a printout is taken onto the record.
- *test* - A remote examination cannot be closed without a signed transcript on the record; both prescribed routes are available and the route used is recorded.

**REQ-GJ-EVI-013** · MUST · firm · from rule

The system MUST head an affidavit used in a Gujarat criminal court in the form the Criminal Manual prescribes.

- *why* - The chief examination in a SARAS cheque case is tendered as an affidavit, and a bulk filer generates those from a template. A template with the wrong heading produces the same defect on every affidavit in a batch, and each is objected to at scrutiny.
- *authority* - Criminal Manual 1977, r.236 (`gcrm:rule_236` - 236.)
- *binds* - output-document: affidavit template - heading and title
- *how* - The heading is 'In the Court ........ at ........' naming the court. Where a case is pending it also begins with 'In the matter of case of ........'; where no case is pending, 'In the matter of the application of ........'.
- *test* - An affidavit generated by the system carries the court heading and the matter heading, populated from the case record.
- *related* - REQ-GJ-EVI-001, REQ-GJ-EVI-014

**REQ-GJ-EVI-014** · MUST · firm · from rule

The system MUST draw an affidavit in the first person and in consecutively numbered paragraphs, each confined as far as may be to a distinct subject.

- *why* - Rule 237 governs the form. A chief-examination affidavit generated as continuous prose cannot be cross-examined paragraph by paragraph, and the court cannot record which averment was put to the witness; the deposition becomes hard to use in the judgment.
- *authority* - Criminal Manual 1977, r.237 (`gcrm:rule_237` - 237. Every affidavit shall be drawn up clearly and legibly and, as far as)
- *binds* - output-document: affidavit template - paragraphing and person
- *test* - A generated affidavit is in the first person with consecutively numbered paragraphs, and the numbering is stable when the affidavit is exhibited.
- *related* - REQ-GJ-EVI-013

**REQ-GJ-EVI-015** · MUST · inferred · from rule

The system MUST require the chief-examination affidavit of a witness to be on record before that witness is listed for evidence.

- *why* - Rule 9(5) requires the parties to keep the affidavit in chief examination ready whenever the witness's examination is taken up, and rule 9(4) requires evidence to run day to day with all witnesses in attendance; rule 21(B) carries both to a criminal trial. Listing a bank witness without his affidavit on file guarantees an adjournment, and in a case with a six-month outer limit a handful of such adjournments consumes the whole allowance.
- *authority* - Case Flow Management Rules 2016, r.9(4) (`gcfm:rule_9` - 9. Procedure on the failure of Alternative Dispute Resolution (Furtherance of Cases))
- *authority* - Case Flow Management Rules 2016, r.9(5) (`gcfm:rule_9` - 9. Procedure on the failure of Alternative Dispute Resolution (Furtherance of Cases))
- *authority* - Case Flow Management Rules 2016, r.21(B) (`gcfm:rule_21` - 21. Criminal Trials and Criminal Appeals to Subordinate Courts)
- *binds* - validation-rule: cause list - witness listing precondition
- *test* - A witness without a chief-examination affidavit on record cannot be added to an evidence listing, and the block names the missing affidavit.
- *related* - REQ-GJ-TRL-018

**REQ-GJ-EVI-016** · MUST · firm · from rule

The system MUST record the named custodian holding the physical documents of a SARAS case.

- *why* - Rule 13.1 places physical documents in the custody of the Superintendent or Board Clerk or as the Presiding Officer of the Court decides, and rule 3.12 requires them to be maintained so as to ensure ready and prompt access whenever the Court requires them. In a court where the presiding officer is in another district, a bundle whose custodian is not on the record cannot be produced when he asks for it, and the hearing is lost.
- *authority* - SARAS Courts Rules 2026, r.13.1 (`saras:rule_13` - 13. CUSTODY AND RETENTION OF PHYSICAL DOCUMENTS)
- *authority* - SARAS Courts Rules 2026, r.3.12 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *binds* - schema-field: document record - named custodian of the physical documents
- *how* - Custody lies with the Superintendent or the Board Clerk, or as the Presiding Officer of the Court decides.
- *test* - Every physically held document names a custodian drawn from the roles the rule permits; a query by case number returns the custodian, and a custody handover changes the name on the record.
- *related* - REQ-GJ-EVI-006, REQ-GJ-EVI-004

#### JUR - jurisdiction, cognizance, the competent court (5)

**REQ-GJ-JUR-001** · MUST · firm · from practice-note

The system MUST institute a cheque case e-filed by a bank or an NBFC in the SARAS N.I. Court establishment under the case type 'eCriminal Case'.

- *why* - The SARAS establishment is a sub-establishment of the C.J.M. courts of Ahmedabad City and its docket is identified by that exact case-type string. A system that files the same complaint as an ordinary 'Criminal Case' puts it on the conventional C.J.M. board, where it is neither allocated to a nominated remote-adjudication presiding officer nor picked up by the SARAS cause list, and the filer discovers the misrouting only when the matter fails to appear.
- *authority* - SARAS press release, para 3 (`sarpr:para_3` - 3. The SARAS N.I. Court establishment and the 'eCriminal Case' case type)
- *authority* - SARAS Courts Rules 2026, r.1(c) (`saras:rule_1` - 1. Short title, Application and Commencement)
- *binds* - schema-field: case record - case type of a SARAS N.I. cheque case
- *how* - The case type is recorded as the literal string 'eCriminal Case'.
- *test* - Case instituted through the SARAS route carries case type 'eCriminal Case'; a case with any other case type is not allocated to a SARAS presiding officer.
- *related* - REQ-GJ-JUR-003

**REQ-GJ-JUR-002** · MUST · inferred · from practice-note

The system MUST record the court that has jurisdiction over a SARAS cheque case separately from the place at which the presiding officer is posted.

- *why* - SARAS cases belong to the jurisdiction of the C.J.M. courts of Ahmedabad City, but the nominated presiding officers sit at Ahmedabad, Anand, Narmada and Gir Somnath and their place of work does not change. A system that derives the court from the officer's station will address summonses, cause lists and certified copies to the wrong district and will report the case under the wrong establishment in the statistics.
- *authority* - SARAS press release, para 4 (`sarpr:para_4` - 4. The State notification of 5 December 2024 and the nomination of presiding officers)
- *authority* - SARAS press release, para 5 (`sarpr:para_5` - 5. Magistrates posted anywhere in the State hear Ahmedabad City cheque cases)
- *authority* - SARAS Courts Rules 2026, r.9.1 (`saras:rule_9` - 9. REMOTE ADJUDICATION SAFEGUARDS)
- *binds* - schema-field: case record - court of jurisdiction and station of the presiding officer as two fields
- *test* - Two distinct fields exist; a case whose presiding officer is posted at Narmada still reports its court of jurisdiction as the C.J.M. courts of Ahmedabad City.
- *related* - REQ-GJ-JUR-004

**REQ-GJ-JUR-003** · MUST · inferred · from practice-note

The system MUST record whether the complainant in a cheque case is a bank or a Non-Banking Financial Company.

- *why* - The SARAS establishment was created exclusively for cheque cases instituted by banks and NBFCs; the class of case is defined by who files it as much as by what it is. Without that attribute on the complaint the registry cannot decide at scrutiny whether the case belongs to the SARAS docket or to the ordinary magisterial docket, and an individual payee's complaint can be routed into an establishment that is not open to it.
- *authority* - SARAS press release, para 2 (`sarpr:para_2` - 2. The Full Court resolution of 2 December 2024)
- *authority* - SARAS press release, para 3 (`sarpr:para_3` - 3. The SARAS N.I. Court establishment and the 'eCriminal Case' case type)
- *binds* - schema-field: complainant record - institutional class (bank / NBFC / other)
- *test* - The complainant record carries an institutional-class attribute; SARAS routing is driven by that attribute and rejects a complaint whose complainant is not a bank or an NBFC.
- *related* - REQ-GJ-JUR-001

**REQ-GJ-JUR-004** · MUST NOT · firm · from rule

The system MUST NOT treat the physical presence of the presiding officer at the court point as a condition of a valid hearing in a SARAS court.

- *why* - Rule 9.1 declares adjudication through audio-video electronic means a valid mode notwithstanding that the presiding judicial officer is stationed at a remote location. A workflow that blocks the recording of an order, or marks a hearing irregular, because the officer's location does not match the court's location will stall every SARAS hearing, since by design the officer never sits at Ahmedabad.
- *authority* - SARAS Courts Rules 2026, r.9.1 (`saras:rule_9` - 9. REMOTE ADJUDICATION SAFEGUARDS)
- *authority* - Gujarat VC Rules 2025, r.5 (`gvcr:rule_5` - 5. General Principles Governing Video Conferencing and other modes of Audio-video electronic)
- *binds* - validation-rule: hearing record - validity of a hearing conducted by audio-video means
- *test* - A hearing recorded with the presiding officer at a station other than the court's location is accepted and produces a signed order without a warning or override.
- *related* - REQ-GJ-JUR-002

**REQ-GJ-JUR-005** · MUST · firm · from rule

The system MUST allow the governing statute of a SARAS case to be recorded as either the Negotiable Instruments Act, 1881 or the Payment and Settlement Systems Act, 2007.

- *why* - The SARAS rules apply both to NI Act cheque cases and to e-filed cases under section 25 of the Payment and Settlement Systems Act, and the definition of 'Act' in rule 2 covers both. A system that hard-codes the NI Act as the only statute for the SARAS docket cannot institute a section 25 case at all, and forces it into the conventional docket where these rules do not apply.
- *authority* - SARAS Courts Rules 2026, r.1(c) (`saras:rule_1` - 1. Short title, Application and Commencement)
- *authority* - SARAS Courts Rules 2026, r.2(1)(a) (`saras:rule_2` - 2. Definitions)
- *binds* - schema-field: case record - governing statute of a SARAS case
- *test* - Both the NI Act, 1881 and the Payment and Settlement Systems Act, 2007 are selectable as the governing statute on a SARAS case, and both route to the same establishment.

#### TRL - trial conduct, plea, attendance (21)

**REQ-GJ-TRL-001** · MUST · firm · from rule

The system MUST require the accused to be present physically at the SARAS Court or at a Remote Point Location when the plea is recorded.

- *why* - Rule 5.1 does not permit the plea to be taken from wherever the accused happens to be. A workflow that opens a video link to the accused's own phone and records a plea from it produces a plea the accused can disown, and in a cheque case the plea is the hinge on which a summary trial either concludes quickly or turns into a full contest.
- *authority* - SARAS Courts Rules 2026, r.5.1 (`saras:rule_5` - 5. RECORDING PLEA AND SUPPLY OF COPIES)
- *binds* - workflow-step: plea recording - place of the accused
- *test* - Recording a plea requires the accused's location to be the SARAS Court or a notified Remote Point Location, or a place directed by the presiding officer with that direction recorded.
- *tightens* - REQ-TRL-007
- *related* - REQ-GJ-TRL-002

**REQ-GJ-TRL-002** · MUST · firm · from rule

The system MUST capture the plea as a physically signed document, scanned and uploaded with a self-attested copy of an accepted proof of identity.

- *why* - Rule 5.2 routes the plea through the physical-signature mode of rule 3.5. A plea recorded only as a screen entry by a clerk has no signature attributable to the accused; when he later resiles from it, there is nothing on the record to hold him to.
- *authority* - SARAS Courts Rules 2026, r.5.2 (`saras:rule_5` - 5. RECORDING PLEA AND SUPPLY OF COPIES)
- *authority* - SARAS Courts Rules 2026, r.3.5 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *binds* - workflow-step: plea recording - signature and identity proof
- *how* - The signed plea is scanned with a self-attested copy of a driving licence, election card, passport, PAN card, Aadhaar card or other identity proof the court permits, and uploaded to the record.
- *test* - A plea cannot be marked recorded without a scanned signed plea document and an identity proof attached.
- *related* - REQ-GJ-TRL-001, REQ-GJ-REC-003

**REQ-GJ-TRL-003** · MUST · firm · from rule

The system MUST furnish the copies due to the accused in electronic form by one of the prescribed electronic modes.

- *why* - Rule 5.3 makes electronic supply the ordinary course in a SARAS case. Where the court's workflow can only print and hand over, the accused in a remote-adjudication case, who may be answering from a video-enabled room in a district court hundreds of kilometres from Ahmedabad, has no way to receive his papers, and the trial cannot move past the supply stage.
- *authority* - SARAS Courts Rules 2026, r.5.3 (`saras:rule_5` - 5. RECORDING PLEA AND SUPPLY OF COPIES)
- *binds* - workflow-step: supply of copies to the accused - electronic modes
- *how* - By electronic mail, by a recognised electronic messaging service, or on a digital storage device procured at the cost of the accused.
- *test* - All three electronic modes are selectable when supplying copies, and the mode used with its date is recorded on the case.
- *tightens* - REQ-SRV-001
- *related* - REQ-GJ-TRL-004, REQ-GJ-TRL-005

**REQ-GJ-TRL-004** · MUST · firm · from rule

The system MUST record supply of the accused's copies to a person nominated by the accused, or to the pleader appearing for him, as valid compliance where the accused does not possess the facility to receive electronic copies.

- *why* - Rule 5.4 is cast as a 'shall': where the accused does not possess the necessary facility, the electronic copies shall be furnished to his nominee or to his pleader, and such supply shall be deemed valid compliance with the statutory requirement. Without the nominee or pleader recorded as the recipient, the supply appears on the record as never made to the accused, and the defence can take the point at the plea stage and force a fresh supply.
- *authority* - SARAS Courts Rules 2026, r.5.4 (`saras:rule_5` - 5. RECORDING PLEA AND SUPPLY OF COPIES)
- *binds* - schema-field: supply record - nominee or pleader as recipient
- *test* - The supply record accepts a nominee or the pleader as the recipient with the relationship stated, and the supply is reported as compliant.
- *related* - REQ-GJ-TRL-003

**REQ-GJ-TRL-005** · MUST · firm · from rule

The system MUST supply printed copies to the accused free of cost where he is unable to access or receive copies in electronic mode.

- *why* - Rule 5.5 preserves the statutory mandate for the accused who has no electronic facility, and makes the free printed supply a direction of the presiding officer. A digital-only workflow silently excludes the individual drawer of a dishonoured cheque, who is often the least equipped party in the case, and the conviction that follows is open to attack for want of supply.
- *authority* - SARAS Courts Rules 2026, r.5.5 (`saras:rule_5` - 5. RECORDING PLEA AND SUPPLY OF COPIES)
- *binds* - workflow-step: supply of copies to the accused - free printed fallback
- *how* - The printed copies are supplied free of cost as directed by the Presiding Officer of the Court.
- *test* - Where the accused is recorded as unable to receive electronic copies, a free printed supply can be directed and fulfilled, with no charge raised against the accused.
- *related* - REQ-GJ-TRL-003

**REQ-GJ-TRL-006** · MUST · firm · from rule

The system MUST require a party filing a document during the hearing to furnish a copy to the opposite party forthwith.

- *why* - Rules 4.22 and 4.23 place the duty on the filing party, ordinarily in electronic mode. In a remote hearing the opposite party cannot see what was handed up; without a served copy on the record the document is effectively filed behind his back, and any order made on it is vulnerable.
- *authority* - SARAS Courts Rules 2026, r.4.22 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *authority* - SARAS Courts Rules 2026, r.4.23 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *binds* - workflow-step: in-hearing filing - supply to the opposite party
- *how* - Supply is by electronic mail, a recognised electronic messaging service or another feasible electronic mode; where the opposite party cannot receive electronically, in physical form as the court directs.
- *test* - A document filed during a hearing raises a supply task on the filing party that must be completed before the hearing is closed.

**REQ-GJ-TRL-007** · MUST · firm · from rule

The system MUST conduct video-conferencing hearings only on a High Court or Government approved platform with end-to-end encryption.

- *why* - Both SARAS rule 4.21 and the 2025 rules require it. A SARAS hearing carries the accused's identity documents, the cheque and the bank's account particulars; conducted over a consumer meeting link it exposes all of that, and the unauthorised access the rules require to be reported becomes a routine risk.
- *authority* - SARAS Courts Rules 2026, r.4.21 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *authority* - Gujarat VC Rules 2025, r.5(iv) (`gvcr:rule_5` - 5. General Principles Governing Video Conferencing and other modes of Audio-video electronic)
- *binds* - validation-rule: hearing platform - approved and encrypted
- *test* - The hearing can be joined only through an approved platform held in configuration; an arbitrary meeting URL cannot be attached to a hearing.
- *related* - REQ-GJ-TRL-011

**REQ-GJ-TRL-008** · MUST · firm · from rule

The system MUST record the identity proof furnished to the court point coordinator by a person appearing through video conferencing, or the court's satisfaction dispensing with it.

- *why* - Rule 6 is how the court knows who is on the screen. In a cheque case that means the accused answering summons and the bank witness proving the return memo. Without the identity proof or the recorded dispensation on the file, an accused can later say the person who appeared and pleaded was not him.
- *authority* - Gujarat VC Rules 2025, r.6 (`gvcr:rule_6` - 6. Identification of person appearing through video conferencing or other modes of audio-visual electronic)
- *binds* - schema-field: appearance record - identity proof of a remote participant
- *how* - The identity proof is one recognised by the Government of India or the State Government and is sent to the court point coordinator by electronic communication; where it is not readily available the court may allow participation on its own satisfaction.
- *test* - Each remote appearance carries either an identity-proof reference or a recorded dispensation by the court.
- *related* - REQ-GJ-TRL-002

**REQ-GJ-TRL-009** · MUST · firm · from rule

The system MUST provide the accused an opportunity to consult his advocate before and after an examination conducted by video conferencing.

- *why* - Rule 13(2) makes it the court's duty. In a remote cheque trial the accused and his advocate are often at different points, so unless the hearing schedule creates a private channel for them, the consultation simply does not happen and the accused is examined without advice, which is a ground of challenge that costs the complainant the judgment.
- *authority* - Gujarat VC Rules 2025, r.13(2) (`gvcr:rule_13` - 13. Examination of persons and witnesses through video conferencing and other modes of audio-visual)
- *binds* - workflow-step: remote examination - private consultation with the advocate
- *test* - A remote examination of an accused offers a private consultation channel before and after the examination, and the fact that it was offered is recorded.

**REQ-GJ-TRL-010** · MUST NOT · firm · from rule

The system MUST NOT admit any person to a remote point during an examination other than the person being examined and those whose presence the coordinator deems administratively necessary.

- *why* - Rule 13(5) puts the duty on the coordinator. Where the remote point is a room in a bank branch or a recovery office, the risk that a bank officer stands behind the witness is real, and a deposition taken with the complainant's employees present is worth nothing on appeal.
- *authority* - Gujarat VC Rules 2025, r.13(5) (`gvcr:rule_13` - 13. Examination of persons and witnesses through video conferencing and other modes of audio-visual)
- *binds* - access-control: remote point - persons admitted during an examination
- *test* - The remote-point session records who was admitted, restricts joining to the person examined and the coordinator's listed necessary persons, and refuses others.

**REQ-GJ-TRL-011** · MUST NOT · firm · from rule

The system MUST NOT permit recording or publication of proceedings conducted by video conferencing except where the court has expressly permitted it.

- *why* - Rule 5(vii) and 5(viii) forbid unauthorised recording by any person at any point. A platform whose default toolbar offers a record button to every participant makes contempt trivially easy in a hearing where the accused's identity documents and the complainant's account particulars are on screen.
- *authority* - Gujarat VC Rules 2025, r.5(vii) (`gvcr:rule_5` - 5. General Principles Governing Video Conferencing and other modes of Audio-video electronic)
- *authority* - Gujarat VC Rules 2025, r.5(viii) (`gvcr:rule_5` - 5. General Principles Governing Video Conferencing and other modes of Audio-video electronic)
- *binds* - access-control: hearing platform - recording and publication controls
- *test* - Participant-side recording is disabled by default; enabling it requires a recorded court permission tied to the hearing.
- *related* - REQ-GJ-TRL-007

**REQ-GJ-TRL-012** · MUST · firm · from rule

The system MUST record a request by a party or witness for appearance through video conferencing in a criminal case.

- *why* - Rule 11(1) puts the initiative on the party or the witness in a criminal case, save where the proceedings are initiated at the instance of the Court or on the request of the public prosecutor. With no request on the record, a remote appearance rests on nothing, and the accused's absence from the physical court looks like non-appearance, which in a cheque case leads to a warrant.
- *authority* - Gujarat VC Rules 2025, r.11(1) (`gvcr:rule_11` - 11. Appearance through video conferencing and other modes of audio-visual electronic communication)
- *binds* - schema-field: appearance record - request for video conferencing
- *test* - Every remote appearance in a criminal case carries either a request record naming its mover or a marker that the proceeding was initiated by the Court or on the public prosecutor's request; an appearance with neither cannot be listed.
- *related* - REQ-GJ-TRL-021

**REQ-GJ-TRL-013** · MUST · firm · from rule

The system MUST classify a criminal case instituted on a private complaint in Track I.

- *why* - Schedule II Part B item 7 puts a criminal case on a private complaint, which is what a cheque case is, in Track I. The track drives the listing priority and the outer limit; a case sitting in the wrong track is scheduled against the wrong horizon, and in Gujarat's own scheme that is how a cheque case quietly becomes a three-year case.
- *authority* - Case Flow Management Rules 2016, Sch.II Part B item 7 (`gcfm:sch2_b_7` - 7. CRIMINAL CASE - PRIVATE COMPLAINT)
- *authority* - Case Flow Management Rules 2016, r.21(A)(1) (`gcfm:rule_21` - 21. Criminal Trials and Criminal Appeals to Subordinate Courts)
- *authority* - Case Flow Management Rules 2016, r.3(i) (`gcfm:rule_3` - 3. Categorisation of Suits and Appeals and other proceedings into Tracks)
- *binds* - schema-field: case record - case flow track
- *how* - The ministerial officer categorises the case and the judicial officer confirms the categorisation; the physical file takes the track colour, Track I being violet or indigo.
- *test* - A case instituted on a private complaint is created in Track I, and the classification carries both the ministerial entry and the judicial confirmation.
- *related* - REQ-GJ-TRL-014

**REQ-GJ-TRL-014** · MUST · contested · from rule

The system MUST compute and expose an outer date for concluding a criminal case on a private complaint at six months from institution.

- *why* - Schedule II Part B item 7 prescribes six months as the outer limit for concluding a criminal case on a private complaint, the same horizon the NI Act sets for a summary cheque trial. Rule 3(iv) of the same rules gives Track I a maximum of nine months, and rule 21(A)(2) repeats nine months for Track I criminal cases, so the instrument divides against itself. A system that adopts the nine-month figure gives every cheque case three months of slack that the Schedule does not allow, and the monthly progress report will show the case as on time when it is already over.
- *authority* - Case Flow Management Rules 2016, Sch.II Part B item 7 (`gcfm:sch2_b_7` - 7. CRIMINAL CASE - PRIVATE COMPLAINT)
- *authority* - Case Flow Management Rules 2016, r.3(iv) (`gcfm:rule_3` - 3. Categorisation of Suits and Appeals and other proceedings into Tracks)
- *authority* - Case Flow Management Rules 2016, r.21(A)(2) (`gcfm:rule_21` - 21. Criminal Trials and Criminal Appeals to Subordinate Courts)
- *binds* - schema-field: case record - prescribed outer date for conclusion
- *test* - A private-complaint criminal case shows an outer date six months from institution; the nine-month Track I figure is not used for this case type, and the divergence is surfaced rather than silently resolved.
- *tightens* - REQ-TRL-006
- *related* - REQ-GJ-TRL-013, REQ-GJ-TRL-015, REQ-GJ-CMP-001

**REQ-GJ-TRL-015** · MUST · firm · from rule

The system MUST require a written reason from the presiding judge before the track outer limit is extended or the case is moved to another track.

- *why* - Rule 3(vi) allows the extension or shift only for valid reason recorded in writing. Without that constraint the outer date becomes an editable field, and the six-month horizon that gives a cheque case its priority is quietly reset by whoever holds the case.
- *authority* - Case Flow Management Rules 2016, r.3(vi) (`gcfm:rule_3` - 3. Categorisation of Suits and Appeals and other proceedings into Tracks)
- *binds* - validation-rule: case record - amendment of the track or the outer date
- *test* - The track and outer date cannot be changed without a reason text and a presiding-officer actor; the change and the reason appear on the case history.
- *related* - REQ-GJ-TRL-014

**REQ-GJ-TRL-016** · MUST · firm · from rule

The system MUST produce a monthly report on the stage and progress of the cases scheduled to be listed in the next month, on the last working day of the third week of each month or five working days before the end of the business period, whichever is earlier.

- *why* - Rule 3(vii) makes the report the mechanism by which the track scheme is actually enforced. Where the report has to be assembled by hand from a docket of several thousand cheque cases, it is not produced, and nothing else in the scheme notices a case running past its outer date.
- *authority* - Case Flow Management Rules 2016, r.3(vii) (`gcfm:rule_3` - 3. Categorisation of Suits and Appeals and other proceedings into Tracks)
- *binds* - output-document: monthly case flow progress report
- *how* - The report is prepared by the ministerial officer and placed before the court concerned.
- *test* - The report generates on the prescribed date, covers the cases listed in the following month, and shows each case against its track and outer date.
- *related* - REQ-GJ-TRL-014

**REQ-GJ-TRL-017** · SHOULD · inferred · from rule

The system SHOULD list a case for arguments within seven days of the completion of evidence.

- *why* - Rule 9(13)(a) requires the case to be listed immediately after evidence is completed, and fixes seven days as the outer figure 'as far as possible' - it directs rather than commands, which is why this is a SHOULD; rule 21(B) carries the norm to a criminal trial. The gap between the close of evidence and arguments is where a cheque case with a six-month horizon loses months, because nothing triggers the listing.
- *authority* - Case Flow Management Rules 2016, r.9(13) (`gcfm:rule_9` - 9. Procedure on the failure of Alternative Dispute Resolution (Furtherance of Cases))
- *authority* - Case Flow Management Rules 2016, r.21(B) (`gcfm:rule_21` - 21. Criminal Trials and Criminal Appeals to Subordinate Courts)
- *binds* - workflow-step: cause list - listing for arguments after evidence
- *test* - Closing evidence on a case creates an arguments listing within seven days; a case with evidence closed and no arguments date inside seven days is reported as overdue.
- *related* - REQ-GJ-EVI-015

**REQ-GJ-TRL-018** · SHOULD · inferred · from rule

The system SHOULD record the magistrate's decision to try a case summarily before the trial commences.

- *why* - Rule 102(1) says magistrates should consider the appropriateness and desirability of the summary procedure before commencing the trial, and rule 102(2) lists the cases in which it is not appropriate, including those prima facie likely to be long and complicated. The Manual directs the consideration; it does not in terms require the decision to be recorded, so both the level and the recording are a reading of the rule rather than its words. A system that infers summary trial from the offence alone leaves no trace that the discretion was exercised, and a defended cheque case that should have gone to summons procedure is tried summarily and has to be tried again.
- *authority* - Criminal Manual 1977, r.102 (`gcrm:rule_102` - 102.)
- *authority* - Criminal Manual 1977, r.101 (`gcrm:rule_101` - 101.)
- *binds* - schema-field: case record - decision to try summarily
- *test* - The case carries a summary-trial decision with its date and actor, recorded before the first evidence event; the decision cannot be back-dated after evidence has begun.
- *tightens* - REQ-TRL-001

**REQ-GJ-TRL-019** · MUST · firm · from act

The system MUST raise the fixed bail bond fee when the accused is released on bond.

- *why* - Schedule II Article 10 charges a fixed fee on a bail bond in a criminal case and on a recognizance for personal appearance. In a cheque case the accused who answers summons is released on a bond at his first appearance, so this fee attaches in every contested case; a system that does not raise it leaves a short-paid record that the office must reconcile case by case.
- *authority* - Gujarat Court-Fees Act 2004, Sch.II Art.10 (`gcf:art_10` - Article 10. Bail-bonds in criminal cases, ……… Two rupees)
- *binds* - workflow-step: fee ledger - bail bond fee at first appearance
- *how* - Schedule II Article 10: two rupees on a bail-bond in a criminal case and on a recognizance to prosecute, to appear or otherwise.
- *test* - Recording the accused's release on bond raises the Article 10 fee entry against the case.

**REQ-GJ-TRL-020** · MAY · firm · from rule

The system MAY record an order apportioning or waiving the costs of video conferencing between the parties.

- *why* - Rule 22 lets the court decide who bears the cost of the facility, of preparing and transmitting soft or certified copies to the remote coordinator, and of the translator, interpreter, special educator and remote coordinator, and lets it waive those costs. In a cheque case where the complainant is a bank and the accused an individual, an unrecorded cost order silently lands on whichever party the workflow bills by default.
- *authority* - Gujarat VC Rules 2025, r.22 (`gvcr:rule_22` - 22. Costs of Video Conferencing)
- *binds* - schema-field: case record - order as to video conferencing costs
- *test* - A video-conferencing cost order can be recorded against a party or waived, and the billing follows the order rather than a default.

**REQ-GJ-TRL-021** · MUST · inferred · from rule

The system MUST store the schedule the court fixes when it allows a request for appearance through video conferencing.

- *why* - Rule 11(3) lets the court fix the schedule for convening the video conferencing at the moment it allows the request. The rule states the court's power; that the schedule be held as data on the appearance rather than left in the prose of the order is the reading, not the text. Where it lives only in the order text, the hearing is listed off the ordinary board and the parties, the coordinator and the remote point are given different times, so the bank officer and the accused connect on different days.
- *authority* - Gujarat VC Rules 2025, r.11(3) (`gvcr:rule_11` - 11. Appearance through video conferencing and other modes of audio-visual electronic communication)
- *binds* - schema-field: appearance record - schedule fixed for the video conferencing
- *test* - An order allowing video conferencing captures the schedule as a dated, timed field on the appearance, and the hearing listing for that appearance is generated from it rather than entered separately.
- *related* - REQ-GJ-TRL-012

#### CMP - compounding, settlement, mediation (2)

**REQ-GJ-CMP-001** · MUST · inferred · from rule

The system MUST set off the time spent in mediation, conciliation or Lok Adalat against the track time limit and extend the outer date proportionately.

- *why* - Rule 9(2) requires the time to be set off and the track limit proportionately extended, and rule 21(B) carries the norm to the criminal side. A cheque case is the case most often sent to the Lok Adalat, since it is compoundable and the parties usually want money rather than a conviction. If the clock keeps running through the reference, a case that settles late but fails comes back already past its outer date and is treated as delayed when it was not.
- *authority* - Case Flow Management Rules 2016, r.9(2) (`gcfm:rule_9` - 9. Procedure on the failure of Alternative Dispute Resolution (Furtherance of Cases))
- *authority* - Case Flow Management Rules 2016, r.21(B) (`gcfm:rule_21` - 21. Criminal Trials and Criminal Appeals to Subordinate Courts)
- *binds* - schema-field: case record - outer date adjusted for time in alternative dispute resolution
- *test* - Referring a case to mediation, conciliation or the Lok Adalat pauses the outer-date clock; on the failure report the outer date is extended by the elapsed period and the adjustment is visible on the case.
- *related* - REQ-GJ-TRL-014, REQ-GJ-CMP-002

**REQ-GJ-CMP-002** · SHOULD · inferred · from rule

The system SHOULD relist a case within three days of the report that the alternative dispute resolution process has failed.

- *why* - Rule 9(1) requires the matter to be listed within three days of the report, and rule 9(3) warns courts not to let the forum be used to prolong the case. The rule is written in civil terms, so its application to a criminal complaint runs through rule 21(B). Without the relisting trigger, a failed Lok Adalat reference leaves a cheque case dormant in the record room while its outer date runs.
- *authority* - Case Flow Management Rules 2016, r.9(1) (`gcfm:rule_9` - 9. Procedure on the failure of Alternative Dispute Resolution (Furtherance of Cases))
- *authority* - Case Flow Management Rules 2016, r.9(3) (`gcfm:rule_9` - 9. Procedure on the failure of Alternative Dispute Resolution (Furtherance of Cases))
- *authority* - Case Flow Management Rules 2016, r.21(B) (`gcfm:rule_21` - 21. Criminal Trials and Criminal Appeals to Subordinate Courts)
- *binds* - workflow-step: cause list - relisting after a failed settlement reference
- *test* - Recording a failure report creates a listing within three days, and a case with a failure report and no listing inside three days is reported.
- *related* - REQ-GJ-CMP-001

#### SEN - sentence, fine, compensation (3)

**REQ-GJ-SEN-001** · MUST · firm · from rule

The system MUST require the accused to be personally present at the SARAS Court when judgment is pronounced.

- *why* - Rule 10.1 makes personal presence at pronouncement a distinct requirement from presence at the plea. A remote-adjudication workflow that treats pronouncement as one more video hearing will pronounce a conviction on a cheque case with the accused on a screen in another district, and the conviction warrant that follows cannot be executed against a person who was never before the court.
- *authority* - SARAS Courts Rules 2026, r.10.1 (`saras:rule_10` - 10. CUSTODY UPON CONVICTION)
- *binds* - workflow-step: judgment pronouncement - presence of the accused
- *how* - The accused remains personally present at the SARAS Court at the time of pronouncement, or as and when the Presiding Officer directs.
- *test* - A judgment cannot be marked pronounced unless the accused's presence at the SARAS Court is recorded, or a direction of the presiding officer to the contrary is on the record.
- *tightens* - REQ-TRL-018
- *related* - REQ-GJ-SEN-003

**REQ-GJ-SEN-002** · MUST NOT · firm · from rule

The system MUST NOT make e-payment the only mode by which a fine, penalty or compensation can be paid.

- *why* - Rule 12 permits e-payment once the facility is enabled for the court, and until then payment by cash or another permissible mode. Compensation is the relief a cheque complainant actually came for. In a court where the facility is not yet live, a payment screen that offers only the electronic route leaves the accused unable to pay, the complainant unpaid, and the case unable to close.
- *authority* - SARAS Courts Rules 2026, r.12.1 (`saras:rule_12` - 12. PAYMENT OF FINE AND COMPENSATION)
- *authority* - SARAS Courts Rules 2026, r.12.2 (`saras:rule_12` - 12. PAYMENT OF FINE AND COMPENSATION)
- *binds* - workflow-step: payment of fine and compensation - available modes
- *test* - Where e-payment is not enabled for the court, cash and other permissible modes remain selectable, and the mode used is recorded against the payment.

**REQ-GJ-SEN-003** · MUST · firm · from rule

The system MUST route the issue and execution of a conviction warrant through the ordinary procedure established by law rather than through the remote-adjudication workflow.

- *why* - Rule 10.2 is the point at which a remote cheque case returns to the physical world. A warrant generated and treated as served inside the electronic workflow commits a person to prison on a record that no physical authority has acted on, which is the one step in a cheque case where the electronic record cannot stand alone.
- *authority* - SARAS Courts Rules 2026, r.10.2 (`saras:rule_10` - 10. CUSTODY UPON CONVICTION)
- *binds* - workflow-step: conviction warrant - issue, execution and compliance
- *test* - A conviction warrant is produced as a signed instrument for execution through the ordinary process channel, and its execution is recorded from a physical return rather than closed inside the portal.
- *related* - REQ-GJ-SEN-001

#### APL - appeal, revision, deposit (10)

**REQ-GJ-APL-001** · MUST · firm · from rule

The system MUST transmit the record and proceedings of a SARAS case to the appellate or revisional court in electronic form on that court's direction.

- *why* - Rule 14.1 makes electronic transmission the ordinary route. Where the trial record exists only on the portal, a system that can only produce a paper paging of the record either sends up a reconstruction or holds the appeal until one is made, and the appellant in a cheque case waits on an administrative task rather than a judicial one.
- *authority* - SARAS Courts Rules 2026, r.14.1 (`saras:rule_14` - 14. TRANSMISSION OF RECORD IN APPEAL OR REVISION)
- *binds* - workflow-step: record transmission on appeal or revision
- *test* - A direction from an appellate or revisional court produces an electronic transmission of the complete record and proceedings, with the transmission logged on the case.
- *related* - REQ-GJ-APL-002, REQ-GJ-REC-013

**REQ-GJ-APL-002** · MUST NOT · firm · from rule

The system MUST NOT transmit the original record or hard copies of the electronically maintained case record except as the appellate or revisional court directs.

- *why* - Rule 14.2 keeps the originals where they are unless the higher court asks for them. Sending up the original cheque with the appeal record removes from the trial court the very instrument SARAS rule 3.11 requires to be retained until the dispute attains finality, and it can be lost in transit between two courts neither of which is now responsible for it.
- *authority* - SARAS Courts Rules 2026, r.14.2 (`saras:rule_14` - 14. TRANSMISSION OF RECORD IN APPEAL OR REVISION)
- *authority* - SARAS Courts Rules 2026, r.3.11 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *binds* - validation-rule: record transmission - originals and hard copies
- *test* - Transmission of originals or hard copies requires a recorded direction of the appellate or revisional court; the default transmission carries only the electronic record.
- *related* - REQ-GJ-APL-001, REQ-GJ-EVI-004

**REQ-GJ-APL-003** · MUST · firm · from rule

The system MUST give a criminal matter presented in the High Court a filing number on presentation, and a registration number only when there is no office objection.

- *why* - Rule 333 makes them two distinct numbers with different meanings. A system with a single number cannot express a quashing petition against a cheque complaint that has been presented but not registered, and the petitioner cannot tell whether his matter is before the court or still with the office.
- *authority* - Gujarat High Court Rules 1993, r.333 (`ghcr:rule_333` - 333. Presentation of proceedings)
- *binds* - schema-field: High Court criminal matter - filing number and registration number
- *test* - A presented matter shows a filing number and no registration number; clearing the last office objection assigns the registration number and both remain on the record.
- *related* - REQ-GJ-APL-004, REQ-GJ-APL-005

**REQ-GJ-APL-004** · MUST · firm · from rule

The system MUST complete the office examination of a criminal appeal or application in the High Court within six days of filing.

- *why* - Rule 339 fixes six days, shortened to the next day where the sentence is six months or less and the accused is in custody. A revision against a cheque conviction that sits unscrutinised past that period delays the point at which the accused can even ask for suspension of sentence, and the shortened track exists precisely for the case where he is in custody.
- *authority* - Gujarat High Court Rules 1993, r.339 (`ghcr:rule_339` - 339. Examination of proceedings by office)
- *binds* - workflow-step: High Court scrutiny - six day examination clock
- *how* - The examination is completed within six days of filing, except where the sentence is six months or less and the accused is in custody, in which case not later than the day after presentation or receipt.
- *test* - A filed criminal application carries a scrutiny due date six days out, and one with a custody flag and a sentence of six months or less carries a next-day due date.
- *related* - REQ-GJ-APL-003

**REQ-GJ-APL-005** · MUST · firm · from rule

The system MUST place a criminal appeal or application before the Court for orders where the office objections are not removed within fourteen days of their notification.

- *why* - Rule 340 gives the advocate or applicant fourteen days and then requires the matter to go before the Court without delay. Without that trigger, a quashing petition in a cheque case can sit in the objection state indefinitely while the trial below proceeds, which is exactly the outcome the petitioner filed to prevent.
- *authority* - Gujarat High Court Rules 1993, r.340 (`ghcr:rule_340` - 340. Office of notify objections, and their removal by Advocates)
- *binds* - workflow-step: High Court objections - fourteen day removal clock
- *how* - The office notifies objections on a special notice board and an entry of the date of notification is made on the presentation form; the fourteen days run from that notification.
- *test* - Notification of objections starts a fourteen-day clock recorded on the matter, and on expiry without removal the matter appears on a list for orders.
- *related* - REQ-GJ-APL-003

**REQ-GJ-APL-006** · MUST · firm · from rule

The system MUST require a criminal appeal or application in the High Court to be accompanied by a certified copy of the judgment or order challenged.

- *why* - Rule 345 requires every criminal appeal and application to be accompanied by the certified copy of the judgment or order challenged, and additionally by the certified copy of the trial court judgment where the challenge is to an appellate or revisional order of the Sessions Judge. A revision against a cheque conviction filed without the trial judgment is objected to at scrutiny, and the fourteen-day objection clock consumes the time the applicant needed for the certified copy in the first place. The rule says what must accompany the memorandum and leaves the manner of production open, so how is null.
- *authority* - Gujarat High Court Rules 1993, r.345 (`ghcr:rule_345` - 345. Accompaniments to appeals and applications)
- *binds* - validation-rule: High Court filing - accompanying certified copies
- *test* - A criminal application cannot be presented without a certified copy of the order challenged, and a challenge to a revisional order additionally requires the trial court judgment.
- *related* - REQ-GJ-CPY-001, REQ-GJ-CPY-005, REQ-GJ-APL-010

**REQ-GJ-APL-007** · MUST · firm · from rule

The system MUST list an application to quash a complaint and a criminal revision before a Single Judge.

- *why* - Rule 2 assigns to a Single Judge applications under section 482 of the Code of Criminal Procedure, now section 528 of the Sanhita, revisional jurisdiction under section 401, and applications to transfer or stay proceedings pending in a criminal court. Most cheque litigation that reaches the High Court arrives by one of those routes; listing it before a Division Bench wastes a board and returns the matter for relisting.
- *authority* - Gujarat High Court Rules 1993, r.2 (`ghcr:rule_2` - 2. Matters to be disposed of by a Single Judge)
- *binds* - validation-rule: High Court listing - Single Judge jurisdiction
- *test* - A quashing petition and a criminal revision arising out of a cheque case are listed before a Single Judge by default, and a Division Bench listing requires an express override.

**REQ-GJ-APL-008** · MUST · firm · from act

The system MUST charge the fixed fee prescribed for an application to the High Court for the exercise of its jurisdiction under Article 227 of the Constitution.

- *why* - Schedule II Article 1(f)(ii) puts fifty rupees on an Article 227 application, against one hundred rupees for an Article 226 petition not concerning fundamental rights and twenty rupees in any other case. The supervisory route under Article 227 is how an accused in a cheque case seeks to have the complaint quashed or the proceedings stayed, so the wrong entry is applied at scale.
- *authority* - Gujarat Court-Fees Act 2004, Sch.II Art.1(f) (`gcf:art_1` - Article 1. Application or petition (a) When Presented to any officer of Three rup)
- *binds* - validation-rule: court fee calculation - High Court application under Article 227
- *how* - Schedule II Article 1(f)(ii): fifty rupees on an application to the High Court for the exercise of its jurisdiction under article 227, as against one hundred rupees under Article 1(f)(i) on an article 226 petition for any purpose other than the enforcement of fundamental rights and twenty rupees under Article 1(f)(iii) in any other case.
- *test* - An Article 227 application is charged the Article 1(f)(ii) amount, distinct from the Article 226 and residual entries.

**REQ-GJ-APL-009** · MUST · firm · from rule

The system MUST accept a receipt of payment made through the e-payment system in place of a stamp when the sufficiency of court fees on an appeal is inquired into.

- *why* - Section 37(1) makes e-payment a lawful mode of collecting court fees, and rule 64 was amended to contemplate the e-payment receipt being produced where a stamp of a different amount would otherwise be required. Accepting it is therefore not a matter of the office's choice. Where the office can only accept a physical stamp, the electronic payment made at the trial court, which is how the fee is paid in an e-filed cheque case, cannot be carried into the appeal record, and the appeal is objected to for a fee that was in fact paid.
- *authority* - Gujarat High Court Rules 1993, r.64 (`ghcr:rule_64` - 64. Inquiry regarding sufficiency of Court fees)
- *authority* - Gujarat Court-Fees Act 2004, s.37(1) (`gcf:sec_37` - 37. Collection of fees [**])
- *binds* - workflow-step: High Court scrutiny - proof of court fee paid electronically
- *test* - An e-payment receipt reference satisfies the court-fee sufficiency check on an appeal without a physical stamp.

**REQ-GJ-APL-010** · MUST · firm · from rule

The system MUST show, on the memorandum of a criminal proceeding in the High Court challenging an order of a Sessions Court whose jurisdiction covers more than one revenue district, the revenue district in which the original proceeding was instituted.

- *why* - Rule 345 requires it, and it is what the High Court office uses to place a matter arising out of a multi-district Sessions Court. A revision against a Sessions appellate order in a cheque case that does not name the revenue district of institution is objected to at scrutiny, and the fourteen-day objection clock runs while the memorandum is corrected.
- *authority* - Gujarat High Court Rules 1993, r.345 (`ghcr:rule_345` - 345. Accompaniments to appeals and applications)
- *binds* - schema-field: High Court memorandum - revenue district in which the original proceeding was instituted
- *test* - A memorandum challenging an order of a Sessions Court held in the record as covering more than one revenue district cannot be presented without the revenue district of institution recorded, and that district appears on the generated memorandum.
- *related* - REQ-GJ-APL-006

#### REC - the court record, registers, retention (22)

**REQ-GJ-REC-001** · MUST · firm · from rule

The system MUST treat the electronic record maintained on the designated portal as the primary and authoritative judicial record of a SARAS case.

- *why* - Rule 3.1 is the doctrinal core of the SARAS regime. Where a system keeps a parallel physical file as the authoritative one and the portal as a copy, the two diverge, and a cheque case is decided on whichever version the officer happens to be holding. The whole design of remote adjudication, in which the officer is never in the same building as the paper, depends on this being settled the other way.
- *authority* - SARAS Courts Rules 2026, r.3.1 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *authority* - SARAS Courts Rules 2026, r.3.2 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *authority* - SARAS Courts Rules 2026, r.4.10 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *binds* - schema-field: case record - the portal record as the authoritative record
- *test* - Every document, order and rojnama entry of a SARAS case exists on the portal record, and no case artifact exists only outside it.
- *related* - REQ-GJ-EVI-004, REQ-GJ-REC-002

**REQ-GJ-REC-002** · MUST · firm · from rule

The system MUST authenticate a document required to be signed by a token-based Digital Signature Certificate where the signatory holds one.

- *why* - Rules 3.3, 3.4 and 4.19 require authentication that ensures verifiability, integrity and attribution, and discourage physical signing where a token or Aadhaar e-sign is available. A bank filing in bulk holds tokens for its authorised signatories; letting those filings through on a scanned wet signature loses the attribution that makes the electronic record authoritative in the first place.
- *authority* - SARAS Courts Rules 2026, r.3.3 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *authority* - SARAS Courts Rules 2026, r.3.4 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *authority* - SARAS Courts Rules 2026, r.4.19 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *authority* - Gujarat e-Filing SOP 2024, cl.7.1 (`gefr:rule_7` - 7. Digital Signatures)
- *binds* - validation-rule: document authentication - token-based digital signature
- *test* - A signatory with a registered token is offered only the token route, and a document signed with it records the certificate details on the record.
- *related* - REQ-GJ-REC-003

**REQ-GJ-REC-003** · MUST · firm · from rule

The system MUST capture, where authentication is by physical signature, the scanned signed document together with a self-attested copy of an accepted proof of identity.

- *why* - Rule 3.5 is the fallback for a person without a token. An individual accused, and the small payee who files without an advocate, will always use it. If the identity proof is not captured with the signed page, the signature on the record is attributable to nobody, and the document fails the verifiability that rule 3.3 requires.
- *authority* - SARAS Courts Rules 2026, r.3.5 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *authority* - SARAS Courts Rules 2026, r.3.6 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *authority* - Gujarat e-Filing SOP 2024, cl.7.1 (`gefr:rule_7` - 7. Digital Signatures)
- *binds* - workflow-step: document authentication - physical signature route
- *how* - The person physically signs, and the signed document accompanied by a self-attested copy of a driving licence, election card, passport, PAN card, Aadhaar card or other identity proof the court permits is scanned and uploaded to form part of the judicial record.
- *test* - A physically signed upload cannot be completed without an identity proof attached, and both pages land on the same document record.
- *related* - REQ-GJ-REC-002, REQ-GJ-TRL-002

**REQ-GJ-REC-004** · MUST · firm · from rule

The system MUST require the Presiding Officer to digitally sign a document scanned at the Remote Adjudication Point before it forms part of the official record.

- *why* - Rule 3.7 makes the officer's digital signature the act that admits a scanned document to the record, after the ministerial staff have scanned, OCR-enabled, checked and verified it. Without that step, anything a clerk uploads is on the file, and in a court where the officer is in another district there is no other moment at which he sees what has been added.
- *authority* - SARAS Courts Rules 2026, r.3.7 (`saras:rule_3` - 3. GENERAL PRINCIPLES OF PROCEDURE FOR SARAS COURTS)
- *authority* - SARAS Courts Rules 2026, r.4.15 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *binds* - workflow-step: document intake - presiding officer's digital signature on scanned documents
- *how* - The ministerial staff of the Remote Adjudication Point scan, OCR-enable, check and verify the document per the High Court's scanning and digitisation SOP, and send it to the SARAS Court, where the Presiding Officer digitally signs it.
- *test* - A scanned document sits in a pending state until the presiding officer signs it; only then does it appear as part of the official record.
- *related* - REQ-GJ-REC-011

**REQ-GJ-REC-005** · MUST · firm · from rule

The system MUST assign exhibit numbers to the documents of a SARAS case in conformity with rule 76 of the Criminal Manual.

- *why* - SARAS rule 4.13 sends exhibit and bookmark assignment straight back to Criminal Manual rule 76, under which each document bears an exhibit number and a serial number as it comes before the court. An independent numbering scheme invented by the portal produces a record whose exhibit numbers do not match the Roznama, the deposition or the judgment, and a certified copy taken from it is unusable on appeal.
- *authority* - SARAS Courts Rules 2026, r.4.13 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *authority* - Criminal Manual 1977, r.76 (`gcrm:rule_76` - 76. The proceeding sheet (Roznama) in Form No)
- *binds* - workflow-step: exhibit assignment - conformity with Criminal Manual rule 76
- *how* - The designated staff member assigns bookmarks, exhibits or marks promptly and correctly according to the nature of the document; each document bears an exhibit number and a serial number as it comes before the court.
- *test* - Exhibit numbers run in the order documents come before the court, and the exhibit list on the rojnama matches the exhibit numbers on the documents themselves.
- *related* - REQ-GJ-REC-008, REQ-GJ-REC-006

**REQ-GJ-REC-006** · MUST · firm · from rule

The system MUST record the rojnama in the Case Information System at the conclusion of proceedings on each date of hearing and place it for the Presiding Officer's digital authentication.

- *why* - Rule 4.20 fixes both the moment and the authentication. A rojnama written up days later from memory, or never authenticated, is not the faithful history of the case that Criminal Manual rule 76 requires; and in a remote court the rojnama is the only account of what happened, since no party and no officer shares a room.
- *authority* - SARAS Courts Rules 2026, r.4.20 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *authority* - Criminal Manual 1977, r.76 (`gcrm:rule_76` - 76. The proceeding sheet (Roznama) in Form No)
- *binds* - output-document: rojnama entry for a date of hearing
- *how* - The designated staff member records the rojnama in the Case Information System under the Case Proceedings or Business block; it is then placed for the Presiding Officer's digital signature and on signature forms part of the official record.
- *test* - Closing a hearing creates a rojnama entry dated that day, which cannot become part of the record until digitally signed by the presiding officer.
- *related* - REQ-GJ-REC-007, REQ-GJ-REC-005

**REQ-GJ-REC-007** · MUST NOT · firm · from rule

The system MUST NOT record ministerial acts such as the receipt of process fees or the preparation of summonses in the Roznama.

- *why* - Rule 76 excludes them expressly and requires the Roznama to be as concise as possible while remaining a faithful history. A system that writes every event of its own audit log into the rojnama buries the judicial history of a cheque case under fee receipts and process-generation entries, and the officer reading the file cannot see what was actually done in court.
- *authority* - Criminal Manual 1977, r.76 (`gcrm:rule_76` - 76. The proceeding sheet (Roznama) in Form No)
- *binds* - validation-rule: rojnama content - exclusion of ministerial events
- *test* - Fee receipts, process generation and similar ministerial events appear in the audit trail but not in the rojnama; the rojnama for a typical cheque hearing is a handful of lines.
- *related* - REQ-GJ-REC-006

**REQ-GJ-REC-008** · MUST · firm · from rule

The system MUST sub-number an order on an interlocutory application, or a document filed in continuation of an existing exhibit, below the parent exhibit rather than assigning it an independent exhibit number.

- *why* - Rule 4.17 gives the example: an order below Exhibit-5 is Exhibit-5/1. Assigning a fresh number breaks the link between the application and the order on it, and in a cheque case with a long series of applications for exemption from personal appearance the record becomes impossible to follow at the appellate stage.
- *authority* - SARAS Courts Rules 2026, r.4.17 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *binds* - schema-field: exhibit numbering - sub-numbering below a parent exhibit
- *how* - An order passed below Exhibit-5 is marked Exhibit-5/1 and is not assigned an independent exhibit number.
- *test* - An order recorded against an application exhibited as 5 is numbered 5/1, and the next independent document takes the next whole number.
- *related* - REQ-GJ-REC-005

**REQ-GJ-REC-009** · MUST · firm · from rule

The system MUST generate orders, judgments and depositions directly in PDF rather than by printing, signing and scanning them.

- *why* - Rule 4.18 requires direct generation, not a print-sign-scan cycle. A scanned judgment has no text layer, cannot be searched, quoted or indexed, and is a poor thing to send to an appellate court that receives the record electronically under rule 14.
- *authority* - SARAS Courts Rules 2026, r.4.18 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *binds* - output-document: orders, judgments and depositions as natively generated signed PDFs
- *test* - A judgment, an order and a deposition produced by the system are each PDFs with a selectable text layer, and no page in them is a scanned image.
- *related* - REQ-GJ-REC-010, REQ-GJ-REC-022, REQ-GJ-APL-001

**REQ-GJ-REC-010** · MUST · firm · from rule

The system MUST require an order sheet typed by a stenographer to be digitally signed by the magistrate before it is uploaded to the Case Information System.

- *why* - Rule 8.1 allows magistrates to dictate order sheets to stenographers online during or after the hearing, and requires the signature before upload. An unsigned order sheet on the CIS is indistinguishable from a signed one to anyone reading the case, and in a remote court where nobody sees the officer sign, that is how an undictated or altered order enters the record.
- *authority* - SARAS Courts Rules 2026, r.8.1 (`saras:rule_8` - 8. PREPARATION AND SIGNATURE OF ORDER SHEETS/MISC. ORDERS)
- *binds* - workflow-step: order sheet - signature before upload
- *test* - An order sheet cannot be uploaded to the CIS in an unsigned state; the upload action requires the signature in the same step.
- *related* - REQ-GJ-REC-009

**REQ-GJ-REC-011** · MUST · firm · from rule

The system MUST make a registered matter available first in the Presiding Officer's account and only after his verification route it to the designated court staff.

- *why* - Rule 4.12 fixes the order. If a newly registered cheque case goes straight to ministerial processing, the exhibits and bookmarks are assigned before the officer has seen the matter at all, and the first judicial look at the file happens after the record has already been shaped.
- *authority* - SARAS Courts Rules 2026, r.4.12 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *binds* - access-control: case routing after registration - presiding officer before court staff
- *test* - A newly registered matter appears only in the presiding officer's queue; the staff queue receives it after his verification is recorded.
- *related* - REQ-GJ-REC-004

**REQ-GJ-REC-012** · MUST · firm · from rule

The system MUST govern the maintenance, classification, retention and destruction of the electronic record on the designated portal by rules 361 to 367 of the Criminal Manual.

- *why* - Rule 7.1 applies the 1977 record rules to the electronic record so far as they can apply. A digital archive run on a storage-management policy of its own will destroy or migrate the record of a cheque case on a schedule the court never adopted, and the classification the Criminal Manual requires will not exist to argue about.
- *authority* - SARAS Courts Rules 2026, r.7.1 (`saras:rule_7` - 7. MAINTENANCE AND DESTRUCTION OF ELECTRONIC RECORD)
- *authority* - Criminal Manual 1977, r.361 (`gcrm:rule_361` - 361. The record of a substantive criminal proceeding should not be con)
- *binds* - schema-field: electronic record - retention policy derived from the Criminal Manual
- *test* - Every electronic case record carries a Criminal Manual classification and the retention period that attaches to it, and no destruction runs outside that policy.
- *related* - REQ-GJ-REC-013, REQ-GJ-REC-014, REQ-GJ-REC-015

**REQ-GJ-REC-013** · MUST NOT · firm · from rule

The system MUST NOT despatch the record of a substantive criminal proceeding to the record room until the period for appeal or revision has expired, or where an appeal or revision has been instituted, until it is disposed of.

- *why* - Rule 361 sets the condition and adds, as a precaution, that records be kept intact in the sequence of institution serial numbers for two months beyond that period before filing orders are taken. A cheque case record archived on judgment cannot be produced when the appellate court calls for it under SARAS rule 14, and the appeal stalls on the record's absence.
- *authority* - Criminal Manual 1977, r.361 (`gcrm:rule_361` - 361. The record of a substantive criminal proceeding should not be con)
- *binds* - validation-rule: record room - despatch precondition
- *test* - The despatch action is unavailable while the appeal or revision period is running or an appeal or revision is pending, and the two-month precautionary hold is applied before filing orders are sought.
- *related* - REQ-GJ-REC-012, REQ-GJ-APL-001

**REQ-GJ-REC-014** · MUST · firm · from rule

The system MUST classify every paper on the record into file A, B, C or D immediately after the filing order is passed.

- *why* - Rule 362 requires the arrangement into four files, and rule 363 attaches the retention period to the class. Without the classification recorded per document, the retention period cannot be applied at all, and either everything is kept for ever or the retention run picks a single period for the whole case.
- *authority* - Criminal Manual 1977, r.362 (`gcrm:rule_362` - 362.)
- *authority* - Criminal Manual 1977, r.363 (`gcrm:rule_363` - 363. The classification of the record and the marking and filing thereof)
- *binds* - schema-field: document record - Criminal Manual file classification
- *how* - Papers to be preserved permanently go to file A; semi-permanent papers such as judgments of a court other than the Sessions Court to file B; papers bearing on the merits such as depositions and documents produced in evidence not to be returned to the parties to file C; papers with no bearing on the merits such as vakalatnamas and remand orders to file D.
- *test* - Passing the filing order requires each document to carry an A, B, C or D classification, and an unclassified document blocks the filing order.
- *related* - REQ-GJ-REC-015

**REQ-GJ-REC-015** · MUST · firm · from rule

The system MUST compute the destruction date of a paper from the class it was given, running from the final decision of the case in the trial court where no appeal or revision was filed and from the final decision of the appellate or revisional court where one was.

- *why* - Rule 363 fixes the periods and the starting point. A retention engine that runs from the date the document was created will destroy a deposition in a cheque case five years after it was recorded rather than five years after the case ended, which in a contested case can be while the appeal is still pending.
- *authority* - Criminal Manual 1977, r.363 (`gcrm:rule_363` - 363. The classification of the record and the marking and filing thereof)
- *binds* - schema-field: document record - destruction date by class
- *how* - File A permanently; file B destroyed after thirty years; file C after five years; file D after six months. The period is computed from the date of the final decision of the case in the trial court where no appeal or revision application has been filed, and from the date of the final decision of the appellate or revisional court where one has been filed.
- *test* - The destruction date on a document equals its class period added to the case's final-decision date - the appellate or revisional decision date where an appeal or revision was filed - and never to the document's own date.
- *related* - REQ-GJ-REC-014, REQ-GJ-REC-016

**REQ-GJ-REC-016** · MUST · contested · from rule

The system MUST apply the longer of the two retention periods prescribed for a signed vakalatnama.

- *why* - The sources divide. Criminal Manual rule 363 puts vakalatnamas in file D, destroyed after six months. Clause 10.2 of the Gujarat e-Filing SOP requires the signed vakalatnama to be preserved for at least two years after final disposal, including disposal by the superior appellate court, and SARAS rule 13.2 adopts that clause for retention of originals in a SARAS case. A system that follows the Criminal Manual alone destroys the very document whose authenticity the SOP anticipates being questioned, while the appeal in the cheque case is still running.
- *authority* - Criminal Manual 1977, r.363 (`gcrm:rule_363` - 363. The classification of the record and the marking and filing thereof)
- *authority* - Gujarat e-Filing SOP 2024, cl.10.2 (`gefr:rule_10` - 10. Retention of Originals)
- *authority* - SARAS Courts Rules 2026, r.13.2 (`saras:rule_13` - 13. CUSTODY AND RETENTION OF PHYSICAL DOCUMENTS)
- *binds* - validation-rule: retention policy - vakalatnama
- *test* - A signed vakalatnama in a SARAS case is retained until at least two years after final appellate disposal, and the six-month file D period does not trigger its destruction.
- *related* - REQ-GJ-EVI-007, REQ-GJ-REC-015

**REQ-GJ-REC-017** · MUST · firm · from rule

The system MUST preserve the register of cases before Judicial Magistrates and Metropolitan Magistrates for thirty years from the expiry of the last year in the volume.

- *why* - Rule 364 sets the period for the registers, as distinct from the case papers. In a court hearing cheque cases in bulk the register is the only index by which an old case can be found once the papers have gone to the record room, and a register purged with the case files leaves the record unsearchable.
- *authority* - Criminal Manual 1977, r.364 (`gcrm:rule_364` - 364. Papers not forming part of Court)
- *binds* - schema-field: register retention - registers of cases before magistrates
- *test* - The case register carries a thirty-year retention computed from the expiry of the last year in the volume, independent of the retention on the case papers it indexes.
- *related* - REQ-GJ-REC-012

**REQ-GJ-REC-018** · MUST · firm · from rule

The system MUST restrict access to the pleadings and documents filed electronically in a case to the advocates for the parties and to the party-in-person.

- *why* - Clause 11.1 confines access to them. A SARAS cheque case file holds the accused's identity documents and the complainant's account particulars for thousands of borrowers; a portal that lets any logged-in advocate open any case turns the docket into a source of personal data at scale.
- *authority* - Gujarat e-Filing SOP 2024, cl.11.1 (`gefr:rule_11` - 11. Access to the Electronic Data of the Action)
- *binds* - access-control: case file access - parties' advocates and the party-in-person
- *test* - An advocate not on record for a party cannot open the pleadings or documents of that case; the attempt is refused and logged.
- *related* - REQ-GJ-CPY-010

**REQ-GJ-REC-019** · MUST · firm · from rule

The system MUST store e-filings on a server under the control and directions of the court, with each filing separately labelled and encrypted.

- *why* - Clause 17 requires it. An institutional filer's cheque bundles carry account numbers, addresses and signatures; held on a shared or vendor-controlled store, or unencrypted, they are outside the court's control while remaining the primary judicial record under SARAS rule 3.1.
- *authority* - Gujarat e-Filing SOP 2024, cl.17 (`gefr:rule_17` - 17. Storage and Retrieval of e-Filed Documents and Pleadings)
- *binds* - access-control: storage - court-controlled, labelled and encrypted e-filing store
- *test* - Filings are held encrypted at rest on court-controlled infrastructure, each with its own label, and access is only through the court's own access-control path.
- *related* - REQ-GJ-REC-001, REQ-GJ-REC-020

**REQ-GJ-REC-020** · SHOULD · inferred · from rule

The system SHOULD maintain a mirror image of the e-filings on servers at a different geographical location for continuity of operations.

- *why* - Clause 17 provides that a mirror image of the e-filings may be maintained on servers at different geographical locations for continuity of operations in case of disaster, natural calamity or breakdown. The clause is permissive on its face; treating the mirror as something a system ought to have is a reading of it in the light of SARAS rule 3.1, which makes the electronic record the primary and authoritative judicial record. On that footing the loss of the store is the loss of the case, and a court trying tens of thousands of cheque cases has no paper file to fall back on.
- *authority* - Gujarat e-Filing SOP 2024, cl.17 (`gefr:rule_17` - 17. Storage and Retrieval of e-Filed Documents and Pleadings)
- *binds* - access-control: storage - geographically separate mirror
- *test* - A restore from the mirror reproduces the portal record of a sample case in full, including its digital signatures.
- *related* - REQ-GJ-REC-019

**REQ-GJ-REC-021** · MUST · firm · from rule

The system MUST generate a hash value for an audio or video file included in an e-filing.

- *why* - Clause 8.4 puts that duty on the Administrator. Where a cheque case turns on a recorded conversation or a video of a handover, a file on the record with no hash cannot be shown to be the file that was filed, and its integrity is open to challenge at the very point it matters.
- *authority* - Gujarat e-Filing SOP 2024, cl.8.4 (`gefr:rule_8` - 8. Dos and Don'ts)
- *binds* - schema-field: document record - hash value of an audio or video filing
- *test* - An audio or video upload records a hash value against the document; recomputing the hash on the stored file reproduces it.

**REQ-GJ-REC-022** · MUST · firm · from rule

The system MUST have every order, judgment and deposition digitally signed by the Presiding Officer through the designated portal.

- *why* - Rule 4.18 puts the signature on the same footing as the generation. An unsigned judgment sitting on the portal is indistinguishable from a signed one to anyone reading the case, and in a court where nobody is in the room when the officer signs, an image of a signature is not a verifiable one when the appellate court receives the record electronically under rule 14.
- *authority* - SARAS Courts Rules 2026, r.4.18 (`saras:rule_4` - 4. GENERAL INSTRUCTIONS FOR E-FILING AND OTHER MINISTERIAL FUNCTIONS)
- *binds* - validation-rule: orders, judgments and depositions - presiding officer's digital signature
- *test* - A judgment carries a verifiable digital signature of the presiding officer applied on the portal; a judgment without one cannot be released to the parties or transmitted on appeal.
- *related* - REQ-GJ-REC-009, REQ-GJ-REC-004

#### CPY - copies and their supply (12)

**REQ-GJ-CPY-001** · MUST · firm · from rule

The system MUST treat a digitally signed electronic copy generated from the record on the designated portal as a certified copy for all legal purposes.

- *why* - Rule 11.2 says so expressly. Where the system offers only a printed and manually attested copy, a party in a SARAS cheque case has to travel to Ahmedabad for the judgment he needs to file an appeal, in a case that was tried entirely at a distance, and the appeal period runs while he does.
- *authority* - SARAS Courts Rules 2026, r.11.1 (`saras:rule_11` - 11. CERTIFIED COPIES)
- *authority* - SARAS Courts Rules 2026, r.11.2 (`saras:rule_11` - 11. CERTIFIED COPIES)
- *binds* - output-document: certified copy generated from the digitally signed electronic record
- *how* - Issuance is governed by Chapter XXII of the Criminal Manual; copies are generated from the digitally signed electronic record on the designated portal.
- *test* - A certified copy of a judgment can be obtained as a digitally signed electronic file, and it is accepted as a certified copy without a further physical attestation.
- *related* - REQ-GJ-CPY-002, REQ-GJ-APL-006

**REQ-GJ-CPY-002** · MUST · firm · from rule

The system MUST carry on a certified copy of a digitally converted document a statement that the copy is generated from the digitally converted document filed in court.

- *why* - Rule 11.3 requires the statement. Without it a certified copy of a scanned cheque looks like a certified copy of the instrument itself, and a party relying on it in another proceeding, a civil suit on the same cheque for instance, misrepresents what the court actually holds.
- *authority* - SARAS Courts Rules 2026, r.11.3 (`saras:rule_11` - 11. CERTIFIED COPIES)
- *binds* - output-document: certified copy - provenance statement
- *test* - A certified copy of a scanned document carries the statement on its face; a certified copy of a natively electronic order does not.
- *related* - REQ-GJ-CPY-001

**REQ-GJ-CPY-003** · MUST · firm · from rule

The system MUST supply a certified copy through the medium the applicant specified in the application.

- *why* - Rule 11.4 makes the medium the applicant's choice, subject only to the device not being obsolete. A workflow that always emails will fail the applicant who needs the copy on a storage device because the record is too large for mail, and one that always uses a device makes an applicant in another district travel to collect it.
- *authority* - SARAS Courts Rules 2026, r.11.4 (`saras:rule_11` - 11. CERTIFIED COPIES)
- *binds* - schema-field: certified copy application - medium of supply
- *how* - The medium is electronic mail, a recognised electronic messaging service, or a digital storage device that has not become obsolete.
- *test* - The application captures the medium; the supply record shows the copy went out by that medium.
- *related* - REQ-GJ-CPY-004

**REQ-GJ-CPY-004** · MUST · firm · from rule

The system MUST compute the charge for a certified copy supplied by electronic means on the prescribed per-megabyte scale.

- *why* - Rule 11.5 fixes a minimum of fifty rupees for up to twenty-five megabytes and fifty rupees for each further twenty-five megabytes, with the cost of the storage device borne by the applicant in addition. A cheque case record with scanned bank statements runs to hundreds of megabytes, so a system charging a single flat copying fee will under-recover on every large record and cannot reconcile its copy account.
- *authority* - SARAS Courts Rules 2026, r.11.5 (`saras:rule_11` - 11. CERTIFIED COPIES)
- *binds* - validation-rule: certified copy - charge computation
- *how* - A minimum of fifty rupees for up to twenty-five megabytes as handling charges, and fifty rupees for each additional twenty-five megabytes; where supply is on a digital storage device, the actual cost of the device is borne by the applicant in addition.
- *test* - A copy of sixty megabytes is charged for three blocks; supply on a device adds the device cost as a separate line.
- *related* - REQ-GJ-CPY-003

**REQ-GJ-CPY-005** · MUST · firm · from rule

The system MUST produce, with a certified copy supplied in electronic form, a digitally signed endorsement page stating the date of the application, the date it was granted and the date the copy was ready for delivery.

- *why* - Rule 11.7 prescribes the endorsement, and it is what the appellate court uses to exclude the copying time from the limitation for the appeal. Without those three dates on the copy, a convicted drawer in a cheque case cannot show why his appeal was filed when it was.
- *authority* - SARAS Courts Rules 2026, r.11.7 (`saras:rule_11` - 11. CERTIFIED COPIES)
- *authority* - SARAS Courts Rules 2026, r.11.6 (`saras:rule_11` - 11. CERTIFIED COPIES)
- *binds* - output-document: certified copy - endorsement page
- *how* - The endorsement is made on a separate page by the concerned ministerial staff and is digitally signed by the staff member supplying the copy; compliance with the Criminal Manual is ensured through digital endorsements and digital signatures.
- *test* - Every electronically supplied certified copy carries an endorsement page with the three dates and a verifiable staff signature.
- *related* - REQ-GJ-CPY-006, REQ-GJ-APL-006

**REQ-GJ-CPY-006** · MUST · firm · from rule

The system MUST furnish a certified copy within ten days of a complete application.

- *why* - Rule 384 sets the period, running from the day the application is presented where it is complete, and from the date it is granted in other cases. In a cheque case the copy of the judgment is the document an appeal cannot be filed without, so a copy queue with no service clock silently eats into the appeal period.
- *authority* - Criminal Manual 1977, r.384 (`gcrm:rule_384` - 384.)
- *binds* - workflow-step: certified copy queue - ten day service clock
- *how* - The ten days run from the day on which the application is presented where the application is complete, and in other cases from the date on which the application is granted.
- *test* - A complete copy application carries a due date ten days out, and the queue reports applications past it.
- *related* - REQ-GJ-CPY-007

**REQ-GJ-CPY-007** · MUST · firm · from rule

The system MUST endorse the cause of delay on a certified copy furnished after the ten day period.

- *why* - Rule 384 requires the cause of delay to be endorsed on the copy where further delay is unavoidable. That endorsement is the applicant's evidence when the appellate court asks why the appeal is late; a copy delivered late with nothing on its face leaves him unable to explain the gap.
- *authority* - Criminal Manual 1977, r.384 (`gcrm:rule_384` - 384.)
- *binds* - output-document: certified copy - endorsement of the cause of delay
- *test* - A copy delivered after the due date cannot be issued without a cause-of-delay text, and the text appears on the copy.
- *related* - REQ-GJ-CPY-006

**REQ-GJ-CPY-008** · MUST · firm · from rule

The system MUST estimate the cost of a certified copy, including postage where the copy is to be sent by post, before the copying work is undertaken.

- *why* - Rules 380 and 381 require the estimate first and the deposit of the estimated cost before the work is taken on hand. Copying begun before the estimate produces work nobody has paid for, and in a busy magistrate's copy section that is how a copy application sits for weeks with the file already extracted from the record room.
- *authority* - Criminal Manual 1977, r.380 (`gcrm:rule_380` - 380. The office shall estimate the costs of the copies except the copies to)
- *authority* - Criminal Manual 1977, r.381 (`gcrm:rule_381` - 381.)
- *binds* - workflow-step: certified copy - cost estimate before copying
- *how* - The estimate covers all probable costs of the copies including postage where they are to be sent by post; an applicant not entitled to a free copy is called on to deposit the estimated cost and make up any other deficiency.
- *test* - The copy workflow produces an estimate and takes a deposit before the copying task can be started.

**REQ-GJ-CPY-009** · MUST · firm · from rule

The system MUST raise a search fee where the description of the document in a copy application is incorrect or deficient and the record has to be searched to find it.

- *why* - Rule 382 makes the fee payable per year of records searched, whether or not the document is found and whether or not the copy is granted. In a court with tens of thousands of cheque cases a search across years is real work. Note that the rate in rule 382, one rupee for each year searched, is the 1977 figure taken from an OCR of the first edition of the Manual, and the current rate must be verified against the official text and the fee tables in force.
- *authority* - Criminal Manual 1977, r.382 (`gcrm:rule_382` - 382. When the description of the documents given in the application is)
- *binds* - schema-field: certified copy application - search fee
- *test* - A copy application marked as requiring a search raises a fee computed per year searched, at a rate held as data rather than hard-coded.

**REQ-GJ-CPY-010** · MUST NOT · firm · from rule

The system MUST NOT refuse a certified copy to a person who is a stranger to the case where the application is made in accordance with the rules for the grant of certified copies.

- *why* - Clause 11.3 of the SOP preserves the stranger's entitlement alongside the access restriction in clause 11.1. A system that implements the access restriction as a blanket rule will also block the certified-copy route, and a guarantor or a subsequent endorsee of the same cheque, who has no access to the file but a real interest in the judgment, cannot obtain it at all.
- *authority* - Gujarat e-Filing SOP 2024, cl.11.3 (`gefr:rule_11` - 11. Access to the Electronic Data of the Action)
- *authority* - Gujarat e-Filing SOP 2024, cl.11.2 (`gefr:rule_11` - 11. Access to the Electronic Data of the Action)
- *binds* - access-control: certified copy application - applicant who is a stranger to the case
- *test* - A user with no association to the case can lodge a certified-copy application and receive the copy on the ordinary terms, while remaining unable to browse the case file.
- *related* - REQ-GJ-REC-018

**REQ-GJ-CPY-011** · MUST · firm · from rule

The system MUST route a complete certified-copy application to the officer designated for the level of court in which it is made.

- *why* - Rule 383 names a different officer for each court: the Registrar or Clerk of the Court in the Sessions Court, the Clerk of the Court before a Judicial Magistrate, the Sheristedar before a Metropolitan Magistrate, and a specially authorised junior clerk where no senior clerk is appointed. An application for a free copy goes instead to the presiding officer for orders. A queue that sends everything to one role either overloads it or puts the decision with someone the rule does not empower.
- *authority* - Criminal Manual 1977, r.383 (`gcrm:rule_383` - 383.)
- *binds* - access-control: certified copy application - officer competent to grant or refuse
- *how* - An application for a copy free of costs is placed before the presiding officer for orders; all others go to the officer designated for that court.
- *test* - The application queue for a case in a Judicial Magistrate's court is addressed to the Clerk of the Court, and an application for a free copy is addressed to the presiding officer.
- *related* - REQ-GJ-CPY-012

**REQ-GJ-CPY-012** · MUST · firm · from rule

The system MUST communicate a refusal of a certified-copy application, and the grounds of the refusal, to the applicant in writing.

- *why* - Rule 383 requires both the refusal and its grounds to be communicated in writing. A refusal shown only as a status change leaves the applicant with nothing to correct and nothing to challenge, and in a cheque case where the copy is needed for an appeal the time lost is time out of the appeal period.
- *authority* - Criminal Manual 1977, r.383 (`gcrm:rule_383` - 383.)
- *binds* - output-document: certified copy application - written refusal with grounds
- *test* - The refuse action is unavailable until a grounds text is entered; the applicant's record then shows a written refusal document carrying that text, with the date it was despatched and the channel it went by.
- *related* - REQ-GJ-CPY-011

### Haryana - added by its own instruments (84)

Haryana has not amended section 138 of the Negotiable Instruments Act, so nothing here restates the offence, the notice period, the presumptions, limitation or compounding. What is here is what the Punjab and Haryana High Court's own instruments require on top of central law, or where one of them tightens a national obligation: Rules and Orders Volume III (Instructions to Criminal Courts), the Electronic Filing Rules, the Rules for Video Conferencing for Courts, the e-filing 3.0 changeover circular, the High Court's Court Fee Table, and the Haryana Police Act, 2007. Volume III is pre-2024 and speaks in the Code of Criminal Procedure numbering; where that matters the live Sanhita provision is cited beside it so the code-switch is visible. Categories NOT (the statutory demand notice) and PRE (presumptions and burden of proof) are deliberately empty: no Haryana instrument in this corpus touches either, and everything on them belongs in the national file.

#### LIM - limitation, cause of action, computation of time (7)

**REQ-HR-LIM-001** · MUST · firm · from rule

The system MUST fix the date of an e-filed complaint as the date the Action was electronically received in the Registry of the Punjab and Haryana court within the prescribed time on a working day, reckoned in Indian Standard Time.

- *why* - A cheque complaint dies on a day. If the portal stamps a filing with the advocate's local device clock, or with the date the Registry later opened it, a NACT complaint received at 23:50 IST on the last day of the one-month window under section 142(1)(b) will be recorded as filed the next day and rejected as time-barred, and a complaint received after the window will look in time. The Electronic Filing Rules fix one clock and one moment of receipt for the whole High Court jurisdiction.
- *authority* - P&H HC E-Filing Rules r.15.1 (Computation of Time) (`phef:rule_15` - 15. Computation of Time)
- *authority* - NI Act §142(1)(b) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - schema-field: complaint record - date of e-filing, stamped on receipt in the Registry
- *how* - The timestamp is the Registry's receipt time in Indian Standard Time, not the filer's device time and not the date of scrutiny or acceptance.
- *test* - Submit an Action from a client whose clock is set to a different timezone; the stored filing date is the Registry receipt date in IST, and it does not change when the Registry later accepts or objects to the filing.
- *tightens* - REQ-LIM-007

**REQ-HR-LIM-002** · MUST · firm · from rule

The system MUST date an online e-filing carried out after 2400 hours as the day that follows the actual filing date, provided that following day is a court working day.

- *why* - Advocates file cheque complaints late at night on the last day of limitation. A system that simply stores the wall-clock date will treat a filing made at 00:20 as belonging to the day that has just begun, which is the day the Electronic Filing Rules also assign to it, but will get the working-day proviso wrong: if the following day is not a court working day the roll-forward has to continue. Getting that wrong by one day is the whole case.
- *authority* - P&H HC E-Filing Rules r.15.2 (Computation of Time) (`phef:rule_15` - 15. Computation of Time)
- *binds* - validation-rule: e-filing date roll-forward across midnight
- *how* - The rule states the roll-forward and its working-day condition; the court calendar published under E-Filing Rules r.3.22 supplies the working days.
- *test* - File at 00:20 IST on a court working day and the recorded date is that day; file at 00:20 on a day that is not a court working day and the date rolls to the next working day.
- *related* - REQ-HR-LIM-001

**REQ-HR-LIM-003** · MUST · firm · from rule

The system MUST date an Action filed on a gazetted holiday, or on a day the Punjab and Haryana court is closed, as filed on the next working day.

- *why* - The e-filing portal is open twenty four hours. A payee who files a cheque complaint on a gazetted holiday because the one-month window expires that day gains nothing: the filing is dated to the next working day. A system that records the holiday date as the institution date will show the complaint as in time when the court will treat it as filed later, and no delay-condonation application will have been prepared.
- *authority* - P&H HC E-Filing Rules r.15.2 (Computation of Time) (`phef:rule_15` - 15. Computation of Time)
- *binds* - validation-rule: e-filing date on a gazetted holiday or court-closed day
- *how* - The next working day is taken from the calendar published for the court, or as directed by the court, under E-Filing Rules r.3.22.
- *test* - Submit an Action on a listed gazetted holiday; the stored institution date is the next working day and the filer is shown that date before submitting.
- *related* - REQ-HR-LIM-001

**REQ-HR-LIM-004** · MUST NOT · firm · from rule

The system MUST NOT accept an e-filing at a Designated Counter after 1600 hours on a court working day.

- *why* - The counter route is the fallback a Panchkula advocate uses when the portal is down or the file is too large. It closes at four in the afternoon, two and a half hours before the portal's own midnight cut-off. A filer who is told at 1700 that the counter can still take a cheque complaint on the last day of limitation has been told something the rules do not allow, and the complaint will not be received that day at all.
- *authority* - P&H HC E-Filing Rules r.15.2 (Computation of Time) (`phef:rule_15` - 15. Computation of Time)
- *authority* - P&H HC E-Filing Rules r.4.3 (Designated Counters) (`phef:rule_4` - 4. General Instructions)
- *binds* - validation-rule: Designated Counter e-filing cut-off
- *test* - The counter intake screen refuses a new Action after 1600 hours on a court working day and states the cut-off; the online portal remains open until 2400 hours on the same day.
- *related* - REQ-HR-LIM-001

**REQ-HR-LIM-005** · MUST NOT · firm · from rule

The system MUST NOT offer or record failure of the web-based e-filing facility as a ground of exemption from limitation.

- *why* - The Electronic Filing Rules say in terms that no exemption from limitation is permitted on the ground that the online facility failed, and direct the filer to a Designated Counter or to physical filing instead. A cheque complainant who is allowed to log a portal outage as a reason for filing late will present that reason to the magistrate, who cannot accept it, and will have spent the last day of the one-month window logging a defence instead of walking the file to the counter.
- *authority* - P&H HC E-Filing Rules r.15.3 (Computation of Time) (`phef:rule_15` - 15. Computation of Time)
- *authority* - NI Act §142(1)(b) proviso (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - screen: delay-condonation reasons offered to an e-filer
- *how* - Where the portal is unavailable the system directs the filer to a Designated Counter during working hours on a court working day, or to physical filing, rather than to a condonation application.
- *test* - The delay-condonation reason list contains no portal-failure option; simulating a portal outage produces a prompt to use the counter or physical filing, not an offer to record an exemption.
- *tightens* - REQ-LIM-008
- *related* - REQ-HR-LIM-001, REQ-HR-FIL-015

**REQ-HR-LIM-006** · MUST · firm · from rule

The system MUST take the institution date of a complaint filed in a Haryana district court between 15 and 22 February 2024 from the physical filing endorsement, not from any electronic filing record.

- *why* - For those eight days the Registrar General shut e-filing of fresh cases across the district judiciary of Punjab, Haryana and U.T. Chandigarh and directed that cases be filed only in physical mode. A cheque complaint instituted in that window exists on paper. A system that reconstructs its institution date from the portal will find nothing, or will find the later date on which the file was keyed into the new software, and will mis-state limitation for every NACT case filed in that week.
- *authority* - e-filing 3.0 circular (12 February 2024), direction (ii) (`ef30:para_2` - (ii) Physical filing only during the changeover)
- *authority* - R&O Vol.III r.1-B.3 (Complaints how to be dealt with) (`phhc3:rule_1-B.3` - 1-B.3 Complaints how to be dealt with)
- *binds* - schema-field: complaint record - institution date provenance for the February 2024 changeover window
- *how* - The endorsement of the date of presentation made on the complaint under Volume III r.1-B.3 is the source of the date.
- *test* - A case whose institution date falls between 15 and 22 February 2024 carries a provenance value of physical endorsement; the system refuses to derive that date from an electronic filing record.
- *related* - REQ-HR-FIL-001, REQ-HR-FIL-018, REQ-HR-LIM-007

**REQ-HR-LIM-007** · MUST NOT · inferred · from rule

The system MUST NOT take the date of institution of a cheque complaint from the e-filing portal's own case history where that complaint was left in the Drafts, Not Accepted, New Filing, Re-Filing or Transfer to Section stage at the February 2024 migration to e-filing 3.0.

- *why* - The circular says that anything in those stages was not migrated, that the data and the history were erased, and that this led to 'loss of exemption of limitation and delay of days also'. A cheque complaint that had been e-filed, objected to and was awaiting re-filing lost the record of when it first reached the Registry. Reading the surviving portal history as the institution date will date those complaints to the day they were re-filed, months after the one-month window closed. The circular states the erasure; that the residue is therefore not evidence of the institution date is a reading of it rather than a line in it, and it does not touch a case that had already been assigned a CNR number.
- *authority* - e-filing 3.0 circular (12 February 2024), direction (iii) (`ef30:para_3` - (iii) Clearing pending requests before migration)
- *authority* - NI Act §142(1)(b) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - validation-rule: provenance of the institution date for pre-migration e-filings
- *test* - A case whose e-filing record begins before 23 February 2024 and shows a re-filing after it is marked as having no reliable electronic institution date; the institution date on such a case can be saved only against a paper endorsement or an order of the court, and the portal history is refused as its source.
- *related* - REQ-HR-LIM-006

#### FIL - filing, court fee, scrutiny, numbering (19)

**REQ-HR-FIL-001** · MUST · inferred · from rule

The system MUST endorse the date of presentation on the complaint itself immediately upon its institution.

- *why* - Volume III fixes the date at presentation, on the face of the complaint, and requires the endorsement to be made immediately. In a Panchkula court the file is given a filing number at the window and the reader then raises objections on court fee and condonation before the case is registered at all. An endorsement made later, or reconstructed from whatever the office did next, is not the date the rule fixes, and in a cheque case that date is the one the one-month window under section 142(1)(b) is measured against.
- *authority* - R&O Vol.III r.1-B.3 (Complaints how to be dealt with) (`phhc3:rule_1-B.3` - 1-B.3 Complaints how to be dealt with)
- *authority* - NI Act §142(1)(b) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - schema-field: complaint record - date of presentation, distinct from date of registration
- *how* - Volume III r.1-B.3 requires the date to be endorsed on the complaint itself upon institution, so the endorsement is made at the moment of presentation and is not derived later.
- *test* - Recording a complaint as presented writes the endorsement to the complaint document itself with that day's date; the endorsement cannot be created retrospectively and cannot be edited once made.
- *tightens* - REQ-JUR-006
- *related* - REQ-HR-FIL-002, REQ-HR-FIL-018, REQ-HR-LIM-006

**REQ-HR-FIL-002** · MUST · inferred · from rule

The system MUST record, as part of the endorsement made at presentation, the name of the magistrate to whom the complaint is sent for inquiry or trial.

- *why* - Volume III makes the destination magistrate part of the endorsement made when a complaint is received, because the complainant is then directed to appear before that magistrate the same day or one of the following days for examination. A cheque file that leaves the Panchkula filing window carrying a filing number but no named magistrate leaves the complainant with no date and no court to attend, and the examination of the complainant that turns the complaint into a case does not happen.
- *authority* - R&O Vol.III r.1-B.3 (Complaints how to be dealt with) (`phhc3:rule_1-B.3` - 1-B.3 Complaints how to be dealt with)
- *authority* - R&O Vol.III r.1-B.4 (Oral examination of complainant) (`phhc3:rule_1-B.4` - 1-B.4 Oral examination of complainant and preliminary inquiry. preli-)
- *binds* - schema-field: complaint record - magistrate to whom the case is sent for inquiry or trial
- *test* - A complaint cannot be marked as presented without a named destination magistrate, and the complainant's first appearance date is issued against that magistrate.
- *related* - REQ-HR-FIL-001

**REQ-HR-FIL-003** · MUST NOT · firm · from rule

The system MUST NOT record a member of the ministerial establishment as having received a complaint, petition or other document presented direct by a lawyer, his clerk or a litigant, except while the Magistrate is on leave and no other Magistrate is in charge of his current duties.

- *why* - Volume III strictly forbids the ministerial establishment from receiving complaints, petitions or other documents direct from lawyers, their clerks or litigants, and carves out one exception: the Magistrate being on leave with no other Magistrate in charge. It requires the magistrate to initial every petition and pass orders. If a section 138 case management screen lets a filing assistant or an ahlmad be recorded as the person who accepted a complaint or an exemption application, the record shows a ministerial act where the rule requires a judicial one, and every order that follows can be attacked on it.
- *authority* - R&O Vol.III r.1-A.4 (Petition box; ministerial staff not to receive petitions) (`phhc3:rule_1-A.4` - 1-A.4 Petition box)
- *binds* - access-control: who may be recorded as receiving or disposing of a complaint or petition
- *how* - Volume III r.1-A.4(a) has the magistrate initial every petition and pass orders forthwith or fix a date; r.1-A.4(b) lets him receive urgent documents personally at any time.
- *test* - A user holding a ministerial role cannot be saved as the recipient of a complaint, petition or application unless the court record carries a magistrate-on-leave arrangement for that period; otherwise only a judicial-officer role can be saved, and only a judicial-officer role can be recorded as disposing of it.
- *related* - REQ-HR-SRV-006

**REQ-HR-FIL-004** · MUST · inferred · from rule

The system MUST convert every typed document in an e-filed cheque complaint into an optical-character-recognition searchable PDF/A before it is accepted.

- *why* - PDF/A is the archival format and OCR is what makes the file findable. A cheque complaint that goes in as a flat image PDF cannot be searched for the cheque number, the notice date or the account number by the reader, the ahlmad or the judgment writer, and the judgment writer at Panchkula already loses his day retyping the facts of the complaint out of the paper file. The rule is the point at which that cost is either avoided or locked in for the life of the case.
- *authority* - P&H HC E-Filing Rules r.7.1 and r.7.2 (Formatting) (`phef:rule_7` - 7. Formatting)
- *binds* - validation-rule: e-filed complaint - document format on upload
- *how* - The Electronic Filing Rules prescribe conversion into an OCR searchable PDF/A using any PDF converter or the conversion plug-in provided in the software.
- *test* - Upload a flat image PDF of a complaint; it is rejected with a format objection. Upload an OCR-searchable PDF/A and a text search for the cheque number returns a hit.
- *related* - REQ-HR-FIL-005, REQ-HR-FIL-006

**REQ-HR-FIL-005** · MUST · inferred · from rule

The system MUST require a non-text document enclosed with the complaint to be scanned at 300 dots per inch in optical-character-recognition searchable mode.

- *why* - In a cheque case the non-text documents are the case: the cheque, the bank return memo, the postal receipts and the acknowledgement. Below 300 DPI a handwritten cheque number, a bank's dot-matrix reason code on a return memo or a postal stamp date becomes unreadable, and the court is asked to convict on a document it cannot make out. The Electronic Filing Rules set the floor.
- *authority* - P&H HC E-Filing Rules r.7.3 (Formatting) (`phef:rule_7` - 7. Formatting)
- *binds* - validation-rule: e-filed cheque, return memo and other scanned enclosures - scan resolution
- *how* - Image resolution of 300 DPI, in OCR searchable mode, saved as a PDF document.
- *test* - A scanned enclosure below 300 DPI is refused at upload with a resolution objection; the accepted file reports 300 DPI or better and carries a text layer.
- *related* - REQ-HR-FIL-004

**REQ-HR-FIL-006** · MUST · inferred · from rule

The system MUST merge the text and scanned documents of an Action into a single optical-character-recognition searchable PDF bookmarked according to the Master Index approved by the Registry.

- *why* - The Panchkula filing window takes a physical NACT file assembled in a fixed order: CIS proformas, index, memo of parties, complaint, court-fee ticket, affidavit, cheque, power of attorney, copies per respondent. The Master Index bookmark structure is the electronic form of that order. A cheque complaint uploaded as a bundle of loose PDFs with no bookmarks cannot be scrutinised in that order, and the objection loop that follows costs the complainant days against the one-month window.
- *authority* - P&H HC E-Filing Rules r.9.1 (Dos and Don'ts) (`phef:rule_9` - 9. Dos and Don'ts)
- *binds* - validation-rule: e-filed Action - single merged PDF with Master Index bookmarks
- *how* - Text documents and scanned documents are merged into one OCR searchable PDF and bookmarked as per the Master Index duly approved by the Registry.
- *test* - The upload produces one PDF whose bookmark tree matches the Master Index entries; a submission of several separate PDFs, or one without bookmarks, is rejected.
- *related* - REQ-HR-FIL-004

**REQ-HR-FIL-007** · MUST · firm · from rule

The system MUST reject an e-filed document whose file name exceeds 45 characters including spaces, or contains any character on the prohibited list in the Electronic Filing Rules.

- *why* - This is the commonest silent rejection at the Punjab and Haryana portal. Advocates name a cheque file after the parties and the instrument, so a name like 'M/s ABC & Co. vs Sharma - cheque no. 123456 (100%).pdf' contains an ampersand, a percent sign and a period in the middle, and is over length. The filing is rejected under the protocol rule, the advocate is told only that the filing was not accepted, and the file sits in the Not Accepted folder while limitation runs.
- *authority* - P&H HC E-Filing Rules r.9.6 (Document Binary File Name Standards) (`phef:rule_9` - 9. Dos and Don'ts)
- *authority* - P&H HC E-Filing Rules r.19.1 (Residuary provisions) (`phef:rule_19` - 19. Residuary provisions)
- *binds* - validation-rule: e-filed document file name
- *how* - Prohibited characters are the quotation mark, number sign, per cent, ampersand, asterisk, colon, angle brackets, question mark, backslash, forward slash, braces, pipe, tilde, and the period used consecutively in the middle of a name or at its beginning or end.
- *test* - Attempt to upload a file named with each prohibited character and with a 46-character name; each is refused before submission with the offending character or the length named in the message.
- *related* - REQ-HR-FIL-012

**REQ-HR-FIL-008** · MUST NOT · firm · from rule

The system MUST NOT accept an e-filing that is watermarked or encrypted, or that carries markings, track changes or annotations.

- *why* - Cheque complaints are drafted from templates and carry the drafter's tracked changes and comment bubbles, and scanning software stamps its own watermark. The Electronic Filing Rules bar all of it, and an encrypted PDF also defeats the Registry's own storage and retrieval. If the system accepts such a file the complaint is on record with a visible track change against the cheque amount or the notice date, which the accused will put to the complainant in cross-examination.
- *authority* - P&H HC E-Filing Rules r.9.7 (Dos and Don'ts) (`phef:rule_9` - 9. Dos and Don'ts)
- *binds* - validation-rule: e-filed document - watermark, encryption, track changes and annotations
- *test* - Upload a password-protected PDF, a watermarked PDF and a PDF with an accepted-changes-pending revision layer or PDF annotations; each is refused with the specific defect named.
- *related* - REQ-HR-FIL-004

**REQ-HR-FIL-009** · MUST · firm · from rule

The system MUST require the e-filed complaint PDF to carry the digital signature of the party or of the advocate at the places prescribed by the Rules and Orders.

- *why* - The Panchkula filing window checks a physical NACT file page by page for attestation before it takes it. The digital signature is the electronic form of that check. An unsigned cheque complaint that reaches the ahlmad has no authenticated author, and the accused can put the authority of the person who filed it in issue at the very point where a bank or non-banking financial company complainant is acting through an authorised representative.
- *authority* - P&H HC E-Filing Rules r.8.1 (Digital Signatures) (`phef:rule_8` - 8. Digital Signatures)
- *authority* - P&H HC E-Filing Rules r.19.1 (Residuary provisions) (`phef:rule_19` - 19. Residuary provisions)
- *binds* - validation-rule: e-filed complaint - digital signature of the party or advocate
- *how* - The signature is appended on the PDF at the places prescribed under the extant rules; the list of recognised digital signature providers and the procedure for appending single or multiple signatures are set out in Appendix IV to the Rules.
- *test* - A PDF carrying no digital signature cannot be submitted, and the position of the signature block is validated against the prescribed places before the filing is accepted.
- *tightens* - REQ-FIL-001
- *related* - REQ-HR-FIL-010

**REQ-HR-FIL-010** · MUST · firm · from rule

The system MUST provide a filer who holds no digital signature with the print, physically sign, scan and upload route, or with e-Sign based on Aadhaar authentication.

- *why* - A payee filing a cheque complaint in person, and many advocates outside the district headquarters, hold no digital signature certificate. If the portal has no fallback, the only remaining route is the counter, and a complainant who reaches the counter after 1600 hours on the last day of the one-month window loses the case on limitation rather than on merits. The Electronic Filing Rules provide two fallbacks precisely so that the absence of a token is not a bar to filing.
- *authority* - P&H HC E-Filing Rules r.8.1 and r.8.3 (Digital Signatures) (`phef:rule_8` - 8. Digital Signatures)
- *authority* - IT Act §5 (electronic signature) (`itact:sec_5` - 5. Legal recognition of 1[electronic signatures]) [open](#law?act=itact&eid=sec_5)
- *binds* - workflow-step: authentication of an e-filing where the filer holds no digital signature certificate
- *how* - Either a printout of the Action physically signed by the party or advocate in accordance with the rules, then scanned and uploaded; or authentication by e-Sign based on Aadhaar authentication.
- *test* - A user account with no registered digital signature certificate can still complete a filing through the print-sign-scan path and through e-Sign, and the completed filing records which route was used.
- *related* - REQ-HR-FIL-009

**REQ-HR-FIL-011** · MUST · firm · from rule

The system MUST capture the court-fee transaction ID at the time of e-filing, in the field provided for it.

- *why* - The Rs.10 ticket on a complaint to a criminal court is the smallest sum in the case and the commonest objection raised on it at Panchkula, where the reader raises court fee and condonation on the file before it is registered. The Electronic Filing Rules make the transaction ID a field to be filled at the moment of filing, not afterwards. A cheque complaint submitted without it goes into the objection loop, and the days it spends there run against the one-month window.
- *authority* - P&H HC E-Filing Rules r.10 (Payment of Court Fees and Other Charges) (`phef:rule_10` - 10. Payment of Court Fees/Other Charges)
- *binds* - schema-field: e-filed complaint - court fee transaction ID
- *how* - The fee may be paid electronically through the authorised agency, at a Designated Counter, or from an authorised court-fee vendor; the transaction ID that payment produces is entered in the appropriate field at the time of on-line e-filing.
- *test* - The submit action is blocked until a transaction ID is present, and the stored ID is the one issued by the payment route selected.
- *related* - REQ-HR-FIL-017

**REQ-HR-FIL-012** · MUST · firm · from rule

The system MUST communicate every Registry objection on an e-filed case to the advocate or litigant in person by e-mail, SMS or web hosting.

- *why* - At Panchkula the defect loop at the physical counter happens face to face, and an advocate is told verbally to attach a delay-condonation application. Electronically there is no counter. If objections sit unread in a portal folder, a cheque complaint under objection is a complaint not moving towards cognizance, and the February 2024 migration showed exactly what that costs when the Not Accepted folder was erased. The rule fixes an outbound channel so the clock the filer is running against is visible to him.
- *authority* - P&H HC E-Filing Rules r.19.3 (Residuary provisions) (`phef:rule_19` - 19. Residuary provisions)
- *authority* - e-filing 3.0 circular (12 February 2024), direction (iii) (`ef30:para_3` - (iii) Clearing pending requests before migration)
- *binds* - workflow-step: communication of Registry objections to the filer
- *how* - By e-mail, SMS or web hosting to the concerned advocate or litigant in person, and again by e-mail or SMS when the case is processed for listing after the objections are cleared.
- *test* - Raising an objection on a case emits an e-mail or an SMS to the registered contact, or posts it to that filer's own portal view, within the same session, and the notification that went out is recorded against the case.
- *related* - REQ-HR-FIL-013

**REQ-HR-FIL-013** · MUST NOT · inferred · from rule

The system MUST NOT process an e-filed case for listing until the Registry objections on it have been cleared.

- *why* - This is the electronic form of the sequence the Panchkula ahlmad describes: the reader raises objections, they are argued out before the judge, and only then is the case registered and a main number issued. The rule states the sequence - after the objections are cleared the case will be processed for listing - rather than a bar, so the prohibition is a reading of it. If a portal lists a cheque complaint while an objection on court fee or on the absence of a delay-condonation application is still open, the magistrate is asked to take cognizance on a file the Registry has not passed, and the objection surfaces later as a ground of challenge to cognizance itself.
- *authority* - P&H HC E-Filing Rules r.19.3 (Residuary provisions) (`phef:rule_19` - 19. Residuary provisions)
- *binds* - workflow-step: listing of an e-filed case with open objections
- *test* - A case with at least one open objection cannot be added to a cause list; clearing the last objection makes it listable and notifies the filer.
- *related* - REQ-HR-FIL-012

**REQ-HR-FIL-014** · MUST · firm · from rule

The system MUST require the permission of the Administrator before the data of an Action is transferred from a litigant-in-person account to an advocate's account.

- *why* - In a district court the Administrator is the officer appointed by the District and Sessions Judge for e-filing matters, and the Panchkula filing assistants describe telephoning that office ten to fifteen times a day because only it can release an e-filed case into their queue. If the transfer of a cheque complaint between accounts can be done without that permission, the complaint can be moved out of the payee's control by anyone who has his credentials, and the litigant in person, who under the rules cannot modify the data after transfer, loses the file.
- *authority* - P&H HC E-Filing Rules r.5.2 (Steps for Registration) (`phef:rule_5` - 5. Steps for Registration)
- *authority* - P&H HC E-Filing Rules r.3.2 (definition of Administrator) (`phef:rule_3` - 3. Definitions)
- *binds* - access-control: transfer of an Action's data from a litigant-in-person account to an advocate account
- *how* - On an application by the litigant in person to the Administrator; once allowed, the litigant in person cannot modify the data of that Action without the Administrator's permission.
- *test* - A transfer request from a litigant-in-person account stays pending until an Administrator-role user allows it; after transfer the litigant-in-person account has read-only access.

**REQ-HR-FIL-015** · MUST · firm · from rule

The system MUST accept a document filed outside the e-filing channel where the Bench has allowed an application for exemption from e-filing.

- *why* - The Panchkula assistants laminate the cheque so it survives the file. A laminated, folded or damaged cheque is exactly the document the Electronic Filing Rules contemplate as one that cannot be scanned because of its size, shape or condition, and the cheque is the whole case. A portal with no exemption route forces the complainant either to file a poor scan that the accused will attack, or not to file at all.
- *authority* - P&H HC E-Filing Rules r.13 (Exemption from e-filing) (`phef:rule_13` - 13. Exemption from e-filing)
- *binds* - workflow-step: exemption from e-filing for a document that cannot be scanned, or where the portal is unavailable
- *how* - On an application to the Bench, on one of the five grounds in r.13: e-filing not feasible for reasons set out, confidentiality and privacy, the size, shape or condition of the document, inaccessibility of the portal, or just and sufficient cause.
- *test* - An exemption application records one of the five grounds and, once allowed by a judicial-officer role, permits the named document to be recorded as filed physically against the same case.
- *related* - REQ-HR-REC-001, REQ-HR-LIM-005

**REQ-HR-FIL-016** · MUST NOT · inferred · from practice-note

The system MUST NOT write any part of a cheque complaint into the registers of First Information Reports.

- *why* - Volume III makes registers No. XXIII and XXIV registers of First Information Reports received by a magistrate under the police-report route, entered by serial number of the FIR, with the presiding officer signing them monthly. A section 138 case is a complaint offence with no FIR and no police investigation, so nothing about it belongs in that stream. The rule defines what the registers are for rather than forbidding anything, so the bar is a reading of it. A cheque amount or a made-up FIR number written into that stream corrupts a register the magistrate has to certify, and hides a real missing FIR behind a false entry.
- *authority* - R&O Vol.III r.11-A.14 (registers of First Information Reports) (`phhc3:rule_11-A.14` - 11-A.14)
- *authority* - NI Act §138 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - BNSS §223 (cognizance on complaint) (`bnss:sec_223` - 223. Examination of complainant) [open](#law?act=bnss&eid=sec_223)
- *binds* - schema-field: cheque complaint record - exclusion from the police-report registers
- *test* - No cheque complaint appears in Register No. XXIII or No. XXIV; every entry in those registers is keyed to a First Information Report received under the police-report route, and a complaint case cannot be selected as the subject of one.
- *related* - REQ-HR-REC-010, REQ-HR-FIL-019

**REQ-HR-FIL-017** · MUST · inferred · from act

The system MUST hold the sums paid for the service of process by police officers separately from the court fee paid on the complaint.

- *why* - They are different moneys with different destinations. The court fee on a complaint to a criminal court is a court fee; the sums paid for service of processes by police officers are credited to the State Government under the Haryana Police Act. A cheque case pays both, and at Panchkula the talbana and stamped envelopes are received at a different desk from the fee ticket. The Act fixes where the process money goes but says nothing about how a court holds it, so holding the two apart is a reading of the two destinations rather than a line in either instrument. A system that adds them into one figure cannot answer the two questions that actually arise: has the court fee been paid so the complaint is in order, and has the process fee been paid so process can issue.
- *authority* - Haryana Police Act 2007 §84 (sums paid for the service of processes) (`hpa:sec_84` - 84.)
- *authority* - R&O Vol.III r.1-Ci.2 (process fees payable before process issues) (`phhc3:rule_1-Ci.2` - 1-Ci.2 Discretion of Magistrate to issue summons or warrants)
- *binds* - schema-field: case fee record - court fee and process fee held as separate heads
- *test* - The fee record shows court fee and process fee as separate amounts with separate payment references; issuing process checks only the process fee, and scrutiny of the complaint checks only the court fee.
- *related* - REQ-HR-FIL-011

**REQ-HR-FIL-018** · MUST · inferred · from rule

The system MUST hold the endorsed date of presentation of a complaint as a field distinct from the date on which the case is registered and numbered.

- *why* - Volume III fixes the date on the face of the complaint at presentation and says nothing about the date the case is later registered; that the two must be held apart is a reading of the rule against the way a file actually moves. In a Panchkula court the file is given a filing number at the window, the reader then raises objections on court fee and condonation, those are argued before the judge, and only after they are removed does the ahlmad register the case in CIS and the main case number issue. Weeks can pass. A system that carries only the registration date will show a cheque complaint presented inside the one-month window as instituted after it, and the payee will be arguing condonation for a delay that never happened.
- *authority* - R&O Vol.III r.1-B.3 (Complaints how to be dealt with) (`phhc3:rule_1-B.3` - 1-B.3 Complaints how to be dealt with)
- *authority* - NI Act §142(1)(b) (`ni:sec_142` - 142. Cognizance of offences) [open](#law?act=ni&eid=sec_142)
- *binds* - schema-field: complaint record - date of presentation held apart from date of registration
- *test* - Two distinct date fields exist on the complaint record, date of presentation and date of registration; limitation is computed from the presentation date, and registering the case leaves the presentation date untouched.
- *related* - REQ-HR-FIL-001, REQ-HR-LIM-006

**REQ-HR-FIL-019** · MUST NOT · inferred · from practice-note

The system MUST NOT require an FIR number on a cheque complaint.

- *why* - A section 138 case is a complaint offence with no FIR and no police investigation, but the shared criminal template carries an FIR field, and the Panchkula ahlmad types the cheque amount into it because there is no cheque-amount column, calling it 'our own innovation, which is wrong'. Volume III attaches the First Information Report to the police-report route and to the registers kept for it; nothing in it asks for an FIR on a complaint case, so the bar is a reading of the rule rather than a line in it. A mandatory FIR field on a cheque complaint forces the operator to invent a value, and the invented value travels with the case.
- *authority* - R&O Vol.III r.11-A.14 (registers of First Information Reports) (`phhc3:rule_11-A.14` - 11-A.14)
- *authority* - NI Act §138 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *authority* - BNSS §223 (cognizance on complaint) (`bnss:sec_223` - 223. Examination of complainant) [open](#law?act=bnss&eid=sec_223)
- *binds* - schema-field: cheque complaint record - FIR number field
- *test* - A cheque complaint saves and passes scrutiny with the FIR number empty; a cheque-amount field exists on the case record, so no user has a reason to put the cheque amount in the FIR field.
- *related* - REQ-HR-FIL-016

#### SRV - service of summons and process (9)

**REQ-HR-SRV-002** · MUST · inferred · from rule

The system MUST run and surface a clock from the date a process fee becomes payable in a cheque case, because default in paying it within a reasonable time exposes the complaint to dismissal.

- *why* - This is the rule that bites hardest on a cheque complainant and the one nobody watches. Volume III lets the magistrate dismiss the complaint on default of payment of process fees within a reasonable time. A payee whose complaint survived scrutiny, cognizance and the examination of the complainant can lose it because a talbana of a few hundred rupees was never paid, and the dismissal comes without a hearing on the cheque at all. The rule confers the power to dismiss and says nothing about running a clock; the clock is what makes a reasonable time visible to the people it can cost, and is a reading of the rule rather than a line in it.
- *authority* - R&O Vol.III r.1-Ci.2 (dismissal for default in payment of process fees) (`phhc3:rule_1-Ci.2` - 1-Ci.2 Discretion of Magistrate to issue summons or warrants)
- *authority* - BNSS §226 (dismissal of complaint) (`bnss:sec_226` - 226. Dismissal of complaint) [open](#law?act=bnss&eid=sec_226)
- *binds* - schema-field: case record - date the process fee became payable, and days elapsed unpaid
- *test* - The case record stores the date the fee became payable and displays the days elapsed; the case appears in a list of complaints with process fee outstanding, visible to the court and to the complainant's advocate.
- *tightens* - REQ-FIL-004

**REQ-HR-SRV-003** · MUST · inferred · from rule

The system MUST allow a magistrate to record the issue of an e-summons, as an alternative to a paper summons, in the first instance.

- *why* - Volume III was amended in November 2018 to put the e-summons on the same footing as the summons, in the magistrate's discretion. In a cheque case the accused is often out of station and the ordinary summons comes back unserved through the police for months. If the process-generation screen offers only the paper summons, the discretion the rule confers does not exist in practice, and the case joins the ladder of bailable warrant, non-bailable warrant, proclamation and attachment that the Panchkula ahlmad describes as the normal fate of an unserved cheque summons.
- *authority* - R&O Vol.III r.1-Ci.2 (summons or e-summons in the magistrate's discretion) (`phhc3:rule_1-Ci.2` - 1-Ci.2 Discretion of Magistrate to issue summons or warrants)
- *authority* - NI Act §144 (mode of service of summons) (`ni:sec_144` - 144. Mode of service of summons) [open](#law?act=ni&eid=sec_144)
- *authority* - BNSS §227 (issue of process) (`bnss:sec_227` - 227. Issue of process) [open](#law?act=bnss&eid=sec_227)
- *binds* - workflow-step: process generation - e-summons offered alongside paper summons in the first instance
- *test* - The process list for a cheque case offers e-summons at the first issue of process; selecting it records the process type as e-summons on the case record and on the process itself.
- *related* - REQ-HR-SRV-004

**REQ-HR-SRV-004** · MUST · firm · from rule

The system MUST require the magistrate's recorded reasons before a warrant issues in a cheque case, in which the law provides for a summons in the first instance.

- *why* - A s.138 case is a summons case. Volume III lets a warrant issue instead of a summons only after the magistrate has recorded his reasons for doing so. If the process screen lets a bailable or non-bailable warrant be generated against a drawer with a single click and no reasons field, the first coercive step against a person accused of a bailable, compoundable, fine-carrying offence is taken without the record the rule demands, and it is the step that most often ends with the drawer in custody.
- *authority* - R&O Vol.III r.1-Ci.2 (reasons before a warrant in lieu of a summons) (`phhc3:rule_1-Ci.2` - 1-Ci.2 Discretion of Magistrate to issue summons or warrants)
- *authority* - R&O Vol.III r.1-Ci.3 (warrant should not issue unless absolutely necessary) (`phhc3:rule_1-Ci.3` - 1-Ci.3 Warrant should not issue unless absolutely necessary)
- *authority* - BNSS §90 (warrant in lieu of summons) (`bnss:sec_90` - 90. Issue of warrant in lieu of, or in addition to, summons) [open](#law?act=bnss&eid=sec_90)
- *binds* - validation-rule: generation of a warrant in a summons case
- *how* - The reasons are recorded before the warrant issues, and are held against that warrant on the case record.
- *test* - The warrant-generation action in a case classified as a summons case cannot complete with an empty reasons field, and the recorded reasons appear on the case record against the warrant.
- *tightens* - REQ-SRV-016
- *related* - REQ-HR-SRV-003

**REQ-HR-SRV-005** · MUST · inferred · from rule

The system MUST issue a receipt for talbana and stamped postal envelopes filed by a litigant, whether or not a receipt is demanded.

- *why* - Volume III says the receipt is given whether demanded or not, because these are the only things a litigant hands directly to the court's staff rather than to the magistrate, and there is otherwise no trace of them. In a cheque case the talbana is what makes process issue, and default in paying it can get the complaint dismissed. A payee who has paid and holds no receipt cannot answer the objection, and cannot show the court that the process fee the record shows as outstanding was in fact paid.
- *authority* - R&O Vol.III r.1-A.4(d) (talbana and stamped envelopes received against a receipt) (`phhc3:rule_1-A.4` - 1-A.4 Petition box)
- *binds* - output-document: receipt for talbana and stamped postal envelopes
- *how* - The receipt is given whether or not it is demanded, so the system emits it on recording the receipt rather than on request.
- *test* - Recording talbana or stamped envelopes against a case produces a receipt document without any further user action, and the receipt is retrievable from the case record afterwards.
- *related* - REQ-HR-SRV-006, REQ-HR-SRV-002

**REQ-HR-SRV-006** · MUST NOT · firm · from rule

The system MUST NOT permit any member of the ministerial establishment other than the Ahlmad or the Moharrir to record the receipt of talbana or stamped postal envelopes.

- *why* - Volume III carves talbana and stamped envelopes out of the general bar on ministerial staff receiving documents, and names the two offices that may take them. The carve-out is narrow on purpose: it is money and postage handed over a counter with no judicial officer present. If any user with a clerical role can record their receipt, the control the rule creates is gone, and the receipt trail on a cheque case leads to nobody in particular.
- *authority* - R&O Vol.III r.1-A.4(c) and (d) (who may receive talbana and stamped envelopes) (`phhc3:rule_1-A.4` - 1-A.4 Petition box)
- *binds* - access-control: recording receipt of talbana and stamped postal envelopes
- *test* - Only users holding the Ahlmad or Moharrir role can save a talbana or envelope receipt; other ministerial roles are refused, and the saved receipt names the officer who took it.
- *related* - REQ-HR-SRV-005, REQ-HR-FIL-003

**REQ-HR-SRV-007** · MUST · inferred · from act

The system MUST record, against every process issued for service through the police, the police station to which it was sent, selected from the police stations constituted by notification under the Haryana Police Act.

- *why* - A cheque case reaches the police only when the court issues process. The Haryana Police Act creates a police station only by notification in the Official Gazette and puts a Station House Officer not below the rank of Sub-Inspector at the head of each one, so a station is a named office with an officer answerable for it. The Panchkula ahlmad's account is that process sent outside the district comes back on paper, nothing appears in the case management system, and for around ninety per cent of it there is no certainty of service until the person turns up. A destination held as free text names nobody. The Act says what a police station is; that the court's process record should name a constituted one is a reading of it and not a line in it.
- *authority* - Haryana Police Act 2007 §12 (police stations and the Station House Officer) (`hpa:sec_12` - 12. Police Stations)
- *authority* - BNSS §64 (summons served by a police officer) (`bnss:sec_64` - 64. Summons how served) [open](#law?act=bnss&eid=sec_64)
- *binds* - schema-field: process record - destination police station
- *test* - The destination of a process for police service is chosen from the list of police stations constituted under Haryana Police Act §12 and cannot be saved as free text; processes outstanding against a station can be listed by station and by the officer in charge of it.
- *related* - REQ-HR-FIL-017

**REQ-HR-SRV-008** · MUST · firm · from rule

The system MUST state on a summons to a witness who is to be examined by video conferencing the date, time and venue of the Remote Point at which he is to attend.

- *why* - The witness a cheque case needs from a distance is the bank official who proves the return memo. A summons that names only the trial court sends him to the wrong building on the right day, the examination does not happen, and the case is adjourned in a trial that section 143 of the NI Act requires to be summary. The Video Conferencing Rules fix the Remote Point, not the court room, as the place named in that summons.
- *authority* - P&H HC Video Conferencing Rules r.7 (Service of Summons) (`phvc:rule_7` - 7. Service of Summons)
- *authority* - R&O Vol.III r.1-BB.1 (video conferencing in criminal matters) (`phhc3:rule_1-BB.1` - 1-BB.1)
- *authority* - BNSS §71 (summons to witness) (`bnss:sec_71` - 71. Service of summons on witness) [open](#law?act=bnss&eid=sec_71)
- *binds* - output-document: summons to a witness to be examined by video conferencing
- *how* - The summons carries the date, time and venue of the concerned Remote Point, not those of the court room.
- *test* - Generating a witness summons for a video-conferenced examination requires a Remote Point with a date and a time, and all three print on the summons; the ordinary summons template cannot be used for it.
- *tightens* - REQ-SRV-003
- *related* - REQ-HR-SRV-009, REQ-HR-SRV-010, REQ-HR-EVI-007

**REQ-HR-SRV-009** · MUST · firm · from rule

The system MUST attach a duly certified photocopy of the document to the summons where a person is to be examined by video conferencing with reference to that document.

- *why* - In a cheque case the person examined remotely is examined about the cheque and the return memo and about nothing else. If the summons goes out bare, the witness arrives at the Remote Point with no document in front of him, the court is reduced to holding the original up to a camera, and the deposition is worthless on the one thing it was called to prove.
- *authority* - P&H HC Video Conferencing Rules r.8.5 (Examination of persons) (`phvc:rule_8` - 8. Examination of persons)
- *binds* - output-document: summons to a witness examined on a document by video conferencing
- *how* - A duly certified photocopy accompanies the summons; the original is separately exhibited at the Court Point.
- *test* - Selecting documents for a video-conferenced examination attaches certified copies to the generated summons, and the summons cannot be issued with documents selected but unattached.
- *related* - REQ-HR-EVI-008

**REQ-HR-SRV-010** · MUST · firm · from rule

The system MUST direct a witness who is to be examined by video conferencing to attend the Remote Point in person with proof of identity or an affidavit to that effect.

- *why* - The Video Conferencing Rules require identity to be established before the examination begins, so a summons that omits the direction produces a witness who has travelled to the Remote Point and cannot be examined there. In a cheque case that witness is typically the bank official who proves the return memo, and losing the date costs an adjournment in a trial section 143 of the NI Act requires to be summary.
- *authority* - P&H HC Video Conferencing Rules r.7 (Service of Summons) (`phvc:rule_7` - 7. Service of Summons)
- *authority* - P&H HC Video Conferencing Rules r.8.1 (proof of identity before examination) (`phvc:rule_8` - 8. Examination of persons)
- *binds* - output-document: summons to a witness examined by video conferencing - direction to attend with proof of identity
- *how* - The direction is to attend in person with an identity document issued or recognised by the Government of India, a State Government or a Union Territory, or in its absence an affidavit to that effect.
- *test* - The witness summons generated for a video-conferenced examination prints the direction to attend in person with proof of identity, and the direction cannot be removed from the template.
- *related* - REQ-HR-SRV-008, REQ-HR-TRL-009

#### EVI - evidence, affidavits, documents (10)

**REQ-HR-EVI-001** · SHOULD · firm · from rule

The system SHOULD capture the deposition of a witness in a cheque case in typed form, prepared on a computer from the dictation of the presiding officer.

- *why* - Volume III was amended to require exactly this, and the Panchkula ahlmad says evidence in his court is still written out by hand, which produces mixed hands and stretches nobody can read. The judgment writer then has to reconstruct from that record which document the complainant tendered and under which exhibit number, and a wrong exhibit number in a s.138 judgment cannot be repaired once the judgment is signed. An illegible deposition is also the record the appellate court will read.
- *authority* - R&O Vol.III r.1-E.3(ii)(a) (procedure for recording evidence) (`phhc3:rule_1-E.3` - 1-E.3)
- *authority* - R&O Vol.III r.1-E.11 (illegible record) (`phhc3:rule_1-E.11` - 1-E.11 Illegible record)
- *binds* - workflow-step: recording of a witness deposition
- *how* - The record is prepared on a computer in court on the dictation of the presiding officer; where the deposition is in a language other than English or the language of the State it is simultaneously translated into English, and recorded in both.
- *test* - The deposition screen produces a typed, searchable record attributed to the presiding officer's dictation; a scanned handwritten page is accepted only with a recorded reason.
- *related* - REQ-HR-CPY-001

**REQ-HR-EVI-002** · MUST · firm · from rule

The system MUST form the exhibit number of a document from its own serial number and the number of the witness through whom it was first introduced, in the form Exhibit P-1/PW1.

- *why* - Volume III adopted this composite identifier in December 2021 so that an exhibit can be traced back to the witness who proved it without reading the whole record. In a cheque case the exhibits are few and decisive, and the whole defence often turns on whether the return memo was introduced through the complainant or through a bank witness. A bare Exhibit P-3 loses that link, and the judgment writer who is hunting the file for what the complainant tendered and under which exhibit number has nothing to find it by.
- *authority* - R&O Vol.III r.1-E.3(iv)(a) to (c) (exhibiting of material objects and evidence) (`phhc3:rule_1-E.3` - 1-E.3)
- *authority* - R&O Vol.III r.1-H.1(i-a)(c) (FORM C appendix of exhibits) (`phhc3:rule_1-H.1` - 1-H.1)
- *binds* - schema-field: exhibit record - composite exhibit number carrying the introducing witness
- *how* - Prosecution exhibits are marked P-1, P-2 in seriatim, defence exhibits D-1, D-2, court exhibits C-1, C-2, and material objects MO-1, MO-2; the exhibit number then shows the witness number after it, as in Exhibit P-1/PW1.
- *test* - Marking a document while a witness is under examination generates an exhibit number of the form P-n/PWn automatically; the composite number appears in the FORM C appendix of the judgment.
- *related* - REQ-HR-EVI-003

**REQ-HR-EVI-003** · MUST · firm · from rule

The system MUST mark an exhibit as '(subject to proof)' where it is exhibited without proper proof being offered at the time of marking.

- *why* - This is where cheque cases are won and lost. The return memo, the bank certificate and the postal acknowledgement are routinely put on the record through the complainant and marked before anyone proves them. Volume III requires the qualification to be carried in the marking itself. If the exhibit register shows a clean Exhibit P-2/PW1, the judgment will treat a document that was never proved as proved, and the conviction rests on it.
- *authority* - R&O Vol.III r.1-E.3(iv)(b) and (c) (exhibit marked without proper proof) (`phhc3:rule_1-E.3` - 1-E.3)
- *binds* - schema-field: exhibit record - subject-to-proof qualifier
- *how* - The qualifier is shown in brackets after the exhibit number, as Exhibit P-1/PW1 (subject to proof).
- *test* - An exhibit can be saved in a subject-to-proof state, the qualifier prints wherever the exhibit number appears, and a report lists exhibits still subject to proof at the close of evidence.
- *related* - REQ-HR-EVI-002

**REQ-HR-EVI-004** · MUST · firm · from rule

The system MUST record separately, for each witness, the date of the examination-in-chief, the date of the cross-examination and the date of the re-examination.

- *why* - Volume III requires the record of depositions to indicate all three, and requires the witness's name and number to be restated on any later date where evidence is not concluded on the day it begins. The Panchkula judgment writer's day goes on hunting the file for exactly these dates, because the FORM B tabular statement in every judgment turns on the dates of commencement and closing of evidence. Where the dates are not recorded per stage, they have to be reconstructed from the order sheet, and a reconstructed date that is wrong is in the judgment for good.
- *authority* - R&O Vol.III r.1-E.3(iii)(c) and (f) (format of recording evidence) (`phhc3:rule_1-E.3` - 1-E.3)
- *authority* - R&O Vol.III r.1-H.1(i-a)(b) (FORM B tabular statement) (`phhc3:rule_1-H.1` - 1-H.1)
- *binds* - schema-field: deposition record - dates of examination-in-chief, cross-examination and re-examination
- *test* - Each deposition stores three separately populated date fields; the FORM B statement in the judgment is generated from them and not typed by hand.
- *related* - REQ-HR-EVI-005

**REQ-HR-EVI-005** · MUST · inferred · from rule

The system MUST record, where a witness in a cheque case is not cross-examined, that the accused did not wish to cross-examine him.

- *why* - Volume III requires this in terms, and it is the commonest silence in a s.138 file: the complainant deposes on affidavit, the accused's counsel says nothing, and the record shows only that no cross-examination was taken. On appeal that reads as a denial of the opportunity to cross-examine, which is one of the two grounds Volume III says applicants for revision urge most often. The affirmative entry is what closes it.
- *authority* - R&O Vol.III r.1-E.10 (cross-examination to be distinguished; record to show that the accused did not wish to cross-examine) (`phhc3:rule_1-E.10` - 1-E.10)
- *authority* - NI Act §145 (evidence on affidavit) (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *binds* - validation-rule: deposition record - absence of cross-examination
- *test* - A deposition with no cross-examination cannot be closed without an explicit entry that the accused did not wish to cross-examine, or that a further opportunity was refused for recorded reasons.
- *related* - REQ-HR-EVI-004

**REQ-HR-EVI-006** · MUST · firm · from rule

The system MUST record, for every objection taken to the admissibility of evidence, the particular piece of evidence objected to, the objection, and the decision on it.

- *why* - Volume III requires the magistrate to decide an admissibility objection forthwith and to record all three elements clearly, and the 2021 amendment repeats it for objections during a deposition. In a cheque case the objections are to the bank certificate, to a photocopy of the cheque and to the mode of proof of the return memo. If the record shows only that an objection was taken, the appellate court cannot tell what was objected to or what was decided, and the exhibit stands or falls on nothing.
- *authority* - R&O Vol.III r.1-E.1 (only relevant evidence should be recorded) (`phhc3:rule_1-E.1` - 1-E.1 Only relevant evidence should be recorded)
- *authority* - R&O Vol.III r.1-E.3(iii)(e) (objections to be noted and decided) (`phhc3:rule_1-E.3` - 1-E.3)
- *binds* - schema-field: objection record - evidence objected to, the objection and the ruling
- *how* - The objection is decided immediately in accordance with law or, at the judge's discretion, at the end of that witness's deposition.
- *test* - An objection record cannot be saved without all three elements populated and a link to the specific exhibit or answer objected to.
- *related* - REQ-HR-EVI-003

**REQ-HR-EVI-007** · MUST · firm · from rule

The system MUST record an acknowledgement, filed with the court by the applicant, that the documents to be relied on were transmitted to a witness before he is examined by video conferencing.

- *why* - The Video Conferencing Rules require the documents to reach the witness in advance so that he acquires familiarity with them, and require the applicant to file an acknowledgement of it with the court. In a cheque case that means the cheque, the return memo and the demand notice reaching a bank official at a remote branch. Without the acknowledgement on the file the examination proceeds on documents the witness may be seeing for the first time on a screen, and the deposition on the very documents the case turns on is worth nothing.
- *authority* - P&H HC Video Conferencing Rules r.8.4 (Examination of persons) (`phvc:rule_8` - 8. Examination of persons)
- *binds* - workflow-step: pre-transmission of documents to a remotely examined witness and the acknowledgement on file
- *test* - A remote examination cannot be started until an acknowledgement of transmission is recorded against the case, listing the documents transmitted.
- *related* - REQ-HR-SRV-009, REQ-HR-EVI-008

**REQ-HR-EVI-008** · MUST · inferred · from rule

The system MUST record that the original document was exhibited at the Court Point, in accordance with the deposition of the person examined remotely.

- *why* - The Video Conferencing Rules send a certified photocopy to the Remote Point and keep the original at the Court Point, to be exhibited there as the deposition proceeds. In a cheque case the original is the cheque itself, and the Electronic Filing Rules expressly do not put a cheque in the class of instruments the Registry preserves permanently. If the record does not show the original being exhibited at the Court Point, the case has been proved on a photocopy shown down a camera and the whole of the complainant's evidence is open on that point.
- *authority* - P&H HC Video Conferencing Rules r.8.5 (original to be exhibited at the Court Point) (`phvc:rule_8` - 8. Examination of persons)
- *authority* - P&H HC Video Conferencing Rules r.9 (exhibiting documents to a witness at a Remote Point) (`phvc:rule_9` - 9.)
- *binds* - schema-field: exhibit record - original exhibited at the Court Point during a remote examination
- *how* - Where the document is at the Remote Point instead, the hard copy countersigned by the witness and the Remote Point Coordinator is dispatched to the Court Point by authorised courier or registered speed post.
- *test* - An exhibit marked during a remote deposition carries a flag showing whether the original was at the Court Point or the Remote Point, and in the latter case a dispatch record is required.
- *related* - REQ-HR-EVI-007, REQ-HR-REC-001

**REQ-HR-EVI-009** · MUST · firm · from rule

The system MUST retain an encrypted master copy of the audio-visual recording of a remotely examined person, with its hash value, as part of the record.

- *why* - The Video Conferencing Rules require the recording to be preserved and the master copy to be encrypted and carry a hash value. In a cheque case the remote deposition may be the only evidence of dishonour, and the accused's line of attack is often that the witness was prompted or was reading from a script, which the Rules also forbid. A recording held without a hash cannot answer that: it cannot be shown to be the recording that was made on the day.
- *authority* - P&H HC Video Conferencing Rules r.8.9 (Examination of persons) (`phvc:rule_8` - 8. Examination of persons)
- *authority* - P&H HC Video Conferencing Rules r.3(vi) (no unauthorised recording) (`phvc:rule_3` - 3. General Principles Governing Video Conferencing)
- *authority* - BSA §63 (admissibility of electronic records) (`bsa:sec_63` - 63. Admissibility of electronic records) [open](#law?act=bsa&eid=sec_63)
- *binds* - schema-field: case record - audio-visual master recording, its encryption and hash value
- *test* - Ending a remote examination stores a master recording, its hash value and its encryption state against the case; the hash can be recomputed and matched on retrieval.
- *related* - REQ-HR-EVI-010

**REQ-HR-EVI-010** · MUST · firm · from rule

The system MUST obtain the signature of the person examined by video conferencing on the transcript of his examination, and make the signed transcript part of the record.

- *why* - The signed transcript, not the recording, is what forms part of the judicial record under the Video Conferencing Rules. A cheque case in which a bank witness deposes over a link and the transcript is never signed has an unsigned deposition in the file, which the accused will say was never read to or accepted by the witness. The Rules also set a three-day dispatch expectation for the hard copy, so a case management system that does not track it will not notice a transcript that never came back.
- *authority* - P&H HC Video Conferencing Rules r.8.8 (signature on the transcript) (`phvc:rule_8` - 8. Examination of persons)
- *binds* - workflow-step: signature of the remotely examined person on the transcript
- *how* - Where digital signatures exist at both points, the transcript digitally signed by the presiding judge goes by official e-mail to the Remote Point, is printed and signed there, and a scanned copy signed by the Remote Point Coordinator returns by official e-mail. Where they do not, the printout is signed at the Court Point, sent in non-editable scanned form, signed by the person examined and countersigned by the Coordinator, and returned. In both routes the hard copy is dispatched, preferably within three days, by recognised courier or registered speed post.
- *test* - A remote deposition remains in an incomplete state until a signed transcript is attached, and the case shows the dispatch date and the days elapsed against the three-day expectation.
- *related* - REQ-HR-EVI-009

#### JUR - jurisdiction, cognizance, the competent court (2)

**REQ-HR-JUR-001** · MUST · firm · from rule

The system MUST disclose, on the record and on the final order in a cheque case, the criminal powers the presiding officer exercised in hearing or deciding it.

- *why* - Volume III makes every judicial officer personally responsible that the record and the final order disclose his criminal powers, and lists them from magistrate of the third class up to Sessions Judge. A s.138 judgment that names the officer but not the class of powers he exercised leaves the appellate or revisional court unable to see, from the judgment itself, whether the sentence was one the court could pass. That is a defect the judgment writer cannot repair afterwards, because no court can alter a judgment once signed.
- *authority* - R&O Vol.III r.1-H.2 (criminal powers to be noted in the record and final order) (`phhc3:rule_1-H.2` - 1-H.2)
- *authority* - R&O Vol.III r.1-H.3 (powers of the various criminal courts) (`phhc3:rule_1-H.3` - 1-H.3 Powers of various criminal court)
- *binds* - output-document: judgment and final order - the criminal powers exercised
- *how* - The powers are stated from the list in Volume III r.1-H.3.
- *test* - The judgment template carries a powers field populated from the presiding officer's recorded class of powers, and the judgment cannot be finalised with it empty.
- *related* - REQ-HR-JUR-002

**REQ-HR-JUR-002** · MUST · firm · from rule

The system MUST disclose, on the record and on the final order of a cheque case tried summarily, that the officer is specially empowered to try cases summarily.

- *why* - Section 143 of the NI Act directs that a cheque case be tried summarily, and Volume III allows a summary trial only by a District Magistrate, a magistrate of the first class specially empowered in that behalf, or a Bench so empowered. Volume III then requires that where an officer exercises specially conferred powers, the record and the final order say so. If a Haryana s.138 judgment does not carry that statement, the accused's first ground in revision is that the trial was held by a court without power to hold it, and nothing in the file answers him.
- *authority* - R&O Vol.III r.1-H.4 (special powers to be noted on the record and final order) (`phhc3:rule_1-H.4` - 1-H.4)
- *authority* - R&O Vol.III r.2.1 (magistrates competent to hold a summary trial) (`phhc3:rule_2.1` - 2.1 Magistrates competent to try and the procedure to be adopted)
- *authority* - NI Act §143 (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - output-document: judgment in a summarily tried cheque case - special empowerment of the magistrate
- *test* - A case marked as tried summarily cannot be assigned to an officer not flagged as specially empowered, and the judgment prints the special empowerment statement.
- *tightens* - REQ-TRL-001
- *related* - REQ-HR-JUR-001, REQ-HR-REC-005

#### TRL - trial conduct, plea, attendance (9)

**REQ-HR-TRL-001** · MUST · inferred · from rule

The system MUST require reasons to be recorded before a cheque complaint is dismissed by reason of the complainant's absence.

- *why* - Part F of Volume III opens by warning that some magistrates are inclined to dismiss cases in default hastily, and directs the magistrate to consider whether the order is legal and whether it is justified, and always to record reasons. In a s.138 case, dismissal for the complainant's absence carries the acquittal of the accused with it, so the payee loses the cheque debt as a criminal matter on a single missed date. The recorded reasons are the whole material on which that dismissal is revived in revision.
- *authority* - R&O Vol.III r.1-F.2 (reasons for dismissal in default should be recorded) (`phhc3:rule_1-F.2` - 1-F.2 Reasons for dismissal in default should be recorded)
- *authority* - R&O Vol.III r.1-D.5 (complainant's non-attendance in a summons case) (`phhc3:rule_1-D.5` - 1-D.5)
- *authority* - BNSS §272 (non-appearance of complainant) (`bnss:sec_272` - 272. Absence of complainant) [open](#law?act=bnss&eid=sec_272)
- *binds* - validation-rule: dismissal of a complaint for the complainant's absence
- *test* - The dismissal-in-default action cannot complete with an empty reasons field; the reasons are stored against the order and appear on the copy supplied to the complainant.
- *tightens* - REQ-TRL-016
- *related* - REQ-HR-TRL-002, REQ-HR-TRL-003

**REQ-HR-TRL-002** · MUST · inferred · from rule

The system MUST record the time of day at which a complaint was dismissed for the complainant's absence.

- *why* - Volume III issued this instruction because applicants for revision kept saying that the case was dismissed very early in the day and the magistrates' records furnished no definite information on the point. In a cheque case where the complainant's counsel was held up in another court until noon, the time of dismissal is the fact that decides the revision. A record that carries only the date cannot answer the question the revisional court will ask.
- *authority* - R&O Vol.III r.1-F.3(ii)(a) (the time of dismissal should always be noted on the record) (`phhc3:rule_1-F.3` - 1-F.3 Instruction to be observed in redismissal of complaints, etc., by reason of the absence of the complainant)
- *binds* - schema-field: dismissal in default order - time of dismissal
- *test* - The order of dismissal in default stores and prints a time of day as well as a date, and it cannot be saved without one.
- *related* - REQ-HR-TRL-001, REQ-HR-TRL-003

**REQ-HR-TRL-003** · SHOULD · firm · from rule

The system SHOULD record that the case was called on again later in the day before a complaint is dismissed for the complainant's absence.

- *why* - Volume III directs that a complainant who is absent when his case is first called should ordinarily have his case called again later, and that magistrates should not dismiss without giving complainants full opportunities for appearance. In a busy Panchkula magistrate's list a cheque case called at 10:15 and dismissed at 10:16 has had no opportunity at all. If the system offers dismissal as an option on the first call, it makes the hasty dismissal the rule warns against the path of least resistance.
- *authority* - R&O Vol.III r.1-F.3(ii)(a) (case should be called on again later) (`phhc3:rule_1-F.3` - 1-F.3 Instruction to be observed in redismissal of complaints, etc., by reason of the absence of the complainant)
- *authority* - R&O Vol.III r.1-F.0 (magistrates inclined to dismiss cases in default hastily) (`phhc3:rule_1-F.0` - 1-F.0 Introductory)
- *binds* - workflow-step: second call of a case before dismissal in default
- *test* - The dismissal-in-default action requires a recorded second call, or an explicit override with reasons; the second call and its time appear on the order sheet.
- *related* - REQ-HR-TRL-001, REQ-HR-TRL-002

**REQ-HR-TRL-004** · MUST · inferred · from rule

The system MUST state the amount of bail, and the offence charged with the section under which it is punishable, on the face of any order directing an accused to be detained in default of furnishing bail.

- *why* - Volume III requires all three on the face of that order because it is the document that puts a person in the lock-up. A drawer in a cheque case is accused of a bailable offence, and Volume III says in the same rule that for every bailable offence bail is a right and not a favour. An order sending him to the lock-up that does not say what sum he must find, or under what section he stands charged, gives him nothing to comply with and nothing to challenge.
- *authority* - R&O Vol.III r.10.1 (principles governing the grant of bail) (`phhc3:rule_10.1` - 10.1 Principles governing grant of bail)
- *authority* - NI Act §138 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - output-document: order directing detention in default of bail
- *test* - The detention-in-default order template carries the bail amount, the offence and the punishing section, and cannot be generated with any of the three empty.

**REQ-HR-TRL-007** · MUST NOT · inferred · from rule

The system MUST NOT fix the pronouncement of a judgment likely to end in a sentence of imprisonment within two days of the start of a spell of four or more holidays.

- *why* - Volume III requires such cases to be decided at least two days before the holidays begin, and copies to be supplied free of cost forthwith, so that the convicted person can apply for bail before the courts close. A drawer sentenced to imprisonment on the afternoon before a four-day break, with no copy of the judgment, spends the break in custody with no means of moving an appellate court. The scheduling screen is where that is prevented or caused.
- *authority* - R&O Vol.III r.1-H.1(iv) (pronouncement of judgment before a spell of holidays) (`phhc3:rule_1-H.1` - 1-H.1)
- *binds* - validation-rule: listing of a judgment date before a spell of four or more holidays
- *how* - The case is decided at least two days before the holidays commence, and arrangements are made for free copies to be supplied to the convicted person forthwith.
- *test* - With a court calendar containing a run of four or more consecutive holidays, the system refuses or warns on a judgment date inside the two days before it for a case flagged as likely to carry imprisonment.
- *related* - REQ-HR-CPY-003

**REQ-HR-TRL-008** · MUST · firm · from rule

The system MUST record on the order sheet that a proceeding in a cheque case was carried out by video conferencing.

- *why* - The Video Conferencing Rules require it to be mentioned specifically wherever any proceeding is carried out under them, because a proceeding conducted over a live link is a judicial proceeding for every purpose and has to be identifiable as such afterwards. If a s.138 order sheet does not say that the notice of accusation was put or the complainant examined over a link, nothing on the record distinguishes it from an in-person hearing, and a challenge to the mode of proceeding cannot be answered from the file.
- *authority* - P&H HC Video Conferencing Rules r.14.9 (Conduct of Proceedings) (`phvc:rule_14` - 14. Conduct of Proceedings)
- *authority* - P&H HC Video Conferencing Rules r.3(ii) (proceedings by video conferencing are judicial proceedings) (`phvc:rule_3` - 3. General Principles Governing Video Conferencing)
- *authority* - R&O Vol.III r.1-BB.1 (video conferencing in criminal matters) (`phhc3:rule_1-BB.1` - 1-BB.1)
- *binds* - schema-field: order sheet entry - mode of proceeding recorded as video conferencing
- *test* - Any hearing conducted over a link writes a mode flag to the order sheet entry, and that flag prints in the order sheet text.
- *related* - REQ-HR-TRL-009, REQ-HR-TRL-010, REQ-HR-TRL-011

**REQ-HR-TRL-009** · MUST · firm · from rule

The system MUST record on the order sheet the court's confirmation of the identity of a person examined by video conferencing.

- *why* - The Video Conferencing Rules require the identity of the person to be examined to be confirmed by the court with the assistance of the Remote Point Coordinator at the time the evidence is recorded, and to be reflected in the order sheet. In a cheque case the remote witness is typically a bank official proving the return memo, or the complainant's authorised representative. If the order sheet is silent on identity, the deposition can be attacked on the ground that the court never established who was speaking, and there is no second chance to establish it.
- *authority* - P&H HC Video Conferencing Rules r.12.3 (General Procedure) (`phvc:rule_12` - 12. General Procedure)
- *authority* - P&H HC Video Conferencing Rules r.8.1 (proof of identity before examination) (`phvc:rule_8` - 8. Examination of persons)
- *binds* - schema-field: order sheet entry - confirmation of the identity of a remotely examined person
- *how* - Identity is proved by a government-issued or recognised identity document, or in its absence by an affidavit attested by an authority referred to in BNSS §297, a copy of which goes to the opposite party.
- *test* - Recording a remote deposition requires an identity confirmation entry naming the document or affidavit relied on, and that entry prints in the order sheet.
- *related* - REQ-HR-TRL-008, REQ-HR-SRV-010

**REQ-HR-TRL-010** · MUST · firm · from rule

The system MUST record the court's satisfaction as to clarity, sound and connectivity for both Court Users and Remote Users on the completion of a video conferencing proceeding.

- *why* - The Video Conferencing Rules give a Remote User who was prejudiced by poor video or audio the right to say so immediately, and let the court declare the hearing incomplete. That remedy only works if the court's own satisfaction is on the record. In a summarily tried cheque case a cross-examination of the complainant conducted over a dropping link, with nothing on the file about quality, is a deposition the accused will say he never properly heard, and the court has no contemporaneous answer.
- *authority* - P&H HC Video Conferencing Rules r.10.8 (Ensuring seamless video conferencing) (`phvc:rule_10` - 10. Ensuring seamless video conferencing)
- *binds* - schema-field: order sheet entry - satisfaction as to clarity, sound and connectivity
- *test* - Closing a video-conferenced hearing requires a recorded satisfaction entry covering both Court Users and Remote Users before the order sheet entry can be finalised.
- *related* - REQ-HR-TRL-008

**REQ-HR-TRL-011** · MUST · firm · from rule

The system MUST record on the order sheet the video conferencing software used, where it is not the Designated Video Conferencing Software provided by the High Court.

- *why* - The Rules allow a departure from the designated software only for a technical glitch and only for reasons recorded, and then require the order sheet to name the software actually used. If a Panchkula court takes the evidence of a bank witness on a consumer meeting application because the designated platform failed, and the order sheet is silent, the record does not show that a departure occurred at all, and the reasons the rule demands were never recorded.
- *authority* - P&H HC Video Conferencing Rules r.10.7 (Ensuring seamless video conferencing) (`phvc:rule_10` - 10. Ensuring seamless video conferencing)
- *authority* - P&H HC Video Conferencing Rules r.12.2 (General Procedure) (`phvc:rule_12` - 12. General Procedure)
- *binds* - schema-field: order sheet entry - software used, time and duration of the video conferencing proceeding
- *how* - The order sheet also mentions the time and duration of the proceeding, the issues on which the court was addressed, and the documents produced and transmitted online.
- *test* - Selecting a non-designated platform on a hearing requires reasons and writes the platform name to the order sheet; using the designated platform requires neither.
- *related* - REQ-HR-TRL-008

#### CMP - compounding, settlement, mediation (3)

**REQ-HR-CMP-002** · MUST · firm · from rule

The system MUST record the statement of every party concerned before a cheque case is disposed of as compounded.

- *why* - Volume III dispenses with a judgment on facts when an offence is compounded but does not dispense with the statements: it requires the statement of all the parties concerned to be recorded. In a cheque case the parties are frequently a company acting through an authorised representative and a drawer who has paid part of the amount, and the settlement is often reached at a Lok Adalat. Without every party's recorded statement the court cannot show that the compounding was consensual, and the acquittal is exposed to a claim that the payee never agreed.
- *authority* - R&O Vol.III r.1-H.10 (statements of all parties to be recorded) (`phhc3:rule_1-H.10` - 1-H.10)
- *binds* - workflow-step: recording the statement of each party on compounding
- *test* - The compounding action cannot complete until a statement is recorded against every party on the case record, complainant and each accused.

**REQ-HR-CMP-003** · MUST · inferred · from rule

The system MUST record the reasons for granting permission to compound in the order directing the acquittal, wherever the permission of the court is necessary.

- *why* - Volume III requires the reasons to be stated in the order directing the acquittal, and repeats in the same Part that in every case in which a magistrate allows the parties to compromise his reasons should be recorded in his order. A s.138 compounding after cognizance, and any compounding at the appellate stage, needs the court's permission. An order of acquittal on compromise that carries no reasons is a bare order, and the guidance the High Court gives on when permission should be refused becomes unenforceable because nothing shows what the magistrate considered.
- *authority* - R&O Vol.III r.1-H.10 (reasons for granting permission to compound) (`phhc3:rule_1-H.10` - 1-H.10)
- *authority* - R&O Vol.III r.1-H.12 (reasons to be recorded where a compromise is permitted) (`phhc3:rule_1-H.12` - 1-H.12)
- *authority* - BNSS §359 (compounding of offences) (`bnss:sec_359` - 359. Compounding of offences) [open](#law?act=bnss&eid=sec_359)
- *binds* - output-document: order of acquittal on compounding - reasons for granting permission
- *test* - Where the case is flagged as requiring the court's permission to compound, the acquittal order cannot be generated with an empty reasons field.

**REQ-HR-CMP-004** · MUST · firm · from rule

The system MUST send a copy of the award or order, and the record of proceedings, to the Remote Point where a Lok Adalat or Jail Adalat is held over a live link.

- *why* - A large share of cheque cases settle in Lok Adalat, and the Video Conferencing Rules let a person at a remote point, including a person in jail, take part. The award has the same force as one passed by a regular Lok Adalat. If the award and the record never reach the Remote Point, the person who settled has no document of the settlement he agreed to, and cannot show a bank or a later court that the cheque debt was discharged.
- *authority* - P&H HC Video Conferencing Rules r.15.3 (Access to Legal Aid Clinics, Camps, Lok Adalats and Jail Adalats) (`phvc:rule_15` - 15. Access to Legal Aid Clinics/Camps/Lok Adalats/Jail Adalats)
- *authority* - Legal Services Authorities Act §21 (award of Lok Adalat) (`lsa:sec_21` - 21. Award of Lok Adalat.) [open](#law?act=lsa&eid=sec_21)
- *binds* - workflow-step: transmission of a Lok Adalat award and record of proceedings to the Remote Point
- *test* - Recording an award in a remotely conducted Lok Adalat queues the award and the record of proceedings for transmission to the Remote Point and stores the date they were sent.

#### SEN - sentence, fine, compensation (3)

**REQ-HR-SEN-001** · MUST · inferred · from rule

The system MUST record the material on the offender's means that the court relied on when fixing a fine in a cheque case.

- *why* - On a s.138 conviction the fine may run to twice the amount of the cheque, and Volume III directs that a fine must not be excessive with reference to the means of the offender, warning that indiscriminate fines only waste the time of the courts and the police in trying to realise them and harass the convict and his dependants. If nothing on the record shows what the court knew about the drawer's means, a fine of twice a large cheque cannot be defended in appeal, and the default sentence attached to it converts a fine-only offence into imprisonment. The rule states the obligation; it does not prescribe how means are ascertained, so the requirement is that the material relied on be recorded.
- *authority* - R&O Vol.III r.19-B.1 (fine to be in proportion to the offender's means) (`phhc3:rule_19-B.1` - 19-B.1 Fine to be in proportion to offenders means)
- *authority* - R&O Vol.III r.19-B.2 (limitations on imprisonment in default) (`phhc3:rule_19-B.2` - 19-B.2 Limitations)
- *authority* - NI Act §138 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: sentencing record - material on the offender's means
- *test* - A sentence that includes a fine cannot be finalised without a recorded means entry, and that entry is reproduced in the sentencing part of the judgment.
- *related* - REQ-HR-SEN-002

**REQ-HR-SEN-002** · MUST · inferred · from rule

The system MUST allow the court to order that a fine imposed in a cheque case be paid within a stated period or in instalments.

- *why* - The ordinary outcome of a s.138 conviction is a fine, with imprisonment in default, and the fine is rarely paid across the counter on the day. Volume III recognises the power to order payment within a period or by instalments precisely so that a convict who intends to pay is not sent to prison because he could not pay at once. A sentencing screen that offers only paid or unpaid pushes every such case straight to the default sentence.
- *authority* - R&O Vol.III r.19-B.3 (instalments or postponement of realisation of fine) (`phhc3:rule_19-B.3` - 19-B.3 Instalments or postponment of realisation of fine)
- *authority* - R&O Vol.III r.19-B.1 (fine in proportion to means) (`phhc3:rule_19-B.1` - 19-B.1 Fine to be in proportion to offenders means)
- *binds* - workflow-step: order for payment of a fine within a period or by instalments
- *test* - The sentencing screen offers a payment schedule for a fine-only sentence, stores the instalment dates, and tracks payments against them before any default warrant can issue.
- *related* - REQ-HR-SEN-001

**REQ-HR-SEN-003** · MUST NOT · firm · from rule

The system MUST NOT release compensation out of a fine to the complainant until the period for appeal has elapsed or an appeal has been decided, and the court has satisfied itself by examining the record and referring to the appellate court that no appeal or revision has been lodged.

- *why* - This is the payee's money in a cheque case, and Volume III records why the check exists: lower courts have paid compensation in ignorance of a pending appeal, and when the amount was later reduced or remitted it proved impossible to get it back from the complainant. A system that releases compensation the moment the fine is realised recreates exactly that. The rule requires two things before release, elapse of the appeal period and a positive check with the appellate court, and a release button with neither is a rule breach on every convicted file.
- *authority* - R&O Vol.III r.1-H.8 (application of fine towards costs and compensation) (`phhc3:rule_1-H.8` - 1-H.8)
- *authority* - BNSS §395 (order to pay compensation) (`bnss:sec_395` - 395. Order to pay compensation) [open](#law?act=bnss&eid=sec_395)
- *binds* - workflow-step: release of compensation out of a realised fine to the complainant
- *how* - The court examines the record of the case and makes a reference to the appellate court to satisfy itself that no appeal or revision has been lodged, before payment.
- *test* - The compensation release action is blocked until the appeal period has elapsed and a recorded no-appeal confirmation from the appellate court is attached to the case.
- *tightens* - REQ-SEN-006
- *related* - REQ-HR-SEN-002

#### APL - appeal, revision, deposit (8)

**REQ-HR-APL-001** · MUST · firm · from rule

The system MUST record on the vakalatnama, memo of appearance or written authorisation the advocate's residential or office address, telephone or cell number, enrolment number and, where available, e-mail and fax number.

- *why* - The Punjab and Haryana High Court made these particulars an express requirement on the instrument by which an advocate accepts an engagement. In an appeal or revision from a cheque conviction the file often moves between the trial court, the copying branch and the High Court, and an advocate identified only by name cannot be reached by any of them. The enrolment number is what distinguishes him from another advocate of the same name on the same cause list.
- *authority* - R&O Vol.III r.25-A.4 (pleader engaged by agent; particulars on the vakalatnama) (`phhc3:rule_25-A.4` - 25-A.4 Pleader engage d by agent)
- *binds* - schema-field: vakalatnama or memo of appearance - advocate contact particulars and address for service
- *test* - A vakalatnama, memo of appearance or written authorisation cannot be saved without an address, a telephone or cell number and an enrolment number; the e-mail and fax fields save empty.
- *related* - REQ-HR-APL-002, REQ-HR-APL-008

**REQ-HR-APL-002** · MUST · firm · from rule

The system MUST require the Advocate Welfare Fund Stamp to be affixed on every vakalatnama, memo of appearance or written authorisation, including one filed for a respondent.

- *why* - Volume III requires it on both sides, appellant and respondent, and the requirement is easy to miss because the stamp is not a court fee and is not part of the fee table. A cheque appeal filed without it, or a caveat entered by the payee's counsel without it, is accepted only on an undertaking, and the matter does not move until the undertaking is met. A filing screen that validates the court fee but not the welfare fund stamp will produce that stall on every second file.
- *authority* - R&O Vol.III r.25-A.4 (Advocate Welfare Fund Stamp) (`phhc3:rule_25-A.4` - 25-A.4 Pleader engage d by agent)
- *binds* - validation-rule: Advocate Welfare Fund Stamp on a vakalatnama or memo of appearance
- *how* - In a case of urgency, where the stamp is not available, the filing is accepted subject to an undertaking by counsel that the requisite stamp will be affixed.
- *test* - Filing a vakalatnama with no stamp recorded is refused unless an urgency undertaking is captured; the same check applies to a respondent's vakalatnama.
- *related* - REQ-HR-APL-001, REQ-HR-APL-003

**REQ-HR-APL-003** · MUST NOT · firm · from rule

The system MUST NOT list a matter accepted on an undertaking to affix the Advocate Welfare Fund Stamp until that undertaking has been complied with, unless the court orders otherwise.

- *why* - Volume III says the matter shall be listed only after compliance unless otherwise ordered. The undertaking exists so that an urgent cheque appeal or stay application is not turned away at the counter; the listing bar exists so that the undertaking is honoured. If the system lists the matter anyway, the undertaking is never redeemed, and the file carries a defect nobody will notice until an office objection surfaces at a hearing.
- *authority* - R&O Vol.III r.25-A.4 (matter to be listed only after compliance with the undertaking) (`phhc3:rule_25-A.4` - 25-A.4 Pleader engage d by agent)
- *binds* - validation-rule: listing of a matter with an outstanding welfare fund stamp undertaking
- *how* - The bar lifts on compliance, or on an order of the court directing listing notwithstanding.
- *test* - A matter with an open stamp undertaking cannot be added to a cause list without a recorded court order; recording compliance releases it automatically.
- *related* - REQ-HR-APL-002

**REQ-HR-APL-004** · MUST NOT · firm · from rule

The system MUST NOT admit a petition for revision by the complainant in a cheque case unless it is presented by the complainant himself or by a person authorised by a duly stamped power of attorney.

- *why* - Volume III states the bar for a complainant's revision separately from the bar for a convict's appeal, and cheque complainants are overwhelmingly banks, non-banking financial companies and companies acting through a representative. The power of attorney carries its own fee in the High Court's table, and it is what shows that the person moving the revision speaks for the payee. A revision admitted from an unauthorised officer of the complainant company is liable to be thrown out on that ground alone, after the period for filing it has run.
- *authority* - R&O Vol.III r.25-A.1 (persons competent to lodge a petition) (`phhc3:rule_25-A.1` - 25-A.1 Persons competent to lodge petition)
- *authority* - Court Fee Table, common documents - Power of Attorney (`phft:com_13_x` - 13. Power of Attorney)
- *binds* - validation-rule: admission of a complainant's revision petition
- *test* - A revision filed by anyone other than the named complainant requires a duly stamped power of attorney on record before it can be admitted; the check runs before numbering.
- *related* - REQ-HR-APL-005

**REQ-HR-APL-005** · MUST · firm · from rule

The system MUST charge no court fee on a criminal appeal, application or petition in the High Court where the appellant, applicant or petitioner is in custody.

- *why* - This is the one distributive rule in the High Court's criminal fee table, and it removes the fee at exactly the point where a person is least able to pay it. A drawer already serving the sentence imposed for dishonour of a cheque pays nothing to move the High Court. If a fee calculator applies the flat Rs. 2.65 regardless of custody, a person in jail is asked for money he cannot send, and the appeal or revision is held at the counter for want of it.
- *authority* - Court Fee Table, criminal - no fee where the party is in custody (`phft:crim_note` - Note to the criminal table)
- *authority* - Court Fee Table, criminal - Criminal Appeal, Single Bench (CRA-S) (`phft:crim_7_cra_s` - 7. Criminal Appeal (SB) (CRA-S))
- *authority* - R&O Vol.III r.25-A.5 (no court fees on appeals preferred on behalf of a prisoner) (`phhc3:rule_25-A.5` - 25-A.5 Court- fees on appeal s)
- *binds* - validation-rule: court fee computation where the party is in custody
- *test* - Setting the custody flag on the appellant reduces the computed fee to nil for a criminal appeal, revision or miscellaneous application, and the nil fee is shown with the custody ground stated.
- *related* - REQ-HR-APL-006, REQ-HR-CPY-004

**REQ-HR-APL-006** · MUST · firm · from rule

The system MUST charge annexures at Rs. 0.65 per page, separately from the fee on the petition itself.

- *why* - This is the charge that actually adds up in a cheque matter, because the paper a s.138 case travels on is all annexure: the cheque, the return memo, the demand notice, the postal receipts, the account statement, the complaint and the trial court's order. A calculator that quotes only the Rs. 2.65 on a revision or a quashing petition understates what the filer will be asked to pay, and the shortfall becomes an office objection at the counter.
- *authority* - Court Fee Table, common documents - Annexures per page (`phft:com_12_x` - 12. Annexures)
- *authority* - Court Fee Table, criminal - Quashing Petition (CRM-M) (`phft:crim_3_crm_m` - 3. Quashing Petition (CRM-M))
- *binds* - validation-rule: court fee computation - per-page charge on annexures
- *test* - The computed fee for a petition equals the case-type fee plus Rs. 0.65 multiplied by the annexure page count, and the two components are shown separately.
- *related* - REQ-HR-APL-005, REQ-HR-APL-007

**REQ-HR-APL-007** · MUST · firm · from rule

The system MUST present the High Court criminal court-fee amounts as provisional, subject to the final decision in RSA No. 3311 of 2013.

- *why* - The fee table itself says so in Note 1: fees are received under the Court Fees Act, 1870 as un-amended, because Schedules I and II of the Court Fees (Punjab Second Amendment) Act, 2009 have stood stayed since 27 November 2013, and the whole chart is expressly subject to the final decision in that case. A system that quotes Rs. 2.65 as a settled figure will be wrong the day the stay is vacated, on every criminal filing in the jurisdiction at once, and users who relied on it will have budgeted and paid on a superseded schedule.
- *authority* - Court Fee Table, common documents - Note 1 on the stayed 2009 amendment (`phft:com_notes` - 1. Notes to the Court Fee Table)
- *binds* - screen: display of High Court criminal court-fee amounts
- *test* - Any screen quoting a High Court criminal fee shows the provisional status and the reason, and the fee values are held as data that can be replaced without a code change.
- *related* - REQ-HR-APL-006

**REQ-HR-APL-008** · MUST · firm · from rule

The system MUST treat the address recorded by the advocate on the vakalatnama, memo of appearance or written authorisation as the address for service.

- *why* - Volume III makes the recorded address the address for service within the meaning of Order 3 rule 5 of the Code of Civil Procedure. In an appeal or revision from a cheque conviction, notice sent anywhere else is notice the appellant's counsel never sees, and the matter is decided or dismissed in his absence. Where more than one advocate is engaged one address suffices, so the record has to show which of them is the address for service rather than leaving a notice clerk to choose.
- *authority* - R&O Vol.III r.25-A.4 (address for service) (`phhc3:rule_25-A.4` - 25-A.4 Pleader engage d by agent)
- *binds* - schema-field: vakalatnama - the address flagged as the address for service
- *how* - Where more than one advocate accepts the engagement it is sufficient for one of them to record his address, and that recorded address is the address for service.
- *test* - Where several advocates are recorded for a party, exactly one address is flagged as the address for service, and every notice the system generates for that party is addressed to it.
- *related* - REQ-HR-APL-001

#### REC - the court record, registers, retention (10)

**REQ-HR-REC-001** · MUST NOT · firm · from rule

The system MUST NOT classify the cheque in an e-filed cheque case as a document to be preserved permanently by the Registry.

- *why* - The Electronic Filing Rules list the documents that must be preserved permanently and put a negotiable instrument on that list, but expressly except a cheque. The cheque therefore falls back to the general rule: the party who filed the scan keeps the original for production or inspection as the Bench directs. A system that quietly puts the cheque in the permanent-preservation class tells the complainant the court is holding it, and the original stops being produced. In a s.138 case that is the one document the court will call for.
- *authority* - P&H HC E-Filing Rules r.11.3(a) (permanent preservation, negotiable instrument other than a cheque) (`phef:rule_11` - 11. Retention of Originals)
- *authority* - NI Act §138 (`ni:sec_138` - 138. Dishonour of cheque for insufficiency, etc., of funds in the account) [open](#law?act=ni&eid=sec_138)
- *binds* - schema-field: document retention class of the cheque in an e-filed complaint
- *test* - The retention class assigned to a document typed as a cheque is the general class under r.11.1, never the permanent class under r.11.3; a power of attorney filed in the same case does take the permanent class.
- *tightens* - REQ-EVI-017
- *related* - REQ-HR-REC-002, REQ-HR-FIL-015

**REQ-HR-REC-002** · MUST · firm · from rule

The system MUST record, against each scanned document in an e-filed cheque case, the party that filed it, as the party responsible for producing the original and proving its genuineness.

- *why* - The Electronic Filing Rules put that responsibility on the party that electronically filed the scanned copy. In a cheque case the scans include the cheque, the return memo and the demand notice, and they may be filed by the complainant, by a co-complainant company or later by the accused. When the Bench calls for an original, the court has to know from the file who has to produce it. If the record shows only that a document is on file, the direction goes to nobody and the hearing is adjourned.
- *authority* - P&H HC E-Filing Rules r.11.1 and r.11.4 (Retention of Originals) (`phef:rule_11` - 11. Retention of Originals)
- *binds* - schema-field: document record - filing party responsible for the original
- *test* - Every scanned document stores a filing party; a direction to produce an original is addressed to that party and appears on that party's task list.
- *related* - REQ-HR-REC-001

**REQ-HR-REC-003** · MUST · inferred · from rule

The system MUST hold the retention clock on a signed vakalatnama and an attested affidavit in a cheque case open for at least two years after final disposal, counting final disposal as disposal by the superior appellate court.

- *why* - The Electronic Filing Rules define final disposal for this purpose to include disposal by the superior appellate court, so a retention clock started at the trial court's judgment is wrong by the length of the appeal. In a s.138 case the vakalatnama and the affidavit of the authorised representative are the documents whose authenticity is most often questioned, because bank and company complainants act through representatives. Destroying them two years after conviction, while an appeal is pending, destroys the answer to that question.
- *authority* - P&H HC E-Filing Rules r.11.2 (Retention of Originals) (`phef:rule_11` - 11. Retention of Originals)
- *binds* - schema-field: retention clock for the vakalatnama and attested affidavit
- *test* - The retention date on the vakalatnama and affidavit is computed from the latest disposal across the trial and appellate proceedings, and moves outward when an appeal is filed.
- *related* - REQ-HR-REC-002

**REQ-HR-REC-004** · MUST · inferred · from rule

The system MUST enter a summarily triable cheque case in the institution register as soon as it is received in court, before any appearance of the accused is recorded.

- *why* - The High Court issued this instruction because summary cases were being entered in the registers only when the accused appeared, with the result that a large number of them escaped the notice of the courts. A s.138 case is tried summarily, and the gap between institution and the accused's first appearance is often the longest phase of the case, filled with unserved summonses and warrants. A case not in the register in that period is not in anyone's pendency, and nobody is watching it.
- *authority* - R&O Vol.III r.2.6 (summary cases to be entered in Register No. 1 on receipt) (`phhc3:rule_2.6` - 2.6 Final order should show whether accused has been discharged or acquitted)
- *authority* - R&O Vol.III r.2.1 (summary trial procedure) (`phhc3:rule_2.1` - 2.1 Magistrates competent to try and the procedure to be adopted)
- *authority* - NI Act §143 (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - workflow-step: entry of a summary case in the institution register on receipt
- *how* - On receipt the case goes into the institution register; a separate entry is made in the register of summary cases when the accused appears.
- *test* - A cheque case appears in the institution register and in pendency counts from the date it is received in court, before any appearance is recorded.
- *related* - REQ-HR-REC-005

**REQ-HR-REC-005** · MUST · inferred · from rule

The system MUST restrict the entry of columns 7 to 14 of the register of summary cases to the magistrate himself.

- *why* - Volume III says these columns are to be filled in by the magistrate himself, because in a summary trial where no appeal lies they are the record: the nature of the offence alleged and proved, the plea of the accused, the finding, the sentence and the final order. In a cheque case tried summarily those columns carry the conviction. If a case management system lets an ahlmad or a data-entry operator complete them, the substantive record of a criminal conviction has been made by a ministerial officer.
- *authority* - R&O Vol.III r.2.3 (evidence in summary trials; columns 7 to 14 of Register No. XVII) (`phhc3:rule_2.3` - 2.3 Evidence)
- *authority* - R&O Vol.III r.1-E.8 (evidence and judgments in summary trials) (`phhc3:rule_1-E.8` - 1-E.8 Evidence and judgments in summary trials)
- *binds* - access-control: entry of columns 7 to 14 of the register of summary cases
- *test* - Only a judicial-officer role can write to those columns; a ministerial role sees them read-only, and the saved entry names the magistrate who made it.
- *related* - REQ-HR-REC-004, REQ-HR-JUR-002

**REQ-HR-REC-006** · MUST · firm · from rule

The system MUST record every order of adjournment in a cheque case with its date, and make apparent the date on which the inquiry or trial was resumed.

- *why* - Volume III requires a short note of every material order with its date, and requires every adjournment to be entered so that the date of resumption is apparent. A s.138 case is meant to be summary, and adjournments are the thing that defeats that. If the record shows only a chain of dates with no orders of adjournment, neither the High Court's monthly returns nor a revisional court can see who asked for the delay, and the Volume III direction that adjournments be as short as possible cannot be checked against anything.
- *authority* - R&O Vol.III r.1-E.14 (record to contain a brief note of all material orders passed) (`phhc3:rule_1-E.14` - 1-E.14)
- *authority* - R&O Vol.III r.1-A.6 (speedy disposal of cases) (`phhc3:rule_1-A.6` - 1-A.6 Speedy disposal of cases)
- *authority* - NI Act §143 (`ni:sec_143` - 143. Power of Court to try cases summarily) [open](#law?act=ni&eid=sec_143)
- *binds* - schema-field: order sheet - adjournment orders and the date of resumption
- *how* - A short note of the order is entered in the record in its proper place, with the date on which it was made.
- *test* - Every date change on a case writes an adjournment order with its own date and the resumed date; the order sheet can be read end to end with no unexplained gap between dates.
- *related* - REQ-HR-REC-007

**REQ-HR-REC-007** · MUST · inferred · from rule

The system MUST support Hindi in Devanagari script as the language of a Haryana subordinate criminal court's record and judgment, alongside English.

- *why* - The notification reproduced in Volume III determines the language of the courts subordinate to the High Court to be Hindi in Devanagari script in the Hindi Region, and Volume III requires the judgment to be written in the language of the court or in English. It is a 1962 Punjab notification framed for the Hindi and Punjabi Regions of undivided Punjab; that the Hindi Region is now Haryana follows from the reorganisation and not from the text, so the requirement is a reading of the notification. The Panchkula judgment writer takes the judge's dictation in the language of the court. A system that stores only ASCII, or that mangles Devanagari in a generated FORM A preface or in a summons, produces a record in a language the court does not use and a name it cannot print.
- *authority* - R&O Vol.III r.1-E.14 (notification regarding court language) (`phhc3:rule_1-E.14` - 1-E.14)
- *authority* - R&O Vol.III r.1-H.1(ii) (judgment in the language of the court or in English) (`phhc3:rule_1-H.1` - 1-H.1)
- *binds* - schema-field: record and judgment text - language and script
- *test* - Party names, order text and judgment text entered in Devanagari round-trip unchanged through storage, generated documents and printed process; the record stores which language was used.
- *related* - REQ-HR-EVI-001

**REQ-HR-REC-008** · MUST · firm · from rule

The system MUST accept an e-authenticated copy of an interim order, stay order, bail order or record of proceedings transmitted through the FASTER system as valid for compliance with the directions it contains.

- *why* - Volume III was amended in September 2022 to say so in terms. In a cheque case the order that matters most urgently is a bail order or a stay of proceedings, and the drawer is often at a different court or in custody in a different district. If the system requires a physically certified copy before it will act, a person entitled to release under an order already transmitted electronically stays where he is until paper arrives, which is precisely the delay the FASTER system was created to remove.
- *authority* - R&O Vol.III r.1-A.14 (Fast and Secured Transmission of Electronic Records) (`phhc3:rule_1-A.14` - 1-A.14)
- *binds* - workflow-step: acceptance of a FASTER e-authenticated order for compliance
- *test* - An order received through FASTER can be actioned without a physical certified copy, and the case record shows the FASTER transmission as its source.
- *related* - REQ-HR-CPY-002

**REQ-HR-REC-009** · MUST NOT · inferred · from practice-note

The system MUST NOT permit a copy of an e-filed case record to be stored outside the exclusive server maintained under the control and directions of the court.

- *why* - The Electronic Filing Rules require e-filings to be held on an exclusive court-controlled server, separately labelled, encrypted and with access restricted, and permit a mirror only at a location decided by the court. They do not in terms forbid a copy held elsewhere, so the prohibition is a reading of that scheme. The Panchkula filing assistants describe a self-started habit of e-mailing a PDF of each file to an office inbox and keeping it in a desktop folder; the rules also caution that e-mail is not a secure medium. A cheque file contains an account number, a cheque image with a signature and the parties' addresses, and a copy of it sitting on an unmanaged desktop is outside every control the rules create.
- *authority* - P&H HC E-Filing Rules r.18 (Storage and Retrieval of e-filed Documents and Pleadings) (`phef:rule_18` - 18. Storage and Retrieval of e-filed Documents and Pleadings)
- *authority* - P&H HC E-Filing Rules r.20 (General Caution on e-mail) (`phef:rule_20` - 20. General Caution)
- *binds* - access-control: storage location of e-filed case records and any copy of them
- *how* - Filings are stored on the exclusive server, separately labelled and encrypted; a mirror image may be held at a different geographical location as decided by the court, and nowhere else.
- *test* - The system offers no bulk export or e-mail-a-copy path for a case file to an address outside the court's controlled domain, and any such attempt is refused and logged.
- *related* - REQ-HR-REC-010

**REQ-HR-REC-010** · MUST · inferred · from rule

The system MUST record the presiding officer's monthly inspection and signature on each register maintained by the Ahlmad attached to his court.

- *why* - Volume III requires the registers kept by the Ahlmad attached to a magistrate's court to be inspected by the presiding officer at least once a month to ensure their proper maintenance, and to be signed by him in token of having done so. The rule says this of registers No. XXIII and XXIV; extending it to the other registers that same ahlmad keeps is a reading of it. The Panchkula ahlmad prints the month's institution register out of the case management system and pastes it in. If the system produces the register but records no inspection and no signature, the only control over the accuracy of the court's own registers is absent, and the monthly returns built on top of them rest on nothing.
- *authority* - R&O Vol.III r.11-A.14 (registers to be inspected monthly and signed by the presiding officer) (`phhc3:rule_11-A.14` - 11-A.14)
- *authority* - R&O Vol.III r.1-A.12 (monthly statement of old cases to the High Court) (`phhc3:rule_1-A.12` - 1-A.12)
- *binds* - workflow-step: monthly inspection and signature of the court's registers
- *how* - The presiding officer signs the register in token of having inspected it, at least once in the month.
- *test* - Each register carries at most one inspection record per month, naming the presiding officer and the date he signed it; a month closing with no inspection record on a register is flagged on the court's dashboard.
- *related* - REQ-HR-REC-004, REQ-HR-FIL-016

#### CPY - copies and their supply (4)

**REQ-HR-CPY-001** · MUST · firm · from rule

The system MUST supply a hard copy of the testimony recorded, certified a true copy by the presiding officer or court officer, free of cost and against receipt, to the accused or his advocate, to the witness and to the prosecutor, on the date of recording.

- *why* - Volume III fixes the day: the date of recording, not on application and not later. In a cheque case the complainant's evidence is often tendered on affidavit and then cross-examined in one sitting, and the accused's counsel has to prepare his next step from what was actually said. If the copy comes weeks afterwards, or only on a copying application, the accused is defending a summary trial on his memory of a deposition he has not read, and the receipt the rule requires is what shows whether he got it at all.
- *authority* - R&O Vol.III r.1-E.3(ii)(c) (procedure for recording evidence) (`phhc3:rule_1-E.3` - 1-E.3)
- *authority* - NI Act §145 (evidence on affidavit) (`ni:sec_145` - 145. Evidence on affidavit) [open](#law?act=ni&eid=sec_145)
- *binds* - output-document: certified true copy of a deposition supplied on the date of recording
- *how* - The copy is certified a true copy by the presiding officer or the court officer, given free of cost, and a receipt is taken from each recipient.
- *test* - Closing a deposition generates three certified copies with receipt slips for the accused or his advocate, the witness and the prosecutor, dated the day of recording; the receipts are stored against the case.
- *tightens* - (national requirement not yet numbered) The national requirement governing the supply of copies of the evidence and the record to the accused.
- *related* - REQ-HR-EVI-001

**REQ-HR-CPY-002** · MUST NOT · firm · from rule

The system MUST NOT hold an application for revision for more than a week for the purpose of granting a copy of the judgment impeached.

- *why* - Volume III sets a hard one-week ceiling and tells the court what to do when it cannot meet it: forward the application to the High Court without the copy, with an explanation of why the copy was not granted. A drawer convicted in a cheque case whose revision sits in the copying branch for a month is a person whose remedy has been delayed by the court's own office, and the ceiling exists so that the delay is either cured or disclosed.
- *authority* - R&O Vol.III r.25-G.3 (application for revision to be accompanied by copy of judgment) (`phhc3:rule_25-G.3` - 25-G.3 Application for revision to be accompanied by copy of judgment. Free supply of copy to accused)
- *binds* - workflow-step: detention of a revision application pending supply of a copy of the judgment
- *how* - If the copy cannot be given within the week, the application is forwarded without it, accompanied by an explanation of the cause of not granting a copy.
- *test* - A revision application pending a copy for seven days raises an escalation and offers the forward-without-copy path, which requires an explanation before it completes.
- *related* - REQ-HR-CPY-003

**REQ-HR-CPY-003** · MUST · inferred · from rule

The system MUST treat an application for a copy made by a person sentenced to imprisonment on a working day preceding a holiday as urgent.

- *why* - Volume III makes it urgent because a copy is what an appeal has to be accompanied by, and a convict who does not get one before the courts close cannot move for bail over the break. A s.138 sentence can run to two years. A copying queue that works first in, first out will hand the copy over after the holidays, by which time the person has served part of a sentence he was trying to appeal.
- *authority* - R&O Vol.III r.25-G.3 (applications for copies before a holiday to be treated as urgent) (`phhc3:rule_25-G.3` - 25-G.3 Application for revision to be accompanied by copy of judgment. Free supply of copy to accused)
- *authority* - R&O Vol.III r.1-H.1(iv) (pronouncement before a spell of holidays) (`phhc3:rule_1-H.1` - 1-H.1)
- *binds* - workflow-step: priority of a copy application made before a holiday by a person sentenced to imprisonment
- *how* - Such copies are supplied on the same day as far as possible, and if that is not practicable at least on the next day.
- *test* - An application flagged with a custodial sentence made on the working day before a holiday is placed at the head of the copying queue and its target date is the same day, failing which the next day.
- *related* - REQ-HR-TRL-007, REQ-HR-CPY-002

**REQ-HR-CPY-004** · MUST · inferred · from practice-note

The system MUST prompt for the convicted person's application for a free copy of the judgment where a cheque conviction ends in fine only, because the automatic free copy under Volume III is engaged only by a sentence of imprisonment.

- *why* - Volume III r.1-H.1(vi) attaches the free copy of the finding and sentence to a sentence of imprisonment, and BNSS §404(1) does the same for the judgment. The commonest s.138 outcome is fine and compensation with no imprisonment, and in that case the free copy comes instead under BNSS §404(2), which is expressed as being on the application of the accused. The Panchkula practice of handing it over on every conviction is more generous than the letter of the rule. If a system instead follows the letter and issues no copy and no prompt, a drawer fined twice the cheque amount holds no copy of the judgment his appeal has to be accompanied by, and does not know he must ask.
- *authority* - R&O Vol.III r.1-H.1(vi) (free copy where the accused is sentenced to imprisonment) (`phhc3:rule_1-H.1` - 1-H.1)
- *authority* - R&O Vol.III r.25-G.2 (appeal to be accompanied by a copy of the judgment) (`phhc3:rule_25-G.2` - 25-G.2 Appeal to be accompanied by copy of judgment or order. Free supply of copy in certain cases)
- *authority* - BNSS §404 (copy of judgment) (`bnss:sec_404` - 404. Copy of judgment to be given to accused and other persons) [open](#law?act=bnss&eid=sec_404)
- *binds* - workflow-step: supply of a free copy of the judgment on a fine-only cheque conviction
- *test* - A conviction with imprisonment issues the free copy without any application; a fine-only conviction raises a prompt to the convicted person or his advocate to apply, and the copy is then supplied free of cost.
- *tightens* - REQ-CPY-004
- *related* - REQ-HR-APL-005

### Kerala - added by its own instruments (110)

Only what Kerala's own instruments require, or where a Kerala instrument tightens a national obligation. Nothing here restates central law: the offence, the presumptions, the notice period, limitation and compounding are uniform national requirements and live in national.json. Two things run through this file that a national-only model cannot see. The first is language: the court language in Kerala's subordinate courts is Malayalam, so process crossing into a court of another official language carries an authorised English translation, an affidavit or vakalatnama put to a deponent who does not read its language carries a read-and-explained certificate, the interpreter is sworn in her own prescribed form and named in the deposition heading, and a local-language pleading must be filed as Unicode text. The second is the Kollam 24x7 ON Court, designated to try only s.138 cases and to sit round the clock against a general rule of 11 a.m. to 5 p.m., which forces sitting hours and case-type allocation to be court-level data rather than constants. Every 'tightens' is null; where a requirement tightens a national obligation, 'tightens_hint' describes the national requirement it tightens, to be resolved when the national file is merged.

#### LIM - limitation, cause of action, computation of time (5)

**REQ-KL-LIM-001** · MUST · firm · from rule

The system MUST take the date of e-filing, for limitation, as the moment the complaint is electronically received in the Registry in Indian Standard Time, and not the moment the e-filer began or uploaded the submission.

- *why* - A Kerala payee who starts a DCMS submission at 23.50 on the last day of the month and whose upload lands in the Registry at 00.06 has filed on the next day. If the system stamps the complaint with the browser's clock, the client's timezone or the start of the session, it will show an out-of-time complaint as in time, and the defect surfaces only when the Magistrate computes the month under NI Act s.142(1)(b) and the complaint is dismissed as barred.
- *authority* - Kerala E-Filing Rules r.13(2) (`kefr:rule_13` - 13. Computation of Limitation)
- *authority* - DCMS e-Filing SOP, cl.6 (`dcms:para_6` - 6. Filing Format, Exemptions and Limitation)
- *binds* - schema-field: complaint - date and time of electronic receipt in the Registry
- *how* - The rule fixes the moment: receipt in the Registry, within the time prescribed under the relevant Act, Rules and orders, reckoned in Indian Standard Time.
- *test* - Submit an e-filing whose client clock is set to a different timezone and whose upload completes after midnight IST; the stored filing date is the Registry receipt date in IST, and the limitation computation uses that date.
- *tightens* - REQ-LIM-007
- *related* - REQ-KL-LIM-002, REQ-KL-LIM-003

**REQ-KL-LIM-002** · MUST NOT · firm · from rule

The system MUST NOT offer, compute or record any extension of limitation on the ground that the electronic filing facility failed.

- *why* - The Kerala rule is explicit that an e-filer cannot claim exemption from limitation because e-filing failed. A portal outage on the last day of the month is exactly when a cheque complainant will ask the software for relief, and a system that quietly rolls the filing date forward, or offers a 'portal down' reason code that suppresses the limitation warning, manufactures a defence-free record of a complaint that is in fact time-barred.
- *authority* - Kerala E-Filing Rules r.13(5) (`kefr:rule_13` - 13. Computation of Limitation)
- *binds* - validation-rule: limitation computation - excluded grounds
- *test* - With the portal recorded as unavailable across the last day of the limitation period, the limitation calculation is unchanged and the complaint is still flagged out of time; no reason code suppresses the flag.
- *tightens* - REQ-LIM-008
- *related* - REQ-KL-LIM-001, REQ-KL-LIM-003

**REQ-KL-LIM-003** · MAY · firm · from rule

The system MAY accept a filing presented at a Designated Counter of the court during court working hours where electronic filing on the portal is not possible because of technical failure, system maintenance or other exigency.

- *why* - This is the only route left to a Kerala complainant on the last day when the portal is down, because the rules refuse any extension of limitation for portal failure. If the counter route is invisible in the software, the complainant loses the one lawful escape and the complaint is dismissed on limitation for an outage he did not cause.
- *authority* - Kerala E-Filing Rules r.13(4) (`kefr:rule_13` - 13. Computation of Limitation)
- *binds* - workflow-step: filing - Designated Counter fallback
- *how* - Electronic filing through the Designated Counters of the court, during the working hours of the court, where filing on the Electronic Filing Web Portal is not possible due to any technical failure or system maintenance or other exigencies.
- *test* - With the portal marked unavailable, a Designated Counter presentation can be recorded against the case, is offered only inside the court's working hours, and names which of the three grounds is relied on; with the portal available the route is not offered.
- *related* - REQ-KL-LIM-002, REQ-KL-LIM-005

**REQ-KL-LIM-004** · MUST · firm · from rule

Where the Rules of the High Court of Kerala prescribe a number of days, the system MUST reckon them exclusive of the first day and inclusive of the last, and where the last day falls on a day the court office is closed MUST roll the period past that day and any following days on which the office remains closed.

- *why* - Every High Court deadline in a cheque case - the 15 days to re-present a returned revision, the 90 days to file one, the time allowed to supply a deficiency - is computed under this rule. A generic date-arithmetic helper that counts calendar days will make a re-presentation due on a Saturday of a court vacation look late, and the Registry will reject a filing the rules treat as in time.
- *authority* - Kerala HC Rules r.6 (`khcr:rule_6` - 6. Reckoning of prescribed days)
- *binds* - validation-rule: High Court deadline computation
- *how* - Where the number of days is not expressed to be clear days: exclusive of the first day, inclusive of the last, and if the last day falls on a day the court office is closed, exclusive of that day and of any following days during which the office continues to be closed.
- *test* - Set a 15-day re-presentation period whose last day is the first of three consecutive days on which the court office is closed; the computed due date is the first day the office reopens.
- *related* - REQ-KL-APL-010

**REQ-KL-LIM-005** · MUST · inferred · from rule

The system MUST record a filing made at a Designated Counter as filed on the date of that presentation, and MUST NOT date it from the failed upload or from the day the portal returned.

- *why* - The counter route only saves the complainant if the date it carries is the date he stood at the counter. The rules fix the filing date as the date the Action is electronically received in the Registry, and at a Designated Counter that is the moment of presentation; the rule does not spell that consequence out, which is why a system is free to get it wrong. A back-dated counter filing invents a date the Registry cannot vouch for, and a forward-dated one costs the complainant the very days the counter existed to save.
- *authority* - Kerala E-Filing Rules r.13(2) (`kefr:rule_13` - 13. Computation of Limitation)
- *authority* - Kerala E-Filing Rules r.13(4) (`kefr:rule_13` - 13. Computation of Limitation)
- *binds* - schema-field: counter presentation - filing date
- *test* - Record a counter presentation on a day after a failed upload; the stored filing date is the counter presentation date, and neither the upload attempt date nor the portal restoration date can be selected as the filing date.
- *related* - REQ-KL-LIM-003, REQ-KL-LIM-001

#### FIL - filing, court fee, scrutiny, numbering (33)

**REQ-KL-FIL-001** · MUST · firm · from act

The system MUST compute the court fee on a s.138 complaint from the amount of the dishonoured cheque, applying the flat fee below the statutory threshold and the ad valorem percentage above it subject to the statutory ceiling.

- *why* - Kerala prices a cheque complaint on the cheque itself: a flat fee where the cheque does not exceed ten thousand rupees, otherwise five per cent of the whole cheque amount capped at three lakh rupees. A system that carries a single flat filing fee, or that applies the percentage to the claimed amount rather than the cheque amount, produces a deficit that the Registry catches at scrutiny and the complaint sits unnumbered while the fee is made good.
- *authority* - Kerala Court Fees Act Art.21(a) (`kcf:art_21` - 21. Court fees on complaints, appeals and revisions under section 138 of the Negotiable Instruments Act, 1881)
- *binds* - validation-rule: complaint - court fee computation
- *how* - Article 21(a): flat fee where the dishonoured cheque does not exceed ten thousand rupees; otherwise five per cent of the entire cheque amount subject to the statutory maximum.
- *test* - Fee computed for a cheque at, just below and far above the threshold matches the Article 21 slab, is derived from the cheque amount field, and never exceeds the ceiling.
- *tightens* - (national requirement not yet numbered) the national requirement that the court fee payable on the institution of a complaint be recorded
- *related* - REQ-KL-FIL-002, REQ-KL-FIL-019

**REQ-KL-FIL-002** · MUST · inferred · from act

The system MUST hold the Article 21 fee slabs as effective-dated data, so that the fee on a complaint is computed on the schedule in force on the date of presentation.

- *why* - Article 21 was inserted by the Kerala Finance Act, 2024 and its slabs were revised again by the Finance Act, 2025. A hard-coded percentage or ceiling silently mis-prices every complaint filed after the next Finance Act, and mis-prices in the other direction any older case whose fee has to be recomputed on remand or refund. The failure is invisible until an audit of the fee register.
- *authority* - Kerala Court Fees Act Art.21 (`kcf:art_21` - 21. Court fees on complaints, appeals and revisions under section 138 of the Negotiable Instruments Act, 1881)
- *binds* - schema-field: court fee schedule - effective from and effective to dates
- *test* - Two Article 21 schedules with different effective dates can coexist; a complaint presented under the earlier schedule is priced on it, and one presented after the later date is priced on the later schedule.
- *related* - REQ-KL-FIL-001

**REQ-KL-FIL-003** · MUST · firm · from rule

The system MUST levy process fees at the rates prescribed from time to time under the Kerala Court Fees and Suits Valuation Act, 1959.

- *why* - The process fee is not a figure the Criminal Rules fix: they point at a scale the Court Fees Act revises. A system that hard-codes a per-summons amount under-levies from the day the scale moves, and the shortfall surfaces as an unissued summons in a cheque case where every service cycle costs a hearing.
- *authority* - Criminal Rules r.273 (`crp:rule_273` - 273. Process fees)
- *binds* - schema-field: case fee ledger - process fee head
- *test* - The process fee charged on an issue of summons is read from a dated rate table rather than a constant, and revising the table changes the fee on a subsequent issue without a code change.
- *related* - REQ-KL-FIL-001, REQ-KL-FIL-032

**REQ-KL-FIL-004** · MUST · firm · from rule

The system MUST require, as a condition of accepting a written complaint, as many copies of the complaint as there are accused.

- *why* - Kerala's rule is not directory: a complaint not accompanied by a copy for each accused shall be returned. In a cheque case against a company under NI Act s.141 the accused are the company and each director in charge, so the count is not one, and a filing screen that asks for a single copy sends the complainant back from the counter and loses days against the one-month limitation period.
- *authority* - Criminal Rules r.24(1) (`crp:rule_24` - 24. Complainant to produce copies of complaint)
- *authority* - Criminal Rules r.24(2) (`crp:rule_24` - 24. Complainant to produce copies of complaint)
- *binds* - validation-rule: complaint intake - copies per accused
- *how* - As many copies on plain paper of the complaint as there are accused, filed along with the complaint.
- *test* - Add a second and third accused to a complaint; the required copy count rises with them, and acceptance is blocked until that many copies are attached.
- *tightens* - REQ-FIL-001
- *related* - REQ-KL-FIL-005

**REQ-KL-FIL-005** · MUST · firm · from rule

The system MUST record, for each copy of the complaint filed for an accused, that it has been verified and certified to be a true copy of the original by the complainant or by the pleader appearing for the complainant.

- *why* - An uncertified copy is the same defect as a missing copy under the Kerala rule, and attracts the same return. A system that counts attachments without capturing who certified them lets a bundle of unsigned photocopies through the filing screen, and the return comes from the Registry after the complaint has already been sitting in the queue.
- *authority* - Criminal Rules r.24(1) (`crp:rule_24` - 24. Complainant to produce copies of complaint)
- *binds* - schema-field: complaint copy - certification by complainant or pleader
- *how* - Verified and certified to be a true copy of the original by the complainant, or by his pleader or advocate where he is represented.
- *test* - Each copy record names the certifying person and their capacity; a copy with no certifier blocks acceptance.
- *related* - REQ-KL-FIL-004

**REQ-KL-FIL-006** · MUST · firm · from rule

The system MUST accept a complaint, petition, application, affidavit, memorandum of appeal or other proceeding only in English or in the language of the court.

- *why* - The court language in Kerala's subordinate courts is Malayalam, and the rule admits only that or English. A filing interface that accepts free text in any script will let through a complaint in a third language that the Registry must return, and a system that does not store the language of the document cannot later tell whether a translation is owed when the process or the record travels to a court of a different official language.
- *authority* - Criminal Rules r.27(1) (`crp:rule_27` - 27. Presentation and form of proceedings, petitions, documents and)
- *binds* - validation-rule: filed document - language
- *how* - All petitions, applications, affidavits, memoranda of appeal, revision petitions and other proceedings presented to a court shall be in English or in the language of the court.
- *test* - A document offered in a language that is neither English nor the court's own language is refused at presentation; the same document in the court's language is accepted.
- *related* - REQ-KL-SRV-003, REQ-KL-FIL-021, REQ-KL-FIL-033

**REQ-KL-FIL-007** · MUST · firm · from rule

The system MUST docket every filed proceeding with the name of the court, the number and year of the proceeding it relates to, the name of the person presenting it and the date of presentation.

- *why* - This docket is what identifies a loose paper once it is separated from the file, and the date of presentation on it is the date a limitation dispute turns on. A generated PDF that carries no docket block leaves the Registry writing it by hand, and a scanned copy filed later cannot be tied back to who presented it or when.
- *authority* - Criminal Rules r.27(2) (`crp:rule_27` - 27. Presentation and form of proceedings, petitions, documents and)
- *binds* - output-document: filed proceeding - docket endorsement
- *how* - Docketed on the reverse of the final page, endorsing the name of the court, the number and year of the proceedings to which it relates, the name of the person presenting the same and the date of presentation in court.
- *test* - Every generated filing carries all four docket particulars, and the date of presentation on the docket equals the stored presentation date.
- *related* - REQ-KL-FIL-008

**REQ-KL-FIL-008** · MUST · firm · from rule

The system MUST record the date on which a paper was received in court, stamped at the moment of receipt, as a field distinct from the date the case is numbered.

- *why* - Kerala requires the date stamp immediately on receipt, and that date - not the numbering date - is the date of institution. In a cheque case the two can be weeks apart, because a defective complaint is returned unnumbered and re-presented. A system that carries only a numbering date will show a complaint presented inside the month as instituted outside it, and there is nothing in the record to prove otherwise.
- *authority* - Criminal Rules r.28(1) (`crp:rule_28` - 28. Date stamping of papers and initialling of FIR by Magistrates)
- *binds* - schema-field: complaint - date of receipt in court, separate from date of numbering
- *how* - All papers presented in court shall be sealed with the date stamp of the court immediately they are received.
- *test* - The complaint record holds a receipt date and a numbering date as separate populated fields, and the receipt date is never derived from the numbering date.
- *tightens* - REQ-JUR-006
- *related* - REQ-KL-FIL-007, REQ-KL-LIM-001

**REQ-KL-FIL-009** · MUST NOT · firm · from rule

The system MUST NOT allocate a case number to a complaint, petition or other proceeding that does not comply with the prescribed requirements or is otherwise defective.

- *why* - Numbering is the act that puts a case on the register, and Kerala withholds it until the defect is cured. A system that assigns a number on receipt and then flags defects has already created a case that must be un-created, corrupts the register and the pendency count, and gives the complainant a number to quote for a filing the court has not accepted.
- *authority* - Criminal Rules r.68 (`crp:rule_68` - 68. Return of defective petitions and their representation)
- *authority* - Criminal Rules r.67 (`crp:rule_67` - 67. Miscellaneous Cases)
- *binds* - workflow-step: numbering - gated on a defect-free complaint
- *test* - A complaint with an open defect has no case number; the number is issued only once every defect is cleared, and the e-filing number is visibly not a case number.
- *related* - REQ-KL-FIL-010, REQ-KL-FIL-012

**REQ-KL-FIL-010** · MUST · firm · from rule

The system MUST record, on the return of a defective proceeding, the time specified for its amendment and representation.

- *why* - The Kerala rule returns a defective complaint 'for amendment and representation within a specified time', and that time is what decides whether the re-presentation needs a petition to excuse delay. A return that records only 'defective' leaves nobody able to say whether the complaint came back in time, and the complainant discovers the point when the re-presentation is itself objected to.
- *authority* - Criminal Rules r.68 (`crp:rule_68` - 68. Return of defective petitions and their representation)
- *authority* - Criminal Rules r.104 (`crp:rule_104` - 104. Return of defective petitions and their representation)
- *binds* - schema-field: return of a defective proceeding - time specified for representation
- *how* - Returned to the party, the pleader or the officer concerned for amendment and representation within a specified time.
- *test* - Every return record carries a specified representation deadline; a re-presentation after it is flagged as requiring a petition to excuse the delay.
- *related* - REQ-KL-FIL-009, REQ-KL-APL-005

**REQ-KL-FIL-011** · MUST · firm · from rule

The system MUST notify the e-filer, at their registered electronic mail address or other registered electronic mode, of every objection the Registry notes on scrutiny.

- *why* - The e-filer cannot cure what they have not been told. Kerala puts the objection back to the e-filer electronically, and a complaint whose objections sit only on an internal scrutiny screen simply stops moving - which is precisely the file-holding that the Kerala field note reports at the scrutiny desk. Notification is the auditable event that shows the file was not held.
- *authority* - Kerala E-Filing Rules r.17(1) (`kefr:rule_17` - 17. Residuary Provision)
- *authority* - Kerala E-Filing Rules r.17(2) (`kefr:rule_17` - 17. Residuary Provision)
- *binds* - workflow-step: scrutiny - communication of objections to the e-filer
- *how* - Objections noted on scrutiny of the pleadings or documents shall be informed to the e-filer at the electronic mail address or through any other electronic mode.
- *test* - Noting an objection despatches a notification to the e-filer's registered address and records the despatch time against the objection; an objection with no despatch record is reportable.
- *related* - REQ-KL-FIL-012, REQ-KL-FIL-009

**REQ-KL-FIL-012** · MUST NOT · firm · from rule

The system MUST NOT list an e-filed complaint before the court until every objection noted by the Registry has been cured.

- *why* - Kerala posts a matter before the court only after the noted objections are cured. A system that lists an objected complaint puts the Magistrate in front of a file the Registry has not passed, and the hearing is wasted on a defect that should never have reached the bench - which in a summary cheque trial is a whole cycle of the cause list.
- *authority* - Kerala E-Filing Rules r.17(3) (`kefr:rule_17` - 17. Residuary Provision)
- *authority* - Kerala E-Filing Rules r.17(4) (`kefr:rule_17` - 17. Residuary Provision)
- *binds* - validation-rule: listing - gated on cured objections
- *test* - A complaint with an uncured objection cannot be added to a cause list; clearing the last objection makes it listable.
- *related* - REQ-KL-FIL-011

**REQ-KL-FIL-013** · MUST · firm · from rule

In a court where the District Court Case Management System is in operation, the system MUST direct electronic filing of a complaint to the DCMS portal at filing.keralacourts.in and MUST NOT direct it to the national e-filing portal.

- *why* - From the date DCMS is implemented in a court, that portal is the only e-filing route. A complainant sent to the old national portal files into a queue the court no longer works, and the SOP's own remedy - processing legacy filings from the court end - applies only to what was filed before the rollout, not to a fresh cheque complaint filed to the wrong address after it.
- *authority* - DCMS e-Filing SOP, cl.1 (`dcms:para_1` - 1. Access to the DCMS e-Filing Portal)
- *authority* - DCMS e-Filing SOP, cl.4 (`dcms:para_4` - 4. e-Filing Facility)
- *binds* - screen: e-filing entry point for a DCMS court
- *how* - E-filing from the date of implementation of DCMS shall only be through https://filing.keralacourts.in.
- *test* - For a court flagged DCMS-enabled, the filing route resolves to the DCMS portal and the national portal is not offered.
- *related* - REQ-KL-FIL-014

**REQ-KL-FIL-014** · MUST · firm · from rule

The system MUST communicate acceptance of an e-filing, with the e-filing number, to the advocate or litigant by SMS or email.

- *why* - The e-filing number is the complainant's only proof that the court holds the complaint, in the window before it is numbered. Without the acknowledgement the complainant cannot track the case, cannot answer an objection against a reference they do not have, and cannot show, if the limitation point is taken, that the complaint reached the Registry when they say it did.
- *authority* - DCMS e-Filing SOP, cl.11 (`dcms:para_11` - 11. Acknowledgement and Scrutiny)
- *authority* - Kerala E-Filing Rules r.12 (`kefr:rule_12` - 12. Proof of Electronic Filing)
- *binds* - workflow-step: acceptance of e-filing - acknowledgement to the e-filer
- *how* - Upon acceptance the e-filing number is communicated to the advocate or litigant via SMS and/or email.
- *test* - Acceptance despatches an SMS or email carrying the e-filing number and stores the despatch against the filing.
- *related* - REQ-KL-FIL-013

**REQ-KL-FIL-015** · MUST NOT · firm · from rule

The system MUST NOT make scrutiny of an e-filed complaint conditional on the arrival of the physical file.

- *why* - Kerala's SOP is deliberate on this: scrutiny is done on the e-filed documents without waiting for the physical file, in sequential order and having regard to urgency. A workflow that opens the scrutiny task only after the paper is logged converts every filing into a paper-speed filing, and stacks days on to a cheque complaint that the one-month limitation and the six-month summary trial target cannot afford.
- *authority* - DCMS e-Filing SOP, cl.11 (`dcms:para_11` - 11. Acknowledgement and Scrutiny)
- *binds* - workflow-step: scrutiny - independent of physical file submission
- *how* - Scrutiny shall be done with the e-filed documents without waiting for the submission of the physical files, completed on time, in sequential order and considering the urgency of the matter.
- *test* - The scrutiny task for an e-filed complaint becomes actionable on acceptance, with no physical-file precondition, and the scrutiny queue is ordered by receipt with an urgency override.
- *related* - REQ-KL-FIL-016

**REQ-KL-FIL-016** · MUST · firm · from rule

The system MUST withhold a hearing date until the physical file has been submitted, except where the Judicial Officer has extended the time for its production.

- *why* - This is the outer limit of Kerala's digital filing as it stands, and modelling it wrongly in either direction hurts. A system that assigns a hearing date on e-filing alone produces a listing the court will not honour; one that has no extension path blocks a complainant whom the Judge has expressly allowed more time. The High Court records that it is considering dispensing with the physical file after the Kalpetta pilot, so the condition must be a court-level setting and not an assumption baked into the listing code.
- *authority* - DCMS e-Filing SOP, cl.12 (`dcms:para_12` - 12. Submission of Physical Files)
- *binds* - workflow-step: listing - gated on submission of the physical file
- *how* - Except as provided, the court will assign a hearing date only on submission of the physical file; in appropriate cases the Judicial Officer or Judge concerned may extend the time for production.
- *test* - No hearing date can be assigned before the physical file is logged, unless an extension order is recorded against the case; the requirement can be switched off for a court where the High Court has dispensed with it.
- *related* - REQ-KL-FIL-015, REQ-KL-FIL-017

**REQ-KL-FIL-017** · MUST · firm · from rule

The system MUST capture, with the physical file, the e-filer's undertaking that the files, petitions, documents and vakalaths produced in court are the same as those approved by the Chief Ministerial Officer.

- *why* - The undertaking is what makes the two records one case. Without it, nothing detects a physical bundle that differs from the approved electronic set - a substituted annexure, a differently worded complaint, a vakalath that was never scrutinised - and the trial proceeds on a paper file the digital record does not support.
- *authority* - DCMS e-Filing SOP, cl.12 (`dcms:para_12` - 12. Submission of Physical Files)
- *binds* - schema-field: physical file submission - undertaking of identity with the approved e-filing
- *how* - An undertaking that the case files, petitions, documents and vakalaths filed in court are the same as those approved by the CMO.
- *test* - Logging a physical file requires the undertaking and stores who gave it and when; a physical file logged without it is reportable.
- *related* - REQ-KL-FIL-016

**REQ-KL-FIL-018** · MUST · inferred · from rule

Where the court fee paid on an e-filed complaint is deficient, the system MUST offer payment of the balance through the balance payment facility rather than returning the filing.

- *why* - Kerala's answer to a short-paid fee is to take the balance: the SOP gives the deficit its own payment facility in DCMS. Returning the filing costs the complainant the days between return and re-presentation, and those days are counted against a one-month limitation period. The SOP provides the facility and says the balance may be paid through it; that the Registry is therefore not to return the filing for the shortfall is the reading of it rather than its words.
- *authority* - DCMS e-Filing SOP, cl.8 (`dcms:para_8` - 8. Court Fees and Payment of Deficient/Balance Court Fees)
- *binds* - workflow-step: court fee - payment of a deficit
- *how* - The deficit or balance amount may be paid using the Balance Payment facility in DCMS.
- *test* - A complaint with a fee shortfall shows a balance-payment action, and paying the balance clears the deficiency without a new filing or a new filing date.
- *related* - REQ-KL-FIL-001, REQ-KL-FIL-019

**REQ-KL-FIL-019** · MAY · firm · from rule

Where physical court fee or other stamps are unavailable, the system MAY allow the scrutinising officer to accept an undertaking from the e-filer and proceed with registration, with the fee payable afterwards through the balance payment route.

- *why* - This is the difference, in a Kerala cheque case, between a complaint registered on the day it was presented and one that waits on a stamp that the treasury has run out of. If the software makes payment an unconditional precondition of registration, the discretion the SOP gives the scrutinising officer cannot be exercised at all, and the filing date slips for a reason that has nothing to do with the complainant.
- *authority* - DCMS e-Filing SOP, cl.8 (`dcms:para_8` - 8. Court Fees and Payment of Deficient/Balance Court Fees)
- *binds* - workflow-step: registration on an undertaking in lieu of unavailable stamps
- *how* - The officer scrutinising the pleadings may accept an undertaking from the e-filer and proceed with case registration; the e-filer shall then pay the fee through the balance or deficit court fee payment option.
- *test* - Registration can proceed with an undertaking recorded in place of the stamp, the case carries an outstanding fee flag, and the flag clears only on balance payment.
- *related* - REQ-KL-FIL-018

**REQ-KL-FIL-020** · MUST · firm · from rule

Where the fee is paid by court fee stamps physically affixed, the system MUST record the cancellation of those stamps and the total stamp value noted on the document.

- *why* - Kerala still takes physical stamps on the categories the SOP leaves optional to e-file - exemption petitions, adjournment applications, surety affidavits, process memos - and on those the stamp must be cancelled by punching the insignia, initialled and dated, with the total value noted on top. DCMS dispenses with defacement only for portal-to-portal payment, so a system that assumes the DCMS position everywhere leaves live stamps on the physical file, re-usable and unaccounted.
- *authority* - Criminal Rules r.29 (`crp:rule_29` - 29. Cancellation of stamps)
- *authority* - DCMS e-Filing SOP, cl.10 (`dcms:para_10` - 10. Production of GRN Receipt and Defacement Not Required in DCMS)
- *binds* - workflow-step: physically affixed court fee stamps - cancellation
- *how* - Cancelled with the initials and date of the Presiding Officer or the Chief Ministerial Officer, the total stamp value noted on the top of the document, and the insignia of the State punched out leaving the designated amount untouched.
- *test* - A filing recorded as paid by physical stamps requires a cancellation entry naming the officer and the date and the total value; a filing paid through the portal requires none.
- *related* - REQ-KL-FIL-018

**REQ-KL-FIL-021** · MUST · firm · from rule

The system MUST require a pleading typed in the local language of the court to be Unicode text at the prescribed size, and MUST NOT accept it as an image or in a legacy non-Unicode font.

- *why* - Kerala's e-filing rules name Unicode for local-language typing precisely because a Malayalam pleading in a legacy ASCII-mapped font is unsearchable, unindexable and renders as nonsense on any machine without that font installed. In a cheque case that is the complaint itself: it cannot be found by search, its text cannot be extracted for the cause list, and the copy the accused receives may be unreadable.
- *authority* - Kerala E-Filing Rules r.5(2) (`kefr:rule_5` - 5. General Procedure)
- *binds* - validation-rule: pleading in the local language - Unicode encoding
- *how* - A document to be typed in the local language of the court shall be typed using UNICODE font at 12 point.
- *test* - Upload a Malayalam pleading in a legacy non-Unicode font and as a scanned image; both are rejected, and a Unicode Malayalam pleading is accepted and its text is extractable.
- *related* - REQ-KL-FIL-006, REQ-KL-FIL-022

**REQ-KL-FIL-022** · MUST · inferred · from rule

The system MUST require every e-filed pleading and supporting document to be an OCR-searchable PDF or PDF/A, non-text documents being scanned at 300 DPI in OCR-searchable mode.

- *why* - The cheque, the bank return memo and the demand notice all reach the file as scans. If they go in as flat images, no part of the case record is searchable, the Registry cannot verify the cheque number or the return reason without opening every page, and the High Court's own OCR tool exists precisely because this fails so often. Rule 5(3) states the PDF or PDF/A and OCR obligation for pleadings filed in the High Court; rule 5(5) states the 300 DPI OCR-searchable scan requirement generally for non-text documents enclosed with pleadings, and the DCMS SOP requires all e-filed pleadings and documents to conform to these Rules. Applying the pleading format to a district court cheque complaint is that reading rather than the letter of rule 5(3).
- *authority* - Kerala E-Filing Rules r.5(3) (`kefr:rule_5` - 5. General Procedure)
- *authority* - Kerala E-Filing Rules r.5(5) (`kefr:rule_5` - 5. General Procedure)
- *authority* - DCMS e-Filing SOP, cl.6 (`dcms:para_6` - 6. Filing Format, Exemptions and Limitation)
- *binds* - validation-rule: e-filed document - format and resolution
- *how* - PDF or PDF/A, converted into an OCR-searchable document; a non-text document scanned at an image resolution of 300 DPI in OCR-searchable mode.
- *test* - Upload a 150 DPI image-only PDF of a cheque; it is rejected with the OCR requirement stated, and a 300 DPI OCR-searchable scan is accepted.
- *related* - REQ-KL-FIL-021, REQ-KL-EVI-019

**REQ-KL-FIL-023** · MUST · inferred · from rule

The system MUST record which of the permitted authentication modes was used to sign each electronically filed document.

- *why* - Kerala allows a descending ladder - digital signature, Aadhaar-based e-signature, email or mobile OTP verification, and failing all three a wet-signed print that is scanned back in. The rule prescribes the ladder but does not in terms require the system to store which rung was used; that follows from the modes not being equivalent in evidential weight. If the record does not say which was used, no one can answer a challenge to the authenticity of a vakalath or an affidavit of evidence months later at trial.
- *authority* - Kerala E-Filing Rules r.6 (`kefr:rule_6` - 6. Digital Signature)
- *binds* - schema-field: e-filed document - authentication mode and signatory
- *how* - Digital signature of the advocate or party-in-person; failing that Aadhaar-based electronic signature with OTP; failing that email or mobile number OTP verification; failing all three, a physically signed print scanned and uploaded.
- *test* - Every e-filed document stores an authentication mode from the closed set and the identity of the signatory; a document with no mode cannot be submitted.
- *related* - REQ-KL-FIL-024

**REQ-KL-FIL-024** · MUST · firm · from rule

The system MUST render the vakalatnama in the prescribed judicial form, with the name or names of the pleader inserted before it is executed and both the date of execution and the date of acceptance recorded.

- *why* - A vakalatnama with the advocate's name filled in after execution is not a valid authority in Kerala, and the rule says so twice. In a cheque case the point surfaces when the accused challenges the complainant's power to act through counsel, and an undated or blank-name vakalath taken from a generated template cannot be repaired retrospectively.
- *authority* - Criminal Rules r.32(1) (`crp:rule_32` - 32. Form and attestation of vakkalath)
- *authority* - Kerala HC Rules r.19(1) (`khcr:rule_19` - 19. Form and attestation of Vakalath)
- *binds* - output-document: vakalatnama - form, named pleader, dates
- *how* - Judicial Form No. 57 in the subordinate courts and Form No. 1 in the High Court, unless the Court otherwise permits; the pleader's name inserted before execution; dated at the time of execution and of acceptance.
- *test* - The generated vakalatnama carries the prescribed form reference, refuses to render without a named pleader, and captures execution and acceptance dates separately.
- *related* - REQ-KL-FIL-025, REQ-KL-FIL-026

**REQ-KL-FIL-025** · MUST · firm · from rule

The system MUST record the attestation of a vakalatnama by one of the authorities the rules permit, who certifies that it was executed in their presence and subscribes their signature over their name and designation.

- *why* - Kerala closes the list of attesting authorities - judicial officers, registrars, the Chief Ministerial Officer, legislators, local authority office-bearers, village officers, gazetted officers, commissioned officers, and an advocate other than the one accepting it. A free-text attestation field lets any signature through, and the defect is found at the moment the accused disputes the complainant's representation, deep into a summary trial.
- *authority* - Criminal Rules r.32(2) (`crp:rule_32` - 32. Form and attestation of vakkalath)
- *authority* - Criminal Rules r.32(3) (`crp:rule_32` - 32. Form and attestation of vakkalath)
- *binds* - schema-field: vakalatnama - attesting authority and certificate
- *how* - Attested by an authority from the list in the rule, certifying due execution in his presence and subscribing his signature over his name and designation; where the executant is in custody, authenticated by the Jailor, Station House Officer or other officer-in-charge; where the pleader accepting it personally knows the executant, he may attest with an endorsement to that effect.
- *test* - The attesting authority is chosen from the enumerated list, the certificate text and the designation are captured, and a vakalatnama with no attestation record cannot be filed.
- *related* - REQ-KL-FIL-024

**REQ-KL-FIL-026** · MUST · firm · from rule

Where the executant of a vakalatnama is illiterate, blind or unacquainted with the language in which it is written, the system MUST capture the attestor's certificate that it was read, translated and explained in their presence to the executant, who appeared to understand it and signed or made a mark before them.

- *why* - This is the court-language rule biting on the complainant's own authority to act. A Malayalam-speaking payee handed an English vakalath, or an out-of-state complainant handed a Malayalam one, is exactly the case the rule is written for, and a system with a single attestation checkbox produces a vakalath that is voidable on a point nobody recorded at the counter.
- *authority* - Criminal Rules r.32(2) (`crp:rule_32` - 32. Form and attestation of vakkalath)
- *authority* - Kerala HC Rules r.19(2) (`khcr:rule_19` - 19. Form and attestation of Vakalath)
- *binds* - schema-field: vakalatnama - read, translated and explained certificate
- *how* - The attesting person certifies that the vakalatnama was read, translated and explained in his presence to the executant, that the executant seemed to understand it, and that he made his signature or thumb mark in his presence.
- *test* - Marking the executant as illiterate, blind or unacquainted with the document language makes the read-and-explained certificate mandatory before the vakalatnama can be filed.
- *related* - REQ-KL-FIL-025, REQ-KL-EVI-007

**REQ-KL-FIL-027** · MUST · firm · from rule

The system MUST capture, on a pleader's memorandum of appearance, the declaration that he is duly instructed, the number and year of the proceeding, the names of the parties, the name and position of the party he appears for, his roll number and his address.

- *why* - The roll number and address were added to this rule by amendment for a reason: they are what ties an appearance to a real enrolled advocate and give the court an address for service. A memorandum generated without them cannot be checked against the Bar Council roll, and every notice the court issues to counsel in the cheque case has nowhere to go.
- *authority* - Criminal Rules r.31 (`crp:rule_31` - 31. [Pleader to file Memo of Appearance)
- *authority* - Kerala HC Rules r.18 (`khcr:rule_18` - 18. Particulars in the memorandum)
- *binds* - output-document: memorandum of appearance - particulars
- *how* - A declaration that the pleader is duly instructed by or on behalf of the party he claims to represent, the number and year of the proceedings, the names of the parties to the proceedings, the name and position in the proceeding of the party for whom he appears, his roll number and his address.
- *test* - The generated memorandum carries all six particulars and cannot be filed with the roll number or address blank.
- *related* - REQ-KL-TRL-004

**REQ-KL-FIL-028** · MUST · firm · from rule

The system MUST require, before recording a new pleader for a party who already has one on record, either the written consent of the pleader on record or the special permission of the court.

- *why* - Nothing in a cheque case wastes a hearing more reliably than two advocates each believing they hold the file. Kerala resolves it at the point of entry: consent or leave. A system that lets a fresh vakalath silently displace the one on record leaves notices going to the previous address and the previous advocate unaware that he has been replaced.
- *authority* - Criminal Rules r.34 (`crp:rule_34` - 34. Change of pleader)
- *binds* - validation-rule: change of pleader - consent or leave
- *how* - The written consent of the pleader already on record, or, where he refuses, the special permission of the court.
- *test* - Filing a second vakalatnama for a party who has a pleader on record is blocked until either a consent record or a court permission record is attached.
- *related* - REQ-KL-FIL-024

**REQ-KL-FIL-029** · MUST · inferred · from practice-note

The system MUST record each scrutiny objection as an itemised defect attached to the specific document or requirement it relates to, and MUST NOT permit a filing to be objected to without one.

- *why* - The Kerala field note (KL-01) reports that defects are often not marked properly, so the advocate cannot tell what is wrong and has to approach the officer to find out. The rules give no licence for that: the Registry is to note the objections regarding non-compliance with named rules or practice directions. An objection recorded as a bare status, with no defect and no document, is unactionable by the e-filer, and the complaint stalls for a reason that exists nowhere in the record. The obligation is the rule's; the note is what shows where it fails.
- *authority* - Kerala E-Filing Rules r.17(1) (`kefr:rule_17` - 17. Residuary Provision)
- *authority* - Criminal Rules r.68 (`crp:rule_68` - 68. Return of defective petitions and their representation)
- *binds* - schema-field: scrutiny objection - itemised defect and the document it attaches to
- *how* - The Registry shall, on scrutiny of the pleadings or documents filed, note the objections regarding the non-compliance with these Rules or Practice Directions or any other law for the time being in force.
- *test* - A filing cannot be moved to objected without at least one objection record naming a document and a specific non-compliance; an objection with an empty defect cannot be saved.
- *related* - REQ-KL-FIL-011, REQ-KL-FIL-030, REQ-KL-FIL-031

**REQ-KL-FIL-030** · MUST · inferred · from practice-note

The system MUST present the scrutiny queue in sequential order of receipt, allow departure from that order only on a recorded ground of urgency, and expose the time each filing has been awaiting scrutiny.

- *why* - The SOP requires scrutiny to be completed on time and without delay, in sequential order and having regard to urgency. The Kerala field note (KL-01) reports files being held at this exact step so that the advocate approaches the officer. Whether or not that allegation is made out, a queue with no order, no urgency reason and no visible waiting time makes holding a file indistinguishable from working through a backlog, and neither the District Judge nor the complainant can tell the difference.
- *authority* - DCMS e-Filing SOP, cl.11 (`dcms:para_11` - 11. Acknowledgement and Scrutiny)
- *authority* - Kerala E-Filing Rules r.17(1) (`kefr:rule_17` - 17. Residuary Provision)
- *binds* - screen: scrutiny queue - order, urgency override and age
- *how* - Scrutiny carried out in sequential order and considering the urgency of the matter, completed on time and without delay.
- *test* - The scrutiny queue defaults to receipt order, taking an item out of order requires a recorded urgency ground, and each item shows the elapsed time since acceptance.
- *related* - REQ-KL-FIL-029, REQ-KL-FIL-015

**REQ-KL-FIL-031** · MUST · inferred · from practice-note

The system MUST record the identity of the officer who noted each scrutiny objection and of the officer who cleared it.

- *why* - The SOP puts the duty on the Chief Ministerial Officer or the designated officer by name, and the Kerala field note (KL-01) records that 'scrutiny officer' is a functional title the rules never use. Attribution is what turns an anonymous registry step into an accountable one: without it there is no way to see that a single desk is holding a set of files, and no way to answer the allegation either.
- *authority* - DCMS e-Filing SOP, cl.11 (`dcms:para_11` - 11. Acknowledgement and Scrutiny)
- *authority* - Kerala E-Filing Rules r.17(1) (`kefr:rule_17` - 17. Residuary Provision)
- *binds* - access-control: scrutiny action - attributed officer
- *test* - Every objection and every clearance stores the acting officer, and scrutiny actions can be reported by officer and by elapsed time.
- *related* - REQ-KL-FIL-029, REQ-KL-FIL-030

**REQ-KL-FIL-032** · MUST · inferred · from rule

The system MUST raise the fee and batta for the issue of process as a separate charge on each application for process, distinct from the fee paid on the complaint.

- *why* - The fee to file and the fee to issue process are two heads in Kerala, and the second recurs every time process reissues to an accused who has not been served: the party applying for process files a batta memo carrying the addressee's particulars together with the fees for that service. The rules do not say in terms that the two heads are held apart, but a ledger that folds process fees into the filing fee cannot show why summons was not issued when the process fee was unpaid, and cannot account for a reissue to a second accused.
- *authority* - Criminal Rules r.274 (`crp:rule_274` - 274. Batta memo)
- *authority* - Criminal Rules r.273 (`crp:rule_273` - 273. Process fees)
- *binds* - schema-field: case fee ledger - process fee head
- *how* - A batta memo containing the name, residence and full address of the persons on whom the process is to be served, together with the fees for such service and the batta, if any, prescribed.
- *test* - Issuing process twice against the same accused creates two process fee entries, each tied to its own batta memo and addressee, and neither entry alters the fee recorded on the complaint.
- *related* - REQ-KL-FIL-003, REQ-KL-FIL-001

**REQ-KL-FIL-033** · MUST · inferred · from rule

The system MUST record, against every filed proceeding, which of the two permitted languages it is written in.

- *why* - The rule permits two languages, and which one a document is in decides what has to happen next: process leaving a Malayalam court for a court of another official language carries an authorised English translation, and an affidavit or vakalatnama put to a party who does not read its language carries a read-and-explained certificate. The rule prescribes the permitted languages without requiring the choice to be stored; a record that does not store it cannot raise either downstream obligation, and the omission is found when the process comes back unserved or the attestation is challenged.
- *authority* - Criminal Rules r.27(1) (`crp:rule_27` - 27. Presentation and form of proceedings, petitions, documents and)
- *authority* - Criminal Rules r.14 (`crp:rule_14` - 14. Translation of Process)
- *binds* - schema-field: filed document - language
- *test* - Every filed document carries a stored language value from the closed set; issuing that document to a court of a different official language raises the translation requirement from the stored value rather than from a manual choice.
- *related* - REQ-KL-FIL-006, REQ-KL-SRV-003

#### SRV - service of summons and process (7)

**REQ-KL-SRV-001** · SHOULD · firm · from rule

The system SHOULD record the Chief Ministerial Officer of the court as the signatory of a summons issued to an accused or a witness.

- *why* - In Kerala the summons is ordinarily signed by the court's Chief Ministerial Officer, not by the Magistrate. The rule says ordinarily, so the signatory has to be a default the court can depart from rather than a constant. A template that hard-codes the Magistrate's signature block, or an unattributed 'signed by the court', produces process that does not answer the rule, and an accused in a cheque case who does not want to appear will take the point on the first return.
- *authority* - Criminal Rules r.7(1) (`crp:rule_7` - 7. Signing of summons)
- *binds* - output-document: summons - signatory
- *how* - Summonses issued to accused and witnesses shall ordinarily be signed by the Chief Ministerial Officer of the court.
- *test* - A generated summons defaults to the Chief Ministerial Officer as signatory and stores the identity of the officer who signed; another signatory can be recorded only as a departure from that default, and the process shows who signed it.
- *tightens* - REQ-SRV-003
- *related* - REQ-KL-SRV-002

**REQ-KL-SRV-002** · MUST · firm · from rule

The system MUST prefix the words 'By order of the Court' to the ministerial officer's signature on a summons.

- *why* - The formula is what makes a ministerial officer's signature the court's act rather than his own, and the rule says it shall invariably appear. Its absence is a facial defect on the process, and in a cheque case where the accused is contesting service it hands the defence a clean objection before the merits are reached.
- *authority* - Criminal Rules r.7(2) (`crp:rule_7` - 7. Signing of summons)
- *binds* - output-document: summons - words preceding the ministerial signature
- *how* - The words 'By order of the Court' shall invariably be prefixed to the signature of the ministerial officer.
- *test* - The rendered summons carries the exact words immediately above the signature block, and the words cannot be edited out of the template.
- *related* - REQ-KL-SRV-001

**REQ-KL-SRV-003** · MUST · firm · from rule

Where process is issued in a language other than the official language of the receiving court, the system MUST accompany it with an authorised English translation.

- *why* - A Kollam court issuing a Malayalam summons to an accused resident in another state sends it to a court whose official language is not Malayalam. Without the English translation the receiving court cannot serve it, the process comes back unserved after weeks, and the cheque case sits at the service stage while the warrant ladder starts for a reason that was avoidable at issue.
- *authority* - Criminal Rules r.14 (`crp:rule_14` - 14. Translation of Process)
- *binds* - output-document: process for a court of a different official language - English translation
- *how* - Such process shall be accompanied by an authorised English translation thereof.
- *test* - Issuing process to a court whose official language differs from the language of the process requires an attached English translation and records who authorised it; the issue is blocked without one.
- *tightens* - (national requirement not yet numbered) the national requirement that summons be served through the court within whose jurisdiction the person resides
- *related* - REQ-KL-SRV-004, REQ-KL-FIL-006

**REQ-KL-SRV-004** · MUST · firm · from rule

The system MUST require an authorised English translation of the receiving court's report of service or non-service, where that report is neither in English nor in the language of the issuing court.

- *why* - The return is the evidence of service, and in a contested cheque case it is the document the Magistrate reads before issuing a warrant or proceeding in absence. A Malayalam issuing court that receives an untranslated report in a third language cannot act on it, and the case adjourns for a translation that should have travelled with the return.
- *authority* - Criminal Rules r.14 (`crp:rule_14` - 14. Translation of Process)
- *binds* - schema-field: service return - authorised English translation
- *how* - The report from the receiving court shall be accompanied by an authorised English translation, if the report is not in English or in the language of the court which issued the summons.
- *test* - A service return recorded in a language that is neither English nor the issuing court's language cannot be accepted without an attached authorised translation.
- *related* - REQ-KL-SRV-003

**REQ-KL-SRV-005** · MUST NOT · firm · from rule

The system MUST NOT treat electronic service under the Kerala e-filing regime as discharging the mode of service prescribed by the governing Act or Rules; it MUST record electronic service as in addition to it.

- *why* - Both sub-rules say the electronic mode is in addition to the prescribed mode of service under the relevant Acts and Rules. A workflow that marks the accused served once the summons is emailed will proceed to a warrant on a service that is not good in law, and the whole ladder from that point - warrant, proclamation, attachment - is liable to be set aside.
- *authority* - Kerala E-Filing Rules r.11(1) (`kefr:rule_11` - 11. Service through Electronic Means)
- *authority* - Kerala E-Filing Rules r.11(2) (`kefr:rule_11` - 11. Service through Electronic Means)
- *binds* - validation-rule: service status - electronic service as an additional mode
- *test* - Recording electronic service alone leaves the accused's service status incomplete; the status turns served only when a prescribed mode is also recorded.
- *tightens* - REQ-SRV-012
- *related* - REQ-KL-SRV-003

**REQ-KL-SRV-006** · MUST · firm · from rule

Where a police officer is summoned as a witness, the system MUST route the summons through his superior officer.

- *why* - A cheque case rarely calls a police witness, but when it does - to prove an address, or a connected complaint - a summons sent to the officer directly is not served in the way the Kerala rule requires, and the department will not release him. The rule also allows a direct postal intimation of the date so the officer knows to expect it, which is what actually secures attendance.
- *authority* - Criminal Rules r.10(1) (`crp:rule_10` - 10. Summons to Police Officers)
- *authority* - Criminal Rules r.10(2) (`crp:rule_10` - 10. Summons to Police Officers)
- *binds* - workflow-step: summons to a police officer witness - routing
- *how* - Issued through their superior officers, with the court free to send the witness a direct postal notice of the date of appearance stating that the summons is being sent through proper channel, allowing sufficient time.
- *test* - Marking a witness as a police officer changes the addressee of the summons to the superior officer and offers the direct intimation as a second despatch.

**REQ-KL-SRV-007** · MUST · inferred · from act

The system MUST resolve the police station within whose notified area of jurisdiction the address for service falls, and MUST name the Station House Officer of that station as the officer to execute the process.

- *why* - Kerala police jurisdiction is notified station by station, and the Station House Officer is the designated officer in charge of each. Process directed to the wrong station is returned unexecuted, and in a cheque case that is the difference between an accused appearing on the first date and a warrant issuing against someone who was never reached. The Act names the office rather than the process routing, so this states the consequence rather than the letter.
- *authority* - Kerala Police Act §5(3) (`kpa:sec_5` - 5. Establishment of police stations)
- *authority* - Kerala Police Act §4(n) (`kpa:sec_4` - 4. The functions of the police)
- *binds* - schema-field: process for execution - police station and Station House Officer
- *test* - Two addresses for service falling in different notified station jurisdictions produce different executing stations on the process; an address that resolves to no notified station cannot be issued against, and the executing officer stored is the Station House Officer of the resolved station rather than free text.

#### EVI - evidence, affidavits, documents (23)

**REQ-KL-EVI-001** · MUST · firm · from rule

The system MUST render an affidavit in the first person and in consecutively numbered paragraphs, each paragraph confined as nearly as may be to a distinct portion of the subject matter.

- *why* - In a Kerala cheque trial the complainant's evidence in chief arrives as an affidavit, and it is cross-examined paragraph by paragraph. An affidavit template that emits unnumbered running prose, or that slips into the third person because it was generated from case data, cannot be put to the deponent paragraph by paragraph and invites an objection to the whole document.
- *authority* - Criminal Rules r.37 (`crp:rule_37` - 37. Form of affidavit)
- *binds* - output-document: affidavit - structure
- *how* - Drawn up in the first person and divided into paragraphs numbered consecutively, each paragraph confined as nearly as may be to a distinct portion of the subject matter.
- *test* - The generated affidavit is in the first person with consecutively numbered paragraphs, and paragraph numbers are stable references usable in a cross-examination note.
- *tightens* - REQ-EVI-001
- *related* - REQ-KL-EVI-002, REQ-KL-EVI-011

**REQ-KL-EVI-002** · MUST · firm · from rule

The system MUST capture the deponent's full name, age, description and place of abode on every affidavit, the description including the father's, karanavan's, husband's or mother's name and any further particulars needed to identify the person.

- *why* - Kerala names the relations expressly, including the karanavan, because identifying a deponent by name alone is unsafe where names repeat. In a cheque case the affidavit of evidence is the complainant's whole examination in chief; if the deponent cannot be identified from the document, the affidavit is worth nothing when the accused disputes who deposed to it.
- *authority* - Criminal Rules r.38 (`crp:rule_38` - 38. Contents of affidavit)
- *binds* - schema-field: affidavit - deponent particulars
- *how* - The full name, age, description and place of abode of the deponent, the description including the father's or karanavan's or husband's or mother's name and such other particulars as may be necessary to identify the person.
- *test* - The affidavit cannot be generated without name, age, place of abode and at least one of the named relations; the rendered document shows all of them.
- *tightens* - REQ-EVI-001
- *related* - REQ-KL-EVI-001, REQ-KL-EVI-003

**REQ-KL-EVI-003** · MUST · firm · from rule

Where an affidavit runs to more than one page, the system MUST require the deponent's signature on every page.

- *why* - A single signature on the last page leaves the earlier pages substitutable, which is why Kerala requires each one signed. An affidavit of evidence in a cheque case runs to several pages of the transaction history, and an unsigned interior page is the first thing the defence looks for when it wants the affidavit excluded.
- *authority* - Criminal Rules r.38 (`crp:rule_38` - 38. Contents of affidavit)
- *binds* - validation-rule: affidavit - signature on every page
- *how* - Where the affidavit covers more than one page, the deponent shall sign every page.
- *test* - A multi-page affidavit uploaded with signatures on only the last page is rejected; the signature count must equal the page count.
- *related* - REQ-KL-EVI-002

**REQ-KL-EVI-004** · MUST · firm · from rule

The system MUST require every alteration, erasure or interlineation in an affidavit to be authenticated by the person before whom it is signed, before it is sworn or affirmed, and MUST NOT allow an unauthenticated one to be filed or used without the leave of the court.

- *why* - A cheque figure or a date changed by hand on an affidavit, with nothing to show who changed it or when, is precisely the document this rule exists to keep out. If the system accepts an amended affidavit without recording the authentication, the correction looks like a forgery on the face of the record and the complainant's own evidence becomes the weak point in the case.
- *authority* - Criminal Rules r.39 (`crp:rule_39` - 39. Alterations, erasures, etc)
- *binds* - validation-rule: affidavit - authenticated corrections
- *how* - Alterations, erasures and interlineations authenticated, before the affidavit is sworn or affirmed, by the person before whom it is signed.
- *test* - An affidavit recorded as carrying a correction cannot be filed unless the authentication is recorded, or a leave of court order is attached.
- *related* - REQ-KL-EVI-005

**REQ-KL-EVI-005** · MUST · firm · from rule

The system MUST restrict the person before whom an affidavit is sworn or affirmed to one of the authorities the rules enumerate.

- *why* - The list is closed - judicial officers, District or Sub-Registrars, the Chief Ministerial Officer of any civil or criminal court in Kerala, legislators, named local authority office-bearers, gazetted officers, commissioned officers, and advocates. An affidavit of evidence sworn before someone outside it is not an affidavit for these rules at all, and in a summary cheque trial the complainant discovers this only when the document is refused at the point it is tendered.
- *authority* - Criminal Rules r.40(1) (`crp:rule_40` - 40. Persons authenticating affidavit and mode of authentication)
- *authority* - Kerala HC Rules r.76 (`khcr:rule_76` - 76. Persons authenticating affidavits)
- *binds* - validation-rule: affidavit - permitted authenticating authority
- *how* - Sworn or affirmed before a judicial officer, a District Registrar or Sub-Registrar, the Chief Ministerial Officer of any civil or criminal court in the State of Kerala, a Member of Parliament or of a State Legislature, the Mayor, Chairman, President, Executive Authority or a Member of a Municipal Corporation, Municipal Council or other local authority in India, a gazetted officer, a Commissioned Officer in the Defence Forces of India, or an advocate.
- *test* - The authenticating authority is selected from the enumerated list; a free-text or out-of-list authority cannot be saved against an affidavit.
- *related* - REQ-KL-EVI-006

**REQ-KL-EVI-006** · MUST · firm · from rule

The system MUST render, at the foot of every affidavit, a jurat in the prescribed judicial form stating the date on which and the place where it was sworn or affirmed, signed by the authenticating person over his name and designation.

- *why* - Without the date and place the affidavit cannot be placed in time, which matters directly in a cheque case where an affidavit sworn before the demand notice was even served would be worthless. Kerala prescribes the form of the jurat, so it is not a free-text block a template may improvise.
- *authority* - Criminal Rules r.40(2) (`crp:rule_40` - 40. Persons authenticating affidavit and mode of authentication)
- *authority* - Kerala HC Rules r.77 (`khcr:rule_77` - 77. Mode of authentication)
- *binds* - output-document: affidavit - jurat
- *how* - As in Judicial Form No. 58 in the subordinate courts and Form No. 4 in the High Court: the date on which and the place where the affidavit was made, signed by the person before whom it was sworn or affirmed under his name and designation.
- *test* - The rendered affidavit carries the prescribed jurat with date, place, signature, name and designation, and the affidavit record stores each as a field.
- *related* - REQ-KL-EVI-005

**REQ-KL-EVI-007** · MUST · firm · from rule

Where the deponent appears to be illiterate, blind or unacquainted with the language in which the affidavit is written, the system MUST capture the authenticating person's certificate that the affidavit was read, explained and translated to the deponent, who seemed to understand it and signed or made his mark in that person's presence.

- *why* - The complainant in a Kerala cheque case may speak only Malayalam while the affidavit of evidence is drafted in English by counsel. The rule turns that gap into a recorded certificate rather than a later allegation that the deponent never knew what he swore to. A system with one generic attestation field cannot produce this certificate, and the point is taken in cross-examination when it can no longer be cured.
- *authority* - Criminal Rules r.41 (`crp:rule_41` - 41. Blind or illiterate deponent)
- *authority* - Kerala HC Rules r.78 (`khcr:rule_78` - 78. Blind or Illiterate deponent)
- *binds* - schema-field: affidavit - read, explained and translated certificate
- *how* - Certified by the person authenticating the affidavit that it was read, explained and translated by him or in his presence to the deponent, that the deponent seemed to understand it, and that he made his signature or mark in the presence of the person authenticating it.
- *test* - Flagging the deponent as illiterate, blind or unacquainted with the affidavit's language makes the certificate mandatory and prints it on the document.
- *related* - REQ-KL-FIL-026, REQ-KL-EVI-015

**REQ-KL-EVI-008** · MUST · firm · from rule

The system MUST require every affidavit to express how much of it is a statement of the deponent's knowledge and how much a statement of his belief, and to state the grounds of belief with sufficient particularity.

- *why* - A complainant's affidavit that asserts the accused's intention, or the state of the accused's bank account, is stating belief and must say so. In a cheque case where the presumption under NI Act s.139 is being rebutted, an affidavit that blurs knowledge into belief gives the accused an easy line of cross-examination and can cost the complainant the presumption's benefit.
- *authority* - Criminal Rules r.45 (`crp:rule_45` - 45. Affidavit on information or belief)
- *authority* - Kerala HC Rules r.82 (`khcr:rule_82` - 82. Affidavit on information or relief)
- *binds* - output-document: affidavit - separation of knowledge from belief
- *how* - The grounds of belief stated with sufficient particularity to enable the Court to judge whether it would be safe to act upon the deponent's belief; in the High Court, as in Form No. 7.
- *test* - The affidavit structure distinguishes statements on knowledge from statements on belief, and a belief statement requires an accompanying ground.
- *related* - REQ-KL-EVI-001

**REQ-KL-EVI-009** · MUST · firm · from rule

The system MUST mark documents accompanying an affidavit as exhibits in the same manner as exhibits admitted by the court, and MUST attach to each the prescribed certificate signed by the officer before whom the affidavit was taken.

- *why* - The cheque, the return memo and the demand notice travel with the complainant's affidavit of evidence. If they are attached as loose annexures with no exhibit mark and no certificate, the court has to re-identify each of them through the witness when it comes to marking, and the summary trial that NI Act s.143 contemplates turns into an ordinary one.
- *authority* - Criminal Rules r.43 (`crp:rule_43` - 43. Documents referred to in affidavits)
- *authority* - Kerala HC Rules r.80 (`khcr:rule_80` - 80. Documents referred to in affidavits)
- *binds* - output-document: affidavit exhibit - marking and certificate
- *how* - Referred to as exhibits, marked in the same manner as exhibits admitted by the court, and bearing a certificate as in Judicial Form No. 59 in the subordinate courts and Form No. 6 in the High Court, signed by the officer before whom the affidavit is taken.
- *test* - Each document attached to an affidavit gets an exhibit mark and a rendered certificate naming the officer; an attachment without both is reportable.
- *related* - REQ-KL-EVI-012

**REQ-KL-EVI-010** · MUST NOT · firm · from rule

The system MUST NOT allow an affidavit to be used at a hearing unless it has been filed in court and a copy given to the opposite side at least three days before that hearing, save with the leave of the court.

- *why* - This is a hard state deadline sitting on top of the national permission to lead evidence on affidavit. A complainant who uploads the affidavit of evidence on the morning of the hearing cannot use it, and the hearing is lost. A system that lets an affidavit be tendered the same day, with no service-on-the-other-side timestamp, will schedule hearings that cannot proceed.
- *authority* - Criminal Rules r.46 (`crp:rule_46` - 46. Filing of affidavits in Courts)
- *authority* - Kerala HC Rules r.83 (`khcr:rule_83` - 83. Filing of affidavits in Court)
- *binds* - validation-rule: affidavit - three day filing and service window
- *how* - Filed in court and a copy given to the opposite side at least three days before the hearing, unless the court grants leave.
- *test* - An affidavit whose filing or service on the opposite party is less than three days before the listed hearing is flagged unusable, and can only be used with a recorded leave order.
- *tightens* - REQ-EVI-001
- *related* - REQ-KL-EVI-011

**REQ-KL-EVI-011** · MUST · inferred · from rule

The system MUST record the date on which a copy of each affidavit was given to the opposite party, separately from the date the affidavit was filed in court.

- *why* - The rule requires both events - filing in court, and giving a copy to the opposite side - to have happened three days before the hearing, so the usable date is the later of the two; counter-affidavits are keyed to the day the copy was given. The rule does not in terms say the two dates are to be stored separately, but a record that carries only the filing date cannot show whether the accused had the complainant's evidence in time, and every dispute about it becomes oral.
- *authority* - Criminal Rules r.46 (`crp:rule_46` - 46. Filing of affidavits in Courts)
- *authority* - Criminal Rules r.48 (`crp:rule_48` - 48. Counter affidavits)
- *binds* - schema-field: affidavit - date copy given to the opposite party
- *test* - The affidavit record holds a filing date and a service-on-opposite-party date as distinct populated fields, and the three-day check uses the later of them.
- *related* - REQ-KL-EVI-010

**REQ-KL-EVI-012** · MUST · firm · from rule

The system MUST mark exhibits by the party who filed them, using the prescribed capital letter and a continuing numeral, and MUST run the numerals consecutively across exhibits marked by several accused.

- *why* - P, D and C with running numerals is how a Kerala record is read on appeal. A system that marks exhibits by upload order, or restarts numbering per accused where the rule requires exhibits marked by several accused to run consecutively, produces a record in which the judgment's references do not resolve to the documents.
- *authority* - Criminal Rules r.62(1) (`crp:rule_62` - 62. Marking of exhibits)
- *authority* - Criminal Rules r.62(2) (`crp:rule_62` - 62. Marking of exhibits)
- *binds* - schema-field: exhibit mark
- *how* - Prosecution exhibits P1, P2, P3; defence exhibits D1, D2, D3; court exhibits C1, C2, C3; exhibits marked by several accused numbered consecutively.
- *test* - Mark documents for the complainant, for two separate accused and by the court; the marks take the prescribed letters and the defence numerals run consecutively across both accused rather than restarting at D1.
- *related* - REQ-KL-EVI-009, REQ-KL-EVI-023

**REQ-KL-EVI-013** · MUST · inferred · from rule

The system MUST record that an interpreter took an oath or made an affirmation before being called upon to interpret, in the form the rules prescribe for an interpreter.

- *why* - The interpreter's oath is a separate oath from the witness's, in different words - to well and truly interpret and explain all questions put and evidence given. Kerala's court language is Malayalam, so a bank official or an out-of-state accused giving evidence through an interpreter is ordinary in a cheque case. If the record does not show the interpreter was sworn, the evidence taken through him is open to challenge in its entirety.
- *authority* - Criminal Rules r.52 (`crp:rule_52` - 52. Oath to interpreter)
- *authority* - Criminal Rules r.49 (`crp:rule_49` - 49. Swearing in of witnesses)
- *binds* - schema-field: interpreter - oath or affirmation record
- *how* - The prescribed form: to well and truly interpret and explain all questions put to and evidence given by witnesses.
- *test* - Assigning an interpreter to an examination requires an oath record for that interpreter before evidence can be recorded in the session.
- *tightens* - REQ-EVI-007
- *related* - REQ-KL-EVI-014, REQ-KL-EVI-015, REQ-KL-EVI-017

**REQ-KL-EVI-014** · MUST · inferred · from rule

The system MUST record that the oath to a witness or interpreter was administered in open court by the Presiding Officer or by a person he has empowered in that behalf, or by the Commissioner where the witness is examined on commission.

- *why* - Who administered the oath, and whether it happened in open court, are the facts that make the deposition admissible. A record that simply carries a sworn flag cannot answer a challenge that the oath was administered in chambers or by a clerk with no authority, and in a cheque trial conducted partly over video the question is a live one.
- *authority* - Criminal Rules r.50 (`crp:rule_50` - 50. Officer administering oath)
- *binds* - schema-field: oath - administering officer and setting
- *how* - Administered in open court by the Presiding Officer or by such other person as he has empowered in that behalf, or, where the witness is examined on commission, by the Commissioner.
- *test* - Every oath record names the officer who administered it and the authority under which he did so; a sworn flag with no administering officer cannot be saved.
- *tightens* - REQ-EVI-006
- *related* - REQ-KL-EVI-013

**REQ-KL-EVI-015** · MUST · inferred · from rule

Where a witness cannot understand the language in which the oath or affirmation is administered, the system MUST record that it was translated by the interpreter, put to the witness, and taken by the witness in a language known to him.

- *why* - An oath the witness did not understand binds nobody. In Kerala the oath is put in Malayalam, so a non-Malayalam-speaking accused giving evidence, or a bank witness from outside the state, must be sworn through the interpreter and in his own language. A system that captures a single sworn flag erases the whole event and leaves the deposition's foundation unproved.
- *authority* - Criminal Rules r.53 (`crp:rule_53` - 53. Translation of oath)
- *authority* - Criminal Rules r.51 (`crp:rule_51` - 51. Form of oath)
- *binds* - schema-field: oath - language of administration and translation
- *how* - The oath or affirmation is translated by the interpreter and put to the witness, and the witness is allowed to take it in the language known to him.
- *test* - Where the witness's language differs from the language of the oath, the oath record captures the translating interpreter and the language in which the oath was actually taken.
- *related* - REQ-KL-EVI-013, REQ-KL-EVI-007

**REQ-KL-EVI-016** · MUST · firm · from rule

The system MUST record, in the heading of a deposition, the witness's full name including the family name, the father's, mother's or husband's name, and the age, profession and residence of the witness.

- *why* - The deposition heading is how a witness is identified years later on appeal or in a connected case, when the same common name appears on several files. A deposition captured under a display name and a case-party role cannot be tied to a person, and where the witness is a bank officer proving the return memo, the profession and place are the very particulars that establish his competence to prove it.
- *authority* - Criminal Rules r.56 (`crp:rule_56` - 56. Heading of depositions)
- *binds* - output-document: deposition - heading particulars
- *how* - The full name including the family name of the deponent, his or her father's or mother's or husband's name, and the age, profession and residence of the witness.
- *test* - The rendered deposition heading carries all the listed particulars, drawn from stored fields rather than free text.
- *related* - REQ-KL-EVI-017

**REQ-KL-EVI-017** · MUST · firm · from rule

Where a witness is examined through an interpreter, the system MUST print the interpreter's name in the deposition heading, below the witness's particulars.

- *why* - Kerala puts the interpreter on the face of the deposition because the accuracy of the evidence is only as good as the interpretation, and a challenge to the evidence is a challenge to a named person. A deposition that records the interpretation as an internal attribute leaves the appellate court unable to see, from the document, that the evidence was interpreted at all.
- *authority* - Criminal Rules r.56 (`crp:rule_56` - 56. Heading of depositions)
- *binds* - output-document: deposition - interpreter named in the heading
- *how* - The name of the interpreter, if any, written below the witness's name, age, profession and residence.
- *test* - Assigning an interpreter to an examination causes the interpreter's name to appear in the rendered deposition heading below the witness particulars.
- *related* - REQ-KL-EVI-013, REQ-KL-EVI-016

**REQ-KL-EVI-018** · MUST · firm · from rule

The system MUST require a deposition to be read over to the witness and signed in full by him on its last page, and MUST require the Judge to initial every page not recorded in his own hand.

- *why* - A cheque trial's cross-examination is typed by a stenographer, so every page is a page not in the Judge's hand. Unless each is initialled and the witness signs the last page after the read-over, there is nothing distinguishing the record from a transcript typed afterwards, and the deposition can be disputed page by page.
- *authority* - Criminal Rules r.57 (`crp:rule_57` - 57. Signing of depositions)
- *binds* - workflow-step: deposition - read over, signed and initialled
- *how* - After the deposition has been read over to the witness, the last page is signed in full by him, and the Judge initials every page if the deposition is not recorded in his hand.
- *test* - Closing a deposition requires a witness signature on the final page and a judicial initial on every page recorded by a stenographer.
- *related* - REQ-KL-EVI-019

**REQ-KL-EVI-019** · MUST · firm · from rule

The system MUST append to every deposition the prescribed certificate, signed by the Judge over his name, stating whether it was taken down by him or before him and whether it was interpreted or read over to the witness and admitted by him to be correct.

- *why* - The certificate is where the interpretation and the read-over are proved. Kerala prescribes its words, and the alternatives in it are not decorative - a deposition certified as read over when it was in fact interpreted misdescribes what happened at the hearing, and that is the first thing tested when the accused says the witness never said what the record shows.
- *authority* - Criminal Rules r.57 (`crp:rule_57` - 57. Signing of depositions)
- *binds* - output-document: deposition - Judge's certificate
- *how* - The certificate in the prescribed words, with the alternatives resolved: taken down by me or before me in open court, interpreted or read over to the witness and admitted by him to be correct, signed by the Judge over his name.
- *test* - The rendered certificate resolves each alternative from stored facts rather than printing both, and cannot be produced without the Judge's name.
- *related* - REQ-KL-EVI-018, REQ-KL-EVI-017

**REQ-KL-EVI-020** · MUST · firm · from rule

Where a document produced with a pleading is not the original, the system MUST carry the producing advocate's or party's endorsement on the top of its first page stating that it is a certified copy or a photocopy and not the original.

- *why* - The cheque and the bank return memo are the case. Kerala requires the party who produces a copy to say on the face of it that it is a copy, and a system that uploads scans with no such endorsement leaves the court unable to tell a scanned original from a scanned photocopy - which is exactly the confusion that lets a disputed cheque be treated as proved.
- *authority* - Kerala E-Filing Rules r.5(6) (`kefr:rule_5` - 5. General Procedure)
- *binds* - output-document: e-filed document that is not the original - endorsement
- *how* - Endorsed on the top of the first page by the advocate or party-in-person producing it, that the document is not the original and is only a certified copy or a photocopy.
- *test* - Marking an uploaded document as a copy stamps the endorsement on the first page of the stored PDF; a document marked as a copy without the endorsement cannot be filed.
- *tightens* - REQ-EVI-003
- *related* - REQ-KL-EVI-021, REQ-KL-FIL-022

**REQ-KL-EVI-021** · MUST · firm · from rule

Where the original of an e-filed document is not clearly legible, the system MUST require a typed copy certified by the advocate or party-in-person to be scanned and uploaded alongside it.

- *why* - A handwritten cheque, a faint bank stamp on a return memo and a carbon-copy acknowledgement of a demand notice are all routinely illegible once scanned. Kerala's answer is a certified typed copy filed with the original. Without it the Registry cannot read the cheque number or the return reason at scrutiny, and the objection comes back to the complainant days later.
- *authority* - Kerala E-Filing Rules r.5(5) (`kefr:rule_5` - 5. General Procedure)
- *binds* - workflow-step: illegible original - certified typed copy
- *how* - A typed copy of the document, duly certified by the advocate or party-in-person, scanned and uploaded along with the original.
- *test* - Flagging an uploaded document as not clearly legible requires a second file recorded as the certified typed copy before the filing can be submitted.
- *related* - REQ-KL-EVI-020

**REQ-KL-EVI-022** · MUST · firm · from rule

The system MUST record, against every scanned document, the person who electronically filed it as the person responsible for producing the original when the court directs.

- *why* - The Kerala rule puts that responsibility on the e-filer by name. When the accused disputes the cheque and the court calls for the original, the case stalls if nobody can say who holds it - and the complainant's advocate, the clerk who uploaded it and the litigant will each point at the others.
- *authority* - Kerala E-Filing Rules r.8(1) (`kefr:rule_8` - 8. Retention of Original Documents)
- *authority* - Kerala E-Filing Rules r.8(3) (`kefr:rule_8` - 8. Retention of Original Documents)
- *binds* - schema-field: scanned document - person responsible for the original
- *test* - Every scanned document stores the e-filer responsible for its original, and a call for production resolves to that person.
- *related* - REQ-KL-REC-008

**REQ-KL-EVI-023** · MUST · firm · from rule

The system MUST number material objects in a single continuous Arabic series, whether they are exhibited for the prosecution, the defence or the court.

- *why* - The material object series is deliberately not split by party, so that M.O. 3 identifies one thing in the case and not three. A store that numbers material objects inside each party's own sequence produces a record in which a judgment's reference to a material object is ambiguous, and the object cannot be traced through the record on appeal.
- *authority* - Criminal Rules r.62(3) (`crp:rule_62` - 62. Marking of exhibits)
- *binds* - schema-field: material object number
- *how* - All material objects marked in Arabic numbers in continuous series, whether exhibited for the prosecution or the defence or the Court, as M.O. 1, M.O. 2, M.O. 3.
- *test* - Material objects produced by the complainant, by the accused and by the court take numbers from one shared counter, and no two objects in the case carry the same number.
- *related* - REQ-KL-EVI-012

#### JUR - jurisdiction, cognizance, the competent court (3)

**REQ-KL-JUR-001** · MUST NOT · inferred · from rule

The system MUST NOT allocate to the Special Court of Judicial Magistrate of the First Class at Kollam any case other than one under section 138 of the Negotiable Instruments Act.

- *why* - The notification establishes that court to try cases under section 138 of the Negotiable Instruments Act. It confers the designation rather than expressly forbidding other work, so the exclusion is the reading of it. A case-allocation rule that treats the court as an ordinary additional JMFC will route unrelated criminal work to it, defeating the point of the designation and diluting the disposal rate the pilot exists to demonstrate.
- *authority* - G.O. 241/2024 §1 (`go241:sec_1` - 1. Establishment of the Special Court for section 138 cases)
- *binds* - validation-rule: case allocation to the Kollam Special Court
- *test* - Attempting to allocate a case of any type other than NI Act s.138 to the Kollam Special Court is refused.
- *related* - REQ-KL-JUR-002, REQ-KL-JUR-003

**REQ-KL-JUR-002** · MUST · firm · from rule

The system MUST hold the Kollam Special Court's Sessions Division and place of sitting as recorded in the notification, and MUST hold the date from which its designation takes effect.

- *why* - The notification names the Sessions Division of Kollam, the court and the place of sitting, with effect from 20 November 2024. A system that carries the court but not its effective date will show cheque cases instituted before that date as having been within its designation, and a system that carries no division cannot decide whether a complaint filed elsewhere in the division belongs to it.
- *authority* - G.O. 241/2024 §1 (`go241:sec_1` - 1. Establishment of the Special Court for section 138 cases)
- *binds* - schema-field: Kollam Special Court - sessions division, place of sitting, effective date
- *test* - The court record carries the sessions division, the place of sitting and the effective date; a case instituted before that date does not resolve to this court.
- *related* - REQ-KL-JUR-001

**REQ-KL-JUR-003** · MUST · inferred · from rule

The system MUST hold a court's operating hours as data on the court record, so that a court designated to function round the clock is not constrained by the ordinary sitting hours.

- *why* - The Kollam court was started as a digital court on a pilot basis as the 24x7 ON Court, against a general rule that courts ordinarily sit from 11.00 a.m. to 5.00 p.m. Neither instrument says operating hours are to be held as court-level data; that is what follows from a designated court departing from the general rule. If the sitting window is a constant in the scheduling code, the one court in Kerala designated for cheque cases cannot list a hearing at the hours it was created to work, and the pilot's central feature is unrepresentable.
- *authority* - G.O. 241/2024 §1 (`go241:sec_1` - 1. Establishment of the Special Court for section 138 cases)
- *authority* - Criminal Rules r.5(1) (`crp:rule_5` - 5. Hours of Sitting)
- *binds* - schema-field: court - operating hours as court-level configuration
- *test* - The Kollam Special Court record carries a round-the-clock operating window, an ordinary JMFC carries the 11:00 to 17:00 default, and the scheduler reads both from the court record.
- *related* - REQ-KL-TRL-002, REQ-KL-JUR-001

#### TRL - trial conduct, plea, attendance (5)

**REQ-KL-TRL-001** · MUST NOT · firm · from rule

The system MUST NOT schedule or record a judicial act on a holiday unless a case of absolute urgency has been recorded.

- *why* - Kerala's rule is that no case shall be heard and no judicial act formally announced or done on a holiday save in a case of absolute urgency. A listing engine that treats a 24x7 court as having no calendar will put a cheque case's evidence or judgment on a gazetted holiday, and the order is open to challenge for a reason that has nothing to do with its merits.
- *authority* - Criminal Rules r.5(2) (`crp:rule_5` - 5. Hours of Sitting)
- *authority* - Criminal Rules r.5(3) (`crp:rule_5` - 5. Hours of Sitting)
- *binds* - validation-rule: listing - judicial acts on a holiday
- *test* - Listing a hearing on a court holiday is blocked unless an absolute-urgency reason is recorded against it.
- *related* - REQ-KL-TRL-002, REQ-KL-JUR-003

**REQ-KL-TRL-002** · SHOULD · firm · from rule

The system SHOULD default a court's sitting window to 11:00 to 17:00 with an interval not exceeding one hour.

- *why* - The rule says courts shall ordinarily sit in that window, which is a default and not an absolute. A scheduler with no default will spread a cheque case's hearings across hours when nobody is sitting; one that hard-codes the window cannot express the Kollam ON Court, which is designated to run round the clock. It has to be a default that a court record can override.
- *authority* - Criminal Rules r.5(1) (`crp:rule_5` - 5. Hours of Sitting)
- *binds* - schema-field: court - sitting hours and interval
- *how* - Ordinarily from 11.00 a.m. to 5.00 p.m. with an interval not exceeding one hour.
- *test* - A newly created court inherits the 11:00 to 17:00 window and the interval cap, and the values can be overridden on the court record.
- *related* - REQ-KL-JUR-003, REQ-KL-TRL-001

**REQ-KL-TRL-003** · MUST · firm · from rule

Where an accused before a subordinate criminal court has been exempted from personal appearance, the system MUST require the pleader appearing for him to file a vakalatnama in the prescribed form, and MUST NOT accept a memorandum of appearance in its place.

- *why* - Exemption from personal appearance is the ordinary course in a Kerala cheque case, and this is the rule that pairs with it: the pleader who appears for an absent accused must hold a vakalath, not merely a memo. A system that offers the memo route to every criminal accused will let a case run to judgment against an accused who never appeared and whose counsel never held a written authority.
- *authority* - Criminal Rules r.33 (`crp:rule_33` - 33. Pleaders to file special vakkalath appearing for accused exempted)
- *authority* - Criminal Rules r.32(1) (`crp:rule_32` - 32. Form and attestation of vakkalath)
- *binds* - validation-rule: appearance for an exempted accused - vakalatnama required
- *how* - A vakalath as prescribed by Rule 32, in Judicial Form No. 57.
- *test* - Recording an exemption from personal appearance against an accused makes the memorandum of appearance route unavailable for that accused's pleader.
- *tightens* - REQ-TRL-015
- *related* - REQ-KL-FIL-024, REQ-KL-TRL-004

**REQ-KL-TRL-004** · MAY · firm · from rule

In the High Court, an advocate appearing for an accused in a criminal proceeding MAY file a memorandum of appearance instead of a vakalatnama.

- *why* - The High Court rules make the memo an alternative on the criminal side, and a great deal of Kerala cheque litigation is at that level in quashing and revision. A system that demands a vakalath from every advocate blocks an appearance the rules expressly allow, and counsel is turned away at the Registry on a requirement that does not apply to him.
- *authority* - Kerala HC Rules r.17(1) (`khcr:rule_17` - 17. Production of Vakalath)
- *binds* - schema-field: appearance record - vakalatnama or memorandum of appearance
- *how* - A memorandum of appearance containing a declaration that the advocate has been duly instructed to appear by or on behalf of the accused.
- *test* - A High Court criminal appearance can be completed on a memorandum of appearance alone, with no vakalatnama demanded; the same route is not offered on the civil side except for the Government and public servants.
- *related* - REQ-KL-TRL-003, REQ-KL-TRL-005, REQ-KL-FIL-027

**REQ-KL-TRL-005** · MUST · inferred · from rule

The system MUST record which instrument an advocate's authority to act rests on, as either a vakalatnama or a memorandum of appearance, and MUST NOT default the value.

- *why* - The two instruments are not interchangeable across courts: a subordinate court pleader appearing for an exempted accused must hold a vakalath, while a High Court criminal advocate may act on a memorandum. The rules prescribe both instruments without saying the record must name which was used, so a system will happily hold neither. If the appearance record does not name the instrument, the court cannot tell whether counsel is authorised to act at all, and the point is taken when an order is challenged for having been made against a party nobody was authorised to represent.
- *authority* - Kerala HC Rules r.17(1) (`khcr:rule_17` - 17. Production of Vakalath)
- *authority* - Criminal Rules r.31 (`crp:rule_31` - 31. [Pleader to file Memo of Appearance)
- *binds* - schema-field: appearance record - instrument of authority
- *test* - Every appearance stores the instrument it rests on and links to that document; an appearance saved with no instrument is rejected, and the value is never populated by default.
- *related* - REQ-KL-TRL-004, REQ-KL-FIL-024

#### SEN - sentence, fine, compensation (6)

**REQ-KL-SEN-001** · MUST · firm · from rule

The system MUST direct a warrant for the levy of a fine by attachment and sale to a Police Officer, in the form the Code prescribes.

- *why* - The fine and the compensation in a cheque conviction are recovered on this warrant, and it must be directed to a police officer in the prescribed form. A warrant generated to the court's own process server, or on a locally drafted form, will not be executed, and the complainant who has waited through the trial recovers nothing.
- *authority* - Criminal Rules r.190(1) (`crp:rule_190` - 190. Warrant for levy of fine)
- *binds* - output-document: warrant for levy of fine - addressee and form
- *how* - Directed to a Police Officer and in Form No. 43 of Schedule II to the Code.
- *test* - The generated levy warrant names a police officer as the executing authority and cites the prescribed form.
- *related* - REQ-KL-SEN-002

**REQ-KL-SEN-002** · MUST · firm · from rule

The system MUST record, on a warrant for the levy of a fine, the time limit specified by the issuing authority for the sale of the attached property and for the return of the warrant.

- *why* - Without a specified return date the warrant has no deadline and nothing brings it back to the court. In a cheque case the compensation cannot be paid out until the levy is accounted for, so an open-ended warrant leaves the complainant's money in limbo and the case shown as disposed while the recovery is unresolved.
- *authority* - Criminal Rules r.190(2) (`crp:rule_190` - 190. Warrant for levy of fine)
- *binds* - schema-field: levy warrant - time limit for sale and return
- *test* - A levy warrant cannot be issued without a specified sale and return date, and an overdue warrant is reportable.
- *related* - REQ-KL-SEN-001

**REQ-KL-SEN-003** · MUST · firm · from rule

Where a claim is preferred to property attached under a levy warrant within one month of the attachment, the system MUST record a summary enquiry and a decision with reasons, communicated forthwith to the executing police officer.

- *why* - A third party claiming the attached property stops the sale, and Kerala gives the claim a one-month window, a summary enquiry and a final reasoned decision. A system with no claim workflow leaves the police officer selling property the court has been asked to release, and the reversal of that sale is a far worse problem than the delay of deciding the claim.
- *authority* - Criminal Rules r.190(9) (`crp:rule_190` - 190. Warrant for levy of fine)
- *authority* - Criminal Rules r.190(12) (`crp:rule_190` - 190. Warrant for levy of fine)
- *binds* - workflow-step: claim to attached property - summary enquiry and decision
- *how* - Preferred within one month of the date of attachment, enquired into summarily, decided with reasons recorded, the decision being final and communicated forthwith to the police officer executing the warrant.
- *test* - A claim recorded within one month of attachment blocks the sale, requires a reasoned decision, and on decision despatches it to the executing officer.
- *related* - REQ-KL-SEN-002

**REQ-KL-SEN-004** · MUST · firm · from rule

The system MUST maintain the account of fines imposed, levied and refunded in the prescribed administrative form.

- *why* - The fine register is the court's cash record, and in a cheque case the fine and the compensation out of it are the substance of the relief. If the system tracks a sentence but not the register, nobody can reconcile what was imposed against what was collected, and a fine recorded as paid in the case file may never have reached the treasury.
- *authority* - Criminal Rules r.191 (`crp:rule_191` - 191. Register of fines to be maintained)
- *binds* - output-document: register of fines - Administrative Form No. 20
- *how* - Administrative Form No. 20.
- *test* - The fine register is generable in the prescribed form and reconciles to the sentence and receipt records of each case.
- *related* - REQ-KL-SEN-007

**REQ-KL-SEN-006** · MUST · firm · from rule

The system MUST include, in an order for payment of compensation to the treasury, a certificate in one of the three forms the rules prescribe as to the appeal and revision position.

- *why* - The Treasury Officer pays on the certificate, not on the judgment. If the payment order carries no certificate, or one that does not match the actual position - unappealable, confirmed on appeal, or the appeal time expired with no appeal - the treasury refuses payment and the complainant makes a second round of the court for a document that should have been right the first time.
- *authority* - Criminal Rules r.200(1) (`crp:rule_200` - 200. Payment of amount of compensation under Section 357 of the Code)
- *authority* - Criminal Rules r.201 (`crp:rule_201` - 201. Certificate as to appeal)
- *binds* - output-document: compensation payment order - certificate
- *how* - One of: the sentence and award are not subject to appeal or have been confirmed on appeal and no revisional order modifying or reversing the compensation has been received; or the payment order conforms to a modification made in appeal or revision; or the appeal time has expired, no appeal has been preferred and no revisional order has been received.
- *test* - The generated payment order carries exactly one of the three certificates, selected from the case's recorded appeal and revision history rather than chosen by hand.

**REQ-KL-SEN-007** · MUST · firm · from rule

The system MUST hold compensation awarded out of a fine as an amount retained in deposit in the treasury, payable to the party only against a payment order issued by the court, and MUST NOT show it as paid to the complainant before that.

- *why* - Money awarded, money in the treasury and money in the complainant's hands are three different states, and Kerala keeps them distinct through the fine register and the payment order. A case view that collapses them will tell a cheque complainant his compensation has been paid when it is sitting in deposit, and he will not apply for the payment order that is the only way to get it.
- *authority* - Criminal Rules r.203(2) (`crp:rule_203` - 203. Deposit in treasury and payment of compensation amount)
- *authority* - Criminal Rules r.203(3) (`crp:rule_203` - 203. Deposit in treasury and payment of compensation amount)
- *authority* - Criminal Rules r.202 (`crp:rule_202` - 202. Compensation otherwise than under Section 357 of the Code)
- *binds* - schema-field: compensation - awarded, in deposit and paid as distinct states
- *how* - Retained in deposit in the treasury subject to the order of the court awarding compensation or of the court of appeal or revision, and paid to the party on production before the Treasury Officer of a payment order issued under Rule 200.
- *test* - The compensation record moves through awarded, in deposit and paid as separate states, and the paid state can only be reached from a recorded payment order.
- *related* - REQ-KL-SEN-006

#### APL - appeal, revision, deposit (12)

**REQ-KL-APL-001** · MUST · firm · from rule

The system MUST head a memorandum of criminal appeal or a revision petition with a cause title setting out the provision of law under which it is preferred, the name of the court, the names of the appellants and respondents, and the full cause title of the case in the lower court.

- *why* - Without the lower court cause title the appellate registry cannot tie the appeal to the trial record it has to call for, and a cheque appeal sits unnumbered while the office writes to the trial court to identify the case. Naming the provision matters too: an appeal filed under the wrong provision is returned rather than converted.
- *authority* - Criminal Rules r.100(1) (`crp:rule_100` - 100. Cause title of memorandum of appeal and revision petition)
- *authority* - Criminal Rules r.100(3) (`crp:rule_100` - 100. Cause title of memorandum of appeal and revision petition)
- *binds* - output-document: memorandum of appeal or revision - cause title
- *how* - A cause title setting out the provisions of law under which it is preferred, the name of the Court, the names of the appellants and respondents in the Court of appeal, and the full cause title of the case or matter in the lower Court or Courts; the same applies so far as may be to revision petitions.
- *test* - The generated memorandum carries the provision of law, the court, both sets of party names and the full lower court cause title, drawn from the linked trial case record.
- *related* - REQ-KL-APL-002

**REQ-KL-APL-002** · MUST · firm · from rule

The system MUST require a memorandum of appeal or a revision petition to be accompanied by a certified copy of the judgment or order appealed against or sought to be revised.

- *why* - An appeal against a s.138 conviction cannot be numbered without the certified copy, and obtaining it is itself a queue. A system that accepts an appeal on an uploaded uncertified print gives the appellant a false filing, and the return arrives after the thirty days for appealing have run.
- *authority* - Criminal Rules r.102 (`crp:rule_102` - 102. Enclosures to appeals and revision petitions)
- *binds* - validation-rule: appeal or revision - certified copy enclosure
- *test* - An appeal or revision cannot be submitted without a document recorded as a certified copy of the impugned judgment or order.
- *tightens* - (national requirement not yet numbered) the national right of an accused convicted under NI Act s.138 to appeal, and the conditions on which an appeal is entertained
- *related* - REQ-KL-APL-003, REQ-KL-CPY-005

**REQ-KL-APL-003** · MUST · firm · from rule

The system MUST require a memorandum of appeal or a revision petition, where a pleader is engaged, to be accompanied by a duly signed vakalatnama or memorandum of appearance.

- *why* - The appellate court will not act on a memorandum filed by counsel with no authority on record. In a cheque appeal filed at the end of the thirty days, a missing vakalath is a defect that sends the whole appeal back, and the delay petition it then needs is a further hurdle the appellant did not have to face.
- *authority* - Criminal Rules r.102 (`crp:rule_102` - 102. Enclosures to appeals and revision petitions)
- *binds* - validation-rule: appeal or revision - authority of the pleader
- *test* - Where a pleader is named on an appeal or revision, submission requires an attached signed vakalatnama or memorandum of appearance.
- *related* - REQ-KL-APL-002, REQ-KL-FIL-024

**REQ-KL-APL-004** · MUST · firm · from rule

Where an appeal or revision petition is presented after the prescribed period of limitation, the system MUST require a petition to excuse the delay, supported by an affidavit explaining the circumstances, to be filed along with it.

- *why* - Kerala requires the delay petition to travel with the appeal, not to follow it. An appellate registry receiving a late cheque appeal on its own will return it, and by the time the delay petition is drafted the appellant has added further delay to the delay he has to explain.
- *authority* - Criminal Rules r.103 (`crp:rule_103` - 103. Petition to excuse delay to accompany appeals or revision petitions)
- *binds* - validation-rule: out of time appeal or revision - delay petition
- *how* - A petition to excuse the delay supported by an affidavit explaining the circumstances of the delay, filed along with the appeal or revision petition.
- *test* - Where the computed presentation date is past the limitation period, submission requires an attached delay petition and a supporting affidavit.
- *related* - REQ-KL-APL-005

**REQ-KL-APL-005** · MUST · firm · from rule

The system MUST require a petition or appeal re-presented after the time allowed on its return to be accompanied by a petition to excuse the delay, supported by an affidavit explaining it.

- *why* - The return of a defective appeal starts its own clock, and Kerala treats a late re-presentation as a fresh delay to be excused. A system that records the return without the allowed time, or that accepts a re-presentation silently whenever it arrives, hides a defect that the registry will raise at scrutiny and that the appellant can no longer explain from memory.
- *authority* - Criminal Rules r.105 (`crp:rule_105` - 105. Petition to excuse the delay to accompany appeals out of time on)
- *authority* - Criminal Rules r.104 (`crp:rule_104` - 104. Return of defective petitions and their representation)
- *binds* - validation-rule: late re-presentation - delay petition
- *how* - A petition to excuse the delay supported by an affidavit explaining the delay, filed with the re-presentation.
- *test* - A re-presentation after the recorded representation deadline requires an attached delay petition and affidavit before it can be accepted.
- *related* - REQ-KL-APL-004, REQ-KL-FIL-010

**REQ-KL-APL-006** · MUST · firm · from rule

Where a criminal appeal or revision is remanded, re-admitted or transferred from one court to another, the system MUST compute its period of pendency from the date of its original institution.

- *why* - Kerala fixes the date so that pendency cannot be reset by a procedural event. A system that restarts the clock on transfer will report a cheque appeal that has been alive for three years as newly instituted, and the delay disappears from every statement the court sends up.
- *authority* - Criminal Rules r.140 (`crp:rule_140` - 140. The date of institution to be the date for purposes of duration)
- *binds* - validation-rule: pendency computation on remand, re-admission or transfer
- *how* - The date for the purpose of calculating the period of pendency shall be the date of original institution.
- *test* - Remand, re-admission or transfer of an appeal leaves its pendency computed from the original institution date, and the age reported does not fall.

**REQ-KL-APL-007** · MUST · firm · from rule

Where no period of limitation is prescribed by any other law, the system MUST require a revision petition to the High Court to be presented within ninety days of the order complained of.

- *why* - This is the High Court's residual rule, and it is what applies to the interlocutory orders in a cheque case for which no other period is fixed. A system with no default period will let a revision be filed years after the order and numbered without objection, and the point surfaces only when the respondent takes it at admission.
- *authority* - Kerala HC Rules r.44 (`khcr:rule_44` - 44. Revision Petitions)
- *binds* - validation-rule: revision petition - residual ninety day period
- *how* - Ninety days of the order complained of, the provisions of sections 5 and 12 of the Limitation Act, 1963 applying.
- *test* - A revision petition against an order for which no other law prescribes a period is flagged out of time beyond ninety days, computed with the benefit of sections 5 and 12 of the Limitation Act.
- *related* - REQ-KL-APL-004, REQ-KL-LIM-004

**REQ-KL-APL-008** · MUST · firm · from rule

The system MUST assemble, with a revision petition to the High Court, the full set of enclosures the rules require, including certified copies of the order sought to be revised and of the judgments below, an additional typed set, an authenticated copy for each respondent, two further copies for the court, and the prescribed service fees.

- *why* - A revision against a s.138 conviction is returned for any one of these being short, and the enclosure list is long enough that it is routinely got wrong. A filing screen that checks only for the impugned order lets an incomplete revision through, and the Registrar's return costs the petitioner the fifteen days he then has to re-present within.
- *authority* - Kerala HC Rules r.45 (`khcr:rule_45` - 45. Papers to accompany revision petitions)
- *binds* - validation-rule: revision petition - enclosure set
- *how* - Certified copy of the order or decree sought to be revised, certified copy of the judgment on which it is based, certified copy of the judgment or order of the court of first instance, one additional typewritten or printed set of those judgments and orders, as many authenticated copies of the revision petition as there are respondents, two additional copies for the use of the court, and the prescribed fees for service of notice.
- *test* - The revision filing checklist enumerates every item, scales the respondent copies with the number of respondents, and blocks submission until each is attached.
- *related* - REQ-KL-APL-009, REQ-KL-APL-010

**REQ-KL-APL-009** · MUST · firm · from rule

The system MUST require a petition to quash filed under the High Court's inherent jurisdiction to be accompanied by a copy of the proceeding it is directed against, certified as true by the petitioner's advocate or by the petitioner appearing in person.

- *why* - A large share of Kerala cheque litigation is the petition to quash the complaint, and the rule expressly counts a complaint as a proceeding for this purpose. Without the certified copy of the complaint the High Court cannot see what it is being asked to quash, and the petition is returned at the Registrar's stage before any judge reads it.
- *authority* - Kerala HC Rules rr.45 and 45A (`khcr:rule_45` - 45. Papers to accompany revision petitions)
- *binds* - validation-rule: quashing petition - certified copy of the complaint
- *how* - A copy of the proceeding against which the petition is directed, certified as true by the advocate of the petitioner or by the petitioner when the petition is filed in person; proceeding includes a complaint.
- *test* - A quashing petition against a s.138 complaint cannot be submitted without an attached copy of the complaint recorded as certified true by the advocate or the party in person.
- *related* - REQ-KL-APL-008

**REQ-KL-APL-010** · MUST · firm · from rule

The system MUST record, on the Registrar's return of an insufficiently stamped or defective presentation, a re-presentation period that does not exceed fifteen days.

- *why* - Fifteen days is the outer limit the Registrar may allow, and a return that names no period leaves the petitioner guessing while the period runs. In a cheque revision that has already been filed near the end of its limitation, a re-presentation a day beyond the allowed time turns a curable defect into a delay that has to be excused on affidavit.
- *authority* - Kerala HC Rules r.15(2) (`khcr:rule_15` - 15. Powers and duties of the Registrar)
- *binds* - schema-field: Registrar's return - re-presentation period
- *how* - To be re-presented within a period not exceeding 15 days after supplying the deficiency, curing the defect or making the amendment.
- *test* - A Registrar's return records a re-presentation deadline that cannot be set more than fifteen days out, and a re-presentation after it is flagged for a delay petition.
- *related* - REQ-KL-APL-005, REQ-KL-LIM-004

**REQ-KL-APL-011** · MUST · firm · from rule

The system MUST record that a proceeding presented to the High Court was presented in person by the party, his advocate or the advocate's registered clerk, and MUST NOT accept one received by post or telegram unless the court has otherwise ordered.

- *why* - Kerala's High Court rules exclude postal presentation outright. A revision or quashing petition in a cheque case that arrives by post is not presented at all, and if the software records it as filed, the petitioner is relying on a date the Registry will not accept when the objection is finally raised.
- *authority* - Kerala HC Rules r.32 (`khcr:rule_32` - 32. Presentation of Proceedings)
- *authority* - Kerala HC Rules r.33 (`khcr:rule_33` - 33. Papers sent by post)
- *binds* - schema-field: High Court presentation - presenter and mode
- *how* - Presented in person by the party, his advocate or the advocate's registered clerk.
- *test* - Every High Court presentation names the presenter and their capacity from the permitted set; a postal or telegraphic receipt cannot be recorded as a presentation without a recorded court order.
- *related* - REQ-KL-APL-012

**REQ-KL-APL-012** · MUST · firm · from rule

The system MUST return for rectification any paper presented to the High Court that is couched in improper language, illegible or unnecessarily prolix, treating a paper written in pencil as illegible unless it is an original received by the party.

- *why* - The rule gives the Registry an express ground of return that has nothing to do with the merits, and it is used. A quashing petition in a cheque case drafted in intemperate terms about the complainant, or a scanned pencil annexure, will come back, and a system that has no way to record this ground of return will log it as an unexplained delay.
- *authority* - Kerala HC Rules r.50 (`khcr:rule_50` - 50. Return of papers in improper language etc)
- *binds* - workflow-step: High Court scrutiny - return for improper language or illegibility
- *how* - Papers written in pencil are deemed illegible unless they are the originals received by the party.
- *test* - Improper language, illegibility and prolixity are available as recorded grounds of return, and a returned paper carries the ground it was returned on.
- *related* - REQ-KL-APL-011, REQ-KL-FIL-006

#### REC - the court record, registers, retention (8)

**REQ-KL-REC-001** · MUST · firm · from rule

The system MUST maintain the court diary in the prescribed administrative form, with the entries for a day signed by the Presiding Officer on the day to which they relate.

- *why* - The diary is signed same-day precisely so it cannot be reconstructed afterwards. A digital diary that lets a Magistrate sign off a week of a cheque case's entries at the end of the month produces a record that is not evidence of what happened on any of those days, and the register the High Court inspects is worthless.
- *authority* - Criminal Rules r.72(1) (`crp:rule_72` - 72. Diary)
- *binds* - output-document: court diary - Administrative Form No. 10
- *how* - Administrative Form No. 10; entries signed by the Presiding Officer on the day to which they relate.
- *test* - Diary entries carry the date they relate to and the date they were signed; signing an entry on a later date is flagged.
- *related* - REQ-KL-REC-002, REQ-KL-REC-003

**REQ-KL-REC-002** · MUST · firm · from rule

The system MUST maintain a hearing book in the prescribed administrative form, distinct from the court diary.

- *why* - Kerala keeps two records - the diary of the court's day and the hearing book. A system that collapses them into one activity log cannot produce either in the form the rules require, and when a cheque case's history is questioned, neither register exists to answer with.
- *authority* - Criminal Rules r.72(2) (`crp:rule_72` - 72. Diary)
- *binds* - output-document: hearing book - Administrative Form No. 11
- *how* - Administrative Form No. 11.
- *test* - A day's sittings produce entries in both registers; the hearing book renders in Administrative Form No. 11 and the diary in Administrative Form No. 10, and neither is produced by relabelling the other's entries.
- *related* - REQ-KL-REC-001

**REQ-KL-REC-003** · MUST · firm · from rule

The system MUST maintain a proceedings paper in the prescribed judicial form recording each judicial step in the case, including the reasons for every adjournment, and MUST record that it was initialled by the Judge or Magistrate in open court.

- *why* - The rule names the reasons for adjournments first among the steps to be recorded, and in a cheque case the adjournment history is the whole explanation for why a trial the NI Act expects to close in six months has not. A proceedings record that logs 'adjourned' with no reason and no initial cannot answer the delay, and the Kerala field note's picture of files that simply stop moving is invisible in it.
- *authority* - Criminal Rules r.73(1) (`crp:rule_73` - 73. Proceedings Paper)
- *binds* - output-document: proceedings paper - Judicial Form No. 61
- *how* - Judicial Form No. 61, furnishing full information as to the judicial steps taken - reasons for adjournments, issue of warrants to the accused or witnesses, marking of documents, examination of witnesses, framing of charges, questioning of the accused, hearing arguments and pronouncing judgment or order - initialled by the Judge or Magistrate in open court.
- *test* - Every adjournment entry requires a recorded reason, and each proceedings paper entry stores the initialling judicial officer.
- *related* - REQ-KL-REC-001, REQ-KL-REC-004

**REQ-KL-REC-004** · MUST · firm · from rule

When the record is sent to a court of appeal or revision, or forwarded on transfer, the system MUST place a typed or neatly written copy of the proceedings paper with the records.

- *why* - The appellate court reading a cheque appeal needs the running history of the trial, and the original proceedings paper stays with the trial court. If the transmitted bundle carries only the judgment and the exhibits, the Sessions Court cannot see the adjournment history or when the accused was questioned, and remits the case for a record that should have travelled with it.
- *authority* - Criminal Rules r.73(2) (`crp:rule_73` - 73. Proceedings Paper)
- *binds* - workflow-step: transmission of records - copy of the proceedings paper
- *how* - A typed or neatly written copy of the proceedings paper placed with the records.
- *test* - Generating a record bundle for appeal, revision or transfer includes a proceedings paper copy; a bundle without one is blocked.
- *related* - REQ-KL-REC-003

**REQ-KL-REC-005** · MUST · firm · from rule

The system MUST store electronically filed pleadings and documents on a server under the control and supervision of the courts.

- *why* - The rule places custody with the courts, not with a filing vendor or a general-purpose cloud account. A cheque case file holds the cheque image, the parties' addresses and their bank details, and if it sits on infrastructure the court does not control, the court cannot answer for its integrity or for who has read it.
- *authority* - Kerala E-Filing Rules r.15(1) (`kefr:rule_15` - 15. Storage and Retrieval of Electronically filed Pleadings and Documents)
- *authority* - Kerala E-Filing Rules r.15(3) (`kefr:rule_15` - 15. Storage and Retrieval of Electronically filed Pleadings and Documents)
- *binds* - access-control: e-filing store - custody and control
- *how* - An exclusive server under the control and supervision of the courts.
- *test* - The document store's ownership and access policy resolve to the court, and access to a case's documents is governed by the rules rather than by the hosting provider.
- *related* - REQ-KL-REC-006, REQ-KL-REC-007

**REQ-KL-REC-006** · MUST · firm · from rule

The system MUST label and encrypt each electronically filed case separately, so that it can be identified and retrieved on its own.

- *why* - Per-case encryption is what stops a single credential from opening every cheque file in the district. It is also what makes retrieval possible when the accused applies for a copy of the record: a store that is encrypted as one volume cannot release one case without exposing the rest.
- *authority* - Kerala E-Filing Rules r.15(2) (`kefr:rule_15` - 15. Storage and Retrieval of Electronically filed Pleadings and Documents)
- *binds* - access-control: e-filed case - separate labelling and encryption
- *how* - The Registry shall separately label and encrypt each Action for facilitating identification and retrieval.
- *test* - Each case's stored documents carry a case-level label and are encrypted with a key scoped to that case; retrieval of one case does not require decrypting another.
- *related* - REQ-KL-REC-005

**REQ-KL-REC-007** · MUST · firm · from rule

The system MUST preserve a backup copy of every electronically filed case.

- *why* - Where the electronic file is the file, its loss is the loss of the case. In a cheque matter the scanned cheque and the bank memo may be the only images of documents whose originals are with a party, and a court that cannot restore them cannot try the case at all.
- *authority* - Kerala E-Filing Rules r.15(4) (`kefr:rule_15` - 15. Storage and Retrieval of Electronically filed Pleadings and Documents)
- *binds* - workflow-step: e-filing store - backup
- *test* - A backup of every case's documents exists, is restorable, and its currency is reportable.
- *related* - REQ-KL-REC-005

**REQ-KL-REC-008** · MUST · firm · from rule

The system MUST retain the signed vakalatnama, notarised or attested affidavits, and any original document whose authenticity is disputed, for at least three years after the final disposal of the case including any appeal.

- *why* - The retention clock runs from the end of the appeals, not from the trial court's judgment, and in a cheque case the appeal and a further revision can add years. A retention policy keyed to the date of judgment will destroy the disputed cheque and the affidavit of evidence while the case is still alive on the criminal side of the High Court.
- *authority* - Kerala E-Filing Rules r.8(2) (`kefr:rule_8` - 8. Retention of Original Documents)
- *binds* - schema-field: document retention - clock from final disposal including appeals
- *how* - Preserved at least for three years after the final disposal of the Action including appeals, if any.
- *test* - A case with a pending appeal shows no document as eligible for destruction; the three-year clock starts only when the last appeal is disposed of.
- *related* - REQ-KL-EVI-022

#### CPY - copies and their supply (8)

**REQ-KL-CPY-001** · MUST · firm · from rule

The system MUST capture, on an application for a copy, the applicant's name, his position in the proceedings if any, the name of his pleader if any, and a description of the proceeding or document of which a copy is required.

- *why* - A copy application that does not describe the document cannot be worked, and Kerala returns it. In a cheque case the accused typically wants the complaint, the affidavit of evidence or the deposition of a particular witness, and an application that just says 'case papers' comes back to the applicant after days in the copy queue.
- *authority* - Criminal Rules r.222 (`crp:rule_222` - 222. Application for copies)
- *authority* - Kerala HC Rules r.128(1) (`khcr:rule_128` - 128. Application for copies)
- *binds* - output-document: copy application - particulars
- *how* - Presented by the applicant or his pleader, setting out the name of the applicant, his position in the proceedings, the name of his pleader and a description of the proceeding or document of which a copy is required.
- *test* - The copy application form requires each particular and identifies the target document by reference rather than free text.
- *related* - REQ-KL-CPY-002

**REQ-KL-CPY-002** · MUST · firm · from rule

The system MUST return a defective copy application for representation after rectification within a period not exceeding seven days.

- *why* - Kerala caps the time at seven days, and the cap is what stops a copy application from being held indefinitely at the copying section. A return with no deadline, or with a deadline the office sets at will, reproduces on the copy side the file-holding the Kerala field note reports at scrutiny, and the accused's appeal time runs while he waits for the certified judgment.
- *authority* - Criminal Rules r.223 (`crp:rule_223` - 223. Return of defective applications)
- *authority* - Criminal Rules r.228 (`crp:rule_228` - 228. Striking off of defective applications)
- *binds* - schema-field: returned copy application - representation deadline
- *how* - Returned for being represented after rectifying the defects within a period not exceeding seven days.
- *test* - A returned copy application carries a representation deadline that cannot be set beyond seven days from the return.
- *related* - REQ-KL-CPY-001

**REQ-KL-CPY-003** · MUST · firm · from rule

The system MUST require an application for an urgent copy to be a separate application setting forth the grounds of urgency.

- *why* - Urgency in a cheque case is usually the appeal period running against a convicted accused, and Kerala makes him say so in a separate application. A single application form with an urgency toggle lets every applicant claim priority, and the copying section loses the ordering the rules give it.
- *authority* - Criminal Rules r.224 (`crp:rule_224` - 224. Urgent application for copies)
- *authority* - Criminal Rules r.232 (`crp:rule_232` - 232. Order in which applications should be complied with)
- *binds* - screen: urgent copy application - separate application and grounds
- *how* - By a separate urgent application setting forth the grounds of urgency; copies are otherwise prepared in the serial order of application.
- *test* - An urgent copy is applied for on its own application that cannot be submitted without stated grounds of urgency.
- *related* - REQ-KL-CPY-001

**REQ-KL-CPY-004** · MUST NOT · firm · from rule

The system MUST NOT issue a copy of any proceeding or document other than a judgment to a person who is a stranger to the proceeding, except on an order of the court made on a duly verified petition setting forth the purpose for which the copy is required.

- *why* - A cheque case file carries the parties' bank particulars, addresses and the cheque image itself. Kerala opens judgments to anyone and everything else only by judicial order on a verified petition. A copy service that treats the whole record as public will release a scanned cheque, complete with account number and signature, to whoever asks for it.
- *authority* - Criminal Rules r.226 (`crp:rule_226` - 226. Application for copies by strangers)
- *authority* - Kerala HC Rules r.129 (`khcr:rule_129` - 129. Application for copies by Strangers)
- *binds* - access-control: copies to a stranger to the proceeding
- *how* - Allowed only by order of the court obtained on a petition duly verified setting forth the purpose for which the copy is required; judgments are excepted.
- *test* - A non-party can obtain a judgment; any other document requires a recorded court order made on a verified petition stating the purpose.
- *related* - REQ-KL-CPY-005

**REQ-KL-CPY-005** · MUST · firm · from rule

The system MUST have every copy furnished by the court certified to be a true copy by the Head Clerk or the officer appointed for the purpose, and sealed with the seal of the court.

- *why* - A certified copy of the judgment is what an appeal in a cheque case must be accompanied by, and an uncertified or unsealed print is not one. If the copy the system issues carries no certifying officer and no seal, the appellate registry returns the appeal and the appellant loses the days it takes to get a proper copy.
- *authority* - Criminal Rules r.239 (`crp:rule_239` - 239. Sealing and Certificate)
- *authority* - Kerala HC Rules r.143 (`khcr:rule_143` - 143. Sealing and Certificate)
- *binds* - output-document: certified copy - certification and seal
- *how* - Certified to be a true copy by the Head Clerk or officer appointed for the purpose and sealed with the seal of the court.
- *test* - Every issued copy names the certifying officer and bears the court seal; a copy issued without either is not producible as a certified copy.
- *related* - REQ-KL-CPY-006, REQ-KL-APL-002

**REQ-KL-CPY-006** · MUST · firm · from rule

The system MUST endorse on every copy the particulars the rules enumerate, including the dates on which stamp papers were called for and produced, the date the copy was made ready, the date notified for its receipt and the date of delivery.

- *why* - These dates are how the time taken for obtaining a copy is excluded when limitation for an appeal is computed. A certified copy of a cheque conviction that shows only the date of delivery leaves the appellant unable to prove the exclusion, and an appeal that was in time is dismissed as barred.
- *authority* - Criminal Rules r.240 (`crp:rule_240` - 240. Endorsement on copies)
- *authority* - Kerala HC Rules r.144 (`khcr:rule_144` - 144. Endorsement of copies)
- *binds* - output-document: certified copy - endorsement particulars
- *how* - Court, year and number of the case, applicant, number and date of application, dates of calling for and producing stamp papers and additional stamp papers, date the copy was made ready, date notified for appearance to receive it, and date of delivery, initialled by the Head Clerk or officer appointed.
- *test* - The issued copy's endorsement carries every enumerated particular from stored fields, and the appeal limitation calculation can consume them.
- *related* - REQ-KL-CPY-005, REQ-KL-CPY-007

**REQ-KL-CPY-007** · MUST · firm · from rule

The system MUST fix and notify a date for the applicant to receive a copy, and where the copy is not ready on that date MUST fix and notify another on or before the date originally fixed.

- *why* - The applicant is expected to attend on the notified date, and Kerala requires the court to move the date in advance rather than leave him to discover on arrival that the copy is not ready. A copy workflow with no notified date, or one that re-notifies after the date has passed, wastes the applicant's attendance and stretches the period he can claim to exclude from his appeal time.
- *authority* - Criminal Rules r.241 (`crp:rule_241` - 241. Intimation of date for delivery of copy)
- *binds* - workflow-step: certified copy - notified delivery date
- *how* - The Head Clerk fixes a date for the appearance of the applicant to receive the copy and notifies it on the notice board of the court or his section; if the copy is not ready, he fixes and notifies another day on or before the date originally fixed.
- *test* - Every copy application carries a notified delivery date; re-notification is only permitted on or before the current date, and each notification is stored.
- *related* - REQ-KL-CPY-006

**REQ-KL-CPY-008** · MUST · firm · from rule

The High Court copy workflow MUST refuse a copy of a document forming part of a subordinate court's record except on the order of the Deputy Registrar, obtained on a duly verified petition stating why the copy was not obtained from the lower court.

- *why* - A quashing or revision petitioner in a cheque case will ask the High Court for copies of the trial court's papers because it is quicker. Kerala requires him to explain why he did not go to the court that holds them. A copy service that supplies them freely pulls the subordinate court's record into the High Court copy queue and loses the endorsement history that the trial court's own copy would have carried.
- *authority* - Kerala HC Rules r.130 (`khcr:rule_130` - 130. Copies of documents filed in Subordinate Courts)
- *binds* - access-control: High Court copies of subordinate court documents
- *how* - Granted only on the orders of the Deputy Registrar obtained on a duly verified petition setting forth the necessity for the copy and the reason why it was not obtained from the lower court.
- *test* - A copy request against a subordinate court document filed in the High Court requires a recorded Deputy Registrar order and a petition stating the reason.
- *related* - REQ-KL-CPY-004

## National law - Acts and pinned provisions

### Negotiable Instruments Act, 1881  `ni`
*substantive · in force* - 25 provisions pinned to this case type.

- **138. Dishonour of cheque for insufficiency, etc., of funds in the account** (`ni:sec_138`, tier: operative) - Dishonour of cheque for insufficiency of funds; Explanation defines 'debt or other liability' as a legally enforceable debt.
  > Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person from out of that account for the discharge, in whole or in part, of any debt or other liability, is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient to honour the cheque or that it exceeds the amount arranged to be paid from that account by an agreement made with that bank, such person shall be deemed to have committed an offence and shall, without prejudice to any other provision of this A …
  [open](#law?act=ni&eid=sec_138)

- **139. Presumption in favour of holder** (`ni:sec_139`, tier: operative) - Presumption in favour of the holder that the cheque was for discharge of a debt/liability.
  > It shall be presumed, unless the contrary is proved, that the holder of a cheque received the cheque of the nature referred to in section138 for the discharge, in whole or in part, of any debt or other liability.
  [open](#law?act=ni&eid=sec_139)

- **140. Defence which may not be allowed in any prosecution under section 138** (`ni:sec_140`, tier: operative) - Absence of reason to believe the cheque would be dishonoured is no defence.
  > Itshall not be a defence in a prosecution for an offence under section 138 that the drawer had no reason to believe when he issued the cheque that the cheque may be dishonoured on presentment for the reasons stated in that section.
  [open](#law?act=ni&eid=sec_140)

- **141. Offences by companies** (`ni:sec_141`, tier: operative) - Offences by companies; who is vicariously liable and the director's defence.
  > (1) If the person committing an offence under section 138 is a company, every person who, at the time the offence was committed, was in charge of, and was responsible to, the company for the conduct of the business of the company, as well as the company, shall be deemed to be guilty of the offence and shall be liable to be proceeded against and punished accordingly: Provided that nothing contained in this sub-section shall render any person liable to punishment if he proves that the offence was committed without his knowledge, or that he had exercised all due diligence to prevent the commissio …
  [open](#law?act=ni&eid=sec_141)

- **142. Cognizance of offences** (`ni:sec_142`, tier: operative) - Cognizance only on complaint by the payee/HDC, within one month of cause of action (condonable); s.142(2) fixes territorial jurisdiction at the payee's bank branch.
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974),— (a) no court shall take cognizance of any offence punishable under section 138 except upon a complaint, in writing, made by the payee or, as the case may be, the holder in due course of the cheque; (b) such complaint is made within one month of the date on which the cause of action arises under clause (c) of the proviso to section 138: [Provided that the cognizance of a complaint may be taken by the Court after the prescribed period, if the complainant satisfies the Court that he had sufficient cause f …
  [open](#law?act=ni&eid=sec_142)

- **142A. Validation for transfer of pending cases** (`ni:sec_142A`, tier: operative) - Validation of transfer of pending cases after the 2015 jurisdiction amendment.
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974) or any judgment, decree, order or direction of any court, all cases transferred to the court having jurisdiction under sub-section (2) of section 142, as amended by the Negotiable Instruments (Amendment) Ordinance, 2015 (Ord. 6 of 2015), shall be deemed to have been transferred under this Act, as if that sub-section had been in force at all material times. (2) Notwithstanding anything contained in sub-section (2) of section 142 or sub-section (1), where the payee or the holder in due course, as the case  …
  [open](#law?act=ni&eid=sec_142A)

- **143. Power of Court to try cases summarily** (`ni:sec_143`, tier: operative) - Power of court to try s.138 cases summarily (invokes the summary-trial provisions of the criminal procedure code).
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974) all offences under this Chapter shall be tried by a Judicial Magistrate of the first class or by a Metropolitan Magistrate and the provisions of sections 262 to 265 (both inclusive) of the said Code shall, as far as may be, apply to such trials: Provided that in the case of any conviction in a summary trial under this section, it shall be lawful for the Magistrate to pass a sentence of imprisonment for a term not exceeding one year and an amount of fine exceeding five thousand rupees: Provided further th …
  [open](#law?act=ni&eid=sec_143)

- **143A. Power to direct interim compensation** (`ni:sec_143A`, tier: operative) - Interim compensation up to 20% of the cheque amount.
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973, the Court trying an offence under section 138 may order the drawer of the cheque to pay interim compensation to the complainant— (a) in a summary trial or a summons case, where he pleads not guilty to the accusation made in the complaint; and (b) in any other case, upon framing of charge. (2) The interim compensation under sub-section (1) shall not exceed twenty per cent. of the amount of the cheque. (3) The interim compensation shall be paid within sixty days from the date of the order under sub- section (1), or w …
  [open](#law?act=ni&eid=sec_143A)

- **144. Mode of service of summons** (`ni:sec_144`, tier: operative) - Mode of service of summons on the accused.
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974) and for the purposes of this Chapter, a Magistrate issuing a summons to an accused or a witness may direct a copy of summons to be served at the place where such accused or witness ordinarily resides or carries on business or personally works for gain, by speed post or by such courier services as are approved by a Court of Session. (2) Where an acknowledgment purporting to be signed by the accused or the witness or an endorsement purported to be made by any person authorised by the postal department or t …
  [open](#law?act=ni&eid=sec_144)

- **145. Evidence on affidavit** (`ni:sec_145`, tier: operative) - Complainant's evidence may be given on affidavit.
  > (1)Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974), the evidence of the complainant may be given by him on affidavit and may, subject to all just exceptions be read in evidence in any enquiry, trial or other proceeding under the said Code. (2) The Court may, if it thinks fit, and shall, on the application of the prosecution or the accused, summon and examine any person giving evidence on affidavit as to the facts contained therein.
  [open](#law?act=ni&eid=sec_145)

- **146. Bank’s slip prima facie evidence of certain facts** (`ni:sec_146`, tier: operative) - Bank's slip/memo is prima facie evidence of dishonour.
  > The Court shall, in respect of every proceeding under this Chapter, on production of Bank's slip or memo having thereon the official mark denoting that the cheque has been dishonoured, presume the fact of dishonour of such cheque, unless and until such fact is disproved.
  [open](#law?act=ni&eid=sec_146)

- **147. Offences to be compoundable** (`ni:sec_147`, tier: operative) - Every offence under the Act is compoundable.
  > Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974),every offence punishable under this Act shall be compoundable].
  [open](#law?act=ni&eid=sec_147)

- **148. Power of Appellate Court to order payment pending appeal against conviction** (`ni:sec_148`, tier: operative) - Appellate court may order deposit of min 20% of the fine/compensation pending appeal.
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974), in an appeal by the drawer against conviction under section 138, the Appellate Court may order the appellant to deposit such sum which shall be a minimum of twenty per cent. of the fine or compensation awarded by the trial Court: Provided that the amount payable under this sub-section shall be in addition to any interim compensation paid by the appellant under section 143A. (2) The amount referred to in sub-section (1) shall be deposited within sixty days from the date of the order, or within such furth …
  [open](#law?act=ni&eid=sec_148)

- **3. Interpretation-clause** (`ni:sec_3`, tier: definition) - 
  > In this Act— “Banker”.—5[“banker” includes any person acting as a banker and any post office savings bank;]
  [open](#law?act=ni&eid=sec_3)

- **6. “Cheque.”** (`ni:sec_6`, tier: definition) - Includes a cheque in the electronic form and a truncated cheque (Explanation).
  > A “cheque” is a bill of exchange drawn on a specified banker and not expressed to be payable otherwise than on demand and it includes the electronic image of a truncated cheque and a cheque in the electronic form. Explanation I.—For the purposes of this section, the expressions— [(a) “a cheque in the electronic form” means a cheque drawn in electronic form by using any computer resource and signed in a secure system with digital signature (with or without biometrics signature) and asymmetric crypto system or with electronic signature, as the case may be;] (b) “a truncated cheque” means a chequ …
  [open](#law?act=ni&eid=sec_6)

- **7. “Drawer” “Drawee”** (`ni:sec_7`, tier: definition) - 
  > The maker of a bill of exchange or cheque is called the “drawer”; the person thereby directed to pay is called the “drawee”. “Drawee in case of need”.— When in the Bill or in any indorsement thereon the name of any person is given in addition to the drawee to be resorted to in case of need such person is called a “drawee in case of need.” “Acceptor”.—After the drawee of a bill has signed his assent upon the bill, or, if there are more parts thereof than one, upon one of such parts, and delivered the same, or given notice of such signing to the holder or to some person on his behalf, he is call …
  [open](#law?act=ni&eid=sec_7)

- **8. “Holder”** (`ni:sec_8`, tier: definition) - 
  > The “holder” of a promissory note, bill of exchange or cheque means any person entitled in his own name to the possession thereof and to receive or recover the amount due thereon from the parties thereto. Where the note, bill or cheque is lost or destroyed, its holder is the person so entitled at the time of such loss or destruction.
  [open](#law?act=ni&eid=sec_8)

- **9. “Holder in due course”** (`ni:sec_9`, tier: definition) - The complainant under s.138 must be the payee or the holder in due course.
  > “Holder in due course” means any person who for consideration became the possessor of a promissory note, bill of exchange or cheque if payable to bearer, or the payee or indorsee thereof, if 1[payable to order,] before the amount mentioned in it became payable, and without having sufficient cause to believe that any defect existed in the title of the person from whom he derived his title.
  [open](#law?act=ni&eid=sec_9)

- **10. “Payment in due course”** (`ni:sec_10`, tier: definition) - 
  > “Payment in due course” means payment in accordance with the apparent tenor of the instrument in good faith and without negligence to any person in possession thereof under circumstances which do not afford a reasonable ground for believing that he is not entitled to receive payment of the amount therein mentioned.
  [open](#law?act=ni&eid=sec_10)

- **13. “Negotiable instrument”** (`ni:sec_13`, tier: definition) - 
  > (1) A “negotiable instrument” means a promissory note, bill of exchange or cheque payable either to order or to bearer. Explanation (i)—A promissory note, bill of exchange or cheque is payable to order which is expressed to be so payable or which is expressed to be payable to a particular person, and does not contain words prohibiting transfer or indicating an intention that it shall not be transferable. Explanation (ii)—A promissory note, bill of exchange or cheque is payble to bearer which is expressed to be so payable or on which the only or last indorsement is an indorsement in blank. Expl …
  [open](#law?act=ni&eid=sec_13)

- **20. Inchoate stamped instruments** (`ni:sec_20`, tier: supporting) - Blank/incomplete cheques later filled in - a common s.138 defence issue.
  > Where one person signs and delivers to another a paper stamped in accordance with the law relating to negotiable instruments then in force in 2[India], and either wholly blank or having written thereon an incomplete negotiable instrument, he thereby gives prima facie authority to the holder thereof to make or complete, as the case may be, upon it a negotiable instrument, for any amount specified therein and not exceeding the amount covered by the stamp. The person so signing shall be liable upon such instrument, in the capacity in which he signed the same, to any holder in due course for such  …
  [open](#law?act=ni&eid=sec_20)

- **87. Effect of material alteration** (`ni:sec_87`, tier: supporting) - Effect of material alteration of the instrument - a defence issue.
  > Any material alteration of a negotiable instrument renders the same void as against anyone who is a party thereto at the time of making such alteration and does not consent thereto, unless it was made in order to carry out the common intention of the original parties; Alteration by indorsee.—And any such alteration, if made by an indorsee, discharges his indorser from all liability to him in respect of the consideration thereof. The provisions of this section are subject to those of sections 20, 49, 86 and 125.
  [open](#law?act=ni&eid=sec_87)

- **118. Presumptions as to negotiable instruments** (`ni:sec_118`, tier: supporting) - General presumptions (consideration, date, etc.) read with s.139.
  > Until the contrary is proved, the following presumptions shall be made:— (a) of consideration:—that every negotiable instrument was made or drawn for consideration, and that every such instrument, when it has been accepted, indorsed, negotiated or transferred, was accepted, indorsed, negotiated or transferred for consideration; (b) as to date:—that every negotiable instrument bearing a date was made or drawn on such date; (c) as to time of acceptance:—that every accepted bill of exchange was accepted within a reasonable time after its date and before its maturity; (d) as to time of transfer:—t …
  [open](#law?act=ni&eid=sec_118)

- **72. Presentment of cheque to charge drawer** (`ni:sec_72`, tier: supporting) - Presentment of cheque to charge the drawer.
  > 1[Subject to the provisions of section 84,] a cheque must, in order to charge the drawer, be presented at the bank upon which it is drawn before the relation between the drawer and his banker has been altered to the prejudice of the drawer.
  [open](#law?act=ni&eid=sec_72)

- **84. When cheque not duly presented and drawer damaged thereby** (`ni:sec_84`, tier: supporting) - When a cheque is not duly presented and the drawer is damaged thereby.
  > (1) Where a cheque is not presented for payment within a reasonable time of its issue, and the drawer or person on whose account it is drawn had the right, at the time when presentment ought to have been made, as between himself and the banker, to have the cheque paid and suffers actual damage through the delay, he is discharged to the extent of such damage, that is to say, to the extent to which such drawer or person is a creditor of the banker to a large amount than he would have been if such cheque had been paid. (2) In determining what is a reasonble time, regard shall be had to the nature …
  [open](#law?act=ni&eid=sec_84)

### Bharatiya Nagarik Suraksha Sanhita, 2023  `bnss`
*procedure · in force from 2024-07-01* - 10 provisions pinned to this case type.

- **210. Cognizance of offences by Magistrate** (`bnss:sec_210`, tier: procedure) - = CrPC s.190
  > (1) Subject to the provisions of this Chapter, any Magistrate of the first class, and any Magistrate of the second class specially empowered in this behalf under sub-section (2), may take cognizance of any offence— (a) upon receiving a complaint of facts, including any complaint filed by a person authorised under any special law, which constitutes such offence; (b) upon a police report (submitted in any mode including electronic mode) of such facts; (c) upon information received from any person other than a police officer, or upon his own knowledge, that such offence has been committed. (2) Th …
  [open](#law?act=bnss&eid=sec_210)

- **223. Examination of complainant** (`bnss:sec_223`, tier: procedure) - = CrPC s.200
  > (1) A Magistrate having jurisdiction while taking cognizance of an offence on complaint shall examine upon oath the complainant and the witnesses present, if any, and the substance of such examination shall be reduced to writing and shall be signed by the complainant and the witnesses, and also by the Magistrate: Provided that no cognizance of an offence shall be taken by the Magistrate without giving the accused an opportunity of being heard: Provided further that when the complaint is made in writing, the Magistrate need not examine the complainant and the witnesses— (a) if a public servant  …
  [open](#law?act=bnss&eid=sec_223)

- **227. Issue of process** (`bnss:sec_227`, tier: procedure) - = CrPC s.204
  > (1) If in the opinion of a Magistrate taking cognizance of an offence there is sufficient ground for proceeding, and the case appears to be— (a) a summons-case, he shall issue summons to the accused for his attendance; or (b) a warrant-case, he may issue a warrant, or, if he thinks fit, a summons, for causing the accused to be brought or to appear at a certain time before such Magistrate or (if he has no jurisdiction himself) some other Magistrate having jurisdiction: Provided that summons or warrants may also be issued through electronic means. (2) No summons or warrant shall be issued agains …
  [open](#law?act=bnss&eid=sec_227)

- **285. Procedure for summary trials** (`bnss:sec_285`, tier: procedure) - Chapter on summary trials (ss.283-288) = CrPC ss.262-265
  > (1) In trials under this Chapter, the procedure specified in this Sanhita for the trial of summons-case shall be followed except as hereinafter mentioned. (2) No sentence of imprisonment for a term exceeding three months shall be passed in the case of any conviction under this Chapter.
  [open](#law?act=bnss&eid=sec_285)

- **63. Form of summons** (`bnss:sec_63`, tier: procedure) - 
  > Every summons issued by a Court under this Sanhita shall be,— (i) in writing, in duplicate, signed by the presiding officer of such Court or by such other officer as the High Court may, from time to time, by rule direct, and shall bear the seal of the Court; or (ii) in an encrypted or any other form of electronic communication and shall bear the image of the seal of the Court or digital signature.
  [open](#law?act=bnss&eid=sec_63)

- **64. Summons how served** (`bnss:sec_64`, tier: procedure) - 
  > (1) Every summons shall be served by a police officer, or subject to such rules as the State Government may make in this behalf, by an officer of the Court issuing it or other public servant: Provided that the police station or the registrar in the Court shall maintain a register to enter the address, email address, phone number and such other details as the State Government may, by rules, provide. (2) The summons shall, if practicable, be served personally on the person summoned, by delivering or tendering to him one of the duplicates of the summons: Provided that summons bearing the image of …
  [open](#law?act=bnss&eid=sec_64)

- **359. Compounding of offences** (`bnss:sec_359`, tier: procedure) - = CrPC s.320
  > (1) The offences punishable under the sections of the Bharatiya Nyaya Sanhita, 2023 (45 of 2023) specified in the first two columns of the Table next following may be compounded by the persons mentioned in the third column of that Table: — TABLE Offence Section of the Bharatiya Nyaya Person by whom offence Sanhita, 2023 applicable may be compounded 1 2 3 Enticing or taking away or 84 The husband of the woman detaining with criminal intent a and the woman. married woman. Voluntarily causing hurt. 115(2) The person to whom the hurt is caused. Voluntarily causing hurt on 122(1) The person to whom …
  [open](#law?act=bnss&eid=sec_359)

- **395. Order to pay compensation** (`bnss:sec_395`, tier: procedure) - = CrPC s.357
  > (1) When a Court imposes a sentence of fine or a sentence (including a sentence of death) of which fine forms a part, the Court may, when passing judgment, order the whole or any part of the fine recovered to be applied— (a) in defraying the expenses properly incurred in the prosecution; (b) in the payment to any person of compensation for any loss or injury caused by the offence, when compensation is, in the opinion of the Court, recoverable by such person in a Civil Court; (c) when any person is convicted of any offence for having caused the death of another person or of having abetted the c …
  [open](#law?act=bnss&eid=sec_395)

- **415. Appeals from convictions** (`bnss:sec_415`, tier: procedure) - = CrPC s.374 (relevant to s.148 appeals)
  > (1) Any person convicted on a trial held by a High Court in its extraordinary original criminal jurisdiction may appeal to the Supreme Court. (2) Any person convicted on a trial held by a Sessions Judge or an Additional Sessions Judge or on a trial held by any other Court in which a sentence of imprisonment for more than seven years has been passed against him or against any other person convicted at the same trial, may appeal to the High Court. (3) Save as otherwise provided in sub-section (2), any person,-- (a) convicted on a trial held by Magistrate of the first class, or of the second clas …
  [open](#law?act=bnss&eid=sec_415)

- **514. Bar to taking cognizance after lapse of period of limitation** (`bnss:sec_514`, tier: procedure) - 
  > (1) Except as otherwise provided in this Sanhita, no Court shall take cognizance of an offence of the category specified in sub-section (2), after the expiry of the period of limitation. (2) The period of limitation shall be— (a) six months, if the offence is punishable with fine only; (b) one year, if the offence is punishable with imprisonment for a term not exceeding one year; (c) three years, if the offence is punishable with imprisonment for a term exceeding one year but not exceeding three years. (3) For the purposes of this section, the period of limitation, in relation to offences whic …
  [open](#law?act=bnss&eid=sec_514)

### Code of Criminal Procedure, 1973  `crpc`
*procedure · repealed 2024-07-01; applies to causes of action before that date* - 7 provisions pinned to this case type.

- **190. Cognizance of offences by Magistrates** (`crpc:sec_190`, tier: procedure) - 
  > (1) Subject to the provisions of this Chapter, any Magistrate of the first class, and any Magistrate of the second class specially empowered in this behalf under sub-section (2), may take cognizance of any offence— (a) upon receiving a complaint of facts which constitute such offence; (b) upon a police report of such facts; (c) upon information received from any person other than a police officer, or upon his own knowledge, that such offence has been committed. (2) The Chief Judicial Magistrate may empower any Magistrate of the second class to take cognizance under sub-section (1) of such offe …
  [open](#law?act=crpc&eid=sec_190)

- **200. Examination of complainant** (`crpc:sec_200`, tier: procedure) - 
  > A Magistrate taking cognizance of an offence on complaint shall examine upon oath the complainant and the witnesses present, if any, and the substance of such examination shall be reduced to writing and shall be signed by the complainant and the witnesses, and also by the Magistrate: Provided that, when the complaint is made in writing, the Magistrate need not examine the complainant and the witnesses— (a) if a public servant acting or purporting to act in the discharge of his official duties or a Court has made the complaint; or (b) if the Magistrate makes over the case for inquiry or trial t …
  [open](#law?act=crpc&eid=sec_200)

- **204. Issue of process** (`crpc:sec_204`, tier: procedure) - 
  > (1) If in the opinion of a Magistrate taking cognizance of an offence there is sufficient ground for proceeding, and the case appears to be— (a) a summons-case, he shall issue his summons for the attendance of the accused, or (b) a warrant-case, he may issue a warrant, or, if he thinks fit, a summons, for causing the accused to be brought or to appear at a certain time before such Magistrate or (if he has no jurisdiction himself) some other Magistrate having jurisdiction. (2) No summons or warrant shall be issued against the accused under sub-section (1) until a list of the prosecution witness …
  [open](#law?act=crpc&eid=sec_204)

- **262. Procedure for summary trials** (`crpc:sec_262`, tier: procedure) - Expressly invoked by NI Act s.143 (ss.262-265).
  > (1) In trials under this Chapter, the procedure specified in this Code for the trial of summons-case shall be followed except as hereinafter mentioned. (2) No sentence of imprisonment for a term exceeding three months shall be passed in the case of any conviction under this Chapter.
  [open](#law?act=crpc&eid=sec_262)

- **320. Compounding of offences** (`crpc:sec_320`, tier: procedure) - 
  > (1) The offences punishable under the sections of the Indian Penal Code (45 of 1860) specified in the first two columns of the Table next following may be compounded by the persons mentioned in the third column of that Table:— [TABLE Offence Section of the Person by whom offence Indian Penal may be compounded Code applicable 1 2 3 Uttering words, etc., with deliberate 298 The person whose religious feelings intent to wound the religious are intended to be wounded. feelings of any person. Voluntarily causing hurt. 323 The person to whom the hurt is caused. Voluntarily causing hurt on 334 Ditto. …
  [open](#law?act=crpc&eid=sec_320)

- **357. Order to pay compensation** (`crpc:sec_357`, tier: procedure) - 
  > (1) When a Court imposes a sentence of fine or a sentence (including a sentence of death) of which fine forms a part, the Court may, when passing judgment, order the whole or any part of the fine recovered to be applied— (a) in defraying the expenses of properly incurred in the prosecution; (b) in the payment to any person of compensation for any loss or injury caused by the offence, when compensation is, in the opinion of the Court, recoverable by such person in a Civil Court; (c) when any person is convicted of any offence for having caused the death of another person or of having abetted th …
  [open](#law?act=crpc&eid=sec_357)

- **374. Appeals from convictions** (`crpc:sec_374`, tier: procedure) - 
  > (1) Any person convicted on a trial held by a High Court in its extraordinary original criminal jurisdiction may appeal to the Supreme Court. (2) Any person convicted on a trial held by a Sessions Judge or an Additional Sessions Judge or on a trial held by any other court in which a sentence of imprisonment for more than seven years 2[has been passed against him or against any other person convicted at the same trial], may appeal to the High Court. (3) Save as otherwise provided in sub-section (2), any person,— (a) convicted on a trial held by a Metropolitan Magistrate or Assistant Sessions Ju …
  [open](#law?act=crpc&eid=sec_374)

### Bharatiya Sakshya Adhiniyam, 2023  `bsa`
*evidence · in force from 2024-07-01* - 3 provisions pinned to this case type.

- **104. Burden of proof** (`bsa:sec_104`, tier: evidence) - = IEA s.101
  > Whoever desires any Court to give judgment as to any legal right or liability dependent on the existence of facts which he asserts must prove that those facts exist, and when a person is bound to prove the existence of any fact, it is said that the burden of proof lies on that person. Illustrations. (a) A desires a Court to give judgment that B shall be punished for a crime which A says B has committed. A must prove that B has committed the crime. (b) A desires a Court to give judgment that he is entitled to certain land in the possession of B, by reason of facts which he asserts, and which B  …
  [open](#law?act=bsa&eid=sec_104)

- **63. Admissibility of electronic records** (`bsa:sec_63`, tier: evidence) - = IEA s.65B (proof of CTS / e-cheque records)
  > (1) Notwithstanding anything contained in this Adhiniyam, any information contained in an electronic record which is printed on paper, stored, recorded or copied in optical or magnetic media or semiconductor memory which is produced by a computer or any communication device or otherwise stored, recorded or copied in any electronic form (hereinafter referred to as the computer output) shall be deemed to be also a document, if the conditions mentioned in this section are satisfied in relation to the information and computer in question and shall be admissible in any proceedings, without further  …
  [open](#law?act=bsa&eid=sec_63)

- **86. Presumption as to electronic records and electronic signatures** (`bsa:sec_86`, tier: evidence) - 
  > (1) In any proceeding involving a secure electronic record, the Court shall presume unless contrary is proved, that the secure electronic record has not been altered since the specific point of time to which the secure status relates. (2) In any proceeding, involving secure electronic signature, the Court shall presume unless the contrary is proved that— (a) the secure electronic signature is affixed by subscriber with the intention of signing or approving the electronic record; (b) except in the case of a secure electronic record or a secure electronic signature, nothing in this section shall …
  [open](#law?act=bsa&eid=sec_86)

### Indian Evidence Act, 1872  `iea`
*evidence · repealed 2024-07-01* - 2 provisions pinned to this case type.

- **101. Burden of proof. –– Whoever desires any Court to give judgment as to any legal right or** (`iea:sec_101`, tier: evidence) - 
  > liability dependent on the existence of facts which he asserts, must prove that those facts exist. When a person is bound to prove the existence of any fact, it is said that the burden of proof lies on that person. Illustrations (a) A desires a Court to give judgment that B shall be punished for a crime which A says B has committed. A must prove that B has committed the crime. (b) A desires a Court to give judgment that he is entitled to certain land in the possession of B, by reason of facts which he asserts, and which B denies, to be true. A must prove the existence of those facts.
  [open](#law?act=iea&eid=sec_101)

- **65B. Admissibility of electronic records. –– (1) Notwithstanding anything contained in this Act,** (`iea:sec_65B`, tier: evidence) - 
  > any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media produced by a computer (hereinafter referred to as the computer output) shall be deemed to be also a document, if the conditions mentioned in this section are satisfied in relation to the information and computer in question and shall be admissible in any proceedings, without further proof or production of the original, as evidence or any contents of the original or of any fact stated therein of which direct evidence would be admissible. (2) The conditions refe …
  [open](#law?act=iea&eid=sec_65B)

### Bankers' Books Evidence Act, 1891  `bbea`
*evidence · in force* - 2 provisions pinned to this case type.

- **2. Definitions** (`bbea:sec_2`, tier: evidence) - 
  > In this Act, unless there is something repugnant in the subject or context,— (1) “company” means any company as defined in section 3 of the Companies Act, 1956 (1 of 1956), and includes a foreign company within the meaning of section 591 of that Act; (1A) “corporation” means any body corporate established by any law for the time being in force in India and includes the Reserve Bank of India, the State Bank of India and any subsidiary bank as defined in the State Bank of India (Subsidiary Banks) Act, 1959 (38 of 1959);] (2) “bank” and “banker” mean— [(a) any company or corporation carrying on t …
  [open](#law?act=bbea&eid=sec_2)

- **4. Mode of proof of entries in bankers’ books** (`bbea:sec_4`, tier: evidence) - Proving the account/dishonour through certified bank-book entries.
  > Subject to the provisions of this Act, a certified copy of any entry in a banker’s book shall in all legal proceedings be received as prima facie evidence of the existence of such entry, and shall be admitted as evidence of the matters, transactions and accounts therein recorded in every case where, and to the same extent as, the original entry itself is now by law admissible, but not further or otherwise.
  [open](#law?act=bbea&eid=sec_4)

### General Clauses Act, 1897  `genclauses`
*interpretation · in force* - 1 provisions pinned to this case type.

- **27. Meaning of service by post** (`genclauses:sec_27`, tier: notice) - The basis for deemed service of the s.138 demand notice (C.C. Alavi Haji).
  > Where any 2[Central Act] or Regulation made after the commencement of this Act authorizes or requires any document to be served by post, whether the expression “serve” or either of the expressions “give” or “send” or any other expression is used, then, unless a different intention appears, the service shall be deemed to be effected by properly addressing, pre-paying and posting by registered post, a letter containing the document, and, unless the contrary is proved, to have been effected at the time at which the letter would be delivered in the ordinary course of post.
  [open](#law?act=genclauses&eid=sec_27)

### Limitation Act, 1963  `limitation`
*limitation · in force* - 1 provisions pinned to this case type.

- **5. Extension of prescribed period in certain cases** (`limitation:sec_5`, tier: limitation) - Extension of the prescribed period for sufficient cause - read with the s.142 proviso.
  > Any appeal or any application, other than an application under any of the provisions of Order XXI of the Code of Civil Procedure, 1908 (5 of 1908), may be admitted after the prescribed period if the appellant or the applicant satisfies the court that he had sufficient cause for not preferring the appeal or making the application within such period. Explanation.—The fact that the appellant or the applicant was misled by any order, practice or judgment of the High Court in ascertaining or computing the prescribed period may be sufficient cause within the meaning of this section.
  [open](#law?act=limitation&eid=sec_5)

### Probation of Offenders Act, 1958  `probation`
*sentencing · in force* - 3 provisions pinned to this case type.

- **3. Power of court to release certain offenders after admonition** (`probation:sec_3`, tier: sentencing) - 
  > When any person is found guilty of having committed an offence punishable under section 379 or section 380 or section 381 or section 404 or section 420 of the Indian Penal Code, (45 of 1860) or any offence punishable with imprisonment for not more than two years, or with fine, or with both, under the Indian Penal Code or any other law, and no previous conviction is proved against him and the court by which the person is found guilty is of opinion that, having regard to the circumstances of the case including the nature of the offence, and the character of the offender, it is expedient so to do …
  [open](#law?act=probation&eid=sec_3)

- **4. Power of court to release certain offenders on probation of good conduct** (`probation:sec_4`, tier: sentencing) - Directed to be considered in s.138 cases (Sanjabij Tari, 2025).
  > (1) When any person is found guilty of having committed an offence not punishable with death or imprisonment for life and the court by which the person is found guilty is of opinion that, having regard to the circumstances of the case including the nature of the offence and the character of the offender, it is expedient to release him on probation of good conduct, then, notwithstanding anything contained in any other law for the time being in force, the court may, instead of sentencing him at once to any punishment direct that he be released on his entering into a bond, with or without suretie …
  [open](#law?act=probation&eid=sec_4)

- **5. Power of court to require released offenders to pay compensation and costs** (`probation:sec_5`, tier: sentencing) - 
  > (1) The court directing the release of an offender under section 3 or section 4, may, if it thinks fit, make at the same time a further order directing him to pay— (a) such compensation as the court thinks reasonable for loss or injury caused to any person by the commission of the offence; and (b) such costs of the proceedings as the court thinks reasonable. (2) The amount ordered to be paid under sub-section (1) may be recovered as a fine in accordance with the provisions of sections 386 and 387 of the Code. (3) A civil court trying any suit, arising out of the same matter for which the offen …
  [open](#law?act=probation&eid=sec_5)

### Information Technology Act, 2000  `itact`
*electronic · in force* - 3 provisions pinned to this case type.

- **2. Definitions** (`itact:sec_2`, tier: definition) - 'electronic form', 'electronic record', etc., referenced by NI Act s.6 Explanation.
  > (1) In this Act, unless the context otherwise requires,— (a) ―access‖ with its grammatical variations and cognate expressions means gaining entry into, instructing or communicating with the logical, arithmetical, or memory function resources of a computer, computer system or computer network; (b) ―addressee‖ means a person who is intended by the originator to receive the electronic record but does not include any intermediary; (c) ―adjudicating officer‖ means an adjudicating officer appointed under sub-section (1) of section 46;
  [open](#law?act=itact&eid=sec_2)

- **3. Authentication of electronic records.–(1) Subject to the provisions of this section any subscriber** (`itact:sec_3`, tier: supporting) - 
  > may authenticate an electronic record by affixing his digital signature. (2) The authentication of the electronic record shall be effected by the use of asymmetric crypto system and hash function which envelop and transform the initial electronic record into another electronic record. Explanation.–For the purposes of this sub-section, ―hash function‖ means an algorithm mapping or translation of one sequence of bits into another, generally smaller, set known as ―hash result‖ such that an electronic record yields the same hash result every time the algorithm is executed with the same electronic  …
  [open](#law?act=itact&eid=sec_3)

- **3A. Electronic signature** (`itact:sec_3A`, tier: supporting) - Relevant to cheques in electronic form.
  > (1) Notwithstanding anything contained in section 3, but subject to the provisions of sub-section (2), a subscriber may authenticate any electronic record by such electronic signature or electronic authentication technique which— (a) is considered reliable; and (b) may be specified in the Second Schedule. (2) For the purposes of this section any electronic signature or electronic authentication technique shall be considered reliable if— (a) the signature creation data or the authentication data are, within the context in which they are used, linked to the signatory or, as the case may be, the  …
  [open](#law?act=itact&eid=sec_3A)

### Constitution of India  `constitution`
*constitutional · in force* - 10 provisions pinned to this case type.

- **21. Protection of life and personal liberty.** (`constitution:art_21`, tier: constitutional) - The constitutional anchor for expeditious disposal of s.138 complaints (In re Expeditious Trial of Cases under s.138 NI Act, 2021) and for scrutiny of default/sentence of imprisonment; guarantees a fair procedure established by law.
  > No person shall be deprived of his life or personal liberty except according to procedure established by law.
  [open](#law?act=constitution&eid=art_21)

- **142. Enforcement of decrees and orders of Supreme Court and orders as to discovery, etc.** (`constitution:art_142`, tier: constitutional) - Source of the compounding-cost guidelines (Damodar S. Prabhu v. Sayed Babalal, 2010) and of directions to settle/close s.138 cases (Meters and Instruments v. Kanchan Mehta, 2018; In re Expeditious Trial, 2021).
  > (1) The Supreme Court in the exercise of its jurisdiction may pass such decree or make such order as is necessary for doing complete justice in any cause or matter pending before it, and any decree so passed or order so made shall be enforceable throughout the territory of India in such manner as may be prescribed by or under any law made by Parliament and, until provision in that behalf is so made, in such manner as the President may by order prescribe. (2) Subject to the provisions of any law made in this behalf by Parliament, the Supreme Court shall, as respects the whole of the territory o …
  [open](#law?act=constitution&eid=art_142)

- **226. Power of High Courts to issue certain writs.** (`constitution:art_226`, tier: constitutional) - Together with s.482 CrPC / s.528 BNSS, the route to quash a s.138 complaint or challenge the proceedings; the writ power is independent of the inherent power.
  > (1) Notwithstanding anything in article 32 *** every High Court shall have power, throughout the territories in relation to which it exercises jurisdiction, to issue to any person or authority, including in appropriate cases, any Government, within those territories directions, orders or writs, including [writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari , or any of them, for the enforcement of any of the rights conferred by Part III and for any other purpose.] (2) The power conferred by clause (1) to issue directions, orders or writs to any Government, a …
  [open](#law?act=constitution&eid=art_226)

- **227. Power of superintendence over all courts by the High Court.** (`constitution:art_227`, tier: constitutional) - Supervisory jurisdiction over the trial magistrate hearing the s.138 case; used to test interlocutory orders, transfers and delay.
  > (1) Every High Court shall have superintendence over all courts and tribunals throughout the territories in relation to which it exercises jurisdiction.] (2) Without prejudice to the generality of the foregoing provision, the High Court may— (a) call for returns from such courts; (b) make and issue general rules and prescribe forms for regulating the practice and proceedings of such courts; and (c) prescribe forms in which books, entries and accounts shall be kept by the officers of any such courts. (3) The High Court may also settle tables of fees to be allowed to the sheriff and all clerks a …
  [open](#law?act=constitution&eid=art_227)

- **141. Law declared by Supreme Court to be binding on all courts.** (`constitution:art_141`, tier: constitutional) - Makes the s.138 case law (Rangappa, Dashrath Rupsingh, Damodar Prabhu, Expeditious Trial, etc.) binding on every court trying these cases.
  > The law declared by the Supreme Court shall be binding on all courts within the territory of India.
  [open](#law?act=constitution&eid=art_141)

- **136. Special leave to appeal by the Supreme Court.** (`constitution:art_136`, tier: constitutional) - The discretionary route by which s.138 matters reach the Supreme Court after the High Court.
  > (1) Notwithstanding anything in this Chapter, the Supreme Court may, in its discretion, grant special leave to appeal from any judgment, decree, determination, sentence or order in any cause or matter passed or made by any court or tribunal in the territory of India. (2) Nothing in clause (1) shall apply to any judgment, determination, sentence or order passed or made by any court or tribunal constituted by or under any law relating to the Armed Forces.
  [open](#law?act=constitution&eid=art_136)

- **246. Subject-matter of laws made by Parliament and by the Legislatures of States.** (`constitution:art_246`, tier: constitutional) - Legislative competence for the NI Act: Entry 46 of List III (Concurrent) - 'bills of exchange, cheques, promissory notes and other like instruments'.
  > (1) Notwithstanding anything in clauses (2) and (3), Parliament has exclusive power to make laws with respect to any of the matters enumerated in List I in the Seventh Schedule (in this Constitution referred to as the “Union List”). (2) Notwithstanding anything in clause (3), Parliament, and, subject to clause (1), the Legislature of any State *** also, have power to make laws with respect to any of the matters enumerated in List III in the Seventh Schedule (in this Constitution referred to as the “Concurrent List”). (3) Subject to clauses (1) and (2), the Legislature of any State *** has excl …
  [open](#law?act=constitution&eid=art_246)

- **39A. Equal justice and free legal aid.** (`constitution:art_39A`, tier: constitutional) - Underlies referral of s.138 disputes to Lok Adalat / mediation and other access-to-justice measures; a Directive Principle, not directly enforceable.
  > The State shall secure that the operation of the legal system promotes justice, on a basis of equal opportunity, and shall, in particular, provide free legal aid, by suitable legislation or schemes or in any other way, to ensure that opportunities for securing justice are not denied to any citizen by reason of economic or other disabilities.]
  [open](#law?act=constitution&eid=art_39A)

- **20. Protection in respect of conviction for offences.** (`constitution:art_20`, tier: constitutional) - Art. 20(1)'s bar on retrospective penal/pecuniary liability informs the prospective-only application of the s.143A interim-compensation power (G.J. Raja v. Tejraj Surana, 2019); Art. 20(3) is raised where specimen signatures/handwriting are compelled.
  > (1) No person shall be convicted of any offence except for violation of a law in force at the time of the commission of the Act charged as an offence, nor be subjected to a penalty greater than that which might have been inflicted under the law in force at the time of the commission of the offence. (2) No person shall be prosecuted and punished for the same offence more than once. (3) No person accused of any offence shall be compelled to be a witness against himself.
  [open](#law?act=constitution&eid=art_20)

- **14. Equality before law.** (`constitution:art_14`, tier: constitutional) - Frames challenges to arbitrary procedure and supports the 'regulatory / compensatory offence' characterisation of s.138.
  > The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India. 6
  [open](#law?act=constitution&eid=art_14)

### Advocates Act, 1961  `advocates`
*representation · in force* - 4 provisions pinned to this case type.

- **29. Advocates to be the only recognised class of persons entitled to practise law.―Subject to the** (`advocates:sec_29`, tier: supporting) - Only one class of persons may practise the profession of law - advocates. The complainant and the accused in a s.138 case are represented by advocates enrolled under this Act.
  > provisions of this Act and any rules made thereunder, there shall, as from the appointed day, be only one class of persons entitled to practise the profession of law, namely, advocates.
  [open](#law?act=advocates&eid=sec_29)

- **30. Right of advocates to practise.―Subject to the provisions of this Act, every advocate whose name is** (`advocates:sec_30`, tier: supporting) - Every enrolled advocate's right, as of right, to practise in all courts - including the Magistrate trying a s.138 complaint. This is the source of the Advocate role.
  > entered in the 3[State roll] shall be entitled as of right to practise throughout the territories to which this Act extends,― (i) in all courts including the Supreme Court; (ii) before any tribunal or person legally authorised to take evidence; and (iii) before any other authority or person before whom such advocate is by or under any law for the time being in force entitled to practise.
  [open](#law?act=advocates&eid=sec_30)

- **32. Power of court to permit appearances in particular cases.―Notwithstanding anything contained in** (`advocates:sec_32`, tier: supporting) - The court may permit a person who is not an advocate to appear in a particular case - the basis on which a party in person, or a duly authorised agent, is heard in a s.138 matter.
  > this Chapter, any court, authority, or person may permit any person, not enrolled as an advocate under this Act, to appear before it or him in any particular case.
  [open](#law?act=advocates&eid=sec_32)

- **35. Punishment of advocates for misconduct.―(1) Where on receipt of a complaint or otherwise a State** (`advocates:sec_35`, tier: supporting) - Professional-misconduct control over the advocate appearing in the case, exercised by the State Bar Council on a complaint.
  > Bar Council has reason to believe that any advocate on its roll has been guilty of professional or other misconduct, it shall refer the case for disposal to its disciplinary committee. [(1A) The State Bar Council may, either of its own motion or on application made to it by any person interested, withdraw a proceeding pending before its disciplinary committee and direct the inquiry to be made by any other disciplinary committee of that State Bar Council.] (2) The disciplinary committee of a State Bar Council 4*** shall fix a date for the hearing of the case and shall cause a notice thereof to  …
  [open](#law?act=advocates&eid=sec_35)

### Police Act, 1861  `police1861`
*policing · in force* - 4 provisions pinned to this case type.

- **23. Duties of police-officers.** (`police1861:sec_23`, tier: procedure) - The police officer's duty to promptly obey and execute all orders and warrants lawfully issued by a competent authority and to apprehend persons - what the police act under when a s.138 court issues summons or warrants for a non-appearing accused. The Kerala Police Act operationalises this at the state level.
  > It shall be the duty of every police-officer promptly, to obey and execute all orders and warrants lawfully issued to him by any competent authority; to collect and communicate intelligence affecting the public peace; to prevent the commission of offences and public nuisances; to detect and bring offences to justice and to apprehend all persons whom he is legally authorised to apprehend, and for whose apprehension sufficient ground exists; and it shall be lawful for every police-officer, for any of the purposes mentioned in this section, without a warrant to enter and inspect, any drinking-sho …
  [open](#law?act=police1861&eid=sec_23)

- **29. Penalties for neglect of duty, etc.** (`police1861:sec_29`, tier: sentencing) - Penalty on a police officer who neglects or wilfully breaches a lawful order made by a competent authority - the accountability behind executing the court's process.
  > Every police-officer who shall be guilty of any violation of duty or wilful breach or neglect of any rule or regulation of lawful order made by competent authority, or who shall withdraw from the duties of his office without permission, or without having given previous notice for the period of two months, or who, being absent on leave shall fail, without reasonable cause, to report himself for duty on the expiration of such leave or who shall engage without authority in any employment other than his police duty, or who shall be guilty of cowardice, or who shall offer any unwarrantable personal …
  [open](#law?act=police1861&eid=sec_29)

- **43. Plea that act was done under warrant.** (`police1861:sec_43`, tier: procedure) - An officer sued for an act done under a Magistrate's warrant may plead the warrant and is entitled to judgment notwithstanding any defect of jurisdiction - protection for the officer who executes the court's process.
  > When any action of prosecution shall be brought or any proceedings held against any police-officer for any act done by him in such capacity, it shall be lawful for him to plead that such act was done by him under the authority of a warrant issued by a Magistrate. Such plea shall be proved by the production of the warrant directing the act, and purporting to be signed by such Magistrate and the defendant shall, thereupon, be entitled to a decree in his favour, notwithstanding any defect of jurisdiction in such Magistrate. No proof of the signature of such Magistrate shall be necessary, unless t …
  [open](#law?act=police1861&eid=sec_43)

- **44. Police-officers to keep diary.** (`police1861:sec_44`, tier: evidence) - The general diary the station-house officer must keep - complaints and charges, persons arrested, complainants, offences and the witnesses examined - open to inspection by the Magistrate of the district.
  > It shall be the duty of every officer in-charge of a police-station to keep a general diary in such form as shall, from time to lime, be prescribed by the State Government and to record therein, all complaints and charges preferred, the names of all persons arrested, the names of the complainants, the offences charged against them, the weapons or property that shall have been taken from their possession or otherwise, and the names of the witnesses who shall have been examined. The Magistrate of the district shall be at liberty to call for and inspect such diary.
  [open](#law?act=police1861&eid=sec_44)

### Indian Penal Code, 1860  `ipc`
*penal · repealed 2024-07-01* - 6 provisions pinned to this case type.

- **420. Cheating and dishonestly inducing delivery of property** (`ipc:sec_420`, tier: supporting) - Cheating and dishonestly inducing delivery of property - the offence commonly filed alongside a s.138 complaint where the cheque was issued with no intention to pay.
  > Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine. Of fraudulent feeds and dispositions of property
  [open](#law?act=ipc&eid=sec_420)

- **467. Forgery of valuable security, will, etc** (`ipc:sec_467`, tier: supporting) - A cheque is a valuable security; forging or materially altering it is a separate, graver offence than the s.138 dishonour.
  > Whoever forges a document which purports to be a valuable security or a will, or an authority to adopt a son, or which purports to give authority to any person to make or transfer any valuable security, or to receive the principal, interest or dividends thereon, or to receive or deliver any money, movable property, or valuable security, or any document purporting to be an acquittance or receipt acknowledging the payment of money, or an acquittance or receipt for the delivery of any movable property or valuable security, shall be punished with 4[imprisonment for life], or with imprisonment of e …
  [open](#law?act=ipc&eid=sec_467)

- **471. Using as genuine a forged document or electronic record** (`ipc:sec_471`, tier: supporting) - Using as genuine a forged document - e.g. presenting a forged cheque.
  > Whoever fraudulently or dishonestly uses as genuine any 3[document or electronic record] which he knows or has reason to believe to be a forged 3[document or electronic record], shall be punished in the same manner as if he had forged such 3[document or electronic record].
  [open](#law?act=ipc&eid=sec_471)

- **166. Public servant disobeying law, with intent to cause injury to any person** (`ipc:sec_166`, tier: supporting) - Public servant disobeying law, with intent to cause injury. Used to force the police to act on warrants where an officer knowingly disregards the court's lawful direction.
  > Whoever, being a public servant, knowingly disobeys any direction of the law as to the way in which he is to conduct himself as such public servant, intending to cause, or knowing it to be likely that he will, by such disobedience, cause injury to any person, shall be punished with simple imprisonment for a term which may extend to one year, or with fine, or with both. IIIustration A, being an officer directed by law to take property in execution, in order to satisfy a decree pronounced in Z's favour by a Court of Justice, knowingly disobeys that direction of law, with the knowledge that he is …
  [open](#law?act=ipc&eid=sec_166)

- **221. Intentional omission to apprehend on the part of public servant bound to apprehend** (`ipc:sec_221`, tier: supporting) - Intentional omission to apprehend on the part of a public servant bound to apprehend - police wilfully not executing a warrant.
  > Whoever, being a public servant, legally bound as such public servant to apprehend or to keep in confinement any person charged with or liable to be apprehended for an offence, intentionally omits to apprehend such person, or intentionally suffers such person to escape, or intentionally aids such person in escaping or attempting to escape from such confinement, shall be punished as follows, that is to say:— with imprisonment of either description for a term which may extend to seven years, with or without fine, if the person in confinement, or who ought to have been apprehended, was charged wi …
  [open](#law?act=ipc&eid=sec_221)

- **217. Public servant disobeying direction of law with intent to save person from punishment or** (`ipc:sec_217`, tier: supporting) - Public servant disobeying direction of law with intent to save a person from punishment.
  > property from forfeiture.—Whoever, being a public servant, knowingly disobeys any direction of the law as to the way in which he is to conduct himself as such public servant, intending thereby to save, or knowing it to be likely that he will thereby save, any person from legal punishment, or subject him to a less punishment than that to which he is liable, or with intent to save, or knowing that he is likely thereby to save, any property from forfeiture or any charge to which it is liable by law, shall be punished with imprisonment of either description for a term which may extend to two years …
  [open](#law?act=ipc&eid=sec_217)

### Bharatiya Nyaya Sanhita, 2023  `bns`
*penal · in force from 2024-07-01* - 6 provisions pinned to this case type.

- **318. Cheating** (`bns:sec_318`, tier: supporting) - Cheating (BNS). = IPC s.420. Often co-charged with a s.138 complaint.
  > (1) Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property, or intentionally induces the person so deceived to do or omit to do anything which he would not do or omit if he were not so deceived, and which act or omission causes or is likely to cause damage or harm to that person in body, mind, reputation or property, is said to cheat. Explanation.—A dishonest concealment of facts is a deception within the meaning of this section. Illustrations. (a) A, by falsely  …
  [open](#law?act=bns&eid=sec_318)

- **338. Forgery of valuable security, will, etc** (`bns:sec_338`, tier: supporting) - Forgery of a valuable security (BNS). = IPC s.467.
  > Whoever forges a document which purports to be a valuable security or a will, or an authority to adopt a son, or which purports to give authority to any person to make or transfer any valuable security, or to receive the principal, interest or dividends thereon, or to receive or deliver any money, movable property, or valuable security, or any document purporting to be an acquittance or receipt acknowledging the payment of money, or an acquittance or receipt for the delivery of any movable property or valuable security, shall be punished with imprisonment for life, or with imprisonment of eith …
  [open](#law?act=bns&eid=sec_338)

- **340. Forged document or electronic record and using it as genuine** (`bns:sec_340`, tier: supporting) - Using a forged document/record as genuine (BNS). = IPC s.471.
  > (1) A false document or electronic record made wholly or in part by forgery is designated a forged document or electronic record. (2) Whoever fraudulently or dishonestly uses as genuine any document or electronic record which he knows or has reason to believe to be a forged document or electronic record, shall be punished in the same manner as if he had forged such document or electronic record.
  [open](#law?act=bns&eid=sec_340)

- **198. Public servant disobeying law, with intent to cause injury to any person** (`bns:sec_198`, tier: supporting) - Public servant disobeying the law with intent to cause injury. In practice invoked to hold a police officer accountable - and thereby to compel action - where the officer knowingly disregards a lawful direction such as a warrant issued in a s.138 case. = IPC s.166.
  > Whoever, being a public servant, knowingly disobeys any direction of the law as to the way in which he is to conduct himself as such public servant, intending to cause, or knowing it to be likely that he will by such disobedience, cause injury to any person, shall be punished with simple imprisonment for a term which may extend to one year, or with fine, or with both. Illustration. A, being an officer directed by law to take property in execution, in order to satisfy a decree pronounced in Z’s favour by a Court, knowingly disobeys that direction of law, with the knowledge that he is likely the …
  [open](#law?act=bns&eid=sec_198)

- **259. Intentional omission to apprehend on part of public servant bound to apprehend** (`bns:sec_259`, tier: supporting) - Intentional omission to apprehend by a public servant bound to apprehend - the offence where a police officer wilfully fails to execute a warrant or arrest a non-appearing s.138 accused. = IPC s.221.
  > Whoever, being a public servant, legally bound as such public servant to apprehend or to keep in confinement any person charged with or liable to be apprehended for an offence, intentionally omits to apprehend such person, or intentionally suffers such person to escape, or intentionally aids such person in escaping or attempting to escape from such confinement, shall be punished,— (a) with imprisonment of either description for a term which may extend to seven years, with or without fine, if the person in confinement, or who ought to have been apprehended, was charged with, or liable to be app …
  [open](#law?act=bns&eid=sec_259)

- **199. Public servant disobeying direction under law** (`bns:sec_199`, tier: supporting) - Public servant disobeying a direction under law, with intent to save a person from punishment - accountability where lawful process is not acted on. = IPC s.217.
  > Whoever, being a public servant,— (a) knowingly disobeys any direction of the law which prohibits him from requiring the attendance at any place of any person for the purpose of investigation into an offence or any other matter; or (b) knowingly disobeys, to the prejudice of any person, any other direction of the law regulating the manner in which he shall conduct such investigation; or (c) fails to record any information given to him under sub-section (1) of section 173 of the Bharatiya Nagarik Suraksha Sanhita, 2023 in relation to cognizable offence punishable under section 64, section 65, s …
  [open](#law?act=bns&eid=sec_199)

### Payment and Settlement Systems Act, 2007  `pss`
*banking · in force* - 1 provisions pinned to this case type.

- **25. Dishonour of electronic funds transfer for insufficiency, etc., of funds in the account** (`pss:sec_25`, tier: supporting) - The Payment and Settlement Systems Act analogue of s.138 - dishonour of an electronic funds transfer for insufficiency of funds. Increasingly relevant as clearing moves to CTS / electronic modes.
  > (1) Where an electronic funds transfer initiated by a person from an account maintained by him cannot be executed on the ground that the amount of money standing to the credit of that account is insufficient to honour the transfer instruction or that it exceeds the amount arranged to be paid from that account by an agreement made with a bank, such person shall be deemed to have committed an offence and shall, without prejudice to any other provisions of this Act, be punished with imprisonment for a term which may extend to two years, or with fine which may extend to twice the amount of the ele …
  [open](#law?act=pss&eid=sec_25)

### Oaths Act, 1969  `oaths`
*authentication · in force* - 6 provisions pinned to this case type.

- **3. Power to administer oaths.** (`oaths:sec_3`, tier: evidence) - The courts and persons who may administer oaths and affirmations - the authority behind swearing a s.138 complainant's affidavit and every witness who deposes.
  > (1) The following courts and persons shall have power to administer, by themselves or, subject to the provisions of sub-section (2) of section 6, by an officer empowered by them in this behalf, oaths and affirmations in discharge of the duties imposed or in exercise of the powers conferred upon them by law, namely:— (a) all courts and persons having by law or consent of parties authority to receive evidence; (b) the commanding officer of any military, naval, or air force station or ship occupied by the Armed Forces of the Union, provided that the oath or affirmation is administered within the  …
  [open](#law?act=oaths&eid=sec_3)

- **4. Oaths or affirmations to be made by witnesses, interpreters and jurors.** (`oaths:sec_4`, tier: evidence) - Oaths or affirmations must be made by every witness, and by the interpreter of a witness's evidence, before they testify - the rule that puts a s.138 witness and the court interpreter on oath.
  > (1) Oaths or affirmations shall be made by the following persons, namely:— (a) all witnesses, that is to say, all persons who may lawfully be examined, or give, or be required to give, evidence by or before any court or person having by law or consent of parties authority to examine such persons or to receive evidence; (b) interpreters of questions put to, and evidence given by, witnesses; and (c) jurors: Provided that where the witness is a child under twelve years of age, and the court or person having authority to examine such witness is of opinion that, though the witness understands the d …
  [open](#law?act=oaths&eid=sec_4)

- **5. Affirmation by persons desiring to affirm.** (`oaths:sec_5`, tier: evidence) - A person who objects to being sworn may instead make a solemn affirmation, which has the same force and effect as an oath.
  > A witness, interpreter or juror may, instead of making an oath, make an affirmation.
  [open](#law?act=oaths&eid=sec_5)

- **6. Forms of oaths and affirmations.** (`oaths:sec_6`, tier: evidence) - The prescribed forms in which a s.138 witness's oath or affirmation is administered; a witness may use a form binding on their own community if it is not repugnant to justice or decency.
  > (1) All oaths and affirmations made under section 4 shall be administered according to such one of the forms given in the Schedule as may be appropriate to the circumstances of the case: Provided that if a witness in any judicial proceeding desires to give evidence on oath or solemn affirmation in any form common amongst, or held binding by, persons of the class to which he belongs, and not repugnant to justice or decency, and not purporting to affect any third person, the court may, if it thinks fit, notwithstanding anything hereinbefore contained, allow him to give evidence on such oath or a …
  [open](#law?act=oaths&eid=sec_6)

- **7. Proceedings and evidence not invalidated by omission of oath or irregularity.** (`oaths:sec_7`, tier: evidence) - An omission to administer the oath, or any irregularity in it, does not invalidate the proceeding or make the evidence inadmissible - it forecloses a purely technical attack on a s.138 complainant's or witness's evidence on that ground.
  > No omission to take any oath or make any affirmation, no substitution of any one for any other of them, and no irregularity whatever in the administration of any oath or affirmation or in the form in which it is administered, shall invalidate any proceeding or render inadmissible any evidence whatever, in or in respect of which such omission, substitution or irregularity took place, or shall affect the obligation of a witness to state the truth.
  [open](#law?act=oaths&eid=sec_7)

- **8. Persons giving evidence bound to state the truth.** (`oaths:sec_8`, tier: evidence) - Everyone who gives evidence before the court is bound to state the truth - the duty behind a s.138 complainant's affidavit and the foundation for prosecuting false evidence.
  > Every person giving evidence on any subject before any court or person hereby authorised to administer oaths and affirmations shall be bound to state the truth on such subject.
  [open](#law?act=oaths&eid=sec_8)

### Notaries Act, 1952  `notaries`
*authentication · in force* - 4 provisions pinned to this case type.

- **8. Functions of notaries.** (`notaries:sec_8`, tier: supporting) - What a notary may do: verify, authenticate, certify or attest instruments, and note or protest the dishonour of a promissory note, hundi or bill of exchange. This is also how the power-of-attorney a s.138 complainant's agent files is authenticated.
  > (1) A notary may do all or any of the following acts by virtue of his office, namely:— (a) verify, authenticate, certify or attest the execution of any instrument; (b) present any promissory note, hundi or bill of exchange for acceptance or payment or demand better security; (c) note or protest the dishonour by non-acceptance or non-payment of any promissory note, hundi or bill of exchange or protest for better security or prepare acts of honour under the Negotiable Instruments Act, 1881 (26 of 1881), or serve notice of such note or protest; (d) note and draw up ship's protest, boat's protest  …
  [open](#law?act=notaries&eid=sec_8)

- **2. Definitions.** (`notaries:sec_2`, tier: definition) - Defines a notary as a person appointed under this Act - the office that the Evidence Act / BSA POA-presumption then relies on.
  > In this Act, unless the context otherwise requires,— * * * * * (b) "instrument" includes every document by which any right or liability is, or purports to be, created, transferred, modified, limited, extended, suspended, extinguished or recorded; (c) "legal practitioner" means an advocate entered in any roll under the provisions of the Advocates Act, 1961 (25 of 1961); (d) "notary" means a person appointed as such under this Act: Provided that for a period of two years from the commencement of this Act it shall include also a person who, before such commencement was appointed a notary public 6 …
  [open](#law?act=notaries&eid=sec_2)

- **7. Seal of notaries.** (`notaries:sec_7`, tier: evidence) - Every notary uses a prescribed seal; it is that seal the courts take judicial notice of and on which the presumption of a genuine notarised power-of-attorney (BSA s.84 / Evidence Act s.85) rests.
  > Every notary shall have and use, as occasion may arise, a seal of such form and design as may be prescribed.
  [open](#law?act=notaries&eid=sec_7)

- **11. Construction of references to notaries public in other laws.** (`notaries:sec_11`, tier: supporting) - A reference to a 'notary public' in any other law - the NI Act's noting and protest of a dishonoured instrument, or the Evidence Act / BSA power-of-attorney presumption - is read as a notary entitled to practise under this Act.
  > Any reference to a notary public in any other law shall be construed as a reference to a notary entitled to practice under this Act.
  [open](#law?act=notaries&eid=sec_11)

### Legal Services Authorities Act, 1987  `lsa`
*settlement · in force* - 5 provisions pinned to this case type.

- **19. Organisation of Lok Adalats.** (`lsa:sec_19`, tier: supporting) - Legal-services authorities organise Lok Adalats; a pending s.138 complaint can be referred to one for settlement by consent.
  > (1) Every State Authority or District Authority or the Supreme Court Legal Services Committee or every High Court Legal Services Committee or, as the case may be, Taluk Legal Services Committee may organize Lok Adalats at such intervals and places and for exercising such jurisdiction and for such areas as it thinks fit. (2) Every Lok Adalat organised for an area shall consist of such number of— (a) serving or retired judicial officers; and (b) other persons, of the area as may be specified by the State Authority or the District Authority or the Supreme Court Legal Services Committee or the Hig …
  [open](#law?act=lsa&eid=sec_19)

- **20. Cognizance of cases by Lok Adalats.** (`lsa:sec_20`, tier: supporting) - How a case reaches a Lok Adalat - on the parties' agreement or on reference by the court - and the Lok Adalat's mandate to arrive at a compromise or settlement.
  > (1) Where in any case referred to in clause (i) of sub-section (5) of section 19,— (i) (a) the parties thereof agree; or (b) one of the parties thereof makes an application to the Court, for referring the case to the Lok Adalat for settlement and if such court isprima facie satisfied that there are chances of such settlement; or (ii) thecourt is satisfied that the matter is an appropriate one to be taken cognizance of by the Lok Adalat, the Court shall refer the case to the Lok Adalat: Provided that no case shall be referred to the Lok Adalat under sub-clause (b) of clause (i) or clause (ii) b …
  [open](#law?act=lsa&eid=sec_20)

- **21. Award of Lok Adalat.** (`lsa:sec_21`, tier: supporting) - Every award of a Lok Adalat is deemed a decree of a civil court, is final and binding on the parties, and no appeal lies - which is what lets a Lok Adalat settlement close a s.138 case cleanly.
  > (1) Every award of the Lok Adalat shall be deemed to be a decree of a civil court or, as the case may be, an order of any other court and where a compromise or settlement has been arrived at, by a Lok Adalat in a case referred to it under sub-section (1) of section 20, the court-fee paid in such case shall be refunded in the manner provided under the Court-fees Act, 1870 (7 of 1870). (2) Every award made by a Lok Adalat shall be final and binding on all the parties to the dispute, and no appeal shall lie to any court against the award. 22. Powers of Lok Adalat or Permanent Lok Adalat.— (1) The …
  [open](#law?act=lsa&eid=sec_21)

- **12. Criteria for giving legal services.** (`lsa:sec_12`, tier: supporting) - Who is entitled to free legal services: a s.138 party who is a woman or child, a member of a Scheduled Caste or Tribe, a person with disability, or below the income limit qualifies for legal aid to prosecute or defend.
  > Every person who has to file or defend a case shall be entitled to legal services under this Act if that person is— (a) a member of a Scheduled Caste or Scheduled Tribe; (b) a victim of trafficking in human beings or begar as referred to in article 23 of the Constitution; (c) a woman or a child; (d) a person with disability as defined in clause (i) of section of the Persons With Disabilities (Equal Opportunities, Protection of Rights and Full Participation) Act, 1995 (1 of 1996); (e) a person under circumstances of underserved want such as being a victim of a mass disaster, ethnic, violence, c …
  [open](#law?act=lsa&eid=sec_12)

- **13. Entitlement of legal services.** (`lsa:sec_13`, tier: supporting) - Entitlement to legal services on a prima facie case, with an affidavit of income accepted as proof of means - the route by which an indigent s.138 accused or complainant gets a legal-aid advocate.
  > (1) Persons who satisfy all or any of the criteria specified in section 12 shall be entitled to receive legal services provided that the concerned Authority is satisfied that such person has aprima facie case to prosecute or to defend. (2) An affidavit made by a person as to his income may be regarded as sufficient for making him eligible to the entitlement of legal services under this Act unless the concerned Authority has reason to disbelieve such affidavit. FINANCE, ACCOUNTS AND AUDIT
  [open](#law?act=lsa&eid=sec_13)

### Rights of Persons with Disabilities Act, 2016  `rpwd`
*access · in force* - 3 provisions pinned to this case type.

- **2. Definitions.** (`rpwd:sec_2`, tier: definition) - Defines 'person with disability' (s.2(s)) - a person with a long-term physical, mental, intellectual or sensory impairment that, in interaction with barriers, hinders full participation. This is the category LSA s.12 borrows to grant free legal aid to a disabled s.138 party.
  > In this Act, unless the context otherwise requires,— (a) "appellate authority" means an authority notified under sub-section (3) of section 14 or sub-section (1) of section 53 or designated under sub-section (1) of section 59, as the case may be; (b) "appropriate Government" means,— (i) in relation to the Central Government or any establishment wholly or substantially financed by that Government, or a Cantonment Board constituted under the Cantonments Act, 2006 (41 of 2006), the Central Government; (ii) in relation to a State Government or any establishment, wholly or substantially financed by …
  [open](#law?act=rpwd&eid=sec_2)

- **12. Access to justice.** (`rpwd:sec_12`, tier: supporting) - Guarantees a person with disability the right to access any court or tribunal without discrimination, with accessible documents and support - the access-to-justice floor for a disabled complainant or accused in a s.138 case.
  > (1) The appropriate Government shall ensure that persons with disabilities are able to exercise the right to access any court, tribunal, authority, commission or any other body having judicial or quasi-judicial or investigative powers without discrimination on the basis of disability. (2) The appropriate Government shall take steps to put in place suitable support measures for persons with disabilities specially those living outside family and those disabled requiring high support for exercising legal rights. (3) The National Legal Services Authority and the State Legal Services Authorities co …
  [open](#law?act=rpwd&eid=sec_12)

- **13. Legal capacity.** (`rpwd:sec_13`, tier: supporting) - Recognises the equal legal capacity of a person with disability to own and inherit property and control their financial affairs - the capacity behind a disabled party being drawer, payee or holder of the cheque and litigating over it.
  > (1) The appropriate Government shall ensure that the persons with disabilities have right, equally with others, to own or inherit property, movable or immovable, control their financial affairs and have access to bank loans, mortgages and other forms of financial credit. (2) The appropriate Government shall ensure that the persons with disabilities enjoy legal capacity on an equal basis with others in all aspects of life and have the right to equal recognition everywhere as any other person before the law. (3) When a conflict of interest arises between a person providing support and a person w …
  [open](#law?act=rpwd&eid=sec_13)

### Code of Civil Procedure, 1908  `cpc`
*procedure · in force* - 2 provisions pinned to this case type.

- **1. Pleading** (`cpc:ord_6_r_1`, tier: definition) - Defines a 'pleading' as a plaint or written statement (First Schedule, Order VI rule 1). A s.138 matter is a criminal complaint, not a suit, so the CPC does not govern it; this is pinned as the source of the drafting vocabulary the courts and e-filing rules borrow for the papers filed in the case.
  > “Pleading” shall mean plaint or written statement.
  [open](#law?act=cpc&eid=ord_6_r_1)

- **7. Relief to be specifically stated** (`cpc:ord_7_r_7`, tier: procedure) - Requires a plaint to state specifically the relief claimed (First Schedule, Order VII rule 7) - the origin of the 'prayer' in a petition. Drafting practice carries it into the s.138 complaint, where the prayer is to take cognizance and, on conviction, award a fine or compensation to the payee.
  > Every plaint shall state specifically the relief which the plaintiff claims either simply or in the alternative, and it shall not be necessary to ask for general or other relief which may always be given as the Court may think just to the same extent as if it had been asked for. And the same rule shall apply to any relief claimed by the defendant in his written statement.
  [open](#law?act=cpc&eid=ord_7_r_7)

## National vocabulary

| word | role | from | gloss |
|---|---|---|---|
| cheque | document | “Cheque.” | A bill of exchange drawn on a specified banker and payable on demand; includes the truncated cheque and the electronic-i |
| negotiable instrument | document | “Negotiable instrument” | A promissory note, bill of exchange or cheque payable to order or to bearer. |
| bill of exchange | document | “Bill of exchange.” | A written order directing a person to pay a certain sum to, or to the order of, a person or the bearer. |
| promissory note | document | “Promissory note.” | A written promise to pay a certain sum to, or to the order of, a person or the bearer. |
| banker | actor | Interpretation-clause | A person carrying on the business of banking; the drawee of a cheque. |
| negotiation | procedure | Negotiation | The transfer of an instrument so as to constitute the transferee its holder. |
| indorsement | procedure | Indorsement | Signing on an instrument (usually the back) for the purpose of negotiating it. |
| crossed cheque | document | Cheque crossed generally | A cheque marked so that it must be paid through a bank account, not across the counter. |
| maturity | doctrine | “Maturity” | The date on which an instrument falls due for payment. |
| drawer | actor | “Drawer” “Drawee” | The person who makes (draws) the cheque; the accused in a s.138 case. |
| drawee | actor | “Drawer” “Drawee” | The banker on whom the cheque is drawn and who is directed to pay. |
| payee | actor | “Drawer” “Drawee” | The person named in the instrument as the one to whom payment is to be made. |
| holder | actor | “Holder” | The person entitled in their own name to possession of the instrument and to receive its amount. |
| holder in due course | actor | “Holder in due course” | A holder who took the instrument for value, in good faith and before maturity. |
| payment in due course | doctrine | “Payment in due course” | Payment made in accordance with the apparent tenor of the instrument, in good faith and without negligence. |
| company liability | doctrine | Offences by companies | Where the drawer is a company, the persons in charge of and responsible to it for the conduct of its business are also l |
| person in charge | actor | Offences by companies | The director or officer who, at the time of the offence, was in charge of and responsible to the company for its busines |
| defence not allowed | doctrine | Defence which may not be allowed in any  | It is no defence in a s.138 prosecution that the drawer had no reason to believe the cheque would be dishonoured. |
| dishonour of cheque | doctrine | Dishonour of cheque for insufficiency, e | The offence: a cheque given for a legally enforceable debt, returned unpaid for insufficiency of funds or because it exc |
| insufficiency of funds | doctrine | Dishonour of cheque for insufficiency, e | The account not holding enough to honour the cheque - the trigger for the offence. |
| legally enforceable debt or liability | doctrine | Dishonour of cheque for insufficiency, e | The debt or liability the cheque must discharge; by the Explanation and s.139, presumed to exist unless rebutted (Rangap |
| demand notice | document | Dishonour of cheque for insufficiency, e | The written notice the payee must give the drawer within 30 days of learning of dishonour, demanding payment of the cheq |
| stop-payment | procedure | Dishonour of cheque for insufficiency, e | Instructing the bank not to pay; still a dishonour attracting s.138 where a legally enforceable debt exists. |
| presumption in favour of holder | doctrine | Presumption in favour of holder | The court shall presume the cheque was received for the discharge of a debt or liability - a reverse onus on the accused |
| presumptions as to negotiable instruments | doctrine | Presumptions as to negotiable instrument | Presumptions of consideration, date, time of acceptance, transfer and the holder being a holder in due course. |
| rebuttal of presumption | procedure | Presumption in favour of holder | The accused may rebut the s.139 presumption on the preponderance of probabilities, not beyond reasonable doubt. |
| evidence on affidavit | procedure | Evidence on affidavit | The complainant's evidence may be given on affidavit and read in any inquiry, trial or other proceeding. |
| bank's return memo | document | Bank’s slip prima facie evidence of cert | The banker's slip or memo of dishonour is prima facie evidence of the fact of dishonour. |
| bankers' books evidence | doctrine | Definitions | Certified copies of entries in a banker's books are admissible without producing the original books. |
| electronic record | document | Admissibility of electronic records | The conditions for admitting electronic records as evidence - e.g., CTS cheque images and e-statements. |
| electronic signature | document | Electronic signature | Authentication of an electronic record by an electronic technique specified in the Second Schedule. |
| complaint | document | Examination of complainant | A s.138 case begins on the payee's written complaint (not an FIR); the Magistrate examines the complainant on oath. |
| cognizance | procedure | Cognizance of offences by Magistrate | The Magistrate taking judicial notice of the offence so as to set the case in motion. |
| issue of process | procedure | Issue of process | The Magistrate issuing summons (or a warrant) to secure the accused's attendance. |
| summons | document | Form of summons | The court's written order to a person to appear - the first step to bring in the accused. |
| mode of service of summons | procedure | Mode of service of summons | In s.138, summons may be served by speed post or an approved courier and is deemed served even if the accused refuses it |
| warrant | document | Form of warrant of arrest and duration | The court's written authority to arrest and produce a person who does not answer summons. |
| proclamation | procedure | Proclamation for person absconding | A public notice requiring an absconding accused to appear - the step before attachment. |
| attachment | procedure | Attachment of property of person abscond | Attachment of an absconder's property to compel appearance. |
| summary trial | procedure | Power of Court to try cases summarily | s.138 cases are tried summarily, with a simplified and faster procedure. |
| cognizance of offences | procedure | Cognizance of offences | Who may complain, the one-month limitation, and the court that has territorial jurisdiction. |
| territorial jurisdiction | doctrine | Cognizance of offences | The case lies where the payee's bank branch (the collecting branch) is situated (post-2015 amendment). |
| revision | procedure | Calling for records to exercise powers o | Calling for the record of a subordinate court to test the legality of an order - the usual route after a s.138 convictio |
| quashing (inherent powers) | procedure | Saving of inherent powers of High Court | The High Court's power to quash a complaint to prevent abuse of process or to secure the ends of justice. |
| deemed service of notice | doctrine | Meaning of service by post | Notice sent by registered post to the correct address is deemed served, even if returned unclaimed. |
| one-month limitation | doctrine | Cognizance of offences | The complaint must be filed within one month of the cause of action arising. |
| condonation of delay | procedure | Extension of prescribed period in certai | The court may admit a complaint filed after time on sufficient cause being shown. |
| compounding | procedure | Offences to be compoundable | s.138 offences are compoundable - the parties may settle and bring the case to an end. |
| interim compensation | remedy | Power to direct interim compensation | The court may order the drawer to pay up to 20% of the cheque amount as interim compensation. |
| appeal deposit | remedy | Power of Appellate Court to order paymen | On appeal against conviction, the court may require a deposit of at least 20% of the fine or compensation. |
| probation | remedy | Power of court to release certain offend | Release of an offender on probation of good conduct instead of sentencing them at once. |
| compensation to complainant | remedy | Order to pay compensation | The court's power to order the offender to pay compensation to the person who suffered the loss. |
| power of superintendence | doctrine | Power of superintendence over all courts | The High Court's power over all courts subordinate to it - the source of its criminal rules of practice. |
| fair trial | doctrine | Protection of life and personal liberty. | The right to life and personal liberty, read to guarantee a fair and reasonably speedy trial. |
| legislative competence | doctrine | Subject-matter of laws made by Parliamen | The distribution of law-making power between Parliament and the State legislatures. |
| complainant | actor | Cognizance of offences | The payee or holder in due course of the dishonoured cheque - the only person who can set a s.138 case going, by filing  |
| accused | actor | Dishonour of cheque for insufficiency, e | The drawer of the cheque, prosecuted for the dishonour; where the drawer is a company, the company and every person in c |
| power-of-attorney holder | actor | Cognizance of offences | A duly authorised agent who, being personally aware of the transaction, may file the complaint and depose for the compla |
| advocate | actor | Right of advocates to practise.―Subject  | The enrolled legal practitioner who appears for the complainant or the accused; the right to appear flows from the Advoc |
| magistrate | actor | Cognizance of offences | The Judicial Magistrate of the First Class who takes cognizance of the complaint, tries it summarily and passes judgment |
| witness | actor | Evidence on affidavit | A person who gives evidence on the facts; in a s.138 case the complainant's evidence may be led on affidavit. |
| good law | doctrine | Law declared by Supreme Court to be bind | A judgment that still states the law - it has not been overruled, doubted or superseded, so every court must follow it.  |
| court of session | forum | Appeals from convictions | The court that hears an appeal from the Judicial Magistrate's conviction or sentence in a §138 case, sitting one step ab |
| fast track court | forum | Power of Court to try cases summarily | A court earmarked to clear cases quickly, not a separate kind of court. Fast Track Courts are set up administratively -  |
| high court | forum | Power of superintendence over all courts | The court that oversees the §138 trial from above: it hears criminal revisions (BNSS s.438), quashes complaints in its i |
| supreme court | forum | Special leave to appeal by the Supreme C | The apex court. It reaches §138 matters mainly by special leave under Article 136, and the law it declares binds every c |
| lok adalat | forum | Organisation of Lok Adalats. | A settlement forum under the Legal Services Authorities Act, 1987 where a s.138 case can be compromised and disposed by  |
| affidavit | document | Evidence on affidavit | A written statement of facts sworn or affirmed before an officer authorised to administer oaths, offered to a court as e |
| notary | actor | Functions of notaries. | A public officer appointed under the Notaries Act, 1952 who administers oaths and attests, authenticates and certifies d |
| oath | procedure | Oaths or affirmations to be made by witn | The declaration, required by the Oaths Act, 1969, by which a witness or interpreter binds themselves to tell the truth b |
| perjury | doctrine | Giving false evidence | Giving or fabricating false evidence - lying on oath or in an affidavit before a court, or making a false document to be |
| legal aid | remedy | Criteria for giving legal services. | Free legal services - a lawyer and court costs at the State's expense - for a party who cannot afford them. A s.138 accu |
| notarial seal | document | Seal of notaries. | The seal every notary must have and use (Notaries Act s.7). Its legal weight: the courts take judicial notice of notaria |
| person with disability | actor | Definitions. | A person with a long-term physical, mental, intellectual or sensory impairment which, interacting with barriers, hinders |
| prima facie case | doctrine | Presumption in favour of holder | Enough evidence to establish a fact unless it is disproved. Once the complainant proves the cheque bears the accused's s |
| rules of practice | doctrine | Power of superintendence over all courts | The general rules a High Court makes, under Article 227(2) of the Constitution, to regulate the practice and proceedings |
| state rules | doctrine | Power of superintendence over all courts | This site's label for the subordinate legislation the state layer adds on top of the uniform central law. Chiefly the Hi |
| writ | remedy | Power of High Courts to issue certain wr | A direct order from a constitutional court commanding a public authority or a lower court to do, or to stop doing, somet |
| pleading | document | Pleading | The formal written statements in which each side sets out its case. The Code of Civil Procedure, Order VI rule 1 defines |
| prayer | remedy | Relief to be specifically stated | The relief clause of a petition or complaint - the specific order the party asks the court to pass, usually set out and  |
| plaint | document | Particulars to be contained in plaint | The written statement that starts a civil suit, setting out the parties, the facts and the relief claimed (Code of Civil |
| plaintiff | actor | Particulars to be contained in plaint | The person who brings a civil suit by filing a plaint. In a s.138 prosecution there is no plaintiff; the party who sets  |
| framing of issues | procedure | Framing of issues | In a civil suit the court settles the disputed points - the 'issues' - that it must decide, drawn from the parties' plea |
| facts of the case | doctrine | Pleading to state material facts and not | The material facts a party must set out in its pleading - the events that give rise to the claim, stated concisely and w |
| first information report | document | Information in cognizable cases | The first record the police make of information about a cognizable offence, which sets an investigation in motion (BNSS  |
| code of civil procedure | doctrine | Short title, commencement and extent | The 1908 code that governs the procedure of civil suits and appeals. A s.138 case is criminal, run under the Bharatiya N |
| central filing centre | actor | court filing administration - e-Courts / | A single designated counter or office through which cases are filed for a group of courts, instead of each court taking  |
| chief judicial magistrate | actor | Chief Judicial Magistrate and Additional | The magistrate who heads the judicial magistracy of a district and has administrative control over the Judicial Magistra |
| district and sessions judge | actor | Appointment of district judges. | The judge who heads a district's judiciary, sitting as District Judge on the civil side and as Sessions Judge on the cri |
| bailiff | actor | court ministerial establishment - the pr | The court officer who physically serves the summons, notices and warrants a court issues and reports back on whether ser |
| indian police service | actor | All-India services. | The all-India civil service from which the senior police ranks (Superintendent of Police up to Director General) are dra |

## Prescribed process (central law - every state inherits this)

The prescribed procedure for a Section 138 case under central law - the Negotiable Instruments Act read with the criminal procedure code (BNSS, earlier the CrPC). This is the same in every state until a state's own rules of practice add to it; the Prescribed lens shows the statutory deadlines. State-specific timings and rules are layered on top as each state is processed.

**1 · Dishonour & statutory notice** - _prescribed: Notice within 30 days of the dishonour memo_
- The cheque, presented within its validity, is returned unpaid for insufficiency of funds or because it exceeds the arrangement; the bank issues a dishonour memo.
- The payee sends a written demand notice to the drawer within 30 days of receiving the dishonour memo, demanding the cheque amount.

**2 · The 15-day window to pay** - _prescribed: 15 days for the drawer to pay_
- The drawer has 15 days from receiving the notice to pay the amount. If it is paid, no offence arises.

**3 · Cause of action & the complaint** - _prescribed: Complaint within 1 month of the cause of action_
- If the amount is unpaid within 15 days, the offence is complete and the cause of action arises.
- The payee or holder in due course files a written complaint before a Judicial Magistrate of the First Class with jurisdiction (ordinarily where the payee's bank branch lies), within one month of the cause of action; delay may be condoned for sufficient cause.

**4 · Cognizance & examination of the complainant**
- The Magistrate takes cognizance of the offence on the complaint; the complainant's evidence may be given on affidavit.
- The offence is tried only by a court not below a Judicial Magistrate of the First Class.

**5 · Issue of process (summons) to the accused**
- The Magistrate issues summons to the accused. A summons may be served by speed post or an approved courier and is deemed served even if the accused refuses it.

**6 · Appearance, accusation & plea**
- The accused appears; the substance of the accusation is stated and the plea recorded. A s.138 case is tried as a summary trial.
- The court may direct the drawer to pay interim compensation of up to 20% of the cheque amount.

**7 · Evidence & presumptions**
- The complainant's evidence is led, usually on affidavit, and the accused may cross-examine. The bank's dishonour slip is prima facie proof of dishonour, and the court presumes the cheque was issued for a debt or liability unless the accused rebuts it.

**8 · Judgment** - _prescribed: Endeavour to conclude within 6 months of filing_
- After final arguments the Magistrate delivers judgment. The trial is conducted summarily and the court is to endeavour to conclude it within six months of the filing of the complaint.

**9 · Sentence, compensation & compounding**
- On conviction the drawer is liable to imprisonment up to two years, or a fine up to twice the cheque amount, or both, and the court ordinarily awards compensation to the payee.
- The offence is compoundable at any stage, so the parties may settle and close the case.

**10 · Appeal**
- An appeal against conviction lies to the Court of Session. Where compensation or a fine was awarded, the appellate court may require the appellant to deposit a minimum of 20% of it.

## Institutions - police & courts (central baseline; states add their own)

**Police ranks (senior to junior):** Director General of Police & State Police Chief > Director General of Police > Additional Director General of Police > Inspector General of Police > Deputy Inspector General of Police > Superintendent of Police > Deputy Superintendent of Police > Inspector of Police > Sub-Inspector of Police > Assistant Sub-Inspector of Police > Police Head Constable > Police Constable
**Police units:** State Police Force > Zone > Range > District > Commissionerate (metropolitan) > Sub-division > Circle > Police Station > Outpost / Beat
**Court hierarchy (apex to trial):** Supreme Court of India > High Court of the State > Court of Session (District & Sessions Court) > Chief Judicial Magistrate > Judicial Magistrate of the First Class
**Court roles:** District & Sessions Judge, Judicial Magistrate (First Class), Sheristadar / Chief Ministerial Officer, Bench Clerk, Registry / Scrutiny officer, Registrar (High Court), Process server / Summons bailiff, Stenographer / Interpreter

_Each rank/tier/role carries its provision cite, alternate names, responsibility and entry route in the JSON bundle (national.institutions) and, fully grounded with state cites, in each state layer's `institutions`._

## State layer - Gujarat (process: own)

How a §138 cheque-bounce case runs in Gujarat, from filing to disposal - built from the Gujarat instruments, with every step citing the provision that governs it. Click any citation to open the exact text. Two things set Gujarat apart: the complaint costs three rupees to file, and for bank and NBFC cheque cases in Ahmedabad City the case runs in a SARAS court, where the electronic record is the primary judicial record and the magistrate may be sitting anywhere in the State.

### Roles
- **Complainant** (litigant) - The payee or the holder in due course of the dishonoured cheque. Only this person can set a §138 case going, by filing the written complaint in their own name. In the Ahmedabad City SARAS courts the c [open](#story?state=gujarat&sec=role-complainant)
- **Power-of-attorney holder** (litigant) - Where duly authorised and personally aware of the transaction, files the complaint and deposes for the complainant. The e-Filing SOP requires the original power-of-attorney to be preserved permanently [open](#story?state=gujarat&sec=role-poa)
- **Accused** (litigant) - The drawer of the cheque. Where the drawer is a company, the company and every person who was in charge of and responsible to it. In a SARAS case the accused must be physically present at the SARAS co [open](#story?state=gujarat&sec=role-accused)
- **Surety** (litigant) - Stands behind the accused's bond. The presiding officer tests the surety's solvency himself by summary enquiry; a revenue solvency certificate is insisted on only in cases of doubt or for large sums,  [open](#story?state=gujarat&sec=role-surety)
- **Drawee bank** (bank) - The bank on which the cheque is drawn. Its return memo is the document that starts the clock, and the NI Act makes the bank's slip with the official mark evidence of dishonour. [open](#story?state=gujarat&sec=role-drawee-bank)
- **Witness** (witness) - Usually the bank official who proves the return. Examination-in-chief for the complainant is ordinarily tendered by affidavit; cross-examination is ordinarily in physical presence, at a Formal Witness [open](#story?state=gujarat&sec=role-witness)
- **Advocate** (advocate) - Appears for a party on a vakalatnama, which every pleader must file in every class of criminal case in Gujarat. On the digital side the advocate is also the registered e-Filer - registered on the port [open](#story?state=gujarat&sec=role-advocate)
- **Advocate's clerk** (advclerk) - Carries the file through the registry - filing, clearing objections, collecting copies and following the matter. A recognised court-precinct role rather than a statutory office; the Gujarat instrument [open](#story?state=gujarat&sec=role-advocate-clerk)
- **Judicial Magistrate (presiding officer)** (judge) - Tries the §138 complaint - takes cognizance, examines the complainant, records evidence and delivers judgment. In a SARAS court the same officer is the 'Presiding Officer' who verifies the registered  [open](#story?state=gujarat&sec=role-magistrate)
- **Chief Judicial Magistrate, Ahmedabad City** (judge) - Heads the magistracy under which the SARAS N.I. Court establishment sits. The SARAS Rules apply to that establishment 'under C.J.M. Courts of Ahmedabad City' and to such other courts or classes of pro [open](#story?state=gujarat&sec=role-cjm)
- **Registry** (staff) - The ministerial establishment responsible for scrutiny, processing and maintenance of records. Scrutiny of e-filed complaints for technical compliance is its exclusive domain: it takes up a new compla [open](#story?state=gujarat&sec=role-registry)
- **Clerk of the Court / Senior Clerk** (staff) - Signs and seals the summons of a Judicial Magistrate of the First Class, or where there is no Clerk of the Court, the Senior Clerk or a clerk specially assigned that work in writing. In the Sessions C [open](#story?state=gujarat&sec=role-clerk-of-court)
- **Sheristedar** (staff) - The head ministerial officer. Under the Criminal Manual the Sheristedar signs and seals the summons of a Metropolitan Magistrate's court, keeps the property register and deals with copy applications.  [open](#story?state=gujarat&sec=role-sheristedar)
- **Nazir** (staff) - Handles cash, deposits and case property. Prepares and signs the Property Register, verifies muddamal against the police Pavti or Yadi before entry, and is among the officers before whom an intending  [open](#story?state=gujarat&sec=role-nazir)
- **Bench Clerk / Board Clerk** (staff) - Runs the file through the hearing day and records the rojnama in CIS at the end of it. In a SARAS court the Bench Clerk places each case's physically produced documents in a sealed, marked envelope an [open](#story?state=gujarat&sec=role-bench-clerk)
- **Coordinator (video conferencing)** (staff) - Sits at each end of the live link. There is a coordinator at the court point and at the designated place from which a person is examined or heard, though one is needed at the remote point only where a [open](#story?state=gujarat&sec=role-coordinator)
- **Stenographer** (staff) - Takes the magistrate's dictation of the order sheets, online during or after the hearing in a SARAS court; the typed order sheet is digitally signed before it is uploaded to CIS. [open](#story?state=gujarat&sec=role-stenographer)
- **Interpreter** (staff) - Interprets evidence given in a language the court or the accused does not understand. Sessions Judges, District Magistrates and Chief Metropolitan Magistrates are authorised to pay a reasonable sum fo [open](#story?state=gujarat&sec=role-interpreter)
- **Police officer serving process** (police) - Serves the court's summons on the accused and executes any warrant that follows. It is a statutory duty of every police officer to do so promptly for every order lawfully issued by competent authority [open](#story?state=gujarat&sec=role-police-server)

### Process
- **1 · Filing the complaint**
  - A cheque-bounce case is a complaint case. Only the payee or the holder in due course can start it, and the Magistrate can take cognizance only on such a written complaint - never on a police report.
  - It must be filed within one month of the cause of action, which arises when the drawer fails to pay within fifteen days of the demand notice served after dishonour.
  - In Gujarat the complaint is e-filed. The e-Filing SOP for the District Judiciary defines an 'Action' to include criminal complaints, which is what brings a cheque case inside the regime at all, and an advocate or a litigant in person files from anywhere through the portal or through a designated counter.
  - The complaint, the vakalatnama, the list of documents and the affidavits are signed with a digital signature or an Aadhaar-based e-sign; where the filer has neither, the physically signed papers are scanned and uploaded.
  - The court fee is three rupees. Schedule II, Article 1(c) of the Gujarat Court-Fees Act charges a flat three rupees on a writing containing a complaint or charge of any offence presented to a criminal court, whatever the cheque is worth, and section 4 forbids the document being filed at all unless the fee is paid. It is paid electronically.
  - Every pleader appearing for a party in any criminal court in Gujarat must file a vakalatnama; the fee on it is two rupees in a magistrate's court.
  - The date of e-filing is the date the filing is electronically received in the Registry on a working day, IST. Anything filed online after 1600 hours, or on a holiday, counts as filed on the next court working day - and no exemption from limitation is allowed because the portal failed. In a cheque case with a one-month window that clause bites directly.
  - Where the case is a cheque complaint by a bank or an NBFC in the Chief Judicial Magistrate courts of Ahmedabad City, e-filing is not optional: the SARAS Rules apply to that establishment and to cases e-filed under section 25 of the Payment and Settlement Systems Act, and all complaints, applications and affidavits are e-filed on the designated portal.
- **2 · Scrutiny by the Registry and numbering**
  - Scrutiny of an e-filed complaint for technical compliance is the exclusive domain of the Registry - the ministerial establishment responsible for scrutiny, processing and maintenance of records.
  - The Registry takes up a newly e-filed complaint on the next working day. If it is in order the matter is registered under the appropriate case type; if defects are noticed, objections are recorded in writing and communicated for rectification, and only when every objection is cleared is the case registered and assigned to a court.
  - Once registered, the matter goes first to the presiding officer's account on the designated portal for perusal, then to the designated court staff, who assign bookmarks, exhibits and marks strictly in conformity with rule 76 of the Criminal Manual, and then back to the presiding officer to be digitally signed. Only then is it part of the official judicial record.
- **3 · Cognizance and examination of the complainant**
  - The Magistrate takes cognizance on the complaint and examines the complainant, and any witnesses present, on oath.
  - The Criminal Manual tells the Gujarat magistrate how to do it: the examination should as far as possible be taken immediately, and it must be full enough to let him judge whether there are grounds for proceeding. No reasons need be recorded for postponing the issue of process, but reasons must be recorded for dismissing the complaint.
  - Where that first examination of the complainant is reduced to writing, the Court-Fees Act charges a further ten rupees, unless the court remits it.
  - A §138 complaint is tried as a summary trial unless the Magistrate decides otherwise. The Criminal Manual's own gloss is that no sentence above three months may be passed in a summary trial and that the summons-case procedure is followed.
- **4 · Issue of process and service**
  - No summons or warrant issues until the list of prosecution witnesses is filed, and on a complaint made in writing a copy of the complaint must accompany the summons - the complainant supplies the copies.
  - The summons of a Judicial Magistrate of the First Class is signed and sealed by the Clerk of the Court, or where there is none by the Senior Clerk or a clerk specially assigned that work in writing by the presiding officer.
  - The complainant pays the process fee for service and execution - 30 paise for a summons or notice, Rs.1.25 for a warrant of arrest, a proclamation or a warrant of attachment. The table must be exposed to view in a conspicuous part of every court, in English and the regional language.
  - Service is the police's job: it is the duty of every police officer promptly to serve every summons and to obey and execute every warrant or other order lawfully issued to him by competent authority.
  - Where a witness is to be examined by video conferencing, the process must state the date, time and venue of the designated place, direct the witness to attend in person with proof of identity, and, if the examination is about a particular document, carry a copy of that document.
  - Documents filed electronically may in addition be served from the designated e-mail IDs of Registry officials to the e-mail address of the advocate or party. That sits alongside, and does not displace, the statutory modes of serving the demand notice and the summons.
- **5 · Appearance, plea and bail**
  - In a SARAS case the accused must be physically present at the SARAS court, or at a remote point, when the plea is recorded. The plea is signed physically and the signed sheet is scanned into the record with self-attested photo identity.
  - The copies of the complaint, documents and statements the accused is entitled to are ordinarily furnished electronically - by e-mail, by a recognised messaging service, or on a storage device at the accused's cost - or to a person nominated by the accused or the pleader appearing for him. Only where the accused cannot receive them electronically are printed copies supplied free of cost.
  - A party, an advocate or an accused may otherwise appear through video conferencing; in a criminal case any party or witness may move a request for it, and an advocate may appear from the advocate's remote point.
  - The accused who answers the summons is released on a bond. Two rupees of court fee is charged on a bail bond or a recognizance for appearance, and the sufficiency of the surety is primarily the presiding officer's own responsibility - a revenue solvency certificate only where there is doubt, moveable property enough for a bond up to Rs.2,000.
- **6 · Evidence**
  - The complainant's evidence may be given on affidavit and read in any inquiry, trial or other proceeding under the NI Act. In a SARAS court the examination-in-chief of the complainant's witnesses is ordinarily tendered by affidavit through electronic filing.
  - The Criminal Manual prescribes how an affidavit used in a criminal court is headed and entitled, and requires the officer administering the oath to read and explain it, and certify that he has, where the deponent has not read it or is blind, illiterate or ignorant of the language.
  - Cross-examination is not remote by default. The examination-in-chief of the accused, the accused's witnesses and all cross-examination are ordinarily conducted in physical presence before the court, at a Formal Witness Deposition Centre notified by the High Court, or at a Government-notified remote point; recording evidence by audio-video means is permitted only in the court's discretion and strictly under the Video Conferencing Rules.
  - Where a person does appear remotely, the court first satisfies itself who is on the screen, and a document is put to them through the document visualizer at the court point or by transmitting an image; a document at the remote point comes back as a hard copy counter-signed by the witness and the coordinator.
  - The cheque, the return memo and the notice stay physical. Original documents produced in court are retained through the trial for evidentiary purposes even though the e-Filing SOP excludes cheques from permanent preservation, and may be returned to the complainant only on his undertaking to produce them again, against an endorsement of the case and exhibit number.
  - Case property produced in court is entered in the Property Register in Form No. 51 immediately on receipt, and verified against the Pavti or Yadi before entry.
  - The evidence is recorded in Gujarati. In summons cases and summary trials the Magistrate makes a memorandum of the substance of the evidence in the language of the court; a memorandum in English is not necessary. An interpreter is paid where a witness gives evidence in a language the court or the accused does not understand.
  - Once the cheque and the signature are proved or admitted, the presumption under §139 works for the holder, and it is for the accused to rebut it on the balance of probabilities.
- **7 · The record - Roznama, exhibits and order sheets**
  - The Roznama in Form No. 41 is the case's running history. It must be a faithful account with a correct list and description of the exhibits, kept from day to day as an original document, and initialled or signed by the Magistrate at the end of each day's proceedings. Ministerial acts such as receipt of bhatta or process fees stay out of it.
  - In a SARAS court the rojnama is recorded by the designated staff member in the Case Information System under the Case Proceedings block at the end of each hearing date, then placed for the presiding officer's digital signature - and only then does it form part of the official record.
  - Every document bears an exhibit number and a serial number as it comes before the court; an order or document filed below an existing exhibit is sub-numbered under it - an order below Exhibit 5 becomes Exhibit 5/1, not a new exhibit.
  - Orders, judgments and depositions are generated directly in PDF and digitally signed by the presiding officer on the portal; order sheets may be dictated to a stenographer online during or after the hearing and are digitally signed before being uploaded to CIS.
  - Physically signed originals, once scanned and uploaded, are preserved in sealed and marked covers in the custody of the court staff; the Bench Clerk or another designated staff member keeps each case's physical papers in a sealed envelope marked with the case particulars.
- **8 · Judgment, sentence and compensation**
  - The offence carries imprisonment up to two years, or a fine up to twice the cheque amount, or both; the court may also order compensation to the complainant.
  - In a SARAS court the accused must be personally present when judgment is pronounced. Where a person is produced on a warrant, or is to be committed to prison on a conviction warrant, the issue, execution and compliance of that process follow the ordinary procedure established by law - the remote court does not change it.
  - Fine, penalty or compensation may be accepted through the e-payment facility once it is enabled for the court, and by cash or another permissible mode until then.
  - The case may also end by compounding at any stage - the offence is compoundable, and a settlement between the parties disposes of it.
- **9 · Copies, appeal and revision**
  - Certified copies are governed by Chapter XXII of the Criminal Manual, but in a SARAS court they are generated from the digitally signed electronic record on the portal, and those digitally signed electronic copies are certified copies for all legal purposes. Supply by e-mail or on a device costs a minimum of Rs.50 for up to 25 MB and Rs.50 for each further 25 MB, plus the cost of the device.
  - The record is not despatched to the record room until the appeal or revision period expires and any appeal or revision is disposed of; the electronic record on the portal is retained and destroyed under the same rules 361 to 367 of the Criminal Manual so far as they can apply.
  - Appeal from a §138 conviction lies to the Court of Session. Where the appellant is the convicted drawer, the appellate court must order a deposit of at least 20% of the fine or compensation.
  - On a direction from the appellate or revisional court the record and proceedings are transmitted electronically from the designated portal; the original record and hard copies go up only if that court so directs.
  - Revision and quashing go to the High Court of Gujarat, where a Single Judge hears applications on the criminal side. The matter is presented in the office of the Registrar, gets a filing number at once and a registration number only if there is no office objection, must be accompanied by the certified copy of the judgment or order challenged, and must be examined by the office within six days of filing.
  - Office objections are put up on a special notice board and must be removed within fourteen days, failing which the matter goes before the Court for orders. Where the office re-examines the court fee, a receipt of a payment made through the e-payment system may be required in place of a stamp.

### Gujarat vocabulary
- **SARAS court** - The StateWide Access to Remote Adjudication System - Gujarat's cheque-case courts. Rule 1 applies the SARAS Rules to the SARAS N.I. Court establishment under th (from SARAS Courts Rules, 2026, Rule 1)
- **Remote adjudication** - The principle that makes a SARAS court work: even though the presiding judicial officer is stationed somewhere else in Gujarat, adjudication through audio-video (from SARAS Courts Rules, 2026, Rule 9)
- **Designated portal** - The eGujCourtIS system, or any other portal the High Court notifies, on which a SARAS case is viewed, processed and stored. Complaints are e-filed at filing.eco (from SARAS Courts Rules, 2026, Rule 2)
- **Digital record** - The electronic record maintained on the designated portal - and, in a SARAS court, the primary and authoritative judicial record, not a copy of a paper file. Ru (from SARAS Courts Rules, 2026, Rule 3)
- **Remote point** - A place from which a person appears before the court through a live link. It includes a designated place notified for the purpose but not an advocate's own cham (from Electronic Communication Rules, 2025, Rule 2)
- **Court point** - The courtroom itself, or wherever the court is physically convened - the other end of the live link from the remote point. A coordinator sits at the court point (from Electronic Communication Rules, 2025, Rule 2)
- **Coordinator** - The person who runs the video link at each end. Rule 9 requires a coordinator both at the court point and at the designated place from which a person is to be e (from Electronic Communication Rules, 2025, Rule 9)
- **Live link** - The audio-video connection by which a witness, an accused, a party or an advocate is required to be virtually present in the courtroom. Defined in Rule 2(1)(k)  (from Electronic Communication Rules, 2025, Rule 2)
- **Audio-video electronic means** - Video conferencing and the other electronic modes recognised by the Bharatiya Nagarik Suraksha Sanhita. Rule 5 lets them be used at all stages of a judicial pro (from Electronic Communication Rules, 2025, Rule 5)
- **Formal Witness Deposition Centre** - A centre notified by the High Court of Gujarat where a witness deposes, as an alternative to attending the SARAS court in person. Rule 6.2 says the examination- (from SARAS Courts Rules, 2026, Rule 6)
- **Document visualizer** - The camera at the court point that transmits a document to a person at a remote point. Rule 14 is how the three documents a cheque case is fought over - the che (from Electronic Communication Rules, 2025, Rule 14)
- **Token-based digital signature** - The hardware-token Digital Signature Certificate by which a document is authenticated in a SARAS court. Rule 3.4 allows only two modes of authentication: a toke (from SARAS Courts Rules, 2026, Rule 3)
- **e-Filer** - The registered user who files electronically - an advocate, or a litigant in person, registered on the e-filing portal under the Gujarat e-Filing SOP. An advoca (from e-Filing SOP for the District Judiciary, 2024, Clause 2)
- **Designated counter** - The staffed counter where a person who cannot use the e-filing portal can still file electronically - at an eSewa Kendra, a Central Filing Centre or a helpdesk  (from e-Filing SOP for the District Judiciary, 2024, Clause 2)
- **Office objection** - The defect the office notes against a filing, and the clock that runs on it. On the High Court's criminal side rule 340 requires the office objections to be put (from Gujarat High Court Rules, 1993, Rule 340)
- **Filing number** - The number a criminal matter gets on presentation, before it is registered. Rule 333 gives every criminal main matter a filing number first; a registration numb (from Gujarat High Court Rules, 1993, Rule 333)
- **Court fee on a §138 complaint** - Three rupees. Schedule II, Article 1(c) of the Gujarat Court-Fees Act, 2004 charges a flat three rupees on a writing containing a complaint or charge of any off (from Gujarat Court-Fees Act, 2004, Schedule II, Article 1)
- **Process fee** - What the complainant pays for the court to serve its summons and execute its warrants. The Criminal Manual's table, made under the court-fees power and confirme (from Criminal Manual, 1977, Rule 41)
- **Bhatta** - The money a court pays a witness for attending - travelling and subsistence expenses, deposited by the party who summoned them. Rule 208 says bhatta not claimed (from Criminal Manual, 1977, Rule 208)
- **Vakalatnama** - The document by which a party authorises a pleader to appear and act. Rule 135 requires it from every pleader appearing for any party in every class of case in  (from Criminal Manual, 1977, Rule 135)
- **Court language (Gujarati)** - Gujarati is the language of the criminal courts of Gujarat. Rule 148 requires the magistrate, in summons cases and summary trials, to make the memorandum of the (from Criminal Manual, 1977, Rule 148)
- **Retention of originals** - The rule that decides what happens to the paper once the case is electronic. Clause 10 of the e-Filing SOP requires originals of scanned documents to be preserv (from e-Filing SOP for the District Judiciary, 2024, Clause 10)
- **Date of e-filing** - The date the case counts as filed - which in a cheque case decides limitation. Clause 14 makes it the date the action is electronically received in the Registry (from e-Filing SOP for the District Judiciary, 2024, Clause 14)
- **Roznama** - The running record of a criminal case in Gujarat - the proceeding sheet in Form No. 41, kept in Gujarati in the magistrates' courts. Rule 76 requires it to be a (from Criminal Manual, 1977, Rule 76)
- **Exhibit** - A document brought on the record and given a number. Rule 76 requires every document in the case to bear an exhibit number and a serial number as it comes befor (from Criminal Manual, 1977, Rule 76)
- **Muddamal** - Case property produced in court. Rule 216 requires muddamal to be entered in the Property Register in Form No. 51 immediately on receipt, and rule 219 requires  (from Criminal Manual, 1977, Rule 216)
- **Sheristedar** - The head ministerial officer of a court. Rule 48(3) makes the officer performing the duties of Sheristedar the person who signs and seals a summons issued by a  (from Criminal Manual, 1977, Rule 48)
- **Clerk of the Court** - The officer who signs and seals the court's process. Rule 48(2) lets a summons issued by a Judicial Magistrate of the First Class be signed and sealed by the Cl (from Criminal Manual, 1977, Rule 48)
- **Nazir** - The court officer who handles cash, deposits and case property. Rules 216 and 219 make the Nazir primarily responsible for preparing and signing the Property Re (from Criminal Manual, 1977, Rule 216)
- **Bench Clerk** - The staff member attached to the court who runs the file through the day. In a SARAS court rule 3.12 makes the Bench Clerk, or another designated ministerial st (from SARAS Courts Rules, 2026, Rule 3)
- **Registry** - The ministerial establishment of the court, responsible for scrutiny, processing and maintenance of records - defined in that form in Rule 2(1)(i) of the SARAS  (from SARAS Courts Rules, 2026, Rule 2)
- **Surety** - The person who stands behind the accused's bond and undertakes to secure their appearance. Rule 28 makes the sufficiency of the surety primarily the presiding o (from Criminal Manual, 1977, Rule 28)
- **Record room** - Where the file goes when the case is over. Rule 361 says the record of a substantive criminal proceeding is not due for despatch to the record room until the ap (from Criminal Manual, 1977, Rule 361)
- **Duties of a Police officer** - The hinge between the court and the police in a cheque case. Section 64(a) of the Gujarat Police Act makes it the duty of every police officer promptly to serve (from Gujarat Police Act, 1951, Section 64)
- **Lok Rakshak** - A Gujarat police recruit of the lowest grade. Section 2(4) defines 'constable' as a police officer of the lowest grade and expressly includes a Lok Rakshak, so  (from Gujarat Police Act, 1951, Section 2)
- **Competent authority** - The officer whose orders a police officer is bound to obey and execute under section 64. Section 2(3) defines it by area: in an area for which a Commissioner of (from Gujarat Police Act, 1951, Section 2)
- **Commissioner of Police** - The head of policing for a city area. Section 7 lets the State Government appoint a Commissioner of Police, and an Additional Commissioner, for any notified are (from Gujarat Police Act, 1951, Section 7)
- **District Superintendent of Police** - The district police command. Section 8 lets the State Government appoint a Superintendent, and one or more Additional, Assistant and Deputy Superintendents, for (from Gujarat Police Act, 1951, Section 8)
- **Director General and Inspector General of Police** - The head of the Gujarat police. Section 5A requires the State Government to appoint a Director General and Inspector General of Police for the overall direction (from Gujarat Police Act, 1951, Section 5)
- **State Police Complaints Authority** - Gujarat's police oversight body for serious complaints. Section 32G lets it look into complaints against police officers of the rank of Deputy Superintendent an (from Gujarat Police Act, 1951, Section 32G)

## State layer - Haryana (process: own)

How a s.138 (cheque bounce, 'NACT') case runs in Haryana, end to end. It starts at the Panchkula lower-court filing window - submission, scrutiny, CIS entry and same-day dispatch to the trial court, from a June 2026 field interview with the filing assistants - and then follows the case through cognizance, the issue of summons or e-summons, appearance, the summary trial, the evidence, compounding, judgment and sentence, and appeal, grounded in Volume III of the Punjab and Haryana High Court's Rules and Orders and the High Court's E-Filing and Video Conferencing Rules.

### Roles
- **Filing Assistant** (staff) *(has informal aspects)* - Receives the NACT file at the lower-court filing window, scrutinises it for completeness and attestation, enters it in the e-Courts CIS, assigns the NACT and CNR numbers, records it in the register an [open](#story?state=haryana&sec=role-filing-assistant)
- **Ahlmad** (staff) *(has informal aspects)* - The court's record-keeper and process clerk. He receives the file from the filing branch, registers the case in CIS once the objections are removed, and from then on owns the court's process - generat [open](#story?state=haryana&sec=role-ahlmad)
- **Peon** (staff) - Carries the physical file the same day from the filing window to the destination court. [open](#story?state=haryana&sec=role-peon)
- **Computer room** (staff) *(has informal aspects)* - Holds the CIS permission to release an e-filed case into the filing branch's queue. The assistants have no direct access and must telephone the computer room each time before they can edit and submit  [open](#story?state=haryana&sec=role-computer-room)
- **Magistrate (JMFC)** (judge) - The judicial magistrate who tries the NACT case. He examines the complainant on cognizance, decides between a summons and an e-summons, dispenses with the accused's personal attendance, holds the summ [open](#story?state=haryana&sec=role-magistrate-jmfc)
- **Nazir** (staff) - The court's treasurer and custodian, whose office is the nazarat branch. The memorandum of the costs of witnesses is made out and forwarded to him for payment, and property sent in by the police is ma [open](#story?state=haryana&sec=role-nazir)
- **e-filing Administrator** (staff) - The officer who administers e-filing. For a district court he is the officer or official appointed by the District and Sessions Judge; for the High Court, the Registrar (IT) or an officer appointed by [open](#story?state=haryana&sec=role-efiling-administrator)
- **Video conferencing Coordinator** (staff) - The official who runs a video-conferenced hearing at each end. There is one at the Court Point and, where a witness or an accused is to be examined, one at the Remote Point as well, nominated by the H [open](#story?state=haryana&sec=role-vc-coordinator)
- **Station House Officer** (police) - The officer in charge of the police station, not below the rank of Sub-Inspector, under the Haryana Police Act. A cheque case generates no FIR and no investigation, so the police enter only once the c [open](#story?state=haryana&sec=role-station-house-officer)
- **System Officer** (staff) *(has informal aspects)* - The technical official of a district court establishment. Each district has a System Officer and a System Assistant, and the district headquarters has a System Officer with two or three System Assista [open](#story?state=haryana&sec=role-system-officer)
- **Statement Clerk** (staff) *(has informal aspects)* - The official in each district court who generates the periodical statements and returns the High Court requires - cases registered, cases not registered and the reason, summonses issued, cases listed, [open](#story?state=haryana&sec=role-statement-clerk)
- **Reader (court)** (staff) - Sits with the presiding judge, keeps the daily proceedings and the dates, and raises the objections on a newly filed case - court fee, condonation of delay - before it is registered. Those objections  [open](#story?state=haryana&sec=role-court-reader)
- **Process server** (staff) *(has informal aspects)* - Serves the court's summons and warrants and brings the served process back to the ahlmad, taking his receiving for it. Nothing of that return reaches the case record automatically: the ahlmad sorts th [open](#story?state=haryana&sec=role-process-server)
- **Judgment Writer** (staff) *(has informal aspects)* - The desk that produces the written judgment. Once the judge has pronounced a file it comes to him, usually the next day, and he reads the whole proceeding from beginning to end before writing a word.  [open](#story?state=haryana&sec=role-judgment-writer)
- **Duty magistrate** (judge) *(has informal aspects)* - The magistrate holding the duty roster, before whom work is put up that cannot wait for the court it belongs to. The month is divided among the judges of the establishment in blocks of a few days, and [open](#story?state=haryana&sec=role-duty-magistrate)

### Process
- **1 · Advocate submits the physical file**
  - The advocate submits the NACT file at the lower-court filing window (open until 12:00 PM); the filing assistant receives it.
  - The file is assembled in a fixed order: CIS proforma pasted on the cover and a second CIS proforma inside, then the index, the memo of parties, the application (the complaint, its 'prayer'), a Rs.10 court-fee ticket, an attested affidavit, the cheque (laminated), an attested power of attorney, and one full copy of the file per respondent.
- **2 · Scrutiny at the window**
  - The assistant scrutinises the file: CIS proforma pasted outside and present inside; index filled; pagination done; memo of parties carries address and phone; age recorded (treated as critical); every page signed and attested by the advocate for genuineness.
  - Mandatory supporting documents are checked - the cheque, the memo of parties and the legal notice - and the rest are verified against the list of documents in the index.
  - Limitation is checked; if the filing looks delayed the assistant tells the advocate verbally to attach a delay-condonation application (IA). The clerks use a rule of thumb of '45 days'; the statutory position is one month from the cause of action.
- **3 · CIS entry and numbering**
  - The assistant logs into the CIS module, opens the filing counter, chooses Criminal and then the NACT case type, and enters the complainant (name, age, mobile), the advocate, the opposite party and any extra-party count, the Rs.10 court fee and the Act (NI Act §138), then submits.
  - The system issues the NACT filing number and the CNR number (beginning HRPK for Panchkula), which are written on the file cover with the date.
  - There is no filing-counter field for the police station, so the jurisdictional station (taken from the bank where the cheque was presented) is parked under 'offence remarks' and used to distribute cases among the clerks. A s.138 case has no FIR, so the shared criminal template's FIR field does not apply.
  - The CIS instance the assistant is typing into is local. Each of the roughly 130 court locations in Punjab, Haryana and U.T. Chandigarh runs its own server, with a mirror alongside it for continuity, and the district's own System Officer and System Assistant administer it. Case data reflects in the National Judicial Data Grid in real time when the network is up, so a date the reader assigns is visible outside the court without anything being sent; orders and judgments are the exception and are uploaded each evening by running a command.
  - Nothing in the CIS screen can be changed locally. The core belongs to NIC and a High Court's suggestion moves only if the Supreme Court eCommittee approves it - days for a small change, otherwise the next version patch, which has meant years. So the mis-click risk between the civil and criminal columns, and the fields that do not fit a NACT case, are not local defects that a local fix can reach.
- **4 · Register and same-day dispatch**
  - The entry is recorded in the physical register (NACT number, date, party names) and the file is carried the same day by a peon to the destination court.
  - The ahlmad receives the file in the court and takes over registration - entering the full address and extra-party details - and the subsequent process.
- **5 · Cognizance and the examination of the complainant**
  - The complaint is endorsed with the date of presentation the moment it is instituted, together with the name of the magistrate it is to go to, and the complainant is directed to appear for examination the same day or on one of the following days.
  - The first duty of the magistrate taking cognizance on the complaint is to examine the complainant, and any witnesses present, on oath, and to record the substance of that examination in writing, signed by the complainant, the witnesses and the magistrate.
  - Volume III insists that this examination is not a formality: it is what tells the magistrate whether to put the machinery of the criminal court in motion. If there is no sufficient ground for proceeding he dismisses the complaint at this stage.
  - In a cheque case the complainant's evidence is usually given on affidavit, which may be read in evidence at any stage, so the sworn statement, the cheque, the bank return memo and the demand notice do most of the work.
  - Jurisdiction is checked. Volume III puts the ordinary test at the place where the offence was committed, but for a cheque case s.142(2) of the NI Act displaces it with the branch of the bank where the payee maintains the account.
- **6 · Issue of process: summons, e-summons and the process fee**
  - Finding sufficient ground to proceed, the magistrate issues process for the attendance of the accused. No summons or warrant issues until a list of prosecution witnesses has been filed, and in a complaint case the process must be accompanied by a copy of the complaint.
  - Since the November 2018 amendment the magistrate may, in his discretion, issue a summons or an e-summons, and must record his reasons before issuing a warrant in a case where the law provides for a summons.
  - Where process fees are payable no process is to be issued until they are paid, and on default of payment within a reasonable time the magistrate may dismiss the complaint. This is the sharpest risk a cheque complainant carries immediately after cognizance.
  - Volume III also warns that great care should be taken not to issue a warrant where a summons would serve, since a warrant interferes with personal liberty, and that the court's discretion to make a warrant bailable should be used with regard to the nature of the offence and the position of the accused.
  - The process goes out for service through the police station of the area, whose Station House Officer is constituted by the Haryana Police Act; s.144 of the NI Act also allows a cheque summons to be served by speed post or an approved courier.
  - Where a witness is to be examined over a live link, the summons must state the date, time and venue of the Remote Point and direct him to attend there in person with proof of identity.
- **7 · Appearance, bail and dispensing with personal attendance**
  - A criminal trial is to be conducted in the presence of the accused, but the court has a discretion to dispense with his personal attendance and permit an advocate to appear for him. In a cheque case, where the accused is often out of station and the trial is meant to be summary, this is the everyday relief.
  - s.138 is a bailable offence. Volume III treats bail in a bailable case as a right and not a favour, tells the magistrate to fix the amount with regard to the social status of the accused and to see that it is not excessive, and reminds him that it is a hardship to detain an undertrial an hour longer than the law requires.
  - If the accused does not appear after service, or the court has reason to believe he has absconded or will not obey the summons, a warrant may issue in lieu of or in addition to the summons.
  - If he absconds, the court may proclaim him and attach his property as the last remedy for compelling attendance; Volume III warns that the procedure must be followed strictly or the attachment and sale will be set aside.
  - The accused may instead appear over a live link. Chapter 1 Part BB of Volume III makes the Video Conferencing Rules the procedure for criminal matters in the subordinate courts, a party or witness applies for remote appearance under r.6, and the court may frame the accusation and examine the accused by video conferencing.
  - When surety is offered for the accused, the person standing surety is entered in the High Court's in-house Surety module with an identity number, and checked against the courts of Punjab, Haryana and U.T. Chandigarh for whether he is a repeat or habitual surety. Someone who has already stood surety may stand again, but must produce a different document each time. This puts into software a declaration the law already requires: BNSS §486 makes every surety tell the court how many persons he has stood surety for, and §140 lets the Magistrate reject an unfit surety.
  - The concern behind the check is old. Rules and Orders Volume III r.10.9(9A), added in 2007, is aimed at the accused who absconds on a bogus surety or a bond furnished by a stock surety, and in the classes of case it covers requires two recent passport photographs plus one identity document, one photograph kept in the court record and one with the police station. By its own terms that requirement reaches NDPS cases, offences carrying more than ten years and special enactments, so it does not of its own force apply to a s.138 bail bond; the software check is applied more widely than the rule.
  - The check stops at the jurisdiction's edge. The surety database is centralised at the High Court and covers only Punjab, Haryana and U.T. Chandigarh, so a person standing surety repeatedly across state lines is invisible to it, and the declaration BNSS §486 asks for cannot be verified beyond one High Court.
- **8 · Summary trial: the accusation and the plea**
  - s.143 of the NI Act directs that a cheque case be tried summarily. Volume III Chapter 2 is the local manual for that trial: a summary trial may be held only by a magistrate of the first class empowered in that behalf, or by a Bench of magistrates so empowered.
  - The procedure followed at the hearing is that of a summons case, subject to the lighter record the summary chapters allow. The particulars of the offence are stated to the accused and he is asked whether he pleads guilty; no formal charge is framed in a summons case.
  - Volume III carries the general summary cap of three months' imprisonment, but s.143(1) of the NI Act lets a magistrate trying a cheque case summarily pass up to one year and a fine up to five thousand rupees. If a heavier sentence appears called for, the magistrate must recall the witnesses and rehear the case as a summons case.
  - If the accused pleads guilty the plea is recorded in his own words and he may be convicted on it; where he is not convicted the final order must show on its face whether he was discharged or acquitted.
  - The court may order the drawer to pay the complainant interim compensation of up to twenty per cent of the cheque amount while the trial runs.
- **9 · Evidence, affidavits and remote examination**
  - In a summons case the record is ordinarily a memorandum of the substance of the evidence and no more. In a summary case in which no appeal lies no evidence need be recorded at all, only the prescribed particulars in the summary register; where an appeal does lie the magistrate must record the substance of the evidence and the particulars, and write a judgment before passing sentence.
  - Only relevant and admissible evidence should be recorded, an objection to admissibility should be decided forthwith with the objection and the decision written down, and the magistrate should note the demeanour of a witness where it is noteworthy.
  - Most of a cheque case is proved on paper: the complainant's evidence may be given on affidavit, the bank's slip is prima facie evidence of dishonour, and entries in bankers' books are proved by certified copy.
  - Evidence must be taken in the presence of the accused, or of his advocate where his personal attendance has been dispensed with.
  - A witness at a distance - typically the complainant or the bank official - may be examined from a Remote Point over a live link: identity proved first, oath administered, the deposition recorded and signed, and a document shown to him by transmitting its image between the Court Point and the Remote Point.
  - Once the examination of witnesses has begun the proceedings should continue from day to day, with reasons recorded for any adjournment beyond the following day. s.143(3) of the NI Act asks that the trial be concluded within six months of the filing of the complaint.
  - The accused is then examined on the circumstances appearing in the evidence against him; this too may be done over a video link.
- **10 · Dismissal in default and acquittal on the complainant's absence**
  - In a summons case instituted on a complaint, if the complainant fails to attend on a day fixed for hearing the accused should be acquitted, unless the magistrate adjourns the hearing or dispenses with the complainant's attendance and proceeds with the case.
  - Volume III opens this Part with the flat observation that some magistrates are inclined to dismiss cases in default hastily.
  - Before dismissing a case for the complainant's absence the magistrate must consider whether such an order is legal and whether it is justified by the circumstances, and reasons should always be recorded.
  - The complainant must have a full opportunity to appear: if he is absent when the case is first called it should be called again later, the time of dismissal must be noted on the record, and on tour a case is not to be dismissed unless he had due notice of the place of hearing.
  - A dismissal in default, or an acquittal that follows it, is challenged in revision - and the absence of recorded reasons is the usual ground on which a dismissed cheque complaint is revived.
- **11 · Compounding and settlement**
  - Every offence punishable under the NI Act is compoundable, and most cheque cases end in a settlement rather than a verdict.
  - Compounding has the effect of an acquittal. No judgment on the facts is needed, but the statements of all the parties concerned must be recorded, and where the court's permission is required the reasons for granting it must be stated in the order directing the acquittal.
  - Volume III tells the magistrate to look at the facts before permitting a compromise, and in particular to ask whether it is a genuine reconciliation or the result of undue pressure on the complainant, and to record his reasons in every case in which he allows the parties to compromise.
  - A large share of cheque cases are settled in a Lok Adalat, whose award is final; parties may now take part in a Lok Adalat over a live link.
- **12 · Judgment, sentence and compensation**
  - The judgment must contain the point or points for determination, the decision on them and the reasons for it, and on a conviction must indicate the offence and the sentence separately. Since a December 2021 amendment it must also carry the prescribed preface, a tabular statement of dates, and an appendix listing the witnesses, exhibits and material objects.
  - It is written in the language of the court or in English, pronounced in open court, and dated and signed at the time it is pronounced; the record and the final order must also disclose the criminal powers the officer exercised in deciding the case.
  - s.138 is punishable with imprisonment up to two years, or a fine up to twice the amount of the cheque, or both. Volume III's counterweight is that a fine, though the lightest punishment a court can impose, must never be excessive with reference to the means of the offender.
  - Imprisonment in default of payment may be ordered, but only within the limits the penal code sets, and it should be regulated with regard to the status of the accused so that he is induced to pay rather than to evade payment.
  - Where the fine is not paid at once the court may order it to be paid within a stated period or by instalments; an unpaid fine is realised on a warrant for levy, and compensation to the complainant is paid out of it.
  - A first offender may be released on probation instead of being sentenced. Volume III gives the Probation of Offenders Act a chapter of its own, on the premise that many offenders are weak characters rather than dangerous criminals and are better kept out of prison.
  - Who actually produces the document is a separate desk. The judge dictates the arguments and the conclusion; a judgment writer of the stenographer cadre assembles, types, uploads and e-signs the judgment, and the presiding officer signs every page of it. Stage 12a follows that work through.
- **13 · Appeal and revision**
  - A conviction by a magistrate is appealed to the Court of Session. Volume III requires the appellate court, once it decides to hear the appeal, to give notice of the day fixed for hearing to the appellant or his pleader.
  - A criminal appeal must be disposed of on its merits and cannot be dismissed in default - a point Volume III makes expressly to Sessions Judges.
  - The appellate court may order the appellant to deposit a minimum of twenty per cent of the fine or compensation awarded, while the appeal against a s.138 conviction is pending.
  - Orders that fall short of a conviction - a dismissal in default, an order on process fees, a refusal to dispense with attendance - are challenged in revision before the Sessions Judge or the High Court, whose power of superintendence over the subordinate courts is the source of these Rules and Orders themselves.
- **14 · Informal digital and workaround practices**
  - Digital copy by email: the advocate is asked to email a PDF of the file to an office inbox, which is kept unvalidated in a folder on the desktop - a recently self-started practice to pre-empt future e-filing and avoid re-scanning. Not required by any rule.
  - Cheque lamination: the cheque is laminated or kept in a polythene pouch purely for safety as it passes through many hands; it is explicitly not mandatory and its absence is not a ground to reject the file.
  - Google Translate as OCR: for civil suits (not NACT) with long relief text, the assistants photograph the pages and use Google Translate to copy and paste the text into CIS, to save typing under time pressure.
  - E-filing release: an e-filed case can only be released into the branch's queue by the computer room, so the assistants phone it repeatedly through the day; advocates often leave non-mandatory fields (the FIR number, the police station) blank, which the assistants then open the PDF to fill in.
  - Peripheral applications: because the CIS core cannot be changed by a High Court, anything the courts of Punjab and Haryana need for themselves is written in-house in PHP and run beside CIS, reading case data through an API and never writing back. Three exist - the Surety module, held centrally at the High Court, Crystal CIS Reports, held on each district's own server, and a third the technical wing named only as a s.138 tool and did not describe.
  - Local reporting: the monthly returns the High Court's branches require are generated district by district through Crystal CIS Reports, an in-house tool built because some CIS reports are not usable, and sent up as soft copies. The High Court does not query the district data itself for them, even though the network reaches every location.
  - Network headroom: the district courts share a Department of Justice wide-area network on a leased line with a small private address range, and some locations have no spare address at all. Anything new that has to be hosted for several courts is constrained first by that, before any question of software.
  - Cheque amount in the FIR field: with no cheque-amount column in the CIS criminal template, the ahlmad types the cheque amount into the FIR box so that the value can be read off the case record at a glance. His own verdict: 'this is some of our own innovation, which is wrong'. It is the same dead field the filing branch downstairs uses for the police station - a s.138 case has no FIR.
  - Blank-template surety process: CIS has no summons-to-surety form, so process to a surety is sent from a blank template. The statutory step behind it is real - the court must call on a person bound by a forfeited bond to pay the penalty or show cause - so the workaround is filling a genuine hole in the software, not inventing a step.
  - Register by print-and-paste: the month's institution report is run out of e-Courts, printed, and pasted into the physical register that Volume III requires the ahlmad to keep.
  - Manual service tracking: process servers take the ahlmad's receiving for served process, and he attaches the acknowledgments to each file by hand, date by date, because no service status reaches the cause list or the case record.
  - Personal Excel returns: the High Court's action plan and its twenty to thirty statements are rebuilt by each ahlmad in his own spreadsheet with VLOOKUP and date formulas, because CIS gives pendency but not disposal and its reports are not aligned with the High Court's format. Explicitly informal, unversioned and untrained - the same shape of private artefact HR-01 found at the filing window.
  - Conviction register by cut-and-paste: the conviction details are copied out of the judgment into MS Word, shortened, printed, cut and pasted into the physical conviction register, and a whole month is done in a day or two at month end because daily entry is not possible. The register is not on CIS. It is the same print-and-paste answer the ahlmad's desk uses for the institution register, but with no database behind it.
  - Retyping the complaint: the facts of the complaint are typed out again in full into every judgment, months after the same complaint was captured at the filing window. The judgment writer, asked twice whether anything he does is repetitive enough to be taken off him, named this and nothing else - and said that if the complaint were digitised at scanning, the judgment would come down to the arguments and the operative part, with the evidence a further candidate since it is complete by the time the file reaches him.
  - The blanket upload certificate: around the third of each month a signed paper certificate goes down to the main office saying that for the previous month all orders and judgments have been uploaded. It carries no case numbers and no counts, while CIS already reports which orders are pending upload - a monthly assurance that could be computed rather than certified.
- **4a · The ahlmad's desk: objections, registration and numbering**
  - The file arrives from the filing branch with its filing number. The reader of the court raises the objections on it - court fee, condonation of delay - and those are argued before the judge, who decides them. Condonation is squarely judicial: the complaint must be made within one month of the cause of action, and only the court may take cognizance later on sufficient cause.
  - Once the objections are removed and registration is permitted, the ahlmad registers the case in CIS and the main case number issues. Volume III's standing requirement is that a summary case be entered in Register No. 1 as soon as it is received in court, and it makes the ahlmad the keeper of the court's registers.
  - He enters the complainant and his advocate, then several addresses for the accused. There is no cheque-amount column in the criminal template, so the cheque amount is typed into the FIR field - a self-started local convention he himself calls wrong. A s.138 case has no FIR at all, and the filing branch downstairs uses the same dead field for the police station.
  - The file then goes to the reader for the next date, the preliminary evidence is taken and the exhibits go on, and the summoning order follows on the same day. The advocate supplies the copies of the complaint that must go out with the process.
- **6a · Process generation, service and the coercive ladder**
  - The ahlmad opens process generation in CIS, selects the court and the date, and picks the process from a numbered list. A s.138 case has its own template - 'summons to accused in 138' - which prints differently from the ordinary summons; s.144 of the NI Act gives the cheque summons its own service regime by speed post or approved courier, and since November 2018 Volume III lets the magistrate issue it as an e-summons.
  - The document prints 'Draft' in large letters until it is published; a draft is not acceptable for use. That is not a formality - a summons must be signed by the presiding officer and bear the seal of the court, or bear the image of the seal or a digital signature if electronic, and a warrant must likewise be signed and sealed.
  - If the accused appears, his bail bond and the names of his sureties go into a module shared across the Punjab and Haryana establishments, so that one person cannot quietly stand surety in case after case. That is the software form of the surety's statutory declaration of how many persons he has stood surety for, and of Volume III's photograph-and-identity requirement against the stock surety. There is no summons-to-surety form in the module, so surety process is sent from a blank template.
  - If he does not appear the ladder runs bailable warrant, then non-bailable warrant, then a request to the bank for the KYC address on the account (the address the complainant gave may be false), then fresh warrants at the address the bank returns, then proclamation, then attachment of the property the complainant's advocate lists. Volume III still cites the 1898 numbering here; the live provisions are BNSS §§90, 84 and 85.
  - Attachment is often spoken of at the desk as a way of getting the cheque amount paid. It is not. Volume III calls it the last remedy for compelling attendance, the attached property remains at the disposal of Government, and it goes back to the absconder if he appears within two years. The complainant's money comes instead from compensation out of a fine, or from a settlement.
  - Process for another district is sent to the magistrate of that district, who has it served and returns it with proof of service; out of state, the police travel, get the warrant endorsed at the local police station and execute it from that jurisdiction. A warrant of arrest may be executed anywhere in India.
  - The return leg is entirely manual. Process servers bring the served process back and take the ahlmad's receiving; he sorts the acknowledgments date by date and attaches them to each file by hand. Nothing about service status shows in the cause list or in the issuing court's CIS record, so for process sent outside the district the court often learns of service only when the person appears. The Sanhita already contemplates a service register with address, email and phone.
- **13a · Consignment, the record room and the miscellaneous file**
  - After judgment the file comes back to the ahlmad. He binds it, generates the 'Index for Decided File' proforma out of CIS - the same report can be produced for a pending file - and sends it down to the record room. Volume III's requirement is that the record be complete before it is consigned.
  - A criminal miscellaneous matter arising out of a decided and consigned NACT file is separated from it and becomes a fresh file with its own number, obtained from the filing branch downstairs. Volume III states the same principle for transfer applications: a separate record, separately consigned.
  - The record-room rules themselves - retention periods, indexing, destruction - sit in Rules and Orders Volumes IV and VI-B, which are not yet in this corpus.
- **13b · Registers, returns and the High Court action plan**
  - The registers are the ahlmad's charge. A summary case must be entered in Register No. 1 as soon as it is received in court and again in the register of summary cases when the accused appears, and the presiding officer must inspect the registers monthly. In Panchkula the paper register is now fed from the database: the month's institution report is run out of e-Courts for the establishment and case type, printed, and pasted in.
  - The reporting stack above it is formal and heavy. Every judicial officer must send the High Court a monthly statement of criminal cases pending over one year in the prescribed proforma before the 10th of the following month, with history sheets for the six oldest; daily progress reports are prescribed besides; and a monthly statement of summary cases received and disposed of is required on top.
  - In practice the High Court asks for some twenty to thirty statements, including an 'action plan' list of two hundred cases kept updated almost daily out of a pendency of about a thousand. CIS produces a management report, a balance sheet and the goshwara, but its output is not aligned with the format the High Court asks for, and it returns pendency without disposal - so age at disposal has to be computed from the institution and decision dates by hand.
  - The gap is closed with a personal spreadsheet. The ahlmad exports the case data, and rebuilds the statements in Excel with VLOOKUP and date formulas on an Ubuntu desktop. He is explicit that this is not formal and that every ahlmad has his own way of doing it, and that he has had no training in it. His ask is the simplest one in the interview: make the system report what the High Court asks for.
- **12a · Writing the judgment: dictation, transcript and upload**
  - The judgment is not written by the judge's own hand. It is prepared by the judgment writer, a stenographer-cadre desk inside the court, and signed by the presiding officer - every page of it, because it was not written by him. Volume III has recognised this since long before CIS, and for a summary trial BNSS goes further: the High Court may authorise the record or the judgment, or both, to be prepared by an officer appointed for the purpose, the magistrate signing what is prepared.
  - The file reaches the writer after pronouncement, usually the next day, and he reads the whole proceeding from start to end before writing. He assembles the document in a fixed order: title, then CIS for the template, the CNR number and the registration and institution dates, then the cause title and the parties off the paper file, then the appearances, then the facts out of the complaint, then the proceedings - summons, notice of accusation, plea of defence, evidence - and last the arguments and the conclusion. No rule prescribes that order; what the rules prescribe is the shape of the finished thing.
  - That shape is exact. Since correction slip no.40 of December 2021 every judgment must open with a preface naming the parties in FORM A, carry a tabular statement of dates in FORM B, and close with an appendix listing the witnesses, the exhibits and the material objects in FORM C, referring to each by number and not only by name; and it must state the point or points for determination, the decision and the reasons, and on conviction the offence and the punishment separately.
  - So the writer's day goes on recovering exact data from paper: the summons date, the date of the notice of accusation, what the complainant tendered and under which exhibit number, the date evidence was closed. BNSS fixes the particulars a summary record must carry, and Volume III requires the substance of the evidence in a summary case that is appealable, which a cheque case is. A wrong cheque number, address or advocate in the judgment is treated at the desk as unfixable, and the Sanhita agrees: once signed, a judgment cannot be altered except to correct a clerical or arithmetical error.
  - Who represented whom is read back off the previous daily orders and cross-checked against the power of attorney pinned at the back of the file, page by page. Nothing about appearance is queryable, so the whole check is manual - and the daily orders themselves belong to a different desk, the stenographer outside the courtroom who does the daily orders while this desk does the judgments.
  - The judge dictates the arguments and the conclusion; the writer takes it in shorthand, in chambers after the court has risen, and types it the following day. This is the route the Sanhita itself lays down for a judgment delivered in full - taken down in shorthand, the transcript signed page by page as soon as it is ready and marked with the date of delivery in open court. Volume III adds only that judgments are not to be written at home during court hours.
  - The typed judgment is uploaded to CIS and e-signed with a digital signature held on a pen-drive token. Orders can be uploaded in a batch, but each still has to be selected one at a time, and there is no bulk download. The writer also runs the CIS reporting to see which of his own orders are still pending upload, and around the third of each month signs a paper certificate for the main office saying that for the previous month all orders and judgments have been uploaded - a single format with no case numbers and no counts on it.
  - The workload behind all this, as reported: two or three judgments a day, about an hour for a simple file and considerably longer for one with lengthy cross-examination and many documents, and about fifteen pages to a judgment. Almost nothing repeats between judgments except the conclusion, some standard sentences and two or three authorities in the observations. The same desk also takes the applications and, when the roster falls to its court, duty-magistrate work - police remands and bail applications, none of it cheque-case work.
- **12b · The free copy and the conviction register**
  - On a conviction the accused gets a copy of the judgment free of cost, so that he can appeal. Volume III requires it soon after delivery wherever the accused is sentenced to imprisonment, and the Sanhita says the same immediately after pronouncement; where the judgment is appealable but no imprisonment is passed - the ordinary s.138 outcome of fine and compensation - the free certified copy comes on the accused's application. At Panchkula it is treated as a right that needs no request.
  - It is handed over the same day, on the footing that the convict is physically present for the pronouncement. That holds most of the time but not always: Volume III itself allows the accused to be absent at pronouncement where his attendance has been dispensed with and the sentence is one of fine only.
  - The copy is what makes the appeal possible. A petition of appeal must be accompanied by a copy of the judgment appealed against, and Volume III works the free supply out for appeals and revisions, including for summons cases where the accused is in jail.
  - The handover is acknowledged in a physical conviction register: the convict signs 'copy received' in the corner, and against it the entry carries the case and registration number, the accused's name, the sentence and the compensation or fine - the same figures Volume III requires to be settled with regard to the offender's means. The register itself is prescribed outside Volume III, in the Rules and Orders volumes that hold the numbered criminal registers and are not yet in this corpus; Volume III's own conviction-reporting duty covers a listed set of Penal Code and special-Act offences and does not reach the NI Act.
  - It used to be handwritten. It now runs on a workaround: the details are copied out of the judgment into MS Word, shortened, printed, cut and pasted into the paper register, and because daily entry is impossible a whole month is done in a day or two at the end of the month. The register is not held in CIS at all, so the acknowledgment taken on the day of conviction and the entry recording it are made weeks apart.

### Haryana vocabulary
- **Filing Assistant** - The filing-branch clerk who receives a s.138 (NACT) file at the lower-court filing window, checks it for completeness and attestation, enters it in the e-Courts (from Punjab & Haryana lower-court filing branch; described by the filing assistants, Panchkula (PUCAR field interview, June 2026) · field note: hr-filing-assistant-2026-06)
- **Ahlmad** - The record-keeper and process clerk of a criminal court. He receives the file from the filing branch once it has a filing number, registers the case in CIS afte (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-A.4 and rule 11-A.14; described firsthand by the criminal ahlmad, Panchkula (PUCAR interview, June 2026) · field note: hr-ahlmad-2026-06)
- **Computer room** - The office that holds the CIS permission to release ('consume' or approve) an e-filed case into the filing branch's queue. The filing assistants have no direct  (from Local CIS access arrangement, Panchkula district courts (PUCAR interview, June 2026) · field note: hr-filing-assistant-2026-06)
- **CIS** - The Case Information System - the national e-Courts case-management software the court works in from filing to judgment. The filing assistant logs in, opens the (from e-Courts Project, Supreme Court e-Committee - Case Information System (CIS) · field note: hr-filing-assistant-2026-06)
- **CNR number** - The Case Number Record - a nationally unique 16-character identifier the e-Courts system assigns to every case, used to track and search it across courts. In Pa (from e-Courts Project - CNR (Case Number Record), the nationally unique case identifier · field note: hr-filing-assistant-2026-06)
- **NACT number** - The filing number the CIS generates for a Negotiable Instruments Act case. 'NACT' is the e-Courts case-type code for a s.138 cheque-bounce complaint; selecting  (from e-Courts CIS case-type code for Negotiable Instruments Act s.138 complaints (NACT) · field note: hr-filing-assistant-2026-06)
- **Memo of parties** - The list of the parties to the case - the complainant and each respondent with their address and phone number - filed as part of the complaint set. It is a mand (from Standard pleading in the filed set; scrutinised at the filing window (Panchkula, PUCAR interview, June 2026) · field note: hr-filing-assistant-2026-06)
- **Offence remarks** - A free-text field in the CIS filing form that the assistants use to park the jurisdictional police station, because the filing counter has no dedicated column f (from Local CIS data-entry practice, Panchkula filing branch (PUCAR interview, June 2026) - a workaround for a missing field · field note: hr-filing-assistant-2026-06)
- **Filing window** - The lower-court counter where advocates submit physical NACT files and the filing assistant receives, scrutinises and enters them. In Panchkula the window is op (from Panchkula district courts filing branch (PUCAR interview, June 2026) · field note: hr-filing-assistant-2026-06)
- **Rules and Orders, Volume III** - The Punjab and Haryana High Court's standing instructions to the subordinate criminal courts of Punjab, Haryana and Chandigarh - the Haryana counterpart of Kera (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-A.1)
- **Preliminary examination** - The first duty of a magistrate taking cognizance on a complaint: to examine the complainant, and any witnesses present, on oath and to record the substance of t (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-B.4)
- **e-summons** - An electronic summons. Since the November 2018 amendment to Volume III a magistrate may, in his discretion, issue a summons or an e-summons for the attendance o (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-Ci.2)
- **Process fee** - The fee payable for issuing and serving the court's process. Volume III is blunt about it: where process fees or other fees are payable, no process is to be iss (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-Ci.2)
- **Petition box** - A box placed in the verandah of the court house about an hour before the court sits, into which petitions and applications are dropped. It is opened in the magi (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-A.4)
- **Kaifiyat** - The office note or report put up to the magistrate on a petition before he can pass orders on it. Volume III has the magistrate either pass proper orders on a p (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-A.4)
- **Peshi register** - The register in which the dates of hearing of the cases before a court are entered. Volume III makes the presiding officer himself fix fresh dates in the peshi  (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-A.10)
- **Day-to-day hearing** - The direction that once the examination of witnesses has begun the proceedings continue from day to day until the witnesses in attendance have been examined, wi (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-D.11)
- **Substance of the evidence** - The lighter record a summons case and a summary trial get. In a summons case the record is ordinarily a memorandum of the substance of the evidence and no more; (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-E.8 · field note: hr-judgment-writer-2026-06)
- **Dismissal in default** - Dismissal of a complaint case because the complainant did not appear. Volume III opens the chapter with the warning that some magistrates are inclined to dismis (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-F.2)
- **Acquittal in default** - In a summons case instituted on a complaint, if the complainant fails to attend on a day fixed for hearing the accused is to be acquitted, unless the magistrate (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-D.5)
- **Fine proportionate to means** - The Volume III rule that a fine, though the lightest punishment a criminal court can impose, must never be excessive with reference to the means of the offender (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 19-B.1)
- **Default imprisonment** - Imprisonment ordered to be served if the fine is not paid. Volume III confirms that criminal courts are empowered to impose it but only subject to the limits th (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 19-B.2)
- **Fine in instalments** - Where an offender is sentenced to a fine and to imprisonment in default and does not pay at once, the court may order that the fine be paid within a stated peri (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 19-B.3)
- **Nazir** - The court's treasurer and custodian. The nazir holds cash and property in the court's keeping, and pays out the money side of a case: the memorandum of the cost (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 9-A.3)
- **Diet money** - The daily allowance, with road money, paid to a witness who attends a criminal court. Volume III sets out when the court pays these expenses and carries a whole (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 9-B.1)
- **e-filing Administrator** - The officer who administers e-filing. Under the E-Filing Rules the Administrator is, for the High Court, the Registrar (IT) or an officer appointed by the Chief (from The Electronic Filing (E-Filing) Rules, High Court of Punjab and Haryana, rule 3.2)
- **Action (e-filing)** - The defined term that decides whether the e-filing regime reaches a cheque case at all. An Action under the E-Filing Rules includes all proceedings instituted i (from The Electronic Filing (E-Filing) Rules, High Court of Punjab and Haryana, rule 3.1)
- **Designated Counter** - A counter at which a case can be filed electronically over the court's intranet instead of over the internet, together with the e-Service Centres provided for t (from The Electronic Filing (E-Filing) Rules, High Court of Punjab and Haryana, rule 2)
- **Date of e-filing** - The date on which an action is treated as filed electronically: the date it is received in the Registry within the prescribed time on a working day, reckoned in (from The Electronic Filing (E-Filing) Rules, High Court of Punjab and Haryana, rule 15)
- **Retention of originals** - The duty on a party who e-files scanned documents to keep the originals for production or inspection as the court directs, to preserve a signed vakalatnama or a (from The Electronic Filing (E-Filing) Rules, High Court of Punjab and Haryana, rule 11)
- **OCR-searchable PDF** - The form an e-filed document has to take. All original typed material must be prepared as the Rules and Orders require and converted into an optical-character-r (from The Electronic Filing (E-Filing) Rules, High Court of Punjab and Haryana, rule 7)
- **Live Link** - A live television link or other audio-video electronic arrangement by which a person who is physically absent from the courtroom is nevertheless virtually prese (from Rules for Video Conferencing for Courts, High Court of Punjab and Haryana, rule 2(ix))
- **Court Point** - The courtroom, or any place where the court is physically convened, in a hearing held over a live link - including the place where a commissioner or an inquirin (from Rules for Video Conferencing for Courts, High Court of Punjab and Haryana, rule 2(v))
- **Remote Point** - The place where a person appears or is examined through a video link. It may be another court, a legal services authority or mediation centre, a jail, a hospita (from Rules for Video Conferencing for Courts, High Court of Punjab and Haryana, rule 2(x))
- **Required Person** - The defined class of people who may take part in a hearing over a live link: the person to be examined, the person in whose presence proceedings are to be recor (from Rules for Video Conferencing for Courts, High Court of Punjab and Haryana, rule 2(xii))
- **Video conferencing Coordinator** - The official who runs a video-conferenced hearing at each end. There is a coordinator at the Court Point and, where a witness or an accused is to be examined, o (from Rules for Video Conferencing for Courts, High Court of Punjab and Haryana, rule 5)
- **Peripheral application** - A piece of software a High Court or district court builds for itself alongside CIS, because the CIS core cannot be changed locally. A peripheral application rea (from e-Courts CIS architecture as described by the IT wing of the High Court of Punjab and Haryana (PUCAR interview, June 2026) · field note: hr-hc-it-systems-2026-06)
- **Surety module** - The in-house application in which a person offering surety for an accused is recorded, with an Aadhaar number, and checked against every other court in Punjab,  (from Rules and Orders, Volume III, rule 10.9 (surety and identity documents), read with BNSS §486; the module itself described by the High Court IT wing (PUCAR interview, June 2026) · field note: hr-ahlmad-2026-06)
- **Stock surety** - A person who stands surety again and again, for strangers and for a consideration, rather than out of any real connection with the accused. Rules and Orders Vol (from Rules and Orders, Volume III, rule 10.9(9A) (added 2007), read with BNSS §486 and §140 · field note: hr-hc-it-systems-2026-06)
- **Crystal CIS Reports** - CCR, the reporting application the High Court's technical wing built in-house because some of the reports CIS produces are not usable. It runs on each district' (from In-house peripheral application of the High Court of Punjab and Haryana, described by its IT wing (PUCAR interview, June 2026) · field note: hr-hc-it-systems-2026-06)
- **Statement Clerk** - The official posted in each district court who generates the periodical statements and returns the High Court requires - what was registered, what was not and w (from Rules and Orders, Volume III, rules 2.6 and 11-A.15 (periodical statements and statistical returns); the post described by the High Court IT wing (PUCAR interview, June 2026) · field note: hr-hc-it-systems-2026-06)
- **System Officer** - The technical official posted in a district court establishment. There is a System Officer and a System Assistant per district, and at the district headquarters (from District court technical establishment, Punjab and Haryana; described by the High Court IT wing (PUCAR interview, June 2026). No rule in the corpus creates the post. · field note: hr-hc-it-systems-2026-06)
- **NJDG** - The National Judicial Data Grid, the national store into which every court's case data flows. Each of the district court servers in Punjab, Haryana and Chandiga (from e-Courts Project, Supreme Court eCommittee - National Judicial Data Grid; the local synchronisation described by the High Court IT wing (PUCAR interview, June 2026) · field note: hr-hc-it-systems-2026-06)
- **NIC** - The National Informatics Centre, which builds and maintains CIS for the courts. A High Court can suggest a change but cannot make one: the suggestion goes to NI (from National Informatics Centre, the technical agency for the e-Courts project; its role described by the High Court IT wing (PUCAR interview, June 2026) · field note: hr-hc-it-systems-2026-06)
- **eCommittee** - The e-Committee of the Supreme Court of India, which governs the e-Courts project and is the gate every change to CIS has to pass. A High Court's suggestion rea (from e-Committee of the Supreme Court of India, the governing body of the e-Courts project; its role in the change route described by the High Court IT wing (PUCAR interview, June 2026) · field note: hr-hc-it-systems-2026-06)
- **Mirror server** - The third machine at a district court location, alongside the two that run CIS, holding a copy of the court's data so that work can continue if the primary fail (from The Electronic Filing (E-Filing) Rules, High Court of Punjab and Haryana, rule 18 · field note: hr-hc-it-systems-2026-06)
- **Reader (court)** - The officer who sits with the presiding judge, keeps the daily proceedings and the dates, and raises the objections on a newly filed case before it is registere (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-A.10; described firsthand by the criminal ahlmad, Panchkula (PUCAR interview, June 2026) · field note: hr-ahlmad-2026-06)
- **Process generation** - The CIS function through which the ahlmad turns a judicial order into an actual piece of process. He opens the court and the date, picks the process type from a (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-Ci.6 (mode of issuing and serving process); the CIS process-generation module, described firsthand by the criminal ahlmad, Panchkula (PUCAR interview, June 2026) · field note: hr-ahlmad-2026-06)
- **NACT summons** - The summons issued to an accused in a s.138 cheque case, which in CIS is a separate template from the ordinary criminal summons and prints in a different, large (from NI Act s.144 (mode of service of summons in cheque cases); Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-Ci.2; the distinct CIS template described firsthand by the criminal ahlmad, Panchkula (PUCAR interview, June 2026) · field note: hr-ahlmad-2026-06)
- **Publishing (CIS)** - The step that turns a generated process from a draft into a live document. Before publishing, the printout carries 'Draft' in large letters and is not acceptabl (from CIS process-generation workflow, described firsthand by the criminal ahlmad, Panchkula (PUCAR interview, June 2026); the requirement it satisfies is in BNSS s.63 and s.72 · field note: hr-ahlmad-2026-06)
- **Notice of accusation** - What the staff of a Haryana criminal court call the moment the substance of the accusation is put to the accused. In a summons case, and so in a cheque case tri (from BNSS s.274 (substance of accusation to be stated), formerly CrPC s.251; Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-D.2; the local usage recorded firsthand from the criminal ahlmad, Panchkula (PUCAR interview, June 2026) · field note: hr-ahlmad-2026-06)
- **Bank KYC verification** - The step a Haryana magistrate's court takes when bailable and non-bailable warrants keep coming back unserved: it writes to the drawer's bank for the KYC addres (from A local coercive-execution step described firsthand by the criminal ahlmad, Panchkula (PUCAR interview, June 2026); the powers it rests on are BNSS s.94 and the Bankers' Books Evidence Act s.6 · field note: hr-ahlmad-2026-06)
- **Consignment** - Sending a finished case file down to the court's record room for keeping. When judgment is pronounced the file comes back to the ahlmad, who binds it, generates (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 3.18 and rule 26-B.1; the binding-and-sending practice described firsthand by the criminal ahlmad, Panchkula (PUCAR interview, June 2026) · field note: hr-ahlmad-2026-06)
- **Index for Decided File** - The proforma the ahlmad generates out of CIS for a decided case and attaches to the bound file before consigning it to the record room; it lists what the record (from CIS report, described firsthand by the criminal ahlmad, Panchkula (PUCAR interview, June 2026); the completeness requirement it serves is in Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 3.18 · field note: hr-ahlmad-2026-06)
- **Criminal miscellaneous** - A miscellaneous criminal proceeding taken out of a case that has already been decided and consigned - an application on a NACT file that has gone to the record  (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 26-B.1; the CRM separation described firsthand by the criminal ahlmad, Panchkula (PUCAR interview, June 2026) · field note: hr-ahlmad-2026-06)
- **Institution register** - The register of cases instituted in the court. Volume III requires a summary case to be entered in Register No. 1 as soon as it is received in court, and again  (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 2.6 and rule 11-A.14; the e-Courts print-and-paste method described firsthand by the criminal ahlmad, Panchkula (PUCAR interview, June 2026) · field note: hr-ahlmad-2026-06)
- **Action plan** - The case-management reporting the High Court requires of each court, which at Panchkula means a running list of two hundred cases kept updated almost daily out  (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-A.12, rule 1-A.13 and rule 1-A.11; the current High Court format described firsthand by the criminal ahlmad, Panchkula (PUCAR interview, June 2026) · field note: hr-ahlmad-2026-06)
- **Goshwara** - The summary statement of a court's work - the balance sheet of institution, disposal and pendency - that the staff prepare from the CIS management report for th (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-A.12 and rule 2.6; the word and the CIS balance-sheet source recorded firsthand from the criminal ahlmad, Panchkula (PUCAR interview, June 2026) · field note: hr-ahlmad-2026-06)
- **Judgment Writer** - The court official who prepares the written judgment. At Panchkula he is a stenographer-cadre post working inside the courtroom and chambers, distinct from the  (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 25-G.8; the post and the split of duties described firsthand by a judgment writer at the Panchkula district courts (PUCAR interview, June 2026) · field note: hr-judgment-writer-2026-06)
- **Daily order** - The order recorded for a case on each date of hearing - the running order sheet of the file. It is where the court records who appeared and who represented whom (from Court practice, Punjab and Haryana district courts; described firsthand by a judgment writer at the Panchkula district courts (PUCAR interview, June 2026). The word 'zimni' is from the machine transcript of the Hindi audio and is recorded as heard; the uploader's own English subtitles render the same thing as 'daily orders'. · field note: hr-judgment-writer-2026-06)
- **Conviction register** - The physical register in which a convicting court records its convictions and takes the convict's acknowledgment for the free copy of the judgment. The convict  (from Court register kept by the judgment writer, Panchkula district courts, described firsthand (PUCAR interview, June 2026). The register series itself is prescribed in Rules and Orders Volumes IV and VI-B, which are not in this corpus; Volume III rule 2.3 and rule 26-B.2 show how it refers registers out. · field note: hr-judgment-writer-2026-06)
- **Free copy of the judgment** - The copy of the judgment a convicted accused gets without paying for it, so that he can appeal. Volume III r.1-H.1(vi) requires that whenever an accused is sent (from Rules and Orders of the Punjab and Haryana High Court, Volume III (Instructions to Criminal Courts), rule 1-H.1(vi) and rules 25-G.2 to 25-G.4, read with BNSS s.404 (formerly CrPC s.363); the same-day handover practice described firsthand by a judgment writer at the Panchkula district courts (PUCAR interview, June 2026) · field note: hr-judgment-writer-2026-06)
- **Upload certificate** - The monthly assurance a court official signs and sends to the main office of the establishment, stating that for the preceding month all the orders and judgment (from District court reporting practice, Panchkula, described firsthand by a judgment writer (PUCAR interview, June 2026). No provision in this corpus prescribes it; its rule-level ancestors are Rules and Orders Volume III rules 1-A.12 and 2.6. · field note: hr-judgment-writer-2026-06)
- **Duty magistrate** - The magistrate on the duty roster, before whom work is put up that cannot wait for the court it belongs to. The month is divided among the judges of the establi (from District court duty roster, Panchkula, described firsthand by a judgment writer (PUCAR interview, June 2026). No rule in this corpus creates the roster; the remand duty it carries is in Rules and Orders Volume III rule 11-B.9, read with BNSS s.187. · field note: hr-judgment-writer-2026-06)
- **e-signing (CIS)** - Signing a judgment or order inside CIS with a digital signature held on a pen-drive token, so that it can be uploaded as a signed document. Orders can be signed (from CIS judgment and order workflow, described firsthand by a judgment writer at the Panchkula district courts (PUCAR interview, June 2026); the signature requirement it satisfies is in Rules and Orders Volume III rule 1-H.1 and BNSS s.392, and its legal effect in IT Act sections 5 and 6 · field note: hr-judgment-writer-2026-06)

## State layer - Kerala (process: own)

How a §138 cheque-bounce case runs in Kerala, from filing to disposal - built purely from the rules and Acts, with every step citing the provision that governs it. Click any citation to open the exact text. This is the de jure process the black-letter rules prescribe; the lived, local practice is a separate layer.

### Roles
- **Complainant** (litigant) - The payee or the holder in due course of the dishonoured cheque. Only this person can set a §138 case going, by filing the complaint in their own name. [open]()
- **Power-of-attorney holder** (litigant) - Where duly authorised and personally aware of the transaction, may file the complaint and depose on the complainant's behalf - a point the Supreme Court has settled for §138 cases. Stands in the payee [open]()
- **Accused** (litigant) - The drawer of the cheque, prosecuted for the dishonour. Where the drawer is a company, the company and every person who was in charge of and responsible to it. [open]()
- **Surety** (litigant) - Stands surety for the accused's release on bail, undertaking by bond to secure their appearance. The court tests the surety's sufficiency before accepting the bond. [open]()
- **Drawee bank** (bank) - The bank on which the cheque is drawn. Its return of the cheque unpaid is the event the offence turns on, and its return memo proves both the dishonour and the reason for it. [open]()
- **Witness** (witness) - Gives evidence on the facts. In a §138 case the complainant's evidence may be led on affidavit, and an officer of the drawee bank often proves the dishonour. A witness is sworn before deposing. [open]()
- **Advocate** (advocate) - The legal practitioner who appears for the complainant or the accused. The right to appear flows from enrolment under the Advocates Act. [open]()
- **Advocate's clerk** (advclerk) - Assists the advocate with filing, inspection of records and following the matter through the registry. A recognised court-precinct role rather than a statutory office. [open]()
- **Magistrate (JMFC)** (judge) - The Judicial Magistrate of the First Class who takes cognizance of the complaint, tries it summarily and passes judgment. In Kerala a §138 case may be assigned to the designated Special Court. [open]()
- **Chief Ministerial Officer** (staff) - The court's senior ministerial officer who signs and issues the summons and other process 'by order of the Court'. [open]()
- **Bench clerk** (staff) - The clerk who attends the sitting: calls the cases, marks the exhibits, and keeps the court diary and the proceedings paper - the running record of each hearing. [open]()
- **Stenographer** (staff) - Takes down the dictation of the depositions, orders and judgment. The depositions they record are headed and signed in the form the rules prescribe. [open]()
- **Interpreter** (staff) - Interprets the evidence when a witness does not speak the court's language, which matters in Kerala where the court language is Malayalam. The interpreter is put on oath, and a police officer may not  [open]()
- **Station House Officer** (police) - The local police officer who executes warrants and serves the process the court issues, as part of the statutory functions of the police. [open]()
- **Scrutiny officer** (staff) *(has informal aspects)* - The court official (part of the Registry / ministerial establishment) who scrutinises a complaint and its documents for defects before it is numbered and placed for cognizance, noting objections or re [open](#story?state=kerala&sec=role-scrutiny-officer)

### Process
- **1 · Filing the complaint**
  - A cheque-bounce case is a complaint case: the payee or holder in due course files a written complaint, and the Magistrate can take cognizance only on such a complaint (never on a police report).
  - It must be filed within one month of the cause of action - which arises when the drawer fails to pay within 15 days of the demand notice served after dishonour.
  - In Kerala the complaint is e-filed through the DCMS portal under the E-Filing Rules, and the court fee is paid on filing.
- **1b · Scrutiny & defect check**
  - Before the complaint is numbered and placed for cognizance it is scrutinised for defects. On e-filing the Registry scrutinises the pleadings and documents and notes objections; a defective petition is not numbered and is returned to the party, pleader or officer concerned for amendment and representation.
  - On the ground this is done by an official commonly called the scrutiny officer. Reported (Mehul, PUCAR; unverified): defects are sometimes not marked properly and files held so the advocate approaches the officer and may pay to move the file forward. The scrutiny function is in the rules; the title and this practice are not.
- **2 · Cognizance & issue of process**
  - The Magistrate examines the complainant (and any witnesses) on oath and, if satisfied there is ground to proceed, takes cognizance and issues process to the accused.
  - The summons is signed and issued by the court's ministerial officer 'by order of the Court', in the prescribed form.
  - Because the court language is Malayalam, process issued in Malayalam must carry an authorised English translation.
- **3 · Service of summons**
  - The summons is served in the manner the BNSS prescribes, and the NI Act's own mode of service also applies.
  - Service is effected through the police - the local Station House Officer serves the court's process. This is the only point at which the police enter a §138 case.
  - Where the e-filing regime permits, service may be by electronic means.
- **4 · If the accused does not appear**
  - The court escalates up the warrant ladder: a warrant issues, and on continued absconding, proclamation and attachment of property.
  - Kerala's rules carry the absconding-accused track; the police execute the warrant.
- **5 · Trial (summary)**
  - The case is tried summarily, and the complainant's evidence may be given on affidavit - the features that make §138 a fast-track offence.
  - A presumption operates in favour of the holder that the cheque was issued for a debt or liability, unless the accused rebuts it.
  - Kerala adds nothing procedural here - the summary-trial machinery is uniform central law.
- **6 · Judgment, sentence & compensation**
  - On conviction the court may impose imprisonment up to two years and/or a fine up to twice the cheque amount, with compensation to the complainant.
- **7 · Compounding / settlement**
  - The offence is compoundable: the parties may settle at any stage and the case is compounded, ending the prosecution.
- **8 · Appeal & revision**
  - The accused may appeal; the appellate court may require a deposit of a minimum of 20% of the fine/compensation as a condition of the appeal.
  - A revision lies to the High Court, whose own rules govern its criminal side.
  - A complaint may also be challenged by a quashing petition before the High Court.

### Kerala vocabulary
- **Chief Ministerial Officer** - The court officer who, 'by order of the Court', ordinarily signs and issues the summons to the accused and witnesses in a Kerala criminal court. (from Criminal Rules of Practice, Rule 7)
- **By order of the Court** - The prescribed words that must precede the ministerial officer's signature on a summons. (from Criminal Rules of Practice, Rule 7)
- **Court diary** - The court's running administrative record of a case (Administrative Form No. 10). (from Criminal Rules of Practice, Rule 72)
- **Proceedings paper** - The sheet on which the day-to-day proceedings of a case are recorded (Judicial Form No. 61). (from Criminal Rules of Practice, Rule 73)
- **Station House Officer (SHO)** - The officer in charge of a police station; in a s.138 case the person who executes the court's warrant and serves its process - the only point at which the poli (from Kerala Police Act, §4 (functions of the police))
- **Functions of the police** - The statutory duties of the Kerala police, including serving court process and executing warrants - a s.138 case is a complaint case, so the police act only on  (from Kerala Police Act, §4)
- **Translation of process** - Court process issued in Malayalam must carry an authorised English translation - the point where the court-language rule bites on a summons or notice. (from Criminal Rules of Practice, Rule 14)
- **Court language (Malayalam)** - The working language of Kerala's subordinate courts; it shapes the summons, the demand-notice evidence, orders and the filing interface a s.138 case passes thro (from Criminal Rules of Practice, Rule 14)
- **DCMS e-filing portal** - The District Court Case Management System at filing.keralacourts.in through which a s.138 complaint is electronically filed in Kerala. (from Electronic Filing Rules (Kerala), 2021, Rule 1)
- **Electronic service of process** - When the Kerala e-filing regime permits service by electronic means - narrower than informal WhatsApp/e-mail service, which the High Court has declined to sanct (from Electronic Filing Rules (Kerala), 2021, Rule 11)
- **24×7 ON Court** - Kollam's dedicated §138 court, running round-the-clock as India's first fully digital 'ON Court' - the concrete court the Kerala layer describes. (from G.O.(Ms) 241/2024/Home)
- **Special Court (JMFC) for §138** - A Judicial Magistrate of the First Class court set up under the proviso to section 9(1) BNSS to try only cheque-bounce cases - Kerala's sits at Kollam. (from G.O.(Ms) 241/2024/Home)
- **Court fee on a §138 complaint** - The ad valorem fee to file a cheque complaint in Kerala - ₹250 up to a ₹10,000 cheque, otherwise 5% of the cheque amount capped at ₹3 lakh (Article 21, Court Fe (from Kerala Court Fees Act, Article 21)
- **Bench clerk** - The clerk who attends the sitting - calls the cases, marks the exhibits, and keeps the court diary and the proceedings paper. (from Criminal Rules of Practice, Rules 72, 73 & 62)
- **Stenographer** - Takes down the dictation of the depositions, orders and judgment; the depositions are headed and signed as the rules prescribe. (from Criminal Rules of Practice, Rules 56 & 57)
- **Interpreter** - Interprets the evidence when a witness does not speak the court's language, which in Kerala is Malayalam; put on oath, and a police officer may not interpret. (from Criminal Rules of Practice, Rules 52 & 54)
- **Surety** - A person who stands surety for the accused's release on bail, undertaking by bond to secure their appearance; the court tests the surety's sufficiency. (from Criminal Rules of Practice, Rules 122 & 124)
- **Advocate's clerk** - Assists the advocate with filing, inspection of records and following the matter through the registry - a recognised court-precinct role rather than a statutory (from Court-precinct and registry practice (not a statutory office))
- **Oath** - How the national Oaths Act, 1969 requirement is run on the ground in Kerala: the Criminal Rules of Practice name the officer who administers the oath (Rule 50)  (from Criminal Rules of Practice, Rules 50 & 51)
- **Vakalatnama** - The document by which a party authorises an advocate to appear and act for them; until it is on record the advocate has no authority to represent the party. The (from Criminal Rules of Practice, Rule 32)
- **Deposition** - A witness's evidence as recorded in court and signed. The Kerala Criminal Rules of Practice prescribe how depositions are headed (Rule 56) and signed (Rule 57); (from Criminal Rules of Practice, Rules 56 & 57)
- **Criminal Rules of Practice** - The rules the High Court of Kerala made in 1982, under Article 227 of the Constitution, to govern how the criminal courts below it actually run - filing, the co (from Criminal Rules of Practice, Kerala, 1982)
- **Scrutiny officer** - The court official (part of the Registry / ministerial establishment) who scrutinises a complaint and its documents for defects before it is numbered and placed (from E-Filing Rules, Kerala, r.17 (read with CRP r.68) · field note: ke-scrutiny-officer-2026-07)
- **Registry** - The court's administrative office - the ministerial establishment that receives filings, scrutinises them for defects, numbers and lists the case, keeps the rec (from Criminal Rules of Practice, Rule 27)
- **Registrar** - The senior judicial officer who heads the High Court's registry - scrutiny, listing, custody of records and the exercise of delegated administrative and quasi-j (from Rules of the High Court of Kerala, 1971, Rule 15)
- **Superintendent of Police** - The District Police Chief - the officer who commands the whole police force of a district. A s.138 case rarely involves the police, but the Superintendent heads (from Kerala Police Act, 2011, §14 (police ranks))
- **Sub-Inspector of Police** - The rank that is the Station House Officer of most police stations - the officer who, in an ordinary criminal case, registers the FIR and investigates, and who  (from Kerala Police Act, 2011, §14 (police ranks))
- **Circle Inspector** - The Inspector of Police who heads a circle - a group of police stations - and is the Station House Officer of the larger stations, supervising the Sub-Inspector (from Kerala Police Act, 2011, §14 (police ranks))
- **Director General of Police** - The apex rank of the police and the head of the whole State force, in whom the administration, supervision and control of the entire Kerala Police is vested, su (from Kerala Police Act, 2011, §18 (State Police Chief))
- **Commissioner of Police** - The head of a metropolitan Commissionerate - the unitary policing set up for larger cities such as Thiruvananthapuram and Kochi, where the Commissioner combines (from Kerala Police Act, 2011, §15 (police structure))
- **Constable** - The basic rank of the police - patrol, guard, beat duty and first response, and often the officer who physically carries and serves the court's process on the g (from Kerala Police Act, 2011, §14 (police ranks))
- **State Security Commission** - The oversight body that lays down broad policy for the police and insulates the force from illegitimate pressure. It has no role in any individual s.138 case bu (from Kerala Police Act, 2011, §24)
- **Police Complaints Authority** - The body that inquires into serious complaints of misconduct against the police, such as custodial wrongdoing or abuse of authority. It does not touch the trial (from Kerala Police Act, 2011, §110)

## Local practice - field notes

### KL-01 - ke-scrutiny-officer-2026-07 (Kerala)
Heard from Mehul (PUCAR Team). relayed / may be secondhand.

> In Kerala a scrutiny officer reviews litigant and advocate submissions and marks defects before the file is sent for taking cognizance. Reportedly the role is informal and not in the rules, and the officer often does not mark defects properly, holding files so the advocate approaches him and may make a payment to move the file forward.

**Verification:**
- [corroborated] a defect-scrutiny step happens before cognizance
- [contradicted] the scrutiny role is informal and not in the rules - Scrutiny is a formal function: the Registry scrutinises filings and notes objections under E-Filing Rules r.17, and CRP r.68 requires defective petitions to be returned for amendment and representation. Only the specific title 'scrutiny officer' and the file-holding-for-payment fall outside the rules.
- [reported-allegation] files are held so the advocate pays to move them

**Changed:** created Scrutiny officer, created Scrutiny officer, created 1b · Scrutiny & defect check

**Across states:** similar Haryana - Haryana's Panchkula filing assistants perform the same pre-cognizance defect scrutiny at the filing window, but describe it as routine and same-day, without the file-holding-for-payment reported here in Kerala.

**Across states:** diverges Haryana - Both notes describe an officer whose title is functional rather than statutory and whose day is shaped by work no rule describes. They diverge on integrity: nothing of the file-holding-for-payment reported in Kerala was described at the Panchkula judgment desk, where the reported friction is retyping and month-end register batching. The Kerala officer sits before cognizance, this one after judgment.

### HR-01 - hr-filing-assistant-2026-06 (Haryana)
Heard from Shubhreet and a filing-branch colleague (Filing assistants, Panchkula lower courts (Punjab & Haryana HC)). firsthand.

> Filing assistants at the Panchkula lower-court window described how a s.138 ('NACT') case is filed. The advocate submits a physical file assembled in a fixed order - CIS proformas, index, memo of parties, the complaint (its 'prayer'), a Rs.10 court-fee ticket, an attested affidavit, the laminated cheque, an attested power of attorney and a copy per respondent. The assistant scrutinises it for completeness and attestation, enters it in the e-Courts CIS under Criminal then NACT, and the system issues a NACT filing number and a CNR number (HRPK...). The file is registered and carried the same day by a peon to the trial court, where the ahlmad takes over. They also described self-started practices: emailing a PDF copy to an office inbox kept on a desktop folder (unvalidated), laminating the cheque for safety (not mandatory), parking the jurisdictional police station under 'offence remarks' for case distribution, and using Google Translate as an OCR tool for long civil relief text (civil suits, not NACT). For e-filings, only the computer room can release a case into their queue, so they phone it repeatedly; advocates often leave non-mandatory fields (FIR number, police station) blank, which the assistants then fill in.

**Verification:**
- [corroborated] a s.138 complaint is received and scrutinised for defects at the filing window before it reaches the trial court
- [needs-check] the limitation to file a s.138 complaint is '45 days' - The statute gives one month from the cause of action to file (NI §142(1)(b)); the cause of action arises 15 days after the demand notice (§138 proviso). '45 days' looks like a practical rule of thumb combining the 15-day notice window with the one-month filing period, not a statutory 45-day limit. Safe as a conservative check, but it should be computed from the actual dates in each case.
- [contradicted] a NACT (s.138) filing needs an FIR number and a jurisdictional police station - A s.138 case is a complaint offence with no FIR and no police investigation, so the FIR field in the shared CIS criminal template does not apply to it. The 'police station' the assistants record is used only to distribute cases (by the bank where the cheque was presented), not for any investigation.
- [reported-practice] a PDF copy of each file is emailed to an office inbox and kept on the desktop as a record - A recently self-started, informal practice - not required by any rule and not validated; the copy sits in a local desktop folder. Recorded as practice, not as an official record.
- [reported-practice] the cheque is laminated at filing - An informal safety habit, explicitly not mandatory; its absence is not a ground to reject the file.
- [reported-practice] e-filed cases can only be released into the filing branch's queue by the computer room, and advocates skip non-mandatory fields - An access-control and data-quality gap described firsthand: the branch has no direct release permission (10 to 15 calls a day), and non-mandatory fields left blank in e-filing are re-entered by the assistants. A direct signal for portal design - make the paper-mandatory fields mandatory online.

**Changed:** created Filing Assistant, created Ahlmad, created Computer room, created 2 · Scrutiny at the window, created 3 · CIS entry and numbering, created 5 · Informal digital and workaround practices, created CIS, created CNR number, created NACT number, created Offence remarks

**Across states:** similar Kerala - Both states run a defect-scrutiny check at filing before the case reaches the court - Kerala through the Registry / 'scrutiny officer', Haryana through the filing-branch assistant at the window. They diverge on integrity: Kerala's note reports file-holding for payment, while the Panchkula assistants describe a routine, same-day, checklist-driven scrutiny with no such allegation.

**Across states:** similar Haryana - The systems layer beneath this account. The High Court IT wing describes the establishment behind 'the computer room' - a System Officer and a System Assistant at every court location, who own the CIS server and its permissions - and the architectural reason the branch's problems cannot simply be fixed: no High Court can change the CIS core, so local need is met by read-only peripheral applications or waits years for a national patch. It does not reach the release permission, the blank non-mandatory fields or the emailed PDF copy, which were never raised in that interview and remain to be checked.

**Across states:** similar Haryana - The next link in the same chain, in the same building. HR-01 ends when the peon carries the file out of the filing window; HR-02 is the criminal ahlmad who receives it. They meet exactly on the FIR field: the filing branch parks the jurisdictional police station in it, the ahlmad types the cheque amount into it, and a s.138 case has no FIR at all - one dead column in the shared criminal template, repurposed twice for different data by two desks in the same court. The workarounds diverge in direction: the window's are about getting a file in, the ahlmad's about getting data back out. Neither note reports rent-seeking.

**Across states:** similar Haryana - The far end of the same file. The complaint this branch types into CIS on the day of filing is typed out again, in full, by the judgment writer months later when the judgment is drafted - which he names as the single change that would save him the most time. The emailed-PDF habit recorded here is the first half of the digitisation he is asking for. They diverge on the cost: at the window the problem is blank non-mandatory fields and data quality, at the judgment desk it is pure duplication.

### HR-03 - hr-hc-it-systems-2026-06 (Haryana)
Heard from Mandeep (IT / technical wing, High Court of Punjab and Haryana at Chandigarh; also oversees IT for the district courts of Punjab, Haryana and U.T. Chandigarh). firsthand.

> The officer who runs IT for the Punjab and Haryana High Court, and who supports the district courts of Punjab, Haryana and U.T. Chandigarh, described the systems layer beneath the filing process. His office takes software and hardware problems from every district court, gives administrative approval for the use of software, and carries queries up to the authorities; everything else is done by the district courts themselves. Each district has its own technical establishment - a System Officer and a System Assistant, with a System Officer and two or three System Assistants at the district headquarters depending on how many courts sit there. There are 46 districts and about 130 court locations, and each location runs its own CIS server (three machines: two application servers and a mirror). Case data reflects in the National Judicial Data Grid in real time when the network is up, while orders and judgments are pushed each evening by running a command. CIS itself belongs to NIC: he gave the versions as 1.0 in 2011, 2.0 in 2014, 3.0 in 2017 and 4.0 in 2025, migrated by running an NIC-supplied script over a full backup, which takes two to six hours at a small location and up to twenty-four at a large one. The central constraint he described is that no High Court can change the CIS core. The CIS team will not accept changes to core software, so any High Court or district court in India that wants its own functionality must build it as a 'peripheral application', which reads CIS data through an API (case type, case status, case number, party name) and cannot write anything back. Suggestions for the core go from the High Court to NIC Pune and move only if the Supreme Court eCommittee approves: a small change can be done in two to four days, otherwise it waits for the next version patch, into which suggestions from every High Court in India are bundled. His wing has therefore built three peripheral applications in-house in PHP - a Surety module, CCR (Crystal CIS Reports), and a third he named only as '138 book software'. The Surety module records the person offering surety, including an Aadhaar number, and checks whether he is a repeat or habitual surety across the courts of Punjab, Haryana and Chandigarh; a person who has already stood surety may stand again but must produce a different document each time (a motorcycle registration certificate, then a car registration certificate, then a mortgage of property), and monthly reports are generated. Version 1.0 kept the data on each district's local server; version 2.0 holds it centrally at the High Court, which the district courts reach over the network. It cannot see any other state. CCR runs on each district's own server and was built because some reports CIS produces are not usable; the Statement Clerk in each district uses it to generate the monthly returns the High Court's branches require, because the High Court cannot pull that data itself and wants soft copies. The district courts sit on a Department of Justice WAN over a leased MPLS line with a private 172.18 address series, so every district court can reach every other, but spare addresses are scarce and some locations have none, which he flagged as the first thing to check before hosting anything new. He put his own split at roughly 60 per cent technical and 40 per cent non-technical work - vendor and AMC meetings, video conferencing, and the virtual inaugurations of the last two years - and said anything with an 'e' or a 'computer' in it is forwarded to the technical team. On capacity he was candid: the cadre is almost entirely system administrators for servers, network and hardware, around 90 per cent purely infrastructure, and he was not sure whether anyone holds programming skills, offering to check; hiring programmers would be an administrative decision for the High Court, on which the NIC scientists posted there could advise. He offered direct help during any implementation.

**Verification:**
- [corroborated] the High Court's IT wing supports every district court in its jurisdiction for both software and hardware, gives administrative approval for the use of software and carries queries to the authorities, while day to day operation is done by the district court staff themselves (pan Punjab and Haryana, with U.T. Chandigarh) - The corpus corroborates the reach, not the support arrangement itself. E-Filing Rules r.2 applies the rules to the High Court and to every court and tribunal over which it has supervisory jurisdiction, and brings them into force on notification in the gazettes of Punjab, Haryana and U.T. Chandigarh; r.3.7 defines District Courts as the courts functioning under the control and supervision of the High Court. That is the same three-territory remit the interviewee describes. No rule in the corpus creates the IT support function itself.
- [reported-practice] every district has its own technical establishment - a System Officer and a System Assistant, with a System Officer and two or three System Assistants at the district headquarters scaled to the number of courts - and it is these officials, not the court staff, who administer the CIS server and its performance - An establishment fact with no rule behind it in the corpus. It is very probably the office the Panchkula filing assistants (HR-01) call the 'computer room' - the district court's own technical wing. It is not the same as the Administrator, whom E-Filing Rules r.3.2 makes an officer appointed by the District and Sessions Judge for e-filing matters. The two should not be conflated.
- [reported-practice] there are 46 districts and about 130 court locations in the High Court's jurisdiction, each running its own CIS server, and each server communicates directly with the National Judicial Data Grid over whitelisted addresses - The three-territory scope is consistent with E-Filing Rules r.2, and 46 districts is consistent with Punjab, Haryana and Chandigarh taken together rather than with Haryana alone. The counts, and the name of the national data centre he gave, come from a machine-generated transcript and should be confirmed with the High Court before being published as figures.
- [corroborated] each district court location has three servers, two application servers and a mirror server, and extra capacity can be requested from the High Court - E-Filing Rules r.18 requires e-filings to be stored on an exclusive server maintained under the control and directions of the Court, and expressly allows a mirror image of those filings to be kept at a different geographical location for continuity of operations in a disaster or breakdown. That is the rule behind the mirror server. The hardware model numbers he gave are as reported from a machine-generated transcript.
- [reported-practice] case data reflects in the National Judicial Data Grid in real time when the network is working, and only orders and judgments are uploaded at the end of the day by running a command - An operational description of the e-Courts synchronisation design with no legal provision behind it. He was explicit that the real-time part depends on the network being up, which makes network quality, not software, the thing that decides whether a date entered by the reader is visible outside the court.
- [needs-check] CIS is developed and upgraded by NIC, and ran as version 1.0 from 2011, 2.0 from 2014, 3.0 from 2017 and 4.0 from 2025 - He also said NIC upgrades the software every two or three years, and separately that CIS 4.0 took approximately five to six years after 2017, but the dates he gave span eight. The version numbers and dates should be checked against the eCommittee's own CIS release record before they are relied on anywhere in the model.
- [reported-practice] a version migration is done by taking a full backup of the server and running a script supplied by NIC; it takes two to six hours at a small location and twelve to twenty-four hours at a large one - Recorded because it sets the realistic outage window for any court during an upgrade, which matters for scheduling a rollout.
- [reported-practice] no High Court can change the CIS core; any High Court or district court in India that wants its own functionality must build it as a peripheral application, which can only read CIS data through an API (case type, case status, case number, party name) and cannot write anything back - This is an architectural and administrative constraint of the national e-Courts system, not a rule, and reported-practice is the honest status. The corpus goes only so far as to contemplate controlled access to the electronic data of an Action (r.12) and court-controlled storage (r.18); it says nothing about whether locally built software may write to the case record. The read-only limit is the single most important constraint on any portal that has to live alongside CIS.
- [reported-practice] a suggested change to CIS goes from the High Court to NIC Pune and moves only if the Supreme Court eCommittee approves it; a small change can be done in two to four days, otherwise it waits for the next version patch, into which suggestions from every High Court in India are bundled, and it can take years - The change route explains the peripheral-application pattern: local need cannot be met in the core on any usable timescale, so it is met beside it.
- [reported-practice] the High Court's technical wing has built three peripheral applications in-house, all in PHP - a Surety module (deployed at the High Court on a Postgres database), CCR or Crystal CIS Reports (deployed on each district's own server), and a third - The deployment split is deliberate and he confirmed it: the surety data is centralised at the High Court because it must be checked across courts, while the reporting tool sits on each district's own server because it can only read that district's local CIS data.
- [needs-check] the third peripheral application is a s.138 tool he named as '138 book software' - Recorded as needs-check, not as fact. The transcript is machine-generated and 'book' may be a mishearing.
- [corroborated] the Surety module records the person offering surety, including an Aadhaar number, and checks whether he is a repeat or habitual surety; a person who has already stood surety may stand again but must produce a different document each time - The module operationalises a duty that already exists. BNSS §486 requires every person standing surety to declare to the court how many persons he has stood surety for, with particulars, and §140 lets a Magistrate reject a surety who is unfit. R&O Volume III r.10.9(9A), added in 2007, is written against exactly this problem - abscondence of the accused because of a bogus surety or a surety bond furnished by a stock surety - and requires two recent passport photographs plus one identity document. Two limits should be noted: r.10.9(9A) by its own terms reaches NDPS cases, offences carrying more than ten years and special enactments, so it does not of its own force apply to a s.138 bail bond; and Aadhaar is not in its list of documents, which predates it, although clause 6 lets the Judge or Magistrate accept any document ordinarily issued by an authority after verification of identity and address, for reasons recorded.
- [reported-practice] the surety database is centralised at the High Court (version 1.0 held it on each district's local server, version 2.0 holds it on High Court servers reached over the network) and covers only the courts of Punjab, Haryana and Chandigarh, so a person who has stood surety in another state cannot be detected - A capacity limit with a direct bearing on bail in a s.138 case: the declaration BNSS §486 asks for is verifiable only inside one High Court's jurisdiction. He said the script and database have been shared on request with one or two other High Courts, but each runs it on its own server, so nothing is pooled. The custody arrangement is consistent with the principle in E-Filing Rules r.18 that court data sits on servers under the court's control.
- [corroborated] CCR was built because some CIS reports are not produced properly, and the Statement Clerk in each district court uses it to generate the monthly returns the High Court's branches require - cases registered, cases not registered and why, summonses issued, cases listed, cause lists, pendency by stage and transfers between courts - because the High Court cannot pull that data itself and wants soft copies - The periodical return is a real duty, and it reaches cheque cases. R&O Volume III r.2.6 directs a magistrate exercising summary powers to prepare a statement every month showing the summary cases received and the progress made in disposing of them, and NI Act §143 makes a s.138 complaint triable summarily, so a NACT case falls inside that monthly statement. R.11-A.15 refers to quarterly statistical returns and to the magistrate's records having to let the statistical writer make out his returns. What is not in any rule is the operational fact he reported: that the High Court receives these as soft copies generated district by district rather than querying the data itself.
- [reported-practice] video conferencing support, vendor and AMC meetings and virtual inaugurations fall to the technical team, and anything with an 'e' or a 'computer' in it is forwarded to it; his own split is roughly 60 per cent technical and 40 per cent non-technical - The rules put the technical responsibility for a video hearing on the Coordinators, not on an IT department: r.10 makes the Court Point Coordinator resolve remote users' problems, share the link and run a trial connection about thirty minutes before the hearing, and r.4 lists the equipment recommended at each end. What he describes is the layer behind that - the technical wing is where a Coordinator's problem escalates, and it absorbs whatever court staff cannot handle. That absorption is practice, not rule.
- [reported-practice] the technical cadre is almost entirely system administrators for servers, network and hardware, around 90 per cent purely infrastructure, and he was not certain whether anyone holds programming skills - A capacity observation recorded as reported, not as an assessment of anyone. He offered to check whether any official has programming knowledge, and said hiring programmers would be an administrative decision for the High Court, with the NIC scientists posted there able to advise. It sits in tension with the same wing having built three PHP applications, so the fair reading is that development capacity exists but is thin and is not part of the cadre's job description. Directly relevant to any hand-over plan.
- [reported-practice] the district courts sit on a Department of Justice WAN over a leased MPLS line with a private 172.18 address series, so every district court can reach every other, but spare addresses are scarce and some locations have none - He raised this unprompted as the first thing to verify before hosting a shared instance anywhere: check that the chosen location has one or two spare addresses, or the deployment will contend for the network. A practical constraint with no rule behind it.
- [needs-check] the three firsthand claims in HR-01 - that only the computer room can release an e-filed case into the filing branch's queue, that advocates leave non-mandatory fields blank so the assistants re-enter them, and that the branch keeps an emailed PDF copy on a desktop - are confirmed or explained by the High Court IT wing - Recorded so the gap is visible rather than assumed away. This interview did not touch e-filing, the e-Sewa Kendra or Designated Counters, NSTEP or process service, digitisation and scanning, or SMS delivery at all, so HR-01's three claims are neither confirmed nor contradicted. What it does add is the organisational fact underneath the first of them: every court location has its own technical establishment that owns the CIS server and its permissions, and that is a different office from the Administrator whom E-Filing Rules r.3.2 creates for e-filing matters.

**Changed:** created Peripheral application, created Surety module, created Stock surety, created Crystal CIS Reports, created Statement Clerk, created System Officer, created NJDG, created NIC, created eCommittee, created Mirror server, enhanced CIS, enhanced Computer room, created System Officer, created Statement Clerk, enhanced Computer room, enhanced 3 · CIS entry and numbering, enhanced 7 · Appearance, bail and dispensing with personal attendance, enhanced 14 · Informal digital and workaround practices

**Across states:** similar Haryana - Two ends of the same access bottleneck. The Panchkula filing assistants describe having to telephone 'the computer room' ten to fifteen times a day before an e-filed case can be released into their queue; this note supplies the establishment on the other end of that telephone - every court location has its own System Officer and System Assistant who own the CIS server and its permissions. They diverge on coverage rather than substance: the High Court IT wing was not asked about e-filing, the e-Sewa Kendra, NSTEP or scanning, so it neither confirms nor contradicts HR-01's release, blank-field and emailed-PDF claims, and the E-Filing Rules put e-filing matters with a different officer again, the Administrator appointed by the District and Sessions Judge under r.3.2.

**Across states:** diverges Haryana - The district end of the two systems this note describes from the High Court. On the surety module the accounts agree, and the criminal ahlmad of a Panchkula court is the person who actually keys the bail bond and the sureties in; he adds one thing the centre does not mention, that the module has no summons-to-surety form, so surety process goes out on a blank template. On reporting they diverge: this note has a Statement Clerk in each district producing the periodical statements through the in-house reporting tool, while the ahlmad rebuilds the High Court's action plan and statements himself in Excel because the system returns pendency without disposal and its output is not aligned with the format the High Court asks for.

**Across states:** similar Haryana - The judgment desk is where the CIS architecture is felt. Orders can be bulk-uploaded but only one selection at a time, there is no bulk download, and there is no conviction-register module - and this note explains why none of that is locally fixable, since the CIS core belongs to NIC and a High Court can only build read-only peripheral applications beside it. They diverge on visibility: the IT wing describes orders and judgments pushed each evening, while the judgment writer checks a pending-upload report and then certifies on paper, monthly, that everything went up.

### HR-02 - hr-ahlmad-2026-06 (Haryana)
Heard from Vinod (Criminal Ahlmad, Panchkula District Court, Haryana (Punjab & Haryana High Court)). firsthand.

> The criminal ahlmad of a Panchkula magistrate's court walked through the whole life of a s.138 ('NACT') file from the moment it leaves the filing window to the moment it is consigned to the record room. The filing branch gives the file a filing number and sends it up; the reader raises objections on it (court fee, condonation of delay) and those are argued out before the judge; once the objections are removed the ahlmad registers the case in CIS and the main case number issues. He enters the complainant, the advocate, the accused's several addresses - and, because the criminal template has no cheque-amount column, he types the cheque amount into the FIR field, which he calls 'our own innovation, which is wrong'. Process generation is his desk: the CIS process list carries a separate 'summons to accused in 138' template that prints differently from the ordinary summons, and a generated process stays watermarked 'Draft' until it is published. If the accused appears, bail bonds and sureties go into a module shared across Punjab and Haryana so that one person cannot quietly stand surety everywhere; there is no summons-to-surety form, so he sends surety process from a blank template. If the accused does not appear the ladder runs bailable warrant, non-bailable warrant, a request to the bank for the KYC address, fresh warrants at the new address, proclamation, and attachment of the property the complainant's advocate lists. Out-of-district process goes to the magistrate of that district and comes back on paper; nothing shows in CIS, so he estimates that for about ninety per cent of process sent outside there is no certainty of service until the person turns up. Out of state, the police travel, make an entry at the local police station and execute from there. Where summons have gone out two or three times without result, the judge sends the police, who are answerable to her. Evidence is written out by hand, which he says produces mixed hands and illegible stretches; after the prosecution evidence the case goes to '313', then defence, then judgment. On decision he binds the file, prints the 'Index for Decided File' proforma out of CIS and sends it to the record room; if a criminal miscellaneous matter comes out of a consigned file it becomes a fresh file with a new number. Registers are kept by printing the month's institution register from e-Courts and pasting it in. The heaviest burden he described is reporting: the High Court asks for twenty to thirty statements including an 'action plan' list of two hundred cases updated almost daily, and because CIS gives pendency but not disposal data he builds them himself in Excel with VLOOKUP and date formulas on an Ubuntu desktop - 'this is not anything formal, these are all our own innovations', and every ahlmad has his own. His asks were specific: make the service report upload itself into the file, put the person's name on the process addressed to the police, add a summons to surety, and align what CIS reports with what the High Court asks for. No rent-seeking, payment for a file, or delay-for-payment was described or alleged at any point in the interview.

**Verification:**
- [corroborated] the file reaches the ahlmad only after the filing branch has given it a filing number, and the main case registration and number are then done at his desk in CIS - Volume III r.2.6 requires that as soon as a summary case is received in Court it be entered in Register No. 1, and r.11-A.14 states that the registers of a magistrate's court are maintained by the ahlmad attached to it. The CIS registration number is the modern form of that entry; the filing number that precedes it is the filing branch's, as HR-01 describes.
- [corroborated] the ahlmad and the reader are two different officers of the same court - the reader raises objections and fixes the dates, the ahlmad registers, generates process and keeps the record - Volume III names the two offices separately: r.1-A.4(d) has talbana and stamped envelopes received by the Ahlmad or the Moharrir, while r.1-A.10 hands the peshi register to the reader of the court, who tells parties their fresh dates. The Haryana layer previously glossed the ahlmad as 'the court's record-keeper and reader'; this note corrects that - at Panchkula they are distinct desks.
- [corroborated] objections are raised on the file before registration - court fee, condonation of delay - and it is the judge, not the staff, who decides them - s.142(1)(b) of the NI Act gives one month from the cause of action, and its proviso lets the court take cognizance later on sufficient cause - so condonation is a judicial act, exactly as described. Volume III r.1-A.4(c) keeps the ministerial establishment out of receiving and disposing of petitions.
- [corroborated] a cheque case carries its own summons, different from the ordinary criminal summons - s.144 of the NI Act gives a cheque summons its own service regime (speed post or an approved courier), and BNSS §63(i) lets the High Court direct by rule who signs a summons - which is why the CIS process list carries a distinct 'summons to accused in 138' template rather than the generic one.
- [needs-check] the NACT summons sits at a particular numbered entry in the CIS process list
- [corroborated] bail bonds and sureties are entered in a CIS module shared across Punjab and Haryana, so that the same person cannot quietly stand surety in many cases - BNSS §486 requires every surety to declare before the court how many persons he has already stood surety for, and Volume III r.10.9 (para 9A) makes a surety file a photograph and an identity document precisely to defeat the bogus or 'stock' surety. The shared module is the software implementation of that statutory declaration.
- [reported-practice] CIS has no 'summons to surety' and no warrant against a surety, so the ahlmad sends surety process from a blank template - Half of this is a real gap and half is not. BNSS §491 does require the court to call on the person bound by a forfeited bond to pay the penalty or show cause, so a notice to the surety is a statutory step with no CIS form behind it - the blank-template workaround fills a genuine hole. But the Sanhita's remedy against a defaulting surety is forfeiture and recovery of the penalty, not arrest, so the missing 'warrant of arrest for surety' has no statutory counterpart to be missing.
- [corroborated] when the accused does not appear the ladder runs summons, bailable warrant, non-bailable warrant, then proclamation, then attachment of the property listed by the complainant's advocate - Code-switch to watch: Volume III r.15-A.1 and r.15-A.2 still speak in the 1898 numbering (ss.87 to 89) and r.1-Ci.2 in its s.90; the live provisions are BNSS §§84, 85 and 90 (CrPC 1973 §§82, 83 and 87). The rule text is otherwise intact, including the thirty-day minimum in the proclamation.
- [contradicted] attachment of the absconder's property is used to get the cheque amount paid - Attachment under BNSS §85 is a coercive measure to compel attendance, and Volume III r.15-A.1 calls it exactly that - the last remedy for compelling attendance. r.15-A.3 says the attached property remains at the disposal of Government and, if sold, the proceeds go back to the absconder if he appears within two years. It is not a recovery mechanism and the complainant is not paid out of it; the complainant's money comes from compensation out of a fine on conviction, or from a settlement. Recorded as a widely held but mistaken working assumption, not as a finding against the officer.
- [reported-practice] the court asks the bank for the accused's KYC address when warrants keep coming back unserved, and re-issues process to the new address - No rule in the corpus prescribes a 'KYC step'. It is a local sequencing habit resting on the court's ordinary power to call for a document under BNSS §94 and on the Bankers' Books Evidence Act, and it is a genuinely useful one - the address the complainant supplies is often the one on the cheque, and the bank holds a verified one.
- [reported-practice] the cheque amount is typed into the FIR field of the CIS record, because the criminal template has no cheque-amount column - The interviewee volunteers that this is 'our own innovation, which is wrong'. It is the same field HR-01 found the filing branch using for the police station: a s.138 case is a complaint offence with no FIR, so the FIR column in the shared criminal template is dead space and both desks in the same building have repurposed it for different data. That is a data-model defect worth fixing at source with a cheque-amount field, not a staff failing.
- [reported-practice] the evidence in the trial is written out by hand - Lawful but against the grain of the rule. BNSS §309 lets the memorandum be made from the magistrate's dictation in open court, so a written record is proper; but Volume III r.1-E.3(ii)(a) says depositions shall be recorded in typed format if possible and prepared on computers if available, and r.1-E.11 requires a legible record. The ahlmad's own complaint - mixed hands, illegible stretches, no symmetry in the file - is the harm r.1-E.11 was written against.
- [corroborated] after the prosecution evidence the case goes to '313' and then to defence evidence and judgment - A pure code-switch observation. Everyone on the ground still says '313'; since 1 July 2024 the provision is BNSS §351, which adds a proviso letting the court dispense with the examination in a summons case where personal attendance has been dispensed with - directly relevant to a cheque case run under BNSS §228.
- [reported-practice] on decision the file is bound, an 'Index for Decided File' proforma is generated from CIS, and the file goes down to the record room - The duty to complete the record before consigning it to the record room is in Volume III r.3.18; the index proforma itself is a CIS artefact. The record-room rules proper sit in Rules and Orders Volume IV and Volume VI-B, which are not in the corpus, so the retention and indexing requirements could not be checked here.
- [corroborated] a criminal miscellaneous (CRM) matter arising out of a decided and consigned NACT file is taken out as a fresh file with its own number - Volume III states the principle for transfer applications: they form a file separate from the record of the main case and are consigned to the record room separately. The CRM practice applies the same principle to any miscellaneous proceeding that outlives the main case; the numbering itself is a registry and CIS mechanic.
- [corroborated] a summons for another district is sent to the magistrate of that district, who has it served and returns it - BNSS §69 is exactly the described loop - the court sends the summons in duplicate to a magistrate in whose local jurisdiction the person is, to be served there - and §70 closes it with an affidavit of service and the endorsed duplicate returned to the issuing court.
- [reported-practice] there is no interconnectivity for out-of-district process, so in roughly ninety per cent of cases the court cannot be sure whether it was served - The tracking gap itself is real and is a software gap, not a legal one: BNSS §70 already provides a paper return, and the proviso to §64(1) now requires the police station or the court registrar to keep a service register with address, email and phone. Nothing surfaces either in the issuing court's CIS record, so the ahlmad learns of service only when the paper comes back or the accused turns up.
- [corroborated] for out-of-state process the police travel, make an entry at the local police station, and execute the process from that local jurisdiction - The 'entry at the local police station' is BNSS §81: a warrant taken beyond the issuing court's jurisdiction is endorsed by an Executive Magistrate or by an officer in charge of a police station there, and that endorsement is the authority to execute. §82 then requires the person arrested outside the district to be produced before the local Magistrate or Superintendent.
- [needs-check] in a NACT case summons are the prime responsibility of the Nazir branch
- [reported-practice] process servers bring the served summons back to the ahlmad, take his receiving, and he attaches them to each file by date entirely by hand - The manual attach is the local implementation of the statutory return in BNSS §70. His own ask is precise and worth quoting to any designer: if the service report uploaded itself, the page would already be in the file on the judge's desk on the day of service.
- [reported-practice] the cause list shows the stage of a case but not whether the process issued in it was executed - No rule requires the cause list to carry service status - the peshi register's job under r.1-A.10 is dates. But the proviso to BNSS §64(1) now requires a service register to be maintained, which is the natural place for the status the cause list does not show.
- [reported-practice] the court's registers are kept by printing the month's institution register out of e-Courts and pasting it into the physical register - The duty is formal and the ahlmad's: r.2.6 requires a summary case to be entered in Register No. 1 as soon as it is received in court and in the register of summary cases when the accused appears, and r.11-A.14 makes the ahlmad the keeper of the registers with a monthly inspection by the presiding officer. The paste-in is the informal method by which a paper register is now fed from the database. Note that r.11-A.14 is written for the First Information Report registers, which never arise in a NACT case - the same no-FIR point HR-01 recorded from the filing window.
- [corroborated] the High Court requires roughly twenty to thirty statements, including an 'action plan' list of two hundred cases that has to be kept updated almost daily - The reporting burden is not informal at all. r.1-A.12 makes every judicial officer send the High Court a monthly statement of criminal cases pending over one year in Proforma B before the 10th of the following month, r.1-A.13 adds history sheets for the six oldest, r.1-A.11 prescribes daily progress reports, and r.2.6 adds a monthly summary-case statement. The 'action plan' is the current administrative expression of that stack. The count of twenty to thirty separate statements is the officer's description of the present High Court format, which is an administrative circular and not in the corpus.
- [contradicted] the periodical statements the High Court requires are produced by a Statement Clerk through the CIS reporting tool - Not contradicted as law - the duty and the post are both real - but contradicted as a description of what happens on this desk. The High Court IT wing's account has a Statement Clerk in each district producing the periodical statements through the in-house reporting tool. The criminal ahlmad of a Panchkula court says he builds the High Court's action plan and statements himself, in his own Excel workbook, because what the system returns is not aligned with the format the High Court asks for and it gives pendency without disposal. Both can be true at once - a clerk files the standard returns while each ahlmad rebuilds the case-level lists by hand - and the gap between the two accounts is itself the finding: the centre believes the reporting is automated, the desk is doing it by formula.
- [reported-practice] the ahlmad builds those statements himself in Excel with VLOOKUP and date formulas, and each ahlmad has his own way of doing it - His own framing: 'this is not anything formal, but these are all our own innovations', and 'this is our each individual, each Ahlmad's own separate innovation'. It is the same shape of workaround HR-01 found at the filing window - a private, unversioned artefact standing between a statutory duty and a system that does not meet it. The spreadsheets run on an Ubuntu desktop and the staff have had no training in building them.
- [needs-check] CIS returns pendency data but not disposal data, so age-at-disposal has to be computed by hand
- [reported-practice] an ahlmad's CIS login can open the process-generation screen of any other court in the establishment - Recorded as a control observation, not as an integrity allegation. It matters because process generation is the act that puts the court's seal behind a coercive order.
- [corroborated] a generated process carries 'Draft' in large letters until it is published in CIS, and a draft version is not acceptable for use - Legally sound. A summons must be in writing signed by the presiding officer and bear the seal of the court, or be in electronic form bearing the image of the seal or a digital signature; a warrant must likewise be signed and sealed. An unpublished draft carries none of that, so it is not process at all - the watermark is doing real work.
- [reported-practice] the process CIS generates for police execution is addressed to the police but does not carry the name of the person to be produced - The officer flags it himself: 'this is also wrong, the person's name should appear here'. He is right. BNSS §77 requires the officer executing a warrant to notify its substance to the person to be arrested and to show him the warrant if asked, which is impossible if the process does not identify that person. A template defect with a direct legal consequence.
- [corroborated] s.138 is bailable, so anyone who appears will get bail - Correct. BNSS §478(1) makes release on bail mandatory for a person not accused of a non-bailable offence, and Volume III r.10.1 says for every bailable offence bail is a right and not a favour. The classification itself comes from Part II of the BNSS First Schedule (an offence under another law punishable with less than three years), which is not in the corpus.
- [contradicted] the one way an accused will not get bail is if he has no surety - The proviso to BNSS §478(1) says the court shall, if the person is indigent and unable to furnish surety, discharge him on his own bond instead of taking a bail bond, and the Explanation presumes indigence where he cannot give a bail bond within a week of arrest. So the absence of a surety is not a lawful ground for keeping a s.138 accused in custody. Recorded because it is the single point in this interview where the working assumption at the desk could cost a person his liberty.

**Changed:** enhanced Ahlmad, created Reader (court), created Process server, enhanced Nazir, created 4a · The ahlmad's desk: objections, registration and numbering, created 6a · Process generation, service and the coercive ladder, created 13a · Consignment, the record room and the miscellaneous file, created 13b · Registers, returns and the High Court action plan, enhanced 14 · Informal digital and workaround practices, enhanced Ahlmad, created Reader (court), created Process generation, created NACT summons, created Publishing (CIS), created Notice of accusation, enhanced Surety module, created Bank KYC verification, created Consignment, created Index for Decided File, created Criminal miscellaneous, created Institution register, created Action plan, created Goshwara

**Across states:** similar Haryana - The two halves of the same building and the same file. HR-01 ends where the peon carries the file out of the filing window; HR-02 begins when it lands on the ahlmad's desk upstairs. They converge exactly on the FIR field: the filing branch parks the police station in it, the ahlmad types the cheque amount into it, and neither has anything to do with a s.138 case, which has no FIR at all. They diverge on where the pain sits - the filing window's workarounds are about getting a file in (an emailed PDF, a laminated cheque, the computer room gating e-filings), while the ahlmad's are about getting data back out (Excel action plans, hand-attached service reports, a manual cause-list cross-check). Neither note reports any rent-seeking.

**Across states:** diverges Haryana - The same two systems seen from opposite ends. On the surety module the accounts agree: the High Court IT wing describes a central database that checks a proposed surety against every court in Punjab, Haryana and Chandigarh, and the ahlmad is the person who actually keys the bail bond and the sureties into it - he adds the gap the centre does not mention, that there is no summons-to-surety form, so surety process goes out on a blank template. On reporting they diverge sharply. The IT wing has a Statement Clerk in each district producing the periodical statements through the in-house reporting tool; the ahlmad says he rebuilds the High Court's action plan and statements himself in Excel, because the system returns pendency without disposal and its output is not aligned with the format the High Court asks for. The centre believes the reporting is automated; the desk is doing it by formula.

**Across states:** similar Haryana - Two paper registers, one workaround. The ahlmad prints the month's institution report out of e-Courts and pastes it into the institution register; the judgment writer copies conviction details into MS Word, prints, cuts and pastes them into the conviction register. They diverge on the source - the ahlmad's register is fed from the database, the conviction register is not held in CIS at all and is rebuilt by hand from the judgments, in a month-end batch. Both desks also feed the same monthly reporting stack.

### HR-04 - hr-judgment-writer-2026-06 (Haryana)
Heard from Karun (Judgment Writer (stenographer cadre), Panchkula district courts, Haryana (Punjab & Haryana High Court)). firsthand.

> A judgment writer at the Panchkula district courts described the last stage of a s.138 file: how the judgment is actually produced, signed, uploaded and handed over. He is a graduate, joined the service in 2018, has been about four and a half years at this court and has written judgments from his first day. He drew the line between his desk and the stenographer who sits outside the courtroom: the steno outside does the daily orders, he does the judgments. When the judge has pronounced a file it comes to him, usually the next day, and he reads the whole proceeding from beginning to end. He builds the document in order - the title, then a CIS login to lift the template, the CNR number, the registration and institution dates, then the cause title and the parties copied off the paper file, then the attendance of the advocates, which he takes from the previous daily orders and cross-checks against the power of attorney pinned at the back of the file, then the facts copied out of the complaint, then the proceedings - summons, notice of accusation, the plea of defence, the evidence - and finally the arguments and the conclusion, which the judge dictates. The dictation is taken in shorthand in the judge's chambers after the court has risen, and typed the next day. He handles two or three files a day; a simple one takes about an hour and a lengthy one with heavy cross-examination and many documents considerably longer, and a judgment runs to about fifteen pages. He does the applications too, and duty-magistrate work - police remands and bail applications - when the roster falls to his court, because the month is divided among the judges and the work of any court on leave is put up before the duty court. Accuracy is where his time goes. He hunts through the file for the summons date, the notice date, what evidence the complainant tendered and under which exhibit number, and the date on which evidence was closed; a wrong cheque number, a wrong address or a wrongly recorded advocate is, in his words, something you cannot do anything about once it is in the judgment. Asked what repeats between judgments, he said the conclusion, some standard sentences and two or three authorities in the observations repeat, and almost nothing else, because every cheque number, return memo and set of dates is different. On CIS he uploads judgments, pulls templates, and runs the reporting to see which of his orders are still pending upload; there is e-signing with a pen-drive token and orders can be uploaded in bulk, but each one still has to be selected individually and there is no bulk download. Asked twice whether any of his work was so repetitive that it could be taken off him, he first said no, and then named it precisely: typing the facts of the complaint, over and over, when the complaint has been on the file since the day it was filed. If it were digitised at scanning, he said, the judgment would come down to the arguments and the operative part, and perhaps the evidence too, since by the time the file reaches him the evidence is complete. An automatic summary of the documents would cut the time a great deal, but he would still cross-check it - he trusts software until it makes a mistake, and cannot trust it blindly. The documents worth digitising he listed as the complaint and, for their dates, the cheque, the return memo, the legal notice and the postal receipt. Two pieces of periodic work sit on his desk. Around the third of each month a signed paper certificate goes down to the main office for the previous month, saying that all the orders and judgments have been uploaded; it carries no case numbers, only the blanket statement. And he keeps the conviction register: when a conviction is passed the convict is entitled to a free copy of the judgment so that he can appeal, which is his right and not something he has to ask for, and he gets it the same day because he is physically present. He signs 'copy received' in the corner of the register, and on the left of that entry the whole record has to be reproduced - the case and registration number, the accused's name, the sentence, the compensation or fine. It used to be handwritten; it took so long that they now copy the data out of the judgment into MS Word, shorten it, print it, cut it and paste it into the physical register, and because daily entry is impossible they do a whole month in a day or two at the end of the month. The register is not on CIS. The registers on his desk are the judgment register and the conviction register.

**Verification:**
- [corroborated] the judgment writer is a distinct desk from the stenographer who takes the daily orders: the steno outside the courtroom does the daily orders, the judgment writer inside does the final judgments - The function is recognised, the title and the split are not. Volume III r.25-G.8 speaks directly of 'stenographers in typing from dictation evidence and judgments in all classes of cases' and tells them to duplicate the extra copies in advance, which is precisely this post. BNSS s.288(2) goes further for summary trials, the mode a cheque case is tried in: the High Court may authorise a magistrate to have the record or the judgment, or both, prepared by an officer appointed for the purpose by the Chief Judicial Magistrate, the magistrate then signing it. Volume III r.1-H.1(iii) and BNSS s.392(3) cover the same thing from the other side - where the judgment is not written by the presiding officer with his own hand, every page of it must be signed by him. What no instrument in the corpus creates is the title 'Judgment Writer' or the local allocation of daily orders to one stenographer and judgments to another. That part is establishment practice.
- [corroborated] the judge dictates the arguments and the conclusion, the writer takes it in shorthand, and the transcript is typed afterwards - BNSS s.392(2) describes exactly this mechanism: where the whole judgment is delivered, the presiding officer shall cause it to be taken down in short-hand, sign the transcript and every page of it as soon as it is made ready, and write on it the date of delivery in open court. Volume III r.25-G.8 assumes stenographers typing judgments from dictation, and r.1-E.5 assumes the presiding officer dictating the record. The shorthand-then-transcript route is the statutory one, not a workaround.
- [reported-practice] the dictation is taken in the judge's chambers after the court rises, reported as after about 4 pm, and typed the following day - Nothing in the corpus regulates the venue or hour of dictation. The only nearby rule is Volume III r.1-H.1(v), which bars magistrates from writing judgments at their houses during court hours; chambers after the rising of the court is not touched by it. The '4 pm' comes from the uploader's own English subtitle summary and is a reported time, not a rule.
- [needs-check] the file is pronounced first and the written judgment is prepared over the following day or two, with a further date fixed for the quantum of sentence - Recorded as a question, not as a finding. The interview does not settle whether the pronouncement is of the complete dictated judgment or of an operative order with the text to follow.
- [reported-practice] the judgment is assembled from CIS for the case metadata (template, CNR number, registration and institution dates) and from the paper file for everything else - No rule in the corpus prescribes a CIS template or a copy-and-paste route. What the rules do prescribe is why those fields have to be right. Since correction slip no.40 of 10 December 2021, Volume III r.1-H.1(i-a) requires every judgment to open with a preface naming the parties in FORM A, to carry a tabular statement of dates in FORM B, and to close with an appendix listing prosecution, defence and court witnesses, all exhibits and material objects in FORM C. BNSS s.393(1) requires the point or points for determination, the decision and the reasons, and on conviction the offence and the punishment. The forms are the reason the desk spends its day hunting for dates and exhibit numbers.
- [reported-practice] who represented whom is established from the previous daily orders and cross-checked against the power of attorney at the back of the file, page by page - The requirement it serves is real - the FORM A preface must name the parties correctly, and the interviewee treats a wrongly recorded advocate as a defect in the judgment. The method is not prescribed anywhere. It is also a data point about the record: the appearance of counsel lives only in the daily order sheet and in the power of attorney on the file, so it has to be read back off paper rather than queried. Volume III r.1-A.10 confirms the daily-proceedings and dates function sits with the reader of the court, a separate desk (see HR-02).
- [corroborated] the writer searches the file for the summons date, the date of the notice of accusation, the evidence tendered by the complainant and its exhibit numbers, and the date evidence was closed; an error in the cheque number or an address is treated as irreparable - This is the statutory shopping list, not a habit. BNSS s.286 fixes the particulars a summary record must carry - serial number, date of the offence, date of the complaint, complainant's name, the accused's name, parentage and residence, the plea, the finding, the sentence and the date the proceedings terminated. BNSS s.287 requires the substance of the evidence and a judgment with a brief statement of reasons where the accused does not plead guilty, and Volume III r.1-E.8 and r.2.3 say the same in the older numbering, keyed to CrPC s.263 and s.264. Volume III r.1-H.1(i-b) requires exhibits and material objects to be referred to by their number and not only by name, which is why 'Ex. C1, C2' has to be recovered exactly. BNSS s.274 is the notice-of-accusation step whose date he looks for.
- [reported-practice] typing the facts of the complaint again in every judgment is the single most repetitive task, and digitising the complaint at the scanning or filing stage would reduce the judgment to the arguments and the operative part, with the evidence a further candidate - The strongest design signal in the interview, and it is unprompted: asked twice whether any of his work was repetitive enough to be taken off him he first said no, then named this. His reasoning is that the complaint, unlike the evidence, is complete and on the file from day one, so nothing is lost by reusing it; and that by the time a file reaches him the evidence is complete too, so that could follow. The documents he named as worth digitising for their dates are the cheque, the return memo, the legal notice and the postal receipt.
- [reported-practice] an automatic summary of the documents and the evidence would save a great deal of time, but it would still be cross-checked and cannot be trusted blindly - His formulation is worth keeping as stated: he would trust it until it made a mistake, and after a mistake it would have to be cross-checked. It is a conditional, revocable trust, and it sets the acceptance bar for any summarisation feature - the saving is in the reading, not in the checking, and the checking does not go away.
- [reported-practice] two or three judgments a day, about an hour for a simple file and longer for one with lengthy cross-examination and many documents, and about fifteen pages to a judgment - Workload figures with no rule behind them. The page count and the file counts come from the machine transcript of the Hindi audio; the '2.5 hours' for a complex file appears only in the uploader's English subtitle summary and is not independently confirmed in the audio transcript. Treat all of them as reported, not measured.
- [reported-practice] the same desk carries duty-magistrate work - police remands and bail applications - because the month is divided among the judges and the work of a court on leave is put up before the duty court - The duty roster is court administration and no instrument in the corpus creates it. The work it brings is governed: Volume III r.11-B.9 requires the reasons for granting a remand to police custody to be recorded and a copy sent to the District Magistrate, and BNSS s.187 is the live provision for custody during investigation. Volume III's remand chapter still cites the CrPC 1898 numbering, so the pair is worth reading together. None of this work is s.138 work - it lands on the judgment writer's desk because of the roster, not the case type.
- [corroborated] applications under s.311 come to the same desk - s.311 of the CrPC 1973 is now BNSS s.348 - the power to summon a material witness or recall and re-examine a person already examined. Court staff still say '311', and the corpus should show both numbers so the older usage resolves.
- [needs-check] applications 'under 143' also come to the same desk - Recorded as unresolved. Nothing turns on it for the model, but a wrong section number in a vocabulary anchor would resolve to the wrong text.
- [reported-practice] almost nothing repeats between judgments except the conclusion, some standard sentences and two or three authorities in the observations; the cheque number, the return memo and the dates are different every time - A direct constraint on any templating or generation feature. His own comparison is with the daily-order stenographers, who he says change a few fields - the cheque number, the advocate's name, a standard bail amount - while the body stays the same. Judgments are not like that. The reusable part is the closing reasoning and the authorities; the rest is case-specific and is exactly the part where an error is unfixable.
- [reported-practice] CIS work at this desk is uploading the judgments, pulling templates and checking the reporting for orders still pending upload; e-signing runs off a pen-drive token, orders can be uploaded in bulk but each has to be selected individually, and there is no bulk download - The obligation behind the e-signature is real - Volume III r.1-H.1(ii) and (iii) and BNSS s.392(3) require the judgment to be dated and signed by the presiding officer, every page of it where it is not written in his own hand, and IT Act s.5 and s.6 give an electronic signature the same legal effect and authorise its use by the courts and government. The E-Filing Rules r.8 govern digital signatures on documents e-filed by parties and are a different thing from the presiding officer signing a judgment in CIS; the two should not be conflated. The bulk-upload and no-bulk-download behaviour is reported interface behaviour and should be confirmed against the CIS version in use.
- [reported-practice] around the third of each month a signed paper certificate goes down to the main office stating that for the previous month all orders and judgments have been uploaded; it carries no case numbers and no counts, only the blanket statement - Nothing in Volume III creates an uploading certificate; it belongs to the e-Courts era. Its rule-level ancestors are the periodical statements the same chapter requires - a monthly statement of criminal cases pending over a year in the prescribed proforma before the 10th of the following month (r.1-A.12), and a monthly statement of summary cases received and disposed of (r.2.6). Worth recording plainly as a capacity observation and not as an accusation: a monthly assurance with no case numbers on it cannot be checked from its own face, while CIS already holds the pending-upload list the writer runs for himself. This is a return that could be computed rather than certified.
- [corroborated] a convicted accused is entitled to a free copy of the judgment so that he can appeal, without having to ask for it, and receives it the same day because he is present for the pronouncement - Corroborated with two nuances worth holding. Volume III r.1-H.1(vi) requires that whenever an accused is sentenced to imprisonment a copy of the finding and sentence be given to him free of cost soon after the delivery of the judgment, and BNSS s.404(1) says the same for the judgment itself, immediately after pronouncement. First nuance: where a s.138 conviction ends in fine and compensation and no imprisonment, the automatic copy under s.404(1) is not engaged, and the free copy comes instead under s.404(2), which is expressed as being 'on the application of the accused' though free of cost in every case where the judgment is appealable. The Panchkula practice of handing it over on every conviction without an application is therefore more generous than the letter of s.404(2) and matches the spirit of r.1-H.1(vi). Second nuance: r.1-H.1(ii) itself allows the accused to be absent at pronouncement where his attendance has been dispensed with and the sentence is one of fine only, which is a common s.138 outcome, so the assumption that he is always physically present does not hold in every case. The copy matters because BNSS s.423 requires a petition of appeal to be accompanied by a copy of the judgment appealed against, and Volume III r.25-G.2 to r.25-G.4 work out the free supply in appeal and revision, including for summons cases where the accused is in jail.
- [needs-check] the court keeps a physical conviction register in which the convict signs 'copy received' and against which the case and registration number, the accused's name, the sentence and the compensation or fine are entered - The contents he described map onto what the sentencing rules require to be settled anyway - the sentence, and the fine or compensation, which Volume III r.19-B.1 requires to be proportionate to the offender's means. The register is real and firsthand; only its rule source is outside the corpus.
- [reported-practice] the conviction register was formerly handwritten and is now filled by copying the details out of the judgment into MS Word, shortening them, printing, cutting and pasting them into the physical register, done for a whole month in one or two days at month end because daily entry is not possible; the register is not on CIS - A self-started workaround, described without prompting as a time cost. Two things follow. It is the same shape of workaround the ahlmad's desk uses for the institution register (HR-02) - run the data, print it, paste it into the paper book - which makes print-and-paste the standard Panchkula answer to a paper register that a database already holds. And the batching matters: a register that records the handing over of a free copy on the day of conviction is being written up weeks later, so the paper acknowledgment and the paper entry are made at different times. Recorded as practice and as a capacity observation, not as an irregularity finding.
- [reported-practice] no rent-seeking, file-holding or other integrity problem was described at this desk - Recorded because the comparison matters. KL-01 reports files held for payment at the Kerala scrutiny stage; HR-01 and HR-03 report none in Haryana, and neither does this interview. The interviewee was not asked about integrity, so this is the absence of an allegation and not evidence that none exists.

**Changed:** created Judgment Writer, created Duty magistrate, enhanced Magistrate (JMFC), created 12a · Writing the judgment: dictation, transcript and upload, created 12b · The free copy and the conviction register, enhanced 12 · Judgment, sentence and compensation, enhanced 14 · Informal digital and workaround practices, created Judgment Writer, created Daily order, created Conviction register, created Free copy of the judgment, created Upload certificate, created Duty magistrate, created e-signing (CIS), enhanced CIS, enhanced Substance of the evidence, enhanced Reader (court)

**Across states:** similar Haryana - The same file at its two ends. The filing branch types the complaint into CIS on the day it is filed and has started emailing itself a PDF of the whole file; months later the judgment writer types the facts of that same complaint out again by hand, and names its digitisation as the single change that would save him the most time. They converge on the diagnosis - the paper is captured once and then re-keyed - and diverge on where the cost falls: at the window it is a data-quality problem (blank non-mandatory fields), at the judgment desk it is a pure duplication of effort.

**Across states:** similar Haryana - Print-and-paste is the standard Panchkula answer to a paper register. The ahlmad runs the month's institution report out of e-Courts, prints it and pastes it into the institution register; the judgment writer copies the conviction details out of the judgment into MS Word, prints, cuts and pastes them into the conviction register. They diverge on the source: the ahlmad's register is fed from the database, the judgment writer's is not on CIS at all and is rebuilt by hand from his own judgments, in a month-end batch. Both desks also feed the same monthly reporting stack from different sides.

**Across states:** similar Haryana - The architecture explains the interface. The judgment writer can bulk-upload orders but must select them one at a time, cannot bulk-download, and has no register module for convictions; the High Court IT wing explains why none of that can simply be fixed locally - the CIS core belongs to NIC and no High Court may change it, so local need is met by read-only peripheral applications or waits for a national patch. They diverge on visibility: the IT wing describes orders and judgments being pushed each evening, while the judgment writer describes checking a pending-upload report and then certifying on paper, monthly, that everything was uploaded.

**Across states:** diverges Kerala - Both notes concern a court officer whose title is functional rather than statutory, and whose day is shaped by work no rule describes. They diverge sharply on integrity: the Kerala note reports files held until the advocate pays, while nothing of that kind was described at the Panchkula judgment desk, where the reported friction is retyping and month-end register batching. The Kerala officer stands before cognizance, this one after judgment.

## Case law
- **Rangappa v. Sri Mohan** (2010) - The s.139 presumption extends to the existence of a legally enforceable debt or liability; it places a reverse onus on the accused, rebuttable on the preponderance of probabilities.
- **Kumar Exports v. Sharma Carpets** (2009) - Explains how the ss.118 and 139 presumptions operate and the evidentiary standard for rebutting them.
- **Basalingappa v. Mudibasappa** (2019) - Consolidated the principles on the s.139 presumption and the accused's 'probable defence' standard of rebuttal.
- **Bir Singh v. Mukesh Kumar** (2019) - A signed but blank/incomplete cheque voluntarily handed over still attracts the s.139 presumption, even if it was filled in by another person.
- **Kalamani Tex v. P. Balasubramanian** (2021) - Reaffirmed that the presumption is rebuttable only by a probable defence, not by bare denial.
- **Oriental Bank of Commerce v. Prabodh Kumar Tewari** (2022) - The s.139 presumption is rebuttable; the accused need only raise a probable defence on preponderance of probabilities.
- **Rajesh Jain v. Ajay Singh** (2023) - Restated in detail the burden-shifting sequence between complainant and accused under ss.118/139.
- **Sunil Todi v. State of Gujarat** (2021) - 'Debt or other liability' is read broadly; a cheque given for a liability that crystallises later can attract s.138.
- **Dashrathbhai Trikambhai Patel v. Hitesh Mahendrabhai Patel** (2022) - Part-payments made after issuance but before encashment must be endorsed (s.56); dishonour of the unendorsed cheque does not attract s.138 unless the sum is a legally enforceable debt at maturity.
- **Sampelly Satyanarayana Rao v. Indian Renewable Energy Development Agency** (2016) - Cheques issued towards future instalments/security can still represent a subsisting debt or liability for s.138.
- **K. Bhaskaran v. Sankaran Vaidhyan Balan** (1999) - Identified the five component acts making up the cause of action under s.138 (drawing, presentment, dishonour, notice, failure to pay).
- **C.C. Alavi Haji v. Palapetty Muhammed** (2007) - Deemed service of the s.138 demand notice under s.27 General Clauses Act — a notice returned 'unclaimed' is deemed served; the drawer may still avoid liability by paying within 15 days of receiving th
- **MSR Leathers v. S. Palaniappan** (2013) - A payee may present the cheque repeatedly and issue successive notices; a prosecution can be based on any subsequent dishonour.
- **Sadanandan Bhadran v. Madhavan Sunil Kumar** (1998) - Had held that only one cause of action arises per cheque.
- **Yogendra Pratap Singh v. Savitri Pandey** (2014) - No cognizance can be taken before the 15-day notice period expires; a complaint filed prematurely is not maintainable.
- **Gajanand Burange v. Laxmi Chand Goyal** (2022) - A complaint filed before expiry of the 15-day notice period is non-maintainable; a fresh complaint may be filed within the s.142(b) window with delay condoned for sufficient cause.
- **Dashrath Rupsingh Rathod v. State of Maharashtra** (2014) - Fixed territorial jurisdiction at the place where the drawee bank (on which the cheque was drawn) is located.
- **Bridgestone India Pvt Ltd v. Inderpal Singh** (2016) - Upheld the 2015 amendment; jurisdiction lies where the payee's/holder's bank branch is situated, and s.142A validates transfer of pending cases.
- **A.C. Narayanan v. State of Maharashtra** (2014) - A power-of-attorney holder can file the complaint and depose, provided he has personal knowledge of the transaction and is duly authorised.
- **TRL Krosaki Refractories Ltd v. SMS Asia Pvt Ltd** (2022) - A company's complaint may be filed and deposed to by an authorised employee; authorisation is presumed unless specifically disputed.
- **S.M.S. Pharmaceuticals Ltd v. Neeta Bhalla** (2005) - A complaint must specifically aver that the director was in charge of, and responsible to the company for, the conduct of its business at the relevant time.
- **National Small Industries Corp Ltd v. Harmeet Singh Paintal** (2010) - Reiterated the specific-averment requirement; the position of a managing director/signatory differs from that of an ordinary director.
- **Aneeta Hada v. Godfather Travels & Tours Pvt Ltd** (2012) - For vicarious liability under s.141 the company must be arraigned as an accused; a director cannot be convicted without the company being prosecuted.
- **Gunmala Sales Pvt Ltd v. Anu Mehta** (2015) - Laid down guidelines on when a High Court may quash s.141 proceedings against a director.
- **Sunita Palita v. Panchami Stone Quarry** (2022) - Non-executive and independent directors cannot be roped in without specific averments and material showing their role in the conduct of business.
- **S.P. Mani & Mohan Dairy v. Snehalatha Elangovan** (2022) - A partner's vicarious liability requires an averment/showing that the partner was in charge of and responsible for the firm's business at the relevant time.
- **Dilip Hariramani v. Bank of Baroda** (2022) - The firm/company must itself be prosecuted; a partner cannot be convicted merely as a signatory or guarantor without the firm being an accused.
- **Siby Thomas v. M/s Somany Ceramics Ltd** (2023) - A bare reproduction of the statutory words is not enough; the complaint must contain a clear averment of the accused's role in the conduct of business.
- **Mandvi Cooperative Bank Ltd v. Nimesh B. Thakore** (2010) - Explains the scope of s.145 (evidence on affidavit); the accused cannot insist on the complainant being examined-in-chief in court as of right.
- **Indian Bank Association v. Union of India** (2014) - Issued omnibus directions for speedy disposal of s.138 cases (form and service of summons, one-day evidence, use of technology).
- **Meters and Instruments Pvt Ltd v. Kanchan Mehta** (2018) - Treated the offence as primarily compensatory and suggested a court could close proceedings on payment even without the complainant's consent.
- **In re Expeditious Trial of Cases under Section 138 of NI Act, 1881** (2021) - Constitution Bench: clarified that s.258 CrPC closure is not available in s.138 complaint cases (disapproving Meters & Instruments on that point), addressed service of summons and a single inquiry for
- **Damodar S. Prabhu v. Sayed Babalal H** (2010) - Laid down graded-cost guidelines to encourage early compounding of s.138 offences, invoking Article 142.
- **JIK Industries Ltd v. Amarlal V. Jumani** (2012) - Compounding under s.147 read with s.320 CrPC ordinarily requires the consent of the complainant.
- **Raj Reddy Kallem v. State of Haryana** (2024) - The Supreme Court may quash a s.138 conviction on the accused compensating the complainant even without the complainant's consent, using Article 142 — distinguishing 'quashing' from statutory 'compoun
- **New Win Export v. A. Subramaniam** (2024) - Reiterated that dishonour is a regulatory offence and that courts should encourage compounding.
- **G.J. Raja v. Tejraj Surana** (2019) - Section 143A (interim compensation up to 20%) is prospective only and does not apply to offences committed before its insertion.
- **Surinder Singh Deswal v. Virender Gandhi** (2019) - Section 148 (deposit of minimum 20% to maintain an appeal) applies to appeals even where the cheque pre-dates the amendment; the appellate 'may' is ordinarily to be read as 'shall'.
- **Jamboo Bhandari v. M.P. State Industrial Development Corp Ltd** (2023) - The s.148 deposit is not automatic; the appellate court must apply its mind and record reasons, and may waive the deposit in appropriate/exceptional cases.
- **Kaushalya Devi Massand v. Roopkishore Khore** (2011) - The s.138 offence is quasi-criminal and primarily compensatory in character.
- **R. Vijayan v. Baby** (2012) - Compensation should ordinarily be awarded in s.138 cases, generally keyed to the cheque amount with interest and costs.
- **Suganthi Suresh Kumar v. Jagdeeshan** (2002) - Courts should not lightly reduce sentence or compensation below the norm in cheque-dishonour cases.
- **Sanjabij Tari v. State (and connected matters)** (2025) - Directs courts to consider the Probation of Offenders Act, 1958 in appropriate s.138 cases when sentencing.
