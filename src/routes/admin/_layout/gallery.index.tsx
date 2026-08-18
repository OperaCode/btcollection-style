import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { deleteGalleryProject, listAdminGallery, updateGalleryProject } from "@/lib/gallery";

export const Route = createFileRoute("/admin/_layout/gallery/")({ component: AdminGalleryPage });

function AdminGalleryPage() {
  const queryClient = useQueryClient();
  const projects = useQuery({ queryKey: ["admin", "gallery"], queryFn: listAdminGallery });
  const remove = useMutation({
    mutationFn: deleteGalleryProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] }),
  });
  const toggle = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      updateGalleryProject(id, { published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Inspiration Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage finished work customers can browse for ideas.
          </p>
        </div>
        <Link
          to="/admin/gallery/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
        >
          <Plus className="h-4 w-4" /> New Project
        </Link>
      </div>

      {projects.isLoading ? (
        <p className="mt-12 text-sm text-muted-foreground">Loading gallery projects...</p>
      ) : projects.isError ? (
        <div className="mt-8 rounded-sm border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          Could not load gallery projects. Confirm the gallery database migration has been applied and
          that this account has admin access.
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {(projects.data ?? []).map((project) => (
              <article key={project.id} className="overflow-hidden rounded-sm border border-border bg-card">
                <div className="aspect-[4/3] bg-muted">
                  {project.images[0] && (
                    <img src={project.images[0].image_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl text-ink">{project.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {project.images.length} image{project.images.length === 1 ? "" : "s"} · {project.published ? "Published" : "Draft"}
                      </p>
                    </div>
                    <button
                      aria-label={project.published ? "Unpublish" : "Publish"}
                      onClick={() => toggle.mutate({ id: project.id, published: !project.published })}
                      className="text-muted-foreground hover:text-gold"
                    >
                      {project.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      to="/inspiration/$slug"
                      params={{ slug: project.slug }}
                      search={{ category: "" }}
                      target="_blank"
                      className="text-[10px] uppercase tracking-[0.18em] text-gold"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${project.title}"?`)) remove.mutate(project.id);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {projects.data?.length === 0 && (
            <div className="mt-12 rounded-sm border border-dashed border-border p-8 text-center">
              <div className="mx-auto max-w-md">
                <h2 className="font-display text-2xl text-ink">No gallery projects yet</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create a finished-work project to showcase inspiration boards in the storefront.
                </p>
                <Link
                  to="/admin/gallery/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
                >
                  <Plus className="h-4 w-4" /> Add a gallery project
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
