"use client";

import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { NodeFull } from "@/lib/api/types";

interface ComposeContextValue {
  /**
   * Subscribe to successful post creation (e.g. to prepend to a feed).
   * Returns an unsubscribe function.
   */
  onPostCreated: (listener: (node: NodeFull) => void) => () => void;
  /** Notify subscribers that a post was created (called by the compose page). */
  notifyPostCreated: (node: NodeFull) => void;
}

const ComposeContext = createContext<ComposeContextValue | null>(null);

export function ComposeProvider({ children }: { children: React.ReactNode }) {
  const listeners = useRef(new Set<(node: NodeFull) => void>());

  const onPostCreated = useCallback((listener: (node: NodeFull) => void) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  const notifyPostCreated = useCallback((node: NodeFull) => {
    listeners.current.forEach((fn) => fn(node));
  }, []);

  const value = useMemo(() => ({ onPostCreated, notifyPostCreated }), [onPostCreated, notifyPostCreated]);

  return <ComposeContext.Provider value={value}>{children}</ComposeContext.Provider>;
}

export function useCompose() {
  const ctx = useContext(ComposeContext);
  if (!ctx) throw new Error("useCompose must be used within ComposeProvider");
  return ctx;
}
