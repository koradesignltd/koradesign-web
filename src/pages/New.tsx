import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function NewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("is_new", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container-page py-12 md:py-16">
      <Helmet>
        <title>New Products — Kora Design</title>
        <meta name="description" content="Our newest laser-cut designs, freshly released." />
        <meta property="og:title" content="New Products — Kora Design" />
        <meta property="og:description" content="Our newest laser-cut designs, freshly released." />
      </Helmet>
      <div className="mb-10">
        <div className="accent-line mb-3" />
        <h1 className="font-display text-4xl font-bold md:text-5xl">New Products</h1>
        <p className="mt-2 text-muted-foreground">Fresh designs, just released.</p>
      </div>
      {loading ? (
        <p className="py-20 text-center text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No new products yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
