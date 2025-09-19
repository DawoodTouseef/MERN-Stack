import { useState, useEffect } from 'react';

/**
 * Custom hook for accessibility features
 */
const useAccessibility = () => {
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);

  // Detect keyboard navigation mode
  useEffect(() => {
    const handleKeyDown = () => {
      if (!isKeyboardMode) {
        setIsKeyboardMode(true);
      }
    };

    const handleMouseDown = () => {
      if (isKeyboardMode) {
        setIsKeyboardMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isKeyboardMode]);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Detect high contrast preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    setPrefersHighContrast(mediaQuery.matches);
    
    const handleChange = (e) => {
      setPrefersHighContrast(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Handle font size adjustments
  useEffect(() => {
    const storedFontSize = localStorage.getItem('fontSizeMultiplier');
    if (storedFontSize) {
      setFontSizeMultiplier(parseFloat(storedFontSize));
    }
  }, []);

  const increaseFontSize = () => {
    const newMultiplier = Math.min(fontSizeMultiplier + 0.1, 2);
    setFontSizeMultiplier(newMultiplier);
    localStorage.setItem('fontSizeMultiplier', newMultiplier.toString());
  };

  const decreaseFontSize = () => {
    const newMultiplier = Math.max(fontSizeMultiplier - 0.1, 0.8);
    setFontSizeMultiplier(newMultiplier);
    localStorage.setItem('fontSizeMultiplier', newMultiplier.toString());
  };

  const resetFontSize = () => {
    setFontSizeMultiplier(1);
    localStorage.removeItem('fontSizeMultiplier');
  };

  return {
    // Accessibility states
    isKeyboardMode,
    prefersReducedMotion,
    prefersHighContrast,
    fontSizeMultiplier,
    
    // Accessibility actions
    increaseFontSize,
    decreaseFontSize,
    resetFontSize
  };
};

export default useAccessibility;