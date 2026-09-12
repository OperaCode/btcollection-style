import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  CATEGORIES_QUERY_KEY,
  MAX_CATEGORIES,
  type Category,
} from "@/lib/categories";

export const Route = createFileRoute("/admin/_layout/categories")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: CATEGORIES_QUERY_KEY, queryFn: listCategories });
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });

  const create = useMutation({
    mutationFn: (name: string) => createCategory({ name, sort_order: categories.data?.length ?? 0 }),
    onSuccess: () => {
      setNewName("");
      setError("");
      invalidate();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not add category."),
  });

  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCategory(id, { name }),
    onSuccess: () => {
      setEditingId(null);
      setError("");
      invalidate();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not rename category."),
  });

  const remove = useMutation({
    mutationFn: (category: Category) => deleteCategory(category.id, category.name),
    onSuccess: () => {
      setError("");
      invalidate();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not delete category."),
  });

  const reorder = useMutation({
    mutationFn: (orderedIds: string[]) => reorderCategories(orderedIds),
    onSuccess: () => invalidate(),
    onError: (err) => setError(err instanceof Error ? err.message : "Could not reorder categories."),
  });

  const list = categories.data ?? [];
  const atMax = list.length >= MAX_CATEGORIES;

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const reordered = [...list];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    reorder.mutate(reordered.map((c) => c.id));
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Categories</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage the categories shoppers filter by in the shop, and that show up when you add a new
        gallery project. Up to {MAX_CATEGORIES} categories.
      </p>

      <div className="mt-8 max-w-xl rounded-sm border border-border bg-card">
        <ul className="divide-y divide-border">
          {list.map((category, index) => (
            <li key={category.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0 || reorder.isPending}
                  onClick={() => move(index, -1)}
                  className="text-foreground/60 hover:text-gold disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === list.length - 1 || reorder.isPending}
                  onClick={() => move(index, 1)}
                  className="text-foreground/60 hover:text-gold disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {editingId === category.id ? (
                <form
                  className="flex flex-1 items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = editingName.trim();
                    if (name) rename.mutate({ id: category.id, name });
                  }}
                >
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full rounded-sm border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    disabled={rename.isPending}
                    className="text-[11px] uppercase tracking-[0.16em] text-gold hover:text-ink"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-[11px] uppercase tracking-[0.16em] text-foreground/60 hover:text-ink"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <span className="flex-1 text-sm text-ink">{category.name}</span>
                  <button
                    type="button"
                    aria-label={`Rename ${category.name}`}
                    onClick={() => {
                      setEditingId(category.id);
                      setEditingName(category.name);
                    }}
                    className="text-foreground/70 hover:text-gold"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => {
                      if (confirm(`Delete "${category.name}"?`)) remove.mutate(category);
                    }}
                    className="text-foreground/70 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {categories.isLoading && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading categories...</p>
        )}
        {!categories.isLoading && list.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No categories yet — add your first one below.
          </p>
        )}

        <form
          className="flex items-center gap-2 border-t border-border px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            const name = newName.trim();
            if (name) create.mutate(name);
          }}
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name"
            disabled={atMax}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-gold disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={atMax || create.isPending || !newName.trim()}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-background hover:bg-gold hover:text-ink disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </form>
      </div>

      <p className="mt-3 max-w-xl text-xs text-muted-foreground">
        {atMax ? "Maximum of 8 categories reached." : `${list.length} / ${MAX_CATEGORIES} categories`}
      </p>

      {error && <p className="mt-3 max-w-xl text-sm text-destructive">{error}</p>}
    </div>
  );
}
