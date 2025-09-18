import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Button, CircularProgress } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { withLazyLoading } from './lazyLoading';

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0
  });

  useEffect(() => {
    // Monitor performance metrics
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            loadTime: entry.loadEventEnd - entry.loadEventStart
          }));
        }
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'measure'] });

    // Monitor memory usage if available
    if ('memory' in performance) {
      const updateMemory = () => {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: performance.memory.usedJSHeapSize / 1024 / 1024 // MB
        }));
      };
      updateMemory();
      const interval = setInterval(updateMemory, 5000);
      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    }

    return () => observer.disconnect();
  }, []);

  return metrics;
};

/**
 * Enhanced App component with performance monitoring
 */
const AppPerformanceWrapper = ({ children }) => {
  const metrics = usePerformanceMonitor();
  const [showMetrics, setShowMetrics] = useState(false);

  // Show performance metrics in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <ErrorBoundary>
      {children}
      
      {isDevelopment && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 9999,
            bgcolor: 'rgba(0,0,0,0.8)',
            color: 'white',
            p: 1,
            borderRadius: 1,
            fontSize: '12px',
            cursor: 'pointer'
          }}
          onClick={() => setShowMetrics(!showMetrics)}
        >
          {showMetrics ? (
            <Box>
              <div>Load: {isFinite(metrics.loadTime) ? metrics.loadTime.toFixed(2) : '0.00'}ms</div>
              <div>Render: {isFinite(metrics.renderTime) ? metrics.renderTime.toFixed(2) : '0.00'}ms</div>
              <div>Memory: {isFinite(metrics.memoryUsage) ? metrics.memoryUsage.toFixed(2) : '0.00'}MB</div>
            </Box>
          ) : (
            <div>Performance 📊</div>
          )}
        </Box>
      )}
    </ErrorBoundary>
  );
};

/**
 * Service Worker registration for caching and performance
 */
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

/**
 * Progressive Web App installation prompt
 */
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  return { showInstallPrompt, installPWA };
};

/**
 * PWA Install Banner Component
 */
export const PWAInstallBanner = () => {
  const { showInstallPrompt, installPWA } = usePWAInstall();

  if (!showInstallPrompt) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'primary.main',
        color: 'white',
        p: 2,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Typography variant="body2">
        Install Nexus Mart for a better shopping experience
      </Typography>
      <Box>
        <Button 
          variant="outlined" 
          color="inherit" 
          size="small" 
          onClick={installPWA}
          sx={{ mr: 1 }}
        >
          Install
        </Button>
        <Button 
          variant="text" 
          color="inherit" 
          size="small"
          onClick={() => window.dispatchEvent(new Event('beforeinstallprompt'))}
        >
          Later
        </Button>
      </Box>
    </Box>
  );
};

/**
 * Resource preloader for critical assets
 */
export const preloadCriticalResources = () => {
  const criticalImages = [
    '/images/logo.png',
    '/images/banner-1.jpg',
    '/images/banner-2.jpg'
  ];

  const criticalFonts = [
    '/fonts/roboto-400.woff2',
    '/fonts/roboto-500.woff2',
    '/fonts/roboto-700.woff2'
  ];

  // Preload critical images
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

  // Preload critical fonts
  criticalFonts.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = href;
    document.head.appendChild(link);
  });
};

/**
 * Connection quality detector
 */
export const useConnectionQuality = () => {
  const [connectionQuality, setConnectionQuality] = useState('unknown');

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const updateConnectionInfo = () => {
        const { effectiveType, downlink, rtt } = connection;
        
        let quality = 'good';
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          quality = 'poor';
        } else if (effectiveType === '3g' || downlink < 1.5) {
          quality = 'moderate';
        }
        
        setConnectionQuality(quality);
      };

      updateConnectionInfo();
      connection.addEventListener('change', updateConnectionInfo);

      return () => connection.removeEventListener('change', updateConnectionInfo);
    }
  }, []);

  return connectionQuality;
};

/**
 * Adaptive loading based on connection quality
 */
export const useAdaptiveLoading = () => {
  const connectionQuality = useConnectionQuality();
  
  const loadingStrategy = {
    poor: {
      imageQuality: 'low',
      enableAnimations: false,
      prefetchCount: 2,
      lazyLoadOffset: 100
    },
    moderate: {
      imageQuality: 'medium',
      enableAnimations: true,
      prefetchCount: 5,
      lazyLoadOffset: 200
    },
    good: {
      imageQuality: 'high',
      enableAnimations: true,
      prefetchCount: 10,
      lazyLoadOffset: 500
    }
  };

  return loadingStrategy[connectionQuality] || loadingStrategy.good;
};

/**
 * Performance optimized component wrapper
 */
export const withPerformanceOptimization = (Component) => {
  return React.memo((props) => {
    const adaptiveSettings = useAdaptiveLoading();
    
    return (
      <Component 
        {...props} 
        adaptiveSettings={adaptiveSettings}
      />
    );
  });
};

export default AppPerformanceWrapper;