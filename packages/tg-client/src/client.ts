import { TelegramClient } from "@mtcute/bun";
import { env } from "@selectio/config";
import { ExportableStorage } from "./storage";

const API_ID = Number.parseInt(env.TELEGRAM_API_ID || "0", 10);
const API_HASH = env.TELEGRAM_API_HASH || "";
const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN || "";
if (!API_ID || !API_HASH || !BOT_TOKEN) {
  throw new Error(
    "TELEGRAM_API_ID, TELEGRAM_API_HASH и TELEGRAM_BOT_TOKEN должны быть установлены",
  );
}

// Создаем клиент для отправки сообщений (бот) - используется только для получения обновлений
export const tg = new TelegramClient({
  apiId: API_ID,
  apiHash: API_HASH,
  storage: new ExportableStorage(),
});

// Инициализация клиента
let isInitialized = false;

export async function initClient() {
  if (isInitialized) return;

  try {
    await tg.start({
      botToken: BOT_TOKEN,
    });

    isInitialized = true;
    console.log("✅ MTCute клиент инициализирован");
  } catch (error) {
    console.error("❌ Ошибка инициализации MTCute клиента:", error);
    throw error;
  }
}

export { ExportableStorage } from "./storage";
export * from "./user-client";
