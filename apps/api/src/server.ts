import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDatabase } from "./config/database";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { projectsRouter } from "./modules/projects/project.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/projects", projectsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/noder-enterprise";

async function start() {
  await connectDatabase(mongoUri);
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
