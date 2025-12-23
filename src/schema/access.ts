import type { CourseId } from "./course";

export type AccessState = "public" | "enrolled" | "admin" | "restricted";

export type CourseAccessState = {
  courseId: CourseId;
  state: AccessState;
};

export function canAccessCourse(state: CourseAccessState): boolean {
  return state.state !== "restricted";
}

export function needsAccessRequest(state: CourseAccessState): boolean {
  return state.state === "restricted";
}
