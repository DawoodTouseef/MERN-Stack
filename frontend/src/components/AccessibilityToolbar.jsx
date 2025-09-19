import { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  Typography,
  Button,
  Paper,
  Slide,
  useTheme,
  alpha,
  GlobalStyles,
} from '@mui/material';
import {
  FaUniversalAccess,
  FaTextHeight,
  FaFont,
  FaLowVision,
  FaRunning,
  FaExpand,
  FaCompress,
} from 'react-icons/fa';
import { useAccessibilityContext } from '../contexts/AccessibilityContext';

const AccessibilityToolbar = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const {
    isHighContrast,
    isReducedMotion,
    fontSizeMultiplier,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    skipToMainContent
  } = useAccessibilityContext();

  // Apply font size multiplier to document
  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * fontSizeMultiplier}px`;
  }, [fontSizeMultiplier]);

  // Apply high contrast mode
  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  // Apply reduced motion
  useEffect(() => {
    if (isReducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  }, [isReducedMotion]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  // Global styles for accessibility
  const accessibilityStyles = {
    '.high-contrast': {
      filter: 'contrast(150%) !important',
    },
    '.reduced-motion *': {
      'animation-duration': '0.01ms !important',
      'animation-iteration-count': '1 !important',
      'transition-duration': '0.01ms !important',
    },
    '.focus-visible': {
      outline: '2px solid #1976d2 !important',
      'outline-offset': '2px !important',
    },
    body: {
      transition: 'font-size 0.3s ease',
    },
  };

  return (
    <>
      <GlobalStyles styles={accessibilityStyles} />
      {/* Accessibility Button */}
      <Tooltip title="Accessibility Options" placement="left">
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 20,
            zIndex: 2000,
            bgcolor: 'primary.main',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: 3,
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <FaUniversalAccess />
        </IconButton>
      </Tooltip>

      {/* Accessibility Panel */}
      <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 170,
            right: 20,
            width: 300,
            maxHeight: 400,
            bgcolor: theme.palette.background.paper,
            p: 2,
            borderRadius: 2,
            color: theme.palette.text.primary,
            zIndex: 2000,
            overflowY: 'auto',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Accessibility
            </Typography>
            <IconButton onClick={() => setIsOpen(false)} size="small">
              <FaCompress />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Font Size Controls */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Text Size
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={decreaseFontSize}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                <FaFont style={{ transform: 'scale(0.8)' }} />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'center' }}>
                {fontSizeMultiplier.toFixed(1)}x
              </Typography>
              <IconButton
                onClick={increaseFontSize}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                <FaTextHeight />
              </IconButton>
              <Button
                onClick={resetFontSize}
                size="small"
                variant="outlined"
                sx={{ ml: 'auto', borderRadius: 2 }}
              >
                Reset
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* High Contrast */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Display Options
            </Typography>
            <Button
              fullWidth
              variant={isHighContrast ? 'contained' : 'outlined'}
              onClick={toggleHighContrast}
              startIcon={<FaLowVision />}
              sx={{
                justifyContent: 'flex-start',
                borderRadius: 2,
                mb: 1,
              }}
            >
              High Contrast
            </Button>
            <Button
              fullWidth
              variant={isReducedMotion ? 'contained' : 'outlined'}
              onClick={() => window.location.reload()}
              startIcon={<FaRunning />}
              sx={{
                justifyContent: 'flex-start',
                borderRadius: 2,
              }}
            >
              Reduced Motion
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Navigation */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Navigation
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => skipToMainContent()}
              sx={{
                justifyContent: 'flex-start',
                borderRadius: 2,
                mb: 1,
              }}
            >
              Skip to Content
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={toggleFullscreen}
              startIcon={isFullscreen ? <FaCompress /> : <FaExpand />}
              sx={{
                justifyContent: 'flex-start',
                borderRadius: 2,
              }}
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default AccessibilityToolbar;