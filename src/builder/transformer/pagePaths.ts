import type { CoursePlan } from "@schema/coursePlan";
import type { PageSource } from "./pages";
import path from "node:path";
import { computeCourseProgress } from "../computeCourseProgress";

export function getAllPagePaths(courses: CoursePlan[]): PageSource[] {
  return [
    ...courses.flatMap(buildCoursePagePaths),
    ...groupPrinciplesPaths(courses),
  ];
}

function buildCoursePagePaths(course: CoursePlan): PageSource[] {
  const progress = computeCourseProgress(course);

  return progress.topics
  .filter((topic) => {topic.status !== "locked"})
  .flatMap((topic) => {
    const baseDir = path.join("base", course.subject, topic.topic);
    const targetDir = path.join("courses", course.group, course.slug, topic.topic);
    const files: PageSource[] = [];

    // Topic overview
    const topicOverview: PageSource = {
        source: path.join(baseDir, pickSourceFile(topic.status)),
        target: path.join(targetDir, "index.md"),
        label: topic.label,
      }

    if (topic.chapters.length <= 1) {
      files.push(topicOverview);
      return files;
    }

    topicOverview.sidebar = topic.topic;
    files.push(topicOverview);

    // Chapter overview
    topic.chapters.forEach((chapter) => {
      if (chapter.chapter === topic.topic) return;

      files.push({
        source: path.join(baseDir, "chapters", chapter.chapter, pickSourceFile(chapter.status)),
        target: path.join(targetDir, `${chapter.chapter}.md`),
        label: chapter.label,
        sidebar: topic.topic,
      });
    });

    return files;
  });
}

function pickSourceFile(status: string) {
  return status === "finished" ? "overview.md" : "preview.md";
}

function groupPrinciplesPaths(courses: CoursePlan[]): PageSource[] {
  const groups = [...new Set(courses.map((c) => c.group))];

  return groups.map((group) => ({
    source: path.join("courses", group, "principles.md"),
    target: path.join("courses", "shared", group, "principles.md"),
    label: "Leitsätze",
  }));
}
