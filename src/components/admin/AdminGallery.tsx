import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("id, image_url, caption, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setImages(data ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `gallery/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("gallery-images").upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("gallery-images").getPublicUrl(path);
        const { error: insErr } = await supabase
          .from("gallery_images")
          .insert({ image_url: data.publicUrl });
        if (insErr) throw insErr;
      }
      toast.success(`${files.length} photo(s) added`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function updateCaption(id: string, caption: string) {
    const { error } = await supabase.from("gallery_images").update({ caption }).eq("id", id);
    if (error) toast.error(error.message);
    else setImages((prev) => prev.map((i) => (i.id === id ? { ...i, caption } : i)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this photo?")) return;
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); await load(); }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{images.length} photo(s) in gallery.</p>
        <label className="inline-flex">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <Button asChild disabled={uploading}>
            <span className="cursor-pointer">
              {uploading ? <Upload className="mr-2 h-4 w-4 animate-pulse" /> : <Plus className="mr-2 h-4 w-4" />}
              {uploading ? "Uploading…" : "Add photos"}
            </span>
          </Button>
        </label>
      </div>

      {images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No photos yet. Click "Add photos" to upload.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-square overflow-hidden">
                <img src={img.image_url} alt={img.caption ?? ""} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2 p-3">
                <Input
                  defaultValue={img.caption ?? ""}
                  placeholder="Caption (optional)"
                  className="h-8 text-xs"
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val !== (img.caption ?? "")) void updateCaption(img.id, val);
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => void remove(img.id)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
