import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Announcement, Header, Footer } from "@/components/site/SiteChrome";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { useProducts, useIsAdmin, type Product } from "@/lib/products";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — BT Collection LLC" }] }),
  component: Admin,
});

function Admin() {
  const nav = useNavigate();
  const { user, loading } = useSession();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const { data: products = [] } = useProducts();
  const [orders, setOrders] = useState<any[]>([]);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  useEffect(() => {
    if (isAdmin) {
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).then(({ data }) => setOrders(data ?? []));
    }
  }, [isAdmin]);

  if (loading || roleLoading) return <div className="min-h-screen bg-background" />;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Announcement />
        <Header />
        <section className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-3xl text-ink">Admin access required</h1>
          <p className="mt-3 text-sm text-muted-foreground">Signed in as {user.email}. Ask an existing admin to grant you the admin role.</p>
          <Link to="/" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-background">Home</Link>
        </section>
        <Footer />
      </div>
    );
  }

  async function save() {
    if (!editing) return;
    const payload: any = {
      slug: editing.slug, name: editing.name, description: editing.description,
      price: Number(editing.price ?? 0), category: editing.category, images: editing.images ?? [],
      customizable: !!editing.customizable, best_seller: !!editing.best_seller,
      in_stock: editing.in_stock ?? true, featured: !!editing.featured,
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  async function del(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <div className="min-h-screen bg-background">
      <Announcement />
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-gold">Admin</div>
            <h1 className="font-display text-4xl text-ink">Dashboard</h1>
          </div>
          <button onClick={() => setEditing({ slug: "", name: "", price: 0, category: "Custom Gifts", images: [], in_stock: true })} className="rounded-full bg-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-background">+ New Product</button>
        </div>

        <h2 className="mt-10 font-display text-2xl text-ink">Products ({products.length})</h2>
        <div className="mt-4 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-cream/40 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">${Number(p.price).toFixed(2)}</td>
                  <td className="p-3">{p.in_stock ? "In stock" : "Out"}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing(p)} className="text-gold hover:underline">Edit</button>
                    <button onClick={() => del(p.id)} className="ml-4 text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 font-display text-2xl text-ink">Recent Orders ({orders.length})</h2>
        <div className="mt-4 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-cream/40 text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <tr><th className="p-3">Order</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Total</th><th className="p-3">Date</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="p-3">{o.email}</td>
                  <td className="p-3">{o.status}</td>
                  <td className="p-3">${Number(o.total).toFixed(2)}</td>
                  <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/60 p-4">
          <div className="w-full max-w-lg rounded-md bg-background p-6">
            <h3 className="font-display text-2xl text-ink">{editing.id ? "Edit" : "New"} Product</h3>
            <div className="mt-4 space-y-3">
              {(["slug", "name", "category"] as const).map((k) => (
                <input key={k} placeholder={k} value={(editing as any)[k] ?? ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
              ))}
              <textarea placeholder="description" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
              <input type="number" step="0.01" placeholder="price" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
              <input placeholder="image filenames comma-separated (e.g. p1.jpg,p2.jpg)" value={(editing.images ?? []).join(",")} onChange={(e) => setEditing({ ...editing, images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.customizable} onChange={(e) => setEditing({ ...editing, customizable: e.target.checked })} /> Customizable</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!editing.best_seller} onChange={(e) => setEditing({ ...editing, best_seller: e.target.checked })} /> Best Seller</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.in_stock ?? true} onChange={(e) => setEditing({ ...editing, in_stock: e.target.checked })} /> In Stock</label>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-full border border-border py-3 text-[11px] uppercase tracking-[0.22em]">Cancel</button>
              <button onClick={save} className="flex-1 rounded-full bg-ink py-3 text-[11px] uppercase tracking-[0.22em] text-background">Save</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}