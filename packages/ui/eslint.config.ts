import { reactConfig } from "@selectio/eslint-config/react";
import { baseConfig } from "@selectio/eslint-config/base";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
);
