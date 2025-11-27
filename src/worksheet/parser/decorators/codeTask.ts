import { RootContent } from "mdast";
import { parseInlineDecorators } from "../utils/decorators";
import { nodesToMarkdown } from "../utils/nodeTransformer";
import z from "zod";

const codeLanguageSchema = z.enum(["ts", "python"]);
type CodeLanguage = z.infer<typeof codeLanguageSchema>;

export type CodeTask = {
  type: "code";
  instruction: string;
  hint: string;
  solution: string;
  starter: string;
  validation: string;
  language: CodeLanguage
}

export function codeTaskHandler({ contentNodes }: { contentNodes: RootContent[] }): CodeTask {
  const markdown = nodesToMarkdown(contentNodes)

  const inlineDecorators = parseInlineDecorators('code', markdown,
    ['hint', 'solution', 'starter', 'validation'] as const)

  const codeBlockRegex = /^```(?<language>\w+)\n(?<code>[\s\S]+)\n```$/;

  let match = inlineDecorators.starter.match(codeBlockRegex);

  if (!match || !match.groups) {
    throw new Error("Starter is not a code block");
  }

  inlineDecorators.starter = match.groups.code;


  match = inlineDecorators.validation.match(codeBlockRegex);

  if (!match || !match.groups) {
    throw new Error("Validation is not a code block");
  }

  const language: CodeLanguage = codeLanguageSchema.parse(match.groups.language);
  inlineDecorators.validation = match.groups.code;

  return {
    type: "code",
    language,
    ...inlineDecorators
  };
}