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
      // Perhaps will be used in the future, currently lots of issues
      // With downloading files on safari iOS PWA (who would have guessed)
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          navigateFallbackDenylist: [
            /^\/file-service\/download\//, // Matches any path starting with /file-service/download/
            /^\/file-service\/public\/download\/[^\/]+\/[^\/]+/, // Matches /file-service/public/download/:id/:tempToken
            /^\/folder-service\/download-zip/, // Matches /folder-service/download-zip
            /^\/file-service\/stream-video\/[^\/]+/, // Matches /file-service/stream-video/:id
            /^\/file-service\/download\/[^\/]+/, // Matches /file-service/download/:id
          ],
        },
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
