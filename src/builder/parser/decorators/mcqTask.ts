import type { List, ListItem, Paragraph, RootContent } from "mdast";

import { parserError } from "../utils/errors";
import { nodeToPlainText } from "../utils/nodeToPlainText";
import type { DecoratedTask, TaskDecorator } from "./base";

export type McqTask = {
  type: "mcq";
  question: string;
  correct: string[];
  options: string[];
  single?: boolean;
}

export const mcqTaskDecorator: TaskDecorator<McqTask> = {
  type: "mcq",

  handle({ nodes, index, decorator, heading, filePath }): DecoratedTask<McqTask> {
    const questionNode = nodes[index + 1];
    const listNode = nodes[index + 2];

    const question =
      questionNode && questionNode.type === "paragraph"
        ? nodeToPlainText(questionNode as Paragraph).trim()
        : "";

    if (!listNode || listNode.type !== "list") {
      throw parserError(
        filePath,
        (listNode as RootContent) ?? heading,
        "@mcq must be followed by a checklist using - [x] / - [ ]",
      );
    }

    const list = listNode as List;

    const options: string[] = [];
    const correct: string[] = [];

    for (const item of list.children as ListItem[]) {
      const label = nodeToPlainText(item).trim();
      options.push(label);
      if ((item as ListItem).checked === true) {
        correct.push(label);
      }
    }

    const singleArg = decorator.args?.single;
    const single = typeof singleArg === "boolean" ? singleArg : undefined;

    return {
      task: {
        type: "mcq",
        question,
        options,
        correct,
        ...(single !== undefined ? { single } : {}),
      },
    };
  },
};
