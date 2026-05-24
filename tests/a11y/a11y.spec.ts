import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const FIXTURE_BOOK_ID = "a11y-fixture-book";
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function runAxe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

async function startFixturePlayer(page: Page) {
  await page.goto(`/books/${FIXTURE_BOOK_ID}`);
  await page.waitForLoadState("networkidle");

  const startButton = page.getByRole("button", {
    name: /Тыңдауды бастау|жалғастыру/,
  });
  await expect(startButton).toBeEnabled();
  await startButton.click();

  const miniSlider = page.locator("#mini-player-progress");
  await expect(miniSlider).toBeEnabled({ timeout: 15_000 });
  return miniSlider;
}

async function isBackgroundHiddenFromAT(page: Page) {
  return page.locator("main#main-content").evaluate((main) => {
    let node: HTMLElement | null = main;
    while (node) {
      if (node.inert || node.getAttribute("aria-hidden") === "true") {
        return true;
      }
      node = node.parentElement;
    }
    return false;
  });
}

test.describe("WCAG axe route checks", () => {
  const routes = [
    "/",
    "/login",
    "/register",
    "/home",
    "/books",
    `/books/${FIXTURE_BOOK_ID}`,
    "/search",
    "/profile/settings",
  ];

  for (const route of routes) {
    test(`has no automated WCAG A/AA violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await runAxe(page);
    });
  }
});

test("skip link moves focus to main content", async ({ page }) => {
  await page.goto("/home");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Мазмұнға өту" })).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("main#main-content")).toBeFocused();
});

test("login and register fields have labels and predictable tab order", async ({
  page,
}) => {
  await page.goto("/login");

  const loginEmail = page.getByLabel("Email");
  const loginPassword = page.getByLabel("Пароль", { exact: true });
  await expect(loginEmail).toBeVisible();
  await expect(loginPassword).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(loginEmail).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(loginPassword).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Парольді көрсету" })
  ).toBeFocused();

  await page.goto("/register");

  const name = page.getByLabel("Аты-жөні");
  const registerEmail = page.getByLabel("Email");
  const registerPassword = page.getByLabel("Пароль", { exact: true });
  await expect(name).toBeVisible();
  await expect(registerEmail).toBeVisible();
  await expect(registerPassword).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(name).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(registerEmail).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(registerPassword).toBeFocused();
});

test("mobile nav is inert while hidden and tabbable when revealed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/home");

  const nav = page.locator('nav[aria-label="Мобильді мәзір"]');
  const links = nav.locator("a");

  await expect(nav).toHaveAttribute("aria-hidden", "true");
  await expect(links.first()).toHaveAttribute("tabindex", "-1");

  await page.mouse.click(120, 120);
  await expect(nav).not.toHaveAttribute("aria-hidden", "true");
  await expect(links.first()).not.toHaveAttribute("tabindex", "-1");
});

test("settings playback speed radios support Tab and arrow keys", async ({
  page,
}) => {
  await page.goto("/profile/settings");

  const largeTextSwitch = page.getByRole("switch", { name: "Үлкен мәтін" });
  const currentSpeed = page.getByRole("radio", {
    name: /^1x есе жылдамдық$/,
  });
  const nextSpeed = page.getByRole("radio", {
    name: /^1.25x есе жылдамдық$/,
  });

  await expect(currentSpeed).toBeChecked();
  await largeTextSwitch.focus();
  await page.keyboard.press("Tab");
  await expect(currentSpeed).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(nextSpeed).toBeChecked();
});

test("mini player range supports keyboard seeking", async ({ page }) => {
  const miniSlider = await startFixturePlayer(page);
  const before = Number(await miniSlider.inputValue());

  await miniSlider.focus();
  await page.keyboard.press("ArrowRight");

  await expect
    .poll(async () => Number(await miniSlider.inputValue()))
    .toBeGreaterThan(before);
});

test("full player and chapter dialogs trap focus and restore focus", async ({
  page,
}) => {
  await startFixturePlayer(page);

  const fullPlayerTrigger = page.getByRole("button", {
    name: "Толық ойнатқышты ашу",
    exact: true,
  });
  await fullPlayerTrigger.click();

  const fullPlayer = page.getByRole("dialog", { name: "Бастау" });
  await expect(fullPlayer).toBeVisible();
  expect(await isBackgroundHiddenFromAT(page)).toBe(true);

  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press("Tab");
    await expect
      .poll(() =>
        fullPlayer.evaluate((dialog) =>
          dialog.contains(document.activeElement)
        )
      )
      .toBe(true);
  }

  const chapterTrigger = page.getByRole("button", {
    name: "Тараулар тізімі",
    exact: true,
  });
  await chapterTrigger.click();

  const chapterDialog = page.getByRole("dialog", { name: "Тараулар" });
  await expect(chapterDialog).toBeVisible();

  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press("Tab");
    await expect
      .poll(() =>
        chapterDialog.evaluate((dialog) =>
          dialog.contains(document.activeElement)
        )
      )
      .toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(chapterDialog).toBeHidden();
  await expect(chapterTrigger).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(fullPlayer).toBeHidden();
  await expect(fullPlayerTrigger).toBeFocused();
});
