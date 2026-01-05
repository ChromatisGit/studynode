export type AccessState = "public" | "enrolled" | "admin" | "restricted";

export type CourseAccessState = {
  courseId: string;
  state: AccessState;
};

export function canAccessCourse(state: CourseAccessState): boolean {
  return state.state !== "restricted";
}

export function needsAccessRequest(state: CourseAccessState): boolean {
  return state.state === "restricted";
}
