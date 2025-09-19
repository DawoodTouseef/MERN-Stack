# Vercel Deployment Fix for Redux Minification Error

## Problem
When deploying the frontend to Vercel, you may encounter the following error in the browser console:
```
redux-954c64ff.js:9 Uncaught TypeError: Rt is not a function
    at _e (redux-954c64ff.js:9:28250)
    at Nn (redux-954c64ff.js:9:30604)
    at charts-7a9b60a3.js:20:19020
```

This error occurs due to function name mangling during the minification process, where critical Redux functions are being renamed in a way that causes conflicts.

## Solution

### 1. Use the Vercel-specific Vite Configuration
We've created a special Vite configuration file `vite.config.vercel.js` that addresses this issue by:

- Separating critical libraries into distinct chunks
- Preserving important function names during minification
- Optimizing dependency handling

### 2. Update Your Vercel Build Settings
In your Vercel project settings, update the build command to use the Vercel-specific configuration:

```
Build Command: vite build --config vite.config.vercel.js
```

### 3. Environment Variables
Make sure your Vercel environment variables are properly set:
- `VITE_API_URL` should point to your backend API URL
- Other required environment variables as documented in the main README

### 4. Alternative Solution
If you prefer to use your existing configuration, you can also fix the issue by modifying the `frontend/vite.config.js` file:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    },
    // Add terser options to prevent function name mangling
    terserOptions: {
      mangle: {
        reserved: ['Rt', '_e', 'Nn'] // Preserve critical function names
      }
    }
  }
});
```

## Why This Happens
The error occurs because:
1. During minification, function names are shortened to reduce bundle size
2. Critical Redux Toolkit functions get renamed in a way that causes conflicts
3. The charts library may also contribute to the issue due to complex dependencies

## Prevention
To prevent similar issues in the future:
1. Always test production builds locally before deploying
2. Use separate chunking for critical libraries
3. Monitor browser console errors in production builds
4. Keep dependencies up to date

## Additional Notes
- This fix specifically targets the function name mangling issue
- The solution maintains optimal bundle splitting for performance
- No functionality is changed, only the build process is optimized