import React, { Suspense, useState, useCallback, useMemo } from 'react';
import { 
  Grid, 
  Container, 
  Box, 
  CircularProgress, 
  Skeleton, 
  Fade,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import { VariableSizeGrid as VirtualGrid } from 'react-window';
import { FixedSizeList as VirtualList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { useVirtual } from 'react-virtual';
import { withPerformanceOptimization } from '../Utils/performanceOptimization';
import { ProgressiveImage } from '../Utils/lazyLoading';
import ErrorBoundary from './ErrorBoundary';

/**
 * High-performance responsive grid component with virtualization
 */
const VirtualizedProductGrid = withPerformanceOptimization(({ 
  products = [],
  loadMore,
  hasNextPage,
  isLoading,
  renderItem,
  adaptiveSettings,
  containerHeight = 600
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Calculate grid dimensions based on screen size and connection quality
  const { columns, itemHeight, itemWidth } = useMemo(() => {
    const baseColumns = isMobile ? 2 : 4;
    const qualityMultiplier = adaptiveSettings?.imageQuality === 'low' ? 0.8 : 1;
    
    return {
      columns: Math.floor(baseColumns * qualityMultiplier),
      itemHeight: isMobile ? 300 : 350,
      itemWidth: isMobile ? 180 : 250
    };
  }, [isMobile, adaptiveSettings]);

  const itemCount = hasNextPage ? products.length + 1 : products.length;
  const isItemLoaded = useCallback((index) => !!products[index], [products]);

  const loadMoreItems = useCallback(
    (startIndex, stopIndex) => {
      if (!isLoading && hasNextPage) {
        return loadMore();
      }
      return Promise.resolve();
    },
    [loadMore, isLoading, hasNextPage]
  );

  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columns + columnIndex;
    const product = products[index];

    if (!product) {
      if (hasNextPage && index >= products.length - columns) {
        return (
          <div style={style}>
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height="100%"
            >
              <CircularProgress size={24} />
            </Box>
          </div>
        );
      }
      return <div style={style} />;
    }

    return (
      <div style={style}>
        <Box p={1}>
          <ErrorBoundary
            fallback={
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={itemHeight - 20} 
                animation="wave"
              />
            }
          >
            <Suspense 
              fallback={
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  height={itemHeight - 20} 
                  animation="wave"
                />
              }
            >
              {renderItem(product, {
                width: itemWidth - 16,
                height: itemHeight - 20,
                adaptiveSettings
              })}
            </Suspense>
          </ErrorBoundary>
        </Box>
      </div>
    );
  }, [products, columns, hasNextPage, itemHeight, itemWidth, adaptiveSettings, renderItem]);

  const rowCount = Math.ceil(itemCount / columns);

  return (
    <Box sx={{ width: '100%', height: containerHeight }}>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <VirtualGrid
            ref={ref}
            height={containerHeight}
            width="100%"
            columnCount={columns}
            columnWidth={itemWidth}
            rowCount={rowCount}
            rowHeight={itemHeight}
            onItemsRendered={({
              visibleColumnStartIndex,
              visibleColumnStopIndex,
              visibleRowStartIndex,
              visibleRowStopIndex,
            }) => {
              onItemsRendered({
                startIndex: visibleRowStartIndex * columns + visibleColumnStartIndex,
                stopIndex: visibleRowStopIndex * columns + visibleColumnStopIndex,
              });
            }}
          >
            {Cell}
          </VirtualGrid>
        )}
      </InfiniteLoader>
    </Box>
  );
});

/**
 * Adaptive image component based on connection quality
 */
const AdaptiveProductImage = withPerformanceOptimization(({ 
  src, 
  alt, 
  width, 
  height, 
  adaptiveSettings 
}) => {
  const imageQuality = adaptiveSettings?.imageQuality || 'high';
  
  // Generate different image URLs based on quality
  const imageUrl = useMemo(() => {
    if (!src) return '';
    
    const qualityParams = {
      low: '?quality=30&format=webp&w=200',
      medium: '?quality=60&format=webp&w=400',
      high: '?quality=85&format=webp&w=800'
    };
    
    // Append quality parameters if the backend supports them
    return `${src}${qualityParams[imageQuality] || ''}`;
  }, [src, imageQuality]);

  return (
    <ProgressiveImage
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      placeholder={
        <Skeleton 
          variant="rectangular" 
          width={width} 
          height={height} 
          animation="wave"
        />
      }
    />
  );
});

/**
 * Responsive masonry layout for products
 */
const ResponsiveMasonry = withPerformanceOptimization(({ 
  items = [], 
  renderItem, 
  adaptiveSettings 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const columns = useMemo(() => {
    if (adaptiveSettings?.imageQuality === 'low') {
      return isMobile ? 1 : isTablet ? 2 : 3;
    }
    return isMobile ? 2 : isTablet ? 3 : 4;
  }, [isMobile, isTablet, adaptiveSettings]);

  // Group items into columns
  const columnItems = useMemo(() => {
    const cols = Array.from({ length: columns }, () => []);
    items.forEach((item, index) => {
      cols[index % columns].push(item);
    });
    return cols;
  }, [items, columns]);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Grid container spacing={2}>
        {columnItems.map((columnData, columnIndex) => (
          <Grid item xs={12 / columns} key={columnIndex}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {columnData.map((item, itemIndex) => (
                <Fade 
                  in={true} 
                  timeout={300 + itemIndex * 100} 
                  key={item.id || itemIndex}
                >
                  <Box>
                    <ErrorBoundary
                      fallback={
                        <Skeleton 
                          variant="rectangular" 
                          width="100%" 
                          height={200} 
                          animation="wave"
                        />
                      }
                    >
                      <Suspense 
                        fallback={
                          <Skeleton 
                            variant="rectangular" 
                            width="100%" 
                            height={200} 
                            animation="wave"
                          />
                        }
                      >
                        {renderItem(item, { adaptiveSettings })}
                      </Suspense>
                    </ErrorBoundary>
                  </Box>
                </Fade>
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
});

/**
 * Infinite scroll list with virtualization
 */
const VirtualizedInfiniteList = withPerformanceOptimization(({ 
  items = [],
  loadMore,
  hasNextPage,
  isLoading,
  renderItem,
  itemHeight = 100,
  adaptiveSettings
}) => {
  const itemCount = hasNextPage ? items.length + 1 : items.length;
  const isItemLoaded = useCallback((index) => !!items[index], [items]);

  const loadMoreItems = useCallback(
    (startIndex, stopIndex) => {
      if (!isLoading && hasNextPage) {
        return loadMore();
      }
      return Promise.resolve();
    },
    [loadMore, isLoading, hasNextPage]
  );

  const Item = useCallback(({ index, style }) => {
    const item = items[index];
    
    if (!item) {
      return (
        <div style={style}>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="100%"
          >
            <CircularProgress size={24} />
          </Box>
        </div>
      );
    }

    return (
      <div style={style}>
        <ErrorBoundary
          fallback={
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={itemHeight - 10} 
              animation="wave"
            />
          }
        >
          <Suspense 
            fallback={
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={itemHeight - 10} 
                animation="wave"
              />
            }
          >
            {renderItem(item, { adaptiveSettings })}
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }, [items, itemHeight, adaptiveSettings, renderItem]);

  return (
    <Box sx={{ width: '100%', height: '600px' }}>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <VirtualList
            ref={ref}
            height={600}
            width="100%"
            itemCount={itemCount}
            itemSize={itemHeight}
            onItemsRendered={onItemsRendered}
          >
            {Item}
          </VirtualList>
        )}
      </InfiniteLoader>
    </Box>
  );
});

export {
  VirtualizedProductGrid,
  AdaptiveProductImage,
  ResponsiveMasonry,
  VirtualizedInfiniteList
};