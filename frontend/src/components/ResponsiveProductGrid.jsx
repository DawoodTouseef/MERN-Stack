import React from 'react';
import { Grid, Box, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Responsive Product Grid Component
 * Provides optimal layout for products across all device sizes
 */
const ResponsiveProductGrid = ({ 
  children, 
  spacing = 3, 
  minItemWidth = 280,
  maxItemWidth = 320,
  containerProps = {},
  itemProps = {},
  enableAnimation = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Calculate responsive grid columns
  const getGridConfig = () => {
    if (isMobile) {
      return {
        xs: 12,
        sm: 6,
        itemsPerRow: window.innerWidth < 480 ? 1 : 2,
        spacing: 2
      };
    }
    
    if (isTablet) {
      return {
        xs: 6,
        sm: 4,
        md: 4,
        itemsPerRow: 3,
        spacing: 2.5
      };
    }
    
    // Desktop
    return {
      xs: 6,
      sm: 4,
      md: 3,
      lg: 3,
      xl: 2.4,
      itemsPerRow: 4,
      spacing: 3
    };
  };

  const gridConfig = getGridConfig();
  const actualSpacing = gridConfig.spacing || spacing;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const GridContainer = enableAnimation ? motion.div : Box;
  const GridItem = enableAnimation ? motion.div : Box;

  const containerAnimationProps = enableAnimation ? {
    variants: containerVariants,
    initial: "hidden",
    animate: "visible"
  } : {};

  const itemAnimationProps = enableAnimation ? {
    variants: itemVariants,
    layout: true
  } : {};

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        px: { xs: 1, sm: 2, md: 3 },
        ...containerProps
      }}
    >
      <GridContainer {...containerAnimationProps}>
        <Grid 
          container 
          spacing={actualSpacing}
          sx={{
            justifyContent: { 
              xs: 'center', 
              sm: gridConfig.itemsPerRow <= 2 ? 'center' : 'flex-start',
              md: 'flex-start' 
            },
            alignItems: 'stretch',
            mx: 0,
            width: '100%',
            '& .MuiGrid-item': {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'stretch'
            }
          }}
        >
          {React.Children.map(children, (child, index) => (
            <Grid 
              item 
              {...gridConfig}
              key={child?.key || index}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                minWidth: { xs: '100%', sm: `${minItemWidth}px` },
                maxWidth: { 
                  xs: '100%', 
                  sm: `${maxItemWidth}px`,
                  md: `${maxItemWidth}px`
                },
                flex: {
                  xs: '1 1 100%',
                  sm: `1 1 ${minItemWidth}px`,
                  md: `0 1 ${maxItemWidth}px`
                },
                ...itemProps
              }}
            >
              <GridItem 
                {...itemAnimationProps}
                style={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                // Add touch-friendly attributes
                onTouchStart={(e) => {
                  // Add visual feedback for touch devices
                  e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onTouchEnd={(e) => {
                  // Reset visual feedback
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {child}
              </GridItem>
            </Grid>
          ))}
        </Grid>
      </GridContainer>
    </Box>
  );
};

/**
 * Responsive Auto-Grid Component
 * Automatically adjusts based on container width and item size
 */
export const ResponsiveAutoGrid = ({ 
  children, 
  minItemWidth = 280,
  maxItemWidth = 320,
  gap = 16,
  containerProps = {},
  enableAnimation = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const GridContainer = enableAnimation ? motion.div : Box;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 1, sm: 2, md: 3 },
        ...containerProps
      }}
    >
      <GridContainer
        {...(enableAnimation && {
          variants: containerVariants,
          initial: "hidden",
          animate: "visible"
        })}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile 
            ? 'repeat(auto-fit, minmax(280px, 1fr))'
            : `repeat(auto-fit, minmax(${minItemWidth}px, ${maxItemWidth}px))`,
          gap: `${gap}px`,
          justifyContent: 'center',
          alignItems: 'start',
          width: '100%'
        }}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={child?.key || index}
            {...(enableAnimation && { variants: itemVariants })}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            // Add touch-friendly attributes
            onTouchStart={(e) => {
              // Add visual feedback for touch devices
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onTouchEnd={(e) => {
              // Reset visual feedback
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {child}
          </motion.div>
        ))}
      </GridContainer>
    </Box>
  );
};

export default ResponsiveProductGrid;