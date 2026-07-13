export interface ProjectAuthor {
  name: string;
  avatarUrl?: string;
}

export interface ProjectStats {
  forks: number;
  likes: number;
  comments: number;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  author: ProjectAuthor;
  badge?: string;
  stats: ProjectStats;
  createdAt: string;
}

export interface ProjectFilters {
  search?: string;
  tags?: string[];
}
