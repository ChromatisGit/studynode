import { readFile } from "node:fs/promises";

import type { RenderMode, Worksheet } from "@worksheet/types";
import { WorksheetParser } from "@worksheet/parser/parserClass";

export async function buildWorksheetData(
  typstPath: string,
  format: RenderMode
): Promise<Worksheet> {
  const rawContent = await readFile(typstPath, "utf8");
  const parser = new WorksheetParser(typstPath, rawContent);
  return parser.parse(format);
}
