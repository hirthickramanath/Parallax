# Tutor recovery and content enrichment

The earlier message “Tutor resting. Please try later.” can be emitted inside an SSE stream after HTTP 200. The later generic unavailable message was traced through production logs to the Worker’s provider failure handler. Neither message alone identifies an upstream cause. Earlier responses did not distinguish inactive configuration, quota storage failure, provider failure or a provider startup timeout. No live model reply is claimed from local mocks.

The application daily question limit has been removed from the request path. A test exercises 55 consecutive authenticated requests. The legacy Durable Object class remains only for deployed migration compatibility and returns HTTP 410 if called; it no longer participates in tutoring. Cloudflare/provider usage, capacity and platform limits still apply. No paid plan upgrade is performed.

The frontend keeps deployment endpoints if its runtime config request fails, and offers an explicit retry plus online/focus recovery. The live runtime config remains authoritative when retrieved successfully. The Worker bounds stored conversation/reference context, keeps the latest user question, caps the size of each generated reply and permits 35 seconds for provider startup. The client timeout covers startup plus streaming. Safe error categories distinguish capacity, context, model, permission and timeout conditions instead of promising recovery tomorrow. Only fixed diagnostic labels, numeric service codes and the provider name are logged on a provider failure; invocation logging is disabled, and prompts, tokens and private chat text are not logged by this code.

These changes address concrete failure paths but are not proof of an authenticated live model response. If the next real request fails, its new error category identifies the account/provider work needed.

See CURRENT-REVIEW-STATUS.md for the current source review and enrichment counts. That generated report supersedes old release snapshots; historical documents describe the state at their release date.

## Live diagnostics follow-up (2026-10-20)

Workers Observability access is now verified. The two recorded production failures
came from the current tutor Worker and were categorized `provider_unavailable`;
the earlier log format did not retain enough information to identify their cause.
The Worker now records a fixed failure stage, an allowlisted error class, fixed
reason labels and numeric upstream error codes. It never records raw exception
messages, learner questions, chat history or credentials. Plain-object service
errors now receive the same safe public classification as native Error objects.
This is diagnostic instrumentation, not evidence that inference has recovered.
A new authenticated tutor request is needed to capture the actionable failure.
Validation: Worker typecheck, 12 provider/stream tests and Worker integration tests
passed. The application daily question cap remains removed.

## Identified provider cause and model replacement

The new production diagnostic recorded `AiError`, stage `inference`, reason
`model_retired`. Cloudflare's official May 8, 2026 deprecation notice lists the
previous `@cf/meta/llama-3.1-8b-instruct` model as retired on May 30, 2026.

The Worker now uses `@cf/meta/llama-3.1-8b-instruct-fp8`. Its current official
catalog entry marks `deprecated: false` and supports messages, streaming and
max_tokens. Both sources were inspected at cloudflare/cloudflare-docs commit
`d05c4cefbf74547031fcefd0c051ca848381b8ef`:

- https://github.com/cloudflare/cloudflare-docs/blob/d05c4cefbf74547031fcefd0c051ca848381b8ef/src/content/changelog/workers-ai/2026-05-08-planned-model-deprecations.mdx
- https://github.com/cloudflare/cloudflare-docs/blob/d05c4cefbf74547031fcefd0c051ca848381b8ef/src/content/workers-ai-models/llama-3.1-8b-instruct-fp8.json

Deprecation errors now receive the model-specific public category. A successful
nonempty stream records only `tutor_reply_completed`, provider and character
count; it does not log answer text, prompts or account identity. Local tests
verify this completion event is absent for failed streams. A genuine live reply
still requires a signed-in learner request; catalog availability and mock tests
do not establish that the complete production path has succeeded.

Twenty lessons also gained a worked investigation, an explicit assumption/limit
discussion, a numerical transfer with a hint and units, and independently
recomputed answer checks. Source inspections identify their exact partial scope,
including formulas not established by the introductory source. All remain drafts.
See CURRENT-REVIEW-STATUS.md and LEARNER-PILOT.md for current evidence limits.
