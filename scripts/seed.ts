/**
 * Database seed script.
 *
 * Applies the schema (scripts/schema.sql) then the course data
 * (generated .generatedScripts/courses.sql).
 *
 * Run with: bun scripts/seed.ts
 *
 * Requires POSTGRES_URL or DATABASE_URL environment variable.
 */

import postgres from "postgres";
import { readFile } from "fs/promises";
import path from "path";

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: POSTGRES_URL or DATABASE_URL environment variable is required.");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

/** Resolve \ir (include-relative) metacommands recursively, since postgres
 *  library sends raw SQL and PostgreSQL itself doesn't understand \ir. */
async function resolveIncludes(filePath: string): Promise<string> {
  const dir = path.dirname(filePath);
  const raw = await readFile(filePath, "utf-8");
  // Normalise all line endings to LF so the regex reliably matches \ir lines.
  const content = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = content.split("\n");
  const resolved: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\\ir\s+(\S+)\s*$/);
    if (match) {
      const includePath = path.resolve(dir, match[1]);
      resolved.push(await resolveIncludes(includePath));
    } else {
      resolved.push(line);
    }
  }
  return resolved.join("\n");
}

async function runSqlFile(filePath: string, label: string): Promise<void> {
  console.log(`[seed] Running ${label}...`);
  const content = await resolveIncludes(filePath);
  await sql.unsafe(content);
  console.log(`[seed] ${label} done.`);
}

async function main() {
  const schemaPath = path.resolve(import.meta.dir, "./schema.sql");
  const dataPath = path.resolve(import.meta.dir, "../.generatedScripts/courses.sql");

  try {
    await runSqlFile(schemaPath, "schema.sql");
    await runSqlFile(dataPath, "courses.sql");
    console.log("[seed] All done.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
