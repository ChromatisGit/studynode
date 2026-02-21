import "server-only";

import { notFound } from "next/navigation";
import { anonSQL, userSQL } from "@db/runSQL";
import { isAdmin } from "@services/authService";
import { getUserAccessCodeById } from "@services/userService";
import type { UserDTO } from "@services/userService";
import type { WorksheetRef, WorksheetFormat } from "@schema/courseContent";

export type {
  CourseId,
  CourseDTO,
  ProgressStatus,
  ProgressChapterDTO,
  ProgressTopicDTO,
  ProgressDTO,
  SidebarCourseDTO,
  SidebarDTO,
  CourseAccessGroups,
} from "@schema/courseTypes";

import type {
  CourseId,
  CourseDTO,
  ProgressDTO,
  ProgressTopicDTO,
  SidebarCourseDTO,
  SidebarDTO,
  CourseAccessGroups,
} from "@schema/courseTypes";

// ==========================================================================
// Types (private — raw DB row shapes)
// ==========================================================================

type CourseRow = {
  id: string;
  label: string;
  description: string;
  group_key: string;
  subject_id: string;
  subject_key: string;
  subject_label: string;
  slug: string;
  icon: string | null;
  color: string;
  tags: string[];
  is_public: boolean;
  is_listed: boolean;
};

// ==========================================================================
// Internal helpers
// ==========================================================================

async function fetchCourseRow(courseId: CourseId): Promise<CourseRow> {
  const rows = await anonSQL<CourseRow[]>`
    SELECT * FROM v_course_dto WHERE id = ${courseId} LIMIT 1
  `;
  if (!rows[0]) notFound();
  return rows[0];
}

// ==========================================================================
// Course metadata
// ==========================================================================

export async function getCourseDTO(courseId: string): Promise<CourseDTO> {
  const row = await fetchCourseRow(courseId);
  return {
    id: row.id,
    label: row.label,
    description: row.description,
    groupKey: row.group_key,
    subjectId: row.subject_id,
    subjectKey: row.subject_key,
    slug: row.slug,
    icon: row.icon ?? undefined,
    color: row.color,
    tags: row.tags,
  };
}

export async function getCourseId(groupKey: string, subjectKey: string): Promise<CourseId> {
  const rows = await anonSQL<{ id: string }[]>`
    SELECT id FROM v_course_dto
    WHERE group_key = ${groupKey} AND subject_key = ${subjectKey}
    LIMIT 1
  `;
  if (!rows[0]) notFound();
  return rows[0].id;
}

export async function coursePublic(courseId: CourseId): Promise<boolean> {
  const row = await fetchCourseRow(courseId);
  return row.is_public;
}

export async function courseListed(courseId: CourseId): Promise<boolean> {
  const row = await fetchCourseRow(courseId);
  return row.is_listed;
}

export async function getCourseGroupAndSubjectKey(
  courseId: CourseId,
): Promise<{ groupKey: string; subjectKey: string }> {
  const row = await fetchCourseRow(courseId);
  return { groupKey: row.group_key, subjectKey: row.subject_key };
}

export async function getSubject(
  courseId: CourseId,
): Promise<{ id: string; label: string; key: string }> {
  const row = await fetchCourseRow(courseId);
  return { id: row.subject_id, label: row.subject_label, key: row.subject_key };
}

export async function getWorksheetRefs({
  courseId,
  topicId,
  chapterId,
  user,
}: {
  courseId: string;
  topicId: string;
  chapterId: string;
  user: UserDTO | null;
}): Promise<WorksheetRef[] | null> {
  const run = user ? userSQL(user) : anonSQL;
  const rows = await run<{
    worksheet_id: string;
    label: string;
    href: string;
    worksheet_format: string;
  }[]>`
    SELECT worksheet_id, label, href, worksheet_format
    FROM v_worksheets_by_chapter
    WHERE course_id  = ${courseId}
      AND topic_id   = ${topicId}
      AND chapter_id = ${chapterId}
    ORDER BY display_order
  `;
  if (rows.length === 0) return null;
  return rows.map((r) => ({
    worksheetId: r.worksheet_id,
    label: r.label,
    href: r.href,
    worksheetFormat: r.worksheet_format as WorksheetFormat,
  }));
}

// ==========================================================================
// Course access groups
// ==========================================================================

export async function getCoursesByAccess(user: UserDTO | null): Promise<CourseAccessGroups> {
  const run = user ? userSQL(user) : anonSQL;
  const rows = await run<{ get_course_access_groups: CourseAccessGroups }[]>`
    SELECT get_course_access_groups()
  `;
  return (
    rows[0]?.get_course_access_groups ?? {
      public: [],
      accessible: [],
      restricted: [],
      hidden: [],
    }
  );
}

// ==========================================================================
// Navbar courses
// ==========================================================================

export async function getNavbarCourses(user: UserDTO): Promise<SidebarCourseDTO[]> {
  const rows = await userSQL(user)<{ id: string; label: string; slug: string }[]>`
    SELECT id, label, slug
    FROM v_course_dto
    WHERE is_listed AND NOT is_public AND (
      current_setting('app.user_role', true) = 'admin'
      OR group_key = current_setting('app.group_key', true)
      OR EXISTS (
        SELECT 1 FROM user_courses uc
        WHERE uc.course_id = id
          AND uc.user_id = current_setting('app.user_id', true)
      )
    )
    ORDER BY label
  `;
  return rows.map((r) => ({ id: r.id, label: r.label, href: r.slug }));
}

export async function getPublicNavbarCourses(): Promise<SidebarCourseDTO[]> {
  const rows = await anonSQL<{ id: string; label: string; slug: string }[]>`
    SELECT id, label, slug
    FROM v_course_dto
    WHERE is_listed AND is_public
    ORDER BY label
  `;
  return rows.map((r) => ({ id: r.id, label: r.label, href: r.slug }));
}

// ==========================================================================
// Progress
// ==========================================================================

const EMPTY_PROGRESS: ProgressDTO = { currentTopicId: "", currentChapterId: "", topics: [] };

export async function getProgressDTO(
  courseId: string,
  user: UserDTO | null,
): Promise<ProgressDTO> {
  const run = user ? userSQL(user) : anonSQL;
  const rows = await run<{ get_progress_dto: ProgressDTO | null }[]>`
    SELECT get_progress_dto(${courseId})
  `;
  return rows[0]?.get_progress_dto ?? EMPTY_PROGRESS;
}

export async function getTopicDTO({
  courseId,
  topicId,
  user,
}: {
  courseId: CourseId;
  topicId: string;
  user: UserDTO | null;
}): Promise<ProgressTopicDTO> {
  const progressDTO = await getProgressDTO(courseId, user);
  const topic = progressDTO.topics.find((t) => t.topicId === topicId);

  if (!topic || topic.status === "locked") {
    notFound();
  }

  return topic;
}

// ==========================================================================
// Sidebar
// ==========================================================================

export async function getSidebarDTO({
  courseId,
  user,
}: {
  courseId?: CourseId | null;
  user: UserDTO | null;
}): Promise<SidebarDTO> {
  const isAuthenticated = Boolean(user);
  const primaryGroupKey = user && !isAdmin(user) ? (user.groupKey ?? undefined) : undefined;

  const [courses, progress, accessCode] = await Promise.all([
    user ? getNavbarCourses(user) : getPublicNavbarCourses(),
    courseId ? getProgressDTO(courseId, user) : Promise.resolve(EMPTY_PROGRESS),
    user && !isAdmin(user) ? getUserAccessCodeById(user.id) : Promise.resolve(null),
  ]);

  return {
    ...progress,
    courses,
    isAuthenticated,
    primaryGroupKey,
    accessCode: accessCode ?? undefined,
  };
}

// ==========================================================================
// Course state (registration + progress)
// ==========================================================================

export async function setCourseProgress(
  courseId: CourseId,
  topicId: string,
  chapterId: string,
): Promise<void> {
  // update_course_progress is SECURITY DEFINER — no RLS context needed
  await anonSQL`SELECT update_course_progress(${courseId}, ${topicId}, ${chapterId})`;
}

/**
 * Open registration: now + 15 minutes.
 * DB downtime must fail closed (throw; callers catch).
 */
export async function openRegistration(
  courseId: CourseId,
  userId: string | null,
  ip: string,
): Promise<Date> {
  const openUntil = new Date(Date.now() + 15 * 60 * 1000);
  // set_registration_open_until is SECURITY DEFINER
  await anonSQL`SELECT set_registration_open_until(${courseId}, ${openUntil})`;

  try {
    await anonSQL`
      INSERT INTO log_audit (user_id, event_type, ip_address, user_agent, metadata)
      VALUES (
        ${userId ?? null},
        ${"openRegistration"},
        ${ip ?? null},
        ${null},
        ${JSON.stringify({ courseId })}
      )
    `;
  } catch (e) {
    console.error("[Audit] Failed to log openRegistration:", e);
  }

  return openUntil;
}

export async function closeRegistration(courseId: CourseId): Promise<void> {
  // set_registration_open_until is SECURITY DEFINER
  await anonSQL`SELECT set_registration_open_until(${courseId}, ${null})`;
}

/**
 * Returns ISO string if registration is currently open, null otherwise.
 * Fails closed: DB errors => null.
 */
export async function getRegistrationWindow(courseId: CourseId): Promise<string | null> {
  try {
    const rows = await anonSQL<{ registration_open_until: Date | null }[]>`
      SELECT registration_open_until
      FROM courses
      WHERE course_id = ${courseId}
      LIMIT 1
    `;
    const openUntil = rows[0]?.registration_open_until;
    if (!openUntil) return null;

    if (Date.now() >= new Date(openUntil).getTime()) return null;

    return new Date(openUntil).toISOString();
  } catch (error) {
    console.error("[Course] Failed to get registration window:", error);
    return null;
  }
}

export async function isRegistrationOpen(courseId: CourseId): Promise<boolean> {
  return Boolean(await getRegistrationWindow(courseId));
}
