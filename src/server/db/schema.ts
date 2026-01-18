import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  integer,
  primaryKey,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Enums
 */
export const userRole = pgEnum("user_role", ["admin", "user"]);

export const auditAction = pgEnum("audit_action", [
  "openRegistration",
  "createUser",
  "addCourseToUser",
]);

export const authBucketType = pgEnum("auth_bucket_type", [
  "ip",
  "access_code_ip",
]);

/**
 * courses
 */
export const courses = pgTable(
  "courses",
  {
    courseId: text("course_id").primaryKey(),

    currentTopicId: text("current_topic_id").notNull(),
    currentChapterId: text("current_chapter_id").notNull(),

    registrationOpenUntil: timestamp("registration_open_until", {
      withTimezone: true,
      mode: "date",
    }),
  }
);

/**
 * users
 */
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),

    role: userRole("role").notNull(),

    // Required for "user", must be null for "admin"
    groupKey: text("group_key"),

    accessCode: text("access_code").notNull(),
    pinHash: text("pin_hash").notNull(),
  },
  (t) => [
    uniqueIndex("users_access_code_unique").on(t.accessCode),

    check(
      "users_role_group_key_check",
      sql`(
        (${t.role} = 'admin' AND ${t.groupKey} IS NULL)
        OR
        (${t.role} = 'user' AND ${t.groupKey} IS NOT NULL)
      )`
    ),
  ]
);

/**
 * user_courses
 */
export const userCourses = pgTable(
  "user_courses",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    courseId: text("course_id")
      .notNull()
      .references(() => courses.courseId, { onDelete: "restrict" }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.courseId] }),
    index("user_courses_user_id_idx").on(t.userId),
    index("user_courses_course_id_idx").on(t.courseId),
  ]
);

/**
 * audit_log
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),

    ip: text("ip"),

    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    action: auditAction("action").notNull(),

    courseId: text("course_id").references(() => courses.courseId, {
      onDelete: "set null",
    })
  },
  (t) => [
    index("audit_log_created_at_idx").on(t.createdAt),
    index("audit_log_action_idx").on(t.action),
  ]
);

/**
 * auth_attempts
 */
export const authAttempts = pgTable(
  "auth_attempts",
  {
    bucketType: authBucketType("bucket_type").notNull(),
    ip: text("ip").notNull(),

    accessCode: text("access_code").notNull().default(""),

    windowStart: timestamp("window_start", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),

    lastAttemptAt: timestamp("last_attempt_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),

    attemptCount: integer("attempt_count").notNull().default(0),

    lockedUntil: timestamp("locked_until", {
      withTimezone: true,
      mode: "date",
    }),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Composite primary key = bucket identity
    primaryKey({ columns: [t.bucketType, t.ip, t.accessCode] }),

    index("auth_attempts_ip_idx").on(t.ip),
    index("auth_attempts_updated_at_idx").on(t.lockedUntil),
  ]
);

