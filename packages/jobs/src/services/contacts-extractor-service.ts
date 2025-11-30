import { db, eq } from "@selectio/db";
import { vacancyResponse } from "@selectio/db/schema";
import { extractTelegramUsername } from "./telegram-username-service";

/**
 * Извлекает телефон из поля contacts
 */
function extractPhone(contacts: unknown): string | null {
  if (!contacts || typeof contacts !== "object") {
    return null;
  }

  if ("phone" in contacts) {
    const phoneData = (
      contacts as {
        phone?: Array<{ formatted?: string; raw?: string }>;
      }
    ).phone;

    if (Array.isArray(phoneData) && phoneData.length > 0) {
      const firstPhone = phoneData[0];
      return firstPhone?.formatted || firstPhone?.raw || null;
    }
  }

  return null;
}

/**
 * Обрабатывает отклик: извлекает telegram username и телефон из поля contacts
 */
export async function extractContactsFromResponse(responseId: string) {
  console.log(`🔍 Извлечение контактов для отклика ${responseId}`);

  // Получаем отклик с полем contacts
  const response = await db.query.vacancyResponse.findFirst({
    where: eq(vacancyResponse.id, responseId),
    columns: {
      id: true,
      vacancyId: true,
      resumeId: true,
      candidateName: true,
      contacts: true,
      telegramUsername: true,
      phone: true,
    },
  });

  if (!response) {
    console.log(`⚠️ Отклик ${responseId} не найден`);
    return { success: false, error: "Response not found" };
  }

  if (!response.contacts) {
    console.log(`⚠️ У отклика ${responseId} нет поля contacts`);
    return { success: false, error: "No contacts field" };
  }

  let telegramUsername: string | null = response.telegramUsername;
  let phone: string | null = response.phone;

  // Извлекаем telegram username если его нет
  if (!telegramUsername || telegramUsername === "") {
    console.log(`🔍 Извлечение Telegram username из контактов...`);
    telegramUsername = await extractTelegramUsername(response.contacts);
    if (telegramUsername) {
      console.log(`✅ Найден Telegram username: @${telegramUsername}`);
    } else {
      console.log(`ℹ️ Telegram username не найден в контактах`);
    }
  }

  // Извлекаем телефон если его нет
  if (!phone || phone === "") {
    console.log(`📞 Извлечение телефона из контактов...`);
    phone = extractPhone(response.contacts);
    if (phone) {
      console.log(`✅ Найден телефон: ${phone}`);
    } else {
      console.log(`ℹ️ Телефон не найден в контактах`);
    }
  }

  // Обновляем только если нашли новые данные
  if (
    (telegramUsername && telegramUsername !== response.telegramUsername) ||
    (phone && phone !== response.phone)
  ) {
    await db
      .update(vacancyResponse)
      .set({
        telegramUsername: telegramUsername || response.telegramUsername,
        phone: phone || response.phone,
      })
      .where(eq(vacancyResponse.id, responseId));

    console.log(
      `✅ Контакты обновлены для отклика ${response.candidateName || responseId}`,
    );
  } else {
    console.log(
      `ℹ️ Новых контактов не найдено для ${response.candidateName || responseId}`,
    );
  }

  return {
    success: true,
    telegramUsername,
    phone,
  };
}

/**
 * Обрабатывает несколько откликов: извлекает контакты из поля contacts
 */
export async function extractContactsFromResponses(responseIds: string[]) {
  console.log(
    `🚀 Начинаем извлечение контактов для ${responseIds.length} откликов`,
  );

  const results = {
    total: responseIds.length,
    processed: 0,
    failed: 0,
    withTelegram: 0,
    withPhone: 0,
  };

  for (const responseId of responseIds) {
    try {
      const result = await extractContactsFromResponse(responseId);
      if (result.success) {
        results.processed++;
        if (result.telegramUsername) results.withTelegram++;
        if (result.phone) results.withPhone++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error(`❌ Ошибка обработки отклика ${responseId}:`, error);
      results.failed++;
    }
  }

  console.log(`✅ Обработка завершена:`);
  console.log(`   Всего: ${results.total}`);
  console.log(`   Успешно: ${results.processed}`);
  console.log(`   Ошибок: ${results.failed}`);
  console.log(`   С Telegram: ${results.withTelegram}`);
  console.log(`   С телефоном: ${results.withPhone}`);

  return results;
}
