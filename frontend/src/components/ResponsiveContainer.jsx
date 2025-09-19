import { useTheme, Container, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const ResponsiveContainer = ({ 
  children, 
  maxWidth = 'xl', 
  disableGutters = false,
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Container 
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{
        px: {
          xs: theme.custom?.spacing?.xs || 2,
          sm: theme.custom?.spacing?.sm || 3,
          md: theme.custom?.spacing?.md || 4,
          lg: theme.custom?.spacing?.lg || 5,
          xl: theme.custom?.spacing?.xl || 6,
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Container>
  );
};

export default ResponsiveContainer;