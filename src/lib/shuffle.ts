// Deterministic shuffle seeded by a string. Used for exercises where the
// display order must be randomized but identical between server render and
// client hydration (Math.random() would produce a mismatch there).
export function seededShuffle<T>(array: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }

  function next() {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  }

  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
