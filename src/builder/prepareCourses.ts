import type { CoursePlan } from "@schema/coursePlan";
import type { GroupsAndSubjects } from "@schema/groupsAndSubjects";
import type { TopicPlan } from "@schema/topicPlan";
import type { Status } from "@schema/overview";
import type { AccentColor } from "@schema/colors";
import { WorksheetRef } from "./loadWorksheets";

export type ResolvedCourseChapter = {
  chapter: string;
  label: string;
  status: Status;
  worksheets: WorksheetRef[];
}

export type ResolvedCourseTopic = {
  topic: string;
  label: string;
  status: Status;
  chapters: ResolvedCourseChapter[];
};

export type WorksheetFormat = "web" | "pdf";

export type ResolvedCourse = {
  group: { id: string; label: string; color: AccentColor };
  subject: { id: string; label: string; icon: string };
  courseVariant?: { id: string; label: string; short: string };
  slug: string;
  currentChapter?: CurrentChapter;
  worksheetFormat: WorksheetFormat;
  topics: ResolvedCourseTopic[];
};

type CurrentChapter = { id: string; label: string; worksheets: WorksheetRef[] };

export function prepareCourses(
  courses: CoursePlan[],
  groupsAndSubjects: GroupsAndSubjects,
  topics: Record<string, TopicPlan>,
): ResolvedCourse[] {
  const labeledCourses = labelCourses(courses, topics);

  return labeledCourses.map((course) => {
    const groupId = course.group.replace(/[0-9]/g, "");
    const groupEntry = groupsAndSubjects.groups[groupId]!;
    const subjectEntry = groupsAndSubjects.subjects[course.subject]!;
    const variantEntry = course.courseVariant
      ? groupsAndSubjects.variants[course.courseVariant]
      : undefined;

    const { topics: preparedTopics, currentChapter } = computePreparedTopics(course);

    return {
      group: { id: course.group, label: groupEntry.name, color: groupEntry.color },
      subject: { id: course.subject, label: subjectEntry.name, icon: subjectEntry.icon },
      courseVariant: variantEntry
        ? { id: course.courseVariant!, label: variantEntry.name, short: variantEntry.short }
        : undefined,
      slug: course.slug,
      currentChapter,
      worksheetFormat: course.worksheetFormat,
      topics: preparedTopics,
    };
  });
}

function labelCourses(
  courses: CoursePlan[],
  topics: Record<string, TopicPlan>,
): CoursePlan[] {
  return courses.map((course) => ({
    ...course,
    topics: course.topics.map((topic) => {
      const topicDef = topics[topic.topic];
      return {
        ...topic,
        label: topicDef?.title ?? topic.label,
        chapters: topic.chapters.map((ch) => {
          const chapterDef = topicDef?.chapters.find((c) => c.id === ch.chapter);
          return {
            ...ch,
            label: chapterDef?.title ?? ch.label,
          };
        }),
      };
    }),
  }));
}

function computePreparedTopics(course: CoursePlan): {
  topics: ResolvedCourseTopic[];
  currentChapter?: CurrentChapter;
} {
  let currentChapter: CurrentChapter | undefined;

  const currentTopicIndex =
    course.currentChapter == null
      ? 0
      : Math.max(
        0,
        course.topics.findIndex((topic) =>
          topic.chapters.some((ch) => ch.chapter === course.currentChapter),
        ),
      );

  const topics = course.topics.map((topic, topicIndex) => {
    const topicStatus = statusFromRelativeIndex(topicIndex - currentTopicIndex);

    let visibleChapters: typeof topic.chapters;

    switch (topicStatus) {
      case "locked":
        return {
          topic: topic.topic,
          label: topic.label,
          status: topicStatus,
          chapters: [],
        };
      case "planned":
        visibleChapters = topic.chapters.slice(0, 2);
        break;
      default:
        visibleChapters = topic.chapters;
        break;
    }

    // Ensure that a single chapter is promoted to topic status
    if (visibleChapters.length === 1) {
      visibleChapters[0].chapter = topic.topic
    };

    // Ensure there is always a chapter
    if (visibleChapters.length === 0) {
      visibleChapters.push({
        topic: topic.topic,
        chapter: topic.topic,
        label: topic.label,
      })
    };

    const currentChapterIndex =
      topicStatus === "current" && course.currentChapter
        ? visibleChapters.findIndex((ch) => ch.chapter === course.currentChapter)
        : -1;

    const chapters = visibleChapters.map((chapter, chapterIndex) => {
      const status = chapterStatusForTopic(topicStatus, chapterIndex, currentChapterIndex);

      const worksheets: WorksheetRef[] = []

      if (status === "current") {
        currentChapter = { id: chapter.chapter, label: chapter.label, worksheets };
      }

      return {
        chapter: chapter.chapter,
        label: chapter.label,
        status,
        worksheets
      };
    });

    return {
      topic: topic.topic,
      label: topic.label,
      status: topicStatus,
      chapters,
    };
  });

  return { topics, currentChapter };
}

function statusFromRelativeIndex(relativeIndex: number): Status {
  if (relativeIndex < 0) return "finished";
  if (relativeIndex === 0) return "current";
  if (relativeIndex === 1) return "planned";
  return "locked";
}

function chapterStatusForTopic(
  topicStatus: Status,
  chapterIndex: number,
  currentChapterIndex: number,
): Status {
  if (topicStatus === "finished") return "finished";
  if (topicStatus === "planned") return "planned";

  if (chapterIndex < currentChapterIndex) return "finished";
  if (chapterIndex === currentChapterIndex) return "current";
  return "planned";
}
