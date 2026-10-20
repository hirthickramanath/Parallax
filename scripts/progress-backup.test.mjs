import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProgressBackup } from "../src/lib/progress-backup.ts";
import { emptyRecords, mergeDocument } from "../src/lib/learning-core.ts";
const make = () => ({
  records: emptyRecords(),
  preferences: {
    depth: "full",
    dailyGoal: 20,
    timezone: "UTC",
    retention: 0.9,
    newCards: 10,
    strictLocking: false,
    backgroundReminders: true,
  },
});
test("legacy backups and versioned exports preserve progress without importing notification consent", () => {
  const data = make();
  data.records.notes.saved = { bodyMd: "Keep this reasoning", updatedAt: 12 };
  data.records.plan["foundation-rebuild-MB1.1"] = {
    version: "foundation-rebuild-v1",
    step: 2,
    visited: [0, 1],
    answers: { a: { response: "2", submitted: "2", correct: true } },
    completedAt: null,
    updatedAt: 30,
  };
  for (const input of [
    data,
    { ...data, format: "parallax-progress", version: 1 },
  ]) {
    const result = parseProgressBackup(JSON.stringify(input));
    assert.equal(result.count, 2);
    assert.equal(result.records.notes.saved.bodyMd, "Keep this reasoning");
    assert.equal(result.records.plan["foundation-rebuild-MB1.1"].step, 2);
    assert.equal(result.preferences.backgroundReminders, undefined);
  }
});
test("malformed, oversized, unsafe and incompatible backups fail before import", () => {
  for (const raw of [
    "not json",
    "{}",
    '{"records":{"__proto__":{}},"preferences":{}}',
    "x".repeat(5 * 1024 * 1024 + 1),
  ])
    assert.throws(() => parseProgressBackup(raw));
  for (const mutate of [
    (d) => (d.preferences.timezone = "Bad/Zone"),
    (d) => (d.preferences.dailyGoal = "20"),
    (d) => (d.records.lessons.x = { status: "done" }),
    (d) => (d.records.days.x = { activities: {} }),
    (d) => (d.records.plan.current = { items: { maths: { bad: true } } }),
    (d) => (d.version = 99),
  ]) {
    const d = { ...make(), format: "parallax-progress", version: 1 };
    mutate(d);
    assert.throws(() => parseProgressBackup(JSON.stringify(d)));
  }
});
test("merge preserves newer notes and deduplicates exported activity", () => {
  const day = {
    xp: 20,
    activities: [{ id: "lesson:1", xp: 20, track: "maths", at: 1 }],
    goalMet: true,
    xpByTrack: { maths: 20 },
  };
  const data = make();
  data.records.days["2026-10-20"] = day;
  const parsed = parseProgressBackup(JSON.stringify(data));
  assert.equal(
    mergeDocument("days", day, parsed.records.days["2026-10-20"], 20).xp,
    20,
  );
  assert.equal(
    mergeDocument(
      "notes",
      { bodyMd: "New", updatedAt: 20 },
      { bodyMd: "Old", updatedAt: 10 },
      20,
    ).bodyMd,
    "New",
  );
});

test("unreadable review dates are rejected and imported server sessions are not treated as trusted", () => {
  const data = make();
  data.records.reviewLog.bad = {
    cardId: "one",
    rating: "Good",
    state: 0,
    reviewedAt: "invalid",
    due: "2026-10-20",
  };
  assert.throws(() => parseProgressBackup(JSON.stringify(data)));
  delete data.records.reviewLog.bad;
  data.records.lessons["PB1.1"] = {
    status: "in_progress",
    mastery: 0,
    depthCompleted: null,
    ladderTierDone: [],
    lastSection: "ready",
    updatedAt: 1,
    interaction: {
      serverAssessment: { score: 1 },
      assessmentRequestId: "stale",
    },
  };
  const p = parseProgressBackup(JSON.stringify(data));
  assert.equal(
    p.records.lessons["PB1.1"].interaction.serverAssessment,
    undefined,
  );
});
