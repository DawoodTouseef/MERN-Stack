import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../Utils/useDebounce';

/**
 * Custom hook for managing product search functionality
 * @param {Function} onSearch - Callback function when search is triggered
 */
const useProductSearch = (onSearch) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Debounced search query
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery) => {
    if (!searchQuery.trim()) return;
    
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter(search => search !== searchQuery)
    ].slice(0, 10); // Keep only last 10 searches

    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  }, [recentSearches]);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }, []);

  // Handle search submission
  const handleSearch = useCallback((searchQuery) => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      onSearch && onSearch(searchQuery);
    }
    setShowSuggestions(false);
  }, [onSearch, saveRecentSearch]);

  // Handle query change
  const handleQueryChange = useCallback((newQuery) => {
    setQuery(newQuery);
    if (newQuery.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, []);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (query.trim().length > 0) {
      setShowSuggestions(true);
    }
  }, [query]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion) => {
    handleSearch(suggestion);
  }, [handleSearch]);

  return {
    query,
    debouncedQuery,
    recentSearches,
    isFocused,
    showSuggestions,
    handleQueryChange,
    handleSearch,
    handleFocus,
    handleBlur,
    handleSuggestionSelect,
    clearRecentSearches,
    saveRecentSearch
  };
};

export default useProductSearch;