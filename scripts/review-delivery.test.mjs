import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { exportReviewHandoff, verifyReviewHandoff } from "./review-handoff.mjs";
import { checkPublicBuild } from "./public-deployment-check.mjs";
import { sourceFingerprint as hash } from "./review-evidence.mjs";
test("review handoff includes actual model sources, remains unapproved and detects tampering", () => {
  const parent = fs.mkdtempSync(
      path.join(os.tmpdir(), "parallax-handoff-test-"),
    ),
    out = path.join(parent, "bundle");
  try {
    const result = exportReviewHandoff(process.cwd(), out, ["PH8.2", "MA10.1"]);
    assert.equal(result.lessons, 2);
    const m = JSON.parse(
      fs.readFileSync(path.join(out, "manifest.json"), "utf8"),
    );
    assert.ok(m.files["source/src/lib/quantum-investigations.ts"]);
    assert.ok(
      !Object.keys(m.files).some(
        (p) => p.includes(".env") || p.includes("pilot-record"),
      ),
    );
    const note = JSON.parse(
      fs.readFileSync(path.join(out, "review-notes/PH8.2.json"), "utf8"),
    );
    assert.equal(note.independent, false);
    assert.equal(note.reviewer, "");
    assert.deepEqual(note.questionIds, []);
    assert.equal(
      verifyReviewHandoff(out).independentApprovalEstablished,
      false,
    );
    assert.throws(
      () => exportReviewHandoff(process.cwd(), out, ["PH8.2"]),
      /existing files/,
    );
    fs.appendFileSync(
      path.join(out, "source/src/lib/quantum-investigations.ts"),
      "\nchanged",
    );
    assert.throws(() => verifyReviewHandoff(out), /Changed handoff artifact/);
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
});
const fixture = () => {
  const js = Buffer.from("current built JS"),
    lesson = Buffer.from(
      JSON.stringify({ id: "PH8.2", questions: ["current"] }),
    );
  const expected = {
    assets: ["/assets/index-test.js"],
    assetHashes: { "/assets/index-test.js": hash(js) },
    lessons: { "PH8.2": hash(lesson) },
  };
  const responses = {
    "/": { status: 200, body: '<script src="/assets/index-test.js"></script>' },
    "/assets/index-test.js": { status: 200, body: js },
    "/content/PH8.2.json": { status: 200, body: lesson },
  };
  return {
    expected,
    responses,
    request: async (url) =>
      responses[new URL(url).pathname] || { status: 404, body: "" },
  };
};
test("public build check verifies entry, actual assets and current lesson bytes without claiming authenticated services", async () => {
  const x = fixture(),
    r = await checkPublicBuild(
      "https://parallax-science.pages.dev",
      x.expected,
      x.request,
    );
  assert.equal(r.status, "passed");
  assert.equal(r.authenticatedServices, "not tested");
  assert.ok(r.checks.includes("lesson-match:PH8.2"));
});
test("a stale lesson with the correct ID cannot pass deployment verification", async () => {
  const x = fixture();
  x.responses["/content/PH8.2.json"].body = JSON.stringify({
    id: "PH8.2",
    questions: ["old"],
  });
  assert.match(
    (
      await checkPublicBuild(
        "https://parallax-science.pages.dev",
        x.expected,
        x.request,
      )
    ).error,
    /differs from built/,
  );
});
test("HTTP-200 SPA fallback and corrupt asset bytes are rejected", async () => {
  const x = fixture();
  x.responses["/content/PH8.2.json"].body = "<html>SPA fallback</html>";
  assert.match(
    (
      await checkPublicBuild(
        "https://parallax-science.pages.dev",
        x.expected,
        x.request,
      )
    ).error,
    /Expected lesson JSON/,
  );
  const y = fixture();
  y.responses["/assets/index-test.js"].body = "wrong bytes";
  assert.match(
    (
      await checkPublicBuild(
        "https://parallax-science.pages.dev",
        y.expected,
        y.request,
      )
    ).error,
    /asset bytes differ/,
  );
});
test("missing deployed assets and unsafe origin URLs do not pass", async () => {
  const x = fixture();
  x.responses["/assets/index-test.js"].status = 404;
  assert.equal(
    (
      await checkPublicBuild(
        "https://parallax-science.pages.dev",
        x.expected,
        x.request,
      )
    ).status,
    "failed",
  );
  await assert.rejects(
    checkPublicBuild("http://example.com", x.expected, x.request),
    /HTTPS required/,
  );
  await assert.rejects(
    checkPublicBuild(
      "https://name:password@example.com",
      x.expected,
      x.request,
    ),
    /without path or credentials/,
  );
});
test("foundation handoff includes separately unapproved revision content and grading sources", () => {
  const parent = fs.mkdtempSync(
    path.join(os.tmpdir(), "parallax-revision-handoff-"),
  );
  try {
    const out = path.join(parent, "bundle");
    exportReviewHandoff(process.cwd(), out, ["PB2.1"]);
    const packet = JSON.parse(
      fs.readFileSync(path.join(out, "packets/PB2.1.json"), "utf8"),
    );
    assert.equal(packet.foundationRevision.status, "draft");
    assert.equal(packet.foundationRevision.independentReviewCompleted, false);
    assert.equal(packet.foundationRevision.module.examples.length, 3);
    assert.equal(packet.foundationRevision.module.checks.length, 4);
    assert.ok(packet.foundationRevision.artifacts["src/lib/learning-core.ts"]);
    assert.equal(verifyReviewHandoff(out).integrity, "matched");
    fs.appendFileSync(
      path.join(out, "source/content/revision/foundation.json"),
      " ",
    );
    assert.throws(() => verifyReviewHandoff(out), /Changed handoff artifact/);
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
});
