import type { ITelegramStorageProvider } from "@mtcute/core";
import {
  MemoryAuthKeysRepository,
  MemoryKeyValueRepository,
  MemoryPeersRepository,
  MemoryRefMessagesRepository,
  MemoryStorageDriver,
} from "@mtcute/core";

/**
 * Хранилище для MTCute, которое сохраняет данные в памяти
 * и позволяет экспортировать/импортировать сессию
 */
export class ExportableStorage implements ITelegramStorageProvider {
  readonly driver: MemoryStorageDriver;
  readonly kv: MemoryKeyValueRepository;
  readonly authKeys: MemoryAuthKeysRepository;
  readonly peers: MemoryPeersRepository;
  readonly refMessages: MemoryRefMessagesRepository;

  constructor() {
    this.driver = new MemoryStorageDriver();
    this.kv = new MemoryKeyValueRepository(this.driver);
    this.authKeys = new MemoryAuthKeysRepository(this.driver);
    this.peers = new MemoryPeersRepository(this.driver);
    this.refMessages = new MemoryRefMessagesRepository(this.driver);
  }

  /**
   * Экспортировать сессию в JSON
   */
  async export(): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    // Экспортируем ключи авторизации
    const authKeysMap: Array<{ dc: number; key: string }> = [];
    for (const [dc, key] of this.authKeys.state.authKeys.entries()) {
      authKeysMap.push({
        dc,
        key: Buffer.from(key).toString("base64"),
      });
    }
    if (authKeysMap.length > 0) {
      result.authKeys = JSON.stringify(authKeysMap);
    }

    // Экспортируем key-value данные
    const kvData: Record<string, string> = {};
    for (const [key, value] of this.kv.state.entries()) {
      kvData[key] = Buffer.from(value).toString("base64");
    }
    if (Object.keys(kvData).length > 0) {
      result.kv = JSON.stringify(kvData);
    }

    return result;
  }

  /**
   * Импортировать сессию из JSON
   */
  async import(data: Record<string, string>): Promise<void> {
    // Импортируем ключи авторизации
    if (data.authKeys) {
      const authKeysData = JSON.parse(data.authKeys) as Array<{
        dc: number;
        key: string;
      }>;
      for (const keyData of authKeysData) {
        const keyBuffer = Buffer.from(keyData.key, "base64");
        this.authKeys.set(keyData.dc, new Uint8Array(keyBuffer));
      }
    }

    // Импортируем key-value данные
    if (data.kv) {
      const kvData = JSON.parse(data.kv) as Record<string, string>;
      for (const [key, value] of Object.entries(kvData)) {
        const valueBuffer = Buffer.from(value, "base64");
        this.kv.state.set(key, new Uint8Array(valueBuffer));
      }
    }
  }
}
