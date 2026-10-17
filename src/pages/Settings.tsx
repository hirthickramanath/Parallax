import { Link } from "react-router-dom";
import { useState } from "react";
import { useLearning } from "../hooks/useLearning";
import { useAuth } from "../hooks/useAuth";
import { ThemeSelect } from "../components/ThemeSelect";
import { Button } from "../components/ui/button";
export function Settings() {
  const { logout } = useAuth();
  const store = useLearning();
  const [timezone, setTimezone] = useState(store.preferences.timezone),
    [error, setError] = useState(""),
    [notificationStatus, setNotificationStatus] = useState(() =>
      "Notification" in window ? Notification.permission : "unsupported",
    );
  function setZone() {
    try {
      new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
      store.setPreferences({ timezone });
      setError("");
    } catch {
      setError("Use an IANA timezone such as Asia/Kolkata or Europe/London.");
    }
  }
  function exportData() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { records: store.records, preferences: store.preferences },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "parallax-progress.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">YOUR STUDY ENVIRONMENT</p>
      <h1>Make room for curiosity.</h1>
      {import.meta.env.DEV && (
        <Link className="text-button" to="/author">
          Open local authoring audit →
        </Link>
      )}
      <section className="settings-card">
        <h2>Appearance & study</h2>
        <ThemeSelect />
        <label>
          Default lesson depth
          <select
            value={store.preferences.depth}
            onChange={(e) =>
              store.setPreferences({
                depth: e.target.value as "quick" | "full",
              })
            }
          >
            <option value="full">Full study — complete theory</option>
            <option value="quick">Quick review</option>
          </select>
        </label>
        <label>
          Daily XP goal
          <select
            value={store.preferences.dailyGoal}
            onChange={(e) =>
              store.setPreferences({ dailyGoal: Number(e.target.value) })
            }
          >
            <option value="10">Light · 10 XP</option>
            <option value="20">Regular · 20 XP</option>
            <option value="40">Serious · 40 XP</option>
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={store.preferences.strictLocking}
            onChange={(e) =>
              store.setPreferences({ strictLocking: e.target.checked })
            }
          />
          Enforce prerequisites (strict locking)
        </label>
        <label>
          Timezone
          <input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />
        </label>
        <Button variant="outline" onClick={setZone}>
          Save timezone
        </Button>
        {error && <p role="alert">{error}</p>}
        <p className="source-note">
          Preferences are stored on this device per account. A cloud profile
          path requires a separate data-model decision. Changing the timezone
          can regroup future activity; historical dates stay as recorded.
        </p>
      </section>
      <section className="settings-card">
        <h2>A gentle study reminder</h2>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={!!store.preferences.remindersEnabled}
            onChange={(e) =>
              store.setPreferences({ remindersEnabled: e.target.checked })
            }
          />
          Enable a reminder while Parallax is open
        </label>
        <label>
          Reminder time
          <input
            type="time"
            value={store.preferences.reminderTime || "18:00"}
            onChange={(e) =>
              store.setPreferences({ reminderTime: e.target.value })
            }
          />
        </label>
        <p>
          Uses {store.preferences.timezone}. The reminder stops after your goal
          is met and can be dismissed for the day.
        </p>
        <Button
          variant="outline"
          disabled={
            notificationStatus === "unsupported" ||
            notificationStatus === "denied" ||
            notificationStatus === "granted"
          }
          onClick={async () => {
            try {
              setNotificationStatus(await Notification.requestPermission());
            } catch {
              setError(
                "This browser could not request notification permission. The in-app reminder still works.",
              );
            }
          }}
        >
          Enable browser notifications
        </Button>
        <p className="source-note">
          Notification permission: {notificationStatus}. Permission is requested
          only when you press the button. These are foreground notifications,
          not server-push reminders: keep the site open. Background Web Push is
          not configured.
        </p>
      </section>
      <section className="settings-card">
        <h2>Memory & data</h2>
        <label>
          Desired retention: {Math.round(store.preferences.retention * 100)}%
          <input
            type="range"
            min=".8"
            max=".95"
            step=".01"
            value={store.preferences.retention}
            onChange={(e) =>
              store.setPreferences({ retention: Number(e.target.value) })
            }
          />
        </label>
        <label>
          New cards per day
          <input
            type="number"
            min="0"
            max="50"
            value={store.preferences.newCards}
            onChange={(e) =>
              store.setPreferences({
                newCards: Math.max(0, Math.min(50, Number(e.target.value))),
              })
            }
          />
        </label>
        <p role="status">{store.status}</p>
        <Button variant="outline" onClick={() => void store.sync()}>
          Retry cloud sync
        </Button>
        <Button variant="outline" onClick={exportData}>
          Export my progress
        </Button>
        <p className="source-note">
          On shared devices, cached data remains in browser storage after
          sign-out. Export and clear site data from your browser when finished.
          This app does not request notification permission or collect medical
          data.
        </p>
        <Button
          variant="outline"
          onClick={() =>
            void logout().catch(() =>
              setError("Could not sign out. Please try again."),
            )
          }
        >
          Sign out of Parallax
        </Button>
      </section>
    </main>
  );
}
