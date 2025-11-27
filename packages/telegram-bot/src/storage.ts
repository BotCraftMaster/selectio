import { db } from "@selectio/db/client";
import { file } from "@selectio/db/schema";
import { uploadFile as uploadToS3 } from "@selectio/lib";

export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const key = await uploadToS3(
    fileBuffer,
    fileName,
    mimeType,
    "telegram-voices"
  );

  const [fileRecord] = await db
    .insert(file)
    .values({
      provider: "S3",
      key,
      fileName,
      mimeType,
      fileSize: fileBuffer.length.toString(),
    })
    .returning();

  if (!fileRecord) {
    throw new Error("Не удалось создать запись файла");
  }

  return fileRecord.id;
}
