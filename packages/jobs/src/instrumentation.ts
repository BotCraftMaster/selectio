import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

// Фильтруем ненужные spans (опционально)
const shouldExportSpan = (span: any) => {
  // Экспортируем только spans связанные с AI
  return true;
};

// Создаем Langfuse span processor
export const langfuseSpanProcessor = new LangfuseSpanProcessor({
  shouldExportSpan,
});

// Настраиваем tracer provider
const tracerProvider = new NodeTracerProvider({
  spanProcessors: [langfuseSpanProcessor],
});

// Регистрируем provider
tracerProvider.register();

console.log("✅ Langfuse OpenTelemetry инициализирован");
