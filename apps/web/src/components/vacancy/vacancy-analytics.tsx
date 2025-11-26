import { CheckCircle, Star, TrendingUp, Users } from "lucide-react";

interface VacancyAnalyticsProps {
  totalResponses: number;
  processedResponses: number;
  highScoreResponses: number;
  topScoreResponses: number;
  avgScore: number;
}

interface VacancyRequirement {
  category: string;
  items: string[];
}

interface VacancyRequirementsProps {
  requirements: unknown;
}

export function VacancyAnalytics({
  totalResponses,
  processedResponses,
  highScoreResponses,
  topScoreResponses,
  avgScore,
}: VacancyAnalyticsProps) {
  const processedPercentage =
    totalResponses > 0
      ? Math.round((processedResponses / totalResponses) * 100)
      : 0;

  const highScorePercentage =
    processedResponses > 0
      ? Math.round((highScoreResponses / processedResponses) * 100)
      : 0;

  const topScorePercentage =
    processedResponses > 0
      ? Math.round((topScoreResponses / processedResponses) * 100)
      : 0;

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Аналитика откликов</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4 bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div className="text-sm text-muted-foreground">Обработано</div>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {processedResponses}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            из {totalResponses} ({processedPercentage}%)
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-linear-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div className="text-sm text-muted-foreground">Скоринг ≥ 3</div>
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {highScoreResponses}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {processedResponses > 0 ? `${highScorePercentage}%` : "—"} от
            обработанных
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-linear-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div className="text-sm text-muted-foreground">Скоринг ≥ 4</div>
          </div>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {topScoreResponses}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {processedResponses > 0 ? `${topScorePercentage}%` : "—"} от
            обработанных
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <div className="text-sm text-muted-foreground">Средний балл</div>
          </div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {processedResponses > 0 ? avgScore.toFixed(1) : "—"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">из 5.0</div>
        </div>
      </div>
    </div>
  );
}

export function VacancyRequirements({
  requirements,
}: VacancyRequirementsProps) {
  if (!requirements) {
    return null;
  }

  // Type guard для проверки структуры
  const isValidRequirements = (data: unknown): data is VacancyRequirement[] => {
    return (
      Array.isArray(data) &&
      data.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          "category" in item &&
          "items" in item &&
          typeof item.category === "string" &&
          Array.isArray(item.items)
      )
    );
  };

  if (!isValidRequirements(requirements)) {
    return (
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Сгенерированные требования</h2>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            Показать JSON
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">
            <code>{JSON.stringify(requirements, null, 2)}</code>
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <h2 className="text-xl font-semibold">Сгенерированные требования</h2>

      <div className="space-y-4">
        {requirements.map((requirement, index) => (
          <div key={`${requirement.category}-${index}`} className="space-y-2">
            <h3 className="text-lg font-medium text-primary">
              {requirement.category}
            </h3>
            <ul className="space-y-1.5 pl-5">
              {requirement.items.map((item, itemIndex) => (
                <li
                  key={`${requirement.category}-${index}-${itemIndex}`}
                  className="text-sm text-muted-foreground list-disc"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
          Показать JSON
        </summary>
        <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs">
          <code>{JSON.stringify(requirements, null, 2)}</code>
        </pre>
      </details>
    </div>
  );
}
