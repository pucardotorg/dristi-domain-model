#!/usr/bin/env python3
"""
convert_gj_rules.py — Gujarat state-layer instruments -> Akoma Ntoso <act> XML.

The Gujarat sources come in four shapes, so the parser is selected per document
(see DOCS below):

  toc-section   Government-press Act with the section heading printed as a small
                MARGINAL note beside the body (Gujarat Court-Fees Act, 2004;
                Gujarat Police Act, 1951). Marginal notes and footnotes are
                dropped by font size; the section headings are taken from the
                Act's own CONTENTS page and the body is walked in that order, so
                a stray "12." inside a footnote can never open a section.
                Schedules are emitted as <part> holding <section eId="art_N">.

  chapter-rule  High Court rules book: "CHAPTER - <roman>" on its own line, the
                chapter title on the next line(s), and continuously numbered
                rules "N. Heading.—body" (Gujarat High Court Rules, 1993).

  dotted-rule   Modern High Court rules/SOP: "Chapter I - Preliminary" and rules
                "N. Heading:-" whose sub-rules are dotted "N.M." or "(a)"
                (SARAS Courts Rules 2026, Electronic Communication and
                Audio-Video Electronic Means Rules 2025, e-Filing SOP 2024).

  ocr-rule      OCR text of a scanned manual: chapters "CHAPTER <roman>" and
                continuously numbered rules (Criminal Manual, 1977).

Reads:   public/data/state/gujarat/sources/<slug>.pdf   (or <slug>.ocr.txt)
Writes:  public/data/state/gujarat/akn/<slug>.akn.xml

Requirements: pip install pdfplumber
Validate:     xmllint --noout public/data/state/gujarat/akn/*.akn.xml

Statutory text is left verbatim (em-dashes and archaic spelling kept). Tables in
the fee schedules are flattened to text. Best-effort structural conversion —
verify against the official text before authoritative use.
"""
import re, html, datetime, sys
from pathlib import Path
import xml.dom.minidom as M

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "public" / "data" / "state" / "gujarat" / "sources"
OUT = REPO / "public" / "data" / "state" / "gujarat" / "akn"
GEN_DATE = datetime.date.today().isoformat()
OUT.mkdir(parents=True, exist_ok=True)
ROMAN = r'[IVXLCDM]+'
HC = "gujarat-hc"
HC_SHOW = "High Court of Gujarat"
LEG = "gujarat-legislature"
LEG_SHOW = "Gujarat Legislative Assembly"

DOCS = {
 "gujarat-court-fees-act-2004": {
    "title": "The Gujarat Court-Fees Act, 2004",
    "work": "/akn/in-gj/act/2004/4", "number": "4", "date": "2004-03-06",
    "mode": "toc-section", "eid": "sec", "author": LEG, "author_show": LEG_SHOW,
    "min_size": 10.2, "body_from": r"It is hereby enacted in the Fifty-fifth Year",
    "schedules": True,
 },
 "gujarat-police-act-1951": {
    "title": "The Gujarat Police Act, 1951",
    "work": "/akn/in-gj/act/1951/22", "number": "22", "date": "1951-06-11",
    "mode": "toc-section", "eid": "sec", "author": LEG, "author_show": LEG_SHOW,
    "min_size": 10.3, "body_from": r"it is hereby enacted as follows",
    "ocr": True,
 },
 "gujarat-high-court-rules-1993": {
    "title": "The Gujarat High Court Rules, 1993",
    "work": "/akn/in-gj/act/1993/gujarat-high-court-rules", "number": "", "date": "1993-03-30",
    "mode": "chapter-rule", "eid": "rule", "author": HC, "author_show": HC_SHOW,
 },
 "gujarat-saras-courts-rules-2026": {
    "title": "The Gujarat High Court Rules for seamless functioning of SARAS Courts (StateWide Access to Remote Adjudication System), 2026",
    "work": "/akn/in-gj/act/2026/saras-courts", "number": "", "date": "2026-03-24",
    "mode": "dotted-rule", "eid": "rule", "author": HC, "author_show": HC_SHOW,
    "body_from": r"Chapter I - Preliminary",
 },
 "gujarat-district-courts-electronic-communication-rules-2025": {
    "title": "The District Courts of the Gujarat State for the Use of Electronic Communication and Audio-Video Electronic Means Rules, 2025",
    "work": "/akn/in-gj/act/2025/electronic-communication-audio-video", "number": "", "date": "2025-06-02",
    "mode": "dotted-rule", "eid": "rule", "author": HC, "author_show": HC_SHOW,
    "body_from": r"CHAPTER I\s*\n?\s*PRELIMINARY", "body_to": r"SCHEDULE-I",
 },
 "gujarat-efiling-sop-district-judiciary-2024": {
    "title": "Standard Operating Procedure for Online Electronic Filing (e-Filing) for the Gujarat District Judiciary, 2024",
    "work": "/akn/in-gj/doc/2024/efiling-sop-district-judiciary", "number": "", "date": "2024-01-06",
    "mode": "dotted-rule", "eid": "rule", "author": HC, "author_show": HC_SHOW,
    "body_from": r"1\.\s+Preface",
 },
 "gujarat-criminal-manual-1977": {
    "title": "The Criminal Manual, 1977 (High Court of Gujarat)",
    "work": "/akn/in-gj/act/1977/criminal-manual", "number": "", "date": "1977-06-06",
    "mode": "ocr-rule", "eid": "rule", "author": HC, "author_show": HC_SHOW,
    "text_file": "gujarat-criminal-manual-1977.ocr.txt", "ocr": True,
    "body_from": r"(?m)^\W{0,4}ERRATA\s*$",
 },
}

def esc(s): return html.escape(s, quote=False)
def clean(s): return re.sub(r'[ \t]+', ' ', s).strip()

# ---------------------------------------------------------------- text layer
def page_lines(page, min_size):
    """Lines of a page, keeping only words at or above `min_size` points.
    That drops the marginal section headings (8pt) and the footnote apparatus
    while keeping the body (11pt)."""
    allw = page.extract_words(extra_attrs=["size"])
    # a rule of underscores marks the start of the footnote apparatus: cut there
    cut = min((w["top"] for w in allw if w["text"].count("_") >= 12), default=None)
    ws = [w for w in allw if w["size"] >= min_size and (cut is None or w["top"] < cut)]
    rows = {}
    for w in ws:
        rows.setdefault(round(w["top"] / 4.0), []).append(w)
    out = []
    for k in sorted(rows):
        g = sorted(rows[k], key=lambda w: w["x0"])
        indent = int(g[0]["x0"] / 6)
        out.append(" " * indent + " ".join(w["text"] for w in g))
    return out

def raw_text(cfg, slug):
    if cfg.get("text_file"):
        return (SRC / cfg["text_file"]).read_text(errors="replace")
    import pdfplumber
    ms = cfg.get("min_size")
    with pdfplumber.open(SRC / f"{slug}.pdf") as pdf:
        if ms:
            return "\n".join("\n".join(page_lines(p, ms)) for p in pdf.pages)
        return "\n".join(p.extract_text(layout=True) or "" for p in pdf.pages)

JUNK = re.compile(
    r'^\s*(//\s*\d+\s*//|\d{1,4}|[ivxlcdm]+\)?|\(\w{1,4}\))\s*$|'
    r'^\s*PART IV-C|^\s*IV-C Ex|^\s*\d+-\d+\s*$|^01\. THE CRIMINAL MANUAL',
    re.I)
# a running head is the book title plus page furniture and nothing else
HEADER = re.compile(
    r'^\s*[\[\]\d:.,A-Za-z ]{0,24}?'
    r'(The Gujarat Court-Fees Act, 2004|Gujarat Police Act[.,] 1951|'
    r'THE\s+GUJARAT\s+HIGH COURT\s+RULES,?\s+1993|GUJARAT GOVERNMENT GAZETTE|'
    r'Standard Operating Procedure - eFiling)'
    r'[\[\]\d:.,A-Za-z/ ()-]{0,34}$', re.I)

def strip_furniture(text):
    return "\n".join(l for l in text.split("\n")
                     if not JUNK.search(l) and not HEADER.match(l))

# ------------------------------------------- sub-clause parsing -> blockList
def rankof(mark):
    inner = mark.strip('()')
    if re.fullmatch(r'\d+(\.\d+)*[A-Z]?', inner): return 0
    if inner == 'i': return 2
    if len(inner) >= 2 and re.fullmatch(r'[ivxlcdm]+', inner): return 2
    return 1

MK = re.compile(r'^[\*\[\d\s]{0,3}\((\d+[A-Z]?|[A-Za-z]{1,4})\)\s+(.*)$')
DOT = re.compile(r'^(\d+\.\d+(?:\.\d+)*)\.?\s+(.*)$')

def parse_content(body_list, eid, dotted=False):
    lines = [clean(l) for l in body_list if clean(l)]
    nodes = []
    for line in lines:
        m = DOT.match(line) if dotted else None
        if m:
            mark = m.group(1)
            nodes.append({'t': 'item', 'mark': mark, 'd': mark.count('.') - 1,
                          'text': clean(m.group(2)), 'children': []})
            continue
        m = MK.match(line)
        if m:
            mark = '(' + m.group(1) + ')'
            nodes.append({'t': 'item', 'mark': mark, 'd': 3 + rankof(mark),
                          'text': clean(m.group(2)), 'children': []})
        elif re.match(r'^(Provided|Explanation|Illustration|Note|TABLE|NOTE)', line):
            nodes.append({'t': 'p', 'text': line})
        else:
            if nodes: nodes[-1]['text'] += ' ' + line
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
                while i < len(entries) and entries[i]['t'] == 'item':
                    grp.append(entries[i]); i += 1
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

def unit_xml(eid, num, heading, body_lines, dotted=False):
    head = '<heading>' + esc(clean(heading)) + '</heading>' if heading else ''
    return (f'<section eId="{eid}"><num>{esc(num)}</num>{head}'
            + parse_content(body_lines, eid, dotted) + '</section>')

def split_head(rest, seps=r'[—.:–-]'):
    m = re.match(r'\s*(.{2,90}?' + seps + r')\s*(.*)$', rest, re.S)
    if m:
        return re.sub(r'[—.:–\-]+$', '', m.group(1)).strip(), m.group(2).strip()
    return re.sub(r'[\s—.:–\-]+$', '', rest).strip(), ''

# ------------------------------------------------------------- parse modes
def toc_entries(text):
    """(num, heading) pairs from the leading CONTENTS/SECTIONS listing."""
    out = []; seen = set(); last = 0
    for m in re.finditer(r'(?m)^\s*(\d{1,3}[A-Z]{0,2})\.\s*(.+?)\s*\.{0,4}\s*(\d{1,3})\s*$', text):
        num, headg = m.group(1), clean(m.group(2))
        base = int(re.match(r'\d+', num).group())
        if num in seen: continue
        if base < last or base > last + 3: continue
        headg = re.sub(r'\s*\.{2,}\s*$', '', headg).strip(' .')
        if len(headg) < 3: continue
        out.append((num, headg)); seen.add(num); last = base
    # a contents line whose page number wrapped to the previous line is missed
    # above; fill single-number gaps from the same region
    filled = []
    for i, (num, headg) in enumerate(out):
        filled.append((num, headg))
        if i + 1 < len(out):
            a, b = int(re.match(r'\d+', num).group()), int(re.match(r'\d+', out[i + 1][0]).group())
            for miss in range(a + 1, b):
                m = re.search(r'(?m)^\s*' + str(miss) + r'\.\s+([A-Z].{3,90}?)\s*\.?\s*$', text)
                if m: filled.append((str(miss), clean(m.group(1))))
    return filled

def build_toc_section(text, cfg):
    bstart = re.search(cfg["body_from"], text)
    toc = toc_entries(text[:bstart.start()] if bstart else text)
    body = strip_furniture(text[bstart.start():] if bstart else text)
    sm = SCHED.search(body)
    main, sched = (body[:sm.start()], body[sm.start():]) if sm else (body, "")
    # locate each section in order
    pos = 0; found = []
    for num, headg in toc:
        pat = re.compile(r'(?m)^[ \t]*[\'"\[\*]{0,3}' + re.escape(num) + r'\.\s*')
        m = pat.search(main, pos)
        if not m:
            print(f"    ! section {num} not located", file=sys.stderr); continue
        found.append((num, headg, m.start(), m.end())); pos = m.end()
    rules = []
    for i, (num, headg, st, en) in enumerate(found):
        end = found[i + 1][2] if i + 1 < len(found) else len(main)
        rules.append({'num': num + '.', 'eid': 'sec_' + num, 'heading': headg,
                      'body': main[en:end].split("\n")})
    chapters = [{'roman': None, 'title': None, 'rules': rules}]
    if cfg.get("schedules"):
        chapters += build_schedules(sched)
    return chapters

SCHED = re.compile(r'(?m)^\s*SCHEDULE\s+(I{1,3})\s*$')
def build_schedules(body):
    ms = list(SCHED.finditer(body))
    out = []
    for i, m in enumerate(ms):
        end = ms[i + 1].start() if i + 1 < len(ms) else len(body)
        chunk = body[m.end():end]
        title = clean(chunk.split("\n", 2)[1]) if "\n" in chunk else ""
        arts = [(a.start(), a.end(), a.group(1), a.group(2) or '')
                for a in re.finditer(r'(?m)^\s*(\d{1,2})\.(?:\s+(\S.*))?$', chunk)]
        seq = []; last = 0
        for st, en, num, rest in arts:
            n = int(num)
            if n == last + 1: seq.append((st, en, num, rest)); last = n
        rules = []
        rn = m.group(1)
        for j, (st, en, num, rest) in enumerate(seq):
            e = seq[j + 1][0] if j + 1 < len(seq) else len(chunk)
            headg, fb = split_head(rest, r'[.:]')
            headg = headg[:70]
            rules.append({'num': 'Article ' + num + '.',
                          'eid': ('art_' if rn == 'II' else 'sch' + rn.lower() + '_art_') + num,
                          'heading': headg,
                          'body': ([fb] if fb else []) + chunk[en:e].split("\n")})
        if rules:
            out.append({'roman': None, 'title': None, 'rules': rules,
                        'part': 'SCHEDULE ' + rn, 'part_title': title})
    return out

def build_chapter_rule(text, cfg):
    text = strip_furniture(text)
    marks = []
    for m in re.finditer(r'(?m)^\s*CHAPTER\s*[-–—]?\s*(' + ROMAN + r')\s*$', text):
        marks.append(('chap', m.start(), m.end(), m.group(1), None))
    for m in re.finditer(r'(?m)^\s*(?:\d{1,2}\s*\[)?(\d{1,3}[A-Z]?)\.\s+([A-Z(].*)$', text):
        marks.append(('rule', m.start(), m.end(), m.group(1), m.group(2)))
    marks.sort(key=lambda x: x[1])
    # keep only the marks that really open something: a rejected candidate (a
    # footnote line, a cross-reference) must NOT truncate the rule it sits inside
    kept = []; last = 0
    for mk in marks:
        if mk[0] == 'chap':
            kept.append(mk)
        else:
            base = int(re.match(r'\d+', mk[3]).group())
            if base <= last or base > last + 4: continue
            last = base; kept.append(mk)
    chapters = [{'roman': None, 'title': None, 'rules': []}]
    for i, mk in enumerate(kept):
        end = kept[i + 1][1] if i + 1 < len(kept) else len(text)
        if mk[0] == 'chap':
            tail = [clean(l) for l in text[mk[2]:end].split("\n") if clean(l)]
            title = tail[0] if tail else ''
            title = re.sub(r'^\d?\s*\[', '', title)
            chapters.append({'roman': mk[3], 'title': title, 'rules': []})
        else:
            num = mk[3]
            headg, fb = split_head(mk[4], r'[—.:–]')
            chapters[-1]['rules'].append(
                {'num': num + '.', 'eid': 'rule_' + num, 'heading': headg,
                 'body': ([fb] if fb else []) + text[mk[2]:end].split("\n")})
    return [c for c in chapters if c['rules']]

def build_dotted_rule(text, cfg):
    bstart = re.search(cfg["body_from"], text)
    if bstart: text = text[bstart.start():]
    if cfg.get("body_to"):
        bend = re.search(cfg["body_to"], text)
        if bend: text = text[:bend.start()]
    text = strip_furniture(text)
    marks = []
    for m in re.finditer(r'(?mi)^\s*Chapter\s+(' + ROMAN + r')\s*[-–—]\s*(.+?)\s*$', text):
        marks.append(('chap', m.start(), m.end(), m.group(1), clean(m.group(2))))
    for m in re.finditer(r'(?mi)^\s*CHAPTER\s+(' + ROMAN + r')\s*$', text):
        tail = text[m.end():m.end() + 120].strip().split("\n")
        marks.append(('chap', m.start(), m.end(), m.group(1), clean(tail[0]) if tail else ''))
    for m in re.finditer(r'(?m)^\s*(\d{1,2})\.\s+([A-Za-z].*)$', text):
        marks.append(('rule', m.start(), m.end(), m.group(1), m.group(2)))
    marks.sort(key=lambda x: x[1])
    kept = []; last = 0            # a rejected candidate must not truncate its rule
    for mk in marks:
        if mk[0] == 'chap': kept.append(mk)
        else:
            n = int(mk[3])
            if not (last < n <= last + 2): continue
            last = n; kept.append(mk)
    chapters = [{'roman': None, 'title': None, 'rules': []}]
    for i, mk in enumerate(kept):
        end = kept[i + 1][1] if i + 1 < len(kept) else len(text)
        if mk[0] == 'chap':
            chapters.append({'roman': mk[3], 'title': mk[4], 'rules': []})
        else:
            headg, fb = split_head(mk[4], r'[:—–]')      # ":-" ends a rule heading
            if not fb and len(headg) > 80:                # no colon: fall back to the full stop
                headg, fb = split_head(mk[4], r'\.')
            chapters[-1]['rules'].append(
                {'num': mk[3] + '.', 'eid': 'rule_' + mk[3], 'heading': headg,
                 'body': ([fb] if fb else []) + text[mk[2]:end].split("\n"), 'dotted': True})
    return [c for c in chapters if c['rules']]

# The Criminal Manual is a 1977 scan. Its running chapter headings OCR as broken
# small caps and the Forms chapter repeats "CHAPTER XXXIV" on dozens of pages, so
# chapter grouping is not recoverable; the paragraphs are numbered continuously
# through the manual and are emitted flat, each addressable by its own number.
# The opening pattern tolerates the speckle a scan leaves in the left margin
# ("a 16.", ". 18.", "; _ 20.").
OCR_RULE = re.compile(r'(?m)^[^0-9A-Za-z\n]{0,8}(?:[a-zA-Z]{1,3}[^0-9A-Za-z\n]{0,4})?'
                      r'(\d{1,3})[\.,;]\s+(.{4,})$')

def build_ocr_rule(text, cfg):
    bstart = re.search(cfg["body_from"], text)
    if bstart: text = text[bstart.start():]
    text = strip_furniture(text)
    marks = [(m.start(), m.end(), int(m.group(1)), m.group(2)) for m in OCR_RULE.finditer(text)]
    seq = []; last = 0
    for st, en, n, rest in marks:
        if last < n <= last + 4:            # gap tolerance for OCR-missed openers
            seq.append((st, en, n, rest)); last = n
    rules = []
    for i, (st, en, n, rest) in enumerate(seq):
        end = seq[i + 1][0] if i + 1 < len(seq) else len(text)
        headg, fb = split_head(rest, r'[—.:–]')
        if len(headg) > 70 or re.match(r'^[(\d]', headg): headg, fb = '', rest
        rules.append({'num': str(n) + '.', 'eid': 'rule_' + str(n), 'heading': headg,
                      'body': ([fb] if fb else []) + text[en:end].split("\n")})
    return [{'roman': None, 'title': None, 'rules': rules}]

BUILDERS = {"toc-section": build_toc_section, "chapter-rule": build_chapter_rule,
            "dotted-rule": build_dotted_rule, "ocr-rule": build_ocr_rule}

# ------------------------------------------------------------------ output
def build(slug, cfg, text):
    chapters = BUILDERS[cfg["mode"]](text, cfg)
    parts = []; n = 0
    for ci, ch in enumerate(chapters, 1):
        units = ''.join(unit_xml(r['eid'], r['num'], r['heading'], r['body'], r.get('dotted', False))
                        for r in ch['rules'])
        n += len(ch['rules'])
        if not units: continue
        if ch.get('part'):
            h = '<heading>' + esc(ch['part_title']) + '</heading>' if ch.get('part_title') else ''
            parts.append(f'<part eId="part_{ci}"><num>{esc(ch["part"])}</num>{h}{units}</part>')
        elif ch['roman']:
            h = '<heading>' + esc(ch['title']) + '</heading>' if ch['title'] else ''
            parts.append(f'<chapter eId="chp_{ci}"><num>CHAPTER {esc(ch["roman"])}</num>{h}{units}</chapter>')
        else:
            parts.append(units)
    note = (f'Converted from the official source of {cfg["title"]}. '
            + ('The source is a scan; the text was recovered by OCR and carries residual OCR noise. '
               if cfg.get("ocr") else '')
            + 'Chapters, rules/sections and sub-clauses follow the source; fee tables were '
              'flattened to text. Statutory text is left verbatim. Best-effort structural '
              'conversion — verify against the official text before authoritative use.')
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
          <FRBRcountry value="in-gj"/>
          <FRBRnumber value="{cfg.get('number','')}"/>
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
{''.join(parts)}
    </body>
  </act>
</akomaNtoso>
'''
    return xml, n

def main(only=None):
    for slug, cfg in DOCS.items():
        if only and slug != only: continue
        print(slug)
        text = raw_text(cfg, slug)
        xml, n = build(slug, cfg, text)
        M.parseString(xml)
        (OUT / f"{slug}.akn.xml").write_text(xml)
        print(f"  -> {n} units, {len(xml)} bytes")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
