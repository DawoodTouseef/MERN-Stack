import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for implementing infinite scroll functionality
 * @param {Function} fetchMore - Function to fetch more data
 * @param {boolean} hasMore - Whether there's more data to fetch
 * @param {any} dependencies - Dependencies to reset the scroll listener
 */
const useInfiniteScroll = (fetchMore, hasMore, dependencies = []) => {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const handleScroll = useCallback(() => {
    if (!hasMore || loading) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // When user is near the bottom of the page (within 1000px)
    if (scrollTop + windowHeight >= documentHeight - 1000) {
      setLoading(true);
      fetchMore().finally(() => setLoading(false));
    }
  }, [fetchMore, hasMore, loading]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, enabled]);

  // Reset loading state when dependencies change
  useEffect(() => {
    setLoading(false);
  }, dependencies);

  return {
    loading,
    enabled,
    setEnabled,
    loadMore: () => {
      if (hasMore && !loading) {
        setLoading(true);
        fetchMore().finally(() => setLoading(false));
      }
    }
  };
};

export default useInfiniteScroll;