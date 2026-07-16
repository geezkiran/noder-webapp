// Hand-written mirror of NoderBackend-Fable's response shapes.
// Source of truth: NoderBackend-Fable/src/types/index.ts and src/routes/*.ts

export interface Envelope<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  meta?: { page?: number; limit?: number; total?: number; cursor?: string | null };
}

export type UserRole = "user" | "moderator" | "admin";

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  reputation: number;
  created_at: string;
}

export interface UserProfile extends PublicUser {
  node_count: number;
  follower_count: number;
  following_count: number;
  total_votes: number;
}

export interface AuthTokens {
  user: PublicUser;
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
}

export type NodeRelationType =
  | "extends"
  | "contradicts"
  | "references"
  | "is_part_of"
  | "prerequisite"
  | "see_also";

export interface InlineLink {
  node_id: string;
  display_text: string;
}

export type NodeBlock =
  | { type: "text"; content: string; inline_links?: InlineLink[] }
  | { type: "image"; url: string; caption?: string }
  | { type: "video"; url: string; provider: "youtube" | "vimeo" | "direct" }
  | { type: "link"; url: string; preview?: { title?: string; description?: string; image?: string } }
  | { type: "code"; language: string; content: string }
  | { type: "callout"; variant: "info" | "warning" | "tip"; content: string }
  | { type: "divider" }
  | { type: "embed"; url: string; provider: string };

export interface NodeCard {
  id: string;
  author_id: string;
  hierarchy_node_id: string;
  title: string;
  summary: string | null;
  cover_image: string | null;
  hierarchy_path: string[];
  vote_count: number;
  bookmark_count: number;
  relation_count: number;
  x: number;
  y: number;
  created_at: string;
  updated_at: string;
}

export interface NodeFull extends NodeCard {
  body: NodeBlock[];
}

export interface NodeDetail extends NodeFull {
  author_username: string;
  tags: string[];
}

export interface HierarchyNodeRow {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  path: string;
  depth: number;
  status: "pending" | "approved" | "rejected";
  x: number;
  y: number;
  radius: number;
  node_count: number;
  created_at: string;
  updated_at: string;
}

export interface HierarchyTreeNode extends HierarchyNodeRow {
  children: HierarchyTreeNode[];
}

export interface GraphVertex {
  id: string;
  title: string;
  summary: string | null;
  cover_image: string | null;
  hierarchy_path: string[];
  vote_count: number;
  relation_count: number;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: NodeRelationType | "inline";
  inline: boolean;
}

export interface GraphPayload {
  vertices: GraphVertex[];
  edges: GraphEdge[];
}

export interface AiQuerySource {
  id: string;
  title: string;
  summary: string | null;
  hierarchy_path: string[];
  similarity: number;
}

export interface AiQueryResult {
  query_id: string;
  answer: string;
  model: string;
  sources: AiQuerySource[];
}

export interface SearchResult extends NodeCard {
  rank: number;
}

export interface GoogleAuthUrl {
  configured: boolean;
  message?: string;
  authorization_url?: string;
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}
