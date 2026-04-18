import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "New Products — Kora Design" },
      { name: "description", content: "Our newest laser-cut designs, freshly released." },
      { property: "og:title", content: "New Products — Kora Design" },
      { property: "og:description", content: "Our newest laser-cut designs, freshly released." },
    ],
  }),
  component: NewPage,
});

function NewPage() {
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
