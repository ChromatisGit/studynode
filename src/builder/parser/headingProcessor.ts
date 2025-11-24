import type { Heading, Root, RootContent } from "mdast";
import { appendTask, enterCategory, ParserContext, startTaskSet } from "./context";
import { taskDecoratorRegistry, TaskType, TaskTypeSchema } from "./decoratorRegistry";
import type { TaskDecoratorContext } from "./decorators/base";
import { CategoryTypeSchema } from "./schema";
import type { CategoryType } from "./schema";
import type { ContentBlock, BlockBoundary } from "./utils/markdown";
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
  consumeBlock,
}: {
  heading: Heading;
  index: number;
  nodes: RootContent[];
  tree: Root;
  markdown: string;
  context: ParserContext;
  filePath: string;
  consumeBlock: (options: {
    startIndex: number;
    stopAtHeadingDepth?: number;
    boundary?: BlockBoundary;
  }) => ContentBlock;
}): number {
  const text = nodeToPlainText(heading);
  const decorator = parseDecoratorLabel(text);
  if (!decorator) return index + 1;

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
      consumeBlock,
    };

    const { task, inlineDecorators, nextIndex } = decoratorImpl.handle(ctx);
    appendTask(context, task, heading, inlineDecorators);
    return nextIndex ?? index + 1;
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
    return index + 1;
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
    return index + 1;
  }

  throw parserError(filePath, heading, `Unknown header decorator @${decorator.name}`);
}
