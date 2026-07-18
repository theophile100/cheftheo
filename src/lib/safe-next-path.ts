// N'accepte qu'un chemin interne relatif ("/lecon/xxx"), jamais une URL
// absolue ni un "//host" — sinon un lien de connexion pourrait rediriger
// vers un site externe (open redirect).
export function safeNextPath(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
