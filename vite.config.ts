import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { resolve } from "path"

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["http", "https", "url", "path", "fs"],
      output: {
        preserveModules: true,
        exports: "named",
        entryFileNames: "[name].js",
      },
    },
    sourcemap: true,
    outDir: "dist",
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
})
