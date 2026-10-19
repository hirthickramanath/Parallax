import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import {
  oscillatorPhase,
  canonicalShear,
} from "../src/lib/analytical-mechanics-models.ts";
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const answers = {
  "PH2.1": [(-8 * 0.3) / 2, 3 * 2 ** 2 * 0.5, 6 * 2],
  "PH2.2": [(-3 * 2) / 4, 3 ** 2 / 2, 6 - 1],
  "PH2.3": [2 * 3 ** 2 * 0.5, 14 - 4 * 2, 2 * 4 - 1 * 3],
  "PH2.4": [2 / 2, -8 * 0.5, (2 * Math.PI * 3) / 2],
  "PH2.5": [3 / 3, 10 - 2 * 3, 2 * 3],
  "PH2.6": [10 / 4, Math.sqrt(2 * 2 * 9), 3 + 2],
  "PH2.7": [Math.sqrt((16 - 8) / 2), Math.sqrt((16 + 8) / 2), 1 / Math.sqrt(4)],
};
for (const [id, values] of Object.entries(answers))
  test(`${id} transfer values satisfy variational and canonical relations`, () => {
    const d = parse(
      /^---\n([\s\S]*?)\n---/.exec(
        fs.readFileSync(`content/lessons/${id}.mdx`, "utf8"),
      )[1],
    );
    assert.equal(d.questions.length, 10);
    values.forEach((v, i) =>
      close(
        Number(
          d.questions.find((q) => q.id === `analytical-transfer-${i + 1}`)
            .answer,
        ),
        v,
      ),
    );
  });
test("oscillator contours conserve H along the Hamiltonian vector field and enclose 2πJ", () => {
  for (const m of [0.5, 1, 3])
    for (const w of [0.5, 1, 3])
      for (const [q, p] of [
        [0, 0],
        [1, 2],
        [-3, 1],
      ]) {
        const s = oscillatorPhase(q, p, m, w);
        close(m * w * w * q * s.qdot + (p / m) * s.pdot, 0);
        close(Math.PI * s.amplitudeQ * s.amplitudeP, s.area);
        close(s.area, 2 * Math.PI * s.action);
        if (s.energy > 0)
          close((q * q) / s.amplitudeQ ** 2 + (p * p) / s.amplitudeP ** 2, 1);
      }
});
test("canonical shear preserves oriented area and has the stated inverse", () => {
  for (const alpha of [-2, -1, 0, 2]) {
    const a = canonicalShear(1, 0, alpha),
      b = canonicalShear(0, 1, alpha);
    close(a.Q * b.P - a.P * b.Q, 1);
    for (const q of [-2, 0, 2])
      for (const p of [-2, 0, 2]) {
        const s = canonicalShear(q, p, alpha);
        close(s.P + alpha * s.Q, p);
        close(s.Q, q);
      }
  }
});
