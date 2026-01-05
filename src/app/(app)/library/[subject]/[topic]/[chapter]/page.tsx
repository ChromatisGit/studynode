import { notFound } from "next/navigation";

import { buildCourseId } from "@/data/courses";
import { getChapterWorksheetList } from "@/data/worksheets";
import { WorksheetCards } from "@pages/coursepage/components/WorksheetCard/WorksheetCards";

type PageParams = {
  params:
    | {
        group: string;
        course: string;
        topic: string;
        chapter: string;
      }
    | Promise<{
        group: string;
        course: string;
        topic: string;
        chapter: string;
      }>;
};

export default async function ChapterPage({ params }: PageParams) {
  const { group, course, topic: topicSlug, chapter: chapterSlug } = await params;
  const courseId = buildCourseId(group, course);
  const chapter = getChapterWorksheetList({
    courseId,
    topicSlug,
    chapterSlug,
  });

  if (!chapter) {
    return notFound();
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{chapter.chapterTitle}</h1>
      <p>Topic: {chapter.topicTitle}</p>

      {chapter.worksheets.length > 0 ? (
        <WorksheetCards worksheets={chapter.worksheets} />
      ) : (
        <p>In diesem Kapitel gibt es noch keine Arbeitsblaetter.</p>
      )}
    </main>
  );
}
