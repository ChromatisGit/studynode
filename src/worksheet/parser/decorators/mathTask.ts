import { RootContent } from "mdast";
import { parseInlineDecorators } from "../utils/decorators";
import { nodesToMarkdown } from "../utils/nodeTransformer";

export type MathTask = {
  type: "math";
  instruction: string;
  hint: string;
  solution: string;
}

export function mathTaskHandler({contentNodes}: {contentNodes: RootContent[]}): MathTask {
  const markdown = nodesToMarkdown(contentNodes)

  const inlineDecorators = parseInlineDecorators('math', markdown,
    ['hint', 'solution'] as const)
  return {
    type: "math",
    ...inlineDecorators
  };
}
