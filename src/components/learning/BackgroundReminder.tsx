import { useEffect, useState } from "react";
import { useLearning, useClock } from "../../hooks/useLearning";
import { dateKey } from "../../lib/learning-core";
import {
  pushEndpoint,
  pushPublicKey,
  pushRequest,
  stopBackgroundReminders,
} from "../../lib/background-reminders";
import { Button } from "../ui/button";
export function BackgroundReminderSync() {
  const store = useLearning(),
    now = useClock(),
    date = dateKey(now, store.preferences.timezone),
    met = store.records.days[date]?.goalMet;
  useEffect(() => {
    if (!pushEndpoint || !store.preferences.backgroundReminders) return;
    void pushRequest("PATCH", {
      timezone: store.preferences.timezone,
      time: store.preferences.reminderTime || "18:00",
      goalMetDate: met ? date : "",
    }).catch(() => {});
  }, [
    store.preferences.backgroundReminders,
    store.preferences.timezone,
    store.preferences.reminderTime,
    met,
    date,
  ]);
  return null;
}
export function BackgroundReminderSettings() {
  const store = useLearning(),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const available =
    !!pushEndpoint &&
    !!pushPublicKey &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;
  return (
    <section className="settings-card">
      <h2>Remind me when the app is closed</h2>
      <p>
        {available
          ? "Opt in on this browser. Uses the reminder time and timezone above. Delivery depends on browser support and the reminder service."
          : "Background reminders are not connected on this deployment. Foreground reminders remain available."}
      </p>
      <Button
        disabled={!available || busy}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          try {
            if (store.preferences.backgroundReminders) {
              await stopBackgroundReminders();
              store.setPreferences({ backgroundReminders: false });
              setMessage("Background reminders disabled for this browser.");
            } else {
              if ((await Notification.requestPermission()) !== "granted")
                throw Error("Notification permission was not granted.");
              const registration =
                await navigator.serviceWorker.register("/sw.js");
              await navigator.serviceWorker.ready;
              const raw = atob(
                pushPublicKey!.replace(/-/g, "+").replace(/_/g, "/"),
              );
              const key = Uint8Array.from(raw, (c) => c.charCodeAt(0));
              const sub =
                (await registration.pushManager.getSubscription()) ||
                (await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: key,
                }));
              const today = dateKey(Date.now(), store.preferences.timezone);
              try {
                await pushRequest("POST", {
                  subscription: sub.toJSON(),
                  timezone: store.preferences.timezone,
                  time: store.preferences.reminderTime || "18:00",
                  goalMetDate: store.records.days[today]?.goalMet ? today : "",
                });
              } catch (error) {
                await sub.unsubscribe();
                throw error;
              }
              store.setPreferences({ backgroundReminders: true });
              setMessage("Background reminders enabled.");
            }
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Could not configure reminders.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {store.preferences.backgroundReminders
          ? "Disable background reminders"
          : "Enable background reminders"}
      </Button>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
