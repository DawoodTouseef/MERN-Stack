# Deployment Guide for MERN E-Commerce Application

This guide will help you deploy your MERN E-Commerce application to Render.

## Prerequisites

1. A Render account (https://render.com)
2. A MongoDB database (MongoDB Atlas recommended)
3. All required API keys for third-party services

## Deployment Steps

### 1. Prepare Your Repository

Make sure all changes are committed to your GitHub repository:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Create a New Web Service on Render

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

### 3. Configure Environment Variables

In the Render dashboard, go to your service → "Environment" tab and add these variables:

| Key | Value | Sync from Client |
|-----|-------|------------------|
| NODE_ENV | production | No |
| PORT | 10000 | No |
| MONGODB_URL | your_mongodb_connection_string | Yes |
| JWT_SECRET | your_secure_jwt_secret | Yes |
| ADMIN_EMAIL | admin@yourdomain.com | Yes |
| ADMIN_PASSWORD | your_secure_admin_password | Yes |
| EMAIL_SERVICE | gmail | No |
| EMAIL_USER | your-email@gmail.com | Yes |
| EMAIL_PASSWORD | your-app-password | Yes |
| EMAIL_FROM | noreply@yourdomain.com | No |
| FRONTEND_URL | https://your-frontend-url.onrender.com | No |
| VITE_API_URL | https://your-backend-url.onrender.com | No |
| VITE_PAYPAL_CLIENT_ID | your_paypal_client_id | Yes |
| VITE_STRIPE_PUBLISHABLE_KEY | your_stripe_publishable_key | Yes |
| VITE_RAZORPAY_KEY_ID | your_razorpay_key_id | Yes |
| OPENCAGE_API_KEY | your_opencage_api_key | Yes |
| RAPIDAPI_KEY | your_rapidapi_key | Yes |
| EXCHANGE_API_DOMAIN | https://v6.exchangerate-api.com/v6 | No |

### 4. Configure MongoDB

If you're using MongoDB Atlas:
1. Create a cluster
2. Add your Render service IP to the IP whitelist
3. Get the connection string and add it as MONGODB_URL

### 5. Deploy

1. Click "Create Web Service"
2. Render will automatically start building and deploying your application
3. Wait for the build to complete (this may take several minutes)

## Troubleshooting

### Vendor Dashboard Loading Issue

If the vendor dashboard shows only a loader:

1. Check browser console for errors
2. Verify API endpoints are accessible:
   - `GET /api/vendors/dashboard`
   - `GET /api/vendors/analytics/*`
3. Ensure vendor has proper authentication tokens
4. Check that the vendor user has the correct role assigned

### Common Issues

1. **CORS Errors**: Make sure FRONTEND_URL is correctly set
2. **404 Errors**: Verify routes are correctly configured in main.jsx
3. **Environment Variables**: Double-check all required variables are set
4. **Build Failures**: Check dependencies in package.json files

## Health Checks

Render will automatically check:
- Service availability on the specified port
- Response to HTTP requests
- Application logs for errors

## Scaling

For production use:
1. Consider upgrading to a paid Render plan
2. Set up auto-scaling if needed
3. Configure custom domains
4. Set up SSL certificates (Render provides these automatically)

## Monitoring

Render provides:
- Real-time logs
- Performance metrics
- Uptime monitoring
- Error tracking

Check these regularly to ensure your application is running smoothly.