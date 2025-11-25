import type { List, ListItem, Paragraph, RootContent } from "mdast";

import { nodesToMarkdown, nodeToPlainText } from "../utils/nodeTransformer";
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

  const index = contentNodes.findIndex((node) => node.type === "list")

  if (index === -1) {
    // Todo error component
    throw new Error("@mcq must include a checklist using - [x] / - [ ]");
  }

  const question = nodesToMarkdown(contentNodes.slice(0,index)) ?? "";

  const options: string[] = [];
  const correct: string[] = [];

  for (const item of (contentNodes[index] as List).children as ListItem[]) {
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
