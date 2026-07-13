import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    tags: { type: [String], default: [] },
    author: {
      name: { type: String, required: true },
      avatarUrl: { type: String },
    },
    badge: { type: String },
    stats: {
      forks: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

projectSchema.index({ title: "text", description: "text" });
projectSchema.index({ tags: 1 });

export const ProjectModel = mongoose.model("Project", projectSchema);
