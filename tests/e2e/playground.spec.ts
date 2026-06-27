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
