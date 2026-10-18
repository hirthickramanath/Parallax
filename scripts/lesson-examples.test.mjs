import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
function answer(id, question) {
  const source = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8");
  const data = parse(/^---\n([\s\S]*?)\n---/.exec(source)[1]);
  return Number(data.questions.find((q) => q.id === question).answer);
}
function check(id, question, computed) {
  assert.ok(
    Math.abs(answer(id, question) - computed) < 1e-12,
    `${id}:${question} answer does not match the example calculation`,
  );
}
test("analysis examples agree with independent sums, refinement bounds and exact-index arithmetic", () => {
  check("MA1.1", "numeric", [-2, 2].filter((x) => x * x === 4).length);
  check("MA1.2", "warmup", 1 / 2 ** 4);
  const epsilon = 0.01,
    N = Math.floor(1 / epsilon) + 1;
  check("MA1.3", "warmup", N);
  assert.ok(1 / N < epsilon);
  assert.ok(!(1 / (N - 1) < epsilon));
  check("MA1.4", "numeric", 99 + 1);
  check("MA1.4", "warmup", 1 / (1 - 1 / 3));
  const n = 20;
  let lower = 0,
    upper = 0;
  for (let i = 0; i < n; i++) {
    lower += i / n / n;
    upper += (i + 1) / n / n;
  }
  check("MA1.7", "numeric", upper - lower);
  check("MA1.7", "warmup", (lower + upper) / 2);
  check("MA1.6", "numeric", (3 * 3 - 1 * 1) / (3 - 1) / 2);
  check("MA1.6", "warmup", 3 * 0.2);
  check("MA1.8", "numeric", 0.5 ** 10);
});
test("mechanics example answers match force balance, orbital energy, geometry and tensor energy", () => {
  check("PH1.1", "numeric", (2 * 10) / 1);
  check("PH1.1", "warmup", 6 / 3);
  check("PH1.2", "numeric", 2 * 2 * 3);
  check("PH1.2", "warmup", 3 ** 2 * 2);
  const k = 1,
    r = 4,
    v = Math.sqrt(k / r),
    ell = r * v,
    energy = (v * v) / 2 - k / r;
  check("PH1.3", "numeric", v);
  check("PH1.3", "warmup", ell);
  assert.equal(1 + (2 * energy * ell * ell) / (k * k), 0);
  check("PH1.4", "numeric", 2 / (2 * 1) / Math.tan(Math.PI / 4));
  check("PH1.4", "warmup", 6 / 3);
  check("PH1.5", "numeric", 2 + 2);
  check("PH1.5", "warmup", 3 / 0.5);
  const moments = [2, 3, 4],
    omega = [1, 1, 0];
  check(
    "PH1.6",
    "numeric",
    moments.reduce((sum, I, i) => sum + 0.5 * I * omega[i] ** 2, 0),
  );
  check("PH1.6", "warmup", 4 * 3);
});

test("multivariable and linear-algebra quiz values agree with coordinate and matrix calculations", () => {
  check("MA2.1", "numeric", 4 * 2 ** 3);
  check("MA2.1", "warmup", 2 * 2 * 3);
  check("MA2.2", "numeric", 2 ** 2 + 6 ** 2);
  check("MA2.2", "warmup", 2 * 3);
  const f = (x, y) => x * x + 3 * y * y;
  assert.ok(Math.abs(f(1.1, 0.8) - f(1, 1) - -0.87) < 1e-12);
  check("MA2.3", "numeric", 5 * 5);
  check("MA2.3", "warmup", 10 / 2);
  check("MA2.4", "numeric", 3);
  check("MA2.4", "warmup", 2 * 3);
  check("MA2.5", "numeric", 1 ** 2 + 2 ** 2);
  check("MA2.5", "warmup", 2 ** 2 - 1 ** 2);
  check("MA2.6", "numeric", 3 * 1);
  check("MA2.6", "warmup", -3 * 1);
  check("MA2.7", "numeric", 1 + 1 + 1);
  check("MA2.7", "warmup", 1 - -1);
  check("MA2.8", "numeric", 3);
  check("MA2.8", "warmup", 1 * 4 * 1);
  check("MA3.1", "numeric", 3 + 1);
  check("MA3.2", "numeric", 3 - 2);
  check("MA3.3", "numeric", 2 * 3 - 1 * 1);
  check("MA3.3", "warmup", 1 * 1 - 3 * 2);
  const multiply = (A, B) =>
    A.map((row) =>
      B[0].map((_, j) => row.reduce((sum, v, k) => sum + v * B[k][j], 0)),
    );
  let J = [
    [1, 0],
    [0, 1],
  ];
  for (let i = 0; i < 4; i++)
    J = multiply(J, [
      [1, 1],
      [0, 1],
    ]);
  check("MA3.4", "numeric", J[0][1]);
  check("MA3.4", "warmup", 2 ** 4);
  check("MA3.5", "numeric", Math.hypot(0, 4));
  check("MA3.5", "warmup", 3);
  const A = [
    [2, 1],
    [1, 2],
  ];
  check("MA3.6", "numeric", A[0][0] + A[0][1]);
  check("MA3.6", "warmup", A[0][0] - A[0][1]);
  check("MA3.7", "numeric", Math.min(...[3, 1, 0].filter((v) => v > 0)));
  check("MA3.7", "warmup", Math.hypot(0, 0, 5));
  const N = [
    [0, 1],
    [0, 0],
  ];
  assert.deepEqual(multiply(N, N), [
    [0, 0],
    [0, 0],
  ]);
  check("MA3.8", "numeric", 3 * N[0][1]);
  check("MA3.8", "warmup", 2);
});
