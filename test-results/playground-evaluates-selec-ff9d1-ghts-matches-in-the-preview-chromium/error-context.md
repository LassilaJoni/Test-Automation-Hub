# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: playground.spec.ts >> evaluates selectors and highlights matches in the preview
- Location: tests\e2e\playground.spec.ts:3:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "WebSocket connection to 'ws://127.0.0.1:3000/_next/webpack-hmr?id=EZSHTH_g3TYSGyRGAUyzT' failed: Error during WebSocket handshake: net::ERR_INVALID_HTTP_RESPONSE",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - img [ref=e7]
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]: TestBench
            - generic [ref=e13]: beta
          - paragraph [ref=e14]: Tools for test automation developers
      - generic [ref=e15]:
        - img [ref=e16]
        - text: Runs locally in your browser
  - main [ref=e22]
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test("evaluates selectors and highlights matches in the preview", async ({
  4  |   page,
  5  | }) => {
  6  |   const browserErrors: string[] = [];
  7  |   page.on("console", (message) => {
  8  |     if (message.type() === "error") browserErrors.push(message.text());
  9  |   });
  10 |   page.on("pageerror", (error) => browserErrors.push(error.message));
  11 | 
  12 |   await page.goto("/");
  13 |   await page.waitForTimeout(1_000);
  14 | 
> 15 |   expect(browserErrors).toEqual([]);
     |                         ^ Error: expect(received).toEqual(expected) // deep equality
  16 | 
  17 |   await expect(
  18 |     page.getByRole("heading", { name: "Selector playground" }),
  19 |   ).toBeVisible();
  20 |   await expect(page.getByText("1 match", { exact: true })).toBeVisible();
  21 | 
  22 |   await page.getByRole("button", { name: "Pro plan features" }).click();
  23 |   await expect(page.getByText("3 matches", { exact: true })).toBeVisible();
  24 |   await expect(page.getByRole("tab", { name: "XPath" })).toHaveAttribute(
  25 |     "data-state",
  26 |     "active",
  27 |   );
  28 | 
  29 |   await page.getByRole("tab", { name: "Preview" }).click();
  30 |   const preview = page.frameLocator('iframe[title="Sanitized HTML preview"]');
  31 |   await expect(preview.locator("[data-testbench-match]")).toHaveCount(3);
  32 |   expect(browserErrors).toEqual([]);
  33 | });
  34 | 
```