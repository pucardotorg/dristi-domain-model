#!/usr/bin/env python3
"""
convert_rules.py — Kerala court rules / State Act -> Akoma Ntoso <act> XML.

Handles the state-layer instruments with a clean (or OCR-recovered) Chapter/Rule
or Section structure. Rules/sections are modelled as AKN <section>, grouped under
<chapter> where the source has chapters; sub-rules "(1)/(2)/(a)" become a
<blockList> inside <content> (schema-valid nesting, same approach as the
Constitution converter).

Parse modes (per document, see DOCS):
  chapter-rule      CHAPTER <roman> <title> (same line); rules "Rule - N. Heading."   [CRP 1982]
  flat-rule         flat "N. Heading:- ..." (one implicit chapter)                     [E-Filing 2021]
  chapter-flatrule  CHAPTER <roman> \\n <title>; continuous "N. Heading.—" rules;      [HC Rules 1971]
                    a leading TOC is cut at `cut_before`
  flat-section      "N Heading —(1)…" (period optional); flat sections; OCR text       [Police Act 2011]

Reads:   public/data/state/kerala/sources/<slug>.pdf   (or <slug>.ocr.txt if text_file set)
Writes:  public/data/state/kerala/akn/<slug>.akn.xml

Requirements:  pip install pdfplumber
Validate:      xmllint --noout --schema akn.xsd public/data/state/kerala/akn/*.akn.xml

Best-effort: tables are flattened to text; OCR-derived documents (Police Act) carry
residual OCR noise. Verify against the official text before authoritative use.
"""
import pdfplumber, re, html, datetime, sys
from pathlib import Path
import xml.dom.minidom as M

import sys as _sys
from pathlib import Path as _Path
_sys.path.insert(0, str(_Path(__file__).resolve().parent))
from akn_ids import assert_unique_eids

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "public" / "data" / "state" / "kerala" / "sources"
OUT = REPO / "public" / "data" / "state" / "kerala" / "akn"
GEN_DATE = datetime.date.today().isoformat()
OUT.mkdir(parents=True, exist_ok=True)
ROMAN = r'[IVXLCDM]+'

DOCS = {
 "criminal-rules-of-practice-kerala-1982": {
    "title": "The Criminal Rules of Practice, Kerala, 1982",
    "work": "/akn/in-kl/act/1982/criminal-rules-of-practice",
    "date": "1982-01-01", "mode": "chapter-rule", "eid": "rule", "author": "kerala-hc", "author_show": "High Court of Kerala",
 },
 "electronic-filing-rules-for-courts-kerala-2021": {
    "title": "Electronic Filing Rules for Courts (Kerala), 2021",
    "work": "/akn/in-kl/act/2021/electronic-filing-rules-for-courts",
    "date": "2021-05-07", "mode": "flat-rule", "eid": "rule", "author": "kerala-hc", "author_show": "High Court of Kerala",
 },
 "rules-of-the-high-court-of-kerala-1971": {
    "title": "Rules of the High Court of Kerala, 1971",
    "work": "/akn/in-kl/act/1971/rules-of-the-high-court",
    "date": "1971-01-01", "mode": "chapter-flatrule", "eid": "rule", "author": "kerala-hc", "author_show": "High Court of Kerala",
    "cut_before": r"regulate its procedure",
 },
 "kerala-police-act-2011": {
    "title": "The Kerala Police Act, 2011",
    "work": "/akn/in-kl/act/2011/8",
    "date": "2011-01-01", "mode": "flat-section", "eid": "sec", "author": "kerala-legislature", "author_show": "Kerala Legislative Assembly",
    "text_file": "kerala-police-act-2011.txt",
    "cut_before": r"BE[,]?\s+it\s+enacted",
 },
}

def esc(s): return html.escape(s, quote=False)
def clean(s): return re.sub(r'\s+', ' ', s).strip()

# ---------- page furniture ----------
# The sources interleave per-page furniture with the body text: a running head,
# a print-time footer, a lone page number. parse_content joins body lines with a
# space, so anything left behind lands mid-sentence inside a rule.
FURNITURE = (
    re.compile(r'^\(?\s*Page\s+\d+\s+of\s+\d+\s*\)?[.,]?$', re.I),   # (Page 11 of 58)
    re.compile(r'^Printed\s+For\s*:', re.I),                          # Printed For: 25-07-2026 at 12:59:PM
    re.compile(r'^\d{1,4}$'),                                         # a lone page number
)

def strip_furniture(text, title):
    """Drop running heads and page furniture. A running head is the document title
    on a line of its own; no rule or chapter marker ever looks like one."""
    head = re.compile(r'^' + re.escape(title) + r'\s*[.,]?$', re.I)
    keep = []
    for l in text.split('\n'):
        s = l.strip()
        if s and (head.match(s) or any(p.match(s) for p in FURNITURE)):
            continue
        keep.append(l)
    return '\n'.join(keep)

def raw_text(cfg, slug):
    if cfg.get("text_file"):
        text = (SRC / cfg["text_file"]).read_text()
    else:
        with pdfplumber.open(SRC / f"{slug}.pdf") as pdf:
            text = "\n".join(p.extract_text() or "" for p in pdf.pages)
    return strip_furniture(text, cfg["title"])

# ---------- sub-rule / clause parsing (blockList INSIDE item = schema-valid) ----------
def rankof(mark):
    inner = mark.strip('()')
    if re.fullmatch(r'\d+[A-Z]?', inner): return 0
    if inner == 'i': return 2
    if len(inner) >= 2 and re.fullmatch(r'[ivxlcdm]+', inner): return 2
    return 1
MK = re.compile(r'^[\*\[]{0,2}\((\d+[A-Z]?|[A-Za-z]{1,4})\)\s+(.*)$')

def parse_content(body_list, eid):
    lines = [clean(l) for l in body_list if clean(l)]
    nodes = []
    for line in lines:
        m = MK.match(line)
        if m:
            mark = '(' + m.group(1) + ')'
            nodes.append({'t': 'item', 'mark': mark, 'd': rankof(mark), 'text': clean(m.group(2)), 'children': []})
        elif re.match(r'^(Provided|Explanation|Illustration|Note|TABLE)', line, re.I):
            nodes.append({'t': 'p', 'text': line})
        else:
            if nodes and nodes[-1]['t'] == 'item': nodes[-1]['text'] += ' ' + line
            elif nodes: nodes[-1]['text'] += ' ' + line
            else: nodes.append({'t': 'p', 'text': line})
    root = []; stack = []
    for n in nodes:
        if n['t'] == 'p':
            stack = []; root.append(n)
        else:
            d = n['d']
            while stack and stack[-1]['d'] >= d: stack.pop()
            if stack: stack[-1]['children'].append(n)
            else: root.append(n)
            stack.append(n)
    ctr = [0]
    def ser(entries):
        out = []; i = 0
        while i < len(entries):
            e = entries[i]
            if e['t'] == 'p':
                out.append('<p>' + esc(clean(e['text'])) + '</p>'); i += 1
            else:
                grp = []
                while i < len(entries) and entries[i]['t'] == 'item': grp.append(entries[i]); i += 1
                ctr[0] += 1; lid = eid + '__l' + str(ctr[0]); s = '<blockList eId="' + lid + '">'
                for it in grp:
                    ctr[0] += 1; iid = eid + '__i' + str(ctr[0])
                    inner = '<num>' + esc(it['mark']) + '</num><p>' + esc(clean(it['text'])) + '</p>'
                    if it['children']: inner += ser(it['children'])
                    s += '<item eId="' + iid + '">' + inner + '</item>'
                out.append(s + '</blockList>')
        return ''.join(out)
    inner = ser(root)
    if not inner: inner = '<p></p>'
    return '<content>' + inner + '</content>'

def unit_xml(num, heading, body_lines, prefix):
    eid = f'{prefix}_{num}'
    head = '<heading>' + esc(clean(heading)) + '</heading>' if heading else ''
    return f'<section eId="{eid}"><num>{num}.</num>{head}' + parse_content(body_lines, eid) + '</section>'

def _split_head(rest, seps=r'[—.:]'):
    """heading = text up to the first separator on the marker line; remainder = body."""
    m = re.match(r'\s*(.*?' + seps + r')\s*(.*)$', rest)
    if m:
        return re.sub(r'[—.:]+$', '', m.group(1)).strip(), m.group(2).strip()
    return rest.strip(), ''

# ---------- parse modes ----------
def parse_chapter_rule(text):
    marks = []
    for m in re.finditer(r'(?m)^\s*CHAPTER\s+(' + ROMAN + r')\s+(.+?)\s*$', text):
        marks.append(('chap', m.start(), m.end(), m.group(1), m.group(2)))
    for m in re.finditer(r'(?m)^\s*Rule\s*[-–]\s*(\d+[A-Z]?)\.\s*(.*)$', text):
        marks.append(('rule', m.start(), m.end(), m.group(1), m.group(2)))
    return _assemble(marks, text, next_line_title=False)

def parse_chapter_flatrule(text):
    marks = []
    for m in re.finditer(r'(?m)^\s*CHAPTER\s+(' + ROMAN + r')\s*$', text):
        marks.append(('chap', m.start(), m.end(), m.group(1), None))
    for m in re.finditer(r'(?m)^\s*(\d{1,3}[A-Z]?)\.\s+([A-Z].*)$', text):
        marks.append(('rule', m.start(), m.end(), m.group(1), m.group(2)))
    return _assemble(marks, text, next_line_title=True)

def _assemble(marks, text, next_line_title):
    marks.sort(key=lambda x: x[1])
    chapters = [{'roman': None, 'title': None, 'rules': []}]   # implicit preliminary group
    last = 0
    for i, mk in enumerate(marks):
        end = marks[i + 1][1] if i + 1 < len(marks) else len(text)
        if mk[0] == 'chap':
            title = mk[4]
            if next_line_title:
                tail = text[mk[2]:end].lstrip('\n')
                title = clean(tail.split('\n', 1)[0]) if tail.strip() else ''
            chapters.append({'roman': mk[3], 'title': clean(title or ''), 'rules': []})
            last = last  # chapters don't reset rule numbering (continuous)
        else:
            num = mk[3]; base = int(re.match(r'\d+', num).group())
            if base < last or base > last + 25:   # ignore stray refs / TOC noise
                continue
            last = base
            heading, first_body = _split_head(mk[4])
            body_lines = ([first_body] if first_body else []) + text[mk[2]:end].split('\n')
            chapters[-1]['rules'].append({'num': num, 'heading': heading, 'body': body_lines})
    return [c for c in chapters if c['rules']]

def parse_flat_rule(text):
    seq = []; last = 0
    for m in re.finditer(r'(?m)^\s*(\d+[A-Z]?)\.\s+([A-Z][^\n]*)$', text):
        b = int(re.match(r'\d+', m.group(1)).group())
        if b == last + 1 or (b == 1 and not seq):
            seq.append((m.start(), m.end(), m.group(1), m.group(2))); last = b
    rules = []
    for i, (st, en, num, rest) in enumerate(seq):
        end = seq[i + 1][0] if i + 1 < len(seq) else len(text)
        heading, fb = _split_head(rest, r'[:.]')
        rules.append({'num': num, 'heading': heading, 'body': ([fb] if fb else []) + text[en:end].split('\n')})
    return [{'roman': None, 'title': None, 'rules': rules}]

def parse_flat_section(text):
    """OCR sections: 'N Heading —(1)…' — number may lack a period, may carry leading
    OCR noise (quotes, +, *); sequence 1..N tolerating OCR-missed headings."""
    # leading OCR noise = quotes/asterisk/plus/period/dash only — NOT '(' (that would
    # swallow subsection markers like "(2)" and mis-read them as new sections).
    cands = [(m.start(), m.end(), int(m.group(1)), m.group(2))
             for m in re.finditer(r'(?m)^[\s"“”\'*+.\-]{0,4}(\d{1,3})\.?\s+([A-Z][A-Za-z][^\n]*)', text)]
    start = next((i for i, c in enumerate(cands) if c[2] == 1), 0)   # anchor at section 1
    seq = []; last = 0
    for st, en, n, rest in cands[start:]:
        if last < n <= last + 8:          # gap tolerance to skip past OCR-missed section lines
            seq.append((st, en, n, rest)); last = n
    rules = []
    for i, (st, en, n, rest) in enumerate(seq):
        end = seq[i + 1][0] if i + 1 < len(seq) else len(text)
        heading, fb = _split_head(rest, r'[—.:-]')
        rules.append({'num': str(n), 'heading': heading, 'body': ([fb] if fb else []) + text[en:end].split('\n')})
    return [{'roman': None, 'title': None, 'rules': rules}]

PARSERS = {
    "chapter-rule": parse_chapter_rule,
    "flat-rule": parse_flat_rule,
    "chapter-flatrule": parse_chapter_flatrule,
    "flat-section": parse_flat_section,
}

def build(slug, cfg, text):
    if cfg.get("cut_before"):
        m = re.search(cfg["cut_before"], text)
        if m: text = text[m.start():]
    chapters = PARSERS[cfg["mode"]](text)
    prefix = cfg["eid"]
    body_parts = []; n_units = 0
    for ci, ch in enumerate(chapters, 1):
        units = ''.join(unit_xml(r['num'], r['heading'], r['body'], prefix) for r in ch['rules'])
        n_units += len(ch['rules'])
        if not units: continue
        if ch['roman']:
            head = '<heading>' + esc(ch['title']) + '</heading>' if ch['title'] else ''
            body_parts.append(f'<chapter eId="chp_{ci}"><num>CHAPTER {esc(ch["roman"])}</num>{head}{units}</chapter>')
        else:
            body_parts.append(units)
    body_xml = ''.join(body_parts)
    note = f'Converted from the official text of {cfg["title"]}. '
    note += ('Text was recovered by OCR from the scanned gazette and carries residual OCR noise; '
             if cfg.get("ocr") else '')
    note += ('Chapters, rules/sections and sub-rules follow the source; tables were flattened to text. '
             'Best-effort structural conversion — verify against the official text before authoritative use.')
    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="act" contains="originalVersion">
    <meta>
      <identification source="#pucar">
        <FRBRWork>
          <FRBRthis value="{cfg['work']}/!main"/>
          <FRBRuri value="{cfg['work']}"/>
          <FRBRalias value="{esc(cfg['title'])}" name="shortTitle"/>
          <FRBRdate date="{cfg['date']}" name="generation"/>
          <FRBRauthor href="#{cfg['author']}"/>
          <FRBRcountry value="in-kl"/>
          <FRBRnumber value=""/>
          <FRBRname value="{esc(cfg['title'])}"/>
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="{cfg['work']}/eng@/!main"/>
          <FRBRuri value="{cfg['work']}/eng@"/>
          <FRBRdate date="{cfg['date']}" name="generation"/>
          <FRBRauthor href="#{cfg['author']}"/>
          <FRBRlanguage language="eng"/>
        </FRBRExpression>
        <FRBRManifestation>
          <FRBRthis value="{cfg['work']}/eng@/!main.xml"/>
          <FRBRuri value="{cfg['work']}/eng@.akn"/>
          <FRBRdate date="{GEN_DATE}" name="generation"/>
          <FRBRauthor href="#pucar"/>
          <FRBRformat value="application/akn+xml"/>
        </FRBRManifestation>
      </identification>
      <references source="#pucar">
        <TLCOrganization eId="pucar" href="https://pucar.org" showAs="PUCAR"/>
        <TLCOrganization eId="{cfg['author']}" href="/ontology/organization/in/{cfg['author']}" showAs="{esc(cfg['author_show'])}"/>
      </references>
      <notes source="#pucar">
        <note eId="note_source"><p>{esc(note)}</p></note>
      </notes>
    </meta>
    <preface><longTitle><p>{esc(cfg['title'].upper())}</p></longTitle></preface>
    <body>
{body_xml}
    </body>
  </act>
</akomaNtoso>
'''
    return xml, n_units

def main(only=None):
    for slug, cfg in DOCS.items():
        if only and slug != only: continue
        text = raw_text(cfg, slug)
        xml, n = build(slug, cfg, text)
        M.parseString(xml)
        assert_unique_eids(xml, slug)
        (OUT / f"{slug}.akn.xml").write_text(xml)
        print(f"  {slug}: {n} units, {len(xml)} bytes")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
