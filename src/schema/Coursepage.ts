import type { RoadmapViewModel } from "./overview";
import type { WorksheetRef } from "@worksheet/worksheetModel";

export type CoursepageModel = {
  title: string;
  label: string;
  slug?: string;
  group?: string;
  current?: string;
  worksheets?: WorksheetRef[];
  roadmap?: RoadmapViewModel;
};
