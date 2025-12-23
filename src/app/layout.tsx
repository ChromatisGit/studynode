import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../styles/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "StudyNode",
  description: "Lernplattform mit Next.js Komponenten",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
