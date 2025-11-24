import type { RootContent } from "mdast";

import type { Task } from "./decoratorRegistry";
import type { Category, CategoryType, TaskSet } from "./schema";
import type { InlineDecoratorMap } from "./decorators/base";
import { parserError } from "./utils/errors";

export type ParserContext = {
  filePath: string;
  categories: Category[];
  currentCategory?: Category;
  currentTaskSet?: TaskSet;
  currentTask?: Task;
  inlineDecorators?: InlineDecoratorMap;
};

export function createParserContext(filePath: string): ParserContext {
  return { filePath, categories: [] };
}

export function enterCategory(ctx: ParserContext, categoryType: CategoryType) {
  ctx.currentCategory = {
    category: categoryType,
    taskSet: [],
  };
  ctx.categories.push(ctx.currentCategory);
  ctx.currentTaskSet = undefined;
  ctx.currentTask = undefined;
  ctx.inlineDecorators = undefined;
}

export function startTaskSet(ctx: ParserContext, node: RootContent) {
  const category = requireCategory(ctx, node);
  const taskSet: TaskSet = { task: [] };
  category.taskSet.push(taskSet);
  ctx.currentTaskSet = taskSet;
  ctx.currentTask = undefined;
  ctx.inlineDecorators = undefined;
}

export function appendTask(
  ctx: ParserContext,
  task: Task,
  node: RootContent,
  inlineDecorators?: InlineDecoratorMap,
) {
  const taskSet = ensureTaskSet(ctx, node);
  taskSet.task.push(task);
  ctx.currentTask = task;
  ctx.inlineDecorators = inlineDecorators;
}

export function ensureTaskSet(ctx: ParserContext, node: RootContent): TaskSet {
  if (!ctx.currentTaskSet) {
    const category = requireCategory(ctx, node);
    ctx.currentTaskSet = { task: [] };
    category.taskSet.push(ctx.currentTaskSet);
  }
  return ctx.currentTaskSet;
}

export function requireCategory(ctx: ParserContext, node: RootContent): Category {
  if (!ctx.currentCategory) {
    throw parserError(
      ctx.filePath,
      node,
      "Decorator requires a category (# @core / # @checkpoint / # @challenge)",
    );
  }
  return ctx.currentCategory;
}
