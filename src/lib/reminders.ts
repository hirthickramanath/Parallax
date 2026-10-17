import { dateKey } from "./learning-core.ts";
export function reminderDue(
  now: number,
  timezone: string,
  time: string,
  enabled: boolean,
  goalMet: boolean,
  dismissedDate?: string,
) {
  if (
    !enabled ||
    goalMet ||
    dismissedDate === dateKey(now, timezone) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  )
    return false;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const clock = `${parts.find((p) => p.type === "hour")!.value}:${parts.find((p) => p.type === "minute")!.value}`;
  return clock >= time;
}
