import type { CoursePlan } from "@schema/coursePlan";
import path from "node:path";
import { renderSidebar } from "@builder/template/sidebar";

export function buildSidebar(course: CoursePlan) {
  return {
    relativePath: path.join("sidebars", course.group, `${course.slug}.ts`),
    content: renderSidebar(course),
  };
}
