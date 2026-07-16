import { ApiError, type AuthTokens, type Envelope } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

// Held in module scope so `apiFetch` can attach/refresh the bearer token without
// prop-drilling — set once by AuthProvider on load/login/logout.
let accessToken: string | null = null;
let onAuthChange: ((tokens: AuthTokens | null) => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// AuthProvider registers itself here so a silent refresh (triggered by a 401
// deep inside some unrelated fetch) can still update shared auth state.
export function setAuthChangeHandler(handler: ((tokens: AuthTokens | null) => void) | null) {
  onAuthChange = handler;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(API_URL.replace(/\/$/, "") + path, "http://placeholder");
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  // Strip the placeholder origin back out — API_URL is always absolute already.
  return url.toString().replace("http://placeholder", "");
}

async function rawFetch<T>(path: string, options: RequestOptions): Promise<Envelope<T>> {
  const res = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const envelope = (await res.json()) as Envelope<T>;
  return envelope;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const envelope = await rawFetch<AuthTokens>("/auth/refresh", { method: "POST", body: {} });
    if (envelope.success && envelope.data) {
      accessToken = envelope.data.access_token;
      onAuthChange?.(envelope.data);
      return true;
    }
  } catch {
    // fall through to failure below
  }
  onAuthChange?.(null);
  return false;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}, _retried = false): Promise<T> {
  const envelope = await rawFetch<T>(path, options);

  if (!envelope.success) {
    const status = envelope.error?.code === "unauthorized" ? 401 : 400;
    if (status === 401 && !_retried && path !== "/auth/refresh") {
      const refreshed = await tryRefresh();
      if (refreshed) return apiFetch<T>(path, options, true);
    }
    throw new ApiError(envelope.error?.code ?? "unknown_error", envelope.error?.message ?? "Request failed", status);
  }

  return envelope.data as T;
}

export function apiFetchWithMeta<T>(path: string, options: RequestOptions = {}): Promise<{ data: T; meta: Envelope<T>["meta"] }> {
  return rawFetch<T>(path, options).then((envelope) => {
    if (!envelope.success) {
      throw new ApiError(envelope.error?.code ?? "unknown_error", envelope.error?.message ?? "Request failed", 400);
    }
    return { data: envelope.data as T, meta: envelope.meta };
  });
}
