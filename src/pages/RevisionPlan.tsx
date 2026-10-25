import { useState } from "react";
import { conceptLabel } from "../lib/labels";
import { Link } from "react-router-dom";
import { fsrs } from "ts-fsrs";
import { course } from "../lib/course";
import { restoreCard } from "../lib/fsrs";
import { dateKey } from "../lib/learning-core";
import { examSchedule } from "../lib/planning";
import { useLearning } from "../hooks/useLearning";
import { Button } from "../components/ui/button";
export function RevisionPlan() {
  const store = useLearning(),
    today = dateKey(Date.now(), store.preferences.timezone);
  const [date, setDate] = useState(store.preferences.examPlan?.date || ""),
    [units, setUnits] = useState<string[]>(
      store.preferences.examPlan?.units || [],
    ),
    [error, setError] = useState(""),
    [generated, setGenerated] = useState(!!store.preferences.examPlan);
  let schedule: ReturnType<typeof examSchedule> = [];
  let included = new Set(units);
  function include(id: string) {
    if (included.has(id)) return;
    included.add(id);
    for (const needed of course.units.find((u) => u.id === id)?.needs || [])
      include(needed);
  }
  for (const id of units)
    for (const needed of course.units.find((u) => u.id === id)?.needs || [])
      include(needed);
  const cards = Object.entries(course.authored)
    .filter(([, l]) => included.has(l.unit))
    .flatMap(([lessonId, l]) =>
      l.review.map((r, i) => {
        const card = store.records.reviewCards[`${lessonId}-${i}`]?.fsrs;
        return {
          id: r.concept,
          lessonId,
          strength:
            card && card.reps
              ? fsrs().get_retrievability(restoreCard(card), new Date(), false)
              : null,
        };
      }),
    );
  const unique = [
    ...new Map(cards.map((c) => [`${c.lessonId}:${c.id}`, c])).values(),
  ];
  if (generated && date && unique.length) {
    try {
      schedule = examSchedule(unique, today, date);
    } catch {
      /* A saved exam date may now be past. Ask for a new date below. */
    }
  }
  function generate() {
    try {
      examSchedule(unique, today, date);
      if (!units.length) throw Error("Choose at least one unit.");
      if (!unique.length)
        throw Error(
          "No authored concepts are available for these units or prerequisites yet.",
        );
      store.setPreferences({ examPlan: { date, units } });
      setGenerated(true);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not create plan.",
      );
    }
  }
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">REVISE BEFORE A TEST</p>
      <h1>Give the ideas time to return.</h1>
      <p className="page-description">
        Choose units and a date. Weak and unreviewed authored concepts come
        first; available prerequisites are included. This schedule is saved on
        this device, and doesn’t postpone FSRS due dates.
      </p>
      <section className="settings-card">
        <label>
          Exam date
          <input
            type="date"
            min={new Date(Date.parse(today) + 86400000)
              .toISOString()
              .slice(0, 10)}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setGenerated(false);
            }}
          />
        </label>
        <label>
          Units to revise
          <select
            aria-label="Units to revise"
            multiple
            size={7}
            value={units}
            onChange={(e) => {
              setUnits([...e.target.selectedOptions].map((o) => o.value));
              setGenerated(false);
            }}
          >
            {course.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.id} — {u.title}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={generate}>Create revision schedule</Button>
        {error && <p role="alert">{error}</p>}
      </section>
      {generated && !schedule.length && (
        <p className="info-box">
          Update the date or selected units to rebuild this schedule. Plans
          don’t invent unauthored revision content.
        </p>
      )}
      <div className="revision-schedule">
        {schedule.map((item, i) => (
          <article key={`${item.lessonId}-${item.id}-${i}`}>
            <span className="pill">{item.date}</span>
            <h2>{conceptLabel(item.id)}</h2>
            <p>
              {item.strength === null
                ? "Not reviewed yet"
                : `Estimated recall ${Math.round(item.strength * 100)}%`}{" "}
              · {item.lessonId}
            </p>
            <Link to={`/revise?concept=${encodeURIComponent(item.id)}`}>
              Open focused revision →
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
