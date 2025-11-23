export interface DecoratorLabel {
  name: string;
  args?: Record<string, string | number | boolean>;
}

/**
 * Parse things like "@mcq[single=true]" or "@gap[mcq=true]"
 */
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
      const [rawKey, rawValue] = pair.split("=").map((s) => s.trim());
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