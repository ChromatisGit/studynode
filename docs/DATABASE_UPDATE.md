## Database Architecture Setup Plan

### Guiding principles

1. **PostgreSQL is the source of truth**
   Course structure, access rules, and DTO shapes live in Postgres (tables, RLS, views).

2. **Security lives in the database**
   Use **Row Level Security (RLS)** for user-facing domain tables. Technical tables are protected by function boundaries.

3. **Normalized content with explicit relationships**
   Reusable definitions (`topics`, `chapters`, `worksheets`) + course-specific junction tables for ordering/status/visibility.

4. **DTOs come from SQL views**
   The view schema defines DTO shape; TypeScript types are generated from the schema.

5. **One data access layer**
   No dev/prod repo split. Use a single `queries/` layer with raw SQL.

6. **Atomic multi-step operations are database functions**
   Access-code generation, rate limiting, account creation, progress updates, course rebuild.

7. **Sessions are cookies, not JWT**
   Keep HttpOnly session cookies; request auth sets RLS context.

8. **Connection pooling safe by design**
   RLS context must be **transaction-local** to avoid leaking context across pooled connections.

9. **Plan is idempotent**
   Schema + seed scripts must be safe to run multiple times.

10. **Big refactors are permitted when improving maintainability** 
   The software is still in alpha and not in use: Therefore no data migration is needed and big breaking changes are acceptable

---

## Goals

1. Normalize `.generated/config/courses.json` into database tables with N:N relationships
2. Enable PostgreSQL RLS for isolation and role-based access
3. Implement access-code generation in SQL
4. Implement rate limiting in SQL (serverless-safe)
5. Replace manual DTO mapping with SQL views + generated TS types
6. Keep HttpOnly session cookies (no JWT / refresh tokens)
7. Remove `repo/` facade and `dev/` JSON storage split
8. Define a clean seeding pipeline for course data
9. Keep compatibility with Vercel + NeonDatabase + local Docker
10. Keep a hybrid boundary: DB for data + access + DTO shape, TS for hashing + orchestration
11. Progress status is stored in junction tables; rebuild preserves current progress when possible.

---

## Details

### 1) Target platform

* PostgreSQL 18
* Deployment: Vercel + NeonDatabase
* Local: Docker Postgres for dev/testing

---

### 2) SQL schema

#### 2.1 Core entity tables

```sql
CREATE TABLE groups (
  group_id TEXT PRIMARY KEY,
  group_label TEXT NOT NULL,
  group_key TEXT UNIQUE NOT NULL
);

CREATE TABLE subjects (
  subject_id TEXT PRIMARY KEY,
  subject_label TEXT NOT NULL,
  subject_key TEXT UNIQUE NOT NULL
);

CREATE TABLE course_variants (
  variant_id TEXT PRIMARY KEY,
  variant_label TEXT NOT NULL,
  variant_short TEXT NOT NULL
);

CREATE TABLE courses (
  course_id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(group_id),
  subject_id TEXT NOT NULL REFERENCES subjects(subject_id),
  variant_id TEXT REFERENCES course_variants(variant_id),
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT NOT NULL,
  worksheet_format TEXT NOT NULL CHECK (worksheet_format IN ('web','pdf')),
  is_listed BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT false,
  registration_open_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE topics (
  topic_id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  href_slug TEXT NOT NULL
);

CREATE TABLE chapters (
  chapter_id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  href_slug TEXT NOT NULL
);

CREATE TABLE worksheets (
  worksheet_id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  href_slug TEXT NOT NULL,
  worksheet_format TEXT NOT NULL CHECK (worksheet_format IN ('web','pdf','pdfSolution'))
);
```

Indexes:

```sql
CREATE INDEX idx_courses_group   ON courses(group_id);
CREATE INDEX idx_courses_subject ON courses(subject_id);
CREATE INDEX idx_courses_public  ON courses(is_public) WHERE is_public = true;
CREATE INDEX idx_courses_listed  ON courses(is_listed) WHERE is_listed = true;
```

#### 2.2 Junction tables

```sql
CREATE TABLE course_topics (
  course_id TEXT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  topic_id  TEXT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('current','finished','planned','locked')),
  PRIMARY KEY (course_id, topic_id)
);

CREATE TABLE course_chapters (
  course_id  TEXT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  topic_id   TEXT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES chapters(chapter_id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('current','finished','locked')),
  PRIMARY KEY (course_id, topic_id, chapter_id),
  FOREIGN KEY (course_id, topic_id)
    REFERENCES course_topics(course_id, topic_id) ON DELETE CASCADE
);

CREATE TABLE course_worksheets (
  course_id    TEXT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  topic_id     TEXT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
  chapter_id   TEXT NOT NULL REFERENCES chapters(chapter_id) ON DELETE CASCADE,
  worksheet_id TEXT NOT NULL REFERENCES worksheets(worksheet_id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (course_id, topic_id, chapter_id, worksheet_id),
  FOREIGN KEY (course_id, topic_id, chapter_id)
    REFERENCES course_chapters(course_id, topic_id, chapter_id) ON DELETE CASCADE
);
```

Indexes:

```sql
CREATE INDEX idx_course_topics_order
  ON course_topics(course_id, display_order);

CREATE INDEX idx_course_chapters_order
  ON course_chapters(course_id, topic_id, display_order);

CREATE INDEX idx_course_worksheets_order
  ON course_worksheets(course_id, topic_id, chapter_id, display_order);

CREATE INDEX idx_course_worksheets_visible
  ON course_worksheets(course_id) WHERE is_hidden = false;
```

**Progress invariants:**

```sql
CREATE UNIQUE INDEX ux_course_topics_one_current
ON course_topics(course_id)
WHERE status = 'current';

CREATE UNIQUE INDEX ux_course_chapters_one_current
ON course_chapters(course_id)
WHERE status = 'current';
```

#### 2.3 Existing/auth tables

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin','user')),
  group_key TEXT,
  access_code TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_admin_no_group
    CHECK (
      (role = 'admin' AND group_key IS NULL)
      OR
      (role = 'user'  AND group_key IS NOT NULL)
    )
);

CREATE TABLE user_courses (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE auth_attempts (
  bucket_key TEXT PRIMARY KEY,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_until TIMESTAMPTZ,
);

CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Indexes:

```sql
CREATE INDEX idx_users_access_code ON users(access_code);
CREATE INDEX idx_users_group_key   ON users(group_key);

CREATE INDEX idx_user_courses_user ON user_courses(user_id);

CREATE INDEX idx_auth_attempts_locked
  ON auth_attempts(locked_until) WHERE locked_until IS NOT NULL;

CREATE INDEX idx_audit_log_user      ON audit_log(user_id);
CREATE INDEX idx_audit_log_event     ON audit_log(event_type);
CREATE INDEX idx_audit_log_timestamp ON audit_log(created_at);
```

---

### 3) RLS

#### 3.1 Enable RLS (domain tables only)

Enable RLS on tables that contain user-visible domain data. Do **not** enable RLS on technical tables used by unauth flows/logging.

```sql
ALTER TABLE groups            ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_variants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses           ENABLE ROW LEVEL SECURITY;

ALTER TABLE topics            ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters          ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheets        ENABLE ROW LEVEL SECURITY;

ALTER TABLE course_topics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_chapters   ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_worksheets ENABLE ROW LEVEL SECURITY;

ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses      ENABLE ROW LEVEL SECURITY;

-- No RLS on:
-- auth_attempts
-- audit_log
```

#### 3.2 Transaction-local session variables (pooling safe)

Use transaction-local settings (`true`) and run per-request DB work inside a transaction.

```sql
SELECT set_config('app.user_id',   '...', true);
SELECT set_config('app.user_role', '...', true);
SELECT set_config('app.group_key', '...', true);
```

#### 3.3 Policies (select)

Courses:

```sql
CREATE POLICY courses_admin_all ON courses
FOR SELECT
USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY courses_public ON courses
FOR SELECT
USING (is_public = true);

CREATE POLICY courses_user_enrolled ON courses
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_courses uc
    WHERE uc.course_id = courses.course_id
      AND uc.user_id = current_setting('app.user_id', true)
  )
);
```

Lookup and content tables (public read):

```sql
CREATE POLICY groups_read_all     ON groups           FOR SELECT USING (true);
CREATE POLICY subjects_read_all   ON subjects         FOR SELECT USING (true);
CREATE POLICY variants_read_all   ON course_variants  FOR SELECT USING (true);

CREATE POLICY topics_read_all     ON topics     FOR SELECT USING (true);
CREATE POLICY chapters_read_all   ON chapters   FOR SELECT USING (true);
CREATE POLICY worksheets_read_all ON worksheets FOR SELECT USING (true);
```

Course structure tables inherit via course access:

```sql
CREATE POLICY course_topics_read ON course_topics
FOR SELECT
USING (EXISTS (SELECT 1 FROM courses c WHERE c.course_id = course_topics.course_id));

CREATE POLICY course_chapters_read ON course_chapters
FOR SELECT
USING (EXISTS (SELECT 1 FROM courses c WHERE c.course_id = course_chapters.course_id));

CREATE POLICY course_worksheets_read ON course_worksheets
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM courses c WHERE c.course_id = course_worksheets.course_id)
  AND (
    is_hidden = false
    OR current_setting('app.user_role', true) = 'admin'
  )
);
```

Users:

```sql
CREATE POLICY users_self_read ON users
FOR SELECT
USING (id = current_setting('app.user_id', true));

CREATE POLICY users_admin_read ON users
FOR SELECT
USING (current_setting('app.user_role', true) = 'admin');
```

User course enrollments (needed by RLS + `v_user_dto`):

```sql
CREATE POLICY user_courses_self_read ON user_courses
FOR SELECT
USING (user_id = current_setting('app.user_id', true));

CREATE POLICY user_courses_admin_read ON user_courses
FOR SELECT
USING (current_setting('app.user_role', true) = 'admin');
```

---

### 4) Database functions

> **SECURITY DEFINER**: Write functions (`generate_access_code`, `create_user_account`,
> `update_course_progress`) use `SECURITY DEFINER` so they execute with the function
> owner's privileges, bypassing RLS. This is necessary because all RLS policies are
> SELECT-only — these functions are the trusted entry points for writes.

#### 4.1 Access code generation

```sql
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_attempts INTEGER := 0;
BEGIN
  LOOP
    v_code := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    IF NOT EXISTS (SELECT 1 FROM users WHERE access_code = v_code) THEN
      RETURN v_code;
    END IF;
    v_attempts := v_attempts + 1;
    IF v_attempts >= 100 THEN
      RAISE EXCEPTION 'Failed to generate unique access code after 100 attempts';
    END IF;
  END LOOP;
END;
$$;
```

#### 4.2 Rate limiting

`auth_attempts` has no RLS. Function unchanged.

```sql
CREATE OR REPLACE FUNCTION check_and_record_attempt(
  p_bucket_key TEXT,
  p_success BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_bucket auth_attempts%ROWTYPE;
  v_now TIMESTAMPTZ := NOW();
  v_max_attempts INTEGER := 5;
  v_window INTERVAL := INTERVAL '15 minutes';
BEGIN
  SELECT * INTO v_bucket
  FROM auth_attempts
  WHERE bucket_key = p_bucket_key
  FOR UPDATE;

  IF p_success THEN
    DELETE FROM auth_attempts WHERE bucket_key = p_bucket_key;
    RETURN jsonb_build_object('allowed', true);
  END IF;

  IF NOT FOUND THEN
    INSERT INTO auth_attempts(bucket_key, attempt_count, window_start)
    VALUES (p_bucket_key, 1, v_now);
    RETURN jsonb_build_object('allowed', true, 'attempts', 1);
  END IF;

  IF v_bucket.locked_until IS NOT NULL AND v_bucket.locked_until > v_now THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'locked', 'locked_until', v_bucket.locked_until);
  END IF;

  IF (v_now - v_bucket.window_start) > v_window THEN
    UPDATE auth_attempts
    SET attempt_count = 1, window_start = v_now, locked_until = NULL
    WHERE bucket_key = p_bucket_key;
    RETURN jsonb_build_object('allowed', true, 'attempts', 1);
  END IF;

  UPDATE auth_attempts
  SET attempt_count = attempt_count + 1,
      locked_until = CASE WHEN attempt_count + 1 >= v_max_attempts THEN v_now + v_window ELSE NULL END
  WHERE bucket_key = p_bucket_key;

  IF v_bucket.attempt_count + 1 >= v_max_attempts THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'too_many_attempts', 'attempts', v_bucket.attempt_count + 1);
  END IF;

  RETURN jsonb_build_object('allowed', true, 'attempts', v_bucket.attempt_count + 1);
END;
$$;
```

Bucket key conventions:

* `ip:<ip>`
* `code:<ip>:<access_code>`

#### 4.3 Account creation

```sql
CREATE OR REPLACE FUNCTION create_user_account(
  p_user_id TEXT,
  p_access_code TEXT,
  p_pin_hash TEXT,
  p_group_key TEXT,
  p_course_ids TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO users (id, role, group_key, access_code, pin_hash)
  VALUES (p_user_id, 'user', p_group_key, p_access_code, p_pin_hash);

  INSERT INTO user_courses (user_id, course_id)
  SELECT p_user_id, unnest(p_course_ids);
END;
$$;
```

#### 4.4 Progress updates (source of truth: junction status)

```sql
CREATE OR REPLACE FUNCTION update_course_progress(
  p_course_id TEXT,
  p_new_topic_id TEXT,
  p_new_chapter_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_topic_order INTEGER;
  v_chapter_order INTEGER;
BEGIN
  SELECT display_order INTO v_topic_order
  FROM course_topics
  WHERE course_id = p_course_id AND topic_id = p_new_topic_id;

  SELECT display_order INTO v_chapter_order
  FROM course_chapters
  WHERE course_id = p_course_id AND topic_id = p_new_topic_id AND chapter_id = p_new_chapter_id;

  UPDATE course_topics
  SET status = CASE
    WHEN display_order < v_topic_order THEN 'finished'
    WHEN display_order = v_topic_order THEN 'current'
    WHEN display_order = v_topic_order + 1 THEN 'planned'
    ELSE 'locked'
  END
  WHERE course_id = p_course_id;

  UPDATE course_chapters
  SET status = CASE
    WHEN topic_id IN (
      SELECT topic_id FROM course_topics
      WHERE course_id = p_course_id AND display_order < v_topic_order
    ) THEN 'finished'
    WHEN topic_id = p_new_topic_id THEN
      CASE
        WHEN display_order < v_chapter_order THEN 'finished'
        WHEN display_order = v_chapter_order THEN 'current'
        ELSE 'locked'
      END
    ELSE 'locked'
  END
  WHERE course_id = p_course_id;

  UPDATE courses SET updated_at = NOW() WHERE course_id = p_course_id;
END;
$$;
```

#### 4.5 Rebuild per course while preserving current

Decision implemented: rebuild is **per course**, preserves current if still valid.

Handled in TypeScript orchestration with `withTx(...)` — no dedicated database function needed.
The caller controls the insert step between delete and restore, avoiding the logic flaw of
a single function that deletes rows then tries to query them.

```ts
// queries/courses.ts
export async function rebuildCourseJunctions(
  tx: Tx,
  courseId: string,
  insertJunctions: (tx: Tx) => Promise<void>
) {
  // 1. Save current topic/chapter IDs
  const [savedTopic] = await tx.query<{ topic_id: string }>`
    SELECT topic_id FROM course_topics
    WHERE course_id = ${courseId} AND status = 'current'
    LIMIT 1`;

  const [savedChapter] = await tx.query<{ chapter_id: string }>`
    SELECT chapter_id FROM course_chapters
    WHERE course_id = ${courseId} AND status = 'current'
    LIMIT 1`;

  // 2. Delete old junction rows (children first)
  await tx.query`DELETE FROM course_worksheets WHERE course_id = ${courseId}`;
  await tx.query`DELETE FROM course_chapters   WHERE course_id = ${courseId}`;
  await tx.query`DELETE FROM course_topics     WHERE course_id = ${courseId}`;

  // 3. Insert new junction rows (caller-provided)
  await insertJunctions(tx);

  // 4. Restore current or fallback
  let restoreTopicId = savedTopic?.topic_id;
  let restoreChapterId = savedChapter?.chapter_id;

  // Validate saved IDs still exist in new data
  if (restoreTopicId) {
    const [exists] = await tx.query<{ topic_id: string }>`
      SELECT topic_id FROM course_topics
      WHERE course_id = ${courseId} AND topic_id = ${restoreTopicId}`;
    if (!exists) restoreTopicId = undefined;
  }
  if (restoreTopicId && restoreChapterId) {
    const [exists] = await tx.query<{ chapter_id: string }>`
      SELECT chapter_id FROM course_chapters
      WHERE course_id = ${courseId} AND topic_id = ${restoreTopicId}
        AND chapter_id = ${restoreChapterId}`;
    if (!exists) restoreChapterId = undefined;
  }

  // Fallback to first topic/chapter by display_order
  if (!restoreTopicId) {
    const [fallback] = await tx.query<{ topic_id: string }>`
      SELECT topic_id FROM course_topics
      WHERE course_id = ${courseId}
      ORDER BY display_order LIMIT 1`;
    restoreTopicId = fallback?.topic_id;
  }
  if (restoreTopicId && !restoreChapterId) {
    const [fallback] = await tx.query<{ chapter_id: string }>`
      SELECT chapter_id FROM course_chapters
      WHERE course_id = ${courseId} AND topic_id = ${restoreTopicId}
      ORDER BY display_order LIMIT 1`;
    restoreChapterId = fallback?.chapter_id;
  }

  // 5. Apply progress via database function
  if (restoreTopicId && restoreChapterId) {
    await tx.query`SELECT update_course_progress(${courseId}, ${restoreTopicId}, ${restoreChapterId})`;
  }
}
```

Usage in seeding:

```ts
await withTx(async (tx) => {
  await rebuildCourseJunctions(tx, courseId, async (tx) => {
    // Insert new junction rows from seed data
    await tx.query`INSERT INTO course_topics ...`;
    await tx.query`INSERT INTO course_chapters ...`;
    await tx.query`INSERT INTO course_worksheets ...`;
  });
});
```

---

### 5) SQL views (DTOs)

No change required; RLS continues to apply via base tables.

#### 5.1 Course DTO

```sql
CREATE OR REPLACE VIEW v_course_dto AS
SELECT
  c.course_id AS id,
  CONCAT(COALESCE(cv.variant_short || ' ', ''), s.subject_label) AS label,
  s.subject_label AS description,
  g.group_key,
  s.subject_key,
  c.slug,
  c.icon,
  c.color,
  ARRAY[g.group_label, s.subject_label] AS tags
FROM courses c
JOIN groups g ON g.group_id = c.group_id
JOIN subjects s ON s.subject_id = c.subject_id
LEFT JOIN course_variants cv ON cv.variant_id = c.variant_id;
```

#### 5.2 Progress DTO

```sql
CREATE OR REPLACE VIEW v_progress_dto AS
SELECT
  ct.course_id,
  ct.topic_id,
  t.label AS topic_label,
  CONCAT('/', g.group_key, '/', s.subject_key, '/', t.href_slug) AS topic_href,
  ct.status AS topic_status,
  ct.display_order AS topic_order,

  cc.chapter_id,
  ch.label AS chapter_label,
  CONCAT('/', g.group_key, '/', s.subject_key, '/', t.href_slug, '/', ch.href_slug) AS chapter_href,
  cc.status AS chapter_status,
  cc.display_order AS chapter_order
FROM course_topics ct
JOIN topics t ON t.topic_id = ct.topic_id
JOIN courses c ON c.course_id = ct.course_id
JOIN groups g ON g.group_id = c.group_id
JOIN subjects s ON s.subject_id = c.subject_id
LEFT JOIN course_chapters cc
  ON cc.course_id = ct.course_id AND cc.topic_id = ct.topic_id
LEFT JOIN chapters ch
  ON ch.chapter_id = cc.chapter_id
ORDER BY ct.display_order, cc.display_order;
```

#### 5.3 User DTO

```sql
CREATE OR REPLACE VIEW v_user_dto AS
SELECT
  u.id,
  u.role,
  u.group_key,
  COALESCE(
    ARRAY_AGG(uc.course_id) FILTER (WHERE uc.course_id IS NOT NULL),
    ARRAY[]::TEXT[]
  ) AS course_ids
FROM users u
LEFT JOIN user_courses uc ON uc.user_id = u.id
GROUP BY u.id, u.role, u.group_key;
```

#### 5.4 Worksheets by chapter

```sql
CREATE OR REPLACE VIEW v_worksheets_by_chapter AS
SELECT
  cw.course_id,
  cw.topic_id,
  cw.chapter_id,
  cw.worksheet_id,
  w.label,
  CONCAT('/', g.group_key, '/', s.subject_key, '/', t.href_slug, '/', ch.href_slug, '/', w.href_slug) AS href,
  w.worksheet_format,
  cw.is_hidden,
  cw.display_order
FROM course_worksheets cw
JOIN worksheets w ON w.worksheet_id = cw.worksheet_id
JOIN courses c ON c.course_id = cw.course_id
JOIN groups g ON g.group_id = c.group_id
JOIN subjects s ON s.subject_id = c.subject_id
JOIN topics t ON t.topic_id = cw.topic_id
JOIN chapters ch ON ch.chapter_id = cw.chapter_id;
```

#### 5.5 Type generation from views

Use `kysely-codegen` to auto-generate TypeScript types from the database schema (tables + views).
This ensures DTO types always match the actual view columns — no manual type definitions to maintain.

```bash
bun add -D kysely kysely-codegen
bun kysely-codegen --dialect postgres --out-file src/server/types/database.ts
```

Generated output:

```ts
// Auto-generated src/server/types/database.ts
export interface Database {
  v_course_dto: {
    id: string;
    label: string;
    description: string;
    group_key: string;
    subject_key: string;
    slug: string;
    icon: string | null;
    color: string;
    tags: string[];
  };
  v_progress_dto: { /* ... */ };
  v_user_dto: { /* ... */ };
  v_worksheets_by_chapter: { /* ... */ };
  // ... all tables too
}
```

Usage in queries:

```ts
import type { Database } from '../types/database';

type CourseDTO = Database['v_course_dto'];
type ProgressDTO = Database['v_progress_dto'];

export async function getCourseDTO(tx: Tx, courseId: string): Promise<CourseDTO | null> {
  const rows = await tx.query<CourseDTO>`SELECT * FROM v_course_dto WHERE id = ${courseId}`;
  return rows[0] ?? null;
}
```

Add to build scripts:

```json
{
  "scripts": {
    "db:types": "kysely-codegen --dialect postgres --out-file src/server/types/database.ts",
    "db:setup": "bun run scripts/schema.sql && bun db:types"
  }
}
```

---

### 6) TypeScript data access layout

#### 6.1 Folder structure

```
src/server/
  actions/
  services/
  queries/
    index.ts
    users.ts
    courses.ts
    auth.ts
    audit.ts
  lib/
  config/
```

#### 6.2 Connection + transaction-local RLS context (pooling safe)

Key change:

* use **transaction wrapper**
* set config with **`true`**
* run all request queries inside the same transaction/connection

```ts
// src/server/queries/index.ts
import postgres from "postgres";
import { sql as vercelSql } from "@vercel/postgres";

const isVercel = Boolean(process.env.VERCEL);
const localSql = isVercel ? null : postgres(process.env.POSTGRES_URL!, { max: 10 });

type Tx = {
  query<T>(strings: TemplateStringsArray, ...values: any[]): Promise<T[]>;
};

export async function withTx<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  if (isVercel) {
    // @vercel/postgres supports transactions via sql.begin
    return await (vercelSql as any).begin(async (sqlTx: any) => {
      const tx: Tx = { query: (s, ...v) => sqlTx(s, ...v).then((r: any) => r.rows) };
      return await fn(tx);
    });
  }

  return await localSql!.begin(async (sqlTx) => {
    const tx: Tx = { query: (s, ...v) => sqlTx(s, ...v) as any };
    return await fn(tx);
  });
}

export async function setUserContextTx(tx: Tx, userId: string | null, role: string | null, groupKey: string | null) {
  await tx.query`SELECT set_config('app.user_id', ${userId}, true)`;
  await tx.query`SELECT set_config('app.user_role', ${role}, true)`;
  await tx.query`SELECT set_config('app.group_key', ${groupKey}, true)`;
}
```

---

### 7) Authentication flow wiring (cookies + DB functions)

No conceptual change, but execution is inside `withTx(...)` and uses `setUserContextTx(..., true)`.

* Login:

  * rate limit calls (no RLS involved)
  * fetch user by access_code
  * verify PIN (argon2id) in TS
  * set cookie
  * insert audit log row (audit_log has no RLS)

* Request:

  * `withTx(async tx => {`
  * read session cookie
  * fetch `v_user_dto`
  * `setUserContextTx(tx, user.id, user.role, user.group_key)`
  * run domain queries
  * `})`

---

### 8) Seeding / Rebuild strategy

#### 8.1 Output

* Generator: `pipeline/dataTransformer/generateCourseSQLScript.ts`
* Output file: `.generated/scripts/courses.sql`

#### 8.2 What the script must generate

* `groups`, `subjects`, `course_variants`
* `topics`, `chapters`, `worksheets`
* `courses`

For junctions: use **per-course rebuild**.

#### 8.3 Per-course rebuild that preserves current

Implemented in TypeScript via `rebuildCourseJunctions()` inside `withTx(...)` (see section 4.5).

For a given course within one transaction:

1. save current topic/chapter IDs from `status='current'`
2. delete junction rows (children first: worksheets → chapters → topics)
3. insert new junction rows from seed data
4. validate saved IDs still exist in new data
5. call `update_course_progress()` with saved IDs if valid, otherwise fallback to first by display_order

---

## Implementation checklist (updated)

### Phase 1 — Schema

* [ ] Create tables + indexes
* [ ] Add partial unique indexes for current/planned
* [ ] Enable RLS on domain tables only (not `auth_attempts`, `audit_log`)
* [ ] Create RLS policies (including lookup tables: `groups`, `subjects`, `course_variants`)
* [ ] Create RLS policies for `users`, `user_courses`
* [ ] Verify `course_worksheets` policy enforces `is_hidden`

### Phase 2 — Functions + views

* [ ] `generate_access_code()` (SECURITY DEFINER, loop guard)
* [ ] `check_and_record_attempt()` (auth_attempts has no RLS)
* [ ] `create_user_account()` (SECURITY DEFINER)
* [ ] `update_course_progress()` (SECURITY DEFINER)
* [ ] Views: `v_course_dto`, `v_progress_dto`, `v_user_dto`, `v_worksheets_by_chapter`
* [ ] Generate TypeScript types via `kysely-codegen`

### Phase 3 — Seeding pipeline

* [ ] Generator outputs defs + courses idempotently
* [ ] `rebuildCourseJunctions()` in TS with `withTx` (delete → insert → restore)
* [ ] Preserve current on rebuild (restore if valid else fallback to first by display_order)

### Phase 4 — App integration

* [ ] Add `withTx(...)` and `setUserContextTx(...)` (transaction-local config)
* [ ] Ensure all request queries run inside `withTx`
* [ ] Replace course provider usage with view queries
* [ ] Wire auth flow to rate limit function + session cookies (7-day HttpOnly)
* [ ] Replace progress updates with `update_course_progress()`

### Phase 5 — Cleanup

* [ ] Remove `src/server/repo/`
* [ ] Remove `src/server/dev/`
* [ ] Remove `src/server/db/`
* [ ] Remove old `courseProvider.ts` usage

### Phase 6 — Verification

* [ ] Pooling safety: context does not leak between requests (tx-local config)
* [ ] RLS isolation (user A cannot read user B)
* [ ] Course visibility (admin/public/enrolled)
* [ ] DTO views return correct shapes
* [ ] Rate limiting behavior
* [ ] Rebuild preserves current when still valid
* [ ] Progress update correctness
* [ ] Worksheet hiding: non-admins cannot see `is_hidden = true` worksheets
* [ ] SECURITY DEFINER functions can write through RLS
