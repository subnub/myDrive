import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist-frontend",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"], // Include these extensions
  },
  envDir: "./src/config/",
  server: {
    proxy: {
      "/api": {
        target: "http://192.168.86.105:3000", // The port where your backend is running
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    host: true,
  },
});
