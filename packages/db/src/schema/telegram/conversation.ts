import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const conversationStatusEnum = pgEnum("conversation_status", [
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const telegramConversation = pgTable("telegram_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: varchar("chat_id", { length: 100 }).notNull().unique(),
  candidateName: varchar("candidate_name", { length: 500 }),
  status: conversationStatusEnum("status").default("ACTIVE").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const CreateTelegramConversationSchema = createInsertSchema(
  telegramConversation,
  {
    chatId: z.string().max(100),
    candidateName: z.string().max(500).optional(),
    status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).default("ACTIVE"),
    metadata: z.string().optional(),
  },
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
