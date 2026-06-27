import type { SelectorMode } from "./playground-examples";

export interface SelectorMatch {
  id: string;
  label: string;
  path: string;
  snippet: string;
  nodePath: number[];
}

export interface SelectorResult {
  matches: SelectorMatch[];
  scalar?: string;
  error?: string;
}

const BLOCKED_ELEMENTS =
  "script, iframe, object, embed, link, meta, base, style, svg script";
const RESOURCE_ATTRIBUTES = new Set([
  "src",
  "srcset",
  "href",
  "xlink:href",
  "action",
  "formaction",
  "poster",
  "style",
]);

function getNodePath(node: Node, document: Document): number[] {
  const path: number[] = [];
  let current: Node | null = node;

  while (current && current !== document) {
    const parent: Node | null = current.parentNode;
    if (!parent) break;
    path.unshift(Array.prototype.indexOf.call(parent.childNodes, current));
    current = parent;
  }

  return path;
}

function resolveNodePath(document: Document, path: number[]): Node | null {
  let current: Node = document;

  for (const index of path) {
    const next: ChildNode | undefined = current.childNodes[index];
    if (!next) return null;
    current = next;
  }

  return current;
}

function getReadablePath(element: Element): string {
  const segments: string[] = [];
  let current: Element | null = element;

  while (current && segments.length < 5) {
    let segment = current.tagName.toLowerCase();
    if (current.id) {
      segment += `#${current.id}`;
      segments.unshift(segment);
      break;
    }

    const classes = Array.from(current.classList).slice(0, 2);
    if (classes.length) segment += `.${classes.join(".")}`;
    segments.unshift(segment);
    current = current.parentElement;
  }

  return segments.join(" > ");
}

function describeNode(node: Node, index: number, document: Document): SelectorMatch {
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;
  const rawSnippet =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element).outerHTML
      : node.textContent?.trim() || node.nodeName;
  const snippet = rawSnippet.replace(/\s+/g, " ").slice(0, 240);

  return {
    id: `${index}-${getNodePath(node, document).join("-")}`,
    label:
      node.nodeType === Node.ELEMENT_NODE
        ? `<${(node as Element).tagName.toLowerCase()}>`
        : node.nodeName.toLowerCase(),
    path: element ? getReadablePath(element) : node.nodeName.toLowerCase(),
    snippet: rawSnippet.length > 240 ? `${snippet}…` : snippet,
    nodePath: getNodePath(node, document),
  };
}

function collectXPathNodes(result: XPathResult): Node[] {
  const nodes: Node[] = [];

  switch (result.resultType) {
    case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
    case XPathResult.ORDERED_NODE_ITERATOR_TYPE: {
      let node = result.iterateNext();
      while (node) {
        nodes.push(node);
        node = result.iterateNext();
      }
      break;
    }
    case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
    case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
      for (let index = 0; index < result.snapshotLength; index += 1) {
        const node = result.snapshotItem(index);
        if (node) nodes.push(node);
      }
      break;
    case XPathResult.ANY_UNORDERED_NODE_TYPE:
    case XPathResult.FIRST_ORDERED_NODE_TYPE:
      if (result.singleNodeValue) nodes.push(result.singleNodeValue);
      break;
  }

  return nodes;
}

export function evaluateSelector(
  html: string,
  selector: string,
  mode: SelectorMode,
): SelectorResult {
  if (!selector.trim()) return { matches: [] };

  try {
    const document = new DOMParser().parseFromString(html, "text/html");
    let nodes: Node[] = [];

    if (mode === "css") {
      nodes = Array.from(document.querySelectorAll(selector));
    } else {
      const result = document.evaluate(
        selector,
        document,
        null,
        XPathResult.ANY_TYPE,
        null,
      );

      if (result.resultType === XPathResult.NUMBER_TYPE) {
        return { matches: [], scalar: String(result.numberValue) };
      }
      if (result.resultType === XPathResult.STRING_TYPE) {
        return { matches: [], scalar: result.stringValue };
      }
      if (result.resultType === XPathResult.BOOLEAN_TYPE) {
        return { matches: [], scalar: String(result.booleanValue) };
      }
      nodes = collectXPathNodes(result);
    }

    return {
      matches: nodes.map((node, index) =>
        describeNode(node, index, document),
      ),
    };
  } catch (error) {
    return {
      matches: [],
      error: error instanceof Error ? error.message : "Invalid selector",
    };
  }
}

export function buildSafePreview(
  html: string,
  matches: SelectorMatch[],
): string {
  const document = new DOMParser().parseFromString(html, "text/html");

  for (const match of matches) {
    const node = resolveNodePath(document, match.nodePath);
    const element =
      node?.nodeType === Node.ELEMENT_NODE
        ? (node as Element)
        : node?.parentElement;
    element?.setAttribute("data-testbench-match", "");
  }

  document.querySelectorAll(BLOCKED_ELEMENTS).forEach((element) => {
    element.remove();
  });

  document.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      if (
        attribute.name.toLowerCase().startsWith("on") ||
        RESOURCE_ATTRIBUTES.has(attribute.name.toLowerCase())
      ) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  const previewStyles = document.createElement("style");
  previewStyles.textContent = `
    :root { color-scheme: light; font-family: system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; color: #18231b; background: #f5f7f2; }
    button, input, select, textarea { font: inherit; }
    [data-testbench-match] {
      outline: 3px solid #7bd742 !important;
      outline-offset: 3px !important;
      background-color: rgba(123, 215, 66, 0.14) !important;
    }
    .pricing-page { max-width: 900px; margin: 0 auto; }
    .hero { margin-bottom: 24px; }
    .hero h1 { margin: 6px 0; font-size: clamp(24px, 5vw, 44px); letter-spacing: -0.04em; }
    .hero p { color: #657066; }
    .eyebrow { color: #3d7d1b; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }
    .pricing-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .pricing-card { position: relative; padding: 18px; border: 1px solid #dfe4dc; border-radius: 12px; background: white; }
    .pricing-card.featured { border-color: #76bf4f; box-shadow: 0 10px 24px rgba(42, 75, 27, .12); }
    .pricing-card h2 { margin: 0 0 8px; }
    .price { font-size: 24px; font-weight: 750; }
    .price span { color: #747d74; font-size: 12px; font-weight: 500; }
    .pricing-card ul { min-height: 90px; padding-left: 18px; color: #4f5b50; font-size: 13px; line-height: 1.8; }
    .pricing-card button { width: 100%; padding: 9px 12px; border: 0; border-radius: 7px; color: white; background: #1f2b21; }
    .pricing-card button:disabled { opacity: .42; }
    .plan-badge { position: absolute; top: 14px; right: 14px; color: #3d7d1b; font-size: 10px; font-weight: 800; text-transform: uppercase; }
    @media (max-width: 620px) { .pricing-grid { grid-template-columns: 1fr; } .pricing-card ul { min-height: 0; } }
  `;
  document.head.append(previewStyles);

  return `<!doctype html>${document.documentElement.outerHTML}`;
}
