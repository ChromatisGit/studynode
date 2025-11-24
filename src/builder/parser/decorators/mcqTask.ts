import type { List, ListItem, Paragraph, RootContent } from "mdast";

import { parserError } from "../utils/errors";
import { nodeToPlainText } from "../utils/nodeToPlainText";
import type { DecoratedTask, TaskDecorator } from "./base";

export type McqTask = {
  type: "mcq";
  question: string;
  correct: string[];
  options: string[];
  single: boolean;
}

export const mcqTaskDecorator: TaskDecorator<McqTask> = {
  type: "mcq",

  handle({ nodes, index, decorator, heading, filePath }): DecoratedTask<McqTask> {
    let cursor = index + 1;
    const questionNode = nodes[cursor];
    const hasQuestion = questionNode && questionNode.type === "paragraph";
    const question = hasQuestion
      ? nodeToPlainText(questionNode as Paragraph).trim()
      : "";

    if (hasQuestion) {
      cursor += 1;
    }

    const listNode = nodes[cursor];
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

    const single = decorator.args?.single === true ? true : false;

    return {
      task: {
        type: "mcq",
        question,
        options,
        correct,
        single
      },
      nextIndex: cursor + 1,
    };
  },
};
