import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Vercel can hang after Vite finishes if something keeps Node's event loop alive.
    {
      name: "force-exit-after-build",
      apply: "build",
      closeBundle() {
        setTimeout(() => process.exit(0), 0);
      },
    },
  ],
  build: {
    chunkSizeWarningLimit: 1200,
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@mui")) return "mui";
          if (id.includes("recharts")) return "recharts";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("three")) return "three";
          if (id.includes("react-dom") || id.includes("/react/")) return "react";
          return "vendor";
        },
      },
    },
  },
});
