import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Star, Sparkles } from "lucide-react";
import { listProducts, deleteProduct, updateProduct, type AdminProduct } from "@/lib/admin-data";
import { formatUSD } from "@/lib/cart";

export const Route = createFileRoute("/admin/_layout/products/")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const queryClient = useQueryClient();
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: listProducts });

  const toggleField = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: "in_stock" | "featured" | "best_seller"; value: boolean }) =>
      updateProduct(id, { [field]: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the catalog customers see in the shop.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
        >
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-sm border border-border bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-normal">Product</th>
              <th className="px-5 py-3 font-normal">Category</th>
              <th className="px-5 py-3 font-normal">Price</th>
              <th className="px-5 py-3 font-normal">In Stock</th>
              <th className="px-5 py-3 font-normal">Featured</th>
              <th className="px-5 py-3 font-normal">Best Seller</th>
              <th className="px-5 py-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(products.data ?? []).map((p: AdminProduct) => (
              <tr key={p.id}>
                <td className="px-5 py-3 text-ink">{p.name}</td>
                <td className="px-5 py-3 text-foreground/75">{p.category}</td>
                <td className="px-5 py-3 text-ink">{formatUSD(Number(p.price))}</td>
                <td className="px-5 py-3">
                  <ToggleDot
                    active={p.in_stock}
                    onClick={() => toggleField.mutate({ id: p.id, field: "in_stock", value: !p.in_stock })}
                  />
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleField.mutate({ id: p.id, field: "featured", value: !p.featured })}
                  >
                    <Sparkles className={`h-4 w-4 ${p.featured ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                  </button>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleField.mutate({ id: p.id, field: "best_seller", value: !p.best_seller })}
                  >
                    <Star className={`h-4 w-4 ${p.best_seller ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Link to="/admin/products/$id" params={{ id: p.id }} className="text-foreground/70 hover:text-gold">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.name}"? This cannot be undone.`)) remove.mutate(p.id);
                      }}
                      className="text-foreground/70 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.data?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No products yet — create your first one.
          </p>
        )}
      </div>
    </div>
  );
}

function ToggleDot({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-6 w-11 rounded-full transition ${active ? "bg-gold" : "bg-muted"}`}
      aria-pressed={active}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-background shadow transition ${
          active ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
