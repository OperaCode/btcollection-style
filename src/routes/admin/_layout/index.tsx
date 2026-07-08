import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, DollarSign, Package, PackageX } from "lucide-react";
import { getDashboardStats, listOrders } from "@/lib/admin-data";
import { formatUSD } from "@/lib/cart";

export const Route = createFileRoute("/admin/_layout/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: getDashboardStats });
  const orders = useQuery({ queryKey: ["admin", "orders", "recent"], queryFn: listOrders });
  const recent = (orders.data ?? []).slice(0, 5);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Store overview at a glance.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.data?.orderCount ?? "—"} />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={stats.data ? formatUSD(stats.data.revenue) : "—"}
        />
        <StatCard icon={Package} label="Active Products" value={stats.data?.activeProducts ?? "—"} />
        <StatCard icon={PackageX} label="Out of Stock" value={stats.data?.outOfStock ?? "—"} />
      </div>

      <div className="mt-10 rounded-sm border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-xl text-ink">Recent Orders</h2>
          <Link to="/admin/orders" className="text-[11px] uppercase tracking-[0.2em] text-gold hover:underline">
            View All
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-6 py-4 text-sm">
                <div>
                  <div className="text-ink">{o.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground/70">
                    {o.status}
                  </span>
                  <span className="text-ink">{formatUSD(Number(o.total))}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-sm border border-border bg-card p-5">
      <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/60 text-gold">
        <Icon className="h-4 w-4" />
      </span>
      <div className="mt-4 font-display text-2xl text-ink">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  );
}
