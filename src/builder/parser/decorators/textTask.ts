import { parseInlineDecorators } from "../utils/decorators";
import { DecoratedTask, TaskDecorator } from "./base";

export type TextTask = {
  type: "text";
  instruction: string;
  hint: string;
  solution: string;
}

export const textTaskDecorator: TaskDecorator<TextTask> = {
  type: "text",

  handle({ index, heading, consumeBlock, markdown: source }): DecoratedTask<TextTask> {
    const { markdown, nextIndex } = consumeBlock({
      startIndex: index,
      stopAtHeadingDepth: heading.depth,
    });

    const inlineDecorators = parseInlineDecorators('text', markdown, 
      ['hint', 'solution'] as const)
    return {
      task: {
        type: "text",
        ...inlineDecorators
      },
      nextIndex,
    };
  },
};
