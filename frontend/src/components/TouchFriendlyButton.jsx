import React from 'react';
import { 
  Button, 
  IconButton, 
  Fab, 
  useMediaQuery, 
  useTheme,
  styled,
  alpha
} from '@mui/material';

/**
 * Touch-friendly button with optimized sizing for mobile devices
 * Follows WCAG guidelines for minimum touch target size (44px)
 */
const TouchButton = styled(Button)(({ theme, variant, touch = 'auto' }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldUseTouchSize = touch === 'auto' ? isMobile : touch === 'large';

  return {
    minHeight: shouldUseTouchSize ? 44 : 'auto',
    minWidth: shouldUseTouchSize ? 44 : 'auto',
    padding: shouldUseTouchSize 
      ? theme.spacing(1.5, 2.5) 
      : theme.spacing(1, 2),
    fontSize: shouldUseTouchSize ? '1rem' : '0.875rem',
    fontWeight: 600,
    borderRadius: theme.spacing(1.5),
    textTransform: 'none',
    transition: 'all 0.2s ease-in-out',
    
    // Enhanced touch feedback
    '&:active': {
      transform: 'scale(0.96)',
      transition: 'transform 0.1s ease-in-out',
    },
    
    // Improved hover states for non-touch devices
    '@media (hover: hover)': {
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows[4],
      }
    },
    
    // Focus styles for accessibility
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
    },
    
    // Variant-specific styles
    ...(variant === 'contained' && {
      boxShadow: theme.shadows[2],
      '&:hover': {
        boxShadow: theme.shadows[4],
      }
    }),
    
    ...(variant === 'outlined' && {
      borderWidth: '2px',
      '&:hover': {
        borderWidth: '2px',
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      }
    })
  };
});

/**
 * Touch-friendly icon button with optimized sizing
 */
const TouchIconButton = styled(IconButton)(({ theme, size = 'medium', touch = 'auto' }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldUseTouchSize = touch === 'auto' ? isMobile : touch === 'large';

  const sizeMap = {
    small: shouldUseTouchSize ? 40 : 32,
    medium: shouldUseTouchSize ? 48 : 40,
    large: shouldUseTouchSize ? 56 : 48
  };

  const iconSizeMap = {
    small: shouldUseTouchSize ? 20 : 16,
    medium: shouldUseTouchSize ? 24 : 20,
    large: shouldUseTouchSize ? 28 : 24
  };

  return {
    width: sizeMap[size],
    height: sizeMap[size],
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.2s ease-in-out',
    
    '& .MuiSvgIcon-root': {
      fontSize: iconSizeMap[size],
    },
    
    // Enhanced touch feedback
    '&:active': {
      transform: 'scale(0.9)',
      transition: 'transform 0.1s ease-in-out',
    },
    
    // Improved hover states for non-touch devices
    '@media (hover: hover)': {
      '&:hover': {
        transform: 'scale(1.05)',
        backgroundColor: alpha(theme.palette.action.hover, 0.08),
      }
    },
    
    // Focus styles for accessibility
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
    }
  };
});

/**
 * Touch-friendly floating action button
 */
const TouchFab = styled(Fab)(({ theme, size = 'medium', touch = 'auto' }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldUseTouchSize = touch === 'auto' ? isMobile : touch === 'large';

  const sizeMap = {
    small: shouldUseTouchSize ? 48 : 40,
    medium: shouldUseTouchSize ? 64 : 56,
    large: shouldUseTouchSize ? 72 : 64
  };

  return {
    width: sizeMap[size],
    height: sizeMap[size],
    boxShadow: theme.shadows[6],
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Enhanced touch feedback
    '&:active': {
      transform: 'scale(0.9)',
      transition: 'transform 0.1s ease-in-out',
    },
    
    // Improved hover states for non-touch devices
    '@media (hover: hover)': {
      '&:hover': {
        transform: 'scale(1.1)',
        boxShadow: theme.shadows[12],
      }
    },
    
    // Focus styles for accessibility
    '&:focus-visible': {
      outline: `3px solid ${theme.palette.primary.main}`,
      outlineOffset: '3px',
    }
  };
});

/**
 * Component for creating touch-friendly interactive areas
 */
export const TouchArea = styled('div')(({ theme, minSize = 44 }) => ({
  minWidth: minSize,
  minHeight: minSize,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease-in-out',
  
  '&:active': {
    transform: 'scale(0.96)',
    backgroundColor: alpha(theme.palette.action.hover, 0.12),
  },
  
  '@media (hover: hover)': {
    '&:hover': {
      backgroundColor: alpha(theme.palette.action.hover, 0.04),
    }
  },
  
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  }
}));

/**
 * Hook for responsive touch sizing
 */
export const useTouchFriendlySize = (baseSize = 'medium') => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const sizeMap = {
    small: isMobile ? 'medium' : 'small',
    medium: isMobile ? 'large' : 'medium',
    large: isMobile ? 'large' : 'large'
  };
  
  return sizeMap[baseSize] || sizeMap.medium;
};

/**
 * Hook for touch-friendly spacing
 */
export const useTouchFriendlySpacing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return {
    xs: isMobile ? 2 : 1,
    sm: isMobile ? 3 : 2,
    md: isMobile ? 4 : 3,
    lg: isMobile ? 5 : 4,
    xl: isMobile ? 6 : 5
  };
};

export { TouchButton, TouchIconButton, TouchFab };
export default TouchButton;