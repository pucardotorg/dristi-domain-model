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
more here than the canonical spelling of an identifier. The stem is the document's
own word for its numbered unit, taken from `unit.prefix` in policy.json, so the AI
regulations number reg_43_3 and the model rules number rule_10_3 - the same grammar
said in each document's own language.

NUMBERING. Documents do not agree on how to mark a clause, and this converter has to
read what is printed rather than impose one shape on all of them. Four marker forms
are recognised, and whichever one the source prints is kept verbatim in <num>:

    (3) (a) (iii)   parenthesised, the form the AI regulations use
    10.3  5.6.1     dotted decimal, the form both eCommittee model rules use. The
                    marker already carries its whole path, so the depth and the
                    parent are read straight off it rather than inferred.
    i)  a)          half-parenthesised, used for the sub-lists in e-filing rule 4.1
    a.  i.          alpha or roman with a trailing stop, used in VC rule 2(xii)

A document may mix them - the VC rules number rule 3 as (i), (ii) and rule 5 as
5.1, 5.2 - so the forms are recognised per line, not per document.

DIVISIONS. A `##` is a division of the document. One that opens "Chapter", "Part" or
"Title" is hierarchical and the units inside it are the document's numbered units, so
they carry the document's unit stem. One that opens "Schedule", "Appendix",
"Annexure", "Form" or "Table" is an annexure: its units are numbered inside it and
nowhere else, so they carry the division's own stem instead (schedule_i_1) and cannot
collide with a rule of the same number. Both are emitted as <chapter> because that is
what this corpus's reader groups on; the <num> carries which it actually is. A
document with no printed division at all - the model e-filing rules print none over
their nineteen rules - gets no <chapter> wrapper, because inventing one would assert
a structure the source does not have.

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
# the roman sequence, long enough for the longest clause list in the corpus. The live
# streaming rules number definitions i. to xviii.; stopping at xii silently misfiled
# every clause past it as a new nesting level instead of a sibling.
ROMAN = ["i","ii","iii","iv","v","vi","vii","viii","ix","x","xi","xii","xiii","xiv","xv",
         "xvi","xvii","xviii","xix","xx","xxi","xxii","xxiii","xxiv","xxv","xxvi","xxvii",
         "xxviii","xxix","xxx"]

# The four clause markers, tried in this order. `dot` must be tried before the others
# because "5.6.1" would otherwise be read as a sentence opening with a number, and the
# parenthesised form must be tried before "a." or it would eat the closing bracket.
# Each captures the marker exactly as printed, because <num> shows what the page shows.
MARKER = re.compile(r"""^(?:
      \( (?P<paren>[0-9]{1,2}|[a-z]{1,4}) \)            # (3) (a) (iii)
    |   (?P<dot>[0-9]{1,3}(?:\.[0-9]{1,3})+)\.?        # 10.3  5.6.1  2.1.
    |   (?P<half>[a-z]{1,4})\)                          # i)  a)
    |   (?P<stop>m{0,3}(?:c[md]|d?c{0,3})(?:x[cl]|l?x{0,3})(?:i[xv]|v?i{0,3})|[a-z]{1,2})\.                 # a.  i.  xviii.
  )\s+(?P<text>.*)$""", re.X)

# A `##` that opens with one of these is an annexure: its units are numbered inside it
# and take its own eId stem, so Schedule I paragraph 1 is schedule_i_1 and never
# collides with rule 1. Anything else is a hierarchical division of the document body.
ANNEX = re.compile(r"^(schedule|appendix|appendices|annex|annexure|form|table)\b", re.I)
HIER = re.compile(r"^(chapter|part|title)\s+([IVXLC]+|[0-9]+)\b", re.I)


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def slug(s):
    """A label to an eId stem: "SCHEDULE I" -> schedule_i, "Appendices" -> appendices."""
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", s.lower())).strip("_") or "part"


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
    def __init__(self, printed, eid, depth):
        self.printed, self.eid, self.depth = printed, eid, depth
        self.ps, self.kids = [], []


def division(label):
    """A `##` label -> (kind, stem). kind is 'hier' or 'annex'; stem is the eId stem
    an annexure's units hang off, and None for a hierarchical division, whose units
    keep the document's own unit stem."""
    if ANNEX.match(label):
        return "annex", slug(label)
    return "hier", None


def parse(md, unit_prefix):
    """-> (preface_paras, [ {label, kind, stem, regs:[ {num, heading, intro[], nodes[]} ] } ])

    `unit_prefix` is the document's word for a numbered unit ("reg", "rule"), so the
    eIds come out in the language the document and its citations already speak."""
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S)
    parts, cur_part, reg = [], None, None
    stack = []                       # open Nodes, outermost first
    marks = []                       # the eId token at each open level
    preface = []

    def open_part(label):
        kind_, stem = division(label)
        p = {"label": label, "kind": kind_, "stem": stem, "regs": []}
        parts.append(p)
        return p

    for raw in md.split("\n"):
        line = raw.strip()
        if not line or line.startswith(">") or line.startswith("# "):
            continue                 # blank, our own editorial note, the title
        if line.startswith("## "):
            cur_part = open_part(line[3:].strip())
            reg, stack, marks = None, [], []
            continue
        if line.startswith("### "):
            body = line[4:].strip()
            m = re.match(r"^(\d+)\.\s*(.*)$", body)
            if cur_part is None:
                # a document that prints no division over its units - the model
                # e-filing rules print none. An unlabelled part carries them, and
                # build() emits no <chapter> for it.
                cur_part = open_part("")
            reg = {"num": m.group(1) if m else None,
                   "heading": (m.group(2) if m else body).strip(),
                   "intro": [], "nodes": []}
            # inside an annexure the unit is numbered within the annexure, so its stem
            # is the annexure's; a unit with no printed number takes its position.
            stem = cur_part["stem"] if cur_part["kind"] == "annex" else unit_prefix
            num = reg["num"] or (str(len(cur_part["regs"]) + 1) if cur_part["kind"] == "annex" else None)
            reg["eid"] = "%s_%s" % (stem, num) if num else None
            cur_part["regs"].append(reg)
            stack, marks = [], []
            continue
        if reg is None:
            preface.append(line)     # the covering notice, before any unit
            continue

        mk = MARKER.match(line)
        if mk and reg["eid"]:
            text = mk.group("text").strip()
            if mk.group("dot"):
                # the marker states its own path: 5.6.1 is the first clause of 5.6,
                # which is the sixth of rule 5. Drop the leading component when it
                # repeats the unit number the heading already gave.
                path = mk.group("dot").split(".")
                if reg["num"] and path[0] == reg["num"]:
                    path = path[1:]
                marks = path or ["1"]
                stack = stack[:len(marks) - 1]
                printed = mk.group("dot") + ("." if line[mk.end("dot")] == "." else "")
            else:
                mark = mk.group("paren") or mk.group("half") or mk.group("stop")
                at = next((i for i, x in enumerate(marks) if follows(mark, x)), -1)
                if at >= 0:
                    marks = marks[:at] + [mark]
                    stack = stack[:at]
                elif kind(mark) == "num" and int(mark) > 1 and not any(kind(x) == "num" for x in marks):
                    # regulation 37 opens at (2) with no (1) printed: it is top level anyway
                    marks, stack = [mark], []
                else:
                    marks = marks + [mark]
                printed = ("(%s)" % mark if mk.group("paren") else
                           "%s)" % mark if mk.group("half") else "%s." % mark)
            depth = len(marks) - 1
            node = Node(printed, "%s_%s" % (reg["eid"], "_".join(marks)), depth)
            if text:
                node.ps.append(text)
            if stack:
                stack[-1].kids.append(node)
            else:
                reg["nodes"].append(node)
            stack = stack + [node]
        else:
            # unmarked text: a proviso or a continuation. It belongs to the clause
            # that is open, and to the unit's intro when none is.
            (stack[-1].ps if stack else reg["intro"]).append(line)

    return preface, parts


def render_node(n, out, ind):
    tag = LEVEL[min(n.depth, len(LEVEL) - 1)]
    pad = "  " * ind
    out.append('%s<%s eId="%s">' % (pad, tag, n.eid))
    out.append("%s  <num>%s</num>" % (pad, esc(n.printed)))
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
    # the FRBR work name is the document's own kind, and the year is the date it
    # carries, so a regulation and a set of model rules do not pretend to be the same
    # thing merely because both are policy.
    work = "/akn/in/doc/%s/%s/%s" % (doc_meta["kind"], doc_meta["dated"][:4], slug)
    author, author_name = doc_meta["author"], doc_meta["author_name"]
    o = []
    a = o.append
    a('<?xml version="1.0" encoding="UTF-8"?>')
    a('<akomaNtoso xmlns="%s">' % AKN_NS)
    a('  <doc name="%s" contains="originalVersion">' % esc(doc_meta["kind"]))
    a("    <meta>")
    a('      <identification source="#pucar">')
    for frbr, this, uri, dt, who in [
        ("FRBRWork", work + "/!main", work, doc_meta["dated"], "#" + author),
        ("FRBRExpression", work + "/eng@/!main", work + "/eng@", doc_meta["dated"], "#" + author),
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
    a('        <eventRef eId="e_publication" date="%s" source="#%s" type="generation"/>'
      % (doc_meta["dated"], author))
    a("      </lifecycle>")
    a('      <references source="#pucar">')
    a('        <TLCOrganization eId="pucar" href="https://pucar.org" showAs="PUCAR"/>')
    a('        <TLCOrganization eId="%s" href="%s" showAs="%s"/>'
      % (author, doc_meta["author_href"], esc(author_name)))
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
        label = part["label"]
        # an unlabelled part is a document that prints no division over its units. It
        # gets no <chapter>, because a wrapper the source does not have is a claim
        # about its structure; the sections sit directly in <mainBody>, which is what
        # the standard's maincontent admits anyway.
        wrapped = bool(label)
        ind = 4 if wrapped else 3
        if wrapped:
            chap += 1
            m = re.match(r"^(Chapter\s+[IVXL]+)\s*[-–]\s*(.*)$", label, re.I)
            num, head = (m.group(1), m.group(2)) if m else (label, "")
            a('      <chapter eId="%s">' % (part["stem"] or "chp_%d" % chap))
            a("        <num>%s</num>" % esc(num))
            if head:
                a("        <heading>%s</heading>" % esc(head))
        pad = "  " * ind
        for i, r in enumerate(part["regs"], 1):
            eid = r["eid"] or "%s_x%d_%d" % (part["stem"] or "chp", chap, i)
            a('%s<section eId="%s">' % (pad, eid))
            # the unit's number exactly as the source prints it. An annexure's units
            # print "1." like anything else; one that prints no number at all - the
            # request form in Schedule II - gets an empty <num>, which is what an
            # unnumbered heading is.
            a("%s  <num>%s</num>" % (pad, ("%s." % r["num"]) if r["num"] else ""))
            if r["heading"]:
                a("%s  <heading>%s</heading>" % (pad, esc(r["heading"])))
            if r["nodes"]:
                if r["intro"]:
                    a("%s  <intro>" % pad)
                    for p in r["intro"]:
                        a("%s    <p>%s</p>" % (pad, esc(p)))
                    a("%s  </intro>" % pad)
                for n in r["nodes"]:
                    render_node(n, o, ind + 1)
            else:
                a("%s  <content>" % pad)
                for p in (r["intro"] or [""]):
                    a("%s    <p>%s</p>" % (pad, esc(p)))
                a("%s  </content>" % pad)
            a("%s</section>" % pad)
        if wrapped:
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
        unit = d.get("unit") or {}
        prefix = unit.get("prefix") or "reg"
        preface, parts = parse(md, prefix)
        slug = os.path.basename(md_path)[:-3]
        auth = d.get("akn_author") or {}
        meta = dict(slug=slug, title=d["title"], dated=d["dated"], kind=d.get("kind", "policy"),
                    status_note=d.get("status_note", ""), source_pdf=d["source_pdf"],
                    author=auth.get("id", "pucar"), author_name=auth.get("name", "PUCAR"),
                    author_href=auth.get("href", "https://pucar.org"))
        xml = build(meta, preface, parts, today)
        assert_unique_eids(xml, slug)
        out_dir = os.path.join(DATA, "policy", "akn")
        os.makedirs(out_dir, exist_ok=True)
        out = os.path.join(out_dir, slug + ".akn.xml")
        open(out, "w", encoding="utf-8").write(xml)
        live = [p for p in parts if p["regs"]]
        nreg = sum(len(p["regs"]) for p in live)
        nclause = len(re.findall(r'eId="[a-z_]+_[0-9ivxl]+_', xml))
        print("%s\n   %d division(s), %d %s(s), %d clause eIds, %d preface paragraphs"
              % (os.path.relpath(out, ROOT), len([p for p in live if p["label"]]),
                 nreg, unit.get("label", "unit").lower(), nclause, len(preface)))


if __name__ == "__main__":
    main()
