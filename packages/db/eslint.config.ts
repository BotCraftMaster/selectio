import { defineConfig } from "eslint/config";

import { baseConfig } from "@selectio/eslint-config/base";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
);
