import { RootContent } from "mdast";
import { parseInlineDecorators } from "../utils/decorators";
import { nodesToMarkdown } from "../utils/nodeTransformer";

export type TextTask = {
  type: "text";
  instruction: string;
  hint: string;
  solution: string;
}

export function textTaskHandler({contentNodes}: {contentNodes: RootContent[]}): TextTask {
  const markdown = nodesToMarkdown(contentNodes)

  const inlineDecorators = parseInlineDecorators('text', markdown,
    ['hint', 'solution'] as const)
  return {
    type: "text",
    ...inlineDecorators
  };
}