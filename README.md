# TestBench

TestBench is a private, browser-based selector playground for test automation
developers. Paste HTML, evaluate CSS selectors or XPath expressions, inspect
matching nodes, and preview highlighted results without uploading the document
to a server.

## Stack

- Next.js 16 App Router and React 19
- TypeScript in strict mode
- Tailwind CSS and shadcn/ui
- CodeMirror 6
- Vitest and Playwright
- pnpm and Node.js 22

## Local development

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

The end-to-end suite serves the production build on port `3100`, so run
`pnpm build` before `pnpm test:e2e`.

## Deploy to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the repository in the Vercel dashboard.
3. Keep the detected Next.js framework settings and root directory.
4. Optionally set `NEXT_PUBLIC_SITE_URL` to the final custom domain. When it is
   omitted, Vercel's production URL is used for metadata and the sitemap.
5. Deploy.

No database, API keys, or other environment variables are required. The
`package.json` pins Node.js 22 and pnpm 10.4.1 for reproducible Vercel builds.
Vercel Git integration will create previews for branches and production
deployments from the configured production branch.

## Security model

- Selector evaluation runs only in the user's browser.
- Markup is parsed in a detached document.
- Preview markup has scripts, event handlers, navigation, embedded content,
  remote-resource attributes, and author styles removed.
- The preview runs in a sandboxed iframe without script or same-origin access.
- Production responses include CSP, clickjacking, MIME-sniffing, referrer, and
  browser-permission restrictions.
- Input size and rendered-match limits protect the tab from accidental
  resource exhaustion.

## Optional environment variable

Copy `.env.example` to `.env.local` only if you want canonical URLs to use a
specific domain during local production builds.
