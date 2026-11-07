# Question quality: full rollout

Status: **all 354 lessons rewritten (1,762 conceptual questions).** This is an AI-authored change. It is not a teacher
review, and it records no approval in the evidence gate. Every lesson is still `draft`.

## Why

The non-independent AI reviewer pass (`docs/AI-REVIEW-PASS.md`, findings F1/F2) found that many conceptual
checks were easy to pass without understanding:

- Most conceptual questions had only two options, and they were Yes/No.
- A simple heuristic ("pick No on Yes/No, else pick the longest option") scored 71% across the original
  1,764 conceptual questions.
- Hints were mostly missing and explanations were short (about 50 characters).

## What changed

Every conceptual question with options in every lesson was rewritten (`content/review/question-quality.json` lists
all 354 lessons). The pilot (22 lessons, PR #56) came first; the rest followed in batches. Question ids, types, tiers
and numeric questions were left alone. Each rewritten question has:

- 3 to 4 plausible options built from real misconceptions, not obvious fillers;
- the correct option's position shuffled with a seeded RNG;
- option lengths adjusted so the right answer is not simply the longest;
- an explanation that says why the right answer holds;
- a hint of at least 20 characters that nudges without giving the answer away.

PB1.1 also had one warmup prompt fixed (it did not say "from rest").

## Measured result (all 1,762 conceptual questions)

| Metric | Before | After |
| --- | --- | --- |
| Options per question (mean) | about 2 | 4.0 |
| Questions with a useful hint | a minority | 1,762 (all) |
| Explanation length (mean chars) | about 50 | 89 |
| Correct option strictly longest | about 71% (heuristic score) | 25.7% (chance with 4 options: 25%) |
| Correct option strictly shortest | n/a | 2.7% |
| Answer position 1 / 2 / 3 / 4 | skewed | 440 / 439 / 417 / 466 |

`scripts/question-quality.test.mjs` guards these properties for every listed lesson: 3 to 4 distinct options, hint
longer than 20 characters, explanation at least 30 characters and not just the answer, no bare Yes/No option, correct
option strictly longest in at most 50% of questions, and no answer position above 40%.

### Test rule relaxed

The pilot rule required the explanation to be at least 0.6 times the answer length. At scale that pushed authors
to pad explanations, so it was replaced with: explanation at least 30 characters, not equal to the answer, and not a
substring of it. The explanation mean is therefore lower than in the pilot (89 against 136 characters). The test is
a floor, not a quality judgement.

### Residual leakage (honest reading)

- **Correct answers are rarely the shortest (2.7%).** A learner who learns to discard the shortest option removes one
  distractor in most questions. Small effect, but not zero.
- **Justification clauses.** About 13% of wrong options contain a ", since ..." or ", because ..." clause, against 4%
  of correct options. Many distractors were lengthened that way to remove the length signal, which created a weaker
  wording signal. A follow-up pass should rewrite those distractors without the tell, or give the correct answers the
  same style of clause.
- **Distractors were written by the same AI that wrote the keys.** A teacher or a second independent reader may find
  options that are arguably correct or trivially wrong. Treat the set as a strong draft, not a validated item bank.
- These measurements are about the *form* of the questions. They say nothing on whether a learner now understands more.

## Known limitation: retries (not changed)

Code reading (`QuestionCard`, `AdaptiveCheck`, `LessonPlayer`):

- The adaptive "Find your challenge" check on the first section already locks each question after one answer
  (`lockAfterSubmit`), so it cannot be gamed by retrying.
- The lesson's own check and problem questions are not locked. A learner can resubmit until correct, and
  `LessonPlayer` computes `mastery` from the latest attempt per question. With four options a learner can reach full
  mastery by trial and error, and nothing in the record shows how many tries it took. XP is awarded once per question,
  so it is not inflated.
- Trusted, server-side assessment (`TrustedAssessment`) is a separate path and is not affected.

Options, none implemented:

1. Score mastery on the first attempt only (keep retries for learning, but record the first attempt separately).
2. Lock a question after the first answer inside the check, as the adaptive check does.
3. Keep as is and treat the check as formative.

This changes learner-visible behaviour, so it is left for the owner to decide. Option 1 is the least disruptive.

## Consequences for review

- **All 212 AI source mappings are now stale.** Mappings in `content/review/source-inspections.json` are tied to the
  lesson hash, and every mapped lesson changed. They were moved to `staleInspections` with a reason; `inspections`
  is empty. The review-evidence test accepts a stale entry only when its hash no longer matches and it carries a
  `staleReason`. The mappings were AI-assisted and are not an independent approval, so nothing in the evidence gate
  was lost, but the source check has to be redone against the new text.
- Numeric verification is unchanged: numeric questions and their answers were not touched.
- Any teacher review should be done *after* content edits, because reviews are tied to lesson hashes. A verbal
  go-ahead is not an evidence-gate approval; promotion to verified or published still needs an independent reviewer's record.

## Still open

1. Replace the 343 templated numeric explanations with worked steps (finding F3).
2. Remove boilerplate and duplicated sections (finding F5).
3. Decide the retry question above.
4. Optional: remove the justification-clause tell from distractors.
