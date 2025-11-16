import { buildCoursesConfig } from "./transformer/courses";
import { buildCourseFileMappings } from "./transformer/fileMapping";
import { writeFile, copyFile, readAllCourses } from "./io";
import { buildNavbarConfig } from "./transformer/navbar";
import { buildOverview } from "./transformer/overview";
import { buildSidebar } from "./transformer/sidebar";

async function main() {
  const courses = await readAllCourses();

  const filesPaths = buildCourseFileMappings(courses);
  await Promise.all(
    filesPaths.map(({ source, target }) => copyFile(source, target))
  );

  courses.forEach(course => {
    writeFile(buildSidebar(course))
    writeFile(buildOverview(course))
  });

  writeFile(buildCoursesConfig(courses));
  writeFile(buildNavbarConfig(courses));

  console.log(
    `[builder] OK - ${courses.length} course(s)`
  );
}

main().catch((err) => {
  console.error("[builder] FAILED\n", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});