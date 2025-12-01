import type { CoursePlan } from "@schema/coursePlan";
import type { GroupsAndSubjects } from "@schema/groupsAndSubjects";
import path from "node:path";
import { renderOverview } from "@builder/template/overview.mdx";
import type { OverviewModel, RoadmapChapter, RoadmapTopic, Status } from "@schema/overview";
import { computeCourseProgress, TopicProgress } from "../computeCourseProgress";

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

function toOverviewModel(
  course: CoursePlan,
  allCourses: CoursePlan[],
  groupsAndSubjects: GroupsAndSubjects,
): OverviewModel {
  const { group, subject, slug, current_worksheets, course_variant } = course;

  const hasMultipleSameSubject = allCourses.some(
    c => c.group === group && c.subject === subject && c.slug !== slug
  );

  const subjectEntry = groupsAndSubjects.subjects[subject]!;

  const label = hasMultipleSameSubject && course_variant
    ? `${subjectEntry.name} (${groupsAndSubjects.variants[course_variant]!.short})`
    : subjectEntry.name;

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
  topic: TopicProgress,
  group: string,
  slug: string,
): RoadmapTopic {
  const topicLink = ["", group, slug, topic.topic].join("/");
  const chapters: RoadmapChapter[] = topic.chapters.map((chapter) => {
    return {
      label: chapter.label,
      // chapter files are named 00_geraden, index must be removed for link
      link: [topicLink, chapter.chapter.slice(3)].join("/"),
      status: chapter.status,
    }
  });

  return {
    label: topic.label,
    status: topic.status,
    link: topicLink,
    chapters
  };
}
