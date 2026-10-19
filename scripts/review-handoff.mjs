import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { reviewPacket } from "./review-packet.mjs";
import { sourceFingerprint } from "./review-evidence.mjs";
/** Export only explicit public source paths; never copy environments or participant records. */
export function exportReviewHandoff(root, destination, ids) {
  const out = path.resolve(destination);
  if (fs.existsSync(out))
    throw Error(
      "Use a new destination directory; existing files are never overwritten",
    );
  const selected =
    ids ||
    fs
      .readdirSync(path.join(root, "content/lessons"))
      .filter((f) => f.endsWith(".mdx"))
      .sort()
      .map((f) => f.slice(0, -4));
  const packets = selected.map((id) => reviewPacket(root, id));
  const files = new Map();
  const add = (name) => {
    if (
      !/^(content\/lessons\/[A-Z]+\d*\.\d+\.mdx|src\/[\w./-]+\.(ts|tsx)|package(-lock)?\.json)$/.test(
        name,
      ) ||
      name.split("/").includes("..")
    )
      throw Error("Unsafe handoff source path");
    const source = fs.readFileSync(path.join(root, name));
    files.set("source/" + name, source);
  };
  for (const packet of packets) {
    add(`content/lessons/${packet.lessonId}.mdx`);
    for (const name of Object.keys(packet.modelArtifacts)) {
      add(name);
      if (
        sourceFingerprint(fs.readFileSync(path.join(root, name))) !==
        packet.modelArtifacts[name]
      )
        throw Error("Model changed during export");
    }
    files.set(
      `packets/${packet.lessonId}.json`,
      JSON.stringify(packet, null, 2) + "\n",
    );
    files.set(
      `review-notes/${packet.lessonId}.json`,
      JSON.stringify(
        {
          lessonId: packet.lessonId,
          sha256: packet.sha256,
          decision: "awaiting independent review",
          independent: false,
          reviewer: "",
          authorIds: ["Codex"],
          reviewedAt: "",
          sectionIds: [],
          questionIds: [],
          sources: [],
          modelArtifacts: packet.modelArtifacts,
          unresolvedIssues: [],
          note: "Unfilled worksheet. Add genuine findings and checked coverage; never treat this export as approval.",
        },
        null,
        2,
      ) + "\n",
    );
  }
  add("package.json");
  add("package-lock.json");
  files.set(
    "README.md",
    `# Independent scientific review handoff\n\n${packets.length} current draft lessons. No independent approval is recorded by this export.\n\nRead source/content/lessons with the associated packet and model sources. Verify every proof, assumption, unit, exercise, grading rule, model convention and limiting case. Partial source records corroborate only their explicitly stated scope. Obtain and inspect the pinned external references; this bundle does not redistribute textbooks.\n\nReview worksheets start unapproved with empty coverage and reviewer fields. Make a working copy and return it separately; preserve the original source bundle and manifest. Record real findings and unresolved issues. Do not merely switch the decision field. A qualified reviewer must identify themselves, disclose author independence, list every section/question actually checked and provide inspected source editions/locators. The repository publication gate must validate current artifacts after an actual approval is imported. Metadata cannot authenticate a person or establish truth.\n\nThis is a scientific handoff, not a learner study. Keep participant data and credentials outside this bundle and repository. Package files identify dependencies; inspect source before running any code.\n`,
  );
  const manifest = {
    format: "parallax-review-handoff-v1",
    independentReviewCompleted: false,
    lessonIds: packets.map((p) => p.lessonId),
    files: Object.fromEntries(
      [...files].map(([name, data]) => [name, sourceFingerprint(data)]),
    ),
  };
  fs.mkdirSync(out, { recursive: true });
  for (const [name, data] of files) {
    const dest = path.join(out, name);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, data, { flag: "wx" });
  }
  fs.writeFileSync(
    path.join(out, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    { flag: "wx" },
  );
  return {
    directory: out,
    lessons: packets.length,
    files: files.size,
    independentApprovals: 0,
  };
}
export function verifyReviewHandoff(directory) {
  const m = JSON.parse(
    fs.readFileSync(path.join(directory, "manifest.json"), "utf8"),
  );
  if (m.format !== "parallax-review-handoff-v1")
    throw Error("Unknown handoff format");
  for (const [name, hash] of Object.entries(m.files)) {
    const f = path.resolve(directory, name);
    if (!f.startsWith(path.resolve(directory) + path.sep))
      throw Error("Unsafe manifest path");
    if (sourceFingerprint(fs.readFileSync(f)) !== hash)
      throw Error("Changed handoff artifact: " + name);
  }
  return {
    lessons: m.lessonIds.length,
    files: Object.keys(m.files).length,
    integrity: "matched",
    independentApprovalEstablished: false,
  };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [dest, ...ids] = process.argv.slice(2);
  if (!dest)
    throw Error(
      "Usage: node scripts/review-handoff.mjs NEW_DIRECTORY [LESSON_ID ...]",
    );
  console.log(
    JSON.stringify(
      exportReviewHandoff(process.cwd(), dest, ids.length ? ids : undefined),
      null,
      2,
    ),
  );
  console.log(JSON.stringify(verifyReviewHandoff(dest), null, 2));
}
