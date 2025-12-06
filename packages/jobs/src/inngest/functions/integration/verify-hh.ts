import { db, eq } from "@selectio/db";
import { integration } from "@selectio/db/schema";
import axios from "axios";
import { verifyIntegrationChannel } from "../../channels-client";
import { inngest } from "../../client";
import { checkHHCredentials } from "../../../services/auth";

/**
 * Проверяет валидность интеграции HH
 * Делает тестовый запрос к API HH для проверки cookies/credentials
 */
export const verifyHHIntegrationFunction = inngest.createFunction(
  {
    id: "verify-hh-integration",
    name: "Verify HeadHunter Integration",
    retries: 1,
  },
  { event: "integration/hh.verify" },
  async ({ event, step, publish }) => {
    const { integrationId, workspaceId } = event.data;

    return await step.run("verify-hh-integration", async () => {
      console.log(`🔍 Проверяем интеграцию HH: ${integrationId}`);

      // Получаем интеграцию
      const hhIntegration = await db.query.integration.findFirst({
        where: (fields, { and }) =>
          and(
            eq(fields.id, integrationId),
            eq(fields.workspaceId, workspaceId),
            eq(fields.type, "hh"),
          ),
      });

      if (!hhIntegration) {
        throw new Error("Интеграция HH не найдена");
      }

      if (!hhIntegration.cookies || hhIntegration.cookies.length === 0) {
        throw new Error("Cookies для HH не найдены");
      }

      // Проверяем наличие credentials
      if (!hhIntegration.credentials) {
        throw new Error("Credentials для HH не найдены");
      }

      // Извлекаем username и password из credentials
      const credentials = hhIntegration.credentials as {
        username?: string;
        email?: string;
        password?: string;
      };

      const username = credentials.username || credentials.email;
      const password = credentials.password;

      if (!username || !password) {
        throw new Error(
          "Некорректные credentials: отсутствует username/email или password",
        );
      }

      // Используем общую функцию проверки
      const checkResult = await checkHHCredentials(
        username,
        password,
        hhIntegration.cookies || [],
      );

      if (!checkResult.success || !checkResult.data.isValid) {
        const errorMsg =
          !checkResult.success
            ? checkResult.error
            : checkResult.data.error || "Интеграция невалидна";

        console.log(
          `❌ Интеграция HH невалидна: ${errorMsg}`,
        );

        // Деактивируем интеграцию
        await db
          .update(integration)
          .set({
            isActive: false,
            metadata: {
              ...((hhIntegration.metadata as Record<string, unknown>) || {}),
              lastVerificationError: errorMsg,
              lastVerificationAt: new Date().toISOString(),
            },
          })
          .where(eq(integration.id, integrationId));

        // Публикуем результат в realtime
        await publish(
          verifyIntegrationChannel(workspaceId)["integration-verify"]({
            integrationId,
            integrationType: "hh",
            success: false,
            isValid: false,
            error: errorMsg,
          }),
        );

        return {
          success: false,
          isValid: false,
          error: errorMsg,
        };
      }

      // Интеграция валидна
      console.log("✅ Интеграция HH валидна");

      // Если обновились куки, можно их обновить (опционально, хотя checkHHCredentials их возвращает)
      if (checkResult.data.cookies) {
        // TODO: Обновить cookies в базе если нужно, но пока это не требовалось явно
      }

      await db
        .update(integration)
        .set({
          isActive: true,
          lastUsedAt: new Date(),
          metadata: {
            ...((hhIntegration.metadata as Record<string, unknown>) || {}),
            lastVerificationAt: new Date().toISOString(),
          },
        })
        .where(eq(integration.id, integrationId));

      // Публикуем результат в realtime
      await publish(
        verifyIntegrationChannel(workspaceId)["integration-verify"]({
          integrationId,
          integrationType: "hh",
          success: true,
          isValid: true,
        }),
      );

      return {
        success: true,
        isValid: true,
      };
    });
  },
);
