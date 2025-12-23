import type { MockCredentials, User } from "@/schema/auth";
import type { CourseId } from "@/schema/course";

export type MockCredentialRecord = MockCredentials & {
  userId: string;
};

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

export const MOCK_CREDENTIALS: MockCredentialRecord[] = [
  {
    accessCode: "p",
    pin: "p",
    userId: "student-1",
  },
  {
    accessCode: "t",
    pin: "t",
    userId: "admin-1",
  },
];
