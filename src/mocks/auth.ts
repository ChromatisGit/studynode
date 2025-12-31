import type { MockCredentials, User } from "@/schema/auth";
import type { CourseId } from "@/schema/course";

export type MockCredentialRecord = Record<User["id"], MockCredentials>;

const DEFAULT_COURSE_IDS: CourseId[] = ["student/info-test"];

export const MOCK_USERS: Record<string, User> = {
  "student-1": {
    id: "student-1",
    role: "user",
    groupId: "student",
    courseIds: DEFAULT_COURSE_IDS,
  },
  "admin-1": {
    id: "admin-1",
    role: "admin",
  },
};

export const MOCK_CREDENTIALS: MockCredentialRecord = {
  "student-1": {
    accessCode: "p",
    pin: "p",
  },
  "admin-1": {
    accessCode: "t",
    pin: "t",
  },
};
