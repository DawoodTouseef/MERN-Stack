import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Fab,
  Zoom,
  useTheme,
  useMediaQuery,
  alpha,
  Stack,
  Chip,
  Typography,
  Button,
} from "@mui/material";
import { KeyboardArrowUp, CloseRounded } from "@mui/icons-material";
import DocumentTitle from "../components/DocumentTitle";
import { APP_NAME } from "../redux/constants";

// Modular Components
import ShopHeader from "./Shop/components/ShopHeader";
import ProductDisplay from "./Shop/components/ProductDisplay";
import ProductFilterSidebar from "./Shop/components/ProductFilterSidebar";

// Custom Hook
import useShopFilters from "./Shop/hooks/useShopFilters";

const Shop = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id: categoriesId } = useParams() || {};

  const shopState = useShopFilters(categoriesId);

  // Scroll to top visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeFilterItem = (field, value) => {
    const filters = shopState.advancedFilters;
    if (Array.isArray(filters[field])) {
      shopState.handleAdvancedFilterChange({
        ...filters,
        [field]: filters[field].filter(v => v !== value)
      });
    } else {
      shopState.handleAdvancedFilterChange({
        ...filters,
        [field]: field === 'priceRange' ? 'all' : (typeof filters[field] === 'number' ? 0 : 'all')
      });
    }
  };

  return (
    <>
      <DocumentTitle title={`Shop Products | ${APP_NAME}`} />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          backgroundImage: `radial-gradient(ellipse at 80% 0%, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 60%)`,
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Hero Header */}
          <ShopHeader
            searchQuery={shopState.searchQuery}
            handleSearch={shopState.handleSearch}
            filteredProductsCount={shopState.products.length}
            viewMode={shopState.viewMode}
            handleViewModeChange={shopState.setViewMode}
            activeFiltersCount={shopState.activeFiltersCount}
            handleFilterToggle={() => shopState.setShowFilters(!shopState.showFilters)}
            isMobile={isMobile}
            sortBy={shopState.sortBy}
            sortOrder={shopState.sortOrder}
            handleSortChange={shopState.handleSortChange}
          />

          <Grid container spacing={{ xs: 2, md: 4 }}>
            {/* Sidebar - Hidden on mobile, shown as column on desktop */}
            {!isMobile && (
              <Grid size={{ md: 3.5, lg: 3 }}>
                <ProductFilterSidebar
                  filters={shopState.advancedFilters}
                  onFilterChange={shopState.handleAdvancedFilterChange}
                  onClearAll={shopState.handleAdvancedFilterClear}
                  categories={shopState.categories}
                  brands={shopState.brands}
                  facets={shopState.facets}
                  isMobile={false}
                />
              </Grid>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
              <ProductFilterSidebar
                filters={shopState.advancedFilters}
                onFilterChange={shopState.handleAdvancedFilterChange}
                onClearAll={shopState.handleAdvancedFilterClear}
                categories={shopState.categories}
                brands={shopState.brands}
                facets={shopState.facets}
                isOpen={shopState.showFilters}
                onClose={() => shopState.setShowFilters(false)}
                isMobile={true}
              />
            )}

            <Grid size={{ xs: 12, md: 8.5, lg: 9 }}>
              {/* Active Filters Display */}
              {shopState.activeFiltersCount > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 3, alignItems: 'center' }}
                >
                  <Typography variant="body2" fontWeight={700} color="text.secondary">
                    Active Filters:
                  </Typography>
                  {shopState.advancedFilters.category.map(catId => {
                    const catName = shopState.categories.find(c => c._id === catId)?.name || 'Category';
                    return <Chip
                      key={catId}
                      label={catName}
                      size="small"
                      onDelete={() => removeFilterItem('category', catId)}
                      deleteIcon={<CloseRounded sx={{ fontSize: '1rem !important' }} />}
                      sx={{ borderRadius: 1.5, fontWeight: 600 }}
                    />
                  })}
                  {shopState.advancedFilters.brand.map(brandId => {
                    const brandName = shopState.brands.find(b => b._id === brandId)?.name || 'Brand';
                    return <Chip
                      key={brandId}
                      label={brandName}
                      size="small"
                      onDelete={() => removeFilterItem('brand', brandId)}
                      deleteIcon={<CloseRounded sx={{ fontSize: '1rem !important' }} />}
                      sx={{ borderRadius: 1.5, fontWeight: 600 }}
                    />
                  })}
                  {Array.isArray(shopState.advancedFilters.priceRange) && (
                    <Chip
                      label={`$${shopState.advancedFilters.priceRange[0]} - $${shopState.advancedFilters.priceRange[1]}`}
                      size="small"
                      onDelete={() => removeFilterItem('priceRange', null)}
                      deleteIcon={<CloseRounded sx={{ fontSize: '1rem !important' }} />}
                      sx={{ borderRadius: 1.5, fontWeight: 600 }}
                    />
                  )}
                  {shopState.advancedFilters.rating > 0 && (
                    <Chip
                      label={`${shopState.advancedFilters.rating}+ Stars`}
                      size="small"
                      onDelete={() => removeFilterItem('rating', null)}
                      deleteIcon={<CloseRounded sx={{ fontSize: '1rem !important' }} />}
                      sx={{ borderRadius: 1.5, fontWeight: 600 }}
                    />
                  )}
                  {shopState.advancedFilters.availability !== 'all' && (
                    <Chip
                      label="In Stock"
                      size="small"
                      onDelete={() => removeFilterItem('availability', 'all')}
                      deleteIcon={<CloseRounded sx={{ fontSize: '1rem !important' }} />}
                      sx={{ borderRadius: 1.5, fontWeight: 600 }}
                    />
                  )}
                  {shopState.advancedFilters.delivery !== 'all' && (
                    <Chip
                      label="Next Day Delivery"
                      size="small"
                      onDelete={() => removeFilterItem('delivery', 'all')}
                      deleteIcon={<CloseRounded sx={{ fontSize: '1rem !important' }} />}
                      sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: 'info.light', color: 'info.contrastText' }}
                    />
                  )}
                  {shopState.advancedFilters.seller !== 'all' && (
                    <Chip
                      label="Top Rated Seller"
                      size="small"
                      onDelete={() => removeFilterItem('seller', 'all')}
                      deleteIcon={<CloseRounded sx={{ fontSize: '1rem !important' }} />}
                      sx={{ borderRadius: 1.5, fontWeight: 600 }}
                    />
                  )}
                  {shopState.advancedFilters.discount !== 'all' && (
                    <Chip
                      label={`${shopState.advancedFilters.discount}%+ Off`}
                      size="small"
                      onDelete={() => removeFilterItem('discount', 'all')}
                      deleteIcon={<CloseRounded sx={{ fontSize: '1rem !important' }} />}
                      sx={{ borderRadius: 1.5, fontWeight: 600 }}
                    />
                  )}
                  <Button
                    size="small"
                    onClick={shopState.handleAdvancedFilterClear}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Clear All
                  </Button>
                </Stack>
              )}

              <ProductDisplay
                products={shopState.products}
                isLoading={shopState.isLoading}
                totalCount={shopState.facets?.totalCount?.[0]?.total || shopState.products.length}
                currentPage={shopState.page}
                onPageChange={shopState.setPage}
                itemsPerPage={shopState.itemsPerPage}
                onItemsPerPageChange={shopState.setItemsPerPage}
                viewMode={shopState.viewMode}
                isMobile={isMobile}
                searchQuery={shopState.searchQuery}
                handleAdvancedFilterClear={shopState.handleAdvancedFilterClear}
                enableInfiniteScroll={shopState.enableInfiniteScroll}
                loadingMore={shopState.loadingMore}
              />
            </Grid>
          </Grid>
        </Container>

      </Box>



      {/* Scroll to Top FAB */}
      <Zoom in={showScrollTop}>
        <Fab
          color="primary"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 20, sm: 36 },
            right: { xs: 20, sm: 36 },
            zIndex: 1000,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': {
              boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Zoom>
    </>
  );
};

export default Shop;
