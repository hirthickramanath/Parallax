import { assessmentLessonIds } from "../../../src/lib/assessment-support.ts";
export interface Item {
  id: string;
  prompt: string;
  unit: string;
  answer: number;
  exact?: boolean;
}
export const VERSION = "foundation-2026-10-v2";
export const supported = assessmentLessonIds;
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
    if (lessonId === "PB2.1") {
      if (i % 3 === 0)
        return {
          id,
          prompt: `A stationary uniform liquid has density ${100 * x} kg/m³ and depth ${y} m. With g=10 m/s² find gauge pressure.`,
          unit: "Pa",
          answer: 1000 * x * y,
        };
      if (i % 3 === 1)
        return {
          id,
          prompt: `A body displaces ${x} litres of uniform water (density 1000 kg/m³). Use g=10 m/s²; find buoyant force.`,
          unit: "N",
          answer: 10 * x,
        };
      return {
        id,
        prompt: `Steady incompressible flow enters area ${x} cm² at ${y} m/s and exits area ${x / 2} cm². Find exit speed.`,
        unit: "m/s",
        answer: 2 * y,
      };
    }
    if (lessonId === "PB2.2") {
      if (i % 3 === 0)
        return {
          id,
          prompt: `${x} mol of monatomic ideal gas is heated by ${y} K at fixed volume. Use R=8.314 J/(mol K). Find heat supplied.`,
          unit: "J",
          answer: 1.5 * x * 8.314 * y,
        };
      if (i % 3 === 1)
        return {
          id,
          prompt: `A gas absorbs ${100 * x} J of heat and does ${10 * y} J of work. Find its internal-energy change.`,
          unit: "J",
          answer: 100 * x - 10 * y,
        };
      return {
        id,
        prompt: `A reservoir at constant ${100 * x} K absorbs ${1000 * y} J reversibly. Find entropy change.`,
        unit: "J/K",
        answer: (10 * y) / x,
      };
    }
    if (lessonId === "MB2.2") {
      const a = x + y;
      if (i % 3 === 0)
        return {
          id,
          prompt: `An ellipse has semimajor axis ${a} AU and eccentricity 0.5. Find periapsis from the focus.`,
          unit: "AU",
          answer: 0.5 * a,
        };
      if (i % 3 === 1)
        return {
          id,
          prompt: `An ellipse has semimajor axis ${a} AU and eccentricity 0.5. Find apoapsis from the focus.`,
          unit: "AU",
          answer: 1.5 * a,
        };
      return {
        id,
        prompt: `An ellipse has focal distance c=${x} and semiminor axis b=${y}. Find the positive semimajor axis.`,
        unit: "same length units",
        answer: Math.hypot(x, y),
      };
    }
    if (lessonId === "MB4.3") {
      if (i % 3 === 0)
        return {
          id,
          prompt: `P(A intersection B)=${x / 100} and P(B)=${(x + y) / 100}. Find P(A given B) as a decimal.`,
          unit: "probability",
          answer: x / (x + y),
        };
      if (i % 3 === 1)
        return {
          id,
          prompt: `A population of 1000 has condition prevalence ${x} percent and test sensitivity 80 percent. Find expected true-positive count.`,
          unit: "expected count",
          answer: 8 * x,
        };
      const prior = x / 100,
        fp = y / 100;
      return {
        id,
        prompt: `Condition prevalence is ${x} percent, sensitivity 80 percent and false-positive probability ${y} percent. Find P(condition given positive) as a decimal.`,
        unit: "probability",
        answer: (0.8 * prior) / (0.8 * prior + fp * (1 - prior)),
      };
    }
    if (lessonId === "AS1.5") {
      if (i % 2 === 0)
        return {
          id,
          prompt: `For the same point source and small probe separation, distance increases by a factor of ${y}. Find new/old leading tidal strength.`,
          unit: "dimensionless",
          answer: 1 / y ** 3,
        };
      return {
        id,
        prompt: `Use radial differential acceleration 2 GM l/r³ with GM=100000000 m³/s², l=${y} m and r=${1000 * x} m. Find the leading differential acceleration magnitude.`,
        unit: "m/s²",
        answer: (2e8 * y) / (1000 * x) ** 3,
      };
    }
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
