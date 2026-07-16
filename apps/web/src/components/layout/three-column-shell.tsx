"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChatColumn } from "./chat-column";
import { FeedColumn } from "./feed-column";
import { PostDetailColumn } from "./post-detail-column";
import type { NodeCard } from "./feed-data";
import { DockNavColumn, NAV_COLUMN_BASE, NAV_DOCK_WIDTH, type DockNavItem } from "./dock-nav-column";
import { MobileNavMenu } from "./mobile-nav-menu";
import { useAuth } from "@/contexts/auth-context";
import { useCompose } from "@/contexts/compose-context";
import { getFeed, getTrending } from "@/lib/api/feed";
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
  searchPosition,
}: {
  open: boolean;
  width: number;
  resizing: boolean;
  posts: NodeCard[];
  selectedPostId: string | null;
  onSelectPost: (post: NodeCard) => void;
  onHide: () => void;
  searchPosition?: "top" | "bottom";
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
          searchPosition={searchPosition}
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

// ─── Shell ────────────────────────────────────────────────────────────────────

export function ThreeColumnShell({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isGraphRoute = pathname === "/latest" || pathname?.startsWith("/latest/");
  const isSettingsRoute = pathname === "/settings" || pathname?.startsWith("/settings/");
  const isFeedRoute = pathname === "/feed" || pathname?.startsWith("/feed/");

  const { status } = useAuth();
  const { onPostCreated } = useCompose();
  const [posts, setPosts] = useState<NodeCard[]>([]);
  const [selectedPost, setSelectedPost] = useState<NodeCard | null>(null);
  const [feedWidth, setFeedWidth]       = useState(380);
  const [feedVisible, setFeedVisible]   = useState(true);
  const [feedPanelOpen, setFeedPanelOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    const load = status === "authenticated" ? getFeed() : getTrending();
    load
      .then(({ data }) => {
        setPosts(data);
        setSelectedPost((prev) => prev ?? data[0] ?? null);
      })
      .catch(() => setPosts([]));
  }, [status]);

  // A freshly composed post lands at the top of the feed and becomes selected.
  useEffect(() => {
    return onPostCreated((node) => {
      setPosts((prev) => [node, ...prev.filter((p) => p.id !== node.id)]);
      setSelectedPost(node);
    });
  }, [onPostCreated]);

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
    posts,
    selectedPostId: selectedPost?.id ?? null,
    onSelectPost: setSelectedPost,
  };

  // On the standalone /feed page, tapping a post opens it in the graph/detail view.
  const selectPostFromFeedPage = useCallback(
    (post: NodeCard) => {
      setSelectedPost(post);
      router.push("/latest");
    },
    [router],
  );

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
        ) : isFeedRoute ? (
          <div className={cx(COLUMN_BASE, "min-w-0 flex-1 overflow-hidden")}>
            <FeedColumn
              posts={posts}
              selectedPostId={selectedPost?.id ?? null}
              onSelectPost={selectPostFromFeedPage}
            />
          </div>
        ) : isGraphRoute ? (
          <>
            <div className={cx(COLUMN_BASE, "min-w-0 flex-1 overflow-hidden")}>
              <PostDetailColumn
                post={selectedPost}
                posts={posts}
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

      {/* ── Mobile (< md): full-screen canvas, nav folded into each page's toolbar ── */}
      <div
        className="flex gap-1 overflow-hidden md:hidden"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 0,
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div className="min-w-0 flex-1 overflow-y-auto">
          {isSettingsRoute ? (
            <div className="p-4">
              <div className="mb-3 flex items-center">
                <MobileNavMenu items={MOBILE_NAV_ITEMS} title="Settings" />
              </div>
              {children}
            </div>
          ) : isFeedRoute ? (
            <FeedColumn
              posts={posts}
              selectedPostId={selectedPost?.id ?? null}
              onSelectPost={selectPostFromFeedPage}
              searchPosition="bottom"
              mobileNavItems={MOBILE_NAV_ITEMS}
            />
          ) : isGraphRoute ? (
            <PostDetailColumn
              post={selectedPost}
              posts={posts}
              onSelectPost={setSelectedPost}
              feedVisible={feedPanelOpen}
              onShowFeed={openFeedPanel}
              mobileNavItems={MOBILE_NAV_ITEMS}
            />
          ) : (
            <ChatColumn showSuggestions={false} mobileNavItems={MOBILE_NAV_ITEMS} />
          )}
        </div>

        {isGraphRoute && (
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
              searchPosition="bottom"
              {...feedColumnProps}
            />
          </>
        )}
      </div>
    </>
  );
}
