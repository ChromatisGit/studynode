import "server-only";

import type { BucketType, BucketState } from "./types";
const impl = await import("../db/authRepo");

export async function getBucket(
  type: BucketType,
  ip: string,
  accessCode: string | null
): Promise<BucketState | null> {
  return impl.getBucket(type, ip, accessCode);
}

export async function upsertBucket(
  state: Partial<BucketState> & {
    type: BucketType;
    ip: string;
    accessCode: string | null;
  }
): Promise<BucketState> {
  return impl.upsertBucket(state);
}

export async function recordAttempt(
  type: BucketType,
  ip: string,
  accessCode: string | null,
  success: boolean
): Promise<void> {
  return impl.recordAttempt(type, ip, accessCode, success);
}

export async function setBucketLock(
  type: BucketType,
  ip: string,
  accessCode: string | null,
  lockedUntil: Date | null
): Promise<void> {
  return impl.setBucketLock(type, ip, accessCode, lockedUntil);
}

export type { BucketType, BucketState } from "./types";
