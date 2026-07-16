"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, History, Paperclip, Sparkle, SquarePen, Square } from "lucide-react";
import { SidePanelIcon } from "@/components/icons/side-panel-icon";
import { MobileNavMenu } from "./mobile-nav-menu";
import type { DockNavItem } from "./dock-nav-column";
import { useAuth } from "@/contexts/auth-context";
import { aiQuery } from "@/lib/api/ai";
import type { AiQuerySource } from "@/lib/api/types";
import { cx } from "@/utils/cx";

const PROGRESSIVE_BLUR_LAYERS = [
  { blur: "18px", height: 18 },
  { blur: "12px", height: 32 },
  { blur: "6px", height: 46 },
  { blur: "2px", height: 64 },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: AiQuerySource[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

const SUGGESTIONS = [
  "Summarize what's trending in my feed",
  "Find nodes about design systems",
  "What did I save last week?",
  "Explain the prerequisites for this topic",
];

function newSession(): ChatSession {
  return { id: crypto.randomUUID(), title: "New chat", messages: [], updatedAt: Date.now() };
}

function titleFromMessage(text: string) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
}

// ─── Autosize textarea ────────────────────────────────────────────────────────

function useAutosize(ref: React.RefObject<HTMLTextAreaElement | null>, value: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [ref, value]);
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl bg-neutral-200 px-4 py-2.5 text-[15px] leading-relaxed text-primary dark:bg-neutral-800">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="max-w-[80%] pt-1 text-[15px] leading-relaxed text-primary">{message.content}</div>
      {message.sources && message.sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {message.sources.map((s) => (
            <span
              key={s.id}
              title={s.summary ?? undefined}
              className="rounded-full border-[0.5px] border-gray-300 bg-white px-2.5 py-1 text-xs text-tertiary dark:border-neutral-800 dark:bg-[#161616]"
            >
              {s.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Composer (shared by empty + active states) ──────────────────────────────

function Composer({
  value,
  onChange,
  onSubmit,
  isGenerating,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  autoFocus?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useAutosize(textareaRef, value);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !isGenerating;

  return (
    <div className="flex flex-col gap-2 rounded-3xl border-[0.5px] border-gray-300 bg-white px-3.5 py-2.5 shadow-sm dark:border-neutral-800 dark:bg-[#161616]">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message…"
        className="max-h-[200px] w-full resize-none overflow-y-auto bg-transparent pl-1 text-base leading-relaxed text-primary outline-none scrollbar-hide placeholder-quaternary md:text-[15px]"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Attach file"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-quaternary transition-colors hover:bg-secondary hover:text-secondary"
          >
            <Paperclip className="size-[18px]" />
          </button>
          <span className="px-2 text-[13px] font-medium text-secondary">Claude Sonnet 4.6</span>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSend && !isGenerating}
          aria-label={isGenerating ? "Stop generating" : "Send message"}
          className={cx(
            "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
            isGenerating
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : canSend
                ? "bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                : "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600",
          )}
        >
          {isGenerating ? <Square className="size-3.5 fill-current" /> : <ArrowUp className="size-[18px]" strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}

// ─── History dropdown ─────────────────────────────────────────────────────────

function HistoryPanel({
  sessions,
  activeId,
  onSelect,
  onClose,
}: {
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <>
      <button
        type="button"
        aria-label="Close chat history"
        className="fixed inset-0 z-30 cursor-default"
        onClick={onClose}
      />
      <div className="absolute right-0 top-11 z-40 w-72 overflow-hidden rounded-2xl border-[0.5px] border-gray-300 bg-white py-1.5 shadow-lg dark:border-neutral-800 dark:bg-[#161616]">
        {sorted.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-sm text-tertiary">No chats yet.</div>
        ) : (
          <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto px-1.5 scrollbar-hide">
            {sorted.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => { onSelect(session.id); onClose(); }}
                className={cx(
                  "flex flex-col items-start gap-0.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                  session.id === activeId
                    ? "bg-neutral-200 dark:bg-neutral-800"
                    : "hover:bg-secondary",
                )}
              >
                <span className="w-full truncate text-sm font-medium text-primary">{session.title}</span>
                {session.messages.length > 0 && (
                  <span className="w-full truncate text-xs text-tertiary">
                    {session.messages[session.messages.length - 1].content}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── ChatColumn ───────────────────────────────────────────────────────────────

export function ChatColumn({
  onShowFeed,
  showSuggestions = true,
  mobileNavItems,
}: {
  onShowFeed?: () => void;
  showSuggestions?: boolean;
  mobileNavItems?: DockNavItem[];
}) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => [newSession()]);
  const [activeId, setActiveId] = useState(() => sessions[0].id);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { status } = useAuth();

  const active = sessions.find((s) => s.id === activeId) ?? sessions[0];
  const messages = active.messages;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isGenerating) return;

      if (status !== "authenticated") {
        router.push("/login");
        return;
      }

      const sessionId = active.id;
      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, messages: [...s.messages, userMsg], title: s.messages.length === 0 ? titleFromMessage(trimmed) : s.title, updatedAt: Date.now() }
            : s,
        ),
      );
      setInput("");
      setIsGenerating(true);

      aiQuery({ query: trimmed })
        .then((result) => {
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: result.answer,
            sources: result.sources,
          };
          setSessions((prev) =>
            prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() } : s)),
          );
        })
        .catch(() => {
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Something went wrong reaching the AI service. Try again in a moment.",
          };
          setSessions((prev) =>
            prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() } : s)),
          );
        })
        .finally(() => setIsGenerating(false));
    },
    [active.id, isGenerating, status, router],
  );

  const startNewChat = useCallback(() => {
    if (active.messages.length === 0) return;
    const session = newSession();
    setSessions((prev) => [...prev, session]);
    setActiveId(session.id);
    setInput("");
  }, [active.messages.length]);

  const isEmpty = messages.length === 0;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl">
      {isEmpty ? (
        // ── Empty state — centered greeting + composer, ChatGPT/Claude style ──
        <div className="flex h-full w-full flex-col items-center justify-center px-6">
          <div className="w-full max-w-[640px]">
            <h1 className="mb-6 text-center text-2xl font-medium text-primary">
              What are you looking into today?
            </h1>
            <Composer
              value={input}
              onChange={setInput}
              onSubmit={() => send(input)}
              isGenerating={isGenerating}
            />
            {showSuggestions && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border-[0.5px] border-gray-300 bg-white px-3.5 py-1.5 text-[13px] text-secondary transition-colors hover:bg-secondary dark:border-neutral-800 dark:bg-[#161616]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Scrollable message list */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-4 pt-20 scrollbar-hide">
            <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isGenerating && (
                <div className="flex gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
                    <Sparkle className="size-3.5 fill-white text-white dark:fill-neutral-900 dark:text-neutral-900" />
                  </div>
                  <div className="flex items-center gap-1 pt-3">
                    <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-neutral-400" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Composer pinned at bottom */}
          <div className="mx-auto w-full max-w-[720px] shrink-0 px-6 pb-5">
            <Composer
              value={input}
              onChange={setInput}
              onSubmit={() => send(input)}
              isGenerating={isGenerating}
            />
          </div>
        </>
      )}

      {/* Progressive blur — four stacked layers, heaviest→lightest top→down */}
      {!isEmpty && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 overflow-hidden rounded-t-3xl"
          style={{ height: PROGRESSIVE_BLUR_LAYERS[PROGRESSIVE_BLUR_LAYERS.length - 1].height }}
        >
          {PROGRESSIVE_BLUR_LAYERS.map(({ blur, height }, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-t-3xl"
              style={{
                position: "absolute",
                inset: 0,
                height,
                backdropFilter: `blur(${blur})`,
                WebkitBackdropFilter: `blur(${blur})`,
                maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
              }}
            />
          ))}
        </div>
      )}

      {/* Floating title + new chat / history controls */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-3 px-8 py-5">
        {mobileNavItems ? (
          <div className="pointer-events-auto min-w-0 flex-1">
            <MobileNavMenu items={mobileNavItems} title="Chat" />
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            {!isEmpty && <h2 className="truncate text-2xl font-medium text-primary">Chat</h2>}
          </div>
        )}
        <div className="pointer-events-auto relative flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={startNewChat}
            aria-label="New chat"
            title="New chat"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-quaternary transition-colors hover:bg-secondary hover:text-secondary"
          >
            <SquarePen className="size-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            aria-label="Chat history"
            title="Chat history"
            className={cx(
              "flex size-8 shrink-0 items-center justify-center rounded-lg text-quaternary transition-colors hover:bg-secondary hover:text-secondary",
              historyOpen && "bg-secondary text-secondary",
            )}
          >
            <History className="size-[18px]" />
          </button>
          {onShowFeed && (
            <button
              type="button"
              onClick={onShowFeed}
              aria-label="Show feed panel"
              title="Latest feed"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-quaternary transition-colors hover:bg-secondary hover:text-secondary"
            >
              <SidePanelIcon className="size-5" />
            </button>
          )}
          {historyOpen && (
            <HistoryPanel
              sessions={sessions}
              activeId={active.id}
              onSelect={setActiveId}
              onClose={() => setHistoryOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
