import type {
  CourseOverview,
  RoadmapChapterViewModel,
  RoadmapViewModel,
  RoadmapWorksheetViewModel,
  Status,
} from "@/schema/overview";
import type { CourseId } from "@/schema/course";

import { getCourseOverview } from "./overview";
import { parseCourseId } from "./courses";

type ProgressCursor = {
  topicIndex: number;
  chapterIndex: number;
  worksheetIndex: number;
};

function resolveProgressCursor(overview: CourseOverview): ProgressCursor | null {
  if (overview.topics.length === 0) return null;
  const firstTopic = overview.topics[0];
  if (firstTopic.chapters.length === 0) return null;
  const firstChapter = firstTopic.chapters[0];
  if (firstChapter.worksheets.length === 0) return null;

  return { topicIndex: 0, chapterIndex: 0, worksheetIndex: 0 };
}

function resolveChapterStatus(worksheets: RoadmapWorksheetViewModel[]): Status {
  if (worksheets.length === 0) return "planned";
  if (worksheets.some((worksheet) => worksheet.isCurrent)) return "current";
  if (worksheets.every((worksheet) => worksheet.isCompleted)) return "finished";
  return "planned";
}

function resolveTopicStatus(chapters: RoadmapChapterViewModel[]): Status {
  if (chapters.length === 0) return "planned";
  if (chapters.some((chapter) => chapter.status === "current")) return "current";
  if (chapters.every((chapter) => chapter.status === "finished")) return "finished";
  return "planned";
}

export function buildRoadmapViewModel(overview: CourseOverview): RoadmapViewModel {
  const progress = resolveProgressCursor(overview);
  const { groupId, slug } = parseCourseId(overview.courseId);

  return overview.topics.map((topic, topicIndex) => {
    const topicBase = `/${groupId}/${slug}/${topic.slug}`;
    const chapters = topic.chapters.map((chapter, chapterIndex) => {
      const chapterBase = `${topicBase}/${chapter.slug}`;
      const worksheets = chapter.worksheets.map((worksheet, worksheetIndex) => {
        const isCompleted =
          progress !== null &&
          (topicIndex < progress.topicIndex ||
            (topicIndex === progress.topicIndex && chapterIndex < progress.chapterIndex) ||
            (topicIndex === progress.topicIndex &&
              chapterIndex === progress.chapterIndex &&
              worksheetIndex < progress.worksheetIndex));

        const isCurrent =
          progress !== null &&
          topicIndex === progress.topicIndex &&
          chapterIndex === progress.chapterIndex &&
          worksheetIndex === progress.worksheetIndex;

        return {
          id: worksheet.id,
          title: worksheet.title,
          slug: worksheet.slug,
          link: `${chapterBase}/${worksheet.slug}`,
          isCompleted,
          isCurrent,
        };
      });

      const status = resolveChapterStatus(worksheets);
      return {
        id: chapter.id,
        title: chapter.title,
        slug: chapter.slug,
        label: chapter.title,
        link: chapterBase,
        status,
        worksheets,
        isExpanded: status === "current",
      };
    });

    const status = resolveTopicStatus(chapters);
    return {
      id: topic.id,
      title: topic.title,
      slug: topic.slug,
      label: topic.title,
      link: topicBase,
      status,
      chapters,
      isExpanded: status === "current",
    };
  });
}

export function getCourseRoadmap(courseId: CourseId): RoadmapViewModel {
  const overview = getCourseOverview(courseId);
  if (!overview) return [];
  return buildRoadmapViewModel(overview);
}
