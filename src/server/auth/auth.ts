import "server-only";

import type { Session } from "@/domain/session";
import { User, MockCredentials, isAdmin } from "@/domain/userTypes";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { coursePublic } from "../data/courses";


export type MockCredentialRecord = Record<User["id"], MockCredentials>;

const SESSION_COOKIE_NAME = "sn-session";

export const MOCK_USERS: Record<string, User> = {
  "s1234": {
    id: "s1234",
    role: "user",
    groupKey: "tg1",
    courseIds: ["tg1-info-tgtm"],
  },
  "a0001": {
    id: "a0001",
    role: "admin",
  },
};

export const MOCK_CREDENTIALS: MockCredentialRecord = {
  "s1234": {
    accessCode: "p",
    pin: "p",
  },
  "a0001": {
    accessCode: "t",
    pin: "t",
  },
};

export type { Session } from "@/domain/session";

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!userId) return null;
  const user = MOCK_USERS[userId];
  if (!user) return null;
  return { user };
}

export function assertLoggedIn(
  session: Session | null
): asserts session is Session {
  if (!session) {
    notFound();
  }
}

export function assertCanAccessPage(session: Session | null, groupKey: string, courseId?: string): void {
  assertLoggedIn(session);
  if (!canUserAccessPage(session.user, groupKey, courseId)) {
    notFound();
  }
}

export function canUserAccessPage(user: User, groupKey: string, courseId?: string): boolean {
  if (isAdmin(user)) return true;

  if (courseId && coursePublic(courseId)) return true;

  if (user.groupKey !== groupKey) return false;

  if (courseId && !user.courseIds.includes(courseId)) return false;

  return true;
}
