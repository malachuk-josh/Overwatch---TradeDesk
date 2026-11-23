// Two soft notes that say the microphone just turned on (rising) or off (falling). Synthesized with
// Web Audio, so there are no sound files to load. Ported from Barnabas.

let ctx = null;

function context() {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx || ctx.state === "closed") ctx = new Ctor();
  return ctx;
}

/** Call from a tap, before anything async, so phones allow the chimes. */
export function unlockEarcons() {
  const c = context();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

function note(c, freq, start, length, peak) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + length + 0.02);
}

export function playEarcon(kind) {
  const c = context();
  if (!c) return;
  const play = () => {
    const t = c.currentTime + 0.01;
    const [first, second] = kind === "on" ? [659.25, 987.77] : [987.77, 659.25];
    note(c, first, t, 0.16, 0.16);
    note(c, second, t + 0.09, 0.22, 0.16);
  };
  if (c.state === "suspended") c.resume().then(play, () => {});
  else play();
}
