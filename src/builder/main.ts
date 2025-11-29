import { buildCoursesConfig } from "./transformer/courses";
import { getAllPagePaths } from "./transformer/pagePaths";
import { writeFile, readAllCourses, deleteGeneratedWebsite, readAllTopics, readGroupsAndSubjects } from "./io";
import { buildNavbarConfig } from "./transformer/navbar";
import { buildOverview } from "./transformer/overview";
import { buildSidebar } from "./transformer/sidebar";
import { processPageFile } from "./processPage";
import { setCourseLabels } from "./transformer/courseLabels";
import { buildGroupsAndSubjects } from "./transformer/groupsAndSubjects";

async function main() {
  await deleteGeneratedWebsite()

  const groupsAndSubjects = await readGroupsAndSubjects();
  writeFile(buildGroupsAndSubjects(groupsAndSubjects));


  const coursesData = await readAllCourses();
  const topicsData = await readAllTopics();

  const courses = setCourseLabels(coursesData, topicsData)
  const coursesByGroup = Object.groupBy(courses, c => c.group);

  const filePaths = getAllPagePaths(courses);

  await Promise.all([

    ...filePaths.map(file => processPageFile(file)),

    ...courses.map(course => writeFile(buildSidebar(course))),
    ...courses.map(course => writeFile(buildOverview(course, coursesByGroup[course.group] ?? [], groupsAndSubjects))),

    writeFile(buildCoursesConfig(courses, groupsAndSubjects)),
    writeFile(buildNavbarConfig(courses, groupsAndSubjects)),
  ])

  console.log(`[builder] OK - ${courses.length} course(s)`);
}

main().catch((err) => {
  console.error("[builder] FAILED\n", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
