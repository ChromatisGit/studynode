import type { WorksheetFormat } from "@domain/courseContent";

type ChapterId = string;
type CourseId = string;
type SubjectKey = string;
type GroupKey = string;
type TopicId = string;
type WorksheetId = string;

export type CourseOverviewWorksheet = {
  id: WorksheetId;
  title: string;
  worksheetFormat: WorksheetFormat;
};

export type CourseOverviewChapter = {
  id: ChapterId;
  title: string;
  worksheets: CourseOverviewWorksheet[];
};

export type CourseOverviewTopic = {
  id: TopicId;
  title: string;
  chapters: CourseOverviewChapter[];
};

export type CourseOverview = {
  courseId: CourseId;
  groupKey: GroupKey;
  subjectKey: SubjectKey;
  slug: string;
  title: string;
  topics: CourseOverviewTopic[];
};
