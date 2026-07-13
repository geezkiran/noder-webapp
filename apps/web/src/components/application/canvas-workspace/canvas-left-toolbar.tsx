"use client";

import { Layers, Search, Settings, Zap } from "lucide-react";

const TOOLS = [
  { icon: Search, label: "Search" },
  { icon: Settings, label: "Settings" },
  { icon: Layers, label: "Layers" },
] as const;

export function CanvasLeftToolbar() {
  return (
    <div
      className="fixed left-4 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2"
      data-canvas-static
    >
      <div className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[#71717A] shadow-[0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-sm">
        <Zap className="size-3 text-[#F59E0B]" fill="#F59E0B" strokeWidth={0} />
        8.88k
      </div>

      <nav className="flex flex-col gap-1 rounded-[20px] bg-white p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]">
        {TOOLS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className="flex size-10 items-center justify-center rounded-2xl text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#18181B]"
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </button>
        ))}
      </nav>
    </div>
  );
}
