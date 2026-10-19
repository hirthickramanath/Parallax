export interface Item {
  id: string;
  prompt: string;
  unit: string;
  answer: number;
  exact?: boolean;
}
export const VERSION = "foundation-2026-10-v1";
export const supported = ["PB1.1", "PB1.2", "PB1.3", "PB1.4", "MB2.3", "AS1.3"];
/** New numerical instances generated on the server, never taken from a submitted score. */
export function assessmentItems(
  lessonId: string,
  random: () => number = Math.random,
): Item[] {
  if (!supported.includes(lessonId)) throw Error("Unsupported lesson");
  const integer = (min: number, max: number) =>
    min +
    Math.floor(Math.max(0, Math.min(0.999999, random())) * (max - min + 1));
  return Array.from({ length: 5 }, (_, i) => {
    const x = integer(2, 9),
      y = integer(2, 8),
      id = `q${i + 1}`;
    if (lessonId === "PB1.1") {
      if (i % 3 === 0)
        return {
          id,
          prompt: `A mass of ${x} kg experiences a net force of ${x * y} N. Find its acceleration.`,
          unit: "m/s²",
          answer: y,
        };
      if (i % 3 === 1)
        return {
          id,
          prompt: `Starting from rest, an object accelerates at ${x} m/s² for ${y} seconds. Find its speed.`,
          unit: "m/s",
          answer: x * y,
        };
      return {
        id,
        prompt: `A constant acceleration changes speed from ${x} m/s to ${x + y * 2} m/s in 2 seconds. Find acceleration.`,
        unit: "m/s²",
        answer: y,
      };
    }
    if (lessonId === "PB1.2") {
      if (i % 2 === 0)
        return {
          id,
          prompt: `A constant ${x} N force acts along a displacement of ${y} m. Find work.`,
          unit: "J",
          answer: x * y,
        };
      return {
        id,
        prompt: `A ${x} kg body has speed ${y} m/s. Find kinetic energy.`,
        unit: "J",
        answer: 0.5 * x * y * y,
      };
    }
    if (lessonId === "PB1.3") {
      if (i % 2 === 0)
        return {
          id,
          prompt: `A wheel rolls without slip with radius ${x} m and angular speed ${y} rad/s. Find centre speed.`,
          unit: "m/s",
          answer: x * y,
        };
      return {
        id,
        prompt: `A body has moment of inertia ${x} kg m² and angular speed ${y} rad/s. Find rotational kinetic energy.`,
        unit: "J",
        answer: 0.5 * x * y * y,
      };
    }
    if (lessonId === "MB2.3") {
      if (i % 2 === 0)
        return {
          id,
          prompt: `For vectors A=(${x},1,0), B=(1,${y},0), find A dot B.`,
          unit: "dimensionless",
          answer: x + y,
        };
      return {
        id,
        prompt: `For A=(${x},0,0), B=(0,${y},0), find the z component of A cross B.`,
        unit: "dimensionless",
        answer: x * y,
      };
    }
    if (lessonId === "PB1.4") {
      if (i % 2 === 0)
        return {
          id,
          prompt: `An ideal small-angle pendulum has length ${x * x} m. Use g=pi² m/s². Find its period.`,
          unit: "s",
          answer: 2 * x,
        };
      return {
        id,
        prompt: `For equal g and small amplitudes, a second pendulum is ${x * x} times as long as the first. Find the period ratio T2/T1.`,
        unit: "dimensionless",
        answer: x,
      };
    }
    if (i % 2 === 0)
      return {
        id,
        prompt: `For a circular orbit with gravitational parameter mu=${x * x * y} and radius r=${y}, find speed using v=sqrt(mu/r).`,
        unit: "consistent model units",
        answer: x,
      };
    return {
      id,
      prompt: `At radius ${y}, a circular orbit has speed ${x}. Find escape speed at that radius for the same point-mass Newtonian potential.`,
      unit: "same speed units",
      answer: Math.SQRT2 * x,
    };
  });
}
export function gradeItem(response: string, item: Item) {
  if (typeof response !== "string" || !response.trim() || response.length > 100)
    return false;
  const value = Number(response);
  if (!Number.isFinite(value)) return false;
  return item.exact
    ? value === item.answer
    : Math.abs(value - item.answer) <=
        Math.max(1e-6, 0.02 * Math.abs(item.answer));
}
