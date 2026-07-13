"use client";

import type { ReactNode } from "react";
import { InfiniteCanvas } from "@/components/application/infinite-canvas";
import { SidebarToggle } from "./sidebar-toggle";
import { useSidebar } from "./sidebar-context";
import { cx } from "@/utils/cx";

export function MainContent({ children }: { children: ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <main
      className={cx(
        "relative h-screen min-h-0 flex-1 overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "rounded-3xl bg-primary shadow-lg" : "w-full bg-primary"
      )}
    >
      <div className="absolute inset-x-0 top-0 z-10 px-6 pt-6 md:px-8 md:pt-8" data-canvas-static>
        <SidebarToggle />
      </div>

      <InfiniteCanvas className="h-full">{children}</InfiniteCanvas>
    </main>
  );
}
