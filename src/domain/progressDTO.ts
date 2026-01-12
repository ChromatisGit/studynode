export type ProgressStatus = "finished" | "current" | "planned" | "locked";

export type ProgressChapterDTO = {
  chapterId: string;
  label: string;
  href: string;
  status: ProgressStatus;
};

export type ProgressTopicDTO = {
  topicId: string;
  label: string;
  href: string;
  status: ProgressStatus;
  chapters: ProgressChapterDTO[];
};

export type ProgressDTO = {
  currentTopicId?: string;
  currentChapterId?: string;
  topics: ProgressTopicDTO[];
};
