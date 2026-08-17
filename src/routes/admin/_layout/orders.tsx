import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_layout/orders")({
  component: OrdersLayout,
});

const TABS = [
  { label: "Shop Orders", to: "/admin/orders" as const, exact: true },
  { label: "Custom Requests", to: "/admin/orders/custom" as const, exact: false },
];

function OrdersLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Shop orders and custom quote requests, in one place.
      </p>

      <div className="mt-6 flex gap-2 border-b border-border">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`border-b-2 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] transition ${
                active ? "border-gold text-ink" : "border-transparent text-muted-foreground hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
