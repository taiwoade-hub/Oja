import { Route, Routes } from "react-router";
import { Toaster } from "sonner";
import { StoreLayout } from "@/components/store/StoreLayout";
import HomePage from "@/pages/store/HomePage";
import ExplorePage from "@/pages/store/ExplorePage";
import ProductPage from "@/pages/store/ProductPage";
import WishlistPage from "@/pages/store/WishlistPage";
import CartPage from "@/pages/store/CartPage";
import CheckoutPage from "@/pages/store/CheckoutPage";
import OrdersPage from "@/pages/store/OrdersPage";
import AccountPage from "@/pages/store/AccountPage";
import AdminPage from "@/pages/admin/AdminPage";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

export default function App() {
  return <>
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>
      <Route path="/admin/:section?" element={<AdminPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login initialTab="signup" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Toaster position="top-center" closeButton toastOptions={{ className: "oja-toast" }} />
  </>;
}
