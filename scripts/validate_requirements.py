#!/usr/bin/env python3
"""Validate the normative requirements layer under public/data/requirements/.

Checks, per file:
  - the shape of every requirement (required fields, allowed enums)
  - ids are well-formed for their scope and globally unique
  - every `authority` cite RESOLVES: national {l,n} against the profile sources and
    the Act's AKN; state {l,s,e} against that state's declared instruments
  - `tightens` names a real national requirement
  - a state file does not restate a national requirement (same statement text)
  - no em-dashes in authored copy (house rule; verbatim law keeps its own)

Exit 1 on any failure, so it can gate the build.

    python3 scripts/validate_requirements.py            # all files
    python3 scripts/validate_requirements.py --summary  # counts only
"""
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "public", "data")
REQ  = os.path.join(DATA, "requirements")

LEVELS   = {"MUST", "MUST NOT", "SHOULD", "SHOULD NOT", "MAY"}
STATUSES = {"firm", "inferred", "contested", "withdrawn"}
DERIVED  = {"act", "rule", "caselaw", "practice-note"}
CATS = {"LIM","NOT","FIL","SRV","EVI","PRE","JUR","TRL","CMP","SEN","APL","REC","CPY"}
STATE_CODE = {"kerala": "KL", "haryana": "HR", "gujarat": "GJ"}
REQUIRED = ["id","category","level","statement","why","authority","binds","test",
            "derivedFrom","status"]

def load(p):
    with open(p, encoding="utf-8") as f: return json.load(f)

def check():
    """Validate every requirements file.

    Returns (counts_by_file, errors). counts_by_file is None when there is no
    requirements directory yet. Importable, so the artifact generator can gate the
    build on the same checks the CLI runs.
    """
    if not os.path.isdir(REQ):
        return None, []
    prof = load(glob.glob(os.path.join(DATA, "profiles", "*.profile.json"))[0])
    sources = prof["sources"]

    # state alias -> akn path, per state
    state_alias = {}
    for f in glob.glob(os.path.join(DATA, "state", "*.json")):
        d = load(f); st = d.get("state")
        if not st: continue
        state_alias[st] = {}
        for cat in ("amendments", "rules", "notifications"):
            for it in d.get(cat, {}).get("items", []):
                if it.get("alias") and it.get("akn"):
                    state_alias[st][it["alias"]] = os.path.join(DATA, it["akn"])

    _cache = {}
    def has_eid(path, eid):
        if path not in _cache:
            try: _cache[path] = open(path, encoding="utf-8").read()
            except OSError: _cache[path] = ""
        return ('eId="%s"' % eid) in _cache[path]

    errors, counts, national_ids, national_statements = [], {}, set(), {}
    files = sorted(glob.glob(os.path.join(REQ, "*.json")))
    seen_ids = {}

    # national first, so state files can be checked against it
    files.sort(key=lambda p: 0 if os.path.basename(p) == "national.json" else 1)

    for path in files:
        name = os.path.basename(path)[:-5]
        scope = "national" if name == "national" else name
        try: doc = load(path)
        except Exception as e:
            errors.append(f"{name}: does not parse - {e}"); continue
        raw = open(path, encoding="utf-8").read()
        if "—" in raw: errors.append(f"{name}: contains an em-dash in authored copy")
        reqs = doc.get("requirements", [])
        counts[name] = len(reqs)

        for r in reqs:
            rid = r.get("id", "<no id>")
            for k in REQUIRED:
                if k not in r or r[k] in (None, "", []) and k != "authority":
                    if not (k == "authority" and r.get("status") == "withdrawn"):
                        errors.append(f"{name}/{rid}: missing required field '{k}'")
            if rid in seen_ids:
                errors.append(f"{rid}: duplicate id (also in {seen_ids[rid]})")
            seen_ids[rid] = name

            # id shape
            if scope == "national":
                m = re.fullmatch(r"REQ-([A-Z]{3})-(\d{3})", rid)
                if not m: errors.append(f"{name}/{rid}: national id must be REQ-<CAT>-<NNN>")
                elif m.group(1) not in CATS: errors.append(f"{name}/{rid}: unknown category {m.group(1)}")
                national_ids.add(rid); national_statements[r.get("statement","").strip().lower()] = rid
            else:
                code = STATE_CODE.get(scope)
                m = re.fullmatch(r"REQ-([A-Z]{2})-([A-Z]{3})-(\d{3})", rid)
                if not m: errors.append(f"{name}/{rid}: state id must be REQ-<STATE>-<CAT>-<NNN>")
                else:
                    if code and m.group(1) != code:
                        errors.append(f"{name}/{rid}: state code {m.group(1)} does not match {scope} ({code})")
                    if m.group(2) not in CATS: errors.append(f"{name}/{rid}: unknown category {m.group(2)}")
                st = r.get("statement","").strip().lower()
                if st and st in national_statements:
                    errors.append(f"{name}/{rid}: restates national {national_statements[st]} - "
                                  f"state files must not duplicate national requirements")

            if r.get("level") not in LEVELS: errors.append(f"{name}/{rid}: bad level {r.get('level')!r}")
            if r.get("status") not in STATUSES: errors.append(f"{name}/{rid}: bad status {r.get('status')!r}")
            if r.get("derivedFrom") not in DERIVED: errors.append(f"{name}/{rid}: bad derivedFrom {r.get('derivedFrom')!r}")
            if r.get("category") and rid.count("-") >= 2:
                if r["category"] not in rid.split("-"):
                    errors.append(f"{name}/{rid}: category {r['category']} not reflected in the id")

            b = r.get("binds")
            if not isinstance(b, dict) or not b.get("artifact") or not b.get("target"):
                errors.append(f"{name}/{rid}: binds must be an object with artifact and target")

            # authority must resolve
            for c in r.get("authority", []):
                if "n" in c:
                    a, _, eid = c["n"].partition(":")
                    if a not in sources: errors.append(f"{name}/{rid}: unknown national source '{a}'")
                    else:
                        p = os.path.join(DATA, sources[a]["file"])
                        if eid and not has_eid(p, eid):
                            errors.append(f"{name}/{rid}: {c['n']} does not resolve in {sources[a]['file']}")
                elif "s" in c:
                    amap = state_alias.get(scope, {})
                    p = amap.get(c["s"])
                    if not p: errors.append(f"{name}/{rid}: alias '{c['s']}' is not declared for {scope}")
                    elif c.get("e") and not has_eid(p, c["e"]):
                        errors.append(f"{name}/{rid}: {c['s']}:{c.get('e')} does not resolve")
                else:
                    errors.append(f"{name}/{rid}: authority entry has neither n nor s")

            t = r.get("tightens")
            if t and t not in national_ids:
                errors.append(f"{name}/{rid}: tightens '{t}' is not a national requirement")

    return counts, errors

def main():
    counts, errors = check()
    if counts is None:
        print("no requirements directory yet - nothing to validate"); return 0

    total = sum(counts.values())
    if "--summary" not in sys.argv:
        for f, n in counts.items(): print(f"  {f:12s} {n:4d} requirements")
    print(f"\n{total} requirements across {len(counts)} files.")
    if errors:
        print(f"\n{len(errors)} PROBLEM(S):")
        for e in errors[:60]: print("  -", e)
        if len(errors) > 60: print(f"  ... and {len(errors)-60} more")
        return 1
    print("all requirements valid: ids unique and well-formed, every authority resolves.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
