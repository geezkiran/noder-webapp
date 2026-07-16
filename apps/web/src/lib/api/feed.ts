import { apiFetchWithMeta } from "./client";
import type { NodeCard } from "./types";

export function getFeed(params: { page?: number; limit?: number } = {}) {
  return apiFetchWithMeta<NodeCard[]>("/feed", { query: params });
}

export function getTrending(params: { limit?: number } = {}) {
  return apiFetchWithMeta<NodeCard[]>("/feed/trending", { query: params });
}
