#!/usr/bin/env python3
"""Generate the agent-facing artifacts from the live domain data.

Single source of truth = the data files under public/data (the profiles, the state
layers, the config/field-notes, the case-law datasets, and the Akoma Ntoso corpus).
This script joins them and writes, under public/ (so they deploy) and the repo:

  public/domain/<case-type>.json   denormalized bundle, ONE PER CASE TYPE - everything
                                   joined, with resolved statute text, the normative
                                   requirements layer and app deep-links
  public/domain/<case-type>.md     the same as a human/agent-readable digest
  public/domain/data-dictionary.md field dictionary + enums, derived from the data
  public/data/schema/*.schema.json JSON Schemas (structure fixed, enums data-driven)
  public/llms.txt                  site-root map pointing agents at all of the above
  README.md                        the AUTO-DATA-MODEL block, regenerated in place

Everything that is per case type (provisions, Acts, vocabulary, case law, the normative
requirements) is generated per case type; everything that is corpus-wide (the Akoma
Ntoso files, the standards layer, the policy layer, the model rules, the schemas) is
generated once and named once.

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
states = {os.path.basename(f)[:-5]: load(f)
          for f in sorted(glob.glob(rel("state", "*.json")))}
jur_name = {j["id"]: j["name"] for j in cfg.get("jurisdictions", [])}
notes = cfg.get("practice_notes", [])

# ---------------------------------------------------------------- requirements layer
# The normative layer: national.json binds every state; a <state>.json adds only what
# that state's own instruments require, or where it tightens a national requirement.
# Loaded once here, and read two ways: whole, to derive the enums the schema asserts,
# and per case type, because every requirement in it was derived against one case type
# and a case type that has not had them re-derived says so in its profile `scope`.
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
    """Every requirement in the corpus, whichever case type it was derived against."""
    for name in ["national"] + sorted(req_state_docs):
        for r in req_docs.get(name, {}).get("requirements", []):
            yield name, r

# ------------------------------------------- the two prose layers: standards + policy
# Prose, not a schema, so nothing here is joined into the bundle - the generator only
# counts and names them, so llms.txt, the data dictionary and the README can point at
# them truthfully. Loaded here with everything else because the data dictionary is
# written long before the policy layer is validated further down.
def _md_counts(path):
    """(records, group names) for one of the prose files, read the way the app reads it."""
    if not os.path.exists(path): return 0, []
    txt = re.sub(r"<!--.*?-->", "", open(path, encoding="utf-8").read(), flags=re.S)
    return len(re.findall(r"^### ", txt, re.M)), re.findall(r"^## (.+)$", txt, re.M)

STD_PATH = os.path.join(DATA, "standards", "standards-adherence.md")
STD_COUNT, STD_GROUPS = _md_counts(STD_PATH)

# The policy layer: instruments that are neither Act nor judgment, so they are Akoma
# Ntoso <doc> rather than <act> - the element the standard provides for a document type
# it does not name. policy.json is the manifest; the compliance file hangs off it, one
# record per operational obligation, each citing a clause of a document named here.
POL_PATH = os.path.join(DATA, "policy", "policy.json")
POLICY = load(POL_PATH) if os.path.exists(POL_PATH) else {"documents": []}
POL_DOCS = POLICY.get("documents", [])
AIPOL_PATH = os.path.join(DATA, "standards", "ai-policy-compliance.md")
AIPOL_COUNT, AIPOL_GROUPS = _md_counts(AIPOL_PATH)

# The model rules: a draft rule set circulated for public inputs. Not Akoma Ntoso,
# because it is not in force anywhere and <act> would assert that it is; markdown, one
# file per tab of the source document, with modelrules.json as the manifest over them.
# Counted and named here for the same reason as the two above - a layer the artifacts
# do not name is a layer an agent reads the app to discover.
MR_PATH = os.path.join(DATA, "modelrules", "modelrules.json")
MODELRULES = load(MR_PATH) if os.path.exists(MR_PATH) else {"tabs": []}
MR_TABS = MODELRULES.get("tabs", [])
for _t in MR_TABS:
    _t["_groups"], _t["_parts"] = _md_counts(os.path.join(DATA, "modelrules", _t.get("file", "")))
MR_GROUPS = sum(t["_groups"] for t in MR_TABS)

def _aipol_binds():
    """How the compliances split by who they bind - the one number a reader asks for."""
    out = {}
    if not os.path.exists(AIPOL_PATH): return out
    txt = re.sub(r"<!--.*?-->", "", open(AIPOL_PATH, encoding="utf-8").read(), flags=re.S)
    for m in re.finditer(r"^\*\*Binds\.\*\*\s*(.+?)\s*$", txt, re.M):
        out[m.group(1)] = out.get(m.group(1), 0) + 1
    return out
AIPOL_BINDS = _aipol_binds()

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

# ---------------------------------------------------------------- the case types
# The corpus models more than one case type, and an artifact that describes only the
# first of them tells an agent the rest do not exist. So everything that is per case
# type - the profile, the statute text pinned from it, the case law, the normative
# requirements - hangs off a CaseType rather than off module state, and every artifact
# below is written over the whole list.
#
# Which profiles: the config's `case_types` decide, in the order they are declared.
# There used to be a SECOND, independent ordering - a glob over the profiles directory
# - that had to agree with the config by luck; now the glob only sweeps up a profile no
# case type claims, so that it still gets a bundle instead of vanishing.
#
# What a case type does NOT have is data too. A profile records it in `scope`, keyed by
# the layer it lacks, with the reason in prose. So the rule everywhere below is: a layer
# is modelled for this case type unless that case type's own profile disclaims it, and
# where it is disclaimed the artifacts print the reason and never a zero. A zero reads
# as a measurement, and "there is effectively no reported authority on s.25" is a
# finding about the law, not a count of nothing.
def _case_type_specs():
    out, claimed = [], set()
    for ct in cfg.get("case_types", []):
        if ct.get("profile"):
            out.append(ct); claimed.add(os.path.abspath(rel(*ct["profile"].split("/"))))
    for f in sorted(glob.glob(rel("profiles", "*.profile.json"))):
        if os.path.abspath(f) not in claimed:
            out.append({"id": os.path.basename(f)[:-len(".profile.json")],
                        "profile": "profiles/" + os.path.basename(f)})
    return out

class CaseType:
    """One case type: its profile, and the layers of the corpus written for it.

    __init__ only loads. The joining happens in build(), because the enumerations are
    derived from every profile at once and have to exist before any bundle is built.
    """
    def __init__(self, ct):
        self.ct = ct
        self.rel_profile = ct["profile"]
        self.prof = load(rel(*self.rel_profile.split("/")))
        self.id = self.prof["profile"]            # the slug the artifacts are named for
        self.name = ct.get("name") or self.prof.get("title") or self.id
        self.act = ct.get("act") or ""
        self.blurb = ct.get("blurb") or ""
        self.SRC = self.prof["sources"]
        self.scope = self.prof.get("scope") or {}
        self.rel_caselaw = self.prof.get("caselaw")
        self.caselaw = load(rel(*self.rel_caselaw.split("/"))) if self.rel_caselaw else {}
        # The state layers, the field notes and the requirements are corpus files, but
        # each of them is written against a case type. A profile that disclaims one in
        # `scope` does not get it joined in - see the note above.
        self.states = {} if "state" in self.scope else states
        self.notes = [] if "state" in self.scope else notes
        self.req_docs = {} if "requirements" in self.scope else req_docs
        self.case_title = {c.get("id"): (c.get("title") or c.get("case") or c.get("name"))
                           for c in self.caselaw.get("cases", []) if c.get("id")}
        self.stale = []     # authority cites that did not resolve; these fail the build

    def has(self, layer):
        """Is `layer` modelled for this case type? Its profile says so by not disclaiming it."""
        return layer not in self.scope

    def req_scopes(self):
        """The requirements files this case type joins: national first, then states, sorted."""
        return [s for s in ["national"] + sorted(k for k in self.req_docs if k != "national")
                if s in self.req_docs]

CASES = [CaseType(ct) for ct in _case_type_specs()]

# ---------------------------------------------------------------- enums (data-driven)
# Corpus-wide, not per case type: these are the values the generated schemas assert, and
# one schema validates every profile and every state layer. Union in case-type order so
# the output does not depend on which profile was read first.
def uniq(seq):
    out=[];
    for x in seq:
        if x and x not in out: out.append(x)
    return out
_NUMBER = {1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five",
           6: "Six", 7: "Seven", 8: "Eight", 9: "Nine"}
def count_word(n):
    """Small numbers read as words in prose. Capitalised - these open sentences."""
    return _NUMBER.get(n, str(n))
def prose_list(xs):
    """a, b and c - the artifacts are read as prose, so lists in them read as prose."""
    xs = list(xs)
    if not xs: return ""
    if len(xs) == 1: return xs[0]
    return ", ".join(xs[:-1]) + " and " + xs[-1]
def every_provision(): return [p for c in CASES for p in c.prof["provisions"]]
def every_term(): return [t for c in CASES for t in c.prof["terms"].values()]
ENUMS = {
  "provision_tier": uniq([p.get("tier") for p in every_provision()]),
  "vocab_pos": uniq([v.get("pos") for v in every_term()] +
                    [t.get("pos") for s in states.values() for t in s.get("vocabulary",{}).get("terms",[])]),
  "vocab_role": uniq([v.get("role") for v in every_term()] +
                     [t.get("role") for s in states.values() for t in s.get("vocabulary",{}).get("terms",[])]),
  "story_role_cat": uniq([r.get("cat") for s in states.values()
                          for r in s.get("story",{}).get("roles",{}).get("items",[])]),
  "verification_status": uniq([c.get("status") for n in notes
                               for c in n.get("verification",{}).get("claims",[])]),
  "compare_relation": uniq([c.get("relation") for n in notes for c in n.get("compare",[])]),
  "vocab_group_national": uniq([v.get("group") for v in every_term()]),
  "domain": list((cfg.get("domain_labels") or {}).keys()),
  "requirement_category": [c for c in CAT_ORDER if any(r.get("category") == c for _, r in all_reqs())]
                          + uniq([r.get("category") for _, r in all_reqs() if r.get("category") not in CAT_ORDER]),
  "requirement_level": uniq([r.get("level") for _, r in all_reqs()]),
  "requirement_status": uniq([r.get("status") for _, r in all_reqs()]),
  "requirement_derived_from": uniq([r.get("derivedFrom") for _, r in all_reqs()]),
  "requirement_binds_artifact": uniq([(r.get("binds") or {}).get("artifact") for _, r in all_reqs()]),
}

# ---------------------------------------------------------------- denormalized bundle
def resolve_provisions(C):
    acts = {}
    for p in C.prof["provisions"]:
        a = p["act"]; s = C.SRC.get(a, {})
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

def resolve_national_vocab(C):
    out=[]
    for word, v in C.prof["terms"].items():
        ref = v.get("ref"); res=None
        if ref and ":" in ref:
            a,e = ref.split(":",1); f=C.SRC.get(a,{}).get("file","")
            sec = akn_text(f,e) if f else None
            if sec: res={"act": C.SRC.get(a,{}).get("title"), "ref": ref, "num": sec["num"], "heading": sec["heading"]}
        out.append({"word": word, "ref": ref, "gloss": v.get("gloss"), "group": v.get("group"),
                    "pos": v.get("pos"), "role": v.get("role"), "aka": v.get("aka", []),
                    "source": v.get("source"), "resolved": res, "deep_link": dl_term(list(jur_name)[0] if jur_name else "kerala", word)})
    return out

def national_process(C):
    np = C.prof.get("national_process")
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

def resolve_authority(C, scope, c, rid=None):
    """Resolve one authority cite to the provision it names.

    A cite is either national - {l, n} where n is `<alias>:<eId>` in the profile
    sources - or state - {l, s, e} where s is an instrument alias declared in that
    state's layer. Either way it comes back with the same keys, so an agent reads
    one shape: where the obligation is written, and what that provision is called.
    The national half resolves against the sources of the case type the requirement
    belongs to, which is the only profile that has undertaken to pin those Acts.
    """
    out = {"cite": c.get("l"), "scope": None, "ref": None, "instrument": None,
           "num": None, "heading": None, "akn": None, "deep_link": None}
    if c.get("n"):
        a, _, eid = c["n"].partition(":")
        src = C.SRC.get(a, {})
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
        C.stale.append("%s: authority %r (%s) does not resolve to a provision in %s"
                       % (rid, c.get("l"), out["ref"] or "?", out["akn"] or "?"))
    return out

NOTE_TITLE = {n.get("id"): n.get("serial") for n in notes if n.get("id")}

def resolve_requirement(C, scope, r):
    return {"id": r.get("id"), "category": r.get("category"),
            "category_label": CAT_LABEL.get(r.get("category")),
            "level": r.get("level"), "statement": r.get("statement"), "why": r.get("why"),
            "authority": [resolve_authority(C, scope, c, r.get("id")) for c in r.get("authority", [])],
            "binds": r.get("binds"), "how": r.get("how"), "test": r.get("test"),
            "derivedFrom": r.get("derivedFrom"), "status": r.get("status"),
            "statusReason": r.get("statusReason"),
            # Denormalized so a consumer reads the source's name without joining back
            # to the case-law and field-note datasets itself.
            "cases": [{"id": c, "title": C.case_title.get(c)} for c in (r.get("cases") or [])],
            "notes": [{"id": n, "title": NOTE_TITLE.get(n)} for n in (r.get("notes") or [])],
            "tightens": r.get("tightens"), "tightens_hint": r.get("tightens_hint"),
            "relatedTo": r.get("relatedTo", [])}

def resolve_req_doc(C, scope):
    d = C.req_docs[scope]
    items = [resolve_requirement(C, scope, r) for r in d.get("requirements", [])]
    return {"scope": d.get("scope", scope), "title": d.get("title"), "note": d.get("note"),
            "count": len(items),
            "by_category": {c: sum(1 for i in items if i["category"] == c)
                            for c in ENUMS["requirement_category"]
                            if any(i["category"] == c for i in items)},
            "requirements": items}

def requirements_layer(C):
    if not C.req_docs: return None
    every = [r for name in C.req_scopes() for r in C.req_docs[name].get("requirements", [])]
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
      "counts": {"total": len(every), "national": len(C.req_docs.get("national", {}).get("requirements", [])),
                 "by_state": {s: len(C.req_docs[s].get("requirements", [])) for s in sorted(req_state_docs)},
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
      "national": resolve_req_doc(C, "national") if "national" in C.req_docs else None,
      "states": {s: resolve_req_doc(C, s) for s in sorted(req_state_docs)},
    }

def relationships(C):
    t2p = [{"term": w, "provision": v.get("ref")} for w, v in C.prof["terms"].items() if v.get("ref")]
    n2u = [{"note": n["id"], "changed": n.get("impact", {}).get("changed"),
            "changes": n.get("impact", {}).get("changes", [])} for n in C.notes]
    xs  = [{"from_note": n["id"], "to_note": c.get("noteId"), "relation": c.get("relation"),
            "note": c.get("note")} for n in C.notes for c in n.get("compare", [])]
    reqs = [(scope, r) for scope in C.req_scopes()
            for r in C.req_docs[scope].get("requirements", [])]
    r2p = [{"requirement": r["id"], "scope": scope, "provision": c["n"]}
           for scope, r in reqs for c in r.get("authority", []) if c.get("n")]
    tgt = [{"requirement": r["id"], "scope": scope, "tightens": r["tightens"]}
           for scope, r in reqs if r.get("tightens")]
    return {"term_to_provision": t2p, "note_to_units": n2u, "cross_state_compare": xs,
            "requirement_to_provision": r2p, "requirement_tightens_national": tgt}

def build_bundle(C):
    """Join everything this case type has into one document.

    A layer the case type does not have is `null`, never an empty list and never a
    zero: `scope` alongside says which layers those are and why. An agent that reads
    `case_law: null` and then `scope.caselaw` learns something true about s.25 rather
    than mistaking silence for an empty dataset.
    """
    C.R = requirements_layer(C)
    return {
      "_about": "Denormalized, agent-facing bundle of the DRISTI domain model for ONE case type. "
                "The corpus models %s of them; each has its own bundle under /domain/, and /llms.txt "
                "lists them. Generated from the data files by scripts/generate_agent_artifacts.py - do not "
                "edit by hand. A null layer is one this case type does not model, and `scope` says "
                "why. `enumerations` and the schemas are corpus-wide, not per case type. Deep links "
                "are app URL fragments (append to the site root, e.g. https://<site>/#...)."
                % count_word(len(CASES)).lower(),
      "case_type": {"id": C.id, "title": C.prof.get("title"), "name": C.name,
                    "act": C.act, "blurb": C.blurb, "profile": "data/" + C.rel_profile},
      "also_modelled": [{"id": o.id, "name": o.name, "act": o.act,
                         "bundle": "/domain/%s.json" % o.id} for o in CASES if o is not C],
      "scope": C.scope or None,
      "as_of": C.prof.get("as_of"), "maintained_by": C.prof.get("maintained_by"),
      "transition_date": C.prof.get("transition_date"), "ref_format": C.prof.get("ref_format"),
      "counts": case_counts(C),
      "national": {"acts": resolve_provisions(C), "vocabulary": resolve_national_vocab(C),
                   "process": national_process(C), "institutions": C.prof.get("national_institutions")},
      "jurisdictions": [{"id": j["id"], "name": j["name"],
                         "has_state_layer": j["id"] in C.states,
                         "process_source": "own" if (C.states.get(j["id"], {}).get("story", {}).get("process")) else "national (inherited)"}
                        for j in cfg.get("jurisdictions", [])] if C.states else None,
      "states": {sid: resolve_state(sid, s) for sid, s in C.states.items()} if C.states else None,
      "requirements": C.R,
      "practice_notes": C.notes if C.states else None,
      "case_law": {"topics": C.caselaw.get("topics", []), "cases": C.caselaw.get("cases", [])}
                  if C.caselaw else None,
      "enumerations": ENUMS,
      "relationships": relationships(C),
    }

def case_counts(C):
    """The numbers that are this case type's own. null = the layer is not modelled."""
    return {"_about": "Per case type. Corpus-wide counts (Akoma Ntoso files, standards, "
                      "policy documents, model rules) are in /domain/data-dictionary.md. "
                      "null means the layer is not modelled here; see `scope`.",
            "acts": len({p["act"] for p in C.prof["provisions"]}),
            "provisions": len(C.prof["provisions"]),
            "terms": len(C.prof["terms"]),
            "edges": len(C.prof.get("edges") or []),
            "judgments": len(C.caselaw.get("cases", [])) if C.caselaw else None,
            "requirements": C.R["counts"]["total"] if C.R else None,
            "state_layers": len(C.states) if C.states else None,
            "field_notes": len(C.notes) if C.states else None}

os.makedirs(OUT, exist_ok=True)
os.makedirs(SCHEMA, exist_ok=True)
for C in CASES:
    C.bundle = build_bundle(C)
    p = os.path.join(OUT, C.id + ".json")
    json.dump(C.bundle, open(p, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(p, "a").write("\n")

# The requirements files sit at the top of data/, but every one of them was derived
# against a single case type. Where the artifacts describe the layer once - the data
# dictionary, llms.txt, the README - they describe it as belonging to that case type
# and say so, rather than implying it covers the corpus.
REQ_CASE = next((C for C in CASES if C.R), None)

# ---------------------------------------------------------------- markdown digest
def md_requirements(C, w):
    """The normative layer, grouped by scope then category."""
    R, bundle, PROFILE = C.R, C.bundle, C.id
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

# What a `scope` key means when a profile disclaims a layer. The reason is the profile's
# own prose and is printed verbatim; this only names the layer in the reader's language.
SCOPE_LABEL = {"state": "State layers", "caselaw": "Case law",
               "requirements": "Normative requirements", "vocabulary": "State vocabulary"}

def joins_phrase(C):
    """What this case type's bundle actually joins - named, so the sentence stays true
    when a case type has no state layer, no case law or no requirements."""
    return prose_list(["the relevance profile"]
                      + (["the state layers", "the field notes"] if C.states else [])
                      + (["the case law"] if C.caselaw else [])
                      + (["the normative requirements"] if C.R else [])
                      + ["the resolved Akoma Ntoso text"])

def missing_phrase(C):
    """The layers this case type does not model, as prose: 'no case law and no ...'."""
    return prose_list("no " + SCOPE_LABEL.get(k, k).lower() for k in C.scope)

def md_digest(C):
    L=[]; w=L.append
    bundle, PROFILE = C.bundle, C.id
    ct=bundle["case_type"]
    cnt=bundle["counts"]
    w("# DRISTI domain digest - %s" % ct["name"])
    w("")
    w("> %s" % (ct.get("blurb") or ""))
    w("")
    w("Case type `%s` (%s). As of %s; code transition %s. Maintained by %s." %
      (ct["id"], ct.get("act"), bundle["as_of"], bundle["transition_date"], bundle["maintained_by"]))
    w("")
    w("This digest is generated from the data - it joins %s. Each item carries a **deep link** "
      "(a URL fragment for the viewer) and a `ref` into the machine-readable bundle "
      "`%s.json`. Do not edit by hand." % (joins_phrase(C), PROFILE))
    w("")
    w("**This case type:** %d provisions across %d Acts, %d national terms%s%s%s." %
      (cnt["provisions"], cnt["acts"], cnt["terms"],
       ", %d judgments" % cnt["judgments"] if cnt["judgments"] else "",
       ", %d requirements" % cnt["requirements"] if cnt["requirements"] else "",
       ", %d state layers and %d field notes" % (cnt["state_layers"], cnt["field_notes"])
       if cnt["state_layers"] else ""))
    if bundle["also_modelled"]:
        w("")
        w("Also modelled in this corpus: %s. Each has its own bundle and digest under `/domain/`, "
          "and `/llms.txt` lists them all." %
          prose_list("**%s** (%s, `%s`)" % (o["name"], o["act"], o["id"])
                     for o in bundle["also_modelled"]))
    if bundle["scope"]:
        w("")
        w("## What this case type does not model")
        w("")
        w("Stated by the profile itself, so that an absence reads as an absence and not as a "
          "count of zero. Each paragraph is the profile's own reason, verbatim.")
        for k, why in bundle["scope"].items():
            w("")
            w("**%s.** %s" % (SCOPE_LABEL.get(k, k), why))
    md_requirements(C, w)
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
    for sid, st in (bundle["states"] or {}).items():
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
    if C.notes:
        w("")
        w("## Local practice - field notes")
    for n in C.notes:
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
    if C.caselaw.get("cases"):
        w(""); w("## Case law")
        for c in C.caselaw["cases"]:
            w("- **%s** (%s) - %s" % (c.get("title") or c.get("name") or c.get("id"),
                                      c.get("year") or "", (c.get("holding") or c.get("summary") or "")[:200]))
    w("")
    return "\n".join(L)

for C in CASES:
    open(os.path.join(OUT, C.id + ".md"), "w", encoding="utf-8").write(md_digest(C))

# ------------------------------------------------- self-validate the case types
# Every artifact below is written over the whole list, and the two things that would
# silently corrupt that are a duplicate id - two case types writing the same bundle
# file, the second erasing the first - and a `scope` key nobody has a label for, which
# would print the raw key at a reader and, worse, disclaim nothing: an unrecognised key
# gates no layer, so the case type would still be shown as having what it says it lacks.
# A profile that both names a case-law dataset and disclaims case law is the same fault
# read from the other end. All three stop the build.
_ct_errors = []
_seen_ids = {}
for C in CASES:
    if C.id in _seen_ids:
        _ct_errors.append("two case types both generate %s.json: %s and %s"
                          % (C.id, _seen_ids[C.id], C.rel_profile))
    _seen_ids[C.id] = C.rel_profile
    for k in C.scope:
        if k not in SCOPE_LABEL:
            _ct_errors.append("%s: profile `scope` names %r, which is not a layer this generator "
                              "knows how to withhold (known: %s)"
                              % (C.id, k, ", ".join(SCOPE_LABEL)))
    if C.rel_caselaw and "caselaw" in C.scope:
        _ct_errors.append("%s: profile declares caselaw %r and also disclaims case law in `scope`"
                          % (C.id, C.rel_caselaw))
if _ct_errors:
    for _e in _ct_errors: print("  " + _e)
    raise SystemExit("CASE TYPES FAILED: %d problem(s)." % len(_ct_errors))
print("self-check: %d case type%s, each with its own bundle and digest%s"
      % (len(CASES), "" if len(CASES) == 1 else "s",
         "; " + ", ".join("%s withholds %s" % (C.id, ", ".join(sorted(C.scope))) for C in CASES if C.scope)
         if any(C.scope for C in CASES) else ""))

# ---------------------------------------------------------------- data dictionary
def data_dictionary():
    L=[]; w=L.append
    w("# DRISTI data dictionary")
    w("")
    w("Generated from the data - the field meanings and the **enumerations are derived from "
      "what the data actually uses**, so this cannot drift. Structural detail (which fields "
      "are required) lives in the JSON Schemas under `data/schema/`.")
    w("")
    w("## Case types")
    w("")
    w("%s case type%s modelled. A profile, a bundle and a digest are per case type; the Akoma "
      "Ntoso corpus, the schemas, the standards, the policy layer and the model rules are "
      "corpus-wide and are shared by all of them." %
      (count_word(len(CASES)), " is" if len(CASES) == 1 else "s are"))
    w("")
    w("| case type | id | provisions | Acts | terms | judgments | requirements |")
    w("|---|---|---|---|---|---|---|")
    for C in CASES:
        n = C.bundle["counts"]
        none = "none - see `scope`"
        w("| %s (%s) | `%s` | %d | %d | %d | %s | %s |" %
          (C.name, C.act, C.id, n["provisions"], n["acts"], n["terms"],
           n["judgments"] if n["judgments"] else none,
           n["requirements"] if n["requirements"] else none))
    w("")
    w("Where a cell says *none*, the case type's profile declares in its `scope` block which "
      "layer it does not model and why - the reason is prose written for a reader, and it is "
      "carried into that case type's bundle (`scope`) and digest verbatim. An unmodelled layer "
      "is `null` in the bundle, never an empty list, so it cannot be read as a measurement.")
    for C in CASES:
        if not C.scope: continue
        w("")
        w("**%s** does not model %s." %
          (C.name, prose_list(SCOPE_LABEL.get(k, k).lower() for k in C.scope)))
    w("")
    w("## Files")
    w("")
    w("| file | what |")
    w("|---|---|")
    w("| `data/profiles/<case-type>.profile.json` | national relevance profile, one per case type: `sources` (Acts), `provisions` (pinned sections), `terms` (vocabulary), `edges` |")
    w("| `data/state/<state>.json` | a state layer: `vocabulary.terms`, `story.roles`, `story.process` |")
    w("| `data/config/app.config.json` | `case_types` (each naming its profile), `jurisdictions`, `practice_notes` (field notes), `domain_labels` |")
    w("| `data/caselaw/<case-type>.caselaw.json` | the case-law dataset for a case type, where there is authority to assemble one. The profile names the file in `caselaw`; a profile with no such key has none |")
    w("| `data/requirements/national.json` | the normative layer, central: what a system MUST do, binding every state. Derived against one case type%s |"
      % (" (%s)" % REQ_CASE.name if REQ_CASE else ""))
    w("| `data/requirements/<state>.json` | the normative layer, per state: only what that state's own instruments add, or tighten |")
    w("| `data/standards/standards-adherence.md` | the standards layer: the non-legal obligations a build is measured against, each with its test. Markdown, not JSON, and not joined into the bundle |")
    w("| `data/policy/policy.json` | the policy manifest: each document's issuer, status, unit of numbering, Akoma Ntoso, transcription, source PDF and source URL |")
    w("| `data/policy/akn/*.akn.xml` | the policy documents as Akoma Ntoso `<doc>`, `@name` carrying the kind (%s), addressed by `eId` in the stem each document declares - `reg_43_3` is regulation 43(3), `rule_10_3` is rule 10.3. This is what the Policy page reads |"
      % ", ".join(sorted({d.get("kind", "") for d in POL_DOCS if d.get("kind")})))
    w("| `data/policy/md/*.md` | the checked transcription each Akoma Ntoso file is converted from, by `scripts/convert_policy_akn.py` |")
    w("| `data/standards/ai-policy-compliance.md` | the operational obligations drawn out of those documents, one `##` group per document, each record citing a clause of it. The document's half and DRISTI's suggested build are separate fields and must stay so |")
    w("| `data/modelrules/modelrules.json` | the model-rules manifest: one entry per tab of the draft, in reading order, plus the source document, its status and its URL. The app builds its tab strip from this and nothing else |")
    w("| `data/modelrules/*.md` | a draft rule set, one file per tab, transcribed under the source's own numbering - `##` a Part, `###` a rule group with the source's Roman label, and the rule numbers carried through as printed. Markdown, not Akoma Ntoso, because a draft out for public inputs is not an instrument in force |")
    w("| `data/acts/akn/*.akn.xml` | the statutory text (Akoma Ntoso 3.0), addressed by `eId`. Shared: one Act serves every case type that pins it |")
    w("| `domain/<case-type>.json` / `.md` | the denormalized join of all of the above, one pair per case type: %s |"
      % ", ".join("`%s`" % C.id for C in CASES))
    w("")
    w("## Reference grammars")
    w("")
    for f in uniq([C.prof.get("ref_format") for C in CASES]):
        w("- **Provision / national term ref**: `<alias>:<eId>` (e.g. `ni:sec_138`). `alias` is a key in the profile `sources`; `eId` exists in that Act's AKN file. %s" % f)
    w("- **State cite**: `{l, s, e}` where `s` is a state-instrument alias and `e` an eId; or `{l, n}` where `n` is a national `<alias>:<eId>`.")
    w("- **Field-note impact ref**: `<state>:<unit>:<id>` (unit = term|role|process); the created unit carries the same trailing `id`.")
    w("- **App deep link**: `#<view>?state=<s>&sec=<anchor>&lens=<l>&term=<w>&note=<id>&req=<id>&std=<id>&act=<a>&eid=<e>` - append to the site root.")
    w("")
    R = REQ_CASE.R if REQ_CASE else None
    if R:
        c = R["counts"]
        w("## Requirements - the normative layer")
        w("")
        w("**%d requirements** across %d files: %d in `national.json`, %s. They are written "
          "against **%s** (`%s`) and have not been re-derived for any other case type, so they are "
          "joined into that bundle and no other. Every field is described in "
          "`data/requirements/README.md`; the structure is fixed by "
          "`data/schema/requirement.schema.json`; all of them, with each `authority` cite resolved "
          "to its section number and heading, are joined into `domain/%s.json` under `requirements`." %
          (c["total"], 1 + len(c["by_state"]), c["national"],
           ", ".join("%d in `%s.json`" % (n, s) for s, n in c["by_state"].items()),
           REQ_CASE.name, REQ_CASE.id, REQ_CASE.id))
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
    w("")
    w("Corpus-wide: the union of what every case type's data uses, because one schema "
      "validates every profile and every state layer. Each bundle carries the same set "
      "under `enumerations`.")
    w("")
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
                     "test", "derivedFrom", "status", "statusReason"],
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
          "statusReason": {"type": "string", "description":
             "why the requirement carries that status, written from the provision's text. "
             "For 'inferred' it names the gap between what the provision commands and what "
             "the requirement asks; for 'contested' it names both sides."},
          # Source shape. This schema validates the authored files under
          # data/requirements/, where a link is a bare id. The denormalized bundle in
          # domain/ resolves each id to {id, title} for consumers; see the data
          # dictionary. Ids are checked against the corpus by validate_requirements.py.
          "cases": {"type": "array", "items": {"type": "string"}, "description":
             "ids of judgments the requirement rests on, from the case-law dataset"},
          "notes": {"type": "array", "items": {"type": "string"}, "description":
             "ids of field notes the requirement rests on, from practice_notes"},
          "tightens": {"type": ["string", "null"]},
          "tightens_hint": {"type": ["string", "null"]},
          "relatedTo": {"type": "array", "items": {"type": "string"}}}}}}},
}
for name, sch in schemas.items():
    json.dump(sch, open(os.path.join(SCHEMA, name), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(os.path.join(SCHEMA, name), "a").write("\n")

# every compliance must cite; every citation must name a document in the manifest; and
# every clause it names must be an eId that document's Akoma Ntoso actually carries. A
# record failing any of the three is a link that dies in the browser, so it stops the
# build instead.
#
# All three are checked in ONE walk over the file, split at every heading. That matters:
# a `**Document.**` line belongs to the `##` above it and governs the `###` records
# below it, so the split has to break at `##` as well. Splitting only at `###` puts a
# group's Document line at the tail of the previous group's last record, and that
# record then gets checked against the wrong document - which is invisible while there
# is one group and wrong the moment there are two.
_pol_errors = []
_pol_eids = {}
for _d in POL_DOCS:
    if _d.get("akn"):
        _x = open(os.path.join(DATA, _d["akn"]), encoding="utf-8").read()
        _pol_eids[_d["id"]] = set(re.findall(r'eId="([^"]+)"', _x))
if os.path.exists(AIPOL_PATH):
    _txt = re.sub(r"<!--.*?-->", "", open(AIPOL_PATH, encoding="utf-8").read(), flags=re.S)
    _ids = {d.get("id") for d in POL_DOCS}
    _seen = {}
    _doc = None
    for _block in re.split(r"^(?=###? )", _txt, flags=re.M):
        _h3 = re.match(r"^### (.+)$", _block, re.M)
        if not _h3:
            _d2 = re.search(r"^\*\*Document\.\*\*\s*(\S+)\s*$", _block, re.M)
            if _d2: _doc = _d2.group(1)
            continue
        _name = _h3.group(1).strip()
        # the record's id is a slug of its heading and carries no group, so two records
        # sharing a heading share an anchor and a deep link lands on whichever rendered
        # first. Unique in the file, not merely inside a group.
        if _name.lower() in _seen:
            _pol_errors.append("ai-policy-compliance: two records are both headed %r" % _name)
        _seen[_name.lower()] = True
        if _doc not in _ids:
            _pol_errors.append("ai-policy-compliance: %r cites document %r, which policy.json does not name"
                               % (_name, _doc))
        _c = re.search(r"^\*\*Citation\.\*\*(.*)$", _block, re.M)
        if not _c:
            _pol_errors.append("ai-policy-compliance: %r cites no clause" % _name)
            continue
        for _cite in [c.strip() for c in _c.group(1).split("·") if c.strip()]:
            if _doc in _pol_eids and _cite not in _pol_eids[_doc]:
                _pol_errors.append("ai-policy-compliance: %r cites %s, which is not an eId in %s"
                                   % (_name, _cite, _doc))
for _d in POL_DOCS:
    for _k in ("md", "akn", "source_pdf"):
        if _d.get(_k) and not os.path.exists(os.path.join(DATA, _d[_k])):
            _pol_errors.append("policy.json: %s %s does not exist" % (_d.get("id"), _d[_k]))
if _pol_errors:
    for _e in _pol_errors[:20]: print("  " + _e)
    raise SystemExit("POLICY LAYER FAILED: %d problem(s)." % len(_pol_errors))

# ---------------------------------------------------------------- llms.txt
# The one file an agent arriving cold is guaranteed to read. It used to name the modelled
# case type in the singular, which stopped being true the moment there were two: an agent
# reading it learned about cheque dishonour and had no way to discover that transfer
# dishonour existed at all. So the case types are the spine of the file - each one named,
# with its own bundle, digest, profile and counts - and the layers they share follow.
def case_type_lines(C):
    n = C.bundle["counts"]
    made_of = ["%d provisions across %d Acts" % (n["provisions"], n["acts"]),
               "%d national terms" % n["terms"]]
    if n["edges"]: made_of.append("%d edges between them" % n["edges"])
    if n["judgments"]: made_of.append("%d judgments" % n["judgments"])
    if n["requirements"]: made_of.append("%d normative requirements" % n["requirements"])
    if n["state_layers"]: made_of.append("%d state layers" % n["state_layers"])
    L = ["### %s - %s" % (C.name, C.act), ""]
    if C.blurb: L += ["> %s" % C.blurb, ""]
    L += [
      "- [/domain/%s.json](/domain/%s.json): the full domain bundle as JSON - %s."
      % (C.id, C.id, ", ".join(made_of)),
      "- [/domain/%s.md](/domain/%s.md): the same as a readable digest." % (C.id, C.id),
      "- [/data/profiles/%s](/data/profiles/%s): the raw relevance profile - the Acts it draws "
      "on, the provisions pinned inside them, and the vocabulary."
      % (os.path.basename(C.rel_profile), os.path.basename(C.rel_profile)),
    ]
    if C.rel_caselaw:
        L += ["- [/data/%s](/data/%s): the case-law dataset, %d judgments."
              % (C.rel_caselaw, C.rel_caselaw, n["judgments"])]
    if C.scope:
        L += ["",
              "Not modelled for this case type, in the profile's own words - these are findings "
              "about the law and the corpus, not gaps left silent:"]
        for k, why in C.scope.items():
            L += ["", "- **%s.** %s" % (SCOPE_LABEL.get(k, k), why)]
    return L + [""]

def llms_txt():
    st_files = " · ".join("[/data/state/%s.json](/data/state/%s.json)" % (s, s) for s in states)
    R = REQ_CASE.R if REQ_CASE else None
    rc = R["counts"] if R else {}
    req_lines = []
    if R:
        req_lines = [
          "## The normative layer - what a system MUST do (%d requirements)" % rc["total"],
          "",
          "The rest of the corpus is descriptive: it says what the law provides, and a description "
          "validates nothing. These are statements that BIND a system - each derived from a named "
          "provision, each with a `test` you can run against a screen, a schema or a workflow. If "
          "you are building or auditing a system for **%s**, start here. They are written against "
          "that case type and have not been re-derived for any other%s." %
          (REQ_CASE.name,
           "; " + ", ".join("`%s` says so in its `scope`" % C.id for C in CASES if "requirements" in C.scope)
           if any("requirements" in C.scope for C in CASES) else ""),
          "",
          "- [/data/requirements/national.json](/data/requirements/national.json): %d requirements "
          "derived from central law and Supreme Court case law. **Binds every state.**" % rc["national"],
        ] + [
          "- [/data/requirements/%s.json](/data/requirements/%s.json): %d requirements added by %s's "
          "own instruments, or where one of them tightens a national requirement." %
          (s, s, n, (REQ_CASE.bundle["states"] or {}).get(s, {}).get("name", s))
          for s, n in rc["by_state"].items()
        ] + [
          "- [/data/requirements/README.md](/data/requirements/README.md): the spec - every field, "
          "the category codes, the id grammar.",
          "- [/data/schema/requirement.schema.json](/data/schema/requirement.schema.json): the schema.",
          "- All of them, with each `authority` cite resolved to its section number and heading, are "
          "in the `%s` bundle under `requirements`, and in its digest under \"Normative "
          "requirements\"." % REQ_CASE.id,
          "",
        ]
    return "\n".join([
      "# DRISTI 2.0 - Domain Model",
      "",
      "> A data-driven reference of the legal domain a court **case type** is built on. %s case "
      "type%s modelled: %s. Each has its own bundle, digest and profile, listed below. The site "
      "is a static viewer that reads the corpus at runtime; every data file is fetchable directly."
      % (count_word(len(CASES)), " is" if len(CASES) == 1 else "s are",
         prose_list(["**%s** (%s)" % (C.name, C.act) for C in CASES])),
      "",
      "For agents: start with the denormalized bundle for the case type you are working on - it "
      "joins that case type's profile with the Akoma Ntoso statute text, and with the state "
      "layers, the field notes and the normative requirements where that case type has them, "
      "into one document, each node carrying a shareable deep link (a `#...` URL fragment). Then "
      "use the schemas and data dictionary to read the raw files directly. Counts differ by case "
      "type and so does coverage: where a case type does not model a layer, its profile says so "
      "in `scope` and the bundle carries the reason instead of an empty list.",
      "",
      "## The case types (start here - one bundle each)",
      "",
      "Field meanings and enumerations for all of them are in "
      "[/domain/data-dictionary.md](/domain/data-dictionary.md), which also tabulates what each "
      "case type does and does not model.",
      "",
      ] + [line for C in CASES for line in case_type_lines(C)] + req_lines + [
      "## Raw data (source of truth)",
      "- Relevance profiles, one per case type: %s"
      % " · ".join("[/data/profiles/%s](/data/profiles/%s)"
                   % (os.path.basename(C.rel_profile), os.path.basename(C.rel_profile)) for C in CASES),
      "- [/data/config/app.config.json](/data/config/app.config.json): case types (each naming its profile), jurisdictions, field notes.",
      "- State layers: %s - written against %s; a case type with no state layer says so in its profile `scope`."
      % (st_files, " and ".join("**%s**" % C.name for C in CASES if C.states) or "no case type yet"),
      "- Case law: %s" % (" · ".join("[/data/%s](/data/%s)" % (C.rel_caselaw, C.rel_caselaw)
                                     for C in CASES if C.rel_caselaw) or "none in the corpus yet"),
      "- Statute corpus: %d Akoma Ntoso XML files under [/data/acts/akn/](/data/acts/akn/) (national) and /data/state/<state>/akn/, shared by every case type that pins them." % len(glob.glob(rel("acts","akn","*.akn.xml"))),
      "",
      "## Standards adherence (the non-legal layer, %d standards)" % STD_COUNT,
      "",
      "The requirements above are what the *law* compels. These are what any public digital "
      "service owes the person using it, which a court-facing one owes more heavily: "
      "accessibility, security, performance, interoperability, usability and content. Markdown "
      "rather than JSON because the content is prose; every entry carries a test and the "
      "threshold that decides it. This layer and the two below it - policy, model rules - are "
      "corpus-wide: they are not written per case type and they bind a build whichever case type "
      "it serves.",
      "",
      "- [/data/standards/standards-adherence.md](/data/standards/standards-adherence.md): "
      "%d standards across %s. The file states its own shape in a comment at the top." %
      (STD_COUNT, ", ".join(STD_GROUPS)),
      "",
      ] + ([
      "## Policy (%d document%s) and policy compliance (%d records)"
      % (len(POL_DOCS), "" if len(POL_DOCS) == 1 else "s", AIPOL_COUNT),
      "",
      "A policy is the third kind of instrument here. Akoma Ntoso has no policy document "
      "type, so each one is carried as `<doc name=\"...\">` - the element the standard "
      "provides for a document type it does not name - with @name saying which kind it is "
      "(%s), and it would be `<act>` once notified into force. The checked transcription "
      "sits in policy/md/ and the source PDF one folder over; `policy.json` is the "
      "manifest, and it also declares how each document numbers itself, which is the stem "
      "its clause eIds use: regulation 43(3) is `reg_43_3`, rule 10.3 is `rule_10_3`. The "
      "compliance file pulls out every operational obligation - anything that must be "
      "reported, disclosed, logged, registered, audited, or produced as a record - and "
      "cites the clause it comes from. Each record separates what the document requires "
      "from what DRISTI suggests building; do not read the second as the first."
      % ", ".join(sorted({d.get("kind", "") for d in POL_DOCS if d.get("kind")})),
      "",
      "- [/data/policy/policy.json](/data/policy/policy.json): the manifest - each document's "
      "issuer, status, unit of numbering, markdown, source PDF and source URL.",
      ] + [
      "- [/data/%s](/data/%s): %s (%s%s). Transcription: [/data/%s](/data/%s)."
      % (d.get("akn") or d["md"], d.get("akn") or d["md"], d.get("title", d.get("id")),
         d.get("issuer", ""), ", " + d["status"] if d.get("status") else "", d["md"], d["md"])
      for d in POL_DOCS if d.get("md")
      ] + [
      "- [/data/standards/ai-policy-compliance.md](/data/standards/ai-policy-compliance.md): "
      "%d compliance records%s, grouped by the document each one resolves against. Read as "
      "a sub-tab of Standards adherence in the viewer." %
      (AIPOL_COUNT,
       " (" + ", ".join("%d bind %s" % (n, k) for k, n in sorted(AIPOL_BINDS.items())) + ")"
       if AIPOL_BINDS else ""),
      "",
      ] if POL_DOCS else []) + ([
      "## Model rules (%d section%s across %d tab%s)"
      % (MR_GROUPS, "" if MR_GROUPS == 1 else "s", len(MR_TABS), "" if len(MR_TABS) == 1 else "s"),
      "",
      "The source is `%s`%s. Kept as markdown rather than Akoma Ntoso on purpose: it is a "
      "draft, not an instrument in force anywhere, and <act> would assert a status it does "
      "not have. It reads under Design in the viewer, beside the standards, because it is "
      "something a build can be measured against rather than something the corpus holds as "
      "law. Each tab of the source document is one file and one sub-tab; the numbering in "
      "the files is the draft's own and is never regenerated."
      % (MODELRULES.get("source", {}).get("document", "a draft rule set"),
         " (%s)" % MODELRULES["source"]["status"] if MODELRULES.get("source", {}).get("status") else ""),
      "",
      "- [/data/modelrules/modelrules.json](/data/modelrules/modelrules.json): the manifest - "
      "the tabs in reading order, and the source document behind them.",
      ] + [
      "- [/data/modelrules/%s](/data/modelrules/%s): %s (%d section%s)."
      % (t["file"], t["file"], t.get("title", t.get("id")), t["_groups"],
         "" if t["_groups"] == 1 else "s")
      for t in MR_TABS if t.get("file")
      ] + [""] if MR_TABS else []) + [
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
    w("The domain is data. For agents and tools, generated artifacts join and describe it. A "
      "bundle and a digest are **per case type**; the dictionary, the schemas and the site map "
      "cover the whole corpus:")
    w("")
    w("| artifact | what |")
    w("|---|---|")
    for C in CASES:
        w("| `public/domain/%s.json` | denormalized bundle for %s (%s) - joins %s, with deep links |"
          % (C.id, C.name, C.act, joins_phrase(C)))
        w("| `public/domain/%s.md` | the same as a readable digest%s |"
          % (C.id, ", opening with what this case type does not model" if C.scope else ""))
    w("| `public/domain/data-dictionary.md` | field meanings + enumerations (derived from the data), and what each case type does and does not model |")
    w("| `public/data/schema/*.schema.json` | JSON Schemas (profile, state, field note, requirement) - one set, validating every case type |")
    w("| `public/llms.txt` | site-root map for agents: every case type, with its bundle, digest and raw profile |")
    w("")
    if REQ_CASE:
        c = REQ_CASE.R["counts"]
        w("The **normative layer** is source data, not generated. It is written against **%s** and "
          "is joined into that case type's bundle (`requirements`) and digest%s:"
          % (REQ_CASE.name,
             "; the other case types record in their profile `scope` that it has not been derived "
             "for them" if any("requirements" in C.scope for C in CASES) else ""))
        w("")
        w("| source | what |")
        w("|---|---|")
        w("| `public/data/requirements/national.json` | %d requirements derived from central law and Supreme Court case law - binds every state |" % c["national"])
        for s, n in c["by_state"].items():
            w("| `public/data/requirements/%s.json` | %d requirements added by %s's own instruments, or tightening a national one |"
              % (s, n, (REQ_CASE.bundle["states"] or {}).get(s, {}).get("name", s)))
        w("| `public/data/requirements/README.md` | the spec: every field, the category codes, the id grammar |")
        w("")
    if STD_COUNT:
        w("The **standards layer** is the non-legal half of the same question. It is prose, so it is "
          "markdown rather than JSON and is read straight off disk by the Standards adherence page:")
        w("")
        w("| source | what |")
        w("|---|---|")
        w("| `public/data/standards/standards-adherence.md` | %d standards across %s - each with how to test it and the threshold that decides it |"
          % (STD_COUNT, ", ".join(STD_GROUPS)))
        w("")
    if POL_DOCS:
        w("The **policy layer** is the third kind of instrument: not an Act and not a judgment, so "
          "it is Akoma Ntoso `<doc>` rather than `<act>` - the element the standard provides for a "
          "document type it does not name. Each document is transcribed as markdown with its own "
          "numbering intact, converted from that transcription by `scripts/convert_policy_akn.py`, "
          "its source PDF one folder over, and the operational obligations pulled out clause by "
          "clause under Standards adherence:")
        w("")
        w("| source | what |")
        w("|---|---|")
        w("| `public/data/policy/policy.json` | the manifest: %d document%s, each with its issuer, status, unit of numbering and source |"
          % (len(POL_DOCS), "" if len(POL_DOCS) == 1 else "s"))
        for d in POL_DOCS:
            if d.get("md"):
                w("| `public/data/%s` | %s%s |" % (d["md"], d.get("title", d.get("id")),
                                                   " (%s)" % d["status"] if d.get("status") else ""))
        w("| `public/data/standards/ai-policy-compliance.md` | %d compliance records%s - what the document requires, kept separate from what DRISTI suggests building |"
          % (AIPOL_COUNT,
             " (" + ", ".join("%d bind %s" % (n, k) for k, n in sorted(AIPOL_BINDS.items())) + ")"
             if AIPOL_BINDS else ""))
        w("")
    w("Regenerate with `python3 scripts/generate_agent_artifacts.py` (also run in the Netlify build, so deploys never drift).")
    w("")
    w("**Enumerations in use** (data-derived):")
    w("")
    for k, vals in ENUMS.items():
        w("- `%s`: %s" % (k, ", ".join(vals)))
    w("")
    w("**Counts, per case type** (a layer a case type does not model is named, not counted as zero):")
    w("")
    for C in CASES:
        n = C.bundle["counts"]
        bits = ["%d Acts" % n["acts"], "%d provisions" % n["provisions"],
                "%d national terms" % n["terms"]]
        if n["edges"]: bits.append("%d edges" % n["edges"])
        if n["judgments"]: bits.append("%d judgments" % n["judgments"])
        if n["requirements"]:
            bits.append("%d requirements (%d national + %s)" % (
                n["requirements"], C.R["counts"]["national"],
                " + ".join("%d %s" % (m, s) for s, m in C.R["counts"]["by_state"].items())))
        if n["state_layers"]:
            bits.append("%d state layers" % n["state_layers"])
            bits.append("%d field notes" % n["field_notes"])
        line = ", ".join(bits)
        if C.scope:
            line += "; %s - the profile's `scope` says why for each" % missing_phrase(C)
        w("- **%s** (`%s`): %s." % (C.name, C.id, line))
    w("")
    w("**Counts, corpus-wide** (one set of files, whichever case type claims them): %d Akoma Ntoso Act files; %d state layers (%s)%s%s%s." % (
        len(glob.glob(rel("acts", "akn", "*.akn.xml"))), len(states),
        ", ".join("%s %d terms" % (s.get("name", sid), len(s.get("vocabulary", {}).get("terms", [])))
                  for sid, s in states.items()),
        "; %d standards" % STD_COUNT if STD_COUNT else "",
        ("; %d policy document%s with %d compliance records"
         % (len(POL_DOCS), "" if len(POL_DOCS) == 1 else "s", AIPOL_COUNT)) if POL_DOCS else "",
        "; %d model-rules sections across %d tabs" % (MR_GROUPS, len(MR_TABS)) if MR_TABS else ""))
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
    # Every profile, not only the first: the schema's enums are the union of what all of
    # them use, so a second case type introducing a value nobody declared has to fail here.
    for C in CASES: jsonschema.validate(C.prof, schemas["profile.schema.json"])
    for s in states.values(): jsonschema.validate(s, schemas["state.schema.json"])
    for n in notes: jsonschema.validate(n, schemas["practice-note.schema.json"])
    print("self-check: %d profiles + %d states + %d notes conform to the generated schemas" %
          (len(CASES), len(states), len(notes)))
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
#
# A cite is resolved once per case type that joins the layer, against that case type's
# own sources, so every stale cite from every case type is collected before the verdict.
if REQ_CASE:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import validate_requirements as _vr
    _rcounts, _rerrors = _vr.check()
    _cites = [a for C in CASES if C.R
              for doc in [C.R["national"]] + list(C.R["states"].values()) if doc
              for r in doc["requirements"] for a in r["authority"]]
    _rerrors = list(_rerrors) + [e for C in CASES for e in C.stale]
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
          % (REQ_CASE.R["counts"]["total"], len(req_docs), len(_cites)))

print("generated: %d case type%s" % (len(CASES), "" if len(CASES) == 1 else "s"))
for C in CASES:
    n = C.bundle["counts"]
    none = lambda v, unit: ("%d %s" % (v, unit)) if v else ("no " + unit)
    print("  public/domain/%s.json/.md (%d acts, %d provisions, %d nat terms, %s, %s, %s)" %
          (C.id, n["acts"], n["provisions"], n["terms"], none(n["judgments"], "judgments"),
           none(n["requirements"], "requirements"), none(n["state_layers"], "state layers")))
print("  public/domain/data-dictionary.md")
print("  public/data/schema/*.schema.json (%d)" % len(schemas))
print("  public/llms.txt ; README AUTO-DATA-MODEL block")
