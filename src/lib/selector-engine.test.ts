import { describe, expect, it } from "vitest";
import { buildSafePreview, evaluateSelector } from "./selector-engine";

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
