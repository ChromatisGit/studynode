"use client";

import { useState, useEffect, useCallback } from "react";
import type { QuizStateDTO } from "@schema/quizTypes";
import { joinQuizAction } from "@actions/quizActions";
import { QuizSession } from "./QuizSession";
import styles from "./QuizBanner.module.css";

type Props = {
  courseId: string;
};

export function QuizBanner({ courseId }: Props) {
  const [quizState, setQuizState] = useState<QuizStateDTO | null>(null);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Poll for active quiz
  useEffect(() => {
    let active = true;
    let pollDelay = 2000;
    let lastModified: string | null = null;

    const poll = async () => {
      if (!active) return;
      try {
        const headers: Record<string, string> = {};
        if (lastModified) headers["If-Modified-Since"] = lastModified;

        const res = await fetch(`/api/quiz/${courseId}/state`, { headers });

        if (res.status === 304) {
          // unchanged — keep current state
        } else if (res.status === 410 || res.status === 404) {
          setQuizState(null);
          setSessionOpen(false);
          pollDelay = 3000;
        } else if (res.ok) {
          const lm = res.headers.get("Last-Modified");
          if (lm) lastModified = lm;
          const data: QuizStateDTO = await res.json();
          setQuizState(data);
          pollDelay = 2000;
        }
      } catch {
        // network error — back off quietly
        pollDelay = 4000;
      }
      if (active) setTimeout(poll, pollDelay);
    };

    poll();
    return () => { active = false; };
  }, [courseId]);

  const handleJoin = useCallback(async () => {
    if (!quizState || joining) return;
    setJoining(true);
    setJoinError(null);
    const result = await joinQuizAction(quizState.sessionId);
    setJoining(false);
    if (!result.ok) {
      setJoinError(result.error);
      return;
    }
    setSessionOpen(true);
  }, [quizState, joining]);

  const handleClose = useCallback(() => setSessionOpen(false), []);

  if (!quizState) return null;

  return (
    <>
      {!sessionOpen && (
        <div className={styles.banner} role="status" aria-live="polite">
          <div className={styles.bannerContent}>
            <span className={styles.pill}>Quiz läuft</span>
            <span className={styles.bannerText}>
              {quizState.phase === "waiting"
                ? "Dein Lehrer startet gleich ein Quiz"
                : `Frage ${quizState.currentIndex + 1} von ${quizState.totalQuestions}`}
            </span>
          </div>
          {joinError && <span className={styles.joinError}>{joinError}</span>}
          <button
            type="button"
            className={styles.joinBtn}
            onClick={handleJoin}
            disabled={joining}
          >
            {joining ? "…" : "Mitmachen"}
          </button>
        </div>
      )}

      {sessionOpen && quizState && (
        <QuizSession
          initialState={quizState}
          courseId={courseId}
          onClose={handleClose}
        />
      )}
    </>
  );
}
