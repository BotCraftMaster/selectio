import { openai } from "@ai-sdk/openai";
import { env } from "@selectio/config";
import { experimental_transcribe as transcribe } from "ai";

export async function transcribeAudio(
  audioBuffer: Buffer,
): Promise<string | null> {
  // Пропускаем транскрибцию, если OPENAI_API_KEY не заполнен
  if (!env.OPENAI_API_KEY) {
    console.log("⏭️ Транскрибация пропущена: OPENAI_API_KEY не заполнен");
    return null;
  }

  try {
    const result = await transcribe({
      model: openai.transcription("whisper-1"),
      audio: audioBuffer,
      providerOptions: { openai: { language: "ru" } },
    });

    return result.text;
  } catch (error) {
    console.error("Ошибка при транскрибции аудио:", error);
    return null;
  }
}
