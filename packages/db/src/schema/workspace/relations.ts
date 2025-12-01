import { relations } from "drizzle-orm";
import { user } from "../auth/user";
import { integration } from "../integration/integration";
import { vacancy } from "../vacancy/vacancy";
import { userWorkspace } from "./user-workspace";
import { workspace } from "./workspace";

export const workspaceRelations = relations(workspace, ({ many }) => ({
  userWorkspaces: many(userWorkspace),
  integrations: many(integration),
  vacancies: many(vacancy),
}));

export const userWorkspaceRelations = relations(userWorkspace, ({ one }) => ({
  user: one(user, {
    fields: [userWorkspace.userId],
    references: [user.id],
  }),
  workspace: one(workspace, {
    fields: [userWorkspace.workspaceId],
    references: [workspace.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  userWorkspaces: many(userWorkspace),
}));
