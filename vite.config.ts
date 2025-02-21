import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "./src/config/");

  const proxyURL = env.VITE_PROXY_URL || "http://localhost:3000";

  console.log(`\nBackend Development Proxy URL: ${proxyURL}/api\n`);

  return {
    plugins: [
      react(),
      visualizer(),
      VitePWA({
        registerType: "autoUpdate",
      }),
    ],
    build: {
      outDir: "dist-frontend",
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"], // Include these extensions
    },
    envDir: "./src/config/",
    server: {
      proxy: proxyURL
        ? {
            "/api": {
              target: proxyURL, // The port where your backend is running
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ""),
            },
          }
        : undefined,
      host: proxyURL ? true : undefined,
    },
  };
});
