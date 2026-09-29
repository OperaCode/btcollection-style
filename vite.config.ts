import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    // Explicit preset rather than relying on auto-detection — nitro is on a
    // beta version (3.0.260603-beta), and auto-detecting the deploy target
    // is exactly the kind of thing that can misfire in a beta build tool
    // specifically when actually running on Vercel's infrastructure (which
    // local `vite build`/`vite dev` can't fully replicate or catch).
    nitro({ preset: "vercel" }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
