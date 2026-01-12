import type {
  CodeTaskMacro,
  GapField as MacroGapField,
  GapMacro,
  GapPart as MacroGapPart,
  MathTaskMacro,
  McqMacro,
  TextTaskMacro,
} from "@domain/macroTypes";

export type InfoBlock = {
  kind: "info";
  title: string;
  text: string;
};

export type TextTask = TextTaskMacro;
export type MathTask = MathTaskMacro;
export type CodeTask = CodeTaskMacro;
export type McqTask = McqMacro;
export type GapField = MacroGapField;
export type GapTaskPart = MacroGapPart;
export type GapTask = GapMacro;

export type Task = TextTask | MathTask | CodeTask | McqTask | GapTask;

export type TaskSet = {
  kind: "taskSet";
  intro?: string;
  tasks: Task[];
};

export type Category =
  | {
      kind: "info";
      title: string;
      text: string;
    }
  | {
      kind: "checkpoint" | "core" | "challenge";
      items: Array<InfoBlock | TaskSet>;
    };
