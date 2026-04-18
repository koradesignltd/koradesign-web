import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ShopSearch {
  category?: string;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search): ShopSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — Kora Design" },
      { name: "description", content: "Browse all laser-cut wall art, signages, gifts and crafts from Kora Design." },
      { property: "og:title", content: "Shop — Kora Design" },
      { property: "og:description", content: "Browse all laser-cut wall art, signages, gifts and crafts." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { category } = Route.useSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = category ? products.filter((p) => p.category === category) : products;

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mb-8">
        <div className="accent-line mb-3" />
        <h1 className="font-display text-4xl font-bold md:text-5xl">Shop</h1>
        <p className="mt-2 text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
          {category ? ` in ${category}` : ""}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          to="/shop"
          className={cn(
            "rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:bg-accent",
            !category && "bg-foreground text-background border-foreground hover:bg-foreground",
          )}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            to="/shop"
            search={{ category: c }}
            className={cn(
              "rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:bg-accent",
              category === c && "bg-foreground text-background border-foreground hover:bg-foreground",
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      {loading ? (
        <p className="py-20 text-center text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
