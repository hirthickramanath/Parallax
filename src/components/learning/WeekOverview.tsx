import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useClock, useLearning } from "../../hooks/useLearning";
import { course, missingNeeds } from "../../lib/course";
import { dateKey } from "../../lib/learning-core";
import { weekStart } from "../../lib/journey";
import { balancedPlan, defaultMix } from "../../lib/planning";
export function WeekOverview() {
  const store = useLearning(),
    now = useClock(),
    week = weekStart(dateKey(now, store.preferences.timezone));
  const saved = store.records.plan.current;
  useEffect(() => {
    if (saved?.week === week) return;
    const candidates = course.lessons.filter(
      (l) =>
        l.available &&
        !["done", "skipped"].includes(store.records.lessons[l.id]?.status) &&
        missingNeeds(l, store.records).length === 0,
    );
    const items: Record<string, string[]> = {};
    for (const lesson of balancedPlan(candidates, {
      ...defaultMix,
      ...store.preferences.trackMix,
    }))
      (items[lesson.track] ||= []).push(lesson.id);
    store.put("plan", "current", { week, items, generatedAt: Date.now() });
  }, [week, saved?.week]);
  const ids =
    saved?.week === week
      ? (Object.values(saved.items || {}).flat() as string[])
      : [];
  return (
    <section className="weekly-overview">
      <p className="eyebrow">YOUR WEEK · STARTING {week}</p>
      <h2>A week of good questions.</h2>
      <p>
        Your plan appears automatically each Monday when you open Parallax. It
        follows your prerequisites and keeps the full course in view.
      </p>
      <div className="plan-list">
        {ids.map((id) => {
          const l = course.lessons.find((l) => l.id === id);
          if (!l) return null;
          return (
            <article key={id}>
              <span className="pill">
                {store.records.lessons[id]?.status === "done"
                  ? "✓ Completed"
                  : l.track}
              </span>
              <Link to={`/lesson/${id}`}>{l.title} →</Link>
            </article>
          );
        })}
      </div>
      {!ids.length && (
        <p>
          No new unlocked lessons right now. Revisit an idea on your path or
          check your prerequisite progress.
        </p>
      )}
    </section>
  );
}
