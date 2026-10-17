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
  await page.goto("/login");
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
      "/review",
      "/revise",
      "/plan",
      "/stats",
      "/settings",
      "/placement",
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
  await page.getByRole("button", { name: "Reveal answer" }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();
  await expect(
    page.getByText("Session complete.", { exact: true }),
  ).toBeVisible();
});
test("all authored MDX drafts render their full theory and maths without parse failures", async ({
  page,
}) => {
  await signedIn(page);
  for (const id of ["MB3.2", "PB1.4", "AS1.3"]) {
    await page.goto(`/lesson/${id}`);
    await page.getByLabel("Lesson section").selectOption("puzzle");
    await page
      .getByLabel("Your prediction", { exact: true })
      .fill("I will test the assumptions before accepting the result.");
    await page.getByRole("button", { name: "Commit and investigate" }).click();
    await page.getByLabel("Lesson section").selectOption("theory");
    await page.getByRole("button", { name: "Show full theory" }).click();
    await expect(page.locator(".lesson-prose .katex").first()).toBeVisible();
    expect(await page.locator(".katex-error").count()).toBe(0);
    await page.getByLabel("Lesson section").selectOption("interactive");
    await expect(
      page.locator(".virtual-lab, .lab-example").first(),
    ).toBeVisible();
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
  for (const [i, answer] of ["3", "9", "8", "20", "0"].entries()) {
    await page.getByRole("spinbutton").fill(answer);
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
  await page.getByRole("button", { name: "Check prerequisites" }).click();
  await page.getByRole("button", { name: "Explain why" }).click();
  await page.locator(".question-card input[type=radio]").first().check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.getByRole("button", { name: "Try the transfer problem" }).click();
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
  expect(Object.keys(records.reviewLog).length).toBe(1);
});
