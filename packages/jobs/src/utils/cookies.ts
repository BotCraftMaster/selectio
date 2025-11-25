import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Cookie } from "crawlee";

const STORAGE_DIR = join(process.cwd(), ".crawlee", "storage");
const COOKIES_FILE = join(STORAGE_DIR, "hh-cookies.json");

/**
 * Сохраняет cookies в файл
 */
export async function saveCookies(cookies: Cookie[]): Promise<void> {
  try {
    await mkdir(STORAGE_DIR, { recursive: true });
    await writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));
    console.log(`✓ Cookies сохранены в ${COOKIES_FILE}`);
  } catch (error) {
    console.error("Ошибка при сохранении cookies:", error);
  }
}

/**
 * Загружает cookies из файла
 */
export async function loadCookies(): Promise<Cookie[] | null> {
  try {
    const data = await readFile(COOKIES_FILE, "utf-8");
    const cookies = JSON.parse(data) as Cookie[];
    console.log(`✓ Загружено ${cookies.length} cookies`);
    return cookies;
  } catch {
    console.log("Cookies не найдены, требуется авторизация");
    return null;
  }
}
