import { FoundationRevisionCard } from "../components/learning/FoundationRevisionCard";
import { nextFoundation } from "../lib/foundation-path";
import { WeekOverview } from "../components/learning/WeekOverview";
import { JourneyMap } from "../components/learning/JourneyMap";
import { Link } from "react-router-dom";
import { Flame, ArrowRight, BookOpen, Target } from "lucide-react";
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
  const goal = store.preferences.dailyGoal;
  const goalMet = xp >= goal;
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: store.preferences.timezone,
  }).format(now);
  const revisionOn = !!store.preferences.foundationRevision;
  return (
    <main id="main" className="workspace-page today">
      <header className="today-head">
        <div>
          <p className="eyebrow">{dateLabel}</p>
          <h1>
            {user?.displayName
              ? `Ready, ${user.displayName.split(" ")[0]}?`
              : "Your universe awaits."}
          </h1>
          <p className="page-description">
            Build the intuition. Keep the theory. Follow the evidence.
          </p>
        </div>
        <section className="goal-card" aria-label="Daily goal">
          <div className="goal-heading">
            <Flame aria-hidden="true" />
            <span>Keep your spark</span>
          </div>
          <strong className="streak-number">
            {stats.current}
            <span> day streak</span>
          </strong>
          <label htmlFor="daily-progress">
            Daily goal{" "}
            <span>
              {xp}/{goal} XP
            </span>
          </label>
          <progress
            id="daily-progress"
            max={goal}
            value={Math.min(xp, goal)}
          />
          <p>
            {goalMet
              ? "Goal reached. A little progress goes a long way."
              : "A day counts when you reach your goal."}
          </p>
        </section>
      </header>

      <div className="today-layout">
        <div className="today-session">
          <section
            className="session-step daily-puzzle"
            id="daily"
            aria-label="Problem of the day"
          >
            <span className="step-no" aria-hidden="true">
              1
            </span>
            <span className="pill">
              Warm up · problem of the day ·{" "}
              {dailyQuestion.conceptual ? "conceptual why" : "short problem"}
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

          <section className="session-step review-step" aria-label="Review">
            <span className="step-no" aria-hidden="true">
              2
            </span>
            <span className="pill">Recall · spaced review</span>
            <h2>
              {due > 0
                ? `${due} ${due === 1 ? "card is" : "cards are"} ready to review.`
                : "No cards due today."}
            </h2>
            <p>
              {due > 0
                ? "Pulling an idea from memory just as it begins to fade is what makes it last. Five minutes is enough."
                : "Cards you finish in lessons come back here on a schedule, just before you would forget them."}
            </p>
            {due > 0 && (
              <Button asChild>
                <Link to="/review">
                  Review now
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
            )}
          </section>

          {revisionOn ? (
            <div className="session-step">
              <span className="step-no" aria-hidden="true">
                3
              </span>
              <FoundationRevisionCard />
            </div>
          ) : (
            <section className="session-step continue-card">
              <span className="step-no" aria-hidden="true">
                3
              </span>
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
                <small>Soft-lock preview · prerequisites recommended.</small>
              )}
              <Button asChild>
                <Link to={lesson ? `/lesson/${lesson.id}` : "/learn"}>
                  {resuming ? "Recap & resume" : "Start this lesson"}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
            </section>
          )}
        </div>

        <aside className="today-rail" aria-label="This week">
          <section className="stat-strip">
            <div>
              <Target aria-hidden="true" />
              <strong>{done}</strong>
              <span>Lessons read</span>
            </div>
            <div>
              <Flame aria-hidden="true" />
              <strong>{stats.totalXp}</strong>
              <span>Total XP</span>
            </div>
            <Link to="/review" className="stat-link">
              <BookOpen aria-hidden="true" />
              <strong>{due}</strong>
              <span>Cards due</span>
            </Link>
          </section>
          <WeekOverview />
          {!revisionOn && <FoundationRevisionCard />}
        </aside>
      </div>

      <JourneyMap />
    </main>
  );
}
