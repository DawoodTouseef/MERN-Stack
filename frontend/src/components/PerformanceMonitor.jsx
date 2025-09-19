import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import { FaTachometerAlt, FaMemory, FaWifi, FaBatteryHalf } from 'react-icons/fa';
import usePerformance from '../hooks/usePerformance';

const PerformanceMonitor = () => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const {
    isSlowConnection,
    prefersReducedData,
    memoryUsage,
    isClientIdle,
    shouldReduceAnimations,
    shouldReduceImageQuality
  } = usePerformance();

  // Toggle visibility with keyboard shortcut (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) {
    return (
      <Tooltip title="Performance Monitor (Ctrl+Shift+P)">
        <Box
          onClick={() => setIsVisible(true)}
          sx={{
            position: 'fixed',
            top: '50%',
            right: 0,
            transform: 'translateY(-50%)',
            bgcolor: 'primary.main',
            color: 'white',
            p: 1,
            borderRadius: '8px 0 0 8px',
            cursor: 'pointer',
            zIndex: 9999,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          PERF
        </Box>
      </Tooltip>
    );
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        width: 300,
        maxHeight: 400,
        bgcolor: theme.palette.background.paper,
        p: 2,
        borderRadius: 2,
        color: theme.palette.text.primary,
        zIndex: 9999,
        overflowY: 'auto',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Performance Monitor
        </Typography>
        <Chip
          label={isClientIdle ? 'Idle' : 'Active'}
          color={isClientIdle ? 'success' : 'warning'}
          size="small"
        />
      </Box>

      {/* Connection Status */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <FaWifi color={isSlowConnection ? theme.palette.warning.main : theme.palette.success.main} />
          <Typography variant="subtitle2" fontWeight={600}>
            Connection
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {isSlowConnection ? 'Slow Connection Detected' : 'Good Connection'}
        </Typography>
        {isSlowConnection && (
          <Typography variant="caption" color="warning.main">
            Some features may be reduced for better performance
          </Typography>
        )}
      </Box>

      {/* Data Saver */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <FaBatteryHalf color={prefersReducedData ? theme.palette.info.main : theme.palette.text.secondary} />
          <Typography variant="subtitle2" fontWeight={600}>
            Data Saver
          </Typography>
        </Box>
        <Typography variant="body2">
          {prefersReducedData ? 'Enabled (Reduced Data Mode)' : 'Disabled'}
        </Typography>
      </Box>

      {/* Memory Usage */}
      {memoryUsage && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FaMemory color={theme.palette.primary.main} />
            <Typography variant="subtitle2" fontWeight={600}>
              Memory Usage
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Device Memory: {memoryUsage.deviceMemory} GB
          </Typography>
          {memoryUsage.usedJSHeapSize && (
            <>
              <LinearProgress
                variant="determinate"
                value={(memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: theme.palette.primary.main,
                  },
                }}
              />
              <Typography variant="caption">
                {(memoryUsage.usedJSHeapSize / 1048576).toFixed(1)} MB / {(memoryUsage.jsHeapSizeLimit / 1048576).toFixed(1)} MB
              </Typography>
            </>
          )}
        </Box>
      )}

      {/* Optimization Status */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <FaTachometerAlt color={theme.palette.secondary.main} />
          <Typography variant="subtitle2" fontWeight={600}>
            Optimizations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="Reduced Animations"
            size="small"
            color={shouldReduceAnimations ? 'warning' : 'success'}
            variant={shouldReduceAnimations ? 'filled' : 'outlined'}
          />
          <Chip
            label="Image Quality"
            size="small"
            color={shouldReduceImageQuality ? 'warning' : 'success'}
            variant={shouldReduceImageQuality ? 'filled' : 'outlined'}
          />
        </Box>
      </Box>

      {/* Close Button */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{ cursor: 'pointer', color: theme.palette.primary.main }}
          onClick={() => setIsVisible(false)}
        >
          Click to hide (Ctrl+Shift+P)
        </Typography>
      </Box>
    </Paper>
  );
};

export default PerformanceMonitor;