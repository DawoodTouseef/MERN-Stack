import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Rating,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  IconButton,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedSearchQuery, useGetSearchSuggestionsQuery } from '../redux/api/productApiSlice';
import { useFetchCategoriesQuery } from '../redux/api/categoryApiSlice';
import { useGetBrandsQuery } from '../redux/api/brandApiSlice';
import { useDebounce } from '../Utils/useDebounce';
import ResponsiveProductGrid from '../components/ResponsiveProductGrid';
import Product from '../pages/Products/Product';
import Loader from '../components/Loader';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AdvancedSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search state
  const [searchFilters, setSearchFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: parseInt(searchParams.get('minPrice')) || 0,
    maxPrice: parseInt(searchParams.get('maxPrice')) || 10000,
    rating: parseInt(searchParams.get('rating')) || 0,
    availability: searchParams.get('availability') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 12,
    tags: searchParams.get('tags')?.split(',') || [],
    warranty: searchParams.get('warranty') || '',
    returnPolicy: searchParams.get('returnPolicy') === 'true'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchFilters.keyword);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Fetch data
  const { data: categoriesData } = useFetchCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  
  // Advanced search query
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch
  } = useAdvancedSearchQuery(searchFilters, {
    skip: !Object.values(searchFilters).some(value => 
      value && (Array.isArray(value) ? value.length > 0 : true)
    )
  });

  // Search suggestions
  const {
    data: suggestions,
    isLoading: isSuggestionsLoading
  } = useGetSearchSuggestionsQuery(debouncedSearchQuery, {
    skip: !debouncedSearchQuery || debouncedSearchQuery.length < 2
  });

  // Count applied filters
  useEffect(() => {
    const count = Object.entries(searchFilters).reduce((acc, [key, value]) => {
      if (key === 'page' || key === 'limit' || key === 'sortBy' || key === 'sortOrder') return acc;
      if (Array.isArray(value)) return acc + (value.length > 0 ? 1 : 0);
      if (typeof value === 'boolean') return acc + (value ? 1 : 0);
      if (typeof value === 'number') return acc + (value > 0 ? 1 : 0);
      return acc + (value ? 1 : 0);
    }, 0);
    setAppliedFiltersCount(count);
  }, [searchFilters]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    setSearchParams(params);
  }, [searchFilters, setSearchParams]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterName]: value,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  // Handle search
  const handleSearch = useCallback(() => {
    handleFilterChange('keyword', searchQuery);
  }, [searchQuery, handleFilterChange]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchFilters({
      keyword: '',
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 10000,
      rating: 0,
      availability: '',
      sortBy: 'newest',
      sortOrder: 'desc',
      page: 1,
      limit: 12,
      tags: [],
      warranty: '',
      returnPolicy: false
    });
    setSearchQuery('');
  }, []);

  // Price range formatter
  const formatPrice = (value) => `$${value}`;

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'name', label: 'Name' }
  ];

  const availabilityOptions = [
    { value: '', label: 'All Products' },
    { value: 'inStock', label: 'In Stock' },
    { value: 'outOfStock', label: 'Out of Stock' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Search Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search for products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchQuery && (
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon />
                  </IconButton>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                sx={{ borderRadius: 2, px: 3 }}
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
              <Tooltip title="Toggle Filters">
                <IconButton
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider',
                    borderRadius: 2
                  }}
                >
                  <Badge badgeContent={appliedFiltersCount} color="primary">
                    <FilterIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              {appliedFiltersCount > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearAllFilters}
                  startIcon={<ClearIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Search Suggestions */}
      <AnimatePresence>
        {suggestions && searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Paper elevation={3} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Quick Suggestions:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestions.suggestions?.products?.slice(0, 5).map((product) => (
                  <Chip
                    key={product._id}
                    label={product.name}
                    onClick={() => navigate(`/product/${product._id}`)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Paper elevation={2} sx={{ p: 2, borderRadius: 3, position: 'sticky', top: 20 }}>
                  <Typography variant="h6" gutterBottom>
                    Filters
                    <Chip 
                      label={appliedFiltersCount} 
                      size="small" 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  
                  <Divider sx={{ mb: 2 }} />

                  {/* Category Filter */}
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">Category</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl fullWidth size="small">
                        <Select
                          value={searchFilters.category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All Categories</MenuItem>
                          {categoriesData?.map((category) => (
                            <MenuItem key={category._id} value={category._id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>

                  {/* Brand Filter */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">Brand</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl fullWidth size="small">
                        <Select
                          value={searchFilters.brand}
                          onChange={(e) => handleFilterChange('brand', e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">All Brands</MenuItem>
                          {brandsData?.map((brand) => (
                            <MenuItem key={brand._id} value={brand._id}>
                              {brand.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>

                  {/* Price Range */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">Price Range</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ px: 1 }}>
                        <Slider
                          value={[searchFilters.minPrice, searchFilters.maxPrice]}
                          onChange={(_, newValue) => {
                            handleFilterChange('minPrice', newValue[0]);
                            handleFilterChange('maxPrice', newValue[1]);
                          }}
                          valueLabelDisplay="auto"
                          valueLabelFormat={formatPrice}
                          min={0}
                          max={10000}
                          step={10}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption">
                            ${searchFilters.minPrice}
                          </Typography>
                          <Typography variant="caption">
                            ${searchFilters.maxPrice}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Rating Filter */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">Minimum Rating</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Rating
                        value={searchFilters.rating}
                        onChange={(_, newValue) => handleFilterChange('rating', newValue || 0)}
                        precision={1}
                      />
                    </AccordionDetails>
                  </Accordion>

                  {/* Availability */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">Availability</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl fullWidth size="small">
                        <Select
                          value={searchFilters.availability}
                          onChange={(e) => handleFilterChange('availability', e.target.value)}
                        >
                          {availabilityOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>

                  {/* Return Policy */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">Options</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={searchFilters.returnPolicy}
                            onChange={(e) => handleFilterChange('returnPolicy', e.target.checked)}
                          />
                        }
                        label="Returnable Only"
                      />
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              </motion.div>
            </Grid>
          )}
        </AnimatePresence>

        {/* Results */}
        <Grid item xs={12} md={showFilters ? 9 : 12}>
          {/* Results Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {searchResults?.totalProducts ? 
                `${searchResults.totalProducts} Products Found` : 
                'Search for products'
              }
            </Typography>
            
            {searchResults?.products && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <SortIcon sx={{ color: 'text.secondary' }} />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={searchFilters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <Select
                    value={searchFilters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  >
                    <MenuItem value="asc">Asc</MenuItem>
                    <MenuItem value="desc">Desc</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>

          {/* Search Results */}
          {isSearching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <Loader />
            </Box>
          ) : searchError ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="error">Error loading results. Please try again.</Typography>
            </Paper>
          ) : searchResults?.products ? (
            <>
              <ResponsiveProductGrid spacing={3}>
                {searchResults.products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Product product={product} />
                  </motion.div>
                ))}
              </ResponsiveProductGrid>

              {/* Pagination */}
              {searchResults.pagination?.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Button
                    disabled={!searchResults.pagination.hasPrevPage}
                    onClick={() => handleFilterChange('page', searchFilters.page - 1)}
                  >
                    Previous
                  </Button>
                  <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                    Page {searchResults.pagination.currentPage} of {searchResults.pagination.totalPages}
                  </Typography>
                  <Button
                    disabled={!searchResults.pagination.hasNextPage}
                    onClick={() => handleFilterChange('page', searchFilters.page + 1)}
                  >
                    Next
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No products found
              </Typography>
              <Typography color="text.secondary">
                Try adjusting your search filters or search terms
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedSearch;