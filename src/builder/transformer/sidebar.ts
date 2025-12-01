import type { CoursePlan } from "@schema/coursePlan";
import path from "node:path";
import { renderSidebar } from "@builder/template/sidebar";
import { computeCourseProgress } from "@builder/computeCourseProgress";

export function buildSidebar(course: CoursePlan) {

  const filteredTopics = computeCourseProgress(course).topics
  .filter((topic) => {topic.status !== "locked" && topic.chapters.length > 1})

  return {
    relativePath: path.join("sidebars", course.group, `${course.slug}.ts`),
    content: renderSidebar(filteredTopics),
  };
}
