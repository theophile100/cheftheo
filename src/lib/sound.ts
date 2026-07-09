let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioContext = new Ctor();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

interface ToneOptions {
  type?: OscillatorType;
  peakGain?: number;
  attack?: number;
  filterFrequency?: number;
  endFrequency?: number;
}

// A short, rounded tone: soft attack, exponential decay (no clicks or hard
// edges), and an optional lowpass filter to take the edge off the harmonics
// for a warmer, more "muffled" character. `endFrequency` lets the pitch
// glide down over the note for a softer, more percussive feel.
function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  {
    type = "sine",
    peakGain = 0.1,
    attack = 0.015,
    filterFrequency,
    endFrequency,
  }: ToneOptions = {},
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(
      endFrequency,
      startTime + duration,
    );
  }

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  let node: AudioNode = oscillator;
  if (filterFrequency) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = filterFrequency;
    filter.Q.value = 0.6;
    node.connect(filter);
    node = filter;
  }
  node.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.03);
}

export function playCorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const shared = { filterFrequency: 3200, attack: 0.015, peakGain: 0.09 };
  playTone(ctx, 523.25, now, 0.13, shared);
  playTone(ctx, 659.25, now + 0.09, 0.16, shared);
}

export function playIncorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 220, now, 0.2, {
    type: "sine",
    peakGain: 0.07,
    attack: 0.02,
    filterFrequency: 500,
    endFrequency: 150,
  });
}

export function playTapSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 720, now, 0.05, {
    peakGain: 0.045,
    attack: 0.008,
    filterFrequency: 2600,
  });
}

export function playCompleteSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const shared = { filterFrequency: 3200, attack: 0.015, peakGain: 0.09 };
  playTone(ctx, 523.25, now, 0.14, shared);
  playTone(ctx, 659.25, now + 0.11, 0.14, shared);
  playTone(ctx, 784.0, now + 0.22, 0.16, shared);
  playTone(ctx, 1046.5, now + 0.34, 0.4, { ...shared, peakGain: 0.08 });
}
