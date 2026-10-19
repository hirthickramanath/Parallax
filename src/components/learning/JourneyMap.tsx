import {
  FOUNDATION_ORDER,
  foundationRevised,
  nextFoundation,
} from "../../lib/foundation-path";
import { demonstratedMastery } from "../../lib/mastery";
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
  if (store.preferences.foundationRevision)
    return (
      <section className="journey-map" aria-label="Learning level map">
        <p className="eyebrow">REBUILD BEFORE THE FRONTIER</p>
        <h2>Your foundation revision path</h2>
        <p>
          Each node revisits vocabulary, worked examples, full theory and guided
          practice. Revision practice is separate from course mastery.
        </p>
        <ol className="level-path">
          {FOUNDATION_ORDER.map((id, i) => {
            const done = foundationRevised(store.records, id),
              current = id === nextFoundation(store.records);
            return (
              <li
                key={id}
                className={`${done ? "complete" : "available"} ${current ? "current-level" : ""}`}
                style={
                  {
                    "--bend": `${Math.sin(i * 1.2) * 60}px`,
                  } as React.CSSProperties
                }
              >
                <Link
                  to={`/foundation-revision/${id}`}
                  aria-label={`${course.authored[id].title} · ${done ? "revision practice complete" : "foundation revision"}`}
                >
                  <span className="level-node">{done ? "✓" : i + 1}</span>
                  <strong>{course.authored[id].title}</strong>
                  <small>
                    {id}
                    {current ? " · Continue here" : ""}
                  </small>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
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
            const mastered = demonstratedMastery(store.records.lessons[l.id]);
            return (
              <li
                key={l.id}
                style={
                  {
                    "--bend": `${Math.sin(i * 1.2) * 60}px`,
                  } as React.CSSProperties
                }
                className={`${mastered ? "complete" : done ? "read-level" : locked ? "waiting" : "available"} ${l.id === currentId ? "current-level" : ""}`}
              >
                <Link
                  to={`/lesson/${l.id}`}
                  aria-label={`${l.title}${mastered ? " · practice mastery demonstrated" : done ? " · reading complete; mastery separate" : locked ? " · prerequisites recommended" : ""}`}
                >
                  <span className="level-node">
                    {mastered ? "✓" : done ? "○" : locked ? "◇" : i + 1}
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
