import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@marlion/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@marlion/types": path.resolve(__dirname, "../../packages/types/src"),
      "@marlion/config": path.resolve(__dirname, "../../packages/config/src"),
      "@marlion/firebase": path.resolve(__dirname, "../../packages/firebase/src"),
      "@marlion/ai": path.resolve(__dirname, "../../packages/ai/src"),
    },
  },
  server: {
    port: 3001,
  },
});
