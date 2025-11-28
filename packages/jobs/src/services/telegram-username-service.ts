import { generateText } from "../lib/ai-client";

/**
 * Extract Telegram username from contacts data using AI
 * @param contacts - Raw contacts data from HH.ru API
 * @returns Telegram username without @ or null if not found
 */
export async function extractTelegramUsername(
  contacts: unknown,
): Promise<string | null> {
  if (!contacts) {
    return null;
  }

  try {
    const contactsJson = JSON.stringify(contacts, null, 2);

    const prompt = `Ты — ассистент для извлечения данных. Твоя задача — найти и извлечь Telegram username из предоставленной контактной информации.

Контактные данные:
${contactsJson}

Инструкции:
1. Ищи любое поле, которое может содержать Telegram username (например, "telegram", "messenger", "social", "contacts" и т.д.)
2. Telegram username обычно начинается с @ или указывается без @
3. Telegram username может содержать только буквы (a-z, A-Z), цифры (0-9) и подчёркивания (_)
4. Telegram username должен быть длиной минимум 5 символов
5. Если ты нашёл валидный Telegram username, верни ТОЛЬКО username БЕЗ символа @
6. Если Telegram username не найден, верни точно: null

Примеры:
- Если найдено "@john_doe", верни: john_doe
- Если найдено "telegram: @alice123", верни: alice123
- Если найдено "tg: bob_smith", верни: bob_smith
- Если Telegram не найден, верни: null

Верни ТОЛЬКО username или null, ничего больше.`;

    const { text } = await generateText({
      prompt,
      temperature: 0,
      generationName: "extract-telegram-username",
      metadata: {
        contactsPreview: contactsJson.substring(0, 200),
      },
    });

    const cleanedText = text.trim();

    // Check if the response is null or empty
    if (
      cleanedText === "null" ||
      cleanedText === "" ||
      cleanedText.toLowerCase() === "none"
    ) {
      return null;
    }

    // Validate the username format
    const usernameRegex = /^[a-zA-Z0-9_]{5,}$/;
    if (!usernameRegex.test(cleanedText)) {
      console.log(
        `⚠️ Неверный формат Telegram username: ${cleanedText}, игнорируем`,
      );
      return null;
    }

    console.log(`✅ Извлечён Telegram username: ${cleanedText}`);
    return cleanedText;
  } catch (error) {
    console.error("❌ Ошибка извлечения Telegram username:", error);
    return null;
  }
}
