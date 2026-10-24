import {
  FOUNDATION_ORDER,
  foundationRevised,
  nextFoundation,
} from "../../lib/foundation-path";
import { demonstratedMastery } from "../../lib/mastery";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Circle, Diamond, ArrowRight } from "lucide-react";
import {
  course,
  missingNeeds,
  phases,
  nextLesson,
  type Lesson,
} from "../../lib/course";
import { useLearning } from "../../hooks/useLearning";

type State = "mastered" | "read" | "next" | "needs" | "open";

/** One lesson row. The whole row is the tap target (see .path-row a::after). */
function PathRow({
  to,
  id,
  title,
  state,
  current,
  note,
  label,
}: {
  to: string;
  id: string;
  title: string;
  state: State;
  current: boolean;
  note: string;
  label: string;
}) {
  return (
    <li className={`path-row is-${state}${current ? " current-level" : ""}`}>
      <span className="path-status" aria-hidden="true">
        {state === "mastered" ? (
          <Check size={15} strokeWidth={3} />
        ) : state === "read" ? (
          <Circle size={13} strokeWidth={2.5} />
        ) : state === "needs" ? (
          <Diamond size={13} strokeWidth={2} />
        ) : (
          <ArrowRight size={15} strokeWidth={2.5} />
        )}
      </span>
      <span className="path-id">{id}</span>
      <Link to={to} aria-label={label}>
        {title}
      </Link>
      <span className="path-note" aria-hidden="true">
        {current ? "Continue here" : note}
      </span>
    </li>
  );
}


export function usePhaseProgress() {
  const store = useLearning();
  // Progress per chapter, computed once per change of records. No prerequisite checks here.
  return useMemo(
    () =>
      phases.map((_, p) => {
        const lessons = course.lessons.filter((l) => l.phase === p);
        let read = 0,
          mastered = 0;
        for (const l of lessons) {
          const rec = store.records.lessons[l.id];
          if (["done", "skipped"].includes(rec?.status)) read++;
          if (demonstratedMastery(rec)) mastered++;
        }
        return { total: lessons.length, read, mastered };
      }),
    [store.records.lessons],
  );
}

export function ChapterTiles({
  progress,
  phase,
  onSelect,
}: {
  progress: { total: number; read: number; mastered: number }[];
  phase: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="chapter-tiles" role="group" aria-label="Journey chapter">
      {phases.map((name, i) => {
        const p = progress[i];
        return (
          <button
            key={name}
            type="button"
            className="chapter-tile"
            aria-pressed={phase === i}
            onClick={() => onSelect(i)}
          >
            <span className="chapter-no">{i + 1}</span>
            <span className="chapter-name">{name}</span>
            <span className="chapter-count">
              {p.read} / {p.total} read
            </span>
            <span className="chapter-bar" aria-hidden="true">
              <i
                className="bar-mastered"
                style={{ width: `${(p.mastered / p.total) * 100}%` }}
              />
              <i
                className="bar-read"
                style={{
                  width: `${((p.read - p.mastered) / p.total) * 100}%`,
                }}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function JourneyMap() {
  const store = useLearning();
  const revisionMode = !!store.preferences.foundationRevision;
  const next = nextLesson(store.records);
  const currentId =
    Object.entries(store.records.lessons)
      .filter(([, p]) => p.status === "in_progress")
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt)[0]?.[0] || next?.id;
  const [phase, setPhase] = useState(
    course.lessons.find((l) => l.id === currentId)?.phase || 0,
  );

  const progress = usePhaseProgress();

  if (revisionMode) {
    const nextRev = nextFoundation(store.records);
    const doneCount = FOUNDATION_ORDER.filter((id) =>
      foundationRevised(store.records, id),
    ).length;
    return (
      <section className="journey-map" aria-label="Learning level map">
        <p className="eyebrow">REBUILD BEFORE THE FRONTIER</p>
        <h2>Your foundation revision path</h2>
        <p className="journey-lede">
          Each chapter revisits vocabulary, worked examples, full theory and
          guided practice. Revision practice is separate from course mastery.
        </p>
        <div className="journey-total">
          <span>
            <strong>{doneCount}</strong> of {FOUNDATION_ORDER.length} chapters
            revised
          </span>
          <progress
            max={FOUNDATION_ORDER.length}
            value={doneCount}
            aria-label="Foundation chapters revised"
          />
        </div>
        <ol className="path-list">
          {FOUNDATION_ORDER.map((id) => {
            const done = foundationRevised(store.records, id),
              current = id === nextRev,
              title = course.authored[id].title;
            return (
              <PathRow
                key={id}
                to={`/foundation-revision/${id}`}
                id={id}
                title={title}
                state={done ? "mastered" : current ? "next" : "open"}
                current={current}
                note={done ? "Revised" : ""}
                label={`${title} · ${done ? "revision practice complete" : "foundation revision"}`}
              />
            );
          })}
        </ol>
      </section>
    );
  }

  const totals = progress.reduce(
    (a, p) => ({
      total: a.total + p.total,
      read: a.read + p.read,
      mastered: a.mastered + p.mastered,
    }),
    { total: 0, read: 0, mastered: 0 },
  );
  const units = course.units.filter((u) => u.phase === phase);
  const lessonOf = (id: string) => course.lessons.find((l) => l.id === id)!;
  const isRead = (id: string) =>
    ["done", "skipped"].includes(store.records.lessons[id]?.status);
  // Open the unit that holds the current lesson, else the first unit with unread lessons.
  const focusUnit =
    units.find((u) => u.lessons.includes(currentId || ""))?.id ||
    units.find((u) => u.lessons.some((id) => !isRead(id)))?.id ||
    units[0]?.id;

  const rowFor = (l: Lesson) => {
    const rec = store.records.lessons[l.id];
    const mastered = demonstratedMastery(rec),
      read = isRead(l.id),
      missing = missingNeeds(l, store.records),
      current = l.id === currentId;
    const state: State = mastered
      ? "mastered"
      : read
        ? "read"
        : missing.length
          ? "needs"
          : current
            ? "next"
            : "open";
    const note = mastered
      ? "Mastered"
      : read
        ? "Read"
        : missing.length
          ? `Needs ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? "…" : ""}`
          : "";
    return (
      <PathRow
        key={l.id}
        to={`/lesson/${l.id}`}
        id={l.id}
        title={l.title}
        state={state}
        current={current}
        note={note}
        label={`${l.title}${mastered ? " · practice mastery demonstrated" : read ? " · reading complete; mastery separate" : missing.length ? " · prerequisites recommended" : ""}`}
      />
    );
  };

  return (
    <section className="journey-map" aria-label="Learning level map">
      <p className="eyebrow">ONE IDEA LEADS TO ANOTHER</p>
      <div className="journey-head">
        <h2>Your path to the universe</h2>
        <Link className="journey-all" to="/learn">
          Full course map <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div className="journey-total">
        <span>
          <strong>{totals.read}</strong> of {totals.total} lessons read ·{" "}
          <strong>{totals.mastered}</strong> mastered
        </span>
        <progress
          max={totals.total}
          value={totals.read}
          aria-label="Lessons read"
        />
      </div>
      <ChapterTiles progress={progress} phase={phase} onSelect={setPhase} />
      <div className="chapter-panel">
        <h3>
          {phase + 1} · {phases[phase]}
        </h3>
        {units.map((u) => {
          const lessons = u.lessons.map(lessonOf);
          const read = lessons.filter((l) => isRead(l.id)).length;
          return (
            <details
              className="path-unit"
              key={`${phase}-${u.id}`}
              open={u.id === focusUnit}
            >
              <summary>
                <span className="path-track">{u.track}</span>
                <span className="path-unit-title">{u.title}</span>
                <span className="path-unit-count">
                  {read} / {lessons.length}
                </span>
              </summary>
              <ol className="path-list">{lessons.map(rowFor)}</ol>
            </details>
          );
        })}
      </div>
      <p className="path-legend" aria-hidden="true">
        <span>
          <Check size={14} strokeWidth={3} /> Mastered
        </span>
        <span>
          <Circle size={12} strokeWidth={2.5} /> Read
        </span>
        <span>
          <Diamond size={12} /> Prerequisites first (you can still open it)
        </span>
      </p>
    </section>
  );
}
