#!/usr/bin/env python3
"""Generate the agent-facing artifacts from the live domain data.

Single source of truth = the data files under public/data (the profile, the state
layers, the config/field-notes, the case-law dataset, and the Akoma Ntoso corpus).
This script joins them and writes, under public/ (so they deploy) and the repo:

  public/domain/<profile>.json     denormalized bundle - everything joined, with
                                   resolved statute text, the normative requirements
                                   layer and app deep-links
  public/domain/<profile>.md       the same as a human/agent-readable digest
  public/domain/data-dictionary.md field dictionary + enums, derived from the data
  public/data/schema/*.schema.json JSON Schemas (structure fixed, enums data-driven)
  public/llms.txt                  site-root map pointing agents at all of the above
  README.md                        the AUTO-DATA-MODEL block, regenerated in place

Deterministic (no timestamps) so committed output does not churn. Run locally and
in the Netlify build (see netlify.toml) so the artifacts can never drift from data.
"""
import json, os, re, glob, sys

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

# ---------------------------------------------------------------- requirements layer
# The normative layer: national.json binds every state; a <state>.json adds only what
# that state's own instruments require, or where it tightens a national requirement.
REQ_DIR = rel("requirements")
req_docs = {os.path.basename(f)[:-5]: load(f)
            for f in sorted(glob.glob(os.path.join(REQ_DIR, "*.json")))}
req_state_docs = {k: v for k, v in req_docs.items() if k != "national"}

def _category_labels():
    """Category code -> what it covers, read from the layer's own spec so it cannot drift."""
    out = {}
    try: spec = open(os.path.join(REQ_DIR, "README.md"), encoding="utf-8").read()
    except OSError: return out
    for m in re.finditer(r"^\|\s*`([A-Z]{3})`\s*\|\s*(.+?)\s*\|\s*$", spec, re.M):
        out[m.group(1)] = m.group(2)
    return out
CAT_LABEL = _category_labels()
CAT_ORDER = list(CAT_LABEL)          # lifecycle order as the spec states it

def all_reqs():
    for name in ["national"] + sorted(req_state_docs):
        for r in req_docs.get(name, {}).get("requirements", []):
            yield name, r

# state-instrument alias -> {akn path, title}, per state (a cite's alias is state-local)
state_alias = {}
for _sid, _s in states.items():
    state_alias[_sid] = {}
    for _cat in ("amendments", "rules", "notifications"):
        for _it in _s.get(_cat, {}).get("items", []):
            if _it.get("alias") and _it.get("akn"):
                state_alias[_sid][_it["alias"]] = {"akn": _it["akn"], "title": _it.get("title")}

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
  "requirement_category": [c for c in CAT_ORDER if any(r.get("category") == c for _, r in all_reqs())]
                          + uniq([r.get("category") for _, r in all_reqs() if r.get("category") not in CAT_ORDER]),
  "requirement_level": uniq([r.get("level") for _, r in all_reqs()]),
  "requirement_status": uniq([r.get("status") for _, r in all_reqs()]),
  "requirement_derived_from": uniq([r.get("derivedFrom") for _, r in all_reqs()]),
  "requirement_binds_artifact": uniq([(r.get("binds") or {}).get("artifact") for _, r in all_reqs()]),
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

def national_process():
    np = prof.get("national_process")
    if not np: return None
    return {"summary": np.get("summary"),
            "stages": [{"id": st.get("id"), "stage": st.get("stage"),
                        "prescribed": (st.get("timing") or {}).get("prescribed"),
                        "steps": [sp.get("t") for sp in st.get("steps", [])]}
                       for st in np.get("stages", [])]}

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
    out = {"name": s.get("name", jur_name.get(sid, sid)), "as_of": s.get("as_of"),
           "process_source": "own" if stages else "national (inherited)",
           "story": {"summary": story.get("summary"), "roles": roles, "process": stages},
           "vocabulary": vocab}
    if s.get("institutions"): out["institutions"] = s["institutions"]   # police + courts (grounded)
    return out

_stale_authority = []      # cites that did not resolve to a provision; these fail the build

def resolve_authority(scope, c, rid=None):
    """Resolve one authority cite to the provision it names.

    A cite is either national - {l, n} where n is `<alias>:<eId>` in the profile
    sources - or state - {l, s, e} where s is an instrument alias declared in that
    state's layer. Either way it comes back with the same keys, so an agent reads
    one shape: where the obligation is written, and what that provision is called.
    """
    out = {"cite": c.get("l"), "scope": None, "ref": None, "instrument": None,
           "num": None, "heading": None, "akn": None, "deep_link": None}
    if c.get("n"):
        a, _, eid = c["n"].partition(":")
        src = SRC.get(a, {})
        out.update(scope="national", ref=c["n"], instrument=src.get("title"),
                   akn=src.get("file"), deep_link=dl_provision(c["n"]))
        sec = akn_text(src.get("file", ""), eid) if src.get("file") else None
    elif c.get("s"):
        inst = state_alias.get(scope, {}).get(c["s"], {})
        out.update(scope=scope, ref="%s:%s" % (c["s"], c.get("e") or ""),
                   instrument=inst.get("title"), akn=inst.get("akn"))
        sec = akn_text(inst.get("akn", ""), c.get("e") or "") if inst.get("akn") else None
    else:
        sec = None
    if sec: out.update(num=sec.get("num"), heading=sec.get("heading"))
    else:
        _stale_authority.append("%s: authority %r (%s) does not resolve to a provision in %s"
                                % (rid, c.get("l"), out["ref"] or "?", out["akn"] or "?"))
    return out

def resolve_requirement(scope, r):
    return {"id": r.get("id"), "category": r.get("category"),
            "category_label": CAT_LABEL.get(r.get("category")),
            "level": r.get("level"), "statement": r.get("statement"), "why": r.get("why"),
            "authority": [resolve_authority(scope, c, r.get("id")) for c in r.get("authority", [])],
            "binds": r.get("binds"), "how": r.get("how"), "test": r.get("test"),
            "derivedFrom": r.get("derivedFrom"), "status": r.get("status"),
            "tightens": r.get("tightens"), "tightens_hint": r.get("tightens_hint"),
            "relatedTo": r.get("relatedTo", [])}

def resolve_req_doc(scope):
    d = req_docs[scope]
    items = [resolve_requirement(scope, r) for r in d.get("requirements", [])]
    return {"scope": d.get("scope", scope), "title": d.get("title"), "note": d.get("note"),
            "count": len(items),
            "by_category": {c: sum(1 for i in items if i["category"] == c)
                            for c in ENUMS["requirement_category"]
                            if any(i["category"] == c for i in items)},
            "requirements": items}

def requirements_layer():
    if not req_docs: return None
    every = [r for _, r in all_reqs()]
    def tally(key):
        return {v: sum(1 for r in every if (r.get(key) == v)) for v in ENUMS["requirement_" + key.lower()]}
    return {
      "_about": "The normative layer. Everything else in this bundle is descriptive - it says what "
                "the law provides. These are statements that BIND a system, each derived from a "
                "provision that is named and resolved in `authority`, each with a `test` you can "
                "run against a screen, a schema or a workflow. `national` binds every state; a "
                "state entry adds only what that state's own instruments require, or where it "
                "makes a national requirement stricter (named in `tightens`). The layering is kept "
                "rather than flattened, because a rule from central law is stated once.",
      "counts": {"total": len(every), "national": len(req_docs.get("national", {}).get("requirements", [])),
                 "by_state": {s: len(req_docs[s].get("requirements", [])) for s in sorted(req_state_docs)},
                 "by_level": tally("level"), "by_status": tally("status"),
                 "by_derived_from": {v: sum(1 for r in every if r.get("derivedFrom") == v)
                                     for v in ENUMS["requirement_derived_from"]},
                 "by_category": {c: sum(1 for r in every if r.get("category") == c)
                                 for c in ENUMS["requirement_category"]}},
      "categories": [{"code": c, "covers": CAT_LABEL.get(c),
                      "count": sum(1 for r in every if r.get("category") == c)}
                     for c in ENUMS["requirement_category"]],
      "levels": {"_about": "RFC 2119. One obligation per requirement.", "values": ENUMS["requirement_level"]},
      "statuses": {"firm": "the instrument says so explicitly",
                   "inferred": "a reasonable reading; the reasoning is in `why`",
                   "contested": "the authorities divide, and the division is stated",
                   "withdrawn": "no longer asserted; the number is never reused"},
      "national": resolve_req_doc("national") if "national" in req_docs else None,
      "states": {s: resolve_req_doc(s) for s in sorted(req_state_docs)},
    }

REQUIREMENTS = requirements_layer()

def relationships():
    t2p = [{"term": w, "provision": v.get("ref")} for w, v in prof["terms"].items() if v.get("ref")]
    n2u = [{"note": n["id"], "changed": n.get("impact", {}).get("changed"),
            "changes": n.get("impact", {}).get("changes", [])} for n in notes]
    xs  = [{"from_note": n["id"], "to_note": c.get("noteId"), "relation": c.get("relation"),
            "note": c.get("note")} for n in notes for c in n.get("compare", [])]
    r2p = [{"requirement": r["id"], "scope": scope, "provision": c["n"]}
           for scope, r in all_reqs() for c in r.get("authority", []) if c.get("n")]
    tgt = [{"requirement": r["id"], "scope": scope, "tightens": r["tightens"]}
           for scope, r in all_reqs() if r.get("tightens")]
    return {"term_to_provision": t2p, "note_to_units": n2u, "cross_state_compare": xs,
            "requirement_to_provision": r2p, "requirement_tightens_national": tgt}

bundle = {
  "_about": "Denormalized, agent-facing bundle of the DRISTI domain model for one case type. "
            "Generated from the data files by scripts/generate_agent_artifacts.py - do not edit by hand. "
            "Deep links are app URL fragments (append to the site root, e.g. https://<site>/#...).",
  "case_type": {"id": PROFILE, "title": prof.get("title"), "name": cfg["case_types"][0].get("name"),
                "act": cfg["case_types"][0].get("act"), "blurb": cfg["case_types"][0].get("blurb")},
  "as_of": prof.get("as_of"), "maintained_by": prof.get("maintained_by"),
  "transition_date": prof.get("transition_date"), "ref_format": prof.get("ref_format"),
  "national": {"acts": resolve_provisions(), "vocabulary": resolve_national_vocab(),
               "process": national_process(), "institutions": prof.get("national_institutions")},
  "jurisdictions": [{"id": j["id"], "name": j["name"],
                     "has_state_layer": j["id"] in states,
                     "process_source": "own" if (states.get(j["id"], {}).get("story", {}).get("process")) else "national (inherited)"}
                    for j in cfg.get("jurisdictions", [])],
  "states": {sid: resolve_state(sid, s) for sid, s in states.items()},
  "requirements": REQUIREMENTS,
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
def md_requirements(w):
    """The normative layer, grouped by scope then category."""
    R = REQUIREMENTS
    if not R: return
    c = R["counts"]
    w("")
    w("## Normative requirements - what a system MUST do")
    w("")
    w("Everything else here is descriptive: it says what the law provides, and a description "
      "validates nothing. This section is normative. Each requirement binds a system, names the "
      "provision it comes from, and carries a test you can run against a screen, a schema or a "
      "workflow. Full records, with the authority resolved to its section number and heading, are "
      "in `%s.json` under `requirements`; the source files are `data/requirements/*.json`." % PROFILE)
    w("")
    w("**%d requirements**: %d national (binding every state), plus %s. A state file never restates "
      "a national requirement - it adds only what its own instruments require, or where it makes a "
      "national one stricter, and then it names that requirement in `tightens`." %
      (c["total"], c["national"],
       ", ".join("%d %s" % (n, bundle["states"].get(s, {}).get("name", s))
                 for s, n in c["by_state"].items())))
    w("")
    w("By level: " + " · ".join("%s %d" % (k, v) for k, v in c["by_level"].items() if v) +
      ". By status: " + " · ".join("%s %d" % (k, v) for k, v in c["by_status"].items() if v) +
      ". Derived from: " + " · ".join("%s %d" % (k, v) for k, v in c["by_derived_from"].items() if v) + ".")

    def block(doc, title):
        w(""); w("### %s" % title)
        if doc.get("note"): w(""); w(doc["note"])
        for cat, n in doc["by_category"].items():
            w(""); w("#### %s - %s (%d)" % (cat, CAT_LABEL.get(cat, ""), n))
            for r in doc["requirements"]:
                if r["category"] != cat: continue
                w("")
                w("**%s** · %s · %s · from %s" % (r["id"], r["level"], r["status"], r["derivedFrom"]))
                w("")
                w("%s" % r["statement"])
                w("")
                w("- *why* - %s" % (r["why"] or ""))
                for a in r["authority"]:
                    place = " ".join(x for x in [a.get("num"), a.get("heading")] if x)
                    link = " [open](%s)" % a["deep_link"] if a.get("deep_link") else ""
                    w("- *authority* - %s (`%s`%s)%s" %
                      (a.get("cite") or "", a.get("ref") or "",
                       " - " + place if place else "", link))
                b = r.get("binds") or {}
                w("- *binds* - %s: %s" % (b.get("artifact") or "", b.get("target") or ""))
                if r.get("how"): w("- *how* - %s" % r["how"])
                w("- *test* - %s" % (r["test"] or ""))
                if r.get("tightens"): w("- *tightens* - %s" % r["tightens"])
                elif r.get("tightens_hint"): w("- *tightens* - (national requirement not yet numbered) %s" % r["tightens_hint"])
                if r.get("relatedTo"): w("- *related* - %s" % ", ".join(r["relatedTo"]))

    if R.get("national"):
        block(R["national"], "National - binds every state (%d)" % R["national"]["count"])
    for sid, doc in R["states"].items():
        block(doc, "%s - added by its own instruments (%d)" %
              (bundle["states"].get(sid, {}).get("name", sid), doc["count"]))

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
    md_requirements(w)
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
    npr = bundle["national"].get("process")
    if npr:
        w(""); w("## Prescribed process (central law - every state inherits this)")
        if npr.get("summary"): w(""); w(npr["summary"])
        for stg in npr["stages"]:
            w(""); w("**%s**%s" % (stg["stage"], (" - _prescribed: %s_" % stg["prescribed"]) if stg.get("prescribed") else ""))
            for step in stg["steps"]: w("- %s" % step)
    inst = bundle["national"].get("institutions")
    if inst:
        w(""); w("## Institutions - police & courts (central baseline; states add their own)")
        P = inst.get("police") or {}
        if P.get("ranks"):
            w(""); w("**Police ranks (senior to junior):** " + " > ".join(r["name"] for r in P["ranks"]))
        if P.get("units"):
            w("**Police units:** " + " > ".join(u["name"] for u in P["units"]))
        J = inst.get("judiciary") or {}
        if J.get("tiers"):
            w("**Court hierarchy (apex to trial):** " + " > ".join(t["name"] for t in J["tiers"]))
        if J.get("roles"):
            w("**Court roles:** " + ", ".join(r["name"] for r in J["roles"]))
        w(""); w("_Each rank/tier/role carries its provision cite, alternate names, responsibility and entry route in the JSON bundle (national.institutions) and, fully grounded with state cites, in each state layer's `institutions`._")
    for sid, st in bundle["states"].items():
        w("")
        w("## State layer - %s (process: %s)" % (st["name"], st.get("process_source")))
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
    w("| `data/requirements/national.json` | the normative layer, central: what a system MUST do, binding every state |")
    w("| `data/requirements/<state>.json` | the normative layer, per state: only what that state's own instruments add, or tighten |")
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
    R = REQUIREMENTS
    if R:
        c = R["counts"]
        w("## Requirements - the normative layer")
        w("")
        w("**%d requirements** across %d files: %d in `national.json`, %s. Every field is described "
          "in `data/requirements/README.md`; the structure is fixed by "
          "`data/schema/requirement.schema.json`; all of them, with each `authority` cite resolved "
          "to its section number and heading, are joined into `domain/%s.json` under `requirements`." %
          (c["total"], 1 + len(c["by_state"]), c["national"],
           ", ".join("%d in `%s.json`" % (n, s) for s, n in c["by_state"].items()), PROFILE))
        w("")
        w("| field | meaning |")
        w("|---|---|")
        w("| `id` | `REQ-<CAT>-<NNN>` national, `REQ-<STATE>-<CAT>-<NNN>` state. Stable, never renumbered. |")
        w("| `level` | RFC 2119 force of the obligation. One obligation per requirement. |")
        w("| `statement` | what the system must do, in one sentence. |")
        w("| `why` | the failure mode: what goes wrong in a real case if the system does not do this. |")
        w("| `authority` | the provision it is derived from: `{l,n}` national, `{l,s,e}` state instrument. A requirement with no resolvable authority is not a requirement. |")
        w("| `binds` | `{artifact, target}` - the thing in a system this constrains. |")
        w("| `how` | populated only where the law prescribes the method; `null` marks where a designer is free. |")
        w("| `test` | the acceptance criterion - how you would check a screen, a schema or a workflow. |")
        w("| `derivedFrom` | the kind of source it came from. |")
        w("| `status` | how firmly it is asserted. |")
        w("| `tightens` | for a state requirement, the national requirement it makes stricter. |")
        w("| `relatedTo` | other requirement ids that bear on the same point. |")
        w("")
        w("Categories in use:")
        w("")
        w("| code | covers | count |")
        w("|---|---|---|")
        for cat in R["categories"]:
            w("| `%s` | %s | %d |" % (cat["code"], cat.get("covers") or "", cat["count"]))
        w("")
        w("Status: " + " · ".join("`%s` %s" % (k, R["statuses"].get(k, "")) for k in ENUMS["requirement_status"]) + ".")
        w("")
    w("## Enumerations (as used in the data)")
    labels={"provision_tier":"`provisions[].tier`","vocab_pos":"`terms[].pos`",
            "vocab_role":"`terms[].role`","story_role_cat":"`story.roles.items[].cat`",
            "verification_status":"`verification.claims[].status`","compare_relation":"`compare[].relation`",
            "vocab_group_national":"national vocab `group`","domain":"`sources[].domain` / `domain_labels`",
            "requirement_category":"requirements `category`","requirement_level":"requirements `level`",
            "requirement_status":"requirements `status`","requirement_derived_from":"requirements `derivedFrom`",
            "requirement_binds_artifact":"requirements `binds.artifact`"}
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
 "requirement.schema.json": {
   "$schema": D, "title": "DRISTI requirements file (data/requirements/*.json)",
   "description": "The normative layer: statements that bind a system, each derived from a named "
                  "provision and each with a test. national.json binds every state; a state file "
                  "adds only what its own instruments require, or tightens.",
   "type": "object", "required": ["scope", "title", "requirements"],
   "properties": {
     "scope": {"type": "string", "description": "'national' or the state id"},
     "title": {"type": "string"}, "note": {"type": "string"},
     "requirements": {"type": "array", "items": {"type": "object",
        "required": ["id", "category", "level", "statement", "why", "authority", "binds",
                     "test", "derivedFrom", "status"],
        "properties": {
          "id": {"type": "string", "pattern": "^REQ-([A-Z]{2}-)?[A-Z]{3}-[0-9]{3}$"},
          "category": enum("requirement_category"),
          "level": enum("requirement_level"),
          "statement": {"type": "string"}, "why": {"type": "string"},
          "authority": {"type": "array", "items": {"type": "object",
             "required": ["l"], "properties": {
               "l": {"type": "string", "description": "the cite as a reader would write it"},
               "n": {"type": "string", "pattern": "^[a-z0-9]+:[A-Za-z0-9_]+$",
                     "description": "national provision, <alias>:<eId>"},
               "s": {"type": "string", "description": "state-instrument alias"},
               "e": {"type": "string", "description": "eId within that instrument"}},
             "anyOf": [{"required": ["n"]}, {"required": ["s"]}]}},
          "binds": {"type": "object", "required": ["artifact", "target"], "properties": {
             "artifact": enum("requirement_binds_artifact"), "target": {"type": "string"}}},
          "how": {"type": ["string", "null"]},
          "test": {"type": "string"},
          "derivedFrom": enum("requirement_derived_from"),
          "status": enum("requirement_status"),
          "tightens": {"type": ["string", "null"]},
          "tightens_hint": {"type": ["string", "null"]},
          "relatedTo": {"type": "array", "items": {"type": "string"}}}}}}},
}
for name, sch in schemas.items():
    json.dump(sch, open(os.path.join(SCHEMA, name), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(os.path.join(SCHEMA, name), "a").write("\n")

# ---------------------------------------------------------------- llms.txt
def llms_txt():
    st_files = " · ".join("[/data/state/%s.json](/data/state/%s.json)" % (s, s) for s in states)
    R = REQUIREMENTS or {}
    rc = R.get("counts", {})
    req_lines = []
    if R:
        req_lines = [
          "## The normative layer - what a system MUST do (%d requirements)" % rc["total"],
          "",
          "The rest of the corpus is descriptive: it says what the law provides, and a description "
          "validates nothing. These are statements that BIND a system - each derived from a named "
          "provision, each with a `test` you can run against a screen, a schema or a workflow. If "
          "you are building or auditing a system for this case type, start here.",
          "",
          "- [/data/requirements/national.json](/data/requirements/national.json): %d requirements "
          "derived from central law and Supreme Court case law. **Binds every state.**" % rc["national"],
        ] + [
          "- [/data/requirements/%s.json](/data/requirements/%s.json): %d requirements added by %s's "
          "own instruments, or where one of them tightens a national requirement." %
          (s, s, n, bundle["states"].get(s, {}).get("name", s)) for s, n in rc["by_state"].items()
        ] + [
          "- [/data/requirements/README.md](/data/requirements/README.md): the spec - every field, "
          "the category codes, the id grammar.",
          "- [/data/schema/requirement.schema.json](/data/schema/requirement.schema.json): the schema.",
          "- All of them, with each `authority` cite resolved to its section number and heading, are "
          "in the bundle under `requirements`, and in the digest under \"Normative requirements\".",
          "",
        ]
    return "\n".join([
      "# DRISTI 2.0 - Domain Model",
      "",
      "> A data-driven reference of the legal domain a single court **case type** is built on. "
      "Modelled case type: **%s** (%s). The site is a static viewer that reads the corpus below "
      "at runtime; every data file is fetchable directly." % (bundle["case_type"]["name"], bundle["case_type"]["act"]),
      "",
      "For agents: start with the denormalized bundle - it joins the profile, the state layers, "
      "the field notes, the normative requirements and the Akoma Ntoso statute text into one "
      "document, each node carrying a shareable deep link (a `#...` URL fragment). Then use the "
      "schemas and data dictionary to read the raw files directly. If you are building a system "
      "rather than reading about the law, go to the normative layer below.",
      "",
      "## Start here (denormalized, everything joined)",
      "- [/domain/%s.json](/domain/%s.json): the full domain bundle as JSON." % (PROFILE, PROFILE),
      "- [/domain/%s.md](/domain/%s.md): the same as a readable digest." % (PROFILE, PROFILE),
      "- [/domain/data-dictionary.md](/domain/data-dictionary.md): field meanings and enumerations.",
      "",
      ] + req_lines + [
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
      "- [/data/schema/requirement.schema.json](/data/schema/requirement.schema.json)",
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
    w("| `public/data/schema/*.schema.json` | JSON Schemas (profile, state, field note, requirement) |")
    w("| `public/llms.txt` | site-root map for agents |")
    w("")
    if REQUIREMENTS:
        c = REQUIREMENTS["counts"]
        w("The **normative layer** is source data, not generated, and is joined into the bundle "
          "(`requirements`) and the digest:")
        w("")
        w("| source | what |")
        w("|---|---|")
        w("| `public/data/requirements/national.json` | %d requirements derived from central law and Supreme Court case law - binds every state |" % c["national"])
        for s, n in c["by_state"].items():
            w("| `public/data/requirements/%s.json` | %d requirements added by %s's own instruments, or tightening a national one |"
              % (s, n, bundle["states"].get(s, {}).get("name", s)))
        w("| `public/data/requirements/README.md` | the spec: every field, the category codes, the id grammar |")
        w("")
    w("Regenerate with `python3 scripts/generate_agent_artifacts.py` (also run in the Netlify build, so deploys never drift).")
    w("")
    w("**Enumerations in use** (data-derived):")
    w("")
    for k, vals in ENUMS.items():
        w("- `%s`: %s" % (k, ", ".join(vals)))
    w("")
    w("**Counts:** %d Acts, %d provisions, %d national terms; states: %s; %d field notes%s." % (
        len({p['act'] for p in prof['provisions']}), len(prof['provisions']), len(prof['terms']),
        ", ".join("%s (%d terms)" % (st['name'], len(st['vocabulary'])) for st in bundle['states'].values()),
        len(notes),
        ("; %d requirements (%d national + %s)" % (
            REQUIREMENTS["counts"]["total"], REQUIREMENTS["counts"]["national"],
            " + ".join("%d %s" % (n, s) for s, n in REQUIREMENTS["counts"]["by_state"].items()))
         ) if REQUIREMENTS else ""))
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

# ------------------------------------------------- self-validate the AKN corpus
# Akoma Ntoso requires @eId to be unique document-wide; `xmllint --noout` only
# checks well-formedness and never caught that. Validate every .akn.xml against
# the official akomantoso30.xsd and resolve every eId the JSON pins.
try:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import validate_akn as _va
    _schema = _va.load_schema()
    _files = sorted(_va.DATA.rglob("*.akn.xml"))
    _bad = [r for r in (_va.validate_file(p, _schema) for p in _files) if not r["valid"]]
    _n, _problems = _va.check_pins()
    if _bad or _problems:
        for r in _bad:
            print("  INVALID %s (%d errors)" % (r["path"], len(r["errors"])))
        for p in _problems:
            print("  " + p)
        raise SystemExit("AKN VALIDATION FAILED: %d invalid file(s), %d broken pin(s). "
                         "Run python3 scripts/validate_akn.py for detail."
                         % (len(_bad), len(_problems)))
    print("self-check: %d .akn.xml valid against akomantoso30.xsd, %d JSON-pinned eIds resolve"
          % (len(_files), _n))
except SystemExit:
    raise
except ImportError as e:
    print("self-check: AKN validation skipped (%s) - run scripts/validate_akn.py" % e)

# ------------------------------------------- self-validate the requirements layer
# The normative layer is only worth anything if every requirement still points at a
# live provision. Run the same checks the CLI validator runs (ids, enums, tightens,
# no state file restating a national one, every authority resolving), and additionally
# insist that each cite resolved here to a real section/article - a requirement whose
# authority has gone stale must stop the build, not ship silently.
if REQUIREMENTS:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import validate_requirements as _vr
    _rcounts, _rerrors = _vr.check()
    _cites = [a for doc in [REQUIREMENTS["national"]] + list(REQUIREMENTS["states"].values())
              if doc for r in doc["requirements"] for a in r["authority"]]
    _rerrors = list(_rerrors) + _stale_authority
    if _rerrors:
        for e in _rerrors[:40]: print("  " + e)
        if len(_rerrors) > 40: print("  ... and %d more" % (len(_rerrors) - 40))
        raise SystemExit("REQUIREMENTS VALIDATION FAILED: %d problem(s). "
                         "Run python3 scripts/validate_requirements.py for detail." % len(_rerrors))
    try:
        import jsonschema
        for _name, _doc in req_docs.items():
            jsonschema.validate(_doc, schemas["requirement.schema.json"])
    except ImportError:
        pass
    except Exception as e:
        raise SystemExit("SCHEMA VIOLATION: requirements/%s: %s: %s"
                         % (_name, type(e).__name__, str(e)[:300]))
    print("self-check: %d requirements across %d files conform to requirement.schema.json, "
          "%d authority cites resolve to a live provision"
          % (REQUIREMENTS["counts"]["total"], len(req_docs), len(_cites)))

print("generated:")
print("  public/domain/%s.json (%d acts, %d nat terms, %d states, %d notes, %d requirements)" %
      (PROFILE, len(bundle["national"]["acts"]), len(bundle["national"]["vocabulary"]),
       len(bundle["states"]), len(notes),
       REQUIREMENTS["counts"]["total"] if REQUIREMENTS else 0))
print("  public/domain/%s.md, data-dictionary.md" % PROFILE)
print("  public/data/schema/*.schema.json (%d)" % len(schemas))
print("  public/llms.txt ; README AUTO-DATA-MODEL block")
