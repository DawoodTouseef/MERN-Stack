# Vendor Dashboard Troubleshooting Guide

## Common Issues and Solutions

### 1. Sales Data Not Loading (Stuck in Loading State)

**Symptoms:**
- Dashboard shows "Loading sales analytics..." indefinitely
- Sales Data: undefined in console logs
- Sales Loading: true in console logs

**Possible Causes and Solutions:**

#### A. Authentication Issues
- **Cause:** Vendor not properly authenticated or missing vendor role
- **Solution:** 
  1. Verify user has vendor role in database
  2. Check if vendor is verified (`isVerified: true`)
  3. Ensure JWT token includes vendor role

#### B. No Products Associated with Vendor
- **Cause:** Vendor has no products, so sales analytics return empty
- **Solution:**
  1. Add products to vendor's store
  2. Ensure products have `vendor` field pointing to vendor ID

#### C. Date Parameter Issues
- **Cause:** Incorrect date formatting in API requests
- **Solution:**
  1. Ensure dates are properly formatted as ISO strings
  2. Check backend validation for date parameters

#### D. Database Aggregation Errors
- **Cause:** MongoDB aggregation pipeline failing
- **Solution:**
  1. Check MongoDB logs for aggregation errors
  2. Verify product and order data structure

### 2. Missing Static Resources (404 Errors)

**Symptoms:**
- Font files returning 404 errors
- Image files returning 404 errors

**Solution:**
1. Ensure static assets are in correct directories:
   - Fonts: `/public/fonts/`
   - Images: `/public/images/`
2. Verify file names match what's being requested
3. Check if build process is correctly copying assets

### 3. Emotion React Warning

**Symptoms:**
- "You are loading @emotion/react when it is already loaded" warning

**Solution:**
1. Check for duplicate @emotion/react dependencies
2. Run `npm ls @emotion/react` to identify duplicates
3. Use `npm dedupe` to resolve duplicate packages

### 4. Deprecated React Lifecycle Warning

**Symptoms:**
- "componentWillMount has been renamed" warning

**Solution:**
1. Update react-document-title package or replace with React Helmet
2. Use functional components with hooks instead of class components

## Debugging Steps

### 1. Enable Debug Mode
- Click "Show Debug" button on vendor dashboard
- Check console logs for detailed error information

### 2. Test API Endpoints
- Click "API Test" button on vendor dashboard
- Run tests for all vendor endpoints

### 3. Check Network Tab
- Open browser developer tools
- Go to Network tab
- Look for failed requests to vendor endpoints

### 4. Verify Vendor Setup
1. Check if vendor exists in database:
   ```javascript
   db.vendors.findOne({ user: ObjectId("USER_ID") })
   ```
2. Check if vendor has products:
   ```javascript
   db.products.find({ vendor: ObjectId("VENDOR_ID") })
   ```
3. Check if orders exist for vendor products:
   ```javascript
   db.orders.find({ "orderItems.product": { $in: [ObjectId("PRODUCT_ID")] } })
   ```

## Testing Vendor Endpoints

### Health Check
```
GET /api/vendors/health
```

### Dashboard Data
```
GET /api/vendors/dashboard
```

### Sales Analytics
```
GET /api/vendors/analytics/sales?startDate=2024-01-01&endDate=2024-12-31&groupBy=month
```

## Common Fixes

### 1. Force Refresh Data
- Click "Refresh" or "Force Refresh" button on dashboard

### 2. Clear Browser Cache
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Clear localStorage and sessionStorage

### 3. Restart Development Servers
- Stop both frontend and backend servers
- Restart backend server first
- Restart frontend server

### 4. Check Environment Variables
Ensure these are set in backend:
```
JWT_SECRET=your_secret_key
MONGODB_URL=your_mongodb_connection_string
```

## Backend Debugging

### Enable Detailed Logging
Add to backend `.env` file:
```
NODE_ENV=development
DEBUG=express:*
MONGOOSE_DEBUG=true
```

### Check MongoDB Connection
Verify MongoDB is running and accessible:
```bash
mongosh "mongodb://localhost:27017/your_database"
```

## Frontend Debugging

### Check Redux Store
1. Install Redux DevTools browser extension
2. Open Redux DevTools in browser
3. Check vendorApi state for errors

### Console Debugging
Look for these key log messages:
- "=== Vendor Dashboard Component Debug ==="
- "Sales Loading:", "Sales Data:", "Sales Error:"