"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { MockAuthProvider } from "@/client/contexts/MockAuthContext";
import { RouteProvider } from "@/client/contexts/RouteContext";
import { ThemeProvider } from "@/client/contexts/ThemeContext";

export function Providers({ children }: { children: ReactNode }) {
  const toasterOffset = {
    top: "calc(var(--sn-navbar-height) + var(--sn-space-half))",
    right: "var(--sn-space-half)",
    left: "var(--sn-space-half)",
  };

  return (
    <ThemeProvider>
      <MockAuthProvider>
        <RouteProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            offset={toasterOffset}
            mobileOffset={toasterOffset}
          />
        </RouteProvider>
      </MockAuthProvider>
    </ThemeProvider>
  );
}
