import { TaskDecorator } from "./base";

export type TextTask = {
  type: "text";
  instruction: string;
  hint?: string;
  solution?: string;
  explanation?: string;
}

export const textTaskDecorator: TaskDecorator<TextTask> = {
  type: "text",

  handle({ nodes, index }): TextTask {
    const { markdown } = collectBlockUntilBoundary(nodes, index);
    return {
      type: "text",
      instruction: markdown.trim(),
    };
  },
};
