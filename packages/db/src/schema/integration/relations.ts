import { relations } from "drizzle-orm";
import { workspace } from "../workspace/workspace";
import { integration } from "./integration";

export const integrationRelations = relations(integration, ({ one }) => ({
  workspace: one(workspace, {
    fields: [integration.workspaceId],
    references: [workspace.id],
  }),
}));
