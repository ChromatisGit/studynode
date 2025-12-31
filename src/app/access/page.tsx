"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";

import { useMockAuth } from "@/contexts/MockAuthContext";
import { resolveUserFromCredentials } from "@/data/auth";
import { canSeeCourse } from "@/schema/auth";
import type { CourseId } from "@/schema/course";
import { getCourseById } from "@/data/courses";

import styles from "./AccessPage.module.css";

function resolveCourseId(
  groupId: string | null,
  courseId: string | null
): CourseId | null {
  if (!courseId) return null;
  if (courseId.includes("/")) return courseId as CourseId;
  if (groupId) return `${groupId}/${courseId}` as CourseId;
  return courseId as CourseId;
}

export default function AccessPage() {
  const [accessCode, setAccessCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggleAuth, setCurrentUser, user, isAuthenticated } = useMockAuth();

  const groupId = searchParams.get("groupId");
  const courseIdParam = searchParams.get("courseId");
  const resolvedCourseId = resolveCourseId(groupId, courseIdParam);
  const course = useMemo(
    () => (resolvedCourseId ? getCourseById(resolvedCourseId) : null),
    [resolvedCourseId]
  );
  const courseName = course?.title ?? "this course";
  const isCourseJoin = Boolean(resolvedCourseId);

  useEffect(() => {
    if (!isAuthenticated || !user || !resolvedCourseId) return;
    if (!canSeeCourse(user, resolvedCourseId)) return;
    router.push(`/${resolvedCourseId}`);
  }, [isAuthenticated, resolvedCourseId, router, user]);

  const handleContinue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const hasAccessCode = accessCode.trim().length > 0;
    const hasPin = pin.trim().length > 0;

    if (!hasAccessCode && !hasPin) {
      setError("Please enter valid credentials.");
      return;
    }

    if (!hasAccessCode && hasPin && isCourseJoin) {
      toast.error("The registration window for this course is currently not open.");
      router.push("/");
      return;
    }

    if (hasAccessCode) {
      const authenticatedUser = resolveUserFromCredentials(accessCode, pin);

      if (!authenticatedUser) {
        setError("Wrong access code or PIN.");
        return;
      }

      setCurrentUser(authenticatedUser.id);

      const redirectAfterLogin = () => {
        if (isCourseJoin && resolvedCourseId) {
          if (canSeeCourse(authenticatedUser, resolvedCourseId)) {
            router.push(`/${resolvedCourseId}`);
          } else {
            toast.error(
              "You are not enrolled in this course and the registration window is not open."
            );
            router.push("/");
          }
          return;
        }

        router.push("/");
      };

      if (!isAuthenticated) {
        toggleAuth();
        setTimeout(redirectAfterLogin, 150);
        return;
      }

      redirectAfterLogin();
      return;
    }

    if (!isCourseJoin) {
      const authenticatedUser = resolveUserFromCredentials(pin, pin);

      if (authenticatedUser) {
        setCurrentUser(authenticatedUser.id);
        if (!isAuthenticated) {
          toggleAuth();
        }
        router.push("/");
        return;
      }
      setError("Wrong PIN.");
    }
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
                isCourseJoin
                  ? "Enter access code if you have one"
                  : "Enter your access code"
              }
            />
            {isCourseJoin ? (
              <p className={styles.helper}>
                If registration is open, you can use only your PIN.
              </p>
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
            />
          </div>

          {error ? <div className={styles.message}>{error}</div> : null}

          <button type="submit" className={`${styles.submitButton} button button--primary`}>
            Continue
          </button>

          <button type="button" onClick={() => router.push("/")} className={styles.linkButton}>
            Back to home
          </button>
        </form>

        <p className={styles.footer}>Need help? Contact your instructor.</p>
      </div>
    </div>
  );
}
