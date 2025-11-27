import { db } from "@selectio/db/client";
import { telegramConversation, telegramMessage } from "@selectio/db/schema";
import { eq } from "drizzle-orm";
import { Bot } from "grammy";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN не установлен");
}

export const bot = new Bot(TELEGRAM_BOT_TOKEN);

bot.command("start", async (ctx) => {
  const chatId = ctx.chat.id.toString();

  await db
    .insert(telegramConversation)
    .values({
      chatId,
      candidateName: ctx.from?.first_name,
      status: "ACTIVE",
    })
    .onConflictDoUpdate({
      target: telegramConversation.chatId,
      set: { status: "ACTIVE" },
    })
    .returning();

  await ctx.reply(
    "Привет! Я бот для общения с кандидатами. Напишите ваше сообщение."
  );
});

bot.on("message:text", async (ctx) => {
  const chatId = ctx.chat.id.toString();
  const messageText = ctx.message.text;

  const [conversation] = await db
    .select()
    .from(telegramConversation)
    .where(eq(telegramConversation.chatId, chatId))
    .limit(1);

  if (!conversation) {
    await ctx.reply("Пожалуйста, начните с команды /start");
    return;
  }

  await db.insert(telegramMessage).values({
    conversationId: conversation.id,
    sender: "CANDIDATE",
    contentType: "TEXT",
    content: messageText,
    telegramMessageId: ctx.message.message_id.toString(),
  });

  await ctx.reply("Сообщение получено и сохранено в базе данных.");
});

bot.on("message:voice", async (ctx) => {
  const chatId = ctx.chat.id.toString();
  const voice = ctx.message.voice;

  const [conversation] = await db
    .select()
    .from(telegramConversation)
    .where(eq(telegramConversation.chatId, chatId))
    .limit(1);

  if (!conversation) {
    await ctx.reply("Пожалуйста, начните с команды /start");
    return;
  }

  try {
    const file = await ctx.api.getFile(voice.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    const response = await fetch(fileUrl);
    const fileBuffer = Buffer.from(await response.arrayBuffer());

    const { uploadFile } = await import("./storage");
    const fileId = await uploadFile(
      fileBuffer,
      `${voice.file_id}.ogg`,
      "audio/ogg"
    );

    await db.insert(telegramMessage).values({
      conversationId: conversation.id,
      sender: "CANDIDATE",
      contentType: "VOICE",
      content: "Голосовое сообщение",
      fileId,
      voiceDuration: voice.duration.toString(),
      telegramMessageId: ctx.message.message_id.toString(),
    });

    await ctx.reply("Голосовое сообщение получено и сохранено.");
  } catch (error) {
    console.error("Ошибка при обработке голосового сообщения:", error);
    await ctx.reply("Произошла ошибка при обработке голосового сообщения.");
  }
});

export async function sendMessage(
  chatId: string,
  text: string,
  sender: "BOT" | "ADMIN" = "BOT"
) {
  const [conversation] = await db
    .select()
    .from(telegramConversation)
    .where(eq(telegramConversation.chatId, chatId))
    .limit(1);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const sentMessage = await bot.api.sendMessage(chatId, text);

  await db.insert(telegramMessage).values({
    conversationId: conversation.id,
    sender,
    content: text,
    telegramMessageId: sentMessage.message_id.toString(),
  });

  return sentMessage;
}
