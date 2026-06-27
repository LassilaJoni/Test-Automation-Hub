import { SelectorPlayground } from "@/components/selector-playground-loader";
import { WorkbenchHeader } from "@/components/workbench-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <WorkbenchHeader />
      <main>
        <SelectorPlayground />
      </main>
    </div>
  );
}
