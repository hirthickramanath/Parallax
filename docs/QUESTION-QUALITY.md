# Question quality: full rollout

Status: **all 354 lessons rewritten (1,762 conceptual questions), then revised twice more.** This is an AI-authored
change. It is not a teacher review, and it records no approval in the evidence gate. Every lesson is still `draft`.

## Why

The non-independent AI reviewer pass (`docs/AI-REVIEW-PASS.md`, findings F1/F2) found that many conceptual
checks were easy to pass without understanding:

- Most conceptual questions had only two options, and they were Yes/No.
- A simple heuristic ("pick No on Yes/No, else pick the longest option") scored 71% across the original
  1,764 conceptual questions.
- Hints were mostly missing and explanations were short (about 50 characters).
- A learner could resubmit a check question until it was right, so mastery could be reached by trial and error.

## What changed

### 1. Options, hints and explanations (all 354 lessons)

Every conceptual question with options was rewritten (`content/review/question-quality.json` lists all 354 lessons).
The pilot (22 lessons, PR #56) came first; the rest followed in batches. Question ids, types, tiers and numeric
questions were left alone. Each rewritten question has 3 to 4 plausible options built from real misconceptions, a
seeded-random answer position, an explanation that says why the key holds, and a hint of at least 20 characters.
PB1.1 also had one warmup prompt fixed (it did not say "from rest").

### 2. Single-attempt answers

Each question card now locks after the first submit. A learner cannot try the other options. The only way to try again
is to restart the lesson from the course map. Mastery is computed from first attempts, so it no longer reflects
trial and error. XP was already awarded once per question. This replaces the earlier "known limitation: retries"
note. The adaptive "Find your challenge" check already behaved this way. Server-side `TrustedAssessment` is a
separate path and was not touched.

Consequence: a learner who misreads a question gets no second chance inside the lesson, and the explanation is the
remediation. That is intended, but it makes the explanation text and the hint more important than before.

### 3. Wording-tell passes (length parity and justification clauses)

Two further passes ran over all 1,762 questions. They were done by hand, in batches, with a script that rejected
edits that reintroduced obvious tells:

- Absolute words (always, never, only, all, every, any, none, nothing, exactly, entirely, automatically) and
  ", since ..." / ", because ..." clauses were removed from distractors unless the correct option used them.
- Every rewritten distractor had to be between 0.5x and 2.3x the length of the correct option, and no option
  could duplicate another.
- Distractors were reworded so they read as the same kind of sentence as the key (a short claim, often a
  "Yes:"/"No:" lead and a reason), instead of terse fillers such as "Yes: always".

## Measured result (all 1,762 conceptual questions)

| Metric | Before | After |
| --- | --- | --- |
| Options per question (mean) | about 2 | 4.0 |
| Questions with a useful hint | a minority | 1,762 (all) |
| Explanation length (mean chars) | about 50 | 89 |
| Heuristic "pick the longest" score | about 71% | 22.9% strictly longest (chance with 4 options: 25%) |
| Correct option strictly shortest | n/a | 7.7% |
| Answer position 1 / 2 / 3 / 4 | skewed | 440 / 439 / 417 / 466 |
| Surface-feature classifier accuracy (chance about 25%) | 0.759 (after the first rewrite) | 0.673 |

`scripts/question-quality.test.mjs` guards these properties for every listed lesson: 3 to 4 distinct options, hint
longer than 20 characters, explanation at least 30 characters and not just the answer, no bare Yes/No option, correct
option strictly longest in at most 50% of questions, and no answer position above 40%. It is a floor, not a quality
judgement. (The explanation rule was relaxed from 0.6x the answer length because it pushed authors to pad.)

The surface-feature classifier is a logistic regression over length, wording and overlap features (`tellscore`
in the working notes, not shipped). Accuracy is the share of questions where its top-scored option is the key,
estimated with 5-fold cross-validation grouped by question. It measures only how much the *form* of a question
leaks the answer, and it is a descriptive statistic from one model family, not a proof that no tell remains.

## Residual leakage (honest reading)

The tells are reduced, not gone.

- **Length rank.** The correct option is the longest in 25%, second-longest in 48%, third in 20% and shortest in 8%.
  The second-longest share is the new signature: distractors were pushed toward the key's length but the key still
  tends to sit just above the middle. A learner who prefers the second-longest option beats chance.
- **Absolute words are now inverted.** 9.2% of correct options contain an absolute word against 3.0% of distractors,
  because correct statements often contain legitimate qualifiers such as "only changes the phase". Avoiding
  absolutes in distractors removed the old tell and created a weaker opposite one.
- **Justification clauses.** 4.5% of correct options and 7.7% of distractors have a since/because clause (down from
  about 13% of distractors).
- **Structure.** Keys and distractors were written by the same AI. Distractors tend to be single claims with a short
  lead, while keys more often carry a qualification or a condition. This structural difference is what the
  classifier still picks up, and it will not go away with more word-level edits.
- **Possible ambiguity.** A distractor can be arguably correct, or the key arguably incomplete. Nobody but the
  author has read the full set.
- These measurements are about the *form* of the questions. They say nothing on whether a learner now understands more.

**Recommendation.** A second, independent writer (ideally a human who knows the subject) should write distractors
for a sample of lessons without seeing the existing ones, then compare. That is the only way to remove the
shared-author signature. Until then treat the set as a strong draft.

## Numeric explanations and repeated text (findings F3 and F5)

Both were handled earlier on this branch and are closed:

- The 343 templated numeric explanations ("The value in the stated units is ...") were replaced with worked steps.
  No templated explanation remains. Numeric answers, options and types were not changed.
- The four boilerplate instruction paragraphs repeated across lessons were replaced with lesson-specific wording
  (none of the old paragraphs remain).
- In this pass, sections that paraphrase one another within a lesson were handled conservatively: 33 restated
  sentences in otherwise complementary blocks were trimmed. Nothing was moved or merged, to avoid dangling
  references. Three "Transfer derivation and failure case" blocks (PB5.2, MB4.2, CB1.5) largely restate the main
  derivation section, but the revision-chapter test (`scripts/broad-expansion.test.mjs`) requires that heading, so
  they were kept.

## Other changes in this batch

- `RouteErrorBoundary` shows a recoverable message when a page chunk fails to load, instead of a blank page.
  A browser test (`tests/titles.spec.ts`) covers it.
- Route audit: no broken routes or titles found.
- Performance finding, not refactored: `course.json` (about 2.5 MB) lands in the `useLearning` chunk, so it loads
  with most pages. Splitting it by unit or loading it lazily would cut first-load size. This is a recommendation.

## Consequences for review

- **The 212 AI source mappings were stale after the rewrite and have been re-confirmed by a text-delta check, not by
  re-reading the sources.** For each mapped lesson I compared the text the mapping was made on with the final text:
  metadata, question ids and numeric answers are unchanged, and the prose changed only through reworded instruction
  paragraphs, trimmed restatements, . Each entry records its previous hash and
  states this basis. **Not checked:** the original source passages, and the rewritten conceptual prompts, options
  and explanations against those sources. The mappings stay partial and non-independent, and are not an approval.
  A reviewer should treat the 1,762 rewritten questions as unchecked against the sources.
- Numeric answers are unchanged. Numeric explanations were rewritten (see above) and need the same reviewer check.
- Any teacher review should be done *after* content edits, because reviews are tied to lesson hashes. A verbal
  go-ahead is not an evidence-gate approval; promotion to verified or published still needs an independent
  reviewer's record. No lesson was promoted here.

## Still open

1. Independent distractor writing for a sample of lessons (see above).
2. A qualified human reviewer checking the rewritten questions and numeric explanations against sources.
3. Split `course.json` out of the main learning chunk.
