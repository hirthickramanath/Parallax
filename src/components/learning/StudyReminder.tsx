import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useClock, useLearning } from "../../hooks/useLearning";
import { dateKey } from "../../lib/learning-core";
import { reminderDue } from "../../lib/reminders";
export function StudyReminder() {
  const store = useLearning(),
    now = useClock(),
    p = store.preferences,
    today = dateKey(now, p.timezone);
  const due = reminderDue(
    now,
    p.timezone,
    p.reminderTime || "18:00",
    !!p.remindersEnabled,
    !!store.records.days[today]?.goalMet,
    p.reminderDismissedDate,
  );
  useEffect(() => {
    if (
      !due ||
      p.lastReminderDate === today ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    )
      return;
    try {
      const notification = new Notification("A small question is waiting", {
        body: "Take a short Parallax lesson or review. Your daily goal is still ahead.",
        tag: `parallax-${today}`,
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      store.setPreferences({ lastReminderDate: today });
    } catch {
      /* The in-app reminder remains available when the platform suppresses notifications. */
    }
  }, [due, today, p.lastReminderDate]);
  if (!due) return null;
  return (
    <aside className="study-reminder" role="status">
      <div>
        <strong>Keep a little curiosity for today.</strong>
        <p>
          Your daily goal is still ahead. A short review is a good next step.
        </p>
        <Link to="/review">Open review →</Link>
      </div>
      <button
        onClick={() => store.setPreferences({ reminderDismissedDate: today })}
        aria-label="Dismiss today’s study reminder"
      >
        ×
      </button>
    </aside>
  );
}
