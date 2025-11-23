import { TaskDecorator } from "./base";

export type MathTask = {
  type: "math";
  instruction: string;
  hint?: string;
  solution?: string;
  explanation?: string;
}

export const mathTaskDecorator: TaskDecorator<MathTask> = {
  type: "math",

  handle({ nodes, index }): MathTask {
    const { markdown } = collectBlockUntilBoundary(nodes, index);
    return {
      type: "math",
      instruction: markdown.trim(),
    };
  },
};