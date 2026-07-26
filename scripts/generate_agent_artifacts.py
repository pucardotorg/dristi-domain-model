#!/usr/bin/env python3
"""Generate the agent-facing artifacts from the live domain data.

Single source of truth = the data files under public/data (the profile, the state
layers, the config/field-notes, the case-law dataset, and the Akoma Ntoso corpus).
This script joins them and writes, under public/ (so they deploy) and the repo:

  public/domain/<profile>.json     denormalized bundle - everything joined, with
                                   resolved statute text and app deep-links
  public/domain/<profile>.md       the same as a human/agent-readable digest
  public/domain/data-dictionary.md field dictionary + enums, derived from the data
  public/data/schema/*.schema.json JSON Schemas (structure fixed, enums data-driven)
  public/llms.txt                  site-root map pointing agents at all of the above
  README.md                        the AUTO-DATA-MODEL block, regenerated in place

Deterministic (no timestamps) so committed output does not churn. Run locally and
in the Netlify build (see netlify.toml) so the artifacts can never drift from data.
"""
import json, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "public", "data")
OUT  = os.path.join(ROOT, "public", "domain")
SCHEMA = os.path.join(DATA, "schema")

def load(p): return json.load(open(p, encoding="utf-8"))
def rel(*p): return os.path.join(DATA, *p)

# ---------------------------------------------------------------- AKN resolver
_akn_cache = {}
def akn_text(path, eId):
    """Return {num, heading, text} for an eId inside an AKN file, or None."""
    full = path if os.path.isabs(path) else os.path.join(DATA, path)
    if full not in _akn_cache:
        try: _akn_cache[full] = open(full, encoding="utf-8").read()
        except OSError: _akn_cache[full] = ""
    xml = _akn_cache[full]
    if not xml: return None
    m = re.search(r'<(section|article)\s+eId="%s">(.*?)</\1>' % re.escape(eId), xml, re.S)
    if not m: return None
    body = m.group(2)
    num = re.search(r'<num>(.*?)</num>', body, re.S)
    head = re.search(r'<heading>(.*?)</heading>', body, re.S)
    # flatten remaining text
    inner = re.sub(r'<num>.*?</num>', '', body, count=1, flags=re.S)
    inner = re.sub(r'<heading>.*?</heading>', '', inner, count=1, flags=re.S)
    txt = re.sub(r'<[^>]+>', ' ', inner)
    txt = re.sub(r'\s+', ' ', txt).strip()
    def clean(x): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', x)).strip() if x else ""
    return {"num": clean(num.group(1) if num else ""),
            "heading": clean(head.group(1) if head else ""),
            "text": txt}

# ---------------------------------------------------------------- load data
cfg  = load(rel("config", "app.config.json"))
prof_path = glob.glob(rel("profiles", "*.profile.json"))[0]
prof = load(prof_path)
PROFILE = prof["profile"]
caselaw = load(rel(*prof["caselaw"].split("/"))) if prof.get("caselaw") else {}
states = {os.path.basename(f)[:-5]: load(f)
          for f in sorted(glob.glob(rel("state", "*.json")))}
jur_name = {j["id"]: j["name"] for j in cfg.get("jurisdictions", [])}
notes = cfg.get("practice_notes", [])
SRC = prof["sources"]

def dl_provision(ref):
    a, e = ref.split(":", 1); return "#law?act=%s&eid=%s" % (a, e)
def dl_term(state, word): return "#words?state=%s&term=%s" % (state, word.lower())
def dl_note(note): return "#practice?state=%s&note=%s" % (note.get("place",""), note["id"])
def dl_role(state, rid): return "#story?state=%s&sec=role-%s" % (state, rid)
def dl_stage(state, sid): return "#story?state=%s&sec=procstage-%s" % (state, sid)

# ---------------------------------------------------------------- enums (data-driven)
def uniq(seq):
    out=[];
    for x in seq:
        if x and x not in out: out.append(x)
    return out
ENUMS = {
  "provision_tier": uniq([p.get("tier") for p in prof["provisions"]]),
  "vocab_pos": uniq([v.get("pos") for v in prof["terms"].values()] +
                    [t.get("pos") for s in states.values() for t in s.get("vocabulary",{}).get("terms",[])]),
  "vocab_role": uniq([v.get("role") for v in prof["terms"].values()] +
                     [t.get("role") for s in states.values() for t in s.get("vocabulary",{}).get("terms",[])]),
  "story_role_cat": uniq([r.get("cat") for s in states.values()
                          for r in s.get("story",{}).get("roles",{}).get("items",[])]),
  "verification_status": uniq([c.get("status") for n in notes
                               for c in n.get("verification",{}).get("claims",[])]),
  "compare_relation": uniq([c.get("relation") for n in notes for c in n.get("compare",[])]),
  "vocab_group_national": uniq([v.get("group") for v in prof["terms"].values()]),
  "domain": list((cfg.get("domain_labels") or {}).keys()),
}

# ---------------------------------------------------------------- denormalized bundle
def resolve_provisions():
    acts = {}
    for p in prof["provisions"]:
        a = p["act"]; s = SRC.get(a, {})
        acts.setdefault(a, {"alias": a, "title": s.get("title"), "uri": s.get("uri"),
                            "domain": s.get("domain"), "status": s.get("status"),
                            "file": s.get("file"), "sections": []})
        sec = akn_text(s.get("file",""), p["eId"]) or {}
        acts[a]["sections"].append({
            "ref": p["ref"], "eId": p["eId"], "tier": p.get("tier"), "role": p.get("role"),
            "applies": p.get("applies"), "note": p.get("note"),
            "num": sec.get("num"), "heading": sec.get("heading"), "text": sec.get("text"),
            "deep_link": dl_provision(p["ref"])})
    return list(acts.values())

def resolve_national_vocab():
    out=[]
    for word, v in prof["terms"].items():
        ref = v.get("ref"); res=None
        if ref and ":" in ref:
            a,e = ref.split(":",1); f=SRC.get(a,{}).get("file","")
            sec = akn_text(f,e) if f else None
            if sec: res={"act": SRC.get(a,{}).get("title"), "ref": ref, "num": sec["num"], "heading": sec["heading"]}
        out.append({"word": word, "ref": ref, "gloss": v.get("gloss"), "group": v.get("group"),
                    "pos": v.get("pos"), "role": v.get("role"), "aka": v.get("aka", []),
                    "source": v.get("source"), "resolved": res, "deep_link": dl_term(list(jur_name)[0] if jur_name else "kerala", word)})
    return out

def resolve_state(sid, s):
    story = s.get("story", {})
    roles = [{"id": r.get("id"), "role": r.get("role"), "cat": r.get("cat"), "who": r.get("who"),
              "basis": r.get("basis"), "informal": r.get("informal"), "sourceNotes": r.get("sourceNotes", []),
              "themes": r.get("themes", []), "deep_link": dl_role(sid, r.get("id","")) if r.get("id") else None}
             for r in story.get("roles", {}).get("items", [])]
    stages = [{"id": st.get("id"), "stage": st.get("stage"),
               "steps": [sp.get("t") for sp in st.get("steps", [])],
               "deep_link": dl_stage(sid, st.get("id","")) if st.get("id") else None}
              for st in story.get("process", {}).get("stages", [])]
    vocab = [{"word": t.get("word"), "gloss": t.get("gloss"), "source": t.get("source"),
              "akn": t.get("akn"), "eId": t.get("eId"), "group": t.get("group"),
              "pos": t.get("pos"), "role": t.get("role"), "aka": t.get("aka", []),
              "sourceNotes": t.get("sourceNotes", []), "deep_link": dl_term(sid, t.get("word",""))}
             for t in s.get("vocabulary", {}).get("terms", [])]
    return {"name": s.get("name", jur_name.get(sid, sid)), "as_of": s.get("as_of"),
            "story": {"summary": story.get("summary"), "roles": roles, "process": stages},
            "vocabulary": vocab}

def relationships():
    t2p = [{"term": w, "provision": v.get("ref")} for w, v in prof["terms"].items() if v.get("ref")]
    n2u = [{"note": n["id"], "changed": n.get("impact", {}).get("changed"),
            "changes": n.get("impact", {}).get("changes", [])} for n in notes]
    xs  = [{"from_note": n["id"], "to_note": c.get("noteId"), "relation": c.get("relation"),
            "note": c.get("note")} for n in notes for c in n.get("compare", [])]
    return {"term_to_provision": t2p, "note_to_units": n2u, "cross_state_compare": xs}

bundle = {
  "_about": "Denormalized, agent-facing bundle of the DRISTI domain model for one case type. "
            "Generated from the data files by scripts/generate_agent_artifacts.py - do not edit by hand. "
            "Deep links are app URL fragments (append to the site root, e.g. https://<site>/#...).",
  "case_type": {"id": PROFILE, "title": prof.get("title"), "name": cfg["case_types"][0].get("name"),
                "act": cfg["case_types"][0].get("act"), "blurb": cfg["case_types"][0].get("blurb")},
  "as_of": prof.get("as_of"), "maintained_by": prof.get("maintained_by"),
  "transition_date": prof.get("transition_date"), "ref_format": prof.get("ref_format"),
  "national": {"acts": resolve_provisions(), "vocabulary": resolve_national_vocab()},
  "states": {sid: resolve_state(sid, s) for sid, s in states.items()},
  "practice_notes": notes,
  "case_law": {"topics": caselaw.get("topics", []), "cases": caselaw.get("cases", [])},
  "enumerations": ENUMS,
  "relationships": relationships(),
}

os.makedirs(OUT, exist_ok=True)
os.makedirs(SCHEMA, exist_ok=True)
json.dump(bundle, open(os.path.join(OUT, PROFILE + ".json"), "w", encoding="utf-8"),
          indent=2, ensure_ascii=False)
open(os.path.join(OUT, PROFILE + ".json"), "a").write("\n")

# ---------------------------------------------------------------- markdown digest
def md_digest():
    L=[]; w=L.append
    ct=bundle["case_type"]
    w("# DRISTI domain digest - %s" % ct["name"])
    w("")
    w("> %s" % (ct.get("blurb") or ""))
    w("")
    w("Case type `%s` (%s). As of %s; code transition %s. Maintained by %s." %
      (ct["id"], ct.get("act"), bundle["as_of"], bundle["transition_date"], bundle["maintained_by"]))
    w("")
    w("This digest is generated from the data - it joins the relevance profile, the state "
      "layers, the field notes and the Akoma Ntoso corpus. Each item carries a **deep link** "
      "(a URL fragment for the viewer) and a `ref` into the machine-readable bundle "
      "`%s.json`. Do not edit by hand." % PROFILE)
    w("")
    w("## National law - Acts and pinned provisions")
    for a in bundle["national"]["acts"]:
        w("")
        w("### %s  `%s`" % (a["title"], a["alias"]))
        w("*%s · %s* - %s provisions pinned to this case type." %
          (a.get("domain") or "", a.get("status") or "", len(a["sections"])))
        for s in a["sections"]:
            w("")
            w("- **%s %s** (`%s`, tier: %s) - %s" %
              (s.get("num") or "", s.get("heading") or "", s["ref"], s.get("tier"), s.get("note") or ""))
            if s.get("text"):
                t = s["text"]; t = t if len(t) <= 600 else t[:600] + " …"
                w("  > %s" % t)
            w("  [open](%s)" % s["deep_link"])
    w("")
    w("## National vocabulary")
    w("")
    w("| word | role | from | gloss |")
    w("|---|---|---|---|")
    for v in bundle["national"]["vocabulary"]:
        src = (v["resolved"]["heading"] if v.get("resolved") else (v.get("source") or ""))
        w("| %s | %s | %s | %s |" % (v["word"], v.get("role") or "", (src or "")[:40],
                                     (v.get("gloss") or "")[:120].replace("\n"," ")))
    for sid, st in bundle["states"].items():
        w("")
        w("## State layer - %s" % st["name"])
        if st["story"].get("summary"): w(""); w(st["story"]["summary"])
        if st["story"]["roles"]:
            w(""); w("### Roles")
            for r in st["story"]["roles"]:
                flag = " *(has informal aspects)*" if r.get("informal") else ""
                w("- **%s** (%s)%s - %s [open](%s)" %
                  (r["role"], r.get("cat") or "", flag, (r.get("who") or "")[:200],
                   r.get("deep_link") or ""))
        if st["story"]["process"]:
            w(""); w("### Process")
            for stg in st["story"]["process"]:
                w("- **%s**" % stg.get("stage"))
                for step in stg.get("steps", []):
                    w("  - %s" % step)
        if st["vocabulary"]:
            w(""); w("### %s vocabulary" % st["name"])
            for t in st["vocabulary"]:
                note = (" · field note: %s" % t["sourceNotes"][0]) if t.get("sourceNotes") else ""
                w("- **%s** - %s (from %s%s)" %
                  (t["word"], (t.get("gloss") or "")[:160], t.get("source") or "", note))
    w("")
    w("## Local practice - field notes")
    for n in notes:
        w("")
        w("### %s - %s (%s)" % (n.get("serial"), n["id"], jur_name.get(n.get("place"), n.get("place"))))
        a=n.get("attribution",{})
        w("Heard from %s%s. %s" % (a.get("heardFrom") or "?",
          (" (%s)" % a.get("affiliation")) if a.get("affiliation") else "",
          "relayed / may be secondhand." if a.get("secondhand") else "firsthand."))
        w(""); w("> %s" % (n.get("statement") or ""))
        cls=n.get("verification",{}).get("claims",[])
        if cls:
            w(""); w("**Verification:**")
            for c in cls:
                w("- [%s] %s%s" % (c.get("status"), c.get("claim") or "",
                                   (" - " + c["note"]) if c.get("note") else ""))
        ch=n.get("impact",{}).get("changes",[])
        if ch:
            w(""); w("**Changed:** " + ", ".join("%s %s" % (x.get("op"), x.get("label") or x.get("ref")) for x in ch))
        for c in n.get("compare", []):
            w(""); w("**Across states:** %s %s - %s" %
                     (c.get("relation"), jur_name.get(c.get("place"), c.get("place")), c.get("note") or ""))
    if caselaw.get("cases"):
        w(""); w("## Case law")
        for c in caselaw["cases"]:
            w("- **%s** (%s) - %s" % (c.get("title") or c.get("name") or c.get("id"),
                                      c.get("year") or "", (c.get("holding") or c.get("summary") or "")[:200]))
    w("")
    return "\n".join(L)

open(os.path.join(OUT, PROFILE + ".md"), "w", encoding="utf-8").write(md_digest())

# ---------------------------------------------------------------- data dictionary
def data_dictionary():
    L=[]; w=L.append
    w("# DRISTI data dictionary")
    w("")
    w("Generated from the data - the field meanings and the **enumerations are derived from "
      "what the data actually uses**, so this cannot drift. Structural detail (which fields "
      "are required) lives in the JSON Schemas under `data/schema/`.")
    w("")
    w("## Files")
    w("")
    w("| file | what |")
    w("|---|---|")
    w("| `data/profiles/%s.profile.json` | national relevance profile: `sources` (Acts), `provisions` (pinned sections), `terms` (vocabulary) |" % PROFILE)
    w("| `data/state/<state>.json` | a state layer: `vocabulary.terms`, `story.roles`, `story.process` |")
    w("| `data/config/app.config.json` | `case_types`, `jurisdictions`, `practice_notes` (field notes), `domain_labels` |")
    w("| `data/caselaw/%s.caselaw.json` | the case-law dataset |" % PROFILE)
    w("| `data/acts/akn/*.akn.xml` | the statutory text (Akoma Ntoso 3.0), addressed by `eId` |")
    w("| `domain/%s.json` / `.md` | the denormalized join of all of the above |" % PROFILE)
    w("")
    w("## Reference grammars")
    w("")
    w("- **Provision / national term ref**: `<alias>:<eId>` (e.g. `ni:sec_138`). `alias` is a key in the profile `sources`; `eId` exists in that Act's AKN file. %s" % (prof.get("ref_format") or ""))
    w("- **State cite**: `{l, s, e}` where `s` is a state-instrument alias and `e` an eId; or `{l, n}` where `n` is a national `<alias>:<eId>`.")
    w("- **Field-note impact ref**: `<state>:<unit>:<id>` (unit = term|role|process); the created unit carries the same trailing `id`.")
    w("- **App deep link**: `#<view>?state=<s>&sec=<anchor>&lens=<l>&term=<w>&note=<id>&act=<a>&eid=<e>` - append to the site root.")
    w("")
    w("## Enumerations (as used in the data)")
    labels={"provision_tier":"`provisions[].tier`","vocab_pos":"`terms[].pos`",
            "vocab_role":"`terms[].role`","story_role_cat":"`story.roles.items[].cat`",
            "verification_status":"`verification.claims[].status`","compare_relation":"`compare[].relation`",
            "vocab_group_national":"national vocab `group`","domain":"`sources[].domain` / `domain_labels`"}
    for k, vals in ENUMS.items():
        w("- %s - %s" % (labels.get(k, "`"+k+"`"), ", ".join("`%s`" % x for x in vals)))
    w("")
    return "\n".join(L)

open(os.path.join(OUT, "data-dictionary.md"), "w", encoding="utf-8").write(data_dictionary())

# ---------------------------------------------------------------- JSON Schemas
D = "https://json-schema.org/draft/2020-12/schema"
def enum(name): return {"type": "string", "enum": ENUMS[name]}
schemas = {
 "profile.schema.json": {
   "$schema": D, "title": "DRISTI relevance profile", "type": "object",
   "required": ["profile", "sources", "provisions", "terms"],
   "properties": {
     "profile": {"type": "string"},
     "sources": {"type": "object", "additionalProperties": {"type": "object",
        "required": ["title", "file"], "properties": {
          "uri": {"type": "string"}, "title": {"type": "string"},
          "domain": enum("domain"), "status": {"type": "string"}, "file": {"type": "string"}}}},
     "provisions": {"type": "array", "items": {"type": "object",
        "required": ["ref", "act", "eId", "tier"], "properties": {
          "ref": {"type": "string", "pattern": "^[a-z0-9]+:[A-Za-z0-9_]+$"},
          "act": {"type": "string"}, "eId": {"type": "string"},
          "tier": enum("provision_tier"), "role": {"type": "string"},
          "applies": {"type": "string"}, "note": {"type": "string"}}}},
     "terms": {"type": "object", "additionalProperties": {"type": "object",
        "required": ["gloss", "group", "pos", "role"], "properties": {
          "ref": {"type": "string"}, "source": {"type": "string"}, "gloss": {"type": "string"},
          "group": {"type": "string"}, "pos": enum("vocab_pos"), "role": enum("vocab_role"),
          "aka": {"type": "array", "items": {"type": "string"}},
          "sourceNotes": {"type": "array", "items": {"type": "string"}}}}}}},
 "state.schema.json": {
   "$schema": D, "title": "DRISTI state layer", "type": "object",
   "required": ["state", "name"],
   "properties": {
     "state": {"type": "string"}, "name": {"type": "string"}, "as_of": {"type": "string"},
     "vocabulary": {"type": "object", "properties": {"terms": {"type": "array", "items": {
        "type": "object", "required": ["word", "gloss", "group", "pos", "role"], "properties": {
          "word": {"type": "string"}, "gloss": {"type": "string"}, "source": {"type": "string"},
          "akn": {"type": "string"}, "eId": {"type": "string"}, "group": {"type": "string"},
          "pos": enum("vocab_pos"), "role": enum("vocab_role"),
          "aka": {"type": "array", "items": {"type": "string"}},
          "sourceNotes": {"type": "array", "items": {"type": "string"}}}}}}},
     "story": {"type": "object", "properties": {
        "summary": {"type": "string"},
        "roles": {"type": "object", "properties": {"items": {"type": "array", "items": {
           "type": "object", "required": ["role", "cat"], "properties": {
             "id": {"type": "string"}, "role": {"type": "string"}, "cat": enum("story_role_cat"),
             "who": {"type": "string"}, "basis": {"type": "string"},
             "cite": {"type": "array"}, "informal": {"type": "object"},
             "sourceNotes": {"type": "array", "items": {"type": "string"}},
             "themes": {"type": "array", "items": {"type": "string"}}}}}}},
        "process": {"type": "object", "properties": {"stages": {"type": "array", "items": {
           "type": "object", "required": ["stage"], "properties": {
             "id": {"type": "string"}, "stage": {"type": "string"},
             "steps": {"type": "array", "items": {"type": "object", "properties": {
                "t": {"type": "string"}, "c": {"type": "array"}}}}}}}}}}}}},
 "practice-note.schema.json": {
   "$schema": D, "title": "DRISTI field note (practice_notes[] in app.config.json)",
   "type": "object", "required": ["id", "place", "attribution", "statement"],
   "properties": {
     "id": {"type": "string"}, "serial": {"type": "string"}, "place": {"type": "string"},
     "date": {"type": "string"},
     "attribution": {"type": "object", "required": ["heardFrom"], "properties": {
        "heardFrom": {"type": "string"}, "affiliation": {"type": "string"},
        "secondhand": {"type": "boolean"}, "originalSource": {"type": "string"}}},
     "statement": {"type": "string"},
     "themes": {"type": "array", "items": {"type": "string"}},
     "tags": {"type": "array", "items": {"type": "string"}},
     "verification": {"type": "object", "properties": {"claims": {"type": "array", "items": {
        "type": "object", "required": ["claim", "status"], "properties": {
          "claim": {"type": "string"}, "status": enum("verification_status"),
          "method": {"type": "string"}, "evidence": {"type": "array"},
          "by": {"type": "string"}, "on": {"type": "string"},
          "note": {"type": "string"}, "toCheck": {"type": "string"}}}}}},
     "impact": {"type": "object", "properties": {
        "changed": {"type": "boolean"}, "reason": {"type": "string"},
        "changes": {"type": "array", "items": {"type": "object",
           "required": ["unit", "ref"], "properties": {
             "unit": {"type": "string", "enum": ["term", "role", "process"]},
             "op": {"type": "string"}, "ref": {"type": "string"}, "label": {"type": "string"}}}},
        "relatesToLaw": {"type": "array"}}},
     "compare": {"type": "array", "items": {"type": "object", "properties": {
        "place": {"type": "string"}, "noteId": {"type": "string"},
        "relation": enum("compare_relation"), "note": {"type": "string"}}}}}},
}
for name, sch in schemas.items():
    json.dump(sch, open(os.path.join(SCHEMA, name), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(os.path.join(SCHEMA, name), "a").write("\n")

# ---------------------------------------------------------------- llms.txt
def llms_txt():
    st_files = " · ".join("[/data/state/%s.json](/data/state/%s.json)" % (s, s) for s in states)
    return "\n".join([
      "# DRISTI 2.0 - Domain Model",
      "",
      "> A data-driven reference of the legal domain a single court **case type** is built on. "
      "Modelled case type: **%s** (%s). The site is a static viewer that reads the corpus below "
      "at runtime; every data file is fetchable directly." % (bundle["case_type"]["name"], bundle["case_type"]["act"]),
      "",
      "For agents: start with the denormalized bundle - it joins the profile, the state layers, "
      "the field notes and the Akoma Ntoso statute text into one document, each node carrying a "
      "shareable deep link (a `#...` URL fragment). Then use the schemas and data dictionary to "
      "read the raw files directly.",
      "",
      "## Start here (denormalized, everything joined)",
      "- [/domain/%s.json](/domain/%s.json): the full domain bundle as JSON." % (PROFILE, PROFILE),
      "- [/domain/%s.md](/domain/%s.md): the same as a readable digest." % (PROFILE, PROFILE),
      "- [/domain/data-dictionary.md](/domain/data-dictionary.md): field meanings and enumerations.",
      "",
      "## Raw data (source of truth)",
      "- [/data/profiles/%s.profile.json](/data/profiles/%s.profile.json): national provisions + vocabulary." % (PROFILE, PROFILE),
      "- [/data/config/app.config.json](/data/config/app.config.json): case types, jurisdictions, field notes.",
      "- State layers: %s" % st_files,
      "- [/data/caselaw/%s.caselaw.json](/data/caselaw/%s.caselaw.json): case-law dataset." % (PROFILE, PROFILE),
      "- Statute corpus: %d Akoma Ntoso XML files under [/data/acts/akn/](/data/acts/akn/) (national) and /data/state/<state>/akn/." % len(glob.glob(rel("acts","akn","*.akn.xml"))),
      "",
      "## Schemas",
      "- [/data/schema/profile.schema.json](/data/schema/profile.schema.json)",
      "- [/data/schema/state.schema.json](/data/schema/state.schema.json)",
      "- [/data/schema/practice-note.schema.json](/data/schema/practice-note.schema.json)",
      "",
      "## Deep links",
      "Append a fragment to the site root, e.g. `/#law?act=ni&eid=sec_138`, "
      "`/#story?state=haryana&sec=role-filing-assistant`, `/#words?state=kerala&term=scrutiny%20officer`, "
      "`/#practice?state=haryana&note=hr-filing-assistant-2026-06`.",
      "",
    ])
open(os.path.join(ROOT, "public", "llms.txt"), "w", encoding="utf-8").write(llms_txt())

# ---------------------------------------------------------------- README block
def readme_block():
    L=[]; w=L.append
    w("<!-- AUTO-DATA-MODEL:START (generated by scripts/generate_agent_artifacts.py - do not edit) -->")
    w("")
    w("### Machine-readable data model (generated)")
    w("")
    w("The domain is data. For agents and tools, generated artifacts join and describe it:")
    w("")
    w("| artifact | what |")
    w("|---|---|")
    w("| `public/domain/%s.json` | denormalized bundle - profile + state layers + field notes + resolved AKN text, with deep links |" % PROFILE)
    w("| `public/domain/%s.md` | the same as a readable digest |" % PROFILE)
    w("| `public/domain/data-dictionary.md` | field meanings + enumerations (derived from the data) |")
    w("| `public/data/schema/*.schema.json` | JSON Schemas (profile, state, field note) |")
    w("| `public/llms.txt` | site-root map for agents |")
    w("")
    w("Regenerate with `python3 scripts/generate_agent_artifacts.py` (also run in the Netlify build, so deploys never drift).")
    w("")
    w("**Enumerations in use** (data-derived):")
    w("")
    for k, vals in ENUMS.items():
        w("- `%s`: %s" % (k, ", ".join(vals)))
    w("")
    w("**Counts:** %d Acts, %d provisions, %d national terms; states: %s; %d field notes." % (
        len({p['act'] for p in prof['provisions']}), len(prof['provisions']), len(prof['terms']),
        ", ".join("%s (%d terms)" % (st['name'], len(st['vocabulary'])) for st in bundle['states'].values()),
        len(notes)))
    w("")
    w("<!-- AUTO-DATA-MODEL:END -->")
    return "\n".join(L)

readme_path=os.path.join(ROOT, "README.md")
rd=open(readme_path, encoding="utf-8").read()
block=readme_block()
if "<!-- AUTO-DATA-MODEL:START" in rd:
    rd=re.sub(r"<!-- AUTO-DATA-MODEL:START.*?<!-- AUTO-DATA-MODEL:END -->", block, rd, flags=re.S)
else:
    rd=rd.rstrip()+"\n\n---\n\n"+block+"\n"
open(readme_path, "w", encoding="utf-8").write(rd)

# ---------------------------------------------------------------- self-validate (soft)
try:
    import jsonschema
    jsonschema.validate(prof, schemas["profile.schema.json"])
    for s in states.values(): jsonschema.validate(s, schemas["state.schema.json"])
    for n in notes: jsonschema.validate(n, schemas["practice-note.schema.json"])
    print("self-check: profile + %d states + %d notes conform to the generated schemas" %
          (len(states), len(notes)))
except ImportError:
    print("self-check: jsonschema not installed - skipped (install to validate on generate)")
except Exception as e:
    raise SystemExit("SCHEMA VIOLATION: %s: %s" % (type(e).__name__, str(e)[:300]))

print("generated:")
print("  public/domain/%s.json (%d acts, %d nat terms, %d states, %d notes)" %
      (PROFILE, len(bundle["national"]["acts"]), len(bundle["national"]["vocabulary"]),
       len(bundle["states"]), len(notes)))
print("  public/domain/%s.md, data-dictionary.md" % PROFILE)
print("  public/data/schema/*.schema.json (%d)" % len(schemas))
print("  public/llms.txt ; README AUTO-DATA-MODEL block")
