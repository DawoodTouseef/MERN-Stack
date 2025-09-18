import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Import optimized route components
import {
  LazyAuth,
  LazyAdmin,
  LazySeller,
  LazyVendor,
  LazyUser,
  LazyOrders,
  LazyProducts,
  LazyMiscPages, // Use the new name instead of LazyPages
  App,
  Home,
  PrivateRoute
} from "./router/optimizedRoutes";

// Create optimized router with lazy loading
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Authentication Routes - Critical paths loaded immediately */}
      <Route path="/login" element={<LazyAuth.Login />} />
      <Route path="/register" element={<LazyAuth.Register />} />
      
      {/* Home page - Critical path loaded immediately */}
      <Route index={true} path="/" element={<Home />} />
      
      {/* Admin Routes - Lazy loaded */}
      <Route path="/admin/login" element={<LazyAdmin.AdminLogin />} />
      <Route path="/admin" element={<LazyAdmin.AdminRoute />}>
        <Route path="userlist" element={<LazyAdmin.UserList />} />
        <Route path="settings" element={<LazyAdmin.AdminSettings />} />
        <Route path="banner" element={<LazyAdmin.AdminBannerCarousels />} />
        <Route path="pages" element={<LazyAdmin.Pages />} />
        <Route path="offer" element={<LazyAdmin.AdminOffer />} />
        <Route path="categorylist" element={<LazyAdmin.CategoryList />} />
        <Route path="user/edit/:id" element={<LazyAdmin.UserEditPage />} />
        <Route path="vendors" element={<LazyAdmin.VendorManagement />} />
      </Route>
      
      {/* Seller Routes - Lazy loaded */}
      <Route path="/seller/register" element={<LazySeller.SellerRegister />} />
      <Route path="/seller/login" element={<LazySeller.SellerLogin />} />
      <Route path="/seller" element={<LazySeller.SellerRoute />}>
        <Route path="productlist" element={<LazySeller.ProductList />} />
        <Route path="allproductslist" element={<LazySeller.AllProducts />} />
        <Route path="productlist/:pageNumber" element={<LazySeller.ProductList />} />
        <Route path="product/update/:_id" element={<LazySeller.ProductUpdate />} />
        <Route path="orderlist" element={<LazySeller.OrderList />} />
      </Route>
      
      {/* Vendor Routes - Lazy loaded */}
      <Route path="/vendor/login" element={<LazyVendor.VendorLogin />} />
      <Route path="/vendor/register" element={<LazyVendor.VendorRegister />} />
      <Route path="/vendor" element={<LazyVendor.VendorRoute />}>
        <Route path="brand" element={<LazyVendor.Brand />} />
        <Route path="productlist" element={<LazySeller.ProductList />} />
        <Route path="allproductslist" element={<LazySeller.AllProducts />} />
        <Route path="productlist/:pageNumber" element={<LazySeller.ProductList />} />
        <Route path="product/update/:_id" element={<LazySeller.ProductUpdate />} />
      </Route>
      
      {/* Product Routes - Lazy loaded */}
      <Route path="/favorite" element={<LazyProducts.Favorites />} />
      <Route path="/product/:id" element={<LazyProducts.ProductDetails />} />
      
      {/* Shopping Routes - Lazy loaded */}
      <Route path="/cart" element={<LazyMiscPages.Cart />} />
      <Route path="/shop" element={<LazyMiscPages.Shop />} />
      <Route path="/shop/:id" element={<LazyMiscPages.Shop />} />
      <Route path="/search/:keyword" element={<LazyMiscPages.Search />} />
      <Route path="/Categories" element={<LazyMiscPages.Categories />} />
      <Route path="/flash-sale" element={<LazyMiscPages.FlashSale />} />
      
      {/* Utility Routes - Lazy loaded */}
      <Route path="/address" element={<LazyOrders.Address />} />
      <Route path="/privacy-policy" element={<LazyMiscPages.Privacy />} />
      <Route path="/contact" element={<LazyMiscPages.ContactUs />} />
      <Route path="/faq" element={<LazyMiscPages.Faq />} />
      <Route path="/forgot-password" element={<LazyMiscPages.ForgotPassword />} />
      <Route path="/passwordReset" element={<LazyMiscPages.RequestPassword />} />
      
      {/* Protected User Routes - Lazy loaded with private route wrapper */}
      <Route path="" element={<PrivateRoute />}>
        <Route path="/profile" element={<LazyUser.Profile />} />
        <Route path="/orders" element={<LazyUser.UserOrder />} />
        <Route path="/shipping" element={<LazyOrders.Shipping />} />
        <Route path="/placeorder" element={<LazyOrders.PlaceOrder />} />
        <Route path="/order/:id" element={<LazyOrders.Order />} />
        <Route path="/support/chat" element={<LazyMiscPages.LiveChat />} />
      </Route>
    </Route>
  )
);

// Enhanced root render with performance optimizations
ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PayPalScriptProvider
      options={{
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
        currency: "USD",
        intent: "capture"
      }}
      deferLoading={true} // Defer PayPal loading until needed
    >
      <RouterProvider router={router} />
    </PayPalScriptProvider>
  </Provider>
);