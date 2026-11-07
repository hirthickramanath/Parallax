import fs from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
const ledger = JSON.parse(
  fs.readFileSync("content/review/question-quality.json", "utf8"),
);
function load(id) {
  const text = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8");
  return JSON.parse(text.split("\n---\n", 1)[0].replace(/^---\n/, ""));
}
const conceptual = ledger.rewritten.flatMap((id) =>
  load(id)
    .questions.filter((q) => q.conceptual && q.options)
    .map((q) => ({ id, q })),
);
test("rewritten lessons list real lessons with conceptual questions", () => {
  assert.ok(ledger.rewritten.length >= 20);
  assert.ok(conceptual.length >= 100);
});
test("every rewritten conceptual question has 3-4 distinct options, a hint and a real explanation", () => {
  for (const { id, q } of conceptual) {
    const where = `${id}:${q.id}`;
    assert.ok(q.options.length >= 3 && q.options.length <= 4, where);
    assert.equal(new Set(q.options).size, q.options.length, where);
    assert.ok(q.options.includes(q.answer), where);
    assert.ok(q.hint && q.hint.length > 20, `${where} needs a hint`);
    assert.ok(
      q.explanation.length >= 30 &&
        q.explanation !== q.answer &&
        !q.answer.includes(q.explanation),
      `${where} explanation should say why`,
    );
    assert.ok(
      !q.options.some((o) => o === "Yes" || o === "No"),
      `${where} should not be a bare Yes/No`,
    );
  }
});
test("answer format does not leak the key", () => {
  const n = conceptual.length;
  const longest = conceptual.filter(({ q }) => {
    const len = q.answer.length;
    return (
      q.options.every((o) => o === q.answer || o.length < len)
    );
  }).length;
  assert.ok(longest / n <= 0.5, `longest option is correct ${longest}/${n}`);
  const position = [0, 1, 2, 3].map(
    (k) => conceptual.filter(({ q }) => q.options.indexOf(q.answer) === k).length,
  );
  for (const count of position)
    assert.ok(count / n <= 0.4, `answer position skew ${position}`);
});
