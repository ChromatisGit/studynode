import { Heading, RootContent } from "mdast";
import { z } from "zod";

import {
  callTaskHandler,
  Decorator,
  TaskTypeSchema,
  type Task,
} from "./taskRegistry";
import { parseDecorator } from "./utils/decorators";
import { nodesToMarkdown } from "./utils/nodeTransformer";
import {
  Category,
  CategoryType,
  categoryTypes,
  TaskCategory,
  TaskSet,
} from "../types";

const taskCategoryTypes = categoryTypes.filter(
  (type): type is Exclude<CategoryType, "info"> => type !== "info"
);

const CategoryTypeSchema = z.enum(
  taskCategoryTypes as [
    Exclude<CategoryType, "info">,
    ...Exclude<CategoryType, "info">[]
  ]
);

export class Parser {
  readonly #filePath: string;
  readonly #categories: Category[] = [];

  #currentCategory?: TaskCategory;
  #currentTaskSet: TaskSet = { kind: "taskSet", tasks: [] };
  #currentTaskDecorator?: Decorator;
  #currentInfoDecorator?: Decorator;
  #contentNodes: RootContent[] = [];

  constructor(filePath: string) {
    this.#filePath = filePath;
  }

  processNode(node: RootContent) {
    if (node.type !== "heading") {
      this.#contentNodes.push(node);
      return;
    }

    const decorator = parseDecorator(node as Heading);
    if (!decorator) {
      this.#contentNodes.push(node);
      return;
    }

    this.flushOpenBlock();

    const taskParse = TaskTypeSchema.safeParse(decorator.name);
    if (taskParse.success) {
      this.handleTaskDecorator(decorator);
      return;
    }

    if (decorator.name === "info") {
      this.handleInfoDecorator(decorator);
      return;
    }

    const categoryParse = CategoryTypeSchema.safeParse(decorator.name);
    if (categoryParse.success) {
      this.handleCategoryDecorator(decorator);
      return;
    }

    if (decorator.name === "set") {
      this.handleSetDecorator(decorator);
      return;
    }

    throw this.parserError(`Unknown decorator @${decorator.name}`);
  }

  finalize() {
    this.flushOpenBlock();
    this.commitCurrentTaskSet();
    return this.#categories;
  }

  private handleTaskDecorator(decorator: Decorator) {
    if (decorator.depth !== 2 && decorator.depth !== 3) {
      throw this.parserError(
        `Task decorator only allowed at level 2 or 3: @${decorator.name}`
      );
    }

    this.requireCategory(
      "No category defined. Add a category decorator (# @core / # @checkpoint / # @challenge)."
    );

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

    this.commitCurrentTaskSet();

    const category: TaskCategory = {
      kind: decorator.name as Exclude<CategoryType, "info">,
      items: [],
    };

    this.#categories.push(category);
    this.#currentCategory = category;
    this.#currentTaskSet = { kind: "taskSet", tasks: [] };
    this.#contentNodes = [];
  }

  private handleInfoDecorator(decorator: Decorator) {
    if (decorator.depth !== 1 && decorator.depth !== 2) {
      throw this.parserError("@info only allowed at level 1 or 2: @info");
    }

    this.commitCurrentTaskSet();

    if (decorator.depth === 1) {
      this.#currentCategory = undefined;
    } else {
      this.requireCategory("@info at level 2 requires a category.");
    }

    this.#currentInfoDecorator = decorator;
    this.#contentNodes = [];
  }

  private handleSetDecorator(decorator: Decorator) {
    if (decorator.depth !== 2) {
      throw this.parserError("@set only allowed at level 2: @set");
    }

    this.requireCategory("@set only allowed after a category.");
    this.startNewTaskSet();
    this.#contentNodes = [];
  }

  private startNewTaskSet() {
    this.commitCurrentTaskSet();
  }

  private addIntroTextToTaskSet() {
    this.#currentTaskSet.intro = nodesToMarkdown(this.#contentNodes);
    this.#contentNodes = [];
  }

  private setCurrentTask(decorator: Decorator) {
    this.#currentTaskDecorator = decorator;
    this.#contentNodes = [];
  }

  private addCurrentTaskIfDefined() {
    if (!this.#currentTaskDecorator) return;

    const taskData: Task = callTaskHandler(
      this.#currentTaskDecorator,
      this.#contentNodes
    );

    this.#currentTaskSet.tasks.push(taskData);

    this.#contentNodes = [];
    this.#currentTaskDecorator = undefined;
  }

  private addCurrentInfoIfDefined() {
    if (!this.#currentInfoDecorator) return;

    const titleArg = this.#currentInfoDecorator.args?.title;
    const title =
      typeof titleArg === "string" && titleArg.trim().length > 0
        ? titleArg
        : "Info";

    const infoBlock = {
      kind: "info" as const,
      title,
      text: nodesToMarkdown(this.#contentNodes),
    };

    if (this.#currentInfoDecorator.depth === 1) {
      this.#categories.push(infoBlock);
      this.#currentCategory = undefined;
    } else {
      this.requireCategory("@info at level 2 requires a category.").items.push(
        infoBlock
      );
    }

    this.#currentInfoDecorator = undefined;
    this.#contentNodes = [];
  }

  private commitCurrentTaskSet() {
    this.addCurrentTaskIfDefined();

    if (this.#currentTaskSet.tasks.length === 0) {
      this.#currentTaskSet = { kind: "taskSet", tasks: [] };
      return;
    }

    this.requireCategory(
      "No category defined. Add a category decorator (# @core / # @checkpoint / # @challenge)."
    ).items.push(this.#currentTaskSet);

    this.#currentTaskSet = { kind: "taskSet", tasks: [] };
  }

  private flushOpenBlock() {
    if (this.#currentTaskDecorator && this.#currentInfoDecorator) {
      throw this.parserError("Invalid parser state: task and info blocks overlap.");
    }

    this.addCurrentTaskIfDefined();
    this.addCurrentInfoIfDefined();
  }

  private requireCategory(message?: string): TaskCategory {
    if (!this.#currentCategory) {
      throw this.parserError(
        message ??
          "No category defined. Add a category decorator (# @core / # @checkpoint / # @challenge)."
      );
    }
    return this.#currentCategory;
  }

  private parserError(message: string): Error {
    const currentNode = this.#contentNodes[this.#contentNodes.length - 1];
    const line = currentNode?.position?.start?.line;
    const prefix = line != null ? `${this.#filePath}:${line}` : this.#filePath;
    return new Error(`${prefix}: ${message}`);
  }
}
