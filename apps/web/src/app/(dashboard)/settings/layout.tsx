import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function SettingsLayout() {
  // Получаем активный workspace из cookies или первый доступный
  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("active-workspace")?.value;

  const caller = await api();
  const userWorkspaces = await caller.workspace.list();

  if (userWorkspaces.length === 0) {
    redirect("/onboarding");
  }

  // Находим активный workspace или берем первый
  const activeWorkspace =
    userWorkspaces.find((uw) => uw.workspace.id === activeWorkspaceId) ||
    userWorkspaces[0];

  if (!activeWorkspace) {
    redirect("/onboarding");
  }

  // Редирект на workspace-specific settings
  redirect(`/${activeWorkspace.workspace.slug}/settings`);
}
