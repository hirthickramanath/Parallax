import assert from "node:assert/strict";
import test from "node:test";
import { emptyRecords, upgradeId, upgradeRecords } from "../src/lib/learning-core.ts";

test("chemistry bridge ids move from CB.n to CB1.n only", () => {
  assert.equal(upgradeId("CB.3"), "CB1.3");
  assert.equal(upgradeId("lesson:CB.5"), "lesson:CB1.5");
  assert.equal(upgradeId("prediction-CB.1"), "prediction-CB1.1");
  assert.equal(upgradeId("CB.2:q1"), "CB1.2:q1");
  assert.equal(upgradeId("CB"), "CB1");
  for (const kept of ["CB1.1", "CH1.1", "MB1.1", "CB-concept-3", "ACB.1", "PH1.1"])
    assert.equal(upgradeId(kept), kept);
});

test("saved progress is renamed, merged and left idempotent", () => {
  const r = emptyRecords();
  r.lessons["CB.1"] = { status: "done", updatedAt: 5 };
  r.lessons["CB1.1"] = { status: "in_progress", updatedAt: 9 };
  r.lessons["PH1.1"] = { status: "done", updatedAt: 1 };
  r.units.CB = { skipTestScore: 1, skippedWithCredit: true, completedAt: null };
  r.notes["CB.2"] = { bodyMd: "n", updatedAt: 1 };
  r.reviewCards["CB.2-0"] = { lessonId: "CB.2", fsrs: {} };
  r.attempts["theory-CB.4"] = { questionId: "CB.4:q1" };
  r.plan.journey = { lessonId: "CB.3" };
  r.days["2026-01-01"] = {
    xp: 20,
    goalMet: true,
    xpByTrack: {},
    activities: [{ id: "lesson:CB.1", xp: 20, track: "chemistry", at: 1 }],
  };
  const changed = upgradeRecords(r);
  assert.ok(changed.includes("lessons/CB1.1") && changed.includes("units/CB1"));
  assert.equal(r.lessons["CB.1"], undefined);
  assert.equal(r.lessons["CB1.1"].status, "done");
  assert.equal(r.lessons["PH1.1"].status, "done");
  assert.ok(r.units.CB1.skippedWithCredit && !r.units.CB);
  assert.ok(r.notes["CB1.2"] && r.reviewCards["CB1.2-0"].lessonId === "CB1.2");
  assert.equal(r.attempts["theory-CB1.4"].questionId, "CB1.4:q1");
  assert.equal(r.plan.journey.lessonId, "CB1.3");
  assert.equal(r.days["2026-01-01"].activities[0].id, "lesson:CB1.1");
  assert.deepEqual(upgradeRecords(r), []);
});
