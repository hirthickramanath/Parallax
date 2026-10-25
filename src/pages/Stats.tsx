import { fsrs } from "ts-fsrs";
import { restoreCard } from "../lib/fsrs";
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
  const reviewed = Object.values(store.records.reviewCards).filter(
    (c) => c.fsrs.reps > 0,
  );
  const retention = Array.from({ length: 31 }, (_, i) =>
    reviewed.length
      ? reviewed.reduce(
          (sum, c) =>
            sum +
            fsrs().get_retrievability(
              restoreCard(c.fsrs),
              new Date(now + i * 86400000),
              false,
            ),
          0,
        ) / reviewed.length
      : 0,
  );
  const xpByTrack: Record<string, number> = {};
  for (const day of Object.values(store.records.days))
    for (const [track, xp] of Object.entries(day.xpByTrack || {}))
      xpByTrack[track] = (xpByTrack[track] || 0) + xp;
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
        <div
          className="heatmap"
          role="group"
          aria-label="365-day activity calendar"
        >
          {dates.map((date) => (
            <div
              key={date}
              role="img"
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
        <h2>Your study across the sciences</h2>
        {Object.keys(xpByTrack).length ? (
          <div className="track-analytics">
            {Object.entries(xpByTrack)
              .sort((a, b) => b[1] - a[1])
              .map(([track, xp]) => (
                <div key={track}>
                  <span>
                    {track === "astro"
                      ? "Astrophysics"
                      : track === "maths"
                        ? "Mathematics"
                        : track}
                  </span>
                  <progress
                    aria-label={`${track} XP share`}
                    max={Math.max(1, stats.totalXp)}
                    value={xp}
                  />
                  <strong>{xp} XP</strong>
                </div>
              ))}
          </div>
        ) : (
          <p>Complete a study activity to start your track breakdown.</p>
        )}
      </section>
      <section className="activity-panel">
        <h2>If you stopped reviewing today…</h2>
        {reviewed.length ? (
          <svg
            className="retention-curve"
            viewBox="0 0 600 240"
            role="img"
            aria-label={`Model-estimated average recall over the next 30 days for ${reviewed.length} reviewed cards`}
          >
            <path
              d="M50 20V200H570M50 110H570"
              fill="none"
              stroke="currentColor"
              opacity=".2"
            />
            <path
              d={retention
                .map(
                  (r, i) => `${i ? "L" : "M"}${50 + i * 17.3},${200 - r * 180}`,
                )
                .join(" ")}
              fill="none"
              stroke="var(--primary-color)"
              strokeWidth="3"
            />
            <text x="5" y="25">
              100%
            </text>
            <text x="14" y="115">
              50%
            </text>
            <text x="23" y="200">
              0%
            </text>
            <text x="50" y="225">
              Today
            </text>
            <text x="510" y="225">
              30 days
            </text>
          </svg>
        ) : (
          <p>
            No recall estimate yet. Rate a review card to build a model history.
          </p>
        )}
        <p className="source-note">
          FSRS model estimate, not measured retention. The line assumes no new
          reviews; real answers update the prediction. New/unreviewed cards are
          excluded.
        </p>
      </section>
      <section className="activity-panel">
        <h2>Your next 30 days of review</h2>
        <div className="forecast">
          {Array.from({ length: 30 }, (_, i) => {
            const date = new Date(noon + i * 86400000)
              .toISOString()
              .slice(0, 10);
            const count = Object.values(store.records.reviewCards).filter(
              (c) => {
                const due = dateKey(
                  new Date(c.fsrs.due).getTime(),
                  store.preferences.timezone,
                );
                return i === 0 ? due <= today : due === date;
              },
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
