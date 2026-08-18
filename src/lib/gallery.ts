import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type GalleryProject = Tables<"gallery_projects"> & {
  images: Tables<"gallery_images">[];
};
export type GalleryProjectInput = TablesInsert<"gallery_projects">;

export const GALLERY_QUERY_KEY = ["public-gallery"] as const;

async function withImages(projects: Tables<"gallery_projects">[]) {
  if (!projects.length) return [] as GalleryProject[];
  const { data: images, error } = await supabase
    .from("gallery_images")
    .select("*")
    .in(
      "gallery_project_id",
      projects.map((p) => p.id),
    )
    .order("sort_order");
  if (error) throw error;
  return projects.map((project) => ({
    ...project,
    images: (images ?? []).filter((image) => image.gallery_project_id === project.id),
  }));
}

export async function listPublicGallery() {
  const { data, error } = await supabase
    .from("gallery_projects")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return withImages(data);
}

export async function getPublicGalleryProject(slug: string) {
  const { data, error } = await supabase
    .from("gallery_projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error) throw error;
  const projects = await withImages([data]);
  return projects[0];
}

export async function listAdminGallery() {
  const { data, error } = await supabase
    .from("gallery_projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return withImages(data);
}

export async function createGalleryProject(input: GalleryProjectInput) {
  const { data, error } = await supabase.from("gallery_projects").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateGalleryProject(id: string, input: TablesUpdate<"gallery_projects">) {
  const { error } = await supabase.from("gallery_projects").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteGalleryProject(id: string) {
  const { error } = await supabase.from("gallery_projects").delete().eq("id", id);
  if (error) throw error;
}

export async function addGalleryImage(input: TablesInsert<"gallery_images">) {
  const { data, error } = await supabase.from("gallery_images").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function uploadGalleryImage(file: File) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error("Use a JPG, PNG, or WEBP image.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Images must be smaller than 12MB.");
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("gallery-images")
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("gallery-images").getPublicUrl(path);
  return data.publicUrl;
}
