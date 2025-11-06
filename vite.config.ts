import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/sms': {
        target: 'http://192.168.1.96:8080',
        changeOrigin: true,
        secure: false,
        // keep path as-is so /sms -> target/sms
      },
      // Proxy all API requests to the silo monitoring server
      '/api': {
        target: 'http://192.168.1.92:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Proxy local cottage env temperature API for development
      // Usage from the app: fetch('/cottage/env_temp')
      '/cottage': {
        target: 'http://192.168.1.92:5000',
        changeOrigin: true,
        secure: false,
        // keep the path so /cottage/* maps to target/*
        rewrite: (path) => path.replace(/^\/cottage/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    env: {
      NODE_ENV: 'test'
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
