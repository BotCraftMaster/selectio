import { eq } from "@selectio/db";
import { db } from "@selectio/db/client";
import { telegramConversation } from "@selectio/db/schema";
import {
  buildInterviewQuestionPrompt,
  buildInterviewScoringPrompt,
} from "@selectio/prompts";
import { stripHtml } from "string-strip-html";
import type { z } from "zod";
import { generateText } from "../lib/ai-client";
import {
  type InterviewAnalysis,
  type InterviewScoring,
  interviewAnalysisSchema,
  interviewScoringSchema,
} from "../schemas/interview";
import { extractJsonFromText } from "../utils/json-extractor";

// ==================== CONSTANTS ====================

/** Maximum number of interview questions */
const MAX_INTERVIEW_QUESTIONS = 4;

/** Default fallback score (1-5 scale) */
const DEFAULT_FALLBACK_SCORE = 3;

/** Default fallback detailed score (0-100 scale) */
const DEFAULT_FALLBACK_DETAILED_SCORE = 50;

/** Default fallback question when AI parsing fails */
const DEFAULT_FALLBACK_QUESTION = "Расскажи подробнее о своем опыте";

// ==================== TYPES ====================

/** Question and answer pair from interview */
interface QuestionAnswer {
  question: string;
  answer: string;
}

/** Typed metadata structure for conversation */
interface ConversationMetadata {
  questionAnswers?: QuestionAnswer[];
}

interface InterviewContext {
  conversationId: string;
  candidateName: string | null;
  vacancyTitle: string | null;
  vacancyDescription: string | null;
  currentAnswer: string;
  currentQuestion: string;
  previousQA: QuestionAnswer[];
  questionNumber: number;
  responseId: string | null;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Safely parses JSON metadata string into typed object
 */
function parseMetadata(metadataStr: string | null): ConversationMetadata {
  if (!metadataStr) return {};

  try {
    return JSON.parse(metadataStr) as ConversationMetadata;
  } catch (error) {
    console.error("Ошибка парсинга metadata:", error);
    return {};
  }
}

/**
 * Parses AI response text and validates against Zod schema
 * Returns fallback value if parsing fails
 */
function parseAIResponse<T>(
  text: string,
  schema: z.ZodSchema<T>,
  fallback: T,
  errorContext: string,
): T {
  try {
    const extracted = extractJsonFromText(text);

    if (!extracted) {
      throw new Error("JSON не найден в ответе");
    }

    return schema.parse(extracted);
  } catch (error) {
    console.error(`Ошибка парсинга ${errorContext}:`, error);
    console.error("Ответ AI:", text);
    return fallback;
  }
}

// ==================== MAIN FUNCTIONS ====================

/**
 * Анализирует ответ кандидата и генерирует следующий вопрос
 */
export async function analyzeAndGenerateNextQuestion(
  context: InterviewContext,
): Promise<InterviewAnalysis> {
  const {
    questionNumber,
    currentAnswer,
    currentQuestion,
    previousQA,
    candidateName,
    vacancyTitle,
    vacancyDescription,
  } = context;

  // Check question limit
  if (questionNumber >= MAX_INTERVIEW_QUESTIONS) {
    return {
      analysis: "Достигнут максимум вопросов",
      shouldContinue: false,
      reason: "Достигнут лимит вопросов",
    };
  }

  const prompt = buildInterviewQuestionPrompt({
    candidateName,
    vacancyTitle,
    vacancyDescription,
    currentAnswer,
    currentQuestion,
    previousQA,
    questionNumber,
  });

  const { text } = await generateText({
    prompt,
    temperature: 0.8,
    generationName: "interview-next-question",
    entityId: context.conversationId,
    metadata: {
      conversationId: context.conversationId,
      questionNumber,
    },
  });

  const fallback: InterviewAnalysis = {
    analysis: "Не удалось проанализировать ответ",
    shouldContinue: questionNumber < MAX_INTERVIEW_QUESTIONS,
    nextQuestion: DEFAULT_FALLBACK_QUESTION,
  };

  const result = parseAIResponse(
    text,
    interviewAnalysisSchema,
    fallback,
    "ответа AI",
  );

  return {
    ...result,
    shouldContinue:
      result.shouldContinue && questionNumber < MAX_INTERVIEW_QUESTIONS,
  };
}

/**
 * Получает контекст интервью из базы данных
 */
export async function getInterviewContext(
  conversationId: string,
  currentTranscription: string,
  currentQuestion: string,
): Promise<InterviewContext | null> {
  const conversation = await db.query.telegramConversation.findFirst({
    where: eq(telegramConversation.id, conversationId),
    with: {
      messages: {
        orderBy: (messages, { asc }) => [asc(messages.createdAt)],
      },
      response: {
        with: {
          vacancy: true,
        },
      },
    },
  });

  if (!conversation) {
    return null;
  }

  const metadata = parseMetadata(conversation.metadata);
  const questionAnswers = metadata.questionAnswers ?? [];

  return {
    conversationId: conversation.id,
    candidateName: conversation.candidateName,
    vacancyTitle: conversation.response?.vacancy?.title || null,
    vacancyDescription: conversation.response?.vacancy?.description
      ? stripHtml(conversation.response.vacancy.description).result
      : null,
    currentAnswer: currentTranscription,
    currentQuestion,
    previousQA: questionAnswers,
    questionNumber: questionAnswers.length + 1,
    responseId: conversation.responseId || null,
  };
}

/**
 * Сохраняет вопрос и ответ в metadata разговора
 */
export async function saveQuestionAnswer(
  conversationId: string,
  question: string,
  answer: string,
) {
  const [conversation] = await db
    .select()
    .from(telegramConversation)
    .where(eq(telegramConversation.id, conversationId))
    .limit(1);

  if (!conversation) {
    throw new Error(`Conversation ${conversationId} not found`);
  }

  const metadata = parseMetadata(conversation.metadata);
  const questionAnswers = metadata.questionAnswers ?? [];

  questionAnswers.push({ question, answer });
  metadata.questionAnswers = questionAnswers;

  await db
    .update(telegramConversation)
    .set({ metadata: JSON.stringify(metadata) })
    .where(eq(telegramConversation.id, conversationId));
}

/**
 * Создает финальный скоринг на основе всего интервью
 */
export async function createInterviewScoring(
  context: InterviewContext,
): Promise<InterviewScoring> {
  const { candidateName, vacancyTitle, vacancyDescription, previousQA } =
    context;

  const prompt = buildInterviewScoringPrompt({
    candidateName,
    vacancyTitle,
    vacancyDescription,
    previousQA,
  });

  const { text } = await generateText({
    prompt,
    temperature: 0.3,
    generationName: "interview-scoring",
    entityId: context.conversationId,
    metadata: {
      conversationId: context.conversationId,
      responseId: context.responseId,
    },
  });

  const fallback: InterviewScoring = {
    score: DEFAULT_FALLBACK_SCORE,
    detailedScore: DEFAULT_FALLBACK_DETAILED_SCORE,
    analysis: "Не удалось проанализировать интервью автоматически",
  };

  return parseAIResponse(text, interviewScoringSchema, fallback, "скоринга");
}
