import { RootContent } from "mdast";
import { TaskDecorator } from "./base";

export type Gap = {
  gap_text: string;
  correct: string[];
  hint?: string;
}

export type GapTask = {
  type: "gap";
  gaps: Gap[];
}

export type GapMcq = {
  gap_text: string;
  correct: string;
  options: string[];
}

export type GapMcqTask = {
  type: "gap_mcq";
  gaps: GapMcq[];
}

function collectTextUntilNextHeading(nodes: RootContent[], startIndex: number): string {
  const parts: string[] = [];
  for (let i = startIndex + 1; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.type === "heading") break;
    parts.push(toString(n as any));
  }
  return parts.join("\n\n");
}

export const gapTaskDecorator: TaskDecorator<GapTask | GapMcqTask> = {
  type: "gap",

  handle({ nodes, index, decorator }): GapTask | GapMcqTask {
    const text = collectTextUntilNextHeading(nodes, index);
    const mcqMode = decorator.args.mcq === true || decorator.args.mcq === "true";
    const gapRegex = /\{\{([^}]+)\}\}/g;

    if (mcqMode) {
      const gaps: GapMcqTask["gaps"] = [];
      let match: RegExpExecArray | null;
      while ((match = gapRegex.exec(text)) !== null) {
        const parts = match[1].split("|").map((s) => s.trim()).filter(Boolean);
        const [correct] = parts;
        gaps.push({
          gap_text: "",
          correct,
          options: parts,
        });
      }
      return { type: "gap_mcq", gaps };
    } else {
      const gaps: GapTask["gaps"] = [];
      let match: RegExpExecArray | null;
      while ((match = gapRegex.exec(text)) !== null) {
        const parts = match[1].split("|").map((s) => s.trim()).filter(Boolean);
        gaps.push({
          gap_text: "",
          correct: parts,
        });
      }
      return { type: "gap", gaps };
    }
  },
};