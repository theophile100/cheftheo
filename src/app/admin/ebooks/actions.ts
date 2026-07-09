"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface EbookInput {
  title: string;
  description: string;
  price: number;
  coverUrl: string | null;
  chariowUrl: string;
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

function validateEbookInput(input: EbookInput): string | null {
  if (!input.title.trim()) return "Le titre est requis.";
  if (!input.chariowUrl.trim()) return "Le lien Chariow est requis.";
  if (!Number.isFinite(input.price) || input.price < 0) {
    return "Le prix doit être un nombre positif.";
  }
  return null;
}

export async function createEbook(input: EbookInput): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const validationError = validateEbookInput(input);
  if (validationError) return { error: validationError };

  const admin = createAdminClient();
  const { error } = await admin.from("ebooks").insert({
    title: input.title.trim(),
    description: input.description.trim() || null,
    price: input.price,
    cover_url: input.coverUrl,
    chariow_url: input.chariowUrl.trim(),
    likes_enabled: input.likesEnabled,
    comments_enabled: input.commentsEnabled,
    position: input.position,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/ebooks");
  revalidatePath("/decouvrir");
  return {};
}

export async function updateEbook(
  id: string,
  input: EbookInput,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const validationError = validateEbookInput(input);
  if (validationError) return { error: validationError };

  const admin = createAdminClient();
  const { error } = await admin
    .from("ebooks")
    .update({
      title: input.title.trim(),
      description: input.description.trim() || null,
      price: input.price,
      cover_url: input.coverUrl,
      chariow_url: input.chariowUrl.trim(),
      likes_enabled: input.likesEnabled,
      comments_enabled: input.commentsEnabled,
      position: input.position,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/ebooks");
  revalidatePath("/decouvrir");
  return {};
}

export async function deleteEbook(id: string) {
  await assertAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("ebooks").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/ebooks");
  revalidatePath("/decouvrir");
}
