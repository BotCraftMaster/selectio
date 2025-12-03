import { Hono } from "hono";
import { botManager } from "./bot-manager";

/**
 * HTTP сервер для healthcheck в Kubernetes
 */
export function createHealthServer(port = 8002) {
  const app = new Hono();

  // Liveness probe - проверяет, что процесс жив
  app.get("/healthz", (c) => {
    return c.json({ status: "ok" });
  });

  // Readiness probe - проверяет, что боты готовы принимать сообщения
  app.get("/readyz", (c) => {
    const count = botManager.getBotsCount();

    if (count === 0) {
      return c.json({ status: "not ready", bots: 0 }, 503);
    }

    return c.json({
      status: "ready",
      bots: count,
      details: botManager.getBotsInfo(),
    });
  });

  // Метрики для мониторинга
  app.get("/metrics", (c) => {
    const bots = botManager.getBotsInfo();

    return c.text(
      `
# HELP telegram_bots_total Total number of running bots
# TYPE telegram_bots_total gauge
telegram_bots_total ${bots.length}

# HELP telegram_bots_info Information about running bots
# TYPE telegram_bots_info gauge
${bots.map((bot) => `telegram_bots_info{workspace_id="${bot.workspaceId}",username="${bot.username || bot.userId}"} 1`).join("\n")}
    `.trim(),
    );
  });

  return {
    fetch: app.fetch,
    port,
  };
}
