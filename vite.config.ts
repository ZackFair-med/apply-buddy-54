// Vercel build config for ApplyPilot.
// Replace the project's root vite.config.ts with this file (or copy its contents)
// when deploying to Vercel. It swaps the default Cloudflare Nitro preset for
// Vercel's Node serverless preset while keeping every other Lovable plugin.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  tanstackStart: {
    server: { entry: "server" },
  },
  // Nitro's Vercel preset emits a .vercel/output/ directory that Vercel
  // auto-detects — no framework preset needs to be selected in the Vercel UI.
  nitro: {
    preset: "vercel",
  },
});
