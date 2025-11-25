import { TextTask, textTaskHandler } from "./decorators/textTask";
import { McqTask, mcqTaskHandler } from "./decorators/mcqTask";
import { MathTask, mathTaskHandler } from "./decorators/mathTask";
import { CodeTask, codeTaskHandler } from "./decorators/codeTask";
import { GapTask, gapTaskHandler } from "./decorators/gapTask";
import { z } from "zod";
import { RootContent } from "mdast";

export type DecoratorArgs = Record<string, string | number | boolean>;

export type Decorator = {
  name: string;
  depth: number
  args?: DecoratorArgs;
}

export type Task = McqTask | GapTask | TextTask | MathTask | CodeTask;

const taskTypes = ["text", "math", "code", "mcq", "gap"] as const;

export const TaskTypeSchema = z.enum(taskTypes);
export type TaskType = (typeof taskTypes)[number];

type TaskHandler = (params: { contentNodes: RootContent[]; args?: DecoratorArgs }) => Task;

const taskRegistry: Record<TaskType, TaskHandler> = {
    text: textTaskHandler,
    math: mathTaskHandler,
    code: codeTaskHandler,
    mcq: mcqTaskHandler,
    gap: gapTaskHandler
};

export function callTaskHandler(taskDecorator: Decorator, contentNodes: RootContent[]): Task {
    const parsedName = TaskTypeSchema.safeParse(taskDecorator.name);

    if (!parsedName.success) {
        throw new Error(
            `Task decorator "${taskDecorator.name}" is not registered. ` +
            `Registered types: ${taskTypes.join(", ")}`
        );
    }

    const handler = taskRegistry[parsedName.data];
    return handler({ contentNodes, args: taskDecorator.args ?? {} });
}
