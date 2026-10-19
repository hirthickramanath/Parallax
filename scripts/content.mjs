import { compileSync } from "@mdx-js/mdx";
import remarkFrontmatter from "remark-frontmatter";
import remarkMath from "remark-math";
import { remarkSafeContent } from "../src/lib/mdx-authoring.ts";
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
export function validateAuthored(data, sections, stub) {
  if (!data.id || data.id !== stub.id) throw Error("Authored ID mismatch");
  for (const key of ["unit", "phase", "track"])
    if (data[key] !== undefined && data[key] !== stub[key])
      throw Error(`Conflicting ${key} in ${data.id}`);
  const expected = [
    "before",
    "puzzle",
    "story",
    "intuition",
    "concept",
    "theory",
    "interactive",
    "worked",
    "problems",
    "check",
    "connections",
  ];
  const actual = sections.map((section) => section.layer);
  if (expected.some((layer, index) => actual[index] !== layer))
    throw Error(`Incomplete or reordered template ${data.id}`);
  if (
    !Array.isArray(data.recap) ||
    data.recap.length < 2 ||
    !Array.isArray(data.review) ||
    data.review.length < 1
  )
    throw Error(`Missing recap/review ${data.id}`);
  if (!Array.isArray(data.questions))
    throw Error(`Missing questions ${data.id}`);
  const ids = new Set();
  for (const q of data.questions) {
    if (ids.has(q.id)) throw Error(`Duplicate question ${data.id}:${q.id}`);
    ids.add(q.id);
    if (
      q.exact !== undefined &&
      (typeof q.exact !== "boolean" || q.type !== "numeric")
    )
      throw Error(`Invalid exact grading flag ${data.id}:${q.id}`);
    if (q.type === "numeric" && !Number.isFinite(Number(q.answer)))
      throw Error(`Invalid numeric answer ${data.id}:${q.id}`);
    if (
      q.type === "mcq" &&
      (!q.options?.includes(q.answer) ||
        new Set(q.options).size !== q.options.length)
    )
      throw Error(`Invalid options ${data.id}:${q.id}`);
  }
  const check = data.questions.filter((q) => !q.tier);
  if (
    check.length < 3 ||
    check.length > 5 ||
    check.filter((q) => q.conceptual).length < Math.ceil(check.length / 2)
  )
    throw Error(`Conceptual check balance ${data.id}`);
  for (const tier of ["warmup", "core"])
    if (!data.questions.some((q) => q.tier === tier))
      throw Error(`Missing ${tier} ${data.id}`);
  if (!Array.isArray(data.book_refs) || !data.book_refs.length)
    throw Error(`Missing sources ${data.id}`);
  if (data.status === "verified" || data.status === "published") {
    if (
      data.verification?.status !== "verified" ||
      !data.verification?.reviewedAt ||
      !data.verification?.reviewer ||
      data.book_refs.some((ref) => /pending/i.test(ref))
    )
      throw Error(`Unreviewed publication ${data.id}`);
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
    try {
      compileSync(source, {
        remarkPlugins: [remarkFrontmatter, remarkMath, remarkSafeContent],
      });
    } catch (error) {
      throw new Error(`Invalid MDX in ${file}: ${error.message}`, {
        cause: error,
      });
    }
    const header = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
    if (!header) throw Error(`Missing lesson frontmatter ${file}`);
    const data = parse(header[1]);
    if (path.basename(file, ".mdx") !== data.id || authored[data.id])
      throw Error(`Duplicate or mismatched file ID ${file}`);
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
    validateAuthored(data, sections, stub);
    authored[data.id] = {
      ...stub,
      ...data,
      available: true,
      widgets: [...content.matchAll(/<Widget name="([^"]+)"/g)].map(
        (m) => m[1],
      ),
      sections,
    };
    stub.available = true;
    stub.hook = data.hook || stub.hook;
  }
  curriculum.lessons = curriculum.lessons.map((l) =>
    authored[l.id]
      ? {
          ...l,
          title: authored[l.id].title,
          requires: authored[l.id].requires,
          status: authored[l.id].status,
        }
      : l,
  );
  validateGraph(curriculum);
  fs.mkdirSync("src/generated", { recursive: true });
  fs.mkdirSync("public/content", { recursive: true });
  fs.writeFileSync(
    "src/generated/course.json",
    // Lesson bodies are already lazy-loaded MDX. Keep complete text in public
    // lesson JSON for the tutor/offline contract, not twice in the entry bundle.
    JSON.stringify({
      ...curriculum,
      authored: Object.fromEntries(
        Object.entries(authored).map(([id, lesson]) => [
          id,
          {
            ...lesson,
            sections: lesson.sections.map(({ text, ...metadata }) => metadata),
          },
        ]),
      ),
    }),
  );
  for (const file of fs.readdirSync("public/content"))
    if (
      /^(?:[A-Z]{2}\d*|CB)\.\d+\.json$/.test(file) &&
      !authored[file.slice(0, -5)]
    )
      fs.unlinkSync(path.join("public/content", file));
  for (const [id, lesson] of Object.entries(authored))
    fs.writeFileSync(`public/content/${id}.json`, JSON.stringify(lesson));
  console.log(
    `Validated ${curriculum.lessons.length} curriculum entries; ${Object.keys(authored).length} authored drafts`,
  );
}
if (process.argv[1]?.endsWith("/content.mjs")) buildContent();
