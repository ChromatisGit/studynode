import type { CoursePlan } from "@schema/course-plan"
import { buildOverviewData } from "./transformer/overview";

function buildOverview(courses: CoursePlan[]) {
    const coursesData = buildOverviewData(courses)
    coursesData.forEach((course)=> {
    })
}