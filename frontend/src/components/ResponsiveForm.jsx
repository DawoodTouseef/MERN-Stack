import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Box,
  useMediaQuery,
  useTheme,
  styled,
  alpha,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Button,
  Stack
} from '@mui/material';

/**
 * Enhanced TextField with mobile optimizations
 */
const ResponsiveTextField = styled(TextField)(({ theme, touch = 'auto' }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldUseTouchSize = touch === 'auto' ? isMobile : touch === 'large';

  return {
    '& .MuiInputBase-root': {
      minHeight: shouldUseTouchSize ? 56 : 48,
      fontSize: shouldUseTouchSize ? '16px' : '14px', // Prevents zoom on iOS
      borderRadius: theme.spacing(1.5),
      transition: 'all 0.2s ease-in-out',
      
      '&.Mui-focused': {
        transform: 'scale(1.02)',
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
      }
    },
    
    '& .MuiInputBase-input': {
      padding: shouldUseTouchSize 
        ? theme.spacing(2, 1.5)
        : theme.spacing(1.5, 1.5),
    },
    
    '& .MuiFormLabel-root': {
      fontSize: shouldUseTouchSize ? '1rem' : '0.875rem',
      fontWeight: 500,
    },
    
    '& .MuiFormHelperText-root': {
      fontSize: shouldUseTouchSize ? '0.875rem' : '0.75rem',
      marginTop: theme.spacing(1),
    },
    
    // Enhanced error states
    '&.Mui-error .MuiInputBase-root': {
      borderColor: theme.palette.error.main,
      backgroundColor: alpha(theme.palette.error.main, 0.04),
    }
  };
});

/**
 * Enhanced Select with mobile optimizations
 */
const ResponsiveSelect = styled(Select)(({ theme, touch = 'auto' }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldUseTouchSize = touch === 'auto' ? isMobile : touch === 'large';

  return {
    minHeight: shouldUseTouchSize ? 56 : 48,
    fontSize: shouldUseTouchSize ? '16px' : '14px',
    borderRadius: theme.spacing(1.5),
    
    '& .MuiSelect-select': {
      padding: shouldUseTouchSize 
        ? theme.spacing(2, 1.5)
        : theme.spacing(1.5, 1.5),
    },
    
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    }
  };
});

/**
 * Touch-friendly Checkbox
 */
const ResponsiveCheckbox = styled(Checkbox)(({ theme, touch = 'auto' }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldUseTouchSize = touch === 'auto' ? isMobile : touch === 'large';

  return {
    padding: shouldUseTouchSize ? theme.spacing(1.5) : theme.spacing(1),
    
    '& .MuiSvgIcon-root': {
      fontSize: shouldUseTouchSize ? '1.75rem' : '1.5rem',
    },
    
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      transform: 'scale(1.1)',
    }
  };
});

/**
 * Form Section with proper spacing
 */
export const FormSection = ({ 
  title, 
  children, 
  spacing = 3,
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        mb: spacing,
        '& > *:not(:last-child)': {
          mb: isMobile ? 2.5 : 2,
        }
      }}
      {...props}
    >
      {title && (
        <Box sx={{ mb: 2 }}>
          {title}
        </Box>
      )}
      {children}
    </Box>
  );
};

/**
 * Form Grid Layout
 */
export const FormGrid = ({ 
  children, 
  columns = { xs: 1, sm: 2 },
  spacing = 2 
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: `repeat(${columns.xs || 1}, 1fr)`,
          sm: `repeat(${columns.sm || 2}, 1fr)`,
          md: `repeat(${columns.md || columns.sm || 2}, 1fr)`,
        },
        gap: theme.spacing(spacing),
        alignItems: 'start'
      }}
    >
      {children}
    </Box>
  );
};

/**
 * Form Actions with responsive layout
 */
export const FormActions = ({ 
  children, 
  align = 'right',
  spacing = 2,
  fullWidthOnMobile = true,
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack
      direction={{ xs: fullWidthOnMobile ? 'column' : 'row', sm: 'row' }}
      spacing={spacing}
      justifyContent={align}
      sx={{
        mt: 4,
        '& .MuiButton-root': {
          ...(isMobile && fullWidthOnMobile && {
            width: '100%',
            minHeight: 48
          })
        }
      }}
      {...props}
    >
      {children}
    </Stack>
  );
};

/**
 * Responsive Form Container
 */
export const FormContainer = ({ 
  children, 
  maxWidth = 600,
  padding = true,
  elevation = 0,
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        maxWidth: isMobile ? '100%' : maxWidth,
        width: '100%',
        mx: 'auto',
        ...(padding && {
          p: { xs: 2, sm: 3, md: 4 }
        }),
        ...(elevation > 0 && {
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[elevation],
        })
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

/**
 * Field Group with label and description
 */
export const FieldGroup = ({ 
  label, 
  description, 
  required = false,
  children,
  error = false,
  ...props 
}) => {
  const theme = useTheme();

  return (
    <Box {...props}>
      {label && (
        <Box sx={{ mb: 1 }}>
          <Box
            component="label"
            sx={{
              display: 'block',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: error ? theme.palette.error.main : theme.palette.text.primary,
              mb: 0.5
            }}
          >
            {label}
            {required && (
              <Box component="span" sx={{ color: theme.palette.error.main, ml: 0.5 }}>
                *
              </Box>
            )}
          </Box>
          {description && (
            <Box
              sx={{
                fontSize: '0.875rem',
                color: theme.palette.text.secondary,
                mb: 1
              }}
            >
              {description}
            </Box>
          )}
        </Box>
      )}
      {children}
    </Box>
  );
};

/**
 * Responsive Input with validation
 */
export const ResponsiveInput = ({
  label,
  description,
  required = false,
  error = false,
  helperText,
  fullWidth = true,
  touch = 'auto',
  ...props
}) => {
  return (
    <FieldGroup
      label={label}
      description={description}
      required={required}
      error={error}
    >
      <ResponsiveTextField
        fullWidth={fullWidth}
        error={error}
        helperText={helperText}
        required={required}
        touch={touch}
        {...props}
      />
    </FieldGroup>
  );
};

/**
 * Responsive Select with validation
 */
export const ResponsiveSelectField = ({
  label,
  description,
  required = false,
  error = false,
  helperText,
  options = [],
  fullWidth = true,
  touch = 'auto',
  ...props
}) => {
  return (
    <FieldGroup
      label={label}
      description={description}
      required={required}
      error={error}
    >
      <FormControl fullWidth={fullWidth} error={error}>
        <ResponsiveSelect
          touch={touch}
          {...props}
        >
          {options.map((option) => (
            <MenuItem 
              key={option.value} 
              value={option.value}
              sx={{
                minHeight: 48,
                fontSize: '1rem'
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </ResponsiveSelect>
        {helperText && (
          <FormHelperText>{helperText}</FormHelperText>
        )}
      </FormControl>
    </FieldGroup>
  );
};

/**
 * Touch-friendly Checkbox Group
 */
export const ResponsiveCheckboxGroup = ({
  label,
  description,
  options = [],
  value = [],
  onChange,
  error = false,
  ...props
}) => {
  return (
    <FieldGroup
      label={label}
      description={description}
      error={error}
      {...props}
    >
      <Box>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <ResponsiveCheckbox
                checked={value.includes(option.value)}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...value, option.value]
                    : value.filter(v => v !== option.value);
                  onChange?.(newValue);
                }}
              />
            }
            label={option.label}
            sx={{
              display: 'block',
              mb: 1,
              ml: 0,
              '& .MuiFormControlLabel-label': {
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          />
        ))}
      </Box>
    </FieldGroup>
  );
};

export { ResponsiveTextField, ResponsiveSelect, ResponsiveCheckbox };
export default ResponsiveInput;