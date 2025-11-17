import type { CoursePlan } from "./course-plan"

export type Status = "finished" | "current" | "planned" | "locked";

export type RoadmapChapter = {
  label: string;
  status: Status;
};

export type RoadmapTopic = {
  topic: string;
  status: Status;
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