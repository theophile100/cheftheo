import { redirect } from "next/navigation";

// L'app s'ouvre directement sur l'accueil, navigable sans compte — on ne
// demande plus l'inscription/connexion des l'ouverture (voir accueil et
// filiere, accessibles aux invites ; le compte n'est requis qu'au moment
// de vraiment commencer une lecon).
export default function Home() {
  redirect("/accueil");
}
