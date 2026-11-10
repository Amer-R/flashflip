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
    // FR-17 / AD-4: Paste text reaches the page only as React text.
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: "dangerouslySetInnerHTML is banned (FR-17, AD-4).",
        },
      ],
    },
  },
  {
    // PAT-5: the core stays pure and framework-free.
    files: ["lib/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react-dom", "react/*", "react-dom/*", "next", "next/*"], message: "lib/core must not import react or next (PAT-5)." },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        { name: "window", message: "No browser globals in lib/core (PAT-5)." },
        { name: "document", message: "No browser globals in lib/core (PAT-5)." },
        { name: "localStorage", message: "No browser globals in lib/core (PAT-5)." },
        { name: "navigator", message: "No browser globals in lib/core (PAT-5)." },
      ],
    },
  },
  {
    // Component boundaries: screens and ui get data and callbacks as props.
    files: ["components/screens/**/*.{ts,tsx}", "components/ui/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/core/parse-lines", "@/lib/core/session", "@/lib/core/selectors", "@/lib/core/saved-state", "@/lib/storage/*"], message: "Screens and ui receive derived data as props; they never import the parser, reducer, saved-state or storage." },
          ],
        },
      ],
    },
  },
  {
    // PAT-11: only lib/storage/ touches localStorage; everything else goes through its adapter.
    files: ["**/*.{ts,tsx}"],
    // lib/core has its own no-restricted-globals list (which includes localStorage); a later
    // block would replace it, not merge, so lib/core is excluded here.
    ignores: ["lib/storage/**", "lib/core/**", "**/*.test.{ts,tsx}", "vitest.setup.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "localStorage", message: "Only lib/storage/ touches localStorage (PAT-11)." },
      ],
      "no-restricted-properties": [
        "error",
        { object: "window", property: "localStorage", message: "Only lib/storage/ touches localStorage (PAT-11)." },
        { object: "globalThis", property: "localStorage", message: "Only lib/storage/ touches localStorage (PAT-11)." },
      ],
    },
  },
]);

export default eslintConfig;
