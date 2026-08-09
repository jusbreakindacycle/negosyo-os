import { defineConfig, globalIgnores } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

const eslintConfig = defineConfig([
  expoConfig,
  globalIgnores([
    "dist/**",
    ".expo/**",
    "android/**",
    "ios/**",
    "expo-env.d.ts",
  ]),
]);

export default eslintConfig;
