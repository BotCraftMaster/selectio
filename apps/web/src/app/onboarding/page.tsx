"use client";

import { Button, Input, Label } from "@selectio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTRPC } from "~/trpc/react";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(true);
  const [error, setError] = useState("");
  const trpc = useTRPC();

  const createWorkspace = useMutation(
    trpc.workspace.create.mutationOptions({
      onSuccess: (workspace) => {
        router.push(`/${workspace.slug}`);
        router.refresh();
      },
      onError: (err) => {
        setError(err.message || "Ошибка при создании workspace");
      },
    }),
  );

  // Автогенерация slug из названия
  const handleNameChange = (value: string) => {
    setName(value);
    if (isGeneratingSlug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 50);
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (value: string) => {
    setIsGeneratingSlug(false);
    setSlug(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createWorkspace.mutate({ name, slug });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]" />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-8 text-primary"
              aria-label="Workspace icon"
            >
              <title>Workspace</title>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Создайте workspace</h1>
          <p className="text-muted-foreground mt-2">
            Настройте общее пространство для управления вакансиями
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border bg-card p-8 shadow-lg backdrop-blur-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Название workspace</Label>
            <Input
              id="name"
              placeholder="Моя компания"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug workspace</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                app.selectio.ru/
              </span>
              <Input
                id="slug"
                placeholder="my-company"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                required
                maxLength={50}
                pattern="[a-z0-9-]+"
                title="Только строчные буквы, цифры и дефис"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Можно изменить позже в настройках
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createWorkspace.isPending || !name || !slug}
          >
            {createWorkspace.isPending ? "Создание..." : "Создать workspace"}
          </Button>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
