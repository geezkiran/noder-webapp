"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, ChevronDown, History, Paperclip, Sparkle, SquarePen, Square } from "lucide-react";
import { SidePanelIcon } from "@/components/icons/side-panel-icon";
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
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

type ChatEffort = "Low" | "Medium" | "High";

interface ChatModel {
  id: string;
  name: string;
}

const CHAT_MODELS: ChatModel[] = [
  { id: "sonnet-4.6", name: "Sonnet 4.6" },
  { id: "opus-4.8", name: "Opus 4.8" },
  { id: "gpt-5.6", name: "GPT-5.6" },
  { id: "composer-2.5", name: "Composer 2.5" },
];

const CHAT_EFFORTS: ChatEffort[] = ["Low", "Medium", "High"];

const SUGGESTIONS = [
  "Summarize what's trending in my feed",
  "Find posts about design systems",
  "What did I save last week?",
  "Draft a reply to the top post",
];

function newSession(): ChatSession {
  return { id: crypto.randomUUID(), title: "New chat", messages: [], updatedAt: Date.now() };
}

function titleFromMessage(text: string) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
}

// ─── Mock reply (no backend wired up yet) ────────────────────────────────────

function mockReply(prompt: string) {
  return `I don't have a model connected yet, so I can't really answer "${prompt}" — but this is where the response would stream in.`;
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
    <div className="flex">
      <div className="max-w-[80%] pt-1 text-[15px] leading-relaxed text-primary">{message.content}</div>
    </div>
  );
}

// ─── Model selector ───────────────────────────────────────────────────────────

function ModelSelector({
  modelId,
  effort,
  onModelChange,
  onEffortChange,
}: {
  modelId: string;
  effort: ChatEffort;
  onModelChange: (id: string) => void;
  onEffortChange: (effort: ChatEffort) => void;
}) {
  const [open, setOpen] = useState(false);
  const model = CHAT_MODELS.find((m) => m.id === modelId) ?? CHAT_MODELS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Select model"
        aria-expanded={open}
        className={cx(
          "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[13px] transition-colors hover:bg-secondary",
          open && "bg-secondary",
        )}
      >
        <span className="font-medium text-primary">{model.name}</span>
        <span className="text-secondary">{effort}</span>
        <ChevronDown className="size-3.5 text-quaternary" strokeWidth={2} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close model selector"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full left-0 z-40 mb-2 w-52 overflow-hidden rounded-2xl border-[0.5px] border-gray-300 bg-white px-2 py-1.5 shadow-lg dark:border-neutral-800 dark:bg-[#161616]">
            <div className="py-1">
              <span className="px-1.5 text-xs font-medium text-tertiary">Model</span>
            </div>
            {CHAT_MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { onModelChange(m.id); }}
                className={cx(
                  "flex w-full items-center rounded-xl px-2.5 py-2 text-left text-sm transition-colors",
                  m.id === modelId
                    ? "bg-neutral-200 font-medium text-primary dark:bg-neutral-800"
                    : "text-primary hover:bg-secondary",
                )}
              >
                {m.name}
              </button>
            ))}
            <div className="my-1.5 h-px bg-gray-200 dark:bg-neutral-800" />
            <div className="py-1">
              <span className="px-1.5 text-xs font-medium text-tertiary">Effort</span>
            </div>
            {CHAT_EFFORTS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => { onEffortChange(e); setOpen(false); }}
                className={cx(
                  "flex w-full items-center rounded-xl px-2.5 py-2 text-left text-sm transition-colors",
                  e === effort
                    ? "bg-neutral-200 font-medium text-primary dark:bg-neutral-800"
                    : "text-secondary hover:bg-secondary",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </>
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
  modelId,
  effort,
  onModelChange,
  onEffortChange,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  autoFocus?: boolean;
  modelId: string;
  effort: ChatEffort;
  onModelChange: (id: string) => void;
  onEffortChange: (effort: ChatEffort) => void;
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
        className="max-h-[200px] w-full resize-none bg-transparent pl-1 text-[15px] leading-relaxed text-primary outline-none placeholder-quaternary"
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
          <ModelSelector
            modelId={modelId}
            effort={effort}
            onModelChange={onModelChange}
            onEffortChange={onEffortChange}
          />
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

export function ChatColumn({ onShowFeed }: { onShowFeed?: () => void }) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => [newSession()]);
  const [activeId, setActiveId] = useState(() => sessions[0].id);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [modelId, setModelId] = useState(CHAT_MODELS[0].id);
  const [effort, setEffort] = useState<ChatEffort>("Medium");
  const scrollRef = useRef<HTMLDivElement>(null);
  const genTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = sessions.find((s) => s.id === activeId) ?? sessions[0];
  const messages = active.messages;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => { if (genTimeout.current) clearTimeout(genTimeout.current); }, []);

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;

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

    genTimeout.current = setTimeout(() => {
      const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: mockReply(trimmed) };
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() } : s)),
      );
      setIsGenerating(false);
    }, 700);
  }, [active.id, isGenerating]);

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
              autoFocus
              modelId={modelId}
              effort={effort}
              onModelChange={setModelId}
              onEffortChange={setEffort}
            />
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
              modelId={modelId}
              effort={effort}
              onModelChange={setModelId}
              onEffortChange={setEffort}
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
        {!isEmpty && <h2 className="flex-1 text-2xl font-medium text-primary">Chat</h2>}
        <div className={cx("pointer-events-auto relative flex shrink-0 items-center gap-2.5", isEmpty && "ml-auto")}>
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
