import type { Root, Heading, RootContent } from "mdast";
import type { Task, TaskType } from "../decoratorRegistry";
import type { DecoratorLabel } from "../utils/decorators";
import type { BlockBoundary, ContentBlock } from "../utils/markdown";

export interface TaskDecoratorContext {
  filePath: string;
  root: Root;
  nodes: RootContent[];
  index: number;
  heading: Heading;
  decorator: DecoratorLabel;
  markdown: string;
  consumeBlock: (options: {
    startIndex: number;
    stopAtHeadingDepth?: number;
    boundary?: BlockBoundary;
  }) => ContentBlock;
}

export type InlineDecoratorHandler<TTask extends Task = Task> = (
  task: TTask,
  markdown: string,
) => void;

export type InlineDecoratorMap<TTask extends Task = Task> = Record<
  string,
  InlineDecoratorHandler<TTask>
>;

export type DecoratedTask<TTask extends Task = Task> = {
  task: TTask;
  inlineDecorators?: InlineDecoratorMap<TTask>;
  nextIndex?: number;
};

export type TaskDecorator<TTask extends Task = Task> = {
  type: TaskType;
  handle(ctx: TaskDecoratorContext): DecoratedTask<TTask>;
};
