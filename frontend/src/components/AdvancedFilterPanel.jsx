import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Rating,
  Button,
  Chip,
  Autocomplete,
  TextField,
  Divider,
  IconButton,
  Badge,
  Switch,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Grid,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  TuneRounded as TuneIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedSearchQuery } from '../redux/api/productApiSlice';
import { useFetchCategoriesQuery } from '../redux/api/categoryApiSlice';
import { useGetBrandsQuery } from '../redux/api/brandApiSlice';
import { useDebounce } from '../Utils/useDebounce';

const AdvancedFilterPanel = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  isVisible = true,
  appliedFiltersCount = 0 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expandedPanels, setExpandedPanels] = useState(new Set(['price', 'rating']));

  // API queries
  const { data: categories } = useFetchCategoriesQuery();
  const { data: brands } = useGetBrandsQuery();

  // Debounced filter updates
  const debouncedFilters = useDebounce(localFilters, 300);

  useEffect(() => {
    onFiltersChange(debouncedFilters);
  }, [debouncedFilters, onFiltersChange]);

  const handleFilterChange = useCallback((filterType, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handlePanelToggle = (panel) => {
    setExpandedPanels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(panel)) {
        newSet.delete(panel);
      } else {
        newSet.add(panel);
      }
      return newSet;
    });
  };

  const handleClearAll = () => {
    const clearedFilters = {
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 10000,
      rating: 0,
      availability: '',
      sortBy: 'relevance',
      sortOrder: 'desc',
      tags: [],
      warranty: '',
      returnPolicy: false,
      freeShipping: false,
      discount: false,
      newArrivals: false,
      bestSeller: false,
      priceRange: 'all',
      customerRating: [],
      deliveryTime: 'all',
      seller: 'all',
      offers: []
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under $25', value: '0-25' },
    { label: '$25 - $50', value: '25-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $200', value: '100-200' },
    { label: '$200 - $500', value: '200-500' },
    { label: 'Over $500', value: '500-10000' }
  ];

  const deliveryOptions = [
    { label: 'All Delivery', value: 'all' },
    { label: 'Same Day', value: 'same_day' },
    { label: '1-2 Days', value: '1-2_days' },
    { label: '3-5 Days', value: '3-5_days' },
    { label: 'Free Shipping', value: 'free_shipping' }
  ];

  const sellerTypes = [
    { label: 'All Sellers', value: 'all' },
    { label: 'Nexus Mart', value: 'nexus_mart' },
    { label: 'Top Rated', value: 'top_rated' },
    { label: 'Local Sellers', value: 'local' }
  ];

  const availableOffers = [
    { label: 'Flash Sale', value: 'flash_sale' },
    { label: 'Buy 2 Get 1', value: 'buy_2_get_1' },
    { label: 'Bundle Deal', value: 'bundle' },
    { label: 'Cashback', value: 'cashback' },
    { label: 'No Cost EMI', value: 'no_cost_emi' }
  ];

  const FilterSection = ({ title, children, panelKey, defaultExpanded = false }) => (
    <Accordion 
      expanded={expandedPanels.has(panelKey)}
      onChange={() => handlePanelToggle(panelKey)}
      sx={{ 
        boxShadow: 'none',
        '&:before': { display: 'none' },
        borderRadius: 1,
        mb: 1
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ 
          minHeight: 48,
          '& .MuiAccordionSummary-content': { margin: '8px 0' }
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Paper 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          position: 'sticky',
          top: 20,
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TuneIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Filters
            </Typography>
            {appliedFiltersCount > 0 && (
              <Badge badgeContent={appliedFiltersCount} color="primary" />
            )}
          </Box>
          <Button
            size="small"
            onClick={handleClearAll}
            startIcon={<ClearIcon />}
            disabled={appliedFiltersCount === 0}
          >
            Clear All
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Price Range */}
        <FilterSection title="Price Range" panelKey="price" defaultExpanded>
          <FormControl component="fieldset">
            <RadioGroup
              value={localFilters.priceRange || 'all'}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            >
              {priceRanges.map((range) => (
                <FormControlLabel
                  key={range.value}
                  value={range.value}
                  control={<Radio size="small" />}
                  label={range.label}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                />
              ))}
            </RadioGroup>
          </FormControl>
          
          {/* Custom Price Range Slider */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Custom Range: ${localFilters.minPrice} - ${localFilters.maxPrice}
            </Typography>
            <Slider
              value={[localFilters.minPrice || 0, localFilters.maxPrice || 10000]}
              onChange={(e, newValue) => {
                handleFilterChange('minPrice', newValue[0]);
                handleFilterChange('maxPrice', newValue[1]);
              }}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${value}`}
              min={0}
              max={10000}
              step={25}
              sx={{ mt: 1 }}
            />
          </Box>
        </FilterSection>

        {/* Customer Rating */}
        <FilterSection title="Customer Rating" panelKey="rating">
          <Box>
            {[4, 3, 2, 1].map((rating) => (
              <FormControlLabel
                key={rating}
                control={
                  <Checkbox
                    checked={localFilters.customerRating?.includes(rating) || false}
                    onChange={(e) => {
                      const currentRatings = localFilters.customerRating || [];
                      const newRatings = e.target.checked
                        ? [...currentRatings, rating]
                        : currentRatings.filter(r => r !== rating);
                      handleFilterChange('customerRating', newRatings);
                    }}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={rating} readOnly size="small" />
                    <Typography variant="body2">& up</Typography>
                  </Box>
                }
              />
            ))}
          </Box>
        </FilterSection>

        {/* Category */}
        <FilterSection title="Category" panelKey="category">
          <FormGroup>
            {categories?.slice(0, 8).map((category) => (
              <FormControlLabel
                key={category._id}
                control={
                  <Checkbox
                    checked={localFilters.category === category._id}
                    onChange={(e) => handleFilterChange('category', e.target.checked ? category._id : '')}
                    size="small"
                  />
                }
                label={category.name}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              />
            ))}
            {categories?.length > 8 && (
              <Button size="small" sx={{ justifyContent: 'flex-start', pl: 0 }}>
                Show More Categories
              </Button>
            )}
          </FormGroup>
        </FilterSection>

        {/* Brand */}
        <FilterSection title="Brand" panelKey="brand">
          <Autocomplete
            options={brands || []}
            getOptionLabel={(option) => option.name || ''}
            value={brands?.find(b => b._id === localFilters.brand) || null}
            onChange={(e, newValue) => handleFilterChange('brand', newValue?._id || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search brands..."
                size="small"
                variant="outlined"
              />
            )}
            sx={{ mt: 1 }}
          />
        </FilterSection>

        {/* Availability */}
        <FilterSection title="Availability" panelKey="availability">
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={localFilters.availability === 'in_stock'}
                  onChange={(e) => handleFilterChange('availability', e.target.checked ? 'in_stock' : '')}
                  size="small"
                />
              }
              label="In Stock Only"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localFilters.freeShipping || false}
                  onChange={(e) => handleFilterChange('freeShipping', e.target.checked)}
                  size="small"
                />
              }
              label="Free Shipping"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localFilters.discount || false}
                  onChange={(e) => handleFilterChange('discount', e.target.checked)}
                  size="small"
                />
              }
              label="On Sale"
            />
          </FormGroup>
        </FilterSection>

        {/* Delivery Options */}
        <FilterSection title="Delivery" panelKey="delivery">
          <FormControl component="fieldset">
            <RadioGroup
              value={localFilters.deliveryTime || 'all'}
              onChange={(e) => handleFilterChange('deliveryTime', e.target.value)}
            >
              {deliveryOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={option.label}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </FilterSection>

        {/* Seller */}
        <FilterSection title="Seller" panelKey="seller">
          <FormControl component="fieldset">
            <RadioGroup
              value={localFilters.seller || 'all'}
              onChange={(e) => handleFilterChange('seller', e.target.value)}
            >
              {sellerTypes.map((seller) => (
                <FormControlLabel
                  key={seller.value}
                  value={seller.value}
                  control={<Radio size="small" />}
                  label={seller.label}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </FilterSection>

        {/* Special Offers */}
        <FilterSection title="Special Offers" panelKey="offers">
          <FormGroup>
            {availableOffers.map((offer) => (
              <FormControlLabel
                key={offer.value}
                control={
                  <Checkbox
                    checked={localFilters.offers?.includes(offer.value) || false}
                    onChange={(e) => {
                      const currentOffers = localFilters.offers || [];
                      const newOffers = e.target.checked
                        ? [...currentOffers, offer.value]
                        : currentOffers.filter(o => o !== offer.value);
                      handleFilterChange('offers', newOffers);
                    }}
                    size="small"
                  />
                }
                label={offer.label}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              />
            ))}
          </FormGroup>
        </FilterSection>

        {/* Additional Features */}
        <FilterSection title="Features" panelKey="features">
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.newArrivals || false}
                  onChange={(e) => handleFilterChange('newArrivals', e.target.checked)}
                  size="small"
                />
              }
              label="New Arrivals"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.bestSeller || false}
                  onChange={(e) => handleFilterChange('bestSeller', e.target.checked)}
                  size="small"
                />
              }
              label="Best Sellers"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.returnPolicy || false}
                  onChange={(e) => handleFilterChange('returnPolicy', e.target.checked)}
                  size="small"
                />
              }
              label="Easy Returns"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.warranty || false}
                  onChange={(e) => handleFilterChange('warranty', e.target.checked)}
                  size="small"
                />
              }
              label="Warranty Included"
            />
          </FormGroup>
        </FilterSection>
      </Paper>
    </motion.div>
  );
};

export default AdvancedFilterPanel;