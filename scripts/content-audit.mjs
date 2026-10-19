import fs from "node:fs";
import { parse } from "yaml";
const rows = fs
  .readdirSync("content/lessons")
  .filter((f) => f.endsWith(".mdx"))
  .sort()
  .map((file) => {
    const text = fs.readFileSync(`content/lessons/${file}`, "utf8");
    const data = parse(/^---\n([\s\S]*?)\n---/.exec(text)[1]);
    const prompts = new Set(
      data.questions.map((q) => q.prompt.trim().toLowerCase()),
    );
    return {
      id: data.id,
      title: data.title,
      status: data.status,
      verification: data.verification?.status || "pending",
      questionCount: data.questions.length,
      uniquePrompts: prompts.size,
      duplicatePrompts: data.questions.length - prompts.size,
      numericQuestions: data.questions.filter((q) => q.type === "numeric")
        .length,
      hintedQuestions: data.questions.filter((q) => q.hint).length,
      explicitWidgets: [...text.matchAll(/<Widget name="([^"]+)"/g)].map(
        (m) => m[1],
      ),
      sourceCandidates: data.book_refs || [],
      sourceInspection: "pending",
      independentReview: "pending",
    };
  });
const summary = {
  lessons: rows.length,
  verified: rows.filter((r) => r.verification === "verified").length,
  withoutExplicitWidget: rows.filter((r) => !r.explicitWidgets.length).length,
  withDuplicatePrompts: rows.filter((r) => r.duplicatePrompts).length,
};
fs.writeFileSync(
  "content/review/course-review-queue.json",
  JSON.stringify(
    {
      scope:
        "Static editorial triage; widget inference is not counted. Candidate references are not inspected sources. No independent review is established by this report.",
      summary,
      lessons: rows,
    },
    null,
    2,
  ) + "\n",
);
fs.writeFileSync(
  "docs/COURSE-REVIEW-QUEUE.md",
  `# Course review queue\n\nGenerated with \`node scripts/content-audit.mjs\`. This is editorial triage, not verification. Sources need exact edition/section inspection and independent reviewers. Implicit vector/black-hole widgets are excluded from explicit-widget counts.\n\n${rows.length} lessons; ${summary.verified} marked verified; ${summary.withoutExplicitWidget} without explicit widgets; ${summary.withDuplicatePrompts} contain repeated prompts. Repeated warm-up/check prompts are flagged for replacement with distinct transfer items. Counts do not measure scientific correctness.\n\n| Lesson | Questions / unique | Numeric | Hints | Explicit widgets |\n| --- | --- | --- | --- | --- |\n` +
    rows
      .map(
        (r) =>
          `| ${r.id} ${r.title.replaceAll("|", "/")} | ${r.questionCount} / ${r.uniquePrompts} | ${r.numericQuestions} | ${r.hintedQuestions} | ${r.explicitWidgets.join(", ") || "pending"} |`,
      )
      .join("\n") +
    "\n",
);
console.log(JSON.stringify(summary));
