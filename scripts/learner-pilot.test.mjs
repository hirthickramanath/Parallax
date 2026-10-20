import test from "node:test";
import assert from "node:assert/strict";
import {
  pilotAnswer,
  pilotNext,
  readPilot,
  PILOT_WAIT_MS,
} from "../src/lib/learner-pilot.ts";
import { pilotReport } from "./pilot-report.mjs";
const base = Date.parse("2026-10-20T00:00:00Z");
const entry = (time) => ({
  completedAt: new Date(time).toISOString(),
  assisted: false,
  helpUsed: "",
  instructionSource: "app",
  feedback: "",
  responses: { fluid: { value: 16000, reasoning: "rho*g*h" } },
});
const record = {
  studyCode: "learner-test",
  priorKnowledge: "some",
  consentedAt: new Date(base).toISOString(),
  version: "foundation-pilot-v1",
};
test("pilot preserves unanswered values and rejects non-finite input", () => {
  assert.equal(pilotAnswer(""), null);
  assert.equal(pilotAnswer(" -1.6 "), -1.6);
  for (const x of ["NaN", "Infinity", "16000 Pa"])
    assert.throws(() => pilotAnswer(x));
});
test("pilot stages require six days after immediate instruction", () => {
  assert.equal(pilotNext(null, base).stage, "baseline");
  const r = { ...record, baseline: entry(base) };
  assert.equal(pilotNext(r, base).stage, "immediate");
  r.immediate = entry(base + 86400000);
  assert.equal(pilotNext(r, base + PILOT_WAIT_MS).available, false);
  assert.equal(pilotNext(r, base + 86400000 + PILOT_WAIT_MS).available, true);
  r.delayed = entry(base + 86400000 + PILOT_WAIT_MS);
  assert.equal(pilotNext(r, base + 9 * 86400000).available, false);
});
test("browser pilot export is accepted by report without invented reasoning scores", () => {
  const r = { ...record, baseline: entry(base) };
  assert.deepEqual(readPilot(JSON.stringify(r)), r);
  const report = pilotReport([r]);
  assert.equal(report.participants, 1);
  assert.equal(report.missingImmediate, 1);
  assert.equal(report.stages.baseline.humanScoredReasoningItems, 0);
  assert.equal(readPilot("invalid"), null);
  assert.equal(readPilot(JSON.stringify({ ...r, studyCode: "a@b.com" })), null);
});
