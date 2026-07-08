import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { listOrders, listOrderItems, updateOrderStatus, type AdminOrder } from "@/lib/admin-data";
import { formatUSD } from "@/lib/cart";

export const Route = createFileRoute("/admin/_layout/orders")({
  component: AdminOrdersPage,
});

const STATUSES: AdminOrder["status"][] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const orders = useQuery({ queryKey: ["admin", "orders"], queryFn: listOrders });
  const [expanded, setExpanded] = useState<string | null>(null);

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminOrder["status"] }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">View and update order status.</p>

      <div className="mt-8 divide-y divide-border rounded-sm border border-border bg-card">
        {(orders.data ?? []).map((o) => (
          <div key={o.id}>
            <button
              onClick={() => setExpanded(expanded === o.id ? null : o.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <div className="min-w-0">
                <div className="text-sm text-ink">{o.email}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString()} · {o.id.slice(0, 8)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-ink">{formatUSD(Number(o.total))}</span>
                <select
                  value={o.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    setStatus.mutate({ id: o.id, status: e.target.value as AdminOrder["status"] })
                  }
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-foreground/80 outline-none focus:border-gold"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`h-4 w-4 text-gold transition ${expanded === o.id ? "rotate-180" : ""}`}
                />
              </div>
            </button>
            {expanded === o.id && <OrderItemsPanel orderId={o.id} />}
          </div>
        ))}
        {orders.data?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );
}

function OrderItemsPanel({ orderId }: { orderId: string }) {
  const items = useQuery({
    queryKey: ["admin", "order-items", orderId],
    queryFn: () => listOrderItems(orderId),
  });

  return (
    <div className="border-t border-border bg-cream/40 px-5 py-4">
      <ul className="space-y-2 text-sm">
        {(items.data ?? []).map((it) => (
          <li key={it.id} className="flex justify-between text-foreground/80">
            <span>
              {it.quantity}× {it.name}
            </span>
            <span>{formatUSD(Number(it.price) * it.quantity)}</span>
          </li>
        ))}
      </ul>
      {items.data?.length === 0 && <p className="text-xs text-muted-foreground">No line items.</p>}
    </div>
  );
}
