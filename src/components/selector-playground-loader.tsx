"use client";

import dynamic from "next/dynamic";

export const SelectorPlayground = dynamic(
  () =>
    import("@/components/selector-playground").then(
      (module) => module.SelectorPlayground,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        <div className="h-[680px] animate-pulse rounded-xl border bg-card/60" />
      </div>
    ),
  },
);
