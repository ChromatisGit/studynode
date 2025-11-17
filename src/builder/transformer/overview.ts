import type { CoursePlan } from "@schema/course-plan"
import path from "node:path";
import { renderOverview } from "../template/overview.mdx";
import type { OverviewModel, RoadmapChapter, RoadmapTopic } from "@schema/overview";

export function buildOverview(course: CoursePlan) {
  const model = toOverviewModel(course);

  return {
    relativePath: path.join("courses", course.group, course.course_variant, "index.mdx"),
    content: renderOverview(model)
  };
}

function toOverviewModel(course: CoursePlan): OverviewModel {
  const { group, subject, label, topics, current_worksheets, current_chapter } =
    course;

  const title = `${subjects[subject]} ${group.toUpperCase()}`;

  const grouped = Object.entries(Object.groupBy(topics, (t) => t.topic))
  .map(([topic, arr]) => ({
    topic,
    chapters: arr!.map((x) => x.chapter),
  }));

  let currentTopicIndex: number = current_chapter === null ? 0 :
    grouped.findIndex((g) => g.chapters.includes(current_chapter));

  if (currentTopicIndex === -1) {
    currentTopicIndex = 0;
  }

  const roadmap: RoadmapTopic[] = grouped.map((g, topicIndex) => {
    if (topicIndex < currentTopicIndex) {
      return {
        topic: g.topic,
        status: "finished",
        chapters: g.chapters.map((label): RoadmapChapter => ({
          label,
          status: "finished",
        })),
      };
    }

    if (topicIndex === currentTopicIndex) {
        return {
          topic: g.topic,
          status: "current",
          chapters: g.chapters.map((label): RoadmapChapter => {
            if (label === current_chapter) {
              return { label, status: "current" };
            }
            // Chapters before current: finished
            if (
              g.chapters.indexOf(label) <
              g.chapters.indexOf(current_chapter!)
            ) {
              return { label, status: "finished" };
            }
            // Chapters after current: planned
            return { label, status: "planned" };
          }),
        };
    }

    // Preview next Chapter
    if (topicIndex === currentTopicIndex + 1) {
      const preview = g.chapters.slice(0, 2);
      return {
        topic: g.topic,
        status: "planned",
        chapters: preview.map((label): RoadmapChapter => ({
          label,
          status: "planned"
        })),
      };
    }

    return {
      topic: g.topic,
      status: "locked",
      chapters: []
    };
  });

  return {
    title,
    label,
    group,
    subject,
    current: current_chapter,
    roadmap,
    worksheets: current_worksheets,
  };
}

const subjects = {
  math: 'Mathe',
  info: 'Informatik'
}