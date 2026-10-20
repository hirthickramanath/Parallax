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
test("every bridge chapter has a specific primer three worked examples complete theory counterpart and optional transfer practice", () => {
  assert.deepEqual(validateFoundationRevision(data, curriculum), {
    chapters: 38,
    workedExamples: 114,
    practiceQuestions: 152,
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

test("all optional transfer answers follow independent calculations without changing the three-check gate", () => {
  const expected = {
    "MB1.1": 1 + 2,
    "MB1.2": Math.log10(0.001),
    "MB1.3": 6 / (1 - 1 / 3),
    "MB1.4": 20 ** 2,
    "MB2.1": Math.sqrt(1 - 0.6 ** 2),
    "MB2.2": (12 - 4) / (12 + 4),
    "MB2.3": -9 / Math.hypot(1, 2, 2),
    "MB3.1": 3,
    "MB3.2": 6 * 2 - 2,
    "MB3.3": 2 ** 3,
    "MB3.4": 6 * (12 - 6),
    "MB3.5": 3 * Math.exp(2 * Math.log(2)),
    "MB4.1": 3 * 4 - 2 * 1,
    "MB4.2": Math.hypot(2 + 1, -1 + 3, 2 - 2),
    "MB4.3": ((3 / 5) * 2) / 4,
    "MB4.4": 5 * 0.2 * 0.8,
    "PB1.1": 0.5 * 2 * 3 ** 2 + 2 * 3 * 2,
    "PB1.2": Math.sqrt((2 * 18) / 4),
    "PB1.3": 2 / (2 * 0.5 ** 2),
    "PB1.4": 2 * Math.PI * Math.sqrt(2 / 200),
    "PB2.1": 800 * 10 * 2.5,
    "PB2.2": -40 - -150,
    "PB2.3": (1 * 8 * 300) / 0.06,
    "PB3.1": 90 / (2 * 0.75),
    "PB3.2": 1 / (1 / 0.2 - 1 / 0.6),
    "PB3.3": (Math.sqrt(3) + Math.sqrt(3)) ** 2,
    "PB4.1": (9e9 * 2e-9) / 0.3,
    "PB4.2": (12 / (1 + 5)) * 5,
    "PB4.3": 2e-6 * 3e4 * 0.2,
    "PB4.4": (20 * Math.abs(0.005 - 0.02)) / 0.03,
    "PB5.1": 1240 / 400 - 2.2,
    "PB5.2": 200 * 2 ** (-12 / 4),
    "PB5.3": ((3.3 - 0.7) / 1300) * 1000,
    "CB.1": 35 - 17,
    "CB.2": 4 + 2 * 6,
    "CB.3": 4 / 5,
    "CB.4": 1930 / 96500 / 2,
    "CB.5": (2 * 3 + 2 - 6) / 2,
  };
  assert.equal(Object.keys(expected).length, 38);
  for (const m of data.modules) {
    assert.equal(m.examples.length, 3);
    const q = m.checks.find((q) => q.id === "transfer-1");
    assert.equal(q.optional, true, m.id);
    assert.ok(Math.abs(Number(q.answer) - expected[m.id]) < 1e-10, m.id);
    const state = {
      version: FOUNDATION_VERSION,
      step: 3,
      visited: [0, 1, 2],
      answers: Object.fromEntries(
        [1, 2, 3].map((i) => [
          `rebuild-${i}`,
          { response: "a", submitted: "a", correct: true },
        ]),
      ),
      updatedAt: 1,
      completedAt: null,
    };
    assert.equal(revisionPracticeReady(state), true);
    state.answers["transfer-1"] = {
      response: "wrong",
      submitted: "wrong",
      correct: false,
    };
    assert.equal(revisionPracticeReady(state), true);
  }
});
