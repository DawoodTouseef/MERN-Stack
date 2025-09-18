import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build optimization configuration
  build: {
    target: 'es2015',
    minify: 'terser',
    cssMinify: true,
    
    // Chunk splitting strategy for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          
          // Third-party utilities
          'vendor-utils': [
            'axios', 
            'lodash', 
            'date-fns',
            'react-toastify',
            'framer-motion'
          ],
          
          // Payment and external services
          'vendor-external': [
            '@paypal/react-paypal-js',
            'socket.io-client'
          ],
          
          // Authentication and security
          'auth': [
            './src/pages/Auth/Login',
            './src/pages/Auth/Register',
            './src/components/PrivateRoute'
          ],
          
          // Admin functionality
          'admin': [
            './src/pages/Admin/AdminRoute',
            './src/pages/Admin/AdminLogin',
            './src/pages/Admin/UserList',
            './src/pages/Admin/CategoryList',
            './src/pages/Admin/AdminSettings',
            './src/pages/Admin/BannerCarousels',
            './src/pages/Admin/Pages',
            './src/pages/Admin/AdminOffer',
            './src/pages/Admin/Users'
          ],
          
          // Seller functionality
          'seller': [
            './src/pages/Seller/SellerRoute',
            './src/pages/Seller/SellerLogin',
            './src/pages/Seller/SellerRegister',
            './src/pages/Seller/ProductList',
            './src/pages/Seller/AllProducts',
            './src/pages/Seller/ProductUpdate',
            './src/pages/Seller/OrderList'
          ],
          
          // Vendor functionality
          'vendor': [
            './src/pages/Vendor/VendorRoute',
            './src/pages/Vendor/VendorLogin',
            './src/pages/Vendor/VendorRegister',
            './src/pages/Admin/Brand'
          ],
          
          // Product-related pages
          'products': [
            './src/pages/Products/ProductDetails',
            './src/pages/Products/Favorites',
            './src/pages/Products/ProductTabs',
            './src/pages/Products/SmallProduct',
            './src/pages/Products/ReviewForm'
          ],
          
          // Shopping functionality
          'shopping': [
            './src/pages/Cart',
            './src/pages/Shop',
            './src/pages/Search',
            './src/pages/categories'
          ],
          
          // Order management
          'orders': [
            './src/pages/Orders/Shipping',
            './src/pages/Orders/PlaceOrder',
            './src/pages/Orders/Order',
            './src/pages/Orders/Address',
            './src/pages/User/UserOrder'
          ],
          
          // Utility pages
          'utils': [
            './src/pages/privacy',
            './src/pages/contact_us',
            './src/pages/faq',
            './src/pages/ForgotPassword',
            './src/pages/request_password',
            './src/pages/Flash_Sales',
            './src/pages/LiveChat'
          ],
          
          // Recommendation system
          'recommendations': [
            './src/components/PersonalizedRecommendations',
            './src/components/SimilarProducts',
            './src/components/TrendingProducts'
          ]
        },
        
        // File naming strategy for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') 
            : 'unknown';
          return `chunks/[name]-[hash].js`;
        },
        entryFileNames: 'entries/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return 'images/[name]-[hash].[ext]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'fonts/[name]-[hash].[ext]';
          }
          if (ext === 'css') {
            return 'styles/[name]-[hash].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    },
    
    // Additional build optimizations
    sourcemap: false, // Disable source maps in production
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    
    // Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      mangle: {
        safari10: true
      },
      format: {
        safari10: true
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    
    // Proxy configuration for API calls
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Preview server configuration
  preview: {
    port: 3000,
    host: true,
    strictPort: true
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/Utils'),
      '@redux': resolve(__dirname, 'src/redux'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  
  // Dependency optimization
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
      'react-toastify'
    ],
    exclude: [
      // Exclude large dependencies that should be loaded on demand
      '@paypal/react-paypal-js',
      'socket.io-client'
    ]
  },
  
  // Performance and caching settings
  define: {
    __DEV__: process.env.NODE_ENV !== 'production'
  },
  
  // CSS optimization
  css: {
    devSourcemap: false,
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  }
});