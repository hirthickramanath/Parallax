import { FoundationRevisionCard } from "../components/learning/FoundationRevisionCard";
import { nextFoundation } from "../lib/foundation-path";
import { WeekOverview } from "../components/learning/WeekOverview";
import { JourneyMap } from "../components/learning/JourneyMap";
import { Link } from "react-router-dom";
import { Flame, ArrowRight, Telescope, BookOpen, Target } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useClock, useLearning } from "../hooks/useLearning";
import { dateKey, streakStats } from "../lib/learning-core";
import { course, nextLesson, missingNeeds } from "../lib/course";
import { QuestionCard } from "../components/learning/QuestionCard";
import { Button } from "../components/ui/button";
export function Dashboard() {
  const { user } = useAuth(),
    store = useLearning();
  const now = useClock(),
    today = dateKey(now, store.preferences.timezone),
    stats = streakStats(store.records.days, today),
    xp = store.records.days[today]?.xp || 0;
  const last = Object.entries(store.records.lessons)
    .filter(([id, p]) => course.authored[id] && p.status !== "not_started")
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)[0];
  const resuming = last?.[1].status === "in_progress";
  const lesson = resuming
    ? course.authored[last[0]]
    : nextLesson(store.records);
  const recap = last ? course.authored[last[0]].recap : [];
  const done = Object.values(store.records.lessons).filter(
    (p) => p.status === "done",
  ).length;
  const dayIndex = Math.floor(Date.parse(today) / 86400000);
  const revisionNext = store.preferences.foundationRevision
    ? nextFoundation(store.records)
    : undefined;
  const puzzleSource = revisionNext
    ? course.authored[revisionNext]
    : last
      ? course.authored[last[0]]
      : course.authored["PB1.1"];
  const puzzlePool = puzzleSource.questions.filter(
    (q) => !q.tier && q.conceptual === (dayIndex % 2 === 0),
  );
  const dailyQuestion =
    puzzlePool[dayIndex % puzzlePool.length] || puzzleSource.questions[0];
  const due = Object.values(store.records.reviewCards).filter(
    (c) => new Date(c.fsrs.due).getTime() <= now,
  ).length;
  return (
    <main id="main" className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">A LITTLE CURIOSITY, EVERY DAY</p>
          <h1>
            {user?.displayName
              ? `Ready, ${user.displayName.split(" ")[0]}?`
              : "Your universe awaits."}
          </h1>
          <p className="page-description">
            Build the intuition. Keep the theory. Follow the evidence.
          </p>
        </div>
        <span className="daily-date">
          {new Intl.DateTimeFormat(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
            timeZone: store.preferences.timezone,
          }).format(now)}
        </span>
      </div>
      <div className="dashboard-columns">
        <div className="dashboard-primary">
          <FoundationRevisionCard />
          <WeekOverview />
          <div className="dashboard-grid">
            {!store.preferences.foundationRevision && (
              <section className="continue-card">
                <div className="continue-copy">
                  <span className="pill">
                    {last ? "CONTINUE YOUR JOURNEY" : "START EXPLORING"} ·{" "}
                    {lesson?.id || "COURSE"}
                  </span>
                  <h2>{lesson?.title || "Every question opens a door."}</h2>
                  <p>{lesson?.hook || "Your next lesson is waiting."}</p>
                  {last && (
                    <details className="recap-card" open>
                      <summary>
                        Your 30-second recap{last ? ` · ${last[0]}` : ""}
                      </summary>
                      <ul>
                        {recap.map((text) => (
                          <li key={text}>{text}</li>
                        ))}
                      </ul>
                      <p>
                        Before you continue: can you explain one of these ideas
                        without looking?
                      </p>
                    </details>
                  )}
                  {lesson && missingNeeds(lesson, store.records).length > 0 && (
                    <small>
                      Soft-lock preview · prerequisites recommended.
                    </small>
                  )}
                  <Button asChild>
                    <Link to={lesson ? `/lesson/${lesson.id}` : "/learn"}>
                      {resuming ? "Recap & resume" : "Start this lesson"}
                      <ArrowRight size={18} />
                    </Link>
                  </Button>
                </div>
                <div className="planet-emblem" aria-hidden="true">
                  <Telescope size={70} />
                  <span>LOOK CLOSER</span>
                </div>
              </section>
            )}
            <section className="goal-card">
              <div className="goal-heading">
                <Flame />
                <span>Keep your spark</span>
              </div>
              <strong className="streak-number">
                {stats.current}
                <span> day streak</span>
              </strong>
              <label htmlFor="daily-progress">
                Daily goal{" "}
                <span>
                  {xp}/{store.preferences.dailyGoal} XP
                </span>
              </label>
              <progress
                id="daily-progress"
                max={store.preferences.dailyGoal}
                value={Math.min(xp, store.preferences.dailyGoal)}
              />
              <p>
                {xp >= store.preferences.dailyGoal
                  ? "Goal reached. A little progress goes a long way."
                  : "A day counts when you reach your goal. Every meaningful step helps."}
              </p>
              <Link to="/stats">Your activity →</Link>
            </section>
          </div>
          <section className="stat-strip">
            <div>
              <Target />
              <strong>{done}</strong>
              <span>Lessons read</span>
            </div>
            <div>
              <Flame />
              <strong>{stats.totalXp}</strong>
              <span>Total XP</span>
            </div>
            <Link to="/review" className="stat-link">
              <BookOpen />
              <strong>{due}</strong>
              <span>Cards due</span>
            </Link>
          </section>

          <JourneyMap />
        </div>
        <aside className="dashboard-aside" aria-label="Problem of the day">
          {" "}
          <section className="daily-puzzle">
            <span className="pill">
              PROBLEM OF THE DAY ·{" "}
              {dailyQuestion.conceptual ? "CONCEPTUAL WHY" : "SHORT PROBLEM"}
            </span>
            <h2>A small question. A useful habit.</h2>
            <p>
              From {puzzleSource.title}. Conceptual and numeric days alternate;
              a correct answer earns today’s one-time 5 XP.
            </p>
            <QuestionCard
              key={today}
              lessonId="daily"
              question={{
                ...dailyQuestion,
                id: `${today}-${dailyQuestion.id}`,
                tier: "daily",
              }}
              onResult={(_, correct) => {
                if (correct)
                  store.award(`potd:${today}`, 5, puzzleSource.track);
              }}
            />
          </section>
        </aside>
      </div>
    </main>
  );
}
