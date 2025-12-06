import type { Browser } from "puppeteer";
import puppeteer from "puppeteer";
import { performLogin } from "../../../parsers/hh/auth";
import { inngest } from "../../client";

export const verifyHHCredentialsFunction = inngest.createFunction(
  {
    id: "integration-verify-hh-credentials",
    name: "Verify HH Credentials",
  },
  { event: "integration/verify-hh-credentials" },
  async ({ event, step }) => {
    const { email, password, workspaceId } = event.data;

    const result = await step.run("verify-credentials", async () => {
      let browser: Browser | undefined;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        );

        await page.goto(
          "https://hh.ru/account/login?backurl=%2F&role=employer",
          {
            waitUntil: "networkidle2",
          },
        );

        const log = {
          info: (msg: string) => console.log(msg),
          error: (msg: string) => console.error(msg),
          warning: (msg: string) => console.warn(msg),
          debug: (msg: string) => console.debug(msg),
        };

        await performLogin(
          page,
          log as unknown as import("crawlee").Log,
          email,
          password,
          workspaceId,
        );

        await browser.close();

        return {
          success: true,
          isValid: true,
        };
      } catch (error) {
        if (browser) {
          await browser.close();
        }

        const errorMessage =
          error instanceof Error ? error.message : "Неизвестная ошибка";

        if (
          errorMessage.includes("Неверный логин") ||
          errorMessage.includes("пароль") ||
          errorMessage.includes("login")
        ) {
          return {
            success: false,
            isValid: false,
            error: "Неверный логин или пароль",
          };
        }

        throw error;
      }
    });

    return result;
  },
);
