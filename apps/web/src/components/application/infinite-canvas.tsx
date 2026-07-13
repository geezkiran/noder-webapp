"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { cx } from "@/utils/cx";

interface InfiniteCanvasProps {
  children: ReactNode;
  className?: string;
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest("a, button, input, textarea, select, label, [data-canvas-static], [contenteditable='true']")
  );
}

export function InfiniteCanvas({ children, className }: InfiniteCanvasProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || isInteractiveTarget(event.target)) {
        return;
      }

      setIsDragging(true);
      dragStart.current = {
        x: event.clientX,
        y: event.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [offset.x, offset.y]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) {
        return;
      }

      setOffset({
        x: dragStart.current.offsetX + (event.clientX - dragStart.current.x),
        y: dragStart.current.offsetY + (event.clientY - dragStart.current.y),
      });
    },
    [isDragging]
  );

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <div
      className={cx(
        "relative min-h-0 flex-1 overflow-hidden",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className="absolute inset-0 origin-top-left will-change-transform"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          backgroundColor: "#F8F8FA",
          width: "400%",
          height: "400%",
          left: "-150%",
          top: "-150%",
        }}
      >
        <div className="absolute left-1/2 top-1/2 min-w-[1200px] -translate-x-1/2 -translate-y-1/2 p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
