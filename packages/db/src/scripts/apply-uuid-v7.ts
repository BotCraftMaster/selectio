import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";
import { db } from "../client";

async function applyUuidV7Function() {
  try {
    const sqlContent = readFileSync(
      join(import.meta.dir, "uuid-v7.sql"),
      "utf-8",
    );

    await db.execute(sql.raw(sqlContent));

    console.log("✅ UUID v7 function updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error applying UUID v7 function:", error);
    process.exit(1);
  }
}

applyUuidV7Function();
