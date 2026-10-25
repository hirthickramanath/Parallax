// Shared helpers for the tutor evaluation set: case validation, SSE parsing and heuristic screening.
import fs from "node:fs";

const CASES_FILE = "content/evaluation/tutor-cases.json";
const CATEGORIES = ["known-answer", "false-premise", "injection", "honesty", "scope", "pedagogy"];
const LESSON_ID = /^[A-Z]{2}\d*\.\d+$/; // same rule as workers/tutor/src/core.ts

export function loadCases(file = CASES_FILE) {
  return JSON.parse(fs.readFileSync(file, "utf8")).cases;
}

const compile = (pattern) => new RegExp(pattern, "i");

/** Returns a list of problems with the case file (empty when valid). */
export function validateCases(cases, lessonExists = (id) => fs.existsSync(`content/lessons/${id}.mdx`)) {
  const problems = [];
  const ids = new Set();
  for (const c of cases) {
    const where = `case ${c.id ?? "(no id)"}`;
    if (!c.id || !/^[a-z0-9-]+$/.test(c.id)) problems.push(`${where}: id must be kebab-case`);
    if (ids.has(c.id)) problems.push(`${where}: duplicate id`);
    ids.add(c.id);
    if (!CATEGORIES.includes(c.category)) problems.push(`${where}: unknown category ${c.category}`);
    if (!LESSON_ID.test(c.lessonId ?? "")) problems.push(`${where}: lessonId is not accepted by the Worker`);
    else if (!lessonExists(c.lessonId)) problems.push(`${where}: lesson ${c.lessonId} does not exist`);
    if (c.depth !== "quick" && c.depth !== "full") problems.push(`${where}: depth must be quick or full`);
    if (typeof c.message !== "string" || !c.message.trim() || c.message.length > 2000) problems.push(`${where}: message must be 1-2000 characters`);
    if (!c.rationale) problems.push(`${where}: rationale is required`);
    if (!c.mustMatchAny && !c.mustNotMatch) problems.push(`${where}: needs mustMatchAny or mustNotMatch`);
    if (c.revisionStep !== undefined && !(Number.isInteger(c.revisionStep) && c.revisionStep >= 0 && c.revisionStep <= 3)) problems.push(`${where}: invalid revisionStep`);
    for (const key of ["mustMatchAny", "mustNotMatch"]) {
      for (const pattern of c[key] ?? []) {
        try {
          compile(pattern);
        } catch {
          problems.push(`${where}: ${key} pattern does not compile: ${pattern}`);
        }
      }
    }
  }
  return problems;
}

/** Concatenate the {"text": ...} events of the Worker's public SSE protocol. */
export function parseSse(body) {
  let text = "";
  for (const line of body.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const event = JSON.parse(line.slice(6));
      if (typeof event.text === "string") text += event.text;
    } catch {
      /* ignore malformed event */
    }
  }
  return text;
}

/** Heuristic screen: which required/forbidden patterns were (not) found. Not a quality grade. */
export function screen(c, reply) {
  const failures = [];
  if (!reply.trim()) failures.push("empty reply");
  if (c.mustMatchAny && !c.mustMatchAny.some((p) => compile(p).test(reply))) failures.push("none of the expected patterns matched");
  for (const p of c.mustNotMatch ?? []) if (compile(p).test(reply)) failures.push(`forbidden pattern matched: ${p}`);
  return failures;
}
