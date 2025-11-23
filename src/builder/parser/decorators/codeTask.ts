import { Code, RootContent } from "mdast";

import { collectContentBlock } from "../utils/markdown";
import { DecoratedTask, TaskDecorator } from "./base";

export type CodeTask = {
  type: "code";
  instruction: string;
  hint?: string;
  solution?: string;
  explanation?: string;
  starterCode?: string;
  validation?: string;
}

export const codeTaskDecorator: TaskDecorator<CodeTask> = {
  type: "code",

  handle({ nodes, index, heading, markdown: source }): DecoratedTask<CodeTask> {
    const block = collectContentBlock({
      nodes,
      startIndex: index,
      markdown: source,
      stopAtHeadingDepth: heading.depth,
    });
    const relevantNodes: RootContent[] = nodes.slice(index + 1, block.endIndex + 1);

    let starterCode: string | undefined;
    for (const n of relevantNodes) {
      if (n.type === "code") {
        starterCode = (n as Code).value;
        break;
      }
    }

    return {
      task: {
        type: "code",
        instruction: block.markdown.trim(),
        ...(starterCode ? { starterCode } : {}),
      },
      inlineDecorators: {
        hint: (task, content) => {
          task.hint = content.trim();
        },
        solution: (task, content) => {
          task.solution = content.trim();
        },
        validation: (task, content) => {
          task.validation = content.trim();
        },
      },
    };
  },
};
