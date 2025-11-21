import { z } from "zod";

export const McqTaskSchema = z.object({
  type: z.literal("mcq"),
  question: z.string(),
  correct: z.array(z.string()),
  options: z.array(z.string()),
  single: z.boolean().optional(),
});

// Freieingabe-Lückentext
const GapSchema = z.object({
  gap_text: z.string(),
  correct: z.array(z.string()),
  hint: z.string().optional(),
});

export const GapTaskSchema = z.object({
  type: z.literal("gap"),
  gaps: z.array(GapSchema),
});

const GapMcqSchema = z.object({
  gap_text: z.string(),
  correct: z.string(),
  options: z.array(z.string())
});

export const GapMcqTaskSchema = z.object({
  type: z.literal("gap_mcq"),
  gaps: z.array(GapMcqSchema),
});

// Freies Textfeld
export const TextTaskSchema = z.object({
  type: z.literal("text"),
  hint: z.string().optional(),
  solution: z.string().optional(),
  explanation: z.string().optional(),
});

// Rechenfeld (kariert)
export const MathTaskSchema = z.object({
  type: z.literal("math"),
  hint: z.string().optional(),
  solution: z.string().optional(),
  explanation: z.string().optional(),
});

// Coding-Aufgabe mit optionalem Starter-Code
export const CodeTaskSchema = z.object({
  type: z.literal("code"),
  hint: z.string().optional(),
  solution: z.string().optional(),
  explanation: z.string().optional(),
  starter_code: z.string().optional(),
  validation: z.string().optional(),
});

const TaskTypeSchema = z.discriminatedUnion("type", [
  McqTaskSchema,
  GapTaskSchema,
  GapMcqTaskSchema,
  TextTaskSchema,
  MathTaskSchema,
  CodeTaskSchema,
])

const CodeLanguageSchema = z.enum(["ts", "python"]);

export const TaskSchema = z.object({
  text: z.string().optional(),
  language: CodeLanguageSchema.optional(),
  subtask: z.array(TaskTypeSchema)
});

const CategoryTypeSchema = z.enum([
  "checkpoint",
  "core",
  "challenge",
]);

export const CategorySchema = z.object({
  category: CategoryTypeSchema,
  task: z.array(TaskSchema)
});