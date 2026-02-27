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
  const [lastModified, setLastModified] = useState<string | null>(null);

  // Poll for active quiz
  useEffect(() => {
    let active = true;
    let pollDelay = 2000;

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
          if (lm) setLastModified(lm);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleJoin = useCallback(async () => {
    if (!quizState || joining) return;
    setJoining(true);
    await joinQuizAction(quizState.sessionId);
    setJoining(false);
    setSessionOpen(true);
  }, [quizState, joining]);

  // Auto-open if already in a session that progressed
  useEffect(() => {
    if (quizState && sessionOpen) return; // already open
  }, [quizState, sessionOpen]);

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
          onClose={() => setSessionOpen(false)}
        />
      )}
    </>
  );
}
