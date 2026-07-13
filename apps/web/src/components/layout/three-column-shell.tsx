"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatColumn } from "./chat-column";
import { FeedColumn } from "./feed-column";
import { PostDetailColumn } from "./post-detail-column";
import { feedPosts, type FeedPost } from "./feed-data";
import { DockNavColumn, NAV_COLUMN_BASE, NAV_DOCK_WIDTH, type DockNavItem } from "./dock-nav-column";
import {
  Home,
  Bookmark,
  Globe,
} from "lucide-react";
import { Easel2Icon } from "@/components/icons/easel2-icon";
import { cx } from "@/utils/cx";

// ─── Feed column resize ───────────────────────────────────────────────────────

// Feed cards are a fixed 340px wide with 10px of horizontal padding on each side
// (see feed-column.tsx); the column can't shrink smaller than that or cards would
// get compressed.
const FEED_MIN = 360;
const FEED_MAX = 560;

function useColumnResize(
  initialWidth: number,
  min: number,
  max: number,
  onResize: (w: number) => void,
  inverted = false,
) {
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startW = useRef(initialWidth);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      setIsDragging(true);
      startX.current = e.clientX;
      startW.current = initialWidth;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [initialWidth],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      const adjusted = inverted ? startW.current - delta : startW.current + delta;
      const next = Math.min(max, Math.max(min, adjusted));
      onResize(next);
    };
    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [min, max, onResize, inverted]);

  return { onMouseDown, isDragging };
}

function ColumnGap({
  onMouseDown,
  disabled,
  className,
}: {
  onMouseDown?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      onMouseDown={disabled ? undefined : onMouseDown}
      className={cx(
        "relative w-0 shrink-0 select-none",
        !disabled && onMouseDown && "cursor-col-resize",
        className,
      )}
      role="separator"
      aria-orientation="vertical"
    >
      <div className="absolute inset-y-3 -left-2 w-4" />
    </div>
  );
}

const COLUMN_BASE =
  "flex h-full min-h-0 flex-col rounded-3xl border-[0.5px] border-gray-300 bg-neutral-50 dark:border-neutral-800 dark:bg-[#0a0a0a]";

const SMOOTH_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const WIDTH_TRANSITION = `width 300ms ${SMOOTH_EASE}`;

function FeedColumnSlot({
  open,
  width,
  resizing,
  posts,
  selectedPostId,
  onSelectPost,
  onHide,
}: {
  open: boolean;
  width: number;
  resizing: boolean;
  posts: FeedPost[];
  selectedPostId: string | null;
  onSelectPost: (post: FeedPost) => void;
  onHide: () => void;
}) {
  return (
    <div
      style={{ width: open ? width : 0, transition: resizing ? "none" : WIDTH_TRANSITION }}
      className={cx("shrink-0 overflow-hidden rounded-3xl", !open && "pointer-events-none")}
    >
      <div className={cx(COLUMN_BASE, "h-full overflow-hidden")} style={{ width }}>
        <FeedColumn
          posts={posts}
          selectedPostId={selectedPostId}
          onSelectPost={onSelectPost}
          onHide={onHide}
        />
      </div>
    </div>
  );
}

const NAV_ITEMS: DockNavItem[] = [
  { label: "Home",     href: "/",         icon: Home },
  { label: "Latest",   href: "/latest",   icon: Easel2Icon },
  { label: "Saved",    href: "/saved",    icon: Bookmark },
  { label: "Research", href: "/research", icon: Globe },
];

// All 4 items shown on mobile too
const MOBILE_NAV_ITEMS = NAV_ITEMS;

// ─── Mobile bottom nav — floating glassmorphic dock ──────────────────────────

function MobileBottomNav({ items }: { items: DockNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2"
      style={{
        // Glassmorphic pill
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: "24px",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
        padding: "8px 12px",
        // iOS safe-area nudge
        marginBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex items-center justify-center rounded-[16px] px-4 py-2.5 transition-all duration-150",
                  active
                    ? "bg-white/50 text-blue-600 shadow-sm dark:bg-white/15 dark:text-blue-400"
                    : "text-neutral-500 hover:bg-white/30 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100",
                )}
              >
                <item.icon className="size-[22px]" strokeWidth={1.75} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function ThreeColumnShell({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const isGraphRoute = pathname === "/latest" || pathname?.startsWith("/latest/");
  const isSettingsRoute = pathname === "/settings" || pathname?.startsWith("/settings/");

  const [selectedPost, setSelectedPost] = useState<FeedPost>(feedPosts[0]);
  const [feedWidth, setFeedWidth]       = useState(380);
  const [feedVisible, setFeedVisible]   = useState(true);
  const [feedPanelOpen, setFeedPanelOpen] = useState(false);

  const openFeedPanel = useCallback(() => setFeedPanelOpen(true), []);
  const closeFeedPanel = useCallback(() => setFeedPanelOpen(false), []);
  const showInlineFeed = useCallback(() => setFeedVisible(true), []);

  const onFeedResize = useCallback((w: number) => setFeedWidth(w), []);
  const { onMouseDown: feedHandleMouseDown, isDragging: feedResizing } = useColumnResize(
    feedWidth, FEED_MIN, FEED_MAX, onFeedResize, true,
  );
  const { onMouseDown: splitFeedHandleMouseDown, isDragging: splitFeedResizing } = useColumnResize(
    feedWidth, FEED_MIN, FEED_MAX, onFeedResize, true,
  );

  const feedColumnProps = {
    posts: feedPosts,
    selectedPostId: selectedPost?.id ?? null,
    onSelectPost: setSelectedPost,
  };

  return (
    <>
      {/* ── Desktop (md+): 3-column layout ─────────────────────────────── */}
      <div className="relative hidden min-h-0 flex-1 gap-1 overflow-hidden md:flex">

        {/* Side nav */}
        <div
          style={{ width: NAV_DOCK_WIDTH }}
          className={cx(NAV_COLUMN_BASE, "relative z-40 shrink-0 h-full min-h-0 overflow-visible")}
        >
          <DockNavColumn items={NAV_ITEMS} />
        </div>

        {isSettingsRoute ? (
          <div className={cx(COLUMN_BASE, "min-w-0 flex-1 overflow-y-auto p-6 md:p-8")}>{children}</div>
        ) : isGraphRoute ? (
          <>
            <div className={cx(COLUMN_BASE, "min-w-0 flex-1 overflow-hidden")}>
              <PostDetailColumn
                post={selectedPost}
                posts={feedPosts}
                onSelectPost={setSelectedPost}
                feedVisible={feedPanelOpen}
                onShowFeed={openFeedPanel}
              />
            </div>

            <ColumnGap
              onMouseDown={splitFeedHandleMouseDown}
              disabled={!feedPanelOpen}
              className={cx(
                "transition-opacity duration-300 ease-in-out",
                feedPanelOpen ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            />

            <FeedColumnSlot
              open={feedPanelOpen}
              width={feedWidth}
              resizing={splitFeedResizing}
              onHide={closeFeedPanel}
              {...feedColumnProps}
            />
          </>
        ) : (
          <>
            {/* Chat canvas */}
            <div className={cx(COLUMN_BASE, "min-w-0 flex-1 overflow-hidden")}>
              <ChatColumn onShowFeed={!feedVisible ? showInlineFeed : undefined} />
            </div>

            <ColumnGap
              onMouseDown={feedHandleMouseDown}
              disabled={!feedVisible}
              className={cx(
                "transition-opacity duration-300 ease-in-out",
                feedVisible ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            />

            <FeedColumnSlot
              open={feedVisible}
              width={feedWidth}
              resizing={feedResizing}
              onHide={() => setFeedVisible(false)}
              {...feedColumnProps}
            />
          </>
        )}

      </div>

      {/* ── Mobile (< md): full-screen canvas + floating dock ──────────── */}
      <div
        className="flex gap-1 overflow-hidden md:hidden"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0 }}
      >
        <div className="min-w-0 flex-1 overflow-y-auto">
          {isSettingsRoute ? (
            <div className="p-4">{children}</div>
          ) : isGraphRoute ? (
            <PostDetailColumn
              post={selectedPost}
              posts={feedPosts}
              onSelectPost={setSelectedPost}
              feedVisible={feedPanelOpen}
              onShowFeed={openFeedPanel}
            />
          ) : (
            <ChatColumn onShowFeed={!feedPanelOpen ? openFeedPanel : undefined} />
          )}
        </div>

        {!isSettingsRoute && (
          <>
            <ColumnGap
              onMouseDown={splitFeedHandleMouseDown}
              disabled={!feedPanelOpen}
              className={cx(
                "transition-opacity duration-300 ease-in-out",
                feedPanelOpen ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            />

            <FeedColumnSlot
              open={feedPanelOpen}
              width={feedWidth}
              resizing={splitFeedResizing}
              onHide={closeFeedPanel}
              {...feedColumnProps}
            />
          </>
        )}

        <MobileBottomNav items={MOBILE_NAV_ITEMS} />
      </div>
    </>
  );
}
