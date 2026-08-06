# DRISTI domain digest - Transfer dishonour

> Dishonour of an electronic funds transfer for insufficiency of funds - the sibling offence to a cheque bounce, drafted as a deliberate parallel of it and then, in s.25(5), told to borrow the cheque machinery 'to the extent the circumstances admit'. Low volume and almost no reported authority; a first cut that names its own gaps.

Case type `eft-dishonour-s25` (PSS Act, 2007 · §25). As of 2026-08-06; code transition 2024-07-01. Maintained by PUCAR.

This digest is generated from the data - it joins the relevance profile and the resolved Akoma Ntoso text. Each item carries a **deep link** (a URL fragment for the viewer) and a `ref` into the machine-readable bundle `eft-dishonour-s25.json`. Do not edit by hand.

**This case type:** 96 provisions across 18 Acts, 64 national terms.

Also modelled in this corpus: **Cheque bounce** (NI Act, 1881 · §138, `cheque-dishonour-s138`). Each has its own bundle and digest under `/domain/`, and `/llms.txt` lists them all.

## What this case type does not model

Stated by the profile itself, so that an absence reads as an absence and not as a count of zero. Each paragraph is the profile's own reason, verbatim.

**State layers.** This is a first cut. It models the shared central core only. There is no state layer for this case type: no High Court rules, no e-filing rules, no court-fee entry, no special-court notification, no local practice. Where the s.138 profile has Kerala, Gujarat and Haryana overlays, this one has nothing, and the state pages will show the not-modelled placeholder.

**Case law.** No case-law dataset is linked, and that is a finding rather than an omission of effort. Section 25 has been on the statute book since 2008 and there is, so far as this pass could establish, effectively no reported Supreme Court authority construing it - no analogue of Rangappa on the presumption, of Dashrath Rupsingh on where the complaint lies, of Damodar S. Prabhu on compounding. The case type is therefore modelled almost entirely from the text of the Acts. The practical consequence is that the open questions recorded in the notes below - the limitation period, the place of trial, which compounding power governs - have no judicial answer to cite, only an argument either way.

**Normative requirements.** The normative layer (what a system MUST do to run one of these cases lawfully) is not derived for this case type. The 493 requirements in this corpus are all written against s.138 and none of them has been re-tested against s.25.

**State vocabulary.** The terms below are the national vocabulary only. There is no state vocabulary layer.

## National law - Acts and pinned provisions

### Payment and Settlement Systems Act, 2007  `pss`
*substantive · in force* - 15 provisions pinned to this case type.

- **25. Dishonour of electronic funds transfer for insufficiency, etc., of funds in the account** (`pss:sec_25`, tier: operative) - The whole case type in one section. 25(1) deems an offence where an electronic funds transfer initiated from a person's own account cannot be executed because the credit balance is short of the instruction, or exceeds the arrangement agreed with the bank, and punishes it with up to two years, or a fine up to twice the amount of the transfer, or both. The four provisos are the elements the complaint must plead: (a) the transfer was for the discharge, whole or part, of a debt or other liability; (b) it was initiated in accordance with the system provider's procedural guidelines; (c) the beneficiary demanded the money by notice in writing within thirty days of receiving information of the dishonour from the bank; and (d) the initiator failed to pay within fifteen days of that notice. 25(2) presumes the transfer was for a debt or liability. 25(3) closes the 'I had no reason to believe the account was short' defence. 25(4) makes the court presume dishonour on production of a communication from the bank, unless disproved. 25(5) applies Chapter XVII of the NI Act to the dishonour of an electronic funds transfer to the extent the circumstances admit. The Explanation confines 'debt or other liability' to a legally enforceable one. Read against NI s.138, the drafting is a conscious transposition: thirty days and fifteen days are the same clocks, the presumptions are the same presumptions, and the Explanation is word for word.
  > (1) Where an electronic funds transfer initiated by a person from an account maintained by him cannot be executed on the ground that the amount of money standing to the credit of that account is insufficient to honour the transfer instruction or that it exceeds the amount arranged to be paid from that account by an agreement made with a bank, such person shall be deemed to have committed an offence and shall, without prejudice to any other provisions of this Act, be punished with imprisonment for a term which may extend to two years, or with fine which may extend to twice the amount of the ele …
  [open](#law?act=pss&eid=sec_25)

- **27. Offences by companies** (`pss:sec_27`, tier: operative) - The PSS Act's own vicarious-liability section, and the reason NI s.141 does not need to travel through s.25(5). It works the same way: everyone in charge of and responsible to the company for the conduct of its business is liable along with the company, with a due-diligence and no-knowledge defence, and sub-section (2) reaches a director, manager, secretary or officer whose consent, connivance or neglect is proved. The Explanation defines 'company' to include a firm or association of individuals and 'director', for a firm, as a partner - identical in substance to the NI s.141 Explanation. One difference worth watching: s.27 is written for 'a contravention of any of the provisions of this Act', while NI s.141 is written for an offence under Chapter XVII, so s.27 is the wider net.
  > (1) Where a person committing a contravention of any of the provisions of this Act or any regulation, direction or order made thereunder is a company, every person who, at the time of the contravention, was in-charge of, and was responsible to, the company for the conduct of business of the company, as well as the company, shall be guilty of the contravention and shall be liable to be proceeded against and punished accordingly: Provided that nothing contained in this sub-section shall render any such person liable to punishment if he proves that the contravention took place without his knowled …
  [open](#law?act=pss&eid=sec_27)

- **28. Cognizance of offences** (`pss:sec_28`, tier: operative) - The point where this case type diverges most sharply from s.138. The Act's default is a regulator's default: no court may take cognizance of any PSS offence except on the written complaint of an officer of the Reserve Bank authorised in that behalf, and no court below a Metropolitan Magistrate or Judicial Magistrate of the first class may try it. The proviso is what makes s.25 a private complaint at all - the court MAY take cognizance of a s.25 offence on a complaint in writing by 'the person aggrieved by the dishonour'. Compare NI s.142, which states complainant, time and court together: the payee or holder in due course, within one month of the cause of action arising under clause (c) of the s.138 proviso, before a court not inferior to a JMFC, with sub-section (2) fixing territorial jurisdiction at the payee's bank branch. Section 28 answers who and which court. It says nothing about when, and nothing about where. Note also that the proviso says 'may take cognizance' where s.142 says 'no court shall take cognizance except', and that it names 'the person aggrieved' where s.25(1)(c) names 'the beneficiary' - two different words for what is presumably the same person, neither of them defined.
  > (1) No court shall take cognizance of an offence punishable under this Act except upon a complaint in writing made by an officer of the Reserve Bank generally or specially authorised by it in writing in this behalf, and no court, lower than that of a Metropolitan Magistrate or a Judicial Magistrate of the first class shall try any such offence: Provided that the Court may take cognizance of an offence punishable under section 25 upon a complaint in writing made by the person aggrieved by the dishonour of the electronic funds transfer. (2) Notwithstanding anything contained in the Code of Crimi …
  [open](#law?act=pss&eid=sec_28)

- **31. Power to compound offences** (`pss:sec_31`, tier: operative) - Unresolved, and squarely so. Section 31 lets an authorised officer of the Reserve Bank compound any offence under the Act that is not punishable with imprisonment only, or with imprisonment and also with fine, on the offender's application before or after proceedings begin. Section 25(1) is punishable with imprisonment, or with fine, or with both, so on the face of it s.31 covers it. But NI s.147, which s.25(5) would carry across, makes the offence compoundable in the ordinary way - between the parties, before the court, on the Damodar S. Prabhu scale of costs. Two compounding powers over the same offence, one vested in a banking regulator with no interest in the debt and one in the beneficiary who is owed it, cannot both be the intended route. Nothing in the Act resolves it and there is no authority. This model records the conflict rather than picking a winner.
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974), any offence punishable under this Act for any contravention, not being an offence punishable with imprisonment only, or with imprisonment and also with fine, may, on receipt of an application from the person committing such contravention either before or after the institution of any proceeding, be compounded by an officer of the Reserve Bank duly authorised by it in this behalf. (2) Where a contravention has been compounded under sub-section (1), no proceeding or further proceeding, as the case may be,  …
  [open](#law?act=pss&eid=sec_31)

- **26. Penalties** (`pss:sec_26`, tier: sentencing) - Not the penalty for a s.25 offence - s.25(1) carries its own - but the sentencing context a magistrate reads it against. Section 26 punishes operating a payment system without authorisation, false statements in returns, breach of the confidentiality duty and non-compliance with directions, with terms up to ten years and fines up to a crore. Section 25 sits at the bottom of that scale, which is a clue to how the legislature saw it: a two-year, fine-led, essentially compensatory offence inside a statute otherwise aimed at institutions.
  > (1)Where a person contravenes the provisions of section 4 or fails to comply with the terms and conditions subject to which the authorisation has been issued under section 7, he shall be punishable with imprisonment for a term which shall not be less than one month but which may extend to ten years or with fine which may extend to one crore rupees or with both and with a further fine which may extend to one lakh rupees for every day, after the first during which the contravention or failure to comply continues. (2) Whoever in any application for authorisation or in any return or other document …
  [open](#law?act=pss&eid=sec_26)

- **29. Application of fine** (`pss:sec_29`, tier: sentencing) - A court imposing a fine under the Act may direct the whole or part of it towards the costs of the proceedings. It is the PSS Act's only word on what happens to the money, and it points at costs, not at the beneficiary. In a s.138 case the fine is routinely routed to the payee as compensation under CrPC s.357 / BNSS s.395, and that machinery is available here too, but nothing in the PSS Act says so and s.29 pulls mildly the other way.
  > A court imposing any fine under this Act may direct that the whole or any part thereof shall be applied in, or towards payment of, the costs of the proceedings.
  [open](#law?act=pss&eid=sec_29)

- **30. Power of Reserve Bank to impose 2[penalties]** (`pss:sec_30`, tier: sentencing) - The regulator's own penalty route, kept separate from the criminal one. It matters to this case type mainly as the reason s.31's compounding power exists at all: the Act's normal enforcement mode is administrative, and s.25 is the exception grafted onto it.
  > (1) Notwithstanding anything contained in section 26, if a contravention or default of the nature referred to in sub-section (2) 3[or sub-section (3)] or sub-section (6) of section 26, as the case may be, the Reserve Bank may impose on the person contravening or committing default a penalty not exceeding 4[ten lakh] rupees or twice the amount involved in such contravention or default where such amount is quantifiable, whichever is more, and where such contravention or default is a continuing one, a further penalty which may extend to twenty- five thousand rupees for every day after the first d …
  [open](#law?act=pss&eid=sec_30)

- **32. Act to have overriding effect** (`pss:sec_32`, tier: operative) - The Act has effect notwithstanding anything inconsistent in any other law in force. This is the textual lever for saying that where a PSS provision and an NI Chapter XVII provision imported by s.25(5) cover the same ground, the PSS provision wins - which is how ss.27 and 28 displace NI ss.141 and 142, and how s.25(4) displaces NI s.146.
  > The provisions of this Act shall have effect notwithstanding anything inconsistent therewith contained in any other law for the time being in force.
  [open](#law?act=pss&eid=sec_32)

- **2. Definitions** (`pss:sec_2`, tier: definition) - The definition section, and the one that does the work s.138 gets from NI ss.3 to 13. It defines 'electronic funds transfer' (clause c) broadly enough to cover point-of-sale transfers, ATM transactions, direct deposits and withdrawals, telephone, internet and card payments; 'payment system' (i), 'payment instruction' (g), 'payment obligation' (h), 'settlement' (n), 'netting' (e), 'system provider' (q), 'system participant' (p) and 'bank' (a). What it does not define is telling: neither 'beneficiary' nor 'initiator', the two people the offence is actually about, appears in s.2. 'Beneficiary' surfaces only inside the definition of 'payment system' and in the s.25 proviso; 'initiator' is used in s.25 alone. Sub-section (2) borrows anything else from the Reserve Bank of India Act and the Banking Regulation Act.
  > (1) In this Act, unless the context otherwise requires,— (a) “bank” means,— (i) a bank included in the Second Schedule to the Reserve Bank of India Act, 1934(2 of 1934); (ii) a post office savings bank; (iii) a banking company as defined in clause (c) of section 5 of the Banking Regulation Act, 1949 (10 of 1949); (iv) a co-operative bank as defined in clause (cci) of section 5, as inserted by section 56 of the Banking Regulation Act, 1949 (10 of 1949); and (v) such other bank as the Reserve Bank may, by notification, specify for the purposes of this Act; (b) “derivative” means an instrument, t …
  [open](#law?act=pss&eid=sec_2)

- **4. Payment system not to operate without authorisation** (`pss:sec_4`, tier: supporting) - No one but the Reserve Bank may operate a payment system without authorisation. It matters to a s.25 case because 'system provider' means a person who operates an AUTHORISED payment system, so proviso (b) - initiation in accordance with the system provider's procedural guidelines - presupposes an authorised system. A transfer over an unauthorised system arguably has no s.25 offence attached to it at all.
  > (1) No person, other than the Reserve Bank, shall commence or operate a payment system except under and in accordance with an authorisation issued by the Reserve Bank under the provisions of this Act: Provided that nothing contained in this section shall apply to— (a) the continued operation of an existing payment system on commencement of this Act for a period not exceeding six months from such commencement, unless within such period, the operator of such payment system obtains an authorisation under this Act or the application for authorisation made under section 7 of this Act is refused by  …
  [open](#law?act=pss&eid=sec_4)

- **10. Power to determine standards** (`pss:sec_10`, tier: supporting) - The Reserve Bank's power to prescribe the format of payment instructions, timings, the manner of transfer and other standards, and to issue guidelines generally. Sits behind proviso (b): the procedural guidelines the initiator must have followed are issued by the system provider, but they are issued inside the standards this section sets.
  > (1) The Reserve Bank may, from time to time, prescribe— (a) the format of payment instructions and the size and shape of such instructions; (b) the timings to be maintained by payment systems; (c) the manner of transfer of funds within the payment system, either through paper, electronic means or in any other manner, between banks or between banks and other system participants; (d) such other standards to be complied with the payment systems generally; (e) the criteria for membership of payment systems including continuation, termination and rejection of membership; (f) the conditions subject  …
  [open](#law?act=pss&eid=sec_10)

- **20. System provider to act in accordance with the Act, regulations, etc** (`pss:sec_20`, tier: supporting) - Every system provider must operate in accordance with the Act, the regulations, the contract among system participants, the rules governing the system, the conditions of its authorisation and the Reserve Bank's directions. Read with s.21, this is where proviso (b)'s 'relevant procedural guidelines' come from and why they are a legal, not merely a commercial, standard.
  > Every system provider shall operate the payment system in accordance with the provisions of this Act, the regulations, the contract governing the relationship among the system participants, the rules and regulations which deal with the operation of the payment system and the conditions subject to which the authorisation is issued, and the directions given by the Reserve Bank from time to time.
  [open](#law?act=pss&eid=sec_20)

- **21. Duties of a system provider** (`pss:sec_21`, tier: supporting) - The system provider must disclose terms, conditions, charges and limitations of liability to participants and supply them with the rules governing the system. This is the closest the Act comes to naming the document proviso (b) of s.25(1) turns on. In practice, proving element (b) means proving what the guidelines said and that the instruction complied - a burden with no counterpart at all in a cheque case, where the drawer simply signs a cheque.
  > (1) Every system provider shall disclose to the existing or potential system participants, the terms and conditions including the charges and the limitations of liability under the payment system, supply them with copies of the rules and regulations governing the operation of the payment system, netting arrangements and other relevant documents. (2) It shall be the duty of every system provider to maintain the standards determined under this Act.
  [open](#law?act=pss&eid=sec_21)

- **22. Duty to keep documents in the payment system confidential** (`pss:sec_22`, tier: supporting) - A duty to keep documents in the payment system confidential, breach of which is itself punishable under s.26(4). It cuts against the complainant: the record that would prove the instruction, its compliance with the guidelines and the reason for non-execution sits with a bank and a system provider who are under a statutory duty of confidence and are not parties to the complaint.
  > (1) A system provider shall not disclose to any other person the existence or contents of any document or part thereof or other information given to him by a system participant, except where such disclosure is required under the provisions of this Act or the disclosure is made with the express or implied consent of the system participant concerned or where such disclosure is in obedience to the orders passed by a court of competent jurisdiction or a statutory authority in exercise of the powers conferred by a statute. (2) The provisions of the Bankers’ Book Evidence Act, 1891(18 of 1991) shall …
  [open](#law?act=pss&eid=sec_22)

- **23. Settlement and netting** (`pss:sec_23`, tier: supporting) - Settlement, gross or net, is final and irrevocable once determined. It marks the boundary of the offence from the other side: s.25 is about a transfer that CANNOT be executed, so a transfer that has reached settlement is outside it entirely, and the timeline of a payment system - instruction, clearing, settlement - is what fixes the moment of dishonour that starts the thirty-day clock.
  > (1) The payment obligations and settlement instructions among the system participants shall be determined in accordance with the gross or netting procedure, as the case maybe, approved by the Reserve Bank while issuing authorisation to a payment system 1[under section 7, or, such gross or netting procedure as may be approved by it under any other provisions of this Act]. (2) Where the rules providing for the operation of a payment system indicates a procedure for the distribution of losses between the system participants and the payment system, such procedure shall have effect notwithstanding  …
  [open](#law?act=pss&eid=sec_23)

### Negotiable Instruments Act, 1881  `ni`
*substantive · in force* - 15 provisions pinned to this case type.

- **138. Dishonour of cheque for insufficiency, etc., of funds in the account** (`ni:sec_138`, tier: operative) - Imported in form by s.25(5), spent in substance. Section 138 creates an offence about a cheque drawn on an account and returned unpaid by the bank; there is no cheque in an electronic funds transfer and no return of an instrument. The circumstances do not admit it, because s.25(1) has already done the same job in the same words for the transfer. It is pinned here as the source the whole case type was copied from, not as law to be applied.
  > Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person from out of that account for the discharge, in whole or in part, of any debt or other liability, is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient to honour the cheque or that it exceeds the amount arranged to be paid from that account by an agreement made with that bank, such person shall be deemed to have committed an offence and shall, without prejudice to any other provision of this A …
  [open](#law?act=ni&eid=sec_138)

- **139. Presumption in favour of holder** (`ni:sec_139`, tier: operative) - The presumption that the cheque was for the discharge of a debt or liability. Section 25(2) states the identical presumption for the transfer, so nothing comes across. The reason to keep it pinned is that s.139 carries a large body of Supreme Court authority - Rangappa above all - on what the presumption covers and how it is rebutted, and that reasoning is the only guidance a court reading s.25(2) has. Whether it may be borrowed is untested.
  > It shall be presumed, unless the contrary is proved, that the holder of a cheque received the cheque of the nature referred to in section138 for the discharge, in whole or in part, of any debt or other liability.
  [open](#law?act=ni&eid=sec_139)

- **140. Defence which may not be allowed in any prosecution under section 138** (`ni:sec_140`, tier: operative) - That the drawer had no reason to believe the cheque would be dishonoured is no defence. Section 25(3) says the same for the initiator of a transfer, in more words and to the same effect. Displaced.
  > Itshall not be a defence in a prosecution for an offence under section 138 that the drawer had no reason to believe when he issued the cheque that the cheque may be dishonoured on presentment for the reasons stated in that section.
  [open](#law?act=ni&eid=sec_140)

- **141. Offences by companies** (`ni:sec_141`, tier: operative) - Offences by companies. Displaced by PSS s.27, which is the same rule with the same defences and the same Explanation. The s.141 case law on who is 'in charge of and responsible to' a company - the specific averments a complaint must carry - is the natural interpretive source for s.27, but again by borrowing rather than by binding force.
  > (1) If the person committing an offence under section 138 is a company, every person who, at the time the offence was committed, was in charge of, and was responsible to, the company for the conduct of the business of the company, as well as the company, shall be deemed to be guilty of the offence and shall be liable to be proceeded against and punished accordingly: Provided that nothing contained in this sub-section shall render any person liable to punishment if he proves that the offence was committed without his knowledge, or that he had exercised all due diligence to prevent the commissio …
  [open](#law?act=ni&eid=sec_141)

- **142. Cognizance of offences** (`ni:sec_142`, tier: operative) - The most consequential pin in this profile. Section 142 does four things: (1)(a) confines the complaint to the payee or holder in due course; (1)(b) requires it within one month of the cause of action, with a proviso allowing condonation for sufficient cause; (1)(c) fixes the trying court at not below a JMFC; and (2) fixes territorial jurisdiction at the branch of the bank where the payee maintains the account. PSS s.28 covers the first and the third and displaces them. It covers neither the second nor the fourth. So either s.25(5) carries clauses (1)(b) and (2) across - and a s.25 complaint must be filed within one month, at the beneficiary's bank branch - or it does not, and the residual rules apply: three years under CrPC s.468 / BNSS s.514 for an offence punishable up to two years, and the ordinary venue rules of CrPC s.177 / BNSS s.197. The difference between one month and three years is not a detail; it decides whether a s.25 complaint is a fast-expiring statutory remedy like a cheque complaint or an ordinary criminal one. Nothing decides it. The better textual argument is that s.28 is a complete code for cognizance of PSS offences and that the circumstances therefore do not admit s.142 at all; the better purposive argument is that s.25 was written to mirror s.138 and the mirror is incomplete without the clock. This model records both and asserts neither.
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974),— (a) no court shall take cognizance of any offence punishable under section 138 except upon a complaint, in writing, made by the payee or, as the case may be, the holder in due course of the cheque; (b) such complaint is made within one month of the date on which the cause of action arises under clause (c) of the proviso to section 138: [Provided that the cognizance of a complaint may be taken by the Court after the prescribed period, if the complainant satisfies the Court that he had sufficient cause f …
  [open](#law?act=ni&eid=sec_142)

- **142A. Validation for transfer of pending cases** (`ni:sec_142A`, tier: operative) - Validation and transfer of cases pending when the 2015 jurisdiction amendment came into force. It is a transitional provision about a change to s.142(2) that never happened to s.25, so the circumstances do not admit it. Pinned to close the chapter: every section of Chapter XVII is accounted for in this profile.
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974) or any judgment, decree, order or direction of any court, all cases transferred to the court having jurisdiction under sub-section (2) of section 142, as amended by the Negotiable Instruments (Amendment) Ordinance, 2015 (Ord. 6 of 2015), shall be deemed to have been transferred under this Act, as if that sub-section had been in force at all material times. (2) Notwithstanding anything contained in sub-section (2) of section 142 or sub-section (1), where the payee or the holder in due course, as the case  …
  [open](#law?act=ni&eid=sec_142A)

- **143. Power of Court to try cases summarily** (`ni:sec_143`, tier: procedure) - Comes across, and this is the clearest case of s.25(5) doing real work. The PSS Act says nothing about how a s.25 complaint is tried. Section 143 makes it a summary trial under CrPC ss.262 to 265 (BNSS ss.283 to 288), lets the magistrate pass a sentence of up to one year and compensation up to five thousand rupees in a summary trial, and directs that the trial be concluded as far as possible within six months. Nothing in the circumstances of an electronic transfer resists any of that.
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974) all offences under this Chapter shall be tried by a Judicial Magistrate of the first class or by a Metropolitan Magistrate and the provisions of sections 262 to 265 (both inclusive) of the said Code shall, as far as may be, apply to such trials: Provided that in the case of any conviction in a summary trial under this section, it shall be lawful for the Magistrate to pass a sentence of imprisonment for a term not exceeding one year and an amount of fine exceeding five thousand rupees: Provided further th …
  [open](#law?act=ni&eid=sec_143)

- **143A. Power to direct interim compensation** (`ni:sec_143A`, tier: procedure) - Interim compensation of up to twenty per cent, payable by the drawer during the trial. It comes across only if 'the drawer of the cheque' is read as the initiator of the transfer and 'the amount of the cheque' as the amount of the transfer. Section 25(5) applies Chapter XVII to the dishonour of an electronic funds transfer, which is an instruction to make that substitution, but the substitution is not written anywhere and the amount of an interim award is a real deprivation to hang on an inference. Marked as imported because refusing it would leave the beneficiary of a failed transfer worse off than the payee of a bounced cheque for no reason the statute gives.
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973, the Court trying an offence under section 138 may order the drawer of the cheque to pay interim compensation to the complainant— (a) in a summary trial or a summons case, where he pleads not guilty to the accusation made in the complaint; and (b) in any other case, upon framing of charge. (2) The interim compensation under sub-section (1) shall not exceed twenty per cent. of the amount of the cheque. (3) The interim compensation shall be paid within sixty days from the date of the order under sub- section (1), or w …
  [open](#law?act=ni&eid=sec_143A)

- **144. Mode of service of summons** (`ni:sec_144`, tier: procedure) - Service of summons by speed post or an approved courier, and the rule that a refused summons is deemed served. Nothing in it is cheque-specific and the PSS Act supplies no alternative, so it comes across cleanly.
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974) and for the purposes of this Chapter, a Magistrate issuing a summons to an accused or a witness may direct a copy of summons to be served at the place where such accused or witness ordinarily resides or carries on business or personally works for gain, by speed post or by such courier services as are approved by a Court of Session. (2) Where an acknowledgment purporting to be signed by the accused or the witness or an endorsement purported to be made by any person authorised by the postal department or t …
  [open](#law?act=ni&eid=sec_144)

- **145. Evidence on affidavit** (`ni:sec_145`, tier: evidence) - The complainant's evidence may be given on affidavit and read in any inquiry, trial or other proceeding, subject to the court summoning the deponent on application. Comes across without strain, and matters more here than in a cheque case: most of what a s.25 complainant proves is documentary, and much of it is electronic.
  > (1)Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974), the evidence of the complainant may be given by him on affidavit and may, subject to all just exceptions be read in evidence in any enquiry, trial or other proceeding under the said Code. (2) The Court may, if it thinks fit, and shall, on the application of the prosecution or the accused, summon and examine any person giving evidence on affidavit as to the facts contained therein.
  [open](#law?act=ni&eid=sec_145)

- **146. Bank’s slip prima facie evidence of certain facts** (`ni:sec_146`, tier: evidence) - The bank's slip or memo with the official mark of dishonour is prima facie evidence. Section 25(4) is the same rule rebuilt for a transfer: on production of a communication from the bank denoting the dishonour, the court shall presume the fact of dishonour unless disproved. Displaced, and the PSS version is if anything the stronger of the two - it says 'shall presume', not 'prima facie evidence'.
  > The Court shall, in respect of every proceeding under this Chapter, on production of Bank's slip or memo having thereon the official mark denoting that the cheque has been dishonoured, presume the fact of dishonour of such cheque, unless and until such fact is disproved.
  [open](#law?act=ni&eid=sec_146)

- **147. Offences to be compoundable** (`ni:sec_147`, tier: procedure) - Every offence punishable under the NI Act is compoundable, notwithstanding the Code. Carried across by s.25(5), it would let the beneficiary and the initiator settle and end the case, which is how the overwhelming majority of s.138 matters actually finish. But PSS s.31 vests a compounding power over PSS offences in an officer of the Reserve Bank. The two do not sit together and the Act does not choose. See the note on pss:sec_31.
  > Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974),every offence punishable under this Act shall be compoundable].
  [open](#law?act=ni&eid=sec_147)

- **148. Power of Appellate Court to order payment pending appeal against conviction** (`ni:sec_148`, tier: procedure) - On an appeal against conviction, the appellate court may order the appellant to deposit a minimum of twenty per cent of the fine or compensation. Like s.143A it is written in the vocabulary of a cheque and comes across only by reading 'drawer' as initiator. The same reasoning applies, and the same doubt.
  > (1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974), in an appeal by the drawer against conviction under section 138, the Appellate Court may order the appellant to deposit such sum which shall be a minimum of twenty per cent. of the fine or compensation awarded by the trial Court: Provided that the amount payable under this sub-section shall be in addition to any interim compensation paid by the appellant under section 143A. (2) The amount referred to in sub-section (1) shall be deposited within sixty days from the date of the order, or within such furth …
  [open](#law?act=ni&eid=sec_148)

- **6. “Cheque.”** (`ni:sec_6`, tier: definition) - Pinned to make a structural point rather than to be applied. Section 25(5) imports Chapter XVII, and Chapter XVII alone. The words that Chapter uses - cheque, drawer, payee - are defined in Chapter I, which is not imported. So the imported machinery arrives without its dictionary, and every reference in ss.143A, 144, 145 and 148 to a cheque or its drawer has to be re-read for a transfer by the reader. This is the precise mechanism by which 'to the extent the circumstances admit' becomes a question rather than an instruction.
  > A “cheque” is a bill of exchange drawn on a specified banker and not expressed to be payable otherwise than on demand and it includes the electronic image of a truncated cheque and a cheque in the electronic form. Explanation I.—For the purposes of this section, the expressions— [(a) “a cheque in the electronic form” means a cheque drawn in electronic form by using any computer resource and signed in a secure system with digital signature (with or without biometrics signature) and asymmetric crypto system or with electronic signature, as the case may be;] (b) “a truncated cheque” means a chequ …
  [open](#law?act=ni&eid=sec_6)

- **7. “Drawer” “Drawee”** (`ni:sec_7`, tier: definition) - The other half of the missing dictionary. 'Drawer' is the maker of a cheque; the PSS Act's 'person initiating the electronic funds transfer' is not a drawer of anything. Reading ss.143A and 148 onto a s.25 case means treating the two as equivalents, which is a substitution the statute invites but never spells out.
  > The maker of a bill of exchange or cheque is called the “drawer”; the person thereby directed to pay is called the “drawee”. “Drawee in case of need”.— When in the Bill or in any indorsement thereon the name of any person is given in addition to the drawee to be resorted to in case of need such person is called a “drawee in case of need.” “Acceptor”.—After the drawee of a bill has signed his assent upon the bill, or, if there are more parts thereof than one, upon one of such parts, and delivered the same, or given notice of such signing to the holder or to some person on his behalf, he is call …
  [open](#law?act=ni&eid=sec_7)

### Bharatiya Nagarik Suraksha Sanhita, 2023  `bnss`
*procedure · in force from 2024-07-01* - 14 provisions pinned to this case type.

- **210. Cognizance of offences by Magistrate** (`bnss:sec_210`, tier: procedure) - = CrPC s.190. The general power on which PSS s.28 operates as a restriction.
  > (1) Subject to the provisions of this Chapter, any Magistrate of the first class, and any Magistrate of the second class specially empowered in this behalf under sub-section (2), may take cognizance of any offence— (a) upon receiving a complaint of facts, including any complaint filed by a person authorised under any special law, which constitutes such offence; (b) upon a police report (submitted in any mode including electronic mode) of such facts; (c) upon information received from any person other than a police officer, or upon his own knowledge, that such offence has been committed. (2) Th …
  [open](#law?act=bnss&eid=sec_210)

- **223. Examination of complainant** (`bnss:sec_223`, tier: procedure) - = CrPC s.200. The BNSS version adds a right of hearing to the accused before cognizance, which is new for every complaint case including this one.
  > (1) A Magistrate having jurisdiction while taking cognizance of an offence on complaint shall examine upon oath the complainant and the witnesses present, if any, and the substance of such examination shall be reduced to writing and shall be signed by the complainant and the witnesses, and also by the Magistrate: Provided that no cognizance of an offence shall be taken by the Magistrate without giving the accused an opportunity of being heard: Provided further that when the complaint is made in writing, the Magistrate need not examine the complainant and the witnesses— (a) if a public servant  …
  [open](#law?act=bnss&eid=sec_223)

- **227. Issue of process** (`bnss:sec_227`, tier: procedure) - = CrPC s.204.
  > (1) If in the opinion of a Magistrate taking cognizance of an offence there is sufficient ground for proceeding, and the case appears to be— (a) a summons-case, he shall issue summons to the accused for his attendance; or (b) a warrant-case, he may issue a warrant, or, if he thinks fit, a summons, for causing the accused to be brought or to appear at a certain time before such Magistrate or (if he has no jurisdiction himself) some other Magistrate having jurisdiction: Provided that summons or warrants may also be issued through electronic means. (2) No summons or warrant shall be issued agains …
  [open](#law?act=bnss&eid=sec_227)

- **285. Procedure for summary trials** (`bnss:sec_285`, tier: procedure) - The summary-trial chapter (ss.283-288) = CrPC ss.262-265, which NI s.143 names and s.25(5) carries in.
  > (1) In trials under this Chapter, the procedure specified in this Sanhita for the trial of summons-case shall be followed except as hereinafter mentioned. (2) No sentence of imprisonment for a term exceeding three months shall be passed in the case of any conviction under this Chapter.
  [open](#law?act=bnss&eid=sec_285)

- **63. Form of summons** (`bnss:sec_63`, tier: procedure) - Read with the imported NI s.144.
  > Every summons issued by a Court under this Sanhita shall be,— (i) in writing, in duplicate, signed by the presiding officer of such Court or by such other officer as the High Court may, from time to time, by rule direct, and shall bear the seal of the Court; or (ii) in an encrypted or any other form of electronic communication and shall bear the image of the seal of the Court or digital signature.
  [open](#law?act=bnss&eid=sec_63)

- **64. Summons how served** (`bnss:sec_64`, tier: procedure) - 
  > (1) Every summons shall be served by a police officer, or subject to such rules as the State Government may make in this behalf, by an officer of the Court issuing it or other public servant: Provided that the police station or the registrar in the Court shall maintain a register to enter the address, email address, phone number and such other details as the State Government may, by rules, provide. (2) The summons shall, if practicable, be served personally on the person summoned, by delivering or tendering to him one of the duplicates of the summons: Provided that summons bearing the image of …
  [open](#law?act=bnss&eid=sec_64)

- **197. Ordinary place of inquiry and trial** (`bnss:sec_197`, tier: procedure) - = CrPC s.177. This is where a s.25 complaint is filed if NI s.142(2) does not come across - the court in whose local jurisdiction the offence was committed, which for a failed transfer is itself a hard question with a bank on one side and a beneficiary on the other.
  > Every offence shall ordinarily be inquired into and tried by a Court within whose local jurisdiction it was committed.
  [open](#law?act=bnss&eid=sec_197)

- **514. Bar to taking cognizance after lapse of period of limitation** (`bnss:sec_514`, tier: limitation) - = CrPC s.468. Three years for an offence punishable with imprisonment exceeding one year but not exceeding three years, which is what s.25(1) is. This is the residual limitation for a s.25 complaint if the one-month rule in NI s.142(1)(b) is held not to travel through s.25(5).
  > (1) Except as otherwise provided in this Sanhita, no Court shall take cognizance of an offence of the category specified in sub-section (2), after the expiry of the period of limitation. (2) The period of limitation shall be— (a) six months, if the offence is punishable with fine only; (b) one year, if the offence is punishable with imprisonment for a term not exceeding one year; (c) three years, if the offence is punishable with imprisonment for a term exceeding one year but not exceeding three years. (3) For the purposes of this section, the period of limitation, in relation to offences whic …
  [open](#law?act=bnss&eid=sec_514)

- **515. Commencement of period of limitation** (`bnss:sec_515`, tier: limitation) - = CrPC s.469. Fixes the day the period starts, which on a s.25 cause of action is the day after the fifteen days under proviso (d) expire.
  > (1) The period of limitation, in relation to an offender, shall commence,— (a) on the date of the offence; or (b) where the commission of the offence was not known to the person aggrieved by the offence or to any police officer, the first day on which such offence comes to the knowledge of such person or to any police officer, whichever is earlier; or (c) where it is not known by whom the offence was committed, the first day on which the identity of the offender is known to the person aggrieved by the offence or to the police officer making investigation into the offence, whichever is earlier. …
  [open](#law?act=bnss&eid=sec_515)

- **519. Extension of period of limitation in certain cases** (`bnss:sec_519`, tier: limitation) - = CrPC s.473. Cognizance despite expiry where the delay is properly explained or it is necessary in the interests of justice.
  > Notwithstanding anything contained in the foregoing provisions of this Chapter, any Court may take cognizance of an offence after the expiry of the period of limitation, if it is satisfied on the facts and in the circumstances of the case that the delay has been properly explained or that it is necessary so to do in the interests of justice.
  [open](#law?act=bnss&eid=sec_519)

- **359. Compounding of offences** (`bnss:sec_359`, tier: procedure) - = CrPC s.320. Neither NI s.147 nor PSS s.31 works through this section - both open with a non obstante - but it is the baseline against which their conflict has to be read.
  > (1) The offences punishable under the sections of the Bharatiya Nyaya Sanhita, 2023 (45 of 2023) specified in the first two columns of the Table next following may be compounded by the persons mentioned in the third column of that Table: — TABLE Offence Section of the Bharatiya Nyaya Person by whom offence Sanhita, 2023 applicable may be compounded 1 2 3 Enticing or taking away or 84 The husband of the woman detaining with criminal intent a and the woman. married woman. Voluntarily causing hurt. 115(2) The person to whom the hurt is caused. Voluntarily causing hurt on 122(1) The person to whom …
  [open](#law?act=bnss&eid=sec_359)

- **395. Order to pay compensation** (`bnss:sec_395`, tier: procedure) - = CrPC s.357. The route by which the fine under s.25(1), which may run to twice the amount of the transfer, reaches the beneficiary. Read against PSS s.29, which points the fine at costs instead.
  > (1) When a Court imposes a sentence of fine or a sentence (including a sentence of death) of which fine forms a part, the Court may, when passing judgment, order the whole or any part of the fine recovered to be applied— (a) in defraying the expenses properly incurred in the prosecution; (b) in the payment to any person of compensation for any loss or injury caused by the offence, when compensation is, in the opinion of the Court, recoverable by such person in a Civil Court; (c) when any person is convicted of any offence for having caused the death of another person or of having abetted the c …
  [open](#law?act=bnss&eid=sec_395)

- **415. Appeals from convictions** (`bnss:sec_415`, tier: procedure) - = CrPC s.374. The appeal on which the imported NI s.148 deposit would be ordered.
  > (1) Any person convicted on a trial held by a High Court in its extraordinary original criminal jurisdiction may appeal to the Supreme Court. (2) Any person convicted on a trial held by a Sessions Judge or an Additional Sessions Judge or on a trial held by any other Court in which a sentence of imprisonment for more than seven years has been passed against him or against any other person convicted at the same trial, may appeal to the High Court. (3) Save as otherwise provided in sub-section (2), any person,-- (a) convicted on a trial held by Magistrate of the first class, or of the second clas …
  [open](#law?act=bnss&eid=sec_415)

- **528. Saving of inherent powers of High Court** (`bnss:sec_528`, tier: procedure) - = CrPC s.482. The route to quash a s.25 complaint, and the forum in which the open questions in this profile will in practice first be argued.
  > Nothing in this Sanhita shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Sanhita, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.
  [open](#law?act=bnss&eid=sec_528)

### Code of Criminal Procedure, 1973  `crpc`
*procedure · repealed 2024-07-01; applies to causes of action before that date* - 12 provisions pinned to this case type.

- **190. Cognizance of offences by Magistrates** (`crpc:sec_190`, tier: procedure) - 
  > (1) Subject to the provisions of this Chapter, any Magistrate of the first class, and any Magistrate of the second class specially empowered in this behalf under sub-section (2), may take cognizance of any offence— (a) upon receiving a complaint of facts which constitute such offence; (b) upon a police report of such facts; (c) upon information received from any person other than a police officer, or upon his own knowledge, that such offence has been committed. (2) The Chief Judicial Magistrate may empower any Magistrate of the second class to take cognizance under sub-section (1) of such offe …
  [open](#law?act=crpc&eid=sec_190)

- **200. Examination of complainant** (`crpc:sec_200`, tier: procedure) - 
  > A Magistrate taking cognizance of an offence on complaint shall examine upon oath the complainant and the witnesses present, if any, and the substance of such examination shall be reduced to writing and shall be signed by the complainant and the witnesses, and also by the Magistrate: Provided that, when the complaint is made in writing, the Magistrate need not examine the complainant and the witnesses— (a) if a public servant acting or purporting to act in the discharge of his official duties or a Court has made the complaint; or (b) if the Magistrate makes over the case for inquiry or trial t …
  [open](#law?act=crpc&eid=sec_200)

- **204. Issue of process** (`crpc:sec_204`, tier: procedure) - 
  > (1) If in the opinion of a Magistrate taking cognizance of an offence there is sufficient ground for proceeding, and the case appears to be— (a) a summons-case, he shall issue his summons for the attendance of the accused, or (b) a warrant-case, he may issue a warrant, or, if he thinks fit, a summons, for causing the accused to be brought or to appear at a certain time before such Magistrate or (if he has no jurisdiction himself) some other Magistrate having jurisdiction. (2) No summons or warrant shall be issued against the accused under sub-section (1) until a list of the prosecution witness …
  [open](#law?act=crpc&eid=sec_204)

- **262. Procedure for summary trials** (`crpc:sec_262`, tier: procedure) - Expressly invoked by NI Act s.143 (ss.262-265), which s.25(5) imports.
  > (1) In trials under this Chapter, the procedure specified in this Code for the trial of summons-case shall be followed except as hereinafter mentioned. (2) No sentence of imprisonment for a term exceeding three months shall be passed in the case of any conviction under this Chapter.
  [open](#law?act=crpc&eid=sec_262)

- **177. Ordinary place of inquiry and trial** (`crpc:sec_177`, tier: procedure) - 
  > Every offence shall ordinarily be inquired into and tried by a Court within whose local jurisdiction it was committed.
  [open](#law?act=crpc&eid=sec_177)

- **468. Bar to taking cognizance after lapse of the period of limitation** (`crpc:sec_468`, tier: limitation) - Three years for an offence punishable with imprisonment for a term exceeding one year but not exceeding three - the class s.25(1) falls in.
  > (1) Except as otherwise provided elsewhere in this Code, no Court shall take cognizance of an offence of the category specified in sub-section (2), after the expiry of the period of limitation. (2) The period of limitation shall be— (a) six months, if the offence is punishable with fine only; (b) one year, if the offence is punishable with imprisonment for a term not exceeding one year; (c) three years, if the offence is punishable with imprisonment for a term exceeding one year but not exceeding three years. (3) For the purposes of this section, the period of limitation, in relation to offenc …
  [open](#law?act=crpc&eid=sec_468)

- **469. Commencement of the period of limitation** (`crpc:sec_469`, tier: limitation) - 
  > (1) The period of limitation, in relation to an offender, shall commence,— (a) on the date of the offence; or (b) where the commission of the offence was not known to the person aggrieved by the offence or to any police officer, the first day on which such offence comes to the knowledge of such person or to any police officer, whichever is earlier; or (c) where it is not known by whom the offence was committed, the first day on which the identity of the offender is known to the person aggrieved by the offence or to the police officer making investigation into the offence, whichever is earlier. …
  [open](#law?act=crpc&eid=sec_469)

- **473. Extension of period of limitation in certain cases** (`crpc:sec_473`, tier: limitation) - 
  > Notwithstanding anything contained in the foregoing provisions of this Chapter, any Court may take cognizance of an offence after the expiry of the period of limitation, if it is satisfied on the facts and in the circumstances of the case that the delay has been properly explained or that it is necessary so to do in the interests of justice.
  [open](#law?act=crpc&eid=sec_473)

- **320. Compounding of offences** (`crpc:sec_320`, tier: procedure) - 
  > (1) The offences punishable under the sections of the Indian Penal Code (45 of 1860) specified in the first two columns of the Table next following may be compounded by the persons mentioned in the third column of that Table:— [TABLE Offence Section of the Person by whom offence Indian Penal may be compounded Code applicable 1 2 3 Uttering words, etc., with deliberate 298 The person whose religious feelings intent to wound the religious are intended to be wounded. feelings of any person. Voluntarily causing hurt. 323 The person to whom the hurt is caused. Voluntarily causing hurt on 334 Ditto. …
  [open](#law?act=crpc&eid=sec_320)

- **357. Order to pay compensation** (`crpc:sec_357`, tier: procedure) - 
  > (1) When a Court imposes a sentence of fine or a sentence (including a sentence of death) of which fine forms a part, the Court may, when passing judgment, order the whole or any part of the fine recovered to be applied— (a) in defraying the expenses of properly incurred in the prosecution; (b) in the payment to any person of compensation for any loss or injury caused by the offence, when compensation is, in the opinion of the Court, recoverable by such person in a Civil Court; (c) when any person is convicted of any offence for having caused the death of another person or of having abetted th …
  [open](#law?act=crpc&eid=sec_357)

- **374. Appeals from convictions** (`crpc:sec_374`, tier: procedure) - 
  > (1) Any person convicted on a trial held by a High Court in its extraordinary original criminal jurisdiction may appeal to the Supreme Court. (2) Any person convicted on a trial held by a Sessions Judge or an Additional Sessions Judge or on a trial held by any other court in which a sentence of imprisonment for more than seven years 2[has been passed against him or against any other person convicted at the same trial], may appeal to the High Court. (3) Save as otherwise provided in sub-section (2), any person,— (a) convicted on a trial held by a Metropolitan Magistrate or Assistant Sessions Ju …
  [open](#law?act=crpc&eid=sec_374)

- **482. Saving of inherent powers of High Court** (`crpc:sec_482`, tier: procedure) - 
  > Nothing in this Code shall be deemed to limit or affect the inherent powers of the High Court to make such orders as may be necessary to give effect to any order under this Code, or to prevent abuse of the process of any Court or otherwise to secure the ends of justice.
  [open](#law?act=crpc&eid=sec_482)

### Bharatiya Sakshya Adhiniyam, 2023  `bsa`
*evidence · in force from 2024-07-01* - 3 provisions pinned to this case type.

- **63. Admissibility of electronic records** (`bsa:sec_63`, tier: evidence) - = IEA s.65B. Load-bearing here in a way it is not in a cheque case. In a s.138 trial the primary document is a piece of paper; in a s.25 trial there is no paper at all. The instruction, the system provider's log, the bank's communication of dishonour and often the demand notice are all electronic records, and every one of them needs the s.63 certificate to go in.
  > (1) Notwithstanding anything contained in this Adhiniyam, any information contained in an electronic record which is printed on paper, stored, recorded or copied in optical or magnetic media or semiconductor memory which is produced by a computer or any communication device or otherwise stored, recorded or copied in any electronic form (hereinafter referred to as the computer output) shall be deemed to be also a document, if the conditions mentioned in this section are satisfied in relation to the information and computer in question and shall be admissible in any proceedings, without further  …
  [open](#law?act=bsa&eid=sec_63)

- **86. Presumption as to electronic records and electronic signatures** (`bsa:sec_86`, tier: evidence) - = IEA s.85B. Presumes the integrity of a secure electronic record and that a secure electronic signature was affixed with the intention of signing - the presumption that makes proving 'this person initiated the transfer' tractable.
  > (1) In any proceeding involving a secure electronic record, the Court shall presume unless contrary is proved, that the secure electronic record has not been altered since the specific point of time to which the secure status relates. (2) In any proceeding, involving secure electronic signature, the Court shall presume unless the contrary is proved that— (a) the secure electronic signature is affixed by subscriber with the intention of signing or approving the electronic record; (b) except in the case of a secure electronic record or a secure electronic signature, nothing in this section shall …
  [open](#law?act=bsa&eid=sec_86)

- **104. Burden of proof** (`bsa:sec_104`, tier: evidence) - = IEA s.101. Read with the presumptions in s.25(2) and 25(4), which shift the burden the moment the complainant produces the bank's communication.
  > Whoever desires any Court to give judgment as to any legal right or liability dependent on the existence of facts which he asserts must prove that those facts exist, and when a person is bound to prove the existence of any fact, it is said that the burden of proof lies on that person. Illustrations. (a) A desires a Court to give judgment that B shall be punished for a crime which A says B has committed. A must prove that B has committed the crime. (b) A desires a Court to give judgment that he is entitled to certain land in the possession of B, by reason of facts which he asserts, and which B  …
  [open](#law?act=bsa&eid=sec_104)

### Indian Evidence Act, 1872  `iea`
*evidence · repealed 2024-07-01* - 3 provisions pinned to this case type.

- **65B. Admissibility of electronic records. –– (1) Notwithstanding anything contained in this Act,** (`iea:sec_65B`, tier: evidence) - 
  > any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media produced by a computer (hereinafter referred to as the computer output) shall be deemed to be also a document, if the conditions mentioned in this section are satisfied in relation to the information and computer in question and shall be admissible in any proceedings, without further proof or production of the original, as evidence or any contents of the original or of any fact stated therein of which direct evidence would be admissible. (2) The conditions refe …
  [open](#law?act=iea&eid=sec_65B)

- **85B. Presumption as to electronic records and 5[electronic signatures]. –– (1) In any proceedings** (`iea:sec_85B`, tier: evidence) - 
  > involving a secure electronic record, the Court shall presume unless contrary is proved, that the secure electronic record has not been altered since the specific point of time to which the secure status relates. (2) In any proceedings, involving secure digital signature, the Court shall presume unless the contrary is proved that— (a) the secure 5[electronic signature] is affixed by subscriber with the intention of signing or approving the electronic record; (b) except in the case of a secure electronic record or a secure 5[electronic signature], nothing in this section shall cerate any presum …
  [open](#law?act=iea&eid=sec_85B)

- **101. Burden of proof. –– Whoever desires any Court to give judgment as to any legal right or** (`iea:sec_101`, tier: evidence) - 
  > liability dependent on the existence of facts which he asserts, must prove that those facts exist. When a person is bound to prove the existence of any fact, it is said that the burden of proof lies on that person. Illustrations (a) A desires a Court to give judgment that B shall be punished for a crime which A says B has committed. A must prove that B has committed the crime. (b) A desires a Court to give judgment that he is entitled to certain land in the possession of B, by reason of facts which he asserts, and which B denies, to be true. A must prove the existence of those facts.
  [open](#law?act=iea&eid=sec_101)

### Bankers' Books Evidence Act, 1891  `bbea`
*evidence · in force* - 2 provisions pinned to this case type.

- **2. Definitions** (`bbea:sec_2`, tier: evidence) - 'Bankers' books' expressly includes records kept in electronic form, which is what makes this Act usable at all for an account held on a core banking system.
  > In this Act, unless there is something repugnant in the subject or context,— (1) “company” means any company as defined in section 3 of the Companies Act, 1956 (1 of 1956), and includes a foreign company within the meaning of section 591 of that Act; (1A) “corporation” means any body corporate established by any law for the time being in force in India and includes the Reserve Bank of India, the State Bank of India and any subsidiary bank as defined in the State Bank of India (Subsidiary Banks) Act, 1959 (38 of 1959);] (2) “bank” and “banker” mean— [(a) any company or corporation carrying on t …
  [open](#law?act=bbea&eid=sec_2)

- **4. Mode of proof of entries in bankers’ books** (`bbea:sec_4`, tier: evidence) - The certified copy route to proving the state of the account - that is, proving the insufficiency that is the whole substance of the offence, as distinct from the dishonour that s.25(4) presumes.
  > Subject to the provisions of this Act, a certified copy of any entry in a banker’s book shall in all legal proceedings be received as prima facie evidence of the existence of such entry, and shall be admitted as evidence of the matters, transactions and accounts therein recorded in every case where, and to the same extent as, the original entry itself is now by law admissible, but not further or otherwise.
  [open](#law?act=bbea&eid=sec_4)

### Information Technology Act, 2000  `itact`
*electronic · in force* - 6 provisions pinned to this case type.

- **2. Definitions** (`itact:sec_2`, tier: definition) - Supplies 'electronic record', 'electronic form', 'addressee' and 'originator' - and 'originator' is the nearest defined word for the person the PSS Act calls the initiator of a transfer, a term the PSS Act itself never defines.
  > (1) In this Act, unless the context otherwise requires,— (a) ―access‖ with its grammatical variations and cognate expressions means gaining entry into, instructing or communicating with the logical, arithmetical, or memory function resources of a computer, computer system or computer network; (b) ―addressee‖ means a person who is intended by the originator to receive the electronic record but does not include any intermediary; (c) ―adjudicating officer‖ means an adjudicating officer appointed under sub-section (1) of section 46;
  [open](#law?act=itact&eid=sec_2)

- **3. Authentication of electronic records.–(1) Subject to the provisions of this section any subscriber** (`itact:sec_3`, tier: supporting) - How an electronic record is authenticated by a digital signature. Behind proviso (b): initiation 'in accordance with the relevant procedural guidelines' is, in practice, a question about authentication.
  > may authenticate an electronic record by affixing his digital signature. (2) The authentication of the electronic record shall be effected by the use of asymmetric crypto system and hash function which envelop and transform the initial electronic record into another electronic record. Explanation.–For the purposes of this sub-section, ―hash function‖ means an algorithm mapping or translation of one sequence of bits into another, generally smaller, set known as ―hash result‖ such that an electronic record yields the same hash result every time the algorithm is executed with the same electronic  …
  [open](#law?act=itact&eid=sec_3)

- **3A. Electronic signature** (`itact:sec_3A`, tier: supporting) - The wider electronic-signature regime that covers the second factors and one-time passwords an ordinary retail transfer actually uses.
  > (1) Notwithstanding anything contained in section 3, but subject to the provisions of sub-section (2), a subscriber may authenticate any electronic record by such electronic signature or electronic authentication technique which— (a) is considered reliable; and (b) may be specified in the Second Schedule. (2) For the purposes of this section any electronic signature or electronic authentication technique shall be considered reliable if— (a) the signature creation data or the authentication data are, within the context in which they are used, linked to the signatory or, as the case may be, the  …
  [open](#law?act=itact&eid=sec_3A)

- **4. Legal recognition of electronic records** (`itact:sec_4`, tier: notice) - Where a law requires information to be in writing, an electronic record satisfies it. This is what lets proviso (c)'s 'notice in writing' be an email, and it is a question the cheque case never had to answer because a demand notice is posted.
  > Where any law provides that information or any other matter shall be in writing or in the typewritten or printed form, then, notwithstanding anything contained in such law, such requirement shall be deemed to have been satisfied if such information or matter is– (a) rendered or made available in an electronic form; and (b) accessible so as to be usable for a subsequent reference.
  [open](#law?act=itact&eid=sec_4)

- **11. Attribution of electronic records** (`itact:sec_11`, tier: evidence) - When an electronic record is attributed to the originator - including where it was sent by a system programmed to operate automatically on his behalf. The provision that connects a transfer instruction to the person accused of initiating it.
  > An electronic record shall be attributed to the originator— (a) if it was sent by the originator himself; (b) by a person who had the authority to act on behalf of the originator in respect of that electronic record; or (c) by an information system programmed by or on behalf of the originator to operate automatically.
  [open](#law?act=itact&eid=sec_11)

- **13. Time and place of despatch and receipt of electronic record** (`itact:sec_13`, tier: notice) - Fixes when an electronic record is despatched and received, and deems the place of despatch and receipt to be the originator's and the addressee's places of business. It decides when the thirty-day and fifteen-day clocks in s.25(1) start if the notice is electronic, and it is one of the few provisions in the corpus that speaks to where a wholly electronic cause of action arises.
  > (1) Save as otherwise agreed to between the originator and the addressee, the despatch of an electronic record occurs when it enters a computer resource outside the control of the originator. (2) Save as otherwise agreed between the originator and the addressee, the time of receipt of an electronic record shall be determined as follows, namely:— (a) if the addressee has designated a computer resource for the purpose of receiving electronic records,— (i) receipt occurs at the time when the electronic record enters the designated computer resource; or (ii) if the electronic record is sent to a c …
  [open](#law?act=itact&eid=sec_13)

### General Clauses Act, 1897  `genclauses`
*interpretation · in force* - 1 provisions pinned to this case type.

- **27. Meaning of service by post** (`genclauses:sec_27`, tier: notice) - The basis on which a demand notice under proviso (c) is deemed served when properly addressed, prepaid and posted, whatever the addressee says about receiving it. Carried over from the s.138 model, where it does most of the work on notice.
  > Where any 2[Central Act] or Regulation made after the commencement of this Act authorizes or requires any document to be served by post, whether the expression “serve” or either of the expressions “give” or “send” or any other expression is used, then, unless a different intention appears, the service shall be deemed to be effected by properly addressing, pre-paying and posting by registered post, a letter containing the document, and, unless the contrary is proved, to have been effected at the time at which the letter would be delivered in the ordinary course of post.
  [open](#law?act=genclauses&eid=sec_27)

### Limitation Act, 1963  `limitation`
*limitation · in force* - 1 provisions pinned to this case type.

- **5. Extension of prescribed period in certain cases** (`limitation:sec_5`, tier: limitation) - Relevant only if the one-month rule in NI s.142(1)(b) is held to come across, since it is that proviso which brings condonation into a cheque complaint. On the other reading of s.25(5) the operative extension provision is CrPC s.473 / BNSS s.519 instead.
  > Any appeal or any application, other than an application under any of the provisions of Order XXI of the Code of Civil Procedure, 1908 (5 of 1908), may be admitted after the prescribed period if the appellant or the applicant satisfies the court that he had sufficient cause for not preferring the appeal or making the application within such period. Explanation.—The fact that the appellant or the applicant was misled by any order, practice or judgment of the High Court in ascertaining or computing the prescribed period may be sufficient cause within the meaning of this section.
  [open](#law?act=limitation&eid=sec_5)

### Probation of Offenders Act, 1958  `probation`
*sentencing · in force* - 3 provisions pinned to this case type.

- **3. Power of court to release certain offenders after admonition** (`probation:sec_3`, tier: sentencing) - 
  > When any person is found guilty of having committed an offence punishable under section 379 or section 380 or section 381 or section 404 or section 420 of the Indian Penal Code, (45 of 1860) or any offence punishable with imprisonment for not more than two years, or with fine, or with both, under the Indian Penal Code or any other law, and no previous conviction is proved against him and the court by which the person is found guilty is of opinion that, having regard to the circumstances of the case including the nature of the offence, and the character of the offender, it is expedient so to do …
  [open](#law?act=probation&eid=sec_3)

- **4. Power of court to release certain offenders on probation of good conduct** (`probation:sec_4`, tier: sentencing) - Available on the same reasoning as in a s.138 case: a two-year, fine-led offence arising out of a debt is the paradigm case for probation rather than custody.
  > (1) When any person is found guilty of having committed an offence not punishable with death or imprisonment for life and the court by which the person is found guilty is of opinion that, having regard to the circumstances of the case including the nature of the offence and the character of the offender, it is expedient to release him on probation of good conduct, then, notwithstanding anything contained in any other law for the time being in force, the court may, instead of sentencing him at once to any punishment direct that he be released on his entering into a bond, with or without suretie …
  [open](#law?act=probation&eid=sec_4)

- **5. Power of court to require released offenders to pay compensation and costs** (`probation:sec_5`, tier: sentencing) - 
  > (1) The court directing the release of an offender under section 3 or section 4, may, if it thinks fit, make at the same time a further order directing him to pay— (a) such compensation as the court thinks reasonable for loss or injury caused to any person by the commission of the offence; and (b) such costs of the proceedings as the court thinks reasonable. (2) The amount ordered to be paid under sub-section (1) may be recovered as a fine in accordance with the provisions of sections 386 and 387 of the Code. (3) A civil court trying any suit, arising out of the same matter for which the offen …
  [open](#law?act=probation&eid=sec_5)

### Indian Penal Code, 1860  `ipc`
*penal · repealed 2024-07-01* - 1 provisions pinned to this case type.

- **420. Cheating and dishonestly inducing delivery of property** (`ipc:sec_420`, tier: supporting) - Commonly charged alongside, where the transfer was initiated on an account the initiator knew was empty. The companion offence matters more here than in a cheque case, because a s.25 complaint has no settled limitation period and a cheating complaint has a clear one.
  > Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine. Of fraudulent feeds and dispositions of property
  [open](#law?act=ipc&eid=sec_420)

### Bharatiya Nyaya Sanhita, 2023  `bns`
*penal · in force from 2024-07-01* - 1 provisions pinned to this case type.

- **318. Cheating** (`bns:sec_318`, tier: supporting) - = IPC s.420.
  > (1) Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property, or intentionally induces the person so deceived to do or omit to do anything which he would not do or omit if he were not so deceived, and which act or omission causes or is likely to cause damage or harm to that person in body, mind, reputation or property, is said to cheat. Explanation.—A dishonest concealment of facts is a deception within the meaning of this section. Illustrations. (a) A, by falsely  …
  [open](#law?act=bns&eid=sec_318)

### Constitution of India  `constitution`
*constitutional · in force* - 9 provisions pinned to this case type.

- **246. Subject-matter of laws made by Parliament and by the Legislatures of States.** (`constitution:art_246`, tier: constitutional) - A real difference from the s.138 case type, not a formality. The NI Act rests on Entry 46 of the Concurrent List - bills of exchange, cheques, promissory notes and other like instruments - so a State legislature can in principle touch it. The PSS Act rests on the Union List: Entry 38 (Reserve Bank of India) and Entry 45 (banking). Section 25 is therefore Union law end to end, and there is no room for a State amendment to the offence. That is one reason this case type has no state substantive layer and, in all probability, never will.
  > (1) Notwithstanding anything in clauses (2) and (3), Parliament has exclusive power to make laws with respect to any of the matters enumerated in List I in the Seventh Schedule (in this Constitution referred to as the “Union List”). (2) Notwithstanding anything in clause (3), Parliament, and, subject to clause (1), the Legislature of any State *** also, have power to make laws with respect to any of the matters enumerated in List III in the Seventh Schedule (in this Constitution referred to as the “Concurrent List”). (3) Subject to clauses (1) and (2), the Legislature of any State *** has excl …
  [open](#law?act=constitution&eid=art_246)

- **21. Protection of life and personal liberty.** (`constitution:art_21`, tier: constitutional) - The anchor for expeditious disposal. The directions in In re Expeditious Trial of Cases under s.138 NI Act (2021) are addressed to s.138 complaints; whether they reach a s.25 complaint tried under the same imported s.143 summary procedure has never been asked.
  > No person shall be deprived of his life or personal liberty except according to procedure established by law.
  [open](#law?act=constitution&eid=art_21)

- **20. Protection in respect of conviction for offences.** (`constitution:art_20`, tier: constitutional) - Bears directly on the imported NI s.143A: the interim-compensation power was held prospective in a s.138 case, and the same reasoning would apply to a s.25 case on causes of action before 2018.
  > (1) No person shall be convicted of any offence except for violation of a law in force at the time of the commission of the Act charged as an offence, nor be subjected to a penalty greater than that which might have been inflicted under the law in force at the time of the commission of the offence. (2) No person shall be prosecuted and punished for the same offence more than once. (3) No person accused of any offence shall be compelled to be a witness against himself.
  [open](#law?act=constitution&eid=art_20)

- **14. Equality before law.** (`constitution:art_14`, tier: constitutional) - The frame in which the gaps in this profile are most likely to be litigated. If two people are owed the same money and one was paid by cheque and the other by transfer, a difference between a one-month and a three-year limitation, or between compounding by consent and compounding by a regulator, has to be justified.
  > The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India. 6
  [open](#law?act=constitution&eid=art_14)

- **141. Law declared by Supreme Court to be binding on all courts.** (`constitution:art_141`, tier: constitutional) - Cuts both ways here. It is what makes the s.138 jurisprudence binding on courts trying cheque cases, and it is exactly what a court trying a s.25 case cannot rely on, because none of that jurisprudence was declared about s.25.
  > The law declared by the Supreme Court shall be binding on all courts within the territory of India.
  [open](#law?act=constitution&eid=art_141)

- **142. Enforcement of decrees and orders of Supreme Court and orders as to discovery, etc.** (`constitution:art_142`, tier: constitutional) - The source of the compounding-cost guidelines in the cheque jurisprudence. If the s.31 and s.147 conflict is ever resolved in practice rather than in theory, this is the likely instrument.
  > (1) The Supreme Court in the exercise of its jurisdiction may pass such decree or make such order as is necessary for doing complete justice in any cause or matter pending before it, and any decree so passed or order so made shall be enforceable throughout the territory of India in such manner as may be prescribed by or under any law made by Parliament and, until provision in that behalf is so made, in such manner as the President may by order prescribe. (2) Subject to the provisions of any law made in this behalf by Parliament, the Supreme Court shall, as respects the whole of the territory o …
  [open](#law?act=constitution&eid=art_142)

- **226. Power of High Courts to issue certain writs.** (`constitution:art_226`, tier: constitutional) - 
  > (1) Notwithstanding anything in article 32 *** every High Court shall have power, throughout the territories in relation to which it exercises jurisdiction, to issue to any person or authority, including in appropriate cases, any Government, within those territories directions, orders or writs, including [writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari , or any of them, for the enforcement of any of the rights conferred by Part III and for any other purpose.] (2) The power conferred by clause (1) to issue directions, orders or writs to any Government, a …
  [open](#law?act=constitution&eid=art_226)

- **227. Power of superintendence over all courts by the High Court.** (`constitution:art_227`, tier: constitutional) - 
  > (1) Every High Court shall have superintendence over all courts and tribunals throughout the territories in relation to which it exercises jurisdiction.] (2) Without prejudice to the generality of the foregoing provision, the High Court may— (a) call for returns from such courts; (b) make and issue general rules and prescribe forms for regulating the practice and proceedings of such courts; and (c) prescribe forms in which books, entries and accounts shall be kept by the officers of any such courts. (3) The High Court may also settle tables of fees to be allowed to the sheriff and all clerks a …
  [open](#law?act=constitution&eid=art_227)

- **136. Special leave to appeal by the Supreme Court.** (`constitution:art_136`, tier: constitutional) - The route by which the open questions in this profile would eventually get an answer. That no s.25 matter has taken it is the reason they are still open.
  > (1) Notwithstanding anything in this Chapter, the Supreme Court may, in its discretion, grant special leave to appeal from any judgment, decree, determination, sentence or order in any cause or matter passed or made by any court or tribunal in the territory of India. (2) Nothing in clause (1) shall apply to any judgment, determination, sentence or order passed or made by any court or tribunal constituted by or under any law relating to the Armed Forces.
  [open](#law?act=constitution&eid=art_136)

### Advocates Act, 1961  `advocates`
*representation · in force* - 3 provisions pinned to this case type.

- **29. Advocates to be the only recognised class of persons entitled to practise law.―Subject to the** (`advocates:sec_29`, tier: supporting) - 
  > provisions of this Act and any rules made thereunder, there shall, as from the appointed day, be only one class of persons entitled to practise the profession of law, namely, advocates.
  [open](#law?act=advocates&eid=sec_29)

- **30. Right of advocates to practise.―Subject to the provisions of this Act, every advocate whose name is** (`advocates:sec_30`, tier: supporting) - 
  > entered in the 3[State roll] shall be entitled as of right to practise throughout the territories to which this Act extends,― (i) in all courts including the Supreme Court; (ii) before any tribunal or person legally authorised to take evidence; and (iii) before any other authority or person before whom such advocate is by or under any law for the time being in force entitled to practise.
  [open](#law?act=advocates&eid=sec_30)

- **32. Power of court to permit appearances in particular cases.―Notwithstanding anything contained in** (`advocates:sec_32`, tier: supporting) - The basis on which a party in person appears - and, for a s.28 complaint filed by the Reserve Bank's officer rather than the beneficiary, the basis on which anyone other than an advocate could be heard.
  > this Chapter, any court, authority, or person may permit any person, not enrolled as an advocate under this Act, to appear before it or him in any particular case.
  [open](#law?act=advocates&eid=sec_32)

### Oaths Act, 1969  `oaths`
*authentication · in force* - 3 provisions pinned to this case type.

- **3. Power to administer oaths.** (`oaths:sec_3`, tier: evidence) - The authority behind the affidavit that the imported NI s.145 allows the complainant to file.
  > (1) The following courts and persons shall have power to administer, by themselves or, subject to the provisions of sub-section (2) of section 6, by an officer empowered by them in this behalf, oaths and affirmations in discharge of the duties imposed or in exercise of the powers conferred upon them by law, namely:— (a) all courts and persons having by law or consent of parties authority to receive evidence; (b) the commanding officer of any military, naval, or air force station or ship occupied by the Armed Forces of the Union, provided that the oath or affirmation is administered within the  …
  [open](#law?act=oaths&eid=sec_3)

- **4. Oaths or affirmations to be made by witnesses, interpreters and jurors.** (`oaths:sec_4`, tier: evidence) - 
  > (1) Oaths or affirmations shall be made by the following persons, namely:— (a) all witnesses, that is to say, all persons who may lawfully be examined, or give, or be required to give, evidence by or before any court or person having by law or consent of parties authority to examine such persons or to receive evidence; (b) interpreters of questions put to, and evidence given by, witnesses; and (c) jurors: Provided that where the witness is a child under twelve years of age, and the court or person having authority to examine such witness is of opinion that, though the witness understands the d …
  [open](#law?act=oaths&eid=sec_4)

- **5. Affirmation by persons desiring to affirm.** (`oaths:sec_5`, tier: evidence) - 
  > A witness, interpreter or juror may, instead of making an oath, make an affirmation.
  [open](#law?act=oaths&eid=sec_5)

### Legal Services Authorities Act, 1987  `lsa`
*settlement · in force* - 3 provisions pinned to this case type.

- **19. Organisation of Lok Adalats.** (`lsa:sec_19`, tier: supporting) - 
  > (1) Every State Authority or District Authority or the Supreme Court Legal Services Committee or every High Court Legal Services Committee or, as the case may be, Taluk Legal Services Committee may organize Lok Adalats at such intervals and places and for exercising such jurisdiction and for such areas as it thinks fit. (2) Every Lok Adalat organised for an area shall consist of such number of— (a) serving or retired judicial officers; and (b) other persons, of the area as may be specified by the State Authority or the District Authority or the Supreme Court Legal Services Committee or the Hig …
  [open](#law?act=lsa&eid=sec_19)

- **20. Cognizance of cases by Lok Adalats.** (`lsa:sec_20`, tier: supporting) - The settlement route that, in a cheque case, disposes of a large share of the docket. It is available here on the same terms and is the one disposal path that does not depend on resolving the s.147 / s.31 compounding conflict.
  > (1) Where in any case referred to in clause (i) of sub-section (5) of section 19,— (i) (a) the parties thereof agree; or (b) one of the parties thereof makes an application to the Court, for referring the case to the Lok Adalat for settlement and if such court isprima facie satisfied that there are chances of such settlement; or (ii) thecourt is satisfied that the matter is an appropriate one to be taken cognizance of by the Lok Adalat, the Court shall refer the case to the Lok Adalat: Provided that no case shall be referred to the Lok Adalat under sub-clause (b) of clause (i) or clause (ii) b …
  [open](#law?act=lsa&eid=sec_20)

- **21. Award of Lok Adalat.** (`lsa:sec_21`, tier: supporting) - 
  > (1) Every award of the Lok Adalat shall be deemed to be a decree of a civil court or, as the case may be, an order of any other court and where a compromise or settlement has been arrived at, by a Lok Adalat in a case referred to it under sub-section (1) of section 20, the court-fee paid in such case shall be refunded in the manner provided under the Court-fees Act, 1870 (7 of 1870). (2) Every award made by a Lok Adalat shall be final and binding on all the parties to the dispute, and no appeal shall lie to any court against the award. 22. Powers of Lok Adalat or Permanent Lok Adalat.— (1) The …
  [open](#law?act=lsa&eid=sec_21)

### Rights of Persons with Disabilities Act, 2016  `rpwd`
*access · in force* - 1 provisions pinned to this case type.

- **12. Access to justice.** (`rpwd:sec_12`, tier: supporting) - 
  > (1) The appropriate Government shall ensure that persons with disabilities are able to exercise the right to access any court, tribunal, authority, commission or any other body having judicial or quasi-judicial or investigative powers without discrimination on the basis of disability. (2) The appropriate Government shall take steps to put in place suitable support measures for persons with disabilities specially those living outside family and those disabled requiring high support for exercising legal rights. (3) The National Legal Services Authority and the State Legal Services Authorities co …
  [open](#law?act=rpwd&eid=sec_12)

## National vocabulary

| word | role | from | gloss |
|---|---|---|---|
| electronic funds transfer | procedure | Definitions | Any transfer of funds initiated by a person by instruction, authorisation or order to a bank to debit or credit an accou |
| payment system | procedure | Definitions | A system that enables payment to be effected between a payer and a beneficiary, involving clearing, payment or settlemen |
| payment instruction | document | Definitions | Any instrument, authorisation or order in any form, including electronic, to effect a payment by a person to a system pa |
| payment obligation | doctrine | Definitions | An indebtedness owed by one system participant to another as a result of clearing or settlement of one or more payment i |
| settlement | procedure | Definitions | Settlement of payment instructions, including of securities, foreign exchange, derivatives or other transactions involvi |
| netting | procedure | Definitions | The system provider's determination of what is due among system participants after setting off their obligations, so tha |
| gross settlement system | procedure | Definitions | A payment system in which each settlement of funds or securities occurs on separate or individual instructions rather th |
| system provider | actor | Definitions | A person who operates an authorised payment system. It is the system provider whose procedural guidelines the transfer m |
| system participant | actor | Definitions | A bank or other person participating in a payment system; includes the system provider. |
| bank | actor | Definitions | A scheduled bank, a post office savings bank, a banking company, a co-operative bank, or any other bank the Reserve Bank |
| Reserve Bank | actor | Definitions | The Reserve Bank of India. It authorises payment systems, sets their standards, and - uniquely for this case type - is t |
| authorisation | procedure | Payment system not to operate without au | The Reserve Bank's permission to commence or operate a payment system. Without it there is no system provider, and witho |
| procedural guidelines | document | Duties of a system provider | The rules the system provider issues for the operation of its payment system and must disclose to participants. Proviso  |
| standards | document | Power to determine standards | The formats, timings and manner of transfer the Reserve Bank prescribes for payment systems, and the guidelines it issue |
| initiator | actor | Dishonour of electronic funds transfer f | The person who initiates the electronic funds transfer from an account maintained by him - the accused. The PSS Act uses |
| beneficiary | actor | Dishonour of electronic funds transfer f | The person the money was to be paid to, and the person who must give the written demand under proviso (c). Like 'initiat |
| person aggrieved | actor | Cognizance of offences | The words the proviso to s.28(1) uses for the private complainant in a s.25 case. Whether it means exactly the beneficia |
| payer | actor | Definitions | The person between whom and a beneficiary a payment system enables payment to be effected. In a s.25 case the payer is t |
| drawer | actor | “Drawer” “Drawee” | The maker of a bill of exchange or cheque. There is no drawer in an electronic funds transfer, but ss.143A and 148 of th |
| company | actor | Offences by companies | For the purposes of vicarious liability, any body corporate, including a firm or other association of individuals. |
| director | actor | Offences by companies | A director of a company and, in relation to a firm, a partner in it. A director whose consent, connivance or neglect is  |
| person in charge | actor | Offences by companies | The person who at the time of the contravention was in charge of, and responsible to, the company for the conduct of its |
| dishonour of electronic funds transfer | doctrine | Dishonour of electronic funds transfer f | The transfer cannot be executed because the credit balance in the account is insufficient to honour the instruction, or  |
| insufficiency of funds | doctrine | Dishonour of electronic funds transfer f | The state of the account that makes the transfer unexecutable. It is the substance of the offence, and unlike the fact o |
| arrangement with the bank | doctrine | Dishonour of electronic funds transfer f | The amount agreed with the bank as payable from the account - an overdraft or similar facility. Exceeding it is the seco |
| debt or other liability | doctrine | Dishonour of electronic funds transfer f | A legally enforceable debt or other liability, by the Explanation to s.25. The transfer must have been initiated to disc |
| demand notice | document | Dishonour of electronic funds transfer f | The beneficiary's written demand for payment, given to the initiator within thirty days of receiving information of the  |
| cause of action | doctrine | Dishonour of electronic funds transfer f | Complete when the initiator fails to pay within fifteen days of the demand notice. Only then is there an offence to comp |
| presumption of liability | doctrine | Dishonour of electronic funds transfer f | The presumption under s.25(2) that the transfer was initiated for the discharge, in whole or in part, of a debt or other |
| presumption of dishonour | doctrine | Dishonour of electronic funds transfer f | The presumption under s.25(4) that a transfer was dishonoured, arising on production of a communication from the bank de |
| bank communication | document | Dishonour of electronic funds transfer f | The communication from the bank denoting the dishonour of the transfer - the document that triggers the s.25(4) presumpt |
| no-belief defence bar | doctrine | Dishonour of electronic funds transfer f | The rule in s.25(3) that it is no defence to say the initiator did not have reason to believe, when giving the instructi |
| electronic record | document | Definitions | Data, record or data generated, image or sound stored, received or sent in an electronic form or micro film. In a s.25 c |
| electronic signature | document | Electronic signature | Authentication of an electronic record by an electronic technique specified in the Second Schedule, including a digital  |
| attribution | doctrine | Attribution of electronic records | The rule that an electronic record is attributed to its originator where he sent it, or it was sent by someone authorise |
| electronic-records certificate | document | Admissibility of electronic records | The certificate that makes a computer output admissible as evidence of its contents without producing the original. Requ |
| bankers' book | document | Definitions | The ledgers, day-books, account books and other records used in the ordinary business of a bank, including records kept  |
| certified copy | document | Mode of proof of entries in bankers’ boo | A copy of an entry in a bankers' book, certified as prescribed, receivable as prima facie evidence of the entry. The pra |
| burden of proof | doctrine | Burden of proof | The obligation on the party who would fail if no evidence were given. The presumptions in s.25(2) and s.25(4) move it on |
| evidence on affidavit | procedure | Evidence on affidavit | The complainant's evidence given on affidavit and read in the trial, subject to the court summoning the deponent. Carrie |
| complaint | document | Cognizance of offences | The written complaint on which the court takes cognizance. For PSS offences generally it must come from an authorised of |
| cognizance | procedure | Cognizance of offences | The court's act of taking notice of the offence so that proceedings can begin. Section 28 restricts who may set it in mo |
| Judicial Magistrate of the first class | forum | Cognizance of offences | The lowest court that may try an offence under this Act. The same floor s.142(1)(c) sets for a cheque case. |
| summary trial | procedure | Power of Court to try cases summarily | Trial under the summary-trial provisions of the criminal procedure code, with a sentence limited to one year and compens |
| summons | document | Form of summons | The court's written order requiring the accused to appear, served in the manner NI s.144 prescribes for these cases. |
| interim compensation | remedy | Power to direct interim compensation | Up to twenty per cent of the amount, ordered against the accused during the trial. Reaches a s.25 case only by reading ' |
| appellate deposit | remedy | Power of Appellate Court to order paymen | The minimum twenty per cent an appellate court may require an appellant against conviction to deposit. Carried across on |
| place of trial | doctrine | Ordinary place of inquiry and trial | The court within whose local jurisdiction the offence was committed. This is the residual venue rule for a s.25 complain |
| compounding | remedy | Offences to be compoundable | Settlement of the offence between the parties, ending the prosecution. Available in a cheque case as of right; in a s.25 |
| compounding by the Reserve Bank | remedy | Power to compound offences | An authorised officer of the Reserve Bank compounding an offence under the Act on the offender's application, after whic |
| limitation | doctrine | Bar to taking cognizance after lapse of  | The period after which no court may take cognizance - three years for an offence punishable with imprisonment exceeding  |
| condonation of delay | procedure | Extension of prescribed period in certai | Extension of a prescribed period where sufficient cause is shown. Relevant to a s.25 complaint only on the reading that  |
| deemed service | doctrine | Meaning of service by post | Service of a notice is deemed effected by properly addressing, prepaying and posting it, unless the contrary is proved.  |
| application of fine | remedy | Application of fine | The court's power to direct the whole or part of a fine imposed under the Act towards the costs of the proceedings. The  |
| Lok Adalat | forum | Organisation of Lok Adalats. | A forum organised by a legal-services authority to settle pending cases by consent; its award is deemed a decree and is  |
| probation of good conduct | remedy | Power of court to release certain offend | Release of a convicted offender on a bond to keep the peace and be of good behaviour instead of sentencing him at once - |
| quashing | remedy | Saving of inherent powers of High Court | The High Court's exercise of its inherent power to end a complaint that is an abuse of process. The forum where the unse |
| advocate | actor | Right of advocates to practise.―Subject  | A person enrolled on a State roll, entitled as of right to practise in every court in India. Both the complainant and th |
| overriding effect | doctrine | Act to have overriding effect | The rule that this Act prevails over anything inconsistent in any other law in force. The textual reason a PSS provision |
| legislative competence | doctrine | Subject-matter of laws made by Parliamen | Which legislature may enact a law. The PSS Act rests on the Union List (Reserve Bank, banking); the NI Act rests on the  |
| fair and speedy trial | doctrine | Protection of life and personal liberty. | The Article 21 guarantee behind expeditious disposal. The Supreme Court's directions on expediting cheque cases were giv |
| binding precedent | doctrine | Law declared by Supreme Court to be bind | Law declared by the Supreme Court binds every court. It is the reason a cheque court has a settled body of authority and |
| writ jurisdiction | remedy | Power of High Courts to issue certain wr | The High Court's power to issue writs, exercisable alongside its inherent criminal power to test proceedings under this  |
| access to justice | doctrine | Access to justice. | The right of a person with disability to access any court without discrimination, with accessible documents and reasonab |
