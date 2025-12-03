import {
  db,
  eq,
  telegramConversation,
  telegramMessage,
  telegramSession,
} from "@selectio/db";
import { createUserClient } from "@selectio/tg-client/client";
import { inngest } from "./client";

/**
 * Inngest функция для отправки сообщения в Telegram
 */
export const sendTelegramMessageFunction = inngest.createFunction(
  {
    id: "send-telegram-message",
    name: "Send Telegram Message",
    retries: 3,
  },
  { event: "telegram/message.send" },
  async ({ event, step }) => {
    const { messageId, chatId, content } = event.data;

    const result = await step.run("send-telegram-message", async () => {
      console.log("📤 Отправка сообщения в Telegram", {
        messageId,
        chatId,
      });

      try {
        // Получаем conversation
        const conversation = await db.query.telegramConversation.findFirst({
          where: eq(telegramConversation.chatId, chatId),
          with: {
            response: {
              with: {
                vacancy: true,
              },
            },
          },
        });

        if (!conversation?.response?.vacancy?.workspaceId) {
          throw new Error("Не удалось определить workspace для сообщения");
        }

        const workspaceId = conversation.response.vacancy.workspaceId;

        // Получаем активную сессию для workspace
        const session = await db.query.telegramSession.findFirst({
          where: eq(telegramSession.workspaceId, workspaceId),
          orderBy: (sessions, { desc }) => [desc(sessions.lastUsedAt)],
        });

        if (!session) {
          throw new Error(
            `Нет активной Telegram сессии для workspace ${workspaceId}`,
          );
        }

        // Создаем клиент с сохраненной сессией
        const { client } = await createUserClient(
          Number.parseInt(session.apiId, 10),
          session.apiHash,
          session.sessionData as Record<string, string>,
        );

        // Отправляем сообщение
        const sentMessage = await client.sendText(chatId, content);
        const telegramMessageId = String(sentMessage.id);

        // Обновляем lastUsedAt для сессии
        await db
          .update(telegramSession)
          .set({ lastUsedAt: new Date() })
          .where(eq(telegramSession.id, session.id));

        console.log("✅ Сообщение отправлено в Telegram", {
          messageId,
          chatId,
          telegramMessageId,
          sessionId: session.id,
        });

        return { telegramMessageId };
      } catch (error) {
        console.error("❌ Ошибка отправки сообщения в Telegram", {
          messageId,
          chatId,
          error,
        });
        throw error;
      }
    });

    // Обновляем запись в базе данных с telegramMessageId
    await step.run("update-message-record", async () => {
      await db
        .update(telegramMessage)
        .set({
          telegramMessageId: result.telegramMessageId,
        })
        .where(eq(telegramMessage.id, messageId));

      console.log("✅ Обновлена запись сообщения в БД", {
        messageId,
        telegramMessageId: result.telegramMessageId,
      });
    });

    return {
      success: true,
      messageId,
      chatId,
      telegramMessageId: result.telegramMessageId,
    };
  },
);
