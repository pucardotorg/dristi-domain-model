#!/usr/bin/env python3
"""Convert a short judicial instrument (circular, notification, SOP, fee table)
into Akoma Ntoso 3.0.

The other converters in this directory parse a statute out of a text dump. That
does not work for the short instruments a High Court actually runs on: a two-page
circular, a press release, a court-fee schedule. Those have no section regex to
find - their structure is a table, a numbered list of directions, or a set of
headed paragraphs, and it has to be read off the source by hand.

So this converter takes a *spec* (JSON) that says what the units are, and turns it
into schema-valid AKN. The spec is the transcription; this file is only the
serialiser. That keeps the XML boilerplate (FRBR triple, references, eId
uniqueness) in one audited place.

    python3 scripts/convert_instruments.py <spec.json> [<spec.json> ...]

Spec shape (see the docstring of build() for the full list of keys):

    {
      "out":      "public/data/state/haryana/akn/<slug>.akn.xml",
      "root":     "doc",                  # "doc" (default) or "act"
      "name":     "circular",             # @name on <doc>: circular/notification/sop/feeTable/pressRelease
      "country":  "in-hr",
      "uri":      "/akn/in-hr/doc/2024/efiling-3-0",
      "date":     "2024-02-13",
      "title":    "...",
      "author":   {"id": "phhc", "showAs": "High Court of Punjab and Haryana"},
      "note":     "provenance note, app-authored",
      "preface":  ["paragraph", "paragraph"],
      "body":     [ <part> | <section> ]
    }

A <part> is {"part": {"num": "...", "heading": "...", "eId": "...",
"sections": [...]}} and renders as a separator row in the app. A <section> is
{"eId": "...", "num": "...", "heading": "...", "p": [...], "items": [{"num":
"...", "p": [...]}]}.

Statutory / instrument text is written through verbatim: em-dashes, spellings and
punctuation are the source's, not ours. Only the `note` and any editorial
`heading` are app-authored.
"""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape

sys.path.insert(0, str(Path(__file__).resolve().parent))
from akn_ids import assert_unique_eids  # noqa: E402

REPO = Path(__file__).resolve().parent.parent
AKN_NS = "http://docs.oasis-open.org/legaldocml/ns/akn/3.0"


def esc(s: str) -> str:
    return escape(str(s), {'"': "&quot;"})


def _paras(texts, indent: str) -> str:
    return "".join(f"{indent}<p>{esc(t)}</p>\n" for t in texts if str(t).strip())


def _items(items, sec_eid: str, indent: str) -> str:
    """Render sub-clauses as a <blockList>; the app walks item/num/p."""
    if not items:
        return ""
    out = [f'{indent}<blockList eId="{esc(sec_eid)}__list">\n']
    for n, it in enumerate(items, start=1):
        eid = it.get("eId") or f"{sec_eid}__i{n}"
        out.append(f'{indent}  <item eId="{esc(eid)}">')
        if it.get("num"):
            out.append(f'<num>{esc(it["num"])}</num>')
        for t in it.get("p", []):
            out.append(f"<p>{esc(t)}</p>")
        out.append("</item>\n")
    out.append(f"{indent}</blockList>\n")
    return "".join(out)


def _section(sec: dict, indent: str) -> str:
    eid = sec["eId"]
    out = [f'{indent}<section eId="{esc(eid)}">\n']
    if sec.get("num"):
        out.append(f'{indent}  <num>{esc(sec["num"])}</num>\n')
    if sec.get("heading"):
        out.append(f'{indent}  <heading>{esc(sec["heading"])}</heading>\n')
    out.append(f"{indent}  <content>\n")
    body = _paras(sec.get("p", []), indent + "    ")
    body += _items(sec.get("items"), eid, indent + "    ")
    body += _paras(sec.get("tail", []), indent + "    ")
    if not body:  # <content> must not be empty
        body = f"{indent}    <p/>\n"
    out.append(body)
    out.append(f"{indent}  </content>\n{indent}</section>\n")
    return "".join(out)


def _block(node: dict, indent: str) -> str:
    if "part" in node:
        p = node["part"]
        out = [f'{indent}<part eId="{esc(p["eId"])}">\n']
        if p.get("num"):
            out.append(f'{indent}  <num>{esc(p["num"])}</num>\n')
        if p.get("heading"):
            out.append(f'{indent}  <heading>{esc(p["heading"])}</heading>\n')
        for s in p["sections"]:
            out.append(_section(s, indent + "  "))
        out.append(f"{indent}</part>\n")
        return "".join(out)
    return _section(node, indent)


def build(spec: dict) -> str:
    """Serialise a spec to an Akoma Ntoso 3.0 document."""
    root = spec.get("root", "doc")
    name = spec.get("name", "doc")
    uri = spec["uri"]
    d = spec["date"]
    title = spec["title"]
    author = spec["author"]
    country = spec["country"]
    today = date.today().isoformat()
    aid = author["id"]

    attrs = f'name="{esc(name)}" contains="originalVersion"'
    frbr = f"""    <meta>
      <identification source="#pucar">
        <FRBRWork>
          <FRBRthis value="{esc(uri)}/!main"/>
          <FRBRuri value="{esc(uri)}"/>
          <FRBRalias value="{esc(title)}" name="shortTitle"/>
          <FRBRdate date="{esc(d)}" name="generation"/>
          <FRBRauthor href="#{esc(aid)}"/>
          <FRBRcountry value="{esc(country)}"/>
          <FRBRnumber value="{esc(spec.get('number', ''))}"/>
          <FRBRname value="{esc(title)}"/>
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="{esc(uri)}/eng@/!main"/>
          <FRBRuri value="{esc(uri)}/eng@"/>
          <FRBRdate date="{esc(d)}" name="generation"/>
          <FRBRauthor href="#{esc(aid)}"/>
          <FRBRlanguage language="eng"/>
        </FRBRExpression>
        <FRBRManifestation>
          <FRBRthis value="{esc(uri)}/eng@/!main.xml"/>
          <FRBRuri value="{esc(uri)}/eng@.akn"/>
          <FRBRdate date="{today}" name="generation"/>
          <FRBRauthor href="#pucar"/>
          <FRBRformat value="application/akn+xml"/>
        </FRBRManifestation>
      </identification>
      <references source="#pucar">
        <TLCOrganization eId="pucar" href="https://pucar.org" showAs="PUCAR"/>
        <TLCOrganization eId="{esc(aid)}" href="/ontology/organization/in/{esc(aid)}" showAs="{esc(author['showAs'])}"/>
      </references>
      <notes source="#pucar">
        <note eId="note_source"><p>{esc(spec['note'])}</p></note>
      </notes>
    </meta>
"""

    pre = ""
    if spec.get("preface"):
        pre = "    <preface>\n"
        pre += f"      <longTitle><p>{esc(title.upper())}</p></longTitle>\n"
        pre += _paras(spec["preface"], "      ")
        pre += "    </preface>\n"

    body_tag = "mainBody" if root == "doc" else "body"
    body = f"    <{body_tag}>\n"
    for node in spec["body"]:
        body += _block(node, "      ")
    body += f"    </{body_tag}>\n"

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<akomaNtoso xmlns="{AKN_NS}">\n'
        f"  <{root} {attrs}>\n"
        f"{frbr}{pre}{body}"
        f"  </{root}>\n"
        "</akomaNtoso>\n"
    )
    assert_unique_eids(xml, spec["out"])
    return xml


def main(argv: list[str]) -> int:
    if not argv:
        print(__doc__)
        return 2
    for p in argv:
        spec = json.loads(Path(p).read_text(encoding="utf-8"))
        out = REPO / spec["out"]
        out.parent.mkdir(parents=True, exist_ok=True)
        xml = build(spec)
        out.write_text(xml, encoding="utf-8")
        n = xml.count("<section eId=")
        print(f"{spec['out']}: {n} units")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
