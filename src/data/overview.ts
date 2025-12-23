import type { Course } from "@/schema/course";
import type {
  CourseOverview,
  CourseOverviewTopic,
  CourseOverviewChapter,
  CourseOverviewWorksheet,
} from "@/schema/overview";
import type { CourseId } from "@/schema/course";

import type { Topic, Chapter, Worksheet } from "@/data/curriculum/curriculum.types";
import { findSubjectBySlug } from "@/data/curriculum/curriculum.queries";

import { getCourseById } from "./courses";

const DEFAULT_SUBJECT_SLUG = "mathematics";

function resolveSubjectSlug(course: Course): string {
  const candidate = course.slug;
  if (findSubjectBySlug(candidate)) {
    return candidate;
  }
  return DEFAULT_SUBJECT_SLUG;
}

function mapWorksheet(worksheet: Worksheet): CourseOverviewWorksheet {
  return {
    id: worksheet.id,
    title: worksheet.name,
    slug: worksheet.slug,
    isVisible: worksheet.visible,
  };
}

function mapChapter(chapter: Chapter): CourseOverviewChapter {
  return {
    id: chapter.id,
    title: chapter.name,
    slug: chapter.slug,
    worksheets: chapter.worksheets.map(mapWorksheet),
  };
}

function mapTopic(topic: Topic): CourseOverviewTopic {
  return {
    id: topic.id,
    title: topic.name,
    slug: topic.slug,
    chapters: topic.chapters.map(mapChapter),
  };
}

export function getCourseOverview(courseId: CourseId): CourseOverview | null {
  const course = getCourseById(courseId);
  if (!course) return null;

  const subjectSlug = resolveSubjectSlug(course);
  const subject = findSubjectBySlug(subjectSlug);

  return {
    courseId,
    groupId: course.group,
    slug: course.slug,
    title: course.title,
    description: course.description,
    topics: subject ? subject.topics.map(mapTopic) : [],
  };
}
