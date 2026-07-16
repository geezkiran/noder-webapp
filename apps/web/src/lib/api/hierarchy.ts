import { apiFetch, apiFetchWithMeta } from "./client";
import type { HierarchyTreeNode, HierarchyNodeRow, NodeCard, GraphPayload } from "./types";

export function getHierarchyTree() {
  return apiFetch<HierarchyTreeNode[]>("/hierarchy");
}

export function getHierarchyNode(id: string) {
  return apiFetch<HierarchyNodeRow>(`/hierarchy/${id}`);
}

export function getHierarchyChildren(id: string) {
  return apiFetch<HierarchyNodeRow[]>(`/hierarchy/${id}/children`);
}

export function getHierarchyFeed(id: string, params: { page?: number; limit?: number } = {}) {
  return apiFetchWithMeta<NodeCard[]>(`/hierarchy/${id}/feed`, { query: params });
}

export function getHierarchyGraph(id: string) {
  return apiFetch<GraphPayload>(`/hierarchy/${id}/graph`);
}
