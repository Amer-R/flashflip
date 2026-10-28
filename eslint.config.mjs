import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // AD-1: the domain core stays pure.
  {
    files: ["lib/flashflip/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "lib/flashflip is pure: no React (AD-1)." },
            { name: "react-dom", message: "lib/flashflip is pure: no React DOM (AD-1)." },
            { name: "next", message: "lib/flashflip is pure: no Next (AD-1)." },
          ],
          patterns: [
            { group: ["react/*", "react-dom/*"], message: "lib/flashflip is pure: no React (AD-1)." },
            { group: ["next/*"], message: "lib/flashflip is pure: no Next (AD-1)." },
            {
              group: ["@/lib/storage", "@/lib/storage/*", "**/storage", "**/storage/*"],
              message: "lib/flashflip must not import storage (AD-1).",
            },
          ],
        },
      ],
    },
  },
  // AD-3: only the deck store touches localStorage.
  {
    ignores: ["lib/storage/deck-store.ts", "lib/storage/deck-store.test.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "localStorage", message: "Only lib/storage/deck-store.ts may touch localStorage (AD-3)." },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "window",
          property: "localStorage",
          message: "Only lib/storage/deck-store.ts may touch localStorage (AD-3).",
        },
        {
          object: "globalThis",
          property: "localStorage",
          message: "Only lib/storage/deck-store.ts may touch localStorage (AD-3).",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
