import { db, eq, telegramSession } from "@selectio/db";
import { createUserClient } from "@selectio/tg-client/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

/**
 * Отправить сообщение через пользовательскую сессию Telegram
 */
export const sendUserMessageRouter = protectedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      sessionId: z.string().optional(), // Если не указан, берем последнюю активную
      chatId: z.string(),
      text: z.string().min(1),
    }),
  )
  .mutation(async ({ input }) => {
    try {
      // Получаем сессию
      const session = input.sessionId
        ? await db.query.telegramSession.findFirst({
            where: eq(telegramSession.id, input.sessionId),
          })
        : await db.query.telegramSession.findFirst({
            where: eq(telegramSession.workspaceId, input.workspaceId),
            orderBy: (sessions, { desc }) => [desc(sessions.lastUsedAt)],
          });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Telegram сессия не найдена. Пожалуйста, авторизуйтесь.",
        });
      }

      // Создаем клиент с сохраненной сессией
      const { client } = await createUserClient(
        Number.parseInt(session.apiId, 10),
        session.apiHash,
        session.sessionData as Record<string, string>,
      );

      // Отправляем сообщение
      const result = await client.sendText(input.chatId, input.text);

      // Обновляем lastUsedAt
      await db
        .update(telegramSession)
        .set({ lastUsedAt: new Date() })
        .where(eq(telegramSession.id, session.id));

      return {
        success: true,
        messageId: result.id.toString(),
        chatId: result.chat.id.toString(),
      };
    } catch (error) {
      console.error("❌ Ошибка отправки сообщения:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Не удалось отправить сообщение",
      });
    }
  });

/**
 * Отправить сообщение по номеру телефона через пользовательскую сессию
 */
export const sendUserMessageByPhoneRouter = protectedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      sessionId: z.string().optional(),
      phone: z.string(),
      text: z.string().min(1),
      firstName: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    try {
      // Получаем сессию
      const session = input.sessionId
        ? await db.query.telegramSession.findFirst({
            where: eq(telegramSession.id, input.sessionId),
          })
        : await db.query.telegramSession.findFirst({
            where: eq(telegramSession.workspaceId, input.workspaceId),
            orderBy: (sessions, { desc }) => [desc(sessions.lastUsedAt)],
          });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Telegram сессия не найдена. Пожалуйста, авторизуйтесь.",
        });
      }

      // Создаем клиент
      const { client } = await createUserClient(
        Number.parseInt(session.apiId, 10),
        session.apiHash,
        session.sessionData as Record<string, string>,
      );

      // Импортируем контакт и отправляем сообщение
      const cleanPhone = input.phone.replace(/[^\d+]/g, "");
      if (!cleanPhone.startsWith("+")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Номер телефона должен быть в международном формате",
        });
      }

      const { Long } = await import("@mtcute/core");
      const importResult = await client.call({
        _: "contacts.importContacts",
        contacts: [
          {
            _: "inputPhoneContact",
            clientId: Long.fromNumber(Date.now()),
            phone: cleanPhone,
            firstName: input.firstName || "Кандидат",
            lastName: "",
          },
        ],
      });

      if (!importResult.users || importResult.users.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Пользователь с таким номером не найден в Telegram",
        });
      }

      const user = importResult.users[0];
      if (!user || user._ !== "user") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Не удалось получить данные пользователя",
        });
      }

      // Отправляем сообщение
      const result = await client.sendText(user.id, input.text);

      // Обновляем lastUsedAt
      await db
        .update(telegramSession)
        .set({ lastUsedAt: new Date() })
        .where(eq(telegramSession.id, session.id));

      return {
        success: true,
        messageId: result.id.toString(),
        chatId: result.chat.id.toString(),
        userId: user.id.toString(),
      };
    } catch (error) {
      console.error("❌ Ошибка отправки сообщения по телефону:", error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Не удалось отправить сообщение",
      });
    }
  });
