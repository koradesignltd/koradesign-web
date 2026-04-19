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
          {images.map((img) => (
            <figure
              key={img.id}
              className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card"
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
    </div>
  );
}
