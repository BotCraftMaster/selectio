import { PuppeteerCrawler } from "crawlee";

import { env } from "./env";
import { saveCookies } from "./utils/cookies";

/**
 * Скрипт для парсинга откликов на hh.ru
 */
async function runParser() {
  const email = env.HH_EMAIL;
  const password = env.HH_PASSWORD;

  console.log("🚀 Запуск парсера hh.ru...");
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

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await page.waitForSelector('input[type="password"][name="password"]', {
          visible: false,
        });
        log.info("🔒 Заполнение пароля...");
        await page.type('input[type="password"][name="password"]', password);

        log.info("📤 Отправка формы...");

        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
          page.click('button[type="submit"]'),
        ]);

        log.info("✅ Авторизация выполнена!");
        log.info(`🌐 Текущий URL: ${page.url()}`);

        const cookies = await page.cookies();
        log.info(`🍪 Получено ${cookies.length} cookies`);

        await saveCookies(cookies);

        const vacancies = await parseVacancies(page);

        // Парсим отклики для каждой вакансии
        for (const vacancy of vacancies) {
          if (vacancy.responsesUrl) {
            const fullUrl = new URL(vacancy.responsesUrl, "https://hh.ru").href;
            await parseResponses(page, fullUrl);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));

        console.log("\n✨ Парсинг успешно завершен!");
      } catch (error) {
        if (error instanceof Error) {
          log.error(error.message);
          if (error.stack) {
            log.error(error.stack);
          }
        } else {
          log.error(String(error));
        }
        throw error;
      }
    },
    maxRequestsPerCrawl: 1,
  });

  await crawler.run([loginUrl]);
  await crawler.teardown();
}

async function parseVacancies(page: any) {
  const vacanciesUrl = "https://hh.ru/employer/vacancies?hhtmFrom=vacancy";
  console.log(`📄 Переход на страницу вакансий: ${vacanciesUrl}`);

  await page.goto(vacanciesUrl, { waitUntil: "networkidle2" });
  await page.waitForSelector('div[data-qa="vacancies-dashboard-vacancy"]', {
    timeout: 10000,
  });

  const vacancies = await page.$$eval(
    'div[data-qa="vacancies-dashboard-vacancy"]',
    (elements: any[]) => {
      return elements.map((el) => {
        const getText = (selector: string) => {
          const node = el.querySelector(selector);
          return node ? node.textContent.trim() : "";
        };

        const getAttr = (selector: string, attr: string) => {
          const node = el.querySelector(selector);
          return node ? node.getAttribute(attr) : "";
        };

        // Helper to clean numbers (remove non-digits)
        const cleanNumber = (text: string) => text.replace(/\D/g, "");

        return {
          id: el.getAttribute("data-vacancy-id") || "",
          title: getText('[data-qa="vacancies-dashboard-vacancy-name"]'),
          url: getAttr('[data-qa="vacancies-dashboard-vacancy-name"]', "href"),
          views: cleanNumber(
            getText(
              '[data-analytics-button-name="employer_vacancies_counter_views"]',
            ),
          ),
          responses: getText(
            '[data-qa="vacancies-dashboard-vacancy-responses-count-total"]',
          ),
          responsesUrl: getAttr(
            '[data-qa="vacancies-dashboard-vacancy-responses-count-link"]',
            "href",
          ),
          newResponses: getText(
            '[data-qa="vacancies-dashboard-vacancy-responses-count-new"]',
          ),
          resumesInProgress: cleanNumber(
            getText(
              '[data-qa="vacancies-dashboard-vacancy-resumes-in-progress-count"]',
            ),
          ),
          suitableResumes: cleanNumber(
            getText('[data-qa="suitable-resumes-count"]'),
          ),
          region: getText('[data-qa="table-flexible-cell-area"]'),
        };
      });
    },
  );

  console.log(`✅ Найдено активных вакансий: ${vacancies.length}`);
  console.log(JSON.stringify(vacancies, null, 2));
  return vacancies;
}

async function parseResponses(page: any, url: string) {
  console.log(`📄 Переход на страницу откликов: ${url}`);
  await page.goto(url, { waitUntil: "networkidle2" });

  try {
    await page.waitForSelector("[data-resume-id]", { timeout: 10000 });
  } catch (e) {
    console.log("⚠️ Не найдено резюме на странице (возможно, нет откликов).");
    return [];
  }

  const responses = await page.$$eval("[data-resume-id]", (elements: any[]) => {
    return elements.map((el) => {
      const getText = (selector: string) => {
        const node = el.querySelector(selector);
        return node ? node.textContent.trim() : "";
      };
      const getAttr = (selector: string, attr: string) => {
        const node = el.querySelector(selector);
        return node ? node.getAttribute(attr) : "";
      };

      // Helper to find field content by title
      const getFieldContent = (titleText: string) => {
        const fields = Array.from(
          el.querySelectorAll(".field--FCBCQo0nBg5byw86"),
        );
        const field = fields.find((f: any) => {
          const title = f.querySelector(".title--qEdGQ1tNR4koZr8t");
          return title && title.textContent.trim().includes(titleText);
        });
        if (field) {
          const content = (field as any).querySelector(
            ".content--vAUqut0YCUxg4xgv",
          );
          return content ? content.textContent.trim() : "";
        }
        return "";
      };

      return {
        id: el.getAttribute("data-resume-id"),
        title: getText('[data-qa="serp-item__title-text"]'),
        url: getAttr('[data-qa="serp-item__title"]', "href"),
        fullName: getText('[data-qa="resume-serp__resume-fullname"]'),
        age: getText('[data-qa="resume-serp__resume-age"]'),
        experience: getFieldContent("Опыт работы"),
        lastExperience: getFieldContent("Последнее место работы"),
        tags: Array.from(
          el.querySelectorAll(
            '[data-qa="resume-card-tags"] .magritte-tag__label___YHV-o_4-0-24',
          ),
        ).map((tag: any) => tag.textContent.trim()),
      };
    });
  });

  console.log(`✅ Найдено откликов: ${responses.length}`);
  console.log(JSON.stringify(responses, null, 2));
  return responses;
}

runParser().catch(console.error);
