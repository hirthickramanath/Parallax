import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { widgetArtifacts } from "./widget-artifacts.mjs";
import {
  sourceFingerprint,
  currentSourceInspection,
} from "./review-evidence.mjs";
export function reviewPacket(root, id) {
  if (!/^[A-Z]+\d*\.\d+$/.test(id)) throw Error("Use a curriculum lesson ID");
  const source = fs.readFileSync(
    path.join(root, "content/lessons", id + ".mdx"),
    "utf8",
  );
  const data = parse(/^---\n([\s\S]*?)\n---/.exec(source)[1]);
  const ledger = JSON.parse(
    fs.readFileSync(
      path.join(root, "content/review/source-inspections.json"),
      "utf8",
    ),
  );
  const revisionFile = "content/revision/foundation.json";
  const revisionPath = path.join(root, revisionFile);
  const revisionData = fs.existsSync(revisionPath)
    ? JSON.parse(fs.readFileSync(revisionPath, "utf8"))
    : null;
  const guide = revisionData?.modules.find((module) => module.id === id);
  const revisionArtifacts = guide
    ? Object.fromEntries(
        [
          revisionFile,
          "src/pages/FoundationRevision.tsx",
          "src/lib/foundation-revision.ts",
          "src/lib/foundation-path.ts",
          "src/lib/learning-core.ts",
        ].map((name) => [
          name,
          sourceFingerprint(fs.readFileSync(path.join(root, name))),
        ]),
      )
    : null;
  return {
    ...(guide
      ? {
          foundationRevision: {
            version: revisionData.version,
            status: "draft",
            module: guide,
            moduleSha256: sourceFingerprint(JSON.stringify(guide)),
            artifacts: revisionArtifacts,
            independentReviewCompleted: false,
            note: "Separate unapproved revision material. MDX approval does not approve this guide, its examples or its grading. Review these artifacts explicitly.",
          },
        }
      : {}),
    lessonId: id,
    title: data.title,
    sha256: sourceFingerprint(source),
    modelArtifacts: widgetArtifacts(root, source, data),
    sectionIds: [...source.matchAll(/<LessonSection id="([^"]+)"/g)].map(
      (m) => m[1],
    ),
    questionIds: data.questions.map((q) => q.id),
    partialSourceInspections: currentSourceInspection(id, source, ledger),
    decision: "awaiting independent review",
    independentReviewCompleted: false,
    requiredChecks: [
      "Hypotheses, domain, units and all derivations/proofs",
      "Worked answers, alternative solutions, distractors and grading",
      "Model code, coordinate/normalization conventions and limiting cases",
      "Source claims beyond the recorded partial scopes",
      "Pedagogical difficulty and accessibility",
    ],
    note: "This packet identifies current artifacts only. It neither records reviewer approval nor authenticates a reviewer. Do not copy an awaiting record into the approval ledger.",
  };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const id = process.argv[2];
  if (!id)
    throw Error("Usage: node scripts/review-packet.mjs LESSON_ID | --all");
  const result =
    id === "--all"
      ? {
          notice:
            "Current-artifact packets only; no independent approval is recorded.",
          packets: fs
            .readdirSync("content/lessons")
            .filter((f) => f.endsWith(".mdx"))
            .sort()
            .map((f) => reviewPacket(process.cwd(), f.slice(0, -4))),
        }
      : reviewPacket(process.cwd(), id);
  console.log(JSON.stringify(result, null, 2));
}
