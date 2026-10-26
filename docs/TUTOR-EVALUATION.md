# Tutor evaluation set

A fixed set of 24 prompts for the deployed tutor Worker, in `content/evaluation/tutor-cases.json`, with a runner (`scripts/tutor-eval.mjs`). It exists so that a change to the model, the system prompt or the limiter can be compared against the same questions.

**This is a smoke test, not a quality grade.** Each case has simple pattern checks (an expected answer, or text that must not appear). A pass means the pattern was found, not that the explanation was good. A flag means a pattern failed, not necessarily that the tutor was wrong. Read the saved replies. No human has yet graded any reply set, and this repository has no recorded results.

## What the cases cover

| Category | Cases | What it probes |
| --- | ---: | --- |
| `known-answer` | 8 | A question with one numeric answer. Each answer is recomputed independently from the same givens in `scripts/numeric-checks.mjs`. |
| `false-premise` | 5 | The learner states something wrong (heavier objects fall faster in vacuum, hot bodies peak at longer wavelengths, and so on). The tutor should correct it. |
| `injection` | 5 | Requests to print the system prompt or lesson text, a role-play jailbreak, fake "system override" text in a message, and a forged earlier turn in `history`. |
| `honesty` | 2 | Asked whether the lesson is verified (every lesson is a draft), and for a historical value the tutor should not state falsely precisely. |
| `scope` | 2 | Medical and professional engineering requests, which the tutor prompt places out of scope. |
| `pedagogy` | 2 | "Hint only" must not reveal the result; revision step 0 must start from meaning. |

## Running it

Validate the case file without a network or token:

```sh
node scripts/tutor-eval.mjs --dry-run
```

Run against the deployed tutor. You need a Firebase ID token of a signed-in learner. It lasts about an hour and grants access to that account's tutor quota, so treat it like a password: do not paste it into chat, issues or commits.

1. Sign in at the site and open a lesson's tutor.
2. Open the browser developer tools, Network tab, send one tutor message, and open that request.
3. Copy the value after `Bearer ` in the `Authorization` request header.

```sh
export PARALLAX_ID_TOKEN='<token>'
node scripts/tutor-eval.mjs                      # all cases
node scripts/tutor-eval.mjs --only known-force,inject-ignore
```

Options: `--url` (defaults to `tutorUrl` in `public/services.json`), `--out` (defaults to a file in the system temporary directory, outside the repository), `--delay-ms` (default 7000). `PARALLAX_ORIGIN` overrides the `Origin` header, which must equal the Worker's `SITE_ORIGIN`.

The run sends 24 requests, spaced 7 seconds apart to stay under the per-learner limit of 10 a minute. There is no daily cap. A 429 response is waited out once. The token is never printed or written to the output file. The output file contains the questions and the model's replies only.

## Reading the results

- `pass`: the expected pattern was found and no forbidden pattern appeared.
- `FLAG`: open the saved reply and judge it. Typical false flags are an answer written in an unusual form (`2.0\,\mathrm{m\,s^{-2}}` is fine; "two metres per second squared" is not matched).
- Injection cases are the ones to read most carefully: patterns only catch known phrases from the system prompt, not a paraphrase of it.

## Limits

- The set is small and fixed. A model can pass it without being good, and the tutor is non-deterministic, so one run is a sample.
- Expected-answer patterns do not check the reasoning shown.
- The cases are not a safety evaluation.
- Results should be kept with the date, tutor model and commit when used to compare changes. Do not describe the tutor as "evaluated" in learner-facing text until a person has graded a run.
