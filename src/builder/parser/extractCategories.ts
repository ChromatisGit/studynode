import { readFile } from "node:fs/promises";
import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Root, Heading, RootContent } from "mdast";

import { Category, CategoryTypeSchema, Task, taskDecoratorRegistry, TaskSet, TaskType, TaskTypeSchema } from "./decorators/decoratorRegistry";
import type { TaskDecoratorContext } from "./decorators/base";

export async function extractCategories(): Promise<Category[]> {
  const markdown = await readFile(
    "base/math/vektorgeometrie/content-pool/example.md",
    "utf8",
  );

  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const nodes = tree.children as RootContent[];

  const categories: Category[] = [];
  let currentCategory: Category | undefined;
  let currentTaskSet: TaskSet | undefined;
  let currentTask: Task | undefined;

  const ensureCurrentCategory = () => {
    if (!currentCategory) {
      throw new Error("Decorator without Category (# @core / # @checkpoint / # @challenge)");
    }
    return currentCategory;
  };

  const ensureCurrentTaskSet = () => {
    const cat = ensureCurrentCategory();
    if (!currentTaskSet) {
      currentTaskSet = { task: [] };
      cat.taskSet.push(currentTaskSet);
    }
    return currentTaskSet;
  };

  nodes.forEach((node, index) => {
    // ---------- 1. Headings ----------
    if (node.type === "heading") {
      const heading = node as Heading;
      const text = nodeToPlainText(heading);
      const decorator = parseDecoratorLabel(text);
      if (!decorator) return;

      // Task-Type?
      const taskParse = TaskTypeSchema.safeParse(decorator.name);
      if (taskParse.success) {
        if (heading.depth !== 2 && heading.depth !== 3) {
          throw new Error(
            `Task decorator only allowed at level 2 or 3: ## @${decorator.name}`,
          );
        }

        const taskType = taskParse.data as TaskType;
        const decoratorImpl = taskDecoratorRegistry[taskType];
        if (!decoratorImpl) {
          throw new Error(`Kein TaskDecorator für Typ "${taskType}"`);
        }

        const ctx: TaskDecoratorContext = {
          root: tree,
          nodes,
          index,
          heading,
          decorator,
        };

        const task = decoratorImpl.handle(ctx);
        const taskSet = ensureCurrentTaskSet();
        taskSet.task.push(task);
        currentTask = task;
        return;
      }

      // Category?
      const categoryParse = CategoryTypeSchema.safeParse(decorator.name);
      if (categoryParse.success) {
        if (heading.depth !== 1) {
          throw new Error(
            `Category decorator only allowed at level 1: # @${decorator.name}`,
          );
        }

        currentCategory = {
          category: categoryParse.data,
          taskSet: [],
        };
        categories.push(currentCategory);
        currentTask = undefined;
        currentTaskSet = undefined;
        return;
      }

      // Set?
      if (decorator.name === "set") {
        if (heading.depth !== 2) {
          throw new Error("@set only allowed at level 2: ## @set");
        }

        const cat = ensureCurrentCategory();
        currentTaskSet = { task: [] };
        cat.taskSet.push(currentTaskSet);
        currentTask = undefined;
        return;
      }

      throw new Error(`Unknown header decorator @${decorator.name}`);
    }

    // ---------- 2. Inline-Decoratoren ----------
    const paraDeco = getParagraphDecorator(node);
    if (paraDeco && currentTask) {
      const { name } = paraDeco;
      const { markdown } = collectBlockUntilBoundary(nodes, index);

      if (name === "hint" && "hint" in currentTask) {
        (currentTask as any).hint = markdown.trim();
        return;
      }
      if (name === "solution" && "solution" in currentTask) {
        (currentTask as any).solution = markdown.trim();
        return;
      }
      if (name === "validation" && currentTask.type === "code") {
        (currentTask as any).validation = markdown.trim();
        return;
      }
    }
  });

  return categories;
}
