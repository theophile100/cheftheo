export const ENERGY_MAX = 25;
export const ENERGY_RECHARGE_SECONDS = 5 * 60;

// Doit rester identique a public.energy_rules() (Supabase) : le serveur
// fait foi pour tout debit/gain reel, ces constantes ne servent qu'a
// l'affichage/aux messages cote client.
export const ENERGY_COST_PER_ANSWER = 0.5;
export const ENERGY_COST_INCORRECT_EXTRA = 1;
export const ENERGY_STREAK_BONUS_EVERY = 4;
export const ENERGY_STREAK_BONUS_AMOUNT = 2;
export const ENERGY_REVIEW_COMPLETION_BONUS = 3;

function toDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

// Purely computes the displayed value from the last saved snapshot — never
// writes anything. Actual recharge/spend is only ever persisted server-side
// (see start_lecon, record_answer, complete_lecon) so the source of truth
// stays correct even if this runs on a stale or manipulated client clock.
export function computeCurrentEnergy(
  storedEnergy: number,
  updatedAt: string | Date,
  now: Date = new Date(),
): number {
  const elapsedSeconds = (now.getTime() - toDate(updatedAt).getTime()) / 1000;
  const gained = Math.floor(elapsedSeconds / ENERGY_RECHARGE_SECONDS);
  return Math.min(ENERGY_MAX, storedEnergy + gained);
}

export function secondsUntilNextPoint(
  storedEnergy: number,
  updatedAt: string | Date,
  now: Date = new Date(),
): number {
  if (storedEnergy >= ENERGY_MAX) return 0;
  const updated = toDate(updatedAt);
  const elapsedSeconds = (now.getTime() - updated.getTime()) / 1000;
  const currentGained = Math.floor(elapsedSeconds / ENERGY_RECHARGE_SECONDS);
  const nextPointAt =
    updated.getTime() + (currentGained + 1) * ENERGY_RECHARGE_SECONDS * 1000;
  return Math.max(0, Math.round((nextPointAt - now.getTime()) / 1000));
}

// True while a purchased energy bonus (30 days, granted/extended on paid
// produit purchase — see record_produit_purchase) is still running.
export function isUnlimitedEnergyActive(
  until: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!until) return false;
  return toDate(until).getTime() > now.getTime();
}

export function formatEta(seconds: number): string {
  if (seconds <= 0) return "maintenant";
  const totalMinutes = Math.ceil(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours} h ${minutes.toString().padStart(2, "0")}`;
  return `${minutes} min`;
}

// L'énergie peut désormais valoir des demi-points (24.5) : entier tel quel,
// une décimale sinon — jamais "24.500000000001" lié aux flottants JS.
export function formatEnergy(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
