import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingIcon,
  Category as CategoryIcon,
  Business as BrandIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGetSearchSuggestionsQuery } from '../redux/api/productApiSlice';
import { useDebounce } from '../Utils/useDebounce';

const SmartSearchBox = ({ 
  placeholder = "Search products, brands, categories...",
  onSearch,
  sx = {},
  size = 'medium'
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Fetch search suggestions
  const {
    data: suggestions,
    isLoading: isSuggestionsLoading,
    error: suggestionsError
  } = useGetSearchSuggestionsQuery(debouncedQuery, {
    skip: !debouncedQuery || debouncedQuery.length < 2
  });

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show suggestions when we have data
  useEffect(() => {
    if (suggestions && searchQuery.length >= 2) {
      setShowSuggestions(true);
    }
  }, [suggestions, searchQuery]);

  // Keyboard navigation
  const handleKeyDown = (event) => {
    if (!showSuggestions) return;

    const totalSuggestions = 
      (suggestions?.suggestions?.products?.length || 0) +
      (suggestions?.suggestions?.categories?.length || 0) +
      (suggestions?.suggestions?.brands?.length || 0);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < totalSuggestions - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(getSuggestionByIndex(selectedIndex));
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  // Get suggestion by index for keyboard navigation
  const getSuggestionByIndex = (index) => {
    const products = suggestions?.suggestions?.products || [];
    const categories = suggestions?.suggestions?.categories || [];
    const brands = suggestions?.suggestions?.brands || [];
    
    if (index < products.length) {
      return { type: 'product', data: products[index] };
    }
    index -= products.length;
    
    if (index < categories.length) {
      return { type: 'category', data: categories[index] };
    }
    index -= categories.length;
    
    if (index < brands.length) {
      return { type: 'brand', data: brands[index] };
    }
    
    return null;
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (!suggestion) return;
    
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    switch (suggestion.type) {
      case 'product':
        navigate(`/product/${suggestion.data._id}`);
        break;
      case 'category':
        navigate(`/search?category=${suggestion.data._id}`);
        break;
      case 'brand':
        navigate(`/search?brand=${suggestion.data._id}`);
        break;
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  // Clear search
  const handleClear = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    searchRef.current?.focus();
  };

  // Render suggestion item
  const renderSuggestionItem = (suggestion, index, globalIndex) => {
    const isSelected = globalIndex === selectedIndex;
    
    return (
      <ListItem
        key={`${suggestion.type}-${suggestion.data._id || index}`}
        button
        selected={isSelected}
        onClick={() => handleSuggestionClick(suggestion)}
        sx={{
          py: 1,
          px: 2,
          '&:hover': {
            bgcolor: 'action.hover'
          },
          ...(isSelected && {
            bgcolor: 'action.selected'
          })
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ width: 32, height: 32 }}>
            {suggestion.type === 'product' && suggestion.data.image ? (
              <img 
                src={suggestion.data.image} 
                alt={suggestion.data.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : suggestion.type === 'category' ? (
              <CategoryIcon fontSize="small" />
            ) : suggestion.type === 'brand' ? (
              <BrandIcon fontSize="small" />
            ) : (
              <TrendingIcon fontSize="small" />
            )}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" noWrap>
                {suggestion.data.name}
              </Typography>
              {suggestion.type === 'product' && suggestion.data.price && (
                <Typography variant="caption" color="primary" fontWeight="bold">
                  ${suggestion.data.price}
                </Typography>
              )}
              {suggestion.data.count && (
                <Chip 
                  label={suggestion.data.count} 
                  size="small"    
                  variant="outlined"
                  sx={{ ml: 'auto' }}
                />
              )}
            </Box>
          }
          secondary={
            suggestion.type === 'product' ? (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {suggestion.data.category && (
                  <Typography variant="caption" color="text.secondary">
                    {suggestion.data.category}
                  </Typography>
                )}
                {suggestion.data.brand && (
                  <Typography variant="caption" color="text.secondary">
                    • {suggestion.data.brand}
                  </Typography>
                )}
                {suggestion.data.rating && (
                  <Typography variant="caption" color="text.secondary">
                    • ⭐ {suggestion.data.rating}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary">
                {suggestion.type === 'category' ? 'Category' : 'Brand'}
              </Typography>
            )
          }
        />
      </ListItem>
    );
  };

  // Get all suggestions for rendering
  const getAllSuggestions = () => {
    const products = (suggestions?.suggestions?.products || []).map(p => ({ type: 'product', data: p }));
    const categories = (suggestions?.suggestions?.categories || []).map(c => ({ type: 'category', data: c }));
    const brands = (suggestions?.suggestions?.brands || []).map(b => ({ type: 'brand', data: b }));
    
    return [...products, ...categories, ...brands];
  };

  const allSuggestions = getAllSuggestions();

  return (
    <Box sx={{ position: 'relative', width: '100%', ...sx }}>
      <TextField
        ref={searchRef}
        fullWidth
        size={size}
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"> 
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isSuggestionsLoading && (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              )}
              {searchQuery && (
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          ),
          sx: {
            borderRadius: size === 'small' ? 1 : 2,
            bgcolor: 'background.paper',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main'
              }
            }
          }
        }}
      />

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && allSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Paper
              ref={suggestionsRef}
              elevation={8}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1300,
                mt: 1,
                maxHeight: 400,
                overflow: 'auto',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <List sx={{ py: 1 }}>
                {/* Products Section */}
                {suggestions?.suggestions?.products?.length > 0 && (
                  <>
                    <ListItem sx={{ py: 0.5, px: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        PRODUCTS
                      </Typography>
                    </ListItem>
                    {suggestions.suggestions.products.slice(0, 5).map((product, index) => 
                      renderSuggestionItem(
                        { type: 'product', data: product }, 
                        index,
                        index
                      )
                    )}
                    {allSuggestions.length > 5 && <Divider />}
                  </>
                )}

                {/* Categories Section */}
                {suggestions?.suggestions?.categories?.length > 0 && (
                  <>
                    <ListItem sx={{ py: 0.5, px: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        CATEGORIES
                      </Typography>
                    </ListItem>
                    {suggestions.suggestions.categories.slice(0, 3).map((category, index) => 
                      renderSuggestionItem(
                        { type: 'category', data: category }, 
                        index,
                        (suggestions?.suggestions?.products?.length || 0) + index
                      )
                    )}
                    {suggestions?.suggestions?.brands?.length > 0 && <Divider />}
                  </>
                )}

                {/* Brands Section */}
                {suggestions?.suggestions?.brands?.length > 0 && (
                  <>
                    <ListItem sx={{ py: 0.5, px: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        BRANDS
                      </Typography>
                    </ListItem>
                    {suggestions.suggestions.brands.slice(0, 3).map((brand, index) => 
                      renderSuggestionItem(
                        { type: 'brand', data: brand }, 
                        index,
                        (suggestions?.suggestions?.products?.length || 0) + 
                        (suggestions?.suggestions?.categories?.length || 0) + index
                      )
                    )}
                  </>
                )}

                {/* Show All Results Option */}
                <Divider />
                <ListItem
                  button
                  onClick={handleSearch}
                  sx={{ py: 1, px: 2, bgcolor: 'primary.50' }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        Search for \"{searchQuery}\" in all products
                      </Typography>
                    }
                  />
                  <SearchIcon color="primary" />
                </ListItem>
              </List>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {showSuggestions && !isSuggestionsLoading && searchQuery.length >= 2 && 
         allSuggestions.length === 0 && !suggestionsError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Paper
              elevation={8}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1300,
                mt: 1,
                p: 2,
                textAlign: 'center',
                borderRadius: 2
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No suggestions found for \"{searchQuery}\"
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default SmartSearchBox;