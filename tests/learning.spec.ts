import { readdirSync } from "node:fs";
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
  // Seed the fake session without a running Firebase instance that could overwrite it.
  await page.route("**/__fixture-auth", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Auth fixture</title>",
    }),
  );
  await page.goto("/__fixture-auth");
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
    await page.goto("/labs");
    await page
      .getByRole("button", { name: "Record synthetic 10-cycle timing" })
      .click();
    await expect(page.getByRole("table")).toBeVisible();
    await page
      .getByRole("button", { name: "Orbit explorer", exact: true })
      .click();
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
  await page.getByRole("button", { name: "Finish lesson" }).click();
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
  await page.getByRole("button", { name: "Finish lesson" }).click();
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
  await page.goto("/labs");
  await page
    .getByRole("button", { name: "Circuit bench", exact: true })
    .click();
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
    .getByRole("button", { name: "Ask about this section", exact: true })
    .click();
  await expect(
    page.getByText("Why does mass cancel?", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Ask about this section", exact: true })
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
  await page.getByRole("button", { name: "Build this week’s plan" }).click();
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
  await page.goto("/labs");
  await page.getByRole("button", { name: "Gas piston", exact: true }).click();
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
  await page
    .getByRole("button", { name: "Standing waves", exact: true })
    .click();
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
  await page.getByRole("button", { name: "Double slit", exact: true }).click();
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
  await page.getByRole("link", { name: "Open the connected lesson →" }).click();
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
