// Retour haptique centralise (API Vibration du navigateur). A savoir :
// contrairement au Taptic Engine natif d'iOS, Safari (y compris en PWA)
// n'implemente pas du tout cette API -- ces vibrations ne se font sentir
// que sur Android/Chrome. Sur iOS et desktop, triggerHaptic() ne fait
// simplement rien (aucune erreur, aucun impact perf).
//
// Motifs volontairement courts (aucun ne depasse ~160ms au total) pour
// rester discret et jamais agressif :
//   - tap      : clic/navigation general (deja utilise par TapFeedback)
//   - correct  : bonne reponse a une question
//   - incorrect: mauvaise reponse (plus marque que "correct", mais bref)
//   - unlock   : leçon terminee / niveau debloque -- double pulsation
//                courte, la seule pensee comme un vrai "temps fort"
export type HapticPattern = "tap" | "correct" | "incorrect" | "unlock";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 8,
  correct: 15,
  incorrect: 40,
  unlock: [15, 40, 20, 60, 25],
};

export function isHapticsSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function triggerHaptic(pattern: HapticPattern): void {
  if (!isHapticsSupported()) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // Certains navigateurs exposent l'API sans la supporter reellement --
    // on ignore silencieusement plutot que de casser l'interaction.
  }
}
