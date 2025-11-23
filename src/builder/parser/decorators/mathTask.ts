import { collectContentBlock } from "../utils/markdown";
import { DecoratedTask, TaskDecorator } from "./base";

export type MathTask = {
  type: "math";
  instruction: string;
  hint?: string;
  solution?: string;
  explanation?: string;
}

export const mathTaskDecorator: TaskDecorator<MathTask> = {
  type: "math",

  handle({ nodes, index, heading, markdown: source }): DecoratedTask<MathTask> {
    const { markdown } = collectContentBlock({
      nodes,
      startIndex: index,
      markdown: source,
      stopAtHeadingDepth: heading.depth,
    });
    return {
      task: {
        type: "math",
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
