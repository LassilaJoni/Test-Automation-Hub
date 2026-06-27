type QueryRoot = Document | Element;

type PlaywrightFilter =
  | { kind: "has"; selector: string }
  | { kind: "has-text"; value: string }
  | { kind: "text"; value: string }
  | { kind: "text-is"; value: string }
  | { kind: "text-matches"; pattern: RegExp }
  | { kind: "visible" };

const LAYOUT_PSEUDOS = [
  "above",
  "below",
  "left-of",
  "near",
  "right-of",
] as const;
const SKIPPED_TEXT_ELEMENTS = new Set([
  "HEAD",
  "NOSCRIPT",
  "SCRIPT",
  "STYLE",
  "TEMPLATE",
]);

function splitTopLevel(input: string, delimiter: string): string[] {
  const parts: string[] = [];
  let start = 0;
  let parentheses = 0;
  let brackets = 0;
  let quote: "'" | '"' | null = null;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === "'" || character === '"') {
      quote = character;
      continue;
    }
    if (character === "(") parentheses += 1;
    if (character === ")") parentheses -= 1;
    if (character === "[") brackets += 1;
    if (character === "]") brackets -= 1;

    if (
      parentheses === 0 &&
      brackets === 0 &&
      input.startsWith(delimiter, index)
    ) {
      parts.push(input.slice(start, index));
      start = index + delimiter.length;
      index += delimiter.length - 1;
    }
  }

  if (quote || parentheses !== 0 || brackets !== 0) {
    throw new Error("Unbalanced quotes, brackets, or parentheses in selector.");
  }

  parts.push(input.slice(start));
  return parts;
}

function findClosingParenthesis(input: string, openingIndex: number): number {
  let depth = 0;
  let quote: "'" | '"' | null = null;
  let escaped = false;

  for (let index = openingIndex; index < input.length; index += 1) {
    const character = input[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === "'" || character === '"') {
      quote = character;
      continue;
    }
    if (character === "(") depth += 1;
    if (character === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  throw new Error("Unclosed Playwright pseudo-class.");
}

function parseStringLiteral(input: string): string {
  const value = input.trim();
  const quote = value[0];

  if ((quote !== '"' && quote !== "'") || value.at(-1) !== quote) {
    throw new Error("Playwright text values must be quoted.");
  }

  const body = value.slice(1, -1);
  let result = "";

  for (let index = 0; index < body.length; index += 1) {
    const character = body[index];
    if (character !== "\\") {
      result += character;
      continue;
    }

    index += 1;
    const escaped = body[index];
    if (escaped === undefined) throw new Error("Invalid trailing escape.");

    const escapes: Record<string, string> = {
      n: "\n",
      r: "\r",
      t: "\t",
    };
    result += escapes[escaped] ?? escaped;
  }

  return result;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function elementText(element: Element): string {
  if (SKIPPED_TEXT_ELEMENTS.has(element.tagName)) return "";
  if (
    element instanceof HTMLInputElement &&
    ["button", "submit"].includes(element.type)
  ) {
    return normalizeText(element.value);
  }

  const text: string[] = [];
  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text.push(node.textContent ?? "");
      return;
    }
    if (
      node instanceof Element &&
      node !== element &&
      SKIPPED_TEXT_ELEMENTS.has(node.tagName)
    ) {
      return;
    }
    node.childNodes.forEach(visit);
  };
  visit(element);

  return normalizeText(text.join(""));
}

function directTextNodes(element: Element): string[] {
  if (SKIPPED_TEXT_ELEMENTS.has(element.tagName)) return [];
  if (
    element instanceof HTMLInputElement &&
    ["button", "submit"].includes(element.type)
  ) {
    return [normalizeText(element.value)];
  }

  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => normalizeText(node.textContent ?? ""))
    .filter(Boolean);
}

function hasSmallerMatch(
  element: Element,
  predicate: (descendant: Element) => boolean,
): boolean {
  return Array.from(element.querySelectorAll("*")).some(predicate);
}

function hasInlineStyleValue(
  element: Element,
  property: string,
  values: string[],
): boolean {
  const style = element.getAttribute("style") ?? "";
  const declaration = new RegExp(
    `(?:^|;)\\s*${property}\\s*:\\s*(${values.join("|")})(?:\\s*!important)?\\s*(?:;|$)`,
    "i",
  );
  return declaration.test(style);
}

function isStaticallyVisible(element: Element): boolean {
  let current: Element | null = element;

  while (current) {
    if (
      current.hasAttribute("hidden") ||
      current.tagName === "SCRIPT" ||
      current.tagName === "STYLE" ||
      current.tagName === "TEMPLATE" ||
      (current instanceof HTMLInputElement && current.type === "hidden") ||
      hasInlineStyleValue(current, "display", ["none"]) ||
      hasInlineStyleValue(current, "visibility", ["hidden", "collapse"])
    ) {
      return false;
    }
    current = current.parentElement;
  }

  return true;
}

function replacementForPseudo(selector: string, pseudoIndex: number): string {
  const previous = selector[pseudoIndex - 1];
  return !previous || /\s/.test(previous) || [">", "+", "~", ","].includes(previous)
    ? "*"
    : "";
}

function ensurePseudoIsOnFinalCompound(
  selector: string,
  closingIndex: number,
): void {
  const remainder = selector.slice(closingIndex + 1);
  if (/^\s+[^\s]/.test(remainder) || /^[>+~]/.test(remainder.trimStart())) {
    throw new Error(
      "Playwright pseudo-classes are supported on the final compound selector.",
    );
  }
}

function extractPlaywrightFilters(selector: string): {
  nativeSelector: string;
  filters: PlaywrightFilter[];
} {
  const filters: PlaywrightFilter[] = [];
  let nativeSelector = "";
  let parentheses = 0;
  let brackets = 0;
  let quote: "'" | '"' | null = null;
  let escaped = false;

  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index];

    if (quote) {
      nativeSelector += character;
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === "'" || character === '"') {
      quote = character;
      nativeSelector += character;
      continue;
    }
    if (character === "[") brackets += 1;
    if (character === "]") brackets -= 1;

    if (character === ":" && parentheses === 0 && brackets === 0) {
      if (
        selector.startsWith(":visible", index) &&
        !/[\w-]/.test(selector[index + ":visible".length] ?? "")
      ) {
        ensurePseudoIsOnFinalCompound(selector, index + ":visible".length - 1);
        filters.push({ kind: "visible" });
        nativeSelector += replacementForPseudo(selector, index);
        index += ":visible".length - 1;
        continue;
      }

      const functionalPseudos = [
        "text-matches",
        "has-text",
        "text-is",
        "text",
        "has",
      ] as const;
      const pseudo = functionalPseudos.find((name) =>
        selector.startsWith(`:${name}(`, index),
      );

      if (pseudo) {
        const openingIndex = index + pseudo.length + 1;
        const closingIndex = findClosingParenthesis(selector, openingIndex);
        const argument = selector.slice(openingIndex + 1, closingIndex);

        ensurePseudoIsOnFinalCompound(selector, closingIndex);
        nativeSelector += replacementForPseudo(selector, index);

        if (pseudo === "has") {
          if (!argument.trim()) throw new Error(":has() requires a selector.");
          filters.push({ kind: "has", selector: argument });
        } else if (pseudo === "text-matches") {
          const argumentsList = splitTopLevel(argument, ",");
          if (argumentsList.length < 1 || argumentsList.length > 2) {
            throw new Error(":text-matches() expects a pattern and flags.");
          }
          const pattern = parseStringLiteral(argumentsList[0]);
          const flags = argumentsList[1]
            ? parseStringLiteral(argumentsList[1])
            : "";
          filters.push({
            kind: "text-matches",
            pattern: new RegExp(pattern, flags),
          });
        } else {
          filters.push({
            kind: pseudo,
            value: normalizeText(parseStringLiteral(argument)),
          });
        }

        index = closingIndex;
        continue;
      }
    }

    if (character === "(") parentheses += 1;
    if (character === ")") parentheses -= 1;
    nativeSelector += character;
  }

  return {
    nativeSelector: nativeSelector.trim() || "*",
    filters,
  };
}

function applyFilter(element: Element, filter: PlaywrightFilter): boolean {
  if (filter.kind === "visible") return isStaticallyVisible(element);
  if (filter.kind === "has") {
    return queryPlaywrightCss(element, filter.selector).length > 0;
  }

  const text = elementText(element);

  if (filter.kind === "has-text") {
    return text.toLocaleLowerCase().includes(filter.value.toLocaleLowerCase());
  }
  if (filter.kind === "text-is") {
    const matches = (candidate: Element) =>
      directTextNodes(candidate).includes(filter.value);
    return matches(element) && !hasSmallerMatch(element, matches);
  }
  if (filter.kind === "text-matches") {
    const matches = (candidate: Element) => {
      filter.pattern.lastIndex = 0;
      return filter.pattern.test(elementText(candidate));
    };
    return matches(element) && !hasSmallerMatch(element, matches);
  }

  const expected = filter.value.toLocaleLowerCase();
  const matches = (candidate: Element) =>
    elementText(candidate).toLocaleLowerCase().includes(expected);
  return matches(element) && !hasSmallerMatch(element, matches);
}

function querySelectorSegment(root: QueryRoot, selector: string): Element[] {
  const { nativeSelector, filters } = extractPlaywrightFilters(selector);
  const scopedSelector =
    root instanceof Element && /^[>+~]/.test(nativeSelector)
      ? `:scope ${nativeSelector}`
      : nativeSelector;
  const candidates = Array.from(root.querySelectorAll(scopedSelector));

  return candidates.filter((candidate) =>
    filters.every((filter) => applyFilter(candidate, filter)),
  );
}

function uniqueInDocumentOrder(elements: Element[]): Element[] {
  return Array.from(new Set(elements)).sort((first, second) => {
    const position = first.compareDocumentPosition(second);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
}

function querySelectorList(root: QueryRoot, selector: string): Element[] {
  const selectors = splitTopLevel(selector, ",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (selectors.length === 0) throw new Error("CSS selector cannot be empty.");

  return uniqueInDocumentOrder(
    selectors.flatMap((part) => querySelectorSegment(root, part)),
  );
}

function parseEnginePrefix(selector: string): string {
  const value = selector.trim();
  if (value.startsWith("css=")) return value.slice(4).trim();

  const engine = value.match(/^([a-zA-Z_][\w-]*)=/)?.[1];
  if (engine) {
    throw new Error(
      `The "${engine}=" engine is not a Playwright CSS selector.`,
    );
  }

  return value;
}

function queryNthMatch(root: QueryRoot, selector: string): Element[] | null {
  if (!selector.startsWith(":nth-match(")) return null;
  const openingIndex = ":nth-match".length;
  const closingIndex = findClosingParenthesis(selector, openingIndex);
  if (selector.slice(closingIndex + 1).trim()) return null;

  const argumentsList = splitTopLevel(
    selector.slice(openingIndex + 1, closingIndex),
    ",",
  );
  if (argumentsList.length !== 2) {
    throw new Error(":nth-match() expects a selector and a one-based index.");
  }

  const index = Number(argumentsList[1].trim());
  if (!Number.isInteger(index) || index < 1) {
    throw new Error(":nth-match() index must be a positive integer.");
  }

  const matches = queryPlaywrightCss(root, argumentsList[0]);
  return matches[index - 1] ? [matches[index - 1]] : [];
}

export function queryPlaywrightCss(
  root: QueryRoot,
  rawSelector: string,
): Element[] {
  const chain = splitTopLevel(rawSelector, ">>")
    .map(parseEnginePrefix)
    .filter(Boolean);
  if (chain.length === 0) throw new Error("CSS selector cannot be empty.");

  let roots: QueryRoot[] = [root];

  for (const selector of chain) {
    const unsupportedLayoutPseudo = LAYOUT_PSEUDOS.find((pseudo) =>
      selector.includes(`:${pseudo}(`),
    );
    if (unsupportedLayoutPseudo) {
      throw new Error(
        `:${unsupportedLayoutPseudo}() is a deprecated layout selector and is not supported in this static playground.`,
      );
    }

    roots = uniqueInDocumentOrder(
      roots.flatMap((currentRoot) => {
        const nthMatch = queryNthMatch(currentRoot, selector);
        return nthMatch ?? querySelectorList(currentRoot, selector);
      }),
    );
  }

  return roots as Element[];
}
