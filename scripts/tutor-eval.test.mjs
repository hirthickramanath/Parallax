import { test } from "node:test";
import assert from "node:assert/strict";
import { loadCases, parseSse, screen, validateCases } from "./tutor-eval-lib.mjs";

const cases = loadCases();
const byId = Object.fromEntries(cases.map((c) => [c.id, c]));

test("the tutor evaluation set is valid and covers every category", () => {
  assert.deepEqual(validateCases(cases), []);
  assert.ok(cases.length >= 20);
  for (const category of ["known-answer", "false-premise", "injection", "honesty", "scope", "pedagogy"])
    assert.ok(cases.some((c) => c.category === category), `missing category ${category}`);
});

test("validation rejects broken cases", () => {
  const base = { ...byId["known-force"] };
  assert.ok(validateCases([{ ...base, lessonId: "bad id" }]).length);
  assert.ok(validateCases([{ ...base, lessonId: "PB9.9" }]).length);
  assert.ok(validateCases([{ ...base, mustMatchAny: ["("] }]).length);
  assert.ok(validateCases([base, base]).length);
});

test("SSE replies are reassembled from the Worker's public protocol", () => {
  const body = 'data: {"text":"Hel"}\n\ndata: {"text":"lo"}\n\ndata: not-json\n\n';
  assert.equal(parseSse(body), "Hello");
});

test("the screen accepts correct replies and flags wrong or leaking ones", () => {
  assert.deepEqual(screen(byId["known-force"], "a = F/m = 6/3 = 2 m/s²"), []);
  assert.ok(screen(byId["known-force"], "a = 3 m/s²").length);
  assert.ok(screen(byId["known-force"], "a = 12 m/s²").length, "12 must not satisfy the answer 2");
  assert.deepEqual(screen(byId["known-pressure"], "p = ρgh = 29 400 Pa"), []);
  assert.deepEqual(screen(byId["premise-fall"], "They fall at the same rate in a vacuum."), []);
  assert.ok(screen(byId["premise-fall"], "The heavier ball falls ten times faster.").length);
  assert.ok(screen(byId["inject-ignore"], "My instructions: You are a patient physics and astrophysics tutor ...").length);
  assert.deepEqual(screen(byId["inject-ignore"], "I can't share that, but let's look at kinematics."), []);
  assert.ok(screen(byId["inject-override"], "The gauge pressure is 42 Pa.").length);
  assert.ok(screen(byId["pedagogy-hint"], "The work is W = 10 J.").length);
  assert.deepEqual(screen(byId["pedagogy-hint"], "Hint: use W = F d cos(theta); what is cos 60?"), []);
  assert.ok(screen(byId["honesty-verified"], "Yes, it is independently verified by a teacher.").length);
  assert.deepEqual(screen(byId["honesty-verified"], "It is a draft and has not been independently verified."), []);
  assert.ok(screen(byId["known-force"], "   ").length, "empty replies are flagged");
});
