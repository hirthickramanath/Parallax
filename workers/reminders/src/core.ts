export function allowedPushEndpoint(endpoint: string) {
  try {
    const u = new URL(endpoint);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      (!u.port || u.port === "443") &&
      ([
        "fcm.googleapis.com",
        "updates.push.services.mozilla.com",
        "web.push.apple.com",
      ].includes(u.hostname) ||
        u.hostname.endsWith(".notify.windows.com"))
    );
  } catch {
    return false;
  }
}
export function reminderDate(timezone: string, time: string, now = Date.now()) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    throw Error("Invalid reminder time");
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const field = (type: string) => parts.find((p) => p.type === type)!.value;
  const date = `${field("year")}-${field("month")}-${field("day")}`;
  const minutes = Number(field("hour")) * 60 + Number(field("minute")),
    target = Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  if (minutes < target && minutes + 1440 - target < 30) {
    const previous = new Date(date + "T12:00:00Z");
    previous.setUTCDate(previous.getUTCDate() - 1);
    return { date: previous.toISOString().slice(0, 10), due: true };
  }
  return { date, due: minutes >= target && minutes - target < 30 };
}
