import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";

// Auth
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import VendorRoute from "./pages/Vendor/VendorRoute";
import Profile from "./pages/User/Profile";
import UserList from "./pages/Vendor/UserList";

import CategoryList from "./pages/Vendor/CategoryList";

import ProductList from "./pages/Vendor/ProductList";
import AllProducts from "./pages/Vendor/AllProducts";
import ProductUpdate from "./pages/Vendor/ProductUpdate";

import Home from "./pages/Home.jsx";
import Favorites from "./pages/Products/Favorites.jsx";
import ProductDetails from "./pages/Products/ProductDetails.jsx";

import Cart from "./pages/Cart.jsx";
import Shop from "./pages/Shop.jsx";

import Shipping from "./pages/Orders/Shipping.jsx";
import PlaceOrder from "./pages/Orders/PlaceOrder.jsx";
import Order from "./pages/Orders/Order.jsx";
import OrderList from "./pages/Vendor/OrderList.jsx";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import AdminDashboard from "./pages/Vendor/vendorDashboard.jsx";
import Search from "./pages/Search.jsx"
import UserOrder from "./pages/User/UserOrder.jsx";
import Address from "./pages/Orders/Address.jsx";
import AdminRegister from "./pages/Vendor/vendorRegister.jsx";
import Privacy from "./pages/privacy.jsx";
import ContactUs from "./pages/contact_us.jsx";
import Brand from "./pages/Vendor/Brand.jsx";
import VendorLogin from "./pages/Vendor/vendorLogin"

// Admin
import AdminRoute from "./pages/Admin/AdminRoute"
import AdminLogin from "./pages/Admin/AdminLogin"
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/vendor/register" element={<AdminRegister />} />
      <Route path="/vendor/login" element={<VendorLogin/>} />
      <Route path="/admin/login" element={<AdminLogin/>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route index={true} path="/" element={<Home />} />
      <Route path="/favorite" element={<Favorites />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path={"/shop"} element={<Shop />} />
      <Route path="/search/:keyword" element={<Search />} />
      <Route path="/address" element={<Address />} />
      <Route path="/shop/:id" element={<Shop />} />
      <Route path="/privacy-policy" element={<Privacy />} />
      <Route path="/contact" element={<ContactUs />} />
      
      {/* Registered users */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/order/:id" element={<Order />} />
        <Route path="/orders" element={<UserOrder/>}/>
      </Route>
      {/** Registered vendor*/}
      <Route path="/vendor" element={<VendorRoute />}>
        <Route path="userlist" element={<UserList />} />
        <Route path="categorylist" element={<CategoryList />} />
        <Route path="brand" element={<Brand/>} />
        <Route path="productlist" element={<ProductList />} />
        <Route path="allproductslist" element={<AllProducts />} />
        <Route path="productlist/:pageNumber" element={<ProductList />} />
        <Route path="product/update/:_id" element={<ProductUpdate />} />
        <Route path="orderlist" element={<OrderList />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>
      <Route path="/admin" element={<AdminRoute/>}>



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
