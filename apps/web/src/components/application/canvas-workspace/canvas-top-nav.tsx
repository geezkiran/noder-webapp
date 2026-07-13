"use client";

import {
  ChevronDown,
  ExternalLink,
  FileText,
  Hand,
  MessageCircle,
  User,
} from "lucide-react";
import { FlowithLogo } from "./flowith-logo";

const TEAM_AVATARS = [
  { initials: "A", color: "#8B5CF6" },
  { initials: "B", color: "#06B6D4" },
  { initials: "C", color: "#F59E0B" },
];

export function CanvasTopNav() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 flex h-[52px] items-center justify-between border-b border-[#E8E8EC] bg-white/80 px-4 backdrop-blur-md"
      data-canvas-static
    >
      <div className="flex min-w-0 items-center gap-3">
        <FlowithLogo className="size-5 shrink-0 text-[#18181B]" />

        <button
          type="button"
          className="flex max-w-[200px] items-center gap-1 rounded-lg px-1.5 py-1 text-sm font-medium text-[#18181B] transition-colors hover:bg-[#F4F4F5]"
        >
          <span className="truncate">Canvas name / Canvas n...</span>
          <ChevronDown className="size-3.5 shrink-0 text-[#71717A]" strokeWidth={2} />
        </button>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#18181B]"
            aria-label="Open external link"
          >
            <ExternalLink className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#18181B]"
            aria-label="Comments"
          >
            <MessageCircle className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="ml-1 flex items-center">
          <div className="flex -space-x-2">
            {TEAM_AVATARS.map((avatar) => (
              <div
                key={avatar.initials}
                className="flex size-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
                style={{ backgroundColor: avatar.color }}
              >
                {avatar.initials}
              </div>
            ))}
          </div>
          <div className="ml-1 flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#F4F4F5] text-[10px] font-medium text-[#71717A]">
            +3
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-full border border-[#E8E8EC] text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#18181B]"
          aria-label="Accessibility"
        >
          <User className="size-4" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-lg text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#18181B]"
          aria-label="Pan tool"
        >
          <Hand className="size-4" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-[#18181B] transition-colors hover:bg-[#F4F4F5]"
        >
          100%
          <ChevronDown className="size-3.5 text-[#71717A]" strokeWidth={2} />
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-[#93C5FD] bg-[#EFF6FF] px-3.5 py-1.5 text-sm font-medium text-[#2563EB] shadow-[0_1px_2px_rgba(37,99,235,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors hover:bg-[#DBEAFE]"
        >
          <FileText className="size-3.5" strokeWidth={2} />
          Editor
        </button>
      </div>
    </header>
  );
}
