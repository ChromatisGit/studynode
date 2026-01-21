import "server-only";

import type { User } from "@schema/userTypes";
import type { StoredUser, InsertUserInput } from "./types";

// NODE_ENV check allows bundler to dead-code eliminate the unused branch
const impl =
  process.env.NODE_ENV === "production"
    ? await import("../db/userRepo")
    : await import("../dev/userRepo");

export async function getUserById(userId: string): Promise<User | null> {
  return impl.getUserById(userId);
}

export async function getUserByAccessCode(
  accessCode: string
): Promise<StoredUser | null> {
  return impl.getUserByAccessCode(accessCode);
}

export async function insertUser(input: InsertUserInput): Promise<void> {
  return impl.insertUser(input);
}

export async function addCourseToUser(
  userId: string,
  courseId: string
): Promise<void> {
  return impl.addCourseToUser(userId, courseId);
}

export async function getUserAccessCode(
  userId: string
): Promise<string | null> {
  return impl.getUserAccessCode(userId);
}

export async function getUserCount(): Promise<number> {
  return impl.getUserCount();
}

export type { StoredUser, InsertUserInput } from "./types";
