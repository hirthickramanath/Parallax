import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
export function validateGraph(curriculum) {
  const ids = new Map(curriculum.lessons.map((l) => [l.id, l]));
  if (ids.size !== curriculum.lessons.length)
    throw Error("Duplicate lesson id");
  const units = new Map(curriculum.units.map((u) => [u.id, u]));
  if (units.size !== curriculum.units.length) throw Error("Duplicate unit");
  for (const u of units.values())
    for (const n of u.needs) {
      if (!units.has(n) || units.get(n).phase >= u.phase)
        throw Error(`Invalid unit prerequisite ${u.id} → ${n}`);
    }
  const visited = new Set(),
    active = new Set();
  function visit(id) {
    if (active.has(id)) throw Error(`Cycle at ${id}`);
    if (visited.has(id)) return;
    const l = ids.get(id);
    if (!l) throw Error(`Missing id ${id}`);
    active.add(id);
    for (const dep of l.requires) {
      const d = ids.get(dep);
      if (!d) throw Error(`Missing id ${dep}`);
      if (d.phase > l.phase) throw Error(`Later-phase prerequisite ${dep}`);
      visit(dep);
    }
    active.delete(id);
    visited.add(id);
  }
  for (const l of ids.values()) {
    const u = units.get(l.unit);
    if (!u || u.phase !== l.phase || !u.lessons.includes(l.id))
      throw Error(`Invalid placement ${l.id}`);
    visit(l.id);
  }
}
export function buildContent() {
  const curriculum = JSON.parse(
    fs.readFileSync("content/curriculum.json", "utf8"),
  );
  validateGraph(curriculum);
  const authored = {};
  for (const file of fs
    .readdirSync("content/lessons")
    .filter((f) => f.endsWith(".mdx"))) {
    const source = fs.readFileSync(path.join("content/lessons", file), "utf8");
    const header = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
    if (!header) throw Error(`Missing lesson frontmatter ${file}`);
    const data = parse(header[1]);
    const content = source.slice(header[0].length);
    const stub = curriculum.lessons.find((l) => l.id === data.id);
    if (!stub) throw Error(`Unknown authored id ${data.id}`);
    const sections = [
      ...content.matchAll(
        /<LessonSection id="([^"]+)" title="([^"]+)" layer="([^"]+)"(?: fullOnly)?>([\s\S]*?)<\/LessonSection>/g,
      ),
    ].map((m) => ({
      id: m[1],
      title: m[2],
      layer: m[3],
      fullOnly: m[0].startsWith(
        m[0].slice(0, m[0].indexOf(">")) + " fullOnly>",
      ),
      text: m[4].replace(/<[^>]*>/g, " ").trim(),
    }));
    if (!sections.length) throw Error(`No sections ${file}`);
    const fullIds = [
      ...content.matchAll(/<LessonSection id="([^"]+)"[^>]* fullOnly>/g),
    ].map((m) => m[1]);
    for (const section of sections)
      section.fullOnly = fullIds.includes(section.id);
    if (new Set(sections.map((s) => s.id)).size !== sections.length)
      throw Error(`Duplicate section ${file}`);
    authored[data.id] = { ...stub, ...data, sections };
    stub.available = true;
    stub.hook = data.hook || stub.hook;
  }
  fs.mkdirSync("src/generated", { recursive: true });
  fs.mkdirSync("public/content", { recursive: true });
  fs.writeFileSync(
    "src/generated/course.json",
    JSON.stringify({ ...curriculum, authored }),
  );
  for (const [id, lesson] of Object.entries(authored))
    fs.writeFileSync(`public/content/${id}.json`, JSON.stringify(lesson));
  console.log(
    `Validated ${curriculum.lessons.length} lesson stubs; ${Object.keys(authored).length} authored drafts`,
  );
}
if (process.argv[1]?.endsWith("/content.mjs")) buildContent();
