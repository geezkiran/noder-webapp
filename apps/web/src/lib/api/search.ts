import { apiFetchWithMeta } from "./client";
import type { SearchResult } from "./types";

export function searchNodes(q: string, params: { page?: number; limit?: number; hierarchy_id?: string } = {}) {
  return apiFetchWithMeta<SearchResult[]>("/search", { query: { q, ...params } });
}
