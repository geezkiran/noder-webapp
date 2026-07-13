"use client";

import type { ReactNode } from "react";
import { ThreeColumnShell } from "@/components/layout/three-column-shell";

export function AppShell({ children }: { children: ReactNode }) {
  return <ThreeColumnShell>{children}</ThreeColumnShell>;
}
