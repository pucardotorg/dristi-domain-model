#!/usr/bin/env python3
"""
convert_judgments.py — Supreme Court judgment PDFs -> Akoma Ntoso <judgment> XML.

Reads the source PDFs in  public/data/caselaw/sources/
writes AKN judgment XML to public/data/caselaw/akn/
and updates              public/data/caselaw/cheque-dishonour-s138.caselaw.json
(each case gets: akn, source_pdf, decided, neutral_citation, source_status).

The PDFs come from Indian Kanoon text exports, the official Supreme Court PDF
copy, or the SCR reporter format; the pipeline handles all three. It also
classifies whether each PDF is actually the Supreme Court judgment it claims to
be, and refuses to emit AKN for a doc that isn't (e.g. a lower-court order that
merely cites the case) — those are recorded as source_status "wrong-document".

Requirements:  pip install pdfplumber
Run:           python3 scripts/convert_judgments.py
Validate:      xmllint --noout --schema akn.xsd public/data/caselaw/akn/*.akn.xml
               (AKN 3.0 XSD: https://github.com/laws-africa/cobalt/tree/master/cobalt/xsd)

Best-effort: the introduction/motivation/decision split is heuristic and the
paragraph text follows the reported version, not the certified record.
"""
import pdfplumber, re, os, json, datetime
from pathlib import Path
from xml.sax.saxutils import escape

REPO = Path(__file__).resolve().parent.parent
DATA = REPO / "public" / "data"
SRC  = DATA / "caselaw" / "sources"
OUT  = DATA / "caselaw" / "akn"
DSPATH = DATA / "caselaw" / "cheque-dishonour-s138.caselaw.json"
GEN_DATE = datetime.date.today().isoformat()
OUT.mkdir(parents=True, exist_ok=True)

DS = json.load(open(DSPATH))
cases = {c["id"]: c for c in DS["cases"]}

# Explicit, verified PDF-slug -> dataset-id map (resolves year collisions).
# Add a line here when you add a new judgment PDF + dataset case.
IDMAP = {
 "ac-narayanan-v-state-of-maharashtra-2014": "ac-narayanan-2014",
 "aneeta-hada-v-godfather-travels-tours-2012": "aneeta-hada-2012",
 "basalingappa-v-mudibasappa-2019": "basalingappa-2019",
 "bir-singh-v-mukesh-kumar-2019": "bir-singh-2019",
 "bridgestone-india-v-inderpal-singh-2016": "bridgestone-2016",
 "cc-alavi-haji-v-palapetty-muhammed-2007": "cc-alavi-haji-2007",
 "damodar-s-prabhu-v-sayed-babalal-h-2010": "damodar-prabhu-2010",
 "dashrath-rupsingh-rathod-v-state-of-maharashtra-2014": "dashrath-rupsingh-2014",
 "dashrathbhai-trikambhai-patel-v-hitesh-mahendrabhai-patel-2022": "dashrathbhai-2022",
 "dilip-hariramani-v-bank-of-baroda-2022": "dilip-hariramani-2022",
 "gajanand-burange-v-laxmi-chand-goyal-2022": "gajanand-burange-2022",
 "gj-raja-v-tejraj-surana-2019": "gj-raja-2019",
 "gunmala-sales-v-anu-mehta-2015": "gunmala-sales-2015",
 "in-re-expeditious-trial-s138-2021": "expeditious-trial-2021",
 "indian-bank-association-v-union-of-india-2014": "indian-bank-assn-2014",
 "jamboo-bhandari-v-mp-state-industrial-development-corp-2023": "jamboo-bhandari-2023",
 "jik-industries-v-amarlal-jumani-2012": "jik-industries-2012",
 "k-bhaskaran-v-sankaran-vaidhyan-balan-1999": "k-bhaskaran-1999",
 "kalamani-tex-v-p-balasubramanian-2021": "kalamani-tex-2021",
 "kaushalya-devi-massand-v-roopkishore-khore-2011": "kaushalya-devi-2011",
 "kumar-exports-v-sharma-carpets-2009": "kumar-exports-2009",
 "mandvi-cooperative-bank-v-nimesh-b-thakore-2010": "mandvi-coop-2010",
 "meters-and-instruments-v-kanchan-mehta-2018": "meters-instruments-2018",
 "msr-leathers-v-s-palaniappan-2013": "msr-leathers-2013",
 "national-small-industries-corp-v-harmeet-singh-paintal-2010": "nsic-harmeet-2010",
 "new-win-export-v-a-subramaniam-2024": "new-win-export-2024",
 "oriental-bank-of-commerce-v-prabodh-kumar-tewari-2022": "oriental-bank-2022",
 "r-vijayan-v-baby-2012": "r-vijayan-2012",
 "raj-reddy-kallem-v-state-of-haryana-2024": "raj-reddy-kallem-2024",
 "rajesh-jain-v-ajay-singh-2023": "rajesh-jain-2023",
 "rangappa-v-sri-mohan-2010": "rangappa-2010",
 "sadanandan-bhadran-v-madhavan-sunil-kumar-1998": "sadanandan-bhadran-1998",
 "sampelly-satyanarayana-rao-v-indian-renewable-energy-development-agency-2016": "sampelly-2016",
 "sanjabij-tari-v-kishore-s-borcar-2025": "sanjabij-tari-2025",
 "siby-thomas-v-somany-ceramics-2023": "siby-thomas-2023",
 "sms-pharmaceuticals-v-neeta-bhalla-2005": "sms-pharma-2005",
 "sp-mani-mohan-dairy-v-snehalatha-elangovan-2022": "sp-mani-2022",
 "suganthi-suresh-kumar-v-jagdeeshan-2002": "suganthi-2002",
 "sunil-todi-v-state-of-gujarat-2021": "sunil-todi-2021",
 "sunita-palita-v-panchami-stone-quarry-2022": "sunita-palita-2022",
 "surinder-singh-deswal-v-virender-gandhi-2019": "surinder-deswal-2019",
 "trl-krosaki-refractories-v-sms-asia-2022": "trl-krosaki-2022",
 "yogendra-pratap-singh-v-savitri-pandey-2014": "yogendra-pratap-2014",
}

MONTHS = {m: i + 1 for i, m in enumerate(
    ["January", "February", "March", "April", "May", "June", "July",
     "August", "September", "October", "November", "December"])}


# ---- classify: is this actually the Supreme Court judgment? ----
def is_sc(t):
    if re.search(r'THE SUPREME COURT OF INDIA', t, re.I): return True
    if re.search(r'\[\d{4}\]\s*\d*\s*SCR\b', t): return True            # Supreme Court Reports
    if re.search(r'PETITIONER:', t) and re.search(r'DATE OF JUDGMENT:', t): return True
    if re.search(r'The Judgment of the Court was delivered', t) and re.search(r'\bSCC\b', t) \
       and not re.search(r'HIGH COURT|Cr\.?P\.?C', t): return True
    return False

def wrong_kind(t):
    if re.search(r'COURT OF.*MAGISTRATE|Mahila Court', t, re.I):
        return "Magistrate court order (cites the SC case, is not the SC judgment)"
    if re.search(r"CORAM", t) and re.search(r'378\(4\)|HIGH COURT', t):
        return "High Court judgment (not the Supreme Court judgment)"
    return "Not identifiable as the Supreme Court judgment"


def raw_text(path):
    with pdfplumber.open(path) as pdf:
        return "\n".join(p.extract_text() or "" for p in pdf.pages)

def running_title(full):
    m = re.match(r'\s*(.+? vs .+? on \d{1,2}\s+[A-Z][a-z]+,?\s*\d{4})', full)
    return m.group(1).strip() if m else None

def clean(full):
    """Strip Indian Kanoon footers, stray page numbers, and the running header."""
    title = running_title(full)
    out = []
    for ln in full.split("\n"):
        s = ln.strip()
        if re.match(r'^Indian Kanoon\b', s): continue
        if re.match(r'^\d{1,3}\s*$', s): continue
        if title and s and (s in title or title.startswith(s)) and len(s) > 20: continue
        out.append(ln)
    txt = "\n".join(out)
    if title:
        txt = txt.replace(title, "")
    return txt

def extract_meta(full):
    m = {}
    nc = re.search(r'\b(\d{4})\s*INSC\s*(\d+)\b', full)          # tolerates "2023 INSC 888" and "2023INSC888"
    m['neutral'] = f"{nc.group(1)} INSC {nc.group(2)}" if nc else None
    d = re.search(r'\bon (\d{1,2})\s+([A-Z][a-z]+),?\s+(\d{4})', full) or \
        re.search(r'DATE OF JUDGMENT:\s*(\d{2})/(\d{2})/(\d{4})', full)
    if d and 'DATE' in d.group(0):
        m['date'] = f"{d.group(3)}-{d.group(2)}-{d.group(1)}"
    elif d:
        m['date'] = f"{d.group(3)}-{MONTHS.get(d.group(2), 1):02d}-{int(d.group(1)):02d}"
    else:
        d2 = re.search(r'\b([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})\b', full)  # SCR "APRIL 09, 2019"
        mn = d2.group(1).title() if d2 else None
        m['date'] = f"{d2.group(3)}-{MONTHS[mn]:02d}-{int(d2.group(2)):02d}" if (d2 and mn in MONTHS) else None
    a = re.search(r'Author:\s*(.+)', full)
    m['author'] = a.group(1).strip() if a else None
    b = re.search(r'Bench:\s*(.+)', full) or re.search(r'(?m)^BENCH:\s*\n(.+)', full)
    m['bench'] = b.group(1).strip() if b else None
    m['reportable'] = bool(re.search(r'\bREPORTABLE\b', full)) and not re.search(r'NON.?REPORTABLE', full)
    ap = re.search(r'((?:CRIMINAL|CIVIL)\s+APPEAL\s+NOS?\.?[^\n]*?\bOF\s+\d{4})', full, re.I) or \
         re.search(r'((?:CRIMINAL|CIVIL)\s+APPEAL[^\n]*?\d{1,6}\s+OF\s+\d{4})', full, re.I) or \
         re.search(r'(Appeal\s*\(crl\.\)[^\n]*?\d{4})', full, re.I)
    m['appeal'] = re.sub(r'\s+', ' ', ap.group(1)).strip() if ap else None
    doc = re.search(r'indiankanoon\.org/doc/(\d+)', full)
    m['ik_doc'] = doc.group(1) if doc else None
    return m

def find_body(text):
    """Locate the start of the opinion across the different source templates."""
    cands = []
    for mm in re.finditer(r'(?m)^\s*(J\s*U\s*D\s*G\s*M\s*E\s*N\s*T|O\s*R\s*D\s*E\s*R)\s*[:]?\s*$', text):
        cands.append((mm.end(), re.sub(r'\s', '', mm.group(1)).upper()))
    for mm in re.finditer(r'JUDGMENT:\s*', text):
        cands.append((mm.end(), "JUDGMENT"))
    for mm in re.finditer(r'The (?:following )?[Jj]udgment of the Court was delivered by[^\n]*', text):
        cands.append((mm.end(), "JUDGMENT"))
    for mm in re.finditer(r'(?m)^\s*(?:Dr\s+)?[A-Z][A-Za-z\. ]+,?\s+J\.\s*$', text):
        cands.append((mm.end(), "JUDGMENT"))
    if cands:
        cands.sort()
        for pos, kind in reversed(cands):          # last marker that leaves a substantial tail
            if len(text) - pos > 400:
                return text[pos:], ('order' if kind == 'ORDER' else 'judgment')
        pos, kind = cands[-1]
        return text[pos:], ('order' if kind == 'ORDER' else 'judgment')
    return text, 'judgment'

def _seq(cands):
    """Keep the true paragraph run (1,2,3…), tolerating small gaps, ignoring stray spikes."""
    seq = []; expected = 1
    for st, en, n in cands:
        if n == expected or (expected < n <= expected + 4):
            seq.append((st, en, n)); expected = n + 1
    return seq

def numbered(body, dotted=True):
    rx = r'(?m)^\s*(\d{1,3})\.\s+(?=\S)' if dotted else r'(?m)^\s*(\d{1,3})\s+(?=[A-Z(“"\'])'
    cands = [(mm.start(), mm.end(), int(mm.group(1))) for mm in re.finditer(rx, body)]
    return _seq(cands)

def reflow(text):
    """Reflow unnumbered (older) judgments into paragraphs on sentence-closing short lines."""
    lines = [l.rstrip() for l in text.split("\n") if l.strip()]
    if not lines: return []
    width = max(len(l) for l in lines)
    paras = []; cur = ""
    for l in lines:
        s = l.strip()
        cur = (cur + " " + s).strip() if cur else s
        if len(s) < 0.82 * width and re.search(r'[.?:"\')]$', s):
            paras.append(cur); cur = ""
    if cur: paras.append(cur)
    return [p for p in paras if len(p) > 1]

def parse_body(body):
    body = re.sub(r'[ \t]+', ' ', body)
    keep = numbered(body, dotted=True)
    if len(keep) < 3:
        k2 = numbered(body, dotted=False)
        if len(k2) > len(keep): keep = k2
    if len(keep) >= 3:
        preamble = body[:keep[0][0]].strip()
        paras = []
        for i, (st, en, n) in enumerate(keep):
            end = keep[i + 1][0] if i + 1 < len(keep) else len(body)
            chunk = re.sub(r'\s*\n\s*', ' ', body[en:end].strip()).strip()
            if chunk: paras.append((n, chunk))
        return re.sub(r'\s*\n\s*', ' ', preamble).strip(), paras, 'numbered'
    return "", [(i + 1, b) for i, b in enumerate(reflow(body))], 'reflow'

DECISION_RX = re.compile(
    r'\b(appeal[s]?\s+(is|are|stand|shall)\b[^.]{0,60}\b(allowed|dismissed|disposed)|'
    r'we\s+(allow|dismiss)\b|is\s+hereby\s+(allowed|dismissed)|disposed of\b|are\s+disposed|'
    r'set aside|acquit|no order as to cost|pending applications?\b)', re.I)

def build_akn(cid, meta, mode, preamble, paras, ds):
    name = ds['name']; year = ds['year']
    work = f"/akn/in/judgment/{year}/{cid}"
    def para_xml(num, txt):
        return (f'          <paragraph eId="para_{num}">\n'
                f'            <num>{num}.</num>\n'
                f'            <content><p>{escape(txt)}</p></content>\n'
                f'          </paragraph>')
    dec_start = len(paras)
    if paras:
        for i in range(len(paras) - 1, max(-1, len(paras) - 4), -1):
            if DECISION_RX.search(paras[i][1]): dec_start = i
            elif dec_start < len(paras): break
    motiv = paras[:dec_start]; decis = paras[dec_start:]
    if not motiv and decis: motiv, decis = decis, []
    body_parts = []
    if preamble:
        body_parts.append('      <introduction eId="intro_1">\n        <p>' + escape(preamble) + '</p>\n      </introduction>')
    if motiv:
        body_parts.append('      <motivation eId="motiv_1">\n' + "\n".join(para_xml(n, t) for n, t in motiv) + '\n      </motivation>')
    if decis:
        body_parts.append('      <decision eId="decision_1">\n' + "\n".join(para_xml(n, t) for n, t in decis) + '\n      </decision>')
    if not body_parts:
        body_parts.append('      <motivation eId="motiv_1">\n        <p>' + escape(name) + '</p>\n      </motivation>')
    body_xml = "\n".join(body_parts)

    hdr = ['      <p class="court"><courtType refersTo="#sc-india">Supreme Court of India</courtType></p>']
    if meta.get('appeal'): hdr.append(f'      <p class="docketNumber"><docketNumber>{escape(meta["appeal"])}</docketNumber></p>')
    hdr.append(f'      <p class="parties">{escape(name)}</p>')
    if meta.get('neutral'): hdr.append(f'      <p class="neutralCitation"><neutralCitation>{escape(meta["neutral"])}</neutralCitation></p>')
    if ds.get('citation'): hdr.append(f'      <p class="reportCitation">{escape(ds["citation"])}</p>')
    if meta.get('date'): hdr.append(f'      <p class="judgmentDate"><date date="{meta["date"]}" refersTo="#judgmentDate">{meta["date"]}</date></p>')
    if meta.get('author'): hdr.append(f'      <p class="author">Author: {escape(meta["author"])}</p>')
    if meta.get('bench'): hdr.append(f'      <p class="bench">Bench: {escape(meta["bench"])}</p>')
    header_xml = "\n".join(hdr)

    note = f'Converted from the text export of {name}'
    if meta.get('ik_doc'): note += f' (indiankanoon.org/doc/{meta["ik_doc"]})'
    note += '. Running headers, page furniture and reporter apparatus were stripped during extraction. '
    note += ('Numbered paragraphs follow the reported judgment. ' if mode == 'numbered'
             else 'The source has no paragraph numbers; text was reflowed into paragraphs. ')
    note += 'The introduction/motivation/decision split is a best-effort structural segmentation. Verify against the official record before authoritative use.'

    return f'''<?xml version="1.0" encoding="UTF-8"?>
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <judgment name="judgment" contains="originalVersion">
    <meta>
      <identification source="#pucar">
        <FRBRWork>
          <FRBRthis value="{work}/!main"/>
          <FRBRuri value="{work}"/>
          <FRBRalias value="{escape(name)}" name="caseName"/>
          <FRBRdate date="{meta.get('date') or str(year) + '-01-01'}" name="judgment"/>
          <FRBRauthor href="#sc-india"/>
          <FRBRcountry value="in"/>
          <FRBRnumber value="{escape(meta.get('neutral') or '')}"/>
          <FRBRname value="{escape(name)}"/>
        </FRBRWork>
        <FRBRExpression>
          <FRBRthis value="{work}/eng@/!main"/>
          <FRBRuri value="{work}/eng@"/>
          <FRBRdate date="{meta.get('date') or str(year) + '-01-01'}" name="judgment"/>
          <FRBRauthor href="#sc-india"/>
          <FRBRlanguage language="eng"/>
        </FRBRExpression>
        <FRBRManifestation>
          <FRBRthis value="{work}/eng@/!main.xml"/>
          <FRBRuri value="{work}/eng@.akn"/>
          <FRBRdate date="{GEN_DATE}" name="generation"/>
          <FRBRauthor href="#pucar"/>
          <FRBRformat value="application/akn+xml"/>
        </FRBRManifestation>
      </identification>
      <references source="#pucar">
        <TLCOrganization eId="pucar" href="https://pucar.org" showAs="PUCAR"/>
        <TLCOrganization eId="sc-india" href="/ontology/organization/in/supreme-court" showAs="Supreme Court of India"/>
      </references>
      <notes source="#pucar">
        <note eId="note_source"><p>{escape(note)}</p></note>
      </notes>
      <proprietary source="#pucar" xmlns:pucar="https://pucar.org/ns">
        <pucar:caseId>{escape(cid)}</pucar:caseId>
        <pucar:status>{escape(ds.get('status', ''))}</pucar:status>
        <pucar:benchSize>{ds.get('bench', '')}</pucar:benchSize>
        <pucar:reportable>{str(meta.get('reportable', False)).lower()}</pucar:reportable>
      </proprietary>
    </meta>
    <header>
{header_xml}
    </header>
    <judgmentBody>
{body_xml}
    </judgmentBody>
  </judgment>
</akomaNtoso>
'''


def main():
    ok, wrong = [], []
    for slug, cid in IDMAP.items():
        pdf = SRC / f"{slug}.pdf"
        c = cases.get(cid)
        if c is None:
            print(f"  ! no dataset case for {cid} ({slug}); skipping"); continue
        if not pdf.exists():
            print(f"  ! missing PDF: {pdf.name}; skipping"); continue
        full = raw_text(pdf)
        c["source_pdf"] = f"caselaw/sources/{slug}.pdf"
        if not is_sc(full):
            issue = wrong_kind(full)
            c["akn"] = None; c["source_status"] = "wrong-document"; c["source_issue"] = issue
            wrong.append((cid, issue)); continue
        meta = extract_meta(full)
        body, _ = find_body(clean(full))
        preamble, paras, mode = parse_body(body)
        (OUT / f"{slug}.akn.xml").write_text(build_akn(cid, meta, mode, preamble, paras, c))
        c["akn"] = f"caselaw/akn/{slug}.akn.xml"
        c["source_status"] = "ok"; c.pop("source_issue", None)
        if meta.get("date"): c["decided"] = meta["date"]
        if meta.get("neutral"): c["neutral_citation"] = meta["neutral"]
        ok.append((cid, len(paras), mode, meta.get("neutral")))

    # refresh corpus summary + persist dataset
    DS.setdefault("corpus", {})
    DS["corpus"].update({
        "akn_dir": "caselaw/akn/",
        "sources_dir": "caselaw/sources/",
        "akn_count": len(ok),
        "needs_recollection": [cid for cid, _ in wrong],
    })
    json.dump(DS, open(DSPATH, "w"), indent=2, ensure_ascii=False)

    print(f"Converted {len(ok)} SC judgments -> {OUT.relative_to(REPO)}")
    for cid, n, mode, nc in sorted(ok):
        print(f"  {cid:26} {n:>3} para  {mode:8} {nc or ''}")
    if wrong:
        print(f"\n{len(wrong)} wrong document(s) — no AKN emitted:")
        for cid, issue in wrong:
            print(f"  {cid:26} {issue}")


if __name__ == "__main__":
    main()
