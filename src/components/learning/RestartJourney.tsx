import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { course, journeyLessons } from "../../lib/course";
import { useLearning } from "../../hooks/useLearning";
import { Button } from "../ui/button";
export function RestartJourney() {
  const store = useLearning(),
    navigate = useNavigate();
  const [open, setOpen] = useState(false),
    [mode, setMode] = useState("beginning"),
    [from, setFrom] = useState(journeyLessons[0].id),
    [section, setSection] = useState("ready"),
    [search, setSearch] = useState("");
  const target = mode === "beginning" ? journeyLessons[0].id : from;
  const count =
    journeyLessons.length - journeyLessons.findIndex((l) => l.id === target);
  return (
    <section className="settings-card">
      <h2>Restart your learning journey</h2>
      <p>Revisit the beginning or restart from a particular lesson.</p>
      {!open ? (
        <Button variant="outline" onClick={() => setOpen(true)}>
          Restart learning progress
        </Button>
      ) : (
        <div className="restart-controls">
          <label>
            Where would you like to restart?
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="beginning">From the beginning</option>
              <option value="point">At a particular point</option>
            </select>
          </label>
          {mode === "point" && (
            <>
              <label>
                Find a lesson
                <input
                  aria-label="Search restart lessons"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by topic or lesson ID"
                />
              </label>
              <label>
                Restart lesson
                <select
                  aria-label="Restart lesson"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setSection("ready");
                  }}
                >
                  {journeyLessons
                    .filter(
                      (l) =>
                        l.id === from ||
                        `${l.id} ${l.title}`
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                    )
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.id} · {l.title}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Restart section
                <select
                  aria-label="Restart section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                >
                  {course.authored[from].sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <p role="status">
            Reset completion, mastery, bookmarks and recall schedules for{" "}
            {count} lessons, starting at {target}. Unit skip credits touching
            these lessons will reset. Notes, past answers, XP and streak history
            stay saved. Previously earned XP will not be awarded twice. The
            change syncs when connected.
          </p>
          <Button
            onClick={() => {
              store.restartJourney(
                target,
                mode === "beginning" ? "ready" : section,
              );
              navigate(`/lesson/${target}`);
            }}
          >
            Confirm restart
          </Button>{" "}
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      )}
    </section>
  );
}
