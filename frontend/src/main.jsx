import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";

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
// Admin
import AdminRoute from "./pages/Admin/AdminRoute"
import AdminLogin from "./pages/Admin/AdminLogin"
import AdminSettings from "./pages/Admin/AdminSettings.jsx";
import AdminBannerCarousels from './pages/Admin/BannerCarousels.jsx'
import Pages from "./pages/Admin/Pages.jsx";
import AdminOffer from "./pages/Admin/AdminOffer.jsx";
import UserEditPage from "./pages/Admin/Users.jsx";
import { LazyAdmin } from "./router/optimizedRoutes.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/seller/register" element={<AdminRegister />} />
      <Route path="/seller/login" element={<SellerLogin/>} />
      <Route path="/vendor/login" element={<VendorLogin/>} />
      <Route path="/vendor/register" element={<VendorRegister />} />
      <Route path="/admin/login" element={<AdminLogin/>} />
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
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/faq" element={<Faq/>} />
      <Route path="/Categories" element={<Categories/>}/>
      <Route path="/flash-sale" element={<FlashSale/>}/>
      <Route path="/forgot-password" element={<ForgotPassword/>}/>
      <Route path="/passwordReset" element={<RequestPassword/>}/>
      
      {/* Registered users */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/order/:id" element={<Order />} />
        <Route path="/orders" element={<UserOrder/>}/>
        <Route path="/support/chat" element={<LiveChat/>}/>
      </Route>
      {/** Registered Seller*/}
      <Route path="/seller" element={<SellerRoute />}>
        <Route path="productlist" element={<ProductList />} />
        <Route path="allproductslist" element={<AllProducts />} />
        <Route path="productlist/:pageNumber" element={<ProductList />} />
        <Route path="product/update/:_id" element={<ProductUpdate />} />
        <Route path="orderlist" element={<OrderList />} />
      </Route>
      <Route path="/admin" element={<AdminRoute/>}>
          <Route path="userlist" element={<UserList />} />
          <Route path="settings" element={<AdminSettings/>}/>
          <Route path="banner" element={<AdminBannerCarousels/>}/>
          <Route path="pages" element={<Pages/>}/>
          <Route path="offer" element={<AdminOffer/>}/>
          <Route path="categorylist" element={<CategoryList />} />
          <Route path="user/edit/:id" element={<UserEditPage />} />
          <Route path="vendors" element={<LazyAdmin.VendorManagement />} />
      </Route>
      <Route path="/vendor" element={<VendorRoute />}>
        <Route path="brand" element={<Brand />} />
        <Route path="productlist" element={<ProductList />} />
        <Route path="allproductslist" element={<AllProducts />} />
        <Route path="productlist/:pageNumber" element={<ProductList />} />
        <Route path="product/update/:_id" element={<ProductUpdate />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PayPalScriptProvider>
      <RouterProvider router={router} />
    </PayPalScriptProvider>
  </Provider>
);
