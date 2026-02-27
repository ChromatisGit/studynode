"use server";

import { getSession, assertAdminAccess, assertLoggedIn } from "@services/authService";
import {
  startQuizSession,
  launchQuizQuestion,
  revealDistribution,
  revealCorrectAnswer,
  nextQuizQuestion,
  skipQuestion,
  closeQuizSession,
  joinQuizSession,
  submitQuizResponse,
  getQuizResults,
  getQuizSummary,
  listQuizSessions,
} from "@services/quizService";
import type { StoredQuestion, QuizResultsDTO, QuizSummaryDTO } from "@schema/quizTypes";
import type { QuizSessionMeta } from "@services/quizService";

type OkResult<T> = { ok: true; data: T };
type ErrResult = { ok: false; error: string };
type Result<T> = OkResult<T> | ErrResult;

// ==========================================================================
// Admin: session lifecycle actions
// ==========================================================================

export async function startQuizAction(
  channelName: string,
  courseId: string,
  questions: StoredQuestion[],
  timerSeconds: number | null,
): Promise<Result<{ sessionId: string }>> {
  const session = await getSession();
  assertAdminAccess(session);

  if (!questions.length || questions.length > 20) {
    return { ok: false, error: "Invalid question count" };
  }

  const sessionId = await startQuizSession(channelName, courseId, questions, timerSeconds, session.user);
  return { ok: true, data: { sessionId } };
}

export async function launchQuizAction(sessionId: string): Promise<Result<void>> {
  const session = await getSession();
  assertAdminAccess(session);
  await launchQuizQuestion(sessionId, session.user);
  return { ok: true, data: undefined };
}

export async function revealDistributionAction(sessionId: string): Promise<Result<void>> {
  const session = await getSession();
  assertAdminAccess(session);
  await revealDistribution(sessionId, session.user);
  return { ok: true, data: undefined };
}

export async function revealCorrectAnswerAction(sessionId: string): Promise<Result<void>> {
  const session = await getSession();
  assertAdminAccess(session);
  await revealCorrectAnswer(sessionId, session.user);
  return { ok: true, data: undefined };
}

export async function nextQuizQuestionAction(sessionId: string): Promise<Result<void>> {
  const session = await getSession();
  assertAdminAccess(session);
  await nextQuizQuestion(sessionId, session.user);
  return { ok: true, data: undefined };
}

export async function skipQuestionAction(sessionId: string): Promise<Result<void>> {
  const session = await getSession();
  assertAdminAccess(session);
  await skipQuestion(sessionId, session.user);
  return { ok: true, data: undefined };
}

export async function closeQuizAction(sessionId: string): Promise<Result<void>> {
  const session = await getSession();
  assertAdminAccess(session);
  await closeQuizSession(sessionId, session.user);
  return { ok: true, data: undefined };
}

// ==========================================================================
// Student: join + submit
// ==========================================================================

export async function joinQuizAction(sessionId: string): Promise<Result<void>> {
  const session = await getSession();
  assertLoggedIn(session);
  await joinQuizSession(sessionId, session.user);
  return { ok: true, data: undefined };
}

export async function submitQuizResponseAction(
  sessionId: string,
  questionIndex: number,
  selected: number[],
  timedOut: boolean,
): Promise<Result<void>> {
  const session = await getSession();
  assertLoggedIn(session);

  const result = await submitQuizResponse(
    sessionId,
    questionIndex,
    selected,
    timedOut,
    session.user,
  );

  if (!result.ok) {
    return { ok: false, error: result.reason ?? "submission_failed" };
  }

  return { ok: true, data: undefined };
}

// ==========================================================================
// Admin: results polling
// ==========================================================================

export async function getQuizResultsAction(
  sessionId: string,
): Promise<Result<QuizResultsDTO>> {
  const session = await getSession();
  assertAdminAccess(session);

  const results = await getQuizResults(sessionId, session.user);
  if (!results) return { ok: false, error: "session_not_found" };

  return { ok: true, data: results };
}

export async function getQuizSummaryAction(
  sessionId: string,
): Promise<Result<QuizSummaryDTO>> {
  const session = await getSession();
  assertAdminAccess(session);

  const summary = await getQuizSummary(sessionId, session.user);
  if (!summary) return { ok: false, error: "session_not_found" };

  return { ok: true, data: summary };
}

export async function listQuizSessionsAction(
  courseId: string,
): Promise<Result<QuizSessionMeta[]>> {
  const session = await getSession();
  assertAdminAccess(session);

  const sessions = await listQuizSessions(courseId, session.user);
  return { ok: true, data: sessions };
}
