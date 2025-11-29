import type { CoursePlan } from "@schema/coursePlan"
import type { PageFile } from "@builder/processPage";
import path from "node:path";

export function getAllPagePaths(courses: CoursePlan[]): PageFile[] {
  return [
    ...baseWebsitePaths(courses),
    ...groupPrinciplesPaths(courses),
  ];
}

function baseWebsitePaths(courses: CoursePlan[]): PageFile[] {
  return courses.flatMap(({ group, subject, chapters, slug }) =>
    chapters.map(({ topic, chapter, label }) => {
      const baseDir = path.join("base", subject, topic, "chapters");
      const targetDir = path.join("courses", group, slug, topic);

      if (topic === chapter) {
        return {
          source: path.join(baseDir, "website.md"),
          target: path.join(targetDir, "index.md"),
          label
        };
      }

      return {
        source: path.join(baseDir, chapter, "website.md"),
        target: path.join(targetDir, `${chapter}.md`),
        label,
        sidebar: topic
      };
    }),
  );
}

function groupPrinciplesPaths(courses: CoursePlan[]): PageFile[] {
  const groups = [...new Set(courses.map(c => c.group))];

  return groups.map(group => ({
    source: path.join("courses", group, "principles.md"),
    target: path.join("courses", "shared", group, "principles.md"),
    label: 'Leitsätze'
  }));
}
