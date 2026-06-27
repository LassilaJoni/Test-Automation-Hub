import { AlertTriangle, CheckCircle2, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SelectorResult } from "@/lib/selector-engine";

interface MatchListProps {
  result: SelectorResult;
}

export function MatchList({ result }: MatchListProps) {
  if (result.error) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 grid size-10 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium">Selector could not be evaluated</p>
        <p className="mt-1 max-w-sm font-mono text-xs leading-5 text-muted-foreground">
          {result.error}
        </p>
      </div>
    );
  }

  if (result.scalar !== undefined) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          XPath value
        </p>
        <p className="mt-3 max-w-full break-all font-mono text-2xl font-semibold text-primary">
          {result.scalar || '""'}
        </p>
      </div>
    );
  }

  if (result.matches.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
          <SearchX className="size-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium">No matching nodes</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try a broader selector or inspect the HTML structure.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[352px]">
      <ol className="divide-y">
        {result.matches.map((match, index) => (
          <li key={match.id} className="group px-4 py-3 hover:bg-muted/35">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-primary/10 font-mono text-[10px] font-semibold text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="h-5 rounded px-1.5 font-mono text-[10px]"
                  >
                    {match.label}
                  </Badge>
                  <CheckCircle2
                    className="size-3 text-primary opacity-70"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-1.5 truncate font-mono text-[11px] text-muted-foreground">
                  {match.path}
                </p>
                <code className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap rounded-md border bg-background/70 px-2 py-1.5 font-mono text-[10px] text-foreground/70">
                  {match.snippet}
                </code>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
}
