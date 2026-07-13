"use client";

import { usePathname } from "next/navigation";
import { SidebarNavigationSectionDividers } from "@/components/application/app-navigation/sidebar-navigation/sidebar-section-dividers";
import { navItemsWithDividers } from "@/config/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  return <SidebarNavigationSectionDividers activeUrl={pathname} items={navItemsWithDividers} />;
}
