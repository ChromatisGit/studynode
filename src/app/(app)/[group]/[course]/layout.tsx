import type { ReactNode } from "react";

// Force dynamic rendering - layouts with session/auth must not be cached
export const dynamic = "force-dynamic";

import { Layout } from "@ui/layout/Layout";
import { CourseProviders } from "./CourseProviders";
import { getSession } from "@services/authService";
import { getCourseId } from "@services/courseService";
import { getCourseDTO, getSidebarDTO } from "@services/courseService";
import { isAdmin } from "@services/authService";
import { signOutAction } from "@actions/accessActions";

type CourseLayoutProps = {
  children: ReactNode;
  params: Promise<{
    group: string;
    course: string;
  }>;
};

export default async function CourseLayout({ children, params }: CourseLayoutProps) {
  const t0 = Date.now();

  const session = await getSession();
  console.log(`[perf] getSession: ${Date.now() - t0}ms`);

  const user = session?.user ?? null;
  const isUserAdmin = user ? isAdmin(user) : false;

  const { group: groupKey, course: subjectKey } = await params;

  const t1 = Date.now();
  const courseId = await getCourseId(groupKey, subjectKey);
  console.log(`[perf] getCourseId: ${Date.now() - t1}ms`);

  const t2 = Date.now();
  const [courseDTO, sidebarData] = await Promise.all([
    getCourseDTO(courseId),
    getSidebarDTO({ courseId, user }),
  ]);
  console.log(`[perf] getCourseDTO+getSidebarDTO: ${Date.now() - t2}ms`);
  console.log(`[perf] total CourseLayout: ${Date.now() - t0}ms`);

  const activeCourseLabel = courseDTO.label;

  return (
    <Layout
      sidebarData={sidebarData}
      isAdmin={isUserAdmin}
      activeCourseLabel={activeCourseLabel}
      signOutAction={signOutAction}
    >
      <CourseProviders>{children}</CourseProviders>
    </Layout>
  );
}

