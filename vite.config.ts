import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ include: ["src"], rollupTypes: true })],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      // Consumers provide their own React; never bundle it.
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
});
