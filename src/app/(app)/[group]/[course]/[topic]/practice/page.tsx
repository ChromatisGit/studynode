import { notFound } from "next/navigation";

import { getCourseId } from "@services/courseService";
import { getPracticeTasks } from "@services/practiceService";
import { getProgressDTO } from "@services/getProgressDTO";
import { Practise } from "@features/practise/Practise";

type PageParams = {
  params: Promise<{
    group: string;
    course: string;
    topic: string;
  }>;
};

export default async function PracticePage({ params }: PageParams) {
  const { group: groupKey, course: subjectKey, topic: topicId } = await params;
  const courseId = getCourseId(groupKey, subjectKey);
  const progress = await getProgressDTO(courseId);

  const topic = progress.topics.find((item) => item.topicId === topicId);
  if (!topic) notFound();

  const tasks = getPracticeTasks(courseId);

  return <Practise courseId={courseId} topicTitle={topic.label} tasks={tasks} />;
}

