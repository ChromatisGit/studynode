import "server-only";

import { courses } from "@db/schema";
import { eq } from "drizzle-orm";
import { db } from ".";

export async function getCourse(courseId: string) {
  const rows = await db.select().from(courses).where(eq(courses.courseId, courseId)).limit(1);
  return rows[0] ?? null;
}

export async function updateCourseProgress(courseId: string, topicId: string, chapterId: string): Promise<void> {
  await db
    .update(courses)
    .set({ currentTopicId: topicId, currentChapterId: chapterId })
    .where(eq(courses.courseId, courseId));
}

export async function setRegistrationOpenUntil(courseId: string, openUntil: Date | null): Promise<void> {
  await db
    .update(courses)
    .set({ registrationOpenUntil: openUntil })
    .where(eq(courses.courseId, courseId));
}
