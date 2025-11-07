async function main() {
  const courses = await readAllCourses();

  await writeConfig('courses', buildCoursesList(courses));

  await writeConfig('navbar', buildNavbar(courses));

  console.log(
    `[build] OK · ${courses.length} course(s)`
  );
}

main().catch((err) => {
  console.error("[build] FAILED\n", err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});