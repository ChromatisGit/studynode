import { parseInlineDecorators } from "../utils/decorators";
import { DecoratedTask, TaskDecorator } from "./base";

export type MathTask = {
  type: "math";
  instruction: string;
  hint: string;
  solution: string;
}

export const mathTaskDecorator: TaskDecorator<MathTask> = {
  type: "math",

  handle({ index, heading, consumeBlock, markdown: source }): DecoratedTask<MathTask> {
    const { markdown, nextIndex } = consumeBlock({
      startIndex: index,
      stopAtHeadingDepth: heading.depth,
    });

    const inlineDecorators = parseInlineDecorators('math', markdown, 
      ['hint', 'solution'] as const)
    return {
      task: {
        type: "math",
        ...inlineDecorators
      },
      nextIndex,
    };
  },
};
