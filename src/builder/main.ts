import { buildCoursesConfig } from "./transformer/courses";
import { getAllPagePaths } from "./transformer/pagePaths";
import { writeFile, readAllCourses } from "./io";
import { buildNavbarConfig } from "./transformer/navbar";
import { buildOverview } from "./transformer/overview";
import { buildSidebar } from "./transformer/sidebar";
import { processPageFile } from "./processPage";

async function main() {
  const courses = await readAllCourses();

  const filePaths = getAllPagePaths(courses);

  await Promise.all([

    ...filePaths.map(file => processPageFile(file)),

    ...courses.map(course => writeFile(buildSidebar(course))),
    ...courses.map(course => writeFile(buildOverview(course))),

    writeFile(buildCoursesConfig(courses)),
    writeFile(buildNavbarConfig(courses)),
  ])

  console.log(`[builder] OK - ${courses.length} course(s)`);
}

main().catch((err) => {
  console.error("[builder] FAILED\n", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});