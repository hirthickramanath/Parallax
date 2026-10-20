import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import { astroInvestigations as models } from "../src/lib/astro-investigations.ts";
const close = (a, b) =>
  assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)), `${a} != ${b}`);
for (const [id, m] of Object.entries(models)) {
  test(`${id} investigation stays finite across its stated parameter domain`, () => {
    for (let i = 0; i <= 20; i++)
      for (let j = 0; j <= 10; j++)
        assert.ok(
          Number.isFinite(
            m.value(
              m.x[1] + (i / 20) * (m.x[2] - m.x[1]),
              m.parameter[1] + (j / 10) * (m.parameter[2] - m.parameter[1]),
            ),
          ),
        );
    assert.ok(m.assumptions.length > 80);
    assert.ok(m.x[1] <= m.x[3] && m.x[3] <= m.x[2]);
    assert.ok(
      m.parameter[1] <= m.parameter[3] && m.parameter[3] <= m.parameter[2],
    );
  });
  test(`${id} has transfer questions and an explicit matching investigation`, () => {
    const text = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8");
    const d = parse(/^---\n([\s\S]*?)\n---/.exec(text)[1]);
    assert.ok(text.includes(`<Widget name="astro_${id}" />`));
    assert.ok(text.includes("### Derive, test and transfer"));
    const transfer = d.questions.filter((q) =>
      q.id.startsWith("astro-transfer-"),
    );
    assert.equal(transfer.length, 2);
    for (const q of transfer) {
      assert.ok(q.hint && q.explanation && Number.isFinite(Number(q.answer)));
    }
    const h = d.questions.find((q) => q.id === "astro-model-assumptions");
    assert.ok(
      h.options.includes(h.answer) && Object.keys(h.misconceptions).length,
    );
    assert.equal(d.status, "draft");
  });
}
test("celestial meridian and seasonal limits match geometry", () => {
  close(models["AS1.1"].value(-20, 30), 40);
  close(models["AS1.2"].value(0, 30), 60);
  close(models["AS1.2"].value(90, 40), 73.44);
});
test("inverse-square luminosity, Planck normalization and slab limits", () => {
  const f = models["AS2.1"].value;
  close(f(4, 2) / f(2, 2), 0.25);
  close(models["AS2.2"].value(1, 6000), 1);
  close(models["AS2.3"].value(0, 3), 1);
  close(models["AS2.3"].value(Math.log(2), 3), 2);
  close(models["AS2.4"].value(0.6, 500), 1000);
});
test("uniform sphere boundary, polytrope and grey temperature recover analytic cases", () => {
  close(models["AS3.1"].value(1, 2), 0);
  close(models["AS3.1"].value(0.5, 1) / models["AS3.1"].value(0, 1), 0.75);
  close(models["AS3.6"].value(Math.PI, 1), 0);
  close(models["AS3.7"].value(2 / 3, 6000), 6000);
});
test("relativistic beaming, shock and mass scaling match limiting cases", () => {
  close(models["AS5.2"].value(90, 5), 0.2);
  close(models["AS6.4"].value(1, 5 / 3), 1);
  close(models["AS6.4"].value(3, 5 / 3), 3);
  close(models["AS8.3"].value(3, 2), 12);
});
test("cosmology normalizations and synthetic inference respect probability bounds", () => {
  close(models["AS9.2"].value(1, 0.3), 1);
  close(models["AS9.3"].value(2, 2.725), 2.725 / 2);
  close(models["AS9.4"].value(140, 14000), 100 * Math.PI);
  close(models["AS10.3"].value(4, 0.2), 0.5);
  for (const L of [0.1, 1, 20])
    for (const p of [0.01, 0.5, 0.99])
      assert.ok(
        models["AS10.3"].value(L, p) > 0 && models["AS10.3"].value(L, p) < 1,
      );
});

test("core astronomy inference extensions preserve units and numerical relationships", () => {
  const expected = {
    "AS1.1": 90 - Math.abs(-25 - 10),
    "AS1.2": 90 - Math.abs(35 + 23.44),
    "AS1.3": Math.sqrt(9 ** 3),
    "AS2.1": 0.5 * 3 ** 2,
    "AS2.2": (2.9e-3 / 7250) * 1e9,
    "AS2.4": (603 / 600 - 1) * 300000,
    "AS7.4": 1.5 * Math.sqrt(0.0009),
    "AS9.1": 6000 / 75,
  };
  for (const [id, value] of Object.entries(expected)) {
    const source = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8");
    const data = parse(/^---\n([\s\S]*?)\n---/.exec(source)[1]);
    const question = data.questions.find(
      (q) => q.id === "worked-inference-transfer",
    );
    close(Number(question.answer), value);
    assert.ok(question.unit && question.hint && question.explanation);
    assert.match(source, /### Worked inference:/);
    assert.equal(data.status, "draft");
  }
});
