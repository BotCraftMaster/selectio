import { registerOTel } from "@vercel/otel";
import { LangfuseExporter } from "langfuse-vercel";

export function register() {
  registerOTel({
    serviceName: "selectio-jobs",
    traceExporter: new LangfuseExporter(),
  });
}

register();

console.log("✅ Langfuse OpenTelemetry инициализирован");
