import type { CoursePlan } from "@schema/course-plan"

export function buildOverviewData(courses: CoursePlan[]) {
    return Object.fromEntries(
        Object.entries(Object.groupBy(courses, c => c.group)).map(([group, groupCourses]) => {
            const perCourse = Object.fromEntries(
                groupCourses!.map(course => {
                    const { course_variant, topics, current_chapter,
                        label, current_worksheets } = course;

                    const index = topics.findIndex(t => t.chapter === current_chapter);

                    return [
                        course_variant,
                        {
                            label,
                            current_worksheets,
                            finished: topics.slice(0, index),
                            in_progress: topics[index],
                            planned: topics.slice(index + 1)
                        }
                    ];
                })
            );

            return [group, perCourse];
        })
    );

};