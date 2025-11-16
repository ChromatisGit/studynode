import type { CoursePlan } from "@schema/course-plan"
import path from "node:path";
import { renderOverview } from "../template/overview.mdx";
import type { ChapterStatus, OverviewModel, RoadmapChapter, RoadmapTopic } from "@schema/overview";

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

  const hasCurrent = current_chapter !== null;

  // before current topic: finished
  // at current topic: current (then switch to planned)
  // after current topic: planned
  // if no current topic all topics are planned
  let chapterStatus: ChapterStatus = hasCurrent ? "finished" : "planned";

  const roadmap: RoadmapTopic[] = Object.entries(Object.groupBy(topics, (t) => t.topic)).map(
    ([topic, chapterArray]) => {
      let topicStatus: ChapterStatus = chapterStatus;

      const chapters: RoadmapChapter[] = chapterArray!.map(({ chapter }) => {
        if (hasCurrent && chapter === current_chapter) {
          topicStatus = "current";
          chapterStatus = "planned";
          return { label: chapter, status: "current" };
        }

        return { label: chapter, status: chapterStatus };
      });

      return {
        topic,
        status: topicStatus,
        chapters,
      };
    }
  );

  return {
    title,
    label,
    group,
    subject,
    current: hasCurrent ? current_chapter : null,
    roadmap,
    worksheets: current_worksheets,
  };
}

const subjects = {
  math: 'Mathe',
  info: 'Informatik'
}