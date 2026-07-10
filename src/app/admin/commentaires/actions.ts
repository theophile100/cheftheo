"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function approveComment(id: string) {
  await assertAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("produit_commentaires")
    .update({ status: "approuve" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/commentaires");
  revalidatePath("/decouvrir");
}

export async function rejectComment(id: string) {
  await assertAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("produit_commentaires")
    .update({ status: "refuse" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/commentaires");
  revalidatePath("/decouvrir");
}
