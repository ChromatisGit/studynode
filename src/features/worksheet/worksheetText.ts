import type { RawText } from "@domain/page";

export function getRawText(value: RawText | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "rawText" in value) {
    const raw = (value as { rawText?: unknown }).rawText;
    return typeof raw === "string" ? raw : null;
  }
  return null;
}
