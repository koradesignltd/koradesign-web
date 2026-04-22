import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "@/components/ui/sonner";

import HomePage from "@/pages/Home";
import ShopPage from "@/pages/Shop";
import NewPage from "@/pages/New";
import GalleryPage from "@/pages/Gallery";
import AboutPage from "@/pages/About";
import LoginPage from "@/pages/Login";
import AdminPage from "@/pages/Admin";
import ProductPage from "@/pages/Product";
import NotFoundPage from "@/pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/new" element={<NewPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <SiteFooter />
        </div>
        <CartDrawer />
        <Toaster />
      </CartProvider>
    </AuthProvider>
  );
}
