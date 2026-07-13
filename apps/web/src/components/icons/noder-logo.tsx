import type { HTMLAttributes } from "react";
import { cx } from "@/utils/cx";

const LOGO_SRC = "/brand/noder-mark.png";
const LOGO_SIZE = "size-9";

function NoderLogoMark({ className }: { className?: string }) {
  return (
    <img
      src={LOGO_SRC}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cx(
        "shrink-0 object-contain brightness-0 dark:brightness-100",
        LOGO_SIZE,
        className,
      )}
    />
  );
}

export function NoderLogo({
  collapsed = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { collapsed?: boolean }) {
  return (
    <div
      className={cx(
        "flex h-10 min-w-0 items-center",
        collapsed ? "justify-center" : "ml-3 mt-2",
        className,
      )}
      aria-label="Noder"
      {...props}
    >
      <NoderLogoMark />
    </div>
  );
}
