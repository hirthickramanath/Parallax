import { test } from "node:test";
import assert from "node:assert/strict";
import { fingerprint, parseUnit, q } from "./numeric-lib.mjs";
import { runAll, runChecks } from "./verify-numeric.mjs";

test("unit arithmetic tracks dimensions and rejects mismatches", () => {
  assert.equal(q(6, "N").div(q(3, "kg")).to("m/s²"), 2);
  assert.equal(q(3, "km/s").to("m/s"), 3000);
  assert.deepEqual(parseUnit("N m").dims, parseUnit("J").dims);
  assert.deepEqual(parseUnit("m³/s").dims, [0, 3, -1, 0, 0, 0]);
  assert.throws(() => q(6, "N").to("J"), /dimension mismatch/);
  assert.throws(() => q(1, "m").add(q(1, "s")), /different dimensions/);
  assert.equal(parseUnit("as stated"), null);
});

test("the registry detects a wrong answer, a wrong unit and an edited question", () => {
  const item = { lesson: "X", id: "a", key: "X:a", prompt: "p", answer: 6, answerRaw: "6", unit: "m/s²" };
  item.fingerprint = fingerprint(item.prompt, item.answerRaw);
  const ok = () => q(6, "N").div(q(1, "kg"));
  assert.equal(runChecks([item], [["X:a", item.fingerprint, ok]])[0].status, "ok");
  assert.equal(runChecks([item], [["X:a", item.fingerprint, () => q(7, "m/s²")]])[0].status, "mismatch");
  assert.equal(runChecks([item], [["X:a", item.fingerprint, () => q(6, "J")]])[0].status, "unit-error");
  assert.equal(runChecks([item], [["X:a", "deadbeef", ok]])[0].status, "stale");
  assert.equal(runChecks([item], [["X:a", "", ok]])[0].status, "unrecorded");
  assert.equal(runChecks([item], [["X:gone", "", ok]])[0].status, "missing");
});

test("every numeric lesson question is well formed and every registered recomputation passes", () => {
  const { questions, lint, results, cov } = runAll();
  assert.ok(questions.length > 1000, "expected the numeric question bank to load");
  assert.deepEqual(lint.failures, []);
  assert.deepEqual(results.filter((r) => r.status !== "ok"), []);
  assert.ok(cov.verified >= 70);
});
