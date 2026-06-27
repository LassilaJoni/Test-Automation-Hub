import { describe, expect, it } from "vitest";
import {
  buildSafePreview,
  evaluateSelector,
  PLAYGROUND_LIMITS,
} from "./selector-engine";

const HTML = `
  <main>
    <button class="action" data-id="one">Save</button>
    <button class="action" data-id="two">Cancel</button>
    <script>window.parent.location = "https://example.com"</script>
  </main>
`;

describe("evaluateSelector", () => {
  it("finds every CSS match", () => {
    const result = evaluateSelector(HTML, "button.action", "css");

    expect(result.error).toBeUndefined();
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0].snippet).toContain("Save");
  });

  it("evaluates XPath node and scalar results", () => {
    const nodes = evaluateSelector(HTML, '//button[@data-id="two"]', "xpath");
    const count = evaluateSelector(HTML, "count(//button)", "xpath");

    expect(nodes.matches).toHaveLength(1);
    expect(nodes.matches[0].snippet).toContain("Cancel");
    expect(count.scalar).toBe("2");
  });

  it("returns selector syntax errors without throwing", () => {
    const result = evaluateSelector(HTML, "button[", "css");

    expect(result.matches).toHaveLength(0);
    expect(result.error).toBeTruthy();
  });

  it("caps rendered results to keep the interface responsive", () => {
    const repeatedElements = Array.from(
      { length: PLAYGROUND_LIMITS.renderedMatches + 1 },
      (_, index) => `<i data-index="${index}"></i>`,
    ).join("");
    const result = evaluateSelector(repeatedElements, "i", "css");

    expect(result.matches).toHaveLength(PLAYGROUND_LIMITS.renderedMatches);
    expect(result.totalMatches).toBe(PLAYGROUND_LIMITS.renderedMatches + 1);
    expect(result.truncated).toBe(true);
  });

  it("rejects oversized documents before parsing", () => {
    const result = evaluateSelector(
      "x".repeat(PLAYGROUND_LIMITS.htmlCharacters + 1),
      "*",
      "css",
    );

    expect(result.matches).toHaveLength(0);
    expect(result.error).toContain("limited");
  });
});

describe("Playwright CSS selectors", () => {
  it("supports the css= prefix and text pseudo-classes", () => {
    const containsText = evaluateSelector(
      HTML,
      'css=button:has-text("  save  ")',
      "css",
    );
    const exactText = evaluateSelector(
      HTML,
      'css=main :text-is("Cancel")',
      "css",
    );
    const regexText = evaluateSelector(
      HTML,
      'button:text-matches("^sa", "i")',
      "css",
    );

    expect(containsText.matches).toHaveLength(1);
    expect(containsText.matches[0].snippet).toContain("Save");
    expect(exactText.matches).toHaveLength(1);
    expect(exactText.matches[0].snippet).toContain("Cancel");
    expect(regexText.matches).toHaveLength(1);
  });

  it("supports :visible using static HTML visibility", () => {
    const result = evaluateSelector(
      '<button style="display:none">Hidden</button><button>Visible</button>',
      "css=button:visible",
      "css",
    );

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].snippet).toContain("Visible");
  });

  it("supports nested :has(), :nth-match(), and CSS-only chains", () => {
    const markup = `
      <main>
        <article class="card"><span>Starter</span><button>Buy</button></article>
        <article class="card"><span>Premium</span><button>Buy now</button></article>
      </main>
    `;
    const hasText = evaluateSelector(
      markup,
      '.card:has(:text-is("Premium"))',
      "css",
    );
    const nthMatch = evaluateSelector(
      markup,
      ':nth-match(button:has-text("Buy"), 2)',
      "css",
    );
    const chain = evaluateSelector(
      markup,
      'css=main >> css=button:has-text("now")',
      "css",
    );

    expect(hasText.matches).toHaveLength(1);
    expect(hasText.matches[0].snippet).toContain("Premium");
    expect(nthMatch.matches).toHaveLength(1);
    expect(nthMatch.matches[0].snippet).toContain("Buy now");
    expect(chain.matches).toHaveLength(1);
    expect(chain.matches[0].snippet).toContain("Buy now");
  });

  it("rejects deprecated layout pseudo-classes explicitly", () => {
    const result = evaluateSelector(
      HTML,
      'button:right-of(:text("Save"))',
      "css",
    );

    expect(result.error).toContain("deprecated layout selector");
  });
});

describe("buildSafePreview", () => {
  it("marks matches while removing active and remote content", () => {
    const result = evaluateSelector(HTML, "[data-id='one']", "css");
    const preview = buildSafePreview(
      `${HTML}<img src="https://example.com/tracker.png" onerror="alert(1)">`,
      result.matches,
    );

    expect(preview).toContain("data-testbench-match");
    expect(preview).not.toContain("<script>");
    expect(preview).not.toContain("tracker.png");
    expect(preview).not.toContain("onerror");
  });
});
