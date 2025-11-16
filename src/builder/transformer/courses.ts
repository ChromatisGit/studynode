import type { CoursePlan } from "@schema/course-plan"

export function buildCoursesConfig(courses: CoursePlan[]) {
    const content = courses.map(c => {
        const { group, course_variant } = c
        return { group, course_variant }
    })

    return {
        relativePath: '',
        pageName: `courses.config.json`,
        content:  JSON.stringify(content, null, 2)
    };
}