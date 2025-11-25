import { RootContent } from "mdast";

import { nodesToMarkdown } from "../utils/nodeTransformer";
import { DecoratorArgs } from "../taskRegistry";

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

export function gapTaskHandler({
  contentNodes,
  args,
}: {
  contentNodes: RootContent[];
  args?: DecoratorArgs;
}): GapTask {
  const markdown = nodesToMarkdown(contentNodes);

  const mcqMode = args?.mcq === true;
  const gapRegex = /__ ?\{\{(.+?)\}\}/g;

  const matches = [...markdown.matchAll(gapRegex)];
  if (matches.length === 0) {
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
    type: "gap",
    parts,
  };
}
