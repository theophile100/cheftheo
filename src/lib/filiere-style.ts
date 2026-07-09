const PALETTE = [
  "bg-orange-500",
  "bg-amber-500",
  "bg-rose-400",
  "bg-orange-600",
  "bg-yellow-500",
];

export function filiereColor(position: number) {
  return PALETTE[(position - 1) % PALETTE.length];
}
