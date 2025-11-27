import type {
  ResumeScreeningData,
  VacancyRequirements,
} from "../types/screening";

/**
 * Форматирует данные резюме для отправки в промпт скрининга
 */
export function formatResumeForScreening(
  resumeData: ResumeScreeningData,
): string {
  const sections: string[] = [];

  // Опыт работы (обязательное поле)
  sections.push(`ОПЫТ РАБОТЫ:\n${resumeData.experience}`);

  // Образование
  if (resumeData.education) {
    sections.push(`\nОБРАЗОВАНИЕ:\n${resumeData.education}`);
  }

  // Навыки
  if (resumeData.skills) {
    sections.push(`\nНАВЫКИ:\n${resumeData.skills}`);
  }

  // О себе
  if (resumeData.about) {
    sections.push(`\nО СЕБЕ:\n${resumeData.about}`);
  }

  // Языки
  if (resumeData.languages) {
    sections.push(`\nЯЗЫКИ:\n${resumeData.languages}`);
  }

  // Курсы и сертификаты
  if (resumeData.courses) {
    sections.push(`\nКУРСЫ И СЕРТИФИКАТЫ:\n${resumeData.courses}`);
  }

  return sections.join("\n");
}

/**
 * Создает полный промпт для скрининга, объединяя требования вакансии и данные резюме
 */
export function buildFullScreeningPrompt(
  requirements: VacancyRequirements,
  resumeData: ResumeScreeningData,
): string {
  const formattedResume = formatResumeForScreening(resumeData);

  return `Ты эксперт по подбору персонала. Оцени резюме кандидата на соответствие требованиям вакансии.

ВАКАНСИЯ: ${requirements.job_title}

ОПИСАНИЕ: ${requirements.summary}

ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ:
${requirements.mandatory_requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}

ЖЕЛАТЕЛЬНЫЕ НАВЫКИ:
${requirements.nice_to_have_skills.map((s, i) => `${i + 1}. ${s}`).join("\n")}

ТЕХНОЛОГИИ: ${requirements.tech_stack.join(", ")}

ОПЫТ: ${requirements.experience_years.description}

ЯЗЫКИ: ${requirements.languages.map((l) => `${l.language} (${l.level})`).join(", ")}

ЛОКАЦИЯ: ${requirements.location_type}

РЕЗЮМЕ КАНДИДАТА:

${formattedResume}

ФОРМАТ ОТВЕТА (только JSON):
{
  "match_percentage": число от 0 до 100,
  "recommendation": "invite" | "reject" | "need_info",
  "strengths": ["сильная сторона 1", "сильная сторона 2"],
  "weaknesses": ["слабая сторона 1", "слабая сторона 2"],
  "summary": "краткое резюме"
}`;
}
