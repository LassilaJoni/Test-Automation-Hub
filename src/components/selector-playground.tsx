"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Braces,
  Check,
  ChevronRight,
  CircleDot,
  Clipboard,
  Code2,
  FileJson2,
  FlaskConical,
  Hash,
  PanelTop,
  RefreshCcw,
  Regex,
  SearchCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { MatchList } from "@/components/match-list";
import { PreviewPane } from "@/components/preview-pane";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DEFAULT_HTML,
  DEFAULT_SELECTORS,
  EXAMPLES,
  type SelectorMode,
} from "@/lib/playground-examples";
import { buildSafePreview, evaluateSelector } from "@/lib/selector-engine";

const FUTURE_TOOLS = [
  { label: "JSON formatter", icon: FileJson2 },
  { label: "Regex tester", icon: Regex },
  { label: "Header inspector", icon: PanelTop },
];

export function SelectorPlayground() {
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [mode, setMode] = useState<SelectorMode>("css");
  const [selectors, setSelectors] = useState(DEFAULT_SELECTORS);
  const [copied, setCopied] = useState(false);

  const selector = selectors[mode];
  const result = useMemo(
    () => evaluateSelector(html, selector, mode),
    [html, mode, selector],
  );
  const previewDocument = useMemo(
    () => buildSafePreview(html, result.matches),
    [html, result.matches],
  );

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  function updateSelector(value: string) {
    setSelectors((current) => ({ ...current, [mode]: value }));
  }

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setMode(example.mode);
    setSelectors((current) => ({
      ...current,
      [example.mode]: example.selector,
    }));
  }

  function resetPlayground() {
    setHtml(DEFAULT_HTML);
    setSelectors(DEFAULT_SELECTORS);
    setMode("css");
  }

  async function copySelector() {
    await navigator.clipboard.writeText(selector);
    setCopied(true);
  }

  return (
    <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden min-h-[calc(100vh-4rem)] border-r bg-background/70 px-3 py-6 lg:block">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </p>
        <nav className="mt-3 space-y-1" aria-label="Developer tools">
          <a
            href="#playground"
            className="flex items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2.5 text-xs font-medium text-primary"
          >
            <SearchCode className="size-4" aria-hidden="true" />
            Selector playground
            <ChevronRight className="ml-auto size-3" aria-hidden="true" />
          </a>

          <Separator className="my-4" />
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Coming next
          </p>
          {FUTURE_TOOLS.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground"
            >
              <Icon className="size-4 opacity-60" aria-hidden="true" />
              {label}
              <span className="ml-auto rounded border px-1 py-0.5 font-mono text-[8px]">
                SOON
              </span>
            </div>
          ))}
        </nav>

        <div className="mt-8 rounded-xl border bg-card/70 p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            Private by default
          </div>
          <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
            Your HTML and selectors never leave this browser tab.
          </p>
        </div>
      </aside>

      <section id="playground" className="min-w-0 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 border-primary/25 bg-primary/5 text-[10px] text-primary"
              >
                <CircleDot className="size-3" aria-hidden="true" />
                LIVE EVALUATION
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              Selector playground
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Paste HTML, write a selector, and inspect every match instantly.
              Native browser APIs, zero uploads.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={resetPlayground}
          >
            <RefreshCcw className="size-3.5" aria-hidden="true" />
            Reset example
          </Button>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
          <Card className="top-glow panel-shadow min-w-0 gap-0 overflow-hidden border-border/80 bg-card/92 py-0">
            <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-medium">HTML document</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                <span>{html.split("\n").length} lines</span>
                <span className="size-1 rounded-full bg-border" />
                <span>HTML</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <CodeEditor value={html} onChange={setHtml} />
            </CardContent>
          </Card>

          <div className="min-w-0 space-y-5">
            <Card className="panel-shadow gap-0 border-border/80 bg-card/92 py-0">
              <CardHeader className="border-b px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FlaskConical
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium">Selector query</span>
                  </div>
                  <Tabs
                    value={mode}
                    onValueChange={(value) => setMode(value as SelectorMode)}
                  >
                    <TabsList className="h-8">
                      <TabsTrigger
                        value="css"
                        className="h-6 px-2.5 font-mono text-[10px]"
                      >
                        CSS
                      </TabsTrigger>
                      <TabsTrigger
                        value="xpath"
                        className="h-6 px-2.5 font-mono text-[10px]"
                      >
                        XPath
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="selector" className="sr-only">
                    {mode === "css" ? "CSS selector" : "XPath expression"}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      <Hash
                        className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <Input
                        id="selector"
                        value={selector}
                        onChange={(event) => updateSelector(event.target.value)}
                        spellCheck={false}
                        className="h-10 pl-9 font-mono text-xs"
                        placeholder={
                          mode === "css"
                            ? '.card[data-state="active"]'
                            : '//button[@type="submit"]'
                        }
                      />
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-10 shrink-0"
                          onClick={copySelector}
                          aria-label="Copy selector"
                        >
                          {copied ? (
                            <Check className="size-4 text-primary" />
                          ) : (
                            <Clipboard className="size-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copied ? "Copied" : "Copy selector"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    <Sparkles className="size-3" aria-hidden="true" />
                    Try an example
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {EXAMPLES.map((example) => (
                      <Button
                        key={example.label}
                        variant="outline"
                        size="sm"
                        className="h-7 bg-background/40 px-2.5 text-[10px] text-muted-foreground hover:text-foreground"
                        onClick={() => applyExample(example)}
                      >
                        {example.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div
                  className="flex items-center justify-between rounded-lg border bg-background/50 px-3 py-2"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${
                        result.error
                          ? "bg-destructive"
                          : result.matches.length > 0 ||
                              result.scalar !== undefined
                            ? "bg-primary"
                            : "bg-muted-foreground"
                      }`}
                    />
                    <span className="text-xs">
                      {result.error
                        ? "Invalid selector"
                        : result.scalar !== undefined
                          ? "Scalar result"
                          : `${result.matches.length} ${
                              result.matches.length === 1 ? "match" : "matches"
                            }`}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    {mode === "css"
                      ? "querySelectorAll"
                      : "document.evaluate"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="panel-shadow gap-0 overflow-hidden border-border/80 bg-card/92 py-0">
              <Tabs defaultValue="matches">
                <CardHeader className="border-b px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Braces className="size-4 text-primary" aria-hidden="true" />
                      <span className="text-xs font-medium">Inspector</span>
                    </div>
                    <TabsList className="h-8">
                      <TabsTrigger value="matches" className="h-6 text-[10px]">
                        Matches
                        {!result.error && (
                          <span className="ml-1 rounded bg-background px-1 font-mono text-[9px]">
                            {result.matches.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="h-6 text-[10px]">
                        Preview
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <TabsContent value="matches" className="mt-0">
                  <MatchList result={result} />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <PreviewPane document={previewDocument} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3" aria-hidden="true" />
            Preview is sanitized and isolated in a sandbox
          </span>
          <span className="font-mono">
            CSS Selectors Level 4 · XPath 1.0
          </span>
        </div>
      </section>
    </div>
  );
}
