import { sql } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { user } from "./auth";

export const vacancyStatusEnum = pgEnum("vacancy_status", [
  "draft",
  "open",
  "closed",
]);

export const employmentTypeEnum = pgEnum("employment_type", [
  "full_time",
  "part_time",
  "contract",
  "internship",
  "freelance",
]);

export const Vacancy = pgTable("vacancy", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  employerId: t
    .text("employer_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: t.varchar({ length: 256 }).notNull(),
  description: t.text().notNull(),
  salaryMin: t.integer("salary_min"),
  salaryMax: t.integer("salary_max"),
  currency: t.varchar({ length: 3 }).default("USD"),
  location: t.varchar({ length: 256 }),
  type: employmentTypeEnum().notNull().default("full_time"),
  status: vacancyStatusEnum().notNull().default("open"),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t
    .timestamp("updated_at", { mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CreateVacancySchema = createInsertSchema(Vacancy, {
  title: z.string().min(1).max(256),
  description: z.string().min(1),
  currency: z.string().length(3).optional(),
}).omit({
  id: true,
  employerId: true,
  createdAt: true,
  updatedAt: true,
});
