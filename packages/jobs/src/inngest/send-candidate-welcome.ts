import { sendMessage } from "@selectio/telegram-bot";
import { generateWelcomeMessage } from "../services/candidate-welcome-service";
import { inngest } from "./client";

/**
 * Inngest функция для отправки приветственного сообщения кандидату в Telegram
 */
export const sendCandidateWelcomeFunction = inngest.createFunction(
  {
    id: "send-candidate-welcome",
    name: "Send Candidate Welcome Message",
    retries: 3,
  },
  { event: "candidate/welcome" },
  async ({ event, step }) => {
    const { responseId, chatId } = event.data;

    const welcomeMessage = await step.run(
      "generate-welcome-message",
      async () => {
        console.log("🤖 Генерация приветственного сообщения", {
          responseId,
          chatId,
        });

        try {
          const message = await generateWelcomeMessage(responseId);

          console.log("✅ Сообщение сгенерировано", {
            responseId,
            messageLength: message.length,
          });

          return message;
        } catch (error) {
          console.error("❌ Ошибка генерации приветствия", {
            responseId,
            error,
          });
          throw error;
        }
      }
    );

    return await step.run("send-telegram-message", async () => {
      console.log("📤 Отправка сообщения в Telegram", {
        responseId,
        chatId,
      });

      try {
        await sendMessage(chatId, welcomeMessage);

        console.log("✅ Сообщение отправлено", {
          responseId,
          chatId,
        });

        return {
          success: true,
          responseId,
          chatId,
          messageSent: true,
        };
      } catch (error) {
        console.error("❌ Ошибка отправки сообщения в Telegram", {
          responseId,
          chatId,
          error,
        });
        throw error;
      }
    });
  }
);
