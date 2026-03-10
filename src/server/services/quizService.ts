import "server-only";

import { anonSQL, userSQL } from "@db/runSQL";
import type { UserDTO } from "@services/userService";
import type {
  QuizPhase,
  QuizStateDTO,
  QuizResultsDTO,
  QuizSummaryDTO,
  QuizQuestionSummary,
  StoredQuestion,
} from "@schema/quizTypes";
import { publishToChannel } from "@server-lib/ablyServer";

// ==========================================================================
// Row types (DB → TypeScript)
// ==========================================================================

type QuizSessionRow = {
  session_id: string;
  course_id: string;
  phase: QuizPhase;
  questions: StoredQuestion[];
  current_index: number;
  timer_seconds: number | null;
  timer_started_at: string | null;
  updated_at: string;
  created_at: string;
};

type QuizResultsRow = QuizSessionRow & {
  participant_count: number;
  /** json_agg of quiz_responses.selected for the current question; null when no responses yet */
  responses: number[][] | null;
};

// ==========================================================================
// Helpers
// ==========================================================================

function buildStateDTO(row: QuizSessionRow): QuizStateDTO {
  const q = row.questions[row.current_index];
  const phase = row.phase as Exclude<QuizPhase, "closed">;

  return {
    sessionId: row.session_id,
    courseId: row.course_id,
    phase,
    currentIndex: row.current_index,
    totalQuestions: row.questions.length,
    question: q.question,
    options: q.options,
    ...(phase === "reveal_correct" && {
      correctIndices: q.correctIndices,
      why: q.why,
    }),
    timerSeconds: row.timer_seconds,
    timerStartedAt: row.timer_started_at,
    updatedAt: row.updated_at,
  };
}

function buildResultsDTO(row: QuizResultsRow): QuizResultsDTO {
  const q = row.questions[row.current_index];
  const responses = row.responses ?? [];
  const optionCounts = new Array<number>(q.options.length).fill(0);
  for (const selected of responses) {
    for (const idx of selected) {
      if (idx >= 0 && idx < optionCounts.length) optionCounts[idx]++;
    }
  }
  return {
    sessionId: row.session_id,
    courseId: row.course_id,
    phase: row.phase,
    currentIndex: row.current_index,
    totalQuestions: row.questions.length,
    question: q.question,
    options: q.options,
    correctIndices: q.correctIndices,
    why: q.why,
    participants: row.participant_count,
    answeredCount: responses.length,
    optionCounts,
    timerSeconds: row.timer_seconds,
    timerStartedAt: row.timer_started_at,
    updatedAt: row.updated_at,
  };
}

function buildStudentDTOFromResults(results: QuizResultsDTO): QuizStateDTO {
  const phase = results.phase as Exclude<QuizPhase, "closed">;
  return {
    sessionId: results.sessionId,
    courseId: results.courseId,
    phase,
    currentIndex: results.currentIndex,
    totalQuestions: results.totalQuestions,
    question: results.question,
    options: results.options,
    ...(phase === "reveal_correct" && {
      correctIndices: results.correctIndices,
      why: results.why,
    }),
    timerSeconds: results.timerSeconds,
    timerStartedAt: results.timerStartedAt,
    updatedAt: results.updatedAt,
  };
}

// ==========================================================================
// Ably broadcast helpers (best-effort; DB is source of truth)
// ==========================================================================

async function publishQuizUpdate(sessionId: string, user: UserDTO): Promise<void> {
  const results = await getQuizResults(sessionId, user);
  if (!results) return;
  const studentState = buildStudentDTOFromResults(results);
  await Promise.all([
    publishToChannel(`classroom:${results.courseId}:admin`, { type: "QUIZ_STATE", quiz: results }),
    publishToChannel(`classroom:${results.courseId}:student`, { type: "QUIZ_STATE", quiz: studentState }),
  ]);
}

async function publishQuizClosed(courseId: string): Promise<void> {
  await Promise.all([
    publishToChannel(`classroom:${courseId}:admin`, { type: "QUIZ_STATE", quiz: null }),
    publishToChannel(`classroom:${courseId}:student`, { type: "QUIZ_STATE", quiz: null }),
  ]);
}

// ==========================================================================
// Admin: session lifecycle
// ==========================================================================

/**
 * Create a new quiz session. Fails if an active session already exists for
 * this course (enforced by the partial unique index).
 */
export async function startQuizSession(
  courseId: string,
  questions: StoredQuestion[],
  timerSeconds: number | null,
  user: UserDTO,
): Promise<string> {
  const sessionId = crypto.randomUUID();

  await userSQL(user)`
    INSERT INTO quiz_sessions
      (session_id, course_id, questions, timer_seconds)
    VALUES
      (${sessionId}, ${courseId}, ${questions as never}, ${timerSeconds})
  `;

  // Notify students and update admin view
  await Promise.all([
    publishToChannel(`classroom:${courseId}:student`, { type: "QUIZ_STARTED", courseId, sessionId }),
    publishQuizUpdate(sessionId, user),
  ]);

  return sessionId;
}

/** waiting → active; starts the timer timestamp */
export async function launchQuizQuestion(
  sessionId: string,
  user: UserDTO,
): Promise<void> {
  await userSQL(user)`
    UPDATE quiz_sessions
    SET phase            = 'active',
        timer_started_at = now(),
        updated_at       = now()
    WHERE session_id = ${sessionId}
      AND phase = 'waiting'
  `;
  await publishQuizUpdate(sessionId, user);
}

/** active → reveal_dist (distribution shown, no correct highlighted yet) */
export async function revealDistribution(
  sessionId: string,
  user: UserDTO,
): Promise<void> {
  await userSQL(user)`
    UPDATE quiz_sessions
    SET phase      = 'reveal_dist',
        updated_at = now()
    WHERE session_id = ${sessionId}
      AND phase IN ('active', 'waiting')
  `;
  await publishQuizUpdate(sessionId, user);
}

/** reveal_dist → reveal_correct (correct answer + #why shown) */
export async function revealCorrectAnswer(
  sessionId: string,
  user: UserDTO,
): Promise<void> {
  await userSQL(user)`
    UPDATE quiz_sessions
    SET phase      = 'reveal_correct',
        updated_at = now()
    WHERE session_id = ${sessionId}
      AND phase = 'reveal_dist'
  `;
  await publishQuizUpdate(sessionId, user);
}

/** reveal_correct → active for next question; increments current_index */
export async function nextQuizQuestion(
  sessionId: string,
  user: UserDTO,
): Promise<void> {
  await userSQL(user)`
    UPDATE quiz_sessions
    SET phase            = 'active',
        current_index    = current_index + 1,
        timer_started_at = now(),
        updated_at       = now()
    WHERE session_id = ${sessionId}
      AND phase = 'reveal_correct'
  `;
  await publishQuizUpdate(sessionId, user);
}

/**
 * Skip the current question (any non-closed phase).
 * If already on the last question, closes the session instead.
 */
export async function skipQuestion(
  sessionId: string,
  user: UserDTO,
): Promise<void> {
  const [row] = await userSQL(user)<Pick<QuizSessionRow, "current_index" | "questions" | "course_id">[]>`
    SELECT current_index, questions, course_id
    FROM quiz_sessions
    WHERE session_id = ${sessionId}
      AND phase != 'closed'
  `;
  if (!row) return;

  const isLast = row.current_index >= (row.questions as StoredQuestion[]).length - 1;

  if (isLast) {
    await userSQL(user)`
      UPDATE quiz_sessions
      SET phase      = 'closed',
          updated_at = now()
      WHERE session_id = ${sessionId}
    `;
    await publishQuizClosed(row.course_id);
  } else {
    await userSQL(user)`
      UPDATE quiz_sessions
      SET phase            = 'waiting',
          current_index    = current_index + 1,
          timer_started_at = NULL,
          updated_at       = now()
      WHERE session_id = ${sessionId}
    `;
    await publishQuizUpdate(sessionId, user);
  }
}

/** Closes the session (after last question's reveal_correct phase) */
export async function closeQuizSession(
  sessionId: string,
  user: UserDTO,
): Promise<void> {
  const [row] = await userSQL(user)<Pick<QuizSessionRow, "course_id">[]>`
    UPDATE quiz_sessions
    SET phase      = 'closed',
        updated_at = now()
    WHERE session_id = ${sessionId}
    RETURNING course_id
  `;
  if (row) await publishQuizClosed(row.course_id);
}

/** Force-closes any active (non-closed) quiz session for a course. */
export async function closeActiveQuizForCourse(
  courseId: string,
  user: UserDTO,
): Promise<void> {
  await userSQL(user)`
    UPDATE quiz_sessions
    SET phase      = 'closed',
        updated_at = now()
    WHERE course_id = ${courseId}
      AND phase != 'closed'
  `;
  await publishQuizClosed(courseId);
}

// ==========================================================================
// Student: join + submit
// ==========================================================================

/** Register a student as a participant. Idempotent (INSERT ... ON CONFLICT). */
export async function joinQuizSession(
  sessionId: string,
  user: UserDTO,
): Promise<void> {
  await userSQL(user)`
    INSERT INTO quiz_participants (session_id, user_id)
    VALUES (${sessionId}, ${user.id})
    ON CONFLICT DO NOTHING
  `;
  await publishQuizUpdate(sessionId, user);
}

/**
 * Store a student's answer for the current question.
 * Calls try_advance_quiz_phase() to auto-advance if everyone has answered.
 */
export async function submitQuizResponse(
  sessionId: string,
  questionIndex: number,
  selected: number[],
  timedOut: boolean,
  user: UserDTO,
): Promise<{ ok: boolean; reason?: string }> {
  const [session] = await userSQL(user)<Pick<QuizSessionRow, "phase" | "current_index">[]>`
    SELECT phase, current_index
    FROM quiz_sessions
    WHERE session_id = ${sessionId}
  `;

  if (!session) return { ok: false, reason: "session_not_found" };
  if (session.phase !== "active") return { ok: false, reason: "phase_ended" };
  if (session.current_index !== questionIndex) return { ok: false, reason: "wrong_question" };

  await userSQL(user)`
    INSERT INTO quiz_responses (session_id, user_id, question_index, selected, timed_out)
    VALUES (${sessionId}, ${user.id}, ${questionIndex}, ${selected as never}, ${timedOut})
    ON CONFLICT DO NOTHING
  `;

  await anonSQL`SELECT try_advance_quiz_phase(${sessionId}, ${questionIndex})`;

  // Push updated answer counts to admin in realtime
  await publishQuizUpdate(sessionId, user);

  return { ok: true };
}

// ==========================================================================
// Student: poll for current quiz state
// ==========================================================================

export async function getActiveQuizForCourse(
  courseId: string,
  user: UserDTO,
): Promise<QuizStateDTO | null> {
  const [row] = await userSQL(user)<QuizSessionRow[]>`
    SELECT session_id, course_id, phase, questions,
           current_index, timer_seconds, timer_started_at, updated_at, created_at
    FROM quiz_sessions
    WHERE course_id = ${courseId}
      AND phase != 'closed'
    LIMIT 1
  `;

  return row ? buildStateDTO(row) : null;
}

export async function getActiveQuizForUser(user: UserDTO): Promise<QuizStateDTO | null> {
  if (!user.courseIds.length) return null;

  const [row] = await userSQL(user)<QuizSessionRow[]>`
    SELECT session_id, course_id, phase, questions,
           current_index, timer_seconds, timer_started_at, updated_at, created_at
    FROM quiz_sessions
    WHERE course_id = ANY(${user.courseIds as string[]})
      AND phase != 'closed'
    LIMIT 1
  `;

  return row ? buildStateDTO(row) : null;
}

// ==========================================================================
// Admin: live results polling
// ==========================================================================

export async function getActiveQuizResults(
  courseId: string,
  user: UserDTO,
): Promise<QuizResultsDTO | null> {
  const [row] = await userSQL(user)<QuizResultsRow[]>`
    SELECT
      s.session_id, s.course_id, s.phase, s.questions,
      s.current_index, s.timer_seconds, s.timer_started_at, s.updated_at, s.created_at,
      (SELECT COUNT(*)::int FROM quiz_participants p WHERE p.session_id = s.session_id) AS participant_count,
      COALESCE(
        (SELECT json_agg(r.selected) FROM quiz_responses r
         WHERE r.session_id = s.session_id AND r.question_index = s.current_index),
        '[]'::json
      ) AS responses
    FROM quiz_sessions s
    WHERE s.course_id = ${courseId}
      AND s.phase != 'closed'
    LIMIT 1
  `;
  return row ? buildResultsDTO(row) : null;
}

export async function getQuizResults(
  sessionId: string,
  user: UserDTO,
): Promise<QuizResultsDTO | null> {
  const [row] = await userSQL(user)<QuizResultsRow[]>`
    SELECT
      s.session_id, s.course_id, s.phase, s.questions,
      s.current_index, s.timer_seconds, s.timer_started_at, s.updated_at, s.created_at,
      (SELECT COUNT(*)::int FROM quiz_participants p WHERE p.session_id = s.session_id) AS participant_count,
      COALESCE(
        (SELECT json_agg(r.selected) FROM quiz_responses r
         WHERE r.session_id = s.session_id AND r.question_index = s.current_index),
        '[]'::json
      ) AS responses
    FROM quiz_sessions s
    WHERE s.session_id = ${sessionId}
  `;
  return row ? buildResultsDTO(row) : null;
}

// ==========================================================================
// Admin: post-session summary
// ==========================================================================

export async function getQuizSummary(
  sessionId: string,
  user: UserDTO,
): Promise<QuizSummaryDTO | null> {
  const [row] = await userSQL(user)<QuizSessionRow[]>`
    SELECT session_id, course_id, phase, questions, current_index, created_at
    FROM quiz_sessions
    WHERE session_id = ${sessionId}
  `;

  if (!row) return null;

  const questions = row.questions as StoredQuestion[];

  const responseRows = await userSQL(user)<{ question_index: number; selected: number[] }[]>`
    SELECT question_index, selected
    FROM quiz_responses
    WHERE session_id = ${sessionId}
  `;

  const participantCount = await userSQL(user)<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM quiz_participants
    WHERE session_id = ${sessionId}
  `;
  const participants = participantCount[0]?.count ?? 0;

  const byQuestion = new Map<number, number[][]>();
  for (const r of responseRows) {
    const list = byQuestion.get(r.question_index) ?? [];
    list.push(r.selected);
    byQuestion.set(r.question_index, list);
  }

  const summaryQuestions: QuizQuestionSummary[] = questions.map((q, i) => {
    const responses = byQuestion.get(i) ?? [];
    const optionCounts = new Array<number>(q.options.length).fill(0);
    let correctCount = 0;

    for (const selected of responses) {
      for (const idx of selected) {
        if (idx >= 0 && idx < optionCounts.length) {
          optionCounts[idx]++;
        }
      }
      const isCorrect =
        selected.length === q.correctIndices.length &&
        selected.every((s) => q.correctIndices.includes(s));
      if (isCorrect) correctCount++;
    }

    return {
      questionIndex: i,
      question: q.question,
      options: q.options,
      correctIndices: q.correctIndices,
      why: q.why,
      participants,
      optionCounts,
      percentCorrect: participants > 0 ? Math.round((correctCount / participants) * 100) : 0,
    };
  });

  return {
    sessionId: row.session_id,
    courseId: row.course_id,
    createdAt: row.created_at,
    questions: summaryQuestions,
  };
}

// ==========================================================================
// Admin: list recent sessions (for review screen)
// ==========================================================================

export type QuizSessionMeta = {
  sessionId: string;
  courseId: string;
  phase: QuizPhase;
  totalQuestions: number;
  createdAt: string;
};

export async function listQuizSessions(
  courseId: string,
  user: UserDTO,
): Promise<QuizSessionMeta[]> {
  const rows = await userSQL(user)<{
    session_id: string;
    course_id: string;
    phase: QuizPhase;
    questions: StoredQuestion[];
    created_at: string;
  }[]>`
    SELECT session_id, course_id, phase, questions, created_at
    FROM quiz_sessions
    WHERE course_id = ${courseId}
    ORDER BY created_at DESC
    LIMIT 20
  `;

  return rows.map((r) => ({
    sessionId: r.session_id,
    courseId: r.course_id,
    phase: r.phase,
    totalQuestions: (r.questions as StoredQuestion[]).length,
    createdAt: r.created_at,
  }));
}
