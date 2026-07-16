import { apiFetch } from "./client";
import type { AiQueryResult } from "./types";

export function aiQuery(input: { query: string; hierarchy_node_id?: string; top_k?: number }) {
  return apiFetch<AiQueryResult>("/ai/query", { method: "POST", body: input });
}

export function aiFeedback(queryId: string, feedback: 1 | -1) {
  return apiFetch<{ recorded: true }>(`/ai/query/${queryId}/feedback`, { method: "POST", body: { feedback } });
}
