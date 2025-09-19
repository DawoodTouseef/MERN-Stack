import { Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const ResponsiveTypography = ({ 
  children, 
  variant = 'body1',
  responsiveVariant = {
    xs: 'body2',
    sm: 'body1',
    md: 'h6',
    lg: 'h5',
    xl: 'h4'
  },
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  
  // Determine the appropriate variant based on screen size
  const getResponsiveVariant = () => {
    const screenWidth = window.innerWidth;
    
    if (screenWidth < theme.breakpoints.values.sm) {
      return responsiveVariant.xs || variant;
    } else if (screenWidth < theme.breakpoints.values.md) {
      return responsiveVariant.sm || variant;
    } else if (screenWidth < theme.breakpoints.values.lg) {
      return responsiveVariant.md || variant;
    } else if (screenWidth < theme.breakpoints.values.xl) {
      return responsiveVariant.lg || variant;
    } else {
      return responsiveVariant.xl || variant;
    }
  };
  
  return (
    <Typography 
      variant={getResponsiveVariant()}
      sx={{
        // Ensure responsive font sizing
        [theme.breakpoints.only('xs')]: {
          fontSize: responsiveVariant.xs ? 
            theme.typography[responsiveVariant.xs]?.fontSize || '0.875rem' : 
            undefined,
        },
        [theme.breakpoints.only('sm')]: {
          fontSize: responsiveVariant.sm ? 
            theme.typography[responsiveVariant.sm]?.fontSize || '1rem' : 
            undefined,
        },
        [theme.breakpoints.only('md')]: {
          fontSize: responsiveVariant.md ? 
            theme.typography[responsiveVariant.md]?.fontSize || '1.25rem' : 
            undefined,
        },
        [theme.breakpoints.only('lg')]: {
          fontSize: responsiveVariant.lg ? 
            theme.typography[responsiveVariant.lg]?.fontSize || '1.5rem' : 
            undefined,
        },
        [theme.breakpoints.only('xl')]: {
          fontSize: responsiveVariant.xl ? 
            theme.typography[responsiveVariant.xl]?.fontSize || '2.125rem' : 
            undefined,
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default ResponsiveTypography;