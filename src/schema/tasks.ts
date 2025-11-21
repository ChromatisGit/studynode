import { z } from "zod";

export const VisualTypeSchema = z.enum([
  "task",
  "checkpoint",
  "challenge",
]);

export const CodeLanguageSchema = z.enum(["ts", "python"]); 

export const InfoItemSchema = z.object({
  type: z.literal("info"),
  text: z.string(),
  language: CodeLanguageSchema.optional(), // Syntax Highlighting
  visual: VisualTypeSchema,
});


export const BaseTaskSchema = z.object({
  prompt: z.string().optional(),   // allgemeine Aufgabenstellung
  visual: VisualTypeSchema,        // Styling: task / checkpoint / challenge
  language: CodeLanguageSchema.optional(), // Syntax Highlighting / Runner
});

// MCQ mit mehreren Fragen
const MCQQuestionSchema = z.object({
  question: z.string(),
  correct: z.union([
    z.string(),
    z.array(z.string()),
  ]),                      // richtige Antwort(en)
  options: z.array(z.string()), // Antwortoptionen
  explanation: z.string().optional(),
});

export const McqItemSchema = BaseTaskSchema.extend({
  type: z.literal("mcq"),
  questions: z.array(MCQQuestionSchema),
  multiple: z.boolean().optional(), 
  // ob mehrere Antworten pro Frage korrekt sein dürfen
});

// MCQ-Lückentext (jede Lücke mit Auswahl)
const MCQGapSchema = z.object({
  gap_text: z.string(),         // Text der Lücke / Beschreibung
  correct: z.string(),          // richtige Option
  options: z.array(z.string()), // Antwortoptionen
  explanation: z.string().optional(),
});

export const GapMcqItemSchema = BaseTaskSchema.extend({
  type: z.literal("mcq_gap"),
  gaps: z.array(MCQGapSchema),
});

// Freieingabe-Lückentext
const GapSchema = z.object({
  gap_text: z.string(),
  correct: z.union([
    z.string(),
    z.array(z.string()),
  ]),
  hint: z.string().optional(),
  explanation: z.string().optional(),
});

export const GapItemSchema = BaseTaskSchema.extend({
  type: z.literal("gap"),
  gaps: z.array(GapSchema),
});

// Freies Textfeld
export const TextItemSchema = BaseTaskSchema.extend({
  type: z.literal("text"),
  hint: z.string().optional(),
  solution: z.string().optional(),      // Musterlösung (optional)
  explanation: z.string().optional(),   // Erklärung zur Musterlösung
});

// Rechenfeld (kariert)
export const GridItemSchema = BaseTaskSchema.extend({
  type: z.literal("grid"),
  hint: z.string().optional(),
  solution: z.string().optional(),      // Musterlösung (optional)
  explanation: z.string().optional(),
});

// Coding-Aufgabe mit optionalem Starter-Code
export const CodeItemSchema = BaseTaskSchema.extend({
  type: z.literal("code"),
  hint: z.string().optional(),
  solution: z.string().optional(),      // Musterlösung (optional)
  explanation: z.string().optional(),
  starter_code: z.string().optional(),  // Code, der schon vorgegeben ist
  expected_output: z.string().optional(), // erwartete Ausgabe
});

export const LearningItemSchema = z.discriminatedUnion("type", [
  InfoItemSchema,
  McqItemSchema,
  GapItemSchema,
  GapMcqItemSchema,
  TextItemSchema,
  GridItemSchema,
  CodeItemSchema,
]);

export type LearningItem = z.infer<typeof LearningItemSchema>;