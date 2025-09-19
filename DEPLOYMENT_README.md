# MERN E-Commerce Application Deployment Guide

## Overview

This document provides instructions for deploying the MERN E-Commerce application to Render and troubleshooting common issues, particularly the vendor dashboard loading problem.

## Prerequisites

1. Render account (https://render.com)
2. MongoDB database (MongoDB Atlas recommended)
3. GitHub repository with the application code

## Deployment to Render

### 1. Repository Preparation

Ensure your repository contains all the latest changes:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Render Web Service Setup

1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `mern-ecommerce`
   - Region: Choose your preferred region
   - Branch: `main`
   - Root Directory: Leave empty
   - Environment: `Node`
   - Build Command: `npm run render-build`
   - Start Command: `npm run start`

### 3. Environment Variables Configuration

In the Render dashboard, go to your service → "Environment" tab and add these variables:

| Key | Value | Sync from Client |
|-----|-------|------------------|
| NODE_ENV | production | No |
| PORT | 10000 | No |
| MONGODB_URL | your_mongodb_connection_string | Yes |
| JWT_SECRET | your_secure_jwt_secret | Yes |
| ADMIN_EMAIL | admin@yourdomain.com | Yes |
| ADMIN_PASSWORD | your_secure_admin_password | Yes |
| FRONTEND_URL | https://your-app-name.onrender.com | No |
| VITE_API_URL | https://your-app-name.onrender.com | No |

### 4. Deploy Process

1. Click "Create Web Service"
2. Render will automatically start building and deploying your application
3. Wait for the build to complete (this may take 10-15 minutes)

## Troubleshooting Vendor Dashboard Loading Issue

### Common Causes and Solutions

#### 1. Frontend Not Building Properly

**Symptoms**: Blank page or only loader showing
**Solution**: 
- Check Render build logs for errors
- Ensure `npm run render-build` completes successfully
- Verify `frontend/dist` directory is created

#### 2. API Endpoint Failures

**Symptoms**: Dashboard shows error message or keeps loading
**Solution**:
- Check browser console for API errors
- Verify vendor authentication token is valid
- Test API endpoints directly with tools like Postman

#### 3. CORS Issues

**Symptoms**: Network errors in browser console
**Solution**:
- Ensure `FRONTEND_URL` environment variable is correctly set
- Check backend CORS configuration in `backend/index.js`

#### 4. Authentication Problems

**Symptoms**: 401 or 403 errors on vendor API calls
**Solution**:
- Verify vendor user has `role: "vendor"` in database
- Ensure vendor account is verified
- Check JWT token validity

### Debugging Steps

#### 1. Check Render Logs

```bash
# In Render dashboard, view logs for:
# - Build process
# - Application startup
# - Runtime errors
```

#### 2. Test API Endpoints

Use curl or Postman to test vendor endpoints:
```bash
# Test health endpoint
curl https://your-app-name.onrender.com/health

# Test vendor dashboard (requires valid token)
curl -H "Authorization: Bearer YOUR_VENDOR_TOKEN" \
     https://your-app-name.onrender.com/api/vendors/dashboard
```

#### 3. Browser Developer Tools

1. Open browser developer tools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed API requests
4. Verify vendor API calls have proper authentication headers

### Vendor Dashboard Specific Issues

#### Issue: Dashboard Shows Only Loader

**Likely Causes**:
1. Vendor API calls failing silently
2. Empty data responses from backend
3. Authentication token issues

**Debugging Steps**:
1. Add console.log statements in VendorAnalyticsDashboard.jsx
2. Check if `useGetVendorDashboardQuery` hook is returning data
3. Verify vendor has products in the database
4. Ensure vendor user has proper role and verification status

#### Issue: Dashboard Shows Error Message

**Likely Causes**:
1. Backend errors in vendor controller
2. Database connection issues
3. Invalid date parameters

**Debugging Steps**:
1. Check Render logs for backend errors
2. Verify MongoDB connection string
3. Test vendor endpoints with direct API calls

## Testing Locally in Production Mode

To test the production build locally:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Set environment variables:
   ```bash
   export NODE_ENV=production
   export MONGODB_URL=your_mongodb_connection_string
   export JWT_SECRET=your_secure_secret
   ```

3. Start the backend:
   ```bash
   cd ..
   npm run start
   ```

4. Visit http://localhost:10000

## Health Checks

The application includes a health check endpoint at `/health` which returns:
```json
{
  "status": "OK",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

## Monitoring

Render provides:
- Real-time logs
- Performance metrics
- Uptime monitoring
- Error tracking

Regularly check these to ensure your application is running smoothly.

## Support

If you continue to experience issues:
1. Check all environment variables are correctly set
2. Verify MongoDB connection and permissions
3. Ensure vendor accounts are properly configured in the database
4. Review Render logs for specific error messages