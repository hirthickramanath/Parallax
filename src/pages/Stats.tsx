import { Flame, Snowflake, Trophy } from "lucide-react";
import { useClock, useLearning } from "../hooks/useLearning";
import { dateKey, streakStats } from "../lib/learning-core";
export function Stats() {
  const store = useLearning(),
    now = useClock(),
    today = dateKey(now, store.preferences.timezone),
    stats = streakStats(store.records.days, today);
  const noon = Date.parse(today + "T12:00:00Z");
  const dates = Array.from({ length: 365 }, (_, i) =>
    new Date(noon - (364 - i) * 86400000).toISOString().slice(0, 10),
  );
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">SMALL STEPS BECOME A HABIT</p>
      <h1>Keep your spark alive.</h1>
      <div className="stats-cards">
        <article>
          <Flame />
          <strong>{stats.current}</strong>
          <span>Current streak</span>
        </article>
        <article>
          <Trophy />
          <strong>{stats.longest}</strong>
          <span>Longest streak</span>
        </article>
        <article>
          <Snowflake />
          <strong>{stats.freezes}</strong>
          <span>Freezes available</span>
        </article>
      </div>
      <section className="activity-panel">
        <h2>A year of curiosity</h2>
        <p>
          {stats.activeDays} goal days · {stats.totalXp} XP ·{" "}
          {store.preferences.timezone}
        </p>
        <div className="heatmap" aria-label="365-day activity calendar">
          {dates.map((date) => (
            <div
              key={date}
              tabIndex={0}
              className={
                store.records.days[date]?.goalMet
                  ? "goal-met"
                  : store.records.days[date]?.xp
                    ? "some-activity"
                    : ""
              }
              title={`${date}: ${store.records.days[date]?.xp || 0} XP${store.records.days[date]?.goalMet ? " · goal met" : ""}`}
              aria-label={`${date}: ${store.records.days[date]?.xp || 0} XP`}
            />
          ))}
        </div>
        <p className="source-note">
          Filled cells mark daily goals met; lighter cells mark some activity.
          Focus or hover a cell for its date and XP. Streaks count goal days,
          not mere page visits.
        </p>
      </section>
      <section className="activity-panel">
        <h2>Milestones</h2>
        <div className="badges">
          {[3, 7, 14, 30, 60, 100, 365].map((n) => (
            <span key={n} className={stats.longest >= n ? "earned" : ""}>
              <Trophy size={20} />
              {n} days {stats.longest >= n ? "· earned" : "· ahead"}
            </span>
          ))}
        </div>
        <p>
          Earn a freeze after seven qualifying goal days in a run, up to two
          banked. Freezes bridge missed days; they don’t award XP.
        </p>
      </section>
      <section className="activity-panel">
        <h2>Your next 30 days of review</h2>
        <div className="forecast">
          {Array.from({ length: 30 }, (_, i) => {
            const date = new Date(now + i * 86400000)
              .toISOString()
              .slice(0, 10);
            const count = Object.values(store.records.reviewCards).filter(
              (c) => new Date(c.fsrs.due).toISOString().slice(0, 10) === date,
            ).length;
            return (
              <div key={date} title={`${date}: ${count} cards`}>
                <span
                  style={{ height: Math.max(3, Math.min(90, count * 10)) }}
                />
                <small>{i + 1}</small>
              </div>
            );
          })}
        </div>
        <p className="source-note">
          Scheduled cards only; actual future reviews depend on your answers.
        </p>
      </section>
    </main>
  );
}
