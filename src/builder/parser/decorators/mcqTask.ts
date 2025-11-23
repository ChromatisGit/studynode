export type McqTask = {
  type: "mcq";
  question: string;
  correct: string[];
  options: string[];
  single?: boolean;
}

import type { TaskDecorator } from "./base";
import type { List, ListItem, Paragraph } from "mdast";

export const mcqTaskDecorator: TaskDecorator<McqTask> = {
  type: "mcq",

  handle({ nodes, index, decorator }): McqTask {
    const questionNode = nodes[index + 1];
    const listNode = nodes[index + 2];

    const question =
      questionNode && questionNode.type === "paragraph"
        ? toString(questionNode as Paragraph)
        : "";

    if (!listNode || listNode.type !== "list") {
      throw new Error("@mcq erwartet direkt danach eine Liste mit - [x] / - [ ] Einträgen");
    }

    const list = listNode as List;

    const options: string[] = [];
    const correct: string[] = [];

    for (const item of list.children as ListItem[]) {
      const label = toString(item).trim();
      options.push(label);
      const anyItem = item as any;
      if (anyItem.checked === true) {
        correct.push(label);
      }
    }

    const singleArg = decorator.args.single;
    const single =
      typeof singleArg === "boolean" ? singleArg : undefined;

    return {
      type: "mcq",
      question,
      options,
      correct,
      ...(single !== undefined ? { single } : {}),
    };
  },
};