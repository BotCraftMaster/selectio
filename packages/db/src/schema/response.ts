import { sql } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { user } from "./auth";
import { Resume } from "./resume";
import { Vacancy } from "./vacancy";

export const responseStatusEnum = pgEnum("response_status", [
  "pending",
  "reviewed",
  "interview",
  "rejected",
  "offer",
]);

export const Response = pgTable("response", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  vacancyId: t
    .uuid("vacancy_id")
    .notNull()
    .references(() => Vacancy.id, { onDelete: "cascade" }),
  candidateId: t
    .text("candidate_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  resumeId: t
    .uuid("resume_id")
    .notNull()
    .references(() => Resume.id, { onDelete: "cascade" }),
  coverLetter: t.text("cover_letter"),
  status: responseStatusEnum().notNull().default("pending"),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t
    .timestamp("updated_at", { mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CreateResponseSchema = createInsertSchema(Response, {
  coverLetter: z.string().optional(),
}).omit({
  id: true,
  candidateId: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});
