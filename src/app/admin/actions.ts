"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkImageSize } from "@/lib/upload-constraints";
import type { AssocierData, OrdonnerData, QcmData } from "@/lib/types";

export interface QuestionInput {
  leconId: string;
  type: "qcm" | "associer" | "ordonner";
  prompt: string;
  explanation: string;
  position: number;
  imageUrl: string | null;
  data: QcmData | AssocierData | OrdonnerData;
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

function validateQuestionInput(input: QuestionInput): string | null {
  if (!input.prompt.trim()) return "L'énoncé de la question est requis.";

  if (input.type === "qcm") {
    const data = input.data as QcmData;
    if (!data.options || data.options.length < 2) {
      return "Un QCM doit avoir au moins 2 réponses.";
    }
    if (data.options.some((o) => !o.text.trim() && !o.image_url)) {
      return "Chaque réponse doit avoir un texte ou une image.";
    }
    if (!data.options.some((o) => o.id === data.correct_option_id)) {
      return "Sélectionnez la bonne réponse.";
    }
  }

  if (input.type === "associer") {
    const data = input.data as AssocierData;
    if (!data.pairs || data.pairs.length < 2) {
      return "Un exercice d'association doit avoir au moins 2 paires.";
    }
    if (data.pairs.some((p) => !p.left.text.trim() || !p.right.text.trim())) {
      return "Chaque paire doit avoir ses deux côtés remplis.";
    }
  }

  if (input.type === "ordonner") {
    const data = input.data as OrdonnerData;
    if (!data.steps || data.steps.length < 2) {
      return "Un exercice d'ordre doit avoir au moins 2 étapes.";
    }
    if (data.steps.some((s) => !s.text.trim())) {
      return "Chaque étape doit avoir un texte.";
    }
  }

  return null;
}

// ---------- Leçons ----------

export async function createLecon(formData: FormData) {
  try {
    await assertAdmin();

    const filiereId = formData.get("filiere_id") as string;
    const title = (formData.get("title") as string)?.trim();
    const position = Number(formData.get("position"));
    const langueCode = (formData.get("langue_code") as string) || null;
    const niveauEtude = (formData.get("niveau_etude") as string) || null;

    if (!filiereId || !title || !Number.isFinite(position)) {
      throw new Error("Merci de remplir tous les champs.");
    }

    const admin = createAdminClient();

    const { data: filiere } = await admin
      .from("filieres")
      .select("slug")
      .eq("id", filiereId)
      .single();
    const isLangues = filiere?.slug === "langues";

    if (isLangues && !langueCode) {
      throw new Error("Sélectionnez la langue de cette leçon.");
    }
    if (!isLangues && !niveauEtude) {
      throw new Error("Sélectionnez le niveau d'études de cette leçon.");
    }

    const { error } = await admin.from("lecons").insert({
      filiere_id: filiereId,
      title,
      position,
      langue_code: isLangues ? langueCode : null,
      niveau_etude: isLangues ? null : niveauEtude,
    });

    if (error) throw new Error(error.message);
  } catch (e) {
    redirect(`/admin/lecons/new?error=${encodeURIComponent((e as Error).message)}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateLecon(id: string, formData: FormData) {
  try {
    await assertAdmin();

    const title = (formData.get("title") as string)?.trim();
    const position = Number(formData.get("position"));

    if (!title || !Number.isFinite(position)) {
      throw new Error("Merci de remplir tous les champs.");
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("lecons")
      .update({ title, position })
      .eq("id", id);

    if (error) throw new Error(error.message);
  } catch (e) {
    redirect(`/admin/lecons/${id}?error=${encodeURIComponent((e as Error).message)}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/lecons/${id}`);
  redirect(`/admin/lecons/${id}`);
}

export async function deleteLecon(id: string) {
  await assertAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("lecons").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

// ---------- Images ----------

export async function uploadImage(
  formData: FormData,
  bucket: "lesson-images" | "branding" | "materiel" = "lesson-images",
): Promise<{ url?: string; error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Aucun fichier reçu." };
  if (!file.type.startsWith("image/")) {
    return { error: "Le fichier doit être une image." };
  }
  const sizeError = checkImageSize(file);
  if (sizeError) return { error: sizeError };

  const admin = createAdminClient();
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await admin.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type });

  if (error) return { error: error.message };

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}

// Same as uploadImage but also accepts PDFs — used for downloadable free
// products (guide PDF, etc.) in the admin "produits" section.
export async function uploadProductFile(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Aucun fichier reçu." };
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    return { error: "Le fichier doit être une image ou un PDF." };
  }
  const sizeError = checkImageSize(file);
  if (sizeError) return { error: sizeError };

  const admin = createAdminClient();
  const extension = file.name.split(".").pop() || "pdf";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await admin.storage
    .from("lesson-images")
    .upload(path, file, { contentType: file.type });

  if (error) return { error: error.message };

  const { data } = admin.storage.from("lesson-images").getPublicUrl(path);
  return { url: data.publicUrl };
}

// ---------- Branding (logo, icônes de filière) ----------

export async function updateLogo(logoUrl: string | null): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("app_settings")
    .update({ logo_url: logoUrl })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function updateFiliereIcon(
  filiereId: string,
  iconUrl: string | null,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("filieres")
    .update({ icon_url: iconUrl })
    .eq("id", filiereId);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

// ---------- Matériel (images utilisées par les jeux) ----------

export async function updateMaterielImage(
  itemId: string,
  imageUrl: string | null,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("materiel_items")
    .update({ image_url: imageUrl })
    .eq("id", itemId);

  if (error) return { error: error.message };

  revalidatePath("/admin/materiel");
  return {};
}

// ---------- Questions ----------

export async function createQuestion(
  input: QuestionInput,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const validationError = validateQuestionInput(input);
  if (validationError) return { error: validationError };

  const admin = createAdminClient();
  const { error } = await admin.from("questions").insert({
    lecon_id: input.leconId,
    type: input.type,
    position: input.position,
    prompt: input.prompt,
    explanation: input.explanation || null,
    image_url: input.imageUrl,
    data: input.data,
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/lecons/${input.leconId}`);
  redirect(`/admin/lecons/${input.leconId}`);
}

export async function updateQuestion(
  id: string,
  input: QuestionInput,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const validationError = validateQuestionInput(input);
  if (validationError) return { error: validationError };

  const admin = createAdminClient();
  const { error } = await admin
    .from("questions")
    .update({
      type: input.type,
      position: input.position,
      prompt: input.prompt,
      explanation: input.explanation || null,
      image_url: input.imageUrl,
      data: input.data,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/lecons/${input.leconId}`);
  redirect(`/admin/lecons/${input.leconId}`);
}

export async function deleteQuestion(id: string, leconId: string) {
  await assertAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("questions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/lecons/${leconId}`);
}
