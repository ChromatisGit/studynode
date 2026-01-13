import "server-only";

import type { SidebarDTO } from "@/domain/sidebarDTO";
import { isAdmin, type User } from "@/domain/userTypes";
import type { CourseId } from "./courses";
import { getNavbarCourses } from "./getNavbarCourses";
import { getProgressDTO } from "./getProgressDTO";

const EMPTY_PROGRESS = { topics: [] };

export async function getSidebarDTO({
  courseId,
  user,
}: {
  courseId?: CourseId | null;
  user: User | null;
}): Promise<SidebarDTO> {
  const isAuthenticated = Boolean(user);
  const primaryGroupKey = user && !isAdmin(user) ? user.groupKey : undefined;

  const courses = user && !isAdmin(user) ? getNavbarCourses(user, courseId ?? null) : [];
  const progress = courseId ? await getProgressDTO(courseId) : EMPTY_PROGRESS;

  return {
    ...progress,
    courses,
    isAuthenticated,
    primaryGroupKey,
  };
}
