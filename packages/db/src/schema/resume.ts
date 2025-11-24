import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { user } from "./auth";

export const Resume = pgTable("resume", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: t.varchar({ length: 256 }).notNull(),
  fileUrl: t.text("file_url").notNull(),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t
    .timestamp("updated_at", { mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CreateResumeSchema = createInsertSchema(Resume, {
  title: z.string().min(1).max(256),
  fileUrl: z.string().url(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
