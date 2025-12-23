import type { CourseId } from "@/schema/course";
import type { CourseOverview } from "@/schema/overview";
import type { WorksheetModel, WorksheetRef } from "@/worksheet/worksheetModel";

import { getCourseOverview } from "./overview";

type WorksheetRouteParams = {
  courseId: CourseId;
  topicSlug: string;
  chapterSlug: string;
  worksheetSlug: string;
};

type ChapterWorksheetParams = {
  courseId: CourseId;
  topicSlug: string;
  chapterSlug: string;
};

export type ChapterWorksheetList = {
  courseId: CourseId;
  topicSlug: string;
  topicTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  worksheets: WorksheetRef[];
};

type CourseTopic = CourseOverview["topics"][number];
type CourseChapter = CourseTopic["chapters"][number];

const DEFAULT_TITLE = "Beispiel-Arbeitsblatt";

const SAMPLE_WORKSHEET_CONTENT: WorksheetModel["content"] = [
  {
    kind: "info",
    title: "Arbeitsblatt: Grundlagen",
    text: "Willkommen! Beantworte die Fragen und teste den Code direkt im Browser.",
  },
  {
    kind: "core",
    title: "Kernaufgaben",
    items: [
      {
        kind: "info",
        title: "Hinweis",
        text: "Nutze die Konsolen-Ausgabe, um deine Ergebnisse zu ueberpruefen.",
      },
      {
        kind: "taskSet",
        intro: "Kurzer Wissenscheck",
        tasks: [
          {
            type: "mcq",
            question: "Welche Aussage zu Variablen stimmt?",
            options: [
              "Variablen koennen nur Zahlen speichern.",
              "Variablen koennen unterschiedliche Datentypen speichern.",
              "Variablen duerfen nur einmal verwendet werden.",
            ],
            correct: ["Variablen koennen unterschiedliche Datentypen speichern."],
            single: true,
          },
          {
            type: "text",
            instruction:
              "Beschreibe, was eine Konstante von einer Variable unterscheidet.",
            solution:
              "Eine Konstante (const) kann nach der Initialisierung nicht neu zugewiesen werden.",
            hint: "Denke an const vs. let.",
          },
        ],
      },
    ],
  },
];

function buildWorksheetModel(title?: string): WorksheetModel {
  return {
    title: title ?? DEFAULT_TITLE,
    content: SAMPLE_WORKSHEET_CONTENT,
  };
}

function findChapter(
  overview: CourseOverview,
  topicSlug: string,
  chapterSlug: string
): { topic: CourseTopic; chapter: CourseChapter } | null {
  const topic = overview.topics.find((item) => item.slug === topicSlug);
  if (!topic) return null;

  const chapter = topic.chapters.find((item) => item.slug === chapterSlug);
  if (!chapter) return null;

  return { topic, chapter };
}

function buildWorksheetHref(
  courseId: CourseId,
  topicSlug: string,
  chapterSlug: string,
  worksheetSlug: string
): string {
  return `/${courseId}/${topicSlug}/${chapterSlug}/${worksheetSlug}`;
}

function isWorksheetVisible(isVisible?: boolean): boolean {
  return isVisible !== false;
}

export function getSampleWorksheet(title?: string): WorksheetModel {
  return buildWorksheetModel(title);
}

export function getWorksheetByRoute(
  params: WorksheetRouteParams
): WorksheetModel | null {
  const overview = getCourseOverview(params.courseId);
  if (!overview) return null;

  const match = findChapter(overview, params.topicSlug, params.chapterSlug);
  if (!match) return null;

  const worksheet = match.chapter.worksheets.find(
    (item) => item.slug === params.worksheetSlug
  );
  if (!worksheet || !isWorksheetVisible(worksheet.isVisible)) return null;

  return buildWorksheetModel(worksheet.title);
}

export function getChapterWorksheetList(
  params: ChapterWorksheetParams
): ChapterWorksheetList | null {
  const overview = getCourseOverview(params.courseId);
  if (!overview) return null;

  const match = findChapter(overview, params.topicSlug, params.chapterSlug);
  if (!match) return null;

  const worksheets = match.chapter.worksheets
    .filter((worksheet) => isWorksheetVisible(worksheet.isVisible))
    .map((worksheet) => ({
      label: worksheet.title,
      href: buildWorksheetHref(
        params.courseId,
        params.topicSlug,
        params.chapterSlug,
        worksheet.slug
      ),
      process: "web",
    }));

  return {
    courseId: params.courseId,
    topicSlug: params.topicSlug,
    topicTitle: match.topic.title,
    chapterSlug: params.chapterSlug,
    chapterTitle: match.chapter.title,
    worksheets,
  };
}
