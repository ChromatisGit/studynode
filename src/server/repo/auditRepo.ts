import "server-only";

import type { AuditEntry } from "./types";

const impl = await import("../db/auditRepo");

export async function insertAuditLog(entry: AuditEntry): Promise<void> {
  return impl.insertAuditLog(entry);
}

export type { AuditAction, AuditEntry } from "./types";
