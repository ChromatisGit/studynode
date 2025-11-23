import { collectContentBlock } from "../utils/markdown";
import { DecoratedTask, TaskDecorator } from "./base";

export type TextTask = {
  type: "text";
  instruction: string;
  hint?: string;
  solution?: string;
  explanation?: string;
}

export const textTaskDecorator: TaskDecorator<TextTask> = {
  type: "text",

  handle({ nodes, index, heading, markdown: source }): DecoratedTask<TextTask> {
    const { markdown } = collectContentBlock({
      nodes,
      startIndex: index,
      markdown: source,
      stopAtHeadingDepth: heading.depth,
    });
    return {
      task: {
        type: "text",
        instruction: markdown.trim(),
      },
      inlineDecorators: {
        hint: (task, content) => {
          task.hint = content.trim();
        },
        solution: (task, content) => {
          task.solution = content.trim();
        },
      },
    };
  },
};
