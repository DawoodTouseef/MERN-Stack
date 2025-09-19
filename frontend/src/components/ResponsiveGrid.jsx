import { Grid, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const ResponsiveGrid = ({ 
  children, 
  spacing = 3,
  columns = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  },
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Grid 
      container 
      spacing={spacing}
      sx={{
        '& > .MuiGrid-item': {
          display: 'flex',
          flexDirection: 'column',
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Grid>
  );
};

export const ResponsiveGridItem = ({ 
  children, 
  columns = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3,
    xl: 2.4
  },
  sx = {},
  ...props 
}) => {
  return (
    <Grid 
      item 
      xs={columns.xs}
      sm={columns.sm}
      md={columns.md}
      lg={columns.lg}
      xl={columns.xl}
      sx={sx}
      {...props}
    >
      {children}
    </Grid>
  );
};

export default ResponsiveGrid;