import "server-only";

import type { Course } from "./types";

// NODE_ENV check allows bundler to dead-code eliminate the unused branch
const impl =
  process.env.NODE_ENV === "production"
    ? await import("../db/courseRepo")
    : await import("../dev/courseRepo");

export async function getCourse(courseId: string): Promise<Course | null> {
  return impl.getCourse(courseId);
}

export async function updateCourseProgress(
  courseId: string,
  topicId: string,
  chapterId: string
): Promise<void> {
  return impl.updateCourseProgress(courseId, topicId, chapterId);
}

export async function setRegistrationOpenUntil(
  courseId: string,
  openUntil: Date | null
): Promise<void> {
  return impl.setRegistrationOpenUntil(courseId, openUntil);
}

export type { Course } from "./types";
