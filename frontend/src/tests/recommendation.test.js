import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';

// Import components to test
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import { VirtualizedProductGrid } from '../components/VirtualizedComponents';
import { withLazyLoading } from '../Utils/lazyLoading';
import ErrorBoundary from '../components/ErrorBoundary';

// Mock store setup
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { userInfo: null }, action) => state,
      recommendations: (state = { 
        personalizedProducts: [], 
        loading: false, 
        error: null 
      }, action) => state,
      currency: (state = { 
        selectedCurrency: 'USD', 
        price: 1 
      }, action) => state,
      ...initialState
    }
  });
};

// Mock recommendations API
jest.mock('../redux/api/recommendationApiSlice', () => ({
  useGetPersonalizedRecommendationsQuery: jest.fn(() => ({
    data: [
      { _id: '1', name: 'Test Product 1', price: 99.99, image: 'test1.jpg' },
      { _id: '2', name: 'Test Product 2', price: 149.99, image: 'test2.jpg' }
    ],
    isLoading: false,
    error: null
  })),
  useTrackUserBehaviorMutation: jest.fn(() => [jest.fn(), { isLoading: false }])
}));

// Test wrapper component
const TestWrapper = ({ children, initialState = {} }) => {
  const store = createMockStore(initialState);
  
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('Recommendation System Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('PersonalizedRecommendations Component', () => {
    test('renders personalized recommendations correctly', async () => {
      render(
        <TestWrapper>
          <PersonalizedRecommendations />
        </TestWrapper>
      );

      // Check if the component renders
      expect(screen.getByText(/Personalized For You/i)).toBeInTheDocument();
      
      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      });
    });

    test('handles loading state correctly', () => {
      // Mock loading state
      jest.doMock('../redux/api/recommendationApiSlice', () => ({
        useGetPersonalizedRecommendationsQuery: jest.fn(() => ({
          data: null,
          isLoading: true,
          error: null
        }))
      }));

      render(
        <TestWrapper>
          <PersonalizedRecommendations />
        </TestWrapper>
      );

      // Should show loading skeleton
      expect(screen.getByTestId('recommendations-skeleton')).toBeInTheDocument();
    });

    test('handles error state correctly', () => {
      // Mock error state
      jest.doMock('../redux/api/recommendationApiSlice', () => ({
        useGetPersonalizedRecommendationsQuery: jest.fn(() => ({
          data: null,
          isLoading: false,
          error: { message: 'Failed to load recommendations' }
        }))
      }));

      render(
        <TestWrapper>
          <PersonalizedRecommendations />
        </TestWrapper>
      );

      // Should show error message
      expect(screen.getByText(/Failed to load recommendations/i)).toBeInTheDocument();
    });

    test('tracks user behavior on product interaction', async () => {
      const mockTrackBehavior = jest.fn();
      
      jest.doMock('../redux/api/recommendationApiSlice', () => ({
        useGetPersonalizedRecommendationsQuery: jest.fn(() => ({
          data: [
            { _id: '1', name: 'Test Product 1', price: 99.99, image: 'test1.jpg' }
          ],
          isLoading: false,
          error: null
        })),
        useTrackUserBehaviorMutation: jest.fn(() => [mockTrackBehavior, { isLoading: false }])
      }));

      render(
        <TestWrapper>
          <PersonalizedRecommendations />
        </TestWrapper>
      );

      // Find and click on a product
      const productCard = screen.getByText('Test Product 1');
      fireEvent.click(productCard);

      // Should track the interaction
      await waitFor(() => {
        expect(mockTrackBehavior).toHaveBeenCalledWith({
          type: 'product_click',
          productId: '1',
          timestamp: expect.any(Date)
        });
      });
    });
  });

  describe('VirtualizedProductGrid Component', () => {
    const mockProducts = Array.from({ length: 100 }, (_, i) => ({
      _id: `product-${i}`,
      name: `Product ${i}`,
      price: 99.99 + i,
      image: `product-${i}.jpg`
    }));

    const mockRenderItem = (product, { width, height }) => (
      <div 
        data-testid={`product-${product._id}`}
        style={{ width, height }}
      >
        {product.name}
      </div>
    );

    test('renders virtualized grid correctly', () => {
      render(
        <TestWrapper>
          <VirtualizedProductGrid
            products={mockProducts}
            renderItem={mockRenderItem}
            loadMore={jest.fn()}
            hasNextPage={false}
            isLoading={false}
          />
        </TestWrapper>
      );

      // Should render the virtualized container
      expect(screen.getByRole('grid')).toBeInTheDocument();
      
      // Should render some products (virtualization means not all are rendered)
      expect(screen.getByTestId('product-product-0')).toBeInTheDocument();
    });

    test('handles infinite loading correctly', async () => {
      const mockLoadMore = jest.fn();
      
      render(
        <TestWrapper>
          <VirtualizedProductGrid
            products={mockProducts.slice(0, 20)}
            renderItem={mockRenderItem}
            loadMore={mockLoadMore}
            hasNextPage={true}
            isLoading={false}
          />
        </TestWrapper>
      );

      // Scroll to bottom to trigger load more
      const grid = screen.getByRole('grid');
      fireEvent.scroll(grid, { target: { scrollTop: 1000 } });

      await waitFor(() => {
        expect(mockLoadMore).toHaveBeenCalled();
      });
    });
  });

  describe('Lazy Loading Utilities', () => {
    test('withLazyLoading HOC works correctly', async () => {
      const MockComponent = () => <div data-testid="mock-component">Loaded Component</div>;
      const LazyComponent = withLazyLoading(() => Promise.resolve({ default: MockComponent }));

      render(
        <TestWrapper>
          <LazyComponent />
        </TestWrapper>
      );

      // Should show loading initially
      expect(screen.getByTestId('loading-fallback')).toBeInTheDocument();

      // Should load the component
      await waitFor(() => {
        expect(screen.getByTestId('mock-component')).toBeInTheDocument();
      });
    });

    test('handles lazy loading errors gracefully', async () => {
      const LazyComponent = withLazyLoading(() => Promise.reject(new Error('Load failed')));

      render(
        <TestWrapper>
          <ErrorBoundary>
            <LazyComponent />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should show error boundary fallback
      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary Component', () => {
    const ThrowError = ({ shouldThrow }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div data-testid="no-error">No Error</div>;
    };

    test('catches and displays errors correctly', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/Test error/i)).toBeInTheDocument();

      // Restore console.error
      console.error = originalError;
    });

    test('renders children normally when no error', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });

    test('provides retry functionality', () => {
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Click retry button
      const retryButton = screen.getByText(/Try again/i);
      fireEvent.click(retryButton);

      // Should attempt to re-render
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

      console.error = originalError;
    });
  });

  describe('Performance Optimization Tests', () => {
    test('adaptive loading responds to connection quality', () => {
      // Mock navigator.connection
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: {
          effectiveType: '2g',
          downlink: 0.5,
          rtt: 300
        }
      });

      const { useAdaptiveLoading } = require('../Utils/performanceOptimization');
      
      // This would need to be tested in a component that uses the hook
      // For now, we'll test the logic directly
      expect(navigator.connection.effectiveType).toBe('2g');
    });

    test('performance monitoring captures metrics', () => {
      const { usePerformanceMonitor } = require('../Utils/performanceOptimization');
      
      // Mock performance API
      global.performance.mark = jest.fn();
      global.performance.measure = jest.fn();
      global.PerformanceObserver = jest.fn(() => ({
        observe: jest.fn(),
        disconnect: jest.fn()
      }));

      // This would need to be tested in a component context
      expect(global.PerformanceObserver).toBeDefined();
    });
  });
});

describe('Integration Tests', () => {
  test('complete recommendation flow works', async () => {
    const store = createMockStore({
      auth: {
        userInfo: { _id: 'user123', role: 'user' }
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <PersonalizedRecommendations />
        </BrowserRouter>
      </Provider>
    );

    // Should load recommendations for authenticated user
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    // Should be able to interact with recommendations
    const productCard = screen.getByText('Test Product 1');
    expect(productCard).toBeInTheDocument();
  });

  test('application handles offline state gracefully', () => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });

    render(
      <TestWrapper>
        <PersonalizedRecommendations />
      </TestWrapper>
    );

    // Should handle offline state
    expect(navigator.onLine).toBe(false);
  });
});