import { Braces, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function WorkbenchHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
            <Braces className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight">
                TestBench
              </span>
              <Badge
                variant="outline"
                className="h-5 border-primary/20 bg-primary/5 px-1.5 font-mono text-[9px] uppercase text-primary"
              >
                beta
              </Badge>
            </div>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Tools for test automation developers
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
