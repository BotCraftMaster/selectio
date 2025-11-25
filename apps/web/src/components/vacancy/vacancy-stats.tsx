interface VacancyStatsProps {
  views: number | null;
  responses: number | null;
  newResponses: number | null;
  resumesInProgress: number | null;
}

export function VacancyStats({
  views,
  responses,
  newResponses,
  resumesInProgress,
}: VacancyStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-lg border p-4">
        <div className="text-2xl font-bold">{views}</div>
        <div className="text-sm text-muted-foreground">Просмотров</div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-2xl font-bold">{responses}</div>
        <div className="text-sm text-muted-foreground">Откликов</div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-2xl font-bold">{newResponses}</div>
        <div className="text-sm text-muted-foreground">Новых</div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-2xl font-bold">{resumesInProgress}</div>
        <div className="text-sm text-muted-foreground">В работе</div>
      </div>
    </div>
  );
}
