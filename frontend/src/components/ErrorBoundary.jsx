import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  AlertTitle,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import { ErrorOutline, Refresh, Home, BugReport } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and external service
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report to error tracking service (e.g., Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <Box
          sx={{
            minHeight: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            backgroundColor: '#f5f5f5'
          }}
        >
          <Paper
            elevation={6}
            sx={{
              maxWidth: 600,
              width: '100%',
              p: 4,
              borderRadius: 3,
              textAlign: 'center'
            }}
          >
            <ErrorOutline 
              sx={{ 
                fontSize: 64, 
                color: 'error.main', 
                mb: 2 
              }} 
            />
            
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              color="error.main"
              fontWeight="bold"
            >
              Oops! Something went wrong
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mb: 3 }}
            >
              We're sorry, but an unexpected error occurred. Our team has been notified 
              and is working to fix this issue.
            </Typography>

            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                textAlign: 'left',
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <AlertTitle>Error Details</AlertTitle>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Error ID:</strong> {this.state.errorId}
              </Typography>
              {this.props.showDetails && this.state.error && (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Message:</strong> {this.state.error.message}
                  </Typography>
                  {this.state.error.stack && (
                    <Box
                      component="pre"
                      sx={{
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        maxHeight: 200,
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        p: 1,
                        borderRadius: 1,
                        mt: 1
                      }}
                    >
                      {this.state.error.stack}
                    </Box>
                  )}
                </>
              )}
            </Alert>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
            >
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                size="large"
              >
                Try Again
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={this.handleGoHome}
                size="large"
              >
                Go Home
              </Button>
              
              {this.props.showReportButton && (
                <Button
                  variant="text"
                  startIcon={<BugReport />}
                  onClick={() => {
                    // Open report form or redirect to support
                    console.log('Report error:', this.state.errorId);
                  }}
                  size="large"
                  color="secondary"
                >
                  Report Issue
                </Button>
              )}
            </Stack>

            {this.props.children && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ textAlign: 'left' }}>
                  {this.props.children}
                </Box>
              </>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error) => {
    console.error('Error captured:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

/**
 * Async error wrapper
 */
export const withAsyncErrorHandling = (asyncFn, errorHandler) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        console.error('Async error:', error);
      }
      throw error;
    }
  };
};

export default ErrorBoundary;