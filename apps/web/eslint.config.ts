import { baseConfig, restrictEnvAccess } from "@selectio/eslint-config/base";
import { nextjsConfig } from "@selectio/eslint-config/nextjs";
import { reactConfig } from "@selectio/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
