import "server-only";

import { authAttempts } from "@db/schema";
import { and, eq, isNull, or } from "drizzle-orm";
import { db } from ".";

export type BucketType = "ip" | "access_code_ip";

export type BucketState = {
  id: string;
  type: BucketType;
  ip: string;
  accessCode: string | null;
  windowStartedAt: Date;
  attemptCount: number;
  lockedUntil: Date | null;
  lastAttemptAt: Date;
};

const EMPTY_ACCESS_CODE = "";

function normalizeAccessCode(accessCode: string | null): string {
  return accessCode ?? EMPTY_ACCESS_CODE;
}

function toBucketState(row: typeof authAttempts.$inferSelect): BucketState {
  const accessCode = row.accessCode === EMPTY_ACCESS_CODE ? null : row.accessCode;
  return {
    id: `${row.bucketType}:${row.ip}:${accessCode ?? ""}`,
    type: row.bucketType,
    ip: row.ip,
    accessCode,
    windowStartedAt: row.windowStart,
    attemptCount: row.attemptCount,
    lockedUntil: row.lockedUntil,
    lastAttemptAt: row.lastAttemptAt,
  };
}

export async function getBucket(type: BucketType, ip: string, accessCode: string | null): Promise<BucketState | null> {
  const accessCodeValue = normalizeAccessCode(accessCode);
  const accessCodePredicate =
    accessCode === null
      ? or(
          eq(authAttempts.accessCode, accessCodeValue),
          isNull(authAttempts.accessCode)
        )
      : eq(authAttempts.accessCode, accessCodeValue);
  const rows = await db
    .select()
    .from(authAttempts)
    .where(
      and(
        eq(authAttempts.bucketType, type),
        eq(authAttempts.ip, ip),
        accessCodePredicate
      )
    )
    .limit(1);
  const row = rows[0];
  return row ? toBucketState(row) : null;
}

export async function upsertBucket(state: Partial<BucketState> & { type: BucketType; ip: string; accessCode: string | null }): Promise<BucketState> {
  const now = new Date();
  const accessCodeValue = normalizeAccessCode(state.accessCode);
  const windowStartedAt = state.windowStartedAt ?? now;
  const lastAttemptAt = state.lastAttemptAt ?? now;
  const attemptCount = state.attemptCount ?? 0;
  const lockedUntil = state.lockedUntil ?? null;

  await db
    .insert(authAttempts)
    .values({
      bucketType: state.type,
      ip: state.ip,
      accessCode: accessCodeValue,
      windowStart: windowStartedAt,
      lastAttemptAt,
      attemptCount,
      lockedUntil,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [
        authAttempts.bucketType,
        authAttempts.ip,
        authAttempts.accessCode,
      ],
      set: {
        windowStart: windowStartedAt,
        lastAttemptAt,
        attemptCount,
        lockedUntil,
        updatedAt: now,
      },
    });

  return {
    id: `${state.type}:${state.ip}:${accessCodeValue}`,
    type: state.type,
    ip: state.ip,
    accessCode: state.accessCode,
    windowStartedAt,
    attemptCount,
    lockedUntil,
    lastAttemptAt,
  };
}

export async function recordAttempt(type: BucketType, ip: string, accessCode: string | null, success: boolean): Promise<void> {
  const now = new Date();
  const existing = await getBucket(type, ip, accessCode);

  const attemptCount = success ? 0 : (existing?.attemptCount ?? 0) + 1;
  const windowStartedAt = success ? now : existing?.windowStartedAt ?? now;
  const lockedUntil = success ? null : existing?.lockedUntil ?? null;

  await upsertBucket({
    type,
    ip,
    accessCode,
    attemptCount,
    windowStartedAt,
    lockedUntil,
    lastAttemptAt: now,
  });
}

export async function setBucketLock(type: BucketType, ip: string, accessCode: string | null, lockedUntil: Date | null): Promise<void> {
  const accessCodeValue = normalizeAccessCode(accessCode);
  const now = new Date();
  await db
    .update(authAttempts)
    .set({ lockedUntil, updatedAt: now })
    .where(
      and(
        eq(authAttempts.bucketType, type),
        eq(authAttempts.ip, ip),
        eq(authAttempts.accessCode, accessCodeValue)
      )
    );
}
