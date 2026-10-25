import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { signedIn } from "./helpers";
async function openSimulation(page: Page, name: string) {
  const lessons: Record<string, string> = {
    "Pendulum & gravity": "PB1.4",
    "Orbit explorer": "AS1.3",
    "Circuit bench": "PB4.2",
    "Gas piston": "PB2.2",
    "Standing waves": "PB3.1",
    "Double slit": "PB3.3",
    "Radiation bench": "AS2.3",
    "Spherical field": "PH4.1",
    "Coupled oscillators": "PH2.7",
    "Heat flow and waves": "MA5.4",
  };
  await page.goto(`/lesson/${lessons[name]}`);
  await expect(
    page.getByRole("complementary", { name: "Lesson simulation" }),
  ).toBeVisible();
  await expect(page.locator(".app-sidebar")).toHaveCount(0);
}
test("signed-out app pages require a session", async ({ page }) => {
  await page.goto("/labs");
  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
});
test("all workspace screens, apparatus and themes work at phone and desktop widths", async ({
  page,
}) => {
  await signedIn(page);
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/dashboard",
      "/learn",
      "/labs",
      "/projects",
      "/review",
      "/revise",
      "/plan",
      "/stats",
      "/settings",
      "/placement",
      "/revision-plan",
    ]) {
      await page.goto(route);
      await expect(page.locator("main h1").first()).toBeVisible();
      if (route === "/dashboard")
        await page.screenshot({
          path: `/tmp/parallax-release-${width}.png`,
          fullPage: true,
        });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
    await openSimulation(page, "Pendulum & gravity");
    await page
      .getByRole("button", { name: "Record synthetic 10-cycle timing" })
      .click();
    await expect(page.getByRole("table")).toBeVisible();
    await openSimulation(page, "Orbit explorer");
    await page.getByRole("button", { name: "Escape boundary" }).click();
    await expect(page.getByText("Parabola", { exact: true })).toBeVisible();
  }
  await page.goto("/settings");
  const mode = page.getByRole("switch", { name: "Dark mode" });
  await mode.click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(mode).toHaveAttribute("aria-checked", "true");
  await mode.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
test("lesson prediction, equations, checks, notes, completion, recap and FSRS work locally", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PB1.1");
  await expect(
    page.getByRole("heading", { name: "Kinematics and Newton’s laws" }),
  ).toBeVisible();
  await page.getByLabel("Lesson section").selectOption("theory");
  await expect(
    page.getByRole("heading", { name: "Predict before the reveal" }),
  ).toBeVisible();
  await page
    .getByLabel("Your prediction", { exact: true })
    .fill("The masses fall together in vacuum.");
  await page.getByRole("button", { name: "Commit and investigate" }).click();
  await page.getByLabel("Lesson section").selectOption("theory");
  await page.getByRole("button", { name: "Show full theory" }).click();
  await expect(page.locator(".lesson-prose .katex").first()).toBeVisible();
  expect(await page.locator(".katex-error").count()).toBe(0);
  await page
    .getByLabel("Your lab notebook")
    .fill("Weight and inertia both scale with mass.");
  await page.getByLabel("Lesson section").selectOption("check");
  const questions = page.locator(".question-card");
  await questions
    .nth(0)
    .getByLabel("Weight and inertia scale together", { exact: true })
    .check();
  await questions.nth(0).getByRole("button", { name: "Check answer" }).click();
  await expect(questions.nth(0).getByRole("status")).toContainText(
    "That’s right",
  );
  await page.reload();
  await expect(page.getByLabel("Your lab notebook")).toHaveValue(
    "Weight and inertia both scale with mass.",
  );
  await page.getByLabel("Lesson section").selectOption("connections");
  await page.getByRole("button", { name: "Finish reading" }).click();
  await expect(
    page.getByRole("heading", { name: "Keep the question alive." }),
  ).toBeVisible();
  const before = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!)
        .records.days,
  );
  await page.goto("/lesson/PB1.1");
  await page.getByLabel("Lesson section").selectOption("connections");
  await page.getByRole("button", { name: "Finish reading" }).click();
  const after = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!)
        .records.days,
  );
  expect(
    Object.values(after).reduce(
      (n: number, d) => n + (d as { xp: number }).xp,
      0,
    ),
  ).toBe(
    Object.values(before).reduce(
      (n: number, d) => n + (d as { xp: number }).xp,
      0,
    ),
  );
  await page.goto("/dashboard");
  await expect(
    page.getByText("Your 30-second recap", { exact: false }),
  ).toBeVisible();
  await page.goto("/review");
  await expect(
    page.getByRole("button", { name: "Reveal answer" }),
  ).toBeVisible();
  for (
    let i = 0;
    i < 10 &&
    (await page.getByRole("button", { name: "Reveal answer" }).count());
    i++
  ) {
    await page.getByRole("button", { name: "Reveal answer" }).click();
    await page.getByRole("button", { name: "Good", exact: true }).click();
  }
  await expect(
    page.getByText("Session complete.", { exact: true }),
  ).toBeVisible();
});
const authoredByUnit: Record<string, string[]> = {};
for (const file of readdirSync("content/lessons").filter((f) =>
  f.endsWith(".mdx"),
)) {
  const id = file.slice(0, -4);
  (authoredByUnit[id.split(".")[0]] ||= []).push(id);
}
test.describe("all authored MDX drafts render their full theory and maths", () => {
  for (const [unit, ids] of Object.entries(authoredByUnit)) {
    test(`${unit} has no parse, runtime or KaTeX failures`, async ({
      page,
    }) => {
      const runtimeErrors: string[] = [];
      page.on("pageerror", (error) => runtimeErrors.push(error.message));
      await signedIn(page);
      for (const id of ids)
        await test.step(id, async () => {
          await page.goto(`/lesson/${id}`);
          await page.getByLabel("Lesson section").selectOption("puzzle");
          await page
            .getByLabel("Your prediction", { exact: true })
            .fill("I will test the assumptions before accepting the result.");
          await page
            .getByRole("button", { name: "Commit and investigate" })
            .click();
          await page.getByLabel("Lesson section").selectOption("theory");
          await page.getByRole("button", { name: "Show full theory" }).click();
          await expect(
            page.locator(".lesson-prose .katex").first(),
          ).toBeVisible();
          expect(await page.locator(".katex-error").count()).toBe(0);
          await page.getByLabel("Lesson section").selectOption("interactive");
          await expect(page.locator(".lesson-prose").first()).toBeVisible();
          expect(runtimeErrors).toEqual([]);
        });
    });
  }
});
test("cached lesson survives an offline reload and saves local notes", async ({
  page,
  context,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PB1.1");
  await page.getByLabel("Your lab notebook").fill("Offline observation");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(page.getByLabel("Your lab notebook")).toHaveValue(
    "Offline observation",
  );
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByLabel("Your lab notebook")).toHaveValue(
    "Offline observation",
  );
  await page.getByLabel("Your lab notebook").fill("Saved while offline");
  await page.reload();
  await expect(page.getByLabel("Your lab notebook")).toHaveValue(
    "Saved while offline",
  );
  await context.setOffline(false);
});
test("different account cannot see previous account local notebook", async ({
  page,
}) => {
  await signedIn(page, "user-a");
  await page.goto("/lesson/PB1.1");
  await page.getByLabel("Your lab notebook").fill("Account A private note");
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL("/login");
  await signedIn(page, "user-b");
  await page.goto("/lesson/PB1.1");
  await expect(page.getByLabel("Your lab notebook")).toHaveValue("");
});
test("bridge skip credit needs 80% and is stored in the agreed unit record", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/placement?unit=PB1");
  for (const [i, answer] of [
    "3",
    "9",
    "Yes, velocity can be constant",
    "Velocity direction",
    "Their weights are equal",
  ].entries()) {
    if (i < 2) await page.getByRole("spinbutton").fill(answer);
    else await page.getByLabel(answer, { exact: true }).check();
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: i === 4 ? "Finish diagnostic" : "Next question",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByText("Skip credit saved.", { exact: false }),
  ).toBeVisible();
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!),
  );
  expect(data.records.units.PB1.skipTestScore).toBe(0.8);
  expect(data.records.units.PB1.skippedWithCredit).toBe(true);
});
test("two tabs merge local notebook edits without crossing accounts", async ({
  page,
  context,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PB1.1");
  const other = await context.newPage();
  await signedIn(other);
  await other.goto("/lesson/PB1.1");
  await page
    .getByLabel("Your lab notebook")
    .fill("Shared observation between my own tabs");
  await expect(other.getByLabel("Your lab notebook")).toHaveValue(
    "Shared observation between my own tabs",
  );
  await other.close();
});

test("focused revision schedules recall and records the completed session", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/revise");
  await page
    .getByRole("button", { name: "Start focused revision" })
    .first()
    .click();
  await page.getByRole("button", { name: "Try to recall it" }).click();
  await page.getByRole("button", { name: "Reveal after recalling" }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();
  for (
    let i = 0;
    i < 5 &&
    (await page.getByRole("button", { name: "Next retrieval" }).count());
    i++
  ) {
    await page.getByRole("button", { name: "Next retrieval" }).click();
    await page.getByRole("button", { name: "Reveal after recalling" }).click();
    await page.getByRole("button", { name: "Good", exact: true }).click();
  }
  await page.getByRole("button", { name: "Check prerequisites" }).click();
  await page.getByRole("button", { name: "Explain why" }).click();
  await page.locator(".question-card input[type=radio]").first().check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.getByRole("button", { name: "Try the transfer problem" }).click();
  if (await page.locator(".question-card input[type=radio]").count())
    await page.locator(".question-card input[type=radio]").first().check();
  else await page.locator(".question-card input[type=number]").fill("1");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.getByRole("button", { name: "Finish revision" }).click();
  await expect(
    page.getByRole("heading", { name: "A clearer perspective." }),
  ).toBeVisible();
  const records = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!)
        .records,
  );
  expect(
    Object.values(records.revisionSessions).some(
      (session) => (session as { finishedAt: number }).finishedAt > 0,
    ),
  ).toBeTruthy();
  expect(Object.keys(records.reviewLog).length).toBeGreaterThanOrEqual(3);
  expect(Object.keys(records.reviewLog).length).toBeLessThanOrEqual(5);
  expect(
    new Set(
      Object.values(records.reviewLog).map(
        (log) => (log as { cardId: string }).cardId,
      ),
    ).size,
  ).toBe(Object.keys(records.reviewLog).length);
  await page.goto("/stats");
  await expect(page.locator(".retention-curve")).toBeVisible();
  expect(
    await page.locator(".retention-curve path").last().getAttribute("d"),
  ).not.toContain("NaN");
});

test("exam-date planning saves a real local schedule and opens its concept revision", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/revision-plan");
  const target = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  await page.getByLabel("Exam date").fill(target);
  await page.getByLabel("Units to revise").selectOption(["PB1"]);
  await page.getByRole("button", { name: "Create revision schedule" }).click();
  await expect(
    page.locator(".revision-schedule article").first(),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.locator(".revision-schedule article").first(),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Open focused revision →" })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Try to recall it" }),
  ).toBeVisible();
});
test("resistor apparatus changes topology and keeps measurements tied to one load", async ({
  page,
}) => {
  await signedIn(page);
  await openSimulation(page, "Pendulum & gravity");
  await openSimulation(page, "Circuit bench");
  await page
    .getByRole("button", { name: "Parallel load", exact: true })
    .click();
  await expect(page.getByText("66.67 Ω", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Record synthetic meter reading" })
    .click();
  await expect(
    page.getByRole("cell", { name: "90.00", exact: true }),
  ).toBeVisible();
  await page.getByLabel("First resistance", { exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("table")).toHaveCount(0);
});
test("saved tutor messages restore per account even with live tutoring disabled", async ({
  page,
}) => {
  await page.route("**/services.json", (r) =>
    r.fulfill({ json: { tutorUrl: "", pushUrl: "", pushPublicKey: "" } }),
  );
  await signedIn(page);
  await page.evaluate(() =>
    localStorage.setItem(
      "parallax-chat-v1:test-learner:PB1.1",
      JSON.stringify({
        messages: [
          {
            id: "saved-question",
            lessonId: "PB1.1",
            role: "user",
            content: "Why does mass cancel?",
            createdAt: 1,
          },
          {
            id: "saved-reply",
            lessonId: "PB1.1",
            role: "assistant",
            content: "Both force and inertia scale with mass in this model.",
            createdAt: 2,
          },
        ],
        pending: [],
      }),
    ),
  );
  await page.goto("/lesson/PB1.1");
  await page
    .getByRole("button", {
      name: "Saved tutor conversations (live tutor unavailable)",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Why does mass cancel?", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", {
      name: "Saved tutor conversations (live tutor unavailable)",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Both force and inertia scale with mass in this model.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ask tutor", exact: true }),
  ).toBeDisabled();
});

test("foreground study reminders are opt-in and dismiss for the day without requesting permission", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/settings");
  await page.getByLabel("Reminder time", { exact: true }).fill("00:00");
  await expect(page.locator(".study-reminder")).toHaveCount(0);
  await page
    .getByLabel("Enable a reminder while Parallax is open", { exact: true })
    .check();
  await expect(page.locator(".study-reminder")).toBeVisible();
  await page
    .getByRole("button", { name: "Dismiss today’s study reminder" })
    .click();
  await expect(page.locator(".study-reminder")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".study-reminder")).toHaveCount(0);
});

test("weekly planning persists only authored unlocked lessons grouped by track", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/plan");
  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator(".plan-list article")).toHaveCount(7);
  const plan = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!)
        .records.plan.current,
  );
  const ids = Object.values(plan.items).flat();
  expect(new Set(ids).size).toBe(ids.length);
  expect(new Set(ids)).toEqual(
    new Set(["PB1.1", "PB2.1", "PB3.1", "PB4.1", "MB1.1", "MB2.1", "CB.1"]),
  );
  await page.reload();
  await expect(page.locator(".plan-list article")).toHaveCount(7);
});

test("gas, wave and interference benches expose model controls and reproducible readings", async ({
  page,
}) => {
  await signedIn(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await openSimulation(page, "Pendulum & gravity");
  await openSimulation(page, "Gas piston");
  await page.getByLabel("Gas volume ratio", { exact: true }).fill("2");
  await expect(page.getByText(/Temperature: 300.0 K/)).toBeVisible();
  await page
    .getByRole("button", { name: "Record gas reading", exact: true })
    .click();
  await expect(page.getByRole("table")).toBeVisible();
  await page
    .getByLabel("Thermodynamic path", { exact: true })
    .selectOption("adiabatic");
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(page.getByText(/Q = 0.0 J/)).toBeVisible();
  await expect(page.getByText(/Temperature: 189.0 K/)).toBeVisible();
  await openSimulation(page, "Standing waves");
  await page
    .getByRole("slider", { name: "String harmonic", exact: true })
    .fill("2");
  await expect(
    page.getByText("Node positions (m): 0.000, 0.500, 1.000"),
  ).toBeVisible();
  await page.getByLabel("String phase", { exact: true }).fill("0");
  await expect(
    page.getByRole("img", {
      name: "Standing string harmonic 2 with 3 fixed nodes",
    }),
  ).toBeVisible();
  await openSimulation(page, "Double slit");
  await expect(
    page.getByText(/Predicted small-angle fringe spacing: 2.000 mm/),
  ).toBeVisible();
  await page.getByLabel("Slit separation", { exact: true }).fill("1");
  await expect(
    page.getByText(/Predicted small-angle fringe spacing: 1.000 mm/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Record slit reading", exact: true })
    .click();
  await expect(page.getByRole("table")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await expect(
    page.getByRole("complementary", { name: "Lesson simulation" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/PB3.3/);
});

test("foundation projects expose methods, rubrics and existing lesson notebooks without awarding credit", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/projects");
  await page.getByLabel("Project unit").selectOption("PB2");
  await expect(
    page.getByRole("heading", { name: "Audit a gas expansion" }),
  ).toBeVisible();
  await expect(
    page.getByText("Three p–V paths and an energy table."),
  ).toBeVisible();
  await page
    .getByText("Reveal the consistency checkpoint", { exact: true })
    .click();
  await expect(
    page.getByText(/Adiabatic doubling cools to about 189 K/),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Project unit")).toBeVisible();
  const records = await page.evaluate(() => {
    const raw = localStorage.getItem("parallax-learning-v1:test-learner");
    // A read-only project visit need not create a learning record at all.
    return raw ? JSON.parse(raw).records : { days: {}, lessons: {} };
  });
  expect(Object.keys(records.days)).toHaveLength(0);
  expect(Object.keys(records.lessons)).toHaveLength(0);
  await page.getByLabel("Project unit").selectOption("PB2");
  await page
    .getByRole("link", { name: "Lesson PB2.2 and its notebook →" })
    .click();
  await expect(page).toHaveURL(/lesson\/PB2.2/);
});

test("real-analysis exact index answer rejects a nearby integer before accepting the derived threshold", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/MA1.3");
  await page.getByLabel("Lesson section").selectOption("puzzle");
  await page
    .getByLabel("Your prediction", { exact: true })
    .fill(
      "The threshold must satisfy a strict inequality for every later term.",
    );
  await page.getByRole("button", { name: "Commit and investigate" }).click();
  await page.getByLabel("Lesson section").selectOption("problems");
  const question = page.locator('[data-question-id="warmup"]');
  await question.getByRole("spinbutton").fill("100");
  await question.getByRole("button", { name: "Check answer" }).click();
  await expect(question.getByRole("status")).toContainText("Not quite");
  await question.getByRole("spinbutton").fill("101");
  await question.getByRole("button", { name: "Check answer" }).click();
  await expect(question.getByRole("status")).toContainText("That’s right");
});

test("radiation apparatus separates extinction, emission and radial Doppler interpretations", async ({
  page,
}) => {
  await signedIn(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await openSimulation(page, "Pendulum & gravity");
  await openSimulation(page, "Radiation bench");
  await expect(page.getByText(/Output: 6.000/)).toBeVisible();
  await page
    .getByRole("button", { name: "Record slab reading", exact: true })
    .click();
  await page.getByLabel("Slab source function", { exact: true }).fill("20");
  await expect(page.getByText(/Output: 15.000/)).toBeVisible();
  await page
    .getByRole("button", { name: "Record slab reading", exact: true })
    .click();
  await expect(page.getByRole("table").getByRole("row")).toHaveCount(3);
  await page.getByLabel("Slab optical depth", { exact: true }).fill("");
  await expect(page.getByRole("alert")).toHaveText(
    "Enter a finite optical depth from 0 to 10.",
  );
  await page.getByLabel("Slab optical depth", { exact: true }).fill("0");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await expect(page.getByText(/Output: 10.000/)).toBeVisible();
  await page
    .getByRole("button", { name: "Doppler markers", exact: true })
    .click();
  await expect(page.getByText(/Observed wavelength: 1000.00 nm/)).toBeVisible();
  await page.getByLabel("Radial speed beta", { exact: true }).fill("0");
  await expect(page.getByText(/Observed wavelength: 500.00 nm/)).toBeVisible();
  await page.getByLabel("Radial speed beta", { exact: true }).fill("-0.6");
  await expect(page.getByText(/Observed wavelength: 250.00 nm/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await expect(page).toHaveURL(/lesson\/AS2.3/);
  await page
    .getByRole("link", { name: "Study Doppler shift and redshift →" })
    .click();
  await expect(page).toHaveURL(/lesson\/AS2.4/);
});

test("spherical apparatus distinguishes volume charge, conductor interior and an undefined ideal sheet value", async ({
  page,
}) => {
  await signedIn(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await openSimulation(page, "Pendulum & gravity");
  await openSimulation(page, "Spherical field");
  await expect(page.getByText(/Radial field: 0.1250/)).toBeVisible();
  await page
    .getByRole("button", { name: "Record spherical reading", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Conducting shell", exact: true })
    .click();
  await expect(page.getByText(/Radial field: 0.0000/)).toBeVisible();
  await page.getByLabel("Field probe radius", { exact: true }).fill("2");
  await expect(
    page.getByText(/field has no single assigned value/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Record spherical reading", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Field probe radius", { exact: true }).fill("4");
  await expect(page.getByText(/Radial field: 0.0625/)).toBeVisible();
  await page.getByLabel("Total sphere charge", { exact: true }).fill("-1");
  await expect(page.getByText(/Radial field: -0.0625/)).toBeVisible();
  await page
    .getByRole("button", { name: "Record spherical reading", exact: true })
    .click();
  await expect(page.getByRole("table").getByRole("row")).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await expect(
    page.getByRole("complementary", { name: "Lesson simulation" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/lesson\/PH4.1/);
});

test("coupled oscillator bench exposes normal modes, conserved energy and traceable readings on mobile", async ({
  page,
}) => {
  await signedIn(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await openSimulation(page, "Pendulum & gravity");
  await openSimulation(page, "Coupled oscillators");
  await page.getByRole("button", { name: "In phase", exact: true }).click();
  await expect(
    page.getByLabel("Total oscillator energy", { exact: true }),
  ).toHaveText("0.0400");
  await page.getByLabel("Time (s)", { exact: true }).fill("7");
  await expect(
    page.getByLabel("Total oscillator energy", { exact: true }),
  ).toHaveText("0.0400");
  await page
    .getByRole("button", { name: "Opposite phase", exact: true })
    .click();
  await expect(
    page.getByLabel("Total oscillator energy", { exact: true }),
  ).toHaveText("0.1200");
  await page.getByRole("button", { name: "Record oscillator reading" }).click();
  await expect(
    page
      .getByRole("list", { name: "Oscillator readings" })
      .getByRole("listitem"),
  ).toHaveCount(1);
  await page
    .getByRole("button", { name: "One mass released", exact: true })
    .click();
  await page.getByLabel("Coupling stiffness (N/m)", { exact: true }).fill("0");
  await page.getByLabel("Time (s)", { exact: true }).fill("7");
  await expect(page.getByText(/x₂ = 0.0000 m/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await expect(
    page.getByRole("complementary", { name: "Lesson simulation" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/lesson\/PH2.7/);
});

test("Fourier evolution bench distinguishes heat decay from conserved wave energy on mobile", async ({
  page,
}) => {
  await signedIn(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await openSimulation(page, "Pendulum & gravity");
  await openSimulation(page, "Heat flow and waves");
  await page
    .getByLabel("PDE initial shape", { exact: true })
    .selectOption("First mode");
  const initial = Number(
    await page.getByLabel("PDE squared norm", { exact: true }).textContent(),
  );
  expect(initial).toBeCloseTo(Math.PI / 2, 5);
  await page.getByLabel("PDE time", { exact: true }).fill("1");
  expect(
    Number(
      await page.getByLabel("PDE squared norm", { exact: true }).textContent(),
    ),
  ).toBeCloseTo((Math.PI / 2) * Math.exp(-2), 5);
  await page.getByRole("button", { name: "Record PDE reading" }).click();
  await page.getByRole("button", { name: "Wave motion", exact: true }).click();
  const energy = await page
    .getByLabel("PDE wave energy", { exact: true })
    .textContent();
  await page.getByLabel("PDE time", { exact: true }).fill("1.5");
  await expect(page.getByLabel("PDE wave energy", { exact: true })).toHaveText(
    energy!,
  );
  expect(
    Number(
      await page.getByLabel("PDE squared norm", { exact: true }).textContent(),
    ),
  ).toBeLessThan(0.01);
  await page
    .getByLabel("PDE initial shape", { exact: true })
    .selectOption("Third mode");
  await expect(page.getByRole("table").getByRole("row").nth(3)).toContainText(
    "3.000",
  );
  await page.getByRole("button", { name: "Record PDE reading" }).click();
  await expect(
    page.getByRole("list", { name: "PDE readings" }).getByRole("listitem"),
  ).toHaveCount(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await expect(
    page.getByRole("complementary", { name: "Lesson simulation" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/lesson\/MA5.4/);
});

test("complex branch explorer tracks monodromy and excludes its principal cut on mobile", async ({
  page,
}) => {
  await signedIn(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/lesson/MA6.6");
  await page.getByLabel("Lesson section").selectOption("puzzle");
  await page
    .getByLabel("Your prediction", { exact: true })
    .fill(
      "The continued root changes sign around zero, while the principal value uses its branch convention.",
    );
  await page.getByRole("button", { name: "Commit and investigate" }).click();
  await page.getByLabel("Lesson section").selectOption("interactive");
  await expect(
    page.getByLabel("Continued square root", { exact: true }),
  ).toHaveText("1.000 + 0.000i");
  await page.getByRole("button", { name: "180°", exact: true }).click();
  await expect(
    page.getByLabel("Principal square root", { exact: true }),
  ).toHaveText("Undefined on the chosen cut");
  await expect(
    page.getByLabel("Continued square root", { exact: true }),
  ).toHaveText("0.000 + 1.000i");
  await page.getByRole("button", { name: "360°", exact: true }).click();
  await expect(
    page.getByLabel("Continued square root", { exact: true }),
  ).toHaveText("-1.000 + 0.000i");
  await expect(
    page.getByLabel("Principal square root", { exact: true }),
  ).toHaveText("1.000 + 0.000i");
  await page.getByRole("button", { name: "720°", exact: true }).click();
  await expect(
    page.getByLabel("Continued square root", { exact: true }),
  ).toHaveText("1.000 + 0.000i");
  await expect(
    page.getByText(/Continued logarithm imaginary part: 4.000π/),
  ).toBeVisible();
  await page.getByLabel("Complex path angle", { exact: true }).fill("270");
  await expect(
    page.getByLabel("Principal square root", { exact: true }),
  ).toContainText("− 0.707i");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test("Legendre explorer distinguishes polynomial and spherical normalization on mobile", async ({
  page,
}) => {
  await signedIn(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/lesson/MA7.2");
  await page.getByLabel("Lesson section").selectOption("puzzle");
  await page
    .getByLabel("Your prediction", { exact: true })
    .fill(
      "Regularity and global joining conditions select discrete angular modes.",
    );
  await page.getByRole("button", { name: "Commit and investigate" }).click();
  await page.getByLabel("Lesson section").selectOption("interactive");
  await expect(
    page.getByLabel("Selected Legendre value", { exact: true }),
  ).toHaveText("-0.500000");
  await expect(
    page.getByLabel("Legendre squared norm", { exact: true }),
  ).toHaveText("0.400000");
  expect(
    Number(
      await page
        .getByLabel("Selected zonal harmonic", { exact: true })
        .textContent(),
    ),
  ).toBeCloseTo(-0.5 * Math.sqrt(5 / (4 * Math.PI)), 5);
  await page.getByLabel("Legendre probe", { exact: true }).fill("1");
  await expect(
    page.getByLabel("Selected Legendre value", { exact: true }),
  ).toHaveText("1.000000");
  await page.getByLabel("Legendre degree", { exact: true }).fill("3");
  await page.getByLabel("Legendre probe", { exact: true }).fill("-1");
  await expect(
    page.getByLabel("Selected Legendre value", { exact: true }),
  ).toHaveText("-1.000000");
  await expect(
    page.getByLabel("Legendre squared norm", { exact: true }),
  ).toHaveText("0.285714");
  await expect(page.getByRole("table").getByRole("row")).toHaveCount(8);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test("cached lesson JSON refreshes online after a release and keeps the refreshed content offline", async ({
  page,
  context,
}) => {
  await signedIn(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  const path = "dist/content/PB1.1.json";
  const original = readFileSync(path, "utf8");
  try {
    await page.evaluate(async () => {
      await fetch("/content/PB1.1.json").then((response) => response.json());
    });
    await expect
      .poll(() =>
        page.evaluate(async () =>
          Boolean(await caches.match("/content/PB1.1.json")),
        ),
      )
      .toBeTruthy();
    writeFileSync(
      path,
      JSON.stringify({ ...JSON.parse(original), releaseProbe: "fresh-lesson" }),
    );
    const revision = await page.evaluate(
      async () =>
        (await fetch("/content/PB1.1.json").then((response) => response.json()))
          .releaseProbe,
    );
    expect(revision).toBe("fresh-lesson");
    await expect
      .poll(() =>
        page.evaluate(
          async () =>
            (await (await caches.match("/content/PB1.1.json"))?.json())
              ?.releaseProbe,
        ),
      )
      .toBe("fresh-lesson");
    await context.setOffline(true);
    const offlineRevision = await page.evaluate(
      async () =>
        (await fetch("/content/PB1.1.json").then((response) => response.json()))
          .releaseProbe,
    );
    expect(offlineRevision).toBe("fresh-lesson");
  } finally {
    await context.setOffline(false);
    writeFileSync(path, original);
  }
});

test("journey dashboard integrates the weekly plan, level map and appearance without separate lab navigation", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/dashboard");
  await expect(
    page.getByRole("region", { name: "Learning level map" }),
  ).toBeVisible();
  await expect(page.getByText("A week of good questions.")).toBeVisible();
  await expect(page.locator(".plan-list article")).toHaveCount(7);
  await expect(
    page
      .getByRole("navigation", { name: "Study navigation" })
      .getByRole("link", { name: "Lab", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("switch", { name: "Dark mode" }).click();
  // Brass -> Cyanotype -> Madder: the colour button steps through the palettes.
  const colour = page.getByRole("button", { name: /^Color theme:/ });
  await colour.click();
  await colour.click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "madder");
  const bridgeMath = JSON.parse(
    readFileSync("src/generated/course.json", "utf8"),
  )
    .lessons.filter(
      (l: { phase: number; track: string }) =>
        l.phase === 0 && l.track === "maths",
    )
    .map((l: { id: string }) => l.id);
  await page.evaluate((ids) => {
    const key = "parallax-learning-v1:test-learner",
      data = JSON.parse(localStorage.getItem(key)!);
    data.records.lessons = {};
    for (const id of ids)
      data.records.lessons[id] = {
        status: "done",
        mastery: 1,
        depthCompleted: "full",
        ladderTierDone: ["core", "warmup"],
        lastSection: "connections",
        updatedAt: 1,
      };
    localStorage.setItem(key, JSON.stringify(data));
  }, bridgeMath);
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Bridge refresher/, pressed: true }),
  ).toBeVisible();
  await expect(page.locator(".current-level")).toContainText("PB1.1");
  await page.goto("/lesson/PB1.1");
  await expect(page.locator(".site-header,.site-footer,.tab-bar")).toHaveCount(
    0,
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("restart confirms a chosen lesson and resets only its suffix while retaining notes and past XP", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/dashboard");
  await page.evaluate(() => {
    const key = "parallax-learning-v1:test-learner",
      data = JSON.parse(localStorage.getItem(key)!);
    const completed = {
      status: "done",
      mastery: 1,
      depthCompleted: "full",
      ladderTierDone: ["core", "warmup"],
      lastSection: "connections",
      updatedAt: 1,
    };
    data.records.lessons["PB1.1"] = completed;
    data.records.lessons["PB1.4"] = completed;
    data.preferences.depth = "quick";
    data.records.days["2026-10-18"] = {
      xp: 20,
      activities: [{ id: "lesson:PB1.4", xp: 20, track: "physics", at: 1 }],
      goalMet: true,
      xpByTrack: { physics: 20 },
    };
    data.records.notes["PB1.4"] = {
      bodyMd: "Keep my reasoning.",
      updatedAt: 1,
    };
    localStorage.setItem(key, JSON.stringify(data));
  });
  await page.goto("/settings");
  await page.reload();
  await page.getByRole("button", { name: "Restart learning progress" }).click();
  await page
    .getByLabel("Where would you like to restart?")
    .selectOption("point");
  await page
    .getByLabel("Restart lesson", { exact: true })
    .selectOption("PB1.4");
  await page
    .getByLabel("Restart section", { exact: true })
    .selectOption("theory");
  await page.getByRole("button", { name: "Confirm restart" }).click();
  await expect(page).toHaveURL("/lesson/PB1.4");
  await expect(page.getByLabel("Lesson section")).toHaveValue("theory");
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!),
  );
  expect(data.records.lessons["PB1.1"].status).toBe("done");
  expect(data.records.lessons["PB1.4"].status).toBe("in_progress");
  expect(data.records.lessons["PB1.4"].mastery).toBe(0);
  expect(data.records.lessons["PB1.4"].resetAt).toBeGreaterThan(0);
  expect(data.records.notes["PB1.4"].bodyMd).toBe("Keep my reasoning.");
  expect(data.records.days["2026-10-18"].xp).toBe(20);
  await page.getByLabel("Lesson section").selectOption("puzzle");
  await page
    .getByLabel("Your prediction", { exact: true })
    .fill("A longer pendulum takes longer to swing.");
  await page.getByRole("button", { name: "Commit and investigate" }).click();
  await page.getByLabel("Lesson section").selectOption("connections");
  await page.getByRole("button", { name: "Finish reading" }).click();
  const total = await page.evaluate(() =>
    Object.values(
      JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!)
        .records.days,
    ).reduce((sum: number, day: any) => sum + day.xp, 0),
  );
  expect(total).toBe(20);
});

test("adaptive readiness steps up after a correct first attempt and down after a mistake", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PB1.1");
  const course = JSON.parse(readFileSync("src/generated/course.json", "utf8"));
  const bank = course.authored["PB1.1"].questions;
  async function answer(correct: boolean) {
    const form = page.locator(".adaptive-check .question-card");
    const prompt = await form.locator("h3").textContent();
    const q = bank.find((q: { prompt: string }) => q.prompt === prompt);
    if (q.options) {
      await form
        .getByLabel(
          correct ? q.answer : q.options.find((x: string) => x !== q.answer),
          { exact: true },
        )
        .check();
    } else {
      await form
        .locator('input[type="number"]')
        .fill(correct ? q.answer : String(Number(q.answer) + 1000));
    }
    await form.getByRole("button", { name: "Check answer" }).click();
    await page.getByRole("button", { name: "Next challenge" }).click();
  }
  await answer(true);
  let level = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!)
        .records.plan["challenge-physics"].level,
  );
  expect(level).toBe(2);
  await answer(false);
  level = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!)
        .records.plan["challenge-physics"].level,
  );
  expect(level).toBe(1);
});

test("vectors and black-hole trajectories respond directly to accessible manipulation inside lessons", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/MB2.3");
  const tip = page.getByRole("button", {
    name: "Move vector a tip with arrow keys",
  });
  await tip.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText(/A = \(2.25, 1.00\)/)).toBeVisible();
  await page.goto("/lesson/PH16.3");
  await page.getByLabel("Photon impact parameter", { exact: true }).fill("4");
  await expect(
    page.getByText("Captured: the ray crosses r = 2."),
  ).toBeVisible();
  await page.getByLabel("Photon impact parameter", { exact: true }).fill("7");
  await expect(
    page.getByText("Scattered: the ray returns toward large radius."),
  ).toBeVisible();
});

test("due lesson repetitions appear in the next lesson and schedule through inline recall ratings", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PB1.1");
  await page.getByLabel("Lesson section").selectOption("puzzle");
  await page
    .getByLabel("Your prediction", { exact: true })
    .fill("Acceleration is independent of mass in vacuum.");
  await page.getByRole("button", { name: "Commit and investigate" }).click();
  await page.getByLabel("Lesson section").selectOption("connections");
  await page.getByRole("button", { name: "Finish reading" }).click();
  await page.goto("/lesson/PB1.2");
  const recap = page.getByRole("region", { name: "Between-lesson recall" });
  await expect(recap).toBeVisible();
  for (let i = 0; i < 2; i++) {
    await recap.getByRole("button", { name: "Recall, then reveal" }).click();
    await recap.getByRole("button", { name: "Good", exact: true }).click();
  }
  await expect(recap).toHaveCount(0);
  const logs = await page.evaluate(() =>
    Object.values(
      JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!)
        .records.reviewLog,
    ),
  );
  expect(logs).toHaveLength(2);
});

test("exact resume retains unsubmitted responses, submitted feedback and theory reveal position", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PB1.1");
  const adaptive = page.locator(".adaptive-check .question-card");
  await adaptive.locator('input[type="number"]').fill("123");
  await page.reload();
  await expect(
    page.locator('.adaptive-check input[type="number"]'),
  ).toHaveValue("123");
  await page
    .locator(".adaptive-check")
    .getByRole("button", { name: "Check answer" })
    .click();
  await page.reload();
  await expect(page.locator(".adaptive-check .answer-feedback")).toContainText(
    "Not quite",
  );
  await expect(
    page
      .locator(".adaptive-check")
      .getByRole("button", { name: "Check answer" }),
  ).toBeDisabled();
  await page.getByLabel("Lesson section").selectOption("puzzle");
  await page
    .getByLabel("Your prediction", { exact: true })
    .fill("My unfinished reasoning");
  await page.reload();
  await expect(page.getByLabel("Your prediction", { exact: true })).toHaveValue(
    "My unfinished reasoning",
  );
  await page.getByRole("button", { name: "Commit and investigate" }).click();
  await page.getByLabel("Lesson section").selectOption("theory");
  await page.getByRole("button", { name: "Reveal next theory step" }).click();
  const count = await page.getByText(/of .* theory blocks shown/).textContent();
  await page.reload();
  await expect(page.getByText(/of .* theory blocks shown/)).toHaveText(count!);
});
test("reading completion is labelled separately from mastery and unchanged answer submissions are disabled", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PB1.1");
  await page.getByLabel("Lesson section").selectOption("puzzle");
  await page
    .getByLabel("Your prediction", { exact: true })
    .fill("Both accelerate together in vacuum.");
  await page.getByRole("button", { name: "Commit and investigate" }).click();
  await page.getByLabel("Lesson section").selectOption("check");
  const first = page.locator(".question-card").first();
  await first
    .getByLabel("Weight and inertia scale together", { exact: true })
    .check();
  await first.getByRole("button", { name: "Check answer" }).click();
  await expect(
    first.getByRole("button", { name: "Check answer" }),
  ).toBeDisabled();
  await page.getByLabel("Lesson section").selectOption("connections");
  await page.getByRole("button", { name: "Finish reading" }).click();
  await expect(
    page.getByText(
      /Reading completed. This is separate from demonstrated mastery/,
    ),
  ).toBeVisible();
  await expect(
    page.getByText(/Server-graded assessments are not connected/),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to dashboard" }).click();
  await expect(
    page.getByRole("link", {
      name: "Kinematics and Newton’s laws · reading complete; mastery separate",
      exact: true,
    }),
  ).toBeVisible();
});
test("new mechanics models expose energy loss and rolling mass distribution in the connected lessons", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PB1.2");
  await page.getByLabel("Collision restitution", { exact: true }).fill("0");
  await expect(page.getByText(/Kinetic energy lost: 3.000 J/)).toBeVisible();
  await page.goto("/lesson/PB1.3");
  await page.getByLabel("Ramp travel", { exact: true }).fill("1");
  await page
    .getByLabel("Rolling mass distribution", { exact: true })
    .selectOption("1");
  await expect(page.getByText(/Speed: 4.429 m\/s/)).toBeVisible();
  await page.getByRole("button", { name: "Rolling body handle" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByLabel("Ramp travel", { exact: true })).toHaveValue(
    "0.95",
  );
});

test("resume returns to the unfinished practice question rather than the top of a long section", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PB1.2");
  await page.getByLabel("Lesson section").selectOption("puzzle");
  await page
    .getByLabel("Your prediction", { exact: true })
    .fill(
      "Momentum and kinetic energy have different conservation conditions.",
    );
  await page.getByRole("button", { name: "Commit and investigate" }).click();
  await page.getByLabel("Lesson section").selectOption("problems");
  const form = page.locator('[data-question-id="transfer-friction"]');
  await form.locator('input[type="number"]').fill("-12");
  await page.reload();
  await expect(form.locator('input[type="number"]')).toHaveValue("-12");
  await expect(form.locator('input[type="number"]')).toBeFocused();
});

test("fluids heat conics and spatial projection are embedded and respond to keyboard controls", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PB2.1");
  await page.getByLabel("Probe depth (m)", { exact: true }).fill("3");
  await expect(
    page.getByText("Gauge pressure: 29400 Pa. Absolute pressure: 130700 Pa."),
  ).toBeVisible();
  await page.getByLabel("Probe depth (m)", { exact: true }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByLabel("Probe depth (m)", { exact: true })).toHaveValue(
    "2.9",
  );
  const probe = page.getByLabel("Drag pressure probe", { exact: true });
  await probe.locator("circle").hover();
  // Hover can scroll the sticky apparatus pane; measure the resulting viewport position.
  const box = (await probe.boundingBox())!;
  const scale = Math.min(box.width / 400, box.height / 260);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2,
    box.y + (box.height - 260 * scale) / 2 + 170 * scale,
  );
  await page.mouse.up();
  await expect(
    page.getByText("Gauge pressure: 34300 Pa. Absolute pressure: 135600 Pa."),
  ).toBeVisible();
  await page.goto("/lesson/PB2.2");
  await page
    .getByLabel("Heating constraint", { exact: true })
    .selectOption("pressure");
  await expect(
    page.getByText("ΔU: 249.42 J. W: 166.28 J. Q: 415.70 J."),
  ).toBeVisible();
  await page.goto("/lesson/MB2.2");
  await page.getByLabel("Ellipse eccentricity", { exact: true }).fill("0");
  await expect(
    page.getByText(
      "Radius: 5.000 AU. Periapsis: 5.000 AU. Apoapsis: 5.000 AU.",
    ),
  ).toBeVisible();
  await page.goto("/lesson/MB2.3");
  await page.getByLabel("Point x", { exact: true }).fill("3");
  await page.getByLabel("Point z", { exact: true }).fill("0");
  await expect(
    page.getByText("Signed distance: 0.000. Foot: (3.000, 0.000, 0.000)."),
  ).toBeVisible();
});

test("Bayes lens induction and tide models connect directly to their lessons", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/MB4.3");
  await expect(
    page.getByText(
      "True positives: 90.0. False positives: 495.0. P(condition | positive): 0.1538.",
    ),
  ).toBeVisible();
  await page.getByLabel("Condition prevalence", { exact: true }).fill("0");
  await page
    .getByLabel("False-positive probability", { exact: true })
    .fill("0");
  await expect(page.getByText(/undefined \(no positives\)/)).toBeVisible();
  await page.getByLabel("Condition prevalence", { exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByLabel("Condition prevalence", { exact: true }),
  ).toHaveValue("0.001");
  await page.goto("/lesson/PB3.2");
  await expect(
    page.getByText(
      "Image distance: 30.000 cm. Magnification: -1.000. Real image.",
    ),
  ).toBeVisible();
  await page.getByLabel("Lens focal length (cm)", { exact: true }).fill("10");
  await page.getByLabel("Lens object distance (cm)", { exact: true }).fill("5");
  await expect(
    page.getByText(
      "Image distance: -10.000 cm. Magnification: 2.000. Virtual image.",
    ),
  ).toBeVisible();
  await page
    .getByLabel("Lens object distance (cm)", { exact: true })
    .fill("10");
  await expect(
    page.getByText("Image at infinity: emerging rays are parallel."),
  ).toBeVisible();
  await page.goto("/lesson/PB4.3");
  await expect(page.getByText("Induced emf: -2.000 V.")).toBeVisible();
  await page
    .getByLabel("Coil normal angle (degrees)", { exact: true })
    .fill("90");
  await expect(page.getByText("Induced emf: 0.000 V.")).toBeVisible();
  await page.goto("/lesson/AS1.5");
  await page.getByLabel("Tide center radius", { exact: true }).fill("2");
  await page.getByLabel("Tide probe separation", { exact: true }).fill("2");
  await expect(
    page.getByText(
      "Exact differential acceleration: 0.888889. Linear tide: 0.500000. Separation/radius: 1.000.",
    ),
  ).toBeVisible();
});

test("calculus and molecular models expose proof bounds area cancellation and numerical failure", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/MB3.1");
  await page.getByLabel("Limit delta", { exact: true }).fill("0.1");
  await expect(
    page.getByText(/Closed-interval supremum \|f\(x\)−1\|: 0.2100/),
  ).toBeVisible();
  await page.getByLabel("Limit delta", { exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("Limit delta", { exact: true })).toHaveValue(
    "0.11",
  );
  await page.goto("/lesson/MB3.3");
  await page.getByLabel("Integration endpoint", { exact: true }).fill("1");
  await expect(
    page.getByText(/Exact signed integral: -0.6667. Geometric area: 0.6667/),
  ).toBeVisible();
  await page.goto("/lesson/MB3.5");
  await page.getByLabel("ODE Euler steps", { exact: true }).fill("1");
  await expect(page.getByText(/Euler value: -9.00000/)).toBeVisible();
  await page.getByLabel("ODE Euler steps", { exact: true }).fill("40");
  await expect(page.getByText(/Euler value: 0.04434/)).toBeVisible();
  await page.goto("/lesson/CB.2");
  await page.getByLabel("Lone-pair domains", { exact: true }).selectOption("2");
  await expect(
    page.getByText(
      /Visible atom geometry: bent. Bond domains: 2. Lone-pair domains: 2/,
    ),
  ).toBeVisible();
  await page
    .getByLabel("Electron-domain count", { exact: true })
    .selectOption("2");
  await expect(
    page.getByText(
      /Visible atom geometry: one bond. Bond domains: 1. Lone-pair domains: 1/,
    ),
  ).toBeVisible();
});

test("analysis models distinguish Darboux envelopes and uniform domain dependence", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/MA1.7");
  await page.getByLabel("Darboux cells", { exact: true }).fill("10");
  await page.getByLabel("Cell sample fraction", { exact: true }).fill("0");
  await expect(
    page.getByText(
      "Lower: 0.28500. Sampled: 0.28500. Upper: 0.38500. Gap: 0.10000.",
    ),
  ).toBeVisible();
  await page.getByLabel("Cell sample fraction", { exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByLabel("Cell sample fraction", { exact: true }),
  ).toHaveValue("0.01");
  await page.goto("/lesson/MA1.8");
  await expect(
    page.getByText(
      /Supremum error to the pointwise limit: 1.000000. Not uniform/,
    ),
  ).toBeVisible();
  await page.getByLabel("Power domain endpoint", { exact: true }).fill("0.5");
  await expect(
    page.getByText(/Supremum error to the pointwise limit: 0.003906. Uniform/),
  ).toBeVisible();
});

test("advanced mechanics models expose frame signs tensor dynamics and scattering geometry", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PH1.2");
  await expect(
    page.getByText(/Coriolis acceleration: \(0.000, -4.000\) m\/s²/),
  ).toBeVisible();
  await page.getByLabel("Frame angular speed", { exact: true }).fill("-0.5");
  await expect(
    page.getByText(/Coriolis acceleration: \(0.000, 4.000\) m\/s²/),
  ).toBeVisible();
  await page.goto("/lesson/PH1.6");
  await expect(page.getByText(/Energy: 7.000 J/)).toBeVisible();
  await page.getByLabel("Body omega 1", { exact: true }).fill("0");
  await expect(page.getByText(/Energy: 6.000 J. \|ω×L\|: 0.000/)).toBeVisible();
  await page.getByLabel("Body omega 3", { exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("Body omega 3", { exact: true })).toHaveValue(
    "0.1",
  );
  await page.goto("/lesson/PH1.4");
  await expect(
    page.getByText(
      "Deflection angle: 90.000 degrees. Differential cross section: 1.00000 model area/sr.",
    ),
  ).toBeVisible();
  await page
    .getByLabel("Scattering impact parameter", { exact: true })
    .fill("2");
  await expect(
    page.getByText(/Deflection angle: 53.130 degrees/),
  ).toBeVisible();
});

test("analytical mechanics displays canonical flow and area-preserving shear", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PH2.4");
  await expect(
    page.getByText(
      /Energy: 0.5000. Action J: 0.5000. Enclosed phase area: 3.1416/,
    ),
  ).toBeVisible();
  await page.getByLabel("Phase momentum p", { exact: true }).fill("1");
  await expect(
    page.getByText(/Energy: 1.0000. Action J: 1.0000/),
  ).toBeVisible();
  await page.getByLabel("Phase angular frequency", { exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByLabel("Phase angular frequency", { exact: true }),
  ).toHaveValue("1.1");
  await page.goto("/lesson/PH2.5");
  await expect(
    page.getByText(/New point: Q=1.000, P=0.000. Poisson bracket: 1.000/),
  ).toBeVisible();
  await page.getByLabel("Canonical shear alpha", { exact: true }).fill("-1");
  await expect(page.getByText(/New point: Q=1.000, P=2.000/)).toBeVisible();
  await page.goto("/lesson/PH2.6");
  await expect(
    page.getByLabel("Phase position q", { exact: true }),
  ).toBeVisible();
});

test("astrophysics investigations respond to slab limits and direct distance dragging on mobile", async ({
  page,
}) => {
  await signedIn(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lesson/AS2.3");
  const slab = page.locator(".virtual-lab").filter({
    has: page.getByRole("heading", {
      name: "Move through an emitting and absorbing slab",
    }),
  });
  await expect(slab.locator("output")).toHaveText(
    "Emergent intensity (same units): 1.6321",
  );
  await page.getByLabel("Optical depth", { exact: true }).fill("0");
  await expect(slab.locator("output")).toHaveText(
    "Emergent intensity (same units): 1.0000",
  );
  await page.goto("/lesson/AS2.1");
  const scene = page.getByLabel("Drag investigation point for AS2.1", {
    exact: true,
  });
  await scene.scrollIntoViewIfNeeded();
  const dot = await scene.locator("circle").boundingBox(),
    box = await scene.boundingBox();
  expect(dot && box).toBeTruthy();
  await page.mouse.move(dot!.x + dot!.width / 2, dot!.y + dot!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.8, dot!.y + dot!.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  expect(
    Number(
      await page
        .getByLabel("Distance (model length)", { exact: true })
        .inputValue(),
    ),
  ).toBeGreaterThan(5);
  await page.getByLabel("Distance (model length)", { exact: true }).focus();
  const before = Number(
    await page
      .getByLabel("Distance (model length)", { exact: true })
      .inputValue(),
  );
  await page.keyboard.press("ArrowLeft");
  expect(
    Number(
      await page
        .getByLabel("Distance (model length)", { exact: true })
        .inputValue(),
    ),
  ).toBeLessThan(before);
});

test("research investigations keep synthetic probabilities and integer trial counts explicit", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/AS10.3");
  await page.getByLabel("Likelihood ratio", { exact: true }).fill("4");
  await page.getByLabel("Prior probability", { exact: true }).fill("0.2");
  await expect(page.getByText(/Posterior probability: 0.5000/)).toBeVisible();
  await page.goto("/lesson/AS10.1");
  await page
    .getByLabel("Number of independent tests", { exact: true })
    .fill("2");
  await page
    .getByLabel("Single-test false-positive rate", { exact: true })
    .fill("0.05");
  await expect(
    page.getByText(/Probability of at least one false positive: 0.0975/),
  ).toBeVisible();
  await page.getByLabel("Number of independent tests", { exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByLabel("Number of independent tests", { exact: true }),
  ).toHaveValue("3");
});

test("multivariable investigations distinguish directional derivatives and oriented flux", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/MA2.2");
  await expect(
    page.getByText(/Directional derivative of x²\+2y²: 2.0000/),
  ).toBeVisible();
  await page
    .getByLabel("Direction angle (degrees)", { exact: true })
    .fill("90");
  await expect(
    page.getByText(/Directional derivative of x²\+2y²: 4.0000/),
  ).toBeVisible();
  await page.goto("/lesson/MA2.6");
  await expect(
    page.getByText(/Outward flux for F=a\(x,y,z\): 12.5664/),
  ).toBeVisible();
  await page
    .getByLabel("Radial field coefficient a", { exact: true })
    .fill("-1");
  await expect(
    page.getByText(/Outward flux for F=a\(x,y,z\): -12.5664/),
  ).toBeVisible();
});

test("linear algebra and PDE investigations preserve conditioning, integer modes and boundary response", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/MA3.7");
  await expect(
    page.getByText(/Unregularized solution component: 10.0000/),
  ).toBeVisible();
  await page.getByLabel("Small singular value", { exact: true }).fill("0.5");
  await expect(
    page.getByText(/Unregularized solution component: 2.0000/),
  ).toBeVisible();
  await page.goto("/lesson/MA5.1");
  await page.getByLabel("Number of odd sine modes", { exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByLabel("Number of odd sine modes", { exact: true }),
  ).toHaveValue("4");
  await page.goto("/lesson/MA5.7");
  await expect(page.getByText(/Green function G\(x,s\): 0.1250/)).toBeVisible();
  await page.getByLabel("Observation point x", { exact: true }).fill("0");
  await expect(page.getByText(/Green function G\(x,s\): 0.0000/)).toBeVisible();
});

test("electromagnetic probes distinguish zero potential, grounded boundaries and current reversal", async ({
  page,
}) => {
  await signedIn(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lesson/PH4.2");
  await expect(
    page.getByText("Electric field: (2.0000, 0.0000). Potential: 0.0000.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Right-hand charge", { exact: true }).fill("1");
  await expect(
    page.getByText("Electric field: (0.0000, 0.0000). Potential: 2.0000.", {
      exact: true,
    }),
  ).toBeVisible();
  const scene = page.getByLabel("Drag charges field probe", { exact: true });
  await scene.scrollIntoViewIfNeeded();
  const dot = await scene.locator("circle").last().boundingBox();
  expect(dot).toBeTruthy();
  await page.mouse.move(dot!.x + dot!.width / 2, dot!.y + dot!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    dot!.x + dot!.width / 2 + 20,
    dot!.y + dot!.height / 2 - 20,
    { steps: 5 },
  );
  await page.mouse.up();
  expect(
    Number(
      await page.getByLabel("Field probe y", { exact: true }).inputValue(),
    ),
  ).toBeGreaterThan(0);
  await page.goto("/lesson/PH4.3");
  await expect(
    page.getByText("Electric field: (0.0000, -0.7071). Potential: 0.0000.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Field probe x", { exact: true }).fill("0");
  await page.getByLabel("Field probe y", { exact: true }).fill("1");
  await expect(
    page.getByText(/Probe is inside an excluded source disc/),
  ).toBeVisible();
  await page.goto("/lesson/PH4.7");
  await expect(
    page.getByText("Magnetic field: (-1.0000, 0.0000).", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Wire current", { exact: true }).fill("-1");
  await expect(
    page.getByText("Magnetic field: (1.0000, 0.0000).", { exact: true }),
  ).toBeVisible();
});

test("optical and thermal investigations distinguish pump saturation and equilibrium statistics", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PH6.5");
  await expect(
    page.getByText(/Steady excited-state fraction: 0.3333/),
  ).toBeVisible();
  await page.getByLabel("Incoherent pump rate R", { exact: true }).fill("0");
  await expect(
    page.getByText(/Steady excited-state fraction: 0.0000/),
  ).toBeVisible();
  await page.goto("/lesson/PH7.6");
  await page.getByLabel("Reduced energy x=β(ε−μ)", { exact: true }).fill("1");
  await expect(
    page.getByText(/Mean occupation per mode: 0.2689/),
  ).toBeVisible();
  await page
    .getByLabel("Statistics: 0=Fermi, 1=Bose", { exact: true })
    .fill("1");
  await expect(
    page.getByText(/Mean occupation per mode: 0.5820/),
  ).toBeVisible();
  await page.goto("/lesson/PH7.3");
  await page.getByLabel("Subsystem A multiplicity", { exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByLabel("Subsystem A multiplicity", { exact: true }),
  ).toHaveValue("5");
  await page.goto("/lesson/PH7.10");
  await page.getByLabel("Elapsed time", { exact: true }).fill("0");
  await expect(
    page.getByText(/Variance from initial value zero: 0.0000/),
  ).toBeVisible();
});

test("physical chemistry investigations retain logarithmic references, electron counts and variational minima", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/CH1.1");
  await expect(page.getByText(/Chemical potential μ−μ°: 0.0000/)).toBeVisible();
  await page.getByLabel("Dimensionless activity a", { exact: true }).fill("2");
  await expect(page.getByText(/Chemical potential μ−μ°: 0.6931/)).toBeVisible();
  await page.goto("/lesson/CH1.9");
  await page
    .getByLabel("Transferred electron number n", { exact: true })
    .focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByLabel("Transferred electron number n", { exact: true }),
  ).toHaveValue("2");
  await page.goto("/lesson/CH2.3");
  await expect(
    page.getByText(/Variational energy \(ħ=m=1\): 0.5000/),
  ).toBeVisible();
  await page
    .getByLabel("Gaussian width parameter a", { exact: true })
    .fill("1");
  await expect(
    page.getByText(/Variational energy \(ħ=m=1\): 0.6250/),
  ).toBeVisible();
});

test("bonding and organic investigations keep discrete charges, conformations and orbital indices explicit", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/CH4.1");
  await expect(
    page.getByText(/Formal charge on nitrogen: 0.0000/),
  ).toBeVisible();
  await page
    .getByLabel("Nonbonding electron count on N", { exact: true })
    .fill("0");
  await page.getByLabel("Bond-order sum around N", { exact: true }).fill("4");
  await expect(
    page.getByText(/Formal charge on nitrogen: 1.0000/),
  ).toBeVisible();
  await page.goto("/lesson/CH6.2");
  await expect(
    page.getByText(/Relative torsional energy: 2.0000/),
  ).toBeVisible();
  await page
    .getByLabel("Torsion angle φ (degrees)", { exact: true })
    .fill("60");
  await expect(
    page.getByText(/Relative torsional energy: 0.0000/),
  ).toBeVisible();
  await page.goto("/lesson/CH6.6");
  await page.getByLabel("Orbital index m (mod N)", { exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByLabel("Orbital index m (mod N)", { exact: true }),
  ).toHaveValue("1");
  await expect(
    page.getByText(/Orbital energy for α=0, β=−1: -1.0000/),
  ).toBeVisible();
});

test("advanced maths investigations expose assumptions, integer sampling and variational constants", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/MA8.5");
  await expect(
    page.getByText(/Posterior mean under Beta\(1,1\): 0.6667/),
  ).toBeVisible();
  await page.getByLabel("Integer successes", { exact: true }).fill("7");
  await expect(
    page.getByText(/Posterior mean under Beta\(1,1\): 0.8000/),
  ).toBeVisible();
  await page.goto("/lesson/MA7.3");
  await page.getByLabel("Dimensionless radius", { exact: true }).fill("0");
  await expect(page.getByText(/J0\(kr\): 1.0000/)).toBeVisible();
  await page.goto("/lesson/MA9.3");
  await page.getByLabel("Phase ωt", { exact: true }).fill("2");
  await expect(page.getByText(/Total energy: 0.5000/)).toBeVisible();
});

test("structure computing and foundation investigations respond with physical and statistical limits", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/MA10.1");
  await page.getByLabel("Integer representative", { exact: true }).fill("-1");
  await expect(page.getByText(/Residue in 0..n−1: 4.0000/)).toBeVisible();
  await page.goto("/lesson/CP2.1");
  await page.getByLabel("Diffusion ratio r", { exact: true }).fill("0.6");
  await expect(page.getByText(/Mode amplification: -1.4000/)).toBeVisible();
  await page.goto("/lesson/PB5.1");
  await page.getByLabel("Photon energy hf", { exact: true }).fill("0");
  await expect(
    page.getByText(/Nonnegative energy excess: 0.0000/),
  ).toBeVisible();
  await page.goto("/lesson/MB4.4");
  await page.getByLabel("Success probability p", { exact: true }).fill("1");
  await expect(page.getByText(/Variance of the sum: 0.0000/)).toBeVisible();
});

test("quantum matter and gravity models preserve discrete occupations and observer conventions", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/PH8.5");
  await page.getByLabel("Half-integer j", { exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("Half-integer j", { exact: true })).toHaveValue(
    "1",
  );
  await expect(
    page.getByText(/Total angular momentum magnitude: 1.4142/),
  ).toBeVisible();
  await page.goto("/lesson/PH9.5");
  await expect(
    page.getByText(/Fermionic occupation configurations: 6.0000/),
  ).toBeVisible();
  await page.getByLabel("Integer fermion count N", { exact: true }).fill("1");
  await expect(
    page.getByText(/Fermionic occupation configurations: 4.0000/),
  ).toBeVisible();
  await page.goto("/lesson/PH11.4");
  await expect(
    page.getByText(/Transformed direction cosine: -0.6000/),
  ).toBeVisible();
  await page.goto("/lesson/PH16.4");
  await page.getByLabel("Dimensionless spin χ", { exact: true }).fill("0.6");
  await expect(page.getByText(/Outer horizon radius: 1.8000/)).toBeVisible();
});

test("proof explorers expose a counterexample and research widgets retain execution boundaries", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/MA1.1");
  await page.getByLabel("Integer n", { exact: true }).fill("1");
  await expect(
    page.getByText(/Difference between two sides: -1.0000/),
  ).toBeVisible();
  await page.goto("/lesson/PH17.2");
  await page
    .getByLabel("Frequency\/sample-rate ratio", { exact: true })
    .fill("1.3");
  await expect(page.getByText(/Sample amplitude: 0.9511/)).toBeVisible();
  await page.goto("/lesson/PH18.3");
  await expect(
    page.getByText(/planning model, not executed research/),
  ).toBeVisible();
});

test("discrete group orders reject tolerance-based fractional answers in lesson practice", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/lesson/MA10.1");
  await page.getByLabel("Lesson section").selectOption("puzzle");
  await page
    .getByLabel("Your prediction", { exact: true })
    .fill(
      "The image order must be an integer fixed by the kernel and group orders.",
    );
  await page.getByRole("button", { name: "Commit and investigate" }).click();
  await page.getByLabel("Lesson section").selectOption("problems");
  const question = page.locator('[data-question-id="structure-transfer-1"]');
  await question.getByRole("spinbutton").fill("4.01");
  await question.getByRole("button", { name: "Check answer" }).click();
  await expect(question.getByRole("status")).toContainText("Not quite");
  await question.getByRole("spinbutton").fill("4");
  await question.getByRole("button", { name: "Check answer" }).click();
  await expect(question.getByRole("status")).toContainText("That’s right");
});

test("foundation revision begins from dashboard and saves a separate progressive lesson", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Start in-depth revision" }).click();
  await expect(page.locator(".foundation-chapter-list li")).toHaveCount(38);
  await page.getByRole("button", { name: "Begin guided revision" }).click();
  await expect(page).toHaveURL(/foundation-revision\/MB1.1$/);
  await expect(page.locator(".site-header,.site-footer,.tab-bar")).toHaveCount(
    0,
  );
  await expect(page.locator(".revision-glossary dt")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Continue revision", exact: true })
    .click();
  await expect(page.locator(".revision-worked")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Continue revision", exact: true })
    .click();
  await expect(page.locator(".lesson-prose")).toBeVisible();
  await expect(page.locator(".lesson-prose .katex").first()).toBeVisible();
  await page
    .getByRole("button", { name: "I’ve read the argument — practise" })
    .click();
  const finish = page.getByRole("button", {
    name: "Finish this revision",
    exact: true,
  });
  await expect(finish).toBeDisabled();
  const content = JSON.parse(
    readFileSync("content/revision/foundation.json", "utf8"),
  );
  const guide = content.modules.find((m: { id: string }) => m.id === "MB1.1");
  const first = page.locator("form[data-question-id='revision-rebuild-1']");
  await first.getByRole("spinbutton").fill("4");
  await first
    .getByRole("button", { name: "Check answer", exact: true })
    .click();
  await expect(first.getByRole("status")).toContainText("Not yet");
  await first
    .getByRole("button", { name: "Help me take a smaller step" })
    .click();
  await expect(first.locator(".info-box")).toBeVisible();
  for (const q of guide.checks.filter(
    (q: { optional?: boolean }) => !q.optional,
  )) {
    const form = page.locator(`form[data-question-id='revision-${q.id}']`);
    if (q.type === "mcq")
      await form.getByRole("radio", { name: q.answer, exact: true }).check();
    else await form.getByRole("spinbutton").fill(q.answer);
    await form
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await expect(form.getByRole("status")).toContainText("That’s right");
  }
  await expect(finish).toBeEnabled();
  await finish.click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Revision practice complete" }),
  ).toBeVisible();
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!),
  );
  expect(data.preferences.foundationRevision).toBe(true);
  expect(
    data.records.plan["foundation-rebuild-MB1.1"].completedAt,
  ).toBeGreaterThan(0);
  expect(data.records.lessons["MB1.1"]?.mastery || 0).toBe(0);
  await page.getByRole("link", { name: "Dashboard", exact: true }).click();
  await expect(page.locator(".foundation-revision-card")).toContainText(
    "1 of 38",
  );
  await expect(page.locator(".foundation-revision-card a")).toHaveAttribute(
    "href",
    "/foundation-revision/MB1.2",
  );
  await expect(page.locator(".plan-list article")).toHaveCount(7);
  await expect(page.locator(".plan-list a").first()).toHaveAttribute(
    "href",
    /foundation-revision/,
  );
  await expect(page.locator(".continue-card")).toHaveCount(0);
});

test("foundation revision retains original history can be paused and remains account scoped", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForFunction(
    () => !!localStorage.getItem("parallax-learning-v1:test-learner"),
  );
  await page.evaluate(() => {
    const key = "parallax-learning-v1:test-learner",
      d = JSON.parse(localStorage.getItem(key)!);
    d.records.lessons["PH1.1"] = {
      status: "done",
      mastery: 0.9,
      updatedAt: 123,
    };
    localStorage.setItem(key, JSON.stringify(d));
  });
  await page.goto("/foundation-revision/MB2.3");
  await expect(page.locator(".revision-glossary")).toContainText(/normal/i);
  await page
    .getByRole("button", { name: "Continue revision", exact: true })
    .click();
  await page.reload();
  await expect(page.getByLabel("Revision step", { exact: true })).toHaveValue(
    "1",
  );
  await page.goto("/settings");
  await page
    .getByLabel("Prioritize foundation revision", { exact: true })
    .uncheck();
  await page.goto("/dashboard");
  await expect(page.locator(".continue-card")).toBeVisible();
  const d = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!),
  );
  expect(d.records.lessons["PH1.1"].mastery).toBe(0.9);
  expect(d.records.plan["foundation-rebuild-MB2.3"].step).toBe(1);
  await signedIn(page, "other-revision-learner");
  await page.goto("/foundation-revision/MB2.3");
  await expect(page.getByLabel("Revision step", { exact: true })).toHaveValue(
    "0",
  );
});

test("all foundation revision chapters load real theory and mobile interactive models", async ({
  page,
}) => {
  test.setTimeout(180000);
  await signedIn(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const ids = JSON.parse(
    readFileSync("content/revision/foundation.json", "utf8"),
  ).modules.map((m: { id: string }) => m.id);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const id of ids) {
    await page.goto(`/foundation-revision/${id}`);
    await expect(page.locator(".revision-glossary dt").first()).toBeVisible();
    await expect(
      page.getByRole("complementary", { name: "Lesson simulation" }),
    ).toBeVisible();
    await page.getByLabel("Revision step", { exact: true }).selectOption("2");
    await expect(page.locator(".lesson-prose")).toBeVisible();
    expect(await page.locator(".lesson-prose").innerText()).not.toHaveLength(0);
    await expect(page.locator(".katex-error")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

for (const device of ["desktop", "touch"] as const) {
  test(`simulation slider physical drag on ${device}`, async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize(
      device === "touch"
        ? { width: 390, height: 844 }
        : { width: 1280, height: 900 },
    );
    await signedIn(page);
    const cdp = await page.context().newCDPSession(page);
    if (device === "touch")
      await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true });
    const ids = [
      "MB1.1",
      "MB1.2",
      "MB2.3",
      "MB4.2",
      "PB1.1",
      "PB1.3",
      "PB1.4",
      "PB2.1",
      "PB2.2",
      "PB3.1",
      "PB3.3",
      "PB4.2",
      "AS1.3",
      "AS2.3",
      "PH4.1",
      "PH2.7",
      "MA5.4",
    ];
    for (const id of ids) {
      await page.goto(`/lesson/${id}`);
      const panel = page.getByRole("complementary", {
        name: "Lesson simulation",
      });
      await expect(panel).toBeVisible();
      const inputs = panel.locator('input[type="range"]');
      for (let i = 0; i < (await inputs.count()); i++) {
        const input = inputs.nth(i);
        await input.scrollIntoViewIfNeeded();
        const box = (await input.boundingBox())!;
        const current = await input.evaluate(
          (e: HTMLInputElement) =>
            (Number(e.value) - Number(e.min)) / (Number(e.max) - Number(e.min)),
        );
        const y = box.y + box.height / 2,
          from = box.x + 8 + (box.width - 16) * current,
          to = box.x + 8 + (box.width - 16) * 0.8;
        if (device === "touch") {
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: [{ x: from, y }],
          });
          for (let j = 1; j <= 8; j++)
            await cdp.send("Input.dispatchTouchEvent", {
              type: "touchMove",
              touchPoints: [{ x: from + ((to - from) * j) / 8, y }],
            });
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchEnd",
            touchPoints: [],
          });
        } else {
          await page.mouse.move(from, y);
          await page.mouse.down();
          await page.mouse.move(to, y, { steps: 8 });
          await page.mouse.up();
        }
        const actual = await input.evaluate((el: HTMLInputElement) => ({
          value: Number(el.value),
          min: Number(el.min),
          max: Number(el.max),
          label: el.getAttribute("aria-label"),
        }));
        expect(
          (actual.value - actual.min) / (actual.max - actual.min),
          `${device} ${id}: ${actual.label}`,
        ).toBeGreaterThan(0.6);
      }
    }
    await cdp.detach();
  });
}

test("simulation direct number entry clamps safely and supports keyboard adjustment", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/foundation-revision/MB2.3");
  const control = page.locator(".simulation-slider").first();
  await control.getByText("Type a value", { exact: true }).click();
  const input = control.getByRole("spinbutton");
  await input.fill("99999");
  await control.getByRole("button", { name: "Apply value" }).click();
  const slider = control.getByRole("slider");
  const max = await slider.getAttribute("max");
  await expect(slider).toHaveValue(max!);
  await slider.focus();
  await page.keyboard.press("Home");
  const min = await slider.getAttribute("min");
  await expect(slider).toHaveValue(min!);
  await input.fill("");
  await control.getByRole("button", { name: "Apply value" }).click();
  await expect(control.getByRole("alert")).toBeVisible();
});

test("revision AI tutor streams lesson-aware replies saves history and handles service errors", async ({
  page,
}) => {
  await page.route("**/services.json", (r) =>
    r.fulfill({
      json: { tutorUrl: "/test-tutor", pushUrl: "", pushPublicKey: "" },
    }),
  );
  let count = 0;
  await page.route("**/test-tutor", async (r) => {
    const body = r.request().postDataJSON();
    expect(body.lessonId).toBe("MB2.3");
    expect(body.revisionStep).toBe(0);
    expect(r.request().headers().authorization).toMatch(/^Bearer /);
    count++;
    await r.fulfill(
      count === 1
        ? {
            status: 200,
            headers: {
              "Content-Type": "text/event-stream",
              "X-Tutor-Remaining": "49",
            },
            body:
              "data: " +
              JSON.stringify({
                text: "Normalize by dividing the normal vector by its length. Check the units.",
              }) +
              "\n\n",
          }
        : { status: 429, json: { error: "Daily limit" } },
    );
  });
  await signedIn(page);
  await page.goto("/foundation-revision/MB2.3");
  await page.getByRole("button", { name: "Ask AI tutor", exact: true }).click();
  const tutor = page.getByRole("complementary", { name: "AI lesson tutor" });
  await tutor
    .getByLabel("Ask about this section")
    .fill("What is normalization?");
  await tutor.getByRole("button", { name: "Ask tutor", exact: true }).click();
  await expect(tutor.locator(".assistant")).toContainText(
    "dividing the normal vector",
  );
  await expect(tutor).not.toContainText("requests remaining");
  await page.reload();
  await page.getByRole("button", { name: "Ask AI tutor", exact: true }).click();
  await expect(tutor.locator(".assistant")).toContainText(
    "dividing the normal vector",
  );
  await tutor.getByLabel("Ask about this section").fill("Another question");
  await tutor.getByRole("button", { name: "Ask tutor", exact: true }).click();
  await expect(tutor.getByRole("alert")).toContainText("AI provider is busy");
  await expect(
    tutor.getByRole("button", { name: "Ask tutor", exact: true }),
  ).toBeDisabled();
  await signedIn(page, "separate-tutor-learner");
  await page.goto("/foundation-revision/MB2.3");
  await page.getByRole("button", { name: "Ask AI tutor", exact: true }).click();
  await expect(tutor.locator(".assistant")).toHaveCount(0);
});

for (const permission of ["granted", "denied"] as const) {
  test(`background reminders explicit opt-in ${permission} and unsubscribe`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ permission }) => {
        (window as any).__notificationRequests = 0;
        Object.defineProperty(window, "Notification", {
          configurable: true,
          value: class {
            static permission = "default";
            static async requestPermission() {
              (window as any).__notificationRequests++;
              this.permission = permission;
              return permission;
            }
          },
        });
        if (!("PushManager" in window)) (window as any).PushManager = class {};
        let subscribed = false;
        const data = {
          endpoint: "https://fcm.googleapis.com/fcm/send/browser-test",
          keys: { p256dh: "A".repeat(87), auth: "A".repeat(22) },
        };
        const subscription = {
          ...data,
          toJSON: () => data,
          unsubscribe: async () => {
            subscribed = false;
            return true;
          },
        };
        const registration = {
          pushManager: {
            getSubscription: async () => (subscribed ? subscription : null),
            subscribe: async () => {
              subscribed = true;
              return subscription;
            },
          },
          unregister: async () => true,
        };
        Object.defineProperty(navigator, "serviceWorker", {
          configurable: true,
          value: {
            register: async () => registration,
            ready: Promise.resolve(registration),
            getRegistration: async () => registration,
            getRegistrations: async () => [],
            addEventListener: () => {},
          },
        });
      },
      { permission },
    );
    await page.route("**/services.json", (r) =>
      r.fulfill({
        json: {
          tutorUrl: "",
          pushUrl: "/test-push",
          pushPublicKey: "A".repeat(87),
        },
      }),
    );
    const calls: { method: string; path: string; body: any }[] = [];
    await page.route("**/test-push/**", async (r) => {
      calls.push({
        method: r.request().method(),
        path: new URL(r.request().url()).pathname,
        body: r.request().postDataJSON(),
      });
      await r.fulfill({ json: { updated: true, accepted: true } });
    });
    await signedIn(page);
    await page.goto("/settings");
    expect(
      await page.evaluate(() => (window as any).__notificationRequests),
    ).toBe(0);
    await page
      .getByRole("button", { name: "Enable background reminders", exact: true })
      .click();
    if (permission === "denied") {
      await expect(
        page.getByText("Notification permission was not granted.", {
          exact: true,
        }),
      ).toBeVisible();
      expect(calls.filter((c) => c.method === "POST")).toHaveLength(0);
      return;
    }
    await expect(
      page.getByText("Background reminders enabled.", { exact: true }),
    ).toBeVisible();
    expect(
      calls.some(
        (c) => c.method === "POST" && c.path === "/test-push/subscription",
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Send a test notification" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: "Disable background reminders",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("Background reminders disabled for this browser.", {
        exact: true,
      }),
    ).toBeVisible();
    expect(calls.some((c) => c.method === "DELETE")).toBe(true);
  });
}

test("progress import previews merges and rejects invalid backups without losing newer notes", async ({
  page,
}) => {
  await signedIn(page);
  await page.goto("/settings");
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export my progress", exact: true })
    .click();
  const download = await downloaded;
  const original = JSON.parse(readFileSync((await download.path())!, "utf8"));
  original.records.notes["backup-note"] = {
    bodyMd: "Restored note",
    updatedAt: 100,
  };
  original.records.days["2026-10-20"] = {
    xp: 20,
    activities: [{ id: "backup-activity", xp: 20, track: "maths", at: 1 }],
    goalMet: true,
    xpByTrack: { maths: 20 },
  };
  const file = page.getByLabel("Progress backup file");
  await file.setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(original)),
  });
  await expect(
    page.getByRole("region", { name: "Import preview" }),
  ).toBeVisible();
  await expect(
    page.getByText("Progress imported on this device.", { exact: false }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Merge progress", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Progress imported" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!)
          .records.notes["backup-note"].bodyMd,
    ),
  ).toBe("Restored note");
  original.records.notes["backup-note"] = {
    bodyMd: "Older note",
    updatedAt: 50,
  };
  await file.setInputFiles({
    name: "again.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(original)),
  });
  await page
    .getByRole("button", { name: "Merge progress", exact: true })
    .click();
  const merged = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!)
        .records,
  );
  expect(merged.notes["backup-note"].bodyMd).toBe("Restored note");
  expect(merged.days["2026-10-20"].xp).toBe(20);
  expect(merged.days["2026-10-20"].activities).toHaveLength(1);
  await file.setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      '{"records":{"lessons":{"bad":{"status":"done"}}},"preferences":{}}',
    ),
  });
  await expect(page.getByText(/contains invalid progress/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Merge progress", exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("parallax-learning-v1:test-learner")!)
          .records.notes["backup-note"].bodyMd,
    ),
  ).toBe("Restored note");
});

test("floating tutor is reachable on mobile dashboard and uses the current lesson context", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/services.json", (r) =>
    r.fulfill({
      json: { tutorUrl: "/dock-tutor", pushUrl: "", pushPublicKey: "" },
    }),
  );
  const requests: any[] = [];
  await page.route("**/dock-tutor", (r) => {
    requests.push(r.request().postDataJSON());
    return r.fulfill({
      contentType: "text/event-stream",
      body: 'data: {"text":"Let us work through the reasoning."}\n\n',
    });
  });
  await signedIn(page);
  await page.goto("/dashboard");
  const launcher = page.getByRole("button", {
    name: "Open AI tutor",
    exact: true,
  });
  await launcher.click();
  const dialog = page.getByRole("dialog", { name: "AI tutor" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Study topic").selectOption("PB1.1");
  await dialog
    .getByLabel("Ask about this section")
    .fill("Help me revise force");
  await dialog.getByRole("button", { name: "Ask tutor", exact: true }).click();
  await expect(dialog.locator(".assistant")).toContainText("work through");
  expect(requests[0].lessonId).toBe("PB1.1");
  await page.screenshot({ path: "/tmp/parallax-tutor-mobile.png" });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(launcher).toBeFocused();
  await page.goto("/lesson/PB1.2");
  await launcher.click();
  await expect(dialog.getByText(/Helping with/)).toBeVisible();
  await dialog
    .getByLabel("Ask about this section")
    .fill("Explain this section");
  await dialog.getByRole("button", { name: "Ask tutor", exact: true }).click();
  await expect(dialog.locator(".assistant")).toContainText("work through");
  expect(requests.at(-1).lessonId).toBe("PB1.2");
  expect(requests.at(-1).sectionId).toBeTruthy();
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.screenshot({ path: "/tmp/parallax-tutor-desktop.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("tutor keeps its deployment connection when settings fail and can retry without reloading", async ({
  page,
}) => {
  let configCalls = 0;
  await page.route("**/services.json", (r) => {
    configCalls++;
    return configCalls === 1
      ? r.abort()
      : r.fulfill({
          json: {
            tutorUrl: "/reconnected-tutor",
            pushUrl: "",
            pushPublicKey: "",
          },
        });
  });
  let replies = 0;
  const reply = (r: import("@playwright/test").Route) => {
    replies++;
    return r.fulfill({
      contentType: "text/event-stream",
      body: 'data: {"text":"Connection recovered."}\n\n',
    });
  };
  await page.route("https://parallax-tutor.hirthick-ram17.workers.dev/", reply);
  await page.route("**/reconnected-tutor", reply);
  await signedIn(page);
  await page
    .getByRole("button", { name: "Open AI tutor", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText(/Could not refresh the connection/),
  ).toBeVisible();
  await expect(dialog.getByText(/awaiting connection/)).toHaveCount(0);
  await dialog.getByLabel("Ask about this section").fill("Explain force");
  await dialog.getByRole("button", { name: "Ask tutor", exact: true }).click();
  await expect(dialog.locator(".assistant")).toContainText(
    "Connection recovered",
  );
  await dialog
    .getByRole("button", { name: "Retry tutor connection", exact: true })
    .click();
  await expect(
    dialog.getByText(/Could not refresh the connection/),
  ).toHaveCount(0);
  await dialog
    .getByLabel("Ask about this section")
    .fill("Try the refreshed connection");
  await dialog.getByRole("button", { name: "Ask tutor", exact: true }).click();
  await expect(dialog.locator(".assistant")).toHaveCount(2);
  expect(replies).toBe(2);
});

test("revision transfer challenges add depth without blocking completed core checks and provider errors are actionable", async ({
  page,
}) => {
  await page.route("**/services.json", (r) =>
    r.fulfill({
      json: { tutorUrl: "/provider-error", pushUrl: "", pushPublicKey: "" },
    }),
  );
  await page.route("**/provider-error", (r) =>
    r.fulfill({
      status: 503,
      json: {
        code: "provider_access",
        error: "Cloudflare AI access needs attention in the project account.",
      },
    }),
  );
  await signedIn(page);
  await page.goto("/foundation-revision/MB2.3");
  await page.getByLabel("Revision step").selectOption("3");
  await expect(
    page.getByText("OPTIONAL TRANSFER · TRY A NEW SITUATION"),
  ).toBeVisible();
  await expect(page.getByLabel("Answer transfer-1")).toBeVisible();
  await page
    .getByRole("button", { name: "Open AI tutor", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Ask about this section").fill("Explain the sign");
  await dialog.getByRole("button", { name: "Ask tutor", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Cloudflare AI access needs attention",
  );
});

for (const mobile of [false, true]) {
  test(`voluntary learner pilot keeps real answers and gates follow-up ${mobile ? "mobile" : "desktop"}`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await signedIn(page);
    await page.goto("/settings");
    await page.getByRole("link", { name: "Open learner pilot" }).click();
    await expect(
      page.getByRole("button", { name: "Save this check" }),
    ).toBeDisabled();
    await page.getByLabel("I choose to take part").check();
    await page
      .getByLabel("Did you use help or previously see these questions?")
      .selectOption("no");
    await page.getByLabel("Answer (Pa;").fill("16000");
    await page.getByRole("button", { name: "Save this check" }).click();
    await expect(
      page.getByRole("heading", { name: "2. After studying" }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "2. After studying" }),
    ).toBeVisible();
    await page.getByLabel("I choose to take part").check();
    await page
      .getByLabel("I have studied these topics after the baseline.")
      .check();
    await page
      .getByLabel("Did you use help or previously see these questions?")
      .selectOption("yes");
    await page.getByRole("button", { name: "Save this check" }).click();
    await expect(
      page.getByRole("heading", { name: "Let the learning settle" }),
    ).toBeVisible();
    const data = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("parallax-pilot-v1:test-learner")!),
    );
    expect(data.baseline.responses.fluid.value).toBe(16000);
    expect(data.baseline.responses.heat.value).toBeNull();
    expect(data.immediate.assisted).toBe(true);
    expect(data.baseline.responses.fluid.reasoningScore).toBeUndefined();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export pilot answers" }).click();
    expect((await download).suggestedFilename()).toBe(
      "parallax-learner-pilot.json",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
