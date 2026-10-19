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

test("ODE, relativity and radiation examples retain their stated arithmetic and invariants", () => {
  check("MA4.1", "numeric", 4 / 2);
  check("MA4.1", "warmup", 1 / 1);
  check("MA4.2", "numeric", 1 / 4);
  check("MA4.2", "warmup", Math.sqrt(9));
  check("MA4.3", "numeric", Math.sqrt(4));
  check("MA4.3", "warmup", 2);
  check("MA4.4", "numeric", 1 / Math.sqrt(1 + 2 * 4));
  check("MA4.4", "warmup", Math.sqrt(4));
  for (const r of [answer("MA4.5", "numeric"), answer("MA4.5", "warmup")])
    assert.equal(r * (r - 1) - 2, 0);
  check("MA4.6", "numeric", ((2 * Math.PI) / Math.PI) ** 2);
  check("MA4.6", "warmup", 1);
  const beta = 0.6,
    gamma = 1 / Math.sqrt(1 - beta * beta);
  check("PH11.1", "numeric", gamma);
  check("PH11.1", "warmup", 10 / gamma);
  check("PH11.2", "numeric", gamma - 1);
  check("PH11.2", "warmup", gamma * beta);
  assert.ok(Math.abs(gamma ** 2 - (gamma * beta) ** 2 - 1) < 1e-12);
  const total = (4 ** 2 - 1 ** 2 - 1 ** 2) / 2;
  check("PH11.3", "numeric", total);
  check("PH11.3", "warmup", total - 1);
  check("PH11.4", "numeric", gamma * (1 - beta));
  check("PH11.4", "warmup", gamma - 1);
  check("AS2.1", "numeric", 5 + 5 * Math.log10(100 / 10));
  check("AS2.1", "warmup", 1 / 2 ** 2);
  check("AS2.2", "numeric", 2 ** 4);
  check("AS2.2", "warmup", (2.9e-3 / 5800) * 1e9);
  check(
    "AS2.3",
    "numeric",
    10 * Math.exp(-Math.log(2)) + 2 * (1 - Math.exp(-Math.log(2))),
  );
  check("AS2.3", "warmup", 10 / 2 + 20 / 2);
  check("AS2.4", "numeric", 600 / 500 - 1);
  check("AS2.4", "warmup", 2);
  check("AS2.5", "numeric", 100 / Math.sqrt(100));
  check("AS2.5", "warmup", 2 ** 2);
  check("AS2.6", "numeric", 1000 - 10 * 20);
  check("AS2.6", "warmup", 500 / 0.1);
  check("AS2.7", "numeric", 0.01 * 1000);
  check("AS2.7", "warmup", 10 / (1 + 10));
});

test("inference and variational examples agree with their normalizations, uncertainties and constraints", () => {
  check("MA8.1", "numeric", 1 / 0.2);
  check("MA8.1", "warmup", (0.1 - 0.05) / 0.2);
  check("MA8.2", "numeric", 2 / Math.sqrt(100));
  check("MA8.2", "warmup", 4 / (100 * 1 ** 2));
  check("MA8.3", "numeric", 3 * 2);
  check("MA8.3", "warmup", 1 / 4);
  check("MA8.4", "numeric", 4 + 3 ** 2);
  check("MA8.4", "warmup", (1.96 * 2) / Math.sqrt(100));
  check("MA8.5", "numeric", 1 + 3);
  check("MA8.5", "warmup", (1 + 3) / (1 + 1 + 3 + 1));
  check("MA8.6", "numeric", Math.min(1, 0.25));
  check("MA8.6", "warmup", 1000 / 5);
  check("MA8.7", "numeric", Math.sqrt(3 ** 2 * 0.1 ** 2 + 2 ** 2 * 0.2 ** 2));
  check("MA8.7", "warmup", 2 * 3);
  check("MA9.1", "numeric", 0.5 * 2 ** 2);
  check("MA9.1", "warmup", (3 - 0) / (1 - 0));
  const lambda = answer("MA9.2", "numeric");
  assert.ok(Math.abs(-lambda / 12 - 1) < 1e-12);
  check("MA9.2", "warmup", 6 * 0.5 * (1 - 0.5));
  check("MA9.3", "numeric", 2 * (3 * 4 - 0 * 0));
  check("MA9.3", "warmup", 3 * 2);
});

test("electrostatic, magnetic and organic examples match their stated formulas and counts", () => {
  check("PH4.1", "numeric", 1 / 2 ** 3);
  check("PH4.1", "warmup", 1 / 4 ** 2);
  check("PH4.2", "numeric", -3);
  check("PH4.2", "warmup", 3 * 1);
  check("PH4.3", "numeric", -(2 ** 2) / (4 * 1 ** 2));
  check("PH4.3", "warmup", -(2 ** 2) / (4 * 1));
  check("PH4.4", "numeric", (2 * 3) / 2 ** 3);
  check("PH4.4", "warmup", 1 / 2 ** 3);
  check("PH4.5", "numeric", 6 / 2);
  check("PH4.5", "warmup", (6 * 3) / 2);
  check("PH4.6", "numeric", 6 / 6);
  check("PH4.6", "warmup", 3);
  check("PH4.7", "numeric", 3 / 2);
  check("PH4.7", "warmup", 1 / 2);
  check("PH4.8", "numeric", 2 - -2);
  check("PH4.8", "warmup", 3 - 1);
  check("CH6.1", "numeric", 10 ** (10 - 5));
  check("CH6.1", "warmup", 1 / 100000);
  check("CH6.2", "numeric", 2 ** 2);
  check("CH6.2", "warmup", 2 + 1);
  check("CH6.3", "numeric", -1 + 0);
  check("CH6.3", "warmup", 2);
  check("CH6.4", "numeric", 2 * 0.1 * 0.2);
  check("CH6.4", "warmup", 2 * 2);
  check("CH6.5", "numeric", (2 * 3 + 2 - 6) / 2);
  check("CH6.5", "warmup", 2);
  check("CH6.6", "numeric", 6);
  check("CH6.6", "warmup", (6 - 2) / 4);
  check("CH6.7", "numeric", -Math.log10(0.1));
  check("CH6.7", "warmup", 1 / 2);
  check("CH6.8", "numeric", 6 / 2);
  check("CH6.8", "warmup", 1 / 2);
});
test("physical chemistry and analytical mechanics numerical examples follow their assumptions", () => {
  const chemistry = [
    [Math.log(2), 4],
    [0.25 * 80 + 0.75 * 20, 4 / 7],
    [(0.1 * 2) / 10, Math.log(2) / 0.2],
    [0.1, 0.5],
    [0.25, 0.5],
    [3 / 4, 0.5],
    [0.2 * 1.5, 0.8 * 5],
    [5 * 0.2, 2 * 5 * 0.2],
    [1 - 0.025 * 2, 0.95],
    [(3 * 4) / 2, 6 / 2],
    [2 * 2 * 3, -2 * -4],
    [2 - 0.5, 0.5],
    [1 / (3 + 1), 3 / (3 + 1)],
  ];
  const mechanics = [
    [10 / 2, 2 * 3 ** 2 * 4],
    [2 * 3, 2],
    [2 * 3 ** 2 * 4, 72 / (2 * 6 ** 2)],
    [4 ** 2 / (2 * 2) + 3 ** 2 / 2, 4 / 2],
    [2 / 2, 2 * 2],
    [6 / 3, 3],
    [(1 + 2 * 1) / 1, 0.5 * (0.2 ** 2 + 0.2 ** 2)],
  ];
  for (const [unit, values] of [
    ["CH1", chemistry],
    ["PH2", mechanics],
  ])
    values.forEach(([numeric, warmup], i) => {
      check(`${unit}.${i + 1}`, "numeric", numeric);
      check(`${unit}.${i + 1}`, "warmup", warmup);
    });
});
test("Fourier and PDE draft examples retain normalization, rate and boundary conventions", () => {
  const values = [
    ["MA5.1", 3 ** 2 + (2 ** 2 + (-4) ** 2) / 2, 2 * 3],
    ["MA5.2", 2 * 2, 3],
    ["MA5.3", 3 / (1 + 2), 3 * 2 - 4],
    ["MA5.4", 2 * 2 ** 2, 0.1 / 0.5 ** 2],
    ["MA5.5", 2 * 3, 4 / 2],
    ["MA5.6", 0.5 - 0.5 ** 2, -2 * 1],
    ["MA5.7", 0.5 * (1 - 0.5), -0.5 - 0.5],
  ];
  for (const [id, numeric, warmup] of values) {
    check(id, "numeric", numeric);
    check(id, "warmup", warmup);
  }
});
test("complex-analysis examples preserve residues, orientation and branch choices", () => {
  const rows = [
    ["MA6.1", 2 * 1, 2 * 3],
    ["MA6.2", 2 / 2, -1],
    ["MA6.3", 1 / 2, 3],
    ["MA6.4", 1 + -1, 3],
    ["MA6.5", (2 - 1) / (2 + 1), 2 ** 2 + 2 ** 2],
    ["MA6.6", Math.cos(Math.PI), (2 * Math.PI) / Math.PI],
  ];
  for (const [id, numeric, warmup] of rows) {
    check(id, "numeric", numeric);
    check(id, "warmup", warmup);
  }
});
test("special function examples preserve indexing, weights and asymptotic scales", () => {
  const examples = [
    ["MA7.1", 1 * 2 * 3 * 4, (1 * 2) / (1 * 2 * 3 * 4)],
    ["MA7.2", (3 * 0 ** 2 - 1) / 2, 2 * 2 + 1],
    ["MA7.3", (3 * 2.4) / 2, 1],
    ["MA7.4", 4 * 0 ** 2 - 2, 2 + 1 - 1],
    ["MA7.5", Math.sqrt(Math.PI / 4) / Math.sqrt(Math.PI), 16 ** (-1 / 4)],
  ];
  for (const [id, numeric, warmup] of examples) {
    check(id, "numeric", numeric);
    check(id, "warmup", warmup);
  }
});
test("thermal examples preserve energy, multiplicity and occupation conventions", () => {
  const rows = [
    ["PH7.1", 100 - 60, 1 - 300 / 500],
    ["PH7.2", 3 * 4, 2 * 4],
    ["PH7.3", 6, 6 / 4],
    ["PH7.4", 1 / 4, 0.25 * 0.75],
    ["PH7.5", 3 / 4, 0.75 * 0.25],
    ["PH7.6", 1 / (3 + 1), 1 / (3 - 1)],
    ["PH7.7", 2 ** 4, 2 ** 3],
    ["PH7.8", Math.sqrt(4), -4 + 3 * 4],
    ["PH7.9", 1 - -1, 2],
    ["PH7.10", 2 * 3, 2 * 6 * 2],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("computing examples preserve stability, sampling and validation definitions", () => {
  const rows = [
    ["CP2.1", 0.01 / 0.2 ** 2, 0.01 / 0.1 ** 2],
    ["CP2.2", 1000 / 5, 0.2],
    ["CP2.3", 0.2 * 10, 1 / 0.05],
    ["CP2.4", (1 + 4) / 2, 95 / 100],
    ["CP2.5", 1 / (0.2 + 0.8 / 4), 1 / 0.2],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("electrodynamic examples preserve flux signs, power and dispersion conventions", () => {
  const rows = [
    ["PH5.1", -3, 4],
    ["PH5.2", 6 / 2, (2 * 6) / 2],
    ["PH5.3", 1 / Math.sqrt(4), Math.sqrt(1 / 4)],
    ["PH5.4", ((3 - 1) / (3 + 1)) ** 2, (1 / 3) * 1.5 ** 2],
    ["PH5.5", 10 - 6 / 2, 6 / 2],
    ["PH5.6", 2 ** 2, 2 ** 4],
    ["PH5.7", 3 ** 2 - 2 ** 2, 0],
    ["PH5.8", Math.sqrt(25 - 9) / 2, (4 * 2) / 5],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("introductory quantum examples retain amplitudes, measures and state counts", () => {
  const rows = [
    ["PH8.1", (1 + 1) ** 2, 6 / 3],
    ["PH8.2", 4 - 1, 1 / 2 ** 2],
    ["PH8.3", 2 * 0.25, 4 * 0.25 - 0.5 ** 2],
    ["PH8.4", 2 * (3 + 0.5), Math.sqrt(4)],
    ["PH8.5", 1 * (1 + 1), 2 * 2],
    ["PH8.6", 1 - 1 / 4, 1 + 3 + 5],
    ["PH8.7", (1 + Math.cos(Math.PI / 3)) / 2, (1 - Math.cos(Math.PI / 3)) / 2],
    ["PH8.8", Math.cos(Math.PI), Math.cos(Math.PI / 2)],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("bonding examples preserve electron accounting, weights and model conventions", () => {
  const rows = [
    ["CH4.1", 5 - 8 / 2, 6 - 6 - 2 / 2],
    ["CH4.2", 1 + 3, -1 / 3],
    ["CH4.3", (8 - 4) / 2, (8 - 3) / 2],
    ["CH4.4", 2 * 1, 3 + 1],
    ["CH4.5", 2 ** -6, 4 * (1 - 1)],
    ["CH4.6", 1 / 4, 3 * 1 * 2],
    ["CH4.7", 6 * -0.4, 4 * -0.4 + 2 * 0.6],
    ["CH4.8", Math.sqrt(8 / 2), 1 / Math.sqrt(4)],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("continuum and optical examples retain strain, flow and spectral conventions", () => {
  const rows = [
    ["PH3.1", Math.log(4) / 2, 4],
    ["PH3.2", 0.2 / 2, 2 * 3 * 0.1],
    ["PH3.3", (2 * 3 * 4) / 6, 8],
    ["PH3.4", Math.sqrt(4 * 9), 8 ** (-5 / 3)],
    ["PH6.1", (2 + 1) / 1, 2 + 2],
    ["PH6.2", 4, 0.01 / 1],
    ["PH6.3", (8 - 2) / (8 + 2), 0.6],
    ["PH6.4", Math.cos(Math.PI / 3) ** 2, 1 / (4 * 0.1)],
    ["PH6.5", Math.log(4) / 2, 2],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("stellar structure examples preserve gravothermal and transport assumptions", () => {
  const rows = [
    ["AS3.1", 20 / 2, 10 - 20],
    ["AS3.2", (6 * 4) / 2, (3 * 2 ** 4) / 3],
    ["AS3.3", (4 ** 2 * 2) / 2, 2 ** 4],
    ["AS3.4", 1 / 4, 2 ** 2 / 0.25],
    ["AS3.5", 0.5 - 0.4, 2 * 3],
    ["AS3.6", 1, 2 * 3 ** 2],
    ["AS3.7", 2 ** 4, 2 ** 2],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("stellar evolution examples preserve collapse, lifetime and orbital scalings", () => {
  const rows = [
    ["AS4.1", Math.sqrt(4), 1 / Math.sqrt(4)],
    ["AS4.2", 2 ** 2, 2 / 2 ** 3],
    ["AS4.3", 8 * 3 * 2, 10 / 2],
    ["AS4.4", 1 / Math.sqrt(4), 1 / 0.5],
    ["AS4.5", 0.5 ** 3, 80 * 0.5 ** 3],
    ["AS4.6", 8 ** (-1 / 3), 2 / (2 * 0.01)],
    ["AS4.7", (6 / 3) ** 2, 4 ** 1.5],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("high energy and interstellar examples preserve transport and geometry", () => {
  const rows = [
    ["AS5.1", (12 * 2) / (2 * 3), 2],
    ["AS5.2", 1 / (1.25 * (1 - 0.6)), 2 * 3],
    ["AS5.3", 0.1 * 2 * 10, 100 * 0.02],
    ["AS5.4", 2 ** 3, 0.5 ** 3],
    ["AS5.5", 1e-6 * 4 * 1e6, 2],
    ["AS5.6", 2 * 3 * 4, 0.1 * 2],
    ["AS6.1", 10 * 100, 10 / 1],
    ["AS6.2", 8 ** (1 / 3), 1 / 0.2],
    ["AS6.3", 6 / Math.sqrt(4), 2 * 5],
    ["AS6.4", 2 * 4, 32 ** (2 / 5)],
    ["AS6.5", Math.exp(Math.log(2)), 2 ** 2],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("planetary and galactic examples preserve geometry and inference scalings", () => {
  const rows = [
    ["AS7.1", 4 ** 1.5, Math.sqrt(2)],
    ["AS7.2", 6 / (2 * 3), 2],
    ["AS7.3", 6 * (1 / (3 * 72)) ** (1 / 3), 8 ** (1 / 3)],
    ["AS7.4", 0.1 ** 2, 0.2],
    ["AS7.5", 400 * 0.5, (1 / 16) ** 0.25],
    ["AS8.1", 200 / 10, 200 / 20],
    ["AS8.2", 3 * 2 ** 2, 2 ** 2],
    ["AS8.3", (4 ** 2 * 3) / 2, 2],
    ["AS8.4", 2 ** 4, 0.5],
    ["AS8.5", 12 / 3, 3 - 3],
    ["AS8.6", Math.sqrt(4 * 9), Math.sqrt(4)],
    ["AS8.7", 6 / (0.2 * 3), 0.8 * 10],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("cosmology and research examples retain distances, covariance and provenance", () => {
  const rows = [
    ["AS9.1", 600 / 60, (1 + 1) ** 2],
    ["AS9.2", 2 ** -3, 2 ** -4],
    ["AS9.3", (2 * (1 / 7)) / (1 + 1 / 7), 0.5],
    ["AS9.4", 2 / 100, 0.5],
    ["AS9.5", 6 / 2, (6 / 2) ** 2],
    ["AS9.6", 3, 2 + 4],
    ["AS9.7", 2 ** 3, 3 * 2 ** 3],
    ["AS9.8", 4 / Math.sqrt(2 ** 2 + 2 ** 2), 0.8 * Math.sqrt(0.3 / 0.3)],
    ["AS10.1", (3 / 2) ** 2, 3],
    ["AS10.2", (2 + 4 / 4) / (1 + 1 / 4), 4],
    ["AS10.3", 0.8 / (0.8 + 0.2), (0.2 * 0.8) / (0.2 * 0.8 + 0.8 * 0.2)],
    ["AS10.4", (12 - 10) / 2, (12 - 10) / 10],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("group theory examples preserve kernels, dimensions and invariant norms", () => {
  const rows = [
    ["MA10.1", 2, 3],
    ["MA10.2", 3, 3 * 2],
    ["MA10.3", 2, 4],
    ["MA10.4", 1 - 1, 1],
    ["MA10.5", -2, 2],
    ["MA10.6", 5 ** 2 - 3 ** 2, Math.sqrt(25 - 9)],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("geometry and functional examples retain domains, weights and conventions", () => {
  const rows = [
    ["MA11.1", 2, 0.5],
    ["MA11.2", 3, 1 / 3],
    ["MA11.3", -2, 0.5],
    ["MA11.4", 5, 25],
    ["MA11.5", 1 / 4, 2 / 4],
    ["MA11.6", 1, -1],
    ["MA11.7", 1, 0],
    ["MA12.1", 0.1 - 0.05, 0],
    ["MA12.2", 4, 25],
    ["MA12.3", 10 / 2, 10],
    ["MA12.4", 3 / 2, 2],
    ["MA12.5", 2 * 0.6 + 5 * 0.4, 0.4],
    ["MA13.1", 3, 1],
    ["MA13.2", 3 - 2 ** 2 / 2, 2 ** 2 / 2],
    ["MA13.3", 2 ** 3, 1 / 2],
    ["MA13.4", -0.5, 2],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("advanced quantum examples preserve gaps, domains, symmetry and probabilities", () => {
  const rows = [
    ["PH9.1", 1 / (2 - 5), 1 / (5 - 2)],
    ["PH9.2", 2 - 1, 2 + 1],
    ["PH9.3", 2 * 3, 2 ** 2],
    ["PH9.4", 0.4 + 3 * 0.6, 1],
    ["PH9.5", 4, 3],
    ["PH9.6", 4 * 4, 4],
    ["PH9.7", 0.75 ** 2 + 0.25 ** 2, 0.5 ** 2 + 0.5 ** 2],
    ["PH9.8", 2 * Math.sqrt(2), Math.sqrt(2)],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("relativistic and AMO examples preserve algebra, scales and open system conventions", () => {
  const rows = [
    ["PH10.1", 5, 5 - 3],
    ["PH10.2", 5, 2],
    ["PH10.3", (3 * 2 ** 2) / 2, 6 / 2],
    ["PH10.4", Math.sqrt(4), 4],
    ["PH10.5", -10 - -9, -9 - -10],
    ["PH10.6", 0.8 / 2, 0.8 - 0.4],
    ["PH12.1", 4 / 4, 4],
    ["PH12.2", 1 + 3 + 5, 1 + 1],
    ["PH12.3", 2 * 2 * 0.5, 4],
    ["PH12.4", 2 * (6 - 2), 1 / 4],
    ["PH12.5", 1, 0.5],
    ["PH12.6", -3 * 2, 8 / 2],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("nuclear particle and condensed examples preserve conventions and response factors", () => {
  const rows = [
    ["PH13.1", 0.02 * 100, 8 ** (1 / 3)],
    ["PH13.2", 0.2 * 50, 10 * 0.5 * 0.4],
    ["PH13.3", 0.03 * 100, 100 * 0.8],
    ["PH13.4", 0.5 + 1 / 6, -0.5 + 1 / 6],
    ["PH13.5", 10 - 3, 0],
    ["PH13.6", (12 - 8) / (12 + 8), 20],
    ["PH13.7", 20 / (5 * 0.5), 20 / 5],
    ["PH14.1", 1 / 2, 60],
    ["PH14.2", 2, 3],
    ["PH14.3", (3 * 2) / 2, 2],
    ["PH14.4", 2 * 0.3, 0.25],
    ["PH14.5", 2 * 3 + 1 * 2, 4 * 3 + 1 * 2],
    ["PH14.6", 4, 0.5],
    ["PH14.7", 6 / (2 * 1), 0.5],
    ["PH14.8", 2, 2 * 3],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("field theory and relativity examples retain conventions and approximation limits", () => {
  const rows = [
    ["PH15.1", 2 * 3, 3],
    ["PH15.2", 3, (9 + 4) / 2],
    ["PH15.3", 5, 10],
    ["PH15.4", 0, 2],
    ["PH15.5", 0.2 ** 2, 4],
    ["PH15.6", 0.1 * 2, 0.1 ** 2],
    ["PH15.7", 2 + 3, 2 * 3],
    ["PH15.8", 4 / (2 * 2), 8 / (2 * 2)],
    ["PH16.1", -6 / 2, -3 * 4],
    ["PH16.2", -2 * 3, -1],
    ["PH16.3", (2 * 3) / 2, Math.sqrt(0.75)],
    ["PH16.4", 5 + Math.sqrt(25 - 9), 0.5],
    ["PH16.5", 0.5, 0.25],
    ["PH16.6", 8 ** (2 / 3), Math.sqrt(4)],
    ["PH16.7", 0.5 ** 2, 0.04 / 4],
    ["PH16.8", Math.sqrt(4 * 9), 2 ** -1.5],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("supporting chemistry examples preserve electronic, isotope and network assumptions", () => {
  const rows = [
    ["CH2.1", (2 - 1) / (1 + 0), (2 + 1) / (1 - 0)],
    ["CH2.2", Math.sqrt(8 / 2), (8 * 0.5 ** 2) / 2],
    ["CH2.3", -10 - -12, -11 - -12],
    ["CH2.4", 2 * (6 - 2), 0.5],
    ["CH2.5", 0.3 ** 2, 3 / (3 + 1)],
    ["CH2.6", 3 * 2, (2 / 1e6) * 1e6],
    ["CH3.1", 6 / 2, 1 / 2],
    ["CH3.2", 0.5 * 2 * 3, 10 - 9],
    ["CH3.3", 0.01 / 100, 0.01 / 100],
    ["CH3.4", Math.exp(-Math.log(10)), 5],
    ["CH3.5", -6 - -8, Math.sqrt(0.3 ** 2 + 0.4 ** 2)],
    ["CH5.1", -7 - -10, 8 - 1],
    ["CH5.2", 8 - 2, 8 - 3],
    ["CH5.3", 2 * 3 + 1, 2 * (2 * 3 + 1)],
    ["CH5.4", 4 - 2 * 2, 4 - 4 * 2],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});
test("experimental and research examples preserve uncertainties and provenance distinctions", () => {
  const rows = [
    ["PH17.1", 2 / Math.sqrt(16), Math.sqrt(0.5 ** 2 + 0.3 ** 2)],
    ["PH17.2", 4.096 / 2 ** 12, 2 * 100],
    ["PH17.3", (4 * 785) / 1000, 0.5],
    ["PH17.4", 2 / 4, 1 + ((0.5 + 0.5) * 2) / 2],
    ["PH17.5", Math.PI ** 2, 0.02],
    ["PH18.1", (12 - 10) / 2, 12 - 10],
    ["PH18.2", (2 * 3 ** 2) / 2, 4],
    ["PH18.3", 1 ** 2 + 2 ** 2, 2],
    ["PH18.4", 12 / 3, 2],
  ];
  for (const [id, n, w] of rows) {
    check(id, "numeric", n);
    check(id, "warmup", w);
  }
});

test("expanded canonical example counts degenerate microstates and satisfies energy fluctuations", () => {
  const beta = Math.log(3),
    levels = [0, 1, 1, 1],
    weights = levels.map((energy) => Math.exp(-beta * energy)),
    Z = weights.reduce((sum, weight) => sum + weight, 0),
    mean = levels.reduce(
      (sum, energy, i) => sum + (energy * weights[i]) / Z,
      0,
    ),
    variance = levels.reduce(
      (sum, energy, i) => sum + ((energy - mean) ** 2 * weights[i]) / Z,
      0,
    );
  assert.ok(Math.abs(mean - 0.5) < 1e-12);
  assert.ok(Math.abs(variance - 0.25) < 1e-12);
  const h = 1e-4;
  const logZ = (b) => Math.log(1 + 3 * Math.exp(-b));
  const secondDerivative =
    (logZ(beta + h) - 2 * logZ(beta) + logZ(beta - h)) / h ** 2;
  assert.ok(Math.abs(secondDerivative - variance) < 1e-7);
});

test("a Cartesian straight line obeys both polar geodesic equations away from the origin", () => {
  for (const b of [0.25, 1, 3]) {
    for (const t of [-4, -1, 0, 2, 5]) {
      const r = Math.hypot(t, b),
        rDot = t / r,
        rDDot = (b * b) / r ** 3,
        thetaDot = -b / r ** 2,
        thetaDDot = (2 * b * t) / r ** 4;
      assert.ok(Math.abs(rDDot - r * thetaDot ** 2) < 1e-12);
      assert.ok(Math.abs(thetaDDot + (2 * rDot * thetaDot) / r) < 1e-12);
      assert.ok(Math.abs(rDot ** 2 + r ** 2 * thetaDot ** 2 - 1) < 1e-12);
    }
  }
});

test("generated authored lesson downloads agree with curriculum availability", () => {
  const course = JSON.parse(
    fs.readFileSync("src/generated/course.json", "utf8"),
  );
  for (const lesson of course.lessons) {
    if (!course.authored[lesson.id]) continue;
    const downloaded = JSON.parse(
      fs.readFileSync(`public/content/${lesson.id}.json`, "utf8"),
    );
    assert.equal(lesson.available, true, lesson.id);
    assert.equal(
      course.authored[lesson.id].available,
      lesson.available,
      lesson.id,
    );
    assert.equal(downloaded.available, lesson.available, lesson.id);
  }
});

test("new Core transfers preserve degeneracy, gradient energy, tidal signs and covariance", () => {
  check("PH7.4", "review-core-transfer", (3 * (1 / 3)) / (1 + 3 * (1 / 3)));
  check("MA11.4", "review-core-transfer", 1 / Math.hypot(0, 1) ** 3);
  check(
    "PH15.2",
    "review-core-transfer",
    (3 ** 2 + 4 ** 2 + 2 ** 2 * 1 ** 2) / 2,
  );
  check("PH7.6", "review-core-transfer", 0.5 * (1 + 0.5));
  check("PH16.1", "review-core-transfer", 2 * 2 * 0.1);
  const covariance = [
      [1, 0.5],
      [0.5, 1],
    ],
    residual = [1, 1];
  const determinant =
    covariance[0][0] * covariance[1][1] - covariance[0][1] ** 2;
  const quadratic =
    (residual[0] ** 2 * covariance[1][1] -
      2 * residual[0] * residual[1] * covariance[0][1] +
      residual[1] ** 2 * covariance[0][0]) /
    determinant;
  check("PH18.1", "review-core-transfer", quadratic);
});

test("field and curvature Core transfers distinguish conventions and integrated running", () => {
  check("PH15.3", "review-core-transfer", 5 * (3 + 0.5));
  check("MA11.5", "review-core-transfer", 2 ** 2 * Math.sin(Math.PI / 6) ** 2);
  check("PH15.6", "review-core-transfer", 0.5 / (1 - 0.1 * 0.5 * 2));
  const matched = (cutoff, q, q0) =>
    Math.log(((cutoff + q) * q0) / (q * (cutoff + q0)));
  for (const cutoff of [10, 100, 1000]) {
    assert.equal(matched(cutoff, 1, 1), 0);
    assert.ok(Math.abs(matched(cutoff, 2, 1) + Math.log(2)) < 1 / cutoff);
  }
  const g = (t) => 0.5 / (1 - 0.1 * 0.5 * t),
    h = 1e-5;
  assert.ok(
    Math.abs((g(2 + h) - g(2 - h)) / (2 * h) - 0.1 * g(2) ** 2) < 1e-10,
  );
});

test("expanded mechanics transfer answers match independent force, work, rolling and pendulum calculations", () => {
  const cases = {
    "PB1.1": {
      "warmup-net-force": 6 / 3,
      "warmup-velocity": 3 * 4,
      "warmup-displacement": (10 * 2 ** 2) / 2,
      "transfer-stopping": 10 ** 2 / (2 * 2),
      "transfer-height": 1 / 2 ** 2,
      "transfer-terminal": (2 * 10) / 5,
    },
    "PB1.2": {
      "warmup-work": 10 * 2 * Math.cos(Math.PI / 3),
      "warmup-kinetic": (2 * 3 ** 2) / 2,
      "warmup-impulse": 6 * 0.5,
      "transfer-inelastic": 0.5 * 4 ** 2 - 0.5 * 2 * 2 ** 2,
      "transfer-spring": (100 * 0.2 ** 2) / 2,
      "transfer-friction": -0.2 * 2 * 10 * 3,
    },
    "PB1.3": {
      "warmup-rolling": 0.5 * 4,
      "warmup-torque": 2 * 3,
      "warmup-rotation-energy": 0.5 * 0.5 * 2 ** 2,
      "transfer-cylinder": Math.sqrt((2 * 10 * 0.3) / 1.5),
      "transfer-hoop": Math.sqrt((2 * 10) / (1 + 1)),
      "transfer-top-speed": 2 * 3,
    },
    "PB1.4": {
      "warmup-length-ratio": Math.sqrt(4),
      "warmup-period": 2 * Math.PI * Math.sqrt(1 / Math.PI ** 2),
      "warmup-frequency": 1 / 0.5,
      "transfer-infer-gravity": (4 * Math.PI ** 2) / Math.PI ** 2,
      "transfer-amplitude": 0.4 ** 2 / 16,
      "transfer-planet": 1 / Math.sqrt(4),
    },
  };
  for (const [id, questions] of Object.entries(cases))
    for (const [qid, value] of Object.entries(questions)) check(id, qid, value);
});

test("lean course metadata preserves section identity while public lesson JSON retains full tutor text", () => {
  const course = JSON.parse(
    fs.readFileSync("src/generated/course.json", "utf8"),
  );
  for (const [id, lesson] of Object.entries(course.authored)) {
    const full = JSON.parse(
      fs.readFileSync(`public/content/${id}.json`, "utf8"),
    );
    assert.deepEqual(
      lesson.sections.map((s) => s.id),
      full.sections.map((s) => s.id),
      id,
    );
    assert.ok(
      lesson.sections.every((s) => !Object.hasOwn(s, "text")),
      id,
    );
    assert.ok(
      full.sections.find((s) => s.id === "theory")?.text.length > 0,
      id,
    );
  }
});
