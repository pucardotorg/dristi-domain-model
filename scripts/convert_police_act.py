#!/usr/bin/env python3
"""
convert_police_act.py - The Police Act, 1861 (national) -> Akoma Ntoso <act> XML.

Source:  public/data/acts/police_act_1861.pdf   (India Code reprint)
Writes:  public/data/acts/akn/police-act-1861.akn.xml

The reprint prints each section as "N. Heading:- body ...", interleaved with
editorial COMMENTS blocks, page furniture and numbered footnotes. We keep the
section text and strip the apparatus. Sub-clauses "(1)/(2)/(a)" become a
<blockList>. Best-effort structural conversion - verify against the official
text before authoritative use.
"""
import re, html, datetime, subprocess
from pathlib import Path
import xml.dom.minidom as M

REPO = Path(__file__).resolve().parent.parent
PDF  = REPO / "public/data/acts/sources/police-act-1861.pdf"
OUT  = REPO / "public/data/acts/akn/police-act-1861.akn.xml"
GEN  = datetime.date.today().isoformat()

raw = subprocess.check_output(["pdftotext", "-layout", str(PDF), "-"]).decode("utf-8", "replace")
lines = raw.split("\n")

# --- strip page furniture / running heads / lone page numbers ---
def is_furniture(l):
    s = l.strip()
    if not s: return False
    if re.fullmatch(r'\d+', s): return True                       # lone page number
    if re.match(r'(?i)the police act,\s*1861', s): return True     # running head
    if re.match(r'\(\d+ of \d+\)', s): return True                 # (5 of 1861)
    if re.match(r'\[\d+\w* \w+,? \d{4}\]', s): return True         # [22nd March, 1861]
    return False

# a section header, optionally wrapped in "[" (amended) after a stripped footnote digit
SECT = re.compile(r'^\s{0,14}\[?(\d+)([A-Z]?)\.\s+([A-Z\[].*)$')
# footnote-definition openers (India Code apparatus)
FN = re.compile(r'^\s*(Ins\.|Subs\.|Rep\.|Cf\.|Under|The definitions|Short title|References to|Now see|Certain words|Clause|The words|This word|Omitted|Added|Section|Sub|These words)\b')

# --- pass 1: split into sections, dropping COMMENTS blocks + footnotes ---
sections = []           # (num, letter, heading, [body lines])
cur = None
in_comments = False
last_n = 0
for raw_l in lines:
    if is_furniture(raw_l):
        continue
    s = raw_l.rstrip()
    stripped = s.strip()
    if stripped.upper() == "COMMENTS":
        in_comments = True
        continue
    m = SECT.match(s)
    if m and int(m.group(1)) >= last_n and int(m.group(1)) <= last_n + 6:
        # a genuine next section (monotonic, small gap for repealed ones)
        n = int(m.group(1)); letter = m.group(2); rest = m.group(3).strip()
        head, _, body0 = rest.partition(":-")
        if not _:  # some headings use "—" or no marker
            head, _, body0 = rest.partition("—")
        cur = [str(n), letter, head.strip().rstrip('.'), []]
        if body0.strip():
            cur[3].append(body0.strip())
        sections.append(cur)
        last_n = n
        in_comments = False
        continue
    if cur is None or in_comments:
        continue
    if FN.match(s):     # footnote definition line -> skip
        continue
    if stripped:
        cur[3].append(stripped)

# --- clean a section's body text ---
def clean(t):
    t = t.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    t = re.sub(r'\s*\d+\s*\*\s*\*\s*\*\s*\*?', ' ', t)     # "4***" repealed markers
    t = re.sub(r'\d+(?=\[)', '', t)                         # footnote digit before "[" (amendment marker)
    t = re.sub(r'(?<=[a-z])\d+(?=[ \.,;])', '', t)          # stray superscript digit after a word
    t = re.sub(r'(?<=[\s,;])(\d)(?=[a-z]{2})', '', t)        # footnote digit stuck before a word ("1or")
    t = t.replace("[", "").replace("]", "")                 # amendment brackets
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def esc(t): return html.escape(t, quote=False)

# join body lines into paragraphs; split out (1)(2)/(a)(b) sub-clauses into a blockList
def build_content(body_lines):
    text = " ".join(body_lines)
    text = clean(text)
    if not text:
        return "<content><p></p></content>"
    # find sub-clause markers "(1) ... (2) ..." or "(a) ... (b) ..."
    parts = re.split(r'(?=\((?:\d{1,2}|[a-z]{1,2}|[ivxl]{1,4})\)\s)', text)
    lead = parts[0].strip()
    items = [p.strip() for p in parts[1:] if p.strip()]
    out = "<content>"
    if lead:
        out += f"<p>{esc(lead)}</p>"
    if items:
        out += '<blockList eId="__L__">'
        for it in items:
            mm = re.match(r'\(([^)]{1,4})\)\s*(.*)', it, re.S)
            if mm:
                mark, txt = mm.group(1), mm.group(2).strip()
                out += f'<item><num>({esc(mark)})</num><p>{esc(txt)}</p></item>'
            else:
                out += f'<item><p>{esc(it)}</p></item>'
        out += "</blockList>"
    if not lead and not items:
        out += "<p></p>"
    out += "</content>"
    return out

# --- assemble sections XML ---
body_secs = []
for n, letter, head, blines in sections:
    eid = f"sec_{n}{letter}"
    heading = clean(head)
    # repealed-only sections: keep heading, empty-ish body
    content = build_content(blines).replace('eId="__L__"', f'eId="{eid}__list_1"')
    body_secs.append(
        f'        <section eId="{eid}">\n'
        f'          <num>{n}{letter}.</num>\n'
        f'          <heading>{esc(heading)}.</heading>\n'
        f'          {content}\n'
        f'        </section>')

SECXML = "\n".join(body_secs)

DOC = f'''<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="act" contains="originalVersion">
    <meta>
      <identification source="#pucar">
        <FRBRWork>
          <FRBRthis value="/akn/in/act/1861/5/!main"/>
          <FRBRuri value="/akn/in/act/1861/5"/>
          <FRBRalias value="The Police Act, 1861" name="shortTitle"/>
          <FRBRdate date="1861-03-22" name="enactment"/>
          <FRBRauthor href="#in-parliament"/>
          <FRBRcountry value="in"/>
          <FRBRnumber value="5"/>
          <FRBRname value="The Police Act, 1861"/>
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/akn/in/act/1861/5/eng@/!main"/>
          <FRBRuri value="/akn/in/act/1861/5/eng@"/>
          <FRBRdate date="1861-03-22" name="consolidation"/>
          <FRBRauthor href="#pucar"/>
          <FRBRlanguage language="eng"/>
        </FRBRExpression>
        <FRBRManifestation>
          <FRBRthis value="/akn/in/act/1861/5/eng@/!main.xml"/>
          <FRBRuri value="/akn/in/act/1861/5/eng@.akn"/>
          <FRBRdate date="{GEN}" name="generation"/>
          <FRBRauthor href="#pucar"/>
          <FRBRformat value="application/akn+xml"/>
        </FRBRManifestation>
      </identification>
      <references source="#pucar">
        <TLCOrganization eId="pucar" href="https://pucar.org" showAs="PUCAR"/>
        <TLCOrganization eId="in-parliament" href="/ontology/organization/in/parliament" showAs="Parliament of India"/>
      </references>
      <notes source="#pucar">
        <note eId="note_source"><p>Converted from the India Code reprint PDF of The Police Act, 1861 (5 of 1861). Editorial COMMENTS blocks, page furniture and footnote/amendment apparatus were stripped during extraction; residual OCR noise may remain. Best-effort structural conversion - verify against the official source before authoritative use.</p></note>
      </notes>
    </meta>
    <preface>
      <longTitle><p>THE POLICE ACT, 1861</p></longTitle>
      <p>An Act for the Regulation of Police.</p>
    </preface>
    <body>
{SECXML}
    </body>
  </act>
</akomaNtoso>
'''

# pretty-print / validate well-formedness
dom = M.parseString(DOC)
OUT.write_text(DOC, encoding="utf-8")
print(f"wrote {OUT}  ({len(sections)} sections)")
print("sections:", ", ".join(f"{n}{l}" for n,l,_,_ in sections))
