<!--
  HOW THIS FILE IS WRITTEN - the Policy page parses it, so keep the shape.

    # Title           the document's own title. The page titles itself from
                      policy.json, so this line is not rendered.
    > line            an editorial note from this corpus, NOT the document. It is
                      rendered inset and labelled as such, wherever it appears.
    ## Name           a division of the document. THIS DOCUMENT DIVIDES ITSELF BY
                      ROMAN NUMERAL, with no word for what a division is: it heads
                      them "I Preparing Accessible Documents:" through "XVII
                      Accessible PDF Techniques for WCAG 2.0:", then "Annexure 1",
                      "Annexure 2" and the contributors page. Those headings are
                      what the table of contents lists, so they are the `##`.
    ### N.            one numbered paragraph - the citable unit. THE PARAGRAPHS ARE
                      NUMBERED STRAIGHT THROUGH THE DIVISIONS, 1 to 36, so paragraph
                      28 sits under heading XIII and paragraphs 29 to 33 under
                      heading XIV, and a reader cites "paragraph 31", never
                      "XIV(3)". The paragraph carries no heading of its own - the
                      document prints a number and then prose - so the `###` line
                      carries the number and nothing else, and the prose follows it
                      as text. The compliance records cite "para_31" and land here.
    ### Name          a unit the document prints with a heading but no number: the
                      software sub-headings under headings II, III and the two
                      Annexures.
    ###               a unit the document prints with neither. Heading VII prints
                      three bullets under no sub-heading and with no paragraph
                      number, and so does the contributors page; both are still
                      text a division has to hold.
    a. / i. / (i)     a clause. The marker is kept exactly as printed - paragraph 2
                      letters its steps a. to n. with a trailing stop and nests
                      i. inside a., and paragraph 16 numbers its list (i) to (iv) -
                      and the converter derives the eId from it, so paragraph 2's
                      step (l) is para_2_l.

  Two consequences of that mapping, recorded here so nobody has to rediscover them:
    - Headings II, III, Annexure 1 and Annexure 2 print a sub-heading over the
      paragraphs beneath them - "Microsoft Word (Windows)", "In LibreOffice
      Writer:", "LibreOffice Writer". The markdown has one level for a unit, so
      each sub-heading is a `###` of its own standing before the paragraphs it
      labels, rather than a wrapper around them. Where the source puts numbered
      paragraphs directly under such a sub-heading, the sub-heading unit therefore
      carries no text - the text is in the numbered paragraphs that follow it.
    - The uppercase list markers in Annexure 2 - A. Installation, B. Add an OCR
      layer, C. Installing local language packages, D. Example - are left as plain
      lines, because the converter reads a lower-case letter and a stop as a clause
      marker and reading an upper-case one would make a clause of every "Mr." on
      the contributors page.

  Everything that is not a `>` line is the document, transcribed verbatim. Nothing
  is summarised, reordered or renumbered. Add a document by dropping its markdown
  in this folder and naming it in policy.json - no new code.
-->

# Standard Operating Procedure for Preparing Accessible Court Documents

> Transcribed from the PDF published by the e-Committee, Supreme Court of India,
> which is kept alongside this file at
> `policy/sources/sop-for-preparing-accessible-court-documents-2022.pdf`. The PDF
> carries a real text layer - it is not a scan, and it is itself a tagged PDF/A-3a
> file, which for a document about accessible PDFs is the point. The wording here is
> the document's, character for character, checked against that text.
>
> The document's own inconsistencies are kept as printed and never straightened.
> It writes "Build-in Heading styles" and "Build-in lists styles" for built-in; it
> mixes curly and straight quotation marks inside a single sentence, so paragraph 25
> opens on `'copying content for accessibility’` with a straight mark and closes on a
> curly one, paragraph 4 sets `"It Can be Done"` straight against `“rn”` curly, and
> Annexure 1 writes `"Save As" > "PDF”`; it renders the LibreOffice menu path with
> pairs of apostrophes, `''File'' > ''Export As''`; paragraph 21 gives the contrast
> ratio as `4*5*1`; paragraph 34 writes "shall, ... should conduct"; and the last
> command line in Annexure 2 carries stray characters, `ocrmypdf ṁṁṁ-l tam
> output.pdf test-tamil.pdfcc`. None of that is corrected here.
>
> Seven things are presentational and nothing else was touched. The running page
> numbers are dropped. Lines the source wraps mid-sentence are rejoined, so a word
> the page breaks with a hyphen at the line end - "how-to-fix" in heading III - is
> written whole. In the table of contents the leader dots are dropped and the page
> number is kept after the title, and the one entry the source wraps over two lines,
> for heading XIII, is written on one. Each numbered paragraph is printed as a list
> label followed by a tab; the number is written here on the paragraph's own `###`
> line, which is where the converter takes it from. The bullet characters are the
> source's own and differ between the two places it uses them - `●` under heading VII,
> `•` on the contributors page. The `***` after the table of contents and the
> `*******` at the end of Annexure 2 are printed and are kept where they fall. On the
> contributors page the heading is written above the list, which is where the page
> prints it, although the text layer emits it after the names.
>
> The table of contents prints its entries in capitals where the body prints the same
> headings in mixed case; both are reproduced as the text layer carries them.

Standard Operating Procedure for

Preparing Accessible

Court Documents

e-Committee Supreme Court of India

2022

Table of Contents

I PREPARING ACCESSIBLE DOCUMENTS: 1

II GENERATING ACCESSIBLE PDFS: 3

MICROSOFT WORD (WINDOWS) 3

LIBREOFFICE WRITER 3

MICROSOFT WORD (MAC) 3

III CHECKING ACCESSIBILITY: 4

IN MICROSOFT WORD 4

IN LIBREOFFICE WRITER: 4

IV PDF REMEDIATION 4

V BOOKMARKING 5

VI DIGITAL SIGNATURES 5

VII PAGINATION: 5

VIII TAGGING PDFS 6

IX E-STAMPS 7

X CONFIGURING SECURITY SETTINGS TO ENABLE SCREEN READER ACCESS 7

XI AVOIDANCE OF USE OF WATER MARKS 7

XII NO HANDWRITTEN DATA ENTRIES IN THE PDF 8

XIII HAVING A SPECIAL DISPENSATION FOR LAWYERS/JUDGES/LITIGANTS WITH DISABILITIES 8

XIV ACCESSIBILITY COMMITTEE IN EVERY HIGH COURT AND DISTRICT COURT: 8

XV. TRAINING AND SENSITIZATION 10

XVI. REVIEW AND REVISION: 10

XVII ACCESSIBLE PDF TECHNIQUES FOR WCAG 2.0: 10

ANNEXURE 1 11

HOW TO CONVERT WORD FILE TO PDF 11

MICROSOFT WORD 2007 11

LIBREOFFICE WRITER 11

FREE PDF CONVERSION WEBSITE. 12

ANNEXURE 2 13

CREATING ACCESSIBLE SCANNED DOCUMENTS (PDF REMEDIATION) 13

PROCESS OF CREATING AN ACCESSIBLE SCANNED DOCUMENT IN ACROBAT PRO: 13

OPEN-SOURCE SOFTWARE FOR PDF REMEDIATION: 13

***

Procedure for Preparing Accessible Court Documents:

## I Preparing Accessible Documents:

### 1.

The original text material and documents [including main petition or appeal, interlocutory applications etc.] can be prepared electronically using Microsoft Word or LibreOffice Writer software.

### 2.

When creating a document, there are a few basic steps that should be followed in order to ensure the document is accessible. The core steps needed for accessibility are:

a. Use headings (Build-in Heading styles available in Styles tab must be used).

i. Headings should form an outline, using the “Heading 1” style for the main heading, and “Heading 2” for sub-headings. If there are additional levels of headings within the document’s outline, using “Heading 3”, “Heading 4”, etc.

b. Use lists (Build-in lists styles must be used)

c. Use meaningful hyperlinks. Ensure that the text of the hyperlink serves the purpose.

d. Provide an image description of pictorial evidence. In other words, add ‘Alt Tag’ to images, shapes, smart art or charts.

e. Using accessible fonts:

These include Arial and Calibri. Font size 13. Line spacing 1.5. Gap between two paragraphs should be 20 cm. Cursive fonts should not be used.

f. For newspaper cuttings and other forms of evidence that are illegible/ image-based, provide a plain text transcript of the same.

g. Text in the document should not be underlined, as it hampers smooth access for the disabled.

h. All capitals in the text, mostly used in title of the applications are also a challenge to accessibility of text. Thus sentence case should be used and small caps should be avoided.

i. The paragraphs in the document should be left-aligned. Although justified text may look more visually appealing, it must be avoided as extra spaces within lines make it inaccessible for users.

j. Identify document language.

k. Use tables wisely, by clearly labelling column and row headers. The headers must be in the first row only. If need be, more detailed labelling for CSV type formatting would be good [e.g. spreadsheets found on data.gov.in]. Do not use ‘merged cells’ or ‘split cells’ or do not put in blank lines.

l. Regional/vernacular content must be rendered in unicode font.

m. Use sufficient colour contrast between the foreground text and background colour. Use accessibility checker or applications like Color Contrast to analyse the document for insufficient colour contrast.

n. Use the Accessibility Checker for ensuring that the document contains no errors or warnings.

### 3.

The documents should be converted into Portable Document Format (PDF) using any PDF converter or in-built PDF conversion plug-in provided in the software. The process of converting word file to PDF is provided in Annexure 1.

### 4.

Fonts in PDF documents should not be compressed. To this end, when optimizing PDFs for size, ensure that this is done without un-embedding the fonts or their subsets. When compressed fonts are used, the screen reader used by the visually challenged reads multiple words together, without spaces. For instance, "It Can be Done" is read as "itcanbedone". Letter spacing should be used, so that different characters can be distinguished from one another. Otherwise, for instance, “rn” used together, without spacing, can be mistaken for the letter “m”.

### 5.

Documents in Electronic Publication [EPUB] format make for a more conducive reading experience. To the extent possible, all documents should be made available in EPub format.

### 6.

Documents prepared using automatic workflow methods, such as dynamic PDFs, must be made accessible to persons with disabilities.

## II Generating Accessible PDFs:

### Microsoft Word (Windows)

### 7.

Go to File > “Save As…” and select PDF from the choices provided. By default this produces a PDF that preserves the document’s accessibility features.

### 8.

When saving, select Options and be sure that “Document structure tags for accessibility” is checked. This is checked by default but could become unchecked under certain circumstances.

### 9.

If you select “Minimize Size” to reduce the size of your PDF, be sure to repeat the preceding step, as this option might uncheck the “Document structure tags for accessibility” checkbox.

### LibreOffice Writer

### 10.

Open the file you wish to save. Go to ''File'' > ''Export As'' > “Export as PDF”. It will open PDF options window. Select “Archive (PDF/A)”, “Universal Accessibility (PDF/UA)” and “Tagged PDF (add document structure)” options. Click the Export button. This will create PDF file.

### Microsoft Word (Mac)

### 11.

Go to File > “Save As…” and select PDF from the choices provided. By default this produces a PDF that preserves the document’s accessibility features.

### 12.

When saving, be sure the radio button labelled “Best for electronic distribution and accessibility” is selected.

## III Checking Accessibility:

> Heading III prints no numbered paragraph at all. The paragraph run jumps from 12,
> the last paragraph of heading II, to 13, the first of heading IV.

### In Microsoft Word

Select Review Tab -> Select Check Accessibility.

Note: the precise way to access the ‘check accessibility’ option may change in future versions of Microsoft Word or LibreOffice Writer.

### In LibreOffice Writer:

Select Tools Tab -> Select Accessibility Check.

For activating the “Accessibility Check” feature, the experimental features has to be enabled for LibreOffice.

Review your results. You'll see a list of errors, warnings, and tips with how-to-fix recommendations for each.

## IV PDF Remediation

### 13.

In exceptional circumstances, for instance where certain documents that are to be enclosed are originally in hard copy form and have to be scanned, they must be in Optical Character Recognition (OCR) enabled PDF format. They should not be scanned using poor quality solutions like Cam Scanner, or by taking pictures of the physical copy. The document should be scanned using an image resolution of 300 dpi (dot per inch). This exception of scanning documents is only allowed if the document that is to be scanned is legible and has not been electronically prepared using Microsoft Word or LibreOffice Writer Software by the advocate or the party concerned. If the document is illegible, it must be typed and directly converted to PDF. The process of creating accessible scanned documents is provided in Annexure 2.

## V Bookmarking

### 14.

The text documents prepared in Microsoft Word/LibreOffice Writer as well as scanned documents should be merged as a single PDF file and any PDFs generated through merging or otherwise should be book-marked. Any free open source or paid software can be used to split and merge PDFs and add bookmarks. Preferably headings should be used as bookmarks.

## VI Digital Signatures

### 15.

All documents should be digitally signed.

## VII Pagination:

> Heading VII prints three bullets and no numbered paragraph, so the paragraph run
> goes from 15 under heading VI to 16 under heading VIII. The bullets are written
> here as one unit carrying neither a number nor a heading, because the document
> gives them neither.

###

● The process of pagination needs to be more accessible and streamlined. The High Courts need to develop proper mechanism for the same by issuing appropriate practice notes or directions. The properly paginated paper-book can be shared with lawyers. This will ensure that lawyers and judges work with the same pagination and are able to communicate with each other more seamlessly during oral arguments. In addition to improving accessibility, this will also enhance judicial efficiency.

● The Registry can publicly display the last page of the filing to enable the lawyers to electronically paginate their filings for, inter alia, any additional documents, interlocutory applications and miscellaneous application.

● Footers can be used to insert page numbers so that they can be read by screen readers.

## VIII Tagging PDFs

> There is no paragraph 17 anywhere in the document. The run goes 16, then the four
> clauses (i) to (iv) of paragraph 16, then 18. Paragraphs 18 to 23 are printed
> indented, at the depth of paragraph 16's clauses rather than at the depth of the
> other numbered paragraphs, although they continue the top-level run; they are
> written here as the top-level paragraphs their numbering makes them.

### 16.

A tagged PDF includes hidden accessibility mark-ups that, when properly applied, help to optimize the reading experience of those who use screen readers and other assistive technology. Tags can be added to untagged documents using Adobe Acrobat Pro. There are several ways to do this:

(i) add tags from the Make Accessible Action Wizard (Acrobat Pro Latest Version);

(ii) add tags from the Accessibility Checker results; or

(iii) add tags manually via the Tags panel. For example, "Add tags to the Document" feature of Acrobat Pro can be used to add tagging to the document.

(iv) In LibreOffice Writer, Open the file you wish to save. Go to ''File'' > ''Export As'' > “Export as PDF”. It will open PDF options window. Select “Archive (PDF/A)”, “Universal Accessibility (PDF/UA)” and “Tagged PDF (add document structure)” options. Click the Export button. This will create tagged PDF file.

### 18.

Ensure that the tagged PDF’s reading order is logical.

### 19.

Set the document’s primary language. This helps screen readers to detect the language of the text and switch to the appropriate text to speech synthesizer. When there are parts of the document which are other than in the primary language, make sure to set their appropriate language.

### 20.

Add the document title so that it is reported in the toolbar and screen reader pronounces the document title correctly.

### 21.

> The source prints the sentence below the ratio between paragraphs 21 and 22 with
> no number of its own and at the same indent as them. It is written here as a
> second paragraph of 21, which is where it falls.

Use high-contrast colours. Or ensure that the foreground colour of the text against the background colour meets the ratio of 4*5*1.

Add the tags as per the content structure such as marking the content as headings, lists, tables, footnotes, endnotes.

### 22.

Ensure that the page thumbnails and tab order are aligned from the page properties as the users of screen readers use tabs to navigate a pdf.

### 23.

Make sure to tag all form fields and include relevant description so that the PDF forms can be filled independently by screen reader users. This will only be relevant if any forms are prescribed in PDF format for e-filing.

## IX E-Stamps

### 24.

E-Stamps should be used instead of physical stamps as physical stamps cause difficulty in a screen reader being able to access the text. Whenever physical stamps have to be used, these stamps should not be placed in the pleadings but instead on a separate white paper. Physical stamps should not be placed on judgement copies.

## X Configuring Security Settings to Enable Screen Reader Access

### 25.

Security settings of PDFs must be configured to enable 'copying content for accessibility’. Specifically, in the security tab of the document properties, verify that “copying content for accessibility” is allowed.

## XI Avoidance of Use of Water Marks

### 26.

They make PDFs inaccessible [by coming in the way of the screen reader being able to interact with the textual content directly] and should not be used.

## XII No Handwritten Data Entries in the PDF

### 27.

Handwritten content cannot be identified by screen readers. Therefore, all such data points must be typed out.

## XIII Having a special dispensation for lawyers/judges/litigants with disabilities

### 28.

While the aforesaid measures must be implemented with urgency and seriousness, it is important to recognize that, in many High Courts and District Courts, hard copy [physical] filing is still the norm. Therefore, every High Court and District Court must ensure that a disabled lawyer can opt for e-filing. Presently, physical filing is the norm and even though a lawyer may navigate through this process with the help of his attorney/clerk, everyone cannot afford this luxury. Further, placing the onus on the disabled lawyer to do so is inconsistent with the text and objects of the Rights of Persons with Disabilities Act, 2016. In order to effectuate this, the registry can maintain a list of disabled lawyers practicing in the concerned Court. As soon as a lawyer whose name is in such a list, the option of digital filing should become available to him/her. Under this option, the entire proceedings should go the digital route. Appropriate practice directions in this regard need to be issued by all High Courts within a period of three months from the date of receipt of this Standard Operating Procedure.

## XIV Accessibility committee in every High Court and District Court:

### 29.

Addressing accessibility barriers is an ongoing challenge and therefore requires sustained institutional attention. As a result, it is desirable that every High Court and District Court must set up an Accessibility Committee at the earliest on the receipt of this model Standard Operating Procedure.

### 30.

As mentioned in point 28 above, a disabled lawyer/litigant/judge can request the Committee to enable him/her to access any filings in digital format that comply with the accessibility protocols outlined in this Standard Operating Procedure as well as to make their own filings using the e-filing system. For this purpose, the email address of the Committee should be widely publicized on the website of the concerned court. A disabled lawyer/litigant/judicial officer can contact the Committee via email to request access to an accessible filing. On verifying that the requesting party’s name is contained in the database of disabled lawyers maintained by the concerned Court, the Accessibility Committee should pass an order, directing the registry to comply with the request for providing accessible filings in a given matter within a reasonable time period, as prescribed by the Accessibility Committee.

### 31.

The composition of the Committee for the High Court can be as follows: one High Court judge, one registrar level officer, two assistant registrar level officers, one technical expert, one staff member and one or two advocates. It is desirable to have One or two members of the committee be persons with disability.

### 32.

The composition of the Committee for the District Court can be as follows: one additional district judge, one Sub Judge/Senior, one advocate and a District System Administrator. One or two members of the Committee should be persons with disability. The High Court Accessibility Committee should monitor the work of the District Court Accessibility Committees coming within the concerned High Court’s remit.

### 33.

The composition of the Committee and its contact details must be publicized on the website of the concerned Court. Any accessibility challenges faced by the disabled in accessing the justice system [in addition to those mentioned in point 28] can be brought to the Committee's attention and must be dealt with in a swift and effective fashion, in a manner consistent with the Rights of Persons with Disabilities Act, 2016, and the rules framed thereunder. The Committee should also publish, on a quarterly basis, data as to how many requests for accessible filings/court documents or any other reasonable accommodation were made to it and how many amongst them were disposed of.

## XV. Training and sensitization

> Headings I to XIV and XVII print the Roman numeral with no stop after it. XV. and
> XVI. print one. Both are kept as printed.

### 34.

All State Judicial Academies, and the National Judicial Academy, shall, in co-ordination with the relevant courts, should conduct regular trainings for lawyers and court staff on: [a] creating accessible documents and [b] dealing with the needs of persons with disabilities with appropriate care and sensitivity.

Such trainings should be made part of the annual calendar of the aforesaid Academies.

## XVI. Review and revision:

### 35.

As technology proceeds at a rapid pace, so do the standards to ensure accessibility. Consequently, this Standard Operating Procedure must be reviewed every two years and suitably modified.

## XVII Accessible PDF Techniques for WCAG 2.0:

> The heading and the link both name WCAG 2.0, which was superseded by WCAG 2.1 in
> 2018 and by WCAG 2.2 in 2023. The document is reproduced as it stands.

### 36.

For more information It can be accessed from the following link:

https://www.w3.org/TR/WCAG20-TECHS/pdf.html

Note: Whilst the links and references are provided to help relevant stakeholders for guidance only, it shall be the responsibility of each stakeholder to ensure compliance with the latest guidelines, standards and international best practices recommended by the relevant application provider.

## Annexure 1

### How to convert word file to PDF

### Microsoft Word 2007

Microsoft Word 2007: Open the file you wish to save. Click the "File" button in the top left-hand corner. Go to "Save As" > "PDF”. In case of unavailability of this option, open the URL - http://www.microsoft.com/downloads for the downloading of Microsoft's free PDF and XPS converter.

Microsoft Word 2010/13 : Click File, Share. From the Share menu, Click Create PDF Document then on the right-side click Create a PDF.

Other Versions of Microsoft Word: Open the file you wish to save. Go to “File” > “Print”. Click the dropdown list of installed printers and select “PDF”.

### LibreOffice Writer

It is a free, open-source word processor that is fully compatible with MS Word. It will run in Windows, Mac and Linux operating systems.

LibreOffice can be freely downloaded from the following link:

https://www.libreoffice.org/download/download/

Double click on the downloaded file to install LibreOffice on your computer. Open the Word document you want to convert in LibreOffice Writer.

From the main menu, select "File" > “Export As” > "Export as PDF". There is also an export to PDF button right on the main taskbar.

Choose a file name for your PDF. Make sure that everything else is how you want it. Click "Okay" or "Save" to convert. This will convert your document.

### Free PDF conversion website.

There are many free, easy to use PDF conversion sites available online.

## Annexure 2

### Creating Accessible Scanned Documents (PDF Remediation)

PDF remediation is the process by which digital information is clearly labelled (or, “tagged”) and organized so that people using assistive technology can get the same information from the document that anyone would. It requires a remediation tool and some understanding of remediation procedures.

### Process of creating an accessible scanned document in Acrobat Pro:

(i) open image scanned document in Acrobat Pro;

(ii) perform OCR Text Recognition and find all OCR suspect;

(iii) add tags to the document;

(iv) use Reading Order and Editing Tools etc. and perform Full Check Features in Acrobat Pro;

(v) if any errors are found, fix them;

(vi) if no errors are found, check the document in PDF Accessibility Software (PAC3) for PDF/UA compliance; and

(vii) if any errors are found, edit the document in Acrobat Pro as per point (iv).

### Open-Source software for PDF Remediation:

OCRMYPDF

OCRMYPDF adds an optical character recognition (OCR) text layer to scanned PDF files, allowing them to be searched. It is working as a terminal application. Basic knowledge of terminal usage is required for using this software application.

A. Installation: In Ubuntu 20.04

sudo apt install ocrmypdf

B. Add an OCR layer and convert to PDF/A

ocrmypdf input.pdf output.pdf

C. Installing local language packages:

sudo apt install tesseract-ocr-kan (For installing Kannada OCR package)

sudo apt install tesseract-ocr-hin (For installing Hindi OCR package)

D. Example (For OCR in local languages):

ocrmypdf -l kan k1.pdf k1_ocr.pdf

ocrmypdf ṁṁṁ-l tam output.pdf test-tamil.pdfcc

*******

## Contributors to the Handbook:

> This page is not in the version of the PDF the e-Committee first published on
> 28 November 2022, which runs to nineteen pages. It is the twentieth page of the
> file currently published, and the only textual difference between the two.

###

• Mr. Atul Madhukar Kurhekar, Member (Processes), eCommittee, Supreme Court of India

• Mr. A. Ramesh Babu, Member (Project Management), eCommittee, Supreme Court of India

• Ms. R. Arulmozhiselvi, Member (HR), eCommittee, Supreme Court of India

• Mr. Rahul Bajaj, Judicial Clerk, Supreme Court of India

• Ms. Aishwarya Singh, Judicial Clerk, Supreme Court of India
