import type { ProjectQuery } from "./project.schema";
import { ProjectModel } from "./project.model";

export async function findProjects(query: ProjectQuery) {
  const filter: Record<string, unknown> = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.tags?.length) {
    filter.tags = { $in: query.tags };
  }

  const projects = await ProjectModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return projects.map((project) => ({
    _id: project._id.toString(),
    title: project.title,
    description: project.description,
    imageUrl: project.imageUrl,
    tags: project.tags,
    author: project.author,
    badge: project.badge,
    stats: project.stats,
    createdAt: project.createdAt.toISOString(),
  }));
}

export async function findAllTags() {
  const tags = await ProjectModel.distinct("tags");
  return tags.sort();
}
