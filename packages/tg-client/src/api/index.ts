import { serve } from "@hono/node-server";
import app from "./server";

const port = Number.parseInt(process.env.TG_CLIENT_PORT || "3001", 10);

console.log(`🚀 Starting Telegram Client API on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Telegram Client API running on http://localhost:${port}`);
