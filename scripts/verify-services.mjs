// Unauthenticated health and policy probe for the deployed site and Workers.
//
//   node scripts/verify-services.mjs [--site URL] [--tutor URL] [--push URL]
//
// Every request is rejected by the Worker before it reaches the model, a Durable Object or any quota,
// so running this costs no learner quota and needs no token. It checks that the services are up and
// that their access rules still hold. It does NOT prove a signed-in learner can get a tutor reply or
// a reminder: that needs a real session (see docs/TUTOR-EVALUATION.md and docs/MONITORING.md).
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const EVIL = "https://evil.example";

/** Build the list of probes. Each has a name, a request and the status (and optional header) expected. */
export function probes({ site, tutor, push }) {
  const list = [];
  const preflight = (base, label) => {
    list.push({ name: `${label}: preflight from the site is allowed`, url: base, init: { method: "OPTIONS", headers: { Origin: site } }, status: 204, header: ["access-control-allow-origin", site] });
    list.push({ name: `${label}: other origins are refused`, url: base, init: { method: "OPTIONS", headers: { Origin: EVIL } }, status: 403 });
  };
  list.push({ name: "site: lesson JSON the tutor reads is served", url: `${site}/content/PB1.1.json`, init: {}, status: 200 });
  if (tutor) {
    preflight(tutor, "tutor");
    list.push({ name: "tutor: unauthenticated request is rejected", url: tutor, init: { method: "POST", headers: { Origin: site, "Content-Type": "application/json" }, body: "{}" }, status: 401 });
  }
  if (push) {
    preflight(push, "reminders");
    list.push({ name: "reminders: unauthenticated request is rejected", url: `${push}/subscription`, init: { method: "GET", headers: { Origin: site } }, status: 401 });
    list.push({ name: "reminders: the removed /test route stays removed", url: `${push}/test`, init: { method: "POST", headers: { Origin: site } }, status: 404 });
  }
  return list;
}

export async function runProbes(list, fetchImpl = fetch) {
  const results = [];
  for (const p of list) {
    try {
      const response = await fetchImpl(p.url, { ...p.init, redirect: "manual", signal: AbortSignal.timeout(15000) });
      let ok = response.status === p.status;
      let detail = `status ${response.status}`;
      if (ok && p.header) {
        const got = response.headers.get(p.header[0]);
        if (got !== p.header[1]) {
          ok = false;
          detail = `header ${p.header[0]} was ${got}`;
        }
      }
      if (!ok && response.status !== p.status) detail = `expected ${p.status}, got ${response.status}`;
      results.push({ name: p.name, ok, detail });
    } catch (error) {
      results.push({ name: p.name, ok: false, detail: `request failed: ${error.name}` });
    }
  }
  return results;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const value = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const services = JSON.parse(fs.readFileSync("public/services.json", "utf8"));
  const wrangler = fs.readFileSync("workers/tutor/wrangler.jsonc", "utf8");
  const site = value("--site") ?? /"SITE_ORIGIN":\s*"([^"]+)"/.exec(wrangler)[1];
  const results = await runProbes(probes({ site, tutor: value("--tutor") ?? services.tutorUrl, push: value("--push") ?? services.pushUrl }));
  for (const r of results) console.log(`${r.ok ? "ok  " : "FAIL"}  ${r.name} (${r.detail})`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(failed ? `\n${failed} of ${results.length} probes failed.` : `\nAll ${results.length} probes passed.`);
  process.exitCode = failed ? 1 : 0;
}
