#!/usr/bin/env python3
"""Restore the section/article headings the PDF conversions dropped.

A section with no <heading> renders in the app as a bare number with nothing beside
it - the number, then blank. The text was never missing from the corpus; the
conversion put it somewhere else. Three ways that happened, and this repairs all
three. It is idempotent: a heading that is already there is left alone, so it can be
re-run after any re-conversion.

  1. REPEALED PROVISIONS.  The printed page carries no separate marginal note for an
     omitted provision - the note sits inside the text, bracketed:
       [Compulsory acquisition of property.] Rep. by the Constitution (Forty-fourth
       Amendment) Act, 1978 ...
     The converter looks for a marginal note, finds none, and emits no heading. The
     note is lifted out of the body into the heading, brackets kept, because the
     brackets are how the source marks a provision that is no longer there. The
     body keeps the whole sentence, so nothing is lost.

  2. RUN-IN MARGINAL NOTE.  Some pages print the note as the head of the first
     sentence rather than in the margin, joined by an em dash:
       Public servant disobeying direction of law ... from forfeiture.—Whoever, being
       a public servant, knowingly disobeys ...
     The note is split off at the dash and becomes the heading; the rest stays as the
     body. Only applied where the prefix looks like a marginal note and not like the
     opening of a sentence.

  3. TWO NOTES READ AS ONE.  In the Constitution PDF the marginal notes for Articles
     70 and 71 ran together in the margin column, so both landed on Article 70 and
     Article 71 got none. This is one identified instance, not a pattern, so it is
     named and repaired explicitly rather than guessed at. The text is not invented:
     it is moved from the article it was wrongly attached to.

Run:  python3 scripts/repair_headings.py [--dry-run]
Then: python3 scripts/validate_akn.py  (this script calls it for you unless --dry-run)
"""
import os, re, sys, glob, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AKN  = os.path.join(ROOT, "public", "data")
DRY  = "--dry-run" in sys.argv

UNIT = r"(?:section|article)"
# One provision: the open tag, then everything up to its OWN closing tag. Stopping at
# "the next provision" instead looks right and is not: the last article in a <part> is
# followed by </part><part><num>..</num><heading>..</heading>, so the body would run on
# and pick up the next PART's heading. Two repealed articles read as already-headed
# that way, which is exactly the bug this script exists to fix.
PROV = re.compile(r'(<(%s) eId="([^"]+)"[^>]*>)(.*?)(?=</\2>|<%s eId=|</body>)' % (UNIT, UNIT), re.S)
HAS_HEAD = re.compile(r'<heading>\s*(?:<[^>]+>\s*)*[^<\s]', re.S)
FIRST_P  = re.compile(r'(<p>)(.*?)(</p>)', re.S)

# 1. a leading bracketed marginal note: "[Coorg.] Rep. by ..." - the bracket must open
#    the paragraph and close on a sentence, and what follows must be the repeal note.
BRACKET = re.compile(r'^\s*(\[[^\]]{4,180}\.?\s*\])\s*(?=Rep\.|Omitted|<)', re.S)
# 2. a run-in marginal note ended by an em dash. Capped, and it must not run past a
#    full stop that is not the note's own, so an ordinary sentence is never taken.
RUNIN   = re.compile(r'^([A-Z][^.—]{12,160}\.)—(?=\s*\S)')
# 2b. the same thing in the P&H rules, which end the note with ":-" instead. This one
#     only ADDS the heading and leaves the body untouched: a ":-" also introduces a
#     list, and where the stem is doing grammatical work ("Prison includes:- ...")
#     cutting it would silently delete text. Duplicating a line is recoverable; losing
#     one from a legal instrument is not.
COLON   = re.compile(r'^([A-Z][^:]{8,90}?)\s*:-')
# a stem that introduces a list, a form or a table is a sentence, not a marginal note.
# "following" anywhere in the stem is the giveaway and is disqualifying wherever it sits.
LIST_TAIL = re.compile(r'\b(follows|under|namely|below|manner|viz|thus|effect|hereunder|these|table)\s*$'
                       r'|\bfollowing\b|\bas\s+under\b', re.I)

# 3. the one identified merge, written out so it is auditable rather than inferred
SPLIT_MERGED = [dict(
    file="acts/akn/constitution-of-india.akn.xml",
    donor="art_70", taker="art_71",
    keep="Discharge of President's functions in other contingencies.",
    move="Matters relating to, or connected with, the election of a President or Vice-President.",
)]

def strip_tags(s): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s)).strip()

def repair_file(path):
    xml = open(path, encoding="utf-8").read()
    orig, fixed = xml, []

    def one(m):
        open_tag, unit, eid, body = m.group(1), m.group(2), m.group(3), m.group(4)
        if HAS_HEAD.search(body):                       # already has one - leave it
            return m.group(0)
        fp = FIRST_P.search(body)
        if not fp:
            return m.group(0)
        inner = fp.group(2)
        head = None
        b = BRACKET.match(inner)
        if b:
            head = strip_tags(b.group(1))               # keep the brackets
        else:
            # the note has to be matched against the RAW leading text, and cut out of
            # the raw string. Matching a tag-stripped copy and writing it back would
            # flatten any markup further down the paragraph - an <i>, an
            # <authorialNote> - which is a quiet way to lose text.
            lead = inner.split("<", 1)[0]
            r = RUNIN.match(lead.lstrip())
            if r:
                head = r.group(1).rstrip(".")
                cut = inner.replace(r.group(1) + "—", "", 1).lstrip()
                body = body[:fp.start(2)] + cut + body[fp.end(2):]
            else:
                c = COLON.match(lead.lstrip())
                if c and not LIST_TAIL.search(c.group(1)):
                    head = c.group(1).strip()           # heading only; body left alone
        if not head:
            return m.group(0)
        fixed.append((eid, head))
        # <heading> sits between <num> and the content, as everywhere else in the corpus
        nm = re.search(r'(</num>)', body)
        ins = "<heading>%s</heading>" % head
        body = body[:nm.end()] + ins + body[nm.end():] if nm else ins + body
        return open_tag + body

    xml = PROV.sub(one, xml)

    rel = os.path.relpath(path, AKN).replace(os.sep, "/")
    for s in SPLIT_MERGED:
        if s["file"] != rel:
            continue
        merged = s["keep"] + " " + s["move"]
        if merged in xml:
            xml = xml.replace("<heading>%s</heading>" % merged, "<heading>%s</heading>" % s["keep"], 1)
            # give it to the article it belongs to, if that one is still bare
            tm = re.search(r'(<%s eId="%s"[^>]*>.*?</num>)' % (UNIT, s["taker"]), xml, re.S)
            if tm and not HAS_HEAD.search(xml[tm.end():tm.end() + 400]):
                xml = xml[:tm.end()] + "<heading>%s</heading>" % s["move"] + xml[tm.end():]
                fixed.append((s["taker"], s["move"] + "  [moved off %s]" % s["donor"]))

    if xml != orig and not DRY:
        open(path, "w", encoding="utf-8").write(xml)
    return fixed

def main():
    files = sorted(glob.glob(os.path.join(AKN, "**", "akn", "*.akn.xml"), recursive=True))
    total, touched = 0, 0
    for f in files:
        got = repair_file(f)
        if not got:
            continue
        total += len(got); touched += 1
        print("%s" % os.path.relpath(f, ROOT))
        for eid, head in got:
            print("   %-10s %s" % (eid, head[:96]))
    print("\n%s %d heading%s across %d file%s" % (
        "would restore" if DRY else "restored", total, "" if total == 1 else "s",
        touched, "" if touched == 1 else "s"))
    if total and not DRY:
        print("\nrevalidating…")
        subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "validate_akn.py")], check=False)

if __name__ == "__main__":
    main()
