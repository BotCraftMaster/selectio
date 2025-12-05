/**
 * Services module - unified exports for all service functions
 *
 * Structure:
 * - base/       - Shared utilities (Result, Logger, Constants)
 * - types/      - Service-specific type definitions
 * - vacancy/    - Vacancy CRUD and requirements extraction
 * - response/   - Response CRUD, screening, contacts extraction
 * - interview/  - AI-powered interview management
 * - messaging/  - Telegram, HH chat, welcome messages
 * - media/      - Audio transcription
 * - screening/  - Resume screening utilities
 * - triggers/   - Inngest event triggers
 */

// ==================== Base Utilities ====================
export {
  // Result type
  type Result,
  err,
  flatMap,
  map,
  ok,
  tryCatch,
  unwrap,
  unwrapOr,
  // Logger
  createLogger,
  logger,
  // Constants
  AI,
  INTERVIEW,
  RESPONSE_STATUS,
  SCREENING,
  TELEGRAM,
  type ResponseStatus,
} from "./base";

// ==================== Types ====================
export type {
  ExtractedContacts,
  HHContactEmail,
  HHContactPhone,
  HHContacts,
  HHContactType,
  HHPreferredContact,
} from "./types";

// ==================== Vacancy ====================
export {
  // Repository
  checkVacancyExists,
  getVacanciesWithoutDescription,
  getVacancyById,
  hasVacancyDescription,
  saveBasicVacancy,
  saveVacancyToDb,
  updateVacancyDescription,
  // Requirements
  extractVacancyRequirements,
  getVacancyRequirements,
} from "./vacancy";

// ==================== Response ====================
export {
  // Repository
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
  // Screening
  screenResponse,
  // Contacts
  extractContactsFromResponse,
  extractContactsFromResponses,
} from "./response";

// ==================== Interview ====================
export {
  analyzeAndGenerateNextQuestion,
  createInterviewScoring,
  getInterviewContext,
  saveQuestionAnswer,
} from "./interview";

// ==================== Messaging ====================
export {
  extractTelegramUsername,
  generateWelcomeMessage,
  sendHHChatMessage,
} from "./messaging";

// ==================== Media ====================
export { transcribeAudio } from "./media";

// ==================== Screening ====================
export {
  formatResumeForScreening,
  parseScreeningResult,
  prepareScreeningPrompt,
  screenResume,
  validateScreeningResult,
} from "./screening";

// ==================== Triggers ====================
export {
  triggerCandidateWelcome,
  triggerResponseScreening,
  triggerTelegramMessageSend,
  triggerVacanciesUpdate,
  triggerVacancyRequirementsExtraction,
  triggerVacancyResponsesRefresh,
  triggerVoiceTranscription,
} from "./triggers";
