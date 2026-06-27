export const siteConfig = {
  name: "TestBench",
  title: "TestBench — Selector Playground",
  description:
    "A fast, private XPath and CSS selector playground for test automation developers.",
  keywords: [
    "XPath tester",
    "CSS selector tester",
    "test automation",
    "selector playground",
    "web testing tools",
  ],
} as const;

export function getSiteUrl(): URL {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";
  const normalizedUrl = configuredUrl.startsWith("http")
    ? configuredUrl
    : `https://${configuredUrl}`;

  return new URL(normalizedUrl);
}
