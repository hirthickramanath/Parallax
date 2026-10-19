import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import {
  hydrostatic,
  thermalHeating,
  ellipsePoint,
  planeProjection,
} from "../src/lib/foundation-models.ts";
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
function check(id, values) {
  const data = parse(
    /^---\n([\s\S]*?)\n---/.exec(
      fs.readFileSync(`content/lessons/${id}.mdx`, "utf8"),
    )[1],
  );
  for (const [key, value] of Object.entries(values)) {
    const q = data.questions.find((q) => q.id === key);
    assert.ok(q, `${id}:${key}`);
    close(Number(q.answer), value);
  }
}
test("24 new transfer answers agree with separately calculated force, energy and geometry relations", () => {
  check("PB2.1", {
    "depth-transfer": 1000 * 9.8 * 3,
    "absolute-transfer": 101300 + 29400,
    "buoyancy-transfer": 1000 * 0.003 * 9.8,
    "floating-transfer": 600 / 1000,
    "continuity-transfer": (6 * 2) / 3,
    "bernoulli-transfer": 0.5 * 1000 * (2 ** 2 - 4 ** 2),
  });
  check("PB2.2", {
    "isochoric-transfer": 1.5 * 8.314 * 20,
    "isobaric-work": 8.314 * 20,
    "isobaric-heat": 2.5 * 8.314 * 20,
    "first-law-transfer": 500 - 180,
    "cycle-transfer": 80,
    "entropy-transfer": 600 / 300,
  });
  check("MB2.2", {
    "ellipse-minor": Math.sqrt(25 - 9),
    "ellipse-eccentricity": 3 / 5,
    "periapsis-transfer": 10 * (1 - 0.4),
    "apoapsis-transfer": 10 * (1 + 0.4),
    "polar-transfer": 6 / (1 + 0.5 * Math.cos(Math.PI / 2)),
    "hyperbola-transfer": Math.hypot(3, 4),
  });
  check("MB2.3", {
    "normal-length": Math.hypot(2, -1, 2),
    "signed-distance": (6 + 6 - 6) / 3,
    "normal-rescale": Math.abs(12 + 12 - 12) / 6,
    "projection-x": 3 - (3 + 6 + 6 - 3) / 9,
    "line-plane": 1 + 2,
    "skew-distance": Math.hypot(0, 0, 2),
  });
});
test("embedded models preserve invariants and limiting cases over their control ranges", () => {
  for (const rho of [500, 1000, 1500])
    for (const h of [0, 1, 5]) {
      const s = hydrostatic(h, rho);
      close(s.absolute - s.gauge, 101300);
      close(s.gauge, rho * 9.8 * h);
    }
  for (const t of [0, 20, 100])
    for (const pressure of [true, false]) {
      const s = thermalHeating(t, pressure);
      close(s.heat - s.work, s.internal);
      if (!pressure) close(s.work, 0);
    }
  for (const e of [0, 0.4, 0.85])
    for (let angle = -Math.PI; angle <= Math.PI; angle += 0.1) {
      const a = 5,
        s = ellipsePoint(a, e, angle);
      close((s.x + a * e) ** 2 / a ** 2 + s.y ** 2 / (a * a * (1 - e * e)), 1);
      close(Math.hypot(s.x, s.y), s.r);
      close(Math.hypot(s.x + 2 * a * e, s.y) + s.r, 2 * a);
    }
  for (const x of [-3, 0, 6])
    for (const z of [-3, 0, 6]) {
      const s = planeProjection(x, z),
        [hx, hy, hz] = s.foot;
      close(hx + 2 * hy + 2 * hz, 3);
      close(Math.hypot(x - hx, hy, z - hz), Math.abs(s.signed));
      close((x - hx) * 2, -hy);
      close((x - hx) * 2, z - hz);
    }
});

test("revised warmups are distinct calculations and all four expanded banks have unique prompts", () => {
  check("PB2.1", { warmup: 1000 * 9.8 * 0.5 });
  check("PB2.2", { warmup: 150 - 40 });
  check("MB2.2", { warmup: Math.sqrt(13 ** 2 - 12 ** 2) });
  check("MB2.3", { warmup: Math.abs(1 - -2) });
  for (const id of ["PB2.1", "PB2.2", "MB2.2", "MB2.3"]) {
    const d = parse(
      /^---\n([\s\S]*?)\n---/.exec(
        fs.readFileSync(`content/lessons/${id}.mdx`, "utf8"),
      )[1],
    );
    assert.equal(
      new Set(d.questions.map((q) => q.prompt)).size,
      d.questions.length,
    );
  }
});
