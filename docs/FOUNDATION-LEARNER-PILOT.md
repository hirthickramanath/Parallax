# Voluntary foundation learner pilot

Ready to run; no participants recruited, sessions conducted or outcomes claimed. This pilot covers PB2.1, PB2.2, MB2.2 and MB2.3. It does not calibrate the full 354-lesson curriculum. Four questions per form provide a coarse descriptive signal, not an adaptive difficulty model.

1. Invite willing learners with varied prior knowledge. Explain the purpose, optional participation, ability to stop and what will be recorded. No account sharing is required. Keep identifiable information and any participation agreement outside the repository; use random study codes in data. Do not publish raw study records. Decide retention/deletion with participants before collecting anything.
2. Give the baseline handout before instruction, without solutions. Record prior knowledge as new/some/experienced, completion timestamp, help used and missing answers. Ask the learner to explain assumptions as well as compute.
3. Complete the four lessons using predict, manipulate, derive and practise. Observe points of confusion with permission. Do not silently equate fast completion with learning. Let learners record optional in-app difficulty feedback. Collect assistance information explicitly.
4. Give the immediate form after instruction without the baseline answer key. A human marks reasoning: 0 = missing/incorrect governing argument; 1 = correct relation but incomplete assumptions/sign interpretation; 2 = correct relation with the question's requested assumptions or interpretation. Use the separate bank reasoning notes. A second reviewer can independently score a subset and resolve disagreement; do not claim this has happened yet.
5. At approximately seven days give the delayed form without a refresher first. Record intervening study and assistance separately in private facilitator notes. The reporting tool rejects follow-ups earlier than six days after baseline and, when supplied, after immediate instruction. Do not treat missing participants as zero scores or omit them from attrition counts.
6. Summarize first attempts, explicit difficulty feedback, missing follow-ups, prior knowledge and assistance. The forms change context and conceptual demand, but have not been equated for difficulty. Differences between forms do not establish causal gains or retention percentages. Inspect errors by concept before changing sequencing or question difficulty.

Ready-to-use participant copies (without solutions): [baseline](evaluation/baseline.md), [immediate](evaluation/immediate.md), [delayed](evaluation/delayed.md). Regenerate them with:

```sh
node scripts/pilot-report.mjs handout baseline > /tmp/baseline.md
node scripts/pilot-report.mjs handout immediate > /tmp/immediate.md
node scripts/pilot-report.mjs handout delayed > /tmp/delayed.md
node scripts/pilot-report.mjs score /private/path/pilot-records.json
```

Keep the answer/rubric bank `content/evaluation/foundation-pilot.json` separate from learner handouts. Data schema: an array with one record per pseudonymous `studyCode`, `priorKnowledge`, required `baseline` and optional `immediate`/`delayed`. Each stage has ISO `completedAt`, boolean `assisted`, and `responses` keyed `fluid`, `heat`, `conic`, `plane`. Each response has numeric `value` (or null for missing) and human `reasoningScore` 0/1/2 (or null if not scored). Numeric tolerance is 2% relative or 1e-6 absolute; facilitators must check whether a right number has valid reasoning. Partial-stage missing answers stay in the possible-item denominator. Reports include per-item counts and separate unassisted stage summaries; these are raw observations, not calibrated item-difficulty estimates. Reports omit study codes, answer text and notes; small groups can still be identifiable, so sharing requires participant agreement.

Automated fixtures validate the scorer, not learning effectiveness. Do not use the included answer key as simulated participants to claim a trial. Human recruitment, facilitation, delayed follow-ups and independent assessment remain external work.

Optional second-marker checks: a response may include `secondReasoningScore` (0/1/2) only when a valid primary `reasoningScore` exists. Have another willing marker score independently without seeing the first score. The report gives double-scored item counts, exact agreements and disagreements while keeping primary totals unchanged; recording two numbers does not prove independent marking occurred. Resolve substantive disagreements explicitly rather than silently averaging them.

The report also gives matched immediate/delayed participant and answered-item totals. Unmatched stages are excluded from that paired comparison but remain visible in missing-follow-up counts. Different forms are uncalibrated, so these totals are descriptive and do not establish a causal retention percentage.
