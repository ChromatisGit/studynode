import { Code, RootContent } from "mdast";
import { TaskDecorator } from "./base";

export type CodeTask = {
  type: "code";
  instruction: string;
  hint?: string;
  solution?: string;
  explanation?: string;
  starter_code?: string;
  validation?: string;
}

export const codeTaskDecorator: TaskDecorator<CodeTask> = {
  type: "code",

  handle({ nodes, index }): CodeTask {
    const block = collectBlockUntilBoundary(nodes, index);
    const relevantNodes: RootContent[] = nodes.slice(index + 1, block.endIndex + 1);

    let starterCode: string | undefined;
    for (const n of relevantNodes) {
      if (n.type === "code") {
        starterCode = (n as Code).value;
        break;
      }
    }

    return {
      type: "code",
      instruction: block.markdown.trim(),
      ...(starterCode ? { starter_code: starterCode } : {}),
    };
  },
};