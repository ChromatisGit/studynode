import type { ReactNode } from "react";

import { Layout } from "@components/Layout/Layout";
import { getSession } from "@/server/auth/auth";
import { getCourseId } from "@/server/data/courses";
import { getCourseDTO } from "@/server/data/getCourseDTO";
import { getSidebarDTO } from "@/server/data/getSidebarDTO";
import { isAdmin } from "@/domain/userTypes";

type AppLayoutProps = {
  children: ReactNode;
  params?: Record<string, string | string[] | undefined>;
};

function getParam(value?: string | string[]) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function AppLayout({ children, params }: AppLayoutProps) {
  const session = await getSession();
  const user = session?.user ?? null;
  const isUserAdmin = user ? isAdmin(user) : false;

  const groupKey = getParam(params?.groupKey ?? params?.group);
  const subjectKey = getParam(params?.subjectKey ?? params?.course);
  const courseId = groupKey && subjectKey ? getCourseId(groupKey, subjectKey) : null;
  const activeCourseLabel = courseId ? getCourseDTO(courseId).label : null;

  const sidebarData = await getSidebarDTO({ courseId, user });

  return (
    <Layout
      sidebarData={sidebarData}
      isAdmin={isUserAdmin}
      activeCourseLabel={activeCourseLabel}
    >
      {children}
    </Layout>
  );
}
