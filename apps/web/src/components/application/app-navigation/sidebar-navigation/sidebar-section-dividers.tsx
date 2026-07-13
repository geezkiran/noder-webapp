"use client";

import { SearchLg } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { MAIN_SIDEBAR_WIDTH, SIDEBAR_OFFSET } from "../sidebar-layout";
import { useSidebar } from "../sidebar-context";
import { MobileNavigationHeader } from "../base-components/mobile-header";
import { NavAccountCard } from "../base-components/nav-account-card";
import { NavList } from "../base-components/nav-list";
import type { NavItemDividerType, NavItemType } from "../config";
import { cx } from "@/utils/cx";

interface SidebarNavigationSectionDividersProps {
    /** URL of the currently active item. */
    activeUrl?: string;
    /** List of items to display. */
    items: (NavItemType | NavItemDividerType)[];
}

export const SidebarNavigationSectionDividers = ({ activeUrl, items }: SidebarNavigationSectionDividersProps) => {
    const { isOpen } = useSidebar();

    const content = (
        <aside
            style={
                {
                    "--width": `${MAIN_SIDEBAR_WIDTH}px`,
                } as React.CSSProperties
            }
            className="flex h-full w-full max-w-full flex-col justify-between overflow-auto bg-primary pt-4 shadow-xs ring-secondary ring-inset lg:w-(--width) lg:rounded-3xl lg:bg-transparent lg:pt-5 lg:shadow-none lg:ring-0"
        >
            <div className="flex flex-col gap-5 px-4 lg:px-5">
                <div aria-hidden="true" className="h-6" />

                {/* Mobile search input */}
                <Input size="md" aria-label="Search" placeholder="Search" icon={SearchLg} className="md:hidden" />

                {/* Desktop search input */}
                <Input shortcut size="sm" aria-label="Search" placeholder="Search" icon={SearchLg} className="max-md:hidden" />
            </div>

            <NavList activeUrl={activeUrl} items={items} />

            <div className="mt-auto flex flex-col gap-5 px-2 py-4 lg:gap-6 lg:px-4 lg:py-4">
                <NavAccountCard />
            </div>
        </aside>
    );

    return (
        <>
            {/* Mobile header navigation */}
            <MobileNavigationHeader>{content}</MobileNavigationHeader>

            {/* Desktop sidebar navigation */}
            <div
                className={cx(
                    "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:p-4 transition-all duration-300 ease-in-out",
                    isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none",
                )}
            >
                {content}
            </div>

            {/* Placeholder to take up physical space because the real sidebar has `fixed` position. */}
            <div
                style={{
                    paddingLeft: isOpen ? SIDEBAR_OFFSET : 0,
                }}
                className={cx(
                    "invisible hidden shrink-0 transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:bottom-0 lg:left-0 lg:block",
                    !isOpen && "w-0 p-0",
                )}
            />
        </>
    );
};
