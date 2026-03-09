"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle, ClipboardList, Timer, Users } from "lucide-react";
import { Button } from "@components/Button";
import { joinQuizAction, submitQuizResponseAction } from "@actions/quizActions";
import type { QuizStateDTO } from "@schema/quizTypes";
import type { StudentStreamEvent, StudentSnapshot } from "@schema/streamTypes";
import { useQuizStream } from "./hooks/useQuizStream";
import styles from "./QuizPage.module.css";

type QuizPageProps = {
  /** Initial quiz state from server-side render; null = no active quiz. */
  initialState: QuizStateDTO | null;
};

export function QuizPage({ initialState }: QuizPageProps) {
  const [quiz, setQuiz] = useState<QuizStateDTO | null>(initialState);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const lastIndexRef = useRef<number | null>(initialState?.currentIndex ?? null);
  const lastSessionRef = useRef<string | null>(initialState?.sessionId ?? null);

  // Reset per-question state when the question index changes
  useEffect(() => {
    if (quiz && quiz.currentIndex !== lastIndexRef.current) {
      lastIndexRef.current = quiz.currentIndex;
      setSelectedAnswer(null);
      setHasSubmitted(false);
    }
  }, [quiz]);

  // Auto-join when a session becomes available or changes
  useEffect(() => {
    if (quiz?.sessionId && quiz.sessionId !== lastSessionRef.current) {
      lastSessionRef.current = quiz.sessionId;
      joinQuizAction(quiz.sessionId).catch(() => {});
    }
  }, [quiz?.sessionId]);

  // Countdown timer
  useEffect(() => {
    if (!quiz?.timerSeconds || !quiz.timerStartedAt || quiz.phase !== "active") {
      setTimeLeft(null);
      return;
    }
    const end = new Date(quiz.timerStartedAt).getTime() + quiz.timerSeconds * 1000;
    const tick = () => {
      const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0 && !hasSubmitted) {
        // Auto-submit on timeout
        setHasSubmitted(true);
        if (quiz.sessionId) {
          submitQuizResponseAction(quiz.sessionId, quiz.currentIndex, [], true).catch(() => {});
        }
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [quiz?.timerStartedAt, quiz?.timerSeconds, quiz?.phase, quiz?.sessionId, quiz?.currentIndex, hasSubmitted]);

  // WebSocket: receive live quiz state from the DO
  const onEvent = useCallback((event: StudentStreamEvent) => {
    switch (event.type) {
      case "INIT": {
        const init = event as StudentSnapshot;
        setQuiz(init.quiz);
        break;
      }
      case "QUIZ_STATE":
        setQuiz(event.quiz);
        break;
      case "QUIZ_STARTED":
        // Do nothing — the QUIZ_STATE event that follows will update the quiz state
        break;
    }
  }, []);

  useQuizStream({ onEvent });

  const handleSubmit = async () => {
    if (!quiz || selectedAnswer === null || hasSubmitted) return;
    setHasSubmitted(true);
    await submitQuizResponseAction(quiz.sessionId, quiz.currentIndex, [selectedAnswer], false);
  };

  // ── No active quiz ──────────────────────────────────────────────────────────
  if (!quiz) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <ClipboardList size={56} className={styles.emptyIcon} aria-hidden />
          <h1 className={styles.emptyTitle}>Kein Quiz aktiv</h1>
          <p className={styles.emptyDesc}>
            Dein Lehrer startet gleich ein Quiz — diese Seite aktualisiert sich automatisch.
          </p>
        </div>
      </div>
    );
  }

  // ── Waiting ─────────────────────────────────────────────────────────────────
  if (quiz.phase === "waiting") {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden>⏳</div>
          <h1 className={styles.emptyTitle}>Quiz startet gleich…</h1>
          <p className={styles.emptyDesc}>Dein Lehrer startet die erste Frage.</p>
        </div>
      </div>
    );
  }

  const progress = ((quiz.currentIndex + 1) / quiz.totalQuestions) * 100;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.meta}>
            <span className={styles.progress}>
              <Users size={14} aria-hidden />
              Frage {quiz.currentIndex + 1} von {quiz.totalQuestions}
            </span>
            {timeLeft !== null && quiz.phase === "active" && (
              <span className={timeLeft <= 10 ? styles.timerUrgent : styles.timer}>
                <Timer size={14} aria-hidden />
                {timeLeft}s
              </span>
            )}
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className={styles.questionCard}>
          <p className={styles.question}>{quiz.question}</p>

          <div className={styles.options}>
            {quiz.options.map((option, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = quiz.correctIndices?.includes(i);
              const isReveal =
                quiz.phase === "reveal_correct" || quiz.phase === "reveal_dist";

              let optionClass = styles.option;
              if (isReveal && isCorrect) optionClass = `${styles.option} ${styles.optionCorrect}`;
              else if (isReveal && isSelected && !isCorrect)
                optionClass = `${styles.option} ${styles.optionWrong}`;
              else if (isSelected) optionClass = `${styles.option} ${styles.optionSelected}`;

              return (
                <button
                  key={i}
                  type="button"
                  className={optionClass}
                  onClick={() => {
                    if (quiz.phase === "active" && !hasSubmitted) setSelectedAnswer(i);
                  }}
                  disabled={quiz.phase !== "active" || hasSubmitted}
                  aria-pressed={isSelected}
                >
                  <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                  <span className={styles.optionText}>{option}</span>
                  {isReveal && isCorrect && (
                    <CheckCircle2 size={18} className={styles.optionIcon} aria-hidden />
                  )}
                  {isReveal && isSelected && !isCorrect && (
                    <Circle size={18} className={styles.optionIcon} aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions / status */}
        {quiz.phase === "active" && (
          <div className={styles.actions}>
            {hasSubmitted ? (
              <p className={styles.submitted}>Antwort abgeschickt — warte auf Ergebnisse…</p>
            ) : (
              <Button
                variant="primary"
                size="lg"
                disabled={selectedAnswer === null}
                onClick={handleSubmit}
              >
                Antwort abschicken
              </Button>
            )}
          </div>
        )}

        {quiz.phase === "reveal_dist" && (
          <p className={styles.statusMsg}>Auswertung folgt…</p>
        )}

        {quiz.phase === "reveal_correct" && quiz.why && (
          <div className={styles.explanation}>
            <p className={styles.explanationLabel}>Erklärung</p>
            <p className={styles.explanationText}>{quiz.why}</p>
          </div>
        )}

        {quiz.phase === "reveal_correct" && (
          <p className={styles.statusMsg}>
            {quiz.currentIndex + 1 < quiz.totalQuestions
              ? "Nächste Frage kommt…"
              : "Quiz abgeschlossen — gut gemacht!"}
          </p>
        )}
      </div>
    </div>
  );
}
