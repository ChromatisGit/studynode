import type { CoursePlan } from "@schema/coursePlan";
import type { GroupsAndSubjects } from "@schema/groupsAndSubjects";
import { AccentColor } from "@schema/colors";

export type Course = {
  group: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  color: AccentColor;
  icon: string;
};


export function buildCoursesConfig(courses: CoursePlan[], groupsAndSubjects: GroupsAndSubjects) {
    const content: Course[] = courses.map(c => {
        const { group, slug, subject, course_variant, current_chapter, chapters } = c
        const groupId = group.replace(/[0-9]/g, "")

        const groupEntry = groupsAndSubjects.groups[groupId]!;
        const subjectEntry = groupsAndSubjects.subjects[subject]!;
        const variantEntry = course_variant ? groupsAndSubjects.variants[course_variant]! : undefined;

        const description = `Aktuelles Thema: ${chapters.find((c) => c.chapter === current_chapter)?.label ?? current_chapter ?? chapters[0].label}`

        const tags = [groupEntry.name, subjectEntry.name]

        if (variantEntry) {
            tags.push(variantEntry.name);
        }

        return {
            group,
            slug,
            title: `${subjectEntry.name} ${group.toUpperCase()}`,
            description,
            tags,
            color: groupEntry.color,
            icon: subjectEntry.icon
        }
    })

    return {
        relativePath: `configs/courses.config.json`,
        content: JSON.stringify(content, null, 2)
    };
}
