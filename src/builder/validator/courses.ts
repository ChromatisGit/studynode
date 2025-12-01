import type { CoursePlan } from "@schema/coursePlan";
import type { GroupsAndSubjects } from "@schema/groupsAndSubjects";

export function validateCourses(courses: CoursePlan[], groupsAndSubjects: GroupsAndSubjects) {
  const errors: string[] = [];

  const slugByGroup = new Map<string, Set<string>>();
  const byGroupAndSubject = new Map<string, Map<string, CoursePlan[]>>();

  for (const course of courses) {
    const slugSet = slugByGroup.get(course.group) ?? new Set<string>();
    if (slugSet.has(course.slug)) {
      errors.push(`Duplicate slug '${course.slug}' found in group '${course.group}'.`);
    }
    slugSet.add(course.slug);
    slugByGroup.set(course.group, slugSet);

    const subjectMap = byGroupAndSubject.get(course.group) ?? new Map<string, CoursePlan[]>();
    const list = subjectMap.get(course.subject) ?? [];
    list.push(course);
    subjectMap.set(course.subject, list);
    byGroupAndSubject.set(course.group, subjectMap);
  }

  for (const [group, subjectMap] of byGroupAndSubject) {
    for (const [subject, list] of subjectMap) {
      if (list.length <= 1) continue;

      list.forEach((course) => {
        if (!course.course_variant) {
          errors.push(
            `Course '${group}/${course.slug}' is missing 'course.variant' but there are multiple '${subject}' courses in this group.`,
          );
          return;
        }

        if (!groupsAndSubjects.variants[course.course_variant]) {
          errors.push(
            `Variant '${course.course_variant}' used in course '${group}/${course.slug}' is not defined in groupsAndSubjects.yml.`,
          );
        }
      });
    }
  }

  if (errors.length) {
    throw new Error(errors.map((msg) => `- ${msg}`).join("\n"));
  }
}
