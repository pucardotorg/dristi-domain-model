#!/usr/bin/env python3
"""
convert_constitution.py — Constitution of India PDF -> Akoma Ntoso <act> XML.

Provenance / one-off pipeline. The Constitution's first AKN was garbled (only
14 articles, with the PDF's left-margin side-notes interleaved into the body).
This re-converts it from the India Code reprint PDF by separating text streams
by font size:

  * body text        ~10pt   -> article bodies
  * marginal notes   ~8pt     -> article headings (they alternate margin by page)
  * Part/Chapter head >=11pt  -> structural containers

It also handles amendment-inserted articles (e.g. 21A), repealed-article gaps
(Articles 379–391 don't exist), bracketed clause markers, and parses clauses by
line boundaries so inline cross-references ("sub-clause (a) of clause (1)")
don't fragment into false clause breaks. Result: 456 articles that validate
against the AKN 3.0 XSD.

Reads:   public/data/acts/sources/constitution-of-india.pdf
Writes:  public/data/acts/akn/constitution-of-india.akn.xml

Requirements:  pip install pdfplumber
Best-effort: a few lettered articles and deep clause nesting are approximate.
Verify against the official source before relying on exact text.
"""
import pdfplumber, re, html
import xml.dom.minidom as M

import sys as _sys
from pathlib import Path as _Path
_sys.path.insert(0, str(_Path(__file__).resolve().parent))
from akn_ids import assert_unique_eids
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DATA = REPO / "public" / "data"
PDF_PATH = DATA / "acts" / "sources" / "constitution-of-india.pdf"
OUT_PATH = DATA / "acts" / "akn" / "constitution-of-india.akn.xml"

FALLBACK_META = '''<meta>
      <identification source="#pucar">
        <FRBRWork>
          <FRBRthis value="/akn/in/constitution/1950/!main"/>
          <FRBRuri value="/akn/in/constitution/1950"/>
          <FRBRalias value="The Constitution of India" name="shortTitle"/>
          <FRBRdate date="1949-11-26" name="enactment"/>
          <FRBRauthor href="#in-parliament"/>
          <FRBRcountry value="in"/>
          <FRBRnumber value=""/>
          <FRBRname value="The Constitution of India"/>
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="/akn/in/constitution/1950/eng@/!main"/>
          <FRBRuri value="/akn/in/constitution/1950/eng@"/>
          <FRBRdate date="1949-11-26" name="consolidation"/>
          <FRBRauthor href="#pucar"/>
          <FRBRlanguage language="eng"/>
        </FRBRExpression>
        <FRBRManifestation>
          <FRBRthis value="/akn/in/constitution/1950/eng@/!main.xml"/>
          <FRBRuri value="/akn/in/constitution/1950/eng@.akn"/>
          <FRBRdate date="1949-11-26" name="generation"/>
          <FRBRauthor href="#pucar"/>
          <FRBRformat value="application/akn+xml"/>
        </FRBRManifestation>
      </identification>
      <references source="#pucar">
        <TLCOrganization eId="pucar" href="https://pucar.org" showAs="PUCAR"/>
        <TLCOrganization eId="in-parliament" href="/ontology/organization/in/parliament" showAs="Parliament of India"/>
      </references>
    </meta>'''


def group_lines(words, ytol=2.5):
    lines = []
    for w in sorted(words, key=lambda z: (z['top'], z['x0'])):
        for ln in lines:
            if abs(ln['top'] - w['top']) <= ytol:
                ln['words'].append(w); ln['top'] = min(ln['top'], w['top']); break
        else:
            lines.append({'top': w['top'], 'words': [w]})
    for ln in lines:
        ln['words'].sort(key=lambda z: z['x0']); ln['text'] = " ".join(x['text'] for x in ln['words'])
    return sorted(lines, key=lambda l: l['top'])


pages = []
with pdfplumber.open(PDF_PATH) as pdf:
    for pi, pg in enumerate(pdf.pages):
        ws = pg.extract_words(extra_attrs=['size'])
        body = [w for w in ws if 9.3 <= w['size'] < 11 and w['top'] > 58]
        hdr = [w for w in ws if w['size'] >= 11 and w['top'] > 58]
        small = [w for w in ws if 6.5 <= w['size'] < 9.3 and w['top'] > 58]
        if not body and not hdr: continue
        bmax = max((w['top'] for w in body), default=0)
        notes = [w for w in small if w['top'] <= bmax + 22]
        blines = group_lines(body); hlines = group_lines(hdr); nlines = group_lines(notes)
        nblocks = []
        for nl in nlines:
            if nblocks and nl['top'] - nblocks[-1]['botp'] < 16:
                nblocks[-1]['text'] += " " + nl['text']; nblocks[-1]['botp'] = nl['top']
            else:
                nblocks.append({'top': nl['top'], 'botp': nl['top'], 'text': nl['text']})
        stream = [('H', hl['top'], hl['text']) for hl in hlines] + [('B', bl['top'], bl['text']) for bl in blines]
        stream.sort(key=lambda t: t[1]); pages.append((pi, stream, nblocks))


def keyof(num):
    m = re.match(r'(\d+)([A-Z]*)', num); return (int(m.group(1)), m.group(2))
ART = re.compile(r'(?:(?:^|(?<=[\.\]\)”"])\s)\*?\[?|(?<=\s)\*?\[)(\d+[A-Z]{0,3})\.\s')

articles = []; headers = []; cur = None; lastkey = (0, "")
for pi, stream, nblocks in pages:
    used = set()
    def match_note(top):
        best = None; bd = 999
        for j, nb in enumerate(nblocks):
            if j in used: continue
            d = abs(nb['top'] - top)
            if d < bd: bd = d; best = j
        if best is not None and bd < 30:
            used.add(best); return nblocks[best]['text']
        return ""
    for it in stream:
        if it[0] == 'H': headers.append((len(articles), it[2])); continue
        top = it[1]; text = it[2]
        segs = []
        for m in ART.finditer(text):
            k = keyof(m.group(1))
            if k > lastkey and (k[0] - lastkey[0]) <= 20:
                segs.append((m.start(), m.end(), m.group(1))); lastkey = k
        if not segs:
            if cur is not None: cur['body'].append(text)
            continue
        if segs[0][0] > 0 and cur is not None:
            pre = text[:segs[0][0]].strip()
            if pre: cur['body'].append(pre)
        for i, (s, e, num) in enumerate(segs):
            if cur: articles.append(cur)
            endpos = segs[i + 1][0] if i + 1 < len(segs) else len(text)
            btxt = text[e:endpos].strip()
            cur = {'num': num, 'heading': match_note(top), 'body': [btxt] if btxt else []}
if cur: articles.append(cur)


# ---------- clause parsing (schema-valid: nested blockList INSIDE item) ----------
def esc(s): return html.escape(s, quote=False)
def clean(s): return re.sub(r'\s+', ' ', s).strip()
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
        elif re.match(r'^(Provided|Explanation|Illustration)', line, re.I):
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

def art_xml(a):
    eid = 'art_' + a['num']
    head = '<heading>' + esc(clean(a['heading'])) + '</heading>' if a['heading'] else ''
    return '<article eId="' + eid + '"><num>' + a['num'] + '.</num>' + head + parse_content(a['body'], eid) + '</article>'

# ---------- parts/chapters: nest articles inside them ----------
containers = []; i = 0; H = headers
while i < len(H):
    anchor, txt = H[i]; t = txt.strip()
    if re.match(r'^(PART|CHAPTER)\b', t, re.I):
        kind = 'part' if t.upper().startswith('PART') else 'chapter'
        num = t; heading = ''; j = i + 1
        while j < len(H) and H[j][0] == anchor and not re.match(r'^(PART|CHAPTER)\b', H[j][1], re.I) \
                and H[j][1].strip().upper() != 'THE CONSTITUTION OF INDIA':
            heading = (heading + ' ' + H[j][1]).strip(); j += 1
        containers.append((anchor, kind, num, heading)); i = j
    else:
        i += 1
cont_by_anchor = {}
for anchor, kind, num, heading in containers:
    cont_by_anchor.setdefault(anchor, []).append((kind, num, heading))

body_out = []; pc = 0
open_part = None; open_chap = None
def flush_chap():
    global open_chap
    if open_chap is not None:
        open_part['children'].append(open_chap); open_chap = None
def flush_part():
    global open_part
    flush_chap()
    if open_part is not None:
        body_out.append(open_part); open_part = None
for idx, a in enumerate(articles):
    for kind, num, heading in cont_by_anchor.get(idx, []):
        pc += 1
        if kind == 'part':
            flush_part()
            open_part = {'kind': 'part', 'eid': 'part_' + str(pc), 'num': clean(num), 'heading': clean(heading), 'children': []}
        else:
            flush_chap()
            open_chap = {'kind': 'chapter', 'eid': 'chap_' + str(pc), 'num': clean(num), 'heading': clean(heading), 'children': []}
    target = open_chap if open_chap is not None else open_part
    if target is not None: target['children'].append({'kind': 'article', 'a': a})
    else: body_out.append({'kind': 'article', 'a': a})
flush_part()

def render_node(n):
    if n['kind'] == 'article': return art_xml(n['a'])
    head = '<heading>' + esc(n['heading']) + '</heading>' if n['heading'] else ''
    kids = ''.join(render_node(c) for c in n['children'])
    if not kids: return ''   # skip empty containers (schema-invalid)
    return '<' + n['kind'] + ' eId="' + n['eid'] + '"><num>' + esc(n['num']) + '</num>' + head + kids + '</' + n['kind'] + '>'

meta = FALLBACK_META
if OUT_PATH.exists():
    mm = re.search(r'<meta>.*?</meta>', OUT_PATH.read_text(), re.S)
    if mm: meta = mm.group(0)

xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
       '<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">\n'
       '  <act name="act" contains="originalVersion">\n    ' + meta + '\n'
       '    <preface><longTitle><p>THE CONSTITUTION OF INDIA</p></longTitle></preface>\n'
       '    <body>\n'
       + ''.join(render_node(n) for n in body_out) +
       '\n    </body>\n  </act>\n</akomaNtoso>\n')
assert_unique_eids(xml, OUT_PATH.name)
OUT_PATH.write_text(xml)

M.parseString(xml)   # raises if not well-formed
print("well-formed: YES; bytes:", len(xml),
      "articles:", xml.count('<article '),
      "parts/chapters:", xml.count('<part ') + xml.count('<chapter '))
print("wrote", OUT_PATH.relative_to(REPO))
