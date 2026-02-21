"use server";

import { getSession } from "@services/authService";
import {
  saveTaskResponseService,
  loadWorksheetData,
  saveCheckpointResponseService,
} from "@services/worksheetService";
import type { CheckpointResponse } from "@schema/checkpointTypes";
import type { WorksheetData } from "@services/worksheetService";

export type WorksheetActionResult = { ok: true } | { ok: false; error: string };
export type WorksheetLoadResult =
  | { ok: true; data: WorksheetData }
  | { ok: false; error: string };

export async function saveTaskResponseAction(
  worksheetId: string,
  taskKey: string,
  value: string,
): Promise<WorksheetActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not authenticated" };

  try {
    await saveTaskResponseService(worksheetId, taskKey, value, session.user);
    return { ok: true };
  } catch (error) {
    console.error("[Worksheet] Failed to save task response:", error);
    return { ok: false, error: "Failed to save response" };
  }
}

export async function loadWorksheetDataAction(
  worksheetId: string,
): Promise<WorksheetLoadResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not authenticated" };

  try {
    const data = await loadWorksheetData(worksheetId, session.user);
    return { ok: true, data };
  } catch (error) {
    console.error("[Worksheet] Failed to load worksheet data:", error);
    return { ok: false, error: "Failed to load data" };
  }
}

export async function saveCheckpointAction(
  worksheetId: string,
  sectionIndex: number,
  response: CheckpointResponse,
): Promise<WorksheetActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not authenticated" };

  try {
    await saveCheckpointResponseService(worksheetId, sectionIndex, response, session.user);
    return { ok: true };
  } catch (error) {
    console.error("[Worksheet] Failed to save checkpoint:", error);
    return { ok: false, error: "Failed to save checkpoint" };
  }
}
