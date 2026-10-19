import fs from "node:fs";
const path = process.argv[2];
if (!path)
  throw Error(
    "Usage: node scripts/learning-report.mjs /path/to/parallax-progress.json",
  );
const data = JSON.parse(fs.readFileSync(path, "utf8"));
if (!data.records?.attempts) throw Error("Expected a Parallax progress export");
const attempts = Object.values(data.records.attempts)
  .filter((a) => ["check", "warmup", "core", "adaptive"].includes(a.tier))
  .sort((a, b) => a.createdAt - b.createdAt);
const first = new Map();
for (const a of attempts) {
  const key = `${a.questionId}:${a.resetAt || 0}`;
  if (!first.has(key)) first.set(key, a);
}
const summary = {
  scope:
    "Descriptive report from one exported account, not a learning-effectiveness study",
  firstAttempts: first.size,
  firstCorrect: [...first.values()].filter((a) => a.isCorrect).length,
  retries: attempts.length - first.size,
  byTier: {},
  feedback: {},
};
for (const a of first.values()) {
  const group = (summary.byTier[a.tier] ||= { attempts: 0, correct: 0 });
  group.attempts++;
  if (a.isCorrect) group.correct++;
}
for (const item of Object.values(data.records.plan || {}))
  if (item.label)
    summary.feedback[item.label] = (summary.feedback[item.label] || 0) + 1;
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
