const { z } = require("zod");

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().default(""),
  completed: z.boolean().optional().default(false),
});

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty").optional(),
    description: z.string().trim().optional(),
    completed: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please provide at least one field to update",
  });

module.exports = {
  createTaskSchema,
  updateTaskSchema,
};
