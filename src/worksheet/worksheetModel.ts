export type WorksheetProcess = "web" | "pdf" | "pdfSolution";

export type WorksheetRef = {
  label: string;
  href: string;
  process: WorksheetProcess;
};

export type InfoBlock = {
  kind: "info";
  title: string;
  text: string;
};

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

export type TextTask = {
  type: "text";
  instruction: string;
  solution?: string;
  hint?: string;
};

export type MathTask = {
  type: "math";
  instruction: string;
  solution?: string;
  hint?: string;
};

export type McqTask = {
  type: "mcq";
  question: string;
  options: string[];
  correct: string[];
  single?: boolean;
  wideLayout?: boolean;
};

export type CodeTask = {
  type: "code";
  instruction: string;
  starter: string;
  validation?: string;
  solution?: string;
  hint?: string;
};

export type Task = GapTask | TextTask | MathTask | McqTask | CodeTask;

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
      title: string;
      items: Array<TaskSet | InfoBlock>;
    };

export type WorksheetModel = {
  title?: string;
  content: Category[];
};
