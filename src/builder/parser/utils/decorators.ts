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

export function parseInlineDecorators<D extends readonly string[]>(
  taskName: string,
  raw: string,
  validDecorators: D
): Record<"instruction" | D[number], string> {
  const res: Partial<Record<string, string>> = {};

  const chunks = raw.split(/\r?\n@(?=[a-z]+)/);

  res.instruction = chunks[0].trim();

  chunks.slice(1).forEach(chunk => {
    const nl = chunk.indexOf('\n');
    const key = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
    const value = (nl === -1 ? '' : chunk.slice(nl + 1)).trim();
    if (key) res[key] = value;
  });

  const valid = new Set<string>(['instruction', ...validDecorators]);

  const current = new Set(Object.keys(res));

  const missing: string[] = [];
  for (const d of valid) if (!current.has(d)) missing.push(d);

  const unknown: string[] = [];
  for (const d of current) if (!valid.has(d)) unknown.push(d);

  if (missing.length || unknown.length) {
    missing.sort(); unknown.sort();
    const parts: string[] = [];
    if (missing.length) parts.push(`missing: ${missing.map(d => `@${d}`).join(', ')}`);
    if (unknown.length) parts.push(`unknown: ${unknown.map(d => `@${d}`).join(', ')}`);
    throw new Error(`Invalid inline decorators in task "${taskName}": ${parts.join('; ')}`);
  }

  return res as Record<"instruction" | D[number], string>;
}