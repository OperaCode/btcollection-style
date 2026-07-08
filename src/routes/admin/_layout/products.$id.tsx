import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminProductForm } from "@/components/site/AdminProductForm";
import { getProduct, updateProduct } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/_layout/products/$id")({
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const product = useQuery({ queryKey: ["admin", "product", id], queryFn: () => getProduct(id) });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Edit Product</h1>
      <p className="mt-1 text-sm text-muted-foreground">Update details for this piece.</p>

      {product.data && (
        <AdminProductForm
          initial={product.data}
          submitLabel="Save Changes"
          onSubmit={async (values) => {
            await updateProduct(id, values);
            navigate({ to: "/admin/products" });
          }}
        />
      )}
    </div>
  );
}
