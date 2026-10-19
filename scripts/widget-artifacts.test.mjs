import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { widgetArtifacts } from "./widget-artifacts.mjs";
import { reviewPacket } from "./review-packet.mjs";
test("review packets bind explicit and implicit models to implementation and shared coordinate code", () => {
  const packet = reviewPacket(process.cwd(), "AS2.1");
  assert.equal(packet.independentReviewCompleted, false);
  for (const f of [
    "src/lib/astro-investigations.ts",
    "src/components/widgets/AstroInvestigation.tsx",
    "src/components/widgets/FoundationExplorers.tsx",
  ])
    assert.ok(packet.modelArtifacts[f]);
  const implicit = widgetArtifacts(process.cwd(), "no explicit widgets", {
    id: "X.1",
    title: "Schwarzschild tests",
  });
  assert.ok(implicit["src/components/widgets/BlackHoleExplorer.tsx"]);
  assert.throws(() => reviewPacket(process.cwd(), "../../secrets"));
});
test("model source and shared-helper edits change artifact fingerprints", () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "parallax-review-artifacts-"),
  );
  try {
    for (const [f, s] of Object.entries({
      "src/components/widgets/registry.tsx":
        'import { Demo } from "./Demo";\nexport const widgets = {demo: Demo};\nexport function Widget() {}',
      "src/components/widgets/Demo.tsx":
        'import {f} from "../../lib/model";export const Demo=f;',
      "src/lib/model.ts": "export const f=1;",
      "src/components/learning/LessonSimulation.tsx": "selectors",
    })) {
      fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
      fs.writeFileSync(path.join(root, f), s);
    }
    const source = '<Widget name="demo" />';
    const before = widgetArtifacts(root, source);
    fs.writeFileSync(path.join(root, "src/lib/model.ts"), "export const f=2;");
    const after = widgetArtifacts(root, source);
    assert.notEqual(before["src/lib/model.ts"], after["src/lib/model.ts"]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
