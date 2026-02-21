"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { WorksheetStorage } from './WorksheetStorage';
import type { Section } from '@schema/page';
import { MacroStateProvider } from '@macros/state/MacroStateContext';
import { createWorksheetAdapter } from '@macros/state/WorksheetStorageAdapter';
import {
  loadWorksheetDataAction,
  saveTaskResponseAction,
  saveCheckpointAction,
} from '@actions/worksheetActions';

const WorksheetStorageContext = createContext<WorksheetStorage | null>(null);

interface WorksheetStorageProviderProps {
  worksheetSlug?: string;
  pageContent?: Section[];
  storage?: WorksheetStorage | null;
  /** Pass the authenticated user's ID to enable DB sync. */
  userId?: string;
  children: ReactNode;
}

/**
 * Provides worksheet storage context for persisting task responses.
 * Can be used in two modes:
 * 1. Auto mode: Pass worksheetSlug and pageContent to auto-initialize storage
 * 2. Manual mode: Pass pre-initialized storage instance directly
 *
 * When userId is provided (authenticated user), DB sync is enabled:
 * - On mount: DB data is loaded and merged into localStorage (DB is authoritative)
 * - On save: localStorage is written first, then DB is updated fire-and-forget
 */
export function WorksheetStorageProvider({
  worksheetSlug,
  pageContent,
  storage: manualStorage,
  userId,
  children
}: WorksheetStorageProviderProps) {
  const [autoStorage, setAutoStorage] = useState<WorksheetStorage | null>(null);
  const pathname = usePathname();

  const worksheetSignature = useMemo(
    () => {
      if (!pageContent) return undefined;
      return WorksheetStorage.computeSignature({ content: pageContent });
    },
    [pageContent]
  );

  useEffect(() => {
    // If manual storage is provided, don't initialize auto storage
    if (manualStorage !== undefined) {
      return;
    }

    if (!WorksheetStorage.isAvailable()) {
      setAutoStorage(null);
      return;
    }

    if (!worksheetSignature) {
      setAutoStorage(null);
      return;
    }

    const slug = worksheetSlug || pathname || "worksheet";
    const instance = WorksheetStorage.forWorksheet(slug, worksheetSignature);

    if (userId) {
      // Wire fire-and-forget DB sync callbacks
      instance.onSave = (taskKey, value) => {
        void saveTaskResponseAction(slug, taskKey, value);
      };
      instance.onCheckpointSave = (sectionIndex, response) => {
        void saveCheckpointAction(slug, sectionIndex, response);
      };

      // Load from DB and merge into localStorage (DB is authoritative on load)
      loadWorksheetDataAction(slug).then((result) => {
        if (result.ok) {
          instance.mergeDbData(result.data.taskResponses, result.data.checkpointResponses);
        }
      });
    }

    setAutoStorage(instance);
  }, [pathname, worksheetSignature, worksheetSlug, manualStorage, userId]);

  const storage = manualStorage !== undefined ? manualStorage : autoStorage;
  const worksheetInstanceKey = storage?.worksheetId ?? "worksheet";

  const content = (
    <WorksheetStorageContext.Provider value={storage} key={worksheetInstanceKey}>
      {children}
    </WorksheetStorageContext.Provider>
  );

  // Also provide the unified MacroStateAdapter for macros using useMacroValue
  if (storage) {
    const adapter = createWorksheetAdapter(storage);
    return <MacroStateProvider adapter={adapter}>{content}</MacroStateProvider>;
  }

  return content;
}

export function useWorksheetStorage(): WorksheetStorage | null {
  return useContext(WorksheetStorageContext);
}
