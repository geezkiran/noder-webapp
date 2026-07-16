import { apiFetch, apiFetchWithMeta } from "./client";
import type { NodeCard, NodeDetail, NodeFull, NodeBlock, GraphPayload, GraphVertex, NodeRelationType } from "./types";

export function listNodes(params: { page?: number; limit?: number; hierarchy_id?: string; sort?: "new" | "top" | "trending" } = {}) {
  return apiFetchWithMeta<NodeCard[]>("/nodes", { query: params });
}

// Mirror of NoderBackend-Fable's createNodeSchema. `hierarchy_node_id` must point
// at an approved branch or the backend rejects the post.
export interface CreateNodeInput {
  title: string;
  summary?: string;
  cover_image?: string;
  hierarchy_node_id: string;
  body?: NodeBlock[];
  tags?: string[];
}

export function createNode(input: CreateNodeInput) {
  return apiFetch<NodeFull>("/nodes", { method: "POST", body: input });
}

export function getNode(id: string) {
  return apiFetch<NodeDetail>(`/nodes/${id}`);
}

export function voteNode(id: string, value: 1 | -1 | 0) {
  return apiFetch<{ vote_count: number }>(`/nodes/${id}/vote`, { method: "POST", body: { value } });
}

export function bookmarkNode(id: string) {
  return apiFetch<{ bookmarked: true }>(`/nodes/${id}/bookmark`, { method: "POST" });
}

export function unbookmarkNode(id: string) {
  return apiFetch<{ bookmarked: false }>(`/nodes/${id}/bookmark`, { method: "DELETE" });
}

export function createRelation(id: string, toNodeId: string, relationType: NodeRelationType) {
  return apiFetch<{ id: string }>(`/nodes/${id}/relations`, {
    method: "POST",
    body: { to_node_id: toNodeId, relation_type: relationType },
  });
}

export function getNodeGraph(id: string, depth = 1) {
  return apiFetch<GraphPayload & { root: GraphVertex }>(`/nodes/${id}/graph`, { query: { depth } });
}
