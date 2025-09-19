import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useGetFilteredProductsQuery, useFacetedSearchQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import {
  setCategories,
  setProducts,
  setSearchQuery,
} from "../redux/features/shop/shopSlice";
import ProductCard from "./Products/ProductCard";
import AdvancedFilterPanel from "../components/AdvancedFilterPanel";
import SmartSearchSuggestions from "../components/SmartSearchSuggestions";
import usePerformance from "../hooks/usePerformance";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Stack,
  Fade,
  IconButton,
  Badge,
  Grid,
  Container,
  Alert,
  Skeleton,
  Tooltip,
  Zoom,
  Drawer,
  useTheme,
  useMediaQuery,
  alpha,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Fab,
} from "@mui/material";
import {
  FaFilter,
  FaTags,
  FaThLarge,
  FaBars,
  FaSortAmountDown,
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaArrowUp,
} from "react-icons/fa";
import DocumentTitle from "react-document-title";

const Shop = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { id: categoriesId } = useParams() || {};
  const dispatch = useDispatch();
  const { categories, products, checked, radio, searchQuery } = useSelector(
    (state) => state.shop
  );
  const { shouldReduceAnimations, shouldReduceImageQuality, isClientIdle } = usePerformance();

  const categoriesQuery = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Infinite scroll state
  const [enableInfiniteScroll, setEnableInfiniteScroll] = useState(false);
  
  // Advanced filtering state
  const [advancedFilters, setAdvancedFilters] = useState({
    category: [],
    brand: [],
    priceRange: 'all',
    rating: 0,
    availability: 'all',
    delivery: 'all',
    seller: 'all',
    offers: [],
    features: []
  });

  // Scroll to top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  const filteredProductsQuery = useGetFilteredProductsQuery({
    checked,
    radio,
  });
  
  const {
    data: facetedSearchData,
    isLoading: isFacetedSearchLoading,
    error: facetedSearchError,
  } = useFacetedSearchQuery({
    keyword: searchQuery,
    category: advancedFilters.category.length > 0 ? advancedFilters.category : undefined,
    brand: advancedFilters.brand.length > 0 ? advancedFilters.brand : undefined,
    priceRange: advancedFilters.priceRange !== 'all' ? advancedFilters.priceRange : undefined,
    rating: advancedFilters.rating > 0 ? advancedFilters.rating : undefined,
    availability: advancedFilters.availability !== 'all' ? advancedFilters.availability : undefined,
    delivery: advancedFilters.delivery !== 'all' ? advancedFilters.delivery : undefined,
    seller: advancedFilters.seller !== 'all' ? advancedFilters.seller : undefined,
    offers: advancedFilters.offers.length > 0 ? advancedFilters.offers : undefined,
    features: advancedFilters.features.length > 0 ? advancedFilters.features : undefined,
    sortBy: sortBy,
    sortOrder: 'desc',
    limit: enableInfiniteScroll ? 100 : 50 // Get more products for infinite scroll
  }, {
    skip: !showAdvancedFilters
  });

  // Handle scroll to top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle infinite scroll
  const handleInfiniteScroll = useCallback(() => {
    if (!enableInfiniteScroll || !hasMore || loadingMore) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // When user is near the bottom of the page
    if (scrollTop + windowHeight >= documentHeight - 1000) {
      loadMoreProducts();
    }
  }, [enableInfiniteScroll, hasMore, loadingMore]);

  useEffect(() => {
    if (enableInfiniteScroll) {
      window.addEventListener('scroll', handleInfiniteScroll);
      return () => window.removeEventListener('scroll', handleInfiniteScroll);
    }
  }, [handleInfiniteScroll, enableInfiniteScroll]);

  const loadMoreProducts = () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    // Simulate loading more products
    setTimeout(() => {
      setPage(prev => prev + 1);
      setLoadingMore(false);
      // In a real app, you would fetch more products here
    }, 1000);
  };

  useEffect(() => {
    if (!categoriesQuery.isLoading) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, dispatch]);
  
  useEffect(() => {
    if (showAdvancedFilters && facetedSearchData) {
      dispatch(setProducts(facetedSearchData.products || []));
      setFilteredProducts(facetedSearchData.products || []);
    } else if (!checked.length || !radio.length) {
      if (!filteredProductsQuery.isLoading) {
        const filteredProducts = filteredProductsQuery.data?.filter(
          (product) => {
            return (
              product.price.toString().includes(priceFilter) ||
              product.price === parseInt(priceFilter, 10)
            );
          }
        ) || [];
        dispatch(setProducts(filteredProducts));
        setFilteredProducts(filteredProducts);
      }
    }
  }, [checked, radio, filteredProductsQuery.data, dispatch, priceFilter, facetedSearchData, showAdvancedFilters]);
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, products]);

  const handleAdvancedFilterChange = (newFilters) => {
    setAdvancedFilters(newFilters);
    setShowAdvancedFilters(true);
    if (isMobile) setShowFilters(false);
    setPage(1); // Reset to first page when filters change
  };
  
  const handleAdvancedFilterClear = () => {
    setAdvancedFilters({
      category: [],
      brand: [],
      priceRange: 'all',
      rating: 0,
      availability: 'all',
      delivery: 'all',
      seller: 'all',
      offers: [],
      features: []
    });
    setShowAdvancedFilters(false);
    setPage(1); // Reset to first page when filters are cleared
  };
  
  const handleSearch = (query) => {
    dispatch(setSearchQuery(query));
    setPage(1); // Reset to first page when search changes
    setShowSuggestions(false);
  };
  
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setPage(1); // Reset to first page when sort changes
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleFilterToggle = () => setShowFilters((prev) => !prev);
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setPage(1); // Reset to first page when items per page changes
  };

  // Calculate pagination
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);
  
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(advancedFilters).reduce((count, filter) => {
      if (Array.isArray(filter)) {
        return count + filter.length;
      }
      if (typeof filter === 'string' && filter !== 'all') {
        return count + 1;
      }
      if (typeof filter === 'number' && filter > 0) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [advancedFilters]);

  // Toggle infinite scroll
  const toggleInfiniteScroll = () => {
    setEnableInfiniteScroll(!enableInfiniteScroll);
    setPage(1); // Reset to first page when toggling
  };

  return (
    <>
      <DocumentTitle title="Shop Products" />
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Enhanced Header Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            mb: 4, 
            borderRadius: 3,
            background: theme.palette.mode === 'dark' 
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, ${alpha(theme.palette.secondary.dark, 0.1)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={{ xs: 2, md: 3 }}
            sx={{ mb: 3 }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <FaTags style={{ 
                  color: theme.palette.primary.main, 
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }} />
              </Box>
              <Box>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 800,
                    fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
                    lineHeight: 1.2,
                    letterSpacing: '-0.5px'
                  }}
                >
                  Shop Products
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: theme.palette.text.secondary,
                    mt: 0.5,
                    fontSize: { xs: "0.875rem", sm: "1rem" }
                  }}
                >
                  Discover amazing products at great prices
                </Typography>
              </Box>
              <Zoom in>
                <Badge
                  badgeContent={filteredProducts.length}
                  color="primary"
                  max={999}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      p: '0 6px',
                      minWidth: 20,
                      height: 20,
                      borderRadius: 10,
                      top: 10,
                      right: 10
                    },
                  }}
                />
              </Zoom>
            </Stack>
            
            <Stack 
              direction="row" 
              spacing={1} 
              alignItems="center"
              sx={{ 
                mt: { xs: 1, md: 0 },
                width: { xs: '100%', md: 'auto' },
                justifyContent: { xs: 'space-between', md: 'flex-end' }
              }}
            >
              <Tooltip title="Grid View" arrow>
                <IconButton
                  onClick={() => handleViewModeChange('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  sx={{ 
                    borderRadius: 2,
                    p: 1.25,
                    backgroundColor: viewMode === 'grid' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2)
                    },
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FaThLarge />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="List View" arrow>
                <IconButton
                  onClick={() => handleViewModeChange('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  sx={{ 
                    borderRadius: 2,
                    p: 1.25,
                    backgroundColor: viewMode === 'list' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2)
                    },
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FaBars />
                </IconButton>
              </Tooltip>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<FaFilter />}
                endIcon={activeFiltersCount > 0 ? <Badge badgeContent={activeFiltersCount} color="error" /> : null}
                onClick={handleFilterToggle}
                sx={{
                  display: { xs: "flex", md: "none" },
                  borderRadius: 2,
                  fontWeight: 600,
                  px: { xs: 2, sm: 3 },
                  py: 1.25,
                  textTransform: "none",
                  boxShadow: 2,
                  position: 'relative',
                  height: 44,
                  minWidth: 120
                }}
              >
                Filters
              </Button>
            </Stack>
          </Stack>
          
          {/* Enhanced Search Bar */}
          <Box sx={{ position: 'relative', mb: 3 }}>
            <SmartSearchSuggestions
              onSearch={handleSearch}
              placeholder="Search products, brands, categories..."
              size="large"
              onFocus={() => {
                setIsSearchFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => {
                setIsSearchFocused(false);
                // Delay hiding suggestions to allow click events
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              isVisible={showSuggestions && searchQuery.length > 0}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  transition: 'all 0.3s ease',
                  transform: isSearchFocused ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: isSearchFocused ? 3 : 1,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  '&:hover': {
                    boxShadow: 2
                  }
                }
              }}
            />
            <Box sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.palette.text.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }}>
              <FaSearch style={{
                color: theme.palette.primary.main,
                fontSize: '1rem'
              }} />
            </Box>
          </Box>
          
          {/* Enhanced Sorting Chips */}
          <Box sx={{ 
            overflowX: 'auto', 
            pb: 1,
            '&::-webkit-scrollbar': {
              height: 6,
              borderRadius: 3
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'action.hover',
              borderRadius: 3
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'primary.main',
              borderRadius: 3,
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }
          }}>
            <Stack 
              direction="row" 
              spacing={1.5} 
              sx={{ 
                minWidth: 'max-content',
                p: 0.5
              }}
            >
              {['newest', 'price', 'rating', 'popular', 'name'].map((sort) => (
                <Chip
                  key={sort}
                  label={sort.charAt(0).toUpperCase() + sort.slice(1)}
                  onClick={() => handleSortChange(sort)}
                  color={sortBy === sort ? 'primary' : 'default'}
                  variant={sortBy === sort ? 'filled' : 'outlined'}
                  icon={sortBy === sort ? <FaSortAmountDown /> : undefined}
                  sx={{ 
                    px: 2,
                    height: 36,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    },
                    borderColor: sortBy === sort ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.3),
                    borderWidth: sortBy === sort ? 2 : 1
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Paper>
        
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Enhanced Filter Sidebar */}
          <Grid item xs={12} md={3}>
            {isMobile ? (
              <Drawer
                anchor="left"
                open={showFilters}
                onClose={() => setShowFilters(false)}
                PaperProps={{
                  sx: {
                    width: '85%',
                    maxWidth: 340,
                    p: 2,
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 16,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1.25rem' }}>Filters</Typography>
                  <IconButton onClick={() => setShowFilters(false)}>
                    <FaTimes />
                  </IconButton>
                </Stack>
                <AdvancedFilterPanel
                  filters={advancedFilters}
                  onFiltersChange={handleAdvancedFilterChange}
                  onClearFilters={handleAdvancedFilterClear}
                />
              </Drawer>
            ) : (
              <Box sx={{ 
                position: 'sticky',
                top: 24,
                maxHeight: 'calc(100vh - 48px)',
                overflowY: 'auto',
                pr: 1.5,
                '&::-webkit-scrollbar': {
                  width: 6,
                  borderRadius: 3
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'action.hover',
                  borderRadius: 3
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'primary.main',
                  borderRadius: 3,
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }
              }}>
                <Box sx={{ 
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1.25rem' }}>Filters</Typography>
                  {activeFiltersCount > 0 && (
                    <Button 
                      size="small" 
                      onClick={handleAdvancedFilterClear}
                      sx={{ 
                        textTransform: 'none',
                        color: theme.palette.error.main,
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      Clear All
                    </Button>
                  )}
                </Box>
                <AdvancedFilterPanel
                  filters={advancedFilters}
                  onFiltersChange={handleAdvancedFilterChange}
                  onClearFilters={handleAdvancedFilterClear}
                />
              </Box>
            )}
          </Grid>
          
          {/* Enhanced Product Grid */}
          <Grid item xs={12} md={9}>
            <Box>
              {/* Enhanced Controls Bar */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                sx={{ 
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                }}
                spacing={2}
              >
                <Box>
                  <Typography 
                    variant="h6" 
                    color="text.primary"
                    sx={{
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: '1.125rem'
                    }}
                  >
                    {(isFacetedSearchLoading || filteredProductsQuery.isLoading) ? (
                      <Skeleton width={200} />
                    ) : (
                      <>
                        <span>{filteredProducts.length}</span>
                        <Typography component="span" color="text.secondary" sx={{ fontWeight: 400 }}>
                          Products Found
                        </Typography>
                      </>
                    )}
                  </Typography>
                  {activeFiltersCount > 0 && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
                    </Typography>
                  )}
                </Box>
                
                <Stack 
                  direction="row" 
                  spacing={2} 
                  alignItems="center"
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'space-between', sm: 'flex-end' }
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Items per page</InputLabel>
                    <Select
                      value={itemsPerPage}
                      label="Items per page"
                      onChange={handleItemsPerPageChange}
                      IconComponent={FaChevronDown}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value={12}>12 per page</MenuItem>
                      <MenuItem value={24}>24 per page</MenuItem>
                      <MenuItem value={36}>36 per page</MenuItem>
                      <MenuItem value={48}>48 per page</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant={enableInfiniteScroll ? "contained" : "outlined"}
                    size="small"
                    onClick={toggleInfiniteScroll}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 500,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      '&:hover': {
                        borderColor: theme.palette.primary.main
                      }
                    }}
                  >
                    {enableInfiniteScroll ? "Disable Infinite Scroll" : "Enable Infinite Scroll"}
                  </Button>
                  
                  {facetedSearchError && (
                    <Alert 
                      severity="error" 
                      variant="outlined"
                      sx={{ 
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          fontSize: '1.25rem'
                        }
                      }}
                    >
                      Search failed. Please try again.
                    </Alert>
                  )}
                </Stack>
              </Stack>
              
              {/* Product Grid with Enhanced Loading States */}
              {(isFacetedSearchLoading || filteredProductsQuery.isLoading) ? (
                <Grid container spacing={3}>
                  {[...Array(itemsPerPage <= 12 ? 8 : 12)].map((_, index) => (
                    <Grid 
                      item 
                      xs={12} 
                      sm={6} 
                      md={viewMode === 'list' ? 12 : 6} 
                      lg={viewMode === 'list' ? 12 : 4} 
                      xl={viewMode === 'list' ? 12 : 3} 
                      key={index}
                    >
                      <Skeleton 
                        variant="rectangular" 
                        height={viewMode === 'list' ? 200 : 400} 
                        sx={{ 
                          borderRadius: 3,
                          transform: 'scale(0.98)',
                          transformOrigin: 'center'
                        }} 
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : filteredProducts.length === 0 ? (
                <Paper 
                  sx={{ 
                    p: { xs: 4, sm: 6 }, 
                    textAlign: 'center',
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    <FaSearch style={{ 
                      color: theme.palette.primary.main, 
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    color="text.primary"
                    sx={{ mb: 2, fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                  >
                    No products found
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}
                  >
                    We couldn't find any products matching your search or filters. Try adjusting your filters or search terms.
                  </Typography>
                  <Button 
                    onClick={handleAdvancedFilterClear}
                    variant="contained"
                    size="large"
                    sx={{ 
                      mt: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      px: { xs: 3, sm: 4 },
                      py: 1.5,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                  >
                    Clear All Filters
                  </Button>
                </Paper>
              ) : (
                <>
                  <Grid container spacing={3}>
                    {paginatedProducts
                      .filter((p) => !categoriesId || p.category?._id === categoriesId)
                      .map((p) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={6} 
                          md={viewMode === 'list' ? 12 : 6} 
                          lg={viewMode === 'list' ? 12 : 4} 
                          xl={viewMode === 'list' ? 12 : 3} 
                          key={p._id}
                        >
                          <Fade in timeout={300}>
                            <Box
                              sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                height: viewMode === 'list' ? 'auto' : { xs: 'auto', sm: 480 },
                                position: 'relative',
                                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                '&:hover': {
                                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                                  transform: "translateY(-4px)"
                                }
                              }}
                            >
                              <ProductCard product={p} viewMode={viewMode} />
                              {p.countInStock === 0 && (
                                <Chip
                                  label="Out of Stock"
                                  color="error"
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    top: 12,
                                    right: 12,
                                    zIndex: 2,
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    px: 1.5,
                                    height: 24
                                  }}
                                />
                              )}
                            </Box>
                          </Fade>
                        </Grid>
                      ))
                    }
                  </Grid>
                  
                  {/* Infinite Scroll Loading Indicator */}
                  {enableInfiniteScroll && loadingMore && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                      <CircularProgress size={32} thickness={4} />
                    </Box>
                  )}
                  
                  {/* Enhanced Pagination */}
                  {!enableInfiniteScroll && totalPages > 1 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mt: 5,
                      mb: 3
                    }}>
                      <Pagination 
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                        showFirstButton
                        showLastButton
                        siblingCount={isMobile ? 0 : 1}
                        boundaryCount={isMobile ? 1 : 2}
                        sx={{
                          '& .MuiPaginationItem-root': {
                            borderRadius: 2,
                            fontWeight: 600,
                            margin: { xs: '0 2px', sm: '0 3px' },
                            minWidth: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 },
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1)
                            }
                          },
                          '& .Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.dark'
                            }
                          },
                          '& .MuiPaginationItem-ellipsis': {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      {/* Enhanced Scroll to Top Button */}
      <Zoom in={showScrollTop}>
        <Fab
          color="primary"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 32 },
            right: { xs: 16, sm: 32 },
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <FaArrowUp />
        </Fab>
      </Zoom>
    </>
  );
};

export default Shop;