import "server-only";

import type { SidebarCourseDTO } from "@/domain/sidebarDTO";
import { isAdmin, type User } from "@/domain/userTypes";
import type { CourseId } from "./courses";
import { getCoursesByAccess } from "./courses";
import { getCourseDTO } from "./getCourseDTO";

export function getNavbarCourses(
  user: User,
  activeCourseId?: CourseId | null
): SidebarCourseDTO[] {
  if (isAdmin(user)) {
    return [];
  }

  const { accessible } = getCoursesByAccess(user);

  return accessible
    .filter((id) => !activeCourseId || id !== activeCourseId)
    .map((id) => {
      const { label, slug } = getCourseDTO(id);
      return { id, label, href: slug };
    });
}
export type NavbarCourses = SidebarCourseDTO[];

