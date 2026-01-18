import { readFile } from "@pipeline/io";

const file = ".generatedScripts/courses.sql";

const isVercel = Boolean(process.env.VERCEL);

async function main() {
  const content = (await readFile(file)).trim();
  if (!content) {
    console.log(`[applySQL] ${file} empty, nothing to do`);
    return;
  }

  if (isVercel) {
    const { sql } = await import("@vercel/postgres");
    await sql.query(content);
    console.log(`[applySQL] Applied ${file} via @vercel/postgres (Vercel)`);
    return;
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL for local applySQL");

  const pg = await import("pg");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  await client.query(content);
  await client.end();

  console.log(`[applySQL] Applied ${file} via pg (local)`);
}

main().catch((err) => {
  console.error("[applySQL] Failed:", err);
  process.exit(1);
});
