"use client";

import {
  ArrowUp,
  ChevronDown,
  Grid3x3,
  Image as ImageIcon,
  LayoutGrid,
  Paperclip,
  PenLine,
  Settings,
  Sparkles,
  Type,
} from "lucide-react";

const PROMPT_TAGS = ["futuristic style", "vintage computer"];

export function CanvasBottomBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col items-center pb-5"
      data-canvas-static
    >
      <div className="relative w-full max-w-[640px] px-4 pt-12">
        {/* Dark contextual toolbar — floats above prompt, partially overlapped */}
        <div className="absolute top-0 left-1/2 z-0 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#27272A] px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-[#A1A1AA] transition-colors hover:bg-[#3F3F46] hover:text-white"
            aria-label="Grid view"
          >
            <Grid3x3 className="size-4" strokeWidth={1.75} />
          </button>

          <div className="mx-0.5 h-5 w-px bg-[#3F3F46]" />

          <button
            type="button"
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-white transition-colors hover:bg-[#3F3F46]"
            aria-label="Image"
          >
            <ImageIcon className="size-4" strokeWidth={1.75} />
            <ChevronDown className="size-3.5 text-[#A1A1AA]" strokeWidth={2} />
          </button>

          <button
            type="button"
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-white transition-colors hover:bg-[#3F3F46]"
            aria-label="Nano Banana"
          >
            <Sparkles className="size-4 text-[#A78BFA]" strokeWidth={2} />
            <ChevronDown className="size-3.5 text-[#A1A1AA]" strokeWidth={2} />
          </button>

          <div className="mx-0.5 h-5 w-px bg-[#3F3F46]" />

          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-[#A1A1AA] transition-colors hover:bg-[#3F3F46] hover:text-white"
            aria-label="Layout"
          >
            <LayoutGrid className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-[#A1A1AA] transition-colors hover:bg-[#3F3F46] hover:text-white"
            aria-label="Text"
          >
            <Type className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-[#A1A1AA] transition-colors hover:bg-[#3F3F46] hover:text-white"
            aria-label="Draw"
          >
            <PenLine className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Prompt input module */}
        <div className="relative z-10 rounded-[24px] bg-white p-4 shadow-[0_8px_40px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-[#E8E8EC]">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded-md bg-[#F4F4F5]">
              <div className="size-3 rounded-sm bg-gradient-to-br from-[#A78BFA] to-[#6366F1]" />
            </div>
            <span className="text-xs font-medium text-[#71717A]">Style</span>
          </div>

          <div className="mb-4 min-h-[48px] rounded-xl bg-[#FAFAFA] px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm text-[#A1A1AA]">Describe what you want to create...</span>
              {PROMPT_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-[#F4F4F5] px-2.5 py-1 text-xs font-medium text-[#52525B]"
                >
                  {tag}
                  <button type="button" className="text-[#A1A1AA] hover:text-[#52525B]" aria-label={`Remove ${tag}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-full text-[#A1A1AA] transition-colors hover:bg-[#F4F4F5] hover:text-[#52525B]"
                aria-label="Attach file"
              >
                <Paperclip className="size-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-full text-[#A1A1AA] transition-colors hover:bg-[#F4F4F5] hover:text-[#52525B]"
                aria-label="Settings"
              >
                <Settings className="size-4" strokeWidth={1.75} />
              </button>
            </div>

            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full bg-[#18181B] text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#27272A]"
              aria-label="Send"
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
