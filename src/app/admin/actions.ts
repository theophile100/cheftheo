"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkImageSize } from "@/lib/upload-constraints";
import type { AssocierData, OrdonnerData, QcmData } from "@/lib/types";
import { parseQuestionsFile, toQuestionData } from "@/lib/question-import";
import { parseUniteImportFile } from "@/lib/unite-import";

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
    const niveauDifficulte = (formData.get("niveau_difficulte") as string) || null;
    const parcoursNiveau = Number(formData.get("parcours_niveau")) || 1;
    const uniteId = (formData.get("unite_id") as string) || null;

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
      niveau_difficulte: niveauDifficulte,
      parcours_niveau: parcoursNiveau,
      unite_id: uniteId,
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
    const niveauDifficulte = (formData.get("niveau_difficulte") as string) || null;
    const uniteId = (formData.get("unite_id") as string) || null;

    if (!title || !Number.isFinite(position)) {
      throw new Error("Merci de remplir tous les champs.");
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("lecons")
      .update({ title, position, niveau_difficulte: niveauDifficulte, unite_id: uniteId })
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

// Echange la position de deux leçons (ou unites, ou questions) adjacentes.
// Un swap direct violerait la contrainte d'unicite (les deux lignes se
// disputeraient temporairement la meme position) : on passe par une valeur
// sentinelle negative, impossible en usage normal, le temps de l'echange.
async function swapPositions(
  table: "lecons" | "unites" | "questions",
  idA: string,
  posA: number,
  idB: string,
  posB: number,
) {
  const admin = createAdminClient();
  await admin.from(table).update({ position: -1 }).eq("id", idA);
  await admin.from(table).update({ position: posA }).eq("id", idB);
  const { error } = await admin.from(table).update({ position: posB }).eq("id", idA);
  if (error) throw new Error(error.message);
}

// ---------- Unités ----------

export async function createUnite(formData: FormData) {
  try {
    await assertAdmin();

    const filiereId = formData.get("filiere_id") as string;
    const title = (formData.get("title") as string)?.trim();
    const position = Number(formData.get("position"));
    const langueCode = (formData.get("langue_code") as string) || null;
    const niveauEtude = (formData.get("niveau_etude") as string) || null;
    const niveauDifficulte = (formData.get("niveau_difficulte") as string) || null;
    const parcoursNiveau = Number(formData.get("parcours_niveau")) || 1;

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
      throw new Error("Sélectionnez la langue de cette unité.");
    }
    if (!isLangues && !niveauEtude) {
      throw new Error("Sélectionnez le niveau d'études de cette unité.");
    }

    const { error } = await admin.from("unites").insert({
      filiere_id: filiereId,
      title,
      position,
      langue_code: isLangues ? langueCode : null,
      niveau_etude: isLangues ? null : niveauEtude,
      niveau_difficulte: niveauDifficulte,
      parcours_niveau: parcoursNiveau,
    });

    if (error) throw new Error(error.message);
  } catch (e) {
    redirect(`/admin/unites/new?error=${encodeURIComponent((e as Error).message)}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateUnite(id: string, formData: FormData) {
  try {
    await assertAdmin();

    const title = (formData.get("title") as string)?.trim();
    const position = Number(formData.get("position"));
    const niveauDifficulte = (formData.get("niveau_difficulte") as string) || null;

    if (!title || !Number.isFinite(position)) {
      throw new Error("Merci de remplir tous les champs.");
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("unites")
      .update({ title, position, niveau_difficulte: niveauDifficulte })
      .eq("id", id);

    if (error) throw new Error(error.message);
  } catch (e) {
    redirect(`/admin/unites/${id}?error=${encodeURIComponent((e as Error).message)}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/unites/${id}`);
  redirect(`/admin/unites/${id}`);
}

export async function deleteUnite(id: string) {
  await assertAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("unites").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function swapUnitePosition(
  idA: string,
  posA: number,
  idB: string,
  posB: number,
) {
  await assertAdmin();
  await swapPositions("unites", idA, posA, idB, posB);
  revalidatePath("/admin");
}

export async function swapLeconPosition(
  idA: string,
  posA: number,
  idB: string,
  posB: number,
) {
  await assertAdmin();
  await swapPositions("lecons", idA, posA, idB, posB);
  revalidatePath("/admin");
}

export async function swapQuestionPosition(
  leconId: string,
  idA: string,
  posA: number,
  idB: string,
  posB: number,
) {
  await assertAdmin();
  await swapPositions("questions", idA, posA, idB, posB);
  revalidatePath(`/admin/lecons/${leconId}`);
}

// ---------- Galerie d'images ----------

// Liste les images deja televersees dans un bucket, pour permettre de
// reutiliser une image existante (ex. sur une nouvelle question) plutot que
// de la re-televerser.
export async function listUploadedImages(
  bucket: "lesson-images" | "materiel" = "lesson-images",
): Promise<{ url: string; name: string }[]> {
  await assertAdmin();

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(bucket).list("", {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error || !data) return [];

  return data
    .filter((f) => f.name && !f.name.endsWith("/"))
    .map((f) => ({
      name: f.name,
      url: admin.storage.from(bucket).getPublicUrl(f.name).data.publicUrl,
    }));
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

export async function updateMaterielIngredients(
  itemId: string,
  ingredients: string,
): Promise<{ error?: string }> {
  try {
    await assertAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("materiel_items")
    .update({ ingredients })
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

  const { count } = await admin
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("lecon_id", input.leconId);
  if ((count ?? 0) >= 10) {
    return { error: "Une leçon ne peut pas dépasser 10 questions." };
  }

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

export interface ImportResult {
  imported: number;
  errors: { index: number; message: string }[];
}

// Importe en masse les questions d'un fichier JSON ou CSV dans une leçon.
// Les lignes invalides sont ignorées individuellement (avec leur numero et
// la raison) plutot que de faire echouer tout le fichier -- et le plafond
// de 10 questions/leçon (voir createQuestion) s'applique aussi ici.
export async function importQuestions(
  leconId: string,
  filename: string,
  fileText: string,
): Promise<ImportResult> {
  await assertAdmin();

  const admin = createAdminClient();

  const { count: existingCount } = await admin
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("lecon_id", leconId);
  const { data: existingQuestions } = await admin
    .from("questions")
    .select("position")
    .eq("lecon_id", leconId)
    .order("position", { ascending: false })
    .limit(1);

  let nextPosition = (existingQuestions?.[0]?.position ?? 0) + 1;
  let remainingSlots = 10 - (existingCount ?? 0);

  const rows = parseQuestionsFile(filename, fileText);
  const errors: { index: number; message: string }[] = [];
  const toInsert: {
    lecon_id: string;
    type: string;
    position: number;
    prompt: string;
    explanation: string | null;
    image_url: string | null;
    data: QcmData | AssocierData | OrdonnerData;
  }[] = [];

  for (const row of rows) {
    if (row.error || !row.question) {
      errors.push({ index: row.index, message: row.error ?? "Ligne invalide." });
      continue;
    }
    if (remainingSlots <= 0) {
      errors.push({
        index: row.index,
        message: "Ignorée : la leçon a déjà atteint la limite de 10 questions.",
      });
      continue;
    }

    toInsert.push({
      lecon_id: leconId,
      type: row.question.type,
      position: nextPosition,
      prompt: row.question.prompt,
      explanation: row.question.explanation || null,
      image_url: row.question.image || null,
      data: toQuestionData(row.question) as QcmData | AssocierData | OrdonnerData,
    });
    nextPosition += 1;
    remainingSlots -= 1;
  }

  if (toInsert.length > 0) {
    const { error } = await admin.from("questions").insert(toInsert);
    if (error) {
      return { imported: 0, errors: [{ index: 0, message: `Échec de l'import : ${error.message}` }] };
    }
  }

  revalidatePath(`/admin/lecons/${leconId}`);
  return { imported: toInsert.length, errors };
}

// ---------- Import d'unite complete (titre + leçons + questions) ----------

export interface UniteImportPreview {
  error?: string;
  uniteTitle: string;
  existingUniteId: string | null;
  existingUniteLeconTitles: string[];
  lecons: {
    titre: string;
    validCount: number;
    errors: { index: number; message: string }[];
  }[];
  nameCollisions: string[];
}

export async function previewUniteImport(
  filiereId: string,
  niveauEtude: string | null,
  langueCode: string | null,
  parcoursNiveau: number,
  filename: string,
  uniteTitleOverride: string,
  fileText: string,
): Promise<UniteImportPreview> {
  await assertAdmin();

  const parsed = parseUniteImportFile(filename, uniteTitleOverride, fileText);
  if (parsed.error || !parsed.uniteTitle) {
    return {
      error: parsed.error ?? "Fichier invalide.",
      uniteTitle: "",
      existingUniteId: null,
      existingUniteLeconTitles: [],
      lecons: [],
      nameCollisions: [],
    };
  }

  const admin = createAdminClient();

  // .limit(1) plutot que .maybeSingle() : le nom d'une unite n'est pas
  // contraint unique en base (on autorise justement "creer separement" a la
  // resolution d'un conflit), donc plusieurs lignes peuvent partager le
  // meme titre -- .maybeSingle() erreurait silencieusement dans ce cas.
  let uniteQuery = admin
    .from("unites")
    .select("id")
    .eq("filiere_id", filiereId)
    .eq("parcours_niveau", parcoursNiveau)
    .eq("title", parsed.uniteTitle)
    .order("position")
    .limit(1);
  uniteQuery = niveauEtude ? uniteQuery.eq("niveau_etude", niveauEtude) : uniteQuery.is("niveau_etude", null);
  uniteQuery = langueCode ? uniteQuery.eq("langue_code", langueCode) : uniteQuery.is("langue_code", null);
  const { data: existingUnites } = await uniteQuery;
  const existingUnite = existingUnites?.[0] ?? null;

  let existingUniteLeconTitles: string[] = [];
  if (existingUnite) {
    const { data: existingLecons } = await admin
      .from("lecons")
      .select("title")
      .eq("unite_id", existingUnite.id)
      .order("position");
    existingUniteLeconTitles = (existingLecons ?? []).map((l) => l.title);
  }

  let leconsInScopeQuery = admin
    .from("lecons")
    .select("title")
    .eq("filiere_id", filiereId)
    .eq("parcours_niveau", parcoursNiveau);
  leconsInScopeQuery = niveauEtude
    ? leconsInScopeQuery.eq("niveau_etude", niveauEtude)
    : leconsInScopeQuery.is("niveau_etude", null);
  leconsInScopeQuery = langueCode
    ? leconsInScopeQuery.eq("langue_code", langueCode)
    : leconsInScopeQuery.is("langue_code", null);
  const { data: leconsInScope } = await leconsInScopeQuery;
  const existingTitles = new Set((leconsInScope ?? []).map((l) => l.title));
  const existingUniteLeconTitleSet = new Set(existingUniteLeconTitles);

  const nameCollisions = parsed.lecons
    .map((l) => l.titre)
    .filter((t) => existingTitles.has(t) && !existingUniteLeconTitleSet.has(t));

  const lecons = parsed.lecons.map((l) => ({
    titre: l.titre,
    validCount: l.rows.filter((r) => r.question).length,
    errors: l.rows.filter((r) => r.error).map((r) => ({ index: r.index, message: r.error! })),
  }));

  return {
    uniteTitle: parsed.uniteTitle,
    existingUniteId: existingUnite?.id ?? null,
    existingUniteLeconTitles,
    lecons,
    nameCollisions,
  };
}

export interface UniteImportResult {
  error?: string;
  uniteId: string;
  leconsCreated: number;
  questionsImported: number;
  questionErrors: { leconTitre: string; index: number; message: string }[];
}

export async function commitUniteImport(
  filiereId: string,
  niveauEtude: string | null,
  langueCode: string | null,
  parcoursNiveau: number,
  filename: string,
  uniteTitleOverride: string,
  fileText: string,
  mode: "replace" | "create-new",
): Promise<UniteImportResult> {
  await assertAdmin();

  const parsed = parseUniteImportFile(filename, uniteTitleOverride, fileText);
  if (parsed.error || !parsed.uniteTitle) {
    return {
      error: parsed.error ?? "Fichier invalide.",
      uniteId: "",
      leconsCreated: 0,
      questionsImported: 0,
      questionErrors: [],
    };
  }

  const admin = createAdminClient();
  let uniteId: string;

  if (mode === "replace") {
    // Meme raisonnement que dans previewUniteImport : plusieurs unites
    // peuvent partager un titre, on cible la premiere (meme ordre que
    // l'aperçu) plutot que de planter sur un resultat multiple.
    let uniteQuery = admin
      .from("unites")
      .select("id")
      .eq("filiere_id", filiereId)
      .eq("parcours_niveau", parcoursNiveau)
      .eq("title", parsed.uniteTitle)
      .order("position")
      .limit(1);
    uniteQuery = niveauEtude ? uniteQuery.eq("niveau_etude", niveauEtude) : uniteQuery.is("niveau_etude", null);
    uniteQuery = langueCode ? uniteQuery.eq("langue_code", langueCode) : uniteQuery.is("langue_code", null);
    const { data: existingUnites } = await uniteQuery;
    const existingUnite = existingUnites?.[0] ?? null;

    if (!existingUnite) {
      return {
        error: "Unité à remplacer introuvable (a-t-elle été supprimée entre-temps ?).",
        uniteId: "",
        leconsCreated: 0,
        questionsImported: 0,
        questionErrors: [],
      };
    }
    uniteId = existingUnite.id;
    // Supprimer les leçons supprime aussi leurs questions (contrainte on
    // delete cascade) : l'unité elle-même (et son titre/position) reste.
    await admin.from("lecons").delete().eq("unite_id", uniteId);
  } else {
    let maxUniteQuery = admin
      .from("unites")
      .select("position")
      .eq("filiere_id", filiereId)
      .eq("parcours_niveau", parcoursNiveau)
      .order("position", { ascending: false })
      .limit(1);
    maxUniteQuery = niveauEtude
      ? maxUniteQuery.eq("niveau_etude", niveauEtude)
      : maxUniteQuery.is("niveau_etude", null);
    maxUniteQuery = langueCode ? maxUniteQuery.eq("langue_code", langueCode) : maxUniteQuery.is("langue_code", null);
    const { data: maxUnite } = await maxUniteQuery;
    const nextUnitePosition = (maxUnite?.[0]?.position ?? 0) + 1;

    const { data: newUnite, error: uniteError } = await admin
      .from("unites")
      .insert({
        filiere_id: filiereId,
        title: parsed.uniteTitle,
        position: nextUnitePosition,
        niveau_etude: niveauEtude,
        langue_code: langueCode,
        parcours_niveau: parcoursNiveau,
      })
      .select()
      .single();
    if (uniteError || !newUnite) {
      return {
        error: uniteError?.message ?? "Échec de la création de l'unité.",
        uniteId: "",
        leconsCreated: 0,
        questionsImported: 0,
        questionErrors: [],
      };
    }
    uniteId = newUnite.id;
  }

  let maxLeconQuery = admin
    .from("lecons")
    .select("position")
    .eq("filiere_id", filiereId)
    .eq("parcours_niveau", parcoursNiveau)
    .order("position", { ascending: false })
    .limit(1);
  maxLeconQuery = niveauEtude ? maxLeconQuery.eq("niveau_etude", niveauEtude) : maxLeconQuery.is("niveau_etude", null);
  maxLeconQuery = langueCode ? maxLeconQuery.eq("langue_code", langueCode) : maxLeconQuery.is("langue_code", null);
  const { data: maxLecon } = await maxLeconQuery;
  let nextLeconPosition = (maxLecon?.[0]?.position ?? 0) + 1;

  let leconsCreated = 0;
  let questionsImported = 0;
  const questionErrors: { leconTitre: string; index: number; message: string }[] = [];

  for (const lecon of parsed.lecons) {
    const { data: newLecon, error: leconError } = await admin
      .from("lecons")
      .insert({
        filiere_id: filiereId,
        unite_id: uniteId,
        title: lecon.titre,
        position: nextLeconPosition,
        niveau_etude: niveauEtude,
        langue_code: langueCode,
        parcours_niveau: parcoursNiveau,
      })
      .select()
      .single();
    nextLeconPosition += 1;

    if (leconError || !newLecon) {
      questionErrors.push({
        leconTitre: lecon.titre,
        index: 0,
        message: leconError?.message ?? "Échec de la création de la leçon.",
      });
      continue;
    }
    leconsCreated += 1;

    const validRows = lecon.rows.filter((r) => r.question);
    const toInsert = validRows.slice(0, 10).map((r, i) => ({
      lecon_id: newLecon.id,
      type: r.question!.type,
      position: i + 1,
      prompt: r.question!.prompt,
      explanation: r.question!.explanation || null,
      image_url: r.question!.image || null,
      data: toQuestionData(r.question!) as QcmData | AssocierData | OrdonnerData,
    }));

    if (validRows.length > 10) {
      questionErrors.push({
        leconTitre: lecon.titre,
        index: 0,
        message: `${validRows.length - 10} question(s) ignorée(s) : limite de 10 questions par leçon.`,
      });
    }

    for (const row of lecon.rows) {
      if (row.error) {
        questionErrors.push({ leconTitre: lecon.titre, index: row.index, message: row.error });
      }
    }

    if (toInsert.length > 0) {
      const { error: qError } = await admin.from("questions").insert(toInsert);
      if (qError) {
        questionErrors.push({
          leconTitre: lecon.titre,
          index: 0,
          message: `Échec de l'import des questions : ${qError.message}`,
        });
      } else {
        questionsImported += toInsert.length;
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/unites/${uniteId}`);
  return { uniteId, leconsCreated, questionsImported, questionErrors };
}
