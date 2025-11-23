import type { RootContent } from "mdast";

export function parserError(
  filePath: string,
  node: RootContent,
  message: string,
): Error {
  const line = node.position?.start?.line;
  const prefix = line != null ? `${filePath}:${line}` : filePath;
  return new Error(`${prefix}: ${message}`);
}
