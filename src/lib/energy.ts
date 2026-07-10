export const ENERGY_MAX = 25;
export const ENERGY_PER_LESSON = 5;
export const ENERGY_RECHARGE_SECONDS = 5 * 60;

function toDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

// Purely computes the displayed value from the last saved snapshot — never
// writes anything. Actual recharge/spend is only ever persisted server-side
// (see start_lecon, claim_free_produit) so the source of truth stays correct
// even if this runs on a stale or manipulated client clock.
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

export function formatEta(seconds: number): string {
  if (seconds <= 0) return "maintenant";
  const totalMinutes = Math.ceil(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours} h ${minutes.toString().padStart(2, "0")}`;
  return `${minutes} min`;
}
