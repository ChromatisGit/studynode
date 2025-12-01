import type { CoursePlan } from "@schema/coursePlan";
import type { GroupsAndSubjects } from "@schema/groupsAndSubjects";
import path from "node:path";
import { renderOverview } from "@builder/template/overview.mdx";
import type { OverviewModel, RoadmapChapter, RoadmapTopic, Status } from "@schema/overview";
import { computeCourseProgress } from "../domain/courseProgress";

export function buildOverview(
  course: CoursePlan,
  groupCourses: CoursePlan[],
  groupsAndSubjects: GroupsAndSubjects,
) {
  const model = toOverviewModel(course, groupCourses, groupsAndSubjects);

  return {
    relativePath: path.join("courses", course.group, course.slug, "index.mdx"),
    content: renderOverview(model),
  };
}

type Chapter = CoursePlan["chapters"][number];

function toOverviewModel(
  course: CoursePlan,
  groupCourses: CoursePlan[],
  groupsAndSubjects: GroupsAndSubjects,
): OverviewModel {
  const { group, subject, slug, current_worksheets } = course;

  const subjectEntry = groupsAndSubjects.subjects[subject]!;

  const effectiveCourses = groupCourses.length ? groupCourses : [course];
  const coursesWithSameSubject = effectiveCourses.filter(
    (c) => c.subject === subject,
  );

  const variantEntry = course.course_variant
    ? groupsAndSubjects.variants[course.course_variant]!
    : undefined;

  const label =
    coursesWithSameSubject.length === 1
      ? subjectEntry.name
      : `${subjectEntry.name} (${variantEntry!.short})`;

  const title = `${subjectEntry.name} ${group.toUpperCase()}`;

  const progress = computeCourseProgress(course);
  const roadmap: RoadmapTopic[] = progress.topics.map((topic) =>
    buildRoadmapTopic(topic, group, slug),
  );

  return {
    title,
    label,
    group,
    subject,
    current: progress.currentChapterLabel,
    roadmap,
    worksheets: current_worksheets,
  };
}

function buildRoadmapTopic(
  topic: ReturnType<typeof computeCourseProgress>["topics"][number],
  group: string,
  slug: string,
): RoadmapTopic {
  const topicLink = ["", group, slug, topic.topic].join("/");
  const mapChapter = (chapter: Chapter, status: Status): RoadmapChapter => ({
    label: chapter.label,
    link: [topicLink, chapter.chapter.slice(3)].join("/"),
    status,
  });

  if (topic.status === "locked") {
    return { label: topic.label, status: "locked", chapters: [] };
  }

  if (topic.status === "planned") {
    const preview = topic.chapters.slice(0, 2);

    return {
      label: topic.label,
      status: "planned",
      link: topicLink,
      chapters: preview.map((chapter) => mapChapter(chapter, "planned")),
    };
  }

  return {
    label: topic.label,
    status: topic.status,
    link: topicLink,
    chapters: topic.chapters.map((chapter) =>
      mapChapter(chapter, chapter.status),
    ),
  };
}
