import Link from "next/link";
import { notFound } from "next/navigation";

import { buildCourseId } from "@/data/courses";
import { getCourseOverview } from "@/data/overview";

type PageParams = {
  params:
    | {
        group: string;
        course: string;
        topic: string;
      }
    | Promise<{
        group: string;
        course: string;
        topic: string;
      }>;
};

export default async function TopicPage({ params }: PageParams) {
  const { group, course, topic: topicSlug } = await params;
  const courseId = buildCourseId(group, course);
  const overview = getCourseOverview(courseId);
  if (!overview) return notFound();

  const topic = overview.topics.find((item) => item.slug === topicSlug);
  if (!topic) return notFound();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{topic.title}</h1>
      <p>Topic: {topic.slug}</p>
      <p>Kapitel</p>

      {topic.chapters.length > 0 ? (
        <ul>
          {topic.chapters.map((chapter) => (
            <li key={chapter.id}>
              <Link href={`/${courseId}/${topic.slug}/${chapter.slug}`}>
                {chapter.title}
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
