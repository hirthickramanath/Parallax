import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LockKeyhole, CheckCircle2, ArrowRight } from "lucide-react";
import { course, missingNeeds } from "../lib/course";
import {
  ChapterTiles,
  usePhaseProgress,
} from "../components/learning/JourneyMap";
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
  const progress = usePhaseProgress();
  const isRead = (id: string) =>
    ["done", "skipped"].includes(store.records.lessons[id]?.status);
  const focusUnit = units.find((u) => u.lessons.some((id) => !isRead(id)))?.id;
  return (
    <main id="main" className="workspace-page course-page">
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
      <Link className="text-button" to="/projects">
        Apply the foundations — unit projects →
      </Link>
      <input
        className="search-input"
        aria-label="Search curriculum"
        placeholder="Search units, lessons, or IDs…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ChapterTiles
        progress={progress}
        phase={phase}
        onSelect={(i) => {
          setPhase(i);
          setSearch("");
        }}
      />
      <div className="course-units">
        {units.map((unit) => {
          const lessons = unit.lessons.map((id) =>
            course.lessons.find((l) => l.id === id)!,
          );
          const read = lessons.filter((l) =>
            ["done", "skipped"].includes(store.records.lessons[l.id]?.status),
          ).length;
          return (
            <details
              className="path-unit course-unit"
              key={`${phase}-${unit.id}-${search}`}
              open={!!search || unit.id === focusUnit}
            >
              <summary>
                <span className="path-track">
                  {unit.track} · {unit.id}
                </span>
                <h2 className="path-unit-title">{unit.title}</h2>
                <span className="path-unit-count">
                  {read} / {lessons.length}
                </span>
              </summary>
              <p className="unit-meta">
                {unit.needs.length ? `Needs ${unit.needs.join(", ")}. ` : ""}
                {unit.phase === 0 && (
                  <Link
                    className="skip-test-link"
                    to={`/placement?unit=${unit.id}`}
                  >
                    Take {unit.id} skip test →
                  </Link>
                )}
              </p>
              <ol className="course-rows">
                {lessons.map((lesson) => {
                  const id = lesson.id;
                  const needs = missingNeeds(lesson, store.records);
                  const status = store.records.lessons[id]?.status;
                  return (
                    <li
                      className={`course-row ${lesson.available ? "available" : ""}`}
                      key={id}
                    >
                      <span className="lesson-id">
                        {id} · {lesson.level}
                      </span>
                      <div className="course-row-main">
                        <h3>{lesson.title}</h3>
                        <p>{lesson.hook}</p>
                        <span className="lesson-status">
                          {status === "done" ? (
                            <>
                              <CheckCircle2 size={14} aria-hidden="true" />{" "}
                              Completed
                            </>
                          ) : lesson.available ? (
                            "Playable draft"
                          ) : (
                            "Content in preparation"
                          )}
                        </span>
                        {needs.length > 0 && (
                          <small className="needs-label">
                            <LockKeyhole size={12} aria-hidden="true" />{" "}
                            Recommended first: {needs.join(", ")}
                          </small>
                        )}
                      </div>
                      {lesson.available ? (
                        <Link
                          className="lesson-start"
                          to={`/lesson/${id}`}
                          aria-label={`${store.records.lessons[id] ? "Resume" : "Explore"} ${id}`}
                        >
                          {store.records.lessons[id] ? "Resume" : "Explore"}
                          <ArrowRight size={17} aria-hidden="true" />
                        </Link>
                      ) : (
                        <span className="pill">Draft stub</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </details>
          );
        })}
      </div>
      {!units.length && <p>No matching curriculum entries.</p>}
    </main>
  );
}
