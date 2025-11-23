import type { RootContent } from "mdast";

import { nodeToPlainText } from "./nodeToPlainText";

export interface DecoratorLabel {
  name: string;
  args?: Record<string, string | number | boolean>;
}

export function parseDecoratorLabel(raw: string): DecoratorLabel | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("@")) return null;

  const match = /^@([a-zA-Z0-9_]+)(\[(.*)\])?$/.exec(trimmed);
  if (!match) return null;

  const name = match[1];
  const argsPart = match[3];
  const args: Record<string, string | number | boolean> = {};

  if (argsPart) {
    for (const pair of argsPart.split(",")) {
      const [rawKey, rawValue] = pair.split("=").map((segment) => segment.trim());
      if (!rawKey) continue;
      let value: string | number | boolean = rawValue ?? "";
      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (!Number.isNaN(Number(value))) value = Number(value);
      args[rawKey] = value;
    }
  }

  return { name, args };
}

export function readInlineDecorator(node: RootContent): DecoratorLabel | null {
  if (node.type !== "paragraph") return null;
  return parseDecoratorLabel(nodeToPlainText(node));
}
