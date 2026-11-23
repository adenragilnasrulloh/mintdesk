import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages project site: served under /mintdesk/
  base: "/mintdesk/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
