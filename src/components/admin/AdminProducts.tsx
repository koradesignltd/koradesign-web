import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Link } from "@tanstack/react-router";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORIES, formatFRW } from "@/lib/format";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

const MAX_IMAGES = 5;

interface FormState {
  id?: string;
  name: string;
  description: string;
  price_frw: number;
  category: string;
  image_url: string;
  image_urls: string[];
  is_new: boolean;
  active: boolean;
}

const EMPTY: FormState = {
  name: "", description: "", price_frw: 15000,
  category: CATEGORIES[0], image_url: "", image_urls: [], is_new: true, active: true,
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("products").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setProducts(data ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function handleUpload(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `uploads/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!editing) return;
    if (!editing.name.trim() || !editing.image_url) {
      toast.error("Name and image are required");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: editing.name.trim(),
        description: editing.description.trim() || null,
        price_frw: Math.max(0, Math.floor(editing.price_frw)),
        category: editing.category,
        image_url: editing.image_url,
        image_urls: editing.image_urls,
        is_new: editing.is_new,
        active: editing.active,
      };
      if (editing.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Product created");
      }
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); await load(); }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} products in catalog.</p>
        <Button onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="mr-2 h-4 w-4" /> New product
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">New</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No products yet. Click "New product" to add your first one.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-2">
                  <img src={p.image_url} alt="" width={48} height={48} className="h-12 w-12 rounded-md object-cover" />
                </td>
                <td className="px-4 py-2 font-medium">
                  <Link to="/product/$id" params={{ id: p.id }} className="hover:underline">{p.name}</Link>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{p.category}</td>
                <td className="px-4 py-2">{formatFRW(p.price_frw)}</td>
                <td className="px-4 py-2">{p.is_new ? "✓" : "—"}</td>
                <td className="px-4 py-2">{p.active ? "✓" : "—"}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing({
                      id: p.id, name: p.name, description: p.description ?? "",
                      price_frw: p.price_frw, category: p.category, image_url: p.image_url,
                      image_urls: (p as Product & { image_urls?: string[] }).image_urls ?? [],
                      is_new: p.is_new, active: p.active,
                    })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void remove(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input
                    list="category-suggestions"
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    placeholder="Pick or type a custom category"
                  />
                  <datalist id="category-suggestions">
                    {CATEGORIES.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="space-y-1.5">
                  <Label>Price (FRW)</Label>
                  <Input type="number" min={0} value={editing.price_frw}
                    onChange={(e) => setEditing({ ...editing, price_frw: parseInt(e.target.value || "0", 10) })} />
                </div>
                <div className="flex items-end gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={editing.is_new} onCheckedChange={(v) => setEditing({ ...editing, is_new: v })} />
                    <Label>New</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                    <Label>Active</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Images <span className="text-xs font-normal text-muted-foreground">(cover + up to {MAX_IMAGES - 1} more, {MAX_IMAGES} max)</span></Label>
                <div className="flex flex-wrap gap-3">
                  {editing.image_url && (
                    <div className="relative">
                      <img src={editing.image_url} alt="" className="h-24 w-24 rounded-md object-cover ring-2 ring-primary" />
                      <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">Cover</span>
                      <button type="button" onClick={() => {
                        const [next, ...rest] = editing.image_urls;
                        setEditing({ ...editing, image_url: next ?? "", image_urls: rest });
                      }} className="absolute -right-2 -top-2 rounded-full border border-border bg-background p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {editing.image_urls.map((url, i) => (
                    <div key={`${url}-${i}`} className="relative">
                      <img src={url} alt="" className="h-24 w-24 rounded-md object-cover" />
                      <button type="button" onClick={() => setEditing({
                        ...editing,
                        image_urls: editing.image_urls.filter((_, idx) => idx !== i),
                      })} className="absolute -right-2 -top-2 rounded-full border border-border bg-background p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {(editing.image_url ? 1 : 0) + editing.image_urls.length < MAX_IMAGES && (
                    <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-border hover:bg-accent">
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files ?? []);
                          e.target.value = "";
                          if (files.length === 0) return;
                          const used = (editing.image_url ? 1 : 0) + editing.image_urls.length;
                          const remaining = MAX_IMAGES - used;
                          const toUpload = files.slice(0, remaining);
                          const uploaded: string[] = [];
                          for (const f of toUpload) {
                            const url = await handleUpload(f);
                            if (url) uploaded.push(url);
                          }
                          if (uploaded.length === 0) return;
                          setEditing((prev) => {
                            if (!prev) return prev;
                            const next = { ...prev };
                            const queue = [...uploaded];
                            if (!next.image_url && queue.length > 0) next.image_url = queue.shift()!;
                            next.image_urls = [...prev.image_urls, ...queue];
                            return next;
                          });
                        }} />
                      <div className="text-center text-xs text-muted-foreground">
                        <Upload className="mx-auto mb-1 h-5 w-5" />
                        {uploading ? "Uploading…" : "Add"}
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={save} disabled={busy || uploading}>
                  {busy ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
