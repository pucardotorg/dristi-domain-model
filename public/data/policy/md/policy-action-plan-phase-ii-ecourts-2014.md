<!--
  HOW THIS FILE IS WRITTEN - the Policy page parses it, so keep the shape.

    # Title           the document's own title. The page titles itself from
                      policy.json, so this line is not rendered.
    > line            an editorial note from this corpus, NOT the document. It is
                      rendered inset and labelled as such, wherever it appears.
    ## Name           a part of the document. This document prints no part over its
                      fourteen chapters, so they sit under no `##` at all; each of
                      the five annexures is its own `##`, because an annexure is
                      numbered inside itself and not in the chapter run.
    ### N. NAME       one numbered unit - a chapter, or an annexure.

  THE CITABLE UNIT. This is a programme and funding document, not a rulebook, and
  the judgment about what `###` should be is worth stating. The chapter is the only
  numbered thing in it that is unique across the whole document and the only thing a
  reader cites by number and name - "Chapter 5", "Annexure 2-I" - so the chapter and
  the annexure are the `###` units. Inside a chapter the document runs two
  independent number series that both restart at 1: the EXECUTIVE SUMMARY list at
  the head of the chapter, and the numbered body paragraphs under it ("1. Journey so
  far:", "2. Goalposts to reach:"). A paragraph number therefore means nothing
  without its chapter - the document itself cites them that way, "paragraph 14 of
  Chapter 2", "Para 11 of Chapter 2" - so those numbers are transcribed as the text
  prints them and are not made units. There is no citable numbered unit below the
  chapter; inventing one would assert a structure the document does not have.

    (a) (i) A.        a clause. The marker is kept exactly as printed - this
                      document letters its clauses (a), (b), then (i), (ii), then
                      A., B., C. - and the converter derives the eId from it.

  Everything that is not a `>` line is the document, transcribed verbatim. Nothing
  is summarised, reordered or renumbered. Add a document by dropping its markdown
  in this folder and naming it in policy.json - no new code.
-->

# Policy and Action Plan Document, Phase II of the eCourts Project

> Transcribed from the PDF published by the eCommittee, Supreme Court of India,
> which is kept alongside this file at
> `policy/sources/policy-action-plan-phase-ii-ecourts-2014.pdf`. The wording is the
> document's, character for character, checked against the source text. This is a
> historical document: it is the policy and action plan for Phase II of the eCourts
> Project as approved on 8 January 2014, and Phase II has since been superseded by
> Phase III. It is kept because the architecture the Indian district judiciary runs
> on today - CIS core and periphery, NJDG, the State-cloud model, FOSS only, the
> Litigants' Charter of services - is specified here.
>
> What was changed, and nothing else was: the running page footer ("eCourts Project
> - Phase II - Policy & Action Plan - eCommittee, Page N of 91", and its
> "Page N of 6" equivalent inside Annexure 2-I) is dropped; the digital-signature
> stamp overprinted on the index page ("Signature Not Verified / Digitally signed by
> ASHOK TARACHAND UKRANI / Date: 2014.01.24 15:03:39 IST / Reason:") is dropped,
> being an artefact of the signing rather than text of the document; and the
> "Annexure N-X" running head that repeats at the top of every page of an annexure
> is dropped, the annexure designation being carried once by the `##` heading
> instead. The source spells that running head "Annexire 1-I" on Annexure 1-I; the
> index page and every other annexure spell it "Annexure", and the `##` heading uses
> the correct spelling.
>
> The source sets ordinal suffixes as superscripts. A text extractor reads a
> superscript as a separate run and puts a space before it, so "31st March" comes
> out of the PDF with the "st" detached. The suffixes are written closed up here,
> as the printed page sets them, because a superscript has no plain-text form.
>
> Tables are set as markdown tables where the shape survives. Five could not keep
> their printed shape and are declared where they appear: the day-wise
> eTransactions table, the "Rationale for 2 + 6 Systems" table, the Litigants'
> Charter, "eCourts: Country wide status", and the A/B/C table in Annexure 2-I. Two
> tables break across a page and reprint their header row; the reprinted header is
> dropped. The document contains no figure, diagram, chart or image - the "chart" it
> refers to at Chapter 1, paragraph 1(f) and at 1(c) is a table, and `pdfimages`
> reports no image anywhere in the file.
>
> A chapter is printed as two lines, "CHAPTER 5" on one and the chapter's name on
> the next. The two are folded into one heading, `### 5. SYSTEM AND APPLICATION
> SOFTWARE FOR COURT PROCESSES`, and the word "Chapter" is carried by `unit.label`
> in policy.json rather than repeated here. The EXECUTIVE SUMMARY line that opens
> most chapters is left where it is printed, as the first line of the chapter.
>
> The document's own slips are kept as printed, among them "Annexire", "Balanace
> Courts", "herreinabove", "technolgoies", "Brij Mohal Lal", "under trail
> prisoners", "Chhatisgarh"/"CHHATTISGARH", and the blank Budget column in the cost
> estimation table of Chapter 14, which the approved document leaves unfilled.

ECOMMITTEE SUPREME COURT OF INDIA

POLICY AND ACTION PLAN DOCUMENT

PHASE II OF THE ECOURTS PROJECT

(as approved on 8th January, 2014)

INDEX

> The index is printed as a two-column list, the chapter on the left and its page
> number on the right. Each entry is transcribed as one line, the page number last.

1. Introduction 1

2. Implementation Model 10

3. Institutional Structure 23

4. Infrastructure Model 30

5. System and Application Software for Judicial Processes 46

6. Scanning, Digitization and Digital Preservation of Case Records 53

7. Video-Conferencing for Courts and Jails 57

8. Capacity Building Measures 59

9. Judicial Process Re-engineering 64

10. Workflow and Process Automation Tools and Measures 68

11. Judicial Knowledge Management System 72

12. Human Resources 77

13. Services Delivery 83

14. Cost Estimation 90

Annexures:

• 1-I Activities approved in Phase I

• 1-II Suggested three phases in report of NPAPIICT

• 1-III Present status of Phase I infrastructure and software implementation

• 2-I Extension/transition of Phase I to Phase II of the eCourts project

• 2-II Total Courts as on 30th November, 2013

### 1. INTRODUCTION

EXECUTIVE SUMMARY

1. During Phase I of the eCourts Project, in a very large number of Court Complexes, Computer Server Rooms and Judicial Service Centres have been readied. The District and Taluka Courts as covered in Phase I of these Court Complexes have already been computerized, with installation of hardware, LAN etc. and Case Information Software (CIS). Consequently, these Courts are now providing basic case-related services to litigants and lawyers.

2. The e-Courts National portal (ecourts.gov.in) was launched by Hon’ble the Chief Justice of India on 7th August, 2013. This provides cause-list, case status information in respect of more than 2.5 crore cases (pending and decided) and has sometimes reached daily ‘hits’ in excess of 7 lakhs which is growing exponentially every week. This is a part of the National Judicial Data Grid that has been made operational and will be improved in a phased manner.

3. The e-Courts National portal also provides training material for judicial officers and staff, links to District Court websites and statistical reports that can be used as a judicial management information system. This portal is expected to play a key role in bringing about judicial reforms. The etransactions services of the eCourts portal as per etaal.gov.in have crossed 2.2 Crore.

4. A large number of District Courts have launched their websites for the convenience of litigants and others have been provided with a template for easy launch of a website.

5. Change Management exercise has been successfully implemented. All judicial officers in the country have been trained in the use of computers through 218 judicial officers who had been trained as Master Trainers for continuing training programmes. 219 CIS Master Trainers (District System Administrators) have been trained from amongst the court staff in the use of the Case Information Software. These CIS Master Trainers have trained more than 4000 System Administrators in the effective use of computers and CIS.

6. All High Courts are in the process of providing unique identification numbers to all judicial officers. Many High Courts have already completed this exercise.

7. All High Courts have taken up Process Re-engineering exercise, thereby having a fresh look at processes, procedures, systems and Court Rules.

8. Unified National Core version 1.0 of the Case Information Software has been developed. This is in use in almost all States. The process of migration of old data into the Unified National Core CIS version 1.0 is in progress.

9. Data entry of pending cases is in progress and has reached an advanced stage of completion.

10.The process of implementation of the Project has shown that many new courts have come up in the last several years and many more will come up. Provision needs to be made for newly established courts and courts that will come up in the near future. Similarly, the strength of judicial officers has also increased. They too need to be provided for.

11. Wide Area Network connectivity needs immediate and effective attention to enable availability of information to litigants.

12.A large number of activities including scanning or digitizing case records, judicial and administrative automation etc. will be taken up in the next phase of the Project.

13.Cloud computing model will be implemented in the next phase of the Project.

1. Journey so far:

(a) Like all other organs of democracy, Judiciary is also endeavoring and persevering earnestly to transform itself by implementing tools and means of Information and Communication Technology (ICT). As a part of National eGovernance Plan (NeGP), eCourts Project is an Integrated Mission Mode Project under implementation since 2007 for Indian Judiciary based on the ‘National Policy and Action Plan for Implementation of Information and Communication Technology in Indian Judiciary’ (NPAPIICT), prepared by the eCommittee of Supreme Court of India in 2005 and approved by the Chief Justice of India. The activities under the Project which were approved by the competent authority for implementation, are enclosed at Annexure-1-I.

(b) NPAPIICT Report had suggested three Phases for implementation of the Project. The details of these Phases are enclosed at Annexure-1-II. While several activities suggested in these phases are being implemented in the ongoing phase of the Project, there are a number of activities which are yet to be undertaken in order to reach a holistic state of ICT enablement of the Courts which is ideally required as per the National eGovernance Plan (NeGP).

(c) The chart at Annexure 1-III (as provided by NIC) indicates, at a glance, the implementation of the Project as on 30th November, 2013 about the components of site preparation, LAN implementation, hardware installation and software deployment.

(d) With the infrastructure and software in place as stated above, most District Courts have been able to provide basic services of filing, scrutiny, registration, allocation, cause-list generation and orders/judgments uploading in large number of cases etc. by using the software provided under the project.

(e) On 7th August 2013, Hon’ble the Chief Justice of India launched the e-Courts National portal of the eCourts project. The portal showcases the National Judicial Data Grid which provides, inter alia, training material for judicial officers and staff and general information to the public and will eventually be a very powerful mode of communicating all aspects of judicial reforms. More than 8000 Courts have secured their presence on the National Judicial Data Grid (NJDG) portal ecourts.gov.in and are providing Case Status, Cause lists online with some of them also uploading orders/judgments. Data of more than 2.5 crore pending and disposed cases is available on NJDG at present.

(f) The number of daily hits on the e-Courts National portal has reached more than 10 lac a day as per the National eTransactions Portal www.etaal.gov.in The total e-transactions so far since the launch of the portal have cross 2.2 Crore. The following chart shows the exponential growth of the hits on the eCourts National portal for availing the services:

Month-wise eTransactions through eCourts National portal

| Sr. No. | Duration | No. of eTransactions |
|---|---|---|
| 1 | 07-08-2013 to 31-08-2013 | 1,05,790 |
| 2 | 01-09-2013 to 30-09-2013 | 13,42,894 |
| 3 | 01-10-2013 to 31-10-2013 | 31,09,045 |
| 4 | 01-11-2013 to 30-11-2013 | 41,33,381 |
| 5 | 01-12-2013 to 30-12-2013 | 1,34,87,618 |

Day-wise eTransactions – December, 2013

> The day-wise table is printed as two side-by-side halves, 1st to 15th December on the
> left and 16th to 30th on the right. Both halves are kept, as the four columns they are.

| 1st to 15th | No. of eTransactions | 16th to 30th | No. of eTransactions |
|---|---|---|---|
| 01-12-2013 | 2,04,103 | 16-12-2013 | 7,60,297 |
| 02-12-2013 | 1,64,747 | 17-12-2013 | 6,83,037 |
| 03-12-2013 | 1,74,620 | 18-12-2013 | 6,09,130 |
| 04-12-2013 | 1,67,563 | 19-12-2013 | 5,23,059 |
| 05-12-2013 | 1,69,181 | 20-12-2013 | 4,30,330 |
| 06-12-2013 | 1,72,030 | 21-12-2013 | 5,18,803 |
| 07-12-2013 | 1,87,539 | 22-12-2013 | 76,934 |
| 08-12-2013 | 3,99,592 | 23-12-2013 | 6,011 |
| 09-12-2013 | 4,16,217 | 24-12-2013 | 1,68,123 |
| 10-12-2013 | 4,10,515 | 25-12-2013 | 7,53,453 |
| 11-12-2013 | 3,65,668 | 26-12-2013 | 15,70,321 |
| 12-12-2013 | 3,09,304 | 27-12-2013 | 10,75,418 |
| 13-12-2013 | 3,05,471 | 28-12-2013 | 10,92,861 |
| 14-12-2013 | 2,10,411 | 29-12-2013 | 8,41,234 |
| 15-12-2013 | 3,07,127 | 30-12-2013 | 4,14,519 |

Note: The e-transactions include the services of Case Status, Cause-list, Cases Filed and Cases Registered.

(g) As many as 400 District Courts have launched their websites, either of their own design or developed as per the template provided by the Project.

(h) As a part of the Change Management programme, more than 14,000 Judicial Officers have been trained in the use of Ubuntu-Linux Operating System (for their laptops). This has been achieved by training 218 judicial officers from all over the country as Master Trainers in different locations around the country.

(i) Similarly, more than 4000 Court Staff have been trained in Case Information Software as System Administrators. This has been achieved through training 219 Court Staff as CIS Master Trainers (District System Administrators) at the Maharashtra Judicial Academy and the Chandigarh Judicial Academy.

(j) An exercise has been initiated by requesting every High Court to provide a Unique Identification Number (UID) to every Judicial Officer. The UID will be prefixed with two alphabets representing the State, as for example with motor vehicles. The proposed time-line is 31st December, 2013. This information will be uploaded on the e-Courts portal. This will assist the High Courts in maintaining an accurate record of all judicial officers.

(k) An exercise in Process Re-engineering has already commenced. All High Courts have set up Process Re-engineering committees to modernize the processes, procedures and Civil Court/Criminal Court Rules. The Process Re-engineering committees are expected to complete the exercise by 31st January, 2014.

(l) A Unified National Core CIS software has been developed with the assistance of NIC Pune for use in all the District and Taluka Courts all over the country. This has been implemented in all the States and migration of existing data is expected to be implemented in almost all the States by 31st March 2013.

(m) Entry of case data is complete in some States, while adequate progress has been made in other States. On completion of data entry, every litigant can access information about his/her case from the e-Courts National portal.

2. Goalposts to reach:

An analysis of the conceptualization, planning and strategy of the first phase of the Project suggests that there are some more goalposts to cross. Delivery of all the services by all the Courts, optimum automation of case workflow, use of computers by all important sections of the Registry for day to day processes and service delivery, unified CIS for all Courts, timely and regular updation of data on NJDG by all Courts, discontinuation of manual registers, ideal Central Filing Center with sufficient infrastructure, judicial performance assessment through ICT, scanning and digitization of the case records, court record room management automation, Court Libraries Computerization, Video Conferencing for all Courts with Jails, Legal Aid Offices (DLSA/TLSC) ICT enablement, WAN (Wide Area Network) connectivity for all Courts, solar energy for power backup, mobile based service delivery through SMS and Mobile Apps etc. are just a few of the many important objectives. In order to achieve them, the Court ICT enablement approach needs to be so taken up that the infrastructure for not just the Court Room but also for the Registry (Sections) of the Court Complex is provisioned. This is indispensable for ensuring optimum automation of judicial and administrative processes and also the ideal delivery for the litigant centric services. Sufficiency of the infrastructure keeping in view this aspect is a major goal to be achieved through next phase of the eCourts Project.

3. Miles yet to go:

Most of the deficiency in uploading of data onto NJDG and therefore the lack of delivery of services online is attributed to issues relating to lack of effective, stable and reliable WAN connectivity for the Courts. This aspect of WAN connectivity which has assumed almost as much significance as availability of electricity for a system to work; deserves immediate and effective attention. Howsoever robust and efficient the hardware and the software provided may be, this hindrance of connectivity becomes a bottleneck so serious that it chokes up the whole flow of information to the beneficiaries thereby making the achievements made so far immaterial for the litigants and the society at large.

The ongoing exercise of Process Reengineering in the eCourts project as initiated by the eCommittee, is expected to generate a huge requirement of implementation in the area of overhauled processes being followed in the day to day functioning of the Courts. The change, abandonment or new introduction of processes, apart from being brought in force through amendment in rules, will also need meticulous implementation through a major revamping exercise of customization and redesign of the present Case Information Software. This exercise will need considerable planning and design efforts in addition to the efforts and time for development as well as roll out of the reformed and reengineered CIS.

The quantum of hardware provided in the present phase being too less, the optimum computerization of court processes has not been possible. The quantum of hardware was calculated on per Court Room basis with just one slimline PC and three thin clients per Court. Experience has shown that this number is too low as sections/registry of the Court also need to be considered for hardware for effective and optimum ICT enablement. This lack or paucity of hardware has also been a major reason for not wholly shifting to computerized processes from the manual processes. Considering this condition of the Courts which have been covered under the Project, the Courts not covered for computerization or established after its commencement but during the continuation of the present phase cannot get fully integrated with the NJDG. Also given that more hardware is required (in the registry, for instance) and that many courts in dilapidated, tenanted and newly established buildings have not yet been covered for computerization, full integration of all district and subordinate level courts in the country into the NJDG and the consequent benefits of NJDG for performance and analysis is yet to happen.

New courts are being added from time to time based on the decisions taken by respective High Courts and State Governments, decision of the Supreme Court in Brij Mohal Lal case on 19.4.12 to create additional 10% positions in subordinate judiciary, and the policy decision to double the existing strength of judges in a period of five years. Some of the newly created courts are being established in existing court complexes already covered by eCourts project and there is inevitably a time lag between their operationalization and computerization. Therefore, there are always courts that are not computerized, whether in existing or new court complexes. This results in difficulties for Judges to base their analysis on all existing courts and for lawyers and litigants to be sure whether benefits of computerization have accrued in courts they are litigating in. The uneven spread and availability of ICT resources creates a more difficult and intriguing situation for the Judges, Lawyers and litigants alike, specially where some Courts in the same Court Complex are still on manual processes even for basic needs like cause list generation etc. whereas all other Courts in the same complex are doing most of their day to day work on computers. As accretion of courts in a Court Complex may be a continuous process and there may always be a lag between establishment of an additional court and its computerization, it is necessary to provide for ICT infrastructure requirements well before or at least at the time of notification of a new court.

Needless to say that, mere creation of additional Courts is not sufficient for reducing the backlog of cases. Only technological enablement of the Courts will effectively address the situation and would eventually fructify the real objective of the creation of additional Courts. It is high time that the additional Courts created during or before this phase of the project are immediately taken up for computerization with an added provision of also covering the yet to be created Courts at least till a cut-off date not earlier than two years of the three year duration of the next phase of the project.

With the advent of new technologies in the area of hardware, networking etc. the model based upon cloud computing concepts needs to be implemented instead of the present model of distributed and decentralized server infrastructure so as to reap the fruits of scalability, flexibility, economy, optimum use of resources offered by cloud computing model etc.

In addition to the above measures, in order to fully sync the Court processes with the latest trends in e-governance, activities like scanning/digitization of case record, document management system for digital archiving/storage/retrieval, business intelligence tools enabled management information systems, judicial and administrative workflow automation etc, are required to be taken up at the earliest possible opportunity as their implementation will require a considerable quantum of efforts, funds and time.

4. Hence another phase:

As a natural phenomenon, the journey covered so far with awareness about the goalposts yet to reach and the miles yet to go has made the stakeholders more impatient to see the justice delivery system of the country optimally transformed by way of modernization enabled by information and communication technology, thereby necessitating an immediate next phase of the e-Courts project which succeeds the current phase without any gap of time or efforts and also carries forward all pendencies, arrears and remainder resources of this phase to the next phase.

Thus, an inevitable component, apart from the other components stated hereinafter, of Phase II of the Project, will be to also serve as a complementary phase to the current phase by taking care of all the pending objectives and targets of this phase in itself with regard to the deliverables of Phase I for all the Courts covered and the Courts covered but not fully accomplished due to time-lags or other operational issues etc. The budgeting of Phase II of the Project will have to be done accordingly. This roll-over component will ensure a seamless transition of the Project to the next phase.

This policy and action plan document proposes the policy as well the implementation model for next phase that is Phase II of the eCourts Project.

Annexures of Chapter 1

1-I – Activities approved in Phase I

1-II – Suggested three phases in report of NPAPIICT

1-III – Present status of Phase I infrastructure and software implementation

### 2. IMPLEMENTATION MODEL

EXECUTIVE SUMMARY

1. Experience has shown that decentralization of responsibilities is absolutely necessary. This has also been agreed to by the High Courts.

2. Consequently, at the ground level, the implementing agency will be the High Court. This will include implementation of LAN and procurement of hardware, its maintenance and upkeep.

3. The procurement will be as per the Procurement and Finance Model given in this chapter.

4. Policy inputs including for developing software (Open Source) will be provided by the e-Committee; technical and development support for CIS will be provided by NIC.

5. Financial disbursement arrangements will be so made which are conducive to optimum decentralization and also effectively eliminate delays in project implementation.

6. Project Monitoring Units (PMUs) will be set up at eCommittee and Department of Justice (DoJ) to assist the e-Committee and the DoJ in day to day monitoring of the Project.

7. Accurate and complete information regarding the number and location of courts and number of judicial officers needs to be collected immediately.

8. The formula for providing computers for the courts and laptops to judicial officers will be based on A= courts and judicial officers already covered in phase I; B= courts and judicial officers not covered in phase I due to increase in numbers or any other reason; C= courts and judicial officers that will come into existence till 31st March, 2016. Therefore, the total Courts and Judicial Officers to be covered will be A + B + C.

9. The project period for Phase II will be 3 years with additional adequate support for sustenance after this period.

10.Warranty period and obsolescence for computer hardware will be taken as 3 years and 5 years respectively.

1. Decentralization:

From the experience gained during the present phase of the project, one of the most important lessons learnt is that the majority of the implementation issues have their causes in too much of centralization of the implementation process in the project. This has led to a situation leaving little or no discretion with the High Court and District Courts for even minor implementation issues. One glaring example of this predicament of High Courts and District Courts is that of dealing with vendors of hardware, LAN and UPS. The vendors having been selected and contracted for by and at NIC, Delhi level do not consider themselves accountable to the High Court / District Courts.

That apart, this factor has also been responsible for not infusing a sense of ownership and leadership amongst the High Courts / District Courts in the implementation of the Project. The aspect of decentralization has already been experimented with regard to construction of Computer Room, supply of DG Sets and Technical Manpower and has worked well so far. Technical manpower agency was earlier managed centrally and for last more than a couple of years, the funds have been transferred to High Courts to engage technical manpower required for project implementation for the remaining man months through an agency or directly. The D. G. Sets for all High Courts have been procured in a decentralized manner from the funds transferred from the Project.

It is therefore necessary that the procurement and supply of computers and indeed of all hardware, should be decentralized. In principle, this has been agreed to by the High Courts and also approved in the meetings of the eCommittee. The Project must be decentralized with greater responsibility being placed on the High Court to ensure that infrastructure, hardware and day-to-day issues are taken care of at their end.

At the same time, eCourts Integrated Mission Mode Project, being a Central Project under the NeGP Plan and for reasons of ensuring uniformity of infrastructure in Courts across the country, it becomes necessary to decide the design and specifications of the infrastructure at a central level. This is also significant from the point of view of software to be used and services to be rendered being more or less unified and centralized with only some variations from State to State. Hardware Infrastructure to be provisioned to the Courts from the eCourts Project, in order to be compliant and seamlessly integrated with rest of the components of the Project, will be recommended along with specifications centrally by the eCommittee with inputs from Department of Justice (DoJ), NIC and other concerned expert and experienced entities in the field.

In view of the above, optimum decentralization deserves to be adopted in the implementation of the Phase II of the Project. In the new decentralized model to be adopted in Phase II, financial disbursement arrangements will be so made as are conducive to optimum decentralization and also effectively curb delays in Project implementation. The finance and procurement model will finalized in consultation with the High Courts and guidance and directions from Hon'ble the Chief Justice of India.

The High Court will be the agency responsible to deal with the vendors for the hardware and LAN components in the Project. It will also be open for the High Court to engage any agency for preparation of the site as per the specifications prescribed in the Project. Greater flexibility in the implementation of LAN will have to be provided to the High Courts keeping in view the localized vendor availability and its implementation being a major factor of delays.

The design and specifications of the hardware to be procured will be finalized by the eCommittee in consultation with the DoJ, NIC and any other expert technical persons/entities in the field.

The High Court will directly deal with the vendors making the performance of the Project tasks within the time-frame the responsibility of the High Court. The eCommittee or DoJ shall not directly deal with the vendors for the hardware procured for the High Courts or District / Taluka Courts etc.

2. Infrastructure Procurement and Deployment:

As per the policy statement in the paragraph above, the function of infrastructure procurement and its deployment as per the Project guidelines will be entrusted to the High Courts. This infrastructure includes, hardware LAN, UPS, DG sets in the Courts, multiple WAN connectivity from Courts upto SWAN leading to State Data Centres (SDCs) and other equipments being provisioned from the Project from time to time. Any procurement process by the High Courts will be as per the applicable rules to them. The tender publication in the procurement process will also be through Tender ePublishing mechanism offered by Central Public Procurement Portals (www.eprocure.gov.in) or the State Procurement Portal as applicable. eProcurement through such portal will also be preferable if possible and as feasible.

The model for procurement of hardware by High Court and the funds disbursement for the same will be as follows:

Finance and Procurement Model in Phase II of the Project

1. The minimum specifications for procurement of hardware will be decided by the e-Committee in consultation with NIC. Each High Court is at liberty to improve upon the specifications.

2. NIC already has empanelled vendors for e-governance projects. The cost price of each hardware item is either available with each vendor or may be obtained by NIC based on the minimum specifications decided by the e-Committee in consultation with NIC. (say Rs. Z).

3. As only FOSS applications will be used in the hardware being procured, no purchase of any software will be provisioned.

4. The number of items required for each Court/Court Complex is as per the number approved in the Project. (Say 2+6=X).

5. The total requirement of hardware to be procured will be based upon the proposals received from High Courts. (Number of Courts/Court Complexes multiplied by X=Y).

6. The fund requirement for the purchase of Y amount of hardware at Rs. Z per unit can be calculated and transferred to the High Court by the Department of Justice.

7. Thereafter the High Court can adopt either Option A or Option B, that is

(a) Option A:

i. The High Court will directly issue to an empanelled vendor the Purchase Order, and ensure the procurement and installation of hardware directly by the vendor, as per the minimum specifications (X), for the approved quantum (Y) and at a cost of Y multiplied by Rs. Z.

ii. If the High Court is desirous of purchasing hardware having improved or better than the minimum specifications, any additional cost in procurement will be borne by the High Court.

iii. The purchase contract will be only between the High Court and the vendor on mutually acceptable terms.

(b) Option B:

i. The High Court will, on its own, carry out the entire tendering process, procurement and installation of hardware directly and independently, as per the specifications (X) given in the central procurement process to procure hardware of quantum Y.

ii. If the High Court is desirous of purchasing hardware having improved or better than the minimum specifications, any additional cost in procurement will be borne by the High Court.

iii. The tendering process will be through Centre/State eProcurement portal.

iv. Upon completion of the tendering process, the Department of Justice will transfer the requisite funds (Y multiplied by Rs. Z) to the High Court.

v. If the tendering process results in an amount in excess of the funds transferred the High Court will bear the extra expenditure incurred.

vi. If the tendering process results in the tender being awarded for an amount less than the funds transferred, the balance will be immediately returned to the Department of Justice.

8. The High Court will directly provide a utilization certificate to the Department of Justice within 30 days of installation of the hardware.

3. Implementing Agency:

In the arrangement of decentralized procurement and vendor management and only centralized design and specifications as given above, the Project cannot go ahead with a unified single agency as an implementation body for the Project. As most of the implementation issues being related to the supply, installation and commissioning of the hardware/LAN infrastructure and the localized efforts involved in service delivery, each High Court will be designated as the Implementing Agency for all the tasks involved upto the Service Delivery by way of actualizing the Litigants Charter of Phase II of the Project.

4. Ownership and Leadership:

The High Courts will be impressed upon to own and lead the Project in their respective jurisdictions as per the plans and policies envisaged in the eCourts Project. There cannot be true element of ownership and leadership in the implementation of the Project in real sense of the word, unless the High Courts have a role in selection of vendors, deciding their terms of references, Service Level Agreements (SLAs), payment terms, vendor obligation enforcement mechanism etc. All this can only be ensured by the arrangement as recommended in paragraphs hereinabove. With effective and optimum arrangement of decentralization and the scope of decision making for resolving implementation issues by themselves being in place, the sense of ownership and leadership becomes a natural phenomenon and also a responsibility coupled with authority for the High Courts.

5. Infrastructure Costing:

At the time of finalization of design and specifications at the central level, the approximate competitive cost of the equipment to be procured will be recommended. Any procurement of the same by the High Courts will have to be ensured within that cost. The amount will be transferred on finalization of such procurement process by the High Courts. This will be according to the Decentralization Finance and Procurement models to be finalized. There should be a scope of increase in the cost upto 10% for unforeseen or beyond control reasons like price hike etc.

6. Infrastructure and Services of National Informatics Centre (NIC):

There will be continued contribution for the Courts across the country from the resources of National Information Centre (NIC) for Data Centre Infrastructure at National as well State level along with the Disaster Recovery infrastructure, NICNet, Email Portal, NICCA for Digital Signatures for Judicial Officers and Court Officials, Software Development for CIS Core and Websites that is eCourts Portal, NJDG, District Court websites etc. SMS Gateway Infrastructure, FOSS guidance and consultation through Open Technology Group (OTG)-NIC-Chennai and other services and infrastructure of NIC presently available or coming up in future.

Role of NIC infrastructure becomes important for the reason that the Judiciary now would gradually shift to Cloud Computing model using the two tier Cloud Model that is State Level Clouds at State Data Centres (SDCs) for all the Courts of the particular State for all day to day Application and Data Server purposes and National Level Cloud at National Data Centre (NDC) as Disaster Recovery cum Backup Resource.

Courts across the country would also avail the services and infrastructure expertise of NIC to be a part of the National Knowledge Network (NKN) and National Optical Fibre Network (NOFN). In addition to assistance from experts of the respective divisions of NIC to the eCommittee in arriving at the design, specifications and costing of the infrastructure of the Project to be procured by the High Courts, NIC State Coordinator stationed at High Courts / State HQs will be instrumental in coordination and assistance in realizing the Project requirements at High Court level with regard to aspects relating to NDC, SDCs, Cloud for Courts at SDCs-NDC, NKN, NOFN, SWAN-NICNet Integration, WAN for Courts, coordination for Periphery Development and integration of the same with the Core as per eCommittee guidelines etc.

7. Software Resources:

System and Application software as covered in Chapter 5 hereinafter, will be decided centrally by the eCommittee. This is vital for ensuring uniformity and standardization in all softwares being used in the eCourts Project across the country. All the Software Solutions to be deployed for the Courts as a part of initiatives of the eCourts Project will only be Free and Open Source Solutions (FOSS) which also have community driven support on the web. FOSS without any licensing / subscription charges will only be considered for adoption for which the complete source code with build and installation procedures can be made available to the Courts. This is for ensuring that the support on FOSS can be managed through in-house experts and competing multiple vendors who have domain expertise for support and customization of the same.

Further details for System and Software Solutions, Case Information Software (CIS) in the eCourts Project and Workflow/Process Automation software intended to be implemented and any other FOSS Applications are dealt with in the respective chapters on them.

8. Project Management and Monitoring Mechanism:

eCommittee and DoJ will have Project Monitoring Units (PMUs) within their offices for effective management and monitoring of the Project. eCommittee will have to undertake overall management of the Project to ensure that the Project is heading in the right direction and with the right optimal speed. Department of Justice will be monitoring the budgetary aspects and also the timelines of the implementation as per the Project objectives. Thus there will be following mechanism to monitor Phase II of the Project:

(a) eCommittee – PMU with an exclusive Member of the eCommittee [Member (Project Management)] looking after the day to day management and monitoring of the Project activities for their timely and proper execution assisted by a Personal Assistant and team of a Branch Officer, one Sr. Court Assistant , two Jr. Court Assistants, Data Entry Operator and Office Assistant support staff etc.

(b) DoJ – PMU with Joint Secretary, DoJ and a team comprising of a Director/DS with a PA, an Under Secretary with a PA, a Section Officer, two assistants, a typist and an outsourced expert in project management looking after day to day managing and monitoring of the Project for budgetary aspects, release of funds and timely completion of financial deadlines, responsibilities towards the parliament etc

9. Project Progress Monitoring System (PPMS) portal: The present PPMS (Project Progress Monitoring System) portal will be overhauled and revamped with more useful and MIS like features in order the facilitate both PMUs of the Project in effectively monitoring the progress and ensuring timely follow up action on any slippages in execution of the tasks. PPMS, though in a more robust form than present, may be eminently useful for PMUs to do constructive/timely monitoring. The requirements of resources like manpower or infrastructure may be met from the Project Management and Monitoring budget (Head No. 17) of the eCourts Project

10. Disbursal and Management of Project Funds:

(a) DoJ will take the necessary financial approvals from EFC and the competent authority for funds to be disbursed under the Project to High Courts for the Project components as per the Project approval. Empowered Committee will be authorized to reallocate funds across heads where recommended by eCommittee and considered feasible.

(b) A part of the funds under the heads of Project Management and Monitoring (Head No. 17 – Cost Estimates) will always be readily available for disbursement on due approval and rules/procedures on requirements related to Project Management and Monitoring by the eCommittee and DoJ PMUs.

(c) The funds under the heads Manpower Resources (Head No. 8), Software Development, Customization and Support (Head No. 14), Change Management and Capacity Building (Head No. 15), Judicial Process Reengineering (Head No. 16) will be disbursed on recommendation of the eCommittee.

(d) A contingency fund for emergency needs of eCommittee will be provided for in the proposal and drawn by eCommittee directly from DoJ.

11. Identification of Courts and Judicial Officers:

(a) Courts: All courts and court complexes (old and new) must be identified at the earliest. An exercise is presently underway (as a test), with the assistance of a mobile application software made available by DeitY on the lines of the application used by Election Commission of India (used for booth locations and number) to actually locate each court complex and the exact number of courts available in that complex. This exercise is proposed to be carried out with the active assistance of the District Judges. The proposed time-line of completion is 31st March 2014. The result of this exercise will be made available on the e-Courts portal. An overall formula for ascertaining the number of Courts to be covered by the Project is recommended as follows:

(i) A = Courts already covered under Phase I

(ii) B = Courts not covered / left out in Phase I

(iii) C = Courts to be created during Phase II of the Project upto a cut-off date.

Courts to be covered in Phase II of the Project =

A (for remainder and the obsolete hardware / LAN) + B + C

(iv) The cut-off date referred above will not be earlier than two years of the duration of the Phase II of 3 years that is if the Phase II is to commence from 1st April, 2014 the Courts that may be created upto 31st March, 2016 will be the figure at C above.. A tentative number as upper limit may be fixed for these Courts under category C keeping the target as per the judgment of the Hon'ble Supreme Court to double the judge strength in a period of five years. Taking the present strength of the Judicial Officers at around 16000, and the target of doubling the same in five years, 6400 Courts can be expected to be created in next two years that is the Project duration of the Phase II. Thus, for the figures under C category of Courts, the target number will be arrived at as 22400 Courts. A provision for adding more Courts than this figure, if created by 31st March, 2016 will also have to be made in the budget allocation.

(v) The remainder of the hardware/LAN for the courts of figure A above will be calculated by deducting the hardware/LAN provided in Phase I from the hardware/LAN to be provided in Phase II. If the hardware provided to Courts (under category A) is five or more years old, the same will be considered obsolete and full hardware as to be given in Phase II, will be provided to the Court. The cut-off date for calculating obsolescence of hardware will be the end of Project duration as referred above.

(vi) The inclusion of Courts in dilapidated/rented buildings will be considered with a yardstick of one year of duration of the Court expected to be there in such building. Thus the Courts which are expected to be shifted to new/other building in less than a year, will be considered only after being shifted. Another pre-requisite for considering Courts in dilapidated/rented buildings will be that on future shifting of such Courts from those premises, the expenditure of laying fresh LAN in the destination premises will be borne by the High Court / State Government. The Judicial Service cum Central Filing Centre may have to be arranged in suitable make-shift porta cabin.

(b) Judicial Officers: At any given time, it is not possible to say exactly how many judicial officers are in position. An exercise has been initiated by requesting every High Court to provide a Unique Identification Number (UID) to every Judicial Officer. The UID will be prefixed with two alphabets representing the State, as for example with motor vehicles. The proposed time-line is 31st December, 2013. This information will be uploaded on the e-Courts portal. Each High Court will have to take the initiative in completing this exercise and to keep the information up-to-date. An overall formula for ascertaining the number of Judicial Officers to be covered by the Project is recommended as follows:

(i) A = Judicial Officers already covered under Phase I

(ii) B = Judicial Officers not covered / left out in Phase I

(iii) C = Judicial Officers to join during Phase II of the Project upto a cut-off date.

Judicial Officers to be covered in Phase II of the Project for Laptops and Printers = A (for obsolete laptops/printers) + B + C

(iv) The cut-off date referred above will not be earlier than two years of the duration of the Phase II of 3 years that is if the Phase II is to commence from 1st April, 2014 the Courts that may be created upto 31st March, 2016 will be the figure at C above. A tentative number as upper limit may be fixed for the number of Judicial Officers under category C keeping the target as per the calculation given above with 5 % addition to the figures for the Judicial Officers who may not be holding Courts for being on deputation to High Court/State Govt/Judicial Academies or any other bodies. This is required as the number of Judicial Officers are always higher than the number of Courts for a High Court. The laptops should be provided for all Judicial Officers whether on judicial or non-judicial/administration duties. Thus the figure for arriving category C figure will be 22400 + 1120 = 23520.

(v) If the laptop and printer provided to the Judicial Officers (under category A) are five or more years old, the same will be considered obsolete and new laptop and printer as to be given in Phase II will be provided to the Judicial Officer. The cut-off for calculating obsolescence of hardware will be the end of the Project duration as referred above.

(vi) Thus most of the coverage of Courts and Judicial Officer will be finalized by 31st March, 2016 so that all the needful activities with regard to the implementation may be finished well before the end of the Project.

12. Contingency Budget Head: Like Phase I of the Project, a budget-head for contingency expenditure will have to be provided to meet with the urgent miscellaneous expenses for effective and expeditious implementation of the Project. Apart from the earlier purposes and tasks covered by contingency expenses like hardware/LAN issues hampering the implementation/sustenance of the Project, aspects like justified data entry expenses requirement for District Courts, Conferences/meetings arrangement, officials travelling expenditure by eCommittee/DoJ functionaries, equipments/infrastructure requirements for PMUs etc. will have to be covered by the contingency budget head in Phase II. This list is illustrative only and any incidental expenditure for meeting with the Project objectives may be met with from this head as per Project approvals from time to time.

13. The duration of the Phase II: Keeping in view the advancement of eGovernance in other sectors and the required pace to reach the optimum computerization in order deliver the litigant centric services at the earliest, it is intended to implement Phase II of the Project in an accelerated manner. All the infrastructure requirements will be provided in first year of the Project, the rest of the software and knowledge intensive activities and scanning/digitization are planned to be accomplished in the next two years of the Project. Thus the ideal timeline for Phase II of the Project with all the components as proposed in this document is three years. Although support for sustenance of the components of Phase II will have to be provisioned for adequate additional period.

14. Transition from Phase I to Phase II :

The resource requirement estimation for Phase II of the Project should be so done that all the pending tasks of the current Phase I are also carried forward to the Phase II of the Project. The carried forward arrears of the Phase I of the Project will be taken up for implementation along with the components of Phase II as per this policy and action plan of Phase II.

The budgeting of the Phase II will take care of all the pending objectives and targets of this phase in itself with regard to the deliverables of Phase I for all the Courts covered and the Courts covered but not fully accomplished due to time-lags or other operational issues etc. This roll-over component will ensure a smooth seamless transition of the Project to the next phase.

The transition from Phase I to Phase II of the Project is also required to be so managed that there is no halt of activities or gap in the Project durations between Phase I and Phase II. A separate note in this regard is annexed at Annexure 2-I with Annexure 2-II.

Annexures of Chapter 2

2-I – Extension/transition of Phase I to Phase II of the eCourts project

2-II – Total Courts as on 30th November, 2013

### 3. INSTITUTIONAL STRUCTURE

EXECUTIVE SUMMARY

1. The composition of the e-Committee generally remains the same. However, given the volume of work involved, one more regular member has been added and the list of invitee members has been made more broad-based.

2. The e-Committee will be involved in policy planning and providing strategic direction and guidance for the effective implementation of the Project.

3. In addition to its existing responsibilities, the DoJ will continue to monitor and assist in the implementation of the Project and will, additionally, be responsible to convene Empowered Committee as and when required.

4. The High Courts will be the implementing agencies for the Project in respect of the areas under its jurisdiction.

5. The High Courts will have the assistance of the High Court Computer Committee, Central Project Coordinator, District Court Computer Committees and a nodal officer for each district.

eCommittee is a body constituted by the Government of India under the Supreme Court of India for policy formation on and implementation of Information and Communication Technology in the Courts across the Country. eCourts Mission Mode Project, is a pan India Project funded by Department of Justice, Ministry of Law and Justice, Government of India for the Courts across the country. This necessitates closely coordinated efforts by eCommittee of the Supreme Court of India and the Department of Justice for realization of the goals set for ICT enablement of the Courts through eCourts Project. The proposed Implementation model as given in Chapter 2 hereinbefore will necessitate augmentation of teams at eCommittee as well as DoJ for effective and efficient management and monitoring of the Project. The detailed institutional structure for the purpose of implementation, management and monitoring of the phase II of eCourts Project is as follows:

1. Composition of the eCommittee, Supreme Court of India for Phase II:

(a) Hon'ble the Chief Justice of India as Patron-in-Chief of the eCommittee

(b) Hon'ble Judge Incharge, eCommittee.

(c) Regular Members:

(i) Member (Processes) : Generally to look after areas relating to implementation and application of Judicial Processes and automation thereof with respect to computerization of the Courts, documentation; aspects of judicial/administrative process workflow of Court functioning, Court Management and their incorporation in CIS, and eCommittee office administration, arrangements of Meetings, liasoning with and representation at DoJ and other Government Departments for Project implementation, eCommittee correspondence, coordination amongst Members-eCommittee.

(ii) Member (Project Management) : Generally to look after the Project Monitoring Unit (PMU) of the eCommittee and coordination with DoJ-PMU, also to look after overall day to day functions of the eCommittee-PMU and data collection and collation exercise and thereby consolidation of overall progress status of eCommittee and eCourts Project.

(iii) Member (Human Resources) : Generally to look after areas relating to management and monitoring of Human Resources provisioned through the Project, ICT training and capacity building of Judicial Officers and Court Officials, Tutorial Material and content development, Change Management exercise including the attitudinal and mindset change aspect

(iv) Member (Systems) : Generally to look after areas of Operating System and Application Software customization, deployment and development exercise being directly undertaken by the eCommittee and through other agencies like NIC and finalization of design and specifications of the infrastructure of Hardware/LAN/WAN etc. being provisioned under the eCourts Project.

A. Members at (i) to (iii) will be Judicial Officers called on deputation for eCommittee, Supreme Court of India from any of the States, of the rank of District and Sessions Judge or above or of the rank of Sr. Civil Judge / Chief Judicial Magistrate with overall service of more than 10 years in the Judiciary in the pay scale starting from Rs. 37400 – 67000 + 10000 (Pay band) or as per his/her cadre/scale in parent department as per rules followed in the Supreme Court Registry. Judge In charge / Chairperson eCommittee may also recommend any other suitable candidate of equivalent/comparable rank for any of these positions.

B. Members at (iv) will be officer on deputation or on post retirement assignment to eCommittee, Supreme Court of India, of the rank of Dy. D. G., NIC (or equivalent) with sufficient experience and know-how in the field of software development / customization / deployment essentially in the area of FOSS technologies, design and specifications of hardware/LAN/WAN etc. along with tender documentation and processing. The salary will depend on the parent cadre of the candidate in case of deputation and as per pay minus pension arrangement or as per rules applicable in Supreme Court Registry. Judge In charge / Chairperson eCommittee may also recommend any other suitable candidate of equivalent/comparable rank for any of these positions.

C. Additional contractual support staff will need to be supplemented from the eCourts Project under the Manpower Resources head as given in Chapter on manpower resources.

(d) Invitee Members:

(i) Attorney General for India (ex-officio)

(ii) Solicitor General of India (ex-officio)

(iii) Hon'ble Judge from any High Court

(iv) Sr. Advocate, Supreme Court of India

(v) Representative of Bar Council of India

(vi) Secretary General, Supreme Court of India (ex-officio)

(vii) Secretary, Department of Electronics and Information Technology, Govt. of India (ex-officio)

(viii) Secretary, Department of Justice, Govt. of India (ex-officio)

(ix) Mission Director, eGovernance, DeitY (ex-officio)

(x) Director General, National Informatics Centre (NIC) (ex-officio)

(xi) Director General, Centre for Development of Advanced Computing (CDAC) (ex-officio)

(xii) Joint Secretary (Plan Finance II), Department of Expenditure, Govt. of India

(xiii) Joint Secretary and Mission Leader, eCourts MMP, DoJ

A. List of Invitee Members of the eCommittee will be open for review and revision by the Judge In charge/ Chairperson-eCommittee / Hon'ble the Chief Justice of India

B. Judge In charge eCommittee and/or CJI will be authorized to invite or co-opt additional members depending upon the subject to be discussed.

(e) Functions and Role of the eCommittee: eCommittee will provide policy planning, strategic direction and guidance to the Project for effective implementation of all components of the Project, the aspects incidental thereto and for resolution of issues hindering implementation of the Project.

2. Department of Justice, Govt. of India

(a) Role and Functions:

(i) Department of Justice (DoJ) will be responsible for necessary financial and other approvals from competent authorities, convening of the Empowered Committee and for disbursement to High Courts or other approved agencies at Centre for various Project components. The Empowered Committee shall be chaired by Secretary (Justice) and have as members representatives of eCommittee, Planning Commission, Department of Expenditure, DeitY and IFD of Ministry of Law and Justice.

(ii) DoJ will also be monitoring the budgetary aspects and also the timelines of the implementation as per the Project objectives through its Project Monitoring Unit that is DoJ-PMU, as well as be responsible for matters relating to Parliament.

(iii) Empowered Committee will be competent to re-allocate funds within various Project components within the overall numerical and financial ceilings of the Project, including on recommendation of the eCommittee.

3. High Courts:

(a) Implementing Agency: As given in the Chapter 2 hereinbefore, the High Court will be the Implementing Agency for implementation of the Project in the Courts under its jurisdiction. This arrangement, apart from giving the requisite authority to High Court in resolving implementation issues, also entails responsibility to have the Project components implemented on time and the service delivery initiated as per the Litigants' Charter. For effectively implementing these objectives, the High Courts will continue to have the institutional structure as follows:

(i) High Court Computer Committee (HCCC): The High Court Computer Committee consisting of two or more sitting High Court Judges would oversee the various tasks related to implementation of eCourts Project components. The High Court Computer Committee would recommend various policy measures, administrative restructuring essential for ICT implementation in consultation with the E-Committee. Only the active participation, supervision and guidance of the High Court Computer Committee can ensure the successful implementation of the Project. This becomes more important in view of the effective decentralization being introduced in the Project and the High Court becoming the Implementing Agency of the Project.

(ii) Central Project Coordinator (CPC): The Central Project Coordinator would be a person of the rank of District Judge or Senior Civil Judge, who would co-ordinate the implementation of various modules/ tasks of the Project. The Central Project Coordinator would have a dedicated team of identified supporting staff. The CPC would coordinate with the eCommittee and the vendors, Connectivity Providers, State Data Centre, NIC-Pune team (for CIS) etc. for the implementation of all the tasks entrusted by the E-Committee. The Central Project Coordinator should be associated full time and exclusively for the eCourts Project. The responsibilities assigned to the Central Project Coordinator are quite onerous and the Chief Justice of the High Court may be requested to nominate a competent and efficient officer as a Central Project Coordinator. The Computer Committee of the High Court should ensure that the Central Project Coordinator adheres to the timelines and targets. Communication channels must be kept open with the eCommittee at all times through ecourts.nic.in that is the PPMS portal. The eCommittee will be accessing these websites on a daily basis. Central Project Coordinators should update the information on a weekly basis. It will be reiterated to the High Courts that the CPC should be exclusively working for computerization only and no other unrelated duty should be assigned to the CPC. Apart from the duties relating to infrastructure deployment, the CPC will also be responsible for overall control of the CIS Periphery Development Team in coordination with the High Court NIC Coordinator for periphery development and its proper integration with CIS Core as per eCommittee guidelines.

(iii) District Court Computer Committee (DCCC): The District Court Computer Committee would consist of one Senior Additional District Judge and two Sr. Civil Judges or one Sr. Civil Judge one Civil Judge along with District System Administrators and System Administrator trained during the Phase I of the Project. This Committee would perform the overall monitoring of the Project implementation in the District under the overall supervision of the Principal District Judge. This Committee would work in close co-ordination with the Central Project Coordinator (CPC) of the High Court. The committee would undertake the various tasks detailed in the subsequent chapters, at District and Taluka/Tehsil/Sub-division levels.

(iv) Nodal Officer for Every Court Complex: There will be a Judicial Officer designated as a Nodal Officer in every Court Complex who is well conversant with ICT concepts and takes keen interest in computerization of the Courts. The Nodal Officer of the Court Complex will be the point of day to day contact for the CPC of the High Court for follow up and monitoring of the Project progress and resolving the implementation issues.

### 4. INFRASTRUCTURE MODEL

EXECUTIVE SUMMARY

1. Emphasis will be on cloud computing and therefore Server Rooms (as at present) will be replaced by Network Rooms. The specifications of these rooms will be decided on the basis of the number of courts in the complex.

2. To the extent possible, the existing Judicial Service Centres will be utilized as Reception and Inquiry Centres and also as Centralized Filing Centres. Additional hardware will be required for this purpose.

3. Minimum hardware for a court room, for a court complex and for a judicial officer is discussed in this Chapter. It is proposed to provide for newly created courts, newly recruited judicial officers and those courts and judicial officers not covered in Phase I. Obsolete hardware has also been provided for. The calculation is based on the formula mentioned in Chapter 2 above. Future requirements based on the Project document have been provided for to avoid any mid-stream shortfalls.

4. Display monitors outside every Court Room and in the Bar Rooms as Display Board for litigants and lawyers are also provided for.

5. Computerization of the offices of District Legal Services Authority (DLSA) and Taluka Legal Services Committee (TLSC) has also been provided for in this Phase of the Project.

6. The emphasis in this Phase will be on cloud computing, which is more efficient and cost effective. The existing hardware, not necessary with cloud computing will not be discarded but utilized elsewhere or within the same court complex.

7. It is proposed that State Data Centres will be used for Private Court Clouds. Disaster Recovery Centres for these Court Clouds will also be needed.

8. Connectivity has been a problem in Phase I of the Project. Therefore, all resources will be utilized for better connectivity, including WAN, SWAN, NICNET, NKN, NOFN etc. This is important considering that video-conferencing will have greater emphasis in this Phase.

9. Dependence on power back-up such as DG sets and UPS will continue. It is, however, also proposed that solar energy may be utilized in court complexes wherever feasible.

The edifice of computerization (egovernance) stands upon the infrastructure through which its software and human resources function to deliver the intended services. Howsoever efficient the software and humanware may be, if the hardware/networking infrastructure is not of the desired design, quantity and quality, the resources invested on software, hardware and humanware are bound to under-perform, if not fail. It therefore becomes extremely important to provision the infrastructure considering the holistic vision of the output intended from the computerisation Project.

Sufficient Infrastructure the only option: The per Court and per Court Complex hardware infrastructure provided in Phase I of the Project has not been sufficient in actualizing a full-fledged computerized Court or Court Complex. The hardware has only been sufficient to use CIS for data entry, case updation, order/judgment writing and cause list generation. The Courts have not been able to fully shift to automated processes due to paucity of hardware provided and providing for obsolescence.

Phase II of the Project aims to take a holistic approach in computerizing and for automating the processes of the Courts, the requirement of hardware will be considerably higher than planned or provided in Phase I of the Project. For fully utilizing the infrastructure of Judicial Service Centre (JSC), using computers for process of Registry like certified copies issuance, process issuance, process service monitoring, judicial accounting, Court Library management, other workflow/process automation applications like eOffice etc. sufficient hardware infrastructure will invariably be required for all the Courts of the country.

The Working Group Report for the 12th Five Year Plan of Department of Justice, has also envisaged additional activities for inclusion in next phase of the eCourts Mission Mode Project that is use of solar energy, Video-conferencing facility for Jails, Enhancement of ICT infrastructure at Subordinate Courts, Digitization of old case records, Computerization of Judicial libraries, SMS Based Services, Touch Screen Kiosks etc. Therefore, the infrastructure model to be adopted in Phase II of the Project must holistically take care of all these aspects also.

Therefore, the following infrastructure model is necessary for effective implementation of the Project.

1. Sites - Network Rooms (NR): There have been two components of Sites that is Court Complexes namely Judicial Service Centre (JSC) and Computer Server Room (CSR). The Phase II of the Project will adopt the Cloud Computing Architecture for all application and database requirements for the Courts. Under the Cloud Computing Environment, applications and databases used by the Courts will be hosted in Cloud Environment facilitated at State Data Centres (SDCs). As the server infrastructure will not be required at Court Complexes coming up on Cloud, new Court Complexes to be computerized in Phase II of the Project will have a Network Room instead of Computer Server Room. Though the size and other amenities for the Network Room may be more or less similar to Computer Server Room.

The technical specifications of the Network Room to be set-up will be finalized as per the requirements of the Court Complexes of varying number of Courts. The methodology for optimum utilization of the server infrastructure provided at Court Complex level in Phase I is proposed hereinafter.

2. Sites – Judicial Service Centre (JSC): The Judicial Service (JSC) in the Court Complexes will be utilized as a hub for Reception cum Inquiry and also as a Central Filing Centre (CFC). The JSCs provisioned in Phase I of the Project could not be utilized as Central Filing Centres, since the allocated hardware was insufficient and in some cases, the space was insufficient. Therefore, Phase II of the Project envisages to optimally utilize JSCs also as Centralized Filing Centre which is more litigant friendly and economic in resource utilization. The JSC cum CFC will be utilized along with other services for the litigants like case status information, certified copies, inquiries etc. only except where it is not feasible to for space constraints to have a CFC. In new Court Complexes, the provision of JSC-cum-CFC with sufficient space and civil/electrical infrastructure will have to be ensured as primary requirement. The technical specifications of the JSC-cum-CFC to be setup will be finalized as per the requirements of the Court Complexes of varying number of Courts.

3. Court Local Infrastructure Requirement Assessment Method: For simplification of the resource requirement assessment and avoiding the failures posed by complex methods of requirement calculations adopted earlier, it is recommended to use method of prescribing minimum basic infrastructure per Court/Court Complex/Judicial Officer which then can be multiplied with number Courts/Court Complexes/Judicial Officers to arrive at total infrastructure requirement. The number of Courts/Court Complexes/Judicial Officer to be used as multiplier will be calculated as per the ABC formula given in Para 11 of Chapter 2 of this document.

(a) Basic Infrastructure Requirement for a Court Room: The Basic Infrastructure for Court Room has been calculated keeping in view (including) the requirements of Computers, Thin Clients, Printers etc. at JSC and CFC for all related functionalities thereat, Registry processes like Certified Copies, Computer Generated Summon/Notices/Warrants, Judicial Accounting (Nazarat Section), retrieval of scanned/digitized case records, Email for Court Officials, Workflow/Process Automation Applications for administrative processes, Court Library etc. The LAN points will also have to cater to the requirement of using the laptop of the Judicial Officer in chamber as well as on dais. The hardware requirement assessment has been proposed so as to take care of not only the Court Room judicial functions but also the functions associated with Court Administration and Court Management.

Basic Infrastructure Requirement for a Court Room

| Infrastructure Item | Quantity |
|---|---|
| Slimline PC with latest optimum configuration | 2 |
| Thin / Shared / Cloud Computing Client | 6 |
| Printers (1 MFD Printer with ethernet port + 1 Duplex Printer with ethernet Port) | 2 |
| LAN Points | 12 |
| Extra Monitor + 2 port VGA Splitter/Extension/Distribution Unit | 1 |
| UPS 2 KVA with 2 hour backup | 1 |
| Display Monitor for Current Case Display Board outside Court Room with basic shared computing or thin client | 1 |

These 8 systems can be 2 PCs with 6 thin clients as per the specifications prevalent in Phase I or 8 special configuration laptops having backup time of more than 3 hours. In case of laptops with this much backup time being provided, the UPS for the Court as given hereinbelow will be omitted.

(b) Basic Infrastructure Requirement for a Court Complex:

Basic Infrastructure Requirement for a Court Complex

| Infrastructure Item | Quantity |
|---|---|
| Projector with screen | 1 |
| Kiosk with Printing Facility | 0.2 |
| Printers (1 MFD Printer with ethernet port + 1 Duplex Printer with ethernet Port) (except single court complexes) | 2 |
| Big Display Monitor for Current Case Display Board in the Bar Room with basic shared computing or thin client | 1 |
| USB Hard disk for Backup ( 1 TB or above) | 1 |
| D. G. Set with Online UPS for Network Room 5/10/15 KVA with 2 hour backup | 1 |
| Racks + Switches and LAN Points for Network Room etc. | As per LAN WAN requirement |
| Authentication Devices with GPS, GPRS, Camera etc. for Process Servers | As per requirement |

(c) The minimum Kiosk to be supplied will be one for a Court Complex and the actual number of Kiosks to be supplied will be the number rounded off to nearest number. The number of Process Servers working with the District / Taluka Courts under each High Courts will have to be ascertained with regard to the infrastructure of Authentication Devices (e.g. PDAs) for Process Servers.

(d) The kiosk (with touch-screen and printer) will be a major tool for providing instant and most accessible litigant centric mechanism for service delivery. The services listed in Litigants' Charter in Chapter 14 have an important parameter whether the same are being provided through the Kiosk installed in the Court Complex. It is therefore proposed to provide for touch-screen kiosks with printer facility for all the Court Complexes wherein apart from viewing the information on the screen, the same can also be printed on the paper by the person accessing it. The charging mechanism may be either free or on nominal reasonable charges which do not require any human intervention and can be inserted in the machine itself like coins etc.

(e) Local Area Network:

(i) LAN Nodes location details will be finalized by the Administrative Head of the Court Complex with the assistance of District Court Computer Committee (DCCC) and Nodal Officer under the overall guidance of the High Court Computer Committee.

(ii) Site Preparation and LAN Implementation activities will have to be taken simultaneously as much as possible and in fast tracked mode.

(iii) All switches will be given requisite UPS with 2 hour backup time.

(iv) The LAN Points for JSC-cum-CFC and Registry will be provisioned from the 12 points per Court Room in as given in paragraph (a) above.

(v) The LAN points requirement has been arrived considering the usage of laptop by Judicial Officers, usage of LAN point for ethernet port enabled Printers and allocation/shifting of hardware to and from JSC-CFC and redundancy.

As it is very difficult if not impossible to calculate the exact number of Court Officials using computers for all of the above functions in different Courts of the country, the Base Unit of Infrastructure multiplied by the total number of Courts comes out to be the scientific and practicable method to calculate the total infrastructure requirements for the Courts. This model of requirement assessment leaves upon the wisdom and discretion of the Principal Judicial Officer (PDJ/PJ/DSJ/CJM/PSCJ/PCJ etc.) having overall administrative control over the Court Complex to optimally distribute the infrastructure with the prime objective of attaining the maximum delivery of litigant services coupled with maximum judicial output by the Courts concerned. The number of LAN points in the Base Unit of Infrastructure is to be so fixed which gives this flexibility to the Courts for optimal and variable arrangement of distribution of hardware. The priority of sufficient requisite allocation of infrastructure at JSC-cum-CFC functions will be impressed upon and periodically reiterated with the High Courts and District Court computer committees.

4. Rationale for 2 + 6 (8) systems in per Court-Room hardware:

As stated above, the hardware of 2 + 6 (8) systems has been arrived as per Court Hardware Requirement Assessment model instead of slab based model which also caters to all other computer systems requirements of all the judicial as well as administrative processes requirement. The calculation of ideal hardware requirement and conservative requirement taking into consideration multiple duties with same personnel and sharing of systems by multiple personnel in a Court may be tabulated as follows:

Rationale for 2 + 6 Systems in Court Room Hardware

> The "Rationale for 2 + 6 Systems" table merges cells down the Sr. No., Section and
> Conservative Requirement columns, one value covering the rows under it. Merged cells
> cannot be expressed in markdown, so the value is written on the row it is printed
> against and the rows it also covers are left blank. The table breaks across a page and
> reprints its caption and header; the reprint is dropped. The Section column is printed
> broken over lines - "Court-Roo / m" - and is closed up here.

| Sr. No. | Section | Personnel/Process | Computer Systems Ideally Required | Conservative Requirement |
|---|---|---|---|---|
| 1. | Court-Room | Bench Clerk / Reader / Shirestedar / Court Master etc. on dais | 1 | 2 |
|  |  | Steno on dais | 1 |  |
|  |  | Ahlmad / Case Record Keeper / Misc. Clerk in the Court Room | 1 |  |
|  |  | Judicial Officer | Judicial Officer's Laptop |  |
| 2. | Judge's Chamber / Steno Room | Judicial Officer | Judicial Officer's Laptop |  |
|  |  | Steno Room | 1 | 1 |
| 3. | JSC cum CFC | Filing/Scrutiny/Registration/Allocation | 1 | 2 |
|  |  | Enquiry / Case Status & all services mentioned in the Litigant's Charter to be delivered from JSC-cum-CFC | 1 |  |
|  |  | Certified-Uncertified Copies Issuance | 1 |  |
| 4. | Registry Sections | Process Issuance | 1 | 3 |
|  |  | Court Administration /Email for Court Officials/ eOffice (eFile/eHR/eLeave etc.) & other Office Automation Applications | 1 |  |
|  |  | Nazarat / Accounts | 1 |  |
|  |  | Record Room / Scanned / Digitized Records Access (DMS) | 1 |  |
| 5 | Court Library | Librarian | 1 |  |
|  |  | Library Assistant | 1 |  |
|  | Total.... | Computer Systems | 13 | 8 |
|  |  | Judicial Officer's Laptop | 1 |  |

In view of the above, the overall conservative requirement of hardware for a single Court is arrived at as eight systems (combination of slimline PC with thin-clients/shared computing clients or all special configuration laptops depending upon the suitability and economy). The LAN Points Requirement, in addition to for these eight systems, will also be required for Judicial Officers' Laptop at two locations (2), Display Board Monitor outside Court Room (1) and one for the Printer having ethernet port, will be 12 per Court.

In case of there being more number of Courts in a Court Complex, the hardware to be provided will calculated by multiplying the number of Courts to per Court unit hardware. When the number of Courts increases, the number of personnel working in the Court Complex also rises. The related administrative functions also multiply for proper court administration of the Court complex. All this increased administrative workload cannot alone be met with the per-Court Complex hardware provisioned above as there are no computer systems in the per-Court Complex hardware unit proposed.

There will be corresponding increase in the JSC-CFC Service Windows with the increase in the number of Courts in the Court complex. The more the number of Courts, the more is the Registry workload in terms of process issuance, copying branch, as there is direct impact on the process issuance and copying branch work with multiple Judicial Officers working in the same Court Complex / Judicial Establishment. There will also be a parallel impact on record room, library, office automation functions. Looking to the services to be delivered as given in the Litigant's Charter through JSC-CFC, Kiosk, Web, Mobile Application, SMS etc., there will be a considerable back-end workload for the Court Officials in order to deliver the services e.g. the back-end processes involved in issuing bar-coded digitally signed certified copies online etc.

Moreover, with the objective of eliminating manual registers (process re-engineering) and the pressure on timely and complete data entry due to the transparency brought about by computerization and automation, the output cannot be allowed to be adversely affected due to insufficiency of hardware.

Furthermore, by way of abundant precaution and to ensure optimum utilization of resources, there will be defined mechanism of approval of hardware requirement by the eCommittee as given in the paragraph 5 hereinafter.

5. Mechanism for vetting by the eCommittee of the proposals sent by High Courts for hardware requirement:

In order to ensure optimum utilization of hardware resources and to avoid any excess / shortage of hardware for the Courts, the proposals of overall hardware requirement for all the Courts under the High Court will be vetted/ratified by the eCommittee on the considerations of actual requirement of the Courts subject to the availability of sufficient Court Officials working on the systems. The approvals will be so accorded that the total requirements for all Courts under a particular High Court will be within the total hardware requirements for all the Courts calculated based upon the above given per Court and per Court Complex hardware requirement. As there may be variations in the deployment of basic computer infrastructure, based on court size; however, the overall average for the State would need to conform to the quantum of hardware as given in paragraph 3 above. The High Courts will draw proposals on the following criterion:

1. Readiness of site (JSC-CFC and NR) as per approved specifications with requirement power points

2. Availability of space for the hardware being sought

3. Availability of sufficient personnel to work on the hardware being sought

4. Justification of the hardware requirement keeping in view the workload, pendency, service transactions etc.

5. Undertaking to implement the Registry Process automation, library automation, scanning/digitization, Record Room Automation, office automation as the hardware requirement for the same is part of the per Court hardware calculation given above.

6. Undertaking to use only FOSS Applications as approved by the eCommittee with/onto the hardware procured from the project.

7. Undertaking to provision optimum/sufficient hardware for JSC-cum-CFC and to provide all the services as per the Litigant's Charter.

6. Basic Infrastructure Requirement for a Judicial Officer:

In phase I of the project, the Judicial Officers have been provided with a Laptop and a Laser Printer. Continuing this vital infrastructure in also in phase II of the project, laptop with printer and UPS for the printer will have to be provided in order to ensure optimum utilization of the same: The basic infrastructure requirement unit for a Judicial Officer will be as follows:

Basic Infrastructure Requirement for a Judicial Officer

| Infrastructure Item | Quantity |
|---|---|
| Laptop with webcam, multimedia, wifi etc. | 1 |
| Laser Printer | 1 |
| UPS (500-600 VA with 30 min backup) for printer | 1 |

7. Basic Infrastructure for Legal Aid if existing in the Court Complex:

The Legal Aid setup has become an integral part of the justice delivery system. The office of District Legal Service Authority (DLSA) and Taluka Legal Services Committee (TLSC) are required to work in tandem with the Court processes for holding of lok adalats, listing of cases in lok-adalats, the cause lists, proceedings, orders etc. in those cases. This requires the DLSA and TLSC office to be integrated with rest of the Court complex ICT infrastructure. The Member Secretary at DLSA is a Judicial Officer, who will also have to use the laptop for his official duties. Therefore, the infrastructure for DLSA/TLSC is highly necessary to be provided which is proposed as follows:

District Legal Services Authority (DLSA)

| Infrastructure Item | Quantity |
|---|---|
| Slimline PC with latest optimum configuration | 1 |
| Thin / Shared / Cloud Computing Client | 2 |
| MFD Printer with Duplex with Ethernet Port | 1 |
| LAN Points | 6 |
| UPS 1 KVA with 1 hour backup | 1 |

Taluka Legal Services Committee (TLSC)

| Infrastructure Item | Quantity |
|---|---|
| Thin / Shared / Cloud Computing Client | 2 |
| Printer (Duplex with Ethernet Port) | 1 |
| LAN Points | 4 |
| UPS 1 KVA with 1 hour backup | 1 |

8. Cloud Computing Architecture:

To keep up with the advancement in computing technology, it is now high time that computerization of Courts Project also adopts the Cloud Computing Architecture like other eGovernance Projects. The cloud computing environment offers unique and valuable benefits for an eGovernance Project including the reduction in server infrastructure cost, centralized/federated application management, efficient server and resources management, automated scalability of application/web/database servers, management of resources during high demand and peak time phases, technical manpower cost saving etc. The Government of India has also promoted on policy level the use of cloud environment for eGovernance Project. On studying the features of the cloud environment and looking to the requirements of the Courts Computerization, it is recommended to have Private Clouds based on Openstack Cloud at State Data Centres level for the Courts within that State with D. R. of all of the SDC Cloud Installations at National Data Centre (NDC) making it a two tier Cloud Environment for Courts of the Country. The Cloud Environment apart from covering the court in Phase II, will also cover the Courts already computerized in Phase I of the Project as the central application and database server for all Courts will be at SDCs only. The server infrastructure already provided in Phase I will be suitably utilized as given hereinafter.

9. Wide Area Network (WAN) Connectivity for Cloud:

Shifting to Cloud Environment will need meticulously coordinated efforts in phased manner on the part of eCommittee, DoJ, DeitY, NIC, NDC, SDC and High Courts. This will also call for a seamless, stable, reliable and secure connectivity from all Court Complexes in the country upto the State Data Centres located in the respective States. A right mix of options like SWAN, NICNET, 3G, Broadband, MPLS, NKN and NOFN, Wimax/VSAT can only ensure uninterrupted connectivity for the Courts across the country.

(a) Last Mile Connectivity with SWAN:

(i) The first preferred WAN infrastructure for the Courts will the State Wide Area Network (SWAN). It is required to ensure seamless, reliable, stable and uninterrupted connectivity from the Court Complex upto the nearest SWAN Point of Presence (PoP).

(ii) This connectivity upto SWAN PoP from the Court Complex will be with optimum bandwidth that can comfortably meet with the bandwidth requirement of the whole Court Complex. If the SWAN is not directly reaching by itself upto the Court Complex, the Project will have to provide for the infrastructure with recurring expenditure upto the Project period to have Last Mile Connectivity with Leased Line / Multiprotocol Label Switching (MPLS) / Wimax mechanism.

(b) Permanent Additional Connectivity Option upto State Data Centre: In addition to the connectivity provisioning suggested at (ii) above, at least one permanent additional (redundant/fallback) connectivity option by way of Hispeed Broadband or 3G connectivity with initial and recurring expenditure upto the Project period will have to be provisioned so as to enable the Court Complex connect directly upto State Data Centre through secured VPN connection.

(c) Difficult Terrain Connectivity Enablement: There will be required flexibility of connectivity provisioning in case of Court Complexes which are not able to get or have problems in getting quality connectivity as per the options (ii) and (iii) given above. For such cases, the option of VSAT should also be allowed for data uploading and server access mechanism. The VSAT would be considered in those cases where the Data volume is not high due to the availability of limited bandwidth through VSAT.

(d) SWAN and NICNet Integration: Still in a number of States, the SWAN is not fully integrated with NIC Network that is NICNet. As all the Court Complexes of the country have also to be integrated with National Data Centre (NDC) along with the access to NICNet (specially the 10 series URLs of NICNet), complete integration of NICNet with SWAN has to be provisioned. DeitY will be requested to make all efforts to extend the SWAN and NICNET to the District Courts, Taluka Courts and Jails to enable Video Conferencing.

(e) Disaster Recovery Site of all Court Clouds at SDCs at NDC: As the Court Clouds will primarily be at State Data Centres, a full fledged Disaster Recovery Mechanism will have to be put in place for all Court Clouds at National Data Centre.

(f) NKN and NOFN Infrastructure for Courts: It is proposed to have the all Court Complexes across the country included in the specialized high bandwidth networks being implemented in the country that is National Knowledge Network (NKN) and National Optical Fibre Network (NOFN). DeitY will be requested to make all efforts to extend the NOFN and NICNET / SWAN to the District Courts, Taluka Courts and Jails to enable Video Conferencing.

10. Utilization of Server Infrastructure already installed:

(a) As Cloud Computing Environment is being adopted for implementation in phase II of the Project, new Court Complexes will not require any server infrastructure as all application and database hosting needs will be catered to by Cloud Model only. The existing Court Complexes which already have server infrastructure and the same is not obsolete yet, will have to be optimally utilized even after the Court Complex shifts to Cloud Model.

(b) Multiple servers have been provided in Phase I of the Project. These servers may be so distributed amongst the Courts under the same High Court that each Court Complex has 1 server for being used as local back-up mechanism. This will ensure a local back-up server with almost all Court Complexes. This may need relocation of servers as deemed fit by the High Court and the related cost need to be provisioned by the Phase II of the Project.

(c) Any extra thin clients that State / High Court may plan to deploy to augment the infrastructure of the Courts, the extra processing capacity offered by the extra servers (except the local backup server) may be utilized to connect the additional thin clients to these servers through LAN infrastructure of the Court Complex.

11. Power Backup:

(a) D. G. Sets: The D. G. Sets as proposed above and supplied in Phase I of the Project will be continued in Phase II for the new Court Complexes including the requirements for JSC-cum-CFC. The High Court will be offered flexibility in quantity and configuration of the DG Set within the overall budget for the Court Complex / High Court.

(b) U. P. S.: A 2KVA U.P.S. with 1 hour back-up for every Court Room to support its local infrastructure including thin clients (provided in Phase I as well as to be provided in Phase II) has been proposed in the requirements given above. Individual UPS with every switch (provided in Phase I as well as to be provided in Phase II) should also be provisioned.

(c) Renewal Energy Alternatives - Use of Solar energy: In the first phase of the Project, primary backup has been provided through uninterrupted power supply (UPS) with two hour battery backup for servers and desktops. In addition, DG Set based power back up is also provided. But this is being provided for the server rooms and Judicial Service Centers. There is no provision for power back up facilities for thin-clients, printers and other hardware items. During the implementation of the current phase of the Project, it is observed that the power situation needs augmentation in several parts of the country in order to fully utilize the infrastructure provided and to deliver litigant centric services. An alternate uninterrupted source of power back-up, which is environment friendly and easily available can be considered, in the next stage of the Project. Solar energy based backup is proposed, as it will be not only be affordable but also dependable. The provisioning of the solar energy will have to be so planned that at least 50 % of the total Court Complexes (Phase I + Phase II) are covered with this power backup option.

12. Other Infrastructure for Courts/Court Complex: Apart from the infrastructure proposed above, other infrastructure relating to video-conferencing or any other component of the Project will be referred in the respective chapters on that particular component in this document.

### 5. SYSTEM AND APPLICATION SOFTWARE FOR COURT PROCESSES

EXECUTIVE SUMMARY

1. The thrust in Phase II of the Project will be on software applications (including mobile phone applications) and will be citizen-centric.

2. The e-Committee will be the deciding agency for software applications to ensure compatibility and uniformity.

3. Only Free and Open Source solutions will be implemented.

4. The existing core-periphery model of Case Information Software will continue, the core being unified and for ‘national’ use while the periphery being as per the local requirements of each High Court. NIC Pune will continue to be the centre for software development for CIS and related applications 5. Each High Court will have the responsibility of developing the periphery software and ensuring that it is compatible with the unified core. Each High Court will need to engage programmers for the development of the periphery software. However, the Project will provide programmers to each High Court for three years. 6. Software compatibility and interoperability, both horizontal and vertical is absolutely necessary and all High Courts will need to ensure this. 7. Documentation will be kept properly so as to ensure that change of personnel does not hamper software development. 8. All data, including meta data will be unified and standardized in this phase. 9. In all its activities, the e-Committee will take the assistance of experts from the Government, including DeitY, CDAC etc.

The efficiency and sufficiency of hardware is worth its value only when equally efficient and useful softwares are installed with allied support mechanism onto that hardware. One of the major underlying guiding principles in the implementation of Phase II of the eCourts Project is the adoption of the best of the FOSS Applications for the Courts across the country. Efforts will be made to implement Phase II of the Project as a quality software solutions centric Project, which effectively transforms and automates with processes of the courts and helps in considerably enhancing the overall output of the justice delivery system, both quantitatively and qualitatively. With this objective in mind, the software implementation in the eCourts Project will be carried out as follows:

1. eCommittee to be the Nodal Agency for policy on all Software Solutions provisioned through the eCourts Project: In order to ensure optimum uniformity in the software solutions in the eCourts Project across the country, the eCommittee will be nodal agency for policy on software solutions to be used on the hardware provisioned through the eCourts Project. This uniformity will ensure compatibility also in the initiatives going on at national level like National Judicial Data Grid (NJDG), integration of various stakeholders of the Justice Delivery System that is Jails, Police, FSL etc. in the vertical and horizontal integration of Case Information Software in the Courts of the country etc.

2. Free and Open Source Solutions (FOSS): All the Software Solutions to be deployed for the Courts as a part of initiatives of the eCourts Project will only be Free and Open Source Solutions (FOSS) which also have community driven support on the web. FOSS without any licensing / subscription charges will only be considered for adoption for which the complete source code with build and installation procedures can be made available to the Courts. This is for ensuring that the support on FOSS can be managed through in-house experts and competing multiple vendors who have domain expertise for support and customization of the same.

3. Operating System: Free and Open Source Desktop Linux Operating System as customized by eCommittee will continue to be supplied to the Courts for Laptops and other Computers being used by the Judicial Officers and the Court officials/officers. Linux OS for Server infrastructure as already provided in Phase I of the Project and the same for virtual / real servers to be used at State / National Data Centres will also be customized through eCommittee with assistance from Open Technology Group (OTG), NIC, Chennai. FOSS Software technology stack being implemented for various softwares and solutions in the Courts will be reviewed periodically or as and when required, by the eCommittee considering newer options and avenues coming up in the field of FOSS.

4. Case Information Software:

(a) Salient Features: The Case Information Software (CIS) deployed for District/Taluka Courts is a browser based application with open source technology stack for frontend / backend. The newer version of CIS to be taken up soon will be having improved user interface with workflow automation. The new version of CIS will be so developed that it is compatible with Cloud Architecture and also takes care of the Process Reengineering requirements of ongoing Process Reengineering exercise.

(b) eCommittee's role in Core-periphery Model of CIS: In order to ensure the uniformity and standardization in CIS across the country as per the approved Core-periphery model, the eCommittee will be the nodal centre for approval of functionalities in the Core of the CIS. Any improvement/addition etc. in Core may be made by the Courts through the respective High Courts which may then be considered at eCommittee for inclusion in CIS Core. The functionalities and specifications of the Periphery of the CIS will be finalized locally by the High Courts (depending on their requirements) ensuring that the Periphery is compatible with Core and the same will be integrated with Core as per the Core-Periphery integration guidelines to be finalized by the eCommittee with inputs from the NIC.

(c) Role of NIC in CIS: The role of National Informatics Centre (NIC)'s Software Development Centre at Pune has been pivotal in providing CIS development and customization services for the Courts across the country. All Courts will be migrated to the Unified National Core version of CIS as developed by NIC-Pune and will also be upgraded to newer versions of Unified National Core CIS as to be redesigned and reengineered as per the outcome of Process Re-engineering exercise going on across the country. The Case Information Software will be implemented as per the Core-Periphery model.

(d) The Core and Periphery Model: The Case Information Software (CIS) has been finalized as having two functional components of Core and Periphery. The core of the software has all the features and functionalities, with some configurable variances, as required by the Supreme Court, Parliament, the High Courts, the Central Government or any national agency. The core of the software shall not be open for customization. The core shall also not be distributed in source code form. Any modification relating to any feature of core of the software shall have to be sent to the eCommittee so as to maintain unified core of the software across the country.

(e) CIS Periphery: - Likewise, any case related information applicable at the State level as sought by the High Court, State Assembly, State Government etc. shall form part of the periphery. The features and functionalities requiring customization and development like various report generation etc. shall also be a part of periphery which shall be open for local NIC/High Court units for customization as per the guidelines of the High Courts and ensuring its compatibility with the Core CIS. Periphery part of CIS also will have to be Cloud Model compatible like the Core CIS. All development/customization of Periphery part of CIS will be so carried out so as to be compliant with the Core part of the CIS. Since software management is being decentralized, each High Court must make special efforts to engage programmers as per the requirement of each High Court. Manpower for Periphery Development will be provisioned for a period of three years from the Phase II of the Project.

(f) Role of High Court in CIS: There will be a major role of the High Courts in designing, developing and implementing the Periphery part of the Unified CIS, which will be integrated with National Core of CIS using the mechanism facilitated by NIC, Pune team. The Periphery will be so developed and implemented so as to make it compatible and complementary to the Core of CIS and without altering any of the features and functionalities of the Unified Core of CIS. The mechanism of integration of Core and Periphery of CIS will be finalized by the eCommittee with assistance and inputs from NIC. Provisioning of manpower for CIS periphery development will be ensured for the duration of the project for each of the High Court from the eCourts Project funds.

(g) Periphery Development Team: The management of manpower for CIS periphery will be carried out by the High Courts as per the guidelines to be issued by the eCommittee. The team working on the development of CIS periphery will be under the overall supervision control of the Central Project Coordinator of the High Court and the technical aspects of the development of the periphery will be coordinated by the High Court NIC Coordinator with NIC Pune team. The role of High Court NIC Coordinator will also be very important in order to ensure technical compatibility of the Periphery with the Core in coordination with NIC Pune team and also for the adherence to standard development best practices by the periphery development team. This team of professionals for development of the periphery of the new CIS and its rollout will also take care of installation of Unified Core of CIS as to be made available online on secured web resources. Thus the High Courts will have a pivotal role in overall implementation of CIS including the design and development of periphery part of CIS. Core-periphery implementation exercise will be governed by the CIS Guidelines to be given by the eCommittee from time to time.

(h) Horizontal and Vertical Integration of CIS: In order to achieve a seamless compatibility of application and data of CIS across all Courts of the country, the CIS should be horizontally and vertically integrated. By horizontal integration, the CIS of one District Court will be able to export to or import from the case-data of other District Courts, e.g. when a case is transferred from one Court to another or one Court Complex to another Court Complex, fresh data entry of the case will not be required and the system will be able to effect the transfer with all the case history details etc. intact in the system. By vertical integration the CIS of the Courts of different hierarchy, will be able to transmit data to and from each other e.g. a case record of a lower court directly being available to Appellate Court through a secured authentication mechanism, likewise an order issued by a Higher Court being reflected on the lower Court system of the concerned Court. This will require standardization of data structures, meta data etc. across the CIS at all levels of the Courts.

(i) Interoperability: One of the major baseline requirement of the Case Information Software to be refined and re-engineered in Phase II of the Project will its be its readiness for Interoperability with the central layer to be operational in the Integrated Criminal Justice System (ICJS). The integration of CIS (horizontal and vertical) as mentioned above, will only ensure its being communicative within judiciary. The interoperability compatibility of the CIS will ensure that the CIS is able to export / transmit the requisite information to the targeted stake holder that is police, jails, FSL etc. The information to be shared, with whom to be shared and the information that may not be shared with certain stakeholders will have to be worked out for this aspect of CIS.

(j) CIS for High Courts: The Case Information Software (CIS) presently being used at High Courts is of varying technologies and data structures at present. This difference of technologies and data structures may cause integration or interoperability issues. Recently, some High Courts have started to shift to Open Source Technology CIS from the earlier old technology (Foxbase etc.) CIS. This will need a migration exercise to be taken for porting of data to new CIS. In order to ensure uniformity of the central processes and data requirements and allowing variances of the local processes and data requirements, a CIS based on the Core Periphery model is proposed to be deployed for the High Courts also. Case Information Software for Supreme Court is ready and under deployment which is built on Open Source Technology stack. An attempt will be made to enable uniformity in data structures with local variances so that horizontal and vertical integration can be made possible.

(k) Documentation of CIS: In order to ensure smooth knowledge transfer and continuity of development and customization support for the CIS across the Courts, all documentation relating to CIS will be maintained properly. This documentation will involve the Functionalities Requirements Specification (FRS), Software Requirements Specifications (SRS), Data Flow Diagram (DFD), Entity Relationship (ER) Diagrams etc. Software Development team will have to ensure this. This is very vital so as to avoid problems of software customization and support when the teams working on software development change or some officials move on for other positions. There will be documentation of tutorials on CIS for coming versions also with audio video content on the same.

5. Other Workflow/Process Automation FOSS Applications: Other Free and Open Source Application software for workflow and process automation will from time to time be proposed for implementation for the Courts for various functions as given in Chapter 10 hereinafter. The implementation model for these application softwares will also be on the basis of Core Periphery model given above. The team of professionals working on periphery development as referred above will also look after implementation of these application softwares.

6. Standardization, Integration and Unification:

(a) Meta Data and Data Standards (MDDS): As per guidelines for the eGovernance Projects, the data structures and the meta data formats (that is the data about the data) are required to be standardized. This standardization has become more important and urgent in view of the inter-department or intra-department initiatives of integration and interoperability across the stakeholders of Justice Delivery System. MDDS will be finalized in coordination with DoJ and the High Courts.

(b) Case Type Standardization and Unification: The nomenclature of cases across the High Courts and the District/Taluka Courts is different across the country. This variance in case types and there being no mapping of case types between case types of different jurisdictions, may cause issues in aspects like integration of softwares across Courts, pendency and arrears assessment, policy making for Courts etc. In the Chief Justices Conference held in April, 2013 eCommittee was entrusted to work out and finalize the modalities to provide equivalent nomenclature to be included along with uniform nomenclature of the case types. This exercise will also have to be taken in coordination with High Courts.

7. Open Source Technology Support Mechanism: As all the software initiatives in the eCourts Project will be based on FOSS Applications, there will be considerable requirement of Support Structure for FOSS technologies. Entities/Vendors/Experts providing support and expertise on FOSS technologies will have to be empanelled/engaged for the Project period from the budget of the Project. Ultimate objective will be to strengthen the in house technical manpower for the same so that the sustainability of the FOSS applications deployed can be ensured even after the Project period is over.

eCommittee would also like to avail the resources and expertise of DeitY and its institutions like Centre for Development of Advanced Computing(CDAC) in ICT research and development for Courts, mGovernance initiatives for Courts, other value added eGovernance services and projects.

### 6. SCANNING, DIGITIZATION AND DIGITAL PRESERVATION OF CASE RECORDS

EXECUTIVE SUMMARY

1. Due to space constraints and large volumes of paper, some High Courts are looking at digitizing case records. Recently, the Supreme Court has also initiated this process and assistance is being taken from CDAC for digital preservation solution.

2. Phase II will provide for scanning/digitization of case records of High Court and District Courts.

3. Phase II will incorporate the latest technologies in scanning, digitizing and preserving case records with the assistance of experts from various Government organizations.

4. Long term digital preservation solutions in the form of trusted digital repositories will be implemented for the scanned/digitized records.

5. Use of Open Source technology will be strongly encouraged in preservation of case records.

6. Eventually, Phase II will move towards ‘less paper courts’ and finally towards ‘paperless courts’.

Although Paperless Courts across the country may be a dream, but at least 'Less Paper' Courts can made a reality by combining all the practical and implementable technical advancements offered in the ICT arena. To curtail use and handling of physical paper, the foremost necessity for the Courts is to start converting the existing case record to digitized form. This will entail a large scale scanning activity in the Court across the country. This will immensely help in saving of space and related infrastructure in preserving and retrieving the case record in a physical form. With this vision, the following activities in Phase II of the eCourts Project need to be provisioned:

1. Scanning and Digitization of the Case Record of High Court and District Courts: Case record of the pending cases and case record of the disposed cases which has undergone the basic weeding process will be covered in the process of scanning and digitization. The output file format of the digitized file will be PDF/A or its advanced versions with features like water-marking and digital signatures to ensure the authenticity of the digitized repositories to be created. For better search, access and retrieval of the free text search enablement of PDF/A output will also have to be done.

2. Document Management System: There remains no optimum utilization of digitized output unless it is ported to a Document Management System (DMS). A Free and Open Source Solution (FOSS) DMS will be the DMS for Scanning and Digitization project in the Phase II of the eCourts Project. The Document Management System (DMS) adopted in the Project being undertaken for scanning/digitization of Supreme court Case Record is DSPace (a FOSS DMS) with customization to suit the requirements of the Registry. Data Fields which will be minimum necessary for data entry in the DMS will have to be finalized. Specifications of the FOSS Document Management System to be deployed will also have to be finalized after assessing the requirements of meta-data for High Courts and District Court Case Records.

3. Implementation Model for Scanning and Digitization: The implementation model of the scanning and digitization activity for the case record of the High Court and District Courts will be similar to the implementation model being adopted for local infrastructure deployment as given in Chapter 2. In order to preserve unified and standardized digitization parameters, design and specifications will be finalized centrally for being adopted for this component of the Project. This is vital to ensure seamless integration and interoperability amongst the Document Repositories of the Courts across the country. The experiences gained at Supreme Court and other High Courts in this area will be useful reference for designing the methodology and specifications for this activity.

4. Long Term Digital Preservation of Case Records: In the process of digitization of documents, after conversion from hard to soft copy, the chief requirements for optimum and sustained usage of the documents are Retrieval and Preservation/Archival.

(a) Retrieval: The Retrieval is ensured by porting the soft copies of the data into DMS. The objectives achieved by retrieval is only limited to frequent day to day use of the documents and does not take care of long term preservation and archival of documents.

(b) Preservation/Archival: The digital documents, most of which generally form the backbone of knowledge and reference warehouse of Courts, needs to be preserved and archived for considerably long period of time which may span over decades if not centuries. The need for an archival solution arises because of the inability of the retrieval solution to serve for long term preservation. The main challenge in the way of regular and uninterrupted long term use of the soft copies of the digitized data that is archival and preservation is the frequent obsolescence of technology. The phenomenon of obsolescence of technology mainly hinders archival and preservation in terms of three aspects which are (I) Technology of the storage media, (ii) the software used to access the soft copy of the data and (iii) Type (format) of file in which the soft copy is saved in digital form.

(c) National Digital Preservation Programme: The experience of the IT industry so far shows that every five years or so the technology advancements brings about a drastic changes in the types of storage medias, softwares for accessing files and types of files in which the documents are stored. DeitY has established a Centre of Excellence for Digital Preservation under the aegis of Centre for Development of Advanced Computing (CDAC) as a part of National Digital Preservation of Programme (NDDP) of the Government of India. (http://www.ndpp.in/). The software solutions for digital preservation address the obsolescence of technology with a very strategic and sophisticated methodology. The three types of obsolescence as enumerated above are addressed and managed distinctively and in such a modular method wherein a shift in technology of any of these three aspects successfully fits into the solution in sync with each other. The mismatch of technology or software version or file type version is taken care of by maintaining a real or virtual integrated environment for supporting each of the storage media, software and file format in any of the versions of their life cycle.

(d) OAIS Framework: Foremost of the solutions in the sphere of long term digital preservation is OAIS (Open Archival Information System) framework. OAIS framework provides methodology of software solutions for digital preservation which provides continued access to digital materials for as long as necessary, involving the planning, resource allocation, and application of preservation methods and technologies to ensure that digital information of continuing value remains accessible and usable. It combines policies, strategies and actions to ensure access to reformatted and born digital content regardless of the challenges of media failure and technological change. The goal of digital preservation through OAIS is the accurate rendering of authenticated content over time.

(e) Trusted Digital Repositories (TDRs): CDAC has been working for implementing this framework based solution for District Courts of Delhi and Supreme Court on pilot basis by creating solution for establishing a Trusted Digital Repository. The ultimate benefit of scanning and digitization could be achieved when the need of preserving the physical case record is eliminated by means which offer reliable and established methods of Long Term Digital Preservation. Courts being one of the institutions with enormous record in physical form, Trusted Digital Repositories (TDR) for Courts will be highly necessary which may be considered for implementation in Phase II along with the Scanning and Digitization activity.

### 7. VIDEO-CONFERENCING FOR COURTS AND JAILS

EXECUTIVE SUMMARY

1. Presently, an exercise is being undertaken to assess the viability of a software based solution for video-conferencing. If this solution is found viable, it will be used to connect all district court complexes with all Central Jails and District Jails. Failing this, leased line connectivity with Studio based VCs will be utilized.

2. In any event, connectivity issues will need to be addressed and made reliable, stable and effective in all respects.

3. Video-conferencing in Phase II will go beyond routine remands and production of under-trial prisoners. It will be used initially for recording evidence in sensitive cases and gradually extended to cover as many types of cases as possible.

4. Video-conferencing in Phase II will be compatible with recording facility.

5. To effectively assist in recording evidence, a document visualizer will also be necessary in all district court complexes.

The need and importance of video-conferencing infrastructure for Courts does not need emphasis as experience has already shown that this infrastructure has proved to be of immense benefit to Courts, Jails, law enforcement agencies, government witnesses, litigants etc. It is therefore proposed to have this component extended in the Phase II of the Project also for its optimum implementation.

1. Coverage of Court trial for VC: It is imperative to extend video conferencing beyond the present utilization for routine remand of under trial prisoners and recording evidence in some specific cases. It is proposed to broad-base video conferencing to include regular recording of evidence in sensitive cases, recording the evidence of doctors (and other professionals) in criminal cases, legal aid matters between the jail and Courts and sensitive matters pertaining to child abuse, domestic violence and sexual abuse and other areas as and when the need arises. Presently, some Court complexes are connected through video linkage with the Central Jail in the State and the District Jail in the district. It is proposed to connect every Court complex in a State with the Central Jail and every Court complex in a district with the District Jail.

2. Type of Video Conferencing: The video-conferencing based on software solution is being explored through a pilot being undertaken as part of Phase I. As per the studies so far, it has been found that the main concern that may come up for software based VC set-up is the connectivity bandwidth. It is therefore imperative that if, based on the success of the ongoing pilot, software based solution is chosen to be deployed in Phase II, the connectivity to be provisioned for VC set-up has to be at least 1 MBPS which is reliable and stable connectivity over and above the regular connectivity being provisioned to the Court complex as given in Chapter 4 of this document. Otherwise, the studio based VC set-up may be considered for deployment with the same or better leased line connectivity exclusively provisioned for VC set-up only. The VC set-up will have to be multi-point VC enabled.

3. VC set-up to be recording compatible: The video-conferencing set-up whether studio based or software based will have to be compatible with audio-video recording devices as there will be requirement of having recorded copy of the video conferencing sessions held. Audio-video recording device attachment with sufficient back-up and facility to replicate it on different media will also be provisioned from the Project along with the VC equipment.

4. Document Visualizer: As stated above, the video-conferencing infrastructure is also intended to be used for recording of evidence in addition to day-to-day remand purposes. This requires showing of certain documents of the case-file to the witness/accused at other end for which a document visualizer of requisite specifications will be required to be integrated with the VC set-up. The Document Visualizer will be provisioned from the Project.

The budget of the component on video-conferencing has to be planned taking into consideration all of the above aspects and the same has to be implemented as per the decentralized infrastructure implementation model given in Chapter 2.

### 8. CAPACITY BUILDING MEASURES

EXECUTIVE SUMMARY

1. Capacity building through training judicial officers in the use of computers and court staff in the Case Information Software has been extremely successful. The Training of Trainers (ToT) model was adopted. This will continue in Phase II.

2. Additionally, refresher courses are planned every six months so that judicial officers and staff do not lose familiarity with computer systems and the various applications.

3. All State Judicial Academies will be involved in the capacity building exercise. Each such Academy will be equipped with a computer laboratory catering to the requirement of about 30 trainees at a time. Requisite staff will be engaged by the State Judicial Academy out of funds from the Project.

4. Each State Judicial Academy will be equipped with a video conferencing unit for distance learning purposes as well as for utilizing webcasting facilities of important lectures and events, both live and recorded 5. Learning Management System has been successfully adopted by the e-Committee to reach out to judicial officers and court staff. State Judicial Academies will be encouraged to use these tools. 6. As a part of the Change Management exercise which has been conducted for judicial officers and court staff, workshops will be held through Project funds to assist in changing the mindset of the Bar Councils, lawyers, Public Prosecutors and other stake-holders in the justice delivery system.

After hardware and software, the most important factor for the success of an eGovernance project is the humanware that is the human resources making use of the hardware and software. If the Human Resources of an organization truly adopt the technological enablement extended to them through the Project, only then the optimum fructification of the funds invested can be expected. Appreciating this aspect, Phase II of the Project, will intensively focus on multifarious initiatives of Capacity Building Measures, as given below:

1. ICT Training and Education:

(a) During the ICT Training Programmes conducted as part of the Change Management exercise undertaken by the eCommittee, Judicial Officers and Court Staff have been trained in the use of Ubuntu-Linux Operating System (installed in their laptops) and Case Information Software (CIS) respectively. Almost all Judicial Officers have been trained in the use of laptops (Ubuntu Linux operating system) by 218 Master Trainers. The Master Trainers were trained by the eCommittee through a four-day intensive training programme. The entire basic training material both in the form of text and video have been made available to the Judicial Officers.

(b) About 4000 court staff has been trained in managing the computer systems in the court complex. The text and audio-video tutorial material has been made available online on the portal of the e-Committee. This has been achieved through CIS 219 Trainers who were imparted training in the Maharashtra Judicial Academy and the Chandigarh Judicial Academy.

(c) The training sessions conducted as part of eCommittee initiatives was based on 'Training of Trainers' (ToT) model. As the experience with this model has been very encouraging, the same will continue to be adopted in Phase II. There will be continuous Refresher and Advanced Training Programmes for the Judicial Officers as well as the Court Officials preferably every six months. These half yearly sessions will continue throughout the Project so that every Judicial Officer and Court Officials avails the Refresher Training four times in the Project period of 2 years. Financial provision will need to be made for this critical element of change management.

2. Computer Training Labs at State Judicial Academies:

(a) For sustainability of the efforts of ICT Training for Judicial Officers and Court Officials, there is an urgent need of providing a full fledged Computer Lab to the State Judicial Academies which most of them do not have. Phase II of the Project will provide the resources for providing ICT Infrastructure for setting up of a Computer Lab for every State Judicial Academy. Infrastructure of the configuration provided to Court Room and Court Complex that is Slimline PCs/Laptops, MFDs, Duplex Printers, Scanners, UPS, DG Set, LAN etc. may be provided to set up a computer lab at SJAs keeping in view the fact that the lab has to cater to the ICT training requirement of Judicial Officers as well Court Officials. The lab should be equipped to facilitate 30 trainees at a time with individual systems. The infrastructure requirement for National Judicial Academy and State Judicial Academy is given as follows:

Infrastructure Requirement for Judicial Academies

| Infrastructure Items | Quantity |
|---|---|
| Projector with screen | 1 |
| Slimline PC with latest optimum configuration | 31 |
| Printers (2 MFD Printer + 2 Duplex Printer with Ethernet Port) | 4 |
| LAN Points | 40 |
| Flatbed Scanner with ADF - duplex | 1 |
| UPS 10 KVA with 2 hour backup | 1 |
| USB Hard disk for Backup ( 1 TB or above) | 1 |
| D. G. Set with Online UPS for Network Room 5/10/15 KVA with 2 hour backup | 1 |
| Racks + Switches etc. | As per LAN WAN requirement |

(b) The State Judicial Academies will also need two resource persons each on a regular basis to take care of training as well as trouble shooting. Financial provision must be made for this purpose.

3. Video-conferencing for State Judicial Academies: Studio based VC set-up for SJAs will go a long way in materializing the objective of education at door-step for Judicial Officers saving considerable time, expense and efforts in travelling etc.

4. Video Streaming and Webcast Portal: Live and pre-recorded (on-demand) videos can be hosted and webcast and live presentations can also be arranged through NIC's Government Video Portal that is webcast.gov.in. Joining this portal will be of vital importance and usage for the SJAs to host the content, pre-recorded or live, on the training module of the Judicial Officers and Court Officials, whether on ICT or other subjects of training. Any cost involved in these initiatives will be provisioned through the Project during the Project period.

5. Learning eTools: Open Source Learning Management Tools can aid the Judicial Academies to augment the training potential and reach. A Learning Management System (LMS) is a software application for the administration, documentation, tracking, reporting and delivery of eLearning education courses or training programs. Learner/trainee can avail the benefits of training modules by just using Computer System and without having to physically visit distant locations to take part in the training sessions. eCommittee has successfully utilized this tool for training judicial officers and court staff through its portal. The State Judicial Academies will also be encouraged to have such tools adopted for their education and training programmes.

6. Regular Change Management Exercise:

(a) It is a well appreciated fact that introduction of new technological modes of working requires not only the training of the users but also the attuning of the mindset to really adopt the new modes of working. The attitudinal orientation of the users is of ultimate importance in order to shift to ICT enabled methods of working in the organization without which no headway can be made in realizing the goals of computerization.

(b) This aspect of mindset change and attitudinal orientation has been specifically attempted in the Change Management sessions undertaken by the eCommittee and by the Master Trainers Judicial Officers trained by the eCommittee. These efforts will be further enhanced during Phase II of the Project covering Judicial Officers, Court Staff, Lawyers, Public Prosecutors etc. to attain a holistic shift in mindset addressing the resistance to computerization issues due to some mental block.

(c) The ICT training and education exercise as referred above will be so interwoven with Change Management programme that the attitudinal change and mindset orientation aspects are taken care of in the most effective manner. It will also be ensured that like ICT training, the Change Management exercise also becomes a spiral process to effectively deal with the mental block issues for achieving the maximum possible acceptance and adoption levels of technology in the institution.

(d) Awareness programmes and initiatives will also be taken up for litigants and citizens at large to spread the information about the new modes of services and methods made available in emode by the eCourts Project. The emphasis of the Change Management initiatives will to make all concerned aware about benefits in store for all in the computerization of Courts and also the overall well-being of society due computerization of Courts. The expenses involved in this exercise will have to be provisioned through the Project during the Project period.

7. ICT Training for Electronic evidence: Electronic evidence is a reality today. With growing incidence of citing and submission of electronic evidence in Court Proceedings, the Judicial Officers and Court Officials need to be trained to appreciate and manage electronic evidence. Training exercise may consist of a component to promote awareness about this aspect amongst the Judicial Officers and Court Officials. Moreover, as all the Courts have not framed rules with regard to preservation of electronic evidence and its validity in Court proceedings, both criminal and civil cases. The entire gamut of electronic evidence, its preservation and evidentiary value will have to be studied by team of professionals, who may, if necessary, recommend changes to the Evidence Act, 1872.

8. Post Process Re-engineering Change Management: After the result of the process reengineering exercise, it is expected that there may be major boost in use of technology in day-to-day Court processes. The changed ways of working as per redesigned/renewed Court processes will need to be facilitated by deploying a new version of the Case Information Software. This will also need renewed and revised efforts for Change Management of the concerned users that is Court Officials and Judicial Officers to learn and imbibe the new set of functionalities facilitated by the new CIS. Therefore, like the ICT training exercise, the Change Management exercise will also be an ongoing affair during the project. Hence the budgeting in the project needs to be taken up duly considering this aspect also.

### 9. JUDICIAL PROCESS RE-ENGINEERING

EXECUTIVE SUMMARY

1. Currently a process re-engineering exercise is being undertaken by every High Court for a fresh look at processes, procedures and systems. It is expected to be complete by 31st January, 2014.

2. The exercise will have to be repeated for ironing out the creases and also to incorporate technological changes that will be introduced in Phase II. The exercise may well be more or less continuous.

3. Automation, e-filing of cases, paperless courts will need radical changes in the processes and procedures of the courts and also in the mindset of all stake-holders.

4. The changes required for effectuating the Judicial Process Reengineering will be implemented in the new version of CIS.

5. Change Management warranted by Process Reengineering will also be duly taken up.

The internal processes of Justice Delivery System are distinct and peculiar to the institution because of plethora of applicable complex legislations, rules, regulations, judicial precedents and the local practices involved therein. In order to reap the optimum benefits of computerization, many of these processes shall have to be streamlined and a few of them may even have to be done away with and many new processes shall have to be designed. Many of these changes in the processes and procedures may not even be fitting into the present system of acts, rules, procedures etc. and for successful implementation of the same, proper amendment of rules/regulations at proper levels may be necessitated. This exercise of the streamlining and improvising current processes, eliminating redundant processes and designing new processes with respect to making the Court Processes ICT enabled and amending the procedures/rules accordingly is Judicial Process Re-engineering.

1. Judicial Process Re-engineering (JPR) in Phase I: In Phase I of the project, all High Courts have formed one or more Committees to take up the Judicial Process Re-engineering exercise for the Courts under their jurisdiction. The exercise of JPR Committees is expected to be over by 31st January, 2013 which will be followed by rules amendment exercise necessitated to accommodate the new set of processes recommended through the JPR exercise.

2. Judicial Process Re-engineering for Phase II: As the technology offers newer avenues of automation very frequently, the study of processes for potential to automate further should also be an ongoing exercise. Therefore, in Phase II of the project also, a Judicial Process Re-engineering exercise will have to be taken up to make up any lost opportunities during JPR exercise of Phase I and to explore further automation of processes with latest trends in technology. Moreover, this would also percolate the JPR initiatives taken up in other States to all States for implementation as per the experiences gained by some of the States. A few of the many probable initiatives proposed to be taken up in Phase II are given as follows:

(a) Automation of Process Serving - Mechanism is necessary in order effectuate the avenues offered by amendments in the Civil Procedure Code with respect to sending Court Process through email to other Courts and to parties. This option of process service can be widely used only with help of an established mechanism of Acknowledgement for Emails in the form of Delivery and Read Receipt. Attempt will have to be made to explore provisioning of this mechanism which will very effectively address the issue of delays due to non-service or late service of Court Process.

(b) No Manual Registers: A major reason for non-adoption of computer based Institution and other Court Registers has been cited as the efforts required to main physical registers and the difficulties involved in maintaining double registers that is one physical and one on computer. In order to promote use of Computer for all day-to-day Court processes, all Court Registers should be maintained in eform only. Major and concerted JPR initiatives only will be able to realize this objective.

(c) eFiling: Presently, e-filing of case papers is being carried out on an experimental basis and some eCourts are also working on an experimental basis. e-filing procedures will need standardization as well as preservation of e-records. A team will need to be engaged to finalize the details for the same. This is an aspect of process re-engineering requiring considerable discussion and debate in the near future. An e-filing Portal for the High Courts and the District Judiciary will have to be developed to facilitate online e-filing of cases. Initiatives for offline e-filing that is filing of soft copy along with the physical copy, will have to be taken up optimally.

(d) Judicial Financial Accounts Book Keeping Practice: The most widely used system of Accounts book keeping even presently in Courts across the country is the old system of book keeping that is Single Entry Bookkeeping System. This system is only suitable for very small entities or personal accounts having minimal number of transactions. The single entry system is also prone to human errors and is not suitable of being implemented in Computerized Financial Accounting System. Looking to the increased accounting activities in the Courts on judicial as administrative side, the latest scientific method of book-keeping suitable for Courts is Double Entry System of Book-keeping. Many of the Government/Public bodies have recently been shifting to this more dependable and authentic book-keeping system as part of the initiatives/recommendations of Comptroller and Auditor General. This needs considerable efforts as a part of JPR exercise and thereafter software implementation side in CIS.

(e) Administrative Process Automation: To optimize the human resources in the Courts, automation of non-judicial processes that is administrative function such as file movement and tracking, leave management, personnel information management system etc. are also the need of the day. Automation of these processes and eliminating the manual process involved therein also need refinement of rules and procedures. This can only be taken up in a full-fledged Process Re-engineering exercise. The phase II of the project will also have this as an objective as listed in Chapter 10.

To ensure expeditious justice delivery along with a litigant friendly court administration, process re-engineering must be coupled with systems re-engineering. This will need a detailed study and adequate financial provision. The entire exercise can be completed by the State Judicial Academy through its in-house resources provided adequate funds are dedicated for this purpose. This needs serious consideration.

3. Exploring Paperless Court:

(a) Paperless Court model will have to be studied using the FOSS technologies and overall infrastructure requirement will have to be assessed. Paperless Court option can only be taken if it is cost-effective and allow the model to replicated with reasonable additional cost.

(b) Another element of a paperless Court would involve the need of the Judge to make e-notes and mark case documents.

4. Judicial Process Re-engineering Impact on Case Information Software: The changes in the processes introduced as a result of the JPR exercise will have to be incorporated in the Case Information Software also. The new version of CIS will be so developed that it is compatible with Cloud Architecture and takes care of the Process Reengineering requirements as per the ongoing Process Re-engineering exercise.

5. Process Re-engineering necessitating Change Management: Organizational and work-flow related changes brought about through Judicial Process Re-engineering will have to strategically implemented which also involve the training and adaptation of manpower of the organization ranging from Court Officials to Judicial Officers to help them get acquainted, acclimatized and proficient at using the new processes and the new CIS redesigned accordingly. This will have to be taken care of during the ongoing Change Management exercise throughout Phase II of the project.

The efforts for JPR will be so applied in a concerted manner that it culminates in optimum reach of automation of processes to Court functioning. The successful implementation of best of the Judicial Process Reengineering potentialities will be the real parameter of success of computerisation of Courts.

### 10. WORKFLOW AND PROCESS AUTOMATION TOOLS AND MEASURES

EXECUTIVE SUMMARY

1. On completion of the present on-going exercise of process re-engineering, some aspects of the CIS will need to be re-designed. This will necessitate the introduction of office automation in a big way.

2. Phase II will involve process and procedure automation not only in judicial functions but also in administrative functions concerning the Registry of the courts.

3. All judicial officers have already been provided with a facility of an e-mail address [abcd@aij.gov.in]. Court Officials will also be provided official email address management of which will require an administrator at the High Court level.

4. As in the Supreme Court, all judicial officers and staff upto Class III will be allotted digital signatures through a Registering Authority set up in the High Court.

5. Process serving has always been an issue with all district courts. It is proposed to provide all process servers with a service authentication device like a GPRS-GPS enabled PDA. 6. eOffice has been successfully implemented in the Supreme Court. It is proposed to extend its application to all High Courts and District Courts. 7. A financial accounting package suitable for the courts is proposed in Phase II. This will take care of miscellaneous matters including Nazarat, certified copy accounts etc. 8. eProcurement has been successfully implemented in the Supreme Court. This facility will be extended to all High Courts in view of the decision to decentralize procurement to the High Courts. 9. Free Open Source solutions will be adapted and implemented wherever it assists and suits the judiciary.

Presently, an exercise of process re-engineering is being undertaken by every High Court. Case Information Software will be redesigned and improvised for Phase II of the Project to incorporate the recommendations and amendments in rules on the conclusion of this exercise. It is expected that the major thrust of this exercise will be to do away with manual processes as far as possible and introduce re-designed processes which complement the ICT advancements.

Apart from this work-flow based automation to be brought about in the day to day judicial functions of the Court, there still remains an area of workflow and process automation in other functions of the Courts that is administrative processes. If that area is left out in the computerization, it will be not a holistic automation. It is therefore required to take up the following initiatives and measures for work-flow and process automation of the same.

1. Official Email for Court Staff also: During the Phase I of the Project, official email addresses for Judicial Officers have been provisioned on the email portal services of NIC that is aij.gov.in through the Delegated Admin (DA) facility managed by the eCommittee. Court Complex official email creation is underway. As per official guidelines, all official communication being done through email is preferred to be done through official email address. As Phase II of the Project will be extending the ICT enablement upto Court Officials also by way of increased infrastructure, all Court Officials of Class I, II and III will have to be provided official email address. As it will not be possible to manage such a large number of email addresses creation and management centrally at Delhi, every High Court will be requested to have Delegated Admin at their level on the NIC email portal services from where the email addresses can be created and managed.

2. Digital Signatures for Judicial Officers and Court Staff: During Phase I of the Project, Digital Signature for Judicial Officers have been provisioned. Phase II of the Project will also aim to cover substantial number of Court Officials for Digital Signature allotment as most of the Office Automation and Online Judgments, Online certified copies will need to be digitally signed. In Supreme Court, all Court Officials of Class I, II and III are being allotted an official USB Token based Digital Signature Certificate (DSC) of NICCA from the Project by way of Registration Authority created at eCommittee office. In this manner, DSC creation, revocation, renewal etc. becomes easier, expeditious and decentralized. This experiment at eCommittee for DSCs of Supreme Court officers and officials has been successful. A similar arrangement will be requested at every High Court so as to expedite the Digital Signature allotment and management for officers and officials of High Court and District/Taluka Courts. Cost involved for the USB tokens will have to be provisioned from the Project.

3. Authentication Devices for Process Servers: As is widely appreciated that the major cause of delay in Court case disposal is the delays and lapses involved in process serving to the parties. Process Server of Courts discharges a very vital duty which directly affects the further cycle of court case progress. It is required to modernize the process serving methods by using process service authentication devices like PDAs or similar GPS-GPRS based devices with camera. This will be helpful in ascertaining the location of endorsement made on the Court process along with image proof in certain cases. Provision of such authentication device needs to be made as referred in Chapter 4 on infrastructure.

4. eOffice Suite for Indian Judiciary: The Supreme Court has successfully implemented eOffice which is a mission mode Project of the Department of Administrative Reforms and Public Grievances (DARPG), Govt. of India, for Govt. departments, for automating the workflow of administrative files of the departments in a paperless mode. eOffice has several components like eFile (File Management and Tracking Software), eLeave (Leave Management System), eHR (Personnel Information Management System), eTour (Tour Management System) etc. This will be implemented in all courts across the country with no substantial extra hardware infrastructure except extra scanners for large Court Complexes having comparatively more number of Court Rooms and therefore bigger inflow of outside paper correspondence.

5. Financial Accounting Software with Payroll Management System: The judicial accounting module for the Nazarat section of the Courts will be taken care of in Case Information Software by way of CIS Periphery development. For other accounting aspects of Court Administration that is salary, other recurring expenditures like electricity etc., office infrastructure purchase and maintenance, other capital or operating expenses accounting will need softwares to manage them as per the procedures. Apart from exploring FOSS Applications for the same, any already working solutions in other Courts on FOSS technologies may also be considered for suitable customization for being shared with rest of Courts.

6. eProcurement Portal for High Courts: The Supreme Court has already successfully implemented ePublishing the tenders of materials. Government of India and a number of States have come up with portals for enabling the Government Departments to epublish the tenders for any of the purchases being done by the departments. As High Courts will be extensively doing the procurement on account of the decentralized model of implementation in Phase II, it will be required to join the CPP (Central Public Procurement Portal) which is also available for States at least for ePublishing of the tenders. It is also possible to have the tenders process automated through eProcurement module of this portal which may also be explored wherever feasible.

7. Other FOSS Applications for Automation of workflow and processes: Apart from the solutions and areas as suggested above, any other relevant and necessary FOSS Application instrumental in automating the workflow/processes of day to day Court administration and management may also be taken up.

8. Integration between all Automation Applications – Judicial ERP: It is also necessary that all of the above suggested process automation solutions should be integrated with each other as much as possible and feasible so that it does not duplicate the efforts relating to certain data sets or applications common amongst those applications. An ultimate destination to be attempted may be in future to have most of the automation solutions deployed for Courts so integrated with each other that it forms an Enterprise Resource Planning (ERP) solutions for Judiciary that is the JudicialERP (JERP).

### 11. JUDICIAL KNOWLEDGE MANAGEMENT SYSTEM

EXECUTIVE SUMMARY

1. The Supreme Court Judges Library has successfully implemented an integrated free Open Source application called KOHA. This is not only being used as an integrated library management system but also as a Digital Library. This will be utilized in the libraries of all High Courts and District Courts across the country.

2. Judgments delivered by a High Court or the Supreme Court will be made available through an in-house eJournal containing the judgments and its head notes.

3. A set of programmers will be required to develop the requisite software and a team of professional lawyers and academics will be required to prepare the head notes. The eJournal will be made available to all judicial officers free of charge, resulting in a huge saving.

4. The National Judicial Data Grid (NJDG) will be strengthened to mine data of all cases, decided or pending. This will enable policy planners and policy makers to manage case loads and bring in effective case management systems.

5. Phase II will be a knowledge intensive phase of the Project involving intensive software centric activities.

Justice Delivery System is a knowledge intensive domain as the function of adjudication is governed by vast and diverse laws; substantive as well as procedural. Courts apply and interpret legislated principles enshrined in the Constitution, the enacted laws and also the standards of practice at courts when dealing with daily caseloads as regulated by the prevailing procedural rules. Another prime governing factor in adjudication is the Case Law which is ever developing. The plethora of knowledge derived from all these governing aspects forms the backbone of adjudication process which needs to be supplemented with ICT tools like Court Library Management System, Case Law eJournal, Management Information Systems etc. With this underlying objective, the following knowledge based ICT enablement activities need to be taken up in Phase II of Project for Courts across the country.

1. Integrated Library Management Software (ILMS): Supreme Court, all High Courts and most District Courts have a library. For want of proper and sufficient computerization of libraries in District Courts and in some High Courts, optimum utilization of resources invested in the library is becoming difficult, affecting the use and access of library facilities. Court Libraries need to be equipped with a robust library management software. This software caters to all functions of a library that is acquisition, circulation, catalogue generation etc. and is called an Integrated Library Management System (ILMS). A FOSS ILMS software will have to be deployed for Court Libraries similarly on the model of CIS deployment that is State Level Cloud Environment.

KOHA which is a FOSS ILMS has been successfully deployed in the Judges Library at Supreme Court of India. Requirement of systems (thin-clients) for Court libraries has been taken into account in arriving at the overall infrastructure requirement of the Court-rooms and Court complexes. The computerization of Court Libraries will also enable the beneficiaries to access its catalogue online and request books/journals online.

2. ILMS also as Digital Library: Efficient ILMS software is being used as a Digital Library wherein content in digital forms is ported and can be accessed by its beneficiaries online. Legal Research Documents, Committee/Commission Reports, Law Articles, Circular, Orders, High Court Rules etc. which are in Open Access content can all be ported to ILMS Digital Library. The Supreme Court Judges Library model will be taken up for rest of the Court libraries being computerized in the Project.

3. Official Case Law eJournal:

(a) The body of case law consists of judgments rendered by the Supreme Court and the High Courts. This case law keeps evolving from time to time by way of new judgments coming in on the same point of law upholding, overruling, citing, referring, discussing and / or interpreting earlier judgments. A comprehensive software mechanism in the form of Legal Database has to be in place which has the repositories of all the Supreme Court and High Court judgments and also keeps track of new judgments affecting the earlier judgments. This software also needs to have a mechanism for porting metadata of the judgment onto it which also includes Head Notes of the judgments. This software will have to be of Federated Architecture as the case law applicability and management will have to be High Court based.

(b) This software will have to be developed on FOSS technologies and will have mechanism for the High Courts to port their judgments with meta data and the head notes. This will eventually become the Official In-house Case Law eJournal of Indian Judiciary. Software solution development for this Official Case Law eJournal of Indian Judiciary will be taken up by the eCommittee from the manpower resources provisioned from the Project.

(c) The Head Notes creation and uploading to this software will have to be taken care of by the High Courts. Funds for Head Note creation will also have to be provisioned from the Project.

4. National Judicial Data Grid (NJDG): The large amount of data of being generated and updated continuously in the Justice Delivery System requires to be stored methodically and also regularly mined and analyzed for meaningful assistance in policy formation and decision making. National Judicial Data Grid (NJDG) is intended to be the National Data Warehouse for case data including the orders/judgments for Courts across the country. Phase II of the Project will aim at attaining the full coverage of case data of Courts across the Country. The uploading mechanism in Phase II will gradually shift to auto pull mechanism from State court cloud installations which will ensure smooth updation of data on NJDG.

(a) Data Analysis Tools in NJDG: Storing the data without the data analysis tools will be an unhelpful exercise. A phased exercise for improvising the NJDG needs to be taken up for furthering the qualitative use of the data uploaded onto the portal. Some of the data intensive tools and technologies that will have to be employed in order to actualize objectives of setting up of NJDG portal are as follows:

(i) Data warehousing: Data warehousing is the process of extracting and storing data to allow easier reporting. The process of Data warehousing will help in more efficient centralization or aggregation of data from multiple sources into one common repository. Data warehousing techniques will allow the possibility of various dynamic and comprehensive reports from the data made available on NJDG portal.

(ii) Data mining: Data mining is the use of pattern recognition logic to identity trends within a sample data set and extrapolate this information against the larger data pool that is NJDG. Data mining discovers hidden patterns in data. Data mining operates at a detail level instead of a summary level. Data mining process will assist in finding patterns in the given data set. These patterns can provide meaningful and insightful trend analysis for the policy makers. Data mining can also be used in a wide variety of contexts – in fraud detection, as an aid in litigation and adjudication trends, judicial performance enhancement measures etc.

(iii) Online Analytical Processing (OLAP): This tool will help efficiently querying multi-dimensional databases as are there in NJDG. Whereas data mining techniques help analyzing hidden trends from the data, OLAP will help in the summation of multiple databases into highly complex tables with summarized reports.

(iv) Business Intelligence (B. I.) Tools: The Data Mining and OLAP being complementary to each other will form the engine for B. I. Tools for the NJDG which help in the most informative management information system and dashboards for effective Court Management as referred in next paragraph on Judicial Management Information System (JMIS).

(b) Judicial Management Information System (JMIS): With all these enhancements in place in NJDG, it will be helpful in litigation and adjudication pattern analysis and also the impact analysis of any variations in governing factors relating to law, amendments, jurisdictions, recruitment etc. This will in turn be instrumental as guidance for policy formation and devising future and plans. NJDG will also continue to improve upon the statistical reporting, charts and dashboard made already available which are meant to serve as judicial performance enhancement measures for policy makers and policy planners such as the Chief Justice of a High Court or the Judge in administrative charge of a district The tools forming part of JMIS will effectively serve as a Decision Support System (DSS) with the aid of data analysis tools referred hereinabove for optimum meaningful and intelligent utilization of data and document repositories.

(c) The manpower resources to be provisioned at NIC and eCommittee team will have to be augmented in order to achieve the above said objectives.

The comprehensive suite of all of the above solutions and facilities will form an ideal Judicial Knowledge Management System (JKMS) for Indian Judiciary.

### 12. HUMAN RESOURCES

EXECUTIVE SUMMARY

1. Phase II will require considerable inputs on the software applications as well as monitoring effective management of hardware.

2. Experience in the working of Phase I has shown that the office of the e-Committee needs considerable strengthening. In addition to the existing sanctioned staff, the office will require support staff for Project monitoring, research in new technologies and for fine-tuning software requirements and solutions.

3. Similarly, the DoJ will also require manpower resources for DoJ-PMU.

4. While the NIC team in Pune is doing an excellent job, it will need further augmentation due to additional requirements that will crop up with new technologies being introduced, such as e-filing etc.

5. The workload on the Central Project Coordinators (CPCs) in the High Courts will also increase with greater demands of litigants and policy makers. It is proposed that the office of the CPCs be strengthened with additional manpower on a contractual basis till regular recruitments are made by the High Court.

6. Many court complexes are without qualified hands and in the event of a break-down, all work comes to a standstill. It is suggested that qualified personnel be made available in the districts and talukas so avoid any such mishap and maintain a smooth flow of work.

7. All additional manpower will be on a contractual basis for the project duration and their remuneration will come out of the Project funds, Phase II of the Project will be knowledge activity intensive. Software aspect of egovernance will get due primacy during Phase II in order to attain the goals of effective automation of the processes. In view of this, the requirement of manpower (human) resources will be far more than Phase I. Overall human resources requirement from the Project is as follows:

1. Manpower for eCommittee:

(a) Sanctioned Staff Strength: As the eCommittee members strength and the workload with the eCommittee will be considerably higher during Phase II. The sanctioned strength of the eCommittee as per DoJ/MLJ/GoI Office Order dated 8/12/2004 as per present cadre is one Administrative Officer of the rank of Branch Officer, one Sr P.A.s (shorthand), four P.A.s (shorthand), two Sr. Court Assistants, three Jr. Court Assistants and six Court Attendants. Apart from continuing the same strength, additional manpower requirement during the Project period of Phase II will be as follows.

(b) Support Staff for eCommittee-PMU: For the activities relating to Project Management, manpower for Monitoring, Data Collation and Documentation will have to be provisioned from the Project on Contractual basis: For the activities of Project monitoring and follow up, change management programme implementation, documentation of the Change Management and other tasks and formulating and implementing the exercise of Process Re-engineering for the Courts other activities of the Project, a team of 12-15 personnel will be required for the Office of the eCommittee to assist in the areas of Change Management, Process Reengineering, Project Monitoring and Follow up that is Data Entry Operators, Technical Assistants, Office Assistants, Senior Content Writers, Management Graduates / Change Management Executives etc.

(c) Software Developers Team at eCommittee: Software developer manpower for various tasks which will continue to be undertaken by the eCommittee during the Phase II also that is customizing and packaging of FOSS Linux Desktop OS and keeping it updated, Speech to Text Solutions, Mobile Convergence Applications, Office Automation Applications customization, implementation of various solutions developed at various High Courts relating to Complaints Logging Management System, Asset Inventory Software, Judicial Officers Personnel Management Software, Payroll Management etc. for other High Courts, eFiling Portal, developing/implementing additional legal/judicial applications for Ubuntu-Linux e.g. legal databases etc. For effectuating the above objectives, at team of 10 software personnel including Content Designers and Developers will need to be provisioned from the Project.

2. Support staff for DoJ-PMU: Joint Secretary, DoJ and a team comprising of a Director/DS with a PA, an Under Secretary with a PA, a Section Officer, two assistants, a typist and an outsourced expert in project management looking after day to day managing and monitoring of the Project for budgetary aspects, release of funds and timely completion of financial deadlines, responsibilities towards the parliament etc

3. Software Developers Team at NIC-Pune: As the National Core CIS is being developed and redesigned at NIC Software Development team of Pune, strengthening of the development team will have to be ensured keeping in view the additional fact that considerable efforts for integration of Core-Periphery and development of part of Periphery for High Courts will be required. Provisioning for resources for CIS development, customization and support for next 5 years is underway. The same will have to be continued during Phase II of the Project.

4. Technical Support Team for CPCs: In view of the decentralized model of infrastructure implementation and Core-Periphery model of Software development and deployment, the role of the High Courts and therefore the CPCs will be more dynamic compared to Phase I. The CPCs will need two types of manpower teams for working on these two fronts that is infrastructure and software:

(a) Technical Support Team: The CPC will need a team of upto 5 Technical Personnel for 36 man-months of the Project to assist him in implementation of the infrastructure components of the Project. There will be 3 persons with hardware background being at least graduates in Computer Technology with sufficient experience and two personnel for data collection and collation activities. This assessment of technical support team for CPC will be on a need-based approach.

(b) Software Development Team: In Phase II of Project, CIS Periphery Development and other Office Automation FOSS Applications deployment exercise will one of the most important functions with High Courts team. CPC will have a team of about 5 Software Development Professionals for project duration for assisting in these activities depending upon the requirements. This team will be working in coordination with eCommittee Software Development team and CIS Core Development team of NIC.

(c) The terms of reference of Manpower: The terms of reference of the above referred manpower will be finalized by the eCommittee in coordination with DoJ/NIC. The manpower requirement at High Court will be reviewed quarterly looking to the Project progress and utilization of the manpower for the intended purposes.

(d) Roles of CPC, Periphery Development Team and HC NIC Coordinator: The team working on the development of CIS periphery will be under the overall supervision and control of the Central Project Coordinator of the High Court and the technical aspects of the development of the periphery will be coordinated by the High Court NIC Coordinator with NIC Pune team. The role of the High Court NIC Coordinator will also be very important in order to ensure technical compatibility of the Periphery with the Core in coordination with NIC Pune team and also for the adherence to standard development best practices by the periphery development team. This team of professionals for development of periphery of CIS and its rollout will also take care of installation of Unified National Core CIS as to be made available online on secured web resources. Core-periphery implementation exercise will be governed by the CIS Guidelines to be given by the eCommittee from time to time. Thus, the CPC will be responsible to ensure CIS Periphery Development in coordination with the High Court NIC Coordinator and NIC Pune for its proper integration with CIS Core as per eCommittee guidelines.

5. Technical Manpower at Court Complexes:

(a) It is necessary to create a sustainable mechanism for continuous smooth operation of the ICT system in the courts. This requires the presence of professional technical support staff in the courts. All High Courts have already been requested to recruit permanent technical manpower funded by the respective State Governments. However, that exercise is likely to take a number of years in the light of the need to find the funds, finalize recruitment rules, undertake recruitment and eventually place selected candidates at the disposal of courts. In the meanwhile, a stop-gap arrangement is required to be put in place for the project duration so as to ensure that the necessary technical assistance continues to be available to courts. The technical personnel to be provisioned for 3 year of Phase II of the Project will perform the following functions in coordination and cooperation with the District System Administrators (DSAs) and System Administrators (SAs) as trained by the eCommittee in Phase I.

(i) Daily uploading of data to the National Judicial Data Grid after the completion of the Project;

(ii) Resolving day-to-day technology related issues

(iii) Facilitate the District Judge in monitoring and analysis of the data uploaded in the NJDG in order to generate reports required to improve court/case management ;

(iv) Training of new staff.

(v) Day to day troubleshooting of the ICT infrastructure including the networking issues.

(vi) Any other activity incidental to ICT implementation

(b) This manpower will have to work in tandem with District System Administrator and System Administrators trained for the purpose under the overall guidance of the District Court Computer Committee (DCCC) and Nodal Officer of the Court Complex.

(c) It has been assessed that every district should have at least one professional for technical support. There should be one such support for districts having 5-14 courts, two for districts having 15-24 courts and so on. Talukas generally have less number of courts (1-4 courts) and might not need such support at each taluka court complex. However, such support, in the same ratio, needs to be provided for all talukas collectively within each district. Applying the above formula to existing courts, it has been calculated that a total of about 1600 professionals will be required for 3 years to provide such support to all the ICT enabled courts in the country.

6. Role of eCommittee in Technical Manpower Resources being provisioned from the Project: In order to ensure optimum performance and output from the manpower resources, the following measures will be necessary:

(a) Qualification and experience standards of the technical manpower: The suggested skill-set, qualifications, experience etc. of the technical manpower to be employed at High Courts from the funds of the project, will be centrally decided by the eCommittee with inputs from NIC.

(b) Assessment of manpower requirement: As the manpower provisioning under paragraph 4 and 5 above will be need-based and subject to review of performance and output, the assessment of the same will be coordinated by the eCommittee in consultation with the High Courts.

(c) Manpower Funds Disbursement: As referred in paragraph 10 of Chapter 2 of this document, the disbursal of funds under the head Manpower Resources (Budget Head No. 8) will be on recommendation by the eCommittee for the aspects given in sub-paragraph (a) and (b) above.

### 13. SERVICES DELIVERY

EXECUTIVE SUMMARY

1. The web resources will be extensively utilized in Phase II of the Project. Web portals will be used for e-filing; websites will be used for dissemination of information to litigants and lawyers.

2. All websites will be made disabled friendly and to the extent possible, information will also be available in the local language.

3. Mobile phone applications, SMS and e-mail will be extensively used for dissemination of information.

4. Kiosks with basic printing facility will be provided in every court complex (district and taluka).

5. Certified copies of documents will be given online with bar coding to avoid tampering. 6. ePayment gateways will be provided for making deposits, payment of court fees, fine etc. 7. Portfolio managed cause lists will be made available to facilitate a search of cases. 8. NJDG will be further improvised to facilitate more qualitative information for Courts, Government and Public. 9. All functionalities will be interoperable and compatible with the CIS, both unified core and periphery. 10. A Litigant’s Charter of services has been prepared and is given below. As the Project progresses and technology develops, necessary additions will be made.

The boost, both qualitative and quantitative, that Phase II of the eCourts Project is expected to induce into the Justice Delivery System with respect to its output will be remarkable. A large number of improved and innovative service deliverables are planned in Phase II. Some of them are given below:

1. Web Portals:

(a) Efiling Portal: A portal will have to be developed to facilitate filing of cases online for High Courts, District/Taluka Courts. Hard copies of the cases filed online will have to be submitted to the Courts within a definite time-line. Initiatives for offline efiling that is filing of soft copy along with the physical copy, will also have to be taken up optimally.

(b) eCourts National Portal: eCourts National portal ecourts.gov.in will be further improvised to supply more meaningful and useful case related information on the website simultaneously making it more user friendly and feature rich. This portal will be the single window platform for all Litigant Centric Services to be provided from the web as referred in the Litigant's Charter given hereinafter.

(c) National Judicial Data Grid: Data uploading on the NJDG portal have to be further extended to all the Courts of the country and also to ensure regular data updation taking care of the connectivity issues. To achieve this and further improvising NJDG, a few of many enhancements to be taken in Phase II are given as follows:

(i) Provision of Date of uploading in the data being uploaded by the Court to facilitate reporting of chronological analysis of which Court Complex has uploaded data and when.

(ii) Automated triggers/alerts on dashboard for the Administrative Heads of the respective jurisdictions when the data uploading has been delayed beyond certain time limit e.g. two days or so.

(iii) Present functionality of NJDG provides for reports of undated (non-updated) cases in the system which needs to be further improved to be converted to auto alerts through email and NJDG dashboard.

(iv) Graphical Charts for reports of NJDG.

(v) Judicial Performance Assessment Mechanism through NJDG.

(vi) All Periodical Returns of District Judiciary to be made available through NJDG data for High Courts.

(vii) NJDG to become communication pipeline for the purpose of judicial data transmission from lowest Court upto the Apex Court of the country so as to save on hundreds of man-hours invested for preparing statements on frequently sought information by superior Courts, Legislative Assemblies and Parliament.

(viii) Pendency/Arrears and Institution/Disposal Statements: This will be based on the Act/Section, offences such as economic offences, offences against women, children, senior citizens etc.

(d) District Court Websites: Websites for rest of the District Courts will be deployed with functional integrated links to National eCourts portal Case related information. Website features for existing and new websites as given in next paragraph will be implemented.

(e) Website Standards and features: The portals referred above will have to be made compliant with the Government of India Guidelines for Websites (GIGW) and the W3C (WWW Consortium). This is important for ensuring that the websites are properly usable by the visitors anywhere on the globe having any mobile browser. The portals will also be made mobile compliant so as to support mobile browsers. The District Court websites have been built on FOSS Content Management System framework so as to ensure most user friendly updation and redesign as per pre-designed templates.

(i) Localization: It will be attempted to have the District Court website portal enabled for Localization Project Management Framework (LPMF) so as to allow the content to be accessed in local languages also. This will further make the District Court website useful to larger masses.

(ii) Disabled Friendly Portals: Features in the portal to make them disabled friendly will have to be taken up by ensuring compliance to Web Content Accessibility Guidelines (WCAG).

2. Mobile based Services:

(a) Mobile Applications - Mobile phone technology is available for furnishing relevant information to an advocate or a litigant through the use of mobile applications. It is proposed to innovate and prepare mobile phone applications on various mobile operating system platforms to make available information regarding latest judgments delivered by the Supreme Court and the High Courts, case status, case listing information and other information as may be required by lawyers and litigants. The Mobile Apps will also be developed for similar information of District/Taluka Courts.

(b) SMS Gateways: Large scale integration with NIC SMS Gateway infrastructure will have to be managed so as to facilitate push and pull based SMS services to be delivered to litigants and advocates.

3. Case Information through Email: The Phase II of the Project also aims at integrating email based communication services for delivering push and as pull based case related information to the litigants and advocates as referred in the litigants charter hereinafter.

4. Information Kiosks with Printing Facility: Phase II envisages providing kiosks in all Court Complexes with a feature of printing the information being sought using the kiosk. The kiosk (with touch-screen and printer) will be a major tool for providing instant and most accessible litigant centric mechanism for service delivery. The services listed in Litigants' Charter given hereinafter have an important parameter whether the same are being provided through the kiosk installed in the Court Complex. It is therefore proposed to provide for touch-screen kiosks with printer facility for all the Court Complexes wherein apart from viewing the information on the screen, the same can also be printed on the paper by the person accessing it. The charging mechanism may be either free or on nominal reasonable charges which do not require any human intervention and can be inserted in the machine itself like coins etc.

5. Certified Copies Online with Bar-coding: As a measure of convergence of hardcopy and softcopy of certified copy of documents, online delivery of certified copy with authentication features of 2D barcode will be provided through the website to the litigants. The barcode will facilitate authentication of the judgment when produced in hardcopy format before any Court.

6. ePayment Gateways

(a) eCourt Fees: Online mode of payment of Court Fees that is eCourt Fees has been attempted in a couple states which can be replicated for other Courts if the respective State Government have the mechanism to facilitate the same.

(b) For other payments: Similarly, Payment Gateways for Courts can be commissioned which will facilitate online payment of fines, payments, receipts relating to judicial orders of the Courts. This will be possible as facilitated by the States' financial payment and receipt modes in practice for the Courts.

7. Portfolio Management System: Using the Portfolio Management System Advocates/Government departments will be able to access the case information portal with a user and password authentication whereby all the cases represented by the particular advocate or filed by or against the particular department will be visible as a portfolio along with the case related information of those cases. This will facilitate advocate/department wise cause list also in addition to other useful feature of the system.

8. Interoperability with other components of Justice Delivery System: The systems and softwares in Phase II of the Project will be so designed and deployed that they ensure smooth interoperability with Police, Jails, FSL etc. so that the communication between these stakeholders and Courts is expedited in order to curb the delays involved. Therefore, one of the major baseline requirement of the Case Information Software to be refined and re-engineered in Phase II of the Project will its be its readiness for Interoperability with the central layer to be operational in the Integrated Criminal Justice System (ICJS). The interoperability compatibility of the CIS will ensure that the CIS is able to export / transmit the requisite information to the targeted stake holder that is police, jails, FSL etc and vice versa. The information to be shared, with whom to be shared and the information that may not be shared with certain stakeholders will have to be worked out for this aspect of CIS.

9. eCourt Project Litigants' Charter: Consolidating all the new initiatives and measures proposed to be taken up and the components planned in Phase II of the Project, there will be a number of multi-platform services for the litigants which may be termed as a charter of services envisioned to be delivered to the litigants through the phase II of the Project. This charter of services will serve as a guiding baseline to make the Phase II of the project as litigant centric as possible. The Litigant's Charter conceptualized for Phase II of the project is given hereinafter. As the Project progresses and technology develops, necessary additions will be made in this charter.

eCourt Project Litigants' Charter

> The Litigants' Charter prints one "Platform" heading spanning its last seven columns.
> A markdown table has one header row, so each of those columns is named
> "Platform - <column>". The table breaks across a page and reprints its caption and
> header; the reprint is dropped. The tick and dash in the cells are the document's own.

| Sr. No. | Service to the litigant | Platform - SMS Push | Platform - SMS Pull | Platform - Email | Platform - Web | Platform - Mobile App | Platform - JSC | Platform - Kiosk |
|---|---|---|---|---|---|---|---|---|
| 1. | Case Filing Confirmation | √ | - | √ | √ | √ | √ | √ |
| 2. | Case Scrutiny – Defects Notification | √ | - | √ | √ | √ | √ | √ |
| 3. | Case Registration Confirmation | √ | - | √ | √ | √ | √ | √ |
| 4. | Case Allocation Notification | √ | - | √ | √ | √ | √ | √ |
| 5. | Case Next Date Notification | √ | - | √ | √ | √ | √ | √ |
| 6. | Process Issued Notification | √ | - | √ | √ | √ | √ | √ |
| 7. | Case Listing Notification | √ | - | √ | √ | √ | √ | √ |
| 8. | Case Disposed Notification | √ | - | √ | √ | √ | √ | √ |
| 9. | Cause List | √ | √ | √ | √ | √ | √ | √ |
| 10. | Case Status Information | - | √ | √ | √ | √ | √ | √ |
| 11. | Daily Orders/Proceedings | - | - | √ | √ | √ | √ | √ |
| 12. | Judgments | - | - | √ | √ | √ | √ | √ |
| 13. | Online Certified Copy with 2D Barcode Authentication | - | - | √ | √ | - | √ | √ |
| 14. | Certified Copy Application Status | √ | √ | √ | √ | - | √ | √ |
| 15. | Certified Copy Ready Notification | √ | √ | √ | √ | - | √ | √ |
| 16. | Certified Copy Delivered Notification | √ | √ | √ | √ | - | √ | √ |
| 17. | Caveat Filed Information | √ | √ | √ | √ | - | √ | √ |
| 18. | Case filed against caveator | √ | √ | √ | √ | - | √ | √ |
| 19. | Appeal/Revision filed against order/judgments | √ | √ | √ | √ | √ | √ | √ |
| 20. | Digitally Signed Orders | - | - | √ | √ | √ | - | - |
| 21. | Digitally Signed Judgments | - | - | √ | √ | √ | - | - |
| 22. | Digitally Signed Decrees | - | - | √ | √ | √ | - | - |
| 23. | Digitally Signed Certified Copies of Case Record | - | - | √ | √ | √ | - | - |
| 24. | Process Service through Email | - | - | √ | - | - | - | - |
| 25. | eCourt Fees | - | - | - | √ | - | √ | √ |
| 26. | ePayment to Courts | - | - | - | √ | - | √ | √ |
| 27. | eFiling of Cases for SC/HC/DC | - | - | - | √ | - | - | √ |
| 28. | Regional Language DC Website | - | - | - | √ | - | - | √ |
| 29. | Disabled Friendly Website | - | - | - | √ | - | - | √ |
| 30. | Court Complex Location | - | - | - | √ | √ | - | - |

### 14. COST ESTIMATION

Projected Approx Cost Estimates – eCourts Project – Phase II

> The Budget column of the cost estimation table is blank for every one of the twenty-two
> components and for the Total row. That is how the approved document prints it; no
> figure has been dropped.

| Sr. No. | Component of the Project | Budget (In Cr.) |
|---|---|---|
| 1. | Creation of JSC-CFC / NR at all Court Complexes |  |
| 2. | Hardware – Computers & Thin Clients / Laptops, Printers, Scanners, Projector with Screen, Kiosks, Display Units, Barcode Printers/Scanners etc. |  |
| 3. | Local Area Network |  |
| 4. | Wide Area Network – Last Mile Connectivity upto SWAN PoP – LeasedLine/MPLS/Wimax/VSAT |  |
| 5. | Wide Area Network – Permanent Redundant Connectivity – 3G/Broadband |  |
| 6. | NIC Data Centre (Augmentation of Resources for Courts) – National & State |  |
| 7. | Other Cloud Computing Resources at SDCs/CCs |  |
| 8. | Manpower Resources |  |
| 9. | Laptops, Printers & UPS for Judicial Officers |  |
| 10. | Power Backup – DG Set |  |
| 11. | Power Backup – UPS |  |
| 12. | Power Backup – Solar Energy |  |
| 13. | Video Conferencing for Courts and Jails |  |
| 14. | Software Development, Customization & Support |  |
| 15. | Change Management & Capacity Building |  |
| 16. | Judicial Process Re-engineering |  |
| 17. | Project Management & Monitoring |  |
| 18. | Digital Signature Tokens, Authentication Devices for Process Servers etc. |  |
| 19. | Data Entry of Cases |  |
| 20. | Scanning, Digitization, Storage, Retrieval & Digital Preservation of Case Records |  |
| 21. | Workflow & Process Automation Tools / Measures and Judicial Knowledge Management System (JKMS) |  |
| 22. | Contingency Funds |  |
|  | Total.... |  |

## Annexure 1-I

### eCourts Integrated Mission Mode Project

Activities Approved in Phase I

| Sr. No. | Module |
|---|---|
| 1 | Creation of Computer Room at all the complexes/ Site Preparation |
| 2 | Laptops to Judicial Officers & Judges |
| 3 | ICT Training for Judges & its Staff |
| 4 | Technical Manpower |
| 5 | Computer Hardware (Servers, Clients, Printers, Scanners, Projectors etc.) |
| 6A | Communication & connectivity- Internet connectivity to Judges/ Court Complexes |
| 6B | Communication & Connectivity – LAN |
| 6C | Communication & Connectivity – WAN |
| 7A | Power backup - UPS |
| 7B | Power backup - DG Sets |
| 8 | Upgrading ICT infrastructure of SC and HC |
| 9 | Video conferencing in approx. 500 locations |
| 10 | Development of application software |
| 11 | Process Reengineering |
| 12 | Creation & Up gradation of Centralized facility for system administration |
| 13 | Project Management, project monitoring and Change Management Consultancy |
| 14 | System Software, Office Tools etc. |
| 15 | Digital Signature |
| 16 | Smart Card Solutions |
| 17 | WiFi Facility in Supreme Court & High Courts |
| 18 | Data Entry |

## Annexure 1-II

### Annexure 1-II

> Annexure 1-II prints no title line of its own under its running head, so the
> annexure designation is the unit heading as well as the division heading.

The report of National policy and Action Plan for Implementation of Information and Communication Technology in Indian Judiciary, suggested the implementation of the Project in three phases as under:

Phase-I

| Sr. No | Proposed Activity |
|---|---|
| 1 | Creation of computer room at all the court complexes with internet provisioning |
| 2 | Providing laptops to judicial officers and judges |
| 3 | ICT Training for the 1st year |
| 4 | System Software (OS, RDBMS, Office Packages etc.) |
| 5 | Creation of centralized facility for system administration. |
| 6 | Manpower development and retention cost |
| 7 | Up-gradation of ICT Infrastructure in Supreme Court and High Courts (1st year) |
| 8 | Project Management Consultancy, Monitoring and Change management |
| 9 | Extension of computer facility at process places, judges chamber, court hall filing scrutiny section and certified copy section and computer room within the court complex. |
| 10 | Upgradation of ICT and power infrastructure |
| 11 | Upgradation of centralized facility for system administration |
| 12 | Upgradation of computer facility computer room and providing scanner at the computing facility. |
| 13 | Manpower and Training Cost for the 2nd year |
| 14 | Up gradation of ICT Infrastructure in Supreme Court and High Courts (2nd year ) |
| 15 | Project Management Consultancy, Monitoring and Change management. |

Phase-II

| Sr. No | Proposed Activity |
|---|---|
| 1 | Creation of ICT Infrastructure for additional courts to be created during the project period as per the direction of the Supreme Court in All India Judges Association v Union of India, (2002) 4 SCC 247, pr. 25 |
| 2 | Provisioning of video conferencing facility between under trail prisoners and magistrate with video monitoring. |
| 3 | Installation of Wireless Internet facility system in the Supreme court and High court complexes |
| 4 | Infrastructure upgradation for centralized facility |
| 5 | Manpower and training |
| 6 | Up-gradation of Centralized facility |
| 7 | Digital Archive of record room and library Management system. |

Phase-III

| Sr. No | Proposed Activity |
|---|---|
| 1 | Use of advanced ICT tools, intensive training, warehousing and mining tool customization to crystallize change management, Biometric facilities, Gateway interface with other agencies. |
| 2 | Upgradation of centralized facility |
| 3 | Digital Archive of record room and Digital Library Management system |

## Annexure 1-III

### eCourts: Country wide status – 30th November, 2013

> This table prints a two-tier header - Site Preparation, Hardware Installed, LAN
> Installed and Software Rollout, each split into CC and Courts. The two tiers are
> joined into one header row here. The Total row is printed inside the header band,
> alongside the words "Sr. No."; it is written here as the first row. The table lists
> twenty-three High Courts and stops at Uttarakhand - there is no row for Delhi in the
> source, and the Total row is not the sum of the rows beneath it.

| Sr. No. | High Court | Site Preparation - CC | Site Preparation - Courts | Hardware Installed - CC | Hardware Installed - Courts | LAN Installed - CC | LAN Installed - Courts | Software Rollout - CC | Software Rollout - Courts |
|---|---|---|---|---|---|---|---|---|---|
|  | Total | 2649 | 14061 | 2524 | 13416 | 2427 | 13067 | 2404 | 13227 |
| 1 | Allahabad | 110 | 2009 | 105 | 2003 | 94 | 1914 | 91 | 1964 |
| 2 | Andhra Pradesh | 249 | 885 | 237 | 829 | 217 | 776 | 168 | 678 |
| 3 | Bombay | 434 | 1908 | 434 | 1908 | 417 | 1835 | 464 | 1954 |
| 4 | Calcutta | 89 | 774 | 86 | 770 | 89 | 774 | 86 | 770 |
| 5 | Chhatisgarh | 60 | 254 | 37 | 218 | 32 | 208 | 14 | 182 |
| 6 | Gauhati | 70 | 309 | 65 | 300 | 63 | 297 | 64 | 298 |
| 7 | Gujarat | 228 | 837 | 207 | 738 | 208 | 739 | 249 | 912 |
| 8 | Himachal Pradesh | 38 | 101 | 38 | 101 | 38 | 101 | 37 | 100 |
| 9 | Jammu & Kashmir | 76 | 184 | 74 | 156 | 67 | 171 | 33 | 131 |
| 10 | Jharkhand | 22 | 479 | 22 | 479 | 22 | 479 | 20 | 444 |
| 11 | Karnataka | 180 | 820 | 177 | 768 | 170 | 756 | 173 | 754 |
| 12 | Kerala | 126 | 420 | 121 | 399 | 120 | 396 | 108 | 365 |
| 13 | Madhya Pradesh | 173 | 1151 | 161 | 1101 | 161 | 1101 | 160 | 1100 |
| 14 | Madras | 231 | 787 | 215 | 668 | 196 | 610 | 211 | 641 |
| 15 | Manipur | 14 | 34 | 14 | 34 | 11 | 21 | 7 | 24 |
| 16 | Meghalaya | 1 | 7 | 1 | 7 | 1 | 7 | 1 | 7 |
| 17 | Orissa | 112 | 423 | 112 | 423 | 112 | 423 | 108 | 411 |
| 18 | Patna | 49 | 922 | 44 | 788 | 44 | 770 | 44 | 788 |
| 19 | Punjab & Haryana | 102 | 711 | 95 | 689 | 95 | 689 | 91 | 678 |
| 20 | Rajasthan | 238 | 788 | 237 | 787 | 232 | 768 | 237 | 787 |
| 21 | Sikkim | 4 | 10 | 4 | 10 | 4 | 10 | 4 | 10 |
| 22 | Tripura | 13 | 64 | 12 | 62 | 8 | 46 | 9 | 55 |
| 23 | Uttarakhand | 30 | 184 | 26 | 178 | 26 | 176 | 25 | 174 |

## Annexure 2-I

### Note for extension of Phase I as transition to Phase II of the eCourts Project only if Phase II could not commence from 1/4/2013

The policy document for Phase II of the eCourts Project has been prepared and is under submission to the full meeting of the eCommittee to be chaired by Hon'ble the Chief Justice of India. Coordinated efforts by the eCommittee, Department of Justice and NIC have been and will continue to be made for timely approval and commencement of Phase II of the Project from 1st April, 2014.

Although the priority is to start Phase II of the Project as per the policy document from 1st April, 2014, in the event of any delay in approval/commencement thereof, an extension of Phase I is proposed as a roll-over or intermediate Phase preceding the commencement of Phase II. The objective is to avoid any gap, halt or stand-still in the activities of the Project as referred in paragraph 14 of Chapter 2 of the policy document.

The following components of Phase I are required to be continued for implementation in the intervening period, if any, between Phase I and Phase II of the Project.

1. Completion of Phase I target of 14,249 Courts:

NIC has indicated that as on 30th November, 2013 the following main activities remain to be completed to reach the target of Courts in Phase I that is 14249:

| Sr. No. | Component | Accomplished | Pending |
|---|---|---|---|
| 1. | Site Preparation | 14061 | 188 |
| 2. | Hardware Installation | 13416 | 833 |
| 3. | LAN Installation | 13067 | 1182 |
| 4. | Software Deployment | 13227 | 1022 |

A number of Purchase Orders are either issued or are in the process of being issued for taking the present status further ahead and therefore the actual number of pending figures may be less than the above said figures as on 31st March, 2014. The activity for the above components pending as on 31st March, 2014 will have to be taken up in the extended duration of Phase I alongwith all other approved components of Phase I of the Project for these Courts.

2. Additional Courts:

The target of 14249 Courts was setup in year 2010 and a number of Courts have been established since then. The number of Courts as on 30th November, 2013 is 16127 across the Country (Annexure 2-II). Therefore, in the extension period, the following number of Courts will have to be taken up for Computerization:

> This table is three stacked columns of loose lines rather than a row-and-column grid.
> It is written as one row of three cells, each cell holding that column's lines in the
> order printed.

| A. Balanace Courts of 14249 | B. Total Courts | C. Additional Courts |
|---|---|---|
| 188 for Site Preparation 833 for Hardware 1182 for LAN 1022 for Software (as on 30th November, 2013) | 16127 (as on 30th November, 2013) | 16127 – 14249 = 1878 rounded off to 2000 Courts including any additional Courts that may come up in the meanwhile |

Total target for extension phase = A + C

The hardware allocation for the additional Courts to be computerized will be 2 + 6 (8 ) systems as proposed in the Phase II policy document meaning thereby that 2000 Courts will be have to be provided with 8 systems each of hardware as given below. The hardware for all additional Courts being taken up during the extended phase will be as per the following per Court quantity:

Basic Infrastructure Requirement for a Court Room

| Infrastructure Item | Quantity |
|---|---|
| Slimline PC with latest optimum configuration | 2 |
| Thin / Shared / Cloud Computing Client | 6 |
| Printers (1 MFD Printer + 1 Duplex Printer with Ethernet Port) | 2 |
| LAN Points | 12 |
| Extra Monitor + 2 port VGA Splitter/Extension/Distribution Unit | 1 |
| UPS 2 KVA with 2 hour backup | 1 |
| Display Monitor for Current Case Display Board outside Court Room with basic shared computing or thin client | 1 |

These 8 systems can be 2 PCs with 6 thin clients as per the specifications prevalent in Phase I or 8 special configuration laptops having backup time of more than 3 hours. In case of laptops with this much backup time being provided, the UPS for the Court as given herreinabove will be omitted. In addition to the above Court Room hardware, all other approved components (except the Court Room hardware of 1 + 3 systems) of Phase I of the Project for these Courts will also be provisioned.

2(a). Additional Courts that have come up within the same Court Complex: The Court Complexes already taken up in Phase I of the Project have been provided with Server Infrastructure in the Server Rooms which can cater to more systems in the additional Courts coming up in the same Court Complex. The additional Courts in the country which have come up within the same Court Complex, which can be covered using the already installed server infrastructure in the Court Complex, will be provided with the 2+6 (8) systems hardware as referred above in the extended period of Phase I of the Project.

2(b). Additional Courts coming up in new Court Complexes:

As Phase II of the Project is to implement Cloud Computing architecture for the eCourts Project, it is not advisable to invest more resources on purchase of server infrastructure for Courts at this stage. After assessing the additional courts that have come up in fresh/new Court Complexes, infrastructure for Judicial Service Centre/Centralized Filing Counter and Network Rooms will have to be provisioned. The hardware for Court Room will be as given above and the hardware for Court Complex will be as per the specifications/quantity of Phase I.

If the Court Complex is a single Court Complex, no server infrastructure has been provisioned in Phase I. For other Court Complexes having multiple Courts, varying quantity of servers from 2 to 10 depending upon the number of Courts in the Court Complex have been provided. In a large number of Court Complexes having multiple servers, not all the servers are utilized. Therefore, any new Court Complex that has come up, any such unutilized server infrastructure may be used for the purpose by way of reallocation and the related expenditure will have to be provisioned for the same. It is reiterated that investment on local server infrastructure is worth avoiding when the Project will be going in for cloud based computing soon and utilization of already procured server infrastructure is already being taken care of as given in the policy document on Phase II.

2(c). Laptops & Printers for Additional Judicial Officers:

As the extension phase will target computerisation of additional 2000 Courts over and above 14249, an equal number of Judicial Officers also will have to be provided with Laptop and Printer as given to the Judicial Officers during Phase I of the Project.

3. Video Conferencing between Courts & Jails:

Presently a pilot exercise for testing of software based video conferencing solution is underway for five Court Complexes and five jails. On the basis of the outcome of this pilot exercise, the software based VC solution is intended to be deployed for 500 Courts & Jails as a part of Phase I of the Project. As the result of the pilot is expected to be clear by the end of January, 2014 and it may not be possible to roll out the solution in 495 Courts & Jails across the country by 31st March, 2014. Therefore in the extended period of Phase I, all the District Court complexes and the Central, District and Women Jails of the country will have to be taken up for providing the software based VC solution, subject to the outcome of the ongoing pilot exercise.

4. Implementation of the decisions taken in the Empowered Committee Meeting held on 28th October, 2013:

(A) Replacement of the ICT infrastructure of Capital City Court

A decision has been taken in the aforesaid Empowered Committee meeting for the total replacement of the hardware & LAN of 95 Courts and replacement of the gap hardware of 376 Courts which were part of 29 Court Complexes of the Capital City Courts Project. If for any reason the funds transfer / procurement for implementing this decision is not complete by 31st March, 2014, it will have to be taken up in the extended duration of Phase I of the Project.

(B) Additional Hardware Requirements for the High Courts

In the said Empowered Committee meeting, a decision was taken approving the additional hardware requirement of 16 High Courts. The implementation of this decision is yet to start as the proposal is in the process of further approval by Ministry of Finance. The requirements received from High Courts of Allahabad, Bombay, Punjab & Haryana and Delhi and those of the Supreme Court will be placed in Empowered Committee soon. Thus the additional hardware requirement of 20 High Courts and the Supreme Court, which is intended to be provisioned from Phase I of the Project, will now have to be taken up in the extended duration of Phase I of the Project, if not completed by March, 2014.

(C) Requirement of technical and other skilled manpower for the office of the eCommittee:

A decision was taken in the said Empowered Committee meeting for deployment of 20 personnel at the eCommittee for a period until 31st March 2014, and provision of requisite hardware infrastructure for the office of the eCommittee. As the assessment of the resumes of personnel is under process for short listing the manpower to be deployed and the hardware as approved has also not been procured so far, the implementation of this decision, if it cannot be implemented by March, 2014, will have to be implemented in the extended duration of Phase I of the Project. The manpower for the eCommittee will be required till the extended duration of the Project.

5. Site Preparation & LAN Implementation Decentralization:

In order to expedite the completion of tasks in this extension period, the Site Preparation & LAN implementation activity which have been major contributors to delays in the Project, will be decentralized to High Courts for being completed within a preferred period of four months but not later than five months. The activities of sites preparation and LAN implementation will have to be taken up in fast tracked mode and the process of hardware P. O. Issuance etc. will follow simultaneously in order avoid any gap between site-readiness, LAN implementation and hardware delivery/installation.

The procurement of hardware will be from NIC empanelled vendors of the eCourts Project or NICSI empanelled vendors for the respective items. There will also be an option for the High Courts to procure the hardware item as per the procurement model given in the Phase II Policy and Action Plan Document.

Use of FOSS solutions only in the hardware provided and to be provided:

It is reiterated that, as given in the policy and action plan document of Phase II, all the software solutions to be deployed as part of the eCourts Project will be based on Free & Open Source Solutions (FOSS) technolgoies, which do not have any licensing or subscription charges to be paid. This policy will be strictly adhered to also in the extended duration of Phase I. This applies to the hardware already provided during Phase I and also the hardware that will be provided in the extended duration of Phase I. Hence, like Phase II proposal, no budgetary allocation for purchase of any software product will have to be made during extended period of the Phase I of the Project.

Extension Duration of Phase I and its impact on other ongoing/pending tasks of Phase I:

There are clear three months before the end of the Project. Therefore, a period of six months starting from April, 2014 will be sufficient for taking up the above referred pending tasks in the extended duration of Phase I of the Project. Consequently, the proposal for extension of Phase I, if at all necessary, is placed for not more than six months duration immediately after the present deadline of Phase I i.e. 31st March, 2014. This is vital for the reason that the implementation of the litigant friendly and reformative components of Phase II of the Project can be taken up as early as possible i.e. not later than 1st October, 2014.

The extension of the Phase I of the Project is intended to have an extension effect all on all other funding and ongoing activities already in progress in the Project. This is with reference to any funds still being utilized at High Court level for data entry, technical manpower, contingency expenses etc.

## Annexure 2-II

### HIGH COURT/STATE WISE COURT LIST AS ON 30.11.2013

| Sr. No. | HIGH COURT/ STATE | TOTAL COURTS |
|---|---|---|
| 1. | ANDHRA PRADESH | 1018 |
| 2. | ARUNACHAL PRADESH | 5 |
| 3. | ASSAM | 285 |
| 4. | BIHAR | 1199 |
| 5. | CHHATTISGARH | 348 |
| 6. | DELHI | 416 |
| 7. | GUJARAT | 1036 |
| 8. | HIMACHAL PRADESH | 118 |
| 9. | JAMMU & KASHMIR | 193 |
| 10. | JHARKHAND | 545 |
| 11. | KARNATAKA | 854 |
| 12. | KERALA | 426 |
| 13. | MADHYA PRADESH | 1327 |
| 14. | MAHARASHTRA & GOA | 2038 |
| 15. | MANIPUR | 31 |
| 16. | MEGHALAYA | 20 |
| 17. | MIZORAM | 32 |
| 18. | NAGALAND | 24 |
| 19. | ORISSA | 466 |
| 20. | PUNJAB & CHANDIGARH | 437 |
| 21. | HARYANA | 380 |
| 22. | RAJASTHAN | 928 |
| 23. | SIKKIM | 14 |
| 24. | TAMILNADU & PUDUCHERRY | 920 |
| 25. | TRIPURA | 62 |
| 26. | UTTARAKHAND | 184 |
| 27. | UTTAR PRADESH | 2054 |
| 28. | WEST BENGAL AND A&N | 767 |
|  | TOTAL | 16127 |
