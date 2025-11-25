export const RESPONSE_STATUS = {
  NEW: "NEW",
  EVALUATED: "EVALUATED",
  DIALOG_APPROVED: "DIALOG_APPROVED",
  INTERVIEW_HH: "INTERVIEW_HH",
  INTERVIEW_WHATSAPP: "INTERVIEW_WHATSAPP",
  COMPLETED: "COMPLETED",
  SKIPPED: "SKIPPED",
} as const;

export type ResponseStatus =
  (typeof RESPONSE_STATUS)[keyof typeof RESPONSE_STATUS];

export const RESPONSE_STATUS_LABELS: Record<ResponseStatus, string> = {
  [RESPONSE_STATUS.NEW]: "🟡 НОВЫЙ",
  [RESPONSE_STATUS.EVALUATED]: "🔵 ОЦЕНЕНО",
  [RESPONSE_STATUS.DIALOG_APPROVED]: "🟠 ДИАЛОГ УТВЕРЖДЕН",
  [RESPONSE_STATUS.INTERVIEW_HH]: "🟣 СОБЕСЕДОВАНИЕ HH.ru",
  [RESPONSE_STATUS.INTERVIEW_WHATSAPP]: "🟣 СОБЕСЕДОВАНИЕ Ватсап",
  [RESPONSE_STATUS.COMPLETED]: "🟢 ЗАВЕРШЕНО",
  [RESPONSE_STATUS.SKIPPED]: "🔴 ПРОПУЩЕНО",
};

export const RESPONSE_STATUS_DESCRIPTIONS: Record<ResponseStatus, string> = {
  [RESPONSE_STATUS.NEW]: "Только откликнулся, резюме не проанализировано",
  [RESPONSE_STATUS.EVALUATED]:
    "AI проанализировал резюме, выставлена оценка, предложен диалог",
  [RESPONSE_STATUS.DIALOG_APPROVED]: "Вопросы проверены и одобрены HR",
  [RESPONSE_STATUS.INTERVIEW_HH]: "Активный диалог с кандидатом через HH.ru",
  [RESPONSE_STATUS.INTERVIEW_WHATSAPP]:
    "Активный диалог с кандидатом через WhatsApp",
  [RESPONSE_STATUS.COMPLETED]:
    "Кандидат ответил на все вопросы, есть вывод по нему",
  [RESPONSE_STATUS.SKIPPED]: "Кандидат не ответил в срок (24 часа)",
};

export const HR_SELECTION_STATUS = {
  INVITE: "INVITE",
  RECOMMENDED: "RECOMMENDED",
  NOT_RECOMMENDED: "NOT_RECOMMENDED",
  REJECTED: "REJECTED",
} as const;

export type HrSelectionStatus =
  (typeof HR_SELECTION_STATUS)[keyof typeof HR_SELECTION_STATUS];

export const HR_SELECTION_STATUS_LABELS: Record<HrSelectionStatus, string> = {
  [HR_SELECTION_STATUS.INVITE]: "✅ ПРИГЛАСИТЬ",
  [HR_SELECTION_STATUS.RECOMMENDED]: "🤔 РЕКОМЕНДОВАНО",
  [HR_SELECTION_STATUS.NOT_RECOMMENDED]: "⚠️ НЕ РЕКОМЕНДОВАНО",
  [HR_SELECTION_STATUS.REJECTED]: "🛑 ОТКЛОНЕНО",
};

export const HR_SELECTION_STATUS_DESCRIPTIONS: Record<
  HrSelectionStatus,
  string
> = {
  [HR_SELECTION_STATUS.INVITE]: "AI рекомендует пригласить",
  [HR_SELECTION_STATUS.RECOMMENDED]: "Хороший кандидат, но есть вопросы",
  [HR_SELECTION_STATUS.NOT_RECOMMENDED]: "Не подходит по критериям",
  [HR_SELECTION_STATUS.REJECTED]: "HR вручную отклонил",
};
