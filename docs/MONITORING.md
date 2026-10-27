# Monitoring and alerting

What watches the live services, what it can and cannot see, and what to do when something fails. Nothing here has run against the live services yet: the probe and workflow were written and tested against a stand-in, and the sandbox that wrote them could not reach the deployed Workers.

## 1. Scheduled health probe

`.github/workflows/service-health.yml` runs `node scripts/verify-services.mjs` every six hours (and on demand from the Actions tab). It needs no secrets and spends no learner quota: every request is refused by the Worker before the model, a Durable Object or a limiter is reached.

| Probe | Expected | A failure suggests |
| --- | --- | --- |
| `/content/PB1.1.json` on the site | 200 | The Pages deployment is down or lesson JSON was not built (the tutor reads this file). |
| Tutor: preflight from the site origin | 204 and `Access-Control-Allow-Origin` equal to the site | The tutor Worker is down, or its `SITE_ORIGIN` no longer matches the site. |
| Tutor: preflight from another origin | 403 | The origin check was loosened. |
| Tutor: unauthenticated POST | 401 | The Worker is erroring (5xx) or authentication was bypassed (2xx). |
| Reminders: the same preflight pair | 204 / 403 | As above, for the reminders Worker. |
| Reminders: unauthenticated GET `/subscription` | 401 | As above. |
| Reminders: POST `/test` | 404 | The removed test-notification route came back. |

Run it yourself with `npm run verify:services`. GitHub emails repository watchers when a scheduled workflow fails; check Settings, Notifications if nobody is receiving them. GitHub may disable scheduled workflows in a repository with no recent activity.

**Not covered:** a signed-in learner receiving a tutor reply, a reminder being delivered, Firebase sign-in, and Firestore rules. Those need a real session. For the tutor, `npm run eval:tutor` does this with a token ([TUTOR-EVALUATION.md](TUTOR-EVALUATION.md)). Reminders and sign-in remain manual checks ([PENDING-REVIEW-AND-LIVE-CHECKS.md](PENDING-REVIEW-AND-LIVE-CHECKS.md)).

## 2. Worker logs

All three Workers have Workers Logs enabled in their `wrangler.jsonc` (`observability`, invocation logs off). View them in the Cloudflare dashboard: Workers & Pages, the Worker, Logs. A Worker change takes effect only after `wrangler deploy` for that Worker.

Events are single-line JSON. None includes an account id, a token, a message, an endpoint or a key.

| Event | Worker | Level | Meaning |
| --- | --- | --- | --- |
| `tutor_reply_completed` | tutor | log | A reply streamed to the end (`characters`). |
| `tutor_provider_failure` | tutor | error | The model call failed (`stage`, `code`, `diagnostic`). A burst means the model or its binding is unhealthy. |
| `tutor_rate_limited` | tutor | log | A learner hit the limit (`retryAfterSeconds`). Occasional entries are normal; many in a short time may mean a client loop or abuse. |
| `tutor_limiter_unavailable` | tutor | error | The limiter Durable Object could not be reached. Requests fail closed (503), so the tutor is down for everyone until it recovers. |
| `reminders_dispatch` | reminders | log | A cron tick tried deliveries (`attempted`, `sent`, `failed`, `lastError`). Written only when something was attempted. |

Suggested alert rules, if you set up Cloudflare notifications or a log search: any `tutor_limiter_unavailable`; `tutor_provider_failure` more than a handful in ten minutes; `reminders_dispatch` with `failed` equal to `attempted` for several consecutive ticks.

## 3. Runbook

- **Probe fails on the site check:** open the site. If it loads, check that the latest Pages build generated `public/content`. A failed Pages build leaves the previous version live.
- **Probe fails on a Worker:** open the Worker in the Cloudflare dashboard, check Logs and the latest deployment. Redeploy the last good commit with `wrangler deploy --config workers/<name>/wrangler.jsonc`.
- **Tutor returns 503 `rate_limit_unavailable`:** the `COUNTERS` Durable Object binding or its `v1` migration is broken. Do not rename the `DailyCounter` class or the `COUNTERS` binding.
- **Tutor returns 503 `configuration_missing`:** `ENABLE_TUTOR` is not `"true"` or the model binding is missing in the deployed Worker.
- **Learners report 429 early:** the limit is 10 requests a minute per learner, with no daily cap (`workers/tutor/src/limiter.ts`). Change the constants there and redeploy; the tests encode the current numbers.

## 4. Limits of this monitoring

- Checks run from GitHub's network every six hours, so an outage can last that long before anyone is told.
- It reports availability and access rules, not answer quality.
- There is no client-side error reporting, no uptime history and no paging; it relies on GitHub and Cloudflare notifications reaching a person.
