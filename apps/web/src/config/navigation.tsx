import {
  Folder,
  LayoutAlt01,
  MessageChatCircle,
  PieChart03,
  Settings01,
} from "@untitledui/icons";
import type { NavItemDividerType, NavItemType } from "@/components/application/app-navigation/config";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { DashboardIcon } from "@/components/icons/dashboard-icon";
import { HomeIcon } from "@/components/icons/home-icon";
import { ProjectsIcon } from "@/components/icons/projects-icon";

export const navItemsWithDividers: (NavItemType | NavItemDividerType)[] = [
  {
    label: "Home",
    href: "/",
    icon: HomeIcon,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: ProjectsIcon,
  },
  { divider: true },
  {
    label: "Folders",
    icon: Folder,
    href: "/folders",
    items: [
      { label: "View all", badge: 18, href: "/folders/view-all" },
      { label: "Recent", badge: 8, href: "/folders/recent" },
      { label: "Favorites", badge: 6, href: "/folders/favorites" },
      { label: "Shared", badge: 4, href: "/folders/shared" },
    ],
  },
  { divider: true },
  {
    label: "Reporting",
    href: "/reporting",
    icon: PieChart03,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings01,
  },
  {
    label: "Support",
    href: "/support",
    icon: MessageChatCircle,
    badge: (
      <BadgeWithDot color="success" type="modern" size="sm">
        Online
      </BadgeWithDot>
    ),
  },
  {
    label: "Open in browser",
    href: "https://www.untitledui.com/",
    icon: LayoutAlt01,
  },
];
