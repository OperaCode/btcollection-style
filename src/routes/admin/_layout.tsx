import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { ClipboardList, LayoutDashboard, Mail, Package, ShoppingBag, LogOut } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/_layout")({
  component: AdminProtectedLayout,
});

const NAV = [
  { label: "Dashboard", to: "/admin" as const, icon: LayoutDashboard },
  { label: "Orders", to: "/admin/orders" as const, icon: ShoppingBag },
  { label: "Custom", to: "/admin/custom-requests" as const, icon: ClipboardList },
  { label: "Products", to: "/admin/products" as const, icon: Package },
  { label: "Subscribers", to: "/admin/subscribers" as const, icon: Mail },
];

function AdminProtectedLayout() {
  const { loading, user, isAdmin, authError, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/admin/login" });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Loading admin...
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center text-foreground">
        <div>
          <h1 className="font-display text-2xl text-ink">Access Denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user.email} does not have admin access to this store.
          </p>
          {authError && <p className="mt-3 max-w-md text-sm text-destructive">{authError}</p>}
          <button
            onClick={() => signOut()}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-foreground/75 hover:border-gold hover:text-gold"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background text-foreground md:grid-cols-[220px_1fr]">
      <aside className="border-b border-border bg-ink text-background md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-gold/60 font-display italic text-gold">
            BT
          </div>
          <div className="font-display text-lg">Admin</div>
        </div>
        <nav className="flex flex-row gap-1 overflow-x-auto px-3 py-3 md:flex-col md:overflow-visible">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-[12px] uppercase tracking-[0.18em] transition ${
                  active ? "bg-gold/15 text-gold" : "text-background/75 hover:bg-white/5 hover:text-background"
                }`}
              >
                <Icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-6 py-4">
          <p className="truncate text-xs text-background/60">{user.email}</p>
          <button
            onClick={() => signOut()}
            className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-background/75 hover:text-gold"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="px-4 py-8 md:px-10 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
