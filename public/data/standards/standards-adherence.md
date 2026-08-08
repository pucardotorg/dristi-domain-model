<!--
  HOW THIS FILE IS WRITTEN - the Standards adherence tab parses it, so keep the shape.

    > line            the lede, shown under the page title (one or more lines)
    ## Name           a group. Lines under it, before the first ###, are the group gloss.
    ### Name          one standard. The heading is its name.
    plain paragraph   the gloss: what the standard means here. Optional.
    **Spec.**         the published standard it comes from. Optional - some have none.
    **Anchor.**       refs into THIS corpus that give it force in India: "<alias>:<eId>",
                      several separated by " · ". They render as links that open the
                      provision. Optional.
    **How to test.**  the method - the tools, the environments, the walk. Required.
    **Pass when.**    the threshold that decides it. Required.
    **Check.**        hosted checkers, several separated by " · ". Each is a link and a
                      note on what it takes and what it tells you. Optional - and where
                      no hosted checker exists, say so here rather than leaving it out.
    **Note.**         a caveat about the standard itself. Optional.

  Markdown links, [text](url), are honoured in any of those. Nothing else is parsed.
  Add a group by adding a ##; add a standard by adding a ###. No new code for either.
-->

# Standards adherence

> The non-legal standards a DRISTI build is measured against, and how each one is
> tested. These are not derived from the Acts: they are the accessibility, security,
> performance, interoperability, usability and content obligations that any public
> digital service carries, which a court-facing one carries more heavily. The
> Requirements tab holds the other kind - what the law itself compels. Read the two
> together: a screen can satisfy every provision in the corpus and still be unusable
> by the litigant it was built for.
>
> Every standard below states a test and a threshold, because a standard nobody can
> fail is not a standard. Where the source marks something as likely rather than
> settled, that is said on the standard.

## Accessibility

A court service is used by people who did not choose to be there, on the devices they
happen to own. Accessibility here is a condition of access to the court, not a feature.

### WCAG 2.1 Level AA

The baseline for every public-facing screen. India's GIGW 3.0, the standard a
government-adjacent service is measured against, adopts it by reference.

**Spec.** [WCAG 2.1](https://www.w3.org/TR/WCAG21/), W3C Recommendation, 50 success criteria at Level A and AA. India adopts it by reference through [GIGW 3.0](https://guidelines.india.gov.in/).

**Anchor.** rpwd:sec_40 · rpwd:sec_44 · rpwd:sec_46

**How to test.** Run axe-core or IBM Equal Access in CI against every route in the
filing, service and hearing flows. Then hand-check what automation cannot see:
meaningful sequence, error identification, consistent navigation, sensory
characteristics. Keep a per-screen matrix marking each Level A and AA success
criterion pass, fail or not applicable.

**Pass when.** Zero automated violations at serious or critical, and every A and AA
criterion on the matrix marked pass, or not applicable with a stated reason. A fail
blocks the release rather than opening a ticket.

**Check.** [WAVE](https://wave.webaim.org/) - paste a URL, reports violations in place on the rendered page · [PageSpeed Insights](https://pagespeed.web.dev/) - paste a URL, runs the Lighthouse accessibility audit

**Note.** Between the RPwD Act above and the W3C specification sits the judiciary's own
instrument: the e-Committee's [Standard Operating Procedure for Preparing Accessible
Court Documents](https://cdnbbsr.s3waas.gov.in/s388ef51f0bf911e452e8dbb1d807a81ab/uploads/2022/11/20241220105662910.pdf),
2022, held in this corpus under Policy. Its heading XVII sends a reader to the W3C's
own PDF techniques, naming WCAG 2.0, the version current when it was written. It
reaches documents rather than screens, so it does not displace this standard for the
interface; but every PDF a court service generates is measured against it as well, and
paragraph 35 requires the SOP itself to be reviewed every two years.

### WAI-ARIA 1.2

Roles, states and properties on every custom widget the design system introduces: the
cause list table, the date pickers, the document viewer, the case timeline.

**Spec.** [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/), W3C Recommendation, with the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) for the per-widget keyboard and state patterns.

**How to test.** Inspect the accessibility tree in DevTools for each component in the
library rather than each page, since a component is where the defect lives. Check
role, name, value and state transitions against the ARIA Authoring Practices pattern
for that widget. Flag any ARIA attribute used where a native element would have done.

**Pass when.** Every library component has a named ARIA pattern, its tree matches
that pattern, and no element carries a role whose keyboard contract it does not
implement.

**Check.** [Nu Html Checker](https://validator.w3.org/nu/) - paste a URL, catches roles and ARIA attributes that are invalid on the element carrying them

### Screen reader compatibility (NVDA, JAWS, VoiceOver)

**Spec.** [WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html) is what a reader is actually exercising.

**Anchor.** rpwd:sec_42

**How to test.** Walk three journeys end to end with the screen off: file a complaint,
respond to summons, read an order. Do each on NVDA with Firefox, JAWS with Chrome, and
VoiceOver with Safari. Script the walks so the same route is repeatable each release.

**Pass when.** Each journey completes on all three readers without sighted help, every
field announces its label and its error, and no reader announces raw markup, an
unlabelled button or the wrong row count.

**Check.** No hosted checker reaches this one. Assistive technology has to be driven by a person, and the failures that matter are the ones automation cannot see.

**Note.** The e-Committee's Standard Operating Procedure for Preparing Accessible Court
Documents, 2022, is written almost entirely around this reader, and it names four
defects a screen a court builds will also produce in the documents it emits: fonts
un-embedded when a PDF is optimised, so the reader runs the words together (paragraph
4); a security setting that blocks "copying content for accessibility" (paragraph 25);
watermarks over the text (paragraph 26); and handwritten entries (paragraph 27). The
walks above should include an issued order and a filed petition, not only screens.

### Keyboard-only navigability

**Spec.** [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html) and [2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html).

**How to test.** Unplug the mouse. Tab through each screen: reach every control,
operate it, escape every modal, and confirm the tab order follows the visual order.
Give the document viewer and the cause list table their own pass, since both trap
focus most easily.

**Pass when.** Every action reachable by mouse is reachable by keyboard, no keyboard
trap exists anywhere, and a skip-to-content link is the first stop on each page.

### Focus management and visible focus indicator

**Spec.** [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html) at AA. WCAG 2.2 adds [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) at AA and [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) at AAA.

**How to test.** Open and close each modal, submit each form, trigger each async load,
and watch where focus lands. Measure the focus ring against both the component and the
page background, in light and dark.

**Pass when.** Focus moves to the new context on open and returns to the trigger on
close, an error summary takes focus on a failed submit, the indicator is never removed
by CSS and is never entirely hidden by other content. Where the AAA bar is taken, it
also meets Focus Appearance: at least a 2px perimeter, at 3:1 against both states.

### Colour contrast ratios (4.5:1 for normal text)

**Spec.** [WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) for text and [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html) for components and graphics.

**How to test.** Extract every foreground and background token pair from the design
tokens and run them through a contrast checker as a unit test, so a token change fails
the build rather than a later page audit. Spot-check text over images, disabled states
and placeholder text by hand.

**Pass when.** 4.5:1 for text under 18.66px regular or 24px bold, 3:1 for larger text
and for UI component and graphical boundaries, in both themes. No pair is exempted
without a written reason.

**Check.** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - takes two colour values, gives the ratio and the level it passes · [WAVE](https://wave.webaim.org/) - paste a URL, flags contrast errors against the live page

**Note.** The e-Committee's Standard Operating Procedure for Preparing Accessible Court
Documents, 2022, carries the same rule for documents: paragraph 2(m) requires
sufficient contrast between foreground text and background and says to measure it with
a checker rather than judge it by eye, and paragraph 21 asks for high-contrast colours
or a stated ratio. The ratio is printed there as "4*5*1", which is 4.5:1 mis-set; the
figure above is the one to work to, and the document itself gives no other. Test the
generated PDF as well as the screen, since a PDF pipeline can flatten a colour that
passed in the browser.

### No reliance on hover states for critical information

**Spec.** [WCAG 1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html).

**How to test.** Audit every tooltip, hover-revealed action and truncated cell with a
title attribute. For each, ask what a touch user and a keyboard user see. Re-run the
critical journeys on a touch device with no pointer attached.

**Pass when.** No status, deadline, error, party name or action is available only on
hover. Anything hover reveals is also reachable by focus and present on touch, or it
is purely supplementary.

### Touch target sizing for mobile (44x44px minimum)

**Spec.** 44x44 is [WCAG 2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) at AAA, and the figure Apple's Human Interface Guidelines use. The AA floor is WCAG 2.2's [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) at 24x24. The source asks for the higher bar.

**How to test.** Measure the hit area rather than the painted glyph for every
interactive element at the mobile breakpoint. An automated pass over the rendered DOM
catches most of them; check the dense contexts by hand, which is where they fail: row
actions, date pickers, close buttons.

**Pass when.** Every target is at least 44x44 CSS px, or at least 24x24 with adequate
spacing and no overlap. Primary actions in a filing flow meet 48px.

### Voice control compatibility (Dragon NaturallySpeaking, iOS Voice Control)

**Spec.** [WCAG 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG21/Understanding/label-in-name.html).

**How to test.** Drive the critical journeys by voice on iOS Voice Control and on
Dragon. Speak the visible label of each control and confirm it activates. Where an
icon carries an extended description, check that the accessible name still begins with
the visible text.

**Pass when.** Every control activates when its visible label is spoken, and no
control has an accessible name that diverges from its visible text, per WCAG 2.5.3
label-in-name.

### Support for 200% text zoom without layout breaking

**Spec.** [WCAG 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html) at 200% and [1.4.10 Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html) at the 320px equivalent, both AA.

**How to test.** Set browser zoom to 200% and, separately, text-only zoom to 200%, at
1280x1024 and at 360px wide, and walk every screen. Then test reflow at the 320px
equivalent, which is 400% at 1280px, per WCAG 1.4.10.

**Pass when.** No content or function is lost, there is no two-dimensional scrolling,
no text is clipped or overlapping, and every form still submits. A table may scroll in
one axis inside its own container.

### Timeout warnings before session expiry

**Spec.** [WCAG 2.2.1 Timing Adjustable](https://www.w3.org/WAI/WCAG21/Understanding/timing-adjustable.html), which is where the 20 seconds comes from.

**How to test.** Start a long filing form, idle until the warning fires, and take both
branches: extend the session, and let it lapse. Repeat the walk with a screen reader
running.

**Pass when.** A warning appears at least 20 seconds before expiry with a way to
extend, unsaved work survives re-authentication, and the warning is announced through
an assertive live region.

### Visible labels on all interactive elements (no placeholder-only fields)

**Spec.** [WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html), with [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html) for the icon-only controls.

**Check.** [WAVE](https://wave.webaim.org/) - paste a URL, reports missing and empty form labels by name

**Note.** Untyped in the source table. It is grouped here because it is a WCAG 3.3.2
obligation before it is anything else.

**How to test.** Scan the rendered DOM for inputs whose only accessible name comes
from a placeholder, and for icon-only buttons with no accessible name. Review each
form visually with every field filled, to confirm the label is still on screen once
the value has replaced the hint.

**Pass when.** Every field has a persistent visible label, every icon-only control has
a visible label or a tooltip plus an accessible name, and no placeholder carries
information the user still needs after typing.

### Multilingual and script support (Devanagari, Tamil, etc. depending on court)

**Spec.** [WCAG 3.1.1 Language of Page](https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html) and [3.1.2 Language of Parts](https://www.w3.org/WAI/WCAG21/Understanding/language-of-parts.html) for the markup; the [Unicode Standard](https://www.unicode.org/versions/latest/) for the scripts themselves.

**Anchor.** constitution:art_348 · rpwd:sec_42

**How to test.** Load each supported locale and render the longest realistic party
name, address and order text in each script. Check line breaking, input, sorting,
search, PDF output and printed process. Round-trip a name entered in one script
through the database and back out into a generated document.

**Pass when.** Every supported script renders with no missing glyphs and no clipping
in the interface, in PDF and in print; input methods work; search matches; and the
`lang` attribute is set correctly so a screen reader switches voice.

**Note.** The e-Committee's Standard Operating Procedure for Preparing Accessible Court
Documents, 2022, says the same thing for the document rather than the page: paragraph
2(l) requires regional and vernacular content to be rendered in a unicode font,
paragraph 2(j) requires the document language to be identified, and paragraph 19
requires the tagged PDF to declare its primary language and to mark any passage that is
in another one - which is `lang` on the element, said in PDF. A bilingual order that
sets no language part is the same defect on either surface.

## Security

The corpus already says what the court record must be. This group is the technical
layer underneath it, plus the statutory and empanelment obligations an Indian
government-adjacent system carries in its own right.

### OWASP Top 10 compliance (SQL injection, XSS, CSRF, etc.)

**Spec.** [OWASP Top 10](https://owasp.org/www-project-top-ten/) names the categories; [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) is the checklist you actually work, and [OWASP ZAP](https://www.zaproxy.org/) the scanner.

**How to test.** SAST and dependency scanning on every commit, DAST with OWASP ZAP
against a staging build each release, and an annual manual penetration test by an
external party working the OWASP ASVS Level 2 checklist. Hold a mapping from each Top
10 category to the control that answers it.

**Pass when.** No open high or critical finding, every medium carrying an owner and a
date, and the ASVS Level 2 checklist complete with evidence against each item.

**Check.** [Mozilla HTTP Observatory](https://developer.mozilla.org/en-US/observatory) - enter a hostname, scores the header and configuration surface · [Security Headers](https://securityheaders.com/) - paste a URL, grades the response headers. Both stop at the surface: the injection classes need ZAP against a running build.

### HTTPS enforced across all endpoints

**Spec.** HSTS is [RFC 6797](https://www.rfc-editor.org/rfc/rfc6797); the TLS 1.3 the floor should be moving towards is [RFC 8446](https://www.rfc-editor.org/rfc/rfc8446).

**How to test.** Scan every hostname and endpoint with SSL Labs and testssl.sh,
including redirects, static assets, APIs and any separate file-download host. Confirm
plain HTTP redirects rather than serving, and that no page pulls a mixed-content
subresource.

**Pass when.** SSL Labs grade A or better, TLS 1.2 as the floor, HSTS with a max-age
of at least one year, no mixed content, and no endpoint reachable over plain HTTP.

**Check.** [Qualys SSL Labs](https://www.ssllabs.com/ssltest/) - enter a hostname, returns the grade, the protocol and cipher list and the chain · [HSTS Preload](https://hstspreload.org/) - enter a domain, says whether it qualifies for the browser preload list · [Security Headers](https://securityheaders.com/) - paste a URL

### Data encryption at rest and in transit

**Spec.** AES is [FIPS 197](https://csrc.nist.gov/pubs/fips/197/final); key management is [NIST SP 800-57 Part 1](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final).

**Anchor.** itact:sec_84A · itact:sec_43A

**How to test.** Inspect the database, object store, backups, search indexes and log
sinks for their encryption configuration. Establish where keys live, who can read
them, and how they rotate. Restore a backup into an isolated environment and prove it
is unreadable without the key.

**Pass when.** AES-256 or equivalent at rest on every store including backups, TLS in
transit including service to service, keys held in a managed KMS or HSM with a
documented rotation schedule, and no application-level access to raw key material.

**Check.** Only the in-transit half is observable from outside, through SSL Labs. At-rest encryption and key custody are configuration, and have to be inspected.

### Role-based access control (advocate vs. scrutiny officer vs. magistrate)

The roles are not generic. They are the ones this model already carries per state, in
the Story roles and the Vocabulary, and they differ between states.

**Spec.** [NIST's RBAC model](https://csrc.nist.gov/projects/role-based-access-control) for the vocabulary of roles, sessions and constraints. The roles themselves are not international: they are this corpus's.

**How to test.** Build a matrix of every role against every action and every case
state, then drive it as a test suite that asserts the denials as well as the
permissions. Attempt horizontal escalation, one advocate reading another's case, and
vertical escalation, staff performing a judicial act, directly against the API rather
than through the interface.

**Pass when.** Every denial returns a 403 at the API and not merely a hidden button,
no role can read a case it is not on, and the matrix is generated from the same role
data the application renders.

### Session timeout and re-authentication for sensitive actions

**Spec.** [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) and [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html) for reauthentication intervals.

**How to test.** Enumerate the sensitive actions, which are signing, filing, passing
an order and deleting, and attempt each with a stale session and with a fresh one.
Time out an idle session and confirm the token is invalid server-side, not merely
cleared in the browser.

**Pass when.** Idle sessions expire server-side inside the stated window, absolute
session lifetime is capped, and every sensitive action requires a factor supplied
inside a short re-authentication window.

### Audit logs for all data mutations

**Spec.** [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) for what an entry must carry.

**Anchor.** itact:sec_7 · itact:sec_7A

**How to test.** Perform one of every mutation and diff the audit table. Attempt to
modify or delete an entry as an administrator. Confirm the entry survives an
application-level delete of the record it describes.

**Pass when.** Every mutation records actor, role, timestamp, target, and the before
and after state; the log is append-only and retained independently of the record; and
no application role holds update or delete rights over it.

### CERT-In guidelines (mandatory for Indian government-adjacent systems)

**Spec.** [CERT-In Directions under section 70B, 28 April 2022](https://www.cert-in.org.in/Directions70B.jsp), in force from 27 June 2022.

**Anchor.** itact:sec_70B

**How to test.** Work the April 2022 directions item by item: clock synchronisation to
the NIC or NPL servers, 180-day log retention within India, and the six-hour incident
reporting path with a registered point of contact. Then run a tabletop exercise
against a simulated breach and time the report.

**Pass when.** Clocks sync to the named servers, logs are retained in India for 180
days, a point of contact is registered and reachable, and the tabletop produced a
filed report inside six hours.

### MeitY security audit before go-live

**Spec.** The auditor must be [CERT-In empanelled](https://www.cert-in.org.in/); the empanelment list and its scope are published there.

**Note.** The source marks this as likely rather than settled, given the court
partnership. Confirm the obligation with the partner High Court before treating it as
binding, and record the answer.

**How to test.** Engage a CERT-In empanelled auditor for a full application and
infrastructure audit of the release that will actually ship. Track every finding to
closure and obtain the clearance. Re-audit after any change to authentication,
authorisation or data handling.

**Pass when.** A current safe-to-host certificate from an empanelled auditor covers
the deployed version, every finding is closed or accepted in writing, and the
certificate has not lapsed.

### IT Act 2000 + DPDP Act 2023 compliance

**Spec.** The IT Act is in this corpus. The [Digital Personal Data Protection Act, 2023](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf) is not, and the DPDP Rules were notified on 14 November 2025, so read the Act with the Rules rather than alone.

**Anchor.** itact:sec_43A · itact:sec_72A

**How to test.** Map each obligation to a control: sections 43A and 72A under the IT
Act, and under the DPDP Act notice, consent or legitimate use, purpose limitation, the
data-principal rights, breach notification and the rules on children's data. Establish
for each processing purpose whether a judicial-function exemption applies, and write
down the reasoning either way. Have counsel review the map.

**Pass when.** Every processing purpose has a named lawful basis, the map is reviewed
by counsel and dated, and the breach-notification path has been exercised in a
tabletop rather than only described.

### Data minimisation, only collect what is needed for the case

**Spec.** DPDP section 6, which limits consent to the personal data necessary for the stated purpose. [The Act](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf).

**How to test.** For every field in the filing and profile schemas, name the
provision, rule or workflow step that needs it. A field that cannot be traced to one
comes out. Cross-check against the Requirements layer, which already binds fields to
their authority.

**Pass when.** Every collected field traces to a stated need, nothing is collected
against possible future use, and the trace is re-run whenever the schema changes.

### Explicit consent flows for data use

**Spec.** DPDP sections 5 and 6, notice and consent, read with the DPDP Rules, 2025. [The Act](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf).

**How to test.** Walk each point where consent is claimed and check it against the
DPDP notice requirements: itemised, plain language, available in the state language,
and as easy to withdraw as to give. Then attempt to proceed while declining an
optional use, and confirm the flow continues.

**Pass when.** No pre-ticked box, no bundled consent, optional uses genuinely
optional, withdrawal one screen away, and every consent event logged against the
version of the notice that was shown.

### Right to correction/erasure where applicable

"Where applicable" carries the weight here. A court record is not freely erasable, and
the record and retention requirements already in the corpus govern what may move.

**Spec.** DPDP sections 12 and 13, the data principal's rights. [The Act](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf). What overrides them for a court record is in this corpus, under the REC requirements.

**How to test.** Exercise a correction request and an erasure request end to end.
Confirm the system distinguishes data that may be corrected on request from record
that may only be altered by judicial order, and that it tells the person asking which
one they have hit.

**Pass when.** A correction path exists with a stated turnaround, erasure is honoured
wherever no retention rule or judicial function bars it, a refusal cites the rule it
rests on, and the refusal reaches the person in language they can act on.

### Clear data retention and deletion policy

**Spec.** DPDP section 8(7) for erasure once the purpose is spent. The retention floor for a court record is not in the DPDP Act: it is in the state's own record rules, already held here.

**Anchor.** itact:sec_7

**How to test.** Compare the implemented retention schedule against the record
retention rules already held in the corpus for that state. Then confirm deletion
actually runs, by checking backups, search indexes, caches, logs and any analytics
copy rather than only the primary store.

**Pass when.** A written schedule exists for each class of data, it matches the
state's own rules, automated deletion runs and is monitored, and a deleted record
cannot be recovered from any secondary store once its window has passed.

## Performance

The relevant device is a mid-range Android phone on an intermittent connection in a
district court corridor, not a laptop on office broadband.

### Core Web Vitals thresholds (LCP under 2.5s, CLS under 0.1, INP under 200ms)

**Spec.** [Web Vitals](https://web.dev/articles/vitals). Worth saying plainly: this is a Google benchmark, not a standards-body specification. It is used because the field data exists, not because anyone published it as a norm.

**How to test.** Lighthouse CI on every build with a budget that fails the pipeline,
plus field data from real users segmented by device class and network. Measure the
pages that carry the work, which are the cause list, the filing form and the document
viewer, rather than the landing page.

**Pass when.** The 75th percentile of field data meets all three thresholds on mobile,
and the lab budget holds on every release.

**Check.** [PageSpeed Insights](https://pagespeed.web.dev/) - paste a URL, returns both the lab run and the real-user field data where the site has enough traffic · [WebPageTest](https://www.webpagetest.org/) - paste a URL, runs it on a chosen device and connection

### Graceful degradation on low bandwidth

**How to test.** Throttle to a 2G profile and to a 3G profile with 400ms latency and
run the critical journeys. Simulate packet loss and a disconnection mid-upload.
Establish what the user sees while a request is slow, and whether a retry can
duplicate a filing.

**Pass when.** Every journey completes on the 3G profile, an interrupted upload
resumes or fails without losing the work, retries are idempotent, and the interface
shows progress rather than an unexplained wait.

**Check.** [WebPageTest](https://www.webpagetest.org/) - paste a URL and pick a 2G or 3G profile and a real device; it will also record the filmstrip, which is what shows the user what the wait looks like

### Offline-first or progressive loading for document-heavy pages

**How to test.** Load a case carrying a realistically large bundle of exhibits and
measure time to first readable page. Confirm the viewer pages or streams rather than
fetching the whole document. Drop the connection mid-read and resume.

**Pass when.** The first page renders without waiting for the whole file, memory stays
bounded on a mid-range device, and a dropped connection does not lose the reader's
position.

### Mobile performance parity

Not responsive design but actual performance, on the mid-range Android devices people
in court corridors are carrying.

**How to test.** Test on real mid-range hardware, named once and held to across
releases, rather than on an emulator or a flagship. Run the same journeys as on
desktop and compare them. Watch main-thread time, memory and battery over a long
session, not just a cold load.

**Pass when.** The critical journeys complete on the named target device inside the
same thresholds, no journey exceeds a stated multiple of its desktop timing, and
nothing crashes or reloads under memory pressure.

## Interoperability

**Check.** [PageSpeed Insights](https://pagespeed.web.dev/) - paste a URL and read the mobile tab · [WebPageTest](https://www.webpagetest.org/) - paste a URL and run it on a real mid-range Android device rather than an emulated one

### eCourts / NJDG API compatibility

**Spec.** [eCourts Services](https://ecourts.gov.in/) and the [National Judicial Data Grid](https://njdg.ecourts.gov.in/), both eCommittee, Supreme Court of India.

**How to test.** Exercise every integration point in a test environment: case
registration, cause list, order upload, disposal reporting. Reconcile a batch of cases
end to end and diff both sides. Then test the unhappy path, where the remote is down
or answers with something unexpected.

**Pass when.** A reconciliation over a full day of cases shows no divergence, every
field maps without loss, and a remote outage queues rather than drops.

### CIS 4.0 data schema alignment

**Spec.** [Case Management through CIS 4.0](https://ecommitteesci.gov.in/publication/case-management-through-cis-4-0/), eCommittee, Supreme Court of India.

**How to test.** Map each entity and field to its CIS 4.0 counterpart and record the
gaps in both directions. Round-trip a sample case through export and import and diff
it. Check the code lists, which are case type, disposal reason, act and section,
against the CIS masters rather than against local strings.

**Pass when.** The mapping is complete and documented, a round trip is lossless for
every mapped field, code lists derive from the CIS masters, and every unmapped field
has a stated reason for being unmapped.

### Open API Documentation

**Spec.** [OpenAPI Specification](https://spec.openapis.org/oas/latest.html), currently 3.x.

**How to test.** Generate the OpenAPI description from the implementation rather than
maintaining it by hand, and run a contract test that fails when the two diverge. Then
have someone outside the team build a small client from the published document alone.

**Pass when.** A current OpenAPI 3.x document is published for every public endpoint,
contract tests pass in CI, each endpoint documents its authentication, errors and rate
limits, and the outside integrator finished without asking the team a question.

## Usability

**Check.** [Swagger Validator](https://validator.swagger.io/) - give it the URL of the published description and it will tell you whether the document itself is valid

### Plain language standards

Instructions should sit at roughly a Class 8 reading level.

**Spec.** [ISO 24495-1:2023](https://www.iso.org/standard/78907.html), Plain language, Part 1. It deliberately measures whether readers can find, understand and use the text rather than trusting a readability formula, which matters here because the English formulas do not transfer to Indian languages.

**How to test.** Score every instruction, error and notice with a readability measure
calibrated for the language it is written in, rather than applying an English formula
to a translation. Then test comprehension with actual litigants: ask them to say what
a screen wants before they act on it.

**Pass when.** Instructional text scores at or below Class 8 in each language, a legal
term that cannot be simplified is glossed on first use from the vocabulary this model
already holds, and litigants restate the ask correctly.

### Error messages must be specific and actionable

Not "invalid input".

**Spec.** [WCAG 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html) and [3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion.html).

**How to test.** Enumerate every validation rule and trigger it, recording the message
the user actually sees rather than the one in the code. Judge each on three counts:
does it say what is wrong, where, and what to do. Include server errors and upload
failures, which are reliably the worst ones.

**Pass when.** No message is generic, every message names the field and the fix, none
leaks internal detail, each exists in the state language, and each is announced to a
screen reader.

### No dark patterns

No pre-ticked boxes, no confusing opt-outs.

**Spec.** India has its own instrument: the [Guidelines for Prevention and Regulation of Dark Patterns, 2023](https://consumeraffairs.nic.in/theconsumerprotection/guidelines-prevention-and-regulation-dark-patterns-2023), notified by the CCPA on 30 November 2023 under section 18 of the Consumer Protection Act, 2019, naming thirteen patterns including confirm shaming, forced action and false urgency. The [deceptive design taxonomy](https://www.deceptive.design/types) is the wider vocabulary.

**How to test.** Review every consent, opt-in, default and confirmation against a
named dark-pattern taxonomy. Check the default on each form and the relative
prominence of accept against decline. Then attempt to decline, leave or delete, and
count the steps against the steps it took to agree.

**Pass when.** No optional consent is pre-selected, declining is no harder than
accepting, there is no confirmshaming and no false urgency, and no default is set
against the litigant's interest.

### Form recovery

Partial saves, so a long filing form does not lose someone's progress.

**How to test.** Fill a long filing form partway, then in turn close the tab, kill the
browser, lose connectivity and let the session expire. Return after each and check
what survived. If a draft is meant to follow the user, test it across devices.

**Pass when.** Work survives every one of those cases up to a stated interval, the
user is told a draft exists and when it was saved, and recovery never silently
overwrites newer work.

### Consistent UI patterns across modules

**Spec.** [WCAG 3.2.3 Consistent Navigation](https://www.w3.org/WAI/WCAG21/Understanding/consistent-navigation.html) and [3.2.4 Consistent Identification](https://www.w3.org/WAI/WCAG21/Understanding/consistent-identification.html) are the floor; the rest is the design system's own business.

**How to test.** Audit each module against the design system and ask, for each
recurring pattern, whether it uses the library component or a local copy. Inventory
the divergences. Then ask a user who learned one module to complete the equivalent
task in another without instruction.

**Pass when.** Every recurring pattern comes from the shared library, no module holds
a bespoke copy of a shared component, terminology matches the vocabulary this model
holds, and the transfer task succeeds unaided.

## Content & Legal

### Bilingual interface requirement for High Court jurisdictions (English + state language)

**Spec.** [GIGW 3.0](https://guidelines.india.gov.in/) for the bilingual expectation on a government service. The court-specific obligation runs off Article 348, which is in this corpus.

**Anchor.** constitution:art_348

**How to test.** Establish the language obligation for the specific High Court from
its own rules and any Article 348 notification, because it is not uniform across
states. Then check coverage across the interface, the help, the errors, the notices
and the generated process and documents. Verify the translations with a court user
rather than only with a translator.

**Pass when.** The obligation is recorded per state with its source, both languages
cover every string including generated documents, switching language does not lose
state, and no screen falls back to English silently.

### Disclaimer and terms of use appropriate for a quasi-government service

**Spec.** [GIGW 3.0](https://guidelines.india.gov.in/) sets terms of use, disclaimer and copyright policy as mandatory for a government website.

**How to test.** Have counsel draft and review against the actual posture: what the
platform is, what it is not, who is liable for what, and what the court's role in it
is. Confirm the disclaimer is reachable from every page and shown before first use,
and that it does not claim to give legal advice or to be the official record where it
is not.

**Pass when.** Counsel-reviewed terms and disclaimer are published and dated,
reachable from every page, acknowledged at first use, and the limits on the platform's
status are stated in plain language in both languages.

### Grievance redressal mechanism (required for public digital services under IT Act)

**Spec.** The [IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021](https://www.meity.gov.in/static/uploads/2024/02/Information-Technology-Intermediary-Guidelines-and-Digital-Media-Ethics-Code-Rules-2021-updated-06.04.2023-1-2.pdf), rule 3(2): a named officer, acknowledgement in 24 hours, resolution in 15 days. Amended since, most recently in October 2025, so check the current text. [GIGW 3.0](https://guidelines.india.gov.in/) carries the same expectation for a government site.

**Anchor.** itact:sec_79

**How to test.** Work the IT Rules requirements: a named grievance officer with
published contact details, acknowledgement within 24 hours, resolution within 15 days.
File a test grievance and time the path end to end. Confirm the escalation route
beyond the officer is stated somewhere a person can find it.

**Pass when.** The officer's name and contact are published on the site, a filed
grievance is acknowledged inside 24 hours and resolved or explained inside 15 days,
the ticket trail is auditable, and escalation is documented.
