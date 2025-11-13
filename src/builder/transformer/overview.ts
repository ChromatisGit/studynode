import type { CoursePlan } from "@schema/course-plan"

export function buildOverviewData(courses: CoursePlan[]) {
    return courses.map((course) => {
        const {topics, current_chapter, ...rest} = course;

        const index = topics.findIndex(t => t.chapter === current_chapter);

        return {
            ...rest,
            finished: topics.slice(0, index),
            in_progress: topics[index],
            planned: topics.slice(index + 1)
        };
    })
};