"use client";

import { useState, useCallback } from "react";
import type { QuizResultsDTO, StoredQuestion } from "@schema/quizTypes";
import type { QuizMacro } from "@macros/quiz/types";
import type { Markdown } from "@schema/page";
import {
  startQuizAction,
  launchQuizAction,
  revealDistributionAction,
  revealCorrectAnswerAction,
  nextQuizQuestionAction,
  skipQuestionAction,
  closeQuizAction,
  forceCloseQuizForCourseAction,
} from "@actions/quizActions";
import styles from "./QuizPresenterPanel.module.css";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function markdownText(m: Markdown): string {
  return m.markdown;
}

function macroToStoredQuestion(q: QuizMacro): StoredQuestion {
  const correctSet = new Set(q.correct.map((c) => markdownText(c)));
  return {
    question: markdownText(q.question),
    options: q.options.map((o) => markdownText(o)),
    correctIndices: q.options
      .map((o, i) => (correctSet.has(markdownText(o)) ? i : -1))
      .filter((i) => i !== -1),
    why: q.why ? markdownText(q.why) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type Props = {
  quizMacros: QuizMacro[];
  courseId: string;
  /** Live quiz state pushed from the DO via WebSocket (null = no active quiz) */
  quizResults: QuizResultsDTO | null;
  /** Number of connected student WebSocket subscribers */
  presence: number;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuizPresenterPanel({ quizMacros, courseId, quizResults, presence }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = quizMacros.map(macroToStoredQuestion);
  const timerSeconds =
    quizMacros[0]?.timer !== false && quizMacros[0]?.timer
      ? (quizMacros[0].timer as number)
      : null;

  // Derive session ID from live quiz results; after start, DO broadcasts QUIZ_STATE
  const sessionId = quizResults?.sessionId ?? null;

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const call = useCallback(async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(true);
    setError(null);
    const res = await fn();
    if (!res.ok) setError((res as { ok: false; error: string }).error);
    setBusy(false);
  }, []);

  const handleStart = useCallback(async () => {
    setBusy(true);
    setError(null);
    const res = await startQuizAction(courseId, questions, timerSeconds);
    if (!res.ok) setError(res.error);
    // sessionId comes via WebSocket QUIZ_STATE event — no local state needed
    setBusy(false);
  }, [courseId, questions, timerSeconds]);

  // ---------------------------------------------------------------------------
  // No session: show start button
  // ---------------------------------------------------------------------------

  const isConflict = error?.includes("läuft bereits");

  if (!sessionId) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Quiz</span>
          <span className={styles.panelMeta}>{questions.length} Frage{questions.length !== 1 ? "n" : ""}</span>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {isConflict ? (
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                const res = await forceCloseQuizForCourseAction(courseId);
                if (res.ok) {
                  handleStart();
                } else {
                  setError((res as { ok: false; error: string }).error);
                  setBusy(false);
                }
              }}
            >
              Altes Quiz beenden & neu starten
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleStart}
            disabled={busy || !courseId}
          >
            Quiz starten
          </button>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Active session: phase controls
  // ---------------------------------------------------------------------------

  const phase = quizResults?.phase ?? "waiting";
  const idx = quizResults?.currentIndex ?? 0;
  const total = quizResults?.totalQuestions ?? questions.length;
  const answered = quizResults?.answeredCount ?? 0;
  const participants = quizResults?.participants ?? presence;
  const isLast = idx >= total - 1;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Quiz läuft</span>
        <span className={styles.panelMeta}>
          Frage {idx + 1} / {total}
        </span>
      </div>

      {/* Participation */}
      <div className={styles.participation}>
        <span className={styles.participationCount}>
          {answered} / {participants} geantwortet
          {presence > 0 && ` · ${presence} verbunden`}
        </span>
        {participants > 0 && (
          <div className={styles.participationBar}>
            <div
              className={styles.participationFill}
              style={{ width: `${Math.round((answered / participants) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Phase controls */}
      {phase === "waiting" && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={busy}
            onClick={() => call(() => launchQuizAction(sessionId))}
          >
            Starten
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            disabled={busy || isLast}
            onClick={() => call(() => skipQuestionAction(sessionId))}
          >
            Überspringen
          </button>
        </div>
      )}

      {phase === "active" && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={busy}
            onClick={() => call(() => revealDistributionAction(sessionId))}
          >
            Auswerten
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            disabled={busy}
            onClick={() => call(() => skipQuestionAction(sessionId))}
          >
            Überspringen
          </button>
        </div>
      )}

      {phase === "reveal_dist" && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={busy}
            onClick={() => call(() => revealCorrectAnswerAction(sessionId))}
          >
            Richtige Antwort zeigen
          </button>
        </div>
      )}

      {phase === "reveal_correct" && (
        <div className={styles.controls}>
          {isLast ? (
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={busy}
              onClick={() => call(() => closeQuizAction(sessionId))}
            >
              Quiz beenden
            </button>
          ) : (
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={busy}
              onClick={() => call(() => nextQuizQuestionAction(sessionId))}
            >
              Nächste Frage
            </button>
          )}
        </div>
      )}

      {phase === "closed" && (
        <p className={styles.closedNote}>Quiz beendet</p>
      )}
    </div>
  );
}
