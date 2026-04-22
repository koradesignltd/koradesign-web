import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminGallery } from "@/components/admin/AdminGallery";
import { AdminCoupons } from "@/components/admin/AdminCoupons";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) return <div className="container-page py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user || !isAdmin) return null;

  return (
    <div className="container-page py-12">
      <Helmet><title>Admin — Kora Design</title></Helmet>
      <div className="mb-8">
        <div className="accent-line mb-3" />
        <h1 className="font-display text-3xl font-bold md:text-4xl">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage products, gallery photos and coupons.
        </p>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>
        <TabsContent value="products"><AdminProducts /></TabsContent>
        <TabsContent value="gallery"><AdminGallery /></TabsContent>
        <TabsContent value="coupons"><AdminCoupons /></TabsContent>
      </Tabs>
    </div>
  );
}
