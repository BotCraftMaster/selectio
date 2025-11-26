"use client";

import { Skeleton } from "@selectio/ui";
import { useQuery } from "@tanstack/react-query";
import { ProfileForm } from "~/components/settings/profile-form";
import { SettingsSidebar } from "~/components/settings/settings-sidebar";
import { useTRPC } from "~/trpc/react";

export default function SettingsProfilePage() {
  const trpc = useTRPC();
  const { data: user, isLoading } = useQuery(trpc.user.me.queryOptions());

  if (isLoading) {
    return (
      <div className="space-y-6 p-10 pb-16 max-w-5xl">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-[240px] shrink-0">
            <div className="rounded-lg border p-2">
              <SettingsSidebar />
            </div>
          </aside>
          <div className="flex-1">
            <div className="rounded-lg border p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-10 pb-16 max-w-5xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-[240px] shrink-0">
          <div className="rounded-lg border p-2">
            <SettingsSidebar />
          </div>
        </aside>
        <div className="flex-1">
          <div className="rounded-lg border p-6">
            <ProfileForm
              initialData={{
                username: user?.username || "",
                email: user?.email || "",
                bio: user?.bio || "",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
