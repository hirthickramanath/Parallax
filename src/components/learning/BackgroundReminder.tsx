import { useServices } from "../../lib/services";
import { useEffect, useState } from "react";
import { useLearning, useClock } from "../../hooks/useLearning";
import { dateKey } from "../../lib/learning-core";
import {
  pushRequest,
  stopBackgroundReminders,
  subscriptionId,
} from "../../lib/background-reminders";
import { Button } from "../ui/button";
export function BackgroundReminderSync() {
  const { pushUrl: pushEndpoint } = useServices();
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
    pushEndpoint,
    store.preferences.backgroundReminders,
    store.preferences.timezone,
    store.preferences.reminderTime,
    met,
    date,
  ]);
  return null;
}
export function BackgroundReminderSettings() {
  const { pushUrl: pushEndpoint, pushPublicKey } = useServices();
  const store = useLearning(),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const available =
    !!pushEndpoint &&
    !!pushPublicKey &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;
  useEffect(() => {
    if (!store.preferences.backgroundReminders || !available) return;
    let cancelled = false;
    void navigator.serviceWorker
      .getRegistration()
      .then((r) => r?.pushManager.getSubscription())
      .then((sub) => {
        if (!cancelled && (!sub || Notification.permission !== "granted")) {
          store.setPreferences({ backgroundReminders: false });
          setMessage("Reminders need to be enabled again on this browser.");
        }
      })
      .catch(() => {
        if (!cancelled)
          setMessage(
            "Could not check this browser’s subscription. Try enabling reminders again.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [available, store.uid, store.preferences.backgroundReminders]);
  return (
    <section className="settings-card">
      <h2>Remind me when the app is closed</h2>
      <p>
        {available
          ? "Opt in on this browser. Uses the reminder time and timezone above. Delivery depends on browser support and the reminder service."
          : "Background reminders are not connected on this deployment. Foreground reminders remain available."}
      </p>
      <p className="source-note">
        On iPhone or iPad, add Parallax to the Home Screen and open it there
        before enabling notifications. Notifications require your permission on
        each browser.
      </p>
      <Button
        disabled={
          (!available && !store.preferences.backgroundReminders) || busy
        }
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
              await navigator.serviceWorker.register("/sw.js");
              let timer: ReturnType<typeof setTimeout>;
              const registration = await Promise.race([
                navigator.serviceWorker.ready,
                new Promise<ServiceWorkerRegistration>((_, reject) => {
                  timer = setTimeout(
                    () =>
                      reject(
                        Error(
                          "Notification setup timed out. Refresh and try again.",
                        ),
                      ),
                    12000,
                  );
                }),
              ]).finally(() => clearTimeout(timer));
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
      {available && store.preferences.backgroundReminders && (
        <Button
          variant="outline"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setMessage("");
            try {
              const registration =
                await navigator.serviceWorker.getRegistration();
              const sub = await registration?.pushManager.getSubscription();
              if (!sub)
                throw Error(
                  "Re-enable reminders for this browser before sending a test.",
                );
              await pushRequest(
                "POST",
                { id: await subscriptionId(sub.endpoint) },
                "/test",
              );
              setMessage(
                "Test reminder accepted by the push service. Check this device; browser delivery can be delayed.",
              );
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Test reminder failed.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          Send a test notification
        </Button>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
