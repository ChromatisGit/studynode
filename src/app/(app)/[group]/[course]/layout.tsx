import type { ReactNode } from "react";

// Force dynamic rendering - layouts with session/auth must not be cached
export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Layout } from "@ui/layout/Layout";
import { CourseProviders } from "./CourseProviders";
import { getSession, isAdmin, canUserAccessPage } from "@services/authService";
import { getCourseId, getCourseDTO, getSidebarDTO, coursePublic } from "@services/courseService";
import { signOutAction } from "@actions/accessActions";

type CourseLayoutProps = {
  children: ReactNode;
  params: Promise<{
    group: string;
    course: string;
  }>;
};

export default async function CourseLayout({ children, params }: CourseLayoutProps) {
  const session = await getSession();
  const user = session?.user ?? null;

  const { group: groupKey, course: subjectKey } = await params;

  // Read the full path from the header injected by middleware so we can
  // send users back to their exact page after login.
  const pathname = (await headers()).get("x-pathname") ?? `/${groupKey}/${subjectKey}`;
  const from = encodeURIComponent(pathname);

  // Check authentication before touching the DB for course existence.
  // This means unauthenticated users are redirected to login regardless of
  // whether the course path actually exists — preventing path enumeration.
  if (!session) {
    redirect(`/access?from=${from}`);
  }

  // User is logged in — now it's safe to 404 on missing courses.
  const courseId = await getCourseId(groupKey, subjectKey);

  const [courseDTO, sidebarData, isPublic] = await Promise.all([
    getCourseDTO(courseId),
    getSidebarDTO({ courseId, user }),
    coursePublic(courseId),
  ]);

  if (!isPublic && !canUserAccessPage(user, groupKey, isPublic, courseId)) {
    // Logged in but wrong group / not enrolled — send back to login so they
    // can switch accounts (or an admin can share the course-join link).
    redirect(`/access?from=${from}`);
  }

  return (
    <Layout
      sidebarData={sidebarData}
      isAdmin={isAdmin(user)}
      activeCourseLabel={courseDTO.label}
      signOutAction={signOutAction}
    >
      <CourseProviders>{children}</CourseProviders>
    </Layout>
  );
}
