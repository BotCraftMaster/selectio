import { eq } from "@selectio/db";
import { db } from "@selectio/db/client";
import {
  companySettings,
  responseScreening,
  vacancyResponse,
} from "@selectio/db/schema";
import { buildCandidateWelcomePrompt } from "@selectio/prompts";
import { stripHtml } from "string-strip-html";
import { generateText } from "../../lib/ai-client";
import { type Result, AI, createLogger, err, tryCatch } from "../base";

const logger = createLogger("CandidateWelcome");

/**
 * Generates personalized welcome message for candidate
 */
export async function generateWelcomeMessage(
  responseId: string,
): Promise<Result<string>> {
  logger.info(`Generating welcome message for response ${responseId}`);

  const dataResult = await tryCatch(async () => {
    const response = await db.query.vacancyResponse.findFirst({
      where: eq(vacancyResponse.id, responseId),
      with: {
        vacancy: true,
      },
    });

    if (!response) {
      throw new Error(`Response ${responseId} not found`);
    }

    const screening = await db.query.responseScreening.findFirst({
      where: eq(responseScreening.responseId, responseId),
    });

    const [company] = await db.select().from(companySettings).limit(1);

    return { response, screening, company };
  }, "Failed to fetch data for welcome message");

  if (!dataResult.success) {
    return err(dataResult.error);
  }

  const { response, screening, company } = dataResult.data;

  const prompt = buildCandidateWelcomePrompt({
    companyName: company?.name || "наша компания",
    companyDescription: company?.description || undefined,
    companyWebsite: company?.website || undefined,
    vacancyTitle: response.vacancy?.title || null,
    vacancyDescription: response.vacancy?.description
      ? stripHtml(response.vacancy.description).result.substring(0, 200)
      : undefined,
    candidateName: response.candidateName,
    candidateAbout: response.about?.substring(0, 150) || undefined,
    screeningScore: screening?.score,
    screeningAnalysis: screening?.analysis || undefined,
  });

  logger.info("Sending request to AI for welcome message generation");

  const aiResult = await tryCatch(async () => {
    const { text } = await generateText({
      prompt,
      temperature: AI.TEMPERATURE_CREATIVE,
      generationName: "candidate-welcome",
      entityId: responseId,
      metadata: {
        responseId,
        vacancyId: response.vacancyId,
        candidateName: response.candidateName,
      },
    });
    return text;
  }, "AI request failed");

  if (!aiResult.success) {
    return err(aiResult.error);
  }

  logger.info("Welcome message generated");

  let finalMessage = aiResult.data.trim();

  // Add vacancy link
  if (response.vacancy) {
    finalMessage += `\n\n🔗 Ссылка на вакансию: https://hh.ru/vacancy/${response.vacancy.id}`;
  }

  return { success: true, data: finalMessage };
}
