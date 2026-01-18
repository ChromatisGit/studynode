import type { Config } from "drizzle-kit";
import { config as dotenvConfig } from "dotenv";

if (!process.env.VERCEL) {
  dotenvConfig({ path: ".env.local" });
}

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!url) {
  throw new Error(
    "Missing DB connection env var (DATABASE_URL / POSTGRES_URL / POSTGRES_PRISMA_URL)"
  );
}

export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
} satisfies Config;
