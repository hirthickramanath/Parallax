import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { validateFoundationRevision } from "./foundation-revision-content.mjs";
import {
  FOUNDATION_ORDER,
  FOUNDATION_VERSION,
  foundationKey,
  foundationProgress,
  foundationRevised,
  nextFoundation,
  revisionPracticeReady,
} from "../src/lib/foundation-path.ts";
import { emptyRecords, gradeNumeric } from "../src/lib/learning-core.ts";
const data = JSON.parse(
    fs.readFileSync("content/revision/foundation.json", "utf8"),
  ),
  curriculum = JSON.parse(fs.readFileSync("content/curriculum.json", "utf8"));
test("every bridge chapter has a specific primer two worked examples complete theory counterpart and graduated practice", () => {
  assert.deepEqual(validateFoundationRevision(data, curriculum), {
    chapters: 38,
    workedExamples: 76,
    practiceQuestions: 114,
    status: "draft",
  });
  assert.deepEqual(
    new Set(FOUNDATION_ORDER),
    new Set(data.modules.map((m) => m.id)),
  );
  for (const m of data.modules)
    assert.match(
      fs.readFileSync(`content/lessons/${m.id}.mdx`, "utf8"),
      /<LessonSection id="theory"/,
    );
});
test("missing chapters duplicate checks and malformed answers cannot pass authoring validation", () => {
  for (const change of [
    (d) => d.modules.pop(),
    (d) => (d.modules[0].checks[0].answer = "NaN"),
    (d) => (d.modules[0].checks[1].options = ["wrong", "wrong"]),
  ]) {
    const d = structuredClone(data);
    change(d);
    assert.throws(() => validateFoundationRevision(d, curriculum));
  }
});
test("revision progression ignores historical course completion and retains it unchanged", () => {
  const r = emptyRecords();
  r.lessons["MB1.1"] = {
    status: "done",
    mastery: 1,
    depthCompleted: "full",
    ladderTierDone: ["core", "warmup"],
    lastSection: "connections",
    updatedAt: 1,
  };
  const before = structuredClone(r.lessons);
  assert.equal(nextFoundation(r), "MB1.1");
  const p = foundationProgress(r, "MB1.1");
  p.completedAt = 1;
  r.plan[foundationKey("MB1.1")] = p;
  assert.equal(foundationRevised(r, "MB1.1"), false);
  p.visited = [0, 1, 2];
  p.answers = Object.fromEntries(
    [1, 2, 3].map((i) => [
      `rebuild-${i}`,
      { response: "1", submitted: "1", correct: true },
    ]),
  );
  assert.equal(revisionPracticeReady(p), true);
  assert.equal(nextFoundation(r), "MB1.2");
  assert.deepEqual(r.lessons, before);
  p.answers["rebuild-3"].response = "2";
  assert.equal(revisionPracticeReady(p), false);
});
test("rebuild path introduces vectors before plane normalization and conics before gravitation", () => {
  const ix = (id) => FOUNDATION_ORDER.indexOf(id);
  assert.ok(ix("MB4.2") < ix("MB2.3"));
  assert.ok(ix("MB2.2") < ix("PB1.4"));
  assert.ok(ix("MB3.2") < ix("MB3.5"));
});
test("invalidated revision versions do not skip a chapter or fabricate course mastery", () => {
  const r = emptyRecords();
  r.plan[foundationKey("MB1.1")] = { version: "old", completedAt: 100 };
  assert.equal(foundationRevised(r, "MB1.1"), false);
  assert.equal(foundationProgress(r, "MB1.1").version, FOUNDATION_VERSION);
});
test("learner pain-point calculations agree with independent pressure heat focus and plane operations", () => {
  const expected = {
    "PB2.1": [900 * 10 * 2, 24000 / (10 * 3)],
    "PB2.2": [250 - 80, -60 - -180],
    "MB2.2": [6 * (1 - 0.5), (8 - 2) / (8 + 2)],
    "MB2.3": [Math.hypot(0, 3, 4), (2 * 5 - 4) / Math.hypot(2, 0, 0)],
  };
  for (const [id, values] of Object.entries(expected)) {
    const qs = data.modules
      .find((m) => m.id === id)
      .checks.filter((q) => q.type === "numeric");
    values.forEach((v, i) => assert.equal(Number(qs[i].answer), v));
  }
  const count = data.modules.find((m) => m.id === "CB.1").checks[0];
  assert.equal(gradeNumeric("10.01", Number(count.answer), count.exact), false);
});
