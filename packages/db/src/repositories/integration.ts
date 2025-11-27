import type { Cookie } from "crawlee";
import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { integration, type NewIntegration } from "../schema";

/**
 * Получить интеграцию по типу и userId
 */
export async function getIntegration(userId: string, type: string) {
  const result = await db
    .select()
    .from(integration)
    .where(and(eq(integration.userId, userId), eq(integration.type, type)))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Создать или обновить интеграцию
 */
export async function upsertIntegration(data: NewIntegration) {
  const existing = await getIntegration(data.userId, data.type);

  if (existing) {
    const [updated] = await db
      .update(integration)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(integration.id, existing.id))
      .returning();

    return updated!;
  }

  const [created] = await db.insert(integration).values(data).returning();
  return created!;
}

/**
 * Сохранить cookies для интеграции
 */
export async function saveCookiesForIntegration(
  userId: string,
  type: string,
  cookies: Cookie[]
) {
  const existing = await getIntegration(userId, type);

  if (!existing) {
    throw new Error(`Integration ${type} not found for user ${userId}`);
  }

  await db
    .update(integration)
    .set({
      cookies: cookies as any,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(integration.id, existing.id));
}

/**
 * Загрузить cookies для интеграции
 */
export async function loadCookiesForIntegration(
  userId: string,
  type: string
): Promise<Cookie[] | null> {
  const result = await getIntegration(userId, type);

  if (!result?.cookies) {
    return null;
  }

  return result.cookies as Cookie[];
}

/**
 * Получить credentials для интеграции
 */
export async function getIntegrationCredentials(
  userId: string,
  type: string
): Promise<Record<string, string> | null> {
  const result = await getIntegration(userId, type);
  return result?.credentials ?? null;
}

/**
 * Обновить время последнего использования
 */
export async function updateLastUsed(userId: string, type: string) {
  const existing = await getIntegration(userId, type);

  if (existing) {
    await db
      .update(integration)
      .set({
        lastUsedAt: new Date(),
      })
      .where(eq(integration.id, existing.id));
  }
}

/**
 * Получить все интеграции пользователя
 */
export async function getUserIntegrations(userId: string) {
  return db.select().from(integration).where(eq(integration.userId, userId));
}

/**
 * Удалить интеграцию
 */
export async function deleteIntegration(userId: string, type: string) {
  const existing = await getIntegration(userId, type);

  if (existing) {
    await db.delete(integration).where(eq(integration.id, existing.id));
  }
}
