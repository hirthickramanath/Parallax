import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import { multivariableInvestigations as m } from "../src/lib/multivariable-investigations.ts";
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const answers = {
  "MA2.1": [12, 32],
  "MA2.2": [4.4, 9],
  "MA2.3": [Math.sqrt(2), 8],
  "MA2.4": [8 * Math.PI, 6],
  "MA2.5": [2 * Math.PI, 5],
  "MA2.6": [4 * Math.PI, 3],
  "MA2.7": [4 * Math.PI, 2],
  "MA2.8": [2, 3],
};
for (const [id, v] of Object.entries(answers))
  test(`${id} transfers and model bounds remain valid`, () => {
    const s = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8");
    const d = parse(/^---\n([\s\S]*?)\n---/.exec(s)[1]);
    v.forEach((x, i) =>
      close(
        Number(
          d.questions.find((q) => q.id === `multivariable-transfer-${i + 1}`)
            .answer,
        ),
        x,
      ),
    );
    assert.ok(s.includes(`name="multivariable_${id}"`));
    const model = m[id];
    for (let i = 0; i <= 10; i++)
      for (let j = 0; j <= 10; j++)
        assert.ok(
          Number.isFinite(
            model.value(
              model.x[1] + (i / 10) * (model.x[2] - model.x[1]),
              model.parameter[1] +
                (j / 10) * (model.parameter[2] - model.parameter[1]),
            ),
          ),
        );
  });
test("gradient directional extrema and annulus degeneracy match analysis", () => {
  close(m["MA2.2"].value((Math.atan2(4, 2) * 180) / Math.PI, 1), Math.sqrt(20));
  close(m["MA2.4"].value(2, 1), 0);
  close(m["MA2.4"].value(2, 0), 4 * Math.PI);
});
test("circulation and oriented flux reverse with field sign while divergence matches radial integration", () => {
  for (const R of [0.2, 1, 3]) {
    close(m["MA2.5"].value(R, -2), -m["MA2.5"].value(R, 2));
    close(m["MA2.6"].value(R, 1), m["MA2.7"].value(R, 1));
  }
  close(m["MA2.8"].value(2, 1), 2);
});
