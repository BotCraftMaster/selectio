import { Badge, Button } from "@selectio/ui";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "~/components/layout";
import { api } from "~/trpc/server";

interface VacancyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VacancyDetailPage({
  params,
}: VacancyDetailPageProps) {
  const { id } = await params;
  const caller = await api();
  const vacancy = await caller.vacancy.getById({ id });

  if (!vacancy) {
    notFound();
  }

  return (
    <>
      <SiteHeader title={vacancy.title} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="mb-4">
                <Link href="/vacancies">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад к списку
                  </Button>
                </Link>
              </div>

              <div className="rounded-lg border p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold">{vacancy.title}</h1>
                    {vacancy.region && (
                      <p className="text-muted-foreground">{vacancy.region}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {vacancy.isActive ? (
                      <Badge variant="default">Активна</Badge>
                    ) : (
                      <Badge variant="secondary">Неактивна</Badge>
                    )}
                  </div>
                </div>

                {vacancy.url && (
                  <div>
                    <a
                      href={vacancy.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      Открыть на hh.ru
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold">{vacancy.views}</div>
                    <div className="text-sm text-muted-foreground">
                      Просмотров
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold">
                      {vacancy.responses}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Откликов
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold">
                      {vacancy.newResponses}
                    </div>
                    <div className="text-sm text-muted-foreground">Новых</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold">
                      {vacancy.resumesInProgress}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      В работе
                    </div>
                  </div>
                </div>

                {vacancy.description && (
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Описание</h2>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-sm">
                        {vacancy.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
