import { notFound } from "next/navigation";

import { buildCourseId } from "@/data/courses";
import { getCourseOverview } from "@/data/overview";
import { getPracticeTasks } from "@/data/practice";
import { Practise } from "@pages/practise/Practise";

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

export default async function PracticePage({ params }: PageParams) {
  const { group, course, topic: topicSlug } = await params;
  const courseId = buildCourseId(group, course);
  const overview = getCourseOverview(courseId);
  if (!overview) return notFound();

  const topic = overview.topics.find((item) => item.slug === topicSlug);
  if (!topic) return notFound();

  const tasks = getPracticeTasks(courseId);

  return <Practise courseId={courseId} topicTitle={topic.title} tasks={tasks} />;
}
