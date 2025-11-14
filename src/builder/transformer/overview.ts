import type { CoursePlan } from "@schema/course-plan"
import path from "node:path";
import { createOverviewContent } from "./overviewContent";


export function buildOverview(course: CoursePlan) {

    const overviewPath = path.join(
            "courses",
            course.group,
            course.course_variant,
            "index.mdx",
        );

    const overviewContent = createOverviewContent(course);
}