"use client";

import { useState, useOptimistic, useTransition } from "react";
import type { CourseId, ProgressTopicDTO } from "@schema/courseTypes";
import type { AdminWorksheetRef } from "@services/courseService";
import { toggleWorksheetVisibilityAction } from "@actions/adminActions";
import { WorksheetMonitor } from "./WorksheetMonitor";
import styles from "./WorksheetManagement.module.css";
import ADMIN_TEXT from "./admin.de.json";

const TEXT = ADMIN_TEXT.courseDetail.worksheetManagement;

interface WorksheetManagementProps {
  courseId: CourseId;
  worksheets: AdminWorksheetRef[];
  topics: ProgressTopicDTO[];
}

interface WorksheetRowProps {
  courseId: CourseId;
  worksheet: AdminWorksheetRef;
  isMonitorOpen: boolean;
  onToggleMonitor: () => void;
}

function WorksheetRow({ courseId, worksheet, isMonitorOpen, onToggleMonitor }: WorksheetRowProps) {
  const [optimisticHidden, setOptimisticHidden] = useOptimistic(worksheet.isHidden);
  const [, startTransition] = useTransition();

  const handleToggle = () => {
    const newHidden = !optimisticHidden;
    startTransition(async () => {
      setOptimisticHidden(newHidden);
      await toggleWorksheetVisibilityAction(courseId, worksheet.worksheetId, newHidden);
    });
  };

  return (
    <div className={styles.worksheetRow}>
      <div className={styles.worksheetInfo}>
        <span className={styles.worksheetLabel}>{worksheet.label}</span>
        <span className={styles.worksheetFilename}>{worksheet.sourceFilename}</span>
      </div>
      <div className={styles.worksheetActions}>
        <button
          className={optimisticHidden ? styles.toggleHidden : styles.toggleVisible}
          onClick={handleToggle}
          title={optimisticHidden ? TEXT.hidden : TEXT.visible}
        >
          {optimisticHidden ? TEXT.hidden : TEXT.visible}
        </button>
        <button
          className={isMonitorOpen ? styles.monitorButtonActive : styles.monitorButton}
          onClick={onToggleMonitor}
        >
          {isMonitorOpen ? TEXT.closeMonitor : TEXT.monitorButton}
        </button>
      </div>
      {isMonitorOpen && (
        <WorksheetMonitor courseId={courseId} worksheetId={worksheet.worksheetId} />
      )}
    </div>
  );
}

export function WorksheetManagement({ courseId, worksheets, topics }: WorksheetManagementProps) {
  const [openMonitorId, setOpenMonitorId] = useState<string | null>(null);

  // Build a lookup: chapterId → chapter label (from ProgressDTO topics)
  const chapterLabels: Record<string, string> = {};
  for (const topic of topics) {
    for (const chapter of topic.chapters) {
      chapterLabels[chapter.chapterId] = chapter.label;
    }
  }

  // Group worksheets by chapterId, preserving order
  const chapterOrder: string[] = [];
  const byChapter: Record<string, AdminWorksheetRef[]> = {};
  for (const ws of worksheets) {
    if (!byChapter[ws.chapterId]) {
      byChapter[ws.chapterId] = [];
      chapterOrder.push(ws.chapterId);
    }
    byChapter[ws.chapterId].push(ws);
  }

  if (worksheets.length === 0) {
    return <p className={styles.empty}>{TEXT.noData}</p>;
  }

  return (
    <div className={styles.container}>
      {chapterOrder.map((chapterId) => (
        <div key={chapterId} className={styles.chapter}>
          <h3 className={styles.chapterTitle}>
            {chapterLabels[chapterId] ?? chapterId}
          </h3>
          <div className={styles.worksheetList}>
            {byChapter[chapterId].map((ws) => {
              const monitorKey = `${ws.chapterId}:${ws.worksheetId}`;
              return (
                <WorksheetRow
                  key={ws.worksheetId}
                  courseId={courseId}
                  worksheet={ws}
                  isMonitorOpen={openMonitorId === monitorKey}
                  onToggleMonitor={() =>
                    setOpenMonitorId((prev) => (prev === monitorKey ? null : monitorKey))
                  }
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
