import React from 'react';
import { 
  Box, 
  Container, 
  useMediaQuery, 
  useTheme,
  styled,
  Fade,
  Skeleton
} from '@mui/material';

/**
 * Responsive Container with consistent padding and max-width
 */
const ResponsiveContainer = styled(Container)(({ theme }) => ({
  maxWidth: '100% !important',
  padding: 0,
  
  [theme.breakpoints.up('xs')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    maxWidth: '1400px !important',
    margin: '0 auto',
  },
  
  [theme.breakpoints.up('lg')]: {
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
  },
  
  [theme.breakpoints.up('xl')]: {
    maxWidth: '1600px !important',
  }
}));

/**
 * Main Page Layout with responsive structure
 */
export const PageLayout = ({ 
  children, 
  maxWidth = 'xl',
  padding = true,
  spacing = true,
  background = 'transparent',
  minHeight = 'auto',
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        minHeight,
        backgroundColor: background,
        ...(spacing && {
          py: { xs: 2, sm: 3, md: 4 }
        }),
        overflow: 'hidden',
        width: '100%'
      }}
      {...props}
    >
      {padding ? (
        <ResponsiveContainer maxWidth={maxWidth}>
          {children}
        </ResponsiveContainer>
      ) : (
        <Box sx={{ width: '100%' }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

/**
 * Sidebar Layout for filter pages
 */
export const SidebarLayout = ({ 
  sidebar, 
  children, 
  sidebarWidth = { xs: '100%', md: 280 },
  spacing = 3,
  collapsible = true,
  defaultCollapsed = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed || isMobile);

  React.useEffect(() => {
    if (isMobile && !collapsed) {
      setCollapsed(true);
    }
  }, [isMobile]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      gap: spacing,
      width: '100%',
      minHeight: '100vh'
    }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: '100%', md: sidebarWidth.md || 280 },
          minWidth: { md: sidebarWidth.md || 280 },
          flexShrink: 0,
          ...(isMobile && {
            order: collapsed ? 2 : 1,
            ...(collapsed && { display: 'none' })
          })
        }}
      >
        {sidebar}
      </Box>
      
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0, // Prevents overflow
          ...(isMobile && {
            order: collapsed ? 1 : 2
          })
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

/**
 * Two Column Layout for product details
 */
export const TwoColumnLayout = ({ 
  leftColumn, 
  rightColumn, 
  leftColumnProps = {},
  rightColumnProps = {},
  spacing = 4,
  reverseOnMobile = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { 
          xs: reverseOnMobile ? 'column-reverse' : 'column', 
          md: 'row' 
        },
        gap: spacing,
        width: '100%',
        alignItems: 'stretch'
      }}
    >
      {/* Left Column */}
      <Box
        sx={{
          flex: { xs: '1', md: '0 1 50%' },
          minWidth: { xs: '100%', md: '45%' },
          maxWidth: { xs: '100%', md: '55%' },
          ...leftColumnProps.sx
        }}
        {...leftColumnProps}
      >
        {leftColumn}
      </Box>
      
      {/* Right Column */}
      <Box
        sx={{
          flex: { xs: '1', md: '0 1 50%' },
          minWidth: { xs: '100%', md: '45%' },
          maxWidth: { xs: '100%', md: '55%' },
          ...rightColumnProps.sx
        }}
        {...rightColumnProps}
      >
        {rightColumn}
      </Box>
    </Box>
  );
};

/**
 * Section with responsive spacing and optional background
 */
export const Section = ({ 
  children, 
  background = 'transparent',
  padding = true,
  spacing = { xs: 4, md: 6 },
  maxWidth = '100%',
  ...props 
}) => {
  return (
    <Box
      sx={{
        backgroundColor: background,
        ...(padding && {
          py: spacing,
          px: { xs: 2, sm: 3, md: 4 }
        }),
        maxWidth,
        width: '100%',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

/**
 * Content wrapper with fade-in animation
 */
export const AnimatedContent = ({ 
  children, 
  loading = false,
  skeleton = null,
  delay = 0,
  ...props 
}) => {
  if (loading) {
    return skeleton || <Skeleton variant="rectangular" height={200} />;
  }

  return (
    <Fade 
      in={!loading} 
      timeout={600}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Box {...props}>
        {children}
      </Box>
    </Fade>
  );
};

/**
 * Responsive Card Layout
 */
export const CardLayout = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
  
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(1.5),
    boxShadow: theme.shadows[1],
    
    '&:hover': {
      boxShadow: theme.shadows[4],
    }
  }
}));

/**
 * Masonry Layout for varied content sizes
 */
export const MasonryLayout = ({ 
  children, 
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  spacing = 2 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const getColumnCount = () => {
    if (isMobile) return columns.xs || 1;
    if (isTablet) return columns.sm || 2;
    return columns.md || 3;
  };

  return (
    <Box
      sx={{
        columnCount: getColumnCount(),
        columnGap: theme.spacing(spacing),
        width: '100%',
        
        '& > *': {
          breakInside: 'avoid',
          marginBottom: theme.spacing(spacing),
          display: 'block',
          width: '100%'
        }
      }}
    >
      {children}
    </Box>
  );
};

export default PageLayout;