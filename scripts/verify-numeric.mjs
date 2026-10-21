// Independent verification of numeric lesson answers and units.
//
//   node scripts/verify-numeric.mjs                 report; exit 1 on any failure
//   node scripts/verify-numeric.mjs --write         also regenerate docs/NUMERIC-VERIFICATION.md
//   node scripts/verify-numeric.mjs --refresh-all   record fingerprints for checks that currently pass
//
// Two layers:
//   1. Lints over EVERY numeric question (finite answer, recognised unit string, prompt/unit agreement).
//   2. A registry of independent recomputations (scripts/numeric-checks.mjs) for questions whose
//      givens and formula are explicit in the prompt. Coverage is reported honestly: most numeric
//      questions are NOT independently recomputed yet.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { CHECKS } from "./numeric-checks.mjs";
import { Quantity, classifyUnit, fingerprint, loadNumericQuestions, parseUnit } from "./numeric-lib.mjs";

const CHECKS_FILE = "scripts/numeric-checks.mjs";
const DOC_FILE = "docs/NUMERIC-VERIFICATION.md";

/** Prompt ends with "... in <unit>" (optionally "?" or "."): the unit the learner is asked to give. */
function promptUnit(prompt) {
  const m = /\bin ([A-Za-zµ°²³/ ]{1,20}?)\s*[?.]?\s*$/.exec(prompt.trim());
  return m ? m[1].trim() : null;
}

export function lintQuestions(questions) {
  const failures = [];
  const info = { promptUnitNotStored: 0 };
  for (const item of questions) {
    if (typeof item.answer !== "number" || !Number.isFinite(item.answer)) {
      failures.push(`${item.key}: answer is not a plain decimal number (${JSON.stringify(item.answerRaw)})`);
    }
    const kind = classifyUnit(item.unit);
    if (kind === "unrecognised") {
      failures.push(`${item.key}: unit "${item.unit}" is not recognised; add it to numeric-lib.mjs or the placeholder lists`);
    }
    const asked = promptUnit(item.prompt);
    const askedUnit = asked ? parseUnit(asked) : null;
    if (askedUnit) {
      if (kind === "physical") {
        const stored = parseUnit(item.unit);
        const same = stored.dims.every((d, i) => d === askedUnit.dims[i]) && Math.abs(stored.factor / askedUnit.factor - 1) < 1e-9;
        if (!same) failures.push(`${item.key}: prompt asks for "${asked}" but the stored unit is "${item.unit}"`);
      } else if (kind === "missing" || kind === "placeholder") {
        info.promptUnitNotStored += 1;
      }
    }
  }
  return { failures, info };
}

export function runChecks(questions, checks = CHECKS) {
  const byKey = new Map(questions.map((item) => [item.key, item]));
  const seen = new Set();
  const results = [];
  for (const [key, fp, run, options = {}] of checks) {
    const item = byKey.get(key);
    const result = { key, status: "ok", detail: "" };
    results.push(result);
    if (seen.has(key)) {
      Object.assign(result, { status: "duplicate", detail: "listed twice in the registry" });
      continue;
    }
    seen.add(key);
    if (!item) {
      Object.assign(result, { status: "missing", detail: "no such numeric question (renamed or removed?)" });
      continue;
    }
    result.unit = item.unit;
    let computed;
    try {
      const value = run();
      const kind = classifyUnit(item.unit);
      if (value instanceof Quantity) {
        if (kind === "physical") computed = value.to(item.unit);
        else if (value.dims.every((d) => d === 0)) computed = value.value;
        else throw new Error(`result is dimensional but the stored unit is "${item.unit ?? "none"}"`);
      } else computed = value;
    } catch (error) {
      Object.assign(result, { status: "unit-error", detail: String(error.message ?? error) });
      continue;
    }
    result.computed = computed;
    result.stored = item.answer;
    const rel = options.rel ?? 1e-9;
    const scale = Math.max(Math.abs(item.answer), Math.abs(computed), 1e-300);
    if (!(Math.abs(computed - item.answer) <= rel * scale)) {
      Object.assign(result, { status: "mismatch", detail: `recomputed ${computed} but the stored answer is ${item.answer}` });
      continue;
    }
    if (!fp) {
      Object.assign(result, { status: "unrecorded", detail: `no fingerprint recorded (expected ${item.fingerprint})` });
    } else if (fp !== item.fingerprint) {
      Object.assign(result, { status: "stale", detail: `question changed since the check was written (${fp} -> ${item.fingerprint}); re-read it, then refresh` });
    }
  }
  return results;
}

export function coverage(questions, results) {
  const count = { total: questions.length, physical: 0, dimensionless: 0, placeholder: 0, missing: 0, unrecognised: 0 };
  for (const item of questions) count[classifyUnit(item.unit)] += 1;
  const verified = results.filter((r) => r.status === "ok");
  const byLesson = new Map();
  for (const item of questions) byLesson.set(item.lesson, (byLesson.get(item.lesson) ?? 0) + 1);
  const verifiedKeys = new Set(verified.map((r) => r.key));
  const lessonsWithCheck = new Set(questions.filter((item) => verifiedKeys.has(item.key)).map((item) => item.lesson));
  return {
    ...count,
    verified: verified.length,
    lessonsWithNumeric: byLesson.size,
    lessonsWithCheck: lessonsWithCheck.size,
    physicalVerified: questions.filter((item) => classifyUnit(item.unit) === "physical" && verifiedKeys.has(item.key)).length,
  };
}

function refreshFingerprints(questions, results) {
  let source = fs.readFileSync(CHECKS_FILE, "utf8");
  let changed = 0;
  const byKey = new Map(questions.map((item) => [item.key, item]));
  for (const result of results) {
    if (!["ok", "unrecorded", "stale"].includes(result.status)) continue;
    const item = byKey.get(result.key);
    const re = new RegExp(`(\\["${result.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}", ")[0-9a-f]*(")`);
    const fp = fingerprint(item.prompt, item.answer);
    const next = source.replace(re, (_m, a, b) => a + fp + b);
    if (next !== source) changed += 1;
    source = next;
  }
  fs.writeFileSync(CHECKS_FILE, source);
  return changed;
}

function renderDoc(cov, results, lint) {
  const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) : "0.0");
  const rows = results.map((r) => `| \`${r.key}\` | ${r.unit ?? "none"} | ${r.status} |`).join("\n");
  return `# Numeric answer verification

Generated by \`node scripts/verify-numeric.mjs --write\`. Do not edit by hand.

This is **automated arithmetic, not scientific review**. It shows that a stored numeric answer follows from the givens and formula written in its own prompt, and that the answer's unit has the right dimensions. It does not show that the physical model is appropriate, that the prompt is well posed, or that a lesson is correct. No lesson is independently verified by this check.

## Coverage (snapshot of the last run)

| Measure | Count |
| --- | ---: |
| Numeric questions | ${cov.total} |
| Independently recomputed and passing | ${cov.verified} (${pct(cov.verified, cov.total)}%) |
| Lessons with at least one numeric question | ${cov.lessonsWithNumeric} |
| Lessons with at least one recomputed question | ${cov.lessonsWithCheck} |
| Questions with a concrete physical unit | ${cov.physical} (${cov.physicalVerified} recomputed) |
| Questions marked dimensionless | ${cov.dimensionless} |
| Questions whose unit field is a placeholder ("as stated in the question" and similar) | ${cov.placeholder} |
| Questions with no unit field | ${cov.missing} |
| Prompts that ask for a unit but have no concrete stored unit | ${lint.info.promptUnitNotStored} |

The majority of numeric questions carry no machine-readable unit, so their units cannot be checked automatically. Adding concrete \`unit\` values to those questions is a content task; each one then becomes checkable.

## What is checked

1. **Every numeric question (lints):** the answer is a finite number; the unit string is a concrete unit, a known placeholder or a dimensionless label; if a prompt ends "in <unit>" and the stored unit is concrete, the two agree.
2. **Registry (\`scripts/numeric-checks.mjs\`):** each entry recomputes the answer from the prompt's givens with unit-carrying arithmetic (\`scripts/numeric-lib.mjs\`). The result's dimensions must match the stored unit and its value must equal the stored answer (relative tolerance 1e-9 unless the entry says otherwise).
3. **Staleness:** each entry stores a fingerprint of the prompt and stored answer. If either changes, the entry fails as *stale* until a person re-reads the question and refreshes it. A check therefore never keeps its tick after the question is edited.

## Adding a check

1. Read the question. Re-derive the answer from its stated givens without looking at the stored answer.
2. Add \`["LESSON:question-id", "", () => <Quantity or number>]\` to \`scripts/numeric-checks.mjs\`.
3. Run \`node scripts/verify-numeric.mjs\`. If it passes, \`node scripts/verify-numeric.mjs --refresh-all\` records the fingerprint, then \`--write\` refreshes this page.

## Recomputed questions

| Question | Stored unit | Status |
| --- | --- | --- |
${rows}
`;
}

export function runAll() {
  const questions = loadNumericQuestions();
  const lint = lintQuestions(questions);
  const results = runChecks(questions);
  return { questions, lint, results, cov: coverage(questions, results) };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = new Set(process.argv.slice(2));
  let { questions, lint, results, cov } = runAll();
  if (args.has("--refresh-all")) {
    console.log(`refreshed ${refreshFingerprints(questions, results)} fingerprint(s)`);
    ({ questions, lint, results, cov } = runAll());
  }
  const bad = results.filter((r) => r.status !== "ok");
  console.log(`numeric questions: ${cov.total}; recomputed and passing: ${cov.verified}; lessons covered: ${cov.lessonsWithCheck}/${cov.lessonsWithNumeric}`);
  console.log(`units: ${cov.physical} concrete, ${cov.dimensionless} dimensionless, ${cov.placeholder} placeholder, ${cov.missing} none`);
  for (const message of lint.failures) console.log(`LINT  ${message}`);
  for (const r of bad) console.log(`CHECK ${r.key} [${r.status}] ${r.detail}`);
  if (args.has("--write")) {
    fs.writeFileSync(DOC_FILE, renderDoc(cov, results, lint));
    console.log(`wrote ${DOC_FILE}`);
  }
  process.exitCode = lint.failures.length || bad.length ? 1 : 0;
}
