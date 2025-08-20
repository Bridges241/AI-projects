import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

export default defineConfig({
  base: "/AI-projects/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname,  "src"),
      "@shared": path.resolve(import.meta.dirname, "../shared"),
      "@assets": path.resolve(import.meta.dirname, "../attached_assets"),
      // ★ 這三條是關鍵：把套件導到 client/node_modules
      "drizzle-orm": path.resolve(__dirname, "node_modules/drizzle-orm"),
      "drizzle-zod": path.resolve(__dirname, "node_modules/drizzle-zod"),
      "zod": path.resolve(__dirname, "node_modules/zod"),
    },
  },
 
 
  server: {
    fs: {
      allow: [path.resolve(__dirname, "..", "shared")],
      strict: true,
      deny: ["**/.*"],
    },
  },
  build: { outDir: "dist", emptyOutDir: true },
});
