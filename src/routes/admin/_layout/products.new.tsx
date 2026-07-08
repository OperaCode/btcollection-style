import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminProductForm } from "@/components/site/AdminProductForm";
import { createProduct } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/_layout/products/new")({
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">New Product</h1>
      <p className="mt-1 text-sm text-muted-foreground">Add a new piece to the catalog.</p>

      <AdminProductForm
        submitLabel="Create Product"
        onSubmit={async (values) => {
          await createProduct(values);
          navigate({ to: "/admin/products" });
        }}
      />
    </div>
  );
}
