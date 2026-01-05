import type { CourseId } from "@/schema/course";

export type PracticeTask = {
  id: string;
  title: string;
  prompt: string;
};

export type PracticeUnlockState = {
  isUnlocked: boolean;
  isDeemphasized?: boolean;
};

const STUB_TASKS: PracticeTask[] = [
  {
    id: "recall",
    title: "Quick recall",
    prompt: "List two key concepts from the last chapter.",
  },
  {
    id: "apply",
    title: "Apply",
    prompt: "Solve a short problem using the new topic.",
  },
];

export function getPracticeTasks(courseId: CourseId): PracticeTask[] {
  void courseId;
  return STUB_TASKS;
}

export function getPracticeUnlockState(courseId: CourseId): PracticeUnlockState {
  void courseId;
  return { isUnlocked: true, isDeemphasized: false };
}
