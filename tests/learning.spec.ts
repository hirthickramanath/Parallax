import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
const apiKey = "AIzaSyBSSe8XOjx3dAb4h1Ert332830tKXwHf6M";
async function signedIn(page: Page, uid = "test-learner") {
  await page.route("https://firestore.googleapis.com/**", (route) =>
    route.abort(),
  );
  await page.route("https://identitytoolkit.googleapis.com/**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        users: [
          {
            localId: uid,
            email: "learner@example.com",
            emailVerified: true,
            displayName: "Test Learner",
            providerUserInfo: [
              {
                providerId: "google.com",
                rawId: uid,
                email: "learner@example.com",
                displayName: "Test Learner",
              },
            ],
          },
        ],
      }),
    }),
  );
  // A navigation handled by an existing service worker can bypass page.route.
  // Remove that registration before entering the inert fixture, then verify it.
  // The app registers its worker again on normal startup; offline tests retain it.
  const originPage = page
    .context()
    .pages()
    .find((candidate) => candidate.url().startsWith("http://127.0.0.1:4183/"));
  if (originPage) {
    await originPage.evaluate(async () => {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map((registration) => registration.unregister()),
        );
      }
    });
  }
  // Seed the fake session without a running Firebase instance that could overwrite it.
  await page.route("**/__fixture-auth", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Auth fixture</title>",
    }),
  );
  await page.goto("/__fixture-auth");
  await expect(page).toHaveTitle("Auth fixture");
  await page.evaluate(
    async ({ apiKey, uid }) => {
      const token = [
        btoa(JSON.stringify({ alg: "none" })),
        btoa(
          JSON.stringify({
            sub: uid,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
            aud: "parallax-73",
            iss: "https://securetoken.google.com/parallax-73",
          }),
        ),
        "test",
      ].join(".");
      const value = {
        uid,
        email: "learner@example.com",
        emailVerified: true,
        displayName: "Test Learner",
        isAnonymous: false,
        providerData: [
          {
            providerId: "google.com",
            uid,
            displayName: "Test Learner",
            email: "learner@example.com",
            phoneNumber: null,
            photoURL: null,
          },
        ],
        stsTokenManager: {
          refreshToken: "test-refresh",
          accessToken: token,
          expirationTime: Date.now() + 3600000,
        },
        createdAt: String(Date.now()),
        lastLoginAt: String(Date.now()),
        apiKey,
        appName: "[DEFAULT]",
      };
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("firebaseLocalStorageDb", 1);
        request.onupgradeneeded = () =>
          request.result.createObjectStore("firebaseLocalStorage", {
            keyPath: "fbase_key",
          });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("firebaseLocalStorage", "readwrite");
          tx.objectStore("firebaseLocalStorage").put({
            fbase_key: `firebase:authUser:${apiKey}:[DEFAULT]`,
            value,
          });
          tx.onabort = () => reject(tx.error);
          tx.onerror = () => reject(tx.error);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      });
    },
    { apiKey, uid },
  );
  await page.goto("/");
  await expect(page).toHaveURL("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Ready, Test?" }),
  ).toBeVisible();
}
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
  await page.getByLabel("Appearance").selectOption("dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByLabel("Appearance").selectOption("light");
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
  await page.getByLabel("First resistance").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("table")).toHaveCount(0);
});
test("saved tutor messages restore per account even with live tutoring disabled", async ({
  page,
}) => {
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
  await page.getByLabel("Gas volume ratio").fill("2");
  await expect(page.getByText(/Temperature: 300.0 K/)).toBeVisible();
  await page
    .getByRole("button", { name: "Record gas reading", exact: true })
    .click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByLabel("Thermodynamic path").selectOption("adiabatic");
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
  await page.getByLabel("String phase").fill("0");
  await expect(
    page.getByRole("img", {
      name: "Standing string harmonic 2 with 3 fixed nodes",
    }),
  ).toBeVisible();
  await openSimulation(page, "Double slit");
  await expect(
    page.getByText(/Predicted small-angle fringe spacing: 2.000 mm/),
  ).toBeVisible();
  await page.getByLabel("Slit separation").fill("1");
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
  const question = page
    .locator(".question-card")
    .filter({ has: page.getByRole("heading", { name: /floor\(1\/ε\)/ }) });
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
  await page.getByLabel("Slab source function").fill("20");
  await expect(page.getByText(/Output: 15.000/)).toBeVisible();
  await page
    .getByRole("button", { name: "Record slab reading", exact: true })
    .click();
  await expect(page.getByRole("table").getByRole("row")).toHaveCount(3);
  await page.getByLabel("Slab optical depth").fill("");
  await expect(page.getByRole("alert")).toHaveText(
    "Enter a finite optical depth from 0 to 10.",
  );
  await page.getByLabel("Slab optical depth").fill("0");
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
  await page.getByLabel("Radial speed beta").fill("0");
  await expect(page.getByText(/Observed wavelength: 500.00 nm/)).toBeVisible();
  await page.getByLabel("Radial speed beta").fill("-0.6");
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
  await page.getByLabel("Field probe radius").fill("2");
  await expect(
    page.getByText(/field has no single assigned value/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Record spherical reading", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Field probe radius").fill("4");
  await expect(page.getByText(/Radial field: 0.0625/)).toBeVisible();
  await page.getByLabel("Total sphere charge").fill("-1");
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
  await expect(page.getByLabel("Total oscillator energy")).toHaveText("0.0400");
  await page.getByLabel("Time (s)", { exact: true }).fill("7");
  await expect(page.getByLabel("Total oscillator energy")).toHaveText("0.0400");
  await page
    .getByRole("button", { name: "Opposite phase", exact: true })
    .click();
  await expect(page.getByLabel("Total oscillator energy")).toHaveText("0.1200");
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
  await page.getByLabel("PDE initial shape").selectOption("First mode");
  const initial = Number(
    await page.getByLabel("PDE squared norm").textContent(),
  );
  expect(initial).toBeCloseTo(Math.PI / 2, 5);
  await page.getByLabel("PDE time", { exact: true }).fill("1");
  expect(
    Number(await page.getByLabel("PDE squared norm").textContent()),
  ).toBeCloseTo((Math.PI / 2) * Math.exp(-2), 5);
  await page.getByRole("button", { name: "Record PDE reading" }).click();
  await page.getByRole("button", { name: "Wave motion", exact: true }).click();
  const energy = await page.getByLabel("PDE wave energy").textContent();
  await page.getByLabel("PDE time", { exact: true }).fill("1.5");
  await expect(page.getByLabel("PDE wave energy")).toHaveText(energy!);
  expect(
    Number(await page.getByLabel("PDE squared norm").textContent()),
  ).toBeLessThan(0.01);
  await page.getByLabel("PDE initial shape").selectOption("Third mode");
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
  await page.getByLabel("Complex path angle").fill("270");
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
  await page.getByLabel("Appearance", { exact: true }).selectOption("dark");
  await page.getByLabel("Color theme", { exact: true }).selectOption("cosmic");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "cosmic");
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
  await expect(page.locator(".journey-map select")).toHaveValue("0");
  await expect(page.locator(".current-level")).toContainText("PB1.1");
  await page.goto("/lesson/PB1.1");
  await expect(
    page.locator(".app-sidebar,.app-topbar,.mobile-nav"),
  ).toHaveCount(0);
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
  const box = (await probe.boundingBox())!;
  const scale = Math.min(box.width / 400, box.height / 260);
  await probe.locator("circle").hover();
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
