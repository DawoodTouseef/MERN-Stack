import React, { Suspense } from 'react';
import { Route, createRoutesFromElements } from 'react-router';
import { LazyPages as UtilsLazyPages, LoadingFallback } from '../Utils/lazyLoading';
import ErrorBoundary from '../components/ErrorBoundary';

// Higher-order component for route-level error boundaries
const withErrorBoundary = (Component, fallback) => {
  return (props) => (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={<LoadingFallback message="Loading page..." height={400} />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Enhanced lazy loading with error boundaries for critical pages
const LazyAuth = {
  Login: withErrorBoundary(
    React.lazy(() => import('../pages/Auth/Login')),
    <div>Failed to load login page. Please refresh and try again.</div>
  ),
  Register: withErrorBoundary(
    React.lazy(() => import('../pages/Auth/Register')),
    <div>Failed to load registration page. Please refresh and try again.</div>
  ),
};

const LazyAdmin = {
  AdminRoute: withErrorBoundary(
    React.lazy(() => import('../pages/Admin/AdminRoute')),
    <div>Failed to load admin area. Please refresh and try again.</div>
  ),
  AdminLogin: withErrorBoundary(
    React.lazy(() => import('../pages/Admin/AdminLogin')),
    <div>Failed to load admin login. Please refresh and try again.</div>
  ),
  UserList: withErrorBoundary(
    React.lazy(() => import('../pages/Admin/UserList')),
    <div>Failed to load user management. Please refresh and try again.</div>
  ),
  CategoryList: withErrorBoundary(
    React.lazy(() => import('../pages/Admin/CategoryList')),
    <div>Failed to load category management. Please refresh and try again.</div>
  ),
  AdminSettings: withErrorBoundary(
    React.lazy(() => import('../pages/Admin/AdminSettings')),
    <div>Failed to load admin settings. Please refresh and try again.</div>
  ),
  AdminBannerCarousels: withErrorBoundary(
    React.lazy(() => import('../pages/Admin/BannerCarousels')),
    <div>Failed to load banner management. Please refresh and try again.</div>
  ),
  Pages: withErrorBoundary(
    React.lazy(() => import('../pages/Admin/Pages')),
    <div>Failed to load page management. Please refresh and try again.</div>
  ),
  AdminOffer: withErrorBoundary(
    React.lazy(() => import('../pages/Admin/AdminOffer')),
    <div>Failed to load offer management. Please refresh and try again.</div>
  ),
  UserEditPage: withErrorBoundary(
    React.lazy(() => import('../pages/Admin/Users')),
    <div>Failed to load user editor. Please refresh and try again.</div>
  ),
  VendorManagement: withErrorBoundary(
    React.lazy(() => import('../pages/Admin/VendorManagement')),
    <div>Failed to load vendor management. Please refresh and try again.</div>
  ),
  CurrencyManagement: withErrorBoundary(
    React.lazy(() => import('../pages/Admin/CurrencyManagement')),
    <div>Failed to load currency management. Please refresh and try again.</div>
  ),
};

const LazySeller = {
  SellerRoute: withErrorBoundary(
    React.lazy(() => import('../pages/Seller/SellerRoute')),
    <div>Failed to load seller area. Please refresh and try again.</div>
  ),
  SellerLogin: withErrorBoundary(
    React.lazy(() => import('../pages/Seller/SellerLogin')),
    <div>Failed to load seller login. Please refresh and try again.</div>
  ),
  SellerRegister: withErrorBoundary(
    React.lazy(() => import('../pages/Seller/SellerRegister')),
    <div>Failed to load seller registration. Please refresh and try again.</div>
  ),
  ProductList: withErrorBoundary(
    React.lazy(() => import('../pages/Seller/ProductList')),
    <div>Failed to load product list. Please refresh and try again.</div>
  ),
  AllProducts: withErrorBoundary(
    React.lazy(() => import('../pages/Seller/AllProducts')),
    <div>Failed to load all products. Please refresh and try again.</div>
  ),
  ProductUpdate: withErrorBoundary(
    React.lazy(() => import('../pages/Seller/ProductUpdate')),
    <div>Failed to load product editor. Please refresh and try again.</div>
  ),
  OrderList: withErrorBoundary(
    React.lazy(() => import('../pages/Seller/OrderList')),
    <div>Failed to load order management. Please refresh and try again.</div>
  ),
};

const LazyVendor = {
  VendorRoute: withErrorBoundary(
    React.lazy(() => import('../pages/Vendor/VendorRoute')),
    <div>Failed to load vendor area. Please refresh and try again.</div>
  ),
  VendorLogin: withErrorBoundary(
    React.lazy(() => import('../pages/Vendor/VendorLogin')),
    <div>Failed to load vendor login. Please refresh and try again.</div>
  ),
  VendorRegister: withErrorBoundary(
    React.lazy(() => import('../pages/Vendor/VendorRegister')),
    <div>Failed to load vendor registration. Please refresh and try again.</div>
  ),
  Brand: withErrorBoundary(
    React.lazy(() => import('../pages/Admin/Brand')),
    <div>Failed to load brand management. Please refresh and try again.</div>
  ),
};

const LazyUser = {
  Profile: withErrorBoundary(
    React.lazy(() => import('../pages/User/Profile')),
    <div>Failed to load user profile. Please refresh and try again.</div>
  ),
  UserOrder: withErrorBoundary(
    React.lazy(() => import('../pages/User/UserOrder')),
    <div>Failed to load order history. Please refresh and try again.</div>
  ),
};

const LazyOrders = {
  Shipping: withErrorBoundary(
    React.lazy(() => import('../pages/Orders/Shipping')),
    <div>Failed to load shipping page. Please refresh and try again.</div>
  ),
  PlaceOrder: withErrorBoundary(
    React.lazy(() => import('../pages/Orders/PlaceOrder')),
    <div>Failed to load order placement. Please refresh and try again.</div>
  ),
  Order: withErrorBoundary(
    React.lazy(() => import('../pages/Orders/Order')),
    <div>Failed to load order details. Please refresh and try again.</div>
  ),
  Address: withErrorBoundary(
    React.lazy(() => import('../pages/Orders/Address')),
    <div>Failed to load address management. Please refresh and try again.</div>
  ),
};

const LazyProducts = {
  Favorites: withErrorBoundary(
    React.lazy(() => import('../pages/Products/Favorites')),
    <div>Failed to load favorites. Please refresh and try again.</div>
  ),
  ProductDetails: withErrorBoundary(
    React.lazy(() => import('../pages/Products/ProductDetails')),
    <div>Failed to load product details. Please refresh and try again.</div>
  ),
};

// Renamed from LazyPages to LazyMiscPages to avoid duplicate declaration
const LazyMiscPages = {
  Cart: withErrorBoundary(
    React.lazy(() => import('../pages/Cart')),
    <div>Failed to load shopping cart. Please refresh and try again.</div>
  ),
  Shop: withErrorBoundary(
    React.lazy(() => import('../pages/Shop')),
    <div>Failed to load shop. Please refresh and try again.</div>
  ),
  Search: withErrorBoundary(
    React.lazy(() => import('../pages/Search')),
    <div>Failed to load search results. Please refresh and try again.</div>
  ),
  Categories: withErrorBoundary(
    React.lazy(() => import('../pages/categories')),
    <div>Failed to load categories. Please refresh and try again.</div>
  ),
  FlashSale: withErrorBoundary(
    React.lazy(() => import('../pages/Flash_Sales')),
    <div>Failed to load flash sale. Please refresh and try again.</div>
  ),
  Faq: withErrorBoundary(
    React.lazy(() => import('../pages/faq')),
    <div>Failed to load FAQ. Please refresh and try again.</div>
  ),
  LiveChat: withErrorBoundary(
    React.lazy(() => import('../pages/LiveChat')),
    <div>Failed to load live chat. Please refresh and try again.</div>
  ),
  Privacy: withErrorBoundary(
    React.lazy(() => import('../pages/privacy')),
    <div>Failed to load privacy policy. Please refresh and try again.</div>
  ),
  ContactUs: withErrorBoundary(
    React.lazy(() => import('../pages/contact_us')),
    <div>Failed to load contact page. Please refresh and try again.</div>
  ),
  ForgotPassword: withErrorBoundary(
    React.lazy(() => import('../pages/ForgotPassword')),
    <div>Failed to load password reset. Please refresh and try again.</div>
  ),
  RequestPassword: withErrorBoundary(
    React.lazy(() => import('../pages/request_password')),
    <div>Failed to load password request. Please refresh and try again.</div>
  ),
};

// Import non-lazy components for critical paths
import App from '../App';
import Home from '../pages/Home';
import PrivateRoute from '../components/PrivateRoute';

export {
  LazyAuth,
  LazyAdmin,
  LazySeller,
  LazyVendor,
  LazyUser,
  LazyOrders,
  LazyProducts,
  LazyMiscPages, // Export with the new name to avoid conflict
  UtilsLazyPages as LazyPages, // Export the utility LazyPages with its original name
  App,
  Home,
  PrivateRoute
};