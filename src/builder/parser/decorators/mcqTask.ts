import type { List, ListItem, Paragraph, RootContent } from "mdast";

import { nodeToPlainText } from "../utils/nodeTransformer";
import { DecoratorArgs } from "../taskRegistry";

export type McqTask = {
  type: "mcq";
  question: string;
  correct: string[];
  options: string[];
  single: boolean;
};

export function mcqTaskHandler({
  contentNodes,
  args,
}: {
  contentNodes: RootContent[];
  args?: DecoratorArgs;
}): McqTask {

  let cursor = 0;
  let question = "";

  const questionNode = contentNodes[cursor];
  if (questionNode?.type === "paragraph") {
    question = nodeToPlainText(questionNode as Paragraph).trim();
    cursor += 1;
  }

  const listNode = contentNodes[cursor];
  if (!listNode || listNode.type !== "list") {
    throw new Error("@mcq must be followed by a checklist using - [x] / - [ ]");
  }

  const options: string[] = [];
  const correct: string[] = [];

  for (const item of (listNode as List).children as ListItem[]) {
    const label = nodeToPlainText(item).trim();
    options.push(label);
    if ((item as ListItem).checked === true) {
      correct.push(label);
    }
  }

  const single = args?.single === true;

  return {
    type: "mcq",
    question,
    options,
    correct,
    single,
  };
}
