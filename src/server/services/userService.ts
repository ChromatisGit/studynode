import "server-only";
import { insertAuditLog } from "@repo/auditRepo";
import * as db from "@repo/userRepo";
import { DefaultUser, User } from "@schema/userTypes";
import { hashPin } from "@server-lib//argon2";
import { generateUniqueAccessCode } from "@server-lib//generateAccessCode";

export async function createUser(pin: string, groupKey: string, ip: string): Promise<{user: User, accessCode: string}> {
    const userId = `u${Date.now().toString(36)}`;
    const accessCode = await generateUniqueAccessCode();
    const user: DefaultUser = {
        id: userId,
        role: "user",
        groupKey,
        courseIds: [],
    };

    const hash = await hashPin(pin);

    await db.insertUser({
        user,
        accessCode,
        pinHash: hash,
    });

    try {
        await insertAuditLog({
            ip,
            userId: user.id,
            action: "createUser",
        });
    } catch (e) {
        console.error("[Audit] Failed to log createUser:", e);
    }

    return { user, accessCode };
}


export async function addCourseToUser(userId: string, courseId: string, ip: string): Promise<void> {
    await db.addCourseToUser(userId, courseId);

    try {
        await insertAuditLog({
            ip,
            userId,
            action: "addCourseToUser",
            courseId: courseId,
        });
    } catch (e) {
        console.error("[Audit] Failed to log addCourseToUser:", e);
    }
}

export async function getUserAccessCode(userId: string): Promise<string | null> {
    return await db.getUserAccessCode(userId);
}

export async function accessCodeExists(accessCode: string): Promise<boolean> {
    return Boolean(await db.getUserByAccessCode(accessCode));
}

export async function getUserById(userId: string): Promise<User | null> {
    return await db.getUserById(userId);
}

export async function getUserCount(): Promise<number> {
    return await db.getUserCount();
}
