import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Custom hook for performance monitoring and optimization
 * @returns {Object} Performance helpers and state
 */
const usePerformance = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [prefersReducedData, setIsPrefersReducedData] = useState(false);
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [isClientIdle, setIsClientIdle] = useState(true);
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  
  // Check network and data preferences
  useEffect(() => {
    // Check for slow connection
    const checkConnection = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        setIsSlowConnection(
          connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g' ||
          connection.effectiveType === '3g'
        );
        setIsPrefersReducedData(connection.saveData || false);
      }
    };
    
    // Initial check
    checkConnection();
    
    // Listen for connection changes
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', checkConnection);
      return () => {
        navigator.connection.removeEventListener('change', checkConnection);
      };
    }
  }, []);
  
  // Monitor memory usage
  useEffect(() => {
    const monitorMemory = () => {
      if ('deviceMemory' in navigator) {
        setMemoryUsage({
          deviceMemory: navigator.deviceMemory,
          totalJSHeapSize: window.performance?.memory?.totalJSHeapSize,
          usedJSHeapSize: window.performance?.memory?.usedJSHeapSize,
          jsHeapSizeLimit: window.performance?.memory?.jsHeapSizeLimit
        });
      }
    };
    
    // Initial check
    monitorMemory();
    
    // Periodic monitoring
    const interval = setInterval(monitorMemory, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Detect client idle state
  useEffect(() => {
    let idleTimer;
    
    const resetIdleTimer = () => {
      setIsClientIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsClientIdle(true), 30000); // 30 seconds
    };
    
    // Set up event listeners
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keypress', resetIdleTimer);
    window.addEventListener('scroll', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    
    // Initial timer
    idleTimer = setTimeout(() => setIsClientIdle(true), 30000);
    
    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keypress', resetIdleTimer);
      window.removeEventListener('scroll', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
    };
  }, []);
  
  // Device pixel ratio
  useEffect(() => {
    setDevicePixelRatio(window.devicePixelRatio || 1);
    
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Lazy load images
  const lazyLoadImages = useCallback(() => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }, []);
  
  // Debounce function for performance
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);
  
  // Throttle function for performance
  const throttle = useCallback((func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);
  
  // Prefetch important resources
  const prefetchResource = useCallback((url, as) => {
    if ('prefetch' in HTMLLinkElement.prototype) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      if (as) link.as = as;
      document.head.appendChild(link);
    }
  }, []);
  
  // Preload critical resources
  const preloadResource = useCallback((url, as) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    if (as) link.as = as;
    document.head.appendChild(link);
  }, []);
  
  // Memoized performance flags
  const performanceFlags = useMemo(() => ({
    shouldReduceAnimations: isSlowConnection || prefersReducedData,
    shouldReduceImageQuality: isSlowConnection || prefersReducedData,
    shouldLazyLoad: isSlowConnection,
    canUseAdvancedFeatures: memoryUsage?.deviceMemory > 4,
    isHighDPI: devicePixelRatio > 1.5,
    isMobile: viewportSize.width <= 768,
    isTablet: viewportSize.width > 768 && viewportSize.width <= 1024,
    isDesktop: viewportSize.width > 1024
  }), [isSlowConnection, prefersReducedData, memoryUsage, devicePixelRatio, viewportSize]);
  
  return {
    // State
    isSlowConnection,
    prefersReducedData,
    memoryUsage,
    isClientIdle,
    devicePixelRatio,
    viewportSize,
    
    // Performance helpers
    lazyLoadImages,
    debounce,
    throttle,
    prefetchResource,
    preloadResource,
    
    // Optimization flags
    ...performanceFlags
  };
};

export default usePerformance;