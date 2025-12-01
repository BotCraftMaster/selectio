import { sql } from "drizzle-orm";
import { db } from "../client";

async function checkTables() {
  try {
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("Tables in database:");
    for (const row of result.rows) {
      console.log(`  - ${row.table_name}`);
    }
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkTables();
