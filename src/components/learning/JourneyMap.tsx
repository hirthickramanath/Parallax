import { useState } from "react";
import { Link } from "react-router-dom";
import { course, missingNeeds, phases, nextLesson } from "../../lib/course";
import { useLearning } from "../../hooks/useLearning";
export function JourneyMap() {
  const store = useLearning();
  const next = nextLesson(store.records);
  const currentId =
    Object.entries(store.records.lessons)
      .filter(([, p]) => p.status === "in_progress")
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt)[0]?.[0] || next?.id;
  const [phase, setPhase] = useState(
    course.lessons.find((l) => l.id === currentId)?.phase || 0,
  );
  return (
    <section className="journey-map" aria-label="Learning level map">
      <p className="eyebrow">ONE IDEA LEADS TO ANOTHER</p>
      <h2>Your path to the universe</h2>
      <label>
        Journey chapter
        <select
          value={phase}
          onChange={(e) => setPhase(Number(e.target.value))}
        >
          {phases.map((name, i) => (
            <option value={i} key={name}>
              {i + 1} · {name}
            </option>
          ))}
        </select>
      </label>
      <ol className="level-path">
        {course.lessons
          .filter((l) => l.phase === phase)
          .map((l, i) => {
            const done = ["done", "skipped"].includes(
                store.records.lessons[l.id]?.status,
              ),
              locked = missingNeeds(l, store.records).length > 0;
            return (
              <li
                key={l.id}
                style={
                  {
                    "--bend": `${Math.sin(i * 1.2) * 60}px`,
                  } as React.CSSProperties
                }
                className={`${done ? "complete" : locked ? "waiting" : "available"} ${l.id === currentId ? "current-level" : ""}`}
              >
                <Link
                  to={`/lesson/${l.id}`}
                  aria-label={`${l.title}${done ? " · completed" : locked ? " · prerequisites recommended" : ""}`}
                >
                  <span className="level-node">
                    {done ? "✓" : locked ? "◇" : i + 1}
                  </span>
                  <strong>{l.title}</strong>
                  <small>
                    {l.id}
                    {l.id === currentId ? " · Continue here" : ""}
                    {locked ? " · prerequisites first" : ""}
                  </small>
                </Link>
              </li>
            );
          })}
      </ol>
    </section>
  );
}
