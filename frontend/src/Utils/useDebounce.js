import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing values
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {*} Debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debounced callbacks
 * @param {Function} callback - The callback function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies array
 * @returns {Function} Debounced callback
 */
export const useDebouncedCallback = (callback, delay, deps = []) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Custom hook for debounced search with loading state
 * @param {Function} searchFn - The search function to call
 * @param {number} delay - Delay in milliseconds
 * @returns {Object} { search, isSearching, results, error }
 */
export const useDebouncedSearch = (searchFn, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsSearching(false);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const searchResults = await searchFn(debouncedQuery);
        setResults(searchResults || []);
      } catch (err) {
        setError(err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchFn]);

  const search = useCallback((newQuery) => {
    setQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    search,
    clearSearch,
    query,
    isSearching,
    results,
    error
  };
};

/**
 * Custom hook for throttled values
 * @param {*} value - The value to throttle
 * @param {number} interval - Throttle interval in milliseconds
 * @returns {*} Throttled value
 */
export const useThrottle = (value, interval) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
};

export default useDebounce;