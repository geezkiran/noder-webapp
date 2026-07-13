"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MessageCircle, Repeat2, Heart, BarChart2, BadgeCheck } from "lucide-react";
import { SidePanelIcon } from "@/components/icons/side-panel-icon";
import type { FeedPost } from "./feed-data";
import { cx } from "@/utils/cx";

const PROGRESSIVE_BLUR_LAYERS = [
  { blur: "18px", height: 18 },
  { blur: "12px", height: 32 },
  { blur: "6px", height: 46 },
  { blur: "2px", height: 64 },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function getAvatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}

function Avatar({ src, name, size = "md" }: { src?: string; name: string; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "size-8" : "size-10";
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  if (src) {
    return <img src={src} alt={name} className={cx(sizeClass, "rounded-full object-cover shrink-0")} />;
  }

  return (
    <div
      className={cx(
        sizeClass,
        textClass,
        "rounded-full shrink-0 flex items-center justify-center font-semibold text-white",
        getAvatarColor(name),
      )}
    >
      {getInitials(name)}
    </div>
  );
}

function FeedPostCard({
  post,
  isSelected,
  onSelect,
}: {
  post: FeedPost;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "w-full shrink-0 cursor-pointer px-6 py-4 text-left transition-colors duration-100",
        "bg-transparent shadow-sm",
      )}
    >
      <div className="flex gap-3">
        <Avatar src={post.author.avatar} name={post.author.name} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-semibold text-sm text-primary truncate">{post.author.name}</span>
            {post.author.verified && (
              <BadgeCheck className="size-3.5 shrink-0 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
            )}
            <span className="text-tertiary text-xs truncate">@{post.author.handle}</span>
            <span className="text-quaternary text-xs">·</span>
            <span className="text-tertiary text-xs shrink-0">{post.timeAgo}</span>
          </div>

          <p className="mt-1 text-lg text-secondary leading-snug line-clamp-3">{post.content}</p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-blue-600/40 px-2.5 py-0.5 text-xs text-blue-600 hover:bg-blue-50 dark:border-blue-400/40 dark:text-blue-400 dark:hover:bg-blue-400/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-quaternary text-xs">
              <MessageCircle className="size-3.5" />
              {post.stats.replies}
            </span>
            <span className="flex items-center gap-1 text-quaternary text-xs">
              <Repeat2 className="size-3.5" />
              {post.stats.reposts}
            </span>
            <span className="flex items-center gap-1 text-quaternary text-xs">
              <Heart className="size-3.5" />
              {post.stats.likes}
            </span>
            <span className="flex items-center gap-1 text-quaternary text-xs">
              <BarChart2 className="size-3.5" />
              {post.stats.views.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

interface FeedColumnProps {
  posts: FeedPost[];
  selectedPostId: string | null;
  onSelectPost: (post: FeedPost) => void;
  onHide: () => void;
  searchPosition?: "top" | "bottom";
}

export function FeedColumn({
  posts,
  selectedPostId,
  onSelectPost,
  onHide,
  searchPosition = "top",
}: FeedColumnProps) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const filtered = query.trim()
    ? posts.filter(
        (p) =>
          p.content.toLowerCase().includes(query.toLowerCase()) ||
          p.author.name.toLowerCase().includes(query.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())),
      )
    : posts;

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const searchAtBottom = searchPosition === "bottom";

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl">
      {/* Scrollable post list */}
      <div
        className={cx(
          "flex flex-1 flex-col items-center overflow-y-auto pt-20 scrollbar-hide",
          searchAtBottom ? "pb-20" : "pb-2.5",
        )}
      >
        {filtered.length === 0 ? (
          <div className="w-full px-4 py-12 text-center text-tertiary text-sm">No posts found.</div>
        ) : (
          <div className="w-full flex flex-col divide-y divide-secondary border-t border-secondary">
            {filtered.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                isSelected={selectedPostId === post.id}
                onSelect={() => onSelectPost(post)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progressive blur — four stacked layers, heaviest→lightest top→down */}
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

      {/* Progressive blur at bottom, mirrored — only when the search bar lives down there */}
      {searchAtBottom && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 overflow-hidden rounded-b-3xl"
          style={{ height: PROGRESSIVE_BLUR_LAYERS[PROGRESSIVE_BLUR_LAYERS.length - 1].height }}
        >
          {PROGRESSIVE_BLUR_LAYERS.map(({ blur, height }, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-b-3xl"
              style={{
                position: "absolute",
                inset: 0,
                top: "auto",
                height,
                backdropFilter: `blur(${blur})`,
                WebkitBackdropFilter: `blur(${blur})`,
                maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
              }}
            />
          ))}
        </div>
      )}

      {searchOpen && (
        <button
          type="button"
          aria-label="Close search"
          className="fixed inset-0 z-30 cursor-default"
          onClick={closeSearch}
        />
      )}

      {/* Floating title — no background, sits above the blur */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center gap-3 px-8 py-5">
        {searchOpen && !searchAtBottom ? (
          <div className="pointer-events-auto relative flex h-9 min-w-0 flex-1 items-center rounded-2xl border border-gray-200/60 bg-white/20 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.02]">
            <Search className="absolute left-3 size-4 text-quaternary" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search feed…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeSearch();
              }}
              className="h-full w-full rounded-2xl bg-transparent pl-9 pr-4 text-base text-primary outline-none placeholder-quaternary focus:outline-none md:text-sm"
            />
          </div>
        ) : (
          <h2 className="flex-1 text-2xl font-medium text-primary">Latest</h2>
        )}

        <div className="pointer-events-auto flex shrink-0 items-center gap-1">
          {!searchAtBottom && !searchOpen && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search feed"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-quaternary transition-colors hover:bg-secondary hover:text-secondary"
            >
              <Search className="size-[18px]" />
            </button>
          )}
          {!searchAtBottom && (
            <button
              type="button"
              onClick={onHide}
              aria-label="Hide feed panel"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-quaternary transition-colors hover:bg-secondary hover:text-secondary"
            >
              <SidePanelIcon className="size-5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating search bar pinned to the bottom, mobile layout */}
      {searchAtBottom && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-center px-8 py-5">
          <div className="pointer-events-auto relative flex h-11 w-full items-center rounded-2xl border border-gray-200/60 bg-white/20 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.02]">
            <Search className="absolute left-3.5 size-4 text-quaternary" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search feed…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeSearch();
              }}
              className="h-full w-full rounded-2xl bg-transparent pl-10 pr-4 text-base text-primary outline-none placeholder-quaternary focus:outline-none md:text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
