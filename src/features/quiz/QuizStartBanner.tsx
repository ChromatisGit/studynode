"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { StudentStreamEvent, StudentSnapshot } from "@schema/streamTypes";
import { useQuizStream } from "./hooks/useQuizStream";

const COUNTDOWN_SECONDS = 3;

/**
 * Mounts a student WebSocket listener at the course level.
 * When a QUIZ_STARTED event arrives, shows a countdown banner then
 * navigates to /quiz. Renders nothing when no quiz is active.
 *
 * Only renders for logged-in non-admin users (admin doesn't need auto-routing).
 */
export function QuizStartBanner() {
  const router = useRouter();
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    if (countdownRef.current) return; // already running
    setCountdown(COUNTDOWN_SECONDS);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          router.push("/quiz");
          return null;
        }
        return c - 1;
      });
    }, 1000);
  }, [router]);

  const onEvent = useCallback((event: StudentStreamEvent) => {
    switch (event.type) {
      case "INIT": {
        // If there's already an active quiz on mount, navigate immediately
        const init = event as StudentSnapshot;
        if (init.quiz && init.quiz.phase !== "waiting") {
          router.push("/quiz");
        }
        break;
      }
      case "QUIZ_STARTED": {
        // Only redirect if student is not already on /quiz
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/quiz")) {
          startCountdown();
        }
        break;
      }
    }
  }, [router, startCountdown]);

  useQuizStream({ onEvent });

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  if (countdown === null) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "var(--sn-accent)",
        color: "#fff",
        padding: "0.75rem 1.5rem",
        borderRadius: "var(--sn-radius-md)",
        fontWeight: 600,
        fontSize: "1rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
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
