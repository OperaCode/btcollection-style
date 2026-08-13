import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { LOCAL_MUG_TUMBLER_GALLERY } from "@/lib/mug-tumbler-images";
import monogramBottle from "@/assets/product-uploads/upload-14.jpeg";
import catalogueGiftSet from "@/assets/towels/catalogue-giftset.jpeg";

export type GalleryProject = Tables<"gallery_projects"> & {
  images: Tables<"gallery_images">[];
};
export type GalleryProjectInput = TablesInsert<"gallery_projects">;

export const GALLERY_QUERY_KEY = ["public-gallery"] as const;

const LOCAL_GALLERY_DETAILS = [
  {
    slug: "first-birthday-photo-mug-inspiration",
    title: "First Birthday Photo Mug",
    description:
      "A ceramic mug printed with birthday photos and a custom milestone message — a keepsake favor for a first birthday celebration.",
    occasions: ["Birthday Gifts"],
    materials: ["Ceramic"],
    techniques: ["Custom photo printing"],
  },
  {
    slug: "golden-jubilee-photo-mug-inspiration",
    title: "Golden Jubilee Photo Mug",
    description:
      "A framed portrait, milestone scripture, and gold foil-style design printed on a ceramic mug — made to honor a 50th birthday or anniversary.",
    occasions: ["Birthday Gifts"],
    materials: ["Ceramic"],
    techniques: ["Custom photo printing"],
  },
  {
    slug: "first-birthday-party-favor-bottles-inspiration",
    title: "First Birthday Party Favor Bottles",
    description:
      "A matching set of flip-straw water bottles printed with birthday photos — a fun, coordinated party favor for little ones.",
    occasions: ["Birthday Gifts", "Event Gifts"],
    materials: ["Stainless steel"],
    techniques: ["Custom photo printing"],
  },
  {
    slug: "golden-jubilee-black-mug-inspiration",
    title: "Golden Jubilee Photo Mug — Black",
    description:
      "A black ceramic mug design celebrating a golden jubilee, with a framed portrait and a message honoring faith and leadership.",
    occasions: ["Birthday Gifts"],
    materials: ["Ceramic"],
    techniques: ["Custom photo printing"],
  },
  {
    slug: "custom-logo-water-bottles-inspiration",
    title: "Custom Logo Water Bottles",
    description:
      "Bulk-ordered stainless steel water bottles printed with a business logo — ideal for staff gifts, client swag, or corporate events.",
    occasions: ["Corporate Gifts"],
    materials: ["Stainless steel"],
    techniques: ["Custom logo printing"],
  },
] as const;

const LOCAL_GALLERY_PROJECTS: GalleryProject[] = LOCAL_MUG_TUMBLER_GALLERY.map((image, index) => {
  const details = LOCAL_GALLERY_DETAILS[index];
  return {
    id: `local-mugs-tumblers-${index + 1}`,
    title: details.title,
    slug: details.slug,
    description: details.description,
    product_id: null,
    product_type: "Mugs & Tumblers",
    occasions: [...details.occasions],
    materials: [...details.materials],
    colors: [],
    techniques: [...details.techniques],
    featured: false,
    published: true,
    sort_order: index,
    created_at: "",
    updated_at: "",
    images: [
      {
        id: `local-mugs-tumblers-image-${index + 1}`,
        gallery_project_id: `local-mugs-tumblers-${index + 1}`,
        image_url: image,
        alt_text: details.title,
        sort_order: 0,
        created_at: "",
      },
    ],
  };
});

const LOCAL_FINISHED_DRINKWARE: GalleryProject[] = [
  {
    id: "local-monogram-insulated-bottle",
    title: "Monogram Insulated Bottle",
    slug: "monogram-insulated-bottle-inspiration",
    description:
      "A finished insulated bottle with a personalized monogram, made for everyday gifting.",
    product_id: null,
    product_type: "Mugs & Tumblers",
    occasions: ["Birthday Gifts"],
    materials: ["Insulated stainless steel"],
    colors: ["Green", "Gold"],
    techniques: ["Monogram printing"],
    featured: false,
    published: true,
    sort_order: 11,
    created_at: "",
    updated_at: "",
    images: [
      {
        id: "local-monogram-insulated-bottle-image",
        gallery_project_id: "local-monogram-insulated-bottle",
        image_url: monogramBottle,
        alt_text: "Monogram insulated bottle finished product",
        sort_order: 0,
        created_at: "",
      },
    ],
  },
];

const LOCAL_MUG_TUMBLER_PROJECTS = [...LOCAL_GALLERY_PROJECTS, ...LOCAL_FINISHED_DRINKWARE];
const LOCAL_GIFT_SET_INSPIRATION: GalleryProject = {
  id: "local-towel-gift-set-catalogue",
  title: "Embroidered Towel Gift Sets",
  slug: "embroidered-towel-gift-sets-inspiration",
  description: "A finished embroidered towel gift-set example from Breakthrough Collection.",
  product_id: null,
  product_type: "Gift Sets",
  occasions: ["Gift Boxes", "Gift Sets", "Mother's Day"],
  materials: ["Cotton towel", "Gift packaging"],
  colors: ["White", "Gold"],
  techniques: ["Embroidery"],
  featured: false,
  published: true,
  sort_order: 20,
  created_at: "",
  updated_at: "",
  images: [
    {
      id: "local-towel-gift-set-catalogue-image",
      gallery_project_id: "local-towel-gift-set-catalogue",
      image_url: catalogueGiftSet,
      alt_text: "Embroidered towel gift set inspiration",
      sort_order: 0,
      created_at: "",
    },
  ],
};

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
  if (error) return [...LOCAL_MUG_TUMBLER_PROJECTS, LOCAL_GIFT_SET_INSPIRATION];
  const projects = await withImages(data);
  return [...LOCAL_MUG_TUMBLER_PROJECTS, LOCAL_GIFT_SET_INSPIRATION, ...projects];
}

export async function getPublicGalleryProject(slug: string) {
  const { data, error } = await supabase
    .from("gallery_projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error) {
    const localProject = [...LOCAL_MUG_TUMBLER_PROJECTS, LOCAL_GIFT_SET_INSPIRATION].find(
      (project) => project.slug === slug,
    );
    if (localProject) return localProject;
    throw error;
  }
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
