import { test } from "node:test";
import assert from "node:assert/strict";
import {
  decide,
  waitText,
  LIMITS,
} from "../workers/tutor/src/limiter.ts";

const T0 = Date.parse("2026-10-22T00:00:00Z");
const hits = (count, start = T0, step = 1000) =>
  Array.from({ length: count }, (_, i) => start + i * step);

test("the only limit is ten requests per minute; there is no daily cap", () => {
  assert.deepEqual({ ...LIMITS }, { perMinute: 10 });
});

test("requests under the limit are allowed and recorded", () => {
  const first = decide([], T0);
  assert.equal(first.allowed, true);
  assert.equal(first.retryAfterSeconds, 0);
  assert.deepEqual(first.history, [T0]);
  const ninth = decide(hits(9), T0 + 9000);
  assert.equal(ninth.allowed, true);
  assert.equal(ninth.history.length, 10);
});

test("the eleventh request inside a minute is refused with an accurate wait and is not recorded", () => {
  const history = hits(10); // T0 .. T0+9s
  const verdict = decide(history, T0 + 10000);
  assert.equal(verdict.allowed, false);
  // The oldest hit (T0) leaves the window at T0 + 60s, i.e. 50s from now.
  assert.equal(verdict.retryAfterSeconds, 50);
  assert.deepEqual(verdict.history, history);
});

test("the minute window slides: the first hit expiring frees exactly one slot", () => {
  const history = hits(10);
  assert.equal(decide(history, T0 + 59000).allowed, false);
  assert.equal(decide(history, T0 + 60001).allowed, true);
  // After T0 expires, nine hits remain in the window and the tenth is allowed, the next is not.
  const after = decide(history, T0 + 60001);
  assert.equal(after.history.filter((t) => t > T0 + 1).length, 10);
  assert.equal(decide(after.history, T0 + 60002).allowed, false);
});

test("a long day of steady use is never refused, and stored history stays bounded", () => {
  // One request every 7 seconds for 24 hours: 12,342 requests, none refused.
  let history = [];
  let refused = 0;
  for (let i = 0; i < 12_342; i++) {
    const verdict = decide(history, T0 + i * 7000);
    if (!verdict.allowed) refused++;
    history = verdict.history;
  }
  assert.equal(refused, 0);
  assert.ok(history.length <= 10);
});

test("old hits are pruned and malformed stored data is ignored", () => {
  const old = [T0 - 2 * 86_400_000, T0 - 60_000 - 1];
  const verdict = decide(old, T0);
  assert.equal(verdict.allowed, true);
  assert.deepEqual(verdict.history, [T0]);
  assert.deepEqual(decide(undefined, T0).history, [T0]);
  assert.deepEqual(decide("nonsense", T0).history, [T0]);
  assert.deepEqual(decide([NaN, "x", null, T0 + 5000, T0 - 10], T0).history, [
    T0 - 10,
    T0,
  ]);
});

test("waitText gives readable durations", () => {
  assert.equal(waitText(1), "1 second");
  assert.equal(waitText(45), "45 seconds");
  assert.equal(waitText(60), "about 1 minute");
  assert.equal(waitText(61), "about 2 minutes");
  assert.equal(waitText(3600), "about 1 hour");
  assert.equal(waitText(7300), "about 3 hours");
});
