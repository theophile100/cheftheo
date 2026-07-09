"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkImageSize } from "@/lib/upload-constraints";

export async function uploadAvatar(formData: FormData): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non authentifié." };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Aucun fichier reçu." };
  if (!file.type.startsWith("image/")) {
    return { error: "Le fichier doit être une image." };
  }
  const sizeError = checkImageSize(file);
  if (sizeError) return { error: sizeError };

  const admin = createAdminClient();
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${user.id}.${extension}`;

  const { error: uploadError } = await admin.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: pub } = admin.storage.from("avatars").getPublicUrl(path);
  const url = `${pub.publicUrl}?t=${Date.now()}`;

  const { error: dbError } = await admin
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id);

  if (dbError) return { error: dbError.message };

  revalidatePath("/profil");
  return { url };
}
