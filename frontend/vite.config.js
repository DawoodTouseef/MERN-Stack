import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:5501",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: process.env.VITE_API_URL || "http://localhost:5501",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          redux: ['@reduxjs/toolkit', 'react-redux']
          // Removed charts chunk to prevent bundling issues
        }
      }
    }
  },
  // Add optimization to prevent charting library issues
  optimizeDeps: {
    include: [
      'recharts'
    ],
    exclude: [
      // Exclude recharts from pre-bundling to prevent conflicts
    ]
  }
});