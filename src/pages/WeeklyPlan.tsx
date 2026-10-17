import { Link } from "react-router-dom";
import { course, missingNeeds } from "../lib/course";
import { useLearning } from "../hooks/useLearning";
import { dateKey } from "../lib/learning-core";
import { balancedPlan, defaultMix } from "../lib/planning";
import { Button } from "../components/ui/button";
export function WeeklyPlan() {
  const store = useLearning(),
    mix = { ...defaultMix, ...store.preferences.trackMix };
  const candidates = course.lessons.filter(
    (l) =>
      l.available &&
      !["done", "skipped"].includes(store.records.lessons[l.id]?.status) &&
      missingNeeds(l, store.records).length === 0,
  );
  const saved = store.records.plan.current;
  const raw = saved?.items;
  const items: string[] = Array.isArray(raw)
    ? (raw as string[])
    : raw && typeof raw === "object"
      ? Object.values(raw).flatMap((v) =>
          Array.isArray(v) ? (v as string[]) : [],
        )
      : [];
  function generate() {
    const selected = balancedPlan(candidates, mix);
    const byTrack: Record<string, string[]> = {};
    for (const l of selected) (byTrack[l.track] ||= []).push(l.id);
    const today = dateKey(Date.now(), store.preferences.timezone);
    const day = new Date(today + "T12:00:00Z");
    day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
    store.put("plan", "current", {
      week: day.toISOString().slice(0, 10),
      items: byTrack,
      generatedAt: Date.now(),
    });
  }
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">LEARN WITH DIRECTION</p>
      <h1>A week of good questions.</h1>
      <p className="page-description">
        The earliest eligible phase comes first. Aim for three physics, two
        maths, one astronomy and one supporting-science lesson. If astronomy
        isn’t unlocked, physics takes its slot; unavailable content never enters
        the plan.
      </p>
      <section className="settings-card">
        <h2>Your study balance</h2>
        <p>
          The course stays fixed. These numbers change the weekly emphasis, not
          the subjects in your curriculum.
        </p>
        <div className="mix-inputs">
          {(["physics", "maths", "astro", "other"] as const).map((track) => (
            <label key={track}>
              {track === "other" ? "Supporting sciences" : track}
              <input
                type="number"
                min="1"
                max="7"
                value={mix[track]}
                onChange={(e) =>
                  store.setPreferences({
                    trackMix: {
                      ...mix,
                      [track]: Math.max(
                        1,
                        Math.min(7, Number(e.target.value) || 1),
                      ),
                    },
                  })
                }
              />
            </label>
          ))}
        </div>
        <Button onClick={generate}>Build this week’s plan</Button>
        <p className="source-note">
          Up to {Object.values(mix).reduce((n, v) => n + v, 0)} lessons, without
          duplicates. A short plan means there are fewer authored, unlocked
          lessons—not that prerequisites have been waived.
        </p>
      </section>
      <div className="plan-list">
        {items.length ? (
          items.map((id) => {
            const l = course.lessons.find((l) => l.id === id);
            const missing = l
              ? missingNeeds(l, store.records)
              : ["missing content"];
            return (
              <article key={id}>
                <span className="pill">
                  {l?.track} · PHASE {l?.phase}
                </span>
                <h2>{l?.title || id}</h2>
                {missing.length > 0 ? (
                  <p>
                    Plan changed: review {missing.join(", ")} first. Regenerate
                    to refresh eligibility.
                  </p>
                ) : (
                  <Link to={`/lesson/${id}`}>
                    {store.records.lessons[id]?.status === "done"
                      ? "Revisit"
                      : "Start"}{" "}
                    →
                  </Link>
                )}
              </article>
            );
          })
        ) : (
          <section className="empty-card">
            <h2>Start small. Stay consistent.</h2>
            <p>
              Generate your plan from authored lessons with met prerequisites.
            </p>
          </section>
        )}
      </div>
      <Link className="text-button" to="/revision-plan">
        Preparing for a test? Build a revision schedule →
      </Link>
    </main>
  );
}
