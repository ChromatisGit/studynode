import { McqTask, GapTask, GapMcqTask, TextTask, MathTask, CodeTask } from "@schema/tasks";
import { textTaskDecorator } from "./textTask";
import { mcqTaskDecorator } from "./mcqTask";
import { mathTaskDecorator } from "./mathTask";
import { codeTaskDecorator } from "./codeTask";
import { gapTaskDecorator } from "./gapTask";
import { z } from "zod";
import { TaskDecorator } from "./base";

export type Task = McqTask | GapTask | GapMcqTask | TextTask | MathTask | CodeTask;

export const TaskTypeSchema = z.enum(["text", "math", "code", "mcq", "gap"]);
export type TaskType = z.infer<typeof TaskTypeSchema>;

const allDecorators: TaskDecorator[] = [
  textTaskDecorator,
  mcqTaskDecorator,
  mathTaskDecorator,
  codeTaskDecorator,
  gapTaskDecorator,
];

export const taskDecoratorRegistry: Record<TaskType, TaskDecorator> =
  allDecorators.reduce((acc, dec) => {
    acc[dec.type as TaskType] = dec;
    return acc;
  }, {} as Record<TaskType, TaskDecorator>);

export type CodeLanguage = "ts" | "python";

export type TaskSet = {
  text?: string;
  language?: CodeLanguage;
  task: Task[];
}

export const CategoryTypeSchema = z.enum(["checkpoint", "core", "challenge"]);
export type CategoryType = z.infer<typeof CategoryTypeSchema>;

export type Category = {
  category: CategoryType;
  taskSet: TaskSet[];
}