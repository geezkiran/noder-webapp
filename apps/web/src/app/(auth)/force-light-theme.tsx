"use client";

import { useLayoutEffect } from "react";

/** Auth pages always render in light theme; restores the user's theme on leave. */
export function ForceLightTheme() {
  // Layout effect so the dark class is removed before paint — otherwise
  // client-side navigation from a dark-mode page flashes dark tokens.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark-mode");

    return () => {
      try {
        const stored = localStorage.getItem("noder-theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (stored === "dark" || (!stored && prefersDark)) {
          root.classList.add("dark-mode");
        }
      } catch {
        // ignore
      }
    };
  }, []);

  return null;
}
