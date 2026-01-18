import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { drizzle as drizzleVercel } from "drizzle-orm/vercel-postgres";

import { Pool } from "pg";
import { sql as vercelSql } from "@vercel/postgres";

const isVercel = Boolean(process.env.VERCEL);

export const db = isVercel
    ? drizzleVercel(vercelSql)
    : drizzleNode(
        new Pool({
            connectionString: process.env.DATABASE_URL,
        })
    );