import type { CodeTask } from "./parser/decorators/codeTask";
import type { GapTask } from "./parser/decorators/gapTask";
import type { MathTask } from "./parser/decorators/mathTask";
import type { McqTask } from "./parser/decorators/mcqTask";
import type { TextTask } from "./parser/decorators/textTask";

export type RenderMode = "web" | "pdf" | "pdfSolutions";

export type Task = McqTask | GapTask | TextTask | MathTask | CodeTask;


type InfoBlock = {
  kind: "info";
  title: string;
  text: string;
};

export type TaskSet = {
  kind: "taskSet";
  intro?: string;
  tasks: Task[];
};

export type CategoryItem = TaskSet | InfoBlock;

export const categoryTypes = ["info", "checkpoint", "core", "challenge"] as const;
export type CategoryType = (typeof categoryTypes)[number];

export type TaskCategory = {
  kind: Exclude<CategoryType, "info">;
  items: CategoryItem[];
};

export type Category = InfoBlock | TaskCategory;

export type Worksheet = {
  title: string;
  format: RenderMode;
  content: Category[];
};