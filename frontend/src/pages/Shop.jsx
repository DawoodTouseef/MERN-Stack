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
  Button,
} from "@mui/material";
import { FaArrowUp } from "react-icons/fa";
import DocumentTitle from "react-document-title";
import { APP_NAME } from "../redux/constants";

// Modular Components
import ShopHeader from "./Shop/components/ShopHeader";
import ShopSidebar from "./Shop/components/ShopSidebar";
import ProductDisplay from "./Shop/components/ProductDisplay";

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

  return (
    <>
      <DocumentTitle title={`Shop Products | ${APP_NAME}`} />
      <Container maxWidth="xl" sx={{ py: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Box sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', bgcolor: 'white', p: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <ShopHeader
            searchQuery={shopState.searchQuery}
            handleSearch={shopState.handleSearch}
            filteredProductsCount={shopState.products.length}
            viewMode={shopState.viewMode}
            handleViewModeChange={shopState.setViewMode}
            activeFiltersCount={shopState.activeFiltersCount}
            handleFilterToggle={() => shopState.setShowFilters(!shopState.showFilters)}
            isMobile={isMobile}
          />
        </Box>

        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <ShopSidebar
              advancedFilters={shopState.advancedFilters}
              handleAdvancedFilterChange={shopState.handleAdvancedFilterChange}
              handleAdvancedFilterClear={shopState.handleAdvancedFilterClear}
              activeFiltersCount={shopState.activeFiltersCount}
              showFilters={shopState.showFilters}
              setShowFilters={shopState.setShowFilters}
              isMobile={false}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <ProductDisplay
              products={shopState.products}
              isLoading={shopState.isLoading}
              viewMode={shopState.viewMode}
              page={shopState.page}
              handlePageChange={(e, v) => shopState.setPage(v)}
              itemsPerPage={shopState.itemsPerPage}
              handleItemsPerPageChange={(e) => {
                shopState.setItemsPerPage(e.target.value);
                shopState.setPage(1);
              }}
              enableInfiniteScroll={shopState.enableInfiniteScroll}
              loadingMore={shopState.loadingMore}
              handleAdvancedFilterClear={shopState.handleAdvancedFilterClear}
              isMobile={isMobile}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filters */}
      <ShopSidebar
        advancedFilters={shopState.advancedFilters}
        handleAdvancedFilterChange={shopState.handleAdvancedFilterChange}
        handleAdvancedFilterClear={shopState.handleAdvancedFilterClear}
        activeFiltersCount={shopState.activeFiltersCount}
        showFilters={shopState.showFilters}
        setShowFilters={shopState.setShowFilters}
        isMobile={true}
      />

      <Zoom in={showScrollTop}>
        <Fab
          color="primary"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 32 },
            right: { xs: 16, sm: 32 },
            zIndex: 1000
          }}
        >
          <FaArrowUp />
        </Fab>
      </Zoom>
    </>
  );
};

export default Shop;
