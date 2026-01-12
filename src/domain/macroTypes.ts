import { RawText } from "./page";

export type CodeLanguage = "ts" | "python";

export type NoteMacro = {
  type: "note";
  content: RawText;
};

export type CodeRunnerMacro = {
  type: "codeRunner";
  code: string;
  language: CodeLanguage;
};

export type CodeTaskMacro = {
  type: "codeTask";
  instruction: RawText;
  hint: RawText;
  solution: RawText;
  starter: string;
  validation?: string;
  language: CodeLanguage;
};

export type GapField = {
  mode: "text" | "mcq";
  correct: string[];
  options?: string[];
};

export type GapPart =
  | { type: "text"; content: string }
  | { type: "gap"; gap: GapField };

export type GapMacro = {
  type: "gap";
  parts: GapPart[];
};

export type MathTaskMacro = {
  type: "mathTask";
  instruction: RawText;
  hint: RawText;
  solution: RawText;
};

export type McqMacro = {
  type: "mcq";
  question: RawText;
  correct: RawText[];
  options: RawText[];
  single: boolean;
  shuffleOptions: boolean;
  wideLayout: boolean;
};

export type TextTaskMacro = {
  type: "textTask";
  instruction: RawText;
  hint: RawText;
  solution: RawText;
};

export type TableMacro = {
  type: "table";
  headers: RawText[];
  rows: RawText[][];
};

export type ImageMacro = {
  type: "image";
  source: string;
  size: "S" | "M" | "L";
};

export type HighlightMacro = {
  type: "highlight";
  icon: "info" | "warning";
  content: RawText
};

export type Macro =
  | NoteMacro
  | CodeRunnerMacro
  | CodeTaskMacro
  | GapMacro
  | MathTaskMacro
  | McqMacro
  | TextTaskMacro
  | TableMacro
  | ImageMacro
  | HighlightMacro;
