import { deleteGeneratedWebsite, writeGeneratedFile } from "./fs";
import { loadContent } from "./loader/content";
import { buildCoursesConfig } from "./transformer/courses";
import { getAllPagePaths } from "./transformer/pagePaths";
import { buildPageFile } from "./transformer/pages";
import { buildNavbarConfig } from "./transformer/navbar";
import { buildOverview } from "./transformer/overview";
import { buildSidebar } from "./transformer/sidebar";
import { setCourseLabels } from "./transformer/courseLabels";
import { buildGroupsAndSubjects } from "./transformer/groupsAndSubjects";
import { validateCourses } from "./validator/courses";

async function main() {
  await deleteGeneratedWebsite()

  const { groupsAndSubjects, topics, courses } = await loadContent();

  validateCourses(courses, groupsAndSubjects);

  const labeledCourses = setCourseLabels(courses, topics)
  const coursesByGroup = Object.groupBy(labeledCourses, c => c.group);

  const filePaths = getAllPagePaths(labeledCourses);

  await Promise.all([
    writeGeneratedFile(buildGroupsAndSubjects(groupsAndSubjects)),

    ...filePaths.map(async file => writeGeneratedFile(await buildPageFile(file))),

    ...labeledCourses.map(course => writeGeneratedFile(buildSidebar(course))),
    ...labeledCourses.map(course => writeGeneratedFile(buildOverview(course, coursesByGroup[course.group] ?? [], groupsAndSubjects))),

    writeGeneratedFile(buildCoursesConfig(labeledCourses, groupsAndSubjects)),
    writeGeneratedFile(buildNavbarConfig(labeledCourses, groupsAndSubjects)),
  ])

  console.log(`[builder] OK - ${labeledCourses.length} course(s)`);
}

main().catch((err) => {
  console.error("[builder] FAILED\n", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
