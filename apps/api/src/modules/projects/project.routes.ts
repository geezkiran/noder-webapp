import { Router } from "express";
import { projectQuerySchema } from "./project.schema";
import { findAllTags, findProjects } from "./project.service";

export const projectsRouter = Router();

projectsRouter.get("/", async (req, res, next) => {
  try {
    const query = projectQuerySchema.parse(req.query);
    const projects = await findProjects(query);
    res.json({ data: projects });
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/tags", async (_req, res, next) => {
  try {
    const tags = await findAllTags();
    res.json({ data: tags });
  } catch (error) {
    next(error);
  }
});
