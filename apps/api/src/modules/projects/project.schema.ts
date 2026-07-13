import { z } from "zod";

export const projectQuerySchema = z.object({
  search: z.string().optional(),
  tags: z
    .string()
    .optional()
    .transform((value) =>
      value ? value.split(",").map((tag) => tag.trim()).filter(Boolean) : undefined
    ),
});

export type ProjectQuery = z.infer<typeof projectQuerySchema>;
