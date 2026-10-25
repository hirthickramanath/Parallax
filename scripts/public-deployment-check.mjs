import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { sourceFingerprint } from "./review-evidence.mjs";
export function expectedPublicBuild(
  root,
  ids = ["CB1.3", "MA10.1", "PH16.4", "PH18.4"],
) {
  const html = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
  const assets = [
    ...html.matchAll(/(?:src|href)="(\/assets\/[^"<>]+\.(?:js|css))"/g),
  ]
    .map((m) => m[1])
    .sort();
  if (!assets.length)
    throw Error("No built assets found; run npm run build first");
  return {
    assets,
    assetHashes: Object.fromEntries(
      assets.map((name) => [
        name,
        sourceFingerprint(fs.readFileSync(path.join(root, "dist", name))),
      ]),
    ),
    lessons: Object.fromEntries(
      ids.map((id) => {
        if (!/^[A-Z]+\d*\.\d+$/.test(id)) throw Error("Invalid lesson ID");
        return [
          id,
          sourceFingerprint(
            fs.readFileSync(path.join(root, "dist/content", id + ".json")),
          ),
        ];
      }),
    ),
  };
}
export async function checkPublicBuild(origin, expected, request) {
  const url = new URL(origin);
  if (
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw Error("Use an origin URL without path or credentials");
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(url.hostname)
    )
  )
    throw Error("HTTPS required outside loopback");
  const checks = [];
  const get = async (route) => {
    const r = await request(new URL(route, url).href);
    if (r.status !== 200) throw Error(`HTTP ${r.status} for ${route}`);
    return r.body;
  };
  try {
    const html = String(await get("/"));
    const actual = [
      ...html.matchAll(/(?:src|href)="(\/assets\/[^"<>]+\.(?:js|css))"/g),
    ]
      .map((m) => m[1])
      .sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected.assets))
      throw Error("Production entry assets differ from the local build");
    checks.push("entry-assets-match");
    for (const name of expected.assets) {
      const body = await get(name);
      if (sourceFingerprint(body) !== expected.assetHashes[name])
        throw Error("Production asset bytes differ: " + name);
      checks.push("asset-match:" + name);
    }
    for (const [id, hash] of Object.entries(expected.lessons)) {
      const body = await get(`/content/${id}.json`);
      let lesson;
      try {
        lesson = JSON.parse(String(body));
      } catch {
        throw Error(
          `Expected lesson JSON for ${id}; an HTML fallback does not verify deployment`,
        );
      }
      if (lesson.id !== id || sourceFingerprint(body) !== hash)
        throw Error(`Production lesson differs from built ${id}`);
      checks.push("lesson-match:" + id);
    }
    return {
      status: "passed",
      origin: url.origin,
      checks,
      authenticatedServices: "not tested",
      note: "Public build/content match only; not Firebase, Worker activation, learner outcomes or scientific approval.",
    };
  } catch (error) {
    return {
      status: "failed",
      origin: url.origin,
      checks,
      error: error.message,
      authenticatedServices: "not tested",
    };
  }
}
export function curlPublicRequest(url) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "parallax-public-check-")),
    file = path.join(dir, "body");
  try {
    // Inherited proxy and CA remain active; no credentials are supplied and redirects are not followed.
    const status = Number(
      execFileSync(
        "curl",
        [
          "--silent",
          "--show-error",
          "--max-time",
          "20",
          "--max-redirs",
          "0",
          "--output",
          file,
          "--write-out",
          "%{http_code}",
          url,
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      ),
    );
    return { status, body: fs.readFileSync(file) };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const origin = process.argv[2] || "https://parallax-science.pages.dev",
    expected = expectedPublicBuild(process.cwd());
  if (process.argv.includes("--plan"))
    console.log(
      JSON.stringify(
        {
          status: "not run",
          origin,
          expected,
          requiredAccess: new URL(origin).hostname,
          note: "A saved network draft does not apply runtime access.",
        },
        null,
        2,
      ),
    );
  else {
    const result = await checkPublicBuild(origin, expected, curlPublicRequest);
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== "passed") process.exitCode = 1;
  }
}
