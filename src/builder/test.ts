import { posix as path } from "node:path";
import { readAllCourses } from "./io";

async function main() {
    const courses = await readAllCourses();

    const files = courses.flatMap(({ group, subject, topics, course_variant }) =>
        Object.entries(topics).flatMap(([topic, chapters]) => {
            const baseDir = path.join("base", subject, topic, "chapters");
            const targetDir = path.join("website", ".generated", "courses", group, course_variant, topic);

            if (chapters.length === 0) {
                return [{
                    source: path.join(baseDir, "website.md"),
                    target: path.join(targetDir, 'index.md')
                }]
            }

            return chapters.map(chapter => {
                return {
                    source: path.join(baseDir, chapter, "website.md"),
                    target: path.join(targetDir, `${chapter}.md`)
                }
            })
        })
    );

    console.log(files);
}

main()