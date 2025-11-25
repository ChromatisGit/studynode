import { z } from "zod";

import { callTaskHandler, Decorator, TaskTypeSchema, type Task } from "./taskRegistry";
import { Heading, RootContent } from "mdast";
import { parseDecorator } from "./utils/decorators";
import { nodesToMarkdown, nodeToPlainText } from "./utils/nodeTransformer";

type CodeLanguage = "ts" | "python";

type TaskSet = {
  intro?: string;
  tasks: Task[];
};

const CategoryTypeSchema = z.enum(["checkpoint", "core", "challenge"]);
type CategoryType = z.infer<typeof CategoryTypeSchema>;

type Category = {
  category: CategoryType;
  taskSet: TaskSet[];
};

export class Parser {
  readonly #filePath: string;
  readonly #categories: Category[] = [];

  #currentTaskSet: TaskSet = { tasks: [] };
  #currentTaskDecorator?: Decorator;
  #contentNodes: RootContent[] = [];

  constructor(filePath: string) {
    this.#filePath = filePath;
  }

  processNode(node: RootContent) {

    if (node.type !== "heading") {
      this.#contentNodes.push(node)
      return;
    }

    const decorator = parseDecorator(node as Heading);
    if (!decorator) {
      this.#contentNodes.push(node)
      return;
    }

    const taskParse = TaskTypeSchema.safeParse(decorator.name);
    if (taskParse.success) {
      this.handleTaskDecorator(decorator);
      return;
    }

    const categoryParse = CategoryTypeSchema.safeParse(decorator.name);
    if (categoryParse.success) {
      this.handleCategoryDecorator(decorator);
      return;
    }

    // Special @set decorator
    if (decorator.name === "set") {
      this.handleSetDecorator(decorator);
      return;
    }

    throw this.parserError(`Unknown decorator @${decorator.name}`);
  }

  finalize() {
    this.startNewTaskSet();
    return this.#categories;
  }

  // ────────────────────────────────────────────────────────────
  // Private helpers
  // ────────────────────────────────────────────────────────────

  private handleTaskDecorator(decorator: Decorator) {
    if (decorator.depth !== 2 && decorator.depth !== 3) {
      throw this.parserError(
        `Task decorator only allowed at level 2 or 3: @${decorator.name}`
      );
    }

    if (decorator.depth === 2) {
      this.startNewTaskSet();
    }

    if (decorator.depth === 3 && !this.#currentTaskDecorator) {
      this.addIntroTextToTaskSet();
    }

    this.setCurrentTask(decorator);

  }

  private handleCategoryDecorator(decorator: Decorator) {
    if (decorator.depth !== 1) {
      throw this.parserError(
        `Category decorator only allowed at level 1: @${decorator.name}`
      );
    }

    this.startNewCategory(decorator.name);
  }

  private handleSetDecorator(decorator: Decorator) {
    if (decorator.depth !== 2) {
      throw this.parserError("@set only allowed at level 2: @set");
    }

    this.startNewTaskSet();
  }

  private startNewCategory(categoryType: string) {
    this.startNewTaskSet();
    this.#categories.push({ category: categoryType as CategoryType, taskSet: [] });
  }

  private startNewTaskSet() {
    this.addCurrentTaskIfDefined();

    if (this.#currentTaskSet.tasks.length > 0) {
      if (this.#categories.length === 0) {
        throw this.parserError("No category defined. Add a category decorator (# @core / # @checkpoint / # @challenge).");
      }
      this.#categories[this.#categories.length - 1].taskSet.push(this.#currentTaskSet);
    }

    this.#currentTaskSet = { tasks: [] };
  }

  private addIntroTextToTaskSet() {
    this.#currentTaskSet.intro = nodesToMarkdown(this.#contentNodes)
    this.#contentNodes = []
  }

  private setCurrentTask(decorator: Decorator) {
    this.addCurrentTaskIfDefined();
    this.#currentTaskDecorator = decorator;
  }

  private addCurrentTaskIfDefined() {

    if (this.#currentTaskDecorator) {
      const taskData: Task = callTaskHandler(this.#currentTaskDecorator, this.#contentNodes)

      this.#currentTaskSet.tasks.push(taskData)

      this.#contentNodes = []
      this.#currentTaskDecorator = undefined;
    }
  }

  private parserError(message: string): Error {
    const currentNode = this.#contentNodes[this.#contentNodes.length - 1];
    const line = currentNode?.position?.start?.line;
    const prefix = line != null ? `${this.#filePath}:${line}` : this.#filePath;
    return new Error(`${prefix}: ${message}`);
  }
}
