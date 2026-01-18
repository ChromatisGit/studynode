import { getSession } from "@server-lib/auth";
import { getCoursesByAccess } from "@services/courseService";
import { getCourseDTO } from "@services/getCourseDTO";
import { AdminDashboard } from "@features/admin/AdminDashboard";
import { getUserCount } from "@services/userService";

export default async function AdminDashboardPage() {
  const session = await getSession();
  // Layout already checks for admin auth, so we know session!.user exists and is admin
  const user = session!.user;

  const courseAccess = getCoursesByAccess(user);
  const allCourseIds = [
    ...courseAccess.accessible,
    ...courseAccess.public,
    ...courseAccess.restricted,
    ...courseAccess.hidden,
  ];

  const courses = allCourseIds.map((id) => getCourseDTO(id));

  // Count total users
  const totalUsers = await getUserCount();

  return (
    <AdminDashboard
      courses={courses}
      totalUsers={totalUsers}
    />
  );
}

