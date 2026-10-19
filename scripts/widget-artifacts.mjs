import fs from "node:fs";
import path from "node:path";
import { sourceFingerprint } from "./review-evidence.mjs";
const resolveLocal = (base, spec) => {
  const p = path.resolve(path.dirname(base), spec);
  return [
    p,
    p + ".ts",
    p + ".tsx",
    path.join(p, "index.ts"),
    path.join(p, "index.tsx"),
  ].find((f) => fs.existsSync(f) && fs.statSync(f).isFile());
};
/** Conservative transitive source hashes; model changes invalidate previous review evidence. */
export function widgetArtifacts(root, source, lesson = {}) {
  const registry = path.join(root, "src/components/widgets/registry.tsx");
  const text = fs.readFileSync(registry, "utf8");
  const imports = new Map();
  for (const m of text.matchAll(
    /import\s*\{([\s\S]*?)\}\s*from\s*["']([^"']+)["']/g,
  ))
    for (const item of m[1].split(",")) {
      const name = item.trim();
      if (name) imports.set(name, resolveLocal(registry, m[2]));
    }
  const table = text.slice(
    text.indexOf("export const widgets ="),
    text.indexOf("export function Widget"),
  );
  const registered = new Map(
    [...table.matchAll(/(\w+):\s*(\w+)/g)].map((m) => [
      m[1],
      imports.get(m[2]),
    ]),
  );
  const names = [...source.matchAll(/<Widget name="([^"]+)"/g)].map(
    (m) => m[1],
  );
  if (/black hole|schwarzschild/i.test(lesson.title || ""))
    names.push("black_hole_explorer");
  if (/vector|dot product|cross product/i.test(lesson.title || ""))
    names.push("vector_explorer");
  if (lesson.id === "PB1.2") names.push("collision_explorer");
  if (lesson.id === "PB1.3") names.push("rolling_explorer");
  if (!names.length) return {};
  const files = new Set();
  const visit = (f) => {
    if (!f || files.has(f)) return;
    if (!f.startsWith(path.join(root, "src") + path.sep))
      throw Error("Model import escapes source tree");
    files.add(f);
    const code = fs.readFileSync(f, "utf8");
    for (const m of code.matchAll(/\bfrom\s*["'](\.[^"']+)["']/g)) {
      const target = resolveLocal(f, m[1]);
      if (!target) throw Error("Unresolved model source " + m[1]);
      visit(target);
    }
  };
  for (const name of new Set(names)) {
    const config = name.startsWith("physical_chemistry_")
      ? "physical-chemistry-investigations.ts"
      : name.startsWith("thermal_optics_")
        ? "thermal-optics-investigations.ts"
        : name.startsWith("em_")
          ? "em-investigations.ts"
          : name.startsWith("astro_")
            ? "astro-investigations.ts"
            : name.startsWith("multivariable_")
              ? "multivariable-investigations.ts"
              : name.startsWith("linear_ode_")
                ? "linear-ode-investigations.ts"
                : null;
    if (config) {
      const configuration = fs.readFileSync(
        path.join(root, "src/lib", config),
        "utf8",
      );
      const ids = new Set(
        [...configuration.matchAll(/["']([A-Z]+\d*\.\d+)["']\s*:/g)].map(
          (m) => m[1],
        ),
      );
      const id = name.slice(name.lastIndexOf("_") + 1);
      if (!ids.has(id)) throw Error("Unknown configured investigation " + name);

      visit(path.join(root, "src/components/widgets/AstroInvestigation.tsx"));
      visit(path.join(root, "src/lib", config));
    } else {
      const file = registered.get(name);
      if (!file) throw Error("Unknown widget source " + name);
      visit(file);
    }
  }
  // These selectors determine which scientific model actually appears.
  files.add(registry);
  files.add(path.join(root, "src/components/learning/LessonSimulation.tsx"));
  return Object.fromEntries(
    [...files]
      .sort()
      .map((f) => [
        path.relative(root, f).split(path.sep).join("/"),
        sourceFingerprint(fs.readFileSync(f, "utf8")),
      ]),
  );
}
