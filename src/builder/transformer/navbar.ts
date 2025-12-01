import type { CoursePlan } from "@schema/coursePlan";
import type { GroupsAndSubjects } from "@schema/groupsAndSubjects";
import type { NavbarConfig} from "@features/overview/GroupBasedNavbar"


export function buildNavbarConfig(courses: CoursePlan[], groupsAndSubjects: GroupsAndSubjects) {
  return {
    relativePath: `configs/navbar.config.json`,
    content: JSON.stringify(buildNavbarJSON(courses, groupsAndSubjects), null, 2),
  };
}

function buildNavbarJSON(courses: CoursePlan[], groupsAndSubjects: GroupsAndSubjects): NavbarConfig  {
  return Object.fromEntries(
    Object.entries(Object.groupBy(courses, (c) => c.group)).map(([group, list = []]) => {
      const navbar = list.map((course) => ({
        label: buildLabel(course, list, groupsAndSubjects),
        to: `${course.group}/${course.slug}`,
        position: "left" as const,
      }));

      navbar.push({ label: "Leitsätze", to: `${group}/principles`, position: "left" as const });

      return [group, navbar];
    }),
  );
}

function buildLabel(course: CoursePlan, groupCourses: CoursePlan[], groupsAndSubjects: GroupsAndSubjects) {
  const subjectEntry = groupsAndSubjects.subjects[course.subject]!;

  if (groupCourses.length === 1) {
    return "Übersicht";
  }

  const coursesWithSameSubject = groupCourses.filter((item) => item.subject === course.subject);
  if (coursesWithSameSubject.length === 1) {
    return subjectEntry.name;
  }

  const variantEntry = course.course_variant ? ` (${groupsAndSubjects.variants[course.course_variant]!})` : "";

  return `${subjectEntry.name}` + variantEntry;
}
