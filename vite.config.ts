import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
import { visualizer } from 'rollup-plugin-visualizer';

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable faster refresh and better tree-shaking
      jsxImportSource: undefined,
    }),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
    // Bundle analyzer (only in analyze mode)
    process.env.ANALYZE ? visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }) as PluginOption : undefined,
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  server: {
    // Enable compression in dev mode
    headers: {
      'Cache-Control': 'public, max-age=0',
    },
  },
  preview: {
    // Configure preview server with headers
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  build: {
    // Target modern browsers for better optimization
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // Enable minification with esbuild (faster than terser)
    minify: 'esbuild',
    // Configure chunk size warning limit
    chunkSizeWarningLimit: 600,
    // CSS code splitting for better caching
    cssCodeSplit: true,
    // Disable source maps in production for smaller builds
    sourcemap: false,
    // Enable CSS minification
    cssMinify: true,
    // Improve tree shaking
    modulePreload: {
      polyfill: false, // Don't include polyfill if targeting modern browsers
    },
    rollupOptions: {
      external: ['jspdf'], // Optional dependency, handled at runtime
      output: {
        // Rely on Rollup's default chunking to avoid cross-chunk circular deps
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  // Optimize dependencies - prebundle for faster dev server start
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'date-fns',
      'clsx',
      'class-variance-authority',
      'tailwind-merge',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
    ],
    exclude: [
      // Exclude heavy dependencies to be dynamically imported
      'recharts',
      'd3',
    ],
    // Force prebundling for faster cold starts
    force: false,
  },
  // Performance optimizations
  esbuild: {
    // Drop console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Target for esbuild
    target: 'es2020',
    // Enable tree shaking
    treeShaking: true,
    // Minify identifiers for smaller bundles
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
  // CSS optimization
  css: {
    devSourcemap: false, // Disable source maps for faster dev
  },
});
