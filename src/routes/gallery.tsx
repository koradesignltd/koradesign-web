import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
}

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Kora Design" },
      { name: "description", content: "A look inside Kora Design — laser-cut craftsmanship, finished pieces and behind the scenes." },
      { property: "og:title", content: "Gallery — Kora Design" },
      { property: "og:description", content: "A look inside Kora Design — laser-cut craftsmanship and finished pieces." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    void supabase
      .from("gallery_images")
      .select("id, image_url, caption")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setImages(data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setActiveIndex((i) => (i === null ? i : (i + 1) % images.length));
      else if (e.key === "ArrowLeft") setActiveIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, images.length]);

  const active = activeIndex !== null ? images[activeIndex] : null;

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mb-10">
        <div className="accent-line mb-3" />
        <h1 className="font-display text-4xl font-bold md:text-5xl">Gallery</h1>
        <p className="mt-2 text-muted-foreground">A look inside the Kora Design workshop and finished pieces.</p>
      </div>

      {loading ? (
        <p className="py-20 text-center text-muted-foreground">Loading…</p>
      ) : images.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No photos yet — check back soon.</p>
      ) : (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [column-fill:_balance]">
          {images.map((img, idx) => (
            <figure
              key={img.id}
              className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card cursor-zoom-in"
              onClick={() => setActiveIndex(idx)}
            >
              <img
                src={img.image_url}
                alt={img.caption ?? "Kora Design gallery photo"}
                loading="lazy"
                className="h-auto w-full transition-transform duration-300 hover:scale-[1.02]"
              />
              {img.caption && (
                <figcaption className="px-3 py-2 text-xs text-muted-foreground">{img.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      <Dialog open={activeIndex !== null} onOpenChange={(open) => !open && setActiveIndex(null)}>
        <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none sm:rounded-none">
          <DialogTitle className="sr-only">{active?.caption ?? "Gallery image"}</DialogTitle>
          {active && (
            <div className="relative flex flex-col items-center">
              <img
                src={active.image_url}
                alt={active.caption ?? "Kora Design gallery photo"}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
              />
              {active.caption && (
                <p className="mt-3 text-center text-sm text-white/90">{active.caption}</p>
              )}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i === null ? i : (i + 1) % images.length)); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
