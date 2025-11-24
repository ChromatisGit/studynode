import { DecoratedTask, TaskDecorator } from "./base";

export type GapField = {
  mode: "text" | "mcq";
  correct: string[];
  options?: string[];
};

export type GapPart =
  | { type: "text"; content: string }
  | { type: "gap"; gap: GapField };

export type GapTask = {
  type: "gap";
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
    consumeBlock,
  }): DecoratedTask<GapTask> {
    const { markdown, nextIndex } = consumeBlock({
      startIndex: index,
      stopAtHeadingDepth: heading.depth,
    });

    const mcqMode = decorator.args?.mcq ?? false;
    const gapRegex = /__ ?\{\{(.+?)\}\}/g;

    const matches = [...markdown.matchAll(gapRegex)];
    if (matches.length === 0) {
      // TODO use error class
      throw new Error("No gaps found in markdown.");
    }

    const parts: GapPart[] = [];
    let lastIndex = 0;

    for (const match of matches) {
      const matchIndex = match.index ?? 0;

      if (matchIndex > lastIndex) {
        parts.push({ type: "text", content: markdown.slice(lastIndex, matchIndex) });
      }

      const rawEntries = match[1]
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);

      const options = rawEntries.length ? rawEntries : [""];

      parts.push({
        type: "gap",
        gap: {
          mode: mcqMode ? "mcq" : "text",
          correct: mcqMode ? [options[0]] : options,
          ...(mcqMode ? { options } : {}),
        },
      });

      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < markdown.length) {
      parts.push({ type: "text", content: markdown.slice(lastIndex) });
    }

    return {
      task: {
        type: "gap",
        parts,
      },
      nextIndex,
    };
  },
};
