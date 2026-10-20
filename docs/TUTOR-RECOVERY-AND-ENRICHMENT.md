# Tutor recovery and content enrichment

The reported message “Tutor resting. Please try later.” corresponds to HTTP 503, so it establishes that a Worker response reached the app; it does not prove which upstream failure occurred. Earlier responses did not distinguish inactive configuration, quota storage failure, provider failure or a provider startup timeout. No live model reply is claimed from local mocks.

The application daily question limit has been removed from the request path. A test exercises 55 consecutive authenticated requests. The legacy Durable Object class remains only for deployed migration compatibility and returns HTTP 410 if called; it no longer participates in tutoring. Cloudflare/provider usage, capacity and platform limits still apply. No paid plan upgrade is performed.

The frontend keeps deployment endpoints if its runtime config request fails, and offers an explicit retry plus online/focus recovery. The live runtime config remains authoritative when retrieved successfully. The Worker bounds stored conversation/reference context, keeps the latest user question, caps the size of each generated reply and permits 35 seconds for provider startup. The client timeout covers startup plus streaming. Safe error categories distinguish capacity, context, model, permission and timeout conditions instead of promising recovery tomorrow. Only a safe category/provider name is logged on a provider failure; invocation logging is disabled, and prompts, tokens and private chat text are not logged by this code.

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
