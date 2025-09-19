# Vendor Dashboard Loading Issue Troubleshooting Guide

## Problem Description

The vendor dashboard is stuck showing a loading spinner instead of displaying the actual dashboard content.

## Common Causes and Solutions

### 1. **API Endpoint Issues**

#### Symptoms:
- Dashboard shows loading indefinitely
- No data appears in the dashboard
- Browser console shows API errors

#### Diagnosis:
1. Check browser Network tab for failed API requests
2. Look for 401, 403, 404, or 500 errors on vendor endpoints:
   - `GET /api/vendors/dashboard`
   - `GET /api/vendors/analytics/sales`
   - `GET /api/vendors/analytics/products`
   - `GET /api/vendors/analytics/customers`
   - `GET /api/vendors/analytics/inventory`

#### Solutions:
1. Verify vendor authentication token is valid
2. Check if vendor account is verified in the database
3. Ensure vendor has the correct role ("vendor")
4. Test API endpoints directly using curl or Postman

### 2. **Authentication Problems**

#### Symptoms:
- 401 or 403 errors in browser console
- Dashboard shows authentication errors
- Vendor is redirected to login page

#### Diagnosis:
1. Check if user is logged in as a vendor
2. Verify JWT token is present and valid
3. Check user role in Redux store and database

#### Solutions:
1. Ensure vendor logs in through `/vendor/login`
2. Verify vendor account is verified by admin
3. Check JWT_SECRET configuration
4. Clear browser cache and try logging in again

### 3. **Data Formatting Issues**

#### Symptoms:
- Dashboard loads but shows no data
- Charts display "No data available"
- Metrics show zeros or NaN values

#### Diagnosis:
1. Check raw API response data in browser Network tab
2. Verify data structure matches expected format
3. Look for missing or null values in response

#### Solutions:
1. Check backend vendor controller for data formatting
2. Verify vendor has products in the database
3. Ensure vendor has orders associated with their products

### 4. **Frontend Component Issues**

#### Symptoms:
- Dashboard component doesn't render
- Loading spinner never disappears
- JavaScript errors in console

#### Diagnosis:
1. Check browser console for JavaScript errors
2. Add console.log statements to debug component lifecycle
3. Verify all required dependencies are installed

#### Solutions:
1. Check React component for infinite loading loops
2. Verify recharts library is properly installed
3. Ensure all Material-UI components are correctly imported

## Debugging Steps

### Step 1: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check for network errors in Network tab

### Step 2: Verify Authentication

1. Check if user is logged in:
   ```javascript
   // In browser console
   localStorage.getItem('userInfo')
   ```
2. Verify user role:
   ```javascript
   // In browser console
   JSON.parse(localStorage.getItem('userInfo')).role
   ```

### Step 3: Test API Endpoints

1. Go to `/vendor/test-api` page (newly added)
2. Click "Test Vendor API Endpoints"
3. Check results for any errors

### Step 4: Check Raw API Data

1. Visit `/vendor/test-api` page
2. Expand "Raw API Data" sections
3. Verify data structure and content

### Step 5: Force Refresh

1. Click the "Refresh" button in the dashboard
2. Or visit `/vendor/test-api` and click "Test Vendor API Endpoints"

## Testing API Endpoints Directly

### Using curl:

```bash
# Get auth token from browser localStorage first
# Then test dashboard endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:5500/api/vendors/dashboard

# Test sales analytics
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     "http://localhost:5500/api/vendors/analytics/sales?startDate=2023-01-01&endDate=2023-12-31&groupBy=day"
```

### Using Postman:

1. Set Authorization to "Bearer Token" with your JWT
2. Set Content-Type header to "application/json"
3. Make GET requests to vendor endpoints

## Database Verification

### Check Vendor Account:

```javascript
// In MongoDB shell or database client
db.users.findOne({ role: "vendor", vendorVerified: true })
```

### Check Vendor Products:

```javascript
// In MongoDB shell or database client
db.products.find({ vendor: ObjectId("VENDOR_USER_ID") })
```

### Check Vendor Orders:

```javascript
// In MongoDB shell or database client
db.orders.find({ "orderItems.product": { $in: [ObjectId("PRODUCT_ID")] } })
```

## Common Fixes

### 1. Clear Browser Cache

1. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
2. Clear localStorage and cookies
3. Try in incognito/private browsing mode

### 2. Verify Vendor Account Status

1. Check if vendor account is verified in database
2. Ensure vendor has the "vendor" role
3. Verify vendor has active status

### 3. Check Environment Variables

1. Verify VITE_API_URL is correctly set
2. Check JWT_SECRET configuration
3. Ensure MongoDB connection string is valid

### 4. Restart Development Servers

1. Stop both frontend and backend servers
2. Clear node_modules and reinstall dependencies
3. Start servers again

## Additional Debugging Tools

### 1. Enable Debug Mode

Visit the vendor dashboard and click "Enable Debug Mode" button to see detailed loading information.

### 2. Check Redux Store

In browser console:
```javascript
// Check auth state
store.getState().auth

// Check API state
store.getState().api
```

### 3. Network Throttling

Use browser DevTools to simulate slow network conditions and see how the dashboard behaves.

## When to Contact Support

If none of the above solutions work:

1. Provide browser console errors
2. Share network request/response details
3. Include Redux store state
4. Provide database verification results
5. Share backend logs if available

## Prevention

1. Always verify vendor accounts after registration
2. Ensure vendors have products before expecting dashboard data
3. Regularly check API endpoint health
4. Monitor authentication token expiration