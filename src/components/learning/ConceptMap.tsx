import { Link } from "react-router-dom";
import { fsrs } from "ts-fsrs";
import { course } from "../../lib/course";
import { restoreCard } from "../../lib/fsrs";
import { useLearning } from "../../hooks/useLearning";
export function ConceptMap({ all = false }: { all?: boolean }) {
  const store = useLearning();
  const ids = new Set(
    all ? course.lessons.map((l) => l.id) : Object.keys(course.authored),
  );
  for (const l of Object.values(course.authored))
    for (const needed of l.requires) ids.add(needed);
  const rows = new Map<number, number>();
  const nodes = [...ids]
    .map((id) => course.lessons.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => !!l)
    .sort(
      (a, b) =>
        a.phase - b.phase ||
        a.id.localeCompare(b.id, undefined, { numeric: true }),
    )
    .map((l) => {
      const row = rows.get(l.phase) || 0;
      rows.set(l.phase, row + 1);
      const cards = Object.values(store.records.reviewCards).filter(
        (c) => c.lessonId === l.id && c.fsrs.reps > 0,
      );
      const strength = cards.length
        ? cards.reduce(
            (sum, c) =>
              sum +
              fsrs().get_retrievability(restoreCard(c.fsrs), new Date(), false),
            0,
          ) / cards.length
        : null;
      return { ...l, x: 20 + l.phase * 245, y: 55 + row * 85, strength };
    });
  const map = new Map(nodes.map((n) => [n.id, n]));
  const height = Math.max(250, ...nodes.map((n) => n.y + 85));
  return (
    <section className="activity-panel">
      <h2>Your idea network</h2>
      <p>
        {all
          ? "Complete lesson prerequisite graph."
          : "Authored lessons and their immediate lesson prerequisites."}{" "}
        Solid cards are playable; dashed cards are not authored. Recall is
        estimated from reviewed cards, with text labels as well as colour.
      </p>
      <div
        className="concept-map-scroll"
        tabIndex={0}
        aria-label="Scrollable prerequisite map"
      >
        <svg
          viewBox={`0 0 2230 ${height}`}
          width="2230"
          height={height}
          role="img"
          aria-label="Prerequisite connections and estimated recall for authored lessons"
        >
          {Array.from({ length: 9 }, (_, i) => (
            <text key={i} x={20 + i * 245} y="25" className="map-phase">
              PHASE {i}
            </text>
          ))}
          {nodes.flatMap((n) =>
            n.requires.map((id) => {
              const from = map.get(id);
              return from ? (
                <path
                  key={`${id}-${n.id}`}
                  d={`M${from.x + 210} ${from.y + 28} C${from.x + 235} ${from.y + 28},${n.x - 25} ${n.y + 28},${n.x} ${n.y + 28}`}
                  className="map-edge"
                />
              ) : null;
            }),
          )}
          {nodes.map((n) => (
            <Link
              key={n.id}
              to={n.available ? `/lesson/${n.id}` : `/learn?search=${n.id}`}
              aria-label={`${n.id}: ${n.title}; ${n.strength === null ? "not reviewed" : Math.round(n.strength * 100) + "% estimated recall"}`}
            >
              <g
                transform={`translate(${n.x} ${n.y})`}
                className={n.available ? "map-node" : "map-node unavailable"}
              >
                <title>{n.title}</title>
                <rect width="210" height="62" rx="12" />
                <text x="12" y="22">
                  {n.id} · {n.available ? "Draft lesson" : "Not authored"}
                </text>
                <text x="12" y="43" className="map-memory">
                  {n.strength === null
                    ? "No recall estimate"
                    : `${Math.round(n.strength * 100)}% estimated recall`}
                </text>
              </g>
            </Link>
          ))}
        </svg>
      </div>
      <Link className="text-button" to="/revision-plan">
        Plan a revision before your test →
      </Link>
    </section>
  );
}
