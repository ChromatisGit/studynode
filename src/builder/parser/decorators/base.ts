import type { Root, Heading, RootContent } from "mdast";
import type { Task, TaskType } from "./decoratorRegistry";
import type { DecoratorLabel } from "../parseDecorators";

export interface TaskDecoratorContext {
  root: Root;
  nodes: RootContent[];
  index: number;
  heading: Heading;
  decorator: DecoratorLabel;
}

export interface TaskDecorator<TTask extends Task = Task> {
  type: TaskType;
  handle(ctx: TaskDecoratorContext): TTask;
}