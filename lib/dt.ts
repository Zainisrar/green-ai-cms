import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Load environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // e.g. postgresql://user:password@host:5432/dbname
});

export const db = drizzle(pool);
