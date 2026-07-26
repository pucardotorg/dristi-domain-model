#!/usr/bin/env python3
"""
convert_hr_rules.py - Haryana / Punjab and Haryana state-layer instruments -> Akoma Ntoso <act>.

The Kerala converter (scripts/convert_rules.py) is hard-wired to the Kerala paths and
document set, so the Haryana layer gets its own. Two parse modes:

  vol3          The Rules and Orders of the Punjab and Haryana High Court, Volume III
                ("Instructions to Criminal Courts"). Published as ~100 separate
                chapter/part PDFs with a MARGINAL-NOTE layout: the paragraph heading
                sits in a narrow side column (sometimes left, sometimes right) beside
                the body. Columns are separated geometrically with pdfplumber word
                x-spans, the side notes become <heading>s, and the numbered paragraphs
                become <section eId="rule_<chap>-<part>.<n>">.

  flat-rule     Continuous "N. Heading" / "N.N sub-rule" rules, optionally grouped under
                "Chapter <roman>" headings, in one digital-text PDF (the Electronic
                Filing Rules and the Video Conferencing Rules).

Writes:  public/data/state/haryana/akn/<slug>.akn.xml

Statutory text is kept VERBATIM, em-dashes and archaic spelling included.

Usage:
    python3 scripts/convert_hr_rules.py                    # convert everything
    python3 scripts/convert_hr_rules.py <slug>             # one document
    python3 scripts/convert_hr_rules.py --fetch-vol3 <dir> # (re)download the Vol III parts

Requirements: pip install pdfplumber
Validate:     python3 scripts/validate_akn.py public/data/state/haryana/akn/*.akn.xml
"""
import pdfplumber, re, html, datetime, sys, tempfile, subprocess
from collections import Counter
from pathlib import Path
import xml.dom.minidom as M

sys.path.insert(0, str(Path(__file__).resolve().parent))
from akn_ids import assert_unique_eids

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "public" / "data" / "state" / "haryana" / "sources"
OUT = REPO / "public" / "data" / "state" / "haryana" / "akn"
# The ~100 Volume III part PDFs are working input, not corpus artefacts: only the
# stitched sources/punjab-haryana-hc-rules-orders-vol-iii.pdf is kept in the repo.
VOL3_PARTS = Path(tempfile.gettempdir()) / "dristi-hr-vol-iii-parts"
GEN_DATE = datetime.date.today().isoformat()
OUT.mkdir(parents=True, exist_ok=True)

VOL3_BASE = ("https://highcourtchd.gov.in/sub_pages/left_menu/Rules_orders/"
             "high_court_rules/vol-III-pdf")

# The Volume III part files, in publication order. Chapter/part identity is taken from
# the file name: chap<N>[part<L>[<i>]].pdf -> chapter N, part L, sub-part i.
VOL3_FILES = (
    ["chap1partA.pdf", "chap1partB.pdf", "chap1partBBV3.pdf",
     "chap1partC1.pdf", "chap1partC2.pdf"]
    + [f"chap1part{p}.pdf" for p in "DEFGH"]
    + ["chap2.pdf", "chap3.pdf", "chap4.pdf"]
    + [f"chap5part{p}.pdf" for p in "ABCDE"]
    + [f"chap6part{p}.pdf" for p in "ABC"]
    + [f"chap7part{p}.pdf" for p in "AB"]
    + [f"chap8part{p}.pdf" for p in "AB"]
    + [f"chap9part{p}.pdf" for p in "ABCD"]
    + ["chap10.pdf"]
    + [f"chap11part{p}.pdf" for p in "ABCDEFGH"]
    + ["chap12.pdf", "chap13.pdf", "chap14.pdf"]
    + [f"chap15part{p}.pdf" for p in "AB"]
    + [f"chap16part{p}.pdf" for p in "ABCD"]
    + [f"chap17part{p}.pdf" for p in "ABCD"]
    + [f"chap18part{p}.pdf" for p in "ABCD"]
    + [f"chap19part{p}.pdf" for p in "ABCDE"]
    + [f"chap20part{p}.pdf" for p in "ABCDEF"]
    + ["chap21.pdf"]
    + [f"chap22part{p}.pdf" for p in "ABCD"]
    + [f"chap23part{p}.pdf" for p in "ABCDEF"]
    + [f"chap24part{p}.pdf" for p in "ABC"]
    + [f"chap25part{p}.pdf" for p in "ABCDEFGH"]
    + [f"chap26part{p}.pdf" for p in "AB"]
    + ["chap27.pdf"]
    + [f"chap28part{p}.pdf" for p in "ABCD"]
    + [f"chap29part{p}.pdf" for p in "AB"]
    + [f"chap30part{p}.pdf" for p in "ABC"]
    + ["chap31.pdf"]
)

DOCS = {
    "punjab-haryana-hc-rules-orders-vol-iii": {
        "title": "Rules and Orders of the Punjab and Haryana High Court, Volume III "
                 "(Instructions to Criminal Courts)",
        "work": "/akn/in-hr/act/1900/hc-rules-orders-vol-iii",
        "date": "2018-07-01", "mode": "vol3", "eid": "rule",
        "author": "phhc", "author_show": "High Court of Punjab and Haryana at Chandigarh",
    },
    "punjab-haryana-hc-electronic-filing-rules": {
        "title": "The Electronic Filing (E-Filing) Rules, High Court of Punjab and Haryana",
        "work": "/akn/in-hr/act/2023/hc-electronic-filing-rules",
        "date": "2023-02-24", "mode": "flat-rule", "eid": "rule",
        "author": "phhc", "author_show": "High Court of Punjab and Haryana at Chandigarh",
        "cut_before": r"1\.\s*\n?\s*Nomenclature",
        "cut_after": r"\nAppendices\s*\n",
    },
    "punjab-haryana-hc-video-conferencing-rules": {
        "title": "Rules for Video Conferencing for Courts, High Court of Punjab and Haryana",
        "work": "/akn/in-hr/act/2021/hc-video-conferencing-rules",
        "date": "2021-12-10", "mode": "flat-rule", "eid": "rule",
        "author": "phhc", "author_show": "High Court of Punjab and Haryana at Chandigarh",
        "cut_before": r"Chapter\s+I\s*[\u2013\-\u2014]\s*Preliminary",
    },
}


def esc(s):
    return html.escape(s, quote=False)


def clean(s):
    return re.sub(r"\s+", " ", s).strip()


# ------------------------------------------------------------------ clause parsing
def rankof(mark):
    inner = mark.strip("()")
    if re.fullmatch(r"\d+[A-Z]?", inner):
        return 0
    if inner == "i":
        return 2
    if len(inner) >= 2 and re.fullmatch(r"[ivxlcdm]+", inner):
        return 2
    return 1


MK = re.compile(r"^[\*\[]{0,2}\((\d+[A-Z]?|[A-Za-z]{1,4})\)\s+(.*)$")


def parse_content(body_list, eid):
    lines = [clean(l) for l in body_list if clean(l)]
    nodes = []
    for line in lines:
        m = MK.match(line)
        if m:
            mark = "(" + m.group(1) + ")"
            nodes.append({"t": "item", "mark": mark, "d": rankof(mark),
                          "text": clean(m.group(2)), "children": []})
        elif re.match(r"^(Provided|Explanation|Illustration|Note|TABLE|NOTE)", line):
            nodes.append({"t": "p", "text": line})
        elif nodes:
            nodes[-1]["text"] += " " + line
        else:
            nodes.append({"t": "p", "text": line})
    root, stack = [], []
    for n in nodes:
        if n["t"] == "p":
            stack = []
            root.append(n)
        else:
            d = n["d"]
            while stack and stack[-1]["d"] >= d:
                stack.pop()
            (stack[-1]["children"] if stack else root).append(n)
            stack.append(n)
    ctr = [0]

    def ser(entries):
        out, i = [], 0
        while i < len(entries):
            e = entries[i]
            if e["t"] == "p":
                out.append("<p>" + esc(clean(e["text"])) + "</p>")
                i += 1
            else:
                grp = []
                while i < len(entries) and entries[i]["t"] == "item":
                    grp.append(entries[i])
                    i += 1
                ctr[0] += 1
                s = '<blockList eId="' + eid + "__l" + str(ctr[0]) + '">'
                for it in grp:
                    # Claim this item's number BEFORE recursing into its children:
                    # ser() advances the shared counter, so reading ctr[0] after the
                    # recursive call handed the parent the last CHILD's number and
                    # produced duplicate eIds (an Akoma Ntoso schema violation).
                    ctr[0] += 1
                    iid = eid + "__i" + str(ctr[0])
                    inner = "<num>" + esc(it["mark"]) + "</num><p>" + esc(clean(it["text"])) + "</p>"
                    if it["children"]:
                        inner += ser(it["children"])
                    s += '<item eId="' + iid + '">' + inner + "</item>"
                out.append(s + "</blockList>")
        return "".join(out)

    inner = ser(root) or "<p></p>"
    return "<content>" + inner + "</content>"


def unit_xml(eid, num, heading, body_lines):
    head = "<heading>" + esc(clean(heading)) + "</heading>" if clean(heading or "") else ""
    return (f'<section eId="{eid}"><num>{esc(num)}</num>{head}'
            + parse_content(body_lines, eid) + "</section>")


# ------------------------------------------------------------------ Volume III (marginal)
PAGE_HEADER = re.compile(
    r"^\s*(v\s*o\s*[l1i]\b|volume\b|ch\s*p?\s*[\.,\-–—]|ch\s*[\.,]\s*\d)", re.I)
FOOTNOTE = re.compile(
    r"^\s*\[?\d+\]?[\.\)]?\s+.*(correction slip|substituted|inserted\b|added vide|omitted|"
    r"renumbered|vide notification|vide punjab|ins\. by|subs\. by)", re.I)
PART_HEAD = re.compile(
    r"^\s*P\s*A\s*R\s*T\b\s*[\-–—]?\s*([A-H])?\s*(?:\(\s*(i+)\s*\))?\s*[\-–—.,:]*\s*(.*)$", re.I)
CHAP_HEAD = re.compile(
    r"^\s*\d*\s*\[?\s*CHAPTER\s*[\-–—]?\s*(\d+|[IVXL]+)\s*\]?\s*[\.\-–—]?\s*(.*)$", re.I)
PARA_START = re.compile(r"^\s*(?:Rule\s+)?\[?(\d{1,3})\]?\s*[\.\)]\s*[\-–—]?\s*(?![\d\)])(.*)$")
ROMAN_START = re.compile(r"^\s*(I|II|III|IV|V|VI|VII|VIII|IX|X)\s*\.\s+(.*)$")
FRONT_MATTER = re.compile(
    r"^\s*(RULES\s+AND\s+ORDERS|OF|THE\s+PUNJAB(\s+AND\s+HARYANA)?\s+HIGH\s+COURT|"
    r"Volume\s*[\-\.]?\s*I*I*I\.?\s*[\-–—.]*\s*Instructions\s+to\s+Criminal\s+Courts\.?)\s*$", re.I)
# an inline heading that the source printed in the body instead of the margin
INLINE_HEAD = re.compile(r"^([A-Z][A-Za-z' \-,/\(\)\.]{2,70}?)\s*(?::\s*[\-–—]|\.\s*[\-–—]|:)\s+(.+)$")

ROMAN_SUB = {"1": "i", "2": "ii", "3": "iii", "4": "iv"}


def page_columns(pg):
    """Split one page into (body_lines, margin_blocks). Each line is (top, text);
    each margin block is (top, text) with the note's lines already joined."""
    ws = pg.extract_words(use_text_flow=False, keep_blank_chars=False)
    if not ws:
        return [], []
    spans = sorted((w["x0"], w["x1"]) for w in ws)
    merged = []
    for a, b in spans:
        if merged and a <= merged[-1][1] + 9:
            merged[-1][1] = max(merged[-1][1], b)
        else:
            merged.append([a, b])

    def count(r):
        return sum(1 for w in ws if r[0] - 1 <= w["x0"] <= r[1] + 1)

    body_range = None
    if len(merged) >= 2:
        merged.sort(key=count, reverse=True)
        best, others = merged[0], merged[1:]
        if count(best) > 2 * sum(count(o) for o in others):
            body_range = best
    if body_range is None:
        # Some pages typeset the side note so that one word straddles the gutter and
        # the x-spans read as one block. Fall back to a vertical cut: the widest gap
        # in the word-start positions in the right-hand part of the page.
        # The body is justified, so the commonest word right-edge is the body's right
        # margin; anything starting well beyond it is a side note.
        hist = Counter(round(w["x1"] / 5) * 5 for w in ws)
        edge = hist.most_common(1)[0][0]
        if edge < 0.82 * pg.width:
            cut = edge + 15
            right = [w for w in ws if w["x0"] >= cut]
            bands = {round(w["top"] / 8.0) for w in right}
            if 3 <= len(right) <= 0.35 * len(ws) and len(bands) >= 2:
                body_range = [min(w["x0"] for w in ws) - 1, cut - 1]

    def to_lines(words):
        rows = {}
        for w in words:
            rows.setdefault(round(w["top"] / 4.0), []).append(w)
        out = []
        for k in sorted(rows):
            r = sorted(rows[k], key=lambda w: w["x0"])
            out.append((min(w["top"] for w in r), " ".join(w["text"] for w in r)))
        return out

    if body_range is None:
        return to_lines(ws), []
    bset = {id(w) for w in ws if body_range[0] - 1 <= w["x0"] <= body_range[1] + 1}
    body = to_lines([w for w in ws if id(w) in bset])
    mlines = to_lines([w for w in ws if id(w) not in bset])
    # group side-note lines that sit within ~14pt of each other into one note
    blocks = []
    for top, txt in mlines:
        if blocks and top - blocks[-1][2] <= 16:
            blocks[-1][1] += " " + txt
            blocks[-1][2] = top
        else:
            blocks.append([top, txt, top])
    return body, [(b[0], clean(b[1])) for b in blocks]


def part_key(fname):
    m = re.match(r"chap(\d+)(?:part([A-H]{1,2})(\d)?)?(?:V3)?\.pdf$", fname)
    ch, part, sub = m.group(1), m.group(2), m.group(3)
    if not part:
        return ch, f"Chapter {ch}"
    key = ch + "-" + part + (ROMAN_SUB.get(sub, "") if sub else "")
    label = f"Chapter {ch}, Part {part}" + (f"({ROMAN_SUB[sub]})" if sub else "")
    return key, label


def parse_vol3_part(path, key, label):
    """-> (chapter_title, part_title, [ {num, heading, body[]} ])"""
    body, margins = [], []
    with pdfplumber.open(path) as pdf:
        page_h = pdf.pages[0].height
        for pi, pg in enumerate(pdf.pages):
            b, m = page_columns(pg)
            for top, txt in b:
                body.append((pi, top, txt))
            for top, txt in m:
                margins.append((pi, top, txt))

    # drop page furniture and footnote apparatus
    kept = []
    for pi, top, txt in body:
        t = txt.strip()
        if not t:
            continue
        if PAGE_HEADER.match(t) and len(t) < 60:
            continue
        if re.fullmatch(r"[\[\]\(\)\d\s\.\-–—ivxIVX]{1,12}", t):
            continue
        if top > page_h * 0.86 and FOOTNOTE.match(t):
            continue
        if re.match(r"^\s*\[?\d+\]?\s*(Rule|Para|Paragraph)\s+\d+.{0,80}(amended|substituted|inserted|"
                    r"added|omitted).{0,60}Correction Slip", t, re.I):
            continue
        if FRONT_MATTER.match(t):
            continue
        kept.append((pi, top, t))

    # chapter / part titles from the opening lines
    def title_like(s):
        """A wrapped title line: short, not a paragraph start, mostly capitalised."""
        if not s or len(s) > 62 or PARA_START.match(s) or ROMAN_START.match(s):
            return False
        if PART_HEAD.match(s) or CHAP_HEAD.match(s):
            return False
        ws = [w for w in re.findall(r"[A-Za-z][A-Za-z'\-]*", s)]
        if not ws:
            return False
        if len(ws) <= 4 and ws[0][0].isupper():
            return True
        return sum(1 for w in ws if w[0].isupper()) / len(ws) >= 0.4

    chap_title, part_title = "", ""
    lead, i = 0, 0
    while i < min(8, len(kept)):
        t = kept[i][2]
        cm, pm = CHAP_HEAD.match(t), PART_HEAD.match(t)
        if pm:
            part_title = clean(pm.group(3))
            i += 1
            lead = i
            # part titles are printed in capitals and often wrap over 2-3 lines
            while i < len(kept):
                nxt = kept[i][2]
                if (len(nxt) < 62 and nxt == nxt.upper() and not PARA_START.match(nxt)
                        and not ROMAN_START.match(nxt) and re.search(r"[A-Z]", nxt)):
                    part_title = clean(part_title + " " + nxt)
                    i += 1
                    lead = i
                else:
                    break
            # the title ran on but the next line also carries a side note: take only
            # its leading run of capitals
            if (part_title and i < len(kept)
                    and re.search(r"\b(OF|AND|TO|IN|FOR|THE|ON|BY|WITH)$", part_title)):
                m2 = re.match(r"^((?:[A-Z][A-Z'\-,\.]*\s+){0,4}[A-Z][A-Z'\-,\.]*)\b",
                              kept[i][2])
                if m2:
                    part_title = clean(part_title + " " + m2.group(1))
            if not part_title and i < len(kept) and title_like(kept[i][2]):
                part_title = clean(kept[i][2])
                i += 1
                lead = i
            break
        if cm:
            chap_title = clean(cm.group(2))
            i += 1
            lead = i
            while i < len(kept) and not chap_title.endswith("."):
                cur = kept[i][2]
                nxt = kept[i + 1][2] if i + 1 < len(kept) else ""
                if PART_HEAD.match(cur) or CHAP_HEAD.match(cur):
                    break
                runs_on = (cur.endswith(".") and len(cur) < 70 and
                           bool(PART_HEAD.match(nxt) or PARA_START.match(nxt)
                                or ROMAN_START.match(nxt)))
                if chap_title.endswith("-"):
                    chap_title = chap_title[:-1] + cur.split(" ", 1)[0]
                    rest = cur.split(" ", 1)[1] if " " in cur else ""
                    chap_title = clean(chap_title + " " + rest)
                    i += 1
                    lead = i
                    continue
                # a CHAPTER marker with no inline title always has it on the next line
                first_line = (not chap_title and len(cur) < 70
                              and not PARA_START.match(cur) and not ROMAN_START.match(cur))
                if title_like(cur) or runs_on or first_line:
                    chap_title = clean((chap_title + " " + kept[i][2]).strip())
                    i += 1
                    lead = i
                else:
                    break
            continue
        i += 1
    # a bare "THE JUDGMENT"-style banner where there is no CHAPTER/PART line at all
    if not chap_title and not part_title and lead < len(kept):
        t = kept[lead][2]
        if len(t) < 62 and t == t.upper() and re.search(r"[A-Z]", t) and not PARA_START.match(t):
            part_title = clean(t)
            lead += 1
    chap_title = re.sub(r"^Part\b[\s\-–—]*[A-H]?\s*$", "", chap_title, flags=re.I)
    part_title = re.sub(r"^[A-H]\s*[\.\-–—:,]+\s*", "", part_title)
    part_title = re.sub(r"^\(\s*i+\s*\)\s*", "", part_title)
    chap_title = clean(chap_title).strip(" .,-–—")
    part_title = clean(part_title).strip(" .,-–—")

    # paragraph starts, following the monotonic 1,2,3… run
    starts, expect = [], 1
    for i in range(lead, len(kept)):
        t = kept[i][2]
        m = PARA_START.match(t)
        n = None
        if m:
            n = int(m.group(1))
        else:
            rm = ROMAN_START.match(t)
            if rm:
                n = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6,
                     "VII": 7, "VIII": 8, "IX": 9, "X": 10}[rm.group(1)]
        if n is None:
            continue
        if n == expect or (not starts and n in (1, 2)):
            starts.append((i, n))
            expect = n + 1
    units = []
    if starts and starts[0][0] > lead:
        pre = [kept[i][2] for i in range(lead, starts[0][0])]
        if sum(len(x) for x in pre) > 25:
            units.append({"n": "0", "heading": "Introductory", "body": pre,
                          "pi": kept[lead][0], "top": kept[lead][1]})
    bounds = [s[0] for s in starts] + [len(kept)]
    for k, (i, n) in enumerate(starts):
        chunk = [kept[j][2] for j in range(i, bounds[k + 1])]
        m = PARA_START.match(chunk[0]) or ROMAN_START.match(chunk[0])
        chunk[0] = clean(m.group(2))
        units.append({"n": str(n), "heading": "", "body": [c for c in chunk if c],
                      "pi": kept[i][0], "top": kept[i][1]})
    if not starts:
        rest = [kept[i][2] for i in range(lead, len(kept))]
        if rest:
            units.append({"n": "1", "heading": "", "body": rest,
                          "pi": kept[lead][0] if lead < len(kept) else 0, "top": 0})

    # attach each side note to the unit that starts nearest to it on the same page
    for pi, top, note in margins:
        if len(note) < 3 or len(note) > 140:
            continue
        cands = [u for u in units if u["pi"] == pi and abs(u["top"] - top) <= 26]
        if not cands:
            continue
        best = min(cands, key=lambda u: abs(u["top"] - top))
        if best["heading"]:
            continue
        best["heading"] = re.sub(r"\s*\.\s*$", "", note)

    # where the source printed the heading inline ("Closing hour:- …"), lift it out
    for u in units:
        if u["heading"] or not u["body"]:
            continue
        m = INLINE_HEAD.match(u["body"][0])
        if m and len(m.group(1).split()) <= 10 and len(m.group(2)) > 20:
            u["heading"] = clean(m.group(1))
            u["body"][0] = clean(m.group(2))
    return chap_title, part_title, units


def build_vol3(cfg):
    if not VOL3_PARTS.exists():
        sys.exit(f"ERROR: {VOL3_PARTS} missing — run with --fetch-vol3 first.")
    out, n_units = [], 0
    prev_chap = None
    for fname in VOL3_FILES:
        p = VOL3_PARTS / fname
        if not p.exists():
            print(f"  ! missing part {fname}")
            continue
        key, label = part_key(fname)
        chap_title, part_title, units = parse_vol3_part(p, key, label)
        ch_no = key.split("-")[0]
        if chap_title and ch_no != prev_chap:
            prev_chap = ch_no
        head = " — ".join(x for x in (chap_title, part_title) if x)
        body = ""
        for u in units:
            eid = f'rule_{key}.{u["n"]}'
            body += unit_xml(eid, f'{key}.{u["n"]}', u["heading"], u["body"])
            n_units += 1
        if not body:
            continue
        out.append(f'<chapter eId="chp_{key}"><num>{esc(label)}</num>'
                   + (f"<heading>{esc(head)}</heading>" if head else "")
                   + body + "</chapter>")
    return "".join(out), n_units


# ------------------------------------------------------------------ flat modes
def pdf_text(path):
    with pdfplumber.open(path) as pdf:
        return "\n".join(p.extract_text() or "" for p in pdf.pages)


FLAT_RULE = re.compile(r"^\s*(\d{1,3})\.?\s+([A-Z\u201c].{0,130})$")
SUB_RULE = re.compile(r"^\s*(\d{1,3}(?:\.\d{1,3}){1,2})\s+(.*)$")
RULE_JUNK = re.compile(r"^\s*(\d{1,3}|-\s*\d{1,3}\s*-|Vol\.?\s*[\u2013\-\u2014]?\s*V\b.*|"
                       r"Chp\.?\s*[\u2013\-\u2014].*)\s*$", re.I)
FLAT_CHAP = re.compile(r"^\s*Chapter\s+([IVXL]+)\s*[\u2013\-\u2014:.]?\s*(.*)$")


def parse_flat_rule(text):
    """'N Heading' / 'N. Heading' on its own line opens a rule; 'N.M ...' are sub-rules.
    A 'Chapter <roman> - <title>' line opens a chapter. Returns a list of
    {roman, title, rules[]} groups (one anonymous group if the text has no chapters)."""
    lines = [l.rstrip() for l in text.split("\n")]
    groups = [{"roman": "", "title": "", "rules": []}]
    cur, expect = None, 1
    for l in lines:
        s = l.strip()
        if not s or RULE_JUNK.match(s):
            continue
        cm = FLAT_CHAP.match(s)
        if cm and len(s) < 70:
            if cur:
                groups[-1]["rules"].append(cur)
                cur = None
            groups.append({"roman": cm.group(1), "title": clean(cm.group(2)), "rules": []})
            continue
        m = FLAT_RULE.match(s)
        if m and int(m.group(1)) == expect:
            if cur:
                groups[-1]["rules"].append(cur)
            head, rest = clean(m.group(2)), ""
            if ":" in head:
                head, rest = head.split(":", 1)
            head = clean(head).rstrip(":.-\u2013\u2014")
            # a whole sentence is body text, not a heading
            if len(head.split()) > 9 or head.endswith(("\u201d", '"')):
                head, rest = "", clean(m.group(2))
            cur = {"n": m.group(1), "heading": head,
                   "body": [clean(rest)] if clean(rest) else []}
            expect += 1
            continue
        if cur is None:
            continue
        sm = SUB_RULE.match(s)
        if sm:
            cur["body"].append("(" + sm.group(1) + ") " + clean(sm.group(2)))
        else:
            cur["body"].append(s)
    if cur:
        groups[-1]["rules"].append(cur)
    return [g for g in groups if g["rules"]]


def build_flat(cfg, slug):
    text = pdf_text(SRC / f"{slug}.pdf")
    if cfg.get("cut_before"):
        m = re.search(cfg["cut_before"], text)
        if m:
            text = text[m.start():]
    if cfg.get("cut_after"):
        m = re.search(cfg["cut_after"], text)
        if m:
            text = text[:m.start()]
    groups = parse_flat_rule(text)
    prefix, body, n = cfg["eid"], "", 0
    for gi, g in enumerate(groups, 1):
        units = "".join(unit_xml(f'{prefix}_{u["n"]}', u["n"] + ".", u["heading"], u["body"])
                        for u in g["rules"])
        n += len(g["rules"])
        if g["roman"]:
            head = f'<heading>{esc(g["title"])}</heading>' if g["title"] else ""
            body += (f'<chapter eId="chp_{gi}"><num>Chapter {esc(g["roman"])}</num>'
                     + head + units + "</chapter>")
        else:
            body += units
    return body, n


# ------------------------------------------------------------------ assemble
def wrap(cfg, body_xml, note_extra=""):
    note = (f"Converted from the official published text of {cfg['title']}. "
            + note_extra +
            "Chapters, parts, rules and sub-clauses follow the source; tables and forms are "
            "flattened to text. Best-effort structural conversion — verify against the "
            "official text before authoritative use.")
    return f'''<?xml version="1.0" encoding="UTF-8"?>
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
          <FRBRcountry value="in-hr"/>
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


def fetch_vol3(dest):
    dest = Path(dest)
    dest.mkdir(parents=True, exist_ok=True)
    for name in VOL3_FILES:
        p = dest / name
        if p.exists() and p.stat().st_size > 2000:
            continue
        for _ in range(6):
            r = subprocess.run(["curl", "-sS", "-L", "-m", "45", "-A", "Mozilla/5.0",
                                "-o", str(p), f"{VOL3_BASE}/{name}",
                                "-w", "%{http_code} %{size_download}"],
                               capture_output=True, text=True)
            f = r.stdout.split()
            if len(f) == 2 and f[0] == "200" and int(f[1]) > 2000:
                break
        print(f"  fetched {name}")


def main(argv):
    if argv and argv[0] == "--fetch-vol3":
        fetch_vol3(argv[1] if len(argv) > 1 else VOL3_PARTS)
        return
    only = argv[0] if argv else None
    for slug, cfg in DOCS.items():
        if only and slug != only:
            continue
        if cfg["mode"] == "vol3":
            body, n = build_vol3(cfg)
            extra = ("Volume III is published as ~100 separate chapter/part PDFs on the "
                     "High Court website; they are stitched here in publication order. "
                     "The source uses a marginal-note layout, so the side notes are lifted "
                     "into the rule headings. ")
        else:
            body, n = build_flat(cfg, slug)
            extra = ""
        xml = wrap(cfg, body, extra)
        M.parseString(xml)
        assert_unique_eids(xml, slug)
        (OUT / f"{slug}.akn.xml").write_text(xml)
        print(f"  {slug}: {n} units, {len(xml)} bytes")


if __name__ == "__main__":
    main(sys.argv[1:])
