// vite.config.ts
import { defineConfig, loadEnv, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import path from "node:path";

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProd = mode === "production";

  return {
    plugins: [
      react(),
      legacy({
        targets: ["chrome >= 61", "defaults", "not dead"],
        renderLegacyChunks: true,
        polyfills: true,
        modernPolyfills: true,
        additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      }),
    ],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    build: {
      target: "es2015",
      minify: isProd ? "terser" : "esbuild",
      terserOptions: {
        compress: { drop_console: true, drop_debugger: true },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (
                id.includes("react-router") ||
                id.includes("react-dom") ||
                id.includes("/react/")
              ) {
                return "vendor-react";
              }
              if (id.includes("@tanstack")) return "vendor-tanstack";
            }
          },
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
