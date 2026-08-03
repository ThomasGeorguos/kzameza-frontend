import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CategoryProducts from "./pages/CategoryProducts";
import Products from "./pages/Products";
import AdminLayout from "./components/admin/AdminLayout";
import AddProduct from "./components/admin/AddProduct";
import Allproducts from "./components/admin/Allproducts";
import AdminOrders from "./components/admin/AdminOrders";
import Customers from "./components/admin/Customers";
import Categories from "./components/admin/Categories";
import HeroSlides from "./components/admin/HeroSlides";
import Messages from "./components/admin/Messages";
import ProtectedRoute from "./components/ProtectedRoute";
import { Analytics } from "./components/admin/Analytics";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import UserSettings from "./pages/UserSettings";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import ProductDetails from "./pages/ProductDetails";
import { useAuth } from "./auth/UseAuth";
import GuestRoute from "./components/GuestRoute";
import NotFound from "./pages/NotFound";

function AdminRoute({ children }) {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user || role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith("/admin");

  return (
    <>
      {!hideHeader && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <UserSettings />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/category/:categoryId" element={<CategoryProducts />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Analytics />} />
          <Route path="products" element={<Allproducts />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="categories" element={<Categories />} />
          <Route path="hero-slides" element={<HeroSlides />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!hideHeader && <Footer />}
    </>
  );
}

export default App;
