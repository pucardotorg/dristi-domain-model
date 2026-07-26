---
name: field-interview
description: Turn a recorded field interview - a YouTube/video/audio link or a raw transcript - with court staff, advocates, litigants or officials into structured local-practice data for a state. Use whenever the user shares a video/audio interview to "pull the subtitles and analyse", "review and record this", or asks to add a new state's ground practice from a recording. Covers pulling the transcript (yt-dlp with a caption-URL fallback for rate limits), analysing and decomposing it, standing up a new state layer if that state is not modelled yet, and recording the note through the local-practice skill.
---

# Turning a recorded interview into local practice

A field interview is raw ground truth: someone who actually runs a case type
describing how it works. This skill gets that recording into the model as
structured, attributed, cross-checked data. It has one job the `local-practice`
skill does not: **getting a clean transcript out of a video, and standing up a new
state layer** when the interview is the first from that state. For the note itself -
decomposition, verification, impact links, cross-state comparison - it hands off to
the **`local-practice`** skill; do not duplicate that here.

## 1. Get the transcript

Prefer the platform's own subtitles; only transcribe audio yourself if there are
none. For YouTube, use `yt-dlp` (install once with `pipx install yt-dlp`).

```bash
# what tracks exist? note MANUAL subs (uploader-provided, best) vs automatic_captions
yt-dlp --list-subs "<url>"
# title / duration / uploader - for attribution
yt-dlp --skip-download --print "%(title)s :: %(duration_string)s :: %(uploader)s" "<url>"
```

**A manual/uploader track (`subtitles`, e.g. `en-IN`) beats `automatic_captions`** -
it usually has real speaker labels and correct spelling. The auto-caption base
language tells you the spoken language ("X from English (India)" means the audio was
transcribed as English).

The direct `--write-subs` download often returns **HTTP 429 (Too Many Requests)**.
The reliable path is to pull the caption URL out of the player JSON and `curl` it:

```bash
yt-dlp --skip-download --dump-single-json "<url>" > info.json
python3 - <<'PY'
import json
d=json.load(open('info.json'))
sub=d.get('subtitles',{})            # manual first
ac=d.get('automatic_captions',{})    # fallback
track=sub.get('en-IN') or sub.get('en') or ac.get('en') or ac.get('en-en-IN')
best=next(f for pref in ('json3','vtt','srv1') for f in track if f.get('ext')==pref)
open('sub_url.txt','w').write(best['url']); print(best['ext'])
PY
curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36" \
     "$(cat sub_url.txt)" -o sub.json3 -w "HTTP:%{http_code} size:%{size_download}\n"
```

Parse `json3` events into timed + plain text (keep speaker labels):

```python
import json,re
d=json.load(open('sub.json3'))
lines=[]
for e in d.get('events',[]):
    if 'segs' not in e: continue
    t=e.get('tStartMs',0)//1000; txt=''.join(s.get('utf8','') for s in e['segs']).replace('\n',' ').strip()
    if txt: lines.append(f"[{t//60:02d}:{t%60:02d}] {txt}")
open('transcript.txt','w').write('\n'.join(lines))
```

Read the whole transcript before analysing. (json3 can jumble a few overlapping
cues - read past minor ordering glitches; the words are all there.)

## 2. Analyse and decompose

Same unit decomposition as `local-practice`: **roles, process/procedure,
vocabulary, forums, tools/workarounds, and integrity observations.** Pull out:

- **Roles** the interview reveals (who receives, checks, enters, moves the file).
- **The process** as an ordered spine, with the concrete steps at each stage.
- **Vocabulary** - the local words and system terms (case-type codes, software,
  document names, staff titles). Watch for **acronyms** and expand them.
- **Informal / workaround practices** - the self-started habits that no rule
  requires (a side channel, a safety habit, a repurposed field, a manual tool used
  as something else). These are the most valuable part; mark them.
- **Claims to check against the corpus.** Interviewees state practice, not law;
  some claims will be imprecise or wrong. Flag them for verification, e.g. a stated
  limitation figure that is not the statutory one, or a field that does not apply to
  the case type (a §138 complaint has no FIR - see the FIR vocab term).

**Privacy.** Attribute to the interviewees who spoke (they consented, on record).
**Drop third parties named only in passing** and any personal contact details
(emails, phone numbers) - record the function ("the computer room"), not the person.
Say in your summary that you did so.

## 3. Stand up a new state layer (only if the state is not modelled)

Check `public/data/config/app.config.json` → `jurisdictions` for the state id. If it
is listed but has no `public/data/state/<id>.json`, or is not listed at all:

1. Add a `jurisdictions` entry `{ "id": "<slug>", "name": "<State>" }` if missing.
2. Create `public/data/state/<slug>.json`, mirroring `kerala.json` but **scoped to
   what the interview covers** - do not invent stages it never described. Minimum:

   ```json
   { "state":"<slug>", "name":"<State>", "as_of":"2026",
     "vocabulary": { "summary":"...", "terms":[ /* state term shape */ ] },
     "story": { "summary":"...",
       "process": { "summary":"...", "stages":[ /* see shapes */ ] },
       "roles":   { "summary":"...", "items":[  /* see shapes */ ] } } }
   ```

   Omit `fees`, `courts`, `caseload`, `amendments`, `rules`, `notifications` - every
   one is guarded in the renderer and simply renders empty. Do not fabricate them.

   **Shapes (match exactly):**
   - Role item: `{ "id", "role", "cat", "who", "basis" | "cite":[...], "informal"?:{...}, "sourceNotes":[noteId], "themes":[...], "term"? }`. `cat` is one of `litigant · advocate · advclerk · judge · staff · police · bank · witness`. Use `basis` (free-text) when there is no resolvable cite. An `informal` object shows an "informal aspects" flag; `sourceNotes` shows a "field note" link.
   - Process stage: `{ "stage":"N · Title", "id", "steps":[ {"t":"...","c"?:[cite]} ], "timing"? }`. A step's `c` may be a national cite `{l,n}`; omit it for pure-practice steps.
   - Vocab term (state): `{ "word","gloss","source","akn"?,"eId"?,"group","pos","role","aka"? }`. With no state instrument in the corpus, give a free-text `source` and omit `akn`/`eId` - the card shows the gloss and source with no openable text. `pos` in noun/verb/adjective; `role` in actor/document/procedure/doctrine/forum/remedy. See the **`vocabulary`** skill.

3. **Keep the app state-agnostic - never hardcode a state name in `app.js`.** Two
   gotchas were already fixed; keep them working and follow the pattern for anything
   new:
   - the empty-cite label is neutral ("no state-specific citation"), not "Kerala
     adds nothing";
   - the prescribed/regular/ON-Court process **lens tabs only render when a stage
     carries `timing`** - a filing-only layer has none, so they are suppressed.
   If you add a story feature, derive its labels from the data, not from `kerala`.

4. **Anchoring** (ask the user if unsure): default to **national / e-Courts
   concepts + honest free-text sources** now (CIS, CNR, NACT are e-Courts; the NI Act
   is national). Only pull the state's High Court rules into the corpus via the
   **`corpus-acts`** skill if the user wants real, openable anchors.

## 4. Record the note (hand off to `local-practice`)

Follow the **`local-practice`** skill for the field-note schema, per-claim
verification, bidirectional `impact` links, the state-prefixed `serial` (e.g.
`HR-01`), `tags`, and reciprocal cross-state `compare`. Interview-specific points:

- **Firsthand:** `attribution.secondhand=false`; name the interviewees and their
  affiliation; put the **video URL + title + date** in `originalSource`, and note
  that third-party names / contact details were omitted.
- **Status slugs:** use `reported-practice` for a firsthand informal practice (real,
  but no rule governs it) - distinct from `reported-allegation` (an unproven
  accusation) and from `needs-check` (a factual claim to reconcile with the corpus).
  New slugs render with no code change (they default to caution colour).
- **Cross-state `compare`:** if another state has a note under a shared `theme`
  (e.g. `pre-cognizance-scrutiny`), write reciprocal `compare` entries on **both**
  notes - state the similarity and the divergence (e.g. same scrutiny step, but one
  state's note reports rent-seeking and the other does not).
- Point `impact.changes[]` at the roles/process/terms you created in step 3, with
  labels that match (term label = the vocab `word`), so the "what it changed" links
  resolve.

## 5. Validate and verify

- JSON parses; **no em-dashes in app-authored copy** (verbatim law keeps its
  em-dashes); `impact.changes` ids resolve to real role/stage ids and term words;
  any cite anchors resolve.
- Serve `public/` and check on a cache-busted load: the note in **Local practice**
  (filter shows the new state; verification tally, "what it changed" links, and
  "Across states" all render); switch the scope to the new state and confirm its
  **story** (process + roles, with the informal flags and field-note links) and
  **vocabulary** render, and that nothing shows a hardcoded other-state string.
- Commit AKN/data/skill edits together with the `Co-Authored-By` trailer. Push only
  when asked.

## Checklist

- [ ] Transcript pulled (manual subs preferred; 429 handled via the caption-URL curl); read in full; title/date/uploader captured.
- [ ] Decomposed into roles / process / vocabulary / workarounds / integrity; corpus-checkable claims flagged.
- [ ] Privacy applied: interviewees attributed; third-party names and contact details dropped.
- [ ] New state layer stood up only if needed, scoped to what the interview covers; shapes match; app kept state-agnostic (no hardcoded state name).
- [ ] Note recorded via `local-practice` (firsthand attribution + video source; `reported-practice` where apt; reciprocal `compare`; resolving impact links).
- [ ] Validated (JSON, no em-dashes in app copy, ids/anchors resolve) and verified in the served app; committed.
- [ ] Regenerated the agent artifacts (`python3 scripts/generate_agent_artifacts.py`) so the bundle / digest / schemas / `llms.txt` include the new state and note (the Netlify build also runs it).
