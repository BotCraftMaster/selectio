import type { VacancyResponse as DbVacancyResponse } from "@selectio/db/schema";

export type VacancyResponse = DbVacancyResponse & {
  screening?: {
    score: number;
    detailedScore: number;
    analysis: string | null;
    questions: unknown;
    greeting: string | null;
  } | null;
};
