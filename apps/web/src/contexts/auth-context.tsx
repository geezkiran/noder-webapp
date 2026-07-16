"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "@/lib/api/auth";
import { getAccessToken, setAccessToken, setAuthChangeHandler } from "@/lib/api/client";
import { ApiError, type AuthTokens, type UserProfile } from "@/lib/api/types";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  user: UserProfile | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; username: string; password: string; display_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  applyTokens: (tokens: AuthTokens) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "noder_access_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const applyTokens = useCallback(async (tokens: AuthTokens) => {
    setAccessToken(tokens.access_token);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, tokens.access_token);
    // Login/register only return the bare PublicUser — fetch the full profile
    // (follower/node counts etc.) so the rest of the app sees a consistent shape.
    const profile = await authApi.me();
    setUser(profile);
    setStatus("authenticated");
  }, []);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setStatus("anonymous");
  }, []);

  useEffect(() => {
    // Let apiFetch's silent-refresh-on-401 logic update our state too.
    setAuthChangeHandler((tokens) => {
      if (tokens) {
        if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, tokens.access_token);
        authApi
          .me()
          .then((profile) => {
            setUser(profile);
            setStatus("authenticated");
          })
          .catch(() => clearAuth());
      } else {
        clearAuth();
      }
    });
    return () => setAuthChangeHandler(null);
  }, [clearAuth]);

  useEffect(() => {
    // Restore a session on load: try the stored access token first (fast path),
    // then fall back to the httpOnly refresh cookie via /auth/me's 401 retry.
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) setAccessToken(stored);

    authApi
      .me()
      .then((profile) => {
        setUser(profile);
        setStatus("authenticated");
      })
      .catch(() => {
        clearAuth();
      });
  }, [clearAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await authApi.login({ email, password });
      await applyTokens(tokens);
    },
    [applyTokens],
  );

  const register = useCallback(
    async (input: { email: string; username: string; password: string; display_name?: string }) => {
      const tokens = await authApi.register(input);
      await applyTokens(tokens);
    },
    [applyTokens],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // best-effort — clear local state regardless
    }
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({ user, status, login, register, logout, applyTokens }),
    [user, status, login, register, logout, applyTokens],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError, getAccessToken };
