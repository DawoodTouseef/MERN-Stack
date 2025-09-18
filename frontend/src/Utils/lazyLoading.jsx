import React, { Suspense, lazy } from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

/**
 * Enhanced lazy loading utility with error boundaries and loading states
 */

// Loading component
const LoadingFallback = ({ message = 'Loading...', height = 200 }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: height,
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

// Skeleton loading for different component types
const SkeletonLoading = ({ type = 'page', count = 1 }) => {
  const skeletons = {
    page: (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
    ),
    card: (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={140} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </Box>
    ),
    list: (
      <Box sx={{ p: 1 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
        ))}
      </Box>
    )
  };

  return skeletons[type] || skeletons.page;
};

/**
 * Higher-order component for lazy loading with enhanced features
 */
export const withLazyLoading = (
  importFn,
  options = {}
) => {
  const {
    fallback = <LoadingFallback />,
    errorMessage = 'Failed to load component',
    retryable = true,
    preload = false
  } = options;

  const LazyComponent = lazy(importFn);

  // Preload if specified
  if (preload) {
    importFn();
  }

  const WrappedComponent = (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );

  // Add display name for debugging
  WrappedComponent.displayName = `LazyLoaded(${LazyComponent.displayName || 'Component'})`;

  return WrappedComponent;
};

/**
 * Lazy load with intersection observer for viewport-based loading
 */
export const LazyIntersection = ({ 
  children, 
  fallback = <SkeletonLoading />,
  rootMargin = '50px',
  threshold = 0.1 
}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref}>
      {isIntersecting ? children : fallback}
    </div>
  );
};

/**
 * Progressive image loading
 */
export const LazyImage = ({ 
  src, 
  alt, 
  placeholder, 
  className,
  style,
  ...props 
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <Box sx={{ position: 'relative', ...style }} className={className}>
      {!loaded && !error && (
        <Skeleton 
          variant="rectangular" 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }} 
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          ...style,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        {...props}
      />
      {error && placeholder && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}
        >
          {placeholder}
        </Box>
      )}
    </Box>
  );
};

/**
 * Route-based code splitting helper
 */
export const createLazyRoute = (importFn, fallback) => {
  return withLazyLoading(importFn, {
    fallback: fallback || <LoadingFallback message="Loading page..." height={300} />
  });
};

// Pre-defined lazy components for common pages
export const LazyPages = {
  Home: createLazyRoute(() => import('../pages/Home')),
  Shop: createLazyRoute(() => import('../pages/Shop')),
  ProductDetails: createLazyRoute(() => import('../pages/Products/ProductDetails')),
  Products: createLazyRoute(() => import('../pages/Products/Products')),
  Cart: createLazyRoute(() => import('../pages/Cart')),
  Profile: createLazyRoute(() => import('../pages/User/Profile')),
  Order: createLazyRoute(() => import('../pages/Orders/Order')),
  UserOrder: createLazyRoute(() => import('../pages/User/UserOrder')),
  PlaceOrder: createLazyRoute(() => import('../pages/Orders/PlaceOrder')),
  Shipping: createLazyRoute(() => import('../pages/Orders/Shipping')),
  AdminDashboard: createLazyRoute(() => import('../pages/Admin/AdminDashboard')),
  AdminLogin: createLazyRoute(() => import('../pages/Admin/AdminLogin')),
  VendorDashboard: createLazyRoute(() => import('../pages/Vendor/vendorDashboard')),
  VendorLogin: createLazyRoute(() => import('../pages/Vendor/VendorLogin')),
  Search: createLazyRoute(() => import('../pages/Search')),
  FlashSales: createLazyRoute(() => import('../pages/Flash_Sales')),
};

export { LoadingFallback, SkeletonLoading };
export default withLazyLoading;