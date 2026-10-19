# Independent review packets and model freshness

Create an unapproved packet for one lesson:

```sh
npm run review:packet -- AS2.1
```

Export all 354 current packets:

```sh
npm run --silent review:packet -- --all > /tmp/parallax-review-packets.json
```

Each packet lists the current lesson hash, section/question IDs, scoped partial-source mappings and model implementation hashes. Explicit widgets and the existing implicit vector/black-hole/mechanics selections are included. Transitive local imports capture shared model functions and SVG coordinate helpers. Dynamic curve widgets include their configuration file. Dependencies are conservative: changing a shared imported model file or selector can invalidate reviews of other users of that file.

The packets are a review handoff, not evidence that review occurred. A reviewer must inspect the actual lesson and model implementation, verify sources beyond the narrow existing scopes, check every exercise/grading convention, and record unresolved issues. Real learner testing is separate from expert review.

The publication gate now requires an independently approved evidence record's `modelArtifacts` to match computed current implementation hashes whenever models are used. It already requires matching lesson text, all sections and questions, named author/reviewer separation, exact-source metadata and no unresolved issues. Neither metadata validation nor packet export authenticates a person's identity or proves scientific correctness. No reviews were fabricated, no draft was promoted and `content/review/evidence.json` remains empty.

A current source mapping is weaker than this approval: it may corroborate only one introductory claim in a long lesson. The ledger explicitly states the remaining internally checked claims. All 354 lessons still require independent review before a publication claim.
