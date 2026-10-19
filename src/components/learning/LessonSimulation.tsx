import type { Authored } from "../../lib/course";
import { Widget } from "../widgets/registry";
export function simulationNames(lesson: Authored) {
  const names = [...(lesson.widgets || [])];
  if (/black hole|schwarzschild/i.test(lesson.title))
    names.push("black_hole_explorer");
  if (/vector|dot product|cross product/i.test(lesson.title))
    names.push("vector_explorer");
  if (lesson.id === "PB1.2") names.push("collision_explorer");
  if (lesson.id === "PB1.3") names.push("rolling_explorer");
  return [...new Set(names)];
}
export function LessonSimulation({ lesson }: { lesson: Authored }) {
  const names = simulationNames(lesson);
  if (!names.length) return null;
  return (
    <aside className="lesson-simulation" aria-label="Lesson simulation">
      <span className="pill">MOVE · PREDICT · EXPLAIN</span>
      {names.map((name) => (
        <Widget key={name} name={name} />
      ))}
    </aside>
  );
}
