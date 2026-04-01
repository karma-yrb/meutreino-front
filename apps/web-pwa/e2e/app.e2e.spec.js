import { expect, test } from "@playwright/test";

async function loginAs(page, email, password) {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: /Bienvenue/i })).toBeVisible();
}

async function completeSession(page) {
  await expect(page.getByRole("heading", { name: /Session en cours/i })).toBeVisible();

  for (let step = 0; step < 80; step += 1) {
    const backHomeButton = page.getByRole("button", { name: "Retour accueil" });
    if (await backHomeButton.isVisible()) {
      return;
    }

    const skipRestButton = page.getByRole("button", { name: "Passer le timer" });
    if (await skipRestButton.isVisible()) {
      await skipRestButton.click();
      continue;
    }

    const validateSetButton = page.getByRole("button", { name: "Valider la serie" });
    if (await validateSetButton.isVisible()) {
      await validateSetButton.click();
      continue;
    }

    await page.waitForTimeout(100);
  }

  throw new Error("La session ne se termine pas dans le nombre d etapes attendu.");
}

test.describe("E2E web/mobile parcours critiques", () => {
  test("user can complete a full session flow and see it in recent history", async ({ page }) => {
    await loginAs(page, "user@local", "user123");
    await page.goto("/session/lundi");

    await completeSession(page);

    await expect(page.getByTestId("session-status")).toHaveText("completed");
    await expect(page.getByText("5/5")).toBeVisible();
    await page.getByRole("button", { name: "Retour accueil" }).click();
    await expect(page.getByRole("heading", { name: /Bienvenue/i })).toBeVisible();
    await expect(page.getByText(/completed/i).first()).toBeVisible();
  });

  test("role routes are guarded for admin and coach", async ({ page }) => {
    await loginAs(page, "admin@local", "admin123");
    await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Coach" })).toHaveCount(0);
    await page.getByRole("link", { name: "Admin" }).click();
    await expect(page.getByRole("heading", { name: "Admin - Templates" })).toBeVisible();

    await page.getByRole("button", { name: "Deconnexion" }).click();
    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();

    await loginAs(page, "coach@local", "coach123");
    await expect(page.getByRole("link", { name: "Coach" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);
    await page.getByRole("link", { name: "Coach" }).click();
    await expect(page.getByRole("heading", { name: "Coach - Utilisateurs assignes" })).toBeVisible();

    await page.goto("/admin/templates");
    await expect(page.getByRole("heading", { name: /Bienvenue/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Admin - Templates" })).toHaveCount(0);
  });

  test("pwa metadata and service worker make the app installable", async ({ page }) => {
    await page.goto("/login");

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(manifestHref).toBe("/manifest.webmanifest");

    const manifestResponse = await page.request.get("/manifest.webmanifest");
    expect(manifestResponse.ok()).toBeTruthy();
    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe("MeuTreino");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(Array.isArray(manifest.icons)).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThan(0);

    const swRegistration = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) {
        return { supported: false, scriptURL: null };
      }

      const registration = await navigator.serviceWorker.ready;
      return {
        supported: true,
        scriptURL:
          registration.active?.scriptURL ??
          registration.waiting?.scriptURL ??
          registration.installing?.scriptURL ??
          null,
      };
    });

    expect(swRegistration.supported).toBeTruthy();
    expect(swRegistration.scriptURL).toContain("/sw.js");
  });
});
