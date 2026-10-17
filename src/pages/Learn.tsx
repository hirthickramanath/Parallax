import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LockKeyhole, CheckCircle2, ArrowRight } from "lucide-react";
import { course, phases, missingNeeds } from "../lib/course";
import { useLearning } from "../hooks/useLearning";
export function Learn() {
  const store = useLearning();
  const [params] = useSearchParams();
  const [phase, setPhase] = useState(0),
    [search, setSearch] = useState(params.get("search") || "");
  const units = course.units.filter(
    (u) =>
      (search ? true : u.phase === phase) &&
      (!search ||
        `${u.id} ${u.title} ${u.lessons.map((id) => course.lessons.find((l) => l.id === id)?.title).join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">YOUR PATH TO THE UNIVERSE</p>
      <h1>One idea builds the next.</h1>
      <p className="page-description">
        {course.lessons.length} curriculum entries · {course.units.length} units
        · {Object.keys(course.authored).length} playable drafts. Unavailable
        entries are curriculum stubs, not authored lessons.
      </p>
      <Link className="text-button" to="/placement">
        Check your starting point — Bridge diagnostic →
      </Link>
      <input
        className="search-input"
        aria-label="Search curriculum"
        placeholder="Search units, lessons, or IDs…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="phase-tabs" role="group" aria-label="Course phases">
        {phases.map((name, i) => (
          <button
            key={name}
            aria-pressed={phase === i}
            onClick={() => {
              setPhase(i);
              setSearch("");
            }}
          >
            Phase {i}
            <span>{name}</span>
          </button>
        ))}
      </div>
      <div className="unit-timeline">
        {units.map((unit) => (
          <section className="unit-chapter" key={unit.id}>
            <div className="chapter-marker">{unit.phase}</div>
            <details
              open={!!search || unit.lessons.some((id) => course.authored[id])}
            >
              <summary>
                <span className="pill">
                  {unit.track} · {unit.id}
                </span>
                <h2>{unit.title}</h2>
                <span>
                  {unit.lessons.length} lessons
                  {unit.needs.length ? " · Needs " + unit.needs.join(", ") : ""}
                </span>
              </summary>
              {unit.phase === 0 && (
                <Link
                  className="skip-test-link"
                  to={`/placement?unit=${unit.id}`}
                >
                  Take {unit.id} skip test →
                </Link>
              )}
              <div className="lesson-cards">
                {unit.lessons.map((id) => {
                  const lesson = course.lessons.find((l) => l.id === id)!;
                  const needs = missingNeeds(lesson, store.records);
                  return (
                    <article
                      className={`course-lesson ${lesson.available ? "available" : ""}`}
                      key={id}
                    >
                      <div>
                        <span className="lesson-id">
                          {id} · {lesson.level}
                        </span>
                        <h3>{lesson.title}</h3>
                        <p>{lesson.hook}</p>
                        <span className="lesson-status">
                          {store.records.lessons[id]?.status === "done" ? (
                            <>
                              <CheckCircle2 size={14} /> Completed
                            </>
                          ) : lesson.available ? (
                            "Playable draft"
                          ) : (
                            "Content in preparation"
                          )}
                        </span>
                        {needs.length > 0 && (
                          <small className="needs-label">
                            <LockKeyhole size={12} /> Recommended first:{" "}
                            {needs.join(", ")}
                          </small>
                        )}
                      </div>
                      {lesson.available ? (
                        <Link
                          className="lesson-start"
                          to={`/lesson/${id}`}
                          aria-label={`Open ${id}`}
                        >
                          {store.records.lessons[id] ? "Resume" : "Explore"}
                          <ArrowRight size={17} />
                        </Link>
                      ) : (
                        <span className="pill">Draft stub</span>
                      )}
                    </article>
                  );
                })}
              </div>
            </details>
          </section>
        ))}
      </div>
      {!units.length && <p>No matching curriculum entries.</p>}
    </main>
  );
}
