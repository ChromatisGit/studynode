import type { CoursePlan } from "@schema/coursePlan";
import type { Status } from "@schema/overview";

export type ChapterProgress = CoursePlan["chapters"][number] & { status: Status };
export type TopicProgress = CoursePlan["topics"][number] & {
  status: Status;
  chapters: ChapterProgress[];
};

export type CourseProgress = {
  topics: TopicProgress[];
  currentChapterLabel: string | null;
  currentTopicIndex: number;
};

export function computeCourseProgress(course: CoursePlan): CourseProgress {
  let currentChapterLabel: string | null = null;
  let currentTopicIndex = 0;

  if (course.current_chapter !== null) {
    const currentChapterEntry = course.chapters.find(
      (c) => c.chapter === course.current_chapter,
    );

    if (currentChapterEntry) {
      const topicIndex = course.topics.findIndex(
        (t) => t.topic === currentChapterEntry.topic,
      );

      if (topicIndex !== -1) {
        currentTopicIndex = topicIndex;
      }
    }
  }

  const topics = course.topics.map((topic, topicIndex) => {
    const topicChapters = course.chapters.filter(
      (chapter) => chapter.topic === topic.topic,
    );

    const relativeIndex = topicIndex - currentTopicIndex;

    const topicStatus = statusFromRelativeIndex(relativeIndex);
    const currentChapterIndex = topicChapters.findIndex(
      (chapter) => chapter.chapter === course.current_chapter,
    );

    const chaptersWithStatus: ChapterProgress[] = topicChapters.map(
      (chapter, chapterIndex) => {
        const status = chapterStatusForTopic(
          topicStatus,
          currentChapterIndex,
          chapterIndex,
        );

        if (status === "current") {
          currentChapterLabel = chapter.label;
        }

        return { ...chapter, status };
      },
    );

    return {
      ...topic,
      status: topicStatus,
      chapters: chaptersWithStatus,
    };
  });

  return { topics, currentChapterLabel, currentTopicIndex };
}

function statusFromRelativeIndex(relativeIndex: number): Status {
  if (relativeIndex < 0) return "finished";
  if (relativeIndex === 0) return "current";
  if (relativeIndex === 1) return "planned";
  return "locked";
}

function chapterStatusForTopic(
  topicStatus: Status,
  currentChapterIndex: number,
  chapterIndex: number,
): Status {
  if (topicStatus === "finished") return "finished";
  if (topicStatus === "planned") return "planned";
  if (topicStatus === "locked") return "locked";

  // topicStatus === "current"
  if (currentChapterIndex === -1) return "planned";
  if (chapterIndex < currentChapterIndex) return "finished";
  if (chapterIndex === currentChapterIndex) return "current";
  return "planned";
}
