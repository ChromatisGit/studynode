"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";

import styles from "./AccessSection.module.css";
import { useMockAuth } from "@/client/contexts/MockAuthContext";
import { continueAccessAction } from "@/server/auth/accessAction";

type AccessSectionProps = {
  isCourseJoin: boolean;
  groupKey: string | null;
  courseId: string | null;
  courseRoute: string | null;
  courseName: string;
  isRegistrationOpen: boolean;
};

export default function AccessSection({
  isCourseJoin,
  groupKey,
  courseId,
  courseRoute,
  courseName,
  isRegistrationOpen,
}: AccessSectionProps) {
  const [accessCode, setAccessCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const auth = useMockAuth();

  // Note: We don't attempt client-side redirect for course join.
  // The server will validate access and redirect appropriately in continueAccessAction.

  const handleContinue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await continueAccessAction({
        accessCode,
        pin,
        ctx: {
          isCourseJoin,
          groupKey,
          courseId,
          courseRoute,
          isRegistrationOpen,
        },
        currentUserId: auth.user?.id ?? null,
      });

      if (!result.ok) {
        setError(result.error);
        if (result.redirectTo) {
          router.push(result.redirectTo);
        }

        toast.error(result.error);
        return;
      }

      // Update mock auth with the user that the server action decided on
      auth.setSession(result.session);

      router.refresh(); // Force server to re-fetch session
      router.push(result.redirectTo);
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <BookOpen size={28} aria-hidden />
          </div>
          <h1 className={styles.title}>
            {isCourseJoin ? `Join ${courseName}` : "Welcome to StudyNode"}
          </h1>
          <p className={styles.subtitle}>
            {isCourseJoin
              ? "Enter your credentials to join this course."
              : "Enter your credentials to continue."}
          </p>
        </header>

        <form onSubmit={handleContinue} className={styles.form}>
          <div>
            <label htmlFor="accessCode" className={styles.labelRow}>
              Access Code
              {isCourseJoin ? <span className={styles.optional}>(Optional)</span> : null}
            </label>
            <input
              id="accessCode"
              type="text"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              className={styles.input}
              placeholder={
                isCourseJoin ? "Enter access code if you have one" : "Enter your access code"
              }
              disabled={isPending}
            />
            {isCourseJoin ? (
              <p className={styles.helper}>If registration is open, you can use only your PIN.</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="pin" className={styles.labelRow}>
              PIN
            </label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              className={styles.input}
              placeholder="Enter your PIN"
              disabled={isPending}
            />
          </div>

          {error ? <div className={styles.message}>{error}</div> : null}

          <button
            type="submit"
            className={`${styles.submitButton} button button--primary`}
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Continue"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className={styles.linkButton}
            disabled={isPending}
          >
            Back to home
          </button>
        </form>

        <p className={styles.footer}>Need help? Contact your instructor.</p>
      </div>
    </div>
  );
}
