import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: "jsx",
    include: [
      // Process all .js files in the src directory as JSX
      /src\/.*\.js$/,
    ],
    exclude: [
      // Exclude node_modules from processing
      /node_modules/,
    ],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // The port where your backend is running
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
