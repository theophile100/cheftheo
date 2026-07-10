import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Receives Chariow's payment-confirmed notification and recharges the
// buyer's energy to the max. Fails closed: without CHARIOW_WEBHOOK_SECRET
// set, or without a matching secret on the request, nothing happens.
//
// NOTE: the exact header/param Chariow signs its webhook with, and the exact
// shape of its payload, aren't known yet — see the explanation given to the
// user for what to fetch from the Chariow dashboard. Until then this route
// is safe (it rejects everything) but not yet wired to Chariow's real format.
export async function POST(request: NextRequest) {
  const secret = process.env.CHARIOW_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 });
  }

  const providedSecret =
    request.headers.get("x-chariow-secret") ?? request.nextUrl.searchParams.get("secret");

  if (providedSecret !== secret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const metadata = (payload.metadata ?? {}) as Record<string, unknown>;
  const rawReference =
    (payload.client_reference_id as string | undefined) ??
    (metadata.client_reference_id as string | undefined) ??
    null;

  let userId: string | null = null;
  let produitId: string | null = null;
  if (rawReference?.includes("::")) {
    [userId, produitId] = rawReference.split("::");
  } else if (rawReference) {
    userId = rawReference;
  }

  const buyerEmail =
    (payload.email as string | undefined) ??
    ((payload.customer as Record<string, unknown> | undefined)?.email as string | undefined) ??
    null;

  const admin = createAdminClient();

  let profileId: string | null = null;

  if (userId) {
    const { data } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (data) profileId = data.id;
  }

  if (!profileId && buyerEmail) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("email", buyerEmail)
      .maybeSingle();
    if (data) profileId = data.id;
  }

  if (!profileId) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  await admin.from("profiles").update({ energy: 25 }).eq("id", profileId);

  await admin.from("achats").insert({
    user_id: profileId,
    produit_id: produitId,
    chariow_reference: (payload.id as string | undefined) ?? (payload.reference as string | undefined) ?? null,
    buyer_email: buyerEmail,
    amount: (payload.amount as number | undefined) ?? null,
    raw_payload: payload,
  });

  return NextResponse.json({ ok: true });
}
