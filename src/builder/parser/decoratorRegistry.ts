import { TextTask, textTaskDecorator } from "./decorators/textTask";
import { McqTask, mcqTaskDecorator } from "./decorators/mcqTask";
import { MathTask, mathTaskDecorator } from "./decorators/mathTask";
import { CodeTask, codeTaskDecorator } from "./decorators/codeTask";
import { GapTask, gapTaskDecorator } from "./decorators/gapTask";
import { z } from "zod";
import { TaskDecorator } from "./decorators/base";

export type Task = McqTask | GapTask | TextTask | MathTask | CodeTask;

export const TaskTypeSchema = z.enum(["text", "math", "code", "mcq", "gap"]);
export type TaskType = z.infer<typeof TaskTypeSchema>;

const allDecorators: TaskDecorator<any>[] = [
  textTaskDecorator,
  mcqTaskDecorator,
  mathTaskDecorator,
  codeTaskDecorator,
  gapTaskDecorator,
];

export const taskDecoratorRegistry: Record<TaskType, TaskDecorator<any>> =
  allDecorators.reduce((acc, dec) => {
    acc[dec.type as TaskType] = dec;
    return acc;
  }, {} as Record<TaskType, TaskDecorator<any>>);
