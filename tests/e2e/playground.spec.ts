import { expect, test } from "@playwright/test";

test("evaluates selectors and highlights matches in the preview", async ({
  page,
}) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.goto("/");
  await page.waitForTimeout(1_000);

  expect(browserErrors).toEqual([]);

  await expect(
    page.getByRole("heading", { name: "Selector playground" }),
  ).toBeVisible();
  await expect(page.getByText("1 match", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Playwright text" }).click();
  await expect(page.getByLabel("CSS selector")).toHaveValue(
    'css=button:has-text("Choose Pro")',
  );
  await expect(page.getByText("1 match", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Visible buttons" }).click();
  await expect(page.getByText("3 matches", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Pro plan features" }).click();
  await expect(page.getByText("3 matches", { exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: "XPath" })).toHaveAttribute(
    "data-state",
    "active",
  );

  await page.getByRole("tab", { name: "Preview" }).click();
  const preview = page.frameLocator('iframe[title="Sanitized HTML preview"]');
  await expect(preview.locator("[data-testbench-match]")).toHaveCount(3);
  expect(browserErrors).toEqual([]);
});

test("serves deployment metadata and security headers", async (
  { request },
  testInfo,
) => {
  test.skip(testInfo.project.name !== "desktop-chromium");

  const home = await request.get("/");
  const headers = home.headers();

  expect(home.ok()).toBe(true);
  expect(headers["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-powered-by"]).toBeUndefined();

  const robots = await request.get("/robots.txt");
  await expect(robots).toBeOK();
  expect(await robots.text()).toContain("Sitemap:");

  const sitemap = await request.get("/sitemap.xml");
  await expect(sitemap).toBeOK();
  expect(await sitemap.text()).toContain("<urlset");

  const manifest = await request.get("/manifest.webmanifest");
  await expect(manifest).toBeOK();
  expect((await manifest.json()).short_name).toBe("TestBench");
});
