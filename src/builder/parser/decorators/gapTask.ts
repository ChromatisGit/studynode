import { collectContentBlock } from "../utils/markdown";
import { DecoratedTask, TaskDecorator } from "./base";

export type GapField = {
  id: string;
  mode: "text" | "mcq";
  correct: string[];
  options?: string[];
};

export type GapPart =
  | { type: "text"; content: string }
  | { type: "gap"; gap: GapField };

export type GapTask = {
  type: "gap";
  instruction: string;
  parts: GapPart[];
};

export const gapTaskDecorator: TaskDecorator<GapTask> = {
  type: "gap",

  handle({
    nodes,
    index,
    decorator,
    heading,
    markdown: source,
  }): DecoratedTask<GapTask> {
    const { markdown } = collectContentBlock({
      nodes,
      startIndex: index,
      markdown: source,
      stopAtHeadingDepth: heading.depth,
    });
    const mcqArg = decorator.args?.mcq;
    const mcqMode = mcqArg === true || mcqArg === "true";
    const gapRegex = /\{\{([^}]+)\}\}/g;
    const parts: GapPart[] = [];
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    let gapCounter = 0;

    while ((match = gapRegex.exec(markdown)) !== null) {
      const matchIndex = match.index ?? 0;
      const before = markdown.slice(lastIndex, matchIndex);
      if (before) {
        parts.push({ type: "text", content: before });
      }

      const rawEntries = match[1]
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      const options = rawEntries.length ? rawEntries : [""];
      const id = `gap${++gapCounter}`;

      parts.push({
        type: "gap",
        gap: {
          id,
          mode: mcqMode ? "mcq" : "text",
          correct: mcqMode ? [options[0]] : options,
          ...(mcqMode ? { options } : {}),
        },
      });

      lastIndex = matchIndex + match[0].length;
    }

    const trailing = markdown.slice(lastIndex);
    if (trailing) {
      parts.push({ type: "text", content: trailing });
    }

    return {
      task: {
        type: "gap",
        instruction: markdown.trim(),
        parts,
      },
    };
  },
};
