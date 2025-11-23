import type { Heading, Root, RootContent } from "mdast";

import {
  appendTask,
  enterCategory,
  ParserContext,
  startTaskSet,
} from "./context";
import {
  taskDecoratorRegistry,
  TaskType,
  TaskTypeSchema,
} from "./decoratorRegistry";
import type { TaskDecoratorContext } from "./decorators/base";
import { CategoryTypeSchema } from "./schema";
import type { CategoryType } from "./schema";
import { parserError } from "./utils/errors";
import { parseDecoratorLabel } from "./utils/decorators";
import { nodeToPlainText } from "./utils/nodeToPlainText";

export function processHeading({
  heading,
  index,
  nodes,
  tree,
  markdown,
  context,
  filePath,
}: {
  heading: Heading;
  index: number;
  nodes: RootContent[];
  tree: Root;
  markdown: string;
  context: ParserContext;
  filePath: string;
}) {
  const text = nodeToPlainText(heading);
  const decorator = parseDecoratorLabel(text);
  if (!decorator) return;

  const taskParse = TaskTypeSchema.safeParse(decorator.name);
  if (taskParse.success) {
    if (heading.depth !== 2 && heading.depth !== 3) {
      throw parserError(
        filePath,
        heading,
        `Task decorator only allowed at level 2 or 3: ## @${decorator.name}`,
      );
    }

    const taskType = taskParse.data as TaskType;
    const decoratorImpl = taskDecoratorRegistry[taskType];
    if (!decoratorImpl) {
      throw parserError(
        filePath,
        heading,
        `Missing TaskDecorator implementation for type "${taskType}"`,
      );
    }

    const ctx: TaskDecoratorContext = {
      filePath,
      root: tree,
      nodes,
      index,
      heading,
      decorator,
      markdown,
    };

    const { task, inlineDecorators } = decoratorImpl.handle(ctx);
    appendTask(context, task, heading, inlineDecorators);
    return;
  }

  const categoryParse = CategoryTypeSchema.safeParse(decorator.name);
  if (categoryParse.success) {
    if (heading.depth !== 1) {
      throw parserError(
        filePath,
        heading,
        `Category decorator only allowed at level 1: # @${decorator.name}`,
      );
    }

    enterCategory(context, categoryParse.data as CategoryType);
    return;
  }

  if (decorator.name === "set") {
    if (heading.depth !== 2) {
      throw parserError(
        filePath,
        heading,
        "@set only allowed at level 2: ## @set",
      );
    }

    startTaskSet(context, heading);
    return;
  }

  throw parserError(filePath, heading, `Unknown header decorator @${decorator.name}`);
}
