import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";

// Pas de redirection ici : un visiteur non connecté peut parcourir les
// filières et les leçons librement (profil "invité" neutre, rien de
// personnalisé à charger). Le compte n'est demandé qu'au moment de
// réellement commencer une leçon (voir lecon/[id]/page.tsx) ou d'accéder
// au profil, pages qui font leur propre vérification.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppLoadingScreen />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
