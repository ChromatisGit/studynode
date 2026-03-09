"use client";

import type { ReactNode } from "react";
import { TsWorkerProvider } from "@features/contentpage";
import { QuizStartBanner } from "@features/quiz/QuizStartBanner";

type CourseProvidersProps = {
  children: ReactNode;
  isLoggedIn: boolean;
  isAdmin: boolean;
};

export function CourseProviders({ children, isLoggedIn, isAdmin }: CourseProvidersProps) {
  return (
    <TsWorkerProvider>
      {isLoggedIn && !isAdmin && <QuizStartBanner />}
      {children}
    </TsWorkerProvider>
  );
}
