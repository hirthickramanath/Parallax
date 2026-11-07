# AI reviewer pass over all 354 lessons

**Status: not an independent review and not an approval.** This pass was done by the same AI agent family that authored the lessons (Claude Sonnet 5.5, 2026-11-02). The evidence gate does not accept author self-approval, so no lesson status, ledger entry or approval record was changed. Every lesson remains a draft with zero independent approvals. The findings below are real and should be acted on, but they are an input to a human reviewer, not a substitute for one.

Per-lesson data: [`ai-review-pass.json`](ai-review-pass.json).

## What was and was not covered

| Check | Coverage |
| --- | --- |
| Numeric answers recomputed from their prompts | All 354 lessons; 1553 of 1554 questions (see [NUMERIC-VERIFICATION.md](NUMERIC-VERIFICATION.md)) |
| Question structure and answer-key lint (answer present in options, duplicates, hints, explanations) | All 354 lessons, 3318 questions |
| Guessability of conceptual questions (heuristic below) | All 354 lessons, 1764 conceptual questions |
| Repeated boilerplate and duplicated derivation sections | All 354 lessons |
| Simulation control sweep | All 354 lessons (controls only, not physics) |
| Theory and worked sections read in full, with worked arithmetic re-derived | **33 lessons** (AS1.4, AS2.3, AS2.4, AS3.5, AS4.4, AS6.3, CB1.3, CH1.5, CH2.3, CH5.3, CH6.3, CP1.4, MA3.8, MA5.6, MA7.1, MA8.6, MA10.5, MA11.5, MA12.4, MA13.3, MB3.2, PH3.3, PH7.5, PH8.6, PH8.7, PH9.1, PH9.7, PH12.2, PH13.2, PH14.2, PH16.6, PH17.5, PH18.2) |
| Conceptual answer keys read and checked | 21 further lessons chosen at random |
| Big-number arithmetic in prose re-derived | AS3.3, AS4.5, AS4.6, AS5.1, AS9.2 |
| **Not covered** | Worked-section arithmetic and proofs in the other ~295 lessons; physics inside the widget implementations; source editions beyond the 212 scoped mappings |

So the scientific close reading covers about 9% of the course. "Reviewed all chapters" here means the automated checks cover everything and a sample was read closely; it does not mean every proof was read.

## Findings

### F1 (high): conceptual checks can be passed by guessing

Of 1764 conceptual questions, 1755 have two options. Among the 980 Yes/No questions, 775 (79%) are answered "No", and 160 lessons have *only* "No" answers. The remaining two-option questions put a hedged, qualified correct answer ("No; …") against a strawman ("Yes; every flat curve specifies one particle mass", "Gravity vanishes", "Bob colour"). A trivial rule, "answer No to Yes/No; otherwise pick the longer option", gets **1249 of 1764 (71%)** right, and scores 80% or more in 192 lessons and 100% in 48 lessons (median 80%). By track the rule scores: AS 0.74, CB 0.84, CH 0.75, CP 0.64, MA 0.72, MB 0.59, PB 0.74, PH 0.68.

The completion rule uses these checks, so a learner can progress without understanding. This is an assessment-validity problem, not a scientific error: the answer keys I read were correct.

Suggested fix: rebalance Yes/No keys toward about half "Yes" (rewrite the prompt polarity, not just the key), give wrong options plausible content and similar length, and add more than two options. Editing a lesson changes its whole-file fingerprint, so each mapped lesson (212) needs its source mapping re-confirmed afterwards.

### F2 (medium): most questions have no hint

2062 of 3318 questions have no hint: 1377 of 1764 conceptual questions and 685 of 1554 numeric ones.

### F3 (medium): templated numeric explanations

343 numeric explanations restate the hint and end with "The value in the stated units is X". They give the result but not why.

### F4 (medium): one ambiguous question found by reading

PB1.1 `warmup`: "At constant acceleration, doubling elapsed time multiplies displacement by?" with answer 4 is true only when starting from rest (or with zero initial velocity). The prompt does not say so. PB1.1 is source-mapped, so it is left unchanged here; correcting it needs a quick re-confirmation of that mapping. The four numeric prompts of the same kind found earlier (CH6.8, MA9.2, PH14.8, PH9.4) were fixed in the same PR as this document.

### F5 (low): boilerplate and overlap

Four instruction paragraphs are repeated verbatim in 305 lessons ("Answer the tagged questions below…", and similar in the Before-you-start, Check and Connections sections). Thirty-three lessons contain two derivation/transfer sections that restate the same material (for example CP1.4 explains Euler stability three times). Median unique prose per lesson is 76%. This is repetition, not error.

### F6 (info): no scientific errors found in the sample

In the 33 lessons read in full and the 21 answer-key samples, every formula, worked arithmetic step and answer key was correct under the stated assumptions. Qualifications were generally explicit (conventions, regimes, what a toy model does not show). This is a sample result and should not be extrapolated to certify the rest.

## Heuristic used for F1

For each conceptual (multiple-choice) question: if the options are Yes/No, guess "No"; otherwise guess the longest option. A question counts as guessed if the guess equals the key. This is crude and says nothing about whether a real learner would guess this way; it measures how much the *form* of the questions leaks the answer.

## Recommended next steps

1. A qualified human reviewer uses the review bundle; this report can be given to them as pre-read, clearly labelled as non-independent.
2. Fix F1 in a dedicated batch (largest effect on learning validity), then re-run `npm run review:handoff`.
3. Correct PB1.1 and re-confirm its mapping.
4. Extend close reading to the remaining lessons if wanted; the per-lesson JSON marks what has and has not been read.

## Update: question redesign rolled out (F1/F2 addressed)

All 354 lessons now carry the redesigned conceptual questions; see `docs/QUESTION-QUALITY.md` for the method and
measurements (4 options, hints on every question, correct option strictly longest in 25.7% of questions, answer
positions balanced).

Effects on this report:

- **F1/F2:** addressed in form. Residual leakage (correct answer rarely the shortest; a "since/because" wording tell on
  distractors) is listed in `docs/QUESTION-QUALITY.md`.
- **F7 (new, medium):** after the rewrite, all 212 AI-assisted source mappings are stale, because every mapped lesson
  changed. They are kept in `staleInspections` with a reason; none counts as current. The source check must be redone.
- **Answer-length leak:** the first rewrite pass had the right answer as the longest option in about 91% of
  questions. A second pass lengthened distractors until the rate fell to 25.7%.
- **Test rule relaxed:** the explanation-length rule changed from 0.6 x answer length to a 30-character floor.
- F3 (templated numeric explanations) and F5 (boilerplate) are still open.
- This remains a non-independent AI pass. No lesson was promoted, and none can be without an independent reviewer's record.
