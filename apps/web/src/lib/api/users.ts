import { apiFetch, apiFetchWithMeta } from "./client";
import type { NodeCard, UserProfile } from "./types";

export function getUserProfile(id: string) {
  return apiFetch<UserProfile>(`/users/${id}/profile`);
}

export function getUserNodes(id: string, params: { page?: number; limit?: number } = {}) {
  return apiFetchWithMeta<NodeCard[]>(`/users/${id}/nodes`, { query: params });
}
