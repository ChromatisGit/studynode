import "server-only";

import { db } from ".";
import { userCourses, users } from "@db/schema";
import { eq, sql } from "drizzle-orm";
import { User } from "@schema/userTypes";


export type StoredUser = {
  user: User;
  credentials: {
    accessCode: string;
    pinHash: string;
  };
};

export async function getUserById(userId: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const row = rows[0];
  if (!row) return null;

  if (row.role === "admin") {
    return { id: row.id, role: "admin" };
  }

  if (!row.groupKey) return null;

  const courseRows = await db
    .select({ courseId: userCourses.courseId })
    .from(userCourses)
    .where(eq(userCourses.userId, row.id));

  return {
    id: row.id,
    role: "user",
    groupKey: row.groupKey,
    courseIds: courseRows.map((course) => course.courseId),
  };
}

export async function getUserByAccessCode(accessCode: string): Promise<StoredUser | null> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.accessCode, accessCode))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  if (row.role === "admin") {
    return {
      user: { id: row.id, role: "admin" },
      credentials: {
        accessCode: row.accessCode,
        pinHash: row.pinHash,
      },
    };
  }

  if (!row.groupKey) return null;

  const courseRows = await db
    .select({ courseId: userCourses.courseId })
    .from(userCourses)
    .where(eq(userCourses.userId, row.id));

  return {
    user: {
      id: row.id,
      role: "user",
      groupKey: row.groupKey,
      courseIds: courseRows.map((course) => course.courseId),
    },
    credentials: {
      accessCode: row.accessCode,
      pinHash: row.pinHash,
    },
  };
}

export type InsertUserInput = {
  user: User;
  accessCode: string;
  pinHash: string;
};

/**
 * Create user in a transaction, including user_courses for DefaultUser.
 */
export async function insertUser(input: InsertUserInput): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: input.user.id,
      role: input.user.role,
      groupKey: input.user.role === "user" ? input.user.groupKey : null,
      accessCode: input.accessCode,
      pinHash: input.pinHash,
    });

    if (input.user.role === "user" && input.user.courseIds.length > 0) {
      await tx.insert(userCourses).values(
        input.user.courseIds.map((courseId) => ({
          userId: input.user.id,
          courseId,
        }))
      );
    }
  });
}

export async function addCourseToUser(userId: string, courseId: string): Promise<void> {
  await db
    .insert(userCourses)
    .values({ userId, courseId })
    .onConflictDoNothing();
}

export async function getUserAccessCode(userId: string): Promise<string | null> {
  const rows = await db
    .select({ accessCode: users.accessCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return rows[0]?.accessCode ?? null;
}

export async function getUserCount(): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "user"));
  return Number(rows[0]?.count ?? 0);
}
