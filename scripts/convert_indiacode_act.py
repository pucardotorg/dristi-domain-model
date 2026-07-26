#!/usr/bin/env python3
"""
convert_indiacode_act.py - a Central Act in the India Code "A-format" PDF
-> Akoma Ntoso 3.0 <act> XML.

India Code (indiacode.nic.in) publishes each consolidated Central Act as a text
PDF with a stable shape:

    THE <NAME> ACT, <YEAR>
    ARRANGEMENT OF SECTIONS      <- table of contents (skipped)
    ...
    THE <NAME> ACT, <YEAR>
    ACT NO. <n> OF <year>        [<date>.]
    An Act to ....               <- long title
    BE it enacted by Parliament ... as follows:-
    1. Heading.--(1) body ...    <- the body begins here
    2. Heading.--body ...
      CHAPTER II
      ...

This reads the body (everything after the enacting formula), splits it into
chapters and sections, turns "(1)/(a)/(i)" sub-clauses into a <blockList>, and
strips the India Code apparatus (page furniture, running heads, footnote and
amendment markers). Metadata (title, act number, year, date, long title) is
auto-detected from the PDF; override with flags if a scan is noisy.

Usage:
    python3 scripts/convert_indiacode_act.py <slug> [--title T] [--number N]
                                             [--year Y] [--date YYYY-MM-DD]

    <slug> is the file stem: it reads  public/data/acts/sources/<slug>.pdf
    and writes             public/data/acts/akn/<slug>.akn.xml

Best-effort structural conversion - verify against the official text before
authoritative use. Needs `pdftotext` (poppler) on PATH; if the PDF is a scan
(near-zero extracted text) OCR it first (see the skill).
"""
import re, html, sys, argparse, datetime, subprocess
from pathlib import Path
import xml.dom.minidom as minidom

REPO = Path(__file__).resolve().parent.parent
GEN  = datetime.date.today().isoformat()
EM, EN = "\u2014", "\u2013"   # em / en dash (kept as escapes; house rule: no literal em-dashes)

MONTHS = {m:i for i,m in enumerate(
    ["january","february","march","april","may","june","july","august",
     "september","october","november","december"], 1)}

# ------------------------------------------------------------------ helpers ---
def clean(t):
    """Normalise a run of body text: drop OCR/footnote noise, unify quotes.
    NOTE: em/en dashes are LEFT INTACT - this is verbatim statutory text, and the
    no-em-dash house rule applies only to app-authored copy, never the bare Act."""
    t = t.replace("“",'"').replace("”",'"').replace("‘","'").replace("’","'")
    t = re.sub(r'\s*\d+\s*\*(\s*\*)*', ' ', t)                   # "1***" repealed markers
    t = re.sub(r'\d+(?=\[)', '', t)                             # footnote digit before "["
    t = re.sub(r'(?<=[a-z])\d+(?=[ \.,;:])', '', t)            # superscript digit after a word
    t = t.replace("[", "").replace("]", "")                    # amendment brackets
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def esc(t):
    return html.escape(t, quote=False)

# footnote / apparatus lines to drop inside the body
FN = re.compile(r'^\s*\d+\.\s*(Subs\.|Ins\.|Rep\.|Cf\.|Added|Omitted|Section|Clause|'
                r'The words?|These words|This word|Vide|Now|Certain|Earlier|Renumbered|'
                r'Explanation added|Provided|w\.e\.f\.|By |For )', re.I)
FN2 = re.compile(r'\bw\.e\.f\.\b|\bAct\s+\d+\s+of\s+\d{4}\b.*\bs\.\s*\d+', re.I)
FURNITURE = [
    re.compile(r'^\s*\d+\s*$'),                                 # lone page number
    re.compile(r'^\s*_+\s*$'),                                  # rule lines
    re.compile(r'(?i)^\s*the\s+.+\s+(act|sanhita|adhiniyam),?\s*\d{4}\s*$'),   # running head
    re.compile(r'(?i)^\s*the\s+.+,?\s*\d{4}\s*\[\s*sec'),       # running head w/ [ Sec.
    re.compile(r'(?i)^\s*act\s+no\.?\s'),                       # ACT NO. n OF year
    re.compile(r'^\s*\[[^\]]*\d{4}[^\]]*\]\s*$'),               # [26th December, 1969.]
    re.compile(r'(?i)^\s*arrangement of sections'),
    re.compile(r'(?i)^\s*sections\s*$'),
]
CHAP = re.compile(r'^\s*CHAPTER\s+([IVXLCDM]+[A-Z]?)\s*$')
SECT = re.compile(r'^\s{0,20}\[?(\d+)([A-Z]?)\.\s+(.+)$')       # "12. Heading.--body"
SEP  = re.compile(r'\.\s*(?:' + EM + '|' + EN + r'|--|-\s)')   # heading/body separator ".--"

def is_furniture(line):
    return any(p.search(line) for p in FURNITURE)

# --------------------------------------------------------------- extraction ---
def extract_text(pdf):
    raw = subprocess.check_output(["pdftotext", "-layout", str(pdf), "-"]).decode("utf-8","replace")
    if len(raw.strip()) < 400:
        sys.exit(f"ERROR: almost no text extracted from {pdf.name} - it is probably a scan. "
                 f"OCR it first (see the skill), then re-run.")
    return raw

def detect_meta(raw, args):
    title, number, year, date = args.title, args.number, args.year, args.date
    m = re.search(r'ACT\s+NO\.?\s*(\d+)\s+OF\s+(\d{4})', raw, re.I)
    if m:
        number = number or int(m.group(1)); year = year or int(m.group(2))
    m = re.search(r'\[\s*(\d+)\w*\s+([A-Za-z]+),?\s+(\d{4})', raw)          # [26th December, 1969.]
    if m and not date:
        d, mon, y = int(m.group(1)), MONTHS.get(m.group(2).lower()), int(m.group(3))
        if mon: date = f"{y:04d}-{mon:02d}-{d:02d}"
    m = re.search(r'may be called the\s+(.+?Act,\s*\d{4})', raw)
    if m and not title:
        title = re.sub(r'\s+', ' ', m.group(1)).strip()
    m = re.search(r'\n\s*(An Act .+?\.)\s*\n\s*BE it enacted', raw, re.S)
    long_title = re.sub(r'\s+', ' ', m.group(1)).strip() if m else (title or "")
    if not (title and number and year and date):
        sys.exit(f"ERROR: could not auto-detect all metadata (title={title!r} no={number} "
                 f"year={year} date={date!r}). Pass the missing ones as flags.")
    return title, number, year, date, long_title

# ----------------------------------------------------------------- body parse ---
def parse_body(raw):
    """Return (chapters, sections). Each section: [num, letter, heading, [lines]].
    chapters: list of (roman, heading, first_section_index)."""
    m = re.search(r'BE it enacted.*?as follows\s*:?\s*(?:' + EM + r'|--|-|:)?', raw, re.S)
    body = raw[m.end():] if m else raw
    lines = body.split("\n")

    sections, chapters = [], []
    cur = None
    last_n = 0
    pending_chapter = None          # roman waiting for its heading line
    for raw_l in lines:
        s = raw_l.rstrip()
        if not s.strip():
            continue
        if is_furniture(s):
            continue
        cm = CHAP.match(s)
        if cm:
            pending_chapter = cm.group(1)
            continue
        if pending_chapter and cur is None and not SECT.match(s):
            chapters.append((pending_chapter, s.strip(), len(sections)))
            pending_chapter = None
            continue
        sm = SECT.match(s)
        if sm and int(sm.group(1)) >= last_n and int(sm.group(1)) <= last_n + 8 \
           and (SEP.search(sm.group(3)) or "[Repealed" in sm.group(3) or "*" in sm.group(3)):
            n = int(sm.group(1)); letter = sm.group(2); rest = sm.group(3).strip()
            parts = SEP.split(rest, maxsplit=1)
            head = parts[0].strip().rstrip('.')
            body0 = parts[1].strip() if len(parts) > 1 else ""
            if pending_chapter:                       # chapter heading was the section? no - flush
                chapters.append((pending_chapter, head, len(sections))); pending_chapter = None
            cur = [str(n), letter, head, []]
            if body0:
                cur[3].append(body0)
            sections.append(cur); last_n = n
            continue
        if cur is None:
            continue
        if FN.match(s) or FN2.search(s):              # footnote/amendment apparatus
            continue
        cur[3].append(s.strip())
    return chapters, sections

# ------------------------------------------------------------- content build ---
def build_content(body_lines, eid):
    text = clean(" ".join(body_lines))
    if not text:
        return "<content><p></p></content>"
    parts = re.split(r'(?=\((?:\d{1,3}|[a-z]{1,3}|[ivxl]{1,4})\)\s)', text)
    lead = parts[0].strip()
    items = [p.strip() for p in parts[1:] if p.strip()]
    out = "<content>"
    if lead:
        out += f"<p>{esc(lead)}</p>"
    if items:
        out += f'<blockList eId="{eid}__list_1">'
        for it in items:
            mm = re.match(r'\(([^)]{1,5})\)\s*(.*)', it, re.S)
            if mm:
                out += f'<item><num>({esc(mm.group(1))})</num><p>{esc(mm.group(2).strip())}</p></item>'
            else:
                out += f'<item><p>{esc(it)}</p></item>'
        out += "</blockList>"
    if not lead and not items:
        out += "<p></p>"
    out += "</content>"
    return out

def section_xml(sec, indent):
    n, letter, head, blines = sec
    eid = f"sec_{n}{letter}"
    content = build_content(blines, eid)
    pad = " " * indent
    return (f'{pad}<section eId="{eid}">\n'
            f'{pad}  <num>{n}{letter}.</num>\n'
            f'{pad}  <heading>{esc(clean(head))}.</heading>\n'
            f'{pad}  {content}\n'
            f'{pad}</section>')

def roman_ok(r):
    return re.sub(r'[^IVXLCDM A-Z]', '', r)

def assemble_body(chapters, sections):
    if not chapters:
        return "\n".join(section_xml(s, 8) for s in sections)
    # map each section index to its chapter
    bounds = [c[2] for c in chapters] + [len(sections)]
    out = []
    for ci, (roman, heading, start) in enumerate(chapters):
        end = bounds[ci+1]
        secs = "\n".join(section_xml(sections[i], 10) for i in range(start, end))
        out.append(
            f'        <chapter eId="chp_{roman_ok(roman).strip().replace(" ","_")}">\n'
            f'          <num>CHAPTER {roman}</num>\n'
            f'          <heading>{esc(clean(heading))}</heading>\n'
            f'{secs}\n'
            f'        </chapter>')
    # any sections before the first chapter (rare) go loose at the top
    if chapters[0][2] > 0:
        pre = "\n".join(section_xml(sections[i], 8) for i in range(0, chapters[0][2]))
        out.insert(0, pre)
    return "\n".join(out)

# --------------------------------------------------------------------- main ---
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--title"); ap.add_argument("--number", type=int)
    ap.add_argument("--year", type=int); ap.add_argument("--date")
    ap.add_argument("--longtitle")
    ap.add_argument("--pdf", help="override input PDF path (e.g. a state instrument)")
    ap.add_argument("--out", help="override output AKN path (e.g. state/<state>/akn/...)")
    args = ap.parse_args()

    pdf = Path(args.pdf) if args.pdf else REPO / "public/data/acts/sources" / f"{args.slug}.pdf"
    out = Path(args.out) if args.out else REPO / "public/data/acts/akn" / f"{args.slug}.akn.xml"
    if not pdf.exists():
        sys.exit(f"ERROR: {pdf} not found")

    raw = extract_text(pdf)
    title, number, year, date, long_title = detect_meta(raw, args)
    if args.longtitle:
        long_title = args.longtitle
    chapters, sections = parse_body(raw)
    if not sections:
        sys.exit("ERROR: no sections parsed - inspect the PDF layout.")
    body_xml = assemble_body(chapters, sections)

    doc = f'''<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="act" contains="originalVersion">
    <meta>
      <identification source="#pucar">
        <FRBRWork>
          <FRBRthis value="/akn/in/act/{year}/{number}/!main"/>
          <FRBRuri value="/akn/in/act/{year}/{number}"/>
          <FRBRalias value="{esc(title)}" name="shortTitle"/>
          <FRBRdate date="{date}" name="enactment"/>
          <FRBRauthor href="#in-parliament"/>
          <FRBRcountry value="in"/>
          <FRBRnumber value="{number}"/>
          <FRBRname value="{esc(title)}"/>
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/akn/in/act/{year}/{number}/eng@/!main"/>
          <FRBRuri value="/akn/in/act/{year}/{number}/eng@"/>
          <FRBRdate date="{date}" name="consolidation"/>
          <FRBRauthor href="#pucar"/>
          <FRBRlanguage language="eng"/>
        </FRBRExpression>
        <FRBRManifestation>
          <FRBRthis value="/akn/in/act/{year}/{number}/eng@/!main.xml"/>
          <FRBRuri value="/akn/in/act/{year}/{number}/eng@.akn"/>
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
        <note eId="note_source"><p>Converted from the India Code consolidated PDF of {esc(title)} ({number} of {year}). Page furniture, the arrangement-of-sections table and footnote/amendment apparatus were stripped during extraction; residual OCR noise may remain. Best-effort structural conversion - verify against the official source before authoritative use.</p></note>
      </notes>
    </meta>
    <preface>
      <longTitle><p>{esc(title.upper())}</p></longTitle>
      <p>{esc(long_title)}</p>
    </preface>
    <body>
{body_xml}
    </body>
  </act>
</akomaNtoso>
'''
    minidom.parseString(doc)                      # well-formedness gate
    out.write_text(doc, encoding="utf-8")
    print(f"wrote {out.relative_to(REPO)}  ({len(sections)} sections, {len(chapters)} chapters)")
    print("sections:", ", ".join(f"{n}{l}" for n,l,_,_ in sections))

if __name__ == "__main__":
    main()
