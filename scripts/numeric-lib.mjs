// Small dimensional-analysis helper and lesson loader for the numeric-answer verifier.
// Dependency-free apart from `yaml` (already a project dependency).
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { parse } from "yaml";

const LESSON_DIR = "content/lessons";

/** Dimension vector order: kg, m, s, K, A, mol. */
const D = (kg = 0, m = 0, s = 0, K = 0, A = 0, mol = 0) => [kg, m, s, K, A, mol];
const NONE = D();

/** Unit symbol -> [factor to SI, dimensions]. */
const UNITS = {
  m: [1, D(0, 1)],
  km: [1e3, D(0, 1)],
  cm: [1e-2, D(0, 1)],
  mm: [1e-3, D(0, 1)],
  nm: [1e-9, D(0, 1)],
  micrometres: [1e-6, D(0, 1)],
  micrometre: [1e-6, D(0, 1)],
  AU: [1.495978707e11, D(0, 1)],
  Mpc: [3.0856775814913673e22, D(0, 1)],
  "solar radii": [6.957e8, D(0, 1)],
  s: [1, D(0, 0, 1)],
  years: [3.15576e7, D(0, 0, 1)],
  hours: [3600, D(0, 0, 1)],
  days: [86400, D(0, 0, 1)],
  pc: [3.0856775814913673e16, D(0, 1)],
  parsecs: [3.0856775814913673e16, D(0, 1)],
  kg: [1, D(1)],
  K: [1, D(0, 0, 0, 1)],
  mol: [1, D(0, 0, 0, 0, 0, 1)],
  A: [1, D(0, 0, 0, 0, 1)],
  C: [1, D(0, 0, 1, 0, 1)],
  N: [1, D(1, 1, -2)],
  J: [1, D(1, 2, -2)],
  W: [1, D(1, 2, -3)],
  Pa: [1, D(1, -1, -2)],
  Hz: [1, D(0, 0, -1)],
  V: [1, D(1, 2, -3, 0, -1)],
  ohm: [1, D(1, 2, -3, 0, -2)],
  "Ω": [1, D(1, 2, -3, 0, -2)],
  S: [1, D(-1, -2, 3, 0, 2)],
  H: [1, D(1, 2, -2, 0, -2)],
  eV: [1.602176634e-19, D(1, 2, -2)],
  degrees: [Math.PI / 180, NONE],
  radians: [1, NONE],
  rad: [1, NONE],
};

/** Strings that mean "no concrete unit": the question text carries the unit. */
const PLACEHOLDER_UNITS = new Set([
  "as specified in the question",
  "as stated in question",
  "as stated",
  "as specified",
  "in the stated convention and units",
  "in the stated coordinate units",
  "same units as y",
  "natural energy-density units",
  "occupation squared",
]);
/** Strings that mean the answer is a pure number. */
const DIMENSIONLESS_UNITS = new Set(["dimensionless", "dimensionless ratio", "ratio", "fraction", "normalized", "probability"]);

const SUPERSCRIPT = { "²": 2, "³": 3 };

function parseToken(token) {
  const m = /^(.*?)(²|³|\^-?\d+)?$/.exec(token);
  const symbol = m[1];
  const exp = m[2] ? (SUPERSCRIPT[m[2]] ?? Number(m[2].slice(1))) : 1;
  const unit = UNITS[symbol];
  if (!unit) return null;
  return { factor: unit[0] ** exp, dims: unit[1].map((d) => d * exp) };
}

function parseProduct(text) {
  let factor = 1;
  let dims = NONE;
  // "solar radii" contains a space, so match known multi-word units first.
  let rest = text.replace(/\(|\)/g, " ").trim();
  for (const name of Object.keys(UNITS).filter((n) => n.includes(" "))) {
    if (rest.includes(name)) {
      const u = UNITS[name];
      factor *= u[0];
      dims = dims.map((d, i) => d + u[1][i]);
      rest = rest.replace(name, " ");
    }
  }
  for (const token of rest.split(/[\s·*]+/).filter(Boolean)) {
    if (token === "1") continue; // "1/days"
    const t = parseToken(token);
    if (!t) return null;
    factor *= t.factor;
    dims = dims.map((d, i) => d + t.dims[i]);
  }
  return { factor, dims };
}

/** Parse a unit expression such as "m/s²", "N m" or "J/(mol K)". Returns null if any part is unknown. */
export function parseUnit(text) {
  if (typeof text !== "string" || !text.trim()) return null;
  const [num, ...den] = text.trim().split("/");
  const n = parseProduct(num);
  if (!n) return null;
  if (den.length === 0) return n;
  const d = parseProduct(den.join(" "));
  if (!d) return null;
  return { factor: n.factor / d.factor, dims: n.dims.map((x, i) => x - d.dims[i]) };
}

export class Quantity {
  constructor(value, dims = NONE) {
    this.value = value; // SI value
    this.dims = dims;
  }
  mul(o) {
    const q = toQ(o);
    return new Quantity(this.value * q.value, this.dims.map((d, i) => d + q.dims[i]));
  }
  div(o) {
    const q = toQ(o);
    return new Quantity(this.value / q.value, this.dims.map((d, i) => d - q.dims[i]));
  }
  pow(n) {
    return new Quantity(this.value ** n, this.dims.map((d) => d * n));
  }
  sqrt() {
    return this.pow(0.5);
  }
  add(o) {
    const q = toQ(o);
    assertSameDims(this, q, "add");
    return new Quantity(this.value + q.value, this.dims);
  }
  sub(o) {
    const q = toQ(o);
    assertSameDims(this, q, "subtract");
    return new Quantity(this.value - q.value, this.dims);
  }
  neg() {
    return new Quantity(-this.value, this.dims);
  }
  /** Value expressed in `unit`; throws if the dimensions do not match. */
  to(unit) {
    const u = parseUnit(unit);
    if (!u) throw new Error(`unknown unit "${unit}"`);
    if (u.dims.some((d, i) => d !== this.dims[i])) {
      throw new Error(`dimension mismatch: result has [${this.dims}] but "${unit}" is [${u.dims}]`);
    }
    return this.value / u.factor;
  }
}

function toQ(o) {
  return o instanceof Quantity ? o : new Quantity(o, NONE);
}
function assertSameDims(a, b, op) {
  if (a.dims.some((d, i) => d !== b.dims[i])) throw new Error(`cannot ${op} quantities with different dimensions`);
}

/** q(6, "N") -> 6 newtons; q(2) -> pure number. */
export function q(value, unit = "") {
  if (!unit) return new Quantity(value, NONE);
  const u = parseUnit(unit);
  if (!u) throw new Error(`unknown unit "${unit}"`);
  return new Quantity(value * u.factor, u.dims);
}

/** Load every numeric question: {lesson, id, key, prompt, answer, unit, fingerprint}. */
export function loadNumericQuestions(dir = LESSON_DIR) {
  const out = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).sort()) {
    const text = fs.readFileSync(path.join(dir, file), "utf8");
    const match = /^---\n([\s\S]*?)\n---/.exec(text);
    if (!match) continue;
    const data = parse(match[1]);
    for (const question of data.questions ?? []) {
      if (question.type !== "numeric") continue;
      out.push({
        lesson: data.id,
        id: question.id,
        key: `${data.id}:${question.id}`,
        prompt: String(question.prompt ?? ""),
        answerRaw: question.answer,
        answer: typeof question.answer === "number" ? question.answer : /^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(String(question.answer).trim()) ? Number(question.answer) : NaN,
        unit: question.unit ?? null,
        fingerprint: fingerprint(question.prompt, question.answer),
      });
    }
  }
  return out;
}

/** Short hash of the prompt and stored answer, so an edit to either invalidates a recorded check. */
export function fingerprint(prompt, answer) {
  return createHash("sha1").update(`${prompt}\u0000${answer}`).digest("hex").slice(0, 8);
}

export function classifyUnit(unit) {
  if (unit === null || unit === undefined || unit === "") return "missing";
  if (PLACEHOLDER_UNITS.has(unit)) return "placeholder";
  if (DIMENSIONLESS_UNITS.has(unit)) return "dimensionless";
  return parseUnit(unit) ? "physical" : "unrecognised";
}
