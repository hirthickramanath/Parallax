# Question quality pilot

Status: **pilot only (22 of 354 lessons).** The wider rollout has not started and needs the owner's go-ahead.
This is an AI-authored change. It is not a teacher review, and it records no approval in the evidence gate.

## Why

The non-independent AI reviewer pass (`docs/AI-REVIEW-PASS.md`, findings F1/F2) found that many conceptual
checks were easy to pass without understanding:

- 64 of 110 conceptual questions in the pilot lessons had only two options, and they were Yes/No.
- A simple heuristic ("pick No on Yes/No, else pick the longest option") scored 71% across the original
  1,764 conceptual questions.
- Hints were mostly missing (27 of 110 had one of useful length) and explanations were short (about 50 characters).

## What changed

`content/review/question-quality.json` lists the 22 rewritten lessons:
AS1.4, AS2.3, AS3.6, AS10.3, AS10.4, CH1.5, CH3.4, CH5.3, CH6.3, CP1.2, CP1.4, MA3.6, MA8.1, MA9.3, MA13.1,
MB4.3, MB4.4, PH2.7, PH10.5, PH11.4, PH12.6, PH16.3. PB1.1 had one warmup prompt fixed (it did not say "from rest").

Only the *conceptual* questions in those lessons were rewritten (110 questions). Question ids, types, tiers and
numeric questions were left alone. Each rewritten question has:

- 3 to 4 plausible options built from real misconceptions, not obvious fillers;
- the correct option's position shuffled with a seeded RNG;
- option lengths balanced, so the right answer is not simply the longest;
- an explanation that says why the right answer holds and why the common wrong one fails;
- a hint of at least 20 characters that nudges without giving the answer away.

## Measured result (110 conceptual questions)

| Metric | Before | After |
| --- | --- | --- |
| Options per question (mean) | 2.0 | 4.0 |
| Yes/No questions | 64 | 0 |
| Questions with a useful hint | 27 | 110 |
| Explanation length (mean chars) | 50 | 136 |
| Correct answer in position 1 of 2 | 71 / 110 (65%) | n/a (4 positions: 27 / 22 / 33 / 28) |
| Correct option strictly longest | 40% (chance with 2 options: 50%) | 43% (chance with 4 options: 25%) |
| Correct option strictly shortest | 58% | 30% |

Honest reading: guessing by length is no longer a good strategy against 4 options (first pass of the rewrite scored
89% on "longest", which is why option lengths were equalised), but 43% against a 25% chance level means some
leakage remains. A further balancing pass is possible before the full rollout.

`scripts/question-quality.test.mjs` guards these properties for the listed lessons (3 to 4 distinct options, hint
present, explanation is more than the answer, no bare Yes/No, correct option strictly longest in at most 50% of
questions, no answer position above 40%).

## Known limitation: retries (not changed)

`QuestionCard` lets a learner retry a question outside the adaptive check, and `LessonPlayer` scores the check from
the latest attempt per question. A two-option question can therefore be passed by clicking both options. Four options
make this much slower but do not remove it. Options, none implemented:

1. Score the check on the first attempt only.
2. Lock a question after the first answer inside the check.
3. Keep as is and treat the check as formative.

This changes learner-visible behaviour, so it is left for the owner to decide.

## Consequences for review

- Source-inspection mappings are tied to the lesson's SHA-256. The only mapped lesson touched was PB1.1; its hash
  was refreshed because the prompt wording changed (the rewording only adds "starting from rest"). No other mapping was affected.
- Numeric verification is unchanged: 1553 of 1554 recomputed, the same as before this change.
- Any teacher review should be done *after* content edits, because reviews are tied to lesson hashes.

## Proposed rollout (needs owner approval)

1. Rewrite the remaining conceptual questions and hints in batches (about 330 lessons), same method and tests.
2. Replace the 343 templated numeric explanations with worked steps.
3. Remove boilerplate and duplicated sections.

Any mapped lesson edited in a batch needs its source mapping re-confirmed or dropped, and the review bundle rebuilt.
