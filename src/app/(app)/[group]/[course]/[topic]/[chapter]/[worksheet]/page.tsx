import { notFound } from "next/navigation";

import { buildCourseId } from "@/data/courses";
import { getWorksheetByRoute } from "@/data/worksheets";
import { Worksheet } from "@pages/worksheet/Worksheet";

type PageParams = {
  params:
    | {
        group: string;
        course: string;
        topic: string;
        chapter: string;
        worksheet: string;
      }
    | Promise<{
        group: string;
        course: string;
        topic: string;
        chapter: string;
        worksheet: string;
      }>;
};

export default async function WorksheetRoute({ params }: PageParams) {
  const {
    group,
    course,
    topic: topicSlug,
    chapter: chapterSlug,
    worksheet: worksheetSlug,
  } = await params;
  const courseId = buildCourseId(group, course);
  const worksheet = getWorksheetByRoute({
    courseId,
    topicSlug,
    chapterSlug,
    worksheetSlug,
  });

  if (!worksheet) {
    return notFound();
  }

  return <Worksheet title={worksheet.title} content={worksheet.content} />;
}
