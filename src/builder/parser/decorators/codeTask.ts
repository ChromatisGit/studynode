import { RootContent } from "mdast";
import { parseInlineDecorators } from "../utils/decorators";
import { nodesToMarkdown } from "../utils/nodeTransformer";

export type CodeTask = {
  type: "code";
  instruction: string;
  hint: string;
  solution: string;
  starter: string;
  validation: string;
}

export function codeTaskHandler({contentNodes}: {contentNodes: RootContent[]}): CodeTask {
  const markdown = nodesToMarkdown(contentNodes)

  const inlineDecorators = parseInlineDecorators('code', markdown,
    ['hint', 'solution', 'starter', 'validation'] as const)
  return {
    type: "code",
    ...inlineDecorators
  };
}