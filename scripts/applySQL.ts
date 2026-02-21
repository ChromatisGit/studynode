import { readFile } from "@pipeline/io";
import postgres from "postgres";

const file = ".generatedScripts/courses.sql";

async function main() {
  const content = (await readFile(file)).trim();
  if (!content) {
    console.log(`[applySQL] ${file} empty, nothing to do`);
    return;
  }

  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("Missing POSTGRES_URL");

  const sql = postgres(url);
  await sql.unsafe(content);
  await sql.end();

  console.log(`[applySQL] Applied ${file}`);
}

main().catch((err) => {
  console.error("[applySQL] Failed:", err);
  process.exit(1);
});
