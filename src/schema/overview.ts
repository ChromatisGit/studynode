import type { CoursePlan } from "./course-plan"

export type ChapterStatus = "finished" | "current" | "planned";

export type RoadmapChapter = {
  label: string;
  status: ChapterStatus;
};

export type RoadmapTopic = {
  topic: string;
  status: ChapterStatus;
  chapters: RoadmapChapter[];
};

export type OverviewModel = {
  title: string;
  label: string;
  group: string;
  subject: CoursePlan["subject"];
  current: string | null;
  roadmap: RoadmapTopic[];
  worksheets: CoursePlan["current_worksheets"];
};