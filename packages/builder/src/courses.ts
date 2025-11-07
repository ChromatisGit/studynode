export function buildCourses(courses) {
    return courses.map(c => {
        const { group, course_variant } = c
        return { group, course_variant }
    })
}