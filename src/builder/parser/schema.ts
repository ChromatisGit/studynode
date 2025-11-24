import { z } from "zod";

import type { Task } from "./decoratorRegistry";

export type CodeLanguage = "ts" | "python";

export type TaskSet = {
  text?: string;
  task: Task[];
};

export const CategoryTypeSchema = z.enum(["checkpoint", "core", "challenge"]);
export type CategoryType = z.infer<typeof CategoryTypeSchema>;

export type Category = {
  category: CategoryType;
  taskSet: TaskSet[];
};
