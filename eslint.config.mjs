import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Advisory, not a correctness error: this fires on standard patterns
      // like fetch-on-mount and hydration-safe reads (e.g. theme from
      // localStorage). Kept visible as a warning rather than blocking CI.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
