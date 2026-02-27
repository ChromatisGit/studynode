"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { QuizStateDTO, QuizPhase } from "@schema/quizTypes";
import { submitQuizResponseAction } from "@actions/quizActions";
import { SingleTaskView } from "@ui/components/SingleTaskView/SingleTaskView";
import type { SingleTaskPhase } from "@ui/components/SingleTaskView/SingleTaskView";
import styles from "./QuizSession.module.css";

type Props = {
  initialState: QuizStateDTO;
  courseId: string;
  onClose: () => void;
};

function toSingleTaskPhase(quizPhase: Exclude<QuizPhase, "closed">): SingleTaskPhase {
  switch (quizPhase) {
    case "waiting":     return "waiting";
    case "active":      return "active";
    case "reveal_dist": return "reveal_dist";
    case "reveal_correct": return "reveal_correct";
  }
}

function buildTimerInfo(state: QuizStateDTO): { endsAt: Date; totalSeconds: number } | undefined {
  if (!state.timerSeconds || !state.timerStartedAt) return undefined;
  const startedAt = new Date(state.timerStartedAt);
  const endsAt = new Date(startedAt.getTime() + state.timerSeconds * 1000);
  return { endsAt, totalSeconds: state.timerSeconds };
}

export function QuizSession({ initialState, courseId, onClose }: Props) {
  const [state, setState] = useState<QuizStateDTO>(initialState);
  const [submittedIndices, setSubmittedIndices] = useState<number[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // Track which question indices we've submitted for — so we reset on question change
  const submittedQuestionRef = useRef<number | null>(null);

  // Reset submission state when question changes
  useEffect(() => {
    if (submittedQuestionRef.current !== state.currentIndex) {
      setHasSubmitted(false);
      setSubmittedIndices([]);
      submittedQuestionRef.current = null;
    }
  }, [state.currentIndex]);

  // Poll for state updates
  useEffect(() => {
    let active = true;
    let delay = 1500;
    let lastModified: string | null = null;

    const poll = async () => {
      if (!active) return;
      try {
        const headers: Record<string, string> = {};
        if (lastModified) headers["If-Modified-Since"] = lastModified;

        const res = await fetch(`/api/quiz/${courseId}/state`, { headers });

        if (res.status === 304) {
          // unchanged
        } else if (res.status === 410 || res.status === 404) {
          // Quiz closed
          active = false;
          onClose();
          return;
        } else if (res.ok) {
          const lm = res.headers.get("Last-Modified");
          if (lm) lastModified = lm;
          const data: QuizStateDTO = await res.json();
          setState(data);
          // Use faster polling during active phase
          delay = data.phase === "active" ? 1000 : 1500;
        }
      } catch {
        delay = 3000;
      }
      if (active) setTimeout(poll, delay);
    };

    const timerId = setTimeout(poll, delay);
    return () => {
      active = false;
      clearTimeout(timerId);
    };
  }, [courseId, onClose]);

  const handleSubmit = useCallback(async (selectedIndices: number[]) => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    setSubmittedIndices(selectedIndices);
    submittedQuestionRef.current = state.currentIndex;

    const result = await submitQuizResponseAction(
      state.sessionId,
      state.currentIndex,
      selectedIndices,
      false,
    );

    if (!result.ok) {
      // Submission failed — allow retry
      setHasSubmitted(false);
      submittedQuestionRef.current = null;
    }
  }, [hasSubmitted, state.sessionId, state.currentIndex]);

  const phase = toSingleTaskPhase(state.phase);
  const timer = buildTimerInfo(state);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Quiz">
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.pill}>Quiz</span>
            <span className={styles.progress}>
              Frage {state.currentIndex + 1} / {state.totalQuestions}
            </span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Quiz schließen"
          >
            ✕
          </button>
        </header>

        <div className={styles.body}>
          <SingleTaskView
            question={state.question}
            options={state.options}
            phase={phase}
            single={true}
            onSubmit={handleSubmit}
            timer={timer}
            correctIndices={state.correctIndices}
            why={state.why}
            hasSubmitted={hasSubmitted}
          />
        </div>
      </div>
    </div>
  );
}
