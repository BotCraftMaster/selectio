import { PlaywrightCrawler } from "crawlee";

import { env } from "./env";
import { loadCookies } from "./utils/cookies";

/**
 * Пример использования сохраненных cookies для работы с hh.ru
 */
async function exampleWithCookies() {
  console.log("🔍 Загрузка сохраненных cookies...");

  const savedCookies = await loadCookies();

  if (!savedCookies) {
    console.error(
      "❌ Cookies не найдены. Сначала выполните авторизацию: bun run hh:login",
    );
    process.exit(1);
  }

  const crawler = new PlaywrightCrawler({
    headless: false,
    launchContext: {
      launchOptions: {
        headless: false,
      },
    },
    async requestHandler({ page, request, log }) {
      log.info(`📄 Обработка страницы: ${request.url}`);

      try {
        // Устанавливаем сохраненные cookies
        await page.context().addCookies(savedCookies);

        log.info("🍪 Cookies установлены");

        // Переходим на главную страницу работодателя
        await page.goto("https://hh.ru/employer", {
          waitUntil: "networkidle",
        });

        log.info(`✅ Страница загружена: ${page.url()}`);

        // Проверяем, что мы авторизованы
        const isLoggedIn = await page
          .locator('[data-qa="mainmenu_myResumes"]')
          .isVisible()
          .catch(() => false);

        if (isLoggedIn) {
          log.info("✅ Авторизация активна!");
        } else {
          log.warning(
            "⚠️  Возможно, сессия истекла. Требуется повторная авторизация.",
          );
        }

        // Ждем 5 секунд
        await page.waitForTimeout(5000);
      } catch (error) {
        log.error("❌ Ошибка при работе с cookies");
        if (error instanceof Error) {
          log.error(error.message);
        }
        throw error;
      }
    },
    maxRequestsPerCrawl: 1,
  });

  await crawler.run(["https://hh.ru/employer"]);
  await crawler.teardown();
}

// Запускаем скрипт
exampleWithCookies().catch(console.error);
