import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 grid size-12 place-items-center rounded-xl border bg-card text-muted-foreground">
          <SearchX className="size-6" aria-hidden="true" />
        </div>
        <p className="font-mono text-xs text-primary">404 / NOT_FOUND</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          This tool does not exist
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The route may have moved, or perhaps it belongs on the roadmap.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to the playground
          </Link>
        </Button>
      </div>
    </main>
  );
}
