import { useState } from "react";
import { Link } from "react-router-dom";
import { foundationProjects } from "../lib/foundation-projects";
export function Projects() {
  const [unit, setUnit] = useState(foundationProjects[0].unit);
  const p = foundationProjects.find((p) => p.unit === unit)!;
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">PREDICT → INVESTIGATE → DEFEND</p>
      <h1>Turn a lesson into evidence.</h1>
      <p className="page-description">
        Ten foundation projects combine lab observations with full mathematical
        explanations. These are draft assignments; synthetic data and
        self-checks do not certify experimental validation or mastery.
      </p>
      <label>
        Project unit{" "}
        <select
          style={{ maxWidth: "100%", width: "100%", minWidth: 0 }}
          aria-label="Project unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          {foundationProjects.map((p) => (
            <option key={p.unit} value={p.unit}>
              {p.unit} · {p.title}
            </option>
          ))}
        </select>
      </label>
      <article className="settings-card" key={p.unit}>
        <span className="pill">{p.unit} · Draft project</span>
        <h2>{p.title}</h2>
        <p>{p.question}</p>
        <h3>Method</h3>
        <ol>
          {p.method.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
        <h3>Submit in your notebook</h3>
        <ul>
          {p.deliverables.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <h3>Review rubric</h3>
        <ul>
          {p.rubric.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <details>
          <summary>Reveal the consistency checkpoint</summary>
          <p>{p.checkpoint}</p>
          <p>
            This is an internal model check, not independent scientific review.
            Write your prediction and calculations before opening it.
          </p>
        </details>
        <h3>Prepare and record</h3>
        <p>
          Use the existing lesson notebook to save your evidence: prediction,
          apparatus and controls, labelled raw or synthetic table, derivation,
          residuals, uncertainty and conclusion. These projects do not
          auto-award XP or change lesson mastery.
        </p>
        <ul>
          {p.lessons.map((id) => (
            <li key={id}>
              <Link to={`/lesson/${id}`}>Lesson {id} and its notebook →</Link>
            </li>
          ))}
        </ul>
        <Link className="text-button" to={`/lesson/${p.lessons[0]}`}>
          Open the lesson and its apparatus →
        </Link>
      </article>
    </main>
  );
}
