// Run the tutor evaluation cases against a deployed tutor Worker.
//
//   node scripts/tutor-eval.mjs --dry-run            validate the case file only (no network, no token)
//   PARALLAX_ID_TOKEN=... node scripts/tutor-eval.mjs [--only id,id] [--out file] [--url URL]
//
// The token is a Firebase ID token of a signed-in learner (see docs/TUTOR-EVALUATION.md). It is read
// from the environment, sent only to the tutor URL and never printed or written. Requests are spaced
// to stay under the Worker's per-learner limit (10 a minute, 200 a day). Replies are written OUTSIDE
// the repository by default; read them: the screen below is a smoke test, not a quality grade.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadCases, parseSse, screen, validateCases } from "./tutor-eval-lib.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cases = loadCases();
const problems = validateCases(cases);
if (problems.length) {
  for (const p of problems) console.error(p);
  process.exit(1);
}
if (flag("--dry-run")) {
  const byCategory = {};
  for (const c of cases) byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
  console.log(`${cases.length} valid cases`, byCategory);
  process.exit(0);
}

const token = process.env.PARALLAX_ID_TOKEN;
if (!token) {
  console.error("Set PARALLAX_ID_TOKEN to a signed-in learner's Firebase ID token (see docs/TUTOR-EVALUATION.md).");
  process.exit(2);
}
const services = JSON.parse(fs.readFileSync("public/services.json", "utf8"));
const url = value("--url") ?? services.tutorUrl;
const origin = process.env.PARALLAX_ORIGIN ?? /"SITE_ORIGIN":\s*"([^"]+)"/.exec(fs.readFileSync("workers/tutor/wrangler.jsonc", "utf8"))[1];
const only = value("--only")?.split(",");
const delayMs = Number(value("--delay-ms") ?? 7000); // 7 s => at most 8-9 requests a minute
const selected = only ? cases.filter((c) => only.includes(c.id)) : cases;
const out = value("--out") ?? path.join(os.tmpdir(), `parallax-tutor-eval-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);

async function ask(c, attempt = 0) {
  const body = { lessonId: c.lessonId, depth: c.depth, message: c.message, history: c.history ?? [] };
  if (c.sectionId) body.sectionId = c.sectionId;
  if (c.revisionStep !== undefined) body.revisionStep = c.revisionStep;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(70000),
  });
  if (response.status === 429 && attempt === 0) {
    const detail = await response.json().catch(() => ({}));
    const wait = Math.min(Number(detail.retryAfterSeconds) || 60, 120);
    console.log(`  rate limited; waiting ${wait}s`);
    await sleep((wait + 1) * 1000);
    return ask(c, 1);
  }
  const text = await response.text();
  if (!response.ok) return { status: response.status, reply: "", error: text.slice(0, 300) };
  return { status: response.status, reply: parseSse(text) };
}

const results = [];
for (const [i, c] of selected.entries()) {
  if (i > 0) await sleep(delayMs);
  let result;
  try {
    result = await ask(c);
  } catch (error) {
    result = { status: 0, reply: "", error: String(error.message ?? error) };
  }
  const failures = result.error ? [`request failed (${result.status}): ${result.error}`] : screen(c, result.reply);
  results.push({ id: c.id, category: c.category, lessonId: c.lessonId, message: c.message, ...result, screen: failures.length ? "FLAG" : "pass", failures });
  console.log(`${failures.length ? "FLAG" : "pass"}  ${c.id}${failures.length ? `  -- ${failures.join("; ")}` : ""}`);
}
fs.writeFileSync(out, JSON.stringify({ ranAt: new Date().toISOString(), url, results }, null, 1));
const flagged = results.filter((r) => r.screen === "FLAG").length;
console.log(`\n${results.length - flagged}/${results.length} passed the heuristic screen. Replies written to ${out}. Read them before drawing conclusions.`);
process.exitCode = flagged ? 1 : 0;
