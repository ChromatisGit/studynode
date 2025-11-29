import type { CoursePlan } from "@schema/coursePlan";
import type { GroupsAndSubjects } from "@schema/groupsAndSubjects";
import { AccentColor } from "@css/colors";
import type { LucideIcon } from "lucide-react";

export type Course = {
  group: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  color: AccentColor;
  icon: LucideIcon;
};


export function buildCoursesConfig(courses: CoursePlan[], groupsAndSubjects: GroupsAndSubjects) {
    const content: Course[] = courses.map(c => {
        const { group, slug, subject, course_variant, current_chapter, chapters } = c
        const groupId = group.replace(/[0-9]/g, "")

        const groupEntry = groupsAndSubjects.groups[groupId]
        if (!groupEntry) {
            throw new Error(`Group '${groupId}' used in course '${group}' is not defined in groupsAndSubjects.yml`);
        }

        const subjectEntry = groupsAndSubjects.subjects[subject]
        if (!subjectEntry) {
            throw new Error(`Subject '${subject}' used in course '${group}/${slug}' is not defined in groupsAndSubjects.yml`);
        }

        const variantEntry = course_variant ? groupsAndSubjects.variants[course_variant] : undefined
        if (course_variant && !variantEntry) {
            throw new Error(`Variant '${course_variant}' used in course '${group}/${slug}' is not defined in groupsAndSubjects.yml`);
        }

        const description = `Aktuelles Thema: ${chapters.find((c) => c.chapter === current_chapter)?.label ?? current_chapter ?? chapters[0].label}`

        const tags = [groupEntry.name, subjectEntry.name]

        if (variantEntry) {
            tags.push(variantEntry.name);
        }

        return {
            group,
            slug,
            title: `${group.toUpperCase()} ${subjectEntry.name}`,
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
