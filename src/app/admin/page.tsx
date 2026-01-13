import { getSession } from "@/server/auth/auth";
import { MOCK_USERS } from "@/server/auth/auth";
import { getCoursesByAccess } from "@/server/data/courses";
import { getCourseDTO } from "@/server/data/getCourseDTO";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getSession();
  // Layout already checks for admin auth, so we know session!.user exists and is admin
  const user = session!.user;

  const courseAccess = getCoursesByAccess(user);
  const allCourseIds = [
    ...courseAccess.accessible,
    ...courseAccess.restricted,
    ...courseAccess.hidden,
  ];

  const courses = allCourseIds.map((id) => getCourseDTO(id));

  // Count total users (excluding admins)
  const totalUsers = Object.values(MOCK_USERS).filter(
    (u) => u.role === "user",
  ).length;

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Admin Dashboard</h1>
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        Manage courses, progress, and student access
      </p>

      {/* Stats cards */}
      <div
        style={{
          display: "grid",
          gap: "1.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem" }}>Total Courses</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
            {allCourseIds.length}
          </p>
        </div>

        <div
          style={{
            padding: "1.5rem",
            border: "1.3px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem" }}>Total Students</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
            {totalUsers}
          </p>
        </div>

        <div
          style={{
            padding: "1.5rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem" }}>Accessible Courses</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
            {courseAccess.accessible.length}
          </p>
        </div>
      </div>

      {/* All courses directly on the dashboard */}
      <div style={{ marginTop: "3rem" }}>
        <h2>Courses</h2>
        <p style={{ marginBottom: "1rem", color: "#666" }}>
          Control chapter progress and registration for each course.
        </p>

        <div style={{ display: "grid", gap: "1rem" }}>
          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                padding: "1.5rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>{course.label}</h3>
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                    fontSize: "0.9rem",
                    maxWidth: "40rem",
                  }}
                >
                  {course.description}
                </p>
                {course.tags?.length ? (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: "0.25rem 0.5rem",
                          background: "#f0f0f0",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <Link
                href={`/admin/${course.id}`}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#007bff",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "6px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Manage →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
