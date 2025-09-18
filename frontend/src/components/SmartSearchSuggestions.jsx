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
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  LocalOffer as OfferIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetSearchSuggestionsQuery } from '../redux/api/productApiSlice';
import { useNavigate } from 'react-router-dom';

const SmartSearchSuggestions = ({
  searchQuery,
  isVisible,
  onSuggestionClick,
  onClose,
  position = { top: '100%', left: 0, right: 0 }
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
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

      const totalSuggestions = (suggestions?.data?.length || 0) + recentSearches.length;
      
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
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, recentSearches, selectedIndex, onClose]);

  const saveRecentSearch = (query) => {
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
    const totalSuggestions = suggestions?.data?.length || 0;
    
    if (index < totalSuggestions) {
      // It's a suggestion from API
      const suggestion = suggestions.data[index];
      const query = suggestion.query || suggestion.name || suggestion.term;
      saveRecentSearch(query);
      onSuggestionClick(query);
    } else {
      // It's a recent search
      const recentIndex = index - totalSuggestions;
      const query = recentSearches[recentIndex];
      onSuggestionClick(query);
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'product':
        return <SearchIcon />;
      case 'category':
        return <CategoryIcon />;
      case 'brand':
        return <StarIcon />;
      case 'trending':
        return <TrendingIcon />;
      case 'offer':
        return <OfferIcon />;
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
            backgroundColor: theme.palette.primary.light,
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

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={suggestionsRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          zIndex: 1300,
          ...position
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
          {!isLoading && !error && suggestions?.data && (
            <Box>
              {suggestions.data.length > 0 && (
                <Box>
                  <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      SUGGESTIONS
                    </Typography>
                  </Box>
                  <List sx={{ py: 0 }}>
                    {suggestions.data.slice(0, 8).map((suggestion, index) => (
                      <ListItem
                        key={`suggestion-${index}`}
                        button
                        selected={selectedIndex === index}
                        onClick={() => handleSuggestionSelect(index)}
                        sx={{
                          py: 1,
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: getSuggestionColor(suggestion.type),
                              fontSize: '1rem'
                            }}
                          >
                            {getSuggestionIcon(suggestion.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                {highlightSearchTerm(
                                  suggestion.query || suggestion.name || suggestion.term,
                                  searchQuery
                                )}
                              </Typography>
                              {suggestion.type === 'trending' && (
                                <Chip
                                  label="Trending"
                                  size="small"
                                  color="error"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                              {suggestion.type === 'offer' && (
                                <Chip
                                  label="On Sale"
                                  size="small"
                                  color="success"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={suggestion.category && (
                            <Typography variant="caption" color="text.secondary">
                              in {suggestion.category}
                            </Typography>
                          )}
                        />
                        {suggestion.count && (
                          <Typography variant="caption" color="text.secondary">
                            {suggestion.count} items
                          </Typography>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <Box>
              {suggestions?.data?.length > 0 && <Divider />}
              <Box sx={{ 
                px: 2, 
                py: 1, 
                bgcolor: 'grey.50',
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
                  const adjustedIndex = (suggestions?.data?.length || 0) + index;
                  return (
                    <ListItem
                      key={`recent-${index}`}
                      button
                      selected={selectedIndex === adjustedIndex}
                      onClick={() => handleSuggestionSelect(adjustedIndex)}
                      sx={{
                        py: 1,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'grey.400',
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
           (!suggestions?.data?.length && !recentSearches.length) && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'No suggestions found' : 'Start typing to see suggestions'}
              </Typography>
            </Box>
          )}

          {/* Quick Actions */}
          {searchQuery && searchQuery.length >= 2 && (
            <Box>
              <Divider />
              <Box sx={{ p: 1, bgcolor: 'grey.50' }}>
                <ListItem
                  button
                  onClick={() => {
                    saveRecentSearch(searchQuery);
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    onClose();
                  }}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
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
    </AnimatePresence>
  );
};

export default SmartSearchSuggestions;