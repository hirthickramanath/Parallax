import { FOUNDATION_ORDER, foundationRevised } from "../../lib/foundation-path";
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
  const revision = !!store.preferences.foundationRevision;
  const mode = revision ? "revision" : "course";
  useEffect(() => {
    if (saved?.week === week && (saved.mode || "course") === mode) return;
    if (revision) {
      const ids = FOUNDATION_ORDER.filter(
        (id) => !foundationRevised(store.records, id),
      ).slice(0, 7);
      store.put("plan", "current", {
        week,
        mode,
        items: { revision: ids },
        generatedAt: Date.now(),
      });
      return;
    }
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
    store.put("plan", "current", {
      week,
      mode,
      items,
      generatedAt: Date.now(),
    });
  }, [week, saved?.week, mode]);
  const ids =
    saved?.week === week && (saved.mode || "course") === mode
      ? (Object.values(saved.items || {}).flat() as string[])
      : [];
  return (
    <details
      className="weekly-overview"
      open={store.records.plan[`viewed-week-${week}`]?.viewed !== true}
      onToggle={(e) => {
        if (
          !e.currentTarget.open &&
          store.records.plan[`viewed-week-${week}`]?.viewed !== true
        )
          store.put("plan", `viewed-week-${week}`, {
            viewed: true,
            updatedAt: Date.now(),
          });
      }}
    >
      <summary>This week’s learning plan</summary>
      <p className="eyebrow">YOUR WEEK · STARTING {week}</p>
      <h2>
        {revision
          ? "A week to rebuild your foundations."
          : "A week of good questions."}
      </h2>
      <p>
        {revision
          ? "Revision comes first this week. These are the next foundation chapters; take as much time as you need before advanced work."
          : "Your plan appears automatically each Monday when you open Parallax. It follows your prerequisites and keeps the full course in view."}
      </p>
      <div className="plan-list">
        {ids.map((id) => {
          const l = course.lessons.find((l) => l.id === id);
          if (!l) return null;
          return (
            <article key={id}>
              <span className="pill">
                {revision
                  ? foundationRevised(store.records, id)
                    ? "Revision practice complete"
                    : "Rebuild"
                  : store.records.lessons[id]?.status === "done"
                    ? "Reading complete"
                    : l.track}
              </span>
              <Link
                to={revision ? `/foundation-revision/${id}` : `/lesson/${id}`}
              >
                {l.title} →
              </Link>
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
    </details>
  );
}
