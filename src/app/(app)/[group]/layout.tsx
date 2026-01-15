import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/auth";
import { canUserAccessPage } from "@/server/auth/auth";
import { getCourseId } from "@/server/data/courses";
import { TsWorkerProvider } from "@features/contentpage";

type GroupLayoutProps = {
  children: ReactNode;
  params: Promise<{
    group: string;
    course?: string;
  }>;
};

export default async function GroupLayout({ children, params }: GroupLayoutProps) {
  const { group: groupKey, course: subjectKey } = await params;
  const session = await getSession();

  // Not logged in - redirect to homepage
  if (!session) {
    redirect("/");
  }

  // Check if accessing a course
  if (subjectKey) {
    const courseId = getCourseId(groupKey, subjectKey);

    // Check if user can access this specific course
    if (!canUserAccessPage(session.user, groupKey, courseId)) {
      // Redirect to access page with course join parameters
      redirect(`/access?groupKey=${groupKey}&subjectKey=${subjectKey}`);
    }
  } else {
    // Just accessing group level - check group access
    if (!canUserAccessPage(session.user, groupKey)) {
      // No access to group - redirect to homepage
      redirect("/");
    }
  }

  return <TsWorkerProvider>{children}</TsWorkerProvider>;
}
