import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../Utils/useDebounce';

/**
 * Custom hook for managing product filters
 * @param {Object} initialFilters - Initial filter values
 */
const useProductFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Debounced filters for API calls
  const debouncedFilters = useDebounce(filters, 300);

  // Calculate active filters count
  useEffect(() => {
    const count = Object.values(filters).reduce((total, filter) => {
      if (Array.isArray(filter)) {
        return total + filter.length;
      }
      if (typeof filter === 'string' && filter !== 'all' && filter !== '') {
        return total + 1;
      }
      if (typeof filter === 'number' && filter > 0) {
        return total + 1;
      }
      if (typeof filter === 'boolean' && filter === true) {
        return total + 1;
      }
      return total;
    }, 0);
    
    setActiveFiltersCount(count);
  }, [filters]);

  // Update a specific filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Reset a specific filter
  const resetFilter = useCallback((key) => {
    setFilters(prev => ({
      ...prev,
      [key]: initialFilters[key] || (Array.isArray(prev[key]) ? [] : '')
    }));
  }, [initialFilters]);

  // Toggle filter value (for arrays)
  const toggleFilter = useCallback((key, value) => {
    setFilters(prev => {
      const current = prev[key] || [];
      if (!Array.isArray(current)) return prev;
      
      const newValues = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
        
      return {
        ...prev,
        [key]: newValues
      };
    });
  }, []);

  return {
    filters,
    debouncedFilters,
    activeFiltersCount,
    updateFilter,
    updateFilters,
    clearFilters,
    resetFilter,
    toggleFilter
  };
};

export default useProductFilters;