import { ensureCourseId, resolveCourse } from "@/server/data/courses";
import { getCourseDTO } from "@/server/data/getCourseDTO";
import { getProgressDTO } from "@/server/data/getProgressDTO";
import { ProgressControl } from "@/features/admin/ProgressControl";

type PageParams = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function AdminCourseDetailPage({ params }: PageParams) {
  const { courseId } = await params;

  const validCourseId = ensureCourseId(courseId);
  const course = getCourseDTO(validCourseId);
  const progress = await getProgressDTO(validCourseId);
  const fullCourse = resolveCourse(validCourseId);

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>

      <h1>{course.label}</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>{course.description}</p>

      <div style={{ display: "grid", gap: "2rem" }}>
        {/* Progress Control Section */}
        <section>
          <h2>Chapter Progress Control</h2>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            Set the current chapter for all students. Students can only see chapters up to the planned chapter.
          </p>
          <ProgressControl
            courseId={validCourseId}
            currentTopicId={progress.currentTopicId}
            currentChapterId={progress.currentChapterId}
            topics={fullCourse.topics}
          />
        </section>

        {/* Registration Window Section */}
        <section>
          <h2>Registration Window</h2>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            Control when students can join this course without an access code.
          </p>
          <div style={{ padding: "1rem", background: "#f8f9fa", borderRadius: "6px" }}>
            <p style={{ margin: 0, fontStyle: "italic", color: "#666" }}>
              Registration window management coming in Phase 3.4
            </p>
          </div>
        </section>

        {/* Enrolled Students Section */}
        <section>
          <h2>Enrolled Students</h2>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            View all students enrolled in this course.
          </p>
          <div style={{ padding: "1rem", background: "#f8f9fa", borderRadius: "6px" }}>
            <p style={{ margin: 0, fontStyle: "italic", color: "#666" }}>
              Student list coming in Phase 3.5
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
