import { test } from "node:test";
import assert from "node:assert/strict";
import { bank, pilotReport } from "./pilot-report.mjs";
import { execFileSync } from "node:child_process";
function stage(name, time) {
  return {
    completedAt: time,
    assisted: false,
    responses: Object.fromEntries(
      bank.forms[name].map((q) => [
        q.id,
        { value: q.answer, reasoningScore: null },
      ]),
    ),
  };
}
function record() {
  return {
    studyCode: "pilot-001",
    priorKnowledge: "some",
    baseline: stage("baseline", "2026-10-01T00:00:00Z"),
    delayed: stage("delayed", "2026-10-08T00:00:00Z"),
  };
}
test("pilot reports missing followups and paired results without claiming human reasoning or leaking participant codes", () => {
  const r = record(),
    out = pilotReport([r]);
  assert.equal(out.missingImmediate, 1);
  assert.equal(out.missingDelayed, 0);
  assert.equal(out.matchedBaselineDelayed.delayedCorrect, 4);
  assert.equal(out.stages.baseline.humanScoredReasoningItems, 0);
  assert.equal(out.unscoredReasoning, 8);
  assert.ok(!JSON.stringify(out).includes(r.studyCode));
});
test("pilot rejects premature followups, duplicate participants, invalid scores, missing assistance and nonfinite answers", () => {
  let r = record();
  r.delayed.completedAt = "2026-10-02T00:00:00Z";
  assert.throws(() => pilotReport([r]), /six days/);
  r = record();
  assert.throws(() => pilotReport([r, r]), /unique/);
  r = record();
  r.baseline.responses.fluid.reasoningScore = 3;
  assert.throws(() => pilotReport([r]), /reasoning scores/);
  r = record();
  delete r.baseline.assisted;
  assert.throws(() => pilotReport([r]), /assistance/);
  r = record();
  r.baseline.responses.fluid.value = Infinity;
  assert.throws(() => pilotReport([r]), /finite/);
});
test("handouts exclude answer keys and reasoning rubric", () => {
  const text = execFileSync(
    process.execPath,
    ["scripts/pilot-report.mjs", "handout", "baseline"],
    { encoding: "utf8" },
  );
  assert.ok(text.includes("vessel width"));
  assert.ok(!text.includes("16000"));
  assert.ok(!text.includes("Local slab force"));
});
test("pilot answer keys recomputed separately from numeric constants", () => {
  const expected = {
    baseline: [
      800 * 10 * 2,
      420 - 150,
      8 * (1 - 0.25),
      (2 * 3 + 2 * 3 - 3) / 3,
    ],
    immediate: [
      1200 * 10 * 1.5,
      -80 - -200,
      12 * (1 + 0.5),
      (3 * 2 + 4 * 3 - 10) / 5,
    ],
    delayed: [27000 / (10 * 3), 95, (12 - 4) / (12 + 4), (0 - 9) / 3],
  };
  for (const [stage, values] of Object.entries(expected))
    bank.forms[stage].forEach((q, i) =>
      assert.ok(Math.abs(q.answer - values[i]) < 1e-10),
    );
});

test("delayed transfer cannot be scheduled immediately after late instruction", () => {
  const r = record();
  r.immediate = stage("immediate", "2026-10-07T12:00:00Z");
  assert.throws(() => pilotReport([r]), /after immediate instruction/);
});

test("item evidence separates assistance and leaves missing answers in the denominator", () => {
  const r = record();
  r.baseline.assisted = true;
  delete r.baseline.responses.fluid;
  const out = pilotReport([r]);
  assert.equal(out.itemEvidence.baseline.fluid.observed, 1);
  assert.equal(out.itemEvidence.baseline.fluid.answered, 0);
  assert.equal(out.itemEvidence.baseline.heat.unassistedCorrect, 0);
  assert.equal(out.unassistedStages.baseline.participants, 0);
  assert.equal(out.stages.baseline.possible, 4);
});
