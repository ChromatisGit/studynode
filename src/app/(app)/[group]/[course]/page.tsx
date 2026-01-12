
import { getCourseId } from "@data/courses";
import { getCourseDTO } from "@data/getCourseDTO";
import { getProgressDTO } from "@data/getProgressDTO";
import { CoursepagePage } from "@features/coursepage/Coursepage";

type PageParams = {
  params: {
    groupKey: string;
    subjectKey: string;
  };
};


export default async function CourseRoute({ params }: PageParams) {
  const { groupKey, subjectKey } = params;
  const courseId = getCourseId(groupKey, subjectKey);
  const course = getCourseDTO(courseId);
  const progress = await getProgressDTO(courseId);

  const currentTopic =
    progress.topics.find((topic) => topic.topicId === progress.currentTopicId) ??
    progress.topics.find((topic) => topic.status === "current");

  const model = {
    title: course.label,
    label: course.label,
    current: currentTopic?.label ?? null,
    roadmap: progress.topics,
  };

  return <CoursepagePage model={model} />;
}
