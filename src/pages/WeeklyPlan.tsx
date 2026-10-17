import { Link } from "react-router-dom";
import { course, missingNeeds } from "../lib/course";
import { useLearning } from "../hooks/useLearning";
import { Button } from "../components/ui/button";
export function WeeklyPlan() {
  const store = useLearning();
  const candidates = course.lessons
    .filter(
      (l) =>
        l.available &&
        store.records.lessons[l.id]?.status !== "done" &&
        missingNeeds(l, store.records).length === 0,
    )
    .sort((a, b) => a.phase - b.phase);
  const saved = store.records.plan.current;
  const items = Array.isArray(saved?.items) ? (saved.items as string[]) : [];
  function generate() {
    store.put("plan", "current", {
      week: new Date().toISOString().slice(0, 10),
      items: candidates.slice(0, 7).map((l) => l.id),
      generatedAt: Date.now(),
    });
  }
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">LEARN WITH DIRECTION</p>
      <h1>A week of good questions.</h1>
      <p className="page-description">
        Only playable lessons with met prerequisites enter the plan. The weekly
        subject mix will expand as more lessons are authored.
      </p>
      <Button onClick={generate}>Build this week’s plan</Button>
      <div className="plan-list">
        {items.length ? (
          items.map((id) => (
            <article key={id}>
              <span className="pill">{course.authored[id]?.track}</span>
              <h2>{course.authored[id]?.title || id}</h2>
              <Link to={`/lesson/${id}`}>
                {store.records.lessons[id]?.status === "done"
                  ? "Revisit"
                  : "Start"}{" "}
                →
              </Link>
            </article>
          ))
        ) : (
          <section className="empty-card">
            <h2>Start small. Stay consistent.</h2>
            <p>
              Generate a plan from the currently available lessons. Locked draft
              previews remain accessible from the course map with soft-lock
              warnings.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
