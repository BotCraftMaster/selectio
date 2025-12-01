import { sql } from "drizzle-orm";
import { db } from "../client";

async function checkSchema() {
  try {
    const result = await db.execute(sql`
      SELECT column_name, column_default, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'workspaces' AND column_name = 'id'
    `);

    console.log("Schema info:", result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkSchema();
