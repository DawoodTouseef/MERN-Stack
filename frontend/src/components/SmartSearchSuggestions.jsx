import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  useTheme,
  alpha,
  InputBase,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  Category as CategoryIcon,
  Business as BrandIcon,
  Star as RatingIcon,
  LocalOffer as OfferIcon,
  Clear as ClearIcon,
  Bolt as AIOption,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetSearchSuggestionsQuery } from '../redux/api/productApiSlice';
import { useNavigate } from 'react-router-dom';

const SmartSearchSuggestions = ({
  onSearch,
  placeholder = "Search products, brands, categories...",
  size = "large",
  onFocus,
  onBlur,
  isVisible,
  sx
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // API query for suggestions
  const { 
    data: suggestions, 
    isLoading, 
    error 
  } = useGetSearchSuggestionsQuery(searchQuery, {
    skip: !searchQuery || searchQuery.length < 2
  });

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

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;

      const totalSuggestions = getTotalSuggestionsCount();
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < totalSuggestions - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : totalSuggestions - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSuggestionSelect(selectedIndex);
          } else if (searchQuery.trim()) {
            // If no suggestion is selected but there's a query, search for it
            handleSearchSubmit();
          }
          break;
        case 'Escape':
          onBlur && onBlur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, recentSearches, selectedIndex, searchQuery, onBlur]);

  const getTotalSuggestionsCount = () => {
    return (
      (suggestions?.suggestions?.products?.length || 0) +
      (suggestions?.suggestions?.categories?.length || 0) +
      (suggestions?.suggestions?.brands?.length || 0) +
      recentSearches.length
    );
  };

  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    
    const newRecentSearches = [
      query,
      ...recentSearches.filter(search => search !== query)
    ].slice(0, 10); // Keep only last 10 searches

    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSuggestionSelect = (index) => {
    const products = suggestions?.suggestions?.products || [];
    const categories = suggestions?.suggestions?.categories || [];
    const brands = suggestions?.suggestions?.brands || [];
    
    let adjustedIndex = index;
    
    // Check if it's a product suggestion
    if (adjustedIndex < products.length) {
      const product = products[adjustedIndex];
      setSearchQuery(product.name);
      saveRecentSearch(product.name);
      onSearch && onSearch(product.name);
      navigate(`/product/${product._id}`);
      onBlur && onBlur();
      return;
    }
    
    adjustedIndex -= products.length;
    
    // Check if it's a category suggestion
    if (adjustedIndex < categories.length) {
      const category = categories[adjustedIndex];
      setSearchQuery(category.name);
      saveRecentSearch(category.name);
      onSearch && onSearch(category.name);
      navigate(`/search?category=${category._id}`);
      onBlur && onBlur();
      return;
    }
    
    adjustedIndex -= categories.length;
    
    // Check if it's a brand suggestion
    if (adjustedIndex < brands.length) {
      const brand = brands[adjustedIndex];
      setSearchQuery(brand.name);
      saveRecentSearch(brand.name);
      onSearch && onSearch(brand.name);
      navigate(`/search?brand=${brand._id}`);
      onBlur && onBlur();
      return;
    }
    
    adjustedIndex -= brands.length;
    
    // Check if it's a recent search
    if (adjustedIndex < recentSearches.length) {
      const query = recentSearches[adjustedIndex];
      setSearchQuery(query);
      onSearch && onSearch(query);
      onBlur && onBlur();
    }
    
    setSelectedIndex(-1);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      onSearch && onSearch(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      onBlur && onBlur();
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'product':
        return <SearchIcon />;
      case 'category':
        return <CategoryIcon />;
      case 'brand':
        return <BrandIcon />;
      case 'trending':
        return <TrendingIcon />;
      case 'offer':
        return <OfferIcon />;
      case 'ai':
        return <AIOption />;
      default:
        return <SearchIcon />;
    }
  };

  const getSuggestionColor = (type) => {
    switch (type) {
      case 'trending':
        return theme.palette.error.main;
      case 'category':
        return theme.palette.primary.main;
      case 'brand':
        return theme.palette.warning.main;
      case 'offer':
        return theme.palette.success.main;
      case 'ai':
        return theme.palette.secondary.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const highlightSearchTerm = (text, term) => {
    if (!term || !text) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <Box
          key={index}
          component="span"
          sx={{
            fontWeight: 'bold',
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            color: theme.palette.primary.contrastText,
            px: 0.5,
            borderRadius: 0.5
          }}
        >
          {part}
        </Box>
      ) : (
        part
      )
    );
  };

  const inputHeight = size === "small" ? 40 : size === "large" ? 56 : 48;

  if (!isVisible) return null;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Paper
        elevation={1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 3,
          p: '2px 4px',
          height: inputHeight,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          '&:focus-within': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
          },
          ...sx
        }}
      >
        <InputBase
          inputRef={inputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          sx={{
            ml: 2,
            flex: 1,
            fontSize: size === "small" ? "0.875rem" : size === "large" ? "1.125rem" : "1rem",
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit();
            }
          }}
        />
        {searchQuery && (
          <IconButton 
            size="small" 
            onClick={() => setSearchQuery("")}
            sx={{ mx: 0.5 }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton 
          type="submit" 
          sx={{ 
            p: 1, 
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: 2,
            m: 0.5,
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            },
            width: 44,
            height: 44
          }}
          onClick={handleSearchSubmit}
        >
          <SearchIcon />
        </IconButton>
      </Paper>

      <AnimatePresence>
        {isVisible && (searchQuery.length > 0 || recentSearches.length > 0) && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              zIndex: 1300,
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4
            }}
          >
            <Paper
              elevation={8}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                maxHeight: '400px',
                overflowY: 'auto',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {/* Loading State */}
              {isLoading && (
                <Box sx={{ p: 2 }}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
                      <Skeleton variant="text" width="80%" />
                    </Box>
                  ))}
                </Box>
              )}

              {/* Error State */}
              {error && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="error">
                    Failed to load suggestions
                  </Typography>
                </Box>
              )}

              {/* Suggestions from API */}
              {!isLoading && !error && suggestions?.suggestions && (
                <Box>
                  {/* Products Section */}
                  {suggestions.suggestions.products?.length > 0 && (
                    <Box>
                      <Box sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          PRODUCTS
                        </Typography>
                      </Box>
                      <List sx={{ py: 0 }}>
                        {suggestions.suggestions.products.slice(0, 5).map((product, index) => {
                          const isSelected = selectedIndex === index;
                          return (
                            <ListItem
                              key={`product-${index}`}
                              button
                              selected={isSelected}
                              onClick={() => handleSuggestionSelect(index)}
                              sx={{
                                py: 1,
                                '&:hover': {
                                  backgroundColor: theme.palette.action.hover
                                },
                                '&.Mui-selected': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                }
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    fontSize: '1rem'
                                  }}
                                >
                                  {product.image ? (
                                    <img 
                                      src={product.image} 
                                      alt={product.name}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <SearchIcon />
                                  )}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2">
                                      {highlightSearchTerm(product.name, searchQuery)}
                                    </Typography>
                                    {product.price && (
                                      <Typography variant="caption" color="primary" fontWeight="bold">
                                        ${product.price}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    {product.category && (
                                      <Typography variant="caption" color="text.secondary">
                                        {product.category}
                                      </Typography>
                                    )}
                                    {product.brand && (
                                      <Typography variant="caption" color="text.secondary">
                                        • {product.brand}
                                      </Typography>
                                    )}
                                    {product.rating && (
                                      <Typography variant="caption" color="text.secondary">
                                        • ⭐ {product.rating}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                              {product.countInStock !== undefined && (
                                <Chip
                                  label={product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                                  size="small"
                                  color={product.countInStock > 0 ? "success" : "error"}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </ListItem>
                          );
                        })}
                      </List>
                    </Box>
                  )}

                  {/* Categories Section */}
                  {suggestions.suggestions.categories?.length > 0 && (
                    <Box>
                      {(suggestions.suggestions.products?.length > 0) && <Divider />}
                      <Box sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          CATEGORIES
                        </Typography>
                      </Box>
                      <List sx={{ py: 0 }}>
                        {suggestions.suggestions.categories.slice(0, 3).map((category, index) => {
                          const globalIndex = (suggestions.suggestions.products?.length || 0) + index;
                          const isSelected = selectedIndex === globalIndex;
                          return (
                            <ListItem
                              key={`category-${index}`}
                              button
                              selected={isSelected}
                              onClick={() => handleSuggestionSelect(globalIndex)}
                              sx={{
                                py: 1,
                                '&:hover': {
                                  backgroundColor: theme.palette.action.hover
                                },
                                '&.Mui-selected': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                }
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    fontSize: '1rem'
                                  }}
                                >
                                  <CategoryIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2">
                                      {highlightSearchTerm(category.name, searchQuery)}
                                    </Typography>
                                    {category.count && (
                                      <Chip
                                        label={category.count}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Box>
                  )}

                  {/* Brands Section */}
                  {suggestions.suggestions.brands?.length > 0 && (
                    <Box>
                      {(suggestions.suggestions.products?.length > 0 || suggestions.suggestions.categories?.length > 0) && <Divider />}
                      <Box sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          BRANDS
                        </Typography>
                      </Box>
                      <List sx={{ py: 0 }}>
                        {suggestions.suggestions.brands.slice(0, 3).map((brand, index) => {
                          const globalIndex = 
                            (suggestions.suggestions.products?.length || 0) + 
                            (suggestions.suggestions.categories?.length || 0) + 
                            index;
                          const isSelected = selectedIndex === globalIndex;
                          return (
                            <ListItem
                              key={`brand-${index}`}
                              button
                              selected={isSelected}
                              onClick={() => handleSuggestionSelect(globalIndex)}
                              sx={{
                                py: 1,
                                '&:hover': {
                                  backgroundColor: theme.palette.action.hover
                                },
                                '&.Mui-selected': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                }
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                                    color: theme.palette.warning.main,
                                    fontSize: '1rem'
                                  }}
                                >
                                  <BrandIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2">
                                      {highlightSearchTerm(brand.name, searchQuery)}
                                    </Typography>
                                    {brand.count && (
                                      <Chip
                                        label={brand.count}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Box>
                  )}
                </Box>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <Box>
                  {(suggestions?.suggestions?.products?.length > 0 || 
                    suggestions?.suggestions?.categories?.length > 0 || 
                    suggestions?.suggestions?.brands?.length > 0) && <Divider />}
                  <Box sx={{ 
                    px: 2, 
                    py: 1, 
                    bgcolor: alpha(theme.palette.grey[500], 0.05),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      RECENT SEARCHES
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={clearRecentSearches}
                      sx={{ p: 0.5 }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <List sx={{ py: 0 }}>
                    {recentSearches.slice(0, 5).map((search, index) => {
                      const globalIndex = 
                        (suggestions?.suggestions?.products?.length || 0) + 
                        (suggestions?.suggestions?.categories?.length || 0) + 
                        (suggestions?.suggestions?.brands?.length || 0) + 
                        index;
                      const isSelected = selectedIndex === globalIndex;
                      return (
                        <ListItem
                          key={`recent-${index}`}
                          button
                          selected={isSelected}
                          onClick={() => handleSuggestionSelect(globalIndex)}
                          sx={{
                            py: 1,
                            '&:hover': {
                              backgroundColor: theme.palette.action.hover
                            },
                            '&.Mui-selected': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: alpha('grey.400', 0.1),
                                color: 'grey.400',
                                fontSize: '1rem'
                              }}
                            >
                              <HistoryIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2">
                                {highlightSearchTerm(search, searchQuery)}
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              )}

              {/* No Results */}
              {!isLoading && !error && 
               (!suggestions?.suggestions?.products?.length && 
                !suggestions?.suggestions?.categories?.length && 
                !suggestions?.suggestions?.brands?.length && 
                !recentSearches.length && searchQuery) && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <SearchIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No suggestions found for "{searchQuery}"
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleSearchSubmit}
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    Search Anyway
                  </Button>
                </Box>
              )}

              {/* Quick Actions */}
              {searchQuery && searchQuery.length >= 2 && (
                <Box>
                  <Divider />
                  <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <ListItem
                      button
                      onClick={handleSearchSubmit}
                      sx={{ 
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}>
                          <SearchIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            Search for "{searchQuery}"
                          </Typography>
                        }
                      />
                    </ListItem>
                  </Box>
                </Box>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default SmartSearchSuggestions;