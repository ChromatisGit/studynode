import { TaskHandlerArgs } from "@worksheet/taskRegistry";
import { deterministicShuffle } from "@worksheet/utils/simpleHash";
import {
  collapseNewlinePadding,
  dedentFencedCodeBlocks,
  stripSharedIndentation,
} from "@worksheet/utils/text";

const GAP_PLACEHOLDER_REGEX = /\{\{\s*([^}]+?)\s*\}\}/g;

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
  body,
  params,
}: TaskHandlerArgs): GapTask {
  const content = collapseNewlinePadding(
    dedentFencedCodeBlocks(stripSharedIndentation(body))
  );

  const mcqMode = params?.mcq === true;

  const matches = [...content.matchAll(GAP_PLACEHOLDER_REGEX)];
  if (matches.length === 0) {
    throw new Error("No gaps found in gap task.");
  }

  const parts: GapPart[] = [];
  let lastIndex = 0;

  for (const match of matches) {
    if (match.index == null) {
      throw new Error("Expected match.index to be defined");
    }

    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      const textPart = collapseNewlinePadding(
        content.slice(lastIndex, matchIndex)
      );
      parts.push({ type: "text", content: textPart });
    }

    const rawEntries = match[1]
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);

    const baseOptions = rawEntries.length ? rawEntries : [""];
    const correct = mcqMode ? [baseOptions[0]] : baseOptions;

    const options = mcqMode
      ? deterministicShuffle(baseOptions, match[1])
      : baseOptions;

    parts.push({
      type: "gap",
      gap: {
        mode: mcqMode ? "mcq" : "text",
        correct,
        ...(mcqMode ? { options } : {}),
      },
    });

    lastIndex = matchIndex + match[0].length;
  }


  if (lastIndex < content.length) {
    const trailing = collapseNewlinePadding(content.slice(lastIndex));
    parts.push({ type: "text", content: trailing });
  }

  return {
    type: "gap",
    parts,
  };
}
