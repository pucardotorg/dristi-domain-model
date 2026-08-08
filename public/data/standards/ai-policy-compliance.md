<!--
  HOW THIS FILE IS WRITTEN - the policy compliance sub-tab parses it, so keep the shape.

    > line              the lede, shown under the page title (one or more lines).
    ## Name             one group of records, all resolving against one policy document.
                        Where a jurisdiction has a single document the group is named for
                        the jurisdiction; where it has more than one - as National now
                        does - the name says which document, because the group is really
                        (jurisdiction, document) and the reader has to be able to tell
                        them apart. Lines under it, before the first ###, are its gloss.
    **Document.**       the policy document every citation in this group resolves against -
                        an id from data/policy/policy.json. Written once, under the ##.
    ### Name            one compliance record. The heading names the obligation, and it is
                        also the record's id, so it must be unique in the WHOLE file and
                        not merely inside its group.
    plain paragraph     what it is: the obligation in one sentence. Required.

  Then two blocks of fields, and the difference between them is the whole point of this
  file. The first block is the DOCUMENT talking. The second is US talking. The page labels
  them so, and nothing may move between them:

    from the document
      **Binds.**          court | vendor | both.
      **Citation.**       the clause, as the document numbers it and in the document's own
                          stem: "reg_43_3" is regulation 43(3) of the AI regulations,
                          "rule_10_3" is rule 10.3 of the model e-filing rules. Several
                          separated by " · ". REQUIRED - a record that cannot cite a clause
                          is not a record, and the generator fails the build if the clause
                          is not an eId in that document's Akoma Ntoso. Each one links into
                          the Policy page, landing on that clause.
      **Timing.**         when and how often, in the document's own terms. Where the
                          document fixes no cadence, write "not stated" - never invent one.
                          Required.
      **Compliant when.** what has to happen for the obligation to be discharged.

    our recommendation - advice, not law
      **Artifact.**       what to build, in the vocabulary the Requirements layer uses for
                          binds.artifact: validation-rule | workflow-step | schema-field |
                          screen | output-document | access-control. Optional.
      **Build.**          the thing in a system that discharges it.
      **Automate.**       how it runs without a human remembering.
      **Test.**           how you would verify it is actually being discharged.

    **Note.**           a caveat about the obligation, the drafting, or what is missing
                        from the source. Optional, and it is ours.

  Markdown links, [text](url), are honoured in any of those. Nothing else is parsed.
  Add a document or a jurisdiction by adding a ##; add a record by adding a ###. No new
  code for either.
-->

# Policy compliance

> What a court and its technology vendor would have to do, and to build, to run the
> policy instruments this corpus holds. Each record states one operational obligation -
> something that has to be reported, communicated, disclosed, logged, registered,
> audited, or produced as a record - and cites the clause it comes from. Principles,
> definitions and institutional plumbing are left out unless they carry an operational
> duty; a rule nobody has to do anything about does not appear here.
>
> Read the split on every card. **The obligation, who it binds, the clause and the timing
> are the document's.** What to build, how to automate it and how to test it are **ours** -
> a reading of what a system would need, not something the issuing body has said.
>
> None of these documents binds anyone in this form. The AI regulations are a draft
> published for comment and commence only on a notification under regulation 1(2). The
> two eCommittee documents are models, drafted for a High Court to adopt: they bind a
> State only from the date that State's High Court notifies its own rules on them. What
> makes them worth holding is that the corpus already carries five such adoptions -
> Kerala, Gujarat and Punjab and Haryana - and reading a State's rule against the model
> it came from shows what that State chose to change.
>
> The structure holds more than one document and more than one jurisdiction. A High Court
> that issues its own AI policy, or its own e-filing rules, gets its own group, its own
> document, and its own records citing into it.

## National - AI in Courts, 2026

The Supreme Court's draft regulations bind every court in India, and through Chapter VI
they reach the vendor as well - almost always through the contract rather than directly.
That shape is worth noticing: of the obligations below, the court carries the great
majority, the vendor carries one on its own, and the rest are joint, which means a court
that writes a weak contract has no way to discharge them.

**Document.** ai-in-courts-2026

### GenAI content is disclosed and verified before it reaches the court

No content generated by generative AI may be filed or produced before a court unless its
origin is disclosed and it has been verified through the centralised mechanism the
Appropriate Authority designates.

**Binds.** both

**Citation.** reg_3_1_y · reg_44

**Timing.** Per document filed or produced. The document sets no date by which the
centralised verification mechanism has to exist.

**Compliant when.** A designated verification authority and mechanism exist, and every
filing carrying GenAI content reaches the record with an origin disclosure and a
verification result attached to it.

**Artifact.** validation-rule

**Build.** A verification gate in the filing pipeline: the e-filing form asks whether any
part of the document was generated, the answer is a field on the filing rather than a
sentence in a covering letter, and an unanswered filing does not pass scrutiny.

**Automate.** Make the disclosure a required field and route every positive answer to the
verification service automatically; hold the filing in a pending state until it returns,
and write both the answer and the result into the case record so no separate register has
to be kept in step.

**Test.** File a document declared as GenAI-assisted and confirm it cannot reach the
cause list without a verification result; file one with the question unanswered and
confirm scrutiny rejects it.

**Note.** This obligation is written inside a definition - the definition of Generative
Artificial Intelligence in regulation 3(1)(y) - and not in any operative chapter. A reader
working through Chapters III to VI would miss it entirely. Treat it as operative anyway;
it is phrased in the mandatory "shall not be filed".

### Documented lines of accountability for every AI system

The Appropriate Authority must establish and maintain clear, documented lines of
accountability for the operation of every AI system or tool in a court.

**Binds.** court

**Citation.** reg_8_2

**Timing.** Per system, from approval onwards. No review cadence is stated.

**Compliant when.** For every deployed system there is a written record naming the officer
accountable for its operation, and that record is current.

**Artifact.** schema-field

**Build.** An owner field on the AI Register entry for each system, holding the Designated
Officer, the approving authority and the date the responsibility passed to them, with the
history retained rather than overwritten.

**Automate.** Bind the field to the court's roster so a transfer or retirement flags the
system as unowned, and refuse to leave a live system without a named officer.

**Test.** Pick any system in production and ask who is accountable for it; the answer
should come from the register in one step, with the date it took effect.

### AI output is verified before it is used, and any dispensation is recorded

An AI-generated output used in a court is advisory only and reasonable care must be taken
to verify it; an officer may dispense with verification only for reasons recorded in
writing.

**Binds.** court

**Citation.** reg_8_3

**Timing.** Per use of an output. The written record is made at the time the officer
dispenses with verification.

**Compliant when.** Every use of an AI output is either verified, or covered by a recorded
reason, or falls in the class of administrative tools the AI Secretariat has certified as
reliable under the second proviso.

**Artifact.** workflow-step

**Build.** A verification step attached to the output itself - accept, amend or reject,
with a reasons box that opens when the officer chooses to skip it, and a certification
flag on the tool so a class-certified administrative tool does not ask at all.

**Automate.** Default to unverified and require the officer to act; carry the class
certification from the register so the prompt only appears where the regulation asks for
it, and file the recorded reasons into the case record where they can be read later.

**Test.** Use an adjudicatory tool and try to act on its output without verifying; the
system should require either a verification or a written reason, and the reason should be
retrievable afterwards against that case.

### Prior written approval before any AI system is used, with reasons recorded

An AI system may be used in a court process only with the prior written approval of the
Appropriate Authority, which must record its reasons for granting, refusing or restricting
the use.

**Binds.** both

**Citation.** reg_18 · reg_19_1 · reg_19_2 · reg_16_2

**Timing.** Before deployment, per system and per purpose.

**Compliant when.** No system is in use that is not covered by a written approval naming
its purpose, and every grant, refusal or restriction carries recorded reasons.

**Artifact.** workflow-step

**Build.** An approval workflow that ends in the AI Register entry: the proposal, the
impact assessment, the decision, the reasons and the conditions attached, all in one
record with the approval date.

**Automate.** Gate deployment on the approval: an unapproved system cannot be enabled in
the environment, and an approval that carries conditions surfaces them as tasks with
owners rather than as prose in an attachment.

**Test.** Try to enable a system with no approval record and confirm it cannot start;
open any approved system and confirm the reasons and conditions are readable from its
register entry.

### A fresh approval for any use beyond the approved purpose

Using an approved AI system for anything outside the purpose it was approved for needs a
separate, specific approval, with reasons recorded.

**Binds.** both

**Citation.** reg_11

**Timing.** Per new purpose, before that use begins.

**Compliant when.** Each system's approved purposes are stated in terms, and no use runs
outside them without its own approval.

**Artifact.** access-control

**Build.** Purpose scoping on the register entry - the approved purposes as an explicit
list, and the system's permissions in the case-management system derived from that list
rather than set by hand.

**Automate.** Derive the tool's available actions from its approved purposes, so a new use
is impossible until the register says it is allowed; log any attempt that falls outside
and route it as an approval request.

**Test.** Ask a translation tool approved only for judgments to translate a pleading; the
attempt should fail and appear as a request for approval, not as a completed job.

### Approval before personal data is used to train, test or refine a model

No personal data may be used to train, test or refine an AI system without the prior
approval of the Appropriate Authority and, where applicable, compliance with data
protection law.

**Binds.** both

**Citation.** reg_20_1_a

**Timing.** Before any training, testing or refinement run.

**Compliant when.** Every dataset used on a model is traceable to an approval, or contains
no personal data, and the approval predates the run.

**Artifact.** workflow-step

**Build.** A dataset record: provenance, whether it holds personal data, the anonymisation
applied, the approval reference and the runs it was used in.

**Automate.** Make the training pipeline refuse a dataset with no approval reference, and
have it write the dataset record and the run into the same place, so the register is a
by-product of training rather than a form somebody fills in later.

**Test.** Start a fine-tuning run against an unapproved dataset and confirm it will not
start; for any deployed model, ask which datasets trained it and expect an answer with
approval references.

**Note.** This sits in regulation 20, the list of absolute prohibitions, which regulation
20(2) and regulation 56 both say cannot be relaxed by anyone. Its practical effect is an
approval gate, which is why it is here rather than among the prohibitions.

### Every breach of a prohibition is reported to the AI Secretariat

Any violation of a prohibited use under regulation 20 must be reported forthwith to the AI
Secretariat, placed before the AI Committee, and answered with the remedial measures the
Committee directs, including suspending the system.

**Binds.** court

**Citation.** reg_21

**Timing.** Forthwith on the violation. The document sets no outer limit in days, and no
time for the Committee to decide.

**Compliant when.** Each detected violation has a report, a Committee consideration and a
recorded direction, and any suspension the Committee directs has actually taken effect.

**Artifact.** workflow-step

**Build.** A prohibited-use report that opens from wherever the breach is noticed, carries
the system, the case, the clause of regulation 20 in issue and the immediate action taken,
and tracks through to the Committee's direction.

**Automate.** Detect what can be detected - a risk-scoring call, a prohibited profiling
endpoint, an unexplainable model reaching a rights-affecting screen - and raise the report
from the system itself rather than waiting for a person to notice; wire the Committee's
suspension direction to the switch that actually disables the tool.

**Test.** Trigger a prohibited call in a test environment and confirm a report is raised
without human action; confirm that recording a suspension in the Committee's decision
disables the tool in the environment.

### The Apex Body's Annual Governance Report

The Apex Body must publish an Annual Governance Report on the state of AI in Indian
courts.

**Binds.** court

**Citation.** reg_23_h

**Timing.** Annual. No month is fixed and no publication channel is named.

**Compliant when.** A report exists for the year and is published.

**Artifact.** output-document

**Build.** A national report assembled from what the courts already have to file: the
Annual Transparency Reports under regulation 45, the AI Committees' annual reports under
regulation 33, the registers and the incident database.

**Automate.** Generate the report's factual half from those feeds on a fixed date, so the
Apex Body writes the judgment and commentary rather than collecting the numbers.

**Test.** Ask for last year's report and check that the systems, audits and incidents it
states reconcile with the registers and the incident database for the same period.

### A centralised record of AI tools and evaluations

The Centre of Research and Excellence must maintain a centralised record of AI tools,
evaluations and technical regulations, available to courts and public institutions.

**Binds.** court

**Citation.** reg_32_3_c

**Timing.** Continuous. No update cadence is stated.

**Compliant when.** The record exists, covers the tools and evaluations across
jurisdictions, and is reachable by a court that is choosing a tool.

**Artifact.** output-document

**Build.** A national catalogue keyed to the same tool identity the local AI Registers
use, holding evaluations, impact assessments and audit outcomes rather than links to them.

**Automate.** Feed it from the court registers on approval and on audit, so a High Court
does not have to remember to submit anything and a court considering a tool sees what
another court found.

**Test.** Take a tool approved in one High Court and confirm it appears in the national
catalogue with its assessment; take a tool with an adverse audit and confirm the outcome
travelled.

### The AI Committee reviews incidents and passes the learnings on

Each AI Committee must review reports of AI incidents, direct remedial measures, and
communicate what it learns to the Apex Body and to the other High Court AI Committees.

**Binds.** court

**Citation.** reg_33_3_e_i · reg_33_3_e

**Timing.** Per incident. The Committee meets at intervals of not more than three months
under regulation 33(5), which is the outer limit on when a review can happen.

**Compliant when.** Every incident on the database has a Committee review, a recorded
direction, and a record of what was communicated onward.

**Artifact.** workflow-step

**Build.** An incident review queue on the Committee's agenda, drawn from the incident
database, with the direction and the onward communication captured as fields on the
incident rather than in minutes.

**Automate.** Compose the agenda from unreviewed incidents automatically before each
meeting, and on a recorded direction, push the anonymised finding to the other courts'
databases as a linked entry.

**Test.** Record an incident and confirm it appears on the next agenda unprompted;
confirm the direction and the onward note are readable from the incident itself.

### The AI Committee's annual report on AI adoption

Each AI Committee must prepare an annual report on the state of AI adoption within its
jurisdiction, submit it to its Chief Justice, and share it with the Apex Body.

**Binds.** court

**Citation.** reg_33_3_e_ii

**Timing.** Annual.

**Compliant when.** The report exists for the year, has gone to the Chief Justice, and has
gone to the Apex Body.

**Artifact.** output-document

**Build.** A generated report over the jurisdiction's register, audits, incidents and
approvals, with a drafting layer for the Committee's own assessment.

**Automate.** Cut the factual sections on a fixed date each year and record both
submissions as events, so "was it shared with the Apex Body" is a fact in the system and
not a memory.

**Test.** Ask for the current year's report and its two submission dates; both should come
from the record.

**Note.** Regulation 45 asks every High Court for an Annual Transparency Report on
overlapping ground. The two are separate obligations with different addressees - this one
to the Chief Justice, that one to the Apex Body and the public website - and a build that
produces one and calls it the other has discharged neither.

### A register of tools cleared on the expedited pathway

The AI Secretariat may clear a low-risk administrative tool on an expedited basis, and
must maintain a register of every tool cleared that way.

**Binds.** court

**Citation.** reg_34_4 · reg_34_5 · reg_46_7 · reg_46_8

**Timing.** Per clearance. Regulation 46(7) fixes thirty days for the expedited decision;
regulation 34(4) states the same pathway with no time limit.

**Compliant when.** Every expedited clearance is in the register, states which of the
three conditions it met, and was decided within thirty days of the request.

**Artifact.** output-document

**Build.** The expedited pathway as a flagged route through the same approval workflow,
writing into the same register, with the three conditions as checkboxes that have to be
affirmed rather than free text.

**Automate.** Start the thirty-day clock on submission and escalate on expiry; refuse the
route where the tool touches personal data or an adjudicatory function, which are two of
the three conditions and are both machine-checkable against the register entry.

**Test.** Submit an expedited request for a tool that touches party data and confirm the
route is refused; confirm a cleared tool appears in the register with its conditions and
its decision date.

**Note.** The draft states this pathway twice, in regulation 34(4) and (5) and again in
regulation 46(7) and (8), in almost the same words. Only the second fixes thirty days, and
the first says "cleared" where the second says "approved". Read as one obligation here,
cited to both, on the assumption the duplication is a drafting artefact of the draft.

### A Technical and Ethical Impact Assessment before approval

The Appropriate Authority must require a comprehensive Technical and Ethical Impact
Assessment before approving any AI system, covering six stated heads.

**Binds.** both

**Citation.** reg_35_1 · reg_35_3 · reg_33_3_a

**Timing.** Before approval, per system. Regulation 3(1)(v) describes the assessment as
both pre- and post-deployment, but fixes no post-deployment cadence.

**Compliant when.** No approval exists without an assessment on file, and each assessment
addresses all six heads: purpose and architecture; training data; risks of bias, error,
hallucination and misuse; security and data protection; explainability and
human-in-the-loop; and redressal and incident reporting.

**Artifact.** output-document

**Build.** The assessment as a structured submission rather than a document upload, with
the six heads as sections that cannot be left empty, filed by the vendor and countersigned
by the Designated Officer.

**Automate.** Block the approval workflow on a complete assessment; carry its findings
into the register entry so the audit two years later reads against what was promised, not
against a fresh description.

**Test.** Attempt an approval with a five-section assessment and confirm it cannot
complete; open a register entry and confirm the assessment is readable from it.

### The standard format for the impact assessment, within six months

The Appropriate Authority must prescribe a standard format for the Technical and Ethical
Impact Assessment within six months of these regulations commencing.

**Binds.** court

**Citation.** reg_35_2

**Timing.** Once, within six months of the date of commencement.

**Compliant when.** The format is prescribed and published within six months, and the
assessments in use are on that format.

**Artifact.** output-document

**Build.** The format as the schema behind the assessment submission, versioned, so
"prescribed format" and "the form people fill in" are the same object.

**Automate.** Version the schema and stamp each assessment with the version it was filed
against, so a change of format does not silently invalidate what came before.

**Test.** Check the commencement date against the date the format was published; check
that assessments filed after that date carry the version stamp.

**Note.** The six months run from commencement, and commencement is itself a notification
under regulation 1(2) that may come at different dates for different provisions and
different courts. The deadline is therefore per court, not one national date.

### Controlled Environment Testing, documented, before deployment

Where the Appropriate Authority directs it, an AI system must be evaluated in a controlled
testing environment on documented parameters, and the outcome must be placed before that
authority before any decision to deploy or scale.

**Binds.** both

**Citation.** reg_36_1 · reg_36_2 · reg_36_3

**Timing.** Before full deployment, where directed. Time-limited, on a basis the authority
sets; no default period is stated.

**Compliant when.** The testing was isolated from live court systems, its parameters -
accuracy, reliability, fairness, explainability, security, compatibility - were documented
in advance, its outputs were used in no real case, and the result reached the authority
before the deployment decision.

**Artifact.** workflow-step

**Build.** A sandbox tenancy with its own data, and a test record holding the parameters,
the period, the results and the isolation attestation, attached to the approval.

**Automate.** Enforce isolation at the infrastructure boundary rather than by instruction,
and mark every artefact produced in the sandbox so it cannot be filed into a live case;
expire the tenancy on the end date.

**Test.** Try to write a sandbox output into a live case record and confirm it is refused;
confirm the deployment approval cannot complete before the test record is closed.

### The AI Register

Each court must maintain an AI Register recording every approved system, its purposes and
scope, its service provider and vendor, its approval date and conditions, its impact
assessments, its audits and their outcomes, and the incidents recorded against it.

**Binds.** court

**Citation.** reg_37

**Timing.** Continuous. The form and particulars are as the Appropriate Authority
prescribes.

**Compliant when.** Every deployed system has an entry carrying all seven particulars, and
the entry changes when the facts change.

**Artifact.** output-document

**Build.** One register per court, keyed by system, with the approval, the assessment, the
audits and the incidents linked rather than copied, so nothing has to be transcribed twice
and nothing goes stale in one place while being current in another.

**Automate.** Write to it from the workflows that already produce its content - approval,
assessment, audit, incident - and reconcile it nightly against what is actually deployed,
raising anything running that the register does not know about.

**Test.** Compare the register against the list of AI services running in the environment;
the two should match, and each entry should resolve to its assessment, its last audit and
its incidents.

### Publishing the AI Register

The AI Register is to be disseminated on the court's official website for public access,
subject to data protection, confidentiality and cyber security.

**Binds.** court

**Citation.** reg_37_2

**Timing.** Not stated. The document says the dissemination is subject to those three
constraints, and fixes no frequency.

**Compliant when.** A public view of the register is on the court's website, and what it
withholds is withheld for one of the three stated reasons rather than by default.

**Artifact.** screen

**Build.** A public view over the same register, with a per-field publication rule, so the
published version is a projection of the live record and not a separate document that
drifts.

**Automate.** Regenerate the public view whenever the register changes, and record for
each withheld field which of the three grounds justified it, so the withholding is
reviewable.

**Test.** Change a register entry and confirm the public page reflects it without a manual
step; confirm every withheld field states its ground.

### An annual technical, legal and ethical audit of every AI system

Every court AI system must be audited technically, legally and ethically at intervals not
exceeding one year, with the report going to the Appropriate Authority and into the AI
Register.

**Binds.** court

**Citation.** reg_38_1 · reg_38_3 · reg_9_1 · reg_9_2

**Timing.** At intervals not exceeding one year from approval or from the preceding audit,
or shorter if the Appropriate Authority directs.

**Compliant when.** No system is more than a year past its last audit, each audit covers
all three limbs, and each report is both submitted and recorded on the register entry.

**Artifact.** workflow-step

**Build.** An audit schedule derived from each system's approval date, with the audit
report as a record on the register rather than an attachment in an inbox.

**Automate.** Compute the next due date automatically, warn ahead of it, and flag a system
as overdue on the register the day it passes - regulation 9(2) makes audit findings decide
whether a system stays deployed, so overdue should be visible to the person who can
suspend it.

**Test.** Take any system and ask when its next audit is due; age a test system past a
year and confirm it shows as overdue in the register and to the AI Committee.

### Audits stay in-house, and the code and data never leave the court

Audits must be conducted in-house, and in no circumstances may source code, algorithms,
datasets or architectural information be shared with any third party or private entity for
an audit outside court premises.

**Binds.** both

**Citation.** reg_38_2

**Timing.** Per audit.

**Compliant when.** Every audit was run by court personnel on court premises, and no
audit-related export of code, models or data left the court's control.

**Artifact.** access-control

**Build.** An audit workspace inside the court's environment holding the escrowed source,
model artefacts and datasets, with access granted per audit and per person, and egress
closed.

**Automate.** Log every access and every attempted export, and make the escrow deposit a
condition in the contract workflow so the material is there before the audit is due rather
than requested when it starts.

**Test.** Attempt to export an artefact from the audit workspace and confirm it is blocked
and logged; confirm each audit names the court personnel who ran it.

**Note.** This is stricter than the usual practice of engaging an external auditor, and it
sits uneasily with regulation 46(4)(e), which gives the AI Secretariat the right to audit
the vendor's system and its underlying data. The two read together mean the Secretariat
audits the vendor, on the court's premises, with the vendor's material in escrow.

### The AI Incident Database

Every AI Secretariat must maintain an AI Incident Database recording all AI incidents -
their type, cause, manner of occurrence, consequences and the remedial measures taken -
and security vulnerabilities and data incidents go into the same place.

**Binds.** court

**Citation.** reg_39_1 · reg_48_7

**Timing.** Continuous, per incident.

**Compliant when.** Every incident, and every security vulnerability or data incident, is
recorded with all five particulars and its remedial measures, and the record is made when
the incident is handled rather than reconstructed later.

**Artifact.** output-document

**Build.** One incident record type covering both AI incidents and security incidents,
linked to the system on the register and to the case where a case was affected, with the
five particulars as fields.

**Automate.** Open the record from the detection path itself - a failure, an error rate
breach, a security alert - and close it only when the remedial measure is recorded, so an
open incident is visibly open.

**Test.** Cause a controlled failure and confirm an incident record appears with its cause
and consequence; confirm the record cannot be closed with the remedial measures empty.

### Incident learnings communicated to the other High Courts and the Apex Body

Where an AI incident is reported in a High Court, that court's AI Secretariat must
communicate the findings and learnings to the AI Secretariats of the other High Courts and
to the Apex Body, so corrective measures can be taken across jurisdictions.

**Binds.** court

**Citation.** reg_39_2

**Timing.** Per incident. No deadline is stated.

**Compliant when.** Each incident with a finding has an outward communication on record,
addressed to the other Secretariats and to the Apex Body.

**Artifact.** workflow-step

**Build.** A share step on the incident record producing a redacted finding - the system,
the failure mode, the cause, the fix - with the case and party detail stripped, and a
receipt from each destination.

**Automate.** Trigger the share when the remedial measure is recorded, redact by rule
rather than by hand, and show a court's inbound learnings against its own register so a
finding about a tool it also runs is visible where it matters.

**Test.** Close an incident in one jurisdiction and confirm the redacted finding appears
in another's inbound list, and that no party-identifying field survived the redaction.

### An immediate report of any malfunction, error or bias

Any malfunction, error or bias in a court AI tool with potential legal consequences must
be reported immediately to the AI Secretariat by the officer supervising the tool, and the
Secretariat must begin remedial measures without delay and report the matter to the AI
Committee.

**Binds.** court

**Citation.** reg_39_3 · reg_39_4

**Timing.** Immediately on noticing; remedial measures without delay. No fixed hours are
stated, unlike the twenty-four hours regulation 42(3) gives for a failure.

**Compliant when.** Reports are made at the time of noticing, each has a recorded first
remedial action, and each has reached the AI Committee.

**Artifact.** screen

**Build.** A report control on the surface where the output appears, so the supervising
officer reports from where they saw the problem, not from a separate portal.

**Automate.** Prefill the system, the case and the output; timestamp the report on
submission so "immediately" is measurable; route to the Secretariat and place it on the
Committee's queue in one action.

**Test.** Report a suspected error from a live screen and confirm the record carries the
output it came from, the time of noticing, and a Committee queue entry.

### Review of AI systems already in use, within a year

Systems already running when the regulations commence must be reviewed for compliance by
the AI Secretariat within one year, and the Appropriate Authority must decide what to do
about any that are non-compliant.

**Binds.** court

**Citation.** reg_41

**Timing.** Once, within one year of commencement.

**Compliant when.** Every pre-existing system has a compliance review inside the year and
a recorded decision where the review found it non-compliant.

**Artifact.** workflow-step

**Build.** A one-time inventory of what is already deployed, loaded into the register as
entries in a "legacy, under review" state, each with a review due date one year out.

**Automate.** Discover what is running from the environment rather than from memory - a
system nobody remembers is exactly the one this regulation is aimed at - and escalate any
entry still under review as the year closes.

**Test.** Count the systems in the environment against the legacy entries in the register;
after the year, confirm none remains in the review state without a recorded decision.

### The emergency and fall-back protocol, and its testing

Every High Court must establish and maintain an emergency and fall-back protocol for the
failure, malfunction or unavailability of an AI system, ensuring essential court processes
continue by manual or alternative means, and must test it periodically.

**Binds.** court

**Citation.** reg_42_1 · reg_42_2

**Timing.** Maintained continuously; tested at intervals the AI Secretariat determines.
The document fixes no interval itself.

**Compliant when.** A written protocol exists per system or per class of system, the
manual alternative is specified, and there is a record of it being tested.

**Artifact.** output-document

**Build.** A fall-back entry on each register record: what breaks, what the court does
instead, who declares the fall-back, and the last test date.

**Automate.** Make the fall-back a switch rather than a document - disabling the tool
should reveal the manual path in the same screen - and record each test as an event
against the entry.

**Test.** Disable a tool in a rehearsal and confirm the process continues on the stated
manual path; confirm the test is recorded against the system with a date.

### The AI Committee is notified within twenty-four hours of a failure

Where a court AI tool fails or is suspended, the AI Secretariat must activate the
fall-back protocol and notify the AI Committee within twenty-four hours.

**Binds.** court

**Citation.** reg_42_3

**Timing.** Within twenty-four hours of the failure or suspension.

**Compliant when.** Every failure or suspension has a notification to the Committee
timestamped within twenty-four hours, and a record that the fall-back was activated.

**Artifact.** workflow-step

**Build.** A notification tied to the same event that flips the system's state to failed or
suspended, so the clock starts from the state change and not from someone's note.

**Automate.** Send it automatically on the state change, count the hours from that
timestamp, and escalate to the Chairperson if it is unacknowledged as the twenty-four
hours run out.

**Test.** Mark a system as failed and confirm the Committee notification exists with its
timestamp; confirm the elapsed time is reportable per event.

### Parties are told when an AI tool materially assists

Where an AI tool materially assists in case management, document analysis or judicial
administration in a way that may affect the conduct of proceedings, the court must inform
the parties in a timely and accessible manner, in every permitted use of AI.

**Binds.** court

**Citation.** reg_43_1 · reg_43_2

**Timing.** Per case, timely. The document says "timely and accessible" without fixing a
point in the proceeding.

**Compliant when.** The parties in an affected case have been told, in language they can
read, which tool assisted and in what respect - and the telling is on the record.

**Artifact.** output-document

**Build.** An AI-assistance line on the case record, visible to the parties in the case
view and carried into the notice or order that follows, drawn from the tools actually used
on that case.

**Automate.** Log tool use against the case as it happens, and generate the disclosure from
that log rather than from an officer's recollection; where the case is in a state language,
generate the disclosure in that language.

**Test.** Run a case through a tool and confirm the disclosure appears in the party-facing
view without anyone writing it; confirm it names the tool and what it did.

**Note.** Regulation 43(2) extends this to all eleven permitted uses in regulation 19,
which include cause-list preparation and scheduling. Read literally, that is a disclosure
on nearly every case in the court, which is an argument for generating it rather than
drafting it.

### Declarations of AI assistance, from the party and from the court

Where a party or their representative used an AI tool to prepare or submit any document,
pleading or evidence, the AI-assisted character must be declared to the court at the time
of submission in the format at Annexure I, and any court-initiated AI use must be declared
in the format at Annexure II; the court may require disclosure of the system used, the
extent of the assistance and the verification steps taken.

**Binds.** both

**Citation.** reg_43_3 · reg_43_4 · reg_20_1_h

**Timing.** Per submission, at the time of submission. The court's own declaration is per
use.

**Compliant when.** Every filing carries a declaration where AI was used, every
court-initiated use carries its own, and the court can obtain the fuller disclosure on
demand without a fresh application.

**Artifact.** output-document

**Build.** The declaration as a structured part of the filing, not a scanned annexure: the
system, the extent of the assistance and the verification taken, stored as fields so the
court's power to require detail is answered from what was already collected.

**Automate.** Require the declaration before a filing can be submitted; carry the fields
into the case record; and generate the court-side declaration from the tool-use log the
transparency obligation above already produces.

**Test.** Submit a filing marked AI-assisted with the declaration incomplete and confirm it
is refused; ask the record which system assisted a given pleading and expect an answer.

**Note.** Annexure I and Annexure II are referred to here but are not printed in the
published draft. Anything built against those formats is being built against a form that
does not yet exist; treat the field list above as our reading of what they will ask for,
and expect to revise it.

### Disclosure of synthetic data

Anyone using synthetic data or synthetic information in a judicial proceeding must
disclose that use to the court, in the form the Appropriate Authority prescribes.

**Binds.** both

**Citation.** reg_43_5

**Timing.** Per use. The form is "as may be prescribed" and no prescription date is stated.

**Compliant when.** A form exists, and every proceeding in which synthetic material was
used carries the disclosure.

**Artifact.** schema-field

**Build.** A synthetic-data flag alongside the AI-assistance declaration, with the source
and the purpose of the synthetic material, since regulation 3(1)(zi) draws a line between
synthetic data and ordinary mathematical modelling that a filer will not draw unaided.

**Automate.** Ask the question on the same filing screen as the AI declaration, with the
definitional line explained in the question, and carry the answer into the case record.

**Test.** File material generated from a model and confirm the disclosure is captured and
readable on the case; confirm the question distinguishes synthetic data from ordinary
statistical modelling.

### The Annual Transparency Report

Every High Court, tribunal and commission must submit an Annual Transparency Report on AI
adoption in its jurisdiction to the Apex Body and publish it on its official website,
summarising the systems in use, audit outcomes, incidents recorded and compliance
measures.

**Binds.** court

**Citation.** reg_45

**Timing.** Annual. No month is fixed.

**Compliant when.** The report exists for the year, covers all four heads, has gone to the
Apex Body, and is on the website.

**Artifact.** output-document

**Build.** A generated report over the register, the audit records and the incident
database, with the publication as part of the same action as the submission.

**Automate.** Cut it on a fixed date; refuse to publish a report whose numbers do not
reconcile with the register; record the submission and the publication as separate events,
because the obligation has two limbs and a court can discharge one and miss the other.

**Test.** Fetch the published report from the website and reconcile its systems, audits and
incidents against the register for that period.

### Prior written approval and evaluation before a vendor is engaged

No private entity, vendor or third-party service provider may do anything in connection
with a court AI system without the prior written approval of the Appropriate Authority,
and every proposal must first go through a comprehensive evaluation of technical
capability, legal compliance, ethical standards, data security practices and financial
standing.

**Binds.** both

**Citation.** reg_46_1 · reg_46_2 · reg_46_3

**Timing.** Before the engagement begins, per engagement.

**Compliant when.** Every engaged vendor has a written approval preceded by an evaluation
recorded against all five heads, and procurement followed the procedure the Chief Justice
determines.

**Artifact.** workflow-step

**Build.** A vendor record holding the evaluation under the five heads, the approval, the
scope of the engagement and the systems it covers, linked from each register entry that
names that vendor.

**Automate.** Block a register entry from naming an unapproved vendor; expire the approval
with the contract, so a lapsed engagement cannot quietly continue.

**Test.** Try to attach an unapproved vendor to a system and confirm it is refused; open a
vendor and confirm its evaluation is readable under all five heads.

### The twelve clauses every AI contract must carry

Every agreement with a private entity for AI-related services must contain the twelve
mandatory provisions listed in regulation 46(4), from ownership of court data and audit
rights to indemnity, sovereign deployment and a bar on retraining models on court data
without the AI Committee's written approval.

**Binds.** both

**Citation.** reg_46_4

**Timing.** Per contract, before execution.

**Compliant when.** Each live contract contains all twelve, identified clause by clause,
rather than a general undertaking to comply with the regulations.

**Artifact.** output-document

**Build.** A contract checklist held against the vendor record, each of the twelve mapped
to the clause number in the executed agreement, with the executed copy attached.

**Automate.** Make the checklist a condition of vendor approval, and re-run it on any
amendment; where a clause is missing, the vendor cannot reach approved state.

**Test.** Pick a live contract and ask where clause (k), the bar on retraining on court
data, sits in it; the answer should be a clause reference from the record.

**Note.** Clause (k) is the one a builder will meet first in practice: a vendor whose model
improves on usage has to stop doing that on court data, or get the AI Committee's written
approval, and the difference has to be demonstrable rather than asserted.

### Continuous monitoring and periodic audit of vendor-supplied systems

Every AI system supplied, operated or maintained by a private entity is subject to
continuous monitoring and periodic audit by the AI Secretariat throughout the engagement.

**Binds.** both

**Citation.** reg_46_5 · reg_46_4_e

**Timing.** Continuous for the monitoring; the audits run on the regulation 38 cycle, so at
intervals not exceeding one year.

**Compliant when.** Vendor systems are monitored in production, the Secretariat's audit
right is exercised on schedule, and the vendor gives access to the system and its
underlying data when it is.

**Artifact.** workflow-step

**Build.** Monitoring on the vendor's system in the court's own observability stack -
availability, error rate, output volume, drift indicators - rather than on a dashboard the
vendor hosts and controls.

**Automate.** Alert on the monitored thresholds into the incident path above, so
degradation becomes an incident rather than a conversation; schedule the audit from the
vendor record.

**Test.** Degrade a vendor system in a rehearsal and confirm the court's own monitoring
notices, without relying on the vendor to say so.

### The vendor reports a breach or incident without delay

A private entity must report any data breach, security incident or AI incident involving a
system it provides or maintains to the Appropriate Authority without delay; failing to
report may suspend or terminate the engagement.

**Binds.** vendor

**Citation.** reg_46_6

**Timing.** Without delay, per incident. No fixed hours are stated.

**Compliant when.** Every vendor-side incident reached the Appropriate Authority, is on the
incident database, and the interval between the vendor knowing and the court knowing is
recorded.

**Artifact.** workflow-step

**Build.** A vendor-facing reporting channel that writes into the same incident database
the court uses, so a vendor report is an incident record and not an email.

**Automate.** Give the vendor an authenticated endpoint, timestamp the receipt, and
reconcile vendor reports against the court's own monitoring so a breach the court detected
first is visible as a failure to report.

**Test.** Have the vendor file a test report through the channel and confirm it lands as an
incident with a receipt time; compare a monitored degradation against the vendor's report
time for the same event.

**Note.** This is the only obligation in the draft that falls on the vendor alone. Every
other vendor duty reaches it through regulation 46(4), which is to say through the
contract - so the contract is where a court's compliance with the rest of Chapter VI
actually lives or dies.

### The court keeps ownership of tools built on court data

Where AI tools are developed using court data or court resources, the Appropriate
Authority must ensure the court retains ownership of, or a perpetual royalty-free licence
to, the tool and its outputs, and no private entity may claim exclusive intellectual
property rights over tools built primarily on judicial data or public resources.

**Binds.** both

**Citation.** reg_46_9

**Timing.** Per contract, and at every renewal or amendment.

**Compliant when.** Each tool built with court data has a recorded ownership or licence
position that satisfies the regulation, evidenced by a clause in the executed agreement.

**Artifact.** schema-field

**Build.** An ownership field on the register entry - owned, perpetual licence, or neither
- pointing at the clause that establishes it, and a flag on each dataset saying whether
court data went into the tool.

**Automate.** Derive the flag from the dataset records the training approval already
produces, so "was court data used" is answered by the pipeline and not by the vendor;
refuse an approval where court data was used and the ownership field is empty.

**Test.** Take a tool trained on court data and ask what the court owns; the answer should
name the clause. Take one where the field is empty and confirm approval is blocked.

### Written authorisation before sensitive judicial data leaves the court

Sensitive judicial data may not be transferred to any external system without the express
written authorisation of the Appropriate Authority, and every transfer must carry
technical and contractual safeguards against unauthorised access, disclosure, alteration
or misuse.

**Binds.** both

**Citation.** reg_48_1 · reg_48_2

**Timing.** Per transfer, before it happens.

**Compliant when.** No sensitive judicial data reaches a system outside the court's
control without a written authorisation on record, and each authorisation names the
safeguards.

**Artifact.** access-control

**Build.** An egress boundary with an allow-list keyed to authorisations: destination,
data classes, purpose, period and safeguards, with the authorisation reference required to
open the path.

**Automate.** Enforce it at the network and application boundary rather than by policy;
log every transfer with its authorisation reference; expire the path when the
authorisation does.

**Test.** Attempt a transfer to an unlisted destination and confirm it is blocked and
logged; take any authorised flow and produce its authorisation and its safeguards from the
log.

**Note.** Regulation 3(1)(x) defines an external system as anything not owned, managed or
directly controlled by the court, which includes a vendor's own cloud. Read with clause
46(4)(j), on-premise or sovereign deployment for sensitive judicial data, the practical
default is that this data does not leave.

### Anonymisation before data is used for training

Personal data must be anonymised, to the extent technically feasible without destroying
its usefulness, before it is used to train, test or refine an AI system, and a system that
achieves the objective on less personal data must be preferred to one that needs more.

**Binds.** both

**Citation.** reg_48_4 · reg_48_3

**Timing.** Per dataset, before the training run.

**Compliant when.** Each training dataset records the anonymisation applied, or states why
it was not technically feasible, and the choice between two candidate systems records the
data-minimisation comparison.

**Artifact.** workflow-step

**Build.** Anonymisation as a stage in the dataset record - the method, the fields treated,
the residual re-identification risk - sitting between the approval and the run.

**Automate.** Run the anonymisation in the pipeline and refuse a run against a dataset
whose anonymisation stage is empty and carries no recorded infeasibility reason.

**Test.** Sample an anonymised training set for names, addresses and identifiers of parties
and witnesses; run a re-identification attempt against a sample and record the result.

### An annual cyber security audit, reported and registered

Every AI system in use must undergo a cyber security audit at intervals not exceeding one
year, or shorter if the AI Secretariat determines, with the outcome reported to the
Appropriate Authority and recorded in the AI Register.

**Binds.** court

**Citation.** reg_48_5

**Timing.** At intervals not exceeding one year.

**Compliant when.** No system is more than a year past its last security audit, and each
outcome is both reported and on the register.

**Artifact.** workflow-step

**Build.** A security audit record on the register entry, separate from the regulation 38
audit, with its own due date, findings and remediation state.

**Automate.** Schedule from the last audit date; carry unremediated findings into the
register as open risks so the next approval decision sees them.

**Test.** Ask any system for its last security audit date and its open findings; both
should come from the register.

**Note.** This is a second annual audit, not the same one as regulation 38. A build that
runs one combined audit a year discharges regulation 38 or regulation 48(5), and it will
not be obvious which.

### Access protocols on least privilege, reviewed annually

The Appropriate Authority must establish and maintain protocols governing access to
personal data processed through or stored in AI systems, consistent with least privilege
and need-to-know, and must review those protocols annually.

**Binds.** court

**Citation.** reg_48_6

**Timing.** Maintained continuously; reviewed annually.

**Compliant when.** Access to personal data in AI systems is granted by role against a
stated need, the protocols are written, and there is a dated annual review.

**Artifact.** access-control

**Build.** Role-based access on the AI systems tied to the court's existing roles, with a
justification recorded per grant and an expiry on anything granted outside the standard
roles.

**Automate.** Generate the access review from the live grants rather than from the policy
document, expire stale grants automatically, and record the review as an event with the
reviewer and the date.

**Test.** List everyone who can read personal data through an AI system and the ground for
each; check the last review date and that it is inside a year.

### Training for everyone who uses an AI system

Every judge, advocate and member of court staff who uses or interacts with an AI system
must receive regular, structured training on its technical, legal and ethical dimensions,
accessible in the district courts and across languages, covering the five stated heads.

**Binds.** court

**Citation.** reg_49_1 · reg_49_2 · reg_49_3

**Timing.** Regular. The document does not state an interval, only that training must be
regular and reviewed every two years under regulation 51.

**Compliant when.** Everyone with access to a system has a training record covering the
five heads, and the training was available in the district courts and in the languages
those courts work in.

**Artifact.** access-control

**Build.** A training record per person tied to the systems they can use, holding the
course version, the date and the heads covered.

**Automate.** Tie access to the record: granting a person a tool creates a training
obligation, and a lapsed record narrows the access rather than sending a reminder nobody
reads.

**Test.** Take any user with access to an adjudicatory tool and produce their training
record and its date; confirm the district courts appear in the delivery record, not only
the principal bench.

### The training is reviewed every two years and calendared every year

The adequacy and effectiveness of the training must be reviewed at least once every two
years by the AI Committee with the AI Secretariat, and every High Court must devise an
annual training calendar with its judicial training institutions and the Apex Body.

**Binds.** court

**Citation.** reg_51_1 · reg_51_2

**Timing.** Review at least once every two years; the calendar every year.

**Compliant when.** There is a dated review inside the last two years with the changes it
led to, and a calendar for the current year.

**Artifact.** output-document

**Build.** The calendar as a schedule the training records are booked against, so
attendance, coverage and gaps are visible from the same object the review needs.

**Automate.** Produce the review's evidence - who was trained, on what, where the gaps are
- from the training records, and diarise the review two years from the last one.

**Test.** Ask for the current calendar and the last review date; check the review names
what changed as a result.

### The repository of best practices and lessons from incidents

The Appropriate Authority must maintain a living repository of best practices, case
studies, lessons drawn from AI incidents and guidance notes, regularly updated, curated
and available to all relevant courts and personnel.

**Binds.** court

**Citation.** reg_50

**Timing.** Continuous, "regularly updated". No interval is stated.

**Compliant when.** The repository exists, is current, and the lessons in it can be traced
back to the incidents they came from.

**Artifact.** output-document

**Build.** A guidance layer over the incident database: each entry linked to the incidents
that produced it, and surfaced against the systems it concerns rather than filed in a
library nobody visits.

**Automate.** Prompt for a lesson when an incident closes; show the relevant entries to a
court on the register page of the system they apply to.

**Test.** Take a closed incident with a systemic cause and confirm a repository entry
exists and is reachable from the system it concerns.

### A grievance about a prohibited use is heard and decided

A party harmed by a prohibited use of AI may apply to the court in which the system was
used, and that court must decide the application after a reasonable opportunity of being
heard.

**Binds.** court

**Citation.** reg_52_1 · reg_52_2

**Timing.** The application is made "at the earliest opportunity". No time is fixed for
disposal.

**Compliant when.** Applications of this kind are receivable, are put before the court that
used the system, and end in a recorded order after a hearing.

**Artifact.** workflow-step

**Build.** A grievance application type in the case-management system, listed against the
case and the system complained of, ending in an order.

**Automate.** Link the grievance to the register entry and the incident database, so a
pattern of complaints against one tool is visible to the AI Committee that can suspend it;
generate the hearing notice from the application.

**Test.** File a test grievance and confirm it lists, hears and disposes as an order; check
the grievance count per system is visible to the Committee.

**Note.** Regulation 52(2) lets a High Court lay down principles, procedures and formats
for these grievances, and says they must be accessible to people with limited legal
literacy. That is permissive, not mandatory, so it is not a record here - but it is where
a state layer would attach its own compliances once a High Court exercises it.

### Modifications are communicated to the Apex Body within two weeks

Any modification to these regulations must be communicated to the Apex Body within two
weeks of being made.

**Binds.** court

**Citation.** reg_56_2 · reg_33_3_d

**Timing.** Within two weeks of the modification.

**Compliant when.** Each relaxation or modification the Chief Justice makes under
regulation 56 has a communication to the Apex Body dated within two weeks of it.

**Artifact.** workflow-step

**Build.** A local-variation record: what was relaxed or modified, the reasons recorded in
writing that regulation 56 requires, the date, and the communication to the Apex Body.

**Automate.** Start the fourteen-day clock when the variation is recorded and escalate on
expiry; carry the variation onto the register entries it affects, so a court's local
position is readable where the systems are.

**Test.** Record a modification and confirm the communication is dated within two weeks;
open an affected system and confirm the local variation shows against it.

**Note.** Regulation 56 also puts the prohibitions in regulation 20 beyond relaxation. A
variation record should refuse to accept one that touches regulation 20 at all.

### High Courts feed data and case studies back for review

Every High Court must share data, feedback, case studies and recommendations for
improvement with the Supreme Court AI Committee on an ongoing basis, so the regulations
can be reviewed periodically.

**Binds.** court

**Citation.** reg_57_1 · reg_57_2

**Timing.** Ongoing. No cadence is stated for the sharing, and the review happens
periodically or when significant developments require it.

**Compliant when.** There is a live channel carrying data, feedback and case studies from
the High Court to the Supreme Court AI Committee, and it is being used.

**Artifact.** output-document

**Build.** A feedback record alongside the annual reports, holding the recommendations and
the experience that supports them, so the periodic review reads evidence rather than
opinion.

**Automate.** Draw the data half from the registers, audits and incident database on a
regular cut, leaving the court to add only its recommendations.

**Test.** Ask when this court last shared anything with the Supreme Court AI Committee and
what it contained; both should come from the record.

## National - Model Rules for e-Filing

The e-Committee's model e-filing rules are the source three instruments already in this
corpus adapted. Punjab and Haryana adopted them almost word for word as Volume V,
Chapter 1, Part J of the Rules and Orders; Gujarat adopted them as the 2024 SOP for its
district judiciary, keeping even the model's grammatical slips; Kerala rewrote them into
seventeen rules in 2021 and, in doing so, quietly dropped some of what the model asked
for. Reading a State's rule against the model is how you see that choice. The obligations
below are the model's own, so they bind a court only where its High Court has notified
rules on this model - but a system built for a s.138 filing has to satisfy whichever
version of them the State enacted, and they are nearly always this text.

**Document.** model-rules-efiling-2020

### A registration decision by the next working day

An application to register as an e-filing user, whether from an advocate or a litigant in
person, must be decided and a login ID allotted on the next working day if the application
is complete in all respects.

**Binds.** court

**Citation.** rule_4_3 · rule_4_1

**Timing.** Next working day after a complete application.

**Compliant when.** Every registration application carries the date it was received and
the date it was decided, and a complete application is not sitting undecided beyond the
next working day.

**Artifact.** workflow-step

**Build.** A registration queue that records receipt and decision separately, with
completeness as an explicit check against the documents rule 4.1 lists - the Bar Council
certificate or card for an advocate, a government identity document for a litigant in
person - so "complete in all respects" is a state the system can hold rather than a
judgement in someone's head.

**Automate.** Timestamp receipt on submission, compute the next working day from the
Court's own calendar rather than from a fixed weekday rule, and age the queue against it so
an overdue application is visible before it is late rather than after.

**Test.** Submit a complete registration on a Friday before a gazetted holiday and confirm
the due date is the following working day; submit one missing the identity document and
confirm it is held as incomplete rather than counted against the deadline.

**Note.** The model gives no deadline for an incomplete application and no duty to tell the
applicant what is missing - only rule 18.3's objection route, which is written for filings
and not for registrations. A litigant in person whose identity document is rejected has no
stated path back.

### The filing number is notified as soon as the filing is accepted

Once an e-filing is accepted, the filing or registration number must be notified to the
advocate or the litigant in person.

**Binds.** court

**Citation.** rule_8_3

**Timing.** On acceptance. No interval is stated.

**Compliant when.** Every accepted filing has an outbound notification on record carrying
the number, addressed to the filer.

**Artifact.** output-document

**Build.** An acknowledgement generated by acceptance itself and not by a clerk, carrying
the filing number, the date and time the filing was received under rule 14.1, and the case
it attached to.

**Automate.** Emit it on the acceptance transition, over the channels rule 18.3 already
names for objections, and keep the sent copy on the case record so the litigant and the
registry are looking at the same document.

**Test.** Accept a filing and confirm the acknowledgement reaches the filer with the number
and the rule 14.1 timestamp; confirm no accepted filing exists without one.

**Note.** The rule says "notified" without naming a channel, where rule 18.3 names
email, SMS and web hosting for objections. Reading the two together is the sensible course;
the model does not join them.

### A hash value for every audio or video file filed

Where an e-filing includes audio or video files, the Administrator must generate a hash
value.

**Binds.** court

**Citation.** rule_8_4 · rule_2_2

**Timing.** Per filing that carries an audio or video file.

**Compliant when.** Every audio or video file on the record has a hash value stored against
it, generated when the file was filed, and the value can be recomputed from the stored file.

**Artifact.** schema-field

**Build.** A hash on the file record rather than in a separate register: the algorithm, the
value and the time it was computed, written when the upload completes.

**Automate.** Compute it in the ingest path, not on request, so there is no window in which
an audio file sits on the record unhashed; re-verify on every retrieval and flag a mismatch
to the Administrator rather than to the reader.

**Test.** File an audio exhibit and confirm a hash is stored; alter the stored file and
confirm the next retrieval reports a mismatch rather than serving it silently.

**Note.** The model names the Administrator - the Registrar (IT) or an officer appointed by
the Chief Justice under rule 2.2 - as the person who generates the hash, which is a human
duty written for a machine step. It fixes no algorithm, so two courts can both comply and
produce values neither can check against the other.

### The Registry's e-mail addresses are published on the Court website

Electronic service is made from designated e-mail IDs of Registry officials, and those IDs
must be published on the Court website so a recipient can verify the source of what they
were sent.

**Binds.** court

**Citation.** rule_13

**Timing.** Standing. No review cadence is stated.

**Compliant when.** A published list of Registry sending addresses exists on the Court
website, it is current, and every electronic service went out from an address on it.

**Artifact.** access-control

**Build.** One list of designated sending addresses, held as data rather than as a page
someone edits, with the website reading from it and the mail path restricted to it.

**Automate.** Refuse to send service mail from an address not on the list, and regenerate
the published page from the same list, so the page cannot fall behind what the system
actually sends from.

**Test.** Try to serve from an unlisted address and confirm it is refused; compare the
published page against the sending list and confirm they cannot differ.

**Note.** This is the model's only answer to phishing, and it is a weak one: publishing the
addresses helps a recipient who checks, and nothing stops a forged sender. Rule 19's
"General Caution" concedes as much - email is not a secure medium - without providing an
alternative.

### The filing timestamp is the record limitation runs from

The date of e-filing is the date the Action is electronically received in the Registry
within the prescribed time on a working day, computed in Indian Standard Time; a filing
after the cut-off hour, or on a holiday or a day the court is closed, is treated as filed
on the next working day; and limitation runs from that date exactly as it does for a
physical filing.

**Binds.** court

**Citation.** rule_14_1 · rule_14_2 · rule_14_4

**Timing.** Per filing, at the moment of receipt.

**Compliant when.** Every filing carries a received-at timestamp in IST and a computed
filing date, the two are stored separately, and the filing date follows the cut-off and
court-calendar rules without anyone applying them by hand.

**Artifact.** schema-field

**Build.** Two fields, not one: the instant of receipt, and the filing date the rules
derive from it. A s.138 complaint filed at the edge of the month's limitation under
section 142(1)(b) of the Negotiable Instruments Act turns on exactly this derivation, so it
has to be reproducible and visible to the party, not buried in a log.

**Automate.** Stamp receipt server-side in IST, never from the client clock; derive the
filing date from the court's own working calendar; and show the party both values on the
acknowledgement so a disagreement surfaces at filing rather than at the limitation hearing.

**Test.** File at one minute past the cut-off hour and confirm the filing date rolls to the
next working day while the receipt instant stays; file on a gazetted holiday and confirm
the same; change the client clock and confirm nothing moves.

**Note.** The model leaves the cut-off hour blank - it prints "after xxxxxx hours" in rule
14.2 - so the hour is a State's choice and a system must hold it as configuration rather
than as a constant. Rule 14.2 also fixes 1600 hours for Designated Counters while leaving
the on-line hour open, which is the one number in the rule that is not a blank.

### The portal runs around the clock, and its failure excuses nothing

The on-line e-filing facility must be available during all twenty four hours of each day,
subject to breakdown, server downtime, system maintenance or such other exigencies; where
it is not, the party must be able to fall back to a Designated Counter or to physical
filing, and no exemption from limitation is permitted on the ground that the facility
failed.

**Binds.** both

**Citation.** rule_14_3 · rule_3_3

**Timing.** Continuous.

**Compliant when.** Availability is measured rather than asserted, every outage is on
record with its start and end, and a Designated Counter route is open and staffed on court
working days.

**Artifact.** workflow-step

**Build.** An availability record the court owns rather than the vendor reports:
uptime measured from outside the system, each outage with its window and cause, and the
counter hours published alongside so the fallback is a fact and not a promise.

**Automate.** Monitor from outside the data centre, open an outage record automatically,
and put the current state and the counter hours on the filing screen itself, so a party who
cannot file at 2 a.m. knows within one screen whether the fault is theirs.

**Test.** Take the portal down and confirm an outage record opens without anyone writing
it, and that the filing screen tells a party where else to go.

**Note.** This is the harshest rule in the document and the one a vendor contract has to
carry. Limitation is not relieved for a portal failure, so an outage on the last day of the
month under section 142(1)(b) of the Negotiable Instruments Act falls entirely on the
complainant. The model asks for twenty-four hour availability and sets no target, no
measurement and no consequence, which leaves the whole risk with the litigant.

### Storage on an exclusive server, encrypted, restricted and mirrored

E-filings must be stored on an exclusive server under the control and directions of the
Court; each filing separately labelled and encrypted for identification and retrieval; the
security of the filings ensured and access to them restricted; and for continuity of
operations in a disaster, natural calamity or breakdown, a mirror image maintained at
different geographical locations.

**Binds.** both

**Citation.** rule_17 · rule_11

**Timing.** Standing. No audit cadence is stated.

**Compliant when.** The filing store is the Court's own and identified as such, each
filing is encrypted at rest under its own label, access is granted by role rather than by
account, and a geographically separate copy exists and has been restored from at least
once.

**Artifact.** access-control

**Build.** Per-filing encryption with the labels the rule asks for, an access model that
starts closed and opens to the parties and authorised officers under rule 11, and a
recovery site in a different seismic and power region rather than a second rack.

**Automate.** Replicate continuously, prove the copy by restoring from it on a schedule and
recording the result, and log every access to a filing against the person and the reason,
so "access would be restricted" is something a court can show rather than assert.

**Test.** Ask which server the filings are on and who can read one; take the primary site
away and file and retrieve from the mirror; confirm the restore test has a dated result and
not a plan.

**Note.** This is the clearest place to see what a State changed. Punjab and Haryana and
Gujarat both took rule 17 over word for word, mirror image and all - Gujarat kept even the
model's "for facilitate easy identification". Kerala rewrote it as rule 15 of the
Electronic Filing Rules, 2021 in four numbered sub-rules and replaced the geographically
separate mirror with "a backup copy of all Actions preserved in the manner as decided by
the High Court from time to time", which is a weaker duty and a different one: a backup is
not a continuity site.

### Objections are communicated, and so is their clearance

The Registry must communicate objections on a filed case to the advocate or litigant in
person by email, SMS or web hosting; and after the objections are cleared, the case is
processed for listing and the filer is informed, including by email and SMS.

**Binds.** court

**Citation.** rule_18_3 · rule_2_10

**Timing.** Per objection, and again on clearance. No interval is stated for either.

**Compliant when.** Every objection raised on a filing has an outbound communication on
record naming what is deficient, and every clearance has a second one; neither is
reconstructed from a scrutiny register afterwards.

**Artifact.** workflow-step

**Build.** Objections as records on the filing rather than as free text in a remark field:
one row per deficiency, each with the rule it fails and its state, so the communication is
generated from the objection and cannot say something different from the register.

**Automate.** Send on raising and on clearing, over all three channels the rule names, and
hold the filing in an objected state that cannot become listed until every objection on it
is cleared.

**Test.** Raise two objections, clear one, and confirm the case cannot reach the cause list
and that the filer has received exactly two messages so far.

**Note.** No time limit is stated at either end - neither for raising the objection nor for
clearing it - which is where filing delay actually accumulates. Rule 2.10 defines
Objections as deficiencies and errors "pointed out by the Registry", so the definition
carries the duty and the operative rule carries only the channel.

### A filing that breaks the protocol is rejected

An e-filing that does not follow the protocol mandated by the Rules or by practice
directions will be rejected.

**Binds.** court

**Citation.** rule_18_1 · rule_8_7 · rule_8_6

**Timing.** Per filing, at scrutiny.

**Compliant when.** Each rejection names the rule it failed, and the checks the rules state
mechanically - watermarking, encryption, malware, track changes, the disallowed characters
and the forty-five character limit on a file name - are applied by the system rather than
by a reader.

**Artifact.** validation-rule

**Build.** The mechanical checks at upload, each returning the rule number it enforces, so
a filer is told "rule 8.6, the file name contains a colon" and not "invalid file".

**Automate.** Run them before the filing is accepted rather than at scrutiny, since a
rejection after acceptance costs the filer a day of limitation the portal already stamped
under rule 14.1.

**Test.** Upload a document with track changes, an encrypted PDF, and a file named with a
colon, and confirm three distinct messages each citing its own clause.

**Note.** Rejection is the only consequence the model provides, and it is harsher than it
looks: a rejected filing is not a filing, and rule 14.4 runs limitation from the date
e-filing "is made as per the procedure prescribed in these Rules". A filer rejected on the
last day of limitation for a file-name character has lost the case, which is why these
checks belong at upload.

### The electronic record is open to the parties without charge

Access free of cost must be available to authorised persons to the data e-filed by any
party to that Action, in addition to and not instead of the procedure for obtaining
certified copies.

**Binds.** court

**Citation.** rule_11 · rule_16

**Timing.** Standing, for the life of the Action.

**Compliant when.** A party or their advocate can read everything filed in their own case
without paying and without applying, and the certified-copy route is still there for anyone
who needs an authenticated copy.

**Artifact.** access-control

**Build.** Case-scoped access driven by the parties on the record, so authorisation follows
the vakalatnama rather than a separate grant, and the free view is plainly distinguished
from a certified copy on the screen itself.

**Automate.** Grant and revoke with the appearance record - a counsel who withdraws loses
access the same day - and log reads so an access that should not have happened can be
found.

**Test.** As the accused in a s.138 complaint, open the complainant's filed documents
without paying; as a stranger, confirm the same URL refuses.

**Note.** The rule does not say who an "authorised person" is, and the phrase "as is
presently being provided in pending Actions" refers a reader to a practice rather than to a
rule. Rule 16 lets advocates and parties print their own hard copies, which is the only
other place the model says what a party may do with the record.

## National - Model Rules for Video Conferencing

The e-Committee's model video conferencing rules are the source two instruments already in
this corpus adapted. Punjab and Haryana adopted them chapter for chapter as Volume V,
Chapter 1, Part H of the Rules and Orders, the text unchanged. Gujarat rebuilt them for the
district judiciary in 2025 as the Electronic Communication and Audio-Video Electronic Means
Rules, keeping the model's spine - coordinators, preparatory arrangements, examination of
persons, seamless conferencing, costs, the Lok Adalat provision - and adding rules the
model has no equivalent of, for remand, plea bargaining and the record of proceedings, which
is what the BNSS made necessary. A s.138 case reaches these rules at exactly two points:
the complainant's evidence on affidavit is often taken with the deponent on a link, and the
accused's appearance and section 313 examination can be. Both are moments the record has to
be able to prove afterwards.

**Document.** model-rules-vc-2020

### A named Coordinator for every point the hearing runs from

There must be a Coordinator at the Court Point and at the Remote Point from which a
Required Person is examined or heard; in the district judiciary the Coordinators are
persons nominated by the High Court or the District Judge; and for each kind of Remote
Point the rules name who that Coordinator is, from an Indian consular official overseas to
a jail superintendent to a person the Court appoints for any other location.

**Binds.** court

**Citation.** rule_5_1 · rule_5_2 · rule_5_3 · rule_5_4

**Timing.** Per proceeding conducted by video conferencing; nominations standing.

**Compliant when.** Every video conferencing proceeding names its Court Point Coordinator
and, where a witness or an accused is examined, its Remote Point Coordinator, and each name
traces to a nomination the High Court or the District Judge actually made.

**Artifact.** schema-field

**Build.** A standing roster of nominated coordinators by location and kind of Remote
Point, with the proceeding pointing at entries in it rather than carrying typed names, so
the ten cases rule 5.3 sets out become ten selectable kinds and not a rule someone has to
remember.

**Automate.** Pick the default coordinator from the Remote Point's kind, require an
explicit appointment order where rule 5.3.10 applies, and carry the nomination date on the
roster so a lapsed nomination is visible before the hearing rather than during it.

**Test.** Schedule an examination from a jail and confirm the superintendent is the
proposed coordinator without anyone typing it; schedule from an advocate's office and
confirm the system asks for the Court's appointment under rule 5.3.10.

**Note.** Rule 5.1's second sentence undercuts its first - a Coordinator is required at
both points, and then "may be required at the Remote Point only when a witness or a person
accused of an offence is to be examined". Rule 10.1 resolves it for argument, saying no
coordinator is needed where an advocate is only addressing the Court. Treat the roster
requirement as attaching to examinations.

### Identity is proved before a person is examined, and the proof is shared

A person to be examined must produce and file proof of identity - a government identity
document, or failing that an affidavit attested under section 139 CPC or section 297 CrPC
stating that the deponent is the same person - a copy must be made available to the
opposite party, and the identity proof of any Required Person must reach the Court Point
Coordinator by personal email in advance.

**Binds.** court

**Citation.** rule_8_1 · rule_3_vii

**Timing.** Before examination; the advance proof before the proceeding.

**Compliant when.** No examination is recorded without an identity document or the
substitute affidavit on the file, and the opposite party has been served with a copy before
the examination begins.

**Artifact.** validation-rule

**Build.** An identity attachment on the video conferencing listing that must be present
before the hearing can be marked ready, with service on the opposite party as a recorded
step rather than an assumption.

**Automate.** Collect it at the request stage from Schedule II rather than on the morning
of the hearing, serve the copy on the other side automatically when it is filed, and block
the ready state until both have happened.

**Test.** Try to open an examination with no identity document and confirm it cannot be
marked ready; file one and confirm the opposite party's copy is on the record with a date.

**Note.** Rule 3(vii) routes identity proof to the coordinator by "personal email", which
is the one place the model asks for identity documents to travel over a channel it
elsewhere calls insecure. Where the person has no document, the fallback is an attested
affidavit, which takes days - a real obstacle for a witness at short notice.

### Everyone is ready half an hour early, and the link is tested first

The Coordinator at the Remote Point must ensure that everyone scheduled to appear is ready
at least thirty minutes before the scheduled time, and the Coordinator at the Court Point
must conduct a trial video conference, preferably thirty minutes before, to confirm that
the technical systems work at both points.

**Binds.** court

**Citation.** rule_5_6_1 · rule_10_5 · rule_5_5

**Timing.** Thirty minutes before each scheduled video conferencing proceeding.

**Compliant when.** Each proceeding has a recorded trial connection and a recorded
readiness confirmation, both before the scheduled hour, and a failed trial is visible to
the Court before the hearing is called.

**Artifact.** workflow-step

**Build.** A pre-hearing check on the listing itself - trial connection, both coordinators
present, the rule 4 equipment confirmed - each with a time, so the half hour is a state and
not a habit.

**Automate.** Open the check thirty minutes out, notify both coordinators, and surface an
unfinished check on the Court's board alongside the case, so the Court learns of a broken
link before it calls the matter rather than after.

**Test.** Let the trial connection fail and confirm the case shows as not ready on the
board; complete it and confirm the time it completed is on the record.

### No unauthorised recording, and no unauthorised presence

There must be no unauthorised recording of a proceeding by any person or entity; the
Coordinator at the Remote Point must ensure that no unauthorised recording device is used
and that no unauthorised person enters the room while the conference is in progress; and
apart from the person being examined only those whose presence is administratively
necessary may be at the Remote Point.

**Binds.** court

**Citation.** rule_3_vi · rule_5_6_2 · rule_5_6_3 · rule_8_11

**Timing.** For the duration of each proceeding.

**Compliant when.** The client software does not offer recording to a participant, the
Court's own recording is the only one, and each proceeding carries the coordinator's
confirmation of who was in the room.

**Artifact.** access-control

**Build.** Recording disabled for every role but the Court, participants admitted by the
coordinator rather than by link, and a recorded roll of who was present at the Remote Point
attached to the proceeding.

**Automate.** Enforce it in the platform rather than by instruction: no participant
recording permission, a lobby the coordinator admits from under rule 14.4, and a prompt at
the close for the coordinator to confirm the room, so the confirmation is made while it is
still true.

**Test.** Join as a party and confirm no recording control is offered; join a second device
on the same credentials and confirm the coordinator has to admit it.

**Note.** Rule 3(vi) is a prohibition with no sanction attached in these Rules, and a
platform that leaves the record button enabled makes it unenforceable whatever the rule
says. This is the clearest example in the document of an obligation that only a build can
actually discharge.

### A translator, signer or special educator when the person examined needs one

Whenever required, the Court must order the Coordinator at the Remote Point or the Court
Point to provide a translator where the person is not conversant with the official language
of the Court, an expert in sign language where the person is impaired in speech or hearing,
and an interpreter or special educator where the person is differently abled, temporarily or
permanently.

**Binds.** court

**Citation.** rule_5_9 · rule_5_9_1 · rule_5_9_2 · rule_5_9_3

**Timing.** Whenever required, before the examination.

**Compliant when.** The need is asked about before the hearing is fixed rather than
discovered at it, and where one exists there is an order and a named person against the
proceeding.

**Artifact.** schema-field

**Build.** Language and access needs as fields on the video conferencing request in
Schedule II, not as a remark, with the resulting order and the named provider attached to
the proceeding.

**Automate.** Ask at request time, carry the answer to the listing, and hold the proceeding
out of the ready state where a stated need has no provider against it.

**Test.** Request a hearing for a witness who signs and confirm the case cannot be marked
ready without a sign language expert named; confirm the order is on the record and not only
in the diary.

**Note.** Rule 13.1 makes the fee for a translator, interpreter or special educator payable
by such party as the Court directs, so an accessibility need can become a cost order.
Nothing in the model says it may not fall on the person who needs it.

### The signed transcript reaches the record, and the hard copy within three days

The Court must obtain the signature of the person examined on the transcript once the
examination concludes; the signed transcript forms part of the record of the judicial
proceedings; and by whichever of the two routes the rules provide - digital signatures at
both points, or a printed and countersigned copy where they are not available - the hard
copy is dispatched by the Remote Point Coordinator to the Court Point, preferably within
three days, by recognised courier or registered speed post.

**Binds.** court

**Citation.** rule_8_8 · rule_8_8_1 · rule_8_8_2

**Timing.** Signature at the close of the examination; hard copy preferably within three
days.

**Compliant when.** Every examination conducted by video conferencing has a signed
transcript on the record, and the physical copy is either received or visibly outstanding
against the three-day expectation.

**Artifact.** output-document

**Build.** The transcript as a record object with the signature route recorded on it -
digital at both ends, or printed and countersigned - and a despatch and receipt pair for the
hard copy, so the gap between the electronic and the physical record is measurable.

**Automate.** Generate the transcript from the proceeding, route it for signature by the
available means rather than asking a coordinator to choose, and age the awaited hard copy
against three days from the close of the testimony.

**Test.** Complete an examination and confirm the transcript cannot be marked part of the
record unsigned; confirm a hard copy outstanding on day four appears on someone's list.

**Note.** "Preferably within three days" is the only interval in the whole document, and
"preferably" makes it advice rather than a limit. The rule also leaves the record in two
states at once for those days - electronically complete, physically incomplete - and says
nothing about which prevails if they differ.

### The recording is preserved, and the master copy is encrypted and hashed

An audio-visual recording of the examination of a person examined must be preserved, and an
encrypted master copy with a hash value must be retained as part of the record.

**Binds.** both

**Citation.** rule_8_9

**Timing.** Per examination. No retention period is stated.

**Compliant when.** Every examination conducted by video conferencing has a recording, the
master copy is encrypted, its hash is stored, and the hash still verifies.

**Artifact.** schema-field

**Build.** The recording as an exhibit on the case rather than a file on a server, carrying
its encryption state, its hash and the algorithm that produced it, and linked to the
proceeding it came from.

**Automate.** Encrypt and hash at the end of the proceeding, in the same step that closes
it, and re-verify on a schedule so a silently corrupted master is found before someone needs
it in evidence.

**Test.** Conduct a recorded examination and confirm the master is encrypted and hashed
without anyone doing it; alter the stored file and confirm the scheduled verification
reports it.

**Note.** No retention period is stated anywhere in the document, which for a recording of
sworn testimony is a serious gap: the model rules for e-filing at least fix two years past
final disposal for documents whose authenticity may be questioned. The vendor half of this
is unavoidable - the encryption, the hashing and the storage are the platform's - so it has
to be in the contract.

### The order sheet records that the hearing was held on a link, and how it went

On completion of a video conferencing proceeding the Court must mention in the order sheet
the time and duration of the proceeding, the software used where it was not the Designated
Video Conferencing Software, the issues on which it was addressed and the documents
produced and transmitted online, with the duration of any digital recording tendered; and
wherever any proceeding is carried out by recourse to video conferencing that must
specifically be mentioned in the order sheet.

**Binds.** court

**Citation.** rule_10_7 · rule_14_9

**Timing.** On completion of each video conferencing proceeding.

**Compliant when.** No video conferencing proceeding closes without those particulars in
the order sheet, and the fact of video conferencing appears in the order sheet of every
hearing held on a link.

**Artifact.** output-document

**Build.** The order sheet drawing these particulars from the proceeding itself - start,
end, platform, participants, documents transmitted - so the Court writes the issues and the
system supplies the rest.

**Automate.** Prefill from the conference record on close and require the Court only to
confirm, since a duration typed from memory is the field most likely to be wrong and the one
an appellate court is most likely to test.

**Test.** Hold a hearing on a link and confirm the draft order sheet already carries the
time, the duration and the documents; try to close it without the video conferencing
mention and confirm it cannot be closed.

**Note.** Gujarat's 2025 rules keep this as rule 18 but reduce it to the bare fact - the
Court "shall mention in the order sheet, that the hearing is conducted through video
conferencing" - dropping the time, duration, software, issues and documents the model asks
for. Punjab and Haryana kept the model's full list. The same hearing therefore produces a
materially different record in the two States.

### The Court records that it could see and hear

The Court must record its satisfaction as to clarity, sound and connectivity for both Court
Users and Remote Users.

**Binds.** court

**Citation.** rule_10_8 · rule_14_7

**Timing.** Per proceeding.

**Compliant when.** Each video conferencing proceeding carries the Court's recorded
satisfaction, made at the proceeding and not added afterwards.

**Artifact.** schema-field

**Build.** A required field on the close of the proceeding, kept separate from the
narrative order so it can be found across cases and not only read case by case.

**Automate.** Ask at close, before the order sheet can be signed, and record the time the
answer was given, so satisfaction expressed on the day is distinguishable from satisfaction
recorded later.

**Test.** Close a video conferencing hearing and confirm the satisfaction entry is required;
confirm the entry carries its own timestamp.

**Note.** This is the finding a conviction may later turn on, since a witness examined over
a poor link is the ground an appeal takes. The model asks the Court to satisfy itself under
rule 14.7 and to record the satisfaction under rule 10.8, but provides no scale and no
consequence for dissatisfaction short of rule 10.9's incomplete hearing.

### Only the Designated Software, and any departure is recorded

The Coordinator at the Court Point must ensure that video conferencing is conducted only
through the Designated Video Conferencing Software, which is the software the High Court
provides from time to time; a different software may be used in a particular proceeding only
where there is a technical glitch and only for reasons recorded.

**Binds.** both

**Citation.** rule_12_2 · rule_2_vii · rule_10_7

**Timing.** Per proceeding.

**Compliant when.** The designated software is what a hearing opens in by default, every
use of anything else has recorded reasons, and the software actually used appears in the
order sheet under rule 10.7.

**Artifact.** validation-rule

**Build.** The designated platform as configuration held by the court, with a departure
being an explicit act that demands a reason rather than a coordinator quietly sending a
different link.

**Automate.** Generate the link from the designated platform, and where a departure is
recorded carry the software name straight into the order sheet field rule 10.7 asks for, so
the two cannot disagree.

**Test.** Start a hearing and confirm the link is the designated platform; record a
departure and confirm the order sheet names the software without anyone typing it.

**Note.** "Designated Video Conferencing Software" is defined in rule 2(vii) as whatever
the High Court provides from time to time, which makes this obligation only as strong as
the designation. Nothing in the model requires the designation to be published, so a
participant cannot check what the designated software is.

### Identity confirmation appears in the order sheet

The identity of the person to be examined must be confirmed by the Court with the
assistance of the Coordinator at the Remote Point in accordance with rule 8.1, at the time
of recording the evidence, and the confirmation must be reflected in the order sheet.

**Binds.** court

**Citation.** rule_12_3 · rule_12_4 · rule_12_5 · rule_12_6

**Timing.** At the time of recording the evidence.

**Compliant when.** Every examination has a confirmation entry in the order sheet, made at
the time the evidence was recorded, distinct from the identity document filed beforehand
under rule 8.1.

**Artifact.** workflow-step

**Build.** Confirmation as a step in the hearing, prompting the Court with the identity
document already filed so the confirmation is made against something rather than in the
abstract, and writing the result into the order sheet.

**Automate.** Show the filed identity proof at the moment the examination opens, and carry
the confirmation into the order sheet draft, so the Court confirms once rather than
recording twice.

**Test.** Record evidence over a link and confirm the order sheet carries the identity
confirmation without a separate dictation; confirm the confirmation cites the document on
the file.

**Note.** Rules 12.4 to 12.6 put the confirmation of location, willingness and facilities on
counsel - the parties in a civil case, the prosecution or the defence in a criminal one, and
the prosecution for an accused. In a s.138 complaint, where the complainant is usually a
private party and there is no public prosecutor, the model does not say who confirms the
accused's location.

### The public can watch, and a closed hearing needs recorded reasons

To observe the requirement of an open Court, members of the public must be allowed to view
hearings conducted through video conferencing, and the Court must endeavour to make
available sufficient links, consistent with available bandwidth, for accessing the
proceedings; a hearing is closed only where it is ordered in camera for reasons recorded in
writing.

**Binds.** both

**Citation.** rule_16_1 · rule_16_2

**Timing.** Per hearing.

**Compliant when.** A member of the public can find and join a listed video conferencing
hearing without applying for permission, and every hearing that is closed carries a written
in-camera order.

**Artifact.** screen

**Build.** A public view of the day's video conferencing hearings with a join route, and a
closure flag on the listing that is set only by an in-camera order carrying its reasons.

**Automate.** Derive the public listing from the cause list rather than maintaining a second
one, and let the in-camera order itself remove the hearing from it, so a closure is always
traceable to an order.

**Test.** As a member of the public, join a listed hearing without credentials; order one
in camera and confirm it leaves the public listing and that the order with its reasons is on
the record.

**Note.** "Consistent with available bandwidth" is the qualification that can swallow the
rule, and it is the vendor's half of it: how many public viewers a hearing admits is a
capacity decision made when the platform is procured, not when the case is listed. Rule
16.2 covers the opposite case, a stranger physically present at the Remote Point, who must
be identified by the coordinator and may remain only if the Court orders it.

### A complaint about the link is passed on at once and answered

Where on the completion of video conferencing a Remote User considers that they were
prejudiced by poor video or audio quality, they must immediately inform the Coordinator at
the Court Point, who must communicate it to the Court without delay; the Court must consider
the grievance and may declare the hearing incomplete, in which case the parties may be asked
to re-connect or to appear physically.

**Binds.** court

**Citation.** rule_10_9 · rule_14_8

**Timing.** Immediately on completion; communicated without delay; considered by the Court.

**Compliant when.** A quality grievance can be made and is on record with the time it was
made, the time it reached the Court, and what the Court decided.

**Artifact.** workflow-step

**Build.** A grievance record against the proceeding rather than an email to a coordinator,
with the three times on it, and the Court's decision - hearing complete, or incomplete and
relisted - as its close.

**Automate.** Offer it at the close of the proceeding to every Remote User, since the rule
requires it immediately and a route that has to be found will not be used in time; escalate
it to the Court's queue on submission.

**Test.** Raise a quality grievance as a remote party and confirm it reaches the Court's
list the same day with both times recorded, and that the proceeding cannot be treated as
complete until the Court has decided it.

**Note.** Rule 14.8 makes this a strict cut-off in the other direction: connectivity
difficulties must be raised with the Court Point Coordinator at the earliest, and "no
complaint shall subsequently be entertained". A party whose audio failed and who did not
say so during the hearing has, on the face of the rule, lost the point.

### Presence is recorded before the hearing starts, and the link goes only to those given it

Before the commencement of video conferencing all participants must have their presence
recorded, with masking of a face or a name where a participant asks for it beforehand; the
Court Point Coordinator sends the link, meeting ID or room details to the email address or
mobile number furnished by the participant; and once proceedings have commenced no other
person may participate save with the permission of the Court.

**Binds.** court

**Citation.** rule_14_2 · rule_14_3 · rule_14_4

**Timing.** Before commencement, and for the duration.

**Compliant when.** Each proceeding carries an attendance record made before it started,
masking requests made in advance are honoured, and the link went only to addresses furnished
by the participants themselves.

**Artifact.** output-document

**Build.** Attendance as a record on the proceeding drawn from who the coordinator admitted,
a masking flag settable in advance on the participant, and link despatch that reads the
furnished address rather than one typed on the day.

**Automate.** Build the attendance from the admissions in the virtual lobby, so the record
is a by-product of the coordinator's own action; refuse to send a link to an address the
participant did not furnish; and treat a late joiner as requiring the Court's permission
rather than as an ordinary admission.

**Test.** Admit three participants and confirm the attendance record matches without anyone
writing it; ask for masking in advance and confirm the name does not appear; try to send the
link to an address not on the file and confirm it is refused.

**Note.** Rule 14.5 makes participation itself consent to the proceedings being recorded,
which means the attendance record and the recording arrive together and a participant who
does not want to be recorded cannot take part. The masking in rule 14.2 is the only
mitigation the model offers, and it has to be asked for before the hearing.

## National - SOP for Accessible Court Documents

The e-Committee's accessible-documents SOP is the instrument the rest of court accessibility
administration in India hangs off. Two of its headings do the institutional work: heading
XIII requires every High Court and District Court to let a lawyer with a disability opt for
e-filing and gives the High Courts three months to say how, and heading XIV requires an
Accessibility Committee in every High Court and every District Court, fixes what each is
made of, lets the committee order the registry to produce an accessible filing, makes the
High Court committee monitor the district ones, and requires the committee to publish every
quarter what it was asked for and what it disposed of. The accessibility committees since
constituted by the High Courts of Delhi, Gauhati, Tripura, Jharkhand, Telangana, Allahabad,
Rajasthan and Punjab and Haryana all trace back to those two headings.

The rest of the document is the other kind of obligation: what an accessible court document
actually is, paragraph by paragraph, from the heading styles in the word processor to the
security flag on the finished PDF. Those are operational too, because each one is a record
that has to come out a particular way, and a system that produces filings, orders and
judgments either produces them like that or does not.

One duty is deliberately absent. Heading VII asks the High Courts to develop a pagination
mechanism by issuing practice notes or directions, and it is the one heading of the SOP that
prints no paragraph number at all - three bullets and nothing else - so there is no clause a
record could cite in the numbering the rest of this file speaks. It is on the Policy page,
under heading VII, and it is not a record here.

Every record below binds the court. The SOP names no vendor anywhere and imposes nothing on
one, so nothing here is marked vendor or both - which does not mean a court can discharge
them alone, only that the document does not say so. It also addresses advocates and parties
directly, for the documents they prepare and file; this file's vocabulary has no value for
that class, so where an obligation falls on the filer as much as on the registry the record
says so in its own words rather than in the Binds field.

**Document.** sop-accessible-court-documents-2022

### An Accessibility Committee in every High Court and every District Court

Every High Court and every District Court must set up an Accessibility Committee at the
earliest on receiving the SOP; the High Court committee is one High Court judge, one
registrar level officer, two assistant registrar level officers, one technical expert, one
staff member and one or two advocates, and the District Court committee is one additional
district judge, one Sub Judge/Senior, one advocate and a District System Administrator, with
one or two members of each being persons with disability.

**Binds.** court

**Citation.** para_29 · para_31 · para_32

**Timing.** At the earliest on receipt of the Standard Operating Procedure; standing once
constituted.

**Compliant when.** A constitution order exists for the High Court committee and for the
committee of every District Court in its remit, each order names members against every seat
the SOP lists, and at least one named member of each is a person with disability.

**Artifact.** schema-field

**Build.** The committee as a first-class record on the court rather than a page of names:
seats typed to the roles the SOP names, members held against seats with the dates they were
appointed, and a flag on the seat that carries the disability representation the SOP asks
for.

**Automate.** Derive the district committees from the establishment list, so a district
court with no committee is a gap the High Court sees rather than one nobody counted, and
raise a seat as vacant when the officer holding it is transferred.

**Test.** List every District Court under a High Court and confirm each resolves to a
constituted committee with all four seats filled; vacate one seat and confirm the committee
shows as incomplete rather than as constituted.

**Note.** The SOP says "it is desirable that every High Court and District Court must set up
an Accessibility Committee", and desirable and must do not sit together. Paragraph 31 has
the same problem: the composition "can be as follows" and then it is desirable to have one
or two members with disability. Read as a model that a High Court makes binding by adopting
it, which is what the adopting High Courts have done.

### A mechanism for accessible pagination, by practice note or direction

The High Courts must develop a proper mechanism for pagination, by issuing practice notes
or directions, so that the paginated paper-book can be shared with lawyers and lawyers and
judges are working to the same pagination during oral argument.

**Binds.** court

**Citation.** chp_7_unit

**Timing.** Not stated.

**Compliant when.** A practice note or direction on pagination has been issued, and the
paper-book a lawyer receives carries the same page numbers the bench is reading from.

**Artifact.** output-document

**Build.** Pagination as a property of the assembled bundle rather than of whatever tool
last touched it: one numbering applied when the paper-book is compiled, carried into the
copy served on every party, and stable when a document is added later.

**Automate.** Stamp the page number into the generated bundle at assembly and record the
range each document occupies, so a served copy can be checked against the court's own
without anyone comparing them by hand.

**Test.** Assemble a bundle, serve it, and confirm a cited page resolves to the same
content in the court's copy and the lawyer's; then insert a document and confirm the
citation still resolves or is reported as moved.

**Note.** Heading VII is the one obligation in this document with no numbered paragraph
under it, so it is cited to the heading. It is also the only one addressed to the High
Courts as rule-makers rather than to a court as an administrator, and the SOP fixes no
period within which the practice note is to issue.

### The Committee's order directing the registry to supply an accessible filing

A lawyer, litigant or judicial officer with a disability may ask the Committee by email to
have a filing supplied in accessible digital format; on verifying that the requester is in
the court's database of disabled lawyers the Committee passes an order directing the
registry to comply within a reasonable time period which the Committee itself prescribes.

**Binds.** court

**Citation.** para_30

**Timing.** On request; the registry complies within the period the Committee prescribes in
the order.

**Compliant when.** Every request carries a verification against the database, an order with
a stated period, and a registry action closing it inside that period - or a recorded reason
why not.

**Artifact.** workflow-step

**Build.** The request as a case-linked object with four states - received, verified,
ordered, supplied - carrying the matter it concerns, the format asked for, the period the
order set and the file the registry produced.

**Automate.** Verify the requester against the register of lawyers with disabilities rather
than asking the Committee to look, start the clock from the order's own period, and escalate
to the Committee when it runs out with nothing supplied.

**Test.** File a request from a name not on the register and confirm it cannot reach the
order state; file one from a name on it, set a seven day period, and confirm day eight
escalates without anyone watching the calendar.

**Note.** The SOP makes the register of lawyers with disabilities the gate for both this and
the e-filing option in paragraph 28, but says nothing about how a name gets onto it, who
decides, or what evidence is asked for. That is the gap a court has to close itself, and it
is the point at which an accessibility measure can quietly become a disclosure requirement.

### The Committee's email address, composition and contact details on the court website

The email address of the Accessibility Committee must be widely publicised on the website of
the concerned court, and its composition and contact details must be publicised there too.

**Binds.** court

**Citation.** para_30 · para_33

**Timing.** On constitution, and kept current as membership changes.

**Compliant when.** The court website carries a findable page giving the committee's
members, its contact details and a working email address, and the page changes when the
committee does.

**Artifact.** screen

**Build.** Publish the page off the committee record rather than maintaining a second copy
of it, so the published composition cannot drift from the constitution order.

**Automate.** Regenerate the page when a seat changes, and monitor the published mailbox for
delivery failure, because an address nobody can reach is the same as no address.

**Test.** Change a member on the committee record and confirm the public page changes
without an edit; send a message to the published address from outside the court network and
confirm it arrives.

### Quarterly data on accessibility requests made and disposed of

The Committee must publish, every quarter, how many requests for accessible filings, court
documents or any other reasonable accommodation were made to it and how many of them were
disposed of.

**Binds.** court

**Citation.** para_33

**Timing.** Quarterly.

**Compliant when.** A published figure exists for every quarter since the committee was
constituted, each giving requests received and requests disposed of, with no quarter missing.

**Artifact.** output-document

**Build.** Count the quarter off the request records themselves rather than off a return
somebody types, so the published number and the queue cannot disagree.

**Automate.** Cut the quarter on its closing date, draft the return, and hold it for the
committee to release; a quarter that closes with no return published is an exception on the
High Court committee's own view.

**Test.** Close a quarter with three requests, two disposed of, and confirm the draft says
three and two; suppress the release and confirm the quarter shows as outstanding rather than
as zero.

**Note.** The SOP asks only for two counts. It does not ask how long a request took, how
many were refused, or what the accommodation was, so the published figure cannot show a
court that disposes of everything by refusing it. A court that wants the number to mean
something should publish time to disposal alongside it, which is ours to suggest and not
the SOP's to require.

### The High Court committee monitors the district committees

The High Court Accessibility Committee must monitor the work of the District Court
Accessibility Committees coming within that High Court's remit.

**Binds.** court

**Citation.** para_32

**Timing.** Continuing; the SOP fixes no cadence.

**Compliant when.** The High Court committee has a current view of every district committee
under it - whether it is constituted, what it has been asked for, and what it has disposed
of - and a record of having acted on it.

**Artifact.** screen

**Build.** One view over every district committee in the remit, drawing on the same request
records and quarterly counts the districts publish, so monitoring is reading rather than
collecting.

**Automate.** Surface the district that has published no quarterly return, the one with
requests older than the period its own orders set, and the one with an unfilled seat, rather
than presenting a list that has to be read across.

**Test.** Leave one district's quarter unpublished and confirm it appears on the High Court
view without anyone reporting it upward.

**Note.** The SOP gives the High Court committee the monitoring duty but no power to do
anything with what it finds, and no cadence to do it at. Treat the cadence as quarterly
because that is the rhythm paragraph 33 sets for the data being monitored.

### Accessibility challenges reach the Committee and are dealt with swiftly

Any accessibility challenge faced by a person with a disability in accessing the justice
system, beyond the accessible-filing requests of paragraph 28, may be brought to the
Committee's attention, and must be dealt with in a swift and effective fashion consistent
with the Rights of Persons with Disabilities Act, 2016 and the rules under it.

**Binds.** court

**Citation.** para_33

**Timing.** "Swift and effective"; no period is stated.

**Compliant when.** There is a route for a complaint that is not a filing request, every
such complaint carries an outcome, and none is sitting without one.

**Artifact.** workflow-step

**Build.** The same request object with a second kind - a general accessibility complaint -
so a complaint about a ramp, a cause list or a hearing link is tracked with the same
machinery and appears in the same quarterly count.

**Automate.** Age every open complaint against a locally set service standard, since the SOP
sets none, and put the oldest in front of the committee rather than waiting to be asked.

**Test.** Raise a complaint that names no case number and confirm it is accepted, tracked
and counted.

**Note.** The SOP's own words are the standard here - swift and effective - and a standard
with no number cannot be failed. A court adopting this should fix a period in its practice
direction, because paragraph 33 read with section 40 and section 46 of the RPwD Act is what
a complainant would rely on.

### A lawyer with a disability can opt for e-filing, off a list the registry keeps

Every High Court and District Court must ensure that a disabled lawyer can opt for e-filing
even where physical filing is the norm; to effectuate it the registry may maintain a list of
disabled lawyers practising in that court, and as soon as a lawyer's name is on that list
the option of digital filing becomes available, with the whole proceeding then going the
digital route.

**Binds.** court

**Citation.** para_28

**Timing.** Standing; the option available as soon as the name is on the list.

**Compliant when.** A lawyer on the register can file electronically in a court that
otherwise files on paper, without asking each time, and the matter stays digital once the
option is taken.

**Artifact.** access-control

**Build.** The e-filing entitlement as an attribute of the advocate rather than a per-case
permission, so it follows them into every matter and does not have to be claimed again.

**Automate.** Open the electronic route the moment the name is registered, and keep the
whole proceeding electronic once it is opened, which is what the SOP means by "the entire
proceedings should go the digital route" - a matter that reverts to paper halfway defeats
the purpose.

**Test.** Register an advocate, then file in a court configured for physical filing only,
and confirm the electronic route opens; check that service, orders and copies in that matter
also stay electronic.

**Note.** The SOP puts this the right way round and says why: placing the onus on the
disabled lawyer to navigate physical filing "is inconsistent with the text and objects of
the Rights of Persons with Disabilities Act, 2016". The list is still a list of disabilities
held by the registry, so it is personal data of the most sensitive kind and should be
treated as such whatever the SOP does not say.

### Practice directions on the e-filing option within three months

Appropriate practice directions giving effect to the e-filing option need to be issued by
all High Courts within three months of receiving the Standard Operating Procedure.

**Binds.** court

**Citation.** para_28

**Timing.** Within three months of the date of receipt of the SOP.

**Compliant when.** The High Court has issued a practice direction, notification or
administrative order covering the e-filing option, and it is published where an advocate
would look for it.

**Artifact.** output-document

**Build.** Hold the practice direction as an instrument in the state layer, dated and linked
to the SOP paragraph it answers, so a reader can see which courts have answered and which
have not.

**Automate.** Nothing automates the issuing of a practice direction. What can be automated
is the register: the three-month date derived from the recorded date of receipt, and the
absence of an instrument against it shown as outstanding.

**Test.** Record a date of receipt and confirm the deadline is computed and shown; add the
issued direction and confirm the entry closes.

**Note.** This is the only period the SOP fixes anywhere, and it runs from receipt rather
than from any published date, so the clock differs by High Court and is not knowable from
the document. That is worth recording per court rather than assuming a common date.

### The Standard Operating Procedure is reviewed every two years

The SOP must itself be reviewed every two years and suitably modified, because the standards
that make a document accessible move.

**Binds.** court

**Citation.** para_35

**Timing.** Every two years.

**Compliant when.** A review has been carried out within the last two years and its outcome
recorded, whether or not it changed anything.

**Artifact.** workflow-step

**Build.** A review record against the adopted instrument carrying the date, who reviewed it
and what changed, which is also what tells a reader whether the version they are following
is the current one.

**Automate.** Date the adopted instrument and raise the review when it turns two, so a court
following a superseded version finds out from its own system.

**Test.** Backdate an adoption by twenty-five months and confirm the review is raised.

**Note.** The document in this corpus was published in 2022 and still points at WCAG 2.0, a
2008 recommendation superseded in 2018 and again in 2023. On paragraph 35's own terms two
reviews are already due. That is a fact about the source, not a criticism of a court
following it.

### Regular accessibility training on the academies' annual calendar

All State Judicial Academies and the National Judicial Academy must, with the relevant
courts, conduct regular training for lawyers and court staff on creating accessible
documents and on dealing with the needs of persons with disabilities, and that training must
be part of the academies' annual calendar.

**Binds.** court

**Citation.** para_34

**Timing.** Regular, and on the annual calendar of each academy.

**Compliant when.** The published annual calendar of the academy carries both subjects, the
sessions actually ran, and attendance is recorded against the staff and advocates who need
it.

**Artifact.** workflow-step

**Build.** Training as a record against the person rather than against the session, so a
registry can answer who in it has been trained on producing an accessible filing.

**Automate.** Draw the training need from the role - anyone who prepares, scrutinises or
serves a document - and show the untrained proportion of a registry rather than a count of
sessions held.

**Test.** Publish a calendar with no accessibility session and confirm the gap is visible
before the year starts, not after it.

**Note.** Paragraph 34 reads "shall, in co-ordination with the relevant courts, should
conduct", carrying both modal verbs. Nothing turns on it here: either way the obligation is
to conduct the training and to calendar it.

### Every court document is authored accessibly, and an automated one is no exception

A document must be prepared electronically in a word processor and made accessible before it
becomes a PDF - real heading styles forming an outline, real list styles, meaningful link
text, alt text on every image, accessible fonts, transcripts for image-based evidence, no
underlining, sentence case, left alignment, a declared document language, properly labelled
tables with no merged cells, unicode for vernacular content, and a clean run of the
accessibility checker - and a document produced by an automated workflow, such as a dynamic
PDF, must be accessible too; EPUB is to be offered as well as far as possible.

**Binds.** court

**Citation.** para_1 · para_2 · para_3 · para_5 · para_6

**Timing.** Per document, before it is converted or generated.

**Compliant when.** Every document a court generates carries a heading outline, alt text on
every non-text element, a declared language and tables with header rows, and the same is
true of anything a template or workflow produces.

**Artifact.** output-document

**Build.** Generate orders, notices and cause lists from templates that carry the structure
rather than the appearance of structure, so a heading is a heading in the file and not text
made large, and hold alt text as a required field on any image the system places.

**Automate.** Run an accessibility check in the generation pipeline and fail the document
rather than the reader: no untagged image, no empty heading level, no table without a header
row. Where EPUB is offered, produce it from the same structured source rather than from the
PDF.

**Test.** Generate one of every document type the system produces and run each through an
accessibility checker; every one should pass without a manual remediation step.

**Note.** Paragraph 2 also asks for font size 13, line spacing 1.5, a 20 cm gap between
paragraphs and no cursive fonts. The 20 cm is plainly a slip for something much smaller, and
a system should implement a sane paragraph spacing rather than the printed figure.

### The PDF is exported with structure tags and its fonts intact

The PDF must be produced by the export path that keeps accessibility: in Word by saving as
PDF with "Document structure tags for accessibility" checked and re-checked after any size
minimisation, on Mac by choosing "Best for electronic distribution and accessibility", in
LibreOffice by exporting with Archive (PDF/A), Universal Accessibility (PDF/UA) and Tagged
PDF selected; and fonts must never be un-embedded when a PDF is optimised for size, because
a compressed font makes a screen reader run the words together.

**Binds.** court

**Citation.** para_4 · para_7 · para_8 · para_9 · para_10 · para_11 · para_12 · para_16

**Timing.** Per document, at export.

**Compliant when.** Every PDF the court produces or accepts is tagged, its fonts are
embedded, and it survives a PDF/UA check.

**Artifact.** validation-rule

**Build.** One export path in the system rather than an instruction to staff, producing
PDF/UA with fonts embedded, and a scrutiny check on an incoming filing that reads the same
two properties.

**Automate.** Reject at scrutiny, with a message naming the property that failed, rather
than accepting an untagged filing and asking the registry to remediate it later. Compress
images, never fonts.

**Test.** Export a document, strip its tags, and confirm scrutiny rejects it; optimise a
PDF for size and confirm the fonts are still embedded afterwards.

### A scanned enclosure is OCR'd at 300 dpi, or it is typed

Scanning is the exception, allowed only where an enclosure exists only on paper and was not
itself prepared electronically by the advocate or the party; where it is allowed the scan
must be OCR-enabled and made at 300 dpi, must not come from a phone camera or a low-quality
scanning app, and an illegible document must be typed out and converted directly to PDF
instead.

**Binds.** court

**Citation.** para_13

**Timing.** Per scanned enclosure, at filing.

**Compliant when.** No scanned page enters the record without a text layer, resolution below
300 dpi is refused, and an illegible original is replaced by typed text rather than by a
better photograph.

**Artifact.** validation-rule

**Build.** A scrutiny rule on the upload that reads resolution and the presence of a text
layer, with the exception itself recorded: why this enclosure was scanned rather than
prepared electronically.

**Automate.** Run OCR on acceptance where the text layer is missing and the scan is
otherwise good enough, and refuse the upload where it is not, so the remediation happens
once at the door instead of on demand later.

**Test.** Upload a 150 dpi photograph of a page and confirm it is refused; upload a clean
300 dpi scan with no text layer and confirm a text layer exists on the stored copy.

### The filing is one bookmarked, digitally signed PDF

Text documents and scanned documents are to be merged into a single PDF, any PDF produced by
merging is to be bookmarked, preferably using its headings as the bookmarks, and all
documents are to be digitally signed.

**Binds.** court

**Citation.** para_14 · para_15

**Timing.** Per filing.

**Compliant when.** A filing arrives as one PDF with a bookmark tree that reaches every
enclosure, and carries a valid digital signature.

**Artifact.** validation-rule

**Build.** Build the bundle from the documents the filer uploaded and generate the bookmarks
from their headings and their place in the index, rather than asking a filer to bookmark by
hand.

**Automate.** Merge, bookmark and check the signature at acceptance; a bundle with no
bookmark tree, or with a bookmark that points nowhere, does not pass scrutiny.

**Test.** File a petition with four enclosures and confirm the stored bundle has four
reachable bookmarks and a signature that validates.

### Nothing on the page defeats a screen reader

E-stamps must be used rather than physical stamps, and where a physical stamp is
unavoidable it goes on a separate white sheet and never on a judgment copy; the PDF's
security settings must permit "copying content for accessibility"; watermarks must not be
used at all; and no data point may be entered by hand, because a screen reader cannot read
handwriting.

**Binds.** court

**Citation.** para_24 · para_25 · para_26 · para_27

**Timing.** Per document.

**Compliant when.** No document the court issues or accepts carries a watermark, a stamp
over its text, a handwritten entry, or a security setting that blocks content extraction for
accessibility.

**Artifact.** validation-rule

**Build.** Set the permission flags at generation rather than leaving them to the tool's
defaults, and put the court's mark in the document's own structure rather than as an image
laid over it.

**Automate.** Check the four properties on every incoming and outgoing PDF and name the
failing one in the rejection; the security flag in particular fails silently otherwise,
because the document looks perfectly readable to a sighted scrutiny officer.

**Test.** Produce a PDF with content extraction disabled and confirm it is refused; open an
issued order in a screen reader and confirm every field, including the stamp and the
signature block, is announced.

**Note.** Paragraph 25 is the one that catches courts out. A security setting that blocks
copying is often applied deliberately, to stop a judgment being altered and recirculated,
and it is exactly the setting that stops a screen reader reading it.

### The tagged PDF declares its language, title, reading order and form fields

A tagged PDF must have a logical reading order; its primary language must be set, with any
passage in another language marked as such; it must carry a document title so the title bar
and the screen reader announce it; its tags must follow the content structure, marking
headings, lists, tables, footnotes and endnotes; its page thumbnails and tab order must be
aligned from the page properties, because screen reader users navigate by tab; and every
form field in a PDF form prescribed for e-filing must be tagged and carry a description, so
it can be filled without sighted help.

**Binds.** court

**Citation.** para_16 · para_18 · para_19 · para_20 · para_22 · para_23

**Timing.** Per document, and per prescribed form.

**Compliant when.** Every generated PDF has a title, a language, a reading order matching
its visual order, and structure tags; and every prescribed PDF form can be completed
end to end by a screen reader user.

**Artifact.** output-document

**Build.** Carry title and language as metadata on the document type rather than leaving
them to whatever the export tool inherits, and generate form fields from the same field
definitions the electronic form uses, so the label a sighted user sees is the description a
reader hears.

**Automate.** Assert title, language, tab order and tagged form fields in the generation
pipeline, and fail the build of a new template that omits any of them, rather than auditing
templates after they are in use.

**Test.** Complete a prescribed PDF form with the screen off; every field should announce
what it wants and what it rejected.

**Note.** There is no paragraph 17 in the source. The run goes 16, then 16's clauses (i) to
(iv), then 18, and paragraphs 18 to 23 are printed indented as though they were part of 16's
list. The citations here follow the numbers the document prints.

### Contrast that a reader can actually read

Sufficient colour contrast must be used between foreground text and background, checked with
an accessibility checker or a contrast tool; high-contrast colours must be used in the PDF,
or the foreground against the background must meet the stated ratio.

**Binds.** court

**Citation.** para_2_m · para_21

**Timing.** Per document and per template.

**Compliant when.** Every text and background pair in every document template meets 4.5:1
for body text, measured rather than eyeballed, and the same holds for the generated PDF as
for the screen.

**Artifact.** validation-rule

**Build.** Draw document templates from the same colour tokens the interface uses, so the
contrast that is unit-tested for the screen is the contrast the PDF inherits.

**Automate.** Test the token pairs in CI, and re-test the rendered PDF, because a PDF
pipeline can flatten a colour that passed on screen.

**Test.** Run every foreground and background pair in the template set through a contrast
checker; none should fail.

**Note.** Paragraph 21 prints the ratio as "4*5*1". Read as 4.5:1, which is the WCAG AA
threshold for body text and the figure the standards layer already carries; the SOP itself
gives no other number, and the printed form is reproduced in the transcription rather than
corrected.
