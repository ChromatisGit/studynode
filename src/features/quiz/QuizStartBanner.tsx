"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { StudentStreamEvent, StudentSnapshot } from "@schema/streamTypes";
import { useQuizStream } from "./hooks/useQuizStream";
import styles from "./QuizStartBanner.module.css";

const COUNTDOWN_SECONDS = 3;

/**
 * Mounts a student WebSocket listener at the course level.
 * When a QUIZ_STARTED event arrives (or a quiz is already active on mount),
 * shows a countdown card then navigates to /quiz.
 * Renders nothing when no quiz is active.
 *
 * Only renders for logged-in non-admin users (admin doesn't need auto-routing).
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
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/quiz")) return;
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
        if (init.quiz && init.quiz.phase !== "waiting") {
          startCountdown();
        }
        break;
      }
      case "QUIZ_STARTED": {
        startCountdown();
        break;
      }
    }
  }, [startCountdown]);

  useQuizStream({ onEvent });

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Never show on the quiz page itself
  if (isOnQuizPage) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <span className={styles.icon}>📋</span>
        <p className={styles.title}>Quiz startet gleich!</p>
        <div className={styles.countdownRing}>{countdown}</div>
        <p className={styles.subtitle}>Du wirst automatisch weitergeleitet…</p>
      </div>
    </div>
  );
}
