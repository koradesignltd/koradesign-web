import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatFRW } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export function ProductCard({ product }: { product: Product }) {
  const { add, setOpen } = useCart();

  function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add({
      id: product.id,
      name: product.name,
      price_frw: product.price_frw,
      image_url: product.image_url,
    });
    setOpen(true);
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="card-elegant group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.is_new && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow">
            New
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.category}
        </p>
        <h3 className="line-clamp-2 font-display text-base font-semibold">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="font-semibold text-foreground">{formatFRW(product.price_frw)}</p>
          <Button size="sm" variant="secondary" onClick={addToCart} aria-label="Add to cart">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
