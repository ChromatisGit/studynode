import type { CoursePlan } from "@schema/course-plan"
import path from "node:path";

export function getWebsiteFilePaths(courses: CoursePlan[]) {
    return courses.flatMap(({ group, subject, topics, course_variant }) =>
        topics.map(({ topic, chapter }) => {
            const baseDir = path.join(subject, topic, "chapters");
            const targetDir = path.join("courses", group, course_variant, topic);

            if (topic === chapter) {
                return {
                    source: path.join(baseDir, "website.md"),
                    target: path.join(targetDir, 'index.md')
                }
            }

            return {
                source: path.join(baseDir, chapter, "website.md"),
                target: path.join(targetDir, `${chapter}.md`)
            }
        })
    );
}