import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Keep stable framework/auth code in long-lived cacheable chunks and leave the frequently
        // changing desk implementation in its own asset. This also prevents one 500k+ parse task on
        // first load while preserving the existing single-page runtime.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@clerk/")) return "clerk";
          if (id.includes("react-dom") || id.includes("/react/")) return "react-vendor";
          if (id.includes("lucide-react")) return "icons";
          return undefined;
        },
      },
    },
  },
});
