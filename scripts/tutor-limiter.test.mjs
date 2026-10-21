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

test("limits are ten per minute and two hundred per day", () => {
  assert.deepEqual({ ...LIMITS }, { perMinute: 10, perDay: 200 });
});

test("requests under both limits are allowed and recorded", () => {
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

test("the daily limit applies across minutes and reports when the oldest hit expires", () => {
  // Exactly 200 hits spread one per minute, none inside the last minute.
  const day = Array.from({ length: 200 }, (_, i) => T0 + i * 60_000);
  const at = T0 + 200 * 60_000 + 30_000;
  const refused = decide(day, at);
  assert.equal(refused.allowed, false);
  assert.equal(
    refused.retryAfterSeconds,
    Math.ceil((T0 + 86_400_000 - at) / 1000),
  );
  assert.equal(refused.history.length, 200);
  // One fewer hit in the day leaves room.
  assert.equal(decide(day.slice(1), at).allowed, true);
});

test("old hits are pruned and malformed stored data is ignored", () => {
  const old = [T0 - 2 * 86_400_000, T0 - 86_400_000 - 1];
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
