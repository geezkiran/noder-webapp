"use client";

import { PanelLeft } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { cx } from "@/utils/cx";

export function SidebarToggle() {
  const { isOpen, toggle } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isOpen ? "Hide sidebar" : "Show sidebar"}
      aria-pressed={isOpen}
      data-canvas-static
      className="mb-0 flex h-10 w-10 items-center justify-center rounded-xl bg-transparent text-fg-secondary transition hover:text-fg-secondary_hover"
    >
      <PanelLeft className={cx("size-5 transition-transform duration-300", !isOpen && "scale-x-[-1]")} />
    </button>
  );
}
