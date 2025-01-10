import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// Here you can set the proxy URL if you are using a proxy server
// This is only used for development
const proxyURL = "http://localhost:3000";

export default defineConfig({
  plugins: [react(), visualizer()],
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
});
