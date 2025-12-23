import type { CourseId } from "./course";

export type Status = "finished" | "current" | "planned" | "locked";

export type RoadmapChapter = {
  label: string;
  link: string;
  status: Status;
};

export type RoadmapTopic = {
  label: string;
  status: Status;
  link?: string;
  chapters: RoadmapChapter[];
};

export type CourseOverviewWorksheet = {
  id: string;
  title: string;
  slug: string;
  isVisible?: boolean;
};

export type CourseOverviewChapter = {
  id: string;
  title: string;
  slug: string;
  worksheets: CourseOverviewWorksheet[];
};

export type CourseOverviewTopic = {
  id: string;
  title: string;
  slug: string;
  chapters: CourseOverviewChapter[];
};

export type CourseOverview = {
  courseId: CourseId;
  groupId: string;
  slug: string;
  title: string;
  description?: string;
  topics: CourseOverviewTopic[];
};

export type RoadmapWorksheetViewModel = {
  id: string;
  title: string;
  slug: string;
  link: string;
  isCompleted: boolean;
  isCurrent: boolean;
};

export type RoadmapChapterViewModel = {
  id: string;
  title: string;
  slug: string;
  label: string;
  link: string;
  status: Status;
  worksheets: RoadmapWorksheetViewModel[];
  isExpanded?: boolean;
};

export type RoadmapTopicViewModel = {
  id: string;
  title: string;
  slug: string;
  label: string;
  link: string;
  status: Status;
  chapters: RoadmapChapterViewModel[];
  isExpanded?: boolean;
};

export type RoadmapViewModel = RoadmapTopicViewModel[];
