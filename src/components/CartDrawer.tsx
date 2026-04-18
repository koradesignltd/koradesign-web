import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, MessageCircle } from "lucide-react";
import { buildCartMessage, buildWhatsAppUrl, useCart } from "@/lib/cart";
import { formatFRW, WHATSAPP_NUMBER } from "@/lib/format";
import { Link } from "@tanstack/react-router";

export function CartDrawer() {
  const { items, isOpen, setOpen, total, setQuantity, remove, clear } = useCart();

  function checkout() {
    if (items.length === 0) return;
    const url = buildWhatsAppUrl(WHATSAPP_NUMBER, buildCartMessage(items));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-display">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild variant="outline" onClick={() => setOpen(false)}>
              <Link to="/shop">Browse the shop</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-xl border border-border p-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    width={72}
                    height={72}
                    loading="lazy"
                    className="h-18 w-18 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                      <button
                        onClick={() => remove(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{formatFRW(item.price_frw)}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-accent rounded-l-full"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-accent rounded-r-full"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatFRW(item.price_frw * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border bg-card px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-semibold">{formatFRW(total)}</span>
              </div>
              <Button onClick={checkout} className="w-full" size="lg">
                <MessageCircle className="mr-2 h-4 w-4" />
                Checkout via WhatsApp
              </Button>
              <button
                onClick={clear}
                className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
