import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-next-path";

// Point d'arrivee apres la connexion Google/Apple : Supabase renvoie ici
// avec un "code" a echanger contre une session (ou un "error" si
// l'utilisateur a annule ou si le fournisseur n'est pas encore configure).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");
  const next = safeNextPath(searchParams.get("next")) ?? "/accueil";

  if (code && !oauthError) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/connexion?error=${encodeURIComponent(oauthError ?? "oauth")}`,
  );
}
