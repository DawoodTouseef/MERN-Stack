import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AddProduct from '../pages/Seller/AddProduct';

// Mock the API hooks
jest.mock('../../redux/api/productApiSlice', () => ({
  useCreateProductMutation: () => [jest.fn()],
  useUploadProductImageMutation: () => [jest.fn()],
  useDeleteProductImageMutation: () => [jest.fn()],
}));

jest.mock('../../redux/api/categoryApiSlice', () => ({
  useFetchCategoriesQuery: () => ({
    data: [{ _id: '1', name: 'Electronics' }],
    isLoading: false,
    isError: false,
  }),
}));

jest.mock('../../redux/api/brandApiSlice', () => ({
  useGetBrandsQuery: () => ({
    data: [{ _id: '1', name: 'Apple' }],
    isLoading: false,
    isError: false,
  }),
}));

jest.mock('../../redux/api/taxApiSlice', () => ({
  useCalculateAdvancedTaxMutation: () => [jest.fn()],
}));

// Create a mock store
const store = configureStore({
  reducer: {
    auth: () => ({
      userInfo: {
        _id: 'user123',
        role: 'vendor',
      },
    }),
  },
});

// Test component
const TestComponent = () => (
  <Provider store={store}>
    <BrowserRouter>
      <AddProduct />
    </BrowserRouter>
  </Provider>
);

describe('AddProduct Component', () => {
  test('renders without crashing', () => {
    render(<TestComponent />);
    expect(screen.getByText('Add New Product')).toBeInTheDocument();
  });

  test('displays tax calculation section', () => {
    render(<TestComponent />);
    expect(screen.getByText('Tax Settings')).toBeInTheDocument();
  });

  test('displays shipping details section', () => {
    render(<TestComponent />);
    expect(screen.getByText('Shipping Details')).toBeInTheDocument();
  });
});