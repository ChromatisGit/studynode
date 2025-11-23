import type { Root, Heading, RootContent } from "mdast";
import type { Task, TaskType } from "../decoratorRegistry";
import type { DecoratorLabel } from "../utils/decorators";

export interface TaskDecoratorContext {
  filePath: string;
  root: Root;
  nodes: RootContent[];
  index: number;
  heading: Heading;
  decorator: DecoratorLabel;
  markdown: string;
}

export type InlineDecoratorHandler<TTask extends Task = Task> = (
  task: TTask,
  markdown: string,
) => void;

export type InlineDecoratorMap<TTask extends Task = Task> = Record<
  string,
  InlineDecoratorHandler<TTask>
>;

export interface DecoratedTask<TTask extends Task = Task> {
  task: TTask;
  inlineDecorators?: InlineDecoratorMap<TTask>;
}

export interface TaskDecorator<TTask extends Task = Task> {
  type: TaskType;
  handle(ctx: TaskDecoratorContext): DecoratedTask<TTask>;
}
