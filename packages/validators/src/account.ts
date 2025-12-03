import { z } from "zod";

export const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(30, { message: "Name must not be longer than 30 characters." }),
  image: z
    .string()
    .refine(
      (val) => !val || val.startsWith("data:image/"),
      "Image must be a valid data URL",
    )
    .nullable()
    .optional(),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
