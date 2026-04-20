import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/format";
import heroFallback from "@/assets/hero-workshop.jpg";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kora Design — Precision Laser-cut Wall Art" },
      {
        name: "description",
        content:
          "Discover our collection of precision laser-cut wall art designed for modern spaces. Shop wall art, signages, gifts and more from Kora Design.",
      },
      { property: "og:title", content: "Kora Design — Precision Laser-cut Wall Art" },
      {
        property: "og:description",
        content:
          "Discover our collection of precision laser-cut wall art designed for modern spaces.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [bgIndex, setBgIndex] = useState(0);
  const [query, setQuery] = useState("");

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

    void supabase
      .from("gallery_images")
      .select("image_url")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setGalleryUrls((data ?? []).map((g) => g.image_url));
      });
  }, []);

  // Cycle the hero background through gallery images
  useEffect(() => {
    if (galleryUrls.length <= 1) return;
    const id = setInterval(() => {
      setBgIndex((i) => (i + 1) % galleryUrls.length);
    }, 5000);
    return () => clearInterval(id);
  }, [galleryUrls.length]);

  const newOnes = products.filter((p) => p.is_new).slice(0, 4);
  const heroImages = galleryUrls.length > 0 ? galleryUrls : [heroFallback];

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => {
      const cats = (p as Product & { categories?: string[] }).categories ?? [];
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        cats.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [products, query]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                i === bgIndex % heroImages.length ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/75 to-background" />
        </div>
        <div className="container-page relative py-24 md:py-36">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Crafted in Rwanda
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Precision <span className="gradient-text">laser-cut</span> wall art
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Discover our collection of laser-cut wall art designed for modern spaces.
              Black or white, always minimal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/shop">
                  Shop Collection <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/gallery">View Gallery</Link>
              </Button>
            </div>
            <div className="mt-8 relative max-w-lg">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="h-11 pl-9 pr-9 bg-card/80 backdrop-blur"
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
          </div>
        </div>
      </section>

      {query.trim() && (
        <section className="container-page py-12">
          <div className="mb-6">
            <div className="accent-line mb-3" />
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Search results for "{query}"
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchResults.length} {searchResults.length === 1 ? "product" : "products"}
            </p>
          </div>
          {searchResults.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No products match your search.</p>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {searchResults.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      )}

      {/* NEW PRODUCTS */}
      {newOnes.length > 0 && (
        <section className="container-page py-16 md:py-24">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <div className="accent-line mb-3" />
              <h2 className="font-display text-3xl font-bold md:text-4xl">New Products</h2>
              <p className="mt-2 text-muted-foreground">Fresh designs, just released.</p>
            </div>
            <Link to="/new" className="hidden text-sm font-medium text-primary hover:underline md:block">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {newOnes.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      {CATEGORIES.map((cat) => {
        const list = products.filter((p) => p.category === cat).slice(0, 4);
        if (list.length === 0) return null;
        return (
          <section key={cat} className="container-page py-12 md:py-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <div className="accent-line mb-3" />
                <h2 className="font-display text-2xl font-bold md:text-3xl">{cat}</h2>
              </div>
              <Link
                to="/shop"
                search={{ category: cat }}
                className="text-sm font-medium text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {list.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        );
      })}

      {!loading && products.length === 0 && (
        <div className="container-page py-20 text-center text-muted-foreground">
          Our catalog is being prepared. Check back soon.
        </div>
      )}
      {loading && (
        <div className="container-page py-20 text-center text-muted-foreground">
          Loading products…
        </div>
      )}
    </div>
  );
}
