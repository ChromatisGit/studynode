import { notFound } from "next/navigation";

import { buildCourseId, getCourseBySlug } from "@/data/courses";
import { getCourseOverview } from "@/data/overview";
import { getCourseRoadmap } from "@/data/roadmap";
import { CoursepagePage } from "@pages/coursepage/Coursepage";
import type { CoursepageModel } from "@schema/coursepage";

type PageParams = {
  params:
    | {
        group: string;
        course: string;
      }
    | Promise<{
        group: string;
        course: string;
      }>;
};

export default async function CourseRoute({ params }: PageParams) {
  const { group, course: courseSlug } = await params;
  const course = getCourseBySlug(group, courseSlug);

  if (!course) {
    return notFound();
  }

  const courseId = buildCourseId(group, courseSlug);
  const overview = getCourseOverview(courseId);
  const roadmap = getCourseRoadmap(courseId);
  const currentTopic =
    roadmap.find((topic) => topic.status === "current")?.label ??
    overview?.topics[0]?.title;

  const model: CoursepageModel = {
    title: course.title,
    label: course.title,
    slug: course.slug,
    group: course.group,
    current: currentTopic,
    roadmap,
  };

  return <CoursepagePage model={model} />;
}
