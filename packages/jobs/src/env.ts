import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    HH_PASSWORD: z.string().min(1, "HH_PASSWORD is required"),
    HH_EMAIL: z.string().email().default("kodermax@gmail.com"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
