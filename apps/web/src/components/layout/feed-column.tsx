"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowBigUp, Bookmark, GitBranch } from "lucide-react";
import { SidePanelIcon } from "@/components/icons/side-panel-icon";
import { MobileNavMenu } from "./mobile-nav-menu";
import type { DockNavItem } from "./dock-nav-column";
import { timeAgo, type NodeCard } from "./feed-data";
import { useAuth } from "@/contexts/auth-context";
import { bookmarkNode, unbookmarkNode, voteNode } from "@/lib/api/nodes";
import { searchNodes } from "@/lib/api/search";
import { cx } from "@/utils/cx";

const PROGRESSIVE_BLUR_LAYERS = [
  { blur: "18px", height: 18 },
  { blur: "12px", height: 32 },
  { blur: "6px", height: 46 },
  { blur: "2px", height: 64 },
] as const;

function FeedPostCard({
  post,
  isSelected,
  onSelect,
}: {
  post: NodeCard;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const router = useRouter();
  const { status } = useAuth();
  const [voteCount, setVoteCount] = useState(post.vote_count);
  const [voted, setVoted] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmark_count);
  const [bookmarked, setBookmarked] = useState(false);

  const requireAuth = () => {
    if (status !== "authenticated") {
      router.push("/login");
      return false;
    }
    return true;
  };

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth()) return;
    const next = voted ? 0 : 1;
    try {
      const { vote_count } = await voteNode(post.id, next);
      setVoteCount(vote_count);
      setVoted(next === 1);
    } catch {
      // best-effort UI action — leave counts unchanged on failure
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth()) return;
    try {
      if (bookmarked) {
        await unbookmarkNode(post.id);
        setBookmarked(false);
        setBookmarkCount((c) => Math.max(0, c - 1));
      } else {
        await bookmarkNode(post.id);
        setBookmarked(true);
        setBookmarkCount((c) => c + 1);
      }
    } catch {
      // best-effort UI action
    }
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "w-full shrink-0 cursor-pointer px-6 py-4 text-left transition-colors duration-100",
        "bg-transparent shadow-sm",
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {post.hierarchy_path.length > 0 && (
            <span className="text-tertiary text-xs truncate">{post.hierarchy_path.join(" / ")}</span>
          )}
          <span className="text-quaternary text-xs">·</span>
          <span className="text-tertiary text-xs shrink-0">{timeAgo(post.created_at)}</span>
        </div>

        <p className="text-lg font-semibold text-primary leading-snug line-clamp-2">{post.title}</p>

        {post.summary && <p className="text-sm text-secondary leading-snug line-clamp-3">{post.summary}</p>}

        <div className="flex items-center gap-4 mt-2">
          <span
            role="button"
            onClick={handleVote}
            className={cx(
              "flex items-center gap-1 text-xs transition-colors",
              voted ? "text-brand-secondary" : "text-quaternary hover:text-secondary",
            )}
          >
            <ArrowBigUp className="size-3.5" fill={voted ? "currentColor" : "none"} />
            {voteCount}
          </span>
          <span
            role="button"
            onClick={handleBookmark}
            className={cx(
              "flex items-center gap-1 text-xs transition-colors",
              bookmarked ? "text-brand-secondary" : "text-quaternary hover:text-secondary",
            )}
          >
            <Bookmark className="size-3.5" fill={bookmarked ? "currentColor" : "none"} />
            {bookmarkCount}
          </span>
          <span className="flex items-center gap-1 text-quaternary text-xs">
            <GitBranch className="size-3.5" />
            {post.relation_count}
          </span>
        </div>
      </div>
    </button>
  );
}

interface FeedColumnProps {
  posts: NodeCard[];
  selectedPostId: string | null;
  onSelectPost: (post: NodeCard) => void;
  /** When provided, renders a "hide panel" button that calls this. */
  onHide?: () => void;
  searchPosition?: "top" | "bottom";
  /** When provided, the header title becomes a page-switcher dropdown on mobile. */
  mobileNavItems?: DockNavItem[];
}

export function FeedColumn({
  posts,
  selectedPostId,
  onSelectPost,
  onHide,
  searchPosition = "top",
  mobileNavItems,
}: FeedColumnProps) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<NodeCard[] | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Debounced server-side search; falls back to local filtering instantly
  // while the network result is in flight so the list never looks frozen.
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults(null);
      return;
    }
    const handle = setTimeout(() => {
      searchNodes(trimmed)
        .then(({ data }) => setSearchResults(data))
        .catch(() => setSearchResults(null));
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  const localFiltered = query.trim()
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.summary?.toLowerCase().includes(query.toLowerCase()) ||
          p.hierarchy_path.some((h) => h.toLowerCase().includes(query.toLowerCase())),
      )
    : posts;

  const filtered = query.trim() ? (searchResults ?? localFiltered) : posts;

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
        ) : mobileNavItems ? (
          <div className="flex-1">
            <div className="md:hidden">
              <MobileNavMenu items={mobileNavItems} title="Latest" />
            </div>
            <h2 className="hidden text-2xl font-medium text-primary md:block">Latest</h2>
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
          {!searchAtBottom && onHide && (
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
