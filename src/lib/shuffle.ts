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

// True random shuffle. Only safe to use where the result never needs to
// match between a server render and a client hydration of the same
// component (e.g. server-only, baked into props before they reach the
// client) — otherwise use seededShuffle.
export function randomShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// A fresh random string, for seeding seededShuffle() with a value that
// varies between requests.
export function randomSeed(): string {
  return Math.random().toString(36).slice(2);
}
