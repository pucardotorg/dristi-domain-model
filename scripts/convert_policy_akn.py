#!/usr/bin/env python3
"""Policy markdown -> Akoma Ntoso <doc>.

Akoma Ntoso has no <policy> element. Its named document types are act, bill,
judgment, debate, debateReport, amendment, amendmentList, officialGazette,
documentCollection, statement and portion - and <doc>, which the standard provides
expressly for "any other document that is not included in the list of documents
explicitly managed by Akoma Ntoso". That is this. <doc> takes @name to say which
kind, so a draft set of regulations is <doc name="regulations">.

<doc> is openStructure, so its container is <mainBody> rather than <body>. That is
the only structural difference that matters: maincontent admits hierElements, so a
<doc> carries <chapter> and <section> exactly as an <act> does, and every reader
already written against the act shape walks it unchanged.

Choosing <doc> over <act> is not a hedge about status. Status is metadata - this
draft commences only on a notification under regulation 1(2), which policy.json
records - and <act> would be the right element the day it is notified, because
Akoma Ntoso treats subordinate legislation as a hierarchical legislative document
like any other. It is <doc> today because a draft circulated for comment is not yet
subordinate legislation, and @name carries what it actually is.

SOURCE. The markdown, not the PDF. It was transcribed from the PDF and checked
against it character for character, so it is the verified text; converting from it
keeps one provenance chain rather than opening a second.

eIds. The compliance records already cite reg_43_3 and the app already resolves
that. The eIds here are those strings exactly - reg_43, reg_43_3, reg_43_3_a - so a
citation resolves against the XML with no mapping layer in between. Canonical AKN
style would be reg_43__subsec_3__para_a; this corpus has never used that form (the
Acts carry sec_138, art_71__l1) and one grammar the whole corpus shares is worth
more here than the canonical spelling of an identifier.

Run:  python3 scripts/convert_policy_akn.py
"""
import json, os, re, sys, unicodedata
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from akn_ids import assert_unique_eids

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "public", "data")
AKN_NS = "http://docs.oasis-open.org/legaldocml/ns/akn/3.0"

# depth -> the hierarchical element that carries a clause at that depth. All are type
# "hierarchy", so each holds either <content> or nested hierarchy, never both loose.
LEVEL = ["subsection", "paragraph", "subparagraph", "clause", "point", "indent"]
ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii"]


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def kind(m):
    return "num" if m.isdigit() else "alpha"


def next_letter(a):
    return a[:-1] + chr(ord(a[-1]) + 1)


def follows(m, prev):
    """Does marker m continue the sequence prev is at? Mirrors the app's parser."""
    if not prev or kind(m) != kind(prev):
        return False
    if kind(m) == "num":
        return int(m) == int(prev) + 1
    if len(m) == len(prev) + 1 and m.startswith(prev):     # z -> za
        return True
    if len(m) == len(prev) <= 2 and m == next_letter(prev):
        return True
    # an amendment inserts (na) after (n); (o) still follows (n), it just does not follow (na)
    if len(prev) == 2 and len(m) == 1 and m == next_letter(prev[0]):
        return True
    i = ROMAN.index(m) if m in ROMAN else -1
    return i > 0 and ROMAN[i - 1] == prev


class Node:
    """One clause. `kids` are the clauses under it, `ps` the paragraphs at its own level."""
    def __init__(self, mark, eid, depth):
        self.mark, self.eid, self.depth = mark, eid, depth
        self.ps, self.kids = [], []


def parse(md):
    """-> (preface_paras, [ {chapter, regs:[ {num, heading, intro[], nodes[]} ] } ])"""
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S)
    parts, cur_part, reg = [], None, None
    stack = []                       # open Nodes, outermost first
    marks = []                       # the marker at each open level
    preface = []

    for raw in md.split("\n"):
        line = raw.strip()
        if not line or line.startswith(">") or line.startswith("# "):
            continue                 # blank, our own editorial note, the title
        if line.startswith("## "):
            cur_part = {"label": line[3:].strip(), "regs": []}
            parts.append(cur_part)
            reg, stack, marks = None, [], []
            continue
        if line.startswith("### "):
            body = line[4:].strip()
            m = re.match(r"^(\d+)\.\s*(.*)$", body)
            reg = {"num": m.group(1) if m else None,
                   "heading": (m.group(2) if m else body).strip(),
                   "intro": [], "nodes": []}
            (cur_part or {"regs": []})["regs"].append(reg)
            stack, marks = [], []
            continue
        if reg is None:
            preface.append(line)     # the covering notice, before any regulation
            continue

        mk = re.match(r"^\(([0-9]{1,2}|[a-z]{1,4})\)\s*(.*)$", line)
        if mk and reg["num"]:
            mark, text = mk.group(1), mk.group(2).strip()
            at = next((i for i, x in enumerate(marks) if follows(mark, x)), -1)
            if at >= 0:
                marks = marks[:at] + [mark]
                stack = stack[:at]
            elif kind(mark) == "num" and int(mark) > 1 and not any(kind(x) == "num" for x in marks):
                # regulation 37 opens at (2) with no (1) printed: it is top level anyway
                marks, stack = [mark], []
            else:
                marks = marks + [mark]
            depth = len(marks) - 1
            eid = "reg_%s_%s" % (reg["num"], "_".join(marks))
            node = Node(mark, eid, depth)
            if text:
                node.ps.append(text)
            if stack:
                stack[-1].kids.append(node)
            else:
                reg["nodes"].append(node)
            stack = stack + [node]
        else:
            # unmarked text: a proviso or a continuation. It belongs to the clause
            # that is open, and to the regulation's intro when none is.
            (stack[-1].ps if stack else reg["intro"]).append(line)

    return preface, parts


def render_node(n, out, ind):
    tag = LEVEL[min(n.depth, len(LEVEL) - 1)]
    pad = "  " * ind
    out.append('%s<%s eId="%s">' % (pad, tag, n.eid))
    out.append("%s  <num>(%s)</num>" % (pad, n.mark))
    if n.kids:
        if n.ps:
            out.append("%s  <intro>" % pad)
            for p in n.ps:
                out.append("%s    <p>%s</p>" % (pad, esc(p)))
            out.append("%s  </intro>" % pad)
        for k in n.kids:
            render_node(k, out, ind + 1)
    else:
        out.append("%s  <content>" % pad)
        for p in (n.ps or [""]):
            out.append("%s    <p>%s</p>" % (pad, esc(p)))
        out.append("%s  </content>" % pad)
    out.append("%s</%s>" % (pad, tag))


def build(doc_meta, preface, parts, today):
    slug = doc_meta["slug"]
    work = "/akn/in/doc/regulations/2026/%s" % slug
    o = []
    a = o.append
    a('<?xml version="1.0" encoding="UTF-8"?>')
    a('<akomaNtoso xmlns="%s">' % AKN_NS)
    a('  <doc name="regulations" contains="originalVersion">')
    a("    <meta>")
    a('      <identification source="#pucar">')
    for frbr, this, uri, dt, who in [
        ("FRBRWork", work + "/!main", work, doc_meta["dated"], "#sci-ai-committee"),
        ("FRBRExpression", work + "/eng@/!main", work + "/eng@", doc_meta["dated"], "#sci-ai-committee"),
        ("FRBRManifestation", work + "/eng@/!main.xml", work + "/eng@.akn", today, "#pucar"),
    ]:
        a("        <%s>" % frbr)
        a('          <FRBRthis value="%s"/>' % this)
        a('          <FRBRuri value="%s"/>' % uri)
        if frbr == "FRBRWork":
            a('          <FRBRalias value="%s" name="shortTitle"/>' % esc(doc_meta["title"]))
        a('          <FRBRdate date="%s" name="generation"/>' % dt)
        a('          <FRBRauthor href="%s"/>' % who)
        if frbr == "FRBRWork":
            a('          <FRBRcountry value="in"/>')
            a('          <FRBRnumber value=""/>')
            a('          <FRBRname value="%s"/>' % esc(doc_meta["title"]))
        if frbr == "FRBRExpression":
            a('          <FRBRlanguage language="eng"/>')
        if frbr == "FRBRManifestation":
            a('          <FRBRformat value="application/akn+xml"/>')
        a("        </%s>" % frbr)
    a("      </identification>")
    # a draft is not an original version in force; say so where a reader will look
    a('      <lifecycle source="#pucar">')
    a('        <eventRef eId="e_publication" date="%s" source="#sci-ai-committee" type="generation"/>'
      % doc_meta["dated"])
    a("      </lifecycle>")
    a('      <references source="#pucar">')
    a('        <TLCOrganization eId="pucar" href="https://pucar.org" showAs="PUCAR"/>')
    a('        <TLCOrganization eId="sci-ai-committee" href="/ontology/organization/in/supreme-court-ai-committee"'
      ' showAs="Artificial Intelligence Committee, Supreme Court of India"/>')
    a("      </references>")
    a('      <notes source="#pucar">')
    a('        <note eId="note_status"><p>%s</p></note>' % esc(doc_meta["status_note"]))
    a('        <note eId="note_source"><p>Converted from the transcription of the official PDF '
      'published on %s, which is kept alongside at %s. The transcription was checked character for '
      'character against the source text. Akoma Ntoso has no policy document type; &lt;doc&gt; is the '
      'element the standard provides for a document type it does not name, and @name records what it '
      'is. It would be &lt;act&gt; once notified into force.</p></note>'
      % (doc_meta["dated"], esc(doc_meta["source_pdf"])))
    a("      </notes>")
    a("    </meta>")
    if preface:
        a("    <preface>")
        for i, p in enumerate(preface, 1):
            a('      <p eId="pref_p%d">%s</p>' % (i, esc(p)))
        a("    </preface>")
    a("    <mainBody>")
    chap = 0
    for part in parts:
        if not part["regs"]:
            continue
        chap += 1
        label = part["label"]
        m = re.match(r"^(Chapter\s+[IVXL]+)\s*[-–]\s*(.*)$", label, re.I)
        num, head = (m.group(1), m.group(2)) if m else (label, "")
        a('      <chapter eId="chp_%d">' % chap)
        a("        <num>%s</num>" % esc(num))
        if head:
            a("        <heading>%s</heading>" % esc(head))
        for r in part["regs"]:
            eid = "reg_%s" % r["num"] if r["num"] else "reg_x%d" % chap
            a('        <section eId="%s">' % eid)
            a("          <num>%s.</num>" % (r["num"] or ""))
            if r["heading"]:
                a("          <heading>%s</heading>" % esc(r["heading"]))
            if r["nodes"]:
                if r["intro"]:
                    a("          <intro>")
                    for p in r["intro"]:
                        a("            <p>%s</p>" % esc(p))
                    a("          </intro>")
                for n in r["nodes"]:
                    render_node(n, o, 5)
            else:
                a("          <content>")
                for p in (r["intro"] or [""]):
                    a("            <p>%s</p>" % esc(p))
                a("          </content>")
            a("        </section>")
        a("      </chapter>")
    a("    </mainBody>")
    a("  </doc>")
    a("</akomaNtoso>")
    return "\n".join(o) + "\n"


def main():
    man = json.load(open(os.path.join(DATA, "policy", "policy.json"), encoding="utf-8"))
    today = date.today().isoformat()
    for d in man["documents"]:
        md_path = os.path.join(DATA, *d["md"].split("/"))
        md = open(md_path, encoding="utf-8").read()
        preface, parts = parse(md)
        slug = os.path.basename(md_path)[:-3]
        meta = dict(slug=slug, title=d["title"], dated=d["dated"],
                    status_note=d.get("status_note", ""), source_pdf=d["source_pdf"])
        xml = build(meta, preface, parts, today)
        assert_unique_eids(xml, slug)
        out_dir = os.path.join(DATA, "policy", "akn")
        os.makedirs(out_dir, exist_ok=True)
        out = os.path.join(out_dir, slug + ".akn.xml")
        open(out, "w", encoding="utf-8").write(xml)
        nreg = sum(len(p["regs"]) for p in parts)
        nclause = len(re.findall(r'eId="reg_\d+_', xml))
        print("%s\n   %d chapters, %d regulations, %d clause eIds, %d preface paragraphs"
              % (os.path.relpath(out, ROOT), len([p for p in parts if p["regs"]]),
                 nreg, nclause, len(preface)))


if __name__ == "__main__":
    main()
