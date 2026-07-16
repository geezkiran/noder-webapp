"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowBigUp, Bookmark, GitBranch, Plus, Minus, Locate } from "lucide-react";
import { SidePanelIcon } from "@/components/icons/side-panel-icon";
import { MobileNavMenu } from "./mobile-nav-menu";
import type { DockNavItem } from "./dock-nav-column";
import { timeAgo, type NodeCard } from "./feed-data";
import { useAuth } from "@/contexts/auth-context";
import { bookmarkNode, unbookmarkNode, voteNode } from "@/lib/api/nodes";
import { cx } from "@/utils/cx";

const PROGRESSIVE_BLUR_LAYERS = [
  { blur: "18px", height: 18 },
  { blur: "12px", height: 32 },
  { blur: "6px", height: 46 },
  { blur: "2px", height: 64 },
] as const;

// ─── Discover card (portrait aspect) ─────────────────────────────────────────

function DiscoverPostCard({
  post,
  selected,
  isDropTarget,
  onSelect,
}: {
  post: NodeCard;
  selected: boolean;
  isDropTarget?: boolean;
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
      // best-effort UI action
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
        "canvas-card flex aspect-[3/4] w-full flex-col overflow-hidden rounded-2xl border-[0.5px] text-left transition-colors duration-100",
        "border-gray-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-[#1a1a1a]",
        isDropTarget
          ? "border-blue-500 ring-2 ring-blue-500/40"
          : selected
            ? "border-blue-400 ring-2 ring-blue-400/20 dark:border-neutral-700"
            : "hover:border-gray-400 dark:hover:border-neutral-700",
      )}
    >
      <div className="flex h-full flex-col p-3.5">
        {post.hierarchy_path.length > 0 && (
          <span className="truncate text-xs text-tertiary">{post.hierarchy_path.join(" / ")}</span>
        )}

        <p className="mt-1 line-clamp-2 text-sm font-semibold text-primary">{post.title}</p>

        {post.summary && (
          <p className="mt-1.5 line-clamp-4 flex-1 text-sm leading-relaxed text-secondary">{post.summary}</p>
        )}

        <div className="mt-auto flex items-center gap-3 border-t border-secondary pt-3 text-quaternary">
          <span
            role="button"
            onClick={handleVote}
            className={cx(
              "flex items-center gap-1 text-xs transition-colors",
              voted ? "text-brand-secondary" : "hover:text-secondary",
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
              bookmarked ? "text-brand-secondary" : "hover:text-secondary",
            )}
          >
            <Bookmark className="size-3.5" fill={bookmarked ? "currentColor" : "none"} />
            {bookmarkCount}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <GitBranch className="size-3.5" />
            {post.relation_count}
          </span>
          <span className="ml-auto text-xs text-tertiary">{timeAgo(post.created_at)}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Canvas defaults ──────────────────────────────────────────────────────────

const CARD_WIDTH   = 190;
const CARD_HEIGHT  = CARD_WIDTH * 4 / 3; // matches the card's aspect-[3/4]
const GRID_SIZE    = 80;
const MIN_ZOOM     = 0.15;
const MAX_ZOOM     = 3;
const INITIAL_ZOOM = 0.9;
const INITIAL_PAN  = { x: 16, y: 16 };

interface Transform { x: number; y: number; scale: number; }
type CardPositions = Record<string, { x: number; y: number }>;

// Grid layout for however many real nodes we have — no backend concept of
// canvas position, so we just tile them and let the user drag from there.
const GRID_GAP = 40;
const GRID_COLS = 3;

function gridLayout(ids: string[]): CardPositions {
  const positions: CardPositions = {};
  ids.forEach((id, i) => {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    positions[id] = { x: 20 + col * (CARD_WIDTH + GRID_GAP), y: 20 + row * (CARD_HEIGHT + GRID_GAP) };
  });
  return positions;
}

// ─── PostDetailColumn ─────────────────────────────────────────────────────────

interface PostDetailColumnProps {
  post: NodeCard | null;
  posts: NodeCard[];
  onSelectPost: (post: NodeCard) => void;
  feedVisible?: boolean;
  onShowFeed?: () => void;
  mobileNavItems?: DockNavItem[];
}

export function PostDetailColumn({
  post,
  posts,
  onSelectPost,
  feedVisible = true,
  onShowFeed,
  mobileNavItems,
}: PostDetailColumnProps) {
  const initialLayout = useMemo(() => gridLayout(posts.map((p) => p.id)), [posts]);
  const [transform, setTransform]       = useState<Transform>({ x: INITIAL_PAN.x, y: INITIAL_PAN.y, scale: INITIAL_ZOOM });
  const [cardPositions, setCardPositions] = useState<CardPositions>(initialLayout);
  const [isCanvasPanning, setIsCanvasPanning] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const containerRef   = useRef<HTMLDivElement>(null);
  const isPanning      = useRef(false);
  const draggingCardId = useRef<string | null>(null);
  const cardDragMoved  = useRef(false);
  const lastMouse      = useRef({ x: 0, y: 0 });
  const scaleRef       = useRef(INITIAL_ZOOM);
  const cardPositionsRef = useRef<CardPositions>(initialLayout);
  // Touch tracking: stores the previous frame's touch positions
  const lastTouches    = useRef<{ x: number; y: number }[]>([]);
  useEffect(() => { scaleRef.current = transform.scale; }, [transform.scale]);

  // Seed layout for any newly-arrived posts (e.g. once the feed fetch resolves)
  // without discarding positions the user has already dragged.
  useEffect(() => {
    setCardPositions((prev) => {
      const missing = posts.filter((p) => !prev[p.id]);
      if (missing.length === 0) return prev;
      const next = { ...prev, ...gridLayout(missing.map((p) => p.id)) };
      cardPositionsRef.current = next;
      return next;
    });
  }, [posts]);

  // ── Find which other card the dragged card's center is currently over ───────
  const findOverlapTarget = useCallback(
    (draggedId: string, positions: CardPositions) => {
      const dragged = positions[draggedId];
      if (!dragged) return null;
      const centerX = dragged.x + CARD_WIDTH / 2;
      const centerY = dragged.y + CARD_HEIGHT / 2;
      return (
        Object.keys(positions).find((id) => {
          if (id === draggedId) return false;
          const pos = positions[id];
          return (
            centerX >= pos.x &&
            centerX <= pos.x + CARD_WIDTH &&
            centerY >= pos.y &&
            centerY <= pos.y + CARD_HEIGHT
          );
        }) ?? null
      );
    },
    [],
  );

  // ── Wheel → zoom toward cursor ──────────────────────────────────────────────
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const rect  = el.getBoundingClientRect();
    const mx    = e.clientX - rect.left;
    const my    = e.clientY - rect.top;
    const delta = e.deltaY < 0 ? 1.08 : 1 / 1.08;
    setTransform((prev) => {
      const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.scale * delta));
      const f        = newScale / prev.scale;
      return { scale: newScale, x: mx - (mx - prev.x) * f, y: my - (my - prev.y) * f };
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // ── Touch: 1-finger pan, 2-finger pinch-zoom ─────────────────────────────────
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    lastTouches.current = Array.from(e.touches).map((t) => ({ x: t.clientX, y: t.clientY }));
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const cur  = Array.from(e.touches).map((t) => ({ x: t.clientX, y: t.clientY }));
    const prev = lastTouches.current;

    if (cur.length === 1 && prev.length >= 1) {
      // ── 1 finger: pan ──────────────────────────────────────────────────────
      const dx = cur[0].x - prev[0].x;
      const dy = cur[0].y - prev[0].y;
      setTransform((tr) => ({ ...tr, x: tr.x + dx, y: tr.y + dy }));
    } else if (cur.length === 2 && prev.length === 2) {
      // ── 2 fingers: pinch-zoom + pan simultaneously ─────────────────────────
      const curMid  = { x: (cur[0].x  + cur[1].x)  / 2, y: (cur[0].y  + cur[1].y)  / 2 };
      const prevMid = { x: (prev[0].x + prev[1].x) / 2, y: (prev[0].y + prev[1].y) / 2 };
      const curDist  = Math.hypot(cur[0].x  - cur[1].x,  cur[0].y  - cur[1].y);
      const prevDist = Math.hypot(prev[0].x - prev[1].x, prev[0].y - prev[1].y);

      if (prevDist === 0) { lastTouches.current = cur; return; }

      const pinchFactor = curDist / prevDist;
      const panDx = curMid.x - prevMid.x;
      const panDy = curMid.y - prevMid.y;

      const el = containerRef.current;
      if (!el) { lastTouches.current = cur; return; }
      const rect = el.getBoundingClientRect();
      const mx = curMid.x - rect.left;
      const my = curMid.y - rect.top;

      setTransform((tr) => {
        const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, tr.scale * pinchFactor));
        const f = newScale / tr.scale;
        return {
          scale: newScale,
          x: mx - (mx - tr.x) * f + panDx,
          y: my - (my - tr.y) * f + panDy,
        };
      });
    }
    lastTouches.current = cur;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    lastTouches.current = Array.from(e.touches).map((t) => ({ x: t.clientX, y: t.clientY }));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove",  handleTouchMove,  { passive: false });
    el.addEventListener("touchend",   handleTouchEnd,   { passive: false });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove",  handleTouchMove);
      el.removeEventListener("touchend",   handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // ── Global mousemove + mouseup (handles both card drag and canvas pan) ───────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;

      if (draggingCardId.current) {
        // Mark as a real drag once the pointer travels > 3px
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) cardDragMoved.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        // Convert screen-space delta → canvas-space delta
        const s  = scaleRef.current;
        const id = draggingCardId.current;
        setCardPositions((prev) => {
          const p = prev[id];
          if (!p) return prev;
          const next = { ...prev, [id]: { x: p.x + dx / s, y: p.y + dy / s } };
          cardPositionsRef.current = next;
          return next;
        });
        setDropTargetId(findOverlapTarget(id, cardPositionsRef.current));
        return;
      }

      if (!isPanning.current) return;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    };

    const onUp = () => {
      if (draggingCardId.current) {
        const id     = draggingCardId.current;
        const target = cardDragMoved.current ? findOverlapTarget(id, cardPositionsRef.current) : null;
        if (target) {
          setCardPositions((prev) => {
            const next = { ...prev, [id]: prev[target], [target]: prev[id] };
            cardPositionsRef.current = next;
            return next;
          });
        }
        draggingCardId.current     = null;
        document.body.style.cursor = "";
        setActiveCardId(null);
        setDropTargetId(null);
      }
      if (isPanning.current) {
        isPanning.current          = false;
        document.body.style.cursor = "";
        setIsCanvasPanning(false);
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [findOverlapTarget]);

  // ── Canvas background mousedown → pan ───────────────────────────────────────
  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isPanning.current          = true;
    lastMouse.current          = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = "grabbing";
    setIsCanvasPanning(true);
  }, []);

  // ── Card wrapper mousedown → card drag ──────────────────────────────────────
  // stopPropagation prevents the canvas pan handler from firing.
  const onCardMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    draggingCardId.current     = id;
    cardDragMoved.current      = false;
    lastMouse.current          = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = "grabbing";
    setActiveCardId(id);
  }, []);

  // ── Zoom-at-center (buttons) ────────────────────────────────────────────────
  const zoomAtCenter = useCallback((factor: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const cx = width / 2, cy = height / 2;
    setTransform((prev) => {
      const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.scale * factor));
      const f        = newScale / prev.scale;
      return { scale: newScale, x: cx - (cx - prev.x) * f, y: cy - (cy - prev.y) * f };
    });
  }, []);

  const resetView = useCallback(() => {
    setTransform({ x: INITIAL_PAN.x, y: INITIAL_PAN.y, scale: INITIAL_ZOOM });
  }, []);

  // ── Grid background (tracks pan + zoom) ─────────────────────────────────────
  // Scale up the grid pitch when lines would get too dense on screen.
  // Each time the rendered pitch drops below MIN_SCREEN_GRID_PX we double the
  // canvas-space size, keeping lines comfortably spaced at any zoom level.
  const MIN_SCREEN_GRID_PX = 28;
  const { x: panX, y: panY, scale } = transform;
  let effectiveGridPx = GRID_SIZE * scale;
  while (effectiveGridPx < MIN_SCREEN_GRID_PX) effectiveGridPx *= 2;
  const bgX = ((panX % effectiveGridPx) + effectiveGridPx) % effectiveGridPx;
  const bgY = ((panY % effectiveGridPx) + effectiveGridPx) % effectiveGridPx;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl">

      {/* ── Infinite canvas — full height ────────────────────────────────── */}
      <div
        ref={containerRef}
        className="absolute inset-0 select-none"
        style={{
          cursor: isCanvasPanning ? "grabbing" : "grab",
          touchAction: "none",
          backgroundImage: [
            "linear-gradient(to right, rgba(128,128,128,0.035) 1px, transparent 1px)",
            "linear-gradient(to bottom, rgba(128,128,128,0.035) 1px, transparent 1px)",
          ].join(","),
          backgroundSize: `${effectiveGridPx}px ${effectiveGridPx}px`,
          backgroundPosition: `${bgX}px ${bgY}px`,
        }}
        onMouseDown={onCanvasMouseDown}
      >
        {/* Transformed canvas layer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "0 0",
            transform: `translate(${panX}px,${panY}px) scale(${scale})`,
            willChange: "transform",
          }}
        >
          {posts.map((item) => {
            const pos      = cardPositions[item.id];
            if (!pos) return null;
            const isActive = activeCardId === item.id;
            return (
              <div
                key={item.id}
                onMouseDown={(e) => onCardMouseDown(item.id, e)}
                style={{
                  position: "absolute",
                  left: pos.x,
                  top: pos.y,
                  width: CARD_WIDTH,
                  zIndex: isActive ? 20 : 1,
                  cursor: isActive ? "grabbing" : "grab",
                  boxShadow: isActive
                    ? "0 12px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)"
                    : "0 1px 4px rgba(0,0,0,0.07)",
                  transform: isActive ? "scale(1.03)" : "scale(1)",
                  transition: isActive ? "none" : "transform 150ms ease, box-shadow 150ms ease",
                }}
              >
                <DiscoverPostCard
                  post={item}
                  selected={item.id === post?.id}
                  isDropTarget={dropTargetId === item.id}
                  onSelect={() => { if (!cardDragMoved.current) onSelectPost(item); }}
                />
              </div>
            );
          })}
        </div>

        {/* ── Zoom controls ──────────────────────────────────────────────── */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => zoomAtCenter(1.25)}
            aria-label="Zoom in"
            title="Zoom in"
            className="flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-white/90 text-secondary shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/90 dark:hover:bg-neutral-800"
          >
            <Plus className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => zoomAtCenter(1 / 1.25)}
            aria-label="Zoom out"
            title="Zoom out"
            className="flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-white/90 text-secondary shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/90 dark:hover:bg-neutral-800"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={resetView}
            aria-label="Reset view"
            title="Reset view"
            className="flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-white/90 text-secondary shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/90 dark:hover:bg-neutral-800"
          >
            <Locate className="size-3.5" />
          </button>
        </div>

        {/* ── Zoom level badge ───────────────────────────────────────────── */}
        <div className="absolute bottom-4 left-4 z-10 rounded-md border border-gray-200 bg-white/80 px-2 py-0.5 text-[11px] font-mono text-tertiary shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* ── Progressive blur — four stacked layers, heaviest→lightest top→down
           Each layer is masked by a linear gradient so blur fades to nothing.  */}
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

      {/* ── Floating title — no background, sits above the blur ─────────── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-3 px-8 py-5">
        {mobileNavItems ? (
          <div className="pointer-events-auto min-w-0 flex-1">
            <MobileNavMenu items={mobileNavItems} title="Discover" />
          </div>
        ) : (
          <h2 className="min-w-0 flex-1 truncate text-2xl font-medium text-primary">Discover</h2>
        )}
        {!feedVisible && onShowFeed && (
          <button
            type="button"
            onClick={onShowFeed}
            aria-label="Show feed panel"
            className="pointer-events-auto flex size-8 shrink-0 items-center justify-center rounded-lg text-quaternary transition-colors hover:bg-secondary hover:text-secondary"
          >
            <SidePanelIcon className="size-5" />
          </button>
        )}
      </div>

    </div>
  );
}
