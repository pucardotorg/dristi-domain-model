#!/usr/bin/env python3
"""Convert a state Act whose PDF uses the 'marginal heading' layout (section
heading in the left margin, number and body in the right column) into Akoma Ntoso.

The India Code A-format converter (convert_indiacode_act.py) cannot read this
layout. Here we use the raw (reflowed) pdftotext, where the text appears as:

    <heading line(s)>
    <N>.
    (1)
    <body> ...

Sections start at the section number; the heading is the short preceding line(s);
the body runs to the next section. Best-effort headings (marginal notes reflow
imperfectly), clean bodies.

IMPORTANT - the standalone `N.` line is not the only shape a section start takes.
Where the marginal note is short enough to sit on a single line, pdftotext reflows
the number onto the first line of the body instead:

    Method of proving orders
    and notifications.
    85. Any order or notification published or issued by ...

Matching only the standalone form makes such a section invisible, and because the
body of a section runs to the *next* recognised start, every missed boundary is
silently swallowed by the section before it - one oversized section carrying
several unrelated ones inside its <content>. So we accept the inline form too,
guarded by monotonicity (the number must be the next one expected, or within a
short reach of it) to keep body prose like "1973. The Code ..." from splitting a
section in half.

IMPORTANT - state gazette PDFs are often BUNDLES: the principal Act followed by
the gazette pages of one or more later Amendment Acts. Each amendment Act restarts
at section 1, so without a stop point this parser reads them as further sections of
the principal Act - producing phantom provisions and duplicate eIds, which is
schema-INVALID (Akoma Ntoso requires @eId to be unique document-wide) even though
`xmllint --noout` passes. Use --cut-before/--cut-after to end the input at the
principal Act; the uniqueness guard fails the build if a duplicate survives.

Usage:

    python3 scripts/convert_marginal_act.py --pdf <in.pdf> --out <out.akn.xml> \
        --title "..." --number N --year Y --date YYYY-MM-DD \
        [--cut-before REGEX] [--cut-after REGEX]
"""
import re, sys, argparse, subprocess, html
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from akn_ids import assert_unique_eids

def esc(t): return html.escape(t, quote=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--title", required=True); ap.add_argument("--number", type=int, required=True)
    ap.add_argument("--year", type=int, required=True); ap.add_argument("--date", required=True)
    ap.add_argument("--longtitle", default="")
    ap.add_argument("--cut-before", default="",
                    help="drop everything from the first line matching this regex onward "
                         "(use it to cut appended Amendment Act gazettes)")
    ap.add_argument("--cut-after", default="",
                    help="drop everything after the first line matching this regex")
    a = ap.parse_args()

    raw = subprocess.check_output(["pdftotext", str(a.pdf), "-"]).decode("utf-8", "replace")
    lines = [l.rstrip() for l in raw.split("\n")]

    # end the input at the principal Act, before any appended amendment gazettes
    if a.cut_before:
        rx = re.compile(a.cut_before)
        for i, l in enumerate(lines):
            if rx.search(l.strip()):
                print(f"  cut-before matched at line {i + 1}: {l.strip()[:60]!r}")
                lines = lines[:i]
                break
        else:
            sys.exit(f"ERROR: --cut-before {a.cut_before!r} matched nothing.")
    if a.cut_after:
        rx = re.compile(a.cut_after)
        for i, l in enumerate(lines):
            if rx.search(l.strip()):
                print(f"  cut-after matched at line {i + 1}: {l.strip()[:60]!r}")
                lines = lines[:i + 1]
                break
        else:
            sys.exit(f"ERROR: --cut-after {a.cut_after!r} matched nothing.")

    # drop page furniture
    JUNK = re.compile(r'^(HARYANA ACT|THE HARYANA|\s*\d+\s*$|Page \d+|PART|GOVERNMENT OF|EXTRAORDINARY|PUBLISHED BY)', re.I)
    clean = [l for l in lines if not JUNK.match(l.strip())]

    NUM = re.compile(r'^(\d+[A-Z]?)\.$')                 # a standalone "N." line = section start
    # ... and the reflowed variant, where the number keeps the first body line
    # company: "85. Any order or notification published or issued by ..."
    NUM_INLINE = re.compile(r'^(\d+[A-Z]?)\.\s+(\S.*)$')
    MARK = re.compile(r'^\(([0-9]+|[a-z]{1,3}|[ivxlc]+)\)')  # (1) (a) (iv) clause markers
    CHAP = re.compile(r'^Chapter\s+([IVXLC]+)\s*$', re.I)
    REACH = 3      # how far ahead of the last section number an inline start may jump

    # locate section starts, keeping any body text that shares the number's line
    starts, last = [], 0     # [(line index, "N", residual body text)]
    for i, l in enumerate(clean):
        s = l.strip()
        m = NUM.match(s)
        if m:
            starts.append((i, m.group(1), ""))
            last = int(re.match(r'\d+', m.group(1)).group(0))
            continue
        m = NUM_INLINE.match(s)
        if not m:
            continue
        # only a monotonic, near-in-sequence number opens a section inline; a stray
        # "1973. ..." mid-body must not
        n = int(re.match(r'\d+', m.group(1)).group(0))
        if last < n <= last + REACH:
            starts.append((i, m.group(1), m.group(2).strip()))
            last = n
    starts.append((len(clean), "", ""))
    start_at = {i for i, _, _ in starts}

    sections = []
    chap_at = {}   # section-index -> (roman, heading) if a chapter opened just before it
    for k in range(len(starts) - 1):
        i, num, residual = starts[k]
        j = starts[k + 1][0]
        # heading: the short, non-clause, non-body lines just above the number
        head = []
        p = i - 1
        while p >= 0 and len(head) < 4:
            s = clean[p].strip()
            if not s: p -= 1; continue
            if MARK.match(s) or p in start_at: break
            # marginal headings are short Title-Case notes; a body-continuation line
            # starts lowercase / ends with ,; / is a long sentence - stop there
            if s[:1].islower() or s.startswith('"') or s.endswith((';', ',')) or len(s.split()) > 7: break
            cm = CHAP.match(s)
            if cm: break
            head.insert(0, s); p -= 1
        heading = re.sub(r'\s+', ' ', " ".join(head)).strip(' .')
        # chapter opening between previous section body and this heading
        for q in range(p, i):
            cm = CHAP.match(clean[q].strip())
            if cm:
                title_lines = [clean[t].strip() for t in range(q + 1, i) if clean[t].strip()
                               and t not in start_at and clean[t].strip() not in head]
                chap_at[len(sections)] = (cm.group(1), (title_lines[0] if title_lines else ""))
        # body: the text sharing the number's line, then on to the next section,
        # split on clause markers
        body, buf = [], []
        def flush():
            if buf:
                t = re.sub(r'\s+', ' ', " ".join(buf)).strip()
                if t: body.append(t)
            buf.clear()
        for l in ([residual] if residual else []) + clean[i + 1:j]:
            s = l.strip()
            if not s: continue
            if s in head: continue
            if MARK.match(s): flush(); buf.append(s)
            else: buf.append(s)
        flush()
        sections.append((num, heading, body))

    if not sections:
        sys.exit("ERROR: no sections parsed.")

    # assemble
    out_parts = []
    open_chap = False
    for idx, (num, heading, body) in enumerate(sections):
        if idx in chap_at:
            if open_chap: out_parts.append("</chapter>")
            rn, ct = chap_at[idx]
            out_parts.append(f'<chapter eId="chp_{rn}"><num>Chapter {rn}</num><heading>{esc(ct)}</heading>')
            open_chap = True
        ps = "".join(f"<p>{esc(b)}</p>" for b in body) or "<p/>"
        out_parts.append(f'<section eId="sec_{num}"><num>{num}.</num><heading>{esc(heading)}</heading><content>{ps}</content></section>')
    if open_chap: out_parts.append("</chapter>")
    body_xml = "\n".join(out_parts)

    lt = a.longtitle or a.title
    doc = f'''<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <act name="act" contains="originalVersion">
    <meta>
      <identification source="#pucar">
        <FRBRWork><FRBRthis value="/akn/in-hr/act/{a.year}/{a.number}/!main"/><FRBRuri value="/akn/in-hr/act/{a.year}/{a.number}"/><FRBRalias value="{esc(a.title)}" name="shortTitle"/><FRBRdate date="{a.date}" name="enactment"/><FRBRauthor href="#legislature"/><FRBRcountry value="in-hr"/><FRBRnumber value="{a.number}"/><FRBRname value="{esc(a.title)}"/></FRBRWork>
        <FRBRExpression><FRBRthis value="/akn/in-hr/act/{a.year}/{a.number}/eng@/!main"/><FRBRuri value="/akn/in-hr/act/{a.year}/{a.number}/eng@"/><FRBRdate date="{a.date}" name="enactment"/><FRBRauthor href="#legislature"/><FRBRlanguage language="eng"/></FRBRExpression>
        <FRBRManifestation><FRBRthis value="/akn/in-hr/act/{a.year}/{a.number}/eng@/!main.xml"/><FRBRuri value="/akn/in-hr/act/{a.year}/{a.number}/eng@.akn"/><FRBRdate date="{a.date}" name="generation"/><FRBRauthor href="#pucar"/></FRBRManifestation>
      </identification>
    </meta>
    <preface><longTitle><p>{esc(lt)}</p></longTitle></preface>
    <body>
{body_xml}
    </body>
  </act>
</akomaNtoso>
'''
    assert_unique_eids(doc, Path(a.out).name)
    Path(a.out).write_text(doc, encoding="utf-8")
    print(f"wrote {a.out}: {len(sections)} sections")

if __name__ == "__main__":
    main()
