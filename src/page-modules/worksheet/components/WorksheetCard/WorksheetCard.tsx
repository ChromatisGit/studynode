'use client';

import clsx from "clsx";
import { AppLink } from "@components/AppLink";
import {
  ArrowUpRight,
  FileCheck2,
  FileText,
  Globe2,
  type LucideIcon,
} from "lucide-react";
import { isExternalHref } from "@/lib/links";
import type { WorksheetProcess, WorksheetRef } from "@worksheet/worksheetModel";
import styles from "./WorksheetCard.module.css";

type WorksheetCardProps = WorksheetRef & {
  className?: string;
};

type ProcessMeta = {
  icon: LucideIcon;
  label: string;
  accentClass: string;
  description: string;
  openInNewTab: boolean;
};

const PROCESS_META: Record<WorksheetProcess, ProcessMeta> = {
  web: {
    icon: Globe2,
    label: "Web",
    accentClass: styles.processWeb,
    description: "Direkt im Browser",
    openInNewTab: false,
  },
  pdf: {
    icon: FileText,
    label: "PDF",
    accentClass: styles.processPdf,
    description: "Download als PDF",
    openInNewTab: true,
  },
  pdfSolution: {
    icon: FileCheck2,
    label: "Loesung",
    accentClass: styles.processSolution,
    description: "PDF mit Loesung",
    openInNewTab: true,
  },
};

export default function WorksheetCard({
  href,
  label,
  process,
  className,
}: WorksheetCardProps) {
  const meta = PROCESS_META[process];
  const linkTarget = meta.openInNewTab || isExternalHref(href) ? "_blank" : undefined;

  const card = (
    <>
      <div className={styles.iconBubble}>
        <meta.icon size={22} aria-hidden />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{label}</h3>
          <span className={styles.badge}>{meta.label}</span>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaText}>{meta.description}</span>
          <ArrowUpRight size={16} aria-hidden />
        </div>
      </div>
    </>
  );

  return (
    <div className={clsx(styles.column, className)}>
      <AppLink
        href={href}
        className={clsx(styles.card, meta.accentClass)}
        target={linkTarget}
        aria-label={`${label} (${meta.label})`}
      >
        {card}
      </AppLink>
    </div>
  );
}
