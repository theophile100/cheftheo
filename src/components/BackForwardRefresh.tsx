"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Next.js reutilise le contenu deja visite lors d'une navigation
// retour/avant (bouton du navigateur, geste "swipe back" mobile), meme
// apres un router.refresh() declenche ailleurs dans l'app -- ce qui peut
// afficher une page perimee (dans les cas les plus genants, avec le
// mauvais contenu affiche sous la bonne URL) apres un changement de
// donnees comme le niveau d'utilisateur ou le niveau d'etudes. "popstate"
// se declenche de facon fiable pour toute navigation historique (y
// compris interne au routeur App Router) : on force un vrai refresh a ce
// moment-la plutot que de laisser le cache perime s'afficher.
export function BackForwardRefresh() {
  const router = useRouter();

  useEffect(() => {
    function handlePopState() {
      // router.refresh() seul ne fait que rafraichir les donnees de l'arbre
      // de routes actuellement monte -- insuffisant quand c'est l'arbre
      // lui-meme (la mauvaise page) qui est reste monte apres un retour.
      // replace() force Next.js a resoudre et monter le bon arbre pour
      // l'URL courante, sans ajouter d'entree d'historique.
      router.replace(window.location.pathname + window.location.search);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  return null;
}
