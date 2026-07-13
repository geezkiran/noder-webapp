"use client";

import type { ReactNode } from "react";
import { InfiniteCanvas } from "@/components/application/infinite-canvas";
import { CanvasBottomBar } from "./canvas-bottom-bar";
import { CanvasLeftToolbar } from "./canvas-left-toolbar";
import { CanvasTopNav } from "./canvas-top-nav";

export function CanvasShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-screen overflow-hidden bg-[#F8F8FA]">
      <CanvasTopNav />
      <CanvasLeftToolbar />

      <main className="relative h-full pt-[52px] pb-[220px]">
        <InfiniteCanvas>{children}</InfiniteCanvas>
      </main>

      <CanvasBottomBar />
    </div>
  );
}
