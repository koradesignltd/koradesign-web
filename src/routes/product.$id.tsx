import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatFRW, WHATSAPP_NUMBER } from "@/lib/format";
import { buildSingleProductMessage, buildWhatsAppUrl, useCart } from "@/lib/cart";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Product not found</h1>
      <Button asChild className="mt-6"><Link to="/shop">Back to shop</Link></Button>
    </div>
  ),
});

function ProductPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { add, setOpen } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    void supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data);
        if (data) setActiveImage(data.image_url);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="container-page py-24 text-center text-muted-foreground">Loading…</div>;
  }
  if (!product) {
    throw notFound();
  }

  const extraImages = (product as Product & { image_urls?: string[] }).image_urls ?? [];
  const allImages = [product.image_url, ...extraImages.filter((u) => u && u !== product.image_url)];

  function buyNow() {
    if (!product) return;
    const url = buildWhatsAppUrl(WHATSAPP_NUMBER, buildSingleProductMessage(product));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function addToCart() {
    if (!product) return;
    add({
      id: product.id,
      name: product.name,
      price_frw: product.price_frw,
      image_url: product.image_url,
    });
    setOpen(true);
  }

  return (
    <div className="container-page py-10 md:py-16">
      <button
        onClick={() => router.history.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-muted">
          <img
            src={product.image_url}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            {product.category}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold">{formatFRW(product.price_frw)}</p>
          {product.description && (
            <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>
          )}
          <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
            <Button onClick={buyNow} size="lg" className="flex-1">
              <MessageCircle className="mr-2 h-4 w-4" />
              Buy via WhatsApp
            </Button>
            <Button onClick={addToCart} size="lg" variant="outline" className="flex-1">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
