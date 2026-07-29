#!/usr/bin/env python3
"""Validate every .akn.xml in the corpus against the official Akoma Ntoso 3.0 XSD.

The schema in schemas/akomantoso30/ is the OASIS Standard release (29 August
2018), fetched from
http://docs.oasis-open.org/legaldocml/akn-core/v1.0/os/part2-specs/schemas/

Beyond XSD validity this also reports duplicate eId values explicitly, because
that is the single failure mode the corpus has historically hit (AKN declares an
xsd:unique identity constraint named eId-<doctype> over every @eId in a
document) and the raw XSD error text for it is hard to read.

It also resolves every eId pinned from the JSON data (the state layers and the
profile) against its AKN file, so a renamed or dropped provision id shows up here
rather than as a dead link in the app.

Usage:
    python3 scripts/validate_akn.py                # whole corpus + JSON pin check
    python3 scripts/validate_akn.py path/to/f.xml  # validate specific files
    python3 scripts/validate_akn.py --quiet        # summary table only
    python3 scripts/validate_akn.py --pins-only    # just the JSON pin check

Exit status is non-zero if anything fails, so it can gate a build.
"""

from __future__ import annotations

import argparse
import sys
from collections import Counter, defaultdict
from pathlib import Path

try:
    from lxml import etree
except ImportError:  # pragma: no cover
    # Stay IMPORTABLE without lxml. Exiting here would take down any caller that
    # merely imports this module - which is how the Netlify build silently died for
    # ten commits, since a failed build makes Netlify keep serving the last deploy.
    # Callers that actually need the schema get a clean ImportError from _require().
    etree = None


def _require_lxml():
    if etree is None:
        raise ImportError("lxml is required for AKN schema validation: pip install lxml")

REPO = Path(__file__).resolve().parent.parent
SCHEMA = REPO / "schemas" / "akomantoso30" / "akomantoso30.xsd"
DATA = REPO / "public" / "data"

AKN_NS = "http://docs.oasis-open.org/legaldocml/ns/akn/3.0"


def find_files(args_paths: list[str]) -> list[Path]:
    if args_paths:
        return [Path(p).resolve() for p in args_paths]
    return sorted(DATA.rglob("*.akn.xml"))


def load_schema() -> etree.XMLSchema:
    _require_lxml()
    if not SCHEMA.exists():
        sys.exit(
            f"Akoma Ntoso schema not found at {SCHEMA}.\n"
            "Fetch it with:\n"
            "  mkdir -p schemas/akomantoso30 && cd schemas/akomantoso30 && \\\n"
            "  curl -O http://docs.oasis-open.org/legaldocml/akn-core/v1.0/os/"
            "part2-specs/schemas/akomantoso30.xsd && \\\n"
            "  curl -O http://docs.oasis-open.org/legaldocml/akn-core/v1.0/os/"
            "part2-specs/schemas/xml.xsd"
        )
    return etree.XMLSchema(etree.parse(str(SCHEMA)))


def duplicate_eids(tree: etree._ElementTree) -> list[tuple[str, list[int]]]:
    """Return [(eId, [line numbers])] for every eId used more than once."""
    seen: dict[str, list[int]] = defaultdict(list)
    for el in tree.iter():
        eid = el.get("eId")
        if eid:
            seen[eid].append(el.sourceline)
    return sorted((k, v) for k, v in seen.items() if len(v) > 1)


def duplicate_ids(tree: etree._ElementTree, attr: str) -> list[tuple[str, list[int]]]:
    seen: dict[str, list[int]] = defaultdict(list)
    for el in tree.iter():
        val = el.get(attr)
        if val:
            seen[val].append(el.sourceline)
    return sorted((k, v) for k, v in seen.items() if len(v) > 1)


def validate_file(path: Path, schema: etree.XMLSchema) -> dict:
    result = {
        "path": path,
        "wellformed": True,
        "valid": False,
        "errors": [],
        "dup_eids": [],
        "dup_guids": [],
        "dup_wids": [],
    }
    try:
        tree = etree.parse(str(path))
    except etree.XMLSyntaxError as exc:
        result["wellformed"] = False
        result["errors"] = [f"not well-formed: {exc}"]
        return result

    result["dup_eids"] = duplicate_eids(tree)
    result["dup_guids"] = duplicate_ids(tree, "GUID")
    result["dup_wids"] = duplicate_ids(tree, "wId")

    if schema.validate(tree):
        result["valid"] = True
    else:
        result["errors"] = [
            f"line {e.line}: {e.message}" for e in schema.error_log
        ]
    return result


def _eid_set(rel: str, cache: dict) -> set | None:
    if rel not in cache:
        p = DATA / rel
        cache[rel] = None if not p.exists() else {
            e.get("eId") for e in etree.parse(str(p)).iter() if e.get("eId")}
    return cache[rel]


def check_pins() -> tuple[int, list[str]]:
    """Resolve every eId pinned from the JSON data. Returns (checked, problems)."""
    import glob
    import json

    cache: dict = {}
    checked = 0
    problems: list[str] = []

    def check(src: str, rel: str, eid: str, where: str) -> None:
        nonlocal checked
        checked += 1
        s = _eid_set(rel, cache)
        if s is None:
            problems.append(f"{src}: no such AKN file {rel} (eId={eid}, {where})")
        elif eid not in s:
            problems.append(f"{src}: eId {eid!r} not found in {rel} ({where})")

    for f in sorted(glob.glob(str(DATA / "state" / "*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        for grp in ("amendments", "rules", "notifications"):
            for it in ((d.get(grp) or {}).get("items") or []):
                akn = it.get("akn")
                for k in (it.get("key") or []):
                    if k.get("eId") and akn:
                        check(f, akn, k["eId"], f"{grp}/{it.get('alias') or it.get('title')}")
        for v in ((d.get("vocabulary") or {}).get("terms") or []):
            if v.get("eId") and v.get("akn"):
                check(f, v["akn"], v["eId"], f"vocabulary/{v.get('word')}")

    for f in sorted(glob.glob(str(DATA / "profiles" / "*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        alias_file = {p["act"]: "acts/akn/" + p["file"]
                      for p in (d.get("provisions") or []) if p.get("act") and p.get("file")}
        for pr in (d.get("provisions") or []):
            if pr.get("eId") and pr.get("file"):
                check(f, "acts/akn/" + pr["file"], pr["eId"], f"provisions/{pr.get('ref')}")

        def refs(o, path):
            if isinstance(o, dict):
                for k, v in o.items():
                    if k in ("ref", "to", "before", "on_or_after") and isinstance(v, str) and ":" in v:
                        a, _, e = v.partition(":")
                        if a in alias_file and e:
                            check(f, alias_file[a], e, f"{path}.{k}={v}")
                    else:
                        refs(v, f"{path}.{k}")
            elif isinstance(o, list):
                for i, v in enumerate(o):
                    refs(v, f"{path}[{i}]")

        refs(d, "")

    return checked, problems


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("paths", nargs="*", help="specific .akn.xml files (default: whole corpus)")
    ap.add_argument("--quiet", action="store_true", help="summary table only")
    ap.add_argument("--pins-only", action="store_true", help="only run the JSON pin check")
    ap.add_argument("--max-errors", type=int, default=12, help="errors shown per file")
    args = ap.parse_args()

    if args.pins_only:
        n, problems = check_pins()
        for p in problems:
            print("  " + p)
        print(f"{n - len(problems)}/{n} JSON-pinned eIds resolve.")
        return 1 if problems else 0

    schema = load_schema()
    files = find_files(args.paths)
    if not files:
        print("No .akn.xml files found.")
        return 0

    results = [validate_file(p, schema) for p in files]

    width = max(len(str(r["path"].relative_to(REPO))) for r in results)
    failures = 0
    print(f"{'FILE'.ljust(width)}  STATUS  ERRORS  DUP-eIds")
    print("-" * (width + 26))
    for r in results:
        rel = str(r["path"].relative_to(REPO))
        status = "PASS" if r["valid"] else "FAIL"
        if not r["valid"]:
            failures += 1
        print(
            f"{rel.ljust(width)}  {status:<6}  {len(r['errors']):<6}  "
            f"{len(r['dup_eids'])}"
        )

    if not args.quiet:
        for r in results:
            if r["valid"] and not r["dup_eids"]:
                continue
            rel = str(r["path"].relative_to(REPO))
            print(f"\n=== {rel}")
            if r["dup_eids"]:
                print(f"  duplicate eId values ({len(r['dup_eids'])}):")
                for eid, lines in r["dup_eids"][: args.max_errors]:
                    print(f"    {eid}  -> lines {lines}")
                if len(r["dup_eids"]) > args.max_errors:
                    print(f"    ... and {len(r['dup_eids']) - args.max_errors} more")
            for label, key in (("GUID", "dup_guids"), ("wId", "dup_wids")):
                if r[key]:
                    print(f"  duplicate {label} values ({len(r[key])}):")
                    for val, lines in r[key][: args.max_errors]:
                        print(f"    {val}  -> lines {lines}")
            other = [e for e in r["errors"] if "Duplicate key-sequence" not in e]
            if other:
                print(f"  schema errors ({len(other)}):")
                for e in other[: args.max_errors]:
                    print(f"    {e}")
                if len(other) > args.max_errors:
                    print(f"    ... and {len(other) - args.max_errors} more")

    total = len(results)
    print(f"\n{total - failures}/{total} valid against akomantoso30.xsd (OASIS Standard).")

    if not args.paths:
        n, problems = check_pins()
        for p in problems:
            print("  " + p)
        print(f"{n - len(problems)}/{n} JSON-pinned eIds resolve.")
        if problems:
            failures += 1

    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
