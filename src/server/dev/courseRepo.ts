import type { Course } from "../repo/types";
import { readJsonFile, writeJsonFile } from "./storage";

type CourseRecord = {
  courseId: string;
  currentTopicId: string;
  currentChapterId: string;
  registrationOpenUntil: string | null; // ISO string for JSON serialization
};

const COURSES_FILE = "courses.json";

function getCourses(): CourseRecord[] {
  return readJsonFile<CourseRecord[]>(COURSES_FILE, []);
}

function saveCourses(courses: CourseRecord[]): void {
  writeJsonFile(COURSES_FILE, courses);
}

function toCourse(record: CourseRecord): Course {
  return {
    courseId: record.courseId,
    currentTopicId: record.currentTopicId,
    currentChapterId: record.currentChapterId,
    registrationOpenUntil: record.registrationOpenUntil
      ? new Date(record.registrationOpenUntil)
      : null,
  };
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const courses = getCourses();
  const record = courses.find((c) => c.courseId === courseId);
  return record ? toCourse(record) : null;
}

export async function updateCourseProgress(
  courseId: string,
  topicId: string,
  chapterId: string
): Promise<void> {
  const courses = getCourses();
  const index = courses.findIndex((c) => c.courseId === courseId);

  if (index >= 0) {
    courses[index].currentTopicId = topicId;
    courses[index].currentChapterId = chapterId;
  } else {
    // Create course if it doesn't exist (for dev convenience)
    courses.push({
      courseId,
      currentTopicId: topicId,
      currentChapterId: chapterId,
      registrationOpenUntil: null,
    });
  }

  saveCourses(courses);
}

export async function setRegistrationOpenUntil(
  courseId: string,
  openUntil: Date | null
): Promise<void> {
  const courses = getCourses();
  const index = courses.findIndex((c) => c.courseId === courseId);

  if (index >= 0) {
    courses[index].registrationOpenUntil = openUntil?.toISOString() ?? null;
    saveCourses(courses);
  }
}
