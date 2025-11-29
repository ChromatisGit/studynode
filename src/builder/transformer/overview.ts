import type { CoursePlan } from "@schema/coursePlan";
import type { GroupsAndSubjects } from "@schema/groupsAndSubjects";
import path from "node:path";
import { renderOverview } from "@builder/template/overview.mdx";
import type {
  OverviewModel,
  RoadmapChapter,
  RoadmapTopic,
  Status,
} from "@schema/overview";

export function buildOverview(course: CoursePlan, groupCourses: CoursePlan[], groupsAndSubjects: GroupsAndSubjects) {
  const model = toOverviewModel(course, groupCourses, groupsAndSubjects);

  return {
    relativePath: path.join(
      "courses",
      course.group,
      course.slug,
      "index.mdx",
    ),
    content: renderOverview(model),
  };
}

type Chapter = CoursePlan["chapters"][number];

function makeChapterStatusFactory(
  slug: CoursePlan["slug"],
  topic: string,
) {
  return (chapter: Chapter, status: Status): RoadmapChapter => ({
    label: chapter.label,
    link: [slug,
      topic,
      chapter.chapter.slice(3) // Removes first two digits e.g '01_geraden' -> 'geraden'
    ].join("/"),
    status,
  });
}

function toOverviewModel(
  course: CoursePlan,
  groupCourses: CoursePlan[],
  groupsAndSubjects: GroupsAndSubjects,
): OverviewModel {
  const {
    group,
    subject,
    slug,
    chapters,
    topics,
    current_worksheets,
    current_chapter,
  } = course;

  let currentChapterLabel: string = '';

  const subjectEntry = groupsAndSubjects.subjects[subject];
  if (!subjectEntry) {
    throw new Error(
      `Subject '${subject}' used in course '${group}/${slug}' is not defined in groupsAndSubjects.yml`,
    );
  }

  const coursesWithSameSubject = (groupCourses.length ? groupCourses : [course]).filter(
    (c) => c.subject === subject,
  );
  const variantEntry = course.course_variant ? groupsAndSubjects.variants[course.course_variant] : undefined;

  if (coursesWithSameSubject.length > 1 && !variantEntry) {
    throw new Error(
      `Variant '${course.course_variant}' used in course '${group}/${slug}' is not defined in groupsAndSubjects.yml`,
    );
  }

  const label =
    coursesWithSameSubject.length === 1
      ? subjectEntry.name
      : `${subjectEntry.name} (${variantEntry!.short})`;

  const title = `${subjectEntry.name} ${group.toUpperCase()}`;

  let currentTopicIndex = 0;

  if (current_chapter !== null) {
    const currentChapterEntry = chapters.find(
      (c) => c.chapter === current_chapter,
    );

    if (currentChapterEntry) {
      const topicForCurrentChapter = currentChapterEntry.topic;
      const topicIndex = topics.findIndex(
        (t) => t.topic === topicForCurrentChapter,
      );

      if (topicIndex !== -1) {
        currentTopicIndex = topicIndex;
      }
    }
  }

  const roadmap: RoadmapTopic[] = topics.map((topic, topicIndex) => {
    const setChapterStatus = makeChapterStatusFactory(
      slug,
      topic.topic,
    );

    const topicBase = {
      label: topic.label,
      link: [slug, topic.topic].join("/"),
    };

    const currentChapters = chapters.filter(
      (c) => c.topic === topic.topic,
    );

    const relativeIndex = topicIndex - currentTopicIndex;

    // 1) Finished topics
    if (relativeIndex < 0) {
      return {
        ...topicBase,
        status: "finished",
        chapters: currentChapters.map((chapter) =>
          setChapterStatus(chapter, "finished"),
        ),
      };
    }

    // 2) Current topic
    if (relativeIndex === 0) {
      const currentChapterIndex = currentChapters.findIndex(
        (c) => c.chapter === current_chapter,
      );

      const chaptersForRoadmap: RoadmapChapter[] = currentChapters.map(
        (chapter, chapterIndex): RoadmapChapter => {

          if (currentChapterIndex >= 0) {
            if (chapterIndex < currentChapterIndex) {
              return setChapterStatus(chapter, "finished");
            }

            if (chapterIndex === currentChapterIndex) {
              currentChapterLabel = chapter.label;
              return setChapterStatus(chapter, "current");
            }
          }

          return setChapterStatus(chapter, "planned");
        },
      );

      return {
        ...topicBase,
        status: "current",
        chapters: chaptersForRoadmap,
      };
    }

    // 3) Next topic: preview first two chapters
    if (relativeIndex === 1) {
      const preview = currentChapters.slice(0, 2);

      return {
        ...topicBase,
        status: "planned",
        chapters: preview.map((chapter) =>
          setChapterStatus(chapter, "planned"),
        ),
      };
    }

    // 4) All later topics are locked
    return {
      label: topic.label,
      status: "locked",
      chapters: [],
    };
  });

  return {
    title,
    label,
    group,
    subject,
    current: currentChapterLabel,
    roadmap,
    worksheets: current_worksheets,
  };
}
