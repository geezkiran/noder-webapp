"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cx } from "@/utils/cx";
import type { DockNavItem } from "./dock-nav-column";

// ─── Mobile nav menu — page title + chevron that opens a page-switcher ────────

export function MobileNavMenu({ items, title }: { items: DockNavItem[]; title: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Switch page"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex min-w-0 max-w-full items-center gap-1 rounded-lg text-primary transition-colors"
      >
        <span className="truncate text-2xl font-medium">{title}</span>
        <ChevronDown
          className={cx(
            "size-5 shrink-0 text-quaternary transition-transform duration-200",
            open && "rotate-180",
          )}
          strokeWidth={2.25}
        />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute left-0 top-full z-40 mt-2 min-w-[190px] rounded-2xl border border-gray-300 bg-transparent p-1.5 shadow-lg backdrop-blur-md dark:border-white/20"
        >
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                    active
                      ? "bg-neutral-200 text-primary dark:bg-neutral-800"
                      : "text-secondary hover:bg-secondary",
                  )}
                >
                  <item.icon className="size-[18px]" strokeWidth={1.75} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
