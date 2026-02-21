import { getSubject } from "@services/courseService";
import { getCourseDTO, getProgressDTO } from "@services/courseService";
import { getSession } from "@services/authService";
import { AdminCourseDetail } from "@features/admin/AdminCourseDetail";
import { listSlideDecks } from "@services/slideService";

type PageParams = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function AdminCourseDetailPage({ params }: PageParams) {
  const { courseId } = await params;

  const session = await getSession();
  const user = session?.user ?? null;

  const [course, progress, subject] = await Promise.all([
    getCourseDTO(courseId),
    getProgressDTO(courseId, user),
    getSubject(courseId),
  ]);

  const slideIds = await listSlideDecks({
    subject: subject.id,
    topicId: progress.currentTopicId,
    chapterId: progress.currentChapterId,
  });

  return (
    <AdminCourseDetail
      course={course}
      progress={progress}
      courseId={courseId}
      slideIds={slideIds}
    />
  );
}

