"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cx } from "@/utils/cx";

export interface SettingsNavSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

export function SettingsNav({ sections }: { sections: SettingsNavSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const clickScrollUntil = useRef(0);

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < clickScrollUntil.current) return;

        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        setActiveId(topMost.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const handleClick = (id: string) => {
    setActiveId(id);
    clickScrollUntil.current = Date.now() + 700;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav aria-label="Settings sections" className="sticky top-0">
      <ul className="flex flex-col gap-0.5">
        {sections.map(({ id, label, icon: Icon }) => {
          const isActive = activeId === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => handleClick(id)}
                aria-current={isActive ? "true" : undefined}
                className={cx(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[15px] font-medium transition-colors duration-100 ease-linear",
                  isActive ? "bg-active text-primary" : "text-tertiary hover:bg-primary_hover hover:text-secondary",
                )}
              >
                <Icon
                  className={cx("size-4.5 shrink-0", isActive ? "text-fg-brand-primary" : "text-fg-quaternary")}
                  strokeWidth={1.75}
                />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
