"use client";

import { type FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { NoderLogo } from "@/components/icons/noder-logo";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "./theme-provider";
import { cx } from "@/utils/cx";

// ─── Custom gear icon (Bootstrap bi-gear) ────────────────────────────────────

function GearIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
    </svg>
  );
}

// ─── Exports consumed by the shell ───────────────────────────────────────────

export const NAV_DOCK_WIDTH = 64;

const NAV_BUTTON =
  "flex size-14 items-center justify-center rounded-2xl transition-colors";
const NAV_ICON = "size-5.5";

export const NAV_COLUMN_BASE =
  "flex h-full min-h-0 flex-col rounded-4xl";

export type DockNavItem = {
  label: string;
  href: string;
  icon: FC<{ className?: string; strokeWidth?: number }>;
};

// ─── Hover tooltip ────────────────────────────────────────────────────────────

function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <span
        className={cx(
          "pointer-events-none absolute left-full ml-2.5 z-50",
          "whitespace-nowrap rounded-lg px-2.5 py-1.5",
          "bg-neutral-200 text-neutral-900 text-[12px] font-medium shadow-lg",
          "dark:bg-neutral-800 dark:text-white",
          // animate: fade + slide in from left
          "opacity-0 -translate-x-1 scale-95",
          "group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100",
          "transition-all duration-150 ease-out",
        )}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({ item, active }: { item: DockNavItem; active: boolean }) {
  return (
    <Tip label={item.label}>
      <Link
        href={item.href}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={cx(
          NAV_BUTTON,
          active
            ? "bg-neutral-300 dark:bg-neutral-800"
            : "text-neutral-500 hover:bg-neutral-300 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        )}
      >
        <item.icon
          className={cx(NAV_ICON, active && "text-primary")}
          strokeWidth={1.75}
        />
      </Link>
    </Tip>
  );
}

// ─── Bottom items ─────────────────────────────────────────────────────────────

function ThemeItem() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Tip label={isDark ? "Light mode" : "Dark mode"}>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={cx(NAV_BUTTON, "text-neutral-500 hover:bg-neutral-300 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50")}
      >
        {isDark ? <Sun className={NAV_ICON} strokeWidth={1.75} /> : <Moon className={NAV_ICON} strokeWidth={1.75} />}
      </button>
    </Tip>
  );
}

function SettingsItem({ active }: { active: boolean }) {
  return (
    <Tip label="Settings">
      <Link
        href="/settings"
        aria-label="Settings"
        aria-current={active ? "page" : undefined}
        className={cx(
          NAV_BUTTON,
          active
            ? "bg-neutral-300 dark:bg-neutral-800"
            : "text-neutral-500 hover:bg-neutral-300 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        )}
      >
        <GearIcon className={cx(NAV_ICON, active && "text-primary")} />
      </Link>
    </Tip>
  );
}

const PROFILE = { name: "Kiran Prakash", handle: "@kiran", initials: "KR" };

function ProfileItem() {
  return (
    <Tip label={`${PROFILE.name} · ${PROFILE.handle}`}>
      <button
        type="button"
        aria-label="Switch account"
        className={cx(NAV_BUTTON, "transition-colors hover:bg-neutral-300 hover:ring-2 hover:ring-neutral-400 dark:hover:bg-neutral-800 dark:hover:ring-neutral-700")}
      >
        <div className="size-7 rounded-full bg-violet-500 flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-white dark:ring-neutral-950">
          {PROFILE.initials}
        </div>
      </button>
    </Tip>
  );
}

// ─── DockNavColumn ────────────────────────────────────────────────────────────

interface DockNavColumnProps {
  items: DockNavItem[];
}

export function DockNavColumn({ items }: DockNavColumnProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col items-center overflow-visible px-0 py-3">
      {/* Logo */}
      <div className="mb-6 flex shrink-0 items-center justify-center">
        <NoderLogo collapsed />
      </div>

      {/* Nav items */}
      <nav className="mt-2 flex flex-1 flex-col items-center justify-center gap-1 overflow-visible">
        {items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
          />
        ))}
      </nav>

      {/* Bottom: theme · settings · divider · profile */}
      <div className="flex shrink-0 flex-col items-center gap-0.5 pt-1">
        <ThemeItem />
        <SettingsItem active={pathname === "/settings"} />
        <div className="my-0.5 w-7 border-t border-secondary" />
        <ProfileItem />
      </div>
    </div>
  );
}
