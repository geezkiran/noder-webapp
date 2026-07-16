"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LifeBuoy, BookOpen, Command } from "lucide-react";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { useAuth } from "@/contexts/auth-context";

const STORAGE_USED_GB = 6.4;
const STORAGE_TOTAL_GB = 10;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SettingsSummary() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const usagePercent = Math.round((STORAGE_USED_GB / STORAGE_TOTAL_GB) * 100);

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="sticky top-0 flex flex-col gap-5">
      {/* Account card */}
      <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary ring-inset">
        <div className="flex items-center gap-3">
          <Avatar
            size="lg"
            src={user?.avatar_url ?? undefined}
            initials={user ? getInitials(user.display_name || user.username) : undefined}
            alt={user?.display_name ?? "Profile"}
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-primary">{user?.display_name ?? "—"}</p>
            <p className="truncate text-[15px] text-tertiary">{user?.email ?? "—"}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Badge color="brand" size="sm">
            Pro plan
          </Badge>
          <Badge color="gray" size="sm">
            Member since 2024
          </Badge>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[15px]">
            <span className="font-medium text-secondary">Storage used</span>
            <span className="text-tertiary">
              {STORAGE_USED_GB} GB / {STORAGE_TOTAL_GB} GB
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-tertiary">
            <div className="h-full rounded-full bg-brand-solid" style={{ width: `${usagePercent}%` }} />
          </div>
        </div>

        <Button color="secondary" size="sm" className="mt-5 w-full">
          Upgrade plan
        </Button>
        <Button color="tertiary" size="sm" className="mt-2 w-full" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>

      {/* Quick links */}
      <div className="flex flex-col gap-1 rounded-xl bg-primary p-2 shadow-xs ring-1 ring-secondary ring-inset">
        <Link
          href="/support"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] font-medium text-secondary transition-colors duration-100 ease-linear hover:bg-primary_hover"
        >
          <LifeBuoy className="size-4.5 text-fg-quaternary" strokeWidth={1.75} />
          Contact support
        </Link>
        <a
          href="#"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] font-medium text-secondary transition-colors duration-100 ease-linear hover:bg-primary_hover"
        >
          <BookOpen className="size-4.5 text-fg-quaternary" strokeWidth={1.75} />
          Documentation
        </a>
        <a
          href="#"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] font-medium text-secondary transition-colors duration-100 ease-linear hover:bg-primary_hover"
        >
          <Command className="size-4.5 text-fg-quaternary" strokeWidth={1.75} />
          Keyboard shortcuts
        </a>
      </div>

      <p className="px-1 text-[13px] text-quaternary">
        Changes are saved automatically. Some settings may take a few minutes to apply across all devices.
      </p>
    </div>
  );
}
