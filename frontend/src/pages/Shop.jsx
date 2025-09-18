import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery, useFacetedSearchQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import {
  setCategories,
  setProducts,
  setChecked,
  setSearchQuery,
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ProductCard from "./Products/ProductCard";
import AdvancedFilterPanel from "../components/AdvancedFilterPanel";
import SmartSearchSuggestions from "../components/SmartSearchSuggestions";
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
} from "@mui/material";
import { useParams } from "react-router-dom";
import {
  FaFilter,
  FaTags,
  FaThLarge,
  FaBars,
} from "react-icons/fa";
import DocumentTitle from "react-document-title";

const Shop = () => {
  const { id: categoriesId } = useParams() || {};
  const dispatch = useDispatch();
  const { categories, products, checked, radio, searchQuery } = useSelector(
    (state) => state.shop
  );

  const categoriesQuery = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
  
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

  const filteredProductsQuery = useGetFilteredProductsQuery({
    checked,
    radio,
  });
  
  // Faceted search query with comprehensive filtering
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
    limit: 24
  }, {
    skip: !showAdvancedFilters
  });

  useEffect(() => {
    if (!categoriesQuery.isLoading) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, dispatch]);
  
  useEffect(() => {
    if (showAdvancedFilters && facetedSearchData) {
      // Use faceted search results
      dispatch(setProducts(facetedSearchData.products || []));
      setFilteredProducts(facetedSearchData.products || []);
    } else if (!checked.length || !radio.length) {
      // Use traditional filtering
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
    // Filter products by search text
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

  // Advanced filter handlers
  const handleAdvancedFilterChange = (newFilters) => {
    setAdvancedFilters(newFilters);
    setShowAdvancedFilters(true);
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
  };
  
  const handleSearch = (query) => {
    dispatch(setSearchQuery(query));
  };
  
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleFilterToggle = () => setShowFilters((prev) => !prev);

  return (
    <>
      <DocumentTitle title="Shop Products" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header with Search */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3,
            background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)"
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <FaTags style={{ color: "#ec4899", fontSize: 32 }} />
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  color: "#18181b",
                  letterSpacing: 0.5,
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                }}
              >
                Shop Products
              </Typography>
              <Badge
                badgeContent={filteredProducts.length}
                color="secondary"
                sx={{
                  "& .MuiBadge-badge": {
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    background: "#ec4899",
                    color: "#fff",
                  },
                }}
              />
            </Stack>
            
            {/* View Mode and Sort Controls */}
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                onClick={() => handleViewModeChange('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
                sx={{ borderRadius: 2 }}
              >
                <FaThLarge />
              </IconButton>
              <IconButton
                onClick={() => handleViewModeChange('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
                sx={{ borderRadius: 2 }}
              >
                <FaBars />
              </IconButton>
              
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<FaFilter />}
                onClick={handleFilterToggle}
                sx={{
                  display: { xs: "flex", md: "none" },
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                Filters
              </Button>
            </Stack>
          </Stack>
          
          {/* Smart Search Box */}
          <SmartSearchSuggestions
            onSearch={handleSearch}
            placeholder="Search products, brands, categories..."
            size="medium"
            sx={{ mb: 2 }}
          />
          
          {/* Sort Options */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {['newest', 'price', 'rating', 'popular', 'name'].map((sort) => (
              <Chip
                key={sort}
                label={sort.charAt(0).toUpperCase() + sort.slice(1)}
                onClick={() => handleSortChange(sort)}
                color={sortBy === sort ? 'primary' : 'default'}
                variant={sortBy === sort ? 'filled' : 'outlined'}
                sx={{ 
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'primary.light' }
                }}
              />
            ))}
          </Stack>
        </Paper>
        
        {/* Main Content Layout */}
        <Grid container spacing={3}>
          {/* Advanced Filter Panel */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <AdvancedFilterPanel
                filters={advancedFilters}
                onFiltersChange={handleAdvancedFilterChange}
                onClearFilters={handleAdvancedFilterClear}
                sx={{
                  display: { xs: showFilters ? 'block' : 'none', md: 'block' },
                }}
              />
            </Box>
          </Grid>
          
          {/* Products Section */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 2 }}>
              {/* Results summary */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" color="text.primary">
                  {(isFacetedSearchLoading || filteredProductsQuery.isLoading) ? (
                    <Skeleton width={200} />
                  ) : (
                    `${filteredProducts.length} Products Found`
                  )}
                </Typography>
                {facetedSearchError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Search failed. Please try again.
                  </Alert>
                )}
              </Stack>
              
              {/* Product Grid */}
              {(isFacetedSearchLoading || filteredProductsQuery.isLoading) ? (
                <Grid container spacing={2}>
                  {[...Array(8)].map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                    </Grid>
                  ))}
                </Grid>
              ) : filteredProducts.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No products found matching your criteria
                  </Typography>
                  <Button 
                    onClick={handleAdvancedFilterClear} 
                    sx={{ mt: 2 }}
                    variant="outlined"
                  >
                    Clear Filters
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {filteredProducts
                    .filter((p) => !categoriesId || p.category?._id === categoriesId)
                    .map((p) => (
                      <Grid item xs={12} sm={6} md={viewMode === 'list' ? 12 : 4} lg={viewMode === 'list' ? 12 : 3} key={p._id}>
                        <Fade in>
                          <Paper
                            elevation={3}
                            sx={{
                              borderRadius: 3,
                              overflow: 'hidden',
                              transition: "transform 0.2s, box-shadow 0.2s",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: 6,
                              },
                              height: viewMode === 'list' ? 'auto' : 400,
                              position: 'relative'
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
                                  top: 8,
                                  right: 8,
                                  zIndex: 2,
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </Paper>
                        </Fade>
                      </Grid>
                    ))
                  }
                </Grid>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Shop;