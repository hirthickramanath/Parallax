import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import {
  coriolis,
  principalBody,
  rutherford,
} from "../src/lib/advanced-mechanics-models.ts";
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const values = {
  "PH1.1": [3 / 2, 15 * (1 - Math.exp(-Math.log(2))), 500 * Math.log(2)],
  "PH1.2": [-2 * 3 * 0.5 * 4, 3 * 0.5 ** 2 * 8, -3 * 0.1 * 5],
  "PH1.3": [
    -8 / (2 * -0.5),
    Math.sqrt(1 + (2 * -0.5 * 48) / 8 ** 2),
    8 * (1 - 0.5),
  ],
  "PH1.4": [
    4 / (2 * 2) / Math.tan(Math.PI / 4),
    4 / (2 * 2) / Math.tan(Math.PI / 6),
    (Math.sin(Math.PI / 4) / Math.sin(Math.PI / 6)) ** 4,
  ],
  "PH1.5": [(1 * 0 + 3 * 4) / (1 + 3), 10 / 5, 2 * 3 ** 2 * 0.5],
  "PH1.6": [
    (2 + 3 * 4) / 2,
    ((3 - 4) * 2 * 3) / 2,
    2 * Math.sqrt(((3 - 2) * (4 - 3)) / (2 * 4)),
  ],
};
for (const [id, answers] of Object.entries(values))
  test(`${id} transfer values match independent force energy and geometry calculations`, () => {
    const d = parse(
      /^---\n([\s\S]*?)\n---/.exec(
        fs.readFileSync(`content/lessons/${id}.mdx`, "utf8"),
      )[1],
    );
    answers.forEach((v, i) =>
      close(
        Number(
          d.questions.find((q) => q.id === `mechanics-transfer-${i + 1}`)
            .answer,
        ),
        v,
      ),
    );
    assert.equal(d.questions.length, 10);
  });
test("Coriolis vector reverses with frame spin and does zero instantaneous rotating-frame work", () => {
  for (const o of [-2, -0.5, 0, 0.5, 2])
    for (const x of [-4, 0, 3])
      for (const y of [-3, 0, 4]) {
        const a = coriolis(o, x, y);
        close(x * a.ax + y * a.ay, 0);
        const b = coriolis(-o, x, y);
        close(a.ax, -b.ax);
        close(a.ay, -b.ay);
      }
  close(coriolis(0.5, 4, 0).ay, -4);
});
test("Euler body derivatives preserve energy and angular-momentum magnitude instantaneously", () => {
  for (const w of [
    [1, 2, 3],
    [-2, 1, 0.3],
    [0, 2, 0],
    [3, 0, 0],
  ]) {
    const s = principalBody(...w);
    close(
      s.derivative.reduce((a, d, i) => a + [2, 3, 4][i] * w[i] * d, 0),
      0,
    );
    close(
      s.derivative.reduce((a, d, i) => a + 2 * [2, 3, 4][i] ** 2 * w[i] * d, 0),
      0,
    );
  }
  close(principalBody(1, 2, 0).energy, 7);
  close(principalBody(0, 2, 0).crossMagnitude, 0);
  assert.ok(principalBody(1, 2, 0).crossMagnitude > 0);
});
test("Rutherford impact and angular cross-section relations agree and remain finite within controls", () => {
  const s = rutherford(1, 2);
  close(s.angle, Math.PI / 2);
  close(s.crossSection, 1);
  close(rutherford(Math.sqrt(3), 2).crossSection / s.crossSection, 4);
  for (const b of [0.2, 1, 4])
    for (const e of [0.5, 2, 5]) {
      const s = rutherford(b, e);
      close(b, 4 / (2 * e) / Math.tan(s.angle / 2));
      assert.ok(Number.isFinite(s.crossSection) && s.crossSection > 0);
      assert.ok(s.angle > 0 && s.angle < Math.PI);
    }
});
