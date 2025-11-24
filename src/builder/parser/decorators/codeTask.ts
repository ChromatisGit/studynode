import { Code, RootContent } from "mdast";

import { DecoratedTask, TaskDecorator } from "./base";
import { parseInlineDecorators } from "../utils/decorators";

export type CodeTask = {
  type: "code";
  instruction: string;
  hint: string;
  solution: string;
  starter: string;
  validation: string;
}

export const codeTaskDecorator: TaskDecorator<CodeTask> = {
  type: "code",

  handle({ index, heading, consumeBlock, markdown: source }): DecoratedTask<CodeTask> {
    const { markdown, nextIndex } = consumeBlock({
      startIndex: index,
      stopAtHeadingDepth: heading.depth,
    });

    const inlineDecorators = parseInlineDecorators('code', markdown, 
      ['hint', 'solution', 'starter', 'validation'] as const)
    return {
      task: {
        type: "code",
        ...inlineDecorators
      },
      nextIndex,
    };
  },
};
