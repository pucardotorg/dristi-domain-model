#!/usr/bin/env python3
"""Shared Akoma Ntoso id helpers for the converters.

Akoma Ntoso declares an xsd:unique identity constraint (eId-<doctype>) over every
@eId in a document, so a document with two elements carrying the same eId is
well-formed but SCHEMA-INVALID. `xmllint --noout` does not catch it; only
validation against akomantoso30.xsd does.

Every converter must call `assert_unique_eids()` on the XML string it is about to
write. That turns a silent corpus defect into a loud build failure.
"""

from __future__ import annotations

import re
from collections import defaultdict

EID_RE = re.compile(r'\beId="([^"]+)"')


def duplicate_eids(xml_text: str) -> dict[str, int]:
    """Return {eId: count} for every eId appearing more than once."""
    counts: dict[str, int] = defaultdict(int)
    for m in EID_RE.finditer(xml_text):
        counts[m.group(1)] += 1
    return {k: v for k, v in counts.items() if v > 1}


def assert_unique_eids(xml_text: str, label: str = "document") -> None:
    """Raise if any eId is used twice. Call this immediately before writing."""
    dups = duplicate_eids(xml_text)
    if not dups:
        return
    shown = sorted(dups.items())[:15]
    detail = ", ".join(f"{k} x{v}" for k, v in shown)
    more = "" if len(dups) <= 15 else f" (and {len(dups) - 15} more)"
    raise ValueError(
        f"{label}: {len(dups)} duplicate eId value(s) - Akoma Ntoso requires eId "
        f"to be unique document-wide: {detail}{more}"
    )


class EIdAllocator:
    """Hands out document-unique eIds, keeping the FIRST claim on a name.

    Later claimants get a disambiguating suffix, so eIds already referenced from
    the JSON data (which always point at the first occurrence) keep resolving.

        a = EIdAllocator()
        a.alloc("sec_2")   # -> "sec_2"
        a.alloc("sec_2")   # -> "sec_2__d2"
    """

    def __init__(self) -> None:
        self._used: set[str] = set()

    def alloc(self, base: str) -> str:
        if base not in self._used:
            self._used.add(base)
            return base
        n = 2
        while f"{base}__d{n}" in self._used:
            n += 1
        eid = f"{base}__d{n}"
        self._used.add(eid)
        return eid

    def __contains__(self, eid: str) -> bool:
        return eid in self._used
