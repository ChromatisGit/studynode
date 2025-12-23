// src/schema/auth.ts
// Schema-level user/auth contracts (UI-agnostic, framework-agnostic)

export type DefaultUser = {
  id: string;
  role: "user";
  groupId: string;        // primary/current group context
  courseIds: string[];    // globally unique course IDs the user can access
};

export type AdminUser = {
  id: string;
  role: "admin";          // admins can access everything by default
};

export type User = DefaultUser | AdminUser;

/**
 * Mock-only credentials.
 * Keep separate from User so you can swap auth later without touching app logic.
 */
export type MockCredentials = {
  accessCode: string;
  pin: string; // later: pinHash + salt (not part of schema if you move to real auth)
};

// -----------------------------
// Type guards / access helpers
// -----------------------------

export function isAdmin(user: User): user is AdminUser {
  return user.role === "admin";
}

/**
 * Course access check.
 * - Admin: always true
 * - Default user: course must be in courseIds
 */
export function canSeeCourse(
  user: User,
  courseId: string
): boolean {
  if (isAdmin(user)) return true;
  return user.courseIds.includes(courseId);
}