import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(q ?? "");

  useEffect(() => { setQuery(q ?? ""); }, [q]);

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

  const allCategories = useMemo(() => {
    const set = new Set<string>(CATEGORIES);
    products.forEach((p) => {
      set.add(p.category);
      const cats = (p as Product & { categories?: string[] }).categories;
      cats?.forEach((c) => set.add(c));
    });
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (category) list = list.filter((p) => {
      const cats = (p as Product & { categories?: string[] }).categories ?? [];
      return p.category === category || cats.includes(category);
    });
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          (p.description ?? "").toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle),
      );
    }
    return list;
  }, [products, category, query]);

  return (
    <div className="container-page py-12 md:py-16">
      <Helmet>
        <title>Shop — Kora Design</title>
        <meta name="description" content="Browse all laser-cut wall art, signages, gifts and crafts from Kora Design." />
        <meta property="og:title" content="Shop — Kora Design" />
        <meta property="og:description" content="Browse all laser-cut wall art, signages, gifts and crafts." />
      </Helmet>
      <div className="mb-8">
        <div className="accent-line mb-3" />
        <h1 className="font-display text-4xl font-bold md:text-5xl">Shop</h1>
        <p className="mt-2 text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
          {category ? ` in ${category}` : ""}
          {query ? ` matching "${query}"` : ""}
        </p>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products by name, description or category…"
          className="pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        )}
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
        {allCategories.map((c) => (
          <Link
            key={c}
            to={`/shop?category=${encodeURIComponent(c)}`}
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
        <p className="py-20 text-center text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
