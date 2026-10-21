import { expect, type Page } from "@playwright/test";
// Shared fixture: an inert signed-in Firebase session with Firestore and identity calls mocked.
const apiKey = "AIzaSyBSSe8XOjx3dAb4h1Ert332830tKXwHf6M";
export async function signedIn(page: Page, uid = "test-learner") {
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
