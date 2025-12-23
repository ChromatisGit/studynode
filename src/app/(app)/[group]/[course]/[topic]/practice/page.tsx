import { notFound } from "next/navigation";

import { buildCourseId } from "@/data/courses";
import { getCourseOverview } from "@/data/overview";
import { getPracticeTasks } from "@/data/practice";

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

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Practice session</h1>
      <p>Course: {courseId}</p>
      <p>Topic: {topic.title}</p>
      <p>Practice routes are stubbed with minimal tasks for now.</p>

      {tasks.length > 0 ? (
        <ol>
          {tasks.map((task) => (
            <li key={task.id}>
              <strong>{task.title}:</strong> {task.prompt}
            </li>
          ))}
        </ol>
      ) : (
        <p>No practice tasks are available yet.</p>
      )}
    </main>
  );
}
