"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, ClipboardList, Timer, Users } from "lucide-react";
import { joinQuizAction, submitQuizResponseAction } from "@actions/quizActions";
import type { QuizStateDTO } from "@schema/quizTypes";
import type { StudentStreamEvent, StudentSnapshot } from "@schema/streamTypes";
import { useQuizStream } from "./hooks/useQuizStream";
import { renderInlineMarkdown } from "@ui/lib/renderInlineMarkdown";
import styles from "./QuizPage.module.css";

type QuizPageProps = {
  /** Initial quiz state from server-side render; null = no active quiz. */
  initialState: QuizStateDTO | null;
};

export function QuizPage({ initialState }: QuizPageProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizStateDTO | null>(initialState);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const lastIndexRef = useRef<number | null>(initialState?.currentIndex ?? null);
  const lastSessionRef = useRef<string | null>(initialState?.sessionId ?? null);
  /** ms to add to Date.now() to approximate server time; corrects client clock skew */
  const serverOffsetRef = useRef(0);

  // Score tracking
  const [correctCount, setCorrectCount] = useState(0);
  const correctCountRef = useRef(0);
  const scoredQuestionRef = useRef(-1);

  // End-of-quiz redirect state
  const [quizEndScore, setQuizEndScore] = useState<{ correct: number; total: number } | null>(null);
  const [homeCountdown, setHomeCountdown] = useState<number | null>(null);
  const homeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasActiveRef = useRef(!!initialState);
  const prevTotalRef = useRef<number>(initialState?.totalQuestions ?? 0);

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

  // Accumulate score: increment once per question when correct answer is revealed
  useEffect(() => {
    if (
      quiz?.phase === "reveal_correct" &&
      quiz.correctIndices &&
      quiz.currentIndex !== scoredQuestionRef.current
    ) {
      scoredQuestionRef.current = quiz.currentIndex;
      if (selectedAnswer !== null && quiz.correctIndices.includes(selectedAnswer)) {
        correctCountRef.current += 1;
        setCorrectCount(correctCountRef.current);
      }
    }
  }, [quiz?.phase, quiz?.currentIndex, quiz?.correctIndices, selectedAnswer]);

  // Detect quiz close → capture score and start home redirect countdown
  useEffect(() => {
    if (quiz !== null) {
      wasActiveRef.current = true;
      prevTotalRef.current = quiz.totalQuestions;
      return;
    }
    if (!wasActiveRef.current) return;
    wasActiveRef.current = false;
    setQuizEndScore({ correct: correctCountRef.current, total: prevTotalRef.current });
    setHomeCountdown(5);
    homeIntervalRef.current = setInterval(() => {
      setHomeCountdown((c) => {
        if (c === null || c <= 1) {
          clearInterval(homeIntervalRef.current!);
          homeIntervalRef.current = null;
          router.push("/home");
          return null;
        }
        return c - 1;
      });
    }, 1000);
  }, [quiz, router]);

  // Cleanup home redirect interval on unmount
  useEffect(() => {
    return () => {
      if (homeIntervalRef.current) clearInterval(homeIntervalRef.current);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!quiz?.timerSeconds || !quiz.timerStartedAt || quiz.phase !== "active") {
      setTimeLeft(null);
      return;
    }
    const end = new Date(quiz.timerStartedAt).getTime() + quiz.timerSeconds * 1000;
    const tick = () => {
      const remaining = Math.max(0, Math.round((end - (Date.now() + serverOffsetRef.current)) / 1000));
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
        serverOffsetRef.current = new Date(init.serverNow).getTime() - Date.now();
        setQuiz(init.quiz);
        break;
      }
      case "QUIZ_STATE":
        setQuiz((prev) => {
          const next = event.quiz;
          // Discard stale Ably events that arrive after a fresher DB snapshot
          if (prev?.updatedAt && next?.updatedAt && next.updatedAt < prev.updatedAt) {
            return prev;
          }
          return next;
        });
        break;
      case "QUIZ_STARTED":
        // Do nothing — the QUIZ_STATE event that follows will update the quiz state
        break;
    }
  }, []);

  useQuizStream({ onEvent });

  const handleAnswerClick = async (i: number) => {
    if (!quiz || quiz.phase !== "active" || hasSubmitted) return;
    setSelectedAnswer(i);
    setHasSubmitted(true);
    await submitQuizResponseAction(quiz.sessionId, quiz.currentIndex, [i], false);
  };

  // ── Quiz ended → show score + redirect to /home ─────────────────────────────
  if (!quiz && quizEndScore !== null && homeCountdown !== null) {
    return (
      <div className={styles.endOverlay}>
        <div className={styles.endCard}>
          <span className={styles.endIcon}>🏁</span>
          <p className={styles.endTitle}>Quiz beendet!</p>
          <div className={styles.endScore}>
            <p className={styles.endScoreValue}>
              {quizEndScore.correct} / {quizEndScore.total}
            </p>
            <p className={styles.endScoreLabel}>richtig beantwortet</p>
          </div>
          <div className={styles.countdownRing}>{homeCountdown}</div>
          <p className={styles.endSubtitle}>Weiterleitung zur Startseite…</p>
        </div>
      </div>
    );
  }

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
  const isLastReveal =
    quiz.phase === "reveal_correct" && quiz.currentIndex + 1 >= quiz.totalQuestions;
  const scorePct = quiz.totalQuestions > 0 ? correctCount / quiz.totalQuestions : 0;
  const scoreMessage =
    scorePct === 1
      ? "Perfekt — alles richtig! 🎉"
      : scorePct >= 0.75
        ? "Sehr gut gemacht! 👏"
        : scorePct >= 0.5
          ? "Gut gemacht!"
          : "Weiter üben!";

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
          <p className={styles.question}>{renderInlineMarkdown(quiz.question)}</p>

          {!isLastReveal && (
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
                    onClick={() => handleAnswerClick(i)}
                    disabled={quiz.phase !== "active" || hasSubmitted}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                    <span className={styles.optionText}>{renderInlineMarkdown(option)}</span>
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
          )}
        </div>

        {/* Actions / status */}
        {quiz.phase === "active" && hasSubmitted && (
          <div className={styles.actions}>
            <p className={styles.submitted}>Antwort abgeschickt — warte auf Ergebnisse…</p>
          </div>
        )}

        {quiz.phase === "reveal_dist" && (
          <p className={styles.statusMsg}>Auswertung folgt…</p>
        )}

        {quiz.phase === "reveal_correct" && quiz.why && (
          <div className={styles.explanation}>
            <p className={styles.explanationLabel}>Erklärung</p>
            <p className={styles.explanationText}>{renderInlineMarkdown(quiz.why)}</p>
          </div>
        )}

        {isLastReveal && (
          <div className={styles.scoreCard}>
            <span className={styles.scoreEmoji}>🏆</span>
            <p className={styles.scoreFraction}>
              {correctCount} / {quiz.totalQuestions}
            </p>
            <p className={styles.scoreSubLabel}>richtig beantwortet</p>
            <p className={styles.scoreMessage}>{scoreMessage}</p>
          </div>
        )}

        {!isLastReveal && quiz.phase === "reveal_correct" && (
          <p className={styles.statusMsg}>Nächste Frage kommt…</p>
        )}
      </div>
    </div>
  );
}
