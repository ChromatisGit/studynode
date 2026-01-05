
export type Status = "finished" | "current" | "planned" | "locked";

export type RoadmapChapter = {
  label: string;
  href: string;
  status: Status;
};

export type RoadmapTopic = {
  label: string;
  status: Status;
  href?: string;
  chapters: RoadmapChapter[];
};

export type OverviewModel = {
  title: string;
  label: string;
  group: string;
  subject: string;
  currentChapter: RoadmapChapter;
  roadmap: RoadmapTopic[];
  currentWorksheets: WorksheetRef[];
};

export type WorksheetRef = {
  label: string;
  href: string;
  type: "pdf" | "web";
};
