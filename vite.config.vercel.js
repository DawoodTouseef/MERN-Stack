import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel-specific configuration to fix minification issues
export default defineConfig({
  plugins: [react()],
  
  build: {
    target: 'es2015',
    minify: 'terser',
    cssMinify: true,
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate critical libraries to avoid conflicts
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['axios', 'lodash', 'date-fns', 'react-toastify']
        }
      }
    },
    
    // Terser options to prevent function name mangling issues
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      mangle: {
        safari10: true,
        // Preserve critical function names that might cause issues
        reserved: ['Rt', '_e', 'Nn']
      },
      format: {
        safari10: true
      }
    }
  },
  
  server: {
    port: 3000,
    host: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      '@mui/material',
      '@mui/icons-material',
      'axios',
      'recharts'
    ]
  }
});