import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatFRW } from "@/lib/format";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discount_frw: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface FormState {
  code: string;
  discount_frw: number;
  active: boolean;
  expires_at: string;
}

const EMPTY: FormState = { code: "", discount_frw: 1000, active: true, expires_at: "" };

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setCoupons((data ?? []) as Coupon[]);
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    const code = form.code.trim().toUpperCase();
    if (!code) {
      toast.error("Code is required");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from("coupons").insert({
        code,
        discount_frw: Math.max(0, Math.floor(form.discount_frw)),
        active: form.active,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      });
      if (error) throw error;
      toast.success("Coupon created");
      setOpen(false);
      setForm(EMPTY);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(c: Coupon) {
    const { error } = await supabase
      .from("coupons").update({ active: !c.active }).eq("id", c.id);
    if (error) toast.error(error.message);
    else await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); await load(); }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{coupons.length} coupon(s).</p>
        <Button onClick={() => { setForm(EMPTY); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> New coupon
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No coupons yet.
                </td>
              </tr>
            )}
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="px-4 py-2 font-mono font-medium">{c.code}</td>
                <td className="px-4 py-2">{formatFRW(c.discount_frw)} off</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-2">
                  <Switch checked={c.active} onCheckedChange={() => void toggle(c)} />
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-end">
                    <Button size="sm" variant="ghost" onClick={() => void remove(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. WELCOME10"
                className="font-mono uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Discount amount (FRW)</Label>
              <Input
                type="number"
                min={0}
                value={form.discount_frw}
                onChange={(e) => setForm({ ...form, discount_frw: parseInt(e.target.value || "0", 10) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Expires (optional)</Label>
              <Input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
