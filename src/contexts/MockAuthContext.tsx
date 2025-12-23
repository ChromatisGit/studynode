"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { User } from "@/schema/auth";
import { MOCK_USERS } from "@/mocks/auth";

type MockAuthContextValue = {
  isAuthenticated: boolean;
  user: User | null;
  toggleAuth: () => void;
  setCurrentUser: (userId: string) => void;
};

const MockAuthContext = createContext<MockAuthContextValue | undefined>(undefined);

const DEFAULT_USER_ID = Object.keys(MOCK_USERS)[0] ?? "student-1";

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(DEFAULT_USER_ID);

  const toggleAuth = () => {
    setIsAuthenticated((prev) => !prev);
  };

  const setCurrentUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const user = isAuthenticated ? MOCK_USERS[currentUserId] ?? null : null;

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      toggleAuth,
      setCurrentUser,
    }),
    [isAuthenticated, user]
  );

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error("useMockAuth must be used within MockAuthProvider");
  }
  return context;
}
