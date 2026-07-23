"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ProduitInput {
  title: string;
  description: string;
  coverUrl: string | null;
  filiereId: string | null;
  type: "gratuit" | "payant";
  // payant
  price: number;
  ctaType: "url" | "embed";
  chariowUrl: string;
  chariowEmbedCode: string;
  // gratuit
  freeType: "file" | "link";
  freeFileUrl: string | null;
  freeLinkUrl: string;
  ctaLabel: string;
  likesEnabled: boolean;
  commentsEnabled: boolean;
  position: number;
}

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Non authentifié.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Accès réservé aux administrateurs.");
}

function validateProduitInput(input: ProduitInput): string | null {
  if (!input.title.trim()) return "Le titre est requis.";

  if (input.type === "payant") {
    if (!Number.isFinite(input.price) || input.price < 0) {
      return "Le prix doit être un nombre positif.";
    }
    if (input.ctaType === "url" && !input.chariowUrl.trim()) {
      return "Le lien Chariow est requis.";
    }
    if (input.ctaType === "embed" && !input.chariowEmbedCode.trim()) {
      return "Le code d'intégration Chariow est requis.";
    }
  } else {
    if (input.freeType === "file" && !input.freeFileUrl) {
      return "Le fichier à téléverser est requis.";
    }
    if (input.freeType === "link" && !input.freeLinkUrl.trim()) {
      return "Le lien est requis.";
    }
  }

  return null;
}

function toRow(input: ProduitInput) {
  return {
    title: input.title.trim(),
    description: input.description.trim() || null,
    cover_url: input.coverUrl,
    filiere_id: input.filiereId,
    type: input.type,
    price: input.type === "payant" ? input.price : null,
    cta_type: input.type === "payant" ? input.ctaType : null,
    chariow_url: input.type === "payant" && input.ctaType === "url" ? input.chariowUrl.trim() : null,
    chariow_embed_code:
      input.type === "payant" && input.ctaType === "embed" ? input.chariowEmbedCode.trim() : null,
    free_type: input.type === "gratuit" ? input.freeType : null,
    free_file_url: input.type === "gratuit" && input.freeType === "file" ? input.freeFileUrl : null,
    free_link_url:
      input.type === "gratuit" && input.freeType === "link" ? input.freeLinkUrl.trim() : null,
    cta_label: input.ctaLabel.trim() || null,
    likes_enabled: input.likesEnabled,
    comments_enabled: input.commentsEnabled,
    position: input.position,
  };
}

export async function createProduit(input: ProduitInput): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const validationError = validateProduitInput(input);
  if (validationError) return { error: validationError };

  const admin = createAdminClient();
  const { error } = await admin.from("produits").insert(toRow(input));

  if (error) return { error: error.message };

  revalidatePath("/admin/produits");
  revalidatePath("/decouvrir");
  return {};
}

export async function updateProduit(
  id: string,
  input: ProduitInput,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const validationError = validateProduitInput(input);
  if (validationError) return { error: validationError };

  const admin = createAdminClient();
  const { error } = await admin.from("produits").update(toRow(input)).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/produits");
  revalidatePath("/decouvrir");
  return {};
}

export async function deleteProduit(id: string) {
  await assertAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("produits").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/produits");
  revalidatePath("/decouvrir");
}
