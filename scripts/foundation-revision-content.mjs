import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
export function validateFoundationRevision(data, curriculum) {
  if (data.version !== "foundation-rebuild-v1" || data.status !== "draft")
    throw Error("Revision version/status must stay explicit and draft");
  const expected = new Set(
    curriculum.lessons.filter((l) => l.phase === 0).map((l) => l.id),
  );
  const seen = new Set();
  for (const m of data.modules) {
    if (!expected.has(m.id) || seen.has(m.id))
      throw Error("Unknown or duplicate foundation revision " + m.id);
    seen.add(m.id);
    const text = (s) => typeof s === "string" && s.trim().length > 8;
    if (
      !text(m.intro) ||
      !text(m.pitfall) ||
      m.terms.length < 3 ||
      m.terms.some((t) => !t.term || !text(t.meaning)) ||
      m.derivation.length < 3 ||
      m.derivation.some((s) => !text(s))
    )
      throw Error("Incomplete revision explanation " + m.id);
    if (
      m.examples.length < 2 ||
      m.examples.some(
        (e) => !e.title || e.steps.length < 2 || e.steps.some((s) => !text(s)),
      )
    )
      throw Error("Two worked examples required " + m.id);
    if (
      m.checks.length !== 3 ||
      new Set(m.checks.map((q) => q.prompt.trim().toLowerCase())).size !== 3
    )
      throw Error("Distinct three-step practice required " + m.id);
    for (const [i, q] of m.checks.entries()) {
      if (
        q.id !== `rebuild-${i + 1}` ||
        !text(q.prompt) ||
        !text(q.explanation) ||
        !text(q.hint)
      )
        throw Error("Incomplete revision practice " + m.id);
      if (q.type === "numeric") {
        if (!Number.isFinite(Number(q.answer)))
          throw Error("Invalid numeric answer " + m.id);
      } else if (
        q.type !== "mcq" ||
        q.options?.length !== 2 ||
        new Set(q.options).size !== 2 ||
        !q.options.includes(q.answer)
      )
        throw Error("Invalid concept options " + m.id);
    }
  }
  if (seen.size !== expected.size)
    throw Error("Missing foundation revision chapters");
  return {
    chapters: seen.size,
    workedExamples: data.modules.reduce((n, m) => n + m.examples.length, 0),
    practiceQuestions: data.modules.reduce((n, m) => n + m.checks.length, 0),
    status: "draft",
  };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  console.log(
    JSON.stringify(
      validateFoundationRevision(
        JSON.parse(fs.readFileSync("content/revision/foundation.json", "utf8")),
        JSON.parse(fs.readFileSync("content/curriculum.json", "utf8")),
      ),
    ),
  );
