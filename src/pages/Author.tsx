import { Link } from "react-router-dom";
import { course } from "../lib/course";
import { ConceptMap } from "../components/learning/ConceptMap";
export function Author() {
  if (!import.meta.env.DEV)
    return (
      <main id="main" className="workspace-page">
        <h1>Author tools are local-only.</h1>
        <p>
          Run the development server to inspect the content audit. Publication
          is reviewed through source files and Git, not a production browser
          toggle.
        </p>
        <Link to="/dashboard">Back to dashboard</Link>
      </main>
    );
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">LOCAL CONTENT AUDIT</p>
      <h1>Keep the claims accountable.</h1>
      <p>
        {Object.keys(course.authored).length} authored lessons /{" "}
        {course.lessons.length} entries. Graph and template validation run
        before the server starts.
      </p>
      <ConceptMap all />
      <div className="author-audit">
        {Object.values(course.authored).map((lesson) => (
          <article key={lesson.id}>
            <span className="pill">
              {lesson.status} · {lesson.id}
            </span>
            <h2>{lesson.title}</h2>
            <p>
              Sections: {lesson.sections.length} · Conceptual checks:{" "}
              {lesson.questions.filter((q) => !q.tier && q.conceptual).length}/
              {lesson.questions.filter((q) => !q.tier).length}
            </p>
            <p>Source review: {lesson.verification?.status || "pending"}</p>
            <ul>
              {lesson.book_refs.map((ref) => (
                <li key={ref}>{ref}</li>
              ))}
            </ul>
            <code>content/lessons/{lesson.id}.mdx</code>
            <p>
              <Link to={`/lesson/${lesson.id}`}>Inspect lesson →</Link>
            </p>
          </article>
        ))}
      </div>
      <p className="info-box">
        Edit stored MDX files in your editor, run npm run validate:content and
        npm run build, then review the Git diff. Verified/published status
        requires a named reviewer, review date and source references without
        pending markers. This audit cannot independently certify a scientific
        claim.
      </p>
    </main>
  );
}
