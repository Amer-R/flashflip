import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// PAT-17: two projects chosen by folder. A core file that touches the DOM fails in "core".
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "core",
          environment: "node",
          include: ["lib/core/**/*.test.ts", "lib/copy.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: [
            "app/**/*.test.{ts,tsx}",
            "components/**/*.test.{ts,tsx}",
            "lib/hooks/**/*.test.{ts,tsx}",
            "lib/storage/**/*.test.{ts,tsx}",
          ],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
});
