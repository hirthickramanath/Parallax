import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { generateKeyPair, exportJWK, SignJWT, createLocalJWKSet } from "jose";
import { assessmentUser } from "../workers/assessment/src/auth.ts";
import {
  assessmentItems,
  gradeItem,
  supported,
} from "../workers/assessment/src/bank.ts";
test("assessment JWT validation binds issuer, audience, expiry and nonempty subject", async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = await exportJWK(publicKey);
  jwk.kid = "test";
  const resolver = createLocalJWKSet({ keys: [jwk] });
  const token = async (
    audience = "parallax-73",
    expires = "1h",
    sub = "owner",
  ) =>
    new SignJWT({ auth_time: Math.floor(Date.now() / 1000) })
      .setProtectedHeader({ alg: "RS256", kid: "test" })
      .setIssuer("https://securetoken.google.com/parallax-73")
      .setAudience(audience)
      .setSubject(sub)
      .setIssuedAt()
      .setExpirationTime(expires)
      .sign(privateKey);
  assert.equal(
    await assessmentUser(await token(), "parallax-73", resolver),
    "owner",
  );
  await assert.rejects(
    assessmentUser(await token("other-project"), "parallax-73", resolver),
  );
  await assert.rejects(
    assessmentUser(await token("parallax-73", "-1h"), "parallax-73", resolver),
  );
  await assert.rejects(
    assessmentUser(
      await token("parallax-73", "1h", ""),
      "parallax-73",
      resolver,
    ),
  );
});
test("server assessment bank checks units, all supported lessons and finite numeric responses", () => {
  for (const lesson of supported)
    for (const r of [0, 0.3, 0.999])
      for (const item of assessmentItems(lesson, () => r)) {
        assert.ok(gradeItem(String(item.answer), item));
        assert.ok(!gradeItem("", item));
        assert.ok(!gradeItem("Infinity", item));
        assert.ok(
          !gradeItem(
            String(item.answer + Math.max(1000, Math.abs(item.answer) * 0.2)),
            item,
          ),
        );
      }
  assert.equal(assessmentItems("PB1.1", () => 0)[0].answer, 2);
  assert.equal(assessmentItems("MB2.3", () => 0)[1].answer, 4);
  assert.equal(assessmentItems("PB1.4", () => 0)[0].answer, 4);
  assert.throws(() => assessmentItems("unknown"));
});
test("assessment ledger owns scores, isolates users, prevents mutation/replay inflation and caps concurrent issuance", async () => {
  const bundle = await build({
    entryPoints: ["workers/assessment/src/index.ts"],
    bundle: true,
    format: "esm",
    write: false,
    platform: "browser",
  });
  const mf = new Miniflare(
    convertV4MiniflareOptions({
      workers: [
        {
          name: "assessment",
          modules: true,
          script: bundle.outputFiles[0].text,
          compatibilityDate: "2026-10-19",
          durableObjects: {
            ASSESSMENTS: { className: "AssessmentLedger", useSQLite: true },
          },
          bindings: {
            SITE_ORIGIN: "https://parallax-science.pages.dev",
            FIREBASE_PROJECT_ID: "parallax-73",
            ENABLE_ASSESSMENTS: "false",
          },
        },
      ],
    }),
  );
  try {
    assert.equal(
      (
        await mf.dispatchFetch("https://assessment.test/start", {
          method: "POST",
          headers: { Origin: "https://evil.test" },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await mf.dispatchFetch("https://assessment.test/start", {
          method: "POST",
          headers: { Origin: "https://parallax-science.pages.dev" },
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await mf.dispatchFetch("https://assessment.test/start", {
          method: "POST",
          headers: {
            Origin: "https://parallax-science.pages.dev",
            Authorization: "Bearer forged",
          },
        })
      ).status,
      401,
    );
    const ns = await mf.getDurableObjectNamespace("ASSESSMENTS", "assessment"),
      owner = ns.get(ns.idFromName("owner")),
      other = ns.get(ns.idFromName("other"));
    const call = (stub, path, body) =>
      stub.fetch(`https://ledger.test/${path}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    const started = await (
      await call(owner, "start", {
        lessonId: "PB1.1",
        requestId: "unique-request-0001",
      })
    ).json();
    assert.equal(started.questions.length, 5);
    assert.ok(
      started.questions.every((q) => !("answer" in q) && !("exact" in q)),
    );
    assert.equal(
      (
        await (
          await call(owner, "start", {
            lessonId: "PB1.1",
            requestId: "unique-request-0001",
          })
        ).json()
      ).attemptId,
      started.attemptId,
    );
    assert.equal(
      (
        await call(owner, "start", {
          lessonId: "AS1.3",
          requestId: "unique-request-0001",
        })
      ).status,
      409,
    );
    const answers = Object.fromEntries(
      started.questions.map((q) => [q.id, "-999"]),
    );
    assert.equal(
      (await call(other, "submit", { attemptId: started.attemptId, answers }))
        .status,
      404,
    );
    assert.equal(
      (
        await call(owner, "submit", {
          attemptId: started.attemptId,
          answers,
          score: 1,
          uid: "other",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call(owner, "submit", {
          attemptId: started.attemptId,
          answers: { q1: "4" },
        })
      ).status,
      400,
    );
    const graded = await (
      await call(owner, "submit", { attemptId: started.attemptId, answers })
    ).json();
    assert.equal(graded.score, 0);
    assert.equal(graded.passed, false);
    assert.deepEqual(
      await (
        await call(owner, "submit", { attemptId: started.attemptId, answers })
      ).json(),
      graded,
    );
    assert.equal(
      (
        await call(owner, "submit", {
          attemptId: started.attemptId,
          answers: { ...answers, q1: "0" },
        })
      ).status,
      409,
    );
    const history = await (
      await owner.fetch("https://ledger.test/history")
    ).json();
    assert.equal(history.length, 1);
    assert.equal(
      (await (await other.fetch("https://ledger.test/history")).json()).length,
      0,
    );
    const statuses = await Promise.all(
      Array.from({ length: 30 }, (_, i) =>
        call(owner, "start", {
          lessonId: "AS1.3",
          requestId: `concurrent-request-${String(i).padStart(4, "0")}`,
        }).then((r) => r.status),
      ),
    );
    assert.equal(statuses.filter((x) => x === 200).length, 19);
    assert.equal(statuses.filter((x) => x === 429).length, 11);
  } finally {
    await mf.dispose();
  }
});

test("five additional assessment banks agree with separately derived numeric instances", () => {
  const expected = {
    "PB2.1": [1000 * 2 * 2, 10 * 2, 2 * 2, 1000 * 2 * 2, 10 * 2],
    "PB2.2": [
      1.5 * 2 * 8.314 * 2,
      200 - 20,
      2000 / 200,
      1.5 * 2 * 8.314 * 2,
      200 - 20,
    ],
    "MB2.2": [2, 6, Math.sqrt(8), 2, 6],
    "MB4.3": [
      0.02 / 0.04,
      1000 * 0.02 * 0.8,
      (0.8 * 0.02) / (0.8 * 0.02 + 0.02 * 0.98),
      0.02 / 0.04,
      1000 * 0.02 * 0.8,
    ],
    "AS1.5": [
      1 / 8,
      (2 * 1e8 * 2) / 2000 ** 3,
      1 / 8,
      (2 * 1e8 * 2) / 2000 ** 3,
      1 / 8,
    ],
  };
  for (const [id, values] of Object.entries(expected)) {
    const items = assessmentItems(id, () => 0);
    items.forEach((item, i) =>
      assert.ok(Math.abs(item.answer - values[i]) < 1e-10, `${id}:${i}`),
    );
  }
});
