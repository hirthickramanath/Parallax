import { auth } from "./firebase";
import { loadServices } from "./services";
export async function pushRequest(
  method: string,
  body?: object,
  path = "/subscription",
) {
  const { pushUrl: pushEndpoint } = await loadServices();
  if (!pushEndpoint) throw Error("Background reminders are not connected");
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw Error("Sign in again");
  const result = await fetch(`${pushEndpoint.replace(/\/$/, "")}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  const data = await result.json();
  if (!result.ok) throw Error(data.error || "Reminder service unavailable");
  return data;
}
export async function subscriptionId(endpoint: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(endpoint)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function stopBackgroundReminders() {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration();
  const sub = await registration?.pushManager?.getSubscription();
  if (!sub) return;
  try {
    await pushRequest("DELETE", { id: await subscriptionId(sub.endpoint) });
  } catch {
    // Local unsubscribe must still work if the server is unavailable. The
    // registry removes the invalid endpoint on its next delivery attempt.
  }
  await sub.unsubscribe();
}
