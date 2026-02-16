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
  useTheme,
  alpha,
  Tooltip,
  Skeleton,
  Collapse,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  TuneRounded as TuneIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedSearchQuery } from '../redux/api/productApiSlice';
import { useFetchCategoriesQuery } from '../redux/api/categoryApiSlice';
import { useGetBrandsQuery } from '../redux/api/brandApiSlice';
import { useDebounce } from '../Utils/useDebounce';
import { APP_NAME } from '../redux/constants';

const AdvancedFilterPanel = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isVisible = true,
  appliedFiltersCount = 0
}) => {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = useState(filters);
  const [expandedPanels, setExpandedPanels] = useState(new Set(['price', 'rating']));

  // API queries
  const { data: categories, isLoading: categoriesLoading } = useFetchCategoriesQuery();
  const { data: brands, isLoading: brandsLoading } = useGetBrandsQuery();

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
      category: [],
      brand: [],
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
    { label: APP_NAME, value: 'nexus_mart' },
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
        borderRadius: 2,
        mb: 1,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        '&.Mui-expanded': {
          margin: '8px 0',
        },
        '&:last-of-type': {
          marginBottom: 0
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 48,
          '& .MuiAccordionSummary-content': { margin: '8px 0' },
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          borderRadius: '8px 8px 0 0',
          '&.Mui-expanded': {
            borderRadius: '8px 8px 0 0',
          },
          px: 2
        }}
      >
        <Typography variant="subtitle2" fontWeight="600" sx={{ color: theme.palette.primary.main, fontSize: '0.95rem' }}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, bgcolor: alpha(theme.palette.background.paper, 0.5), px: 2, pb: 2 }}>
        <Collapse in={expandedPanels.has(panelKey)} timeout="auto" unmountOnExit>
          {children}
        </Collapse>
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
          p: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          position: 'sticky',
          top: 20,
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          '&::-webkit-scrollbar': {
            width: 6,
            borderRadius: 3
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'action.hover',
            borderRadius: 3
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#6366f1',
            borderRadius: 3,
            '&:hover': {
              backgroundColor: '#4f46e5'
            }
          }
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TuneIcon color="primary" />
            <Typography variant="h6" fontWeight="700" sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}>
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
            sx={{
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              minWidth: { xs: 60, sm: 70 },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 1.5,
              py: 0.5
            }}
            variant="outlined"
          >
            Clear All
          </Button>
        </Box>

        <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.divider, 0.5) }} />

        {/* Price Range */}
        <FilterSection title="Price Range" panelKey="price">
          <FormControl component="fieldset" >
            <RadioGroup
              value={localFilters.priceRange || 'all'}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            >
              {priceRanges.map((range) => (
                <FormControlLabel
                  key={range.value}
                  value={range.value}
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.8rem" } }}>
                      {range.label}
                    </Typography>
                  }
                  sx={{
                    '& .MuiFormControlLabel-label': { fontSize: { xs: "0.75rem", sm: "0.8rem" } },
                    mb: 0.5,
                    py: 0.75,
                    px: 1,
                    borderRadius: 1.5,
                    mx: 0,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    },
                    '&.Mui-checked': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Custom Price Range Slider */}
          <Box sx={{ mt: 2, px: 1 }}>
            <Typography variant="body2" gutterBottom sx={{ fontSize: "0.8rem", fontWeight: 500, mb: 1 }}>
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
              sx={{
                mt: 1,
                color: theme.palette.primary.main,
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16
                },
                '& .MuiSlider-track': {
                  height: 4,
                  borderRadius: 2
                },
                '& .MuiSlider-rail': {
                  height: 4,
                  borderRadius: 2
                }
              }}
            />
            {/* Custom Price Inputs */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Min Price"
                type="number"
                value={localFilters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                size="small"
                sx={{ width: '100%' }}
                InputProps={{
                  startAdornment: '$',
                }}
              />
              <TextField
                label="Max Price"
                type="number"
                value={localFilters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                size="small"
                sx={{ width: '100%' }}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Box>
          </Box>
        </FilterSection>

        {/* Customer Rating */}
        <FilterSection title="Customer Rating" panelKey="rating">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                    sx={{
                      color: theme.palette.warning.main,
                      '&.Mui-checked': {
                        color: theme.palette.warning.main,
                      }
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={rating} readOnly size="small" />
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>& up</Typography>
                  </Box>
                }
                sx={{
                  mb: 0.5,
                  py: 0.75,
                  px: 1,
                  borderRadius: 1.5,
                  mx: 0,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.warning.main, 0.05)
                  },
                  '&.Mui-checked': {
                    bgcolor: alpha(theme.palette.warning.main, 0.1)
                  }
                }}
              />
            ))}
          </Box>
        </FilterSection>

        {/* Category */}
        <FilterSection title="Category" panelKey="category">
          {categoriesLoading ? (
            <Box sx={{ p: 1 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={36} sx={{ mb: 1, borderRadius: 1.5 }} />
              ))}
            </Box>
          ) : (
            <FormGroup>
              {categories?.slice(0, 8).map((category) => (
                <FormControlLabel
                  key={category._id}
                  control={
                    <Checkbox
                      checked={localFilters.category.includes(category._id)}
                      onChange={(e) => {
                        const currentCategories = localFilters.category || [];
                        const newCategories = e.target.checked
                          ? [...currentCategories, category._id]
                          : currentCategories.filter(c => c !== category._id);
                        handleFilterChange('category', newCategories);
                      }}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {category.name}
                    </Typography>
                  }
                  sx={{
                    '& .MuiFormControlLabel-label': { fontSize: { xs: "0.75rem", sm: "0.8rem" } },
                    mb: 0.5,
                    py: 0.75,
                    px: 1,
                    borderRadius: 1.5,
                    mx: 0,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    },
                    '&.Mui-checked': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                />
              ))}
              {categories?.length > 8 && (
                <Button
                  size="small"
                  sx={{
                    justifyContent: 'flex-start',
                    pl: 1,
                    fontSize: "0.8rem",
                    textTransform: 'none',
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    py: 0.75
                  }}
                >
                  Show More Categories
                </Button>
              )}
            </FormGroup>
          )}
        </FilterSection>

        {/* Brand */}
        <FilterSection title="Brand" panelKey="brand">
          {brandsLoading ? (
            <Skeleton height={40} sx={{ borderRadius: 2 }} />
          ) : (
            <Autocomplete
              options={brands || []}
              getOptionLabel={(option) => option.name || ''}
              value={brands?.filter(b => localFilters.brand.includes(b._id)) || []}
              onChange={(e, newValue) => {
                const brandIds = newValue.map(b => b._id);
                handleFilterChange('brand', brandIds);
              }}
              multiple
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search brands..."
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.8rem" }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    size="small"
                    {...getTagProps({ index })}
                    sx={{
                      m: 0.5,
                      height: 24,
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: "0.7rem"
                      },
                      borderRadius: 1
                    }}
                  />
                ))
              }
              sx={{ mt: 1 }}
            />
          )}
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
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      '&.Mui-checked': {
                        color: theme.palette.success.main,
                        '+ .MuiSwitch-track': {
                          bgcolor: alpha(theme.palette.success.main, 0.5)
                        }
                      }
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  In Stock Only
                </Typography>
              }
              sx={{
                mb: 0.5,
                py: 0.75,
                px: 1,
                borderRadius: 1.5,
                mx: 0,
                '&:hover': {
                  bgcolor: alpha(theme.palette.success.main, 0.05)
                }
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localFilters.freeShipping || false}
                  onChange={(e) => handleFilterChange('freeShipping', e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      '&.Mui-checked': {
                        color: theme.palette.info.main,
                        '+ .MuiSwitch-track': {
                          bgcolor: alpha(theme.palette.info.main, 0.5)
                        }
                      }
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  Free Shipping
                </Typography>
              }
              sx={{
                mb: 0.5,
                py: 0.75,
                px: 1,
                borderRadius: 1.5,
                mx: 0,
                '&:hover': {
                  bgcolor: alpha(theme.palette.info.main, 0.05)
                }
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localFilters.discount || false}
                  onChange={(e) => handleFilterChange('discount', e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      '&.Mui-checked': {
                        color: theme.palette.error.main,
                        '+ .MuiSwitch-track': {
                          bgcolor: alpha(theme.palette.error.main, 0.5)
                        }
                      }
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  On Sale
                </Typography>
              }
              sx={{
                mb: 0.5,
                py: 0.75,
                px: 1,
                borderRadius: 1.5,
                mx: 0,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.05)
                }
              }}
            />
          </FormGroup>
        </FilterSection>

        {/* Delivery Options */}
        <FilterSection title="Delivery" panelKey="delivery">
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={localFilters.deliveryTime || 'all'}
              onChange={(e) => handleFilterChange('deliveryTime', e.target.value)}
            >
              {deliveryOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {option.label}
                    </Typography>
                  }
                  sx={{
                    '& .MuiFormControlLabel-label': { fontSize: { xs: "0.75rem", sm: "0.8rem" } },
                    mb: 0.5,
                    py: 0.75,
                    px: 1,
                    borderRadius: 1.5,
                    mx: 0,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.secondary.main, 0.05)
                    },
                    '&.Mui-checked': {
                      bgcolor: alpha(theme.palette.secondary.main, 0.1)
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </FilterSection>

        {/* Seller */}
        <FilterSection title="Seller" panelKey="seller">
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={localFilters.seller || 'all'}
              onChange={(e) => handleFilterChange('seller', e.target.value)}
            >
              {sellerTypes.map((seller) => (
                <FormControlLabel
                  key={seller.value}
                  value={seller.value}
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {seller.label}
                    </Typography>
                  }
                  sx={{
                    '& .MuiFormControlLabel-label': { fontSize: { xs: "0.75rem", sm: "0.8rem" } },
                    mb: 0.5,
                    py: 0.75,
                    px: 1,
                    borderRadius: 1.5,
                    mx: 0,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.info.main, 0.05)
                    },
                    '&.Mui-checked': {
                      bgcolor: alpha(theme.palette.info.main, 0.1)
                    }
                  }}
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
                label={
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    {offer.label}
                  </Typography>
                }
                sx={{
                  '& .MuiFormControlLabel-label': { fontSize: { xs: "0.75rem", sm: "0.8rem" } },
                  mb: 0.5,
                  py: 0.75,
                  px: 1,
                  borderRadius: 1.5,
                  mx: 0,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.05)
                  },
                  '&.Mui-checked': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.1)
                  }
                }}
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
              label={
                <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  New Arrivals
                </Typography>
              }
              sx={{
                mb: 0.5,
                py: 0.75,
                px: 1,
                borderRadius: 1.5,
                mx: 0,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                },
                '&.Mui-checked': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.bestSeller || false}
                  onChange={(e) => handleFilterChange('bestSeller', e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  Best Sellers
                </Typography>
              }
              sx={{
                mb: 0.5,
                py: 0.75,
                px: 1,
                borderRadius: 1.5,
                mx: 0,
                '&:hover': {
                  bgcolor: alpha(theme.palette.success.main, 0.05)
                },
                '&.Mui-checked': {
                  bgcolor: alpha(theme.palette.success.main, 0.1)
                }
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.returnPolicy || false}
                  onChange={(e) => handleFilterChange('returnPolicy', e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  Easy Returns
                </Typography>
              }
              sx={{
                mb: 0.5,
                py: 0.75,
                px: 1,
                borderRadius: 1.5,
                mx: 0,
                '&:hover': {
                  bgcolor: alpha(theme.palette.info.main, 0.05)
                },
                '&.Mui-checked': {
                  bgcolor: alpha(theme.palette.info.main, 0.1)
                }
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.warranty || false}
                  onChange={(e) => handleFilterChange('warranty', e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  Warranty Included
                </Typography>
              }
              sx={{
                mb: 0.5,
                py: 0.75,
                px: 1,
                borderRadius: 1.5,
                mx: 0,
                '&:hover': {
                  bgcolor: alpha(theme.palette.warning.main, 0.05)
                },
                '&.Mui-checked': {
                  bgcolor: alpha(theme.palette.warning.main, 0.1)
                }
              }}
            />
          </FormGroup>
        </FilterSection>
      </Paper>
    </motion.div>
  );
};

export default AdvancedFilterPanel;