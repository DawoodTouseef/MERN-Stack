import React, { createContext, useContext } from 'react';
import useAccessibility from '../hooks/useAccessibility';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const accessibility = useAccessibility();
  
  return (
    <AccessibilityContext.Provider value={accessibility}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityContext;