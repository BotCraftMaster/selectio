import { PuppeteerCrawler } from "crawlee";

import { env } from "./env";
import { saveCookies } from "./utils/cookies";

/**
 * Скрипт для авторизации на hh.ru с использованием Crawlee
 */
async function loginToHH() {
  const email = env.HH_EMAIL;
  const password = env.HH_PASSWORD;

  console.log("🚀 Запуск авторизации на hh.ru...");
  console.log(`📧 Email: ${email}`);

  const loginUrl =
    "https://hh.ru/account/login?role=employer&backurl=%2F&hhtmFrom=main&hasSwitcher=true&skipSwitcher=true";

  const crawler = new PuppeteerCrawler({
    headless: false, // Показываем браузер для отладки
    launchContext: {
      launchOptions: {
        headless: false,
        slowMo: 100, // Замедляем действия для наглядности
      },
    },
    async requestHandler({ page, request, log }) {
      log.info(`📄 Обработка страницы: ${request.url}`);

      try {
        log.info("⏳ Ожидание загрузки страницы...");
        await page.waitForNetworkIdle({ timeout: 10000 });

        log.info("🔍 Поиск поля email...");
        await page.waitForSelector('input[type="text"][name="username"]', {
          visible: false,
          timeout: 15000,
        });

        log.info("✍️  Заполнение email...");
        await page.type('input[type="text"][name="username"]', email);

        log.info("🔑 Нажатие на кнопку 'Войти с паролем'...");
        await page.waitForSelector(
          'button[data-qa="expand-login-by_password"]',
          {
            visible: false,
            timeout: 10000,
          },
        );
        await page.click('button[data-qa="expand-login-by_password"]');

        // Ждем появления поля пароля после клика
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await page.waitForSelector('input[type="password"][name="password"]', {
          visible: false,
        });
        log.info("🔒 Заполнение пароля...");
        await page.type('input[type="password"][name="password"]', password);

        log.info("📤 Отправка формы...");

        // Кликаем на кнопку и ждем навигации
        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
          page.click('button[type="submit"]'),
        ]);

        log.info("✅ Авторизация выполнена!");
        log.info(`🌐 Текущий URL: ${page.url()}`);

        // Сохраняем cookies для последующего использования
        const cookies = await page.cookies();
        log.info(`🍪 Получено ${cookies.length} cookies`);

        await saveCookies(cookies);

        // Ждем 5 секунд, чтобы увидеть результат
        await new Promise((resolve) => setTimeout(resolve, 5000));

        console.log("\n✨ Авторизация успешно завершена!");
      } catch (error) {
        log.error("❌ Ошибка при авторизации");
        if (error instanceof Error) {
          log.error(error.message);
        }
        throw error;
      }
    },
    maxRequestsPerCrawl: 1,
  });

  await crawler.run([loginUrl]);
  await crawler.teardown();
}

// Запускаем скрипт
loginToHH().catch(console.error);
