import { User } from "@schema/userTypes";
import { getBucket, upsertBucket, type BucketState } from "@repo/authRepo";
import { getUserByAccessCode } from "@repo/userRepo";
import { verifyPin } from "@server-lib//argon2";

/**
 * Rate-limit policy (tune later).
 */
const MAX_PER_CODE_IP = 5;
const MAX_PER_IP = 20;
const WINDOW_MS = 10 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

function isLocked(lockedUntil: Date | null, now: Date): boolean {
    return Boolean(lockedUntil && lockedUntil.getTime() > now.getTime());
}

function normalizeBucket(bucket: BucketState | null, now: Date) {
    if (!bucket) {
        return { attemptCount: 0, windowStartedAt: now, lockedUntil: null };
    }

    const lockExpired = bucket.lockedUntil && bucket.lockedUntil.getTime() <= now.getTime();
    const windowExpired =
        lockExpired || now.getTime() - bucket.windowStartedAt.getTime() >= WINDOW_MS;

    return {
        attemptCount: windowExpired ? 0 : bucket.attemptCount,
        windowStartedAt: windowExpired ? now : bucket.windowStartedAt,
        lockedUntil: lockExpired ? null : bucket.lockedUntil,
    };
}

async function applyAttempt(options: {
    type: "ip" | "access_code_ip";
    ip: string;
    accessCode: string | null;
    bucket: BucketState | null;
    maxAttempts: number;
    now: Date;
    success: boolean;
}): Promise<void> {
    const { type, ip, accessCode, bucket, maxAttempts, now, success } = options;
    const normalized = normalizeBucket(bucket, now);

    const attemptCount = success ? 0 : normalized.attemptCount + 1;
    const windowStartedAt = success ? now : normalized.windowStartedAt;
    const lockedUntil = success
        ? null
        : attemptCount >= maxAttempts
            ? new Date(now.getTime() + LOCK_MS)
            : normalized.lockedUntil;

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

/**
 * DB downtime must fail closed => return null.
 * Errors to client must be generic; return null on any auth error.
 */
export async function getAuthenticatedUser(accessCode: string, pin: string, ip: string): Promise<User | null> {
    const now = new Date();
    const normalizedIp = ip?.trim() || "unknown";

    try {
        const [ipBucket, codeBucket] = await Promise.all([
            getBucket("ip", normalizedIp, null),
            getBucket("access_code_ip", normalizedIp, accessCode),
        ]);

        if (isLocked(ipBucket?.lockedUntil ?? null, now) || isLocked(codeBucket?.lockedUntil ?? null, now)) {
            return null;
        }

        const stored = await getUserByAccessCode(accessCode);
        const ok = stored
            ? await verifyPin(pin, stored.credentials.pinHash)
            : false;

        await Promise.all([
            applyAttempt({
                type: "ip",
                ip: normalizedIp,
                accessCode: null,
                bucket: ipBucket,
                maxAttempts: MAX_PER_IP,
                now,
                success: ok,
            }),
            applyAttempt({
                type: "access_code_ip",
                ip: normalizedIp,
                accessCode,
                bucket: codeBucket,
                maxAttempts: MAX_PER_CODE_IP,
                now,
                success: ok,
            }),
        ]);

        return ok ? stored!.user : null;
    } catch (error) {
        console.error("[Auth] Authentication failed:", error);
        return null;
    }
}
