export interface VacancyResponse {
  id: string;
  vacancyId: string;
  resumeUrl: string;
  candidateName: string | null;
  experience: string | null;
  contacts: unknown;
  createdAt: Date;
  updatedAt: Date;
}
