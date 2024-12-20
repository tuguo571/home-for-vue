import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import viteCompression from "vite-plugin-compression";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    minify: "terser",
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router"],
          utils: ["./src/utils"],
          components: ["./src/components"],
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    cssCodeSplit: true,
    cssMinify: true,
  },
  plugins: [
    vue(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: "gzip",
      ext: ".gz",
    }),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|svg)$/i,
      exclude: undefined,
      include: undefined,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                removeViewBox: false,
                removeEmptyAttrs: false,
              },
            },
          },
        ],
      },
      png: {
        // sharp options
        quality: 80,
      },
      jpeg: {
        // sharp options
        quality: 80,
      },
      jpg: {
        // sharp options
        quality: 80,
      },
      tiff: {
        // sharp options
        quality: 80,
      },
      // gif uses gifsicle
      gif: undefined,
      webp: {
        // sharp options
        quality: 80,
      },
      avif: {
        // sharp options
        quality: 80,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
