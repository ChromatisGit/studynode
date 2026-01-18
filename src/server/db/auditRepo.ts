import "server-only";
import { auditLog } from "@db/schema";
import { db } from ".";

export type AuditAction = "openRegistration" | "createUser" | "addCourseToUser";

export type AuditEntry = {
  ip: string;
  userId: string | null;
  action: AuditAction;
  courseId?: string | null;
};

export async function insertAuditLog(entry: AuditEntry): Promise<void> {
  await db.insert(auditLog).values({
    ip: entry.ip,
    userId: entry.userId,
    action: entry.action,
    courseId: entry.courseId ?? null,
  });
}
