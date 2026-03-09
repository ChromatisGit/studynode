"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { StudentStreamEvent, StudentSnapshot } from "@schema/streamTypes";
import { useQuizStream } from "./hooks/useQuizStream";

const COUNTDOWN_SECONDS = 3;

const bannerBase: React.CSSProperties = {
  position: "fixed",
  top: "1rem",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 9999,
  color: "#fff",
  padding: "0.75rem 1.5rem",
  borderRadius: "var(--sn-radius-md)",
  fontWeight: 600,
  fontSize: "1rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  whiteSpace: "nowrap",
};

/**
 * Global student quiz banner — mounts in the app Layout.
 * - When QUIZ_STARTED fires: shows a countdown then navigates to /quiz.
 * - When a quiz is active and student is not on /quiz: shows a "Zurück zum Quiz" nudge.
 * - Renders nothing on /quiz or when no quiz is active.
 */
export function QuizStartBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [quizActive, setQuizActive] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStartedRef = useRef(false);

  const isOnQuizPage = pathname?.startsWith("/quiz") ?? false;

  // Navigate when countdown completes
  useEffect(() => {
    if (hasStartedRef.current && countdown === null) {
      hasStartedRef.current = false;
      router.push("/quiz");
    }
  }, [countdown, router]);

  const startCountdown = useCallback(() => {
    if (countdownRef.current) return; // already running
    hasStartedRef.current = true;
    setCountdown(COUNTDOWN_SECONDS);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return null;
        }
        return c - 1;
      });
    }, 1000);
  }, [router]);

  const onEvent = useCallback((event: StudentStreamEvent) => {
    switch (event.type) {
      case "INIT": {
        const init = event as StudentSnapshot;
        const active = !!init.quiz && init.quiz.phase !== "waiting";
        setQuizActive(active);
        break;
      }
      case "QUIZ_STATE": {
        const active = !!event.quiz && event.quiz.phase !== "waiting";
        setQuizActive(active);
        if (!active) {
          // Quiz closed — cancel any in-progress countdown
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          hasStartedRef.current = false;
          setCountdown(null);
        }
        break;
      }
      case "QUIZ_STARTED": {
        setQuizActive(true);
        if (!isOnQuizPage) startCountdown();
        break;
      }
    }
  }, [startCountdown, isOnQuizPage]);

  useQuizStream({ onEvent });

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Never show on the quiz page itself
  if (isOnQuizPage) return null;

  // Countdown banner (quiz just started)
  if (countdown !== null) {
    return (
      <div style={{ ...bannerBase, background: "var(--sn-accent)" }}>
        <span>Quiz startet</span>
        <span
          style={{
            background: "rgba(255,255,255,0.25)",
            borderRadius: "50%",
            width: "2em",
            height: "2em",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {countdown}
        </span>
      </div>
    );
  }

  // Persistent nudge when quiz is active and student has navigated away
  if (quizActive) {
    return (
      <button
        type="button"
        onClick={() => router.push("/quiz")}
        style={{
          ...bannerBase,
          background: "var(--sn-accent)",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span>Quiz läuft</span>
        <span style={{ opacity: 0.85, fontWeight: 400 }}>→ Zum Quiz</span>
      </button>
    );
  }

  return null;
}
