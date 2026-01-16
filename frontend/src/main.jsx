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

import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import RequestPassword from "./pages/request_password.jsx"
// Auth
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import SellerRoute from "./pages/Seller/SellerRoute";
import Profile from "./pages/User/Profile";
import UserList from "./pages/Admin/UserList";
import VendorRoute from "./pages/Vendor/VendorRoute.jsx";

import CategoryList from "./pages/Admin/CategoryList";

import ProductList from "./pages/Seller/ProductList";
import AllProducts from "./pages/Seller/AllProducts";
import ProductUpdate from "./pages/Seller/ProductUpdate";
import AddProduct from "./pages/Seller/AddProduct";

import Home from "./pages/Home.jsx";
import Favorites from "./pages/Products/Favorites.jsx";
import ProductDetails from "./pages/Products/ProductDetails.jsx";
import FlashSale from "./pages/Flash_Sales.jsx"
import Cart from "./pages/Cart.jsx";
import Categories from "./pages/categories.jsx"
import Shop from "./pages/Shop.jsx";
import Faq from "./pages/faq.jsx";
import LiveChat from "./pages/LiveChat.jsx";
import Shipping from "./pages/Orders/Shipping.jsx";
import PlaceOrder from "./pages/Orders/PlaceOrder.jsx";
import Order from "./pages/Orders/Order.jsx";
import OrderList from "./pages/Seller/OrderList.jsx";
import AdminOrderList from "./pages/Admin/OrderList.jsx";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Search from "./pages/Search.jsx"
import AdvancedSearch from "./pages/AdvancedSearch.jsx";
import UserOrder from "./pages/User/UserOrder.jsx";
import Address from "./pages/Orders/Address.jsx";
import AdminRegister from "./pages/Seller/SellerRegister.jsx";
import Privacy from "./pages/privacy.jsx";
import ContactUs from "./pages/contact_us.jsx";
import Brand from "./pages/Admin/Brand.jsx";
import SellerLogin from "./pages/Seller/SellerLogin.jsx";
import VendorLogin from "./pages/Vendor/VendorLogin.jsx";
import VendorRegister from "./pages/Vendor/VendorRegister.jsx";
// Vendor Dashboard
import SellerDashBoard from "./pages/Vendor/vendorDashboard.jsx";
// New pages
import Returns from "./pages/returns.jsx";
import TrackOrder from "./pages/trackOrder.jsx";
import SizeGuide from "./pages/sizeGuide.jsx";
import Deals from "./pages/deals.jsx";
import NewArrivals from "./pages/newArrivals.jsx";
import Brands from "./pages/brands.jsx";
import Blog from "./pages/blog.jsx";
// Additional pages
import Terms from "./pages/terms.jsx";
import ShippingPolicy from "./pages/shippingPolicy.jsx";
// 404 Page
import NotFound from "./pages/NotFound.jsx";
// Admin
import AdminRoute from "./pages/Admin/AdminRoute"
import AdminLogin from "./pages/Admin/AdminLogin"
import AdminSettings from "./pages/Admin/AdminSettings.jsx";
import AdminBannerCarousels from './pages/Admin/BannerCarousels.jsx'
import Pages from "./pages/Admin/Pages.jsx";
import AdminOffer from "./pages/Admin/AdminOffer.jsx";

import CurrencyManagement from "./pages/Admin/CurrencyManagement.jsx";
import BrandManagement from "./pages/Admin/Brand.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/seller/register" element={<AdminRegister />} />
      <Route path="/seller/login" element={<SellerLogin />} />
      <Route path="/vendor/login" element={<VendorLogin />} />
      <Route path="/vendor/register" element={<VendorRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route index={true} path="/" element={<Home />} />
      <Route path="/favorite" element={<Favorites />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path={"/shop"} element={<Shop />} />
      <Route path="/search/:keyword" element={<Search />} />
      <Route path="/search" element={<AdvancedSearch />} />
      <Route path="/address" element={<Address />} />
      <Route path="/shop/:id" element={<Shop />} />
      <Route path="/privacy-policy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/shipping-policy" element={<ShippingPolicy />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/Categories" element={<Categories />} />
      <Route path="/flash-sale" element={<FlashSale />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* New pages */}
      <Route path="/returns" element={<Returns />} />
      <Route path="/track-order" element={<TrackOrder />} />
      <Route path="/size-guide" element={<SizeGuide />} />
      <Route path="/deals" element={<Deals />} />
      <Route path="/new-arrivals" element={<NewArrivals />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/blog" element={<Blog />} />
      {/* Registered users */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/order/:id" element={<Order />} />
        <Route path="/orders" element={<UserOrder />} />
        <Route path="/support/chat" element={<LiveChat />} />
      </Route>
      {/** Registered Seller*/}
      <Route path="/seller" element={<SellerRoute />}>
        <Route path="allproductslist" element={<AllProducts />} />
        <Route path="productlist/:pageNumber" element={<ProductList />} />
        <Route path="product/update/:_id" element={<ProductUpdate />} />
        <Route path="product/add" element={<AddProduct />} />
        <Route path="orderlist" element={<OrderList />} />
      </Route>
      <Route path="/admin" element={<AdminRoute />}>
        <Route path="userlist" element={<UserList />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="banner" element={<AdminBannerCarousels />} />
        <Route path="brand" element={<BrandManagement />} />
        <Route path="pages" element={<Pages />} />
        <Route path="offer" element={<AdminOffer />} />
        <Route path="categorylist" element={<CategoryList />} />
        <Route path="currencies" element={<CurrencyManagement />} />
        <Route path="product/add" element={<AddProduct />} />
        <Route path="productlist" element={<AllProducts />} />
        <Route path="orderlist" element={<AdminOrderList />} />
      </Route>
      <Route path="/vendor" element={<VendorRoute />}>
        <Route path="dashboard" element={<SellerDashBoard />} />
        <Route path="brand" element={<Brand />} />
        <Route path="allproductslist" element={<AllProducts />} />
        <Route path="productlist/:pageNumber" element={<ProductList />} />
        <Route path="product/update/:_id" element={<ProductUpdate />} />
        <Route path="product/add" element={<AddProduct />} />
      </Route>
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PayPalScriptProvider>
        <RouterProvider router={router} />
      </PayPalScriptProvider>
    </ThemeProvider>
  </Provider>
);