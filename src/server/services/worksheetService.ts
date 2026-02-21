import "server-only";

import { userSQL } from "@db/runSQL";
import type { CheckpointResponse, UnderstandingLevel, DifficultyCause } from "@schema/checkpointTypes";
import type { UserDTO } from "@services/userService";

export type WorksheetData = {
  taskResponses: Record<string, string>;
  checkpointResponses: Record<number, CheckpointResponse>;
};

/**
 * Save a single task response to the DB.
 * Fire-and-forget friendly — callers may not await errors.
 */
export async function saveTaskResponseService(
  worksheetId: string,
  taskKey: string,
  value: string,
  user: UserDTO,
): Promise<void> {
  await userSQL(user)`
    INSERT INTO task_responses (user_id, worksheet_id, task_key, value, updated_at)
    VALUES (${user.id}, ${worksheetId}, ${taskKey}, ${value}, NOW())
    ON CONFLICT (user_id, worksheet_id, task_key)
    DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

/**
 * Load all task + checkpoint responses for a worksheet.
 */
export async function loadWorksheetData(
  worksheetId: string,
  user: UserDTO,
): Promise<WorksheetData> {
  const run = userSQL(user);
  const [taskRows, checkpointRows] = await Promise.all([
    run<{ task_key: string; value: string }[]>`
      SELECT task_key, value
      FROM task_responses
      WHERE user_id = ${user.id} AND worksheet_id = ${worksheetId}
    `,
    run<{
      section_index: number;
      understanding_level: UnderstandingLevel;
      difficulty_causes: DifficultyCause[] | null;
      submitted_at: Date;
    }[]>`
      SELECT section_index, understanding_level, difficulty_causes, submitted_at
      FROM checkpoint_responses
      WHERE user_id = ${user.id} AND worksheet_id = ${worksheetId}
    `,
  ]);

  const taskResponses = Object.fromEntries(taskRows.map((r) => [r.task_key, r.value]));
  const checkpointResponses = Object.fromEntries(
    checkpointRows.map((r) => [
      r.section_index,
      {
        understanding: r.understanding_level,
        causes: r.difficulty_causes ?? undefined,
        submittedAt: r.submitted_at.getTime(),
      } satisfies CheckpointResponse,
    ]),
  );

  return { taskResponses, checkpointResponses };
}

/**
 * Save a checkpoint response to the DB.
 */
export async function saveCheckpointResponseService(
  worksheetId: string,
  sectionIndex: number,
  response: CheckpointResponse,
  user: UserDTO,
): Promise<void> {
  const causes = response.causes ?? null;
  await userSQL(user)`
    INSERT INTO checkpoint_responses
      (user_id, worksheet_id, section_index, understanding_level, difficulty_causes, submitted_at)
    VALUES (
      ${user.id},
      ${worksheetId},
      ${sectionIndex},
      ${response.understanding as UnderstandingLevel},
      ${causes as DifficultyCause[] | null},
      to_timestamp(${response.submittedAt} / 1000.0)
    )
    ON CONFLICT (user_id, worksheet_id, section_index)
    DO UPDATE SET
      understanding_level = EXCLUDED.understanding_level,
      difficulty_causes   = EXCLUDED.difficulty_causes,
      submitted_at        = EXCLUDED.submitted_at
  `;
}
