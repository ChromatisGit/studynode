import { GeneratedPage } from "@components/GeneratedPage/GeneratedPage";
import { getPage } from "@/server/data/getPage";
import { getSession, assertCanAccessPage } from "@/server/auth/auth";
import { getCourseId, getSubject } from "@/server/data/courses";

type PageParams = {
  params: Promise<{
    group: string;
    course: string;
    topic: string;
    chapter: string;
    worksheet: string;
  }>;
};

export default async function WorksheetRoute({ params }: PageParams) {
  const {
    group: groupKey,
    course: subjectKey,
    topic: topicId,
    chapter: chapterId,
    worksheet: worksheetId,
  } = await params;

  const session = await getSession();
  const courseId = getCourseId(groupKey, subjectKey);
  assertCanAccessPage(session, groupKey, courseId);

  const subject = getSubject(courseId)
  const page = await getPage({subject: subject.id, topicId, chapterId, worksheetId});

  return <GeneratedPage title={page.title} content={page.content} />;
}
