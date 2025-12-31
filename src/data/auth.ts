import type { User } from "@/schema/auth";
import type { MockCredentialRecord } from "@/mocks/auth";
import { MOCK_CREDENTIALS, MOCK_USERS } from "@/mocks/auth";

export function getMockUsers(): User[] {
  return Object.values(MOCK_USERS);
}

export function getMockUserById(userId: string): User | null {
  return MOCK_USERS[userId] ?? null;
}

export function getMockCredentials(): MockCredentialRecord {
  return MOCK_CREDENTIALS;
}

export function resolveUserFromCredentials(accessCode: string, pin: string): User | null {
  const match = Object.entries(MOCK_CREDENTIALS).find(
    ([, entry]) => entry.accessCode === accessCode && entry.pin === pin
  );
  if (!match) return null;
  const [userId] = match;
  return getMockUserById(userId);
}
