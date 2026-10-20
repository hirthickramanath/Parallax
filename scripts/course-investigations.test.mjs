import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const lesson = (id) =>
  JSON.parse(
    /^---\n([\s\S]*?)\n---/.exec(
      fs.readFileSync(`content/lessons/${id}.mdx`, "utf8"),
    )[1],
  );
function answer(id, expected) {
  const q = lesson(id).questions.find(
    (q) => q.id === "depth-transfer-20261020",
  );
  assert.ok(q, `${id}: new question exists`);
  assert.ok(
    Math.abs(Number(q.answer) - expected) <=
      1e-10 * Math.max(1, Math.abs(expected)),
    `${id}: answer matches independently recalculated value`,
  );
  assert.ok(q.hint.length > 20 && q.explanation.length > 90);
  assert.notEqual(q.unit, "as specified in the question");
}
function midpoint(f, a, b, n = 10000) {
  let s = 0;
  for (let i = 0; i < n; i++) s += f(a + ((i + 0.5) * (b - a)) / n);
  return (s * (b - a)) / n;
}
test("stellar and high-energy examples conserve energy and retain the stated scalings", () => {
  answer("AS3.1", -120 / 2 - -240 / 2);
  answer("AS3.2", (0.1 * 2 ** 3) / 2);
  answer("AS3.3", 6.3e26 / (0.007 * 3e8 ** 2));
  answer("AS3.4", 0.2 * 15);
  answer("AS4.1", 4 ** 1.5 / Math.sqrt(16));
  answer("AS4.2", Math.sqrt(100) / 0.5 ** 2);
  answer("AS4.5", 0.5 * 2e30 * 1e7 ** 2);
  answer("AS4.6", (6.67e-11 * 2e30) / 1e7 ** 2);
  answer("AS5.1", (1.2e20 * 2e12) / 2e7);
  answer("AS5.2", Math.sqrt(1 - 0.6 ** 2) / (1 - 0.6));
  answer("AS8.3", 2);
  answer("AS9.2", 2 ** 2);
  // Numerical shell integration verifies the uniform sphere binding coefficient.
  const binding = midpoint((r) => 3 * r ** 4, 0, 1);
  assert.ok(Math.abs(binding - 0.6) < 1e-8);
});
test("foundation transfer answers agree with limits, numerical derivatives and accumulation", () => {
  answer("MB3.1", 4);
  assert.ok(Math.abs((2.0001 ** 2 - 4) / 0.0001 - 4) < 0.001);
  const V = (t) => (4 * Math.PI * (2 + t * t) ** 3) / 3,
    h = 1e-5;
  const derivative = (V(1 + h) - V(1 - h)) / (2 * h) / Math.PI;
  assert.ok(Math.abs(derivative - 72) < 1e-6);
  answer("MB3.2", 72);
  answer(
    "MB3.3",
    midpoint((t) => Math.abs(2 * t - 2), 0, 2),
  );
  answer("MB3.5", 3 + 8 * Math.exp(-Math.log(2) * 2));
  answer("PB1.3", (10 * 1.4) / (0.5 + 0.5 * 0.4));
  answer("PB3.2", 1 / (1 / 10 + 1 / -5));
  answer("PB4.1", (2 * 9) / 3 ** 2);
  answer("PB4.3", -(-3 * 0.02) / 2);
});
