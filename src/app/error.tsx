"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 grid size-12 place-items-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          The workbench hit a snag
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your input stays in this browser. Try reloading the playground to
          continue.
        </p>
        <Button className="mt-6" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    </main>
  );
}
