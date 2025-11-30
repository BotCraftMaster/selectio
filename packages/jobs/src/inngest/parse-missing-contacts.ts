import { channel, topic } from "@inngest/realtime";
import { db, inArray } from "@selectio/db";
import { vacancyResponse } from "@selectio/db/schema";
import { z } from "zod";
import { extractContactsFromResponses } from "../services/contacts-extractor-service";
import { inngest } from "./client";

export const parseMissingContactsChannel = channel(
  "parse-missing-contacts",
).addTopic(
  topic("status").schema(
    z.object({
      status: z.string(),
      message: z.string(),
      total: z.number(),
      processed: z.number(),
    }),
  ),
);

/**
 * Inngest функция для парсинга контактов откликов без telegram username или телефона
 */
export const parseMissingContactsFunction = inngest.createFunction(
  {
    id: "parse-missing-contacts",
    name: "Parse Missing Contacts",
    batchEvents: {
      maxSize: 4,
      timeout: "10s",
    },
  },
  { event: "response/contacts.parse-missing" },
  async ({ events, step, publish }) => {
    console.log(`🚀 Запуск парсинга контактов для ${events.length} событий`);

    await publish(
      parseMissingContactsChannel().status({
        status: "started",
        message: "Начинаем парсинг контактов",
        total: 0,
        processed: 0,
      }),
    );

    const vacancyIds = events.map((evt) => evt.data.vacancyId);
    console.log(`📋 Вакансии для обработки: ${vacancyIds.join(", ")}`);

    // Получаем отклики без telegram username или телефона
    const responses = await step.run(
      "fetch-responses-without-contacts",
      async () => {
        const allResponses = await db.query.vacancyResponse.findMany({
          where: inArray(vacancyResponse.vacancyId, vacancyIds),
          columns: {
            id: true,
            vacancyId: true,
            resumeId: true,
            resumeUrl: true,
            candidateName: true,
            telegramUsername: true,
            phone: true,
            experience: true,
            contacts: true,
          },
        });

        // Фильтруем только отклики с полем contacts, но без telegram username или телефона
        // Это значит что contacts уже есть, но из них не извлечены контакты
        const results = allResponses.filter(
          (r) =>
            r.contacts &&
            (!r.telegramUsername ||
              r.telegramUsername === "" ||
              !r.phone ||
              r.phone === ""),
        );

        console.log(`✅ Найдено откликов без контактов: ${results.length}`);

        await publish(
          parseMissingContactsChannel().status({
            status: "processing",
            message: `Найдено ${results.length} откликов для парсинга контактов`,
            total: results.length,
            processed: 0,
          }),
        );

        return results;
      },
    );

    if (responses.length === 0) {
      console.log("ℹ️ Нет откликов для парсинга контактов");
      await publish(
        parseMissingContactsChannel().status({
          status: "completed",
          message: "Нет откликов без контактов",
          total: 0,
          processed: 0,
        }),
      );
      return {
        success: true,
        total: 0,
        processed: 0,
        failed: 0,
      };
    }

    // Извлекаем контакты из поля contacts
    const results = await step.run("extract-contacts", async () => {
      const responseIds = responses.map((r) => r.id);
      return await extractContactsFromResponses(responseIds);
    });

    await publish(
      parseMissingContactsChannel().status({
        status: "completed",
        message: `Парсинг контактов завершен. Telegram: ${results.withTelegram}, Телефон: ${results.withPhone}`,
        total: results.total,
        processed: results.processed,
      }),
    );

    return {
      success: true,
      total: results.total,
      processed: results.processed,
      failed: results.failed,
    };
  },
);
