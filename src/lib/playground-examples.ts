export type SelectorMode = "css" | "xpath";

export const DEFAULT_HTML = `<main class="pricing-page">
  <header class="hero">
    <span class="eyebrow">Simple, predictable pricing</span>
    <h1>Ship tests with confidence.</h1>
    <p>Choose the workspace that fits your team.</p>
  </header>

  <section class="pricing-grid" aria-label="Pricing plans">
    <article class="pricing-card" data-plan="starter">
      <h2>Starter</h2>
      <p class="price">$0 <span>/ month</span></p>
      <ul>
        <li class="feature-item">3 projects</li>
        <li class="feature-item">Community support</li>
      </ul>
      <button type="button">Start free</button>
    </article>

    <article class="pricing-card featured" data-plan="pro">
      <span class="plan-badge">Most popular</span>
      <h2>Pro</h2>
      <p class="price">$24 <span>/ month</span></p>
      <ul>
        <li class="feature-item">Unlimited projects</li>
        <li class="feature-item">Parallel test runs</li>
        <li class="feature-item">Priority support</li>
      </ul>
      <button type="button" data-testid="choose-pro">Choose Pro</button>
    </article>

    <article class="pricing-card" data-plan="scale">
      <h2>Scale</h2>
      <p class="price">Custom</p>
      <ul>
        <li class="feature-item">SAML SSO</li>
        <li class="feature-item">Dedicated support</li>
      </ul>
      <button type="button" disabled>Contact sales</button>
    </article>
  </section>
</main>`;

export const DEFAULT_SELECTORS: Record<SelectorMode, string> = {
  css: '.pricing-card[data-plan="pro"] button',
  xpath: '//article[@data-plan="pro"]//button',
};

export const EXAMPLES: Array<{
  label: string;
  mode: SelectorMode;
  selector: string;
}> = [
  {
    label: "Data attribute",
    mode: "css",
    selector: '[data-testid="choose-pro"]',
  },
  {
    label: "All enabled buttons",
    mode: "css",
    selector: "button:not(:disabled)",
  },
  {
    label: "Cards with features",
    mode: "css",
    selector: ".pricing-card:has(.feature-item)",
  },
  {
    label: "Button by text",
    mode: "xpath",
    selector: '//button[normalize-space()="Choose Pro"]',
  },
  {
    label: "Pro plan features",
    mode: "xpath",
    selector: '//article[@data-plan="pro"]//li',
  },
];
