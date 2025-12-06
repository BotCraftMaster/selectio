// ==================== Inngest ====================
export {
  extractVacancyRequirementsFunction,
  inngest,
  inngestFunctions,
  refreshVacancyResponsesFunction,
  screenNewResponsesChannel,
  screenResponseFunction,
  sendCandidateWelcomeFunction,
  sendTelegramMessageFunction,
  transcribeVoiceFunction,
} from "./inngest";

// ==================== Services ====================
// Re-export all services from new structure
export {
  // Base utilities
  type Result,
  err,
  ok,
  tryCatch,
  unwrap,
  unwrapOr,
  createLogger,
  logger,
  AI,
  INTERVIEW,
  RESPONSE_STATUS,
  SCREENING,
  TELEGRAM,
  type ResponseStatus,
  // Vacancy
  checkVacancyExists,
  getVacanciesWithoutDescription,
  getVacancyById,
  hasVacancyDescription,
  saveBasicVacancy,
  saveVacancyToDb,
  updateVacancyDescription,
  extractVacancyRequirements,
  getVacancyRequirements,
  // Response
  checkResponseExists,
  getResponseById,
  getResponseByResumeId,
  getResponsesWithoutDetails,
  hasDetailedInfo,
  saveBasicResponse,
  saveResponseToDb,
  updateResponseDetails,
  updateResponseStatus,
  uploadResumePdf,
  screenResponse,
  extractContactsFromResponse,
  extractContactsFromResponses,
  // Interview
  analyzeAndGenerateNextQuestion,
  createInterviewScoring,
  getInterviewContext,
  saveQuestionAnswer,
  // Messaging
  extractTelegramUsername,
  generateWelcomeMessage,
  sendHHChatMessage,
  // Media
  transcribeAudio,
  // Screening
  formatResumeForScreening,
  parseScreeningResult,
  prepareScreeningPrompt,
  screenResume,
  validateScreeningResult,
  // Triggers
  triggerCandidateWelcome,
  triggerResponseScreening,
  triggerTelegramMessageSend,
  triggerVacanciesUpdate,
  triggerVacancyRequirementsExtraction,
  triggerVacancyResponsesRefresh,
  triggerVoiceTranscription,
} from "./services";

// ==================== Types ====================
export type {
  ResumeScreeningData,
  ScreeningPromptData,
  ScreeningRecommendation,
  ScreeningResult,
  VacancyRequirements,
} from "./types/screening";

export type {
  ExtractedContacts,
  HHContactEmail,
  HHContactPhone,
  HHContacts,
  HHContactType,
  HHPreferredContact,
} from "./services/types";

// ==================== Utils ====================
export { loadCookies, saveCookies } from "./utils/cookies";

export { checkHHCredentials } from "./services";

