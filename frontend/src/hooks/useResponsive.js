import { useTheme, useMediaQuery } from '@mui/material';

/**
 * Custom hook for responsive design
 * @returns {Object} Responsive breakpoints and helper functions
 */
const useResponsive = () => {
  const theme = useTheme();
  
  // Breakpoint checks
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));
  
  // Range checks
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  // Orientation
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  // Touch capability
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
  
  // Screen size helpers
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
  return {
    // Breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Device types
    isMobile,
    isTablet,
    isDesktop,
    
    // Orientation
    isPortrait,
    isLandscape,
    
    // Touch capability
    isTouchDevice,
    
    // Screen sizes
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isExtraLargeScreen,
    
    // Theme access
    theme,
    
    // Custom spacing based on screen size
    spacing: (factor = 1) => {
      if (isXs) return theme.custom?.spacing?.xs * factor || 4 * factor;
      if (isSm) return theme.custom?.spacing?.sm * factor || 8 * factor;
      if (isMd) return theme.custom?.spacing?.md * factor || 12 * factor;
      if (isLg) return theme.custom?.spacing?.lg * factor || 16 * factor;
      return theme.custom?.spacing?.xl * factor || 24 * factor;
    },
    
    // Custom border radius based on screen size
    borderRadius: (size = 'md') => {
      if (isXs) return theme.custom?.borderRadius?.sm || 4;
      if (isSm) return theme.custom?.borderRadius?.md || 8;
      if (isMd) return theme.custom?.borderRadius?.lg || 12;
      return theme.custom?.borderRadius?.xl || 16;
    }
  };
};

export default useResponsive;