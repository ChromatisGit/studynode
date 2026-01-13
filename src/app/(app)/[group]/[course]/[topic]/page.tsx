import { getSession, assertCanAccessPage } from "@/server/auth/auth";
import { getCourseId } from "@/server/data/courses";
import { getTopicDTO } from "@/server/data/getTopicDTO";
import Link from "next/link";

type PageParams = {
  params: Promise<{
    group: string;
    course: string;
    topic: string;
  }>;
};

export default async function ChapterPage({ params }: PageParams) {
  const { group: groupKey, course: subjectKey, topic: topicId } = await params;

  const session = await getSession();
  const courseId = getCourseId(groupKey, subjectKey);
  assertCanAccessPage(session, groupKey, courseId);

  const topic = await getTopicDTO({ courseId, topicId });

  return (
    <main>
      <h1>{topic.label}</h1>
      <h2>Kapitelübersicht</h2>

      {topic.chapters.length > 0 ? (
        <ul>
          {topic.chapters.map((chapter) => (
            <li key={chapter.chapterId}>
              <Link href={chapter.href}>
                {chapter.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Dieses Thema hat noch keine Kapitel.</p>
      )}
    </main>
  );
}
