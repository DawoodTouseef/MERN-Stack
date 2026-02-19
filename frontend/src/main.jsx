import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Loader from "./components/Loader";

// Error & Fallback
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./pages/NotFound.jsx";

// Auth
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const RequestPassword = lazy(() => import("./pages/request_password.jsx"));

// Customer Pages
const Home = lazy(() => import("./pages/Home.jsx"));
const Shop = lazy(() => import("./pages/Shop.jsx"));
const ProductDetails = lazy(() => import("./pages/Products/ProductDetails.jsx"));
const Favorites = lazy(() => import("./pages/Products/Favorites.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const Categories = lazy(() => import("./pages/categories.jsx"));
const FlashSale = lazy(() => import("./pages/Flash_Sales.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const Profile = lazy(() => import("./pages/User/Profile"));
const UserOrder = lazy(() => import("./pages/User/UserOrder.jsx"));

// Checkout & Orders
const Shipping = lazy(() => import("./pages/Orders/Shipping.jsx"));
const PlaceOrder = lazy(() => import("./pages/Orders/PlaceOrder.jsx"));
const Order = lazy(() => import("./pages/Orders/Order.jsx"));
const Address = lazy(() => import("./pages/Orders/Address.jsx"));
const CustomerOrders = lazy(() => import("./pages/Orders/CustomerOrders.jsx"));
const Returns = lazy(() => import("./pages/returns.jsx"));
const TrackOrder = lazy(() => import("./pages/trackOrder.jsx"));

// Information Pages
const ContactUs = lazy(() => import("./pages/contact_us.jsx"));
const Faq = lazy(() => import("./pages/faq.jsx"));
const Privacy = lazy(() => import("./pages/privacy.jsx"));
const Terms = lazy(() => import("./pages/terms.jsx"));
const ShippingPolicy = lazy(() => import("./pages/shippingPolicy.jsx"));
const SizeGuide = lazy(() => import("./pages/sizeGuide.jsx"));
const Blog = lazy(() => import("./pages/blog.jsx"));
const Deals = lazy(() => import("./pages/deals.jsx"));
const NewArrivals = lazy(() => import("./pages/newArrivals.jsx"));
const Brands = lazy(() => import("./pages/brands.jsx"));
const LiveChat = lazy(() => import("./pages/LiveChat.jsx"));

// Seller / Vendor Portal
const SellerRoute = lazy(() => import("./pages/Seller/SellerRoute"));
const SellerLogin = lazy(() => import("./pages/Seller/SellerLogin.jsx"));
const SellerRegister = lazy(() => import("./pages/Seller/SellerRegister.jsx")); // Also used as AdminRegister
const VendorRoute = lazy(() => import("./pages/Vendor/VendorRoute.jsx"));
const VendorLogin = lazy(() => import("./pages/Vendor/VendorLogin.jsx"));
const VendorRegister = lazy(() => import("./pages/Vendor/VendorRegister.jsx"));
const SellerDashBoard = lazy(() => import("./pages/Vendor/vendorDashboard.jsx"));
const CreateOrganization = lazy(() => import("./pages/Vendor/CreateOrganization.jsx"));
const VerificationPending = lazy(() => import("./pages/Vendor/VerificationPending.jsx"));
const VerificationGuard = lazy(() => import("./pages/Vendor/VerificationGuard.jsx"));

// Seller / Vendor Management
const ProductList = lazy(() => import("./pages/Seller/ProductList"));
const AllProducts = lazy(() => import("./pages/Seller/AllProducts"));
const ProductUpdate = lazy(() => import("./pages/Seller/ProductUpdate"));
const AddProduct = lazy(() => import("./pages/Seller/AddProduct"));
const VendorProductDetails = lazy(() => import("./pages/Seller/VendorProductDetails"));
const VendorOrders = lazy(() => import("./pages/Orders/VendorOrders.jsx"));

// Admin Portal
const AdminRoute = lazy(() => import("./pages/Admin/AdminRoute"));
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard.jsx"));
const AdminAnalytics = lazy(() => import("./pages/Admin/AdminAnalytics.jsx"));
const AdminSettings = lazy(() => import("./pages/Admin/AdminSettings.jsx"));
const AdminBannerCarousels = lazy(() => import("./pages/Admin/BannerCarousels.jsx"));
const AdminOrderList = lazy(() => import("./pages/Admin/OrderList.jsx"));
const AdminProductUpdate = lazy(() => import("./pages/Admin/AdminProductUpdate"));
const AdminOrders = lazy(() => import("./pages/Orders/AdminOrders.jsx"));
const UserList = lazy(() => import("./pages/Admin/UserList"));
const CategoryList = lazy(() => import("./pages/Admin/CategoryList"));
const BrandManagement = lazy(() => import("./pages/Admin/Brand.jsx")); // Brand Management
const CurrencyManagement = lazy(() => import("./pages/Admin/CurrencyManagement.jsx"));
const Pages = lazy(() => import("./pages/Admin/Pages.jsx"));
const AdminOffer = lazy(() => import("./pages/Admin/AdminOffer.jsx"));
const Tax = lazy(() => import("./pages/Admin/Tax.jsx"));
const AdminDynamicPricing = lazy(() => import("./pages/Admin/AdminDynamicPricing.jsx"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Auth Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Role-Specific Auth Public */}
      <Route path="/seller/login" element={<SellerLogin />} />
      <Route path="/seller/register" element={<SellerRegister />} />
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route path="/vendor/register" element={<VendorRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Main Pages */}
      <Route index={true} path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/:id" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/favorite" element={<Favorites />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/flash-sale" element={<FlashSale />} />
      <Route path="/search/:keyword" element={<Search />} />
      {/* Information Pages */}
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/privacy-policy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/shipping-policy" element={<ShippingPolicy />} />
      <Route path="/returns" element={<Returns />} />
      <Route path="/track-order" element={<TrackOrder />} />
      <Route path="/size-guide" element={<SizeGuide />} />
      <Route path="/deals" element={<Deals />} />
      <Route path="/new-arrivals" element={<NewArrivals />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/blog" element={<Blog />} />

      {/* Private Customer Routes */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/address" element={<Address />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/order/:id" element={<Order />} />
        <Route path="/user/orders" element={<UserOrder />} />
        <Route path="/orders" element={<CustomerOrders />} />
        <Route path="/support/chat" element={<LiveChat />} />
      </Route>

      {/* Seller Portal */}
      <Route path="/seller" element={<SellerRoute />}>
        <Route path="allproductslist" element={<AllProducts />} />
        <Route path="productlist/:pageNumber" element={<ProductList />} />
        <Route path="product/update/:_id" element={<ProductUpdate />} />
        <Route path="product/add" element={<AddProduct />} />
        <Route path="product/details/:id" element={<VendorProductDetails />} />
        <Route path="orders" element={<VendorOrders />} />
      </Route>

      {/* Vendor Portal */}
      <Route path="/vendor" element={<VendorRoute />}>
        <Route path="create-organization" element={<CreateOrganization />} />
        <Route path="verification-pending" element={<VerificationPending />} />
        <Route element={<VerificationGuard />}>
          <Route path="dashboard" element={<SellerDashBoard />} />
          <Route path="brand" element={<BrandManagement />} />
          <Route path="allproductslist" element={<AllProducts />} />
          <Route path="productlist/:pageNumber" element={<ProductList />} />
          <Route path="product/update/:_id" element={<ProductUpdate />} />
          <Route path="product/add" element={<AddProduct />} />
          <Route path="product/details/:id" element={<VendorProductDetails />} />
          <Route path="orders" element={<VendorOrders />} />
        </Route>
      </Route>

      {/* Admin Portal */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="banner" element={<AdminBannerCarousels />} />
        <Route path="userlist" element={<UserList />} />
        <Route path="categorylist" element={<CategoryList />} />
        <Route path="brand" element={<BrandManagement />} />
        <Route path="currencies" element={<CurrencyManagement />} />
        <Route path="pages" element={<Pages />} />
        <Route path="offer" element={<AdminOffer />} />
        <Route path="orderlist" element={<AdminOrderList />} />
        <Route path="productlist" element={<AllProducts />} />
        <Route path="product/add" element={<AddProduct />} />
        <Route path="product/details/:id" element={<VendorProductDetails />} />
        <Route path="product/update/:_id" element={<AdminProductUpdate />} />
        <Route path="tax" element={<Tax />} />
        <Route path="dynamic-pricing" element={<AdminDynamicPricing />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PayPalScriptProvider>
        <Suspense fallback={<Loader />}>
          <RouterProvider router={router} />
        </Suspense>
      </PayPalScriptProvider>
    </ThemeProvider>
  </Provider>
);
