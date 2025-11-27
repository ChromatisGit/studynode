import { TextTask, textTaskHandler } from "./decorators/textTask";
import { McqTask, mcqTaskHandler } from "./decorators/mcqTask";
import { MathTask, mathTaskHandler } from "./decorators/mathTask";
import { CodeTask, codeTaskHandler } from "./decorators/codeTask";
import { GapTask, gapTaskHandler } from "./decorators/gapTask";
import { z } from "zod";
import { RootContent } from "mdast";

export type Task = McqTask | GapTask | TextTask | MathTask | CodeTask;

const taskRegistry = {
    text: textTaskHandler,
    math: mathTaskHandler,
    code: codeTaskHandler,
    mcq: mcqTaskHandler,
    gap: gapTaskHandler,
} satisfies Record<string, TaskHandler>;


export type DecoratorArgs = Record<string, string | number | boolean>;

export type Decorator = {
    name: string;
    depth: number;
    args?: DecoratorArgs;
};

type TaskHandler = (params: {
    contentNodes: RootContent[];
    args: DecoratorArgs;
}) => Task;


export type TaskType = keyof typeof taskRegistry;

const taskTypes = Object.keys(taskRegistry) as TaskType[];
export const TaskTypeSchema = z.enum(taskTypes);

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
