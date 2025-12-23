import type { User } from "@/schema/auth";
import type { Course, CourseId } from "@/schema/course";
import type { CourseAccessState } from "@/schema/access";
import { canSeeCourse, isAdmin } from "@/schema/auth";
import COURSES_JSON from "@/generated-configs/courses.config.json";

type RawCourse = Omit<Course, "id"> & { id?: string };

const COURSES: Course[] = (COURSES_JSON as RawCourse[]).map((course) => ({
  ...course,
  id: buildCourseId(course.group, course.slug),
}));

export type CourseAccessGroups = {
  accessible: Course[];
  restricted: Course[];
};

export type CourseGroupId = "your-courses" | "request-access";

export type HomepageCourseGroup = {
  id: CourseGroupId;
  courses: Course[];
};

export function buildCourseId(group: string, slug: string): CourseId {
  return `${group}/${slug}` as CourseId;
}

export function parseCourseId(courseId: CourseId): { groupId: string; slug: string } {
  const [groupId, slug] = courseId.split("/");
  return {
    groupId: groupId ?? "",
    slug: slug ?? "",
  };
}

export function getAllCourses(): Course[] {
  return COURSES;
}

export function getListedCourses(): Course[] {
  return COURSES.filter((course) => course.isListed);
}

export function getCourseById(courseId: CourseId): Course | null {
  return COURSES.find((course) => course.id === courseId) ?? null;
}

export function getCourseBySlug(group: string, slug: string): Course | null {
  return COURSES.find((course) => course.group === group && course.slug === slug) ?? null;
}

export function resolveCourseAccess(course: Course, user: User | null): CourseAccessState {
  if (user && isAdmin(user)) {
    return { courseId: course.id, state: "admin" };
  }

  if (course.isPublic) {
    return { courseId: course.id, state: "public" };
  }

  if (!user) {
    return { courseId: course.id, state: "restricted" };
  }

  if (canSeeCourse(user, course.id)) {
    return { courseId: course.id, state: "enrolled" };
  }

  return { courseId: course.id, state: "restricted" };
}

export function groupCoursesByAccess(user: User | null): CourseAccessGroups {
  return getListedCourses().reduce<CourseAccessGroups>(
    (groups, course) => {
      const access = resolveCourseAccess(course, user);
      if (access.state === "restricted") {
        groups.restricted.push(course);
      } else {
        groups.accessible.push(course);
      }
      return groups;
    },
    { accessible: [], restricted: [] }
  );
}

export function getHomepageCourseGroups(user: User | null): HomepageCourseGroup[] {
  const { accessible, restricted } = groupCoursesByAccess(user);
  const groups: HomepageCourseGroup[] = [];

  if (accessible.length > 0) {
    groups.push({ id: "your-courses", courses: accessible });
  }

  if (restricted.length > 0) {
    groups.push({ id: "request-access", courses: restricted });
  }

  return groups;
}
