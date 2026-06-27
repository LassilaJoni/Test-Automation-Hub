"use client";

interface PreviewPaneProps {
  document: string;
}

export function PreviewPane({ document }: PreviewPaneProps) {
  return (
    <iframe
      title="Sanitized HTML preview"
      sandbox=""
      srcDoc={document}
      className="h-[352px] w-full bg-white"
    />
  );
}
