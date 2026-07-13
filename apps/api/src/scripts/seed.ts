import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { ProjectModel } from "../modules/projects/project.model";

const seedProjects = [
  {
    title: "Healthcare Landing Page Redesign",
    description:
      "A modern healthcare landing page focused on accessibility, trust, and clear patient journeys. Includes responsive layouts, appointment CTAs, and a calming visual system.",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Web Design", "Product Design"],
    author: { name: "Baranov" },
    badge: "Main",
    stats: { forks: 2400, likes: 32000, comments: 21 },
  },
  {
    title: "Healthcare Landing Page Redesign",
    description:
      "Compact card variant for the same healthcare redesign concept, optimized for dense dashboard browsing.",
    tags: ["Web Design", "Product Design"],
    author: { name: "Baranov" },
    badge: "Main",
    stats: { forks: 2400, likes: 32000, comments: 21 },
  },
  {
    title: "Fintech Dashboard UI",
    description:
      "Clean analytics dashboard with portfolio overview, transaction history, and investment insights.",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    tags: ["UI Design", "Dashboard"],
    author: { name: "Baranov" },
    stats: { forks: 890, likes: 12400, comments: 14 },
  },
  {
    title: "Mobile Banking App",
    description:
      "Minimal mobile banking experience with biometric login, card management, and spending insights.",
    tags: ["Mobile", "Product Design"],
    author: { name: "Baranov" },
    stats: { forks: 560, likes: 9800, comments: 9 },
  },
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/noder-enterprise";
  await connectDatabase(mongoUri);

  await ProjectModel.deleteMany({});
  await ProjectModel.insertMany(
    seedProjects.map((project, index) => ({
      ...project,
      createdAt: new Date(2026, 2, 8 - index),
      updatedAt: new Date(2026, 2, 8 - index),
    }))
  );

  console.log(`Seeded ${seedProjects.length} projects`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
