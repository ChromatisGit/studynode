import { deleteGeneratedWebsite, writeGeneratedFile } from "./io";
import { loadContent } from "./loadContent";
import { buildCoursesConfig } from "./transformer/courses";
import { getAllPagePaths } from "./transformer/pagePaths";
import { buildPageFile } from "./transformer/pages";
import { buildNavbarConfig } from "./transformer/navbar";
import { buildOverview } from "./transformer/overview";
import { buildSidebar } from "./transformer/sidebar";
import { setCourseLabels } from "./transformer/courseLabels";
import { buildGroupsAndSubjects } from "./transformer/groupsAndSubjects";
import { validateCourses } from "./validateCourses";

async function main() {
  await deleteGeneratedWebsite()

  const { groupsAndSubjects, topics, courses } = await loadContent();

  validateCourses(courses, groupsAndSubjects);

  const labeledCourses = setCourseLabels(courses, topics)

  await Promise.all([
    writeGeneratedFile(buildGroupsAndSubjects(groupsAndSubjects)),

    ...getAllPagePaths(labeledCourses).map(async file => writeGeneratedFile(await buildPageFile(file))),

    ...labeledCourses.map(course => writeGeneratedFile(buildSidebar(course))),
    ...labeledCourses.map(course => writeGeneratedFile(buildOverview(course, labeledCourses, groupsAndSubjects))),

    writeGeneratedFile(buildCoursesConfig(labeledCourses, groupsAndSubjects)),
    writeGeneratedFile(buildNavbarConfig(labeledCourses, groupsAndSubjects)),
  ])

  console.log(`[builder] OK - ${labeledCourses.length} course(s)`);
}

main().catch((err) => {
  console.error("[builder] FAILED\n", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
